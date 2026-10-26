// Trang bị: 9 ô, phẩm màu, nguyên tố, thưởng bộ, cộng hưởng nguyên tố và ghép nâng bậc.
// Xem docs/04-equipment/trang-bi.md. Số liệu là điểm xuất phát, chờ mô phỏng cân bằng.

import { elementRelation, type Element } from "../battle/elements";
import type { Profession } from "../battle/rules";
import type { FighterConfig } from "../battle/state";

export const GEAR_SLOTS = [
  "vuKhi",
  "dinhMao",
  "yPhuc",
  "hoThu",
  "baoNgoa",
  "gioiChi",
  "hangLien",
  "hoPhu",
  "ngocBoi",
] as const;
export type GearSlot = (typeof GEAR_SLOTS)[number];

export type GearStat = "atk" | "maxHp" | "def";

/** Chỉ số chính của mỗi ô: mỗi chỉ số có đúng 3 ô. */
export const SLOT_STAT: Readonly<Record<GearSlot, GearStat>> = {
  vuKhi: "atk",
  dinhMao: "maxHp",
  yPhuc: "def",
  hoThu: "atk",
  baoNgoa: "def",
  gioiChi: "atk",
  hangLien: "maxHp",
  hoPhu: "def",
  ngocBoi: "maxHp",
};

/**
 * Chỉ số gốc của một món phẩm Trắng, theo chỉ số chính. Điểm xuất phát: 3 món Trắng bình thường cộng
 * khoảng 16% ATK, 18% máu và 60% DEF gốc của Tướng sĩ; 3 món Cam cùng nguyên tố gấp 4.5 lần.
 */
export const STAT_BASE: Readonly<Record<GearStat, number>> = {
  atk: 3,
  maxHp: 30,
  def: 2,
};

export const TIERS = [1, 2, 3, 4, 5] as const;
export type Tier = (typeof TIERS)[number];
export const MAX_TIER: Tier = 5;

export interface TierInfo {
  readonly color: string;
  readonly name: string;
  readonly multiplier: number;
}

export const TIER_INFO: Readonly<Record<Tier, TierInfo>> = {
  1: { color: "trang", name: "Phàm phẩm", multiplier: 1 },
  2: { color: "luc", name: "Lương phẩm", multiplier: 1.3 },
  3: { color: "lam", name: "Tinh phẩm", multiplier: 1.7 },
  4: { color: "tim", name: "Bảo phẩm", multiplier: 2.2 },
  5: { color: "cam", name: "Thần phẩm", multiplier: 3 },
};

/** Hệ số chỉ số theo quan hệ nguyên tố trang bị → nhân vật, xem docs/01-gameplay/nguyen-to.md mục 3. */
export function gearElementMultiplier(gear: Element, wearer: Element): number {
  if (gear === wearer) return 1.5;
  switch (elementRelation(gear, wearer)) {
    case "generate":
      return 1.25;
    case "counter":
      return 0.75;
    default:
      return 1;
  }
}

export interface GearItem {
  readonly id: string;
  readonly slot: GearSlot;
  readonly element: Element;
  readonly tier: Tier;
  /** Bộ trang bị (id trong GEAR_SETS). */
  readonly set: string;
  /** Chỉ vũ khí: nghề dùng được. */
  readonly profession?: Profession;
}

/** Chỉ số chính một món cộng cho người mặc, đã làm tròn. */
export function itemStat(item: GearItem, wearer: Element): number {
  const stat = SLOT_STAT[item.slot];
  return Math.round(STAT_BASE[stat] * TIER_INFO[item.tier].multiplier * gearElementMultiplier(item.element, wearer));
}

export type StatBonus = Partial<Record<GearStat, number>>;

export interface SetBonus {
  /** Tỉ lệ cộng thêm, ví dụ 0.05 là +5%. */
  readonly six: StatBonus;
  /** Cộng thêm vào mốc 6 món. */
  readonly nine: StatBonus;
}

export const SET_THRESHOLDS = [6, 9] as const;

export interface GearSetDef extends SetBonus {
  readonly id: string;
  readonly name: string;
}

/** Bộ trang bị khởi đầu. Điểm xuất phát; hiệu ứng bộ hiện chỉ cộng chỉ số. */
export const GEAR_SETS: readonly GearSetDef[] = [
  { id: "coLau", name: "Cờ Lau", six: { atk: 0.04, maxHp: 0.03 }, nine: { atk: 0.04, maxHp: 0.03 } },
  { id: "hoaLu", name: "Hoa Lư", six: { def: 0.12, maxHp: 0.04 }, nine: { def: 0.12, maxHp: 0.04 } },
  { id: "dongCo", name: "Đồng Cổ", six: { atk: 0.07 }, nine: { atk: 0.07 } },
];

