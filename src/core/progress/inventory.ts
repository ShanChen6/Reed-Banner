// Túi đồ và 9 ô trang bị trong hồ sơ: mặc, tháo, ghép, bán, mua ở cửa hàng, nhận đồ rơi sau trận.
// Hồ sơ chỉ lưu id món trong mỗi ô; món nằm trong túi đồ. Xem docs/04-equipment/trang-bi.md.

import {
  ELEMENTS,
  PROFESSIONS,
  normalizeProfession,
  type Element,
  type Profession,
} from "../battle";
import {
  EMPTY_LOADOUT,
  equip,
  GEAR_SLOTS,
  getGearSet,
  mergeCost,
  mergeItems,
  TIERS,
  unequip,
  type GearError,
  type GearItem,
  type GearSlot,
  type Loadout,
  type MergeError,
  type NonWeaponSlot,
  type Tier,
} from "../gear";
import { companionById } from "../roster";
import type { Profile } from "./profile";

/** Ô trang bị lưu theo id món. Vũ khí giữ riêng cho từng nghề như `Loadout`. */
export interface SavedLoadout {
  readonly weapons: Partial<Record<Profession, string>>;
  readonly slots: Partial<Record<NonWeaponSlot, string>>;
}

export const EMPTY_SAVED_LOADOUT: SavedLoadout = { weapons: {}, slots: {} };

/** Số món tối đa trong túi đồ (cả món đang mặc). Đầy thì món rơi được bán ngay. */
export const BAG_LIMIT = 200;
/** Vàng nhận khi bán một món, theo phẩm. Điểm xuất phát. */
export const SELL_GOLD: Readonly<Record<Tier, number>> = {
  1: 5,
  2: 15,
  3: 50,
  4: 150,
  5: 500,
};
/**
 * Cửa hàng trang bị: chọn ô, nguyên tố, bộ (và nghề nếu là vũ khí), mua phẩm Lục hoặc Lam. Giá cao: một món
 * Lam bằng khoảng 17 trận thắng nhưng thay cho 9 món Trắng cùng ô và cùng hệ. Điểm xuất phát.
 */
export const SHOP_GEAR_PRICE: Readonly<Partial<Record<Tier, number>>> = {
  2: 400,
  3: 1200,
};

export type InventoryError =
  | GearError
  | MergeError
  | "invalidItem"
  | "notOwned"
  | "notEnoughGold"
  | "bagFull";
export type InventoryResult =
  | { readonly ok: true; readonly profile: Profile }
  | { readonly ok: false; readonly error: InventoryError };

const isCharacter = (profile: Profile, id: string) =>
  id === "dinhBoLinh" ||
  (Object.hasOwn(profile.companions, id) && !!companionById(id));

/** Đồ đang mặc của một nhân vật, dựng từ túi đồ; id không còn trong túi bị bỏ qua. */
export function loadoutOf(profile: Profile, character: string): Loadout {
  const saved = profile.loadouts[character];
  if (!saved) return EMPTY_LOADOUT;
  const byId = new Map(profile.bag.map((it) => [it.id, it]));
  let loadout = EMPTY_LOADOUT;
  for (const id of [
    ...Object.values(saved.weapons),
    ...Object.values(saved.slots),
  ]) {
    const item = id === undefined ? undefined : byId.get(id);
    const r = item && equip(loadout, item);
    if (r && r.ok) loadout = r.loadout;
  }
  return loadout;
}

/** Ai đang mặc món này (id nhân vật), hoặc null. */
export function wearerOf(profile: Profile, itemId: string): string | null {
  for (const [character, saved] of Object.entries(profile.loadouts)) {
    if (
      [...Object.values(saved.weapons), ...Object.values(saved.slots)].includes(
        itemId,
      )
    )
      return character;
  }
  return null;
}

function toSaved(loadout: Loadout): SavedLoadout {
  const ids = <K extends string>(rec: Partial<Record<K, GearItem>>) =>
    Object.fromEntries(
      Object.entries(rec).flatMap(([k, v]) =>
        v ? [[k, (v as GearItem).id]] : [],
      ),
    ) as Partial<Record<K, string>>;
  return { weapons: ids(loadout.weapons), slots: ids(loadout.slots) };
}

