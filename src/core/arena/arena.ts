// Đấu trường bóng ma (lộ trình 5.5): PvP không đồng bộ. Mỗi người chơi để lại một đội phòng thủ (bản chụp
// đội 3vs3 lúc đặt); người khác đánh với đội đó do AI điều khiển. Điểm đấu trường tính kiểu Elo.
// Số liệu là điểm xuất phát do Claude đặt, chờ Shan duyệt. Xem docs/02-game-modes/README.md mục 5.3.

import type { Difficulty } from "../ai";
import {
  withComboPassive,
  ELEMENTS,
  PROFESSIONS,
  type Element,
  type FighterConfig,
  type Profession,
} from "../battle";
import { WARLORD_ENCOUNTERS } from "../campaign";
import {
  autoProgress,
  leveledFoe,
  MAIN_ID,
  newProfile,
  profileTeam,
  isDualTowerV1,
  progressOf,
  receiveDrop,
  type Profile,
} from "../progress";
import { companionById } from "../roster/roster";
import { createRng, type Rng } from "../rng";
import { GEAR_SETS, GEAR_SLOTS, type GearItem, type Tier } from "../gear";
import { vnDay } from "../vnTime";
import { SHOP_COMPANIONS, STARTER_COMPANIONS } from "../roster";

/**
 * Tên hiển thị hai cách đấu của Quần Hùng (21/11/2026, thay "Đấu bóng ma" và "Đấu người"). Phá Doanh: đánh đội phòng thủ
 * (bản chụp do máy điều khiển) của hào kiệt khác. Thư Hùng: đấu trực tiếp với người khác. Đổi tên chỉ cần sửa ở đây.
 */
export const ARENA_MODE_NAME = { ghost: "Phá Doanh", pvp: "Thư Hùng" } as const;

/** Điểm khởi đầu, cũng là điểm của bóng ma do máy tạo. */
export const ARENA_START = 1000;
/** Hệ số Elo của người đánh; người phòng thủ đổi một nửa. */
export const ARENA_K = 32;
export const ARENA_DEFENDER_K = 16;
/** Số trận được đánh mỗi ngày (đổi lúc 0 giờ giờ Việt Nam). */
export const ARENA_ATTACKS_PER_DAY = 10;
/** Số đối thủ bày ra để chọn. */
export const ARENA_OFFERS = 3;
/** AI điều khiển đội phòng thủ đánh ở mức này. */
export const ARENA_DIFFICULTY: Difficulty = "hard";
/** Vàng thưởng thêm khi thắng, ngoài thưởng trận thường. */
export const ARENA_WIN_GOLD = 50;

export const arenaDay = vnDay;

/**
 * Trần phần trang bị cộng thêm trong Quần Hùng, tính theo chỉ số gốc của cấp (Shan 18/11/2026). Không có trần thì
 * đội cấp 5 mặc đủ đồ Thần phẩm thắng đội cấp 30 không đồ khoảng 90% (mô phỏng 60 trận); trần 30% công và máu đưa
 * về khoảng 13%, còn cùng cấp thì đồ tốt vẫn hơn rõ. Thủ gốc nhỏ nên cho cộng gấp đôi.
 */
export const ARENA_GEAR_CAP = { atk: 0.3, maxHp: 0.3, def: 1 } as const;

/** Chỉ số trong Quần Hùng: không thấp hơn chỉ số gốc của cấp, phần cộng từ trang bị không quá trần. */
export function capArenaGear(config: FighterConfig, base: FighterConfig): FighterConfig {
  const clamp = (stat: keyof typeof ARENA_GEAR_CAP) =>
    Math.max(base[stat], Math.min(config[stat], Math.round(base[stat] * (1 + ARENA_GEAR_CAP[stat]))));
  return { ...config, maxHp: clamp("maxHp"), atk: clamp("atk"), def: clamp("def") };
}

/** Đội ra trận Quần Hùng của một hồ sơ: như đội thường, trang bị theo trần ARENA_GEAR_CAP. */
export function arenaTeam(profile: Profile, companionIds: readonly string[]): FighterConfig[] {
  const geared = profileTeam(profile, companionIds);
  const bare = profileTeam({ ...profile, loadouts: {} }, companionIds);
  return geared.map((f, i) => capArenaGear(f, bare[i] ?? f));
}

/** Chỉ số gốc (không trang bị) của một người trong đội phòng thủ, dựng lại theo công thức hiện hành. */
function memberBase(m: ArenaMember): FighterConfig | null {
  if (m.id === MAIN_ID)
    return profileTeam({ ...newProfile(), element: m.element, profession: m.profession, main: autoProgress(m.level, null) })[0] ?? null;
  const companion = companionById(m.id);
  return companion ? leveledFoe(companion, m.level) : null;
}