/** Cộng hưởng nguyên tố theo tính cách từng hệ. Điểm xuất phát. */
export const ELEMENT_RESONANCE: Readonly<Record<Element, SetBonus>> = {
  kim: { six: { atk: 0.05 }, nine: { atk: 0.05 } },
  moc: { six: { maxHp: 0.06 }, nine: { maxHp: 0.06 } },
  thuy: { six: { maxHp: 0.03, def: 0.05 }, nine: { maxHp: 0.03, def: 0.05 } },
  hoa: { six: { atk: 0.06 }, nine: { atk: 0.06 } },
  tho: { six: { def: 0.1 }, nine: { def: 0.1 } },
  loi: { six: { atk: 0.03, maxHp: 0.03 }, nine: { atk: 0.03, maxHp: 0.03 } },
  phong: { six: { atk: 0.03, def: 0.05 }, nine: { atk: 0.03, def: 0.05 } },
};

export function getGearSet(id: string): GearSetDef | undefined {
  return GEAR_SETS.find((s) => s.id === id);
}

export type NonWeaponSlot = Exclude<GearSlot, "vuKhi">;

/**
 * Đồ đang mặc của một nhân vật. Vũ khí giữ riêng cho từng nghề: nhân vật chính đổi nghề thì vũ khí
 * của nghề đó tự mặc vào; nghề chưa có vũ khí thì ô vũ khí để trống.
 */
export interface Loadout {
  readonly weapons: Partial<Record<Profession, GearItem>>;
  readonly slots: Partial<Record<NonWeaponSlot, GearItem>>;
}

export const EMPTY_LOADOUT: Loadout = { weapons: {}, slots: {} };

export type GearError = "notWeapon" | "wrongProfession" | "weaponNeedsProfession";

/**
 * Mặc món vào ô của nó (thay món cũ nếu có). Vũ khí vào ô của nghề ghi trên vũ khí. Nhân vật kèm có nghề
 * cố định thì truyền `profession` để chặn vũ khí nghề khác.
 */
export function equip(
  loadout: Loadout,
  item: GearItem,
  profession?: Profession,
): { ok: true; loadout: Loadout } | { ok: false; error: GearError } {
  if (item.slot === "vuKhi") {
    if (!item.profession) return { ok: false, error: "weaponNeedsProfession" };
    if (profession && item.profession !== profession) return { ok: false, error: "wrongProfession" };
    return { ok: true, loadout: { ...loadout, weapons: { ...loadout.weapons, [item.profession]: item } } };
  }
  if (item.profession) return { ok: false, error: "notWeapon" };
  return { ok: true, loadout: { ...loadout, slots: { ...loadout.slots, [item.slot]: item } } };
}

/** Bỏ các món có id trong danh sách khỏi mọi ô, kể cả vũ khí của nghề khác. */
export function unequip(loadout: Loadout, ids: readonly string[]): Loadout {
  const keep = <K extends string>(rec: Partial<Record<K, GearItem>>): Partial<Record<K, GearItem>> => {
    const out: Partial<Record<K, GearItem>> = {};
    for (const [k, v] of Object.entries(rec) as [K, GearItem | undefined][]) {
      if (v && !ids.includes(v.id)) out[k] = v;
    }
    return out;
  };
  return { weapons: keep(loadout.weapons), slots: keep(loadout.slots) };
}

/** Các món đang có hiệu lực với nghề hiện tại: tối đa 9 món. */
export function equippedItems(loadout: Loadout, profession: Profession): GearItem[] {
  const out: GearItem[] = [];
  const weapon = loadout.weapons[profession];
  if (weapon) out.push(weapon);
  for (const slot of GEAR_SLOTS) {
    if (slot === "vuKhi") continue;
    const item = loadout.slots[slot];
    if (item) out.push(item);
  }
  return out;
}

export interface ActiveBonus {
  readonly kind: "set" | "resonance";
  /** Id bộ, hoặc nguyên tố khi là cộng hưởng. */
  readonly id: string;
  /** Mốc đạt được: 6 hoặc 9. */
  readonly level: 6 | 9;
  readonly bonus: StatBonus;
}

function thresholdBonuses(kind: ActiveBonus["kind"], id: string, count: number, def: SetBonus): ActiveBonus[] {
  const out: ActiveBonus[] = [];
  if (count >= 6) out.push({ kind, id, level: 6, bonus: def.six });
  if (count >= 9) out.push({ kind, id, level: 9, bonus: def.nine });
  return out;
}