/** Bỏ các món khỏi mọi ô của mọi nhân vật. */
function stripEverywhere(profile: Profile, ids: readonly string[]): Profile {
  const loadouts = Object.fromEntries(
    Object.entries(profile.loadouts).map(([c, saved]) => {
      const keep = <K extends string>(rec: Partial<Record<K, string>>) =>
        Object.fromEntries(
          Object.entries(rec).filter(([, v]) => !ids.includes(v as string)),
        ) as Partial<Record<K, string>>;
      return [c, { weapons: keep(saved.weapons), slots: keep(saved.slots) }];
    }),
  );
  return { ...profile, loadouts };
}

function removeItems(profile: Profile, ids: readonly string[]): Profile {
  const stripped = stripEverywhere(profile, ids);
  return {
    ...stripped,
    bag: stripped.bag.filter((it) => !ids.includes(it.id)),
  };
}

/** Thêm món vào túi với id mới của hồ sơ (`g1`, `g2`, …). */
export function addItem(
  profile: Profile,
  item: Omit<GearItem, "id">,
): { profile: Profile; item: GearItem } | null {
  if (profile.bag.length >= BAG_LIMIT) return null;
  const withId: GearItem = { ...item, id: `g${profile.nextItemId}` };
  return {
    profile: {
      ...profile,
      bag: [...profile.bag, withId],
      nextItemId: profile.nextItemId + 1,
    },
    item: withId,
  };
}

/** Nhận món rơi sau trận: vào túi, hoặc bán ngay khi túi đầy. */
export function receiveDrop(
  profile: Profile,
  drop: GearItem,
): { profile: Profile; item: GearItem | null; soldFor: number } {
  const added = addItem(profile, {
    slot: drop.slot,
    element: drop.element,
    tier: drop.tier,
    set: drop.set,
    ...(drop.profession ? { profession: drop.profession } : {}),
  });
  if (added) return { ...added, soldFor: 0 };
  return {
    profile: { ...profile, gold: profile.gold + SELL_GOLD[drop.tier] },
    item: null,
    soldFor: SELL_GOLD[drop.tier],
  };
}

/** Mặc món trong túi cho nhân vật; món đang ở người khác được tháo ra trước. */
export function equipItem(
  profile: Profile,
  character: string,
  itemId: string,
): InventoryResult {
  if (!isCharacter(profile, character)) return { ok: false, error: "notOwned" };
  const item = profile.bag.find((it) => it.id === itemId);
  if (!item) return { ok: false, error: "invalidItem" };
  const profession =
    character === "dinhBoLinh"
      ? undefined
      : companionById(character)!.profession;
  const stripped = stripEverywhere(profile, [itemId]);
  const r = equip(loadoutOf(stripped, character), item, profession);
  if (!r.ok) return r;
  return {
    ok: true,
    profile: {
      ...stripped,
      loadouts: { ...stripped.loadouts, [character]: toSaved(r.loadout) },
    },
  };
}

export function unequipItem(
  profile: Profile,
  character: string,
  itemId: string,
): InventoryResult {
  if (!isCharacter(profile, character)) return { ok: false, error: "notOwned" };
  const next = toSaved(unequip(loadoutOf(profile, character), [itemId]));
  return {
    ok: true,
    profile: {
      ...profile,
      loadouts: { ...profile.loadouts, [character]: next },
    },
  };
}

/** Ghép 3 món trong túi thành 1 món bậc kế tiếp, trả phí vàng. Món nguyên liệu đang mặc bị tháo ra. */
export function mergeGear(
  profile: Profile,
  ids: readonly string[],
  main: number,
): InventoryResult {
  const items = ids.map((id) => profile.bag.find((it) => it.id === id));
  if (items.some((it) => !it)) return { ok: false, error: "invalidItem" };
  const r = mergeItems(items as GearItem[], main, `g${profile.nextItemId}`);
  if (!r.ok) return r;
  const cost = mergeCost(items[0]!.tier);
  if (profile.gold < cost) return { ok: false, error: "notEnoughGold" };
  const rest = removeItems(profile, ids);
  return {
    ok: true,
    profile: {
      ...rest,
      gold: rest.gold - cost,
      bag: [...rest.bag, r.item],
      nextItemId: rest.nextItemId + 1,
    },
  };
}