/** Một người trong đội phòng thủ, đủ để hiện cho người đánh xem trước. */
export interface ArenaMember {
  readonly id: string;
  readonly name: string;
  readonly element: Element;
  readonly profession: Profession;
  readonly level: number;
}

/** Đội phòng thủ: bản chụp chỉ số lúc đặt, nâng cấp sau đó không tự cập nhật. */
export interface ArenaDefense {
  readonly team: readonly FighterConfig[];
  readonly members: readonly ArenaMember[];
  /** Lực chiến: tổng chỉ số, chỉ để hiện. */
  readonly power: number;
}

export function teamPower(team: readonly FighterConfig[]): number {
  return team.reduce((a, f) => a + Math.round(f.maxHp / 10 + f.atk + f.def), 0);
}

function defenseFrom(
  team: readonly FighterConfig[],
  levels: readonly number[],
): ArenaDefense {
  return {
    team,
    members: team.map((f, i) => ({
      id: f.id,
      name: f.name,
      element: f.element,
      profession: f.profession,
      level: levels[i] ?? 1,
    })),
    power: teamPower(team),
  };
}

/** Chụp đội 3vs3 đang chọn ở hồ sơ làm đội phòng thủ. */
export function defenseOf(profile: Profile): ArenaDefense {
  const team = arenaTeam(profile, profile.team);
  return defenseFrom(
    team,
    team.map((f) => progressOf(profile, f.id).level),
  );
}

const POOL: readonly FighterConfig[] = [
  ...STARTER_COMPANIONS,
  ...SHOP_COMPANIONS.map((c) => c.fighter),
];

function pickDistinct<T>(rng: Rng, items: readonly T[], n: number): T[] {
  const pool = [...items];
  return Array.from(
    { length: n },
    () => pool.splice(rng.int(0, pool.length - 1), 1)[0]!,
  );
}

/** Tên bóng ma do máy tạo: theo vùng đất của các sứ quân. */
export function botName(seed: number): string {
  const rng = createRng(seed >>> 0);
  return `Bóng ma ${WARLORD_ENCOUNTERS[rng.int(0, WARLORD_ENCOUNTERS.length - 1)]!.modernRegion.split(",")[0]}`;
}

/**
 * Đội bóng ma do máy tạo khi chưa đủ người chơi thật: Đinh Bộ Lĩnh nguyên tố, nghề ngẫu nhiên và 2 nhân vật
 * kèm, cùng cấp với người đánh, không trang bị.
 */
export function botDefense(seed: number, level: number): ArenaDefense {
  const rng = createRng((seed ^ 0x9e3779b9) >>> 0);
  const element = ELEMENTS[rng.int(0, ELEMENTS.length - 1)]!;
  const profession = PROFESSIONS[rng.int(0, PROFESSIONS.length - 1)]!;
  const [main] = profileTeam({
    ...newProfile(),
    element,
    profession,
    main: autoProgress(level, null),
  });
  const team = [
    main!,
    ...pickDistinct(rng, POOL, 2).map((f) => leveledFoe(f, level)),
  ];
  return defenseFrom(
    team,
    team.map(() => level),
  );
}

/**
 * Đội phòng thủ đưa vào trận: bản chụp giữ kỹ năng người chơi đã chọn, chỉ số kẹp lại theo cấp đã chụp (bản chụp cũ
 * đặt trước khi có trần trang bị cũng bị kẹp). Đổi tên nhân vật chính thành tên người chơi, để hai Đinh Bộ Lĩnh
 * không trùng tên.
 */
export function ghostTeam(
  defense: ArenaDefense,
  name: string,
): FighterConfig[] {
  return defense.team.map((f, i) => {
    const member = defense.members[i];
    const base = member ? memberBase(member) : null;
    const capped = base ? capArenaGear(f, base) : f;
    return withComboPassive(i === 0 ? { ...capped, name } : capped);
  });
}

/** Lực chiến của đội phòng thủ như khi vào trận (đã kẹp trang bị). */
export const defensePower = (defense: ArenaDefense): number => teamPower(ghostTeam(defense, ""));

/** Một bậc hạng Quần Hùng: vào bậc khi điểm hạng từ `min` trở lên; lần đầu đạt bậc thì nhận `gold` và một món phẩm `gear`. */
export interface ArenaTier {
  readonly id: string;
  readonly name: string;
  readonly min: number;
  readonly gold: number;
  /** Phẩm món trang bị thưởng (2 Lục … 5 Cam). */
  readonly gear: Tier;
}

