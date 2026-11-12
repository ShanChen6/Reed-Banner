// Dựng trận ở màn chơi thử và Thao Luyện: đội, đối thủ, seed, trang bị thử, hồ sơ offline trong localStorage,
// kết quả và đồ rơi cuối trận. Không có React; màn trận ở DemoGame.tsx.

import {
  createBattle,
  createRng,
  buildCompanion,
  buildMain,
  maxProgress,
  MAX_TIER,
  ELEMENTS,
  companionById,
  leveledFoe,
  newProfile,
  parseProfile,
  presetLoadout,
  profileTeam,
  rollDrop,
  STARTER_COMPANIONS,
  withGear,
  type BattleRewards,
  type RaidResult,
  type BattleState,
  type Difficulty,
  type Element,
  type FighterConfig,
  type GearItem,
  type LevelUp,
  type Profession,
  type Profile,
  type SideConfig,
  type Tier,
  type SurvivalResult,
  type DailyScore,
} from "@/core";

import {
  type ArenaResult,
} from "./online";

export const PLAYER = 0;

export const AI = 1;

/** Seed của bàn xem trước lúc mới vào (cố định để server và trình duyệt dựng cùng một bàn). */
export const DEMO_SEED = 2026;

/** Seed mới cho mỗi trận chơi offline. */
export const randomSeed = () => crypto.getRandomValues(new Uint32Array(1))[0]!;

export const DIFFICULTIES: Difficulty[] = [
  "easy",
  "normal",
  "hard",
  "boss",
  "nightmare",
];

/** Nguyên tố đã có bộ kỹ năng nhân vật chính. */
export const MAIN_ELEMENTS = ELEMENTS;

export const byId = (id: string) => companionById(id)!;

/** Trang bị mẫu của trận demo: bậc 0 là không mặc đồ; `set` null là không bộ nào đạt mốc. */
export interface DemoGear {
  readonly tier: 0 | Tier;
  readonly set: string | null;
}

export const NO_GEAR: DemoGear = { tier: 0, set: null };

/** Chơi thử mặc định: đủ 9 món phẩm cao nhất, bộ Cờ Lau. */
export const MAX_GEAR: DemoGear = { tier: MAX_TIER, set: "coLau" };

/** Mặc đủ 9 món cùng hệ với nhân vật. Đội Tianwu mặc cùng bậc nhưng không có thưởng bộ. */
export function gearUp(
  f: FighterConfig,
  gear: DemoGear,
  set: string | null,
): FighterConfig {
  return gear.tier === 0
    ? f
    : withGear(f, presetLoadout(f.element, f.profession, gear.tier, set));
}

/** Nhân vật ở tiến trình tối đa: cấp 30, mọi kỹ năng cấp tối đa. */
export function maxed(base: FighterConfig): FighterConfig {
  return buildCompanion(base, maxProgress(null));
}

/**
 * Luyện tập: cả hai đội ở tiến trình tối đa. Tiến trình: đội theo hồ sơ lưu trên trình duyệt, đối thủ
 * cùng cấp với nhân vật chính.
 */
export type DemoMode = "practice" | "progress";

export interface Setup {
  readonly element: Element;
  readonly profession: Profession;
  readonly gear: DemoGear;
  readonly mode: DemoMode;
  readonly profile: Profile;
}

/** Đội Tianwu: 3 nhân vật kèm khởi đầu đầu tiên không có trong đội người chơi. */
export const foeIds = (team: readonly string[]) =>
  STARTER_COMPANIONS.filter((c) => !team.includes(c.id))
    .slice(0, 3)
    .map((c) => c.id);

/** Nhân vật đã có hình động (src/app/game/stage/rigs.ts), cho đứng đầu đội Tianwu ở Luyện tập để xem thử. */
export const SHOWCASE_FOES = ["tranCuong", "ngoXuongXi", "phamBachHo", "tranLam", "dinhLien", "leHoan", "trinhTu", "luuCo", "dinhDien", "nguyenBac", "daoLam"];

export const practiceFoeIds = (team: readonly string[]) => {
  const shown = SHOWCASE_FOES.filter((id) => !team.includes(id));
  return [...shown, ...foeIds(team)].slice(0, 3);
};

/** Trận demo: nhân vật chính và 2 nhân vật kèm của hồ sơ, đấu đội Tianwu 3 người. */
export function demoSides({
  element,
  profession,
  gear,
  mode,
  profile,
}: Setup): [SideConfig, SideConfig] {
  const leveled = { ...profile, element, profession };
  const team =
    mode === "progress"
      ? profileTeam(leveled, profile.team)
      : [
          buildMain(maxProgress(null), element, profession),
          ...profile.team.map((id) => maxed(byId(id))),
        ];
  const level = profile.main.level;
  const foes =
    mode === "progress"
      ? foeIds(profile.team).map((id) => leveledFoe(byId(id), level))
      : practiceFoeIds(profile.team).map((id) => maxed(byId(id)));
  // Tiến trình mặc đồ trong túi đồ của hồ sơ (profileTeam); đồ mẫu chỉ dùng ở Luyện tập.
  const preset = mode === "progress" ? NO_GEAR : gear;
  return [
    { fighters: team.map((f) => gearUp(f, preset, preset.set)), leader: 0 },
    { fighters: foes.map((f) => gearUp(f, preset, null)), leader: 0 },
  ];
}

export function newBattle(seed: number, setup: Setup): BattleState {
  return createBattle({
    sides: demoSides(setup),
    seed,
    firstSide: PLAYER,
  }).state;
}

export const PROFILE_KEY = "coLau.profile.v1";

export function loadProfile(): Profile {
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return parseProfile(raw ? JSON.parse(raw) : null);
  } catch {
    return newProfile();
  }
}

export function saveProfile(p: Profile): void {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {
    // Trình duyệt chặn lưu trữ: hồ sơ chỉ sống tới khi tải lại trang.
  }
}

export interface Outcome {
  readonly rewards: BattleRewards;
  readonly levelUps: readonly LevelUp[];
  /** Món rơi đã vào túi đồ; null khi không rơi hoặc túi đầy (bán ngay được `soldFor` vàng). */
  readonly drop: GearItem | null;
  readonly soldFor: number;
  /** Campaign V2: hoàn thành và thưởng lần đầu đã ghi trên server. */
  readonly campaignV2?: {
    readonly firstClear: boolean;
    readonly totalGold: number;
  };
  /** Chỉ có ở trận đánh trùm online. */
  readonly raid?: RaidResult;
  readonly destiny?: { readonly floor: number; readonly won: boolean; readonly phase: "reward" | "done"; readonly completed?: boolean };
  /** Trận Viễn Chinh: kết quả trên sa bàn, có `end` khi trận này kết thúc lượt viễn chinh. */
  readonly expedition?: {
    readonly won: boolean;
    readonly phase: "march" | "won" | "lost";
    readonly end?: { readonly won: boolean; readonly stars: number; readonly gold: number; readonly firstClear: boolean };
  };
  readonly survival?: SurvivalResult;
  readonly daily?: { readonly score: DailyScore; readonly rank: number | null };
  readonly arena?: ArenaResult;
  /** Trận cuối nhiệm vụ nhân vật đặc biệt: nhân vật đã gia nhập chưa. */
  readonly specialQuest?: { readonly id: string; readonly joined: boolean };
}

export function demoDrop(
  seed: number,
  round: number,
  difficulty: Difficulty,
  won: boolean,
): GearItem | null {
  return rollDrop(
    createRng(Math.imul(seed, 31) ^ 0x5bd1e995),
    difficulty,
    won,
    `drop-${round}`,
  );
}