export function sellItem(profile: Profile, itemId: string): InventoryResult {
  const item = profile.bag.find((it) => it.id === itemId);
  if (!item) return { ok: false, error: "invalidItem" };
  const rest = removeItems(profile, [itemId]);
  return {
    ok: true,
    profile: { ...rest, gold: rest.gold + SELL_GOLD[item.tier] },
  };
}

export interface GearOrder {
  readonly slot: GearSlot;
  readonly element: Element;
  readonly set: string;
  readonly tier: Tier;
  /** Bắt buộc với vũ khí, không có ở ô khác. */
  readonly profession?: Profession;
}

/** Mua món theo yêu cầu ở cửa hàng trang bị. */
export function buyGear(profile: Profile, order: GearOrder): InventoryResult {
  const price = SHOP_GEAR_PRICE[order.tier];
  const weapon = order.slot === "vuKhi";
  if (
    price === undefined ||
    !GEAR_SLOTS.includes(order.slot) ||
    !ELEMENTS.includes(order.element) ||
    !getGearSet(order.set) ||
    weapon !== (order.profession !== undefined) ||
    (order.profession !== undefined && !(PROFESSIONS as readonly string[]).includes(order.profession))
  ) {
    return { ok: false, error: "invalidItem" };
  }
  if (profile.gold < price) return { ok: false, error: "notEnoughGold" };
  const item: Omit<GearItem, "id"> = {
    slot: order.slot,
    element: order.element,
    tier: order.tier,
    set: order.set,
    ...(weapon ? { profession: order.profession } : {}),
  };
  const added = addItem({ ...profile, gold: profile.gold - price }, item);
  return added
    ? { ok: true, profile: added.profile }
    : { ok: false, error: "bagFull" };
}

const isObj = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null;

export function isGearItem(x: unknown): x is GearItem {
  if (!isObj(x)) return false;
  const weapon = x.slot === "vuKhi";
  return (
    typeof x.id === "string" &&
    GEAR_SLOTS.includes(x.slot as GearSlot) &&
    ELEMENTS.includes(x.element as Element) &&
    TIERS.includes(x.tier as Tier) &&
    typeof x.set === "string" &&
    (weapon
      ? normalizeProfession(x.profession) !== undefined && normalizeProfession(x.profession) === x.profession
      : x.profession === undefined)
  );
}

/** Đọc túi đồ và ô trang bị đã lưu; phần hỏng bị bỏ. */
export function parseInventory(raw: {
  bag?: unknown;
  loadouts?: unknown;
  nextItemId?: unknown;
}): Pick<Profile, "bag" | "loadouts" | "nextItemId"> {
  const bag = Array.isArray(raw.bag)
    ? raw.bag.map(item => isObj(item) && item.slot === "vuKhi" ? {...item,profession:normalizeProfession(item.profession)} : item).filter(isGearItem).slice(0, BAG_LIMIT)
    : [];
  const ids = new Set(bag.map((it) => it.id));
  const strings = (rec: unknown) =>
    isObj(rec)
      ? Object.fromEntries(
          Object.entries(rec).filter(
            ([, v]) => typeof v === "string" && ids.has(v),
          ),
        )
      : {};
  const weapons = (rec: unknown) => {
    const saved = strings(rec);
    const migrated: Partial<Record<Profession,string>> = {};
    // canonical key wins a collision; alternate item remains in bag, never destroyed.
    for (const key of [...Object.keys(saved).filter(k=>k!=="cungThu"), ...Object.keys(saved).filter(k=>k==="cungThu")]) {
      const profession = normalizeProfession(key);
      const id = saved[key];
      if (profession && typeof id === "string" && migrated[profession] === undefined) migrated[profession] = id;
    }
    return migrated;
  };
  const loadouts = isObj(raw.loadouts)
    ? Object.fromEntries(
        Object.entries(raw.loadouts).flatMap(([c, l]) =>
          isObj(l)
            ? [[c, { weapons: weapons(l.weapons), slots: strings(l.slots) }]]
            : [],
        ),
      )
    : {};
  const maxId = Math.max(0, ...bag.map((it) => Number(it.id.slice(1)) || 0));
  const nextItemId =
    typeof raw.nextItemId === "number" && raw.nextItemId > maxId
      ? raw.nextItemId
      : maxId + 1;
  return { bag, loadouts, nextItemId };
}