/**
 * Bậc hạng theo điểm hạng (Elo, bắt đầu 1000) và thưởng vàng lần đầu đạt bậc (Shan 18/11/2026, theo mẫu Đấu Trường
 * Ngày). Mỗi bậc nhận một lần trọn đời, không reset theo mùa: điểm hạng không reset nên thưởng theo tuần sẽ thành vàng
 * cho người điểm cao mà không cần đánh. Mốc và số vàng là đề xuất của Claude, chờ Shan duyệt: thắng ngang điểm +16 nên
 * Đồng lên Bạc khoảng 4 trận thắng; tổng cả sáu bậc 3 000 vàng, bằng khoảng 5 tuần hạng nhất mùa Quần Hùng (600 vàng).
 * Thêm một món trang bị mỗi bậc (Shan 18/11/2026): Lục, Lam, Lam, Tím, Tím, Cam; hệ theo Đinh Bộ Lĩnh lúc nhận, ô và bộ
 * ngẫu nhiên, vũ khí theo nghề Đinh Bộ Lĩnh. Món Cam chỉ rơi 2–13% ở trận Khó trở lên nên bậc Huyền Thoại là mốc đáng giá.
 */
export const ARENA_TIERS: readonly ArenaTier[] = [
  { id: "dong", name: "Đồng", min: 0, gold: 50, gear: 2 },
  { id: "bac", name: "Bạc", min: 1050, gold: 150, gear: 3 },
  { id: "vang", name: "Vàng", min: 1150, gold: 300, gear: 3 },
  { id: "bachKim", name: "Bạch Kim", min: 1300, gold: 500, gear: 4 },
  { id: "kimCuong", name: "Kim Cương", min: 1500, gold: 800, gear: 4 },
  { id: "huyenThoai", name: "Huyền Thoại", min: 1750, gold: 1200, gear: 5 },
];

/** Vị trí bậc đang đứng của một điểm hạng. */
export function arenaTierIndex(rating: number): number {
  let at = 0;
  ARENA_TIERS.forEach((t, i) => {
    if (rating >= t.min) at = i;
  });
  return at;
}

export type ArenaTierClaimError = "badTier" | "notReached" | "claimed";

/** Món thưởng của một bậc: phẩm theo bậc, hệ theo Đinh Bộ Lĩnh, ô và bộ theo `rng`; vũ khí theo nghề Đinh Bộ Lĩnh. */
export function arenaTierGear(rng: Rng, tier: ArenaTier, profile: Profile): GearItem {
  const slot = GEAR_SLOTS[rng.int(0, GEAR_SLOTS.length - 1)]!;
  const item: GearItem = { id: "", slot, element: profile.element, tier: tier.gear, set: GEAR_SETS[rng.int(0, GEAR_SETS.length - 1)]!.id };
  return slot === "vuKhi" ? { ...item, profession: profile.profession } : item;
}

/**
 * Nhận thưởng một bậc: điểm hạng hiện tại phải đủ bậc và bậc đó chưa nhận. Cộng vàng và một món trang bị (túi đầy thì
 * bán ngay như món rơi sau trận, `soldFor` là vàng bán được).
 */
export function claimArenaTier(
  profile: Profile,
  tierId: string,
  rating: number,
  rng: Rng,
): TierClaimResult {
  return claimTier(profile, ARENA_TIERS, "arenaTiers", tierId, tierId, rating, rng);
}

export type TierClaimResult =
  | { readonly ok: true; readonly profile: Profile; readonly gold: number; readonly item: GearItem | null; readonly soldFor: number }
  | { readonly ok: false; readonly error: ArenaTierClaimError };

/** Nhận một bậc, ghi `key` vào danh sách `field` của hồ sơ (mỗi khóa một lần). */
function claimTier(
  profile: Profile,
  tiers: readonly ArenaTier[],
  field: "arenaTiers" | "pvpTiers" | "survivalTiers" | "formationTiers",
  tierId: string,
  key: string,
  rating: number,
  rng: Rng,
): TierClaimResult {
  const tier = tiers.find((t) => t.id === tierId);
  if (!tier) return { ok: false, error: "badTier" };
  if (rating < tier.min) return { ok: false, error: "notReached" };
  const claimed = profile[field] ?? [];
  if (claimed.includes(key)) return { ok: false, error: "claimed" };
  const paid: Profile = { ...profile, gold: profile.gold + tier.gold, [field]: [...claimed, key] };
  const got = receiveDrop(paid, arenaTierGear(rng, tier, profile));
  return { ok: true, gold: tier.gold, profile: got.profile, item: got.item, soldFor: got.soldFor };
}