/** Thưởng bộ và cộng hưởng nguyên tố đang đạt mốc. Mốc 9 cộng thêm vào mốc 6. */
export function activeBonuses(items: readonly GearItem[]): ActiveBonus[] {
  const bySet = new Map<string, number>();
  const byElement = new Map<Element, number>();
  for (const it of items) {
    bySet.set(it.set, (bySet.get(it.set) ?? 0) + 1);
    byElement.set(it.element, (byElement.get(it.element) ?? 0) + 1);
  }
  const out: ActiveBonus[] = [];
  for (const [id, count] of bySet) {
    const set = getGearSet(id);
    if (set) out.push(...thresholdBonuses("set", id, count, set));
  }
  for (const [element, count] of byElement) {
    out.push(...thresholdBonuses("resonance", element, count, ELEMENT_RESONANCE[element]));
  }
  return out;
}

export interface GearStats {
  /** Cộng phẳng từ chỉ số chính của các món. */
  readonly flat: Readonly<Record<GearStat, number>>;
  /** Tổng tỉ lệ từ thưởng bộ và cộng hưởng. */
  readonly percent: Readonly<Record<GearStat, number>>;
  readonly bonuses: readonly ActiveBonus[];
}

/** Chỉ số trang bị cho người mặc, tính theo nguyên tố và nghề hiện tại. */
export function gearStats(loadout: Loadout, element: Element, profession: Profession): GearStats {
  const items = equippedItems(loadout, profession);
  const flat: Record<GearStat, number> = { atk: 0, maxHp: 0, def: 0 };
  for (const it of items) flat[SLOT_STAT[it.slot]] += itemStat(it, element);
  const bonuses = activeBonuses(items);
  const percent: Record<GearStat, number> = { atk: 0, maxHp: 0, def: 0 };
  for (const b of bonuses) {
    for (const [stat, v] of Object.entries(b.bonus) as [GearStat, number][]) percent[stat] += v;
  }
  return { flat, percent, bonuses };
}

/**
 * Cấu hình vào trận sau khi mặc đồ: (gốc + cộng phẳng) × (1 + tỉ lệ), làm tròn. Gọi lại sau khi nhân
 * vật chính đổi nguyên tố hoặc nghề để tính lại hệ số.
 */
export function withGear(config: FighterConfig, loadout: Loadout): FighterConfig {
  const g = gearStats(loadout, config.element, config.profession);
  const total = (stat: GearStat) => Math.round((config[stat] + g.flat[stat]) * (1 + g.percent[stat]));
  return { ...config, maxHp: total("maxHp"), atk: total("atk"), def: total("def") };
}

export type MergeError = "needThree" | "duplicate" | "maxTier" | "tierMismatch" | "elementMismatch" | "slotMismatch" | "professionMismatch";

/**
 * Ghép 3 món cùng bậc, cùng nguyên tố, cùng ô (vũ khí cùng nghề) thành 1 món bậc kế tiếp. Luôn thành
 * công khi hợp lệ. Món mới giữ ô, nguyên tố, nghề, và lấy bộ của món chính (`items[main]`). Id do server
 * cấp. Món đang mặc được dùng làm nguyên liệu: gọi `unequip` để làm trống ô.
 */
export function mergeItems(
  items: readonly GearItem[],
  main: number,
  newId: string,
): { ok: true; item: GearItem } | { ok: false; error: MergeError } {
  const base = items[main];
  if (items.length !== 3 || !base) return { ok: false, error: "needThree" };
  if (new Set(items.map((i) => i.id)).size !== 3) return { ok: false, error: "duplicate" };
  for (const it of items) {
    if (it.tier !== base.tier) return { ok: false, error: "tierMismatch" };
    if (it.element !== base.element) return { ok: false, error: "elementMismatch" };
    if (it.slot !== base.slot) return { ok: false, error: "slotMismatch" };
    if (it.profession !== base.profession) return { ok: false, error: "professionMismatch" };
  }
  if (base.tier >= MAX_TIER) return { ok: false, error: "maxTier" };
  return { ok: true, item: { ...base, id: newId, tier: (base.tier + 1) as Tier } };
}

/**
 * Bộ đồ mẫu đủ 9 món cùng bậc và nguyên tố, dùng cho mô phỏng và /demo. `set` null thì xoay vòng 3 bộ
 * để không bộ nào đạt mốc 6 món (chỉ còn cộng hưởng nguyên tố).
 */
export function presetLoadout(element: Element, profession: Profession, tier: Tier, set: string | null): Loadout {
  let loadout = EMPTY_LOADOUT;
  GEAR_SLOTS.forEach((slot, i) => {
    const item: GearItem = {
      id: `${slot}-${element}-${tier}`,
      slot,
      element,
      tier,
      set: set ?? GEAR_SETS[i % GEAR_SETS.length]!.id,
      ...(slot === "vuKhi" ? { profession } : {}),
    };
    const r = equip(loadout, item);
    if (r.ok) loadout = r.loadout;
  });
  return loadout;
}