/**
 * Bậc Đấu người đã nhận: id bậc trong `profile.pvpTiers`. Khóa cũ "duel:bac", "team:bac" (bản tách hai dải, vài phút
 * trên develop 18/11/2026) cũng tính là đã nhận bậc đó, để gộp dải không cho nhận lại.
 */
export function pvpTierClaims(profile: Profile): string[] {
  return [...new Set((profile.pvpTiers ?? []).map((k) => k.replace(/^(duel|team):/, "")))];
}

/**
 * Đấu người: một dải bậc chung cho 1vs1 và 3vs3 xếp hạng (Shan 18/11/2026), tính theo điểm hạng cao hơn của hai thể
 * thức (`rating`), cùng mốc và thưởng với Quần Hùng bóng ma. Mỗi bậc nhận một lần.
 */
export function claimPvpTier(
  profile: Profile,
  tierId: string,
  rating: number,
  rng: Rng,
): TierClaimResult {
  if (pvpTierClaims(profile).includes(tierId)) return { ok: false, error: "claimed" };
  return claimTier(profile, ARENA_TIERS, "pvpTiers", tierId, tierId, rating, rng);
}

/**
 * Bậc Trấn Ải theo kỷ lục số đợt đã vượt trong một lượt chơi (`profile.survival.best`, server ghi khi lượt chơi kết
 * thúc), Shan 18/11/2026. Cùng tên bậc, vàng và phẩm món với Quần Hùng; mốc là đề xuất của Claude theo báo cáo cân bằng
 * Trấn Ải (docs/02-game-modes/survival/23-balance-report.md: đội không trang bị qua 10 đợt 60–100%, qua 15 đợt 10–60%,
 * qua 20 đợt 0–10%), chờ Shan duyệt. Đồng cần vượt ít nhất một đợt.
 */
export const SURVIVAL_TIERS: readonly ArenaTier[] = [
  { id: "dong", name: "Đồng", min: 1, gold: 50, gear: 2 },
  { id: "bac", name: "Bạc", min: 5, gold: 150, gear: 3 },
  { id: "vang", name: "Vàng", min: 10, gold: 300, gear: 3 },
  { id: "bachKim", name: "Bạch Kim", min: 15, gold: 500, gear: 4 },
  { id: "kimCuong", name: "Kim Cương", min: 20, gold: 800, gear: 4 },
  { id: "huyenThoai", name: "Huyền Thoại", min: 25, gold: 1200, gear: 5 },
];

/**
 * Bậc Trận Đồ theo số ván xếp hạng đã thắng (`profile.formationWins`, server cộng khi ván chuyển sang thắng), Shan
 * 18/11/2026. Cùng tên bậc, vàng và phẩm món với Quần Hùng; mốc là đề xuất của Claude: mỗi ngày hai ván (Thường, Khó),
 * mỗi tuần thêm một ván Đại trận, tối đa khoảng 15 ván thắng một tuần, nên Huyền Thoại 100 ván là mốc dài hơi.
 */
export const FORMATION_TIERS: readonly ArenaTier[] = [
  { id: "dong", name: "Đồng", min: 1, gold: 50, gear: 2 },
  { id: "bac", name: "Bạc", min: 5, gold: 150, gear: 3 },
  { id: "vang", name: "Vàng", min: 15, gold: 300, gear: 3 },
  { id: "bachKim", name: "Bạch Kim", min: 30, gold: 500, gear: 4 },
  { id: "kimCuong", name: "Kim Cương", min: 60, gold: 800, gear: 4 },
  { id: "huyenThoai", name: "Huyền Thoại", min: 100, gold: 1200, gear: 5 },
];

/** Nhận thưởng một bậc Trận Đồ: số ván xếp hạng đã thắng phải đủ mốc; mỗi bậc một lần. */
export function claimFormationTier(profile: Profile, tierId: string, rng: Rng): TierClaimResult {
  return claimTier(profile, FORMATION_TIERS, "formationTiers", tierId, tierId, profile.formationWins ?? 0, rng);
}

/** Sáu bậc với mốc `mins` (Đồng → Huyền Thoại), cùng vàng và phẩm món với Quần Hùng. */
const tiersAt = (mins: readonly [number, number, number, number, number, number]): readonly ArenaTier[] =>
  ARENA_TIERS.map((t, i) => ({ ...t, min: mins[i]! }));

export type ModeTierId = "daily" | "destiny" | "tamTuongKy";

/** Dải bậc của một chế độ: thước đo đọc từ hồ sơ trên server, đơn vị để hiện "Còn N …", mốc từng bậc. */
export interface ModeTierLadder {
  readonly id: ModeTierId;
  readonly title: string;
  /** Câu mô tả thước đo, hiện dưới dải bậc. */
  readonly measure: string;
  readonly unit: string;
  readonly tiers: readonly ArenaTier[];
  readonly score: (profile: Profile) => number;
}

const towerOf = (p: Profile) => (isDualTowerV1(p.dualTower) ? p.dualTower : null);

/**
 * Thưởng theo bậc cho các chế độ có xếp hạng còn lại (Shan 18/11/2026: chỉ chế độ chơi tính hạng): Nhật Lệnh, Tháp Thiên
 * Mệnh, Tầm Tướng Ký. Quần Hùng, Đấu người, Trấn Ải, Trận Đồ có dải riêng ở trên. Thước đo đều do server ghi vào hồ sơ
 * (không nhận số từ client); mốc là đề xuất của Claude, chờ Shan duyệt.
 */
export const MODE_TIERS: Readonly<Record<ModeTierId, ModeTierLadder>> = {
  daily: {
    id: "daily",
    title: "Bậc Nhật Lệnh",
    measure: "Số ngày đã đánh Nhật Lệnh (thắng hay thua đều tính).",
    unit: "ngày",
    tiers: tiersAt([1, 7, 20, 50, 100, 200]),
    score: (p) => p.quests.totals.daily ?? 0,
  },
  destiny: {
    id: "destiny",
    title: "Bậc Tháp Thiên Mệnh",
    measure: "Tầng Tháp Thiên Mệnh cao nhất từng vượt trong mọi chu kỳ (20 tầng).",
    unit: "tầng",
    tiers: tiersAt([1, 4, 8, 12, 16, 20]),
    score: (p) => {
      const d = towerOf(p)?.destiny;
      return d ? Math.max(d.cycleBest, ...(d.history ?? []).map((h) => h.bestFloor)) : 0;
    },
  },
  tamTuongKy: {
    id: "tamTuongKy",
    title: "Bậc Tầm Tướng Ký",
    measure: "Số tướng đã khám phá trong Tướng Lục (76 tướng, kể cả tướng khởi đầu).",
    unit: "tướng",
    tiers: tiersAt([10, 20, 35, 50, 65, 76]),
    score: (p) => p.tamTuongKy?.discovery.discoveredNodeIds.length ?? 0,
  },
};

/** Id các bậc đã nhận của một chế độ (`profile.modeTiers`). */
export const modeTierClaims = (profile: Profile, mode: ModeTierId): readonly string[] => profile.modeTiers?.[mode] ?? [];

/** Nhận thưởng một bậc của chế độ `mode`: thước đo trong hồ sơ phải đủ mốc; mỗi bậc một lần. */
export function claimModeTier(profile: Profile, mode: ModeTierId, tierId: string, rng: Rng): TierClaimResult {
  const ladder = MODE_TIERS[mode];
  const tier = ladder.tiers.find((t) => t.id === tierId);
  if (!tier) return { ok: false, error: "badTier" };
  if (ladder.score(profile) < tier.min) return { ok: false, error: "notReached" };
  const claimed = modeTierClaims(profile, mode);
  if (claimed.includes(tier.id)) return { ok: false, error: "claimed" };
  const paid: Profile = {
    ...profile,
    gold: profile.gold + tier.gold,
    modeTiers: { ...profile.modeTiers, [mode]: [...claimed, tier.id] },
  };
  const got = receiveDrop(paid, arenaTierGear(rng, tier, profile));
  return { ok: true, gold: tier.gold, profile: got.profile, item: got.item, soldFor: got.soldFor };
}

/** Nhận thưởng một bậc Trấn Ải: kỷ lục số đợt trong hồ sơ phải đủ mốc; mỗi bậc một lần. */
export function claimSurvivalTier(profile: Profile, tierId: string, rng: Rng): TierClaimResult {
  return claimTier(profile, SURVIVAL_TIERS, "survivalTiers", tierId, tierId, profile.survival.best, rng);
}

/** Điểm thay đổi sau một trận: người đánh theo ARENA_K, người phòng thủ ngược dấu theo ARENA_DEFENDER_K. */
export function arenaDelta(
  attacker: number,
  defender: number,
  won: boolean,
): { attacker: number; defender: number } {
  const expected = 1 / (1 + 10 ** ((defender - attacker) / 400));
  const s = (won ? 1 : 0) - expected;
  return {
    attacker: Math.round(ARENA_K * s),
    defender: -Math.round(ARENA_DEFENDER_K * s),
  };
}
