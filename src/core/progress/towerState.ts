// Leo tháp lưu trong hồ sơ: lượt leo đang dở (máu, lương, phúc mang sang giữa các tầng) và kỷ lục.
// Dựng đối thủ từng tầng ở src/core/tower. Xem docs/design/09-che-do-choi.md mục 3.

/** Phúc: cộng dồn tới hết lượt leo. */
export const TOWER_BOONS = ["atk", "def", "hp"] as const;
export type TowerBoon = (typeof TOWER_BOONS)[number];

/** Mỗi lần nhận phúc: +10% công, +15% thủ hoặc +10% máu tối đa cho cả đội. */
export const BOON_BONUS: Readonly<Record<TowerBoon, number>> = {
  atk: 0.1,
  def: 0.15,
  hp: 0.1,
};

/** Hồi máu: người còn sống hồi chừng này máu tối đa, người đã ngã đứng dậy với REVIVE_RATIO. */
export const TOWER_HEAL = 0.4;
export const TOWER_REVIVE = 0.25;
/** Thêm lương. */
export const TOWER_FOOD = 30;
export const TOWER_FOOD_MIN = 20;
export const TOWER_FOOD_MAX = 100;
export const TOWER_FOOD_START = 60;

export type TowerReward =
  | { readonly kind: "heal" }
  | { readonly kind: "food" }
  | { readonly kind: "boon"; readonly boon: TowerBoon };

export interface TowerRun {
  /** Seed của lượt leo: đối thủ và phần thưởng mỗi tầng sinh từ seed này. */
  readonly seed: number;
  /** Tầng sắp đánh, từ 1. */
  readonly floor: number;
  /** Cấp đối thủ ở tầng 1, đặt theo cấp nhân vật chính lúc bắt đầu leo. */
  readonly baseLevel: number;
  /** Id đội người chơi: nhân vật chính rồi 2 nhân vật kèm, cố định cả lượt leo. */
  readonly team: readonly string[];
  /** Máu theo tỉ lệ máu tối đa, theo vị trí trong `team`; 0 là đã ngã. */
  readonly hp: readonly number[];
  readonly food: number;
  /** Số lần đã nhận mỗi phúc. */
  readonly boons: Readonly<Partial<Record<TowerBoon, number>>>;
  /** Thắng tầng xong thì chọn 1 trong các phần thưởng này trước khi lên tầng tiếp. */
  readonly offer: readonly TowerReward[] | null;
  /** Đang có trận ở tầng này (chưa xong). */
  readonly active: boolean;
}

export interface TowerState {
  /** Tầng cao nhất đã qua. */
  readonly best: number;
  readonly run: TowerRun | null;
}

export const NEW_TOWER: TowerState = { best: 0, run: null };

export const clampTowerFood = (food: number) =>
  Math.max(TOWER_FOOD_MIN, Math.min(TOWER_FOOD_MAX, Math.round(food)));

const isNum = (x: unknown): x is number =>
  typeof x === "number" && Number.isFinite(x);

function parseReward(x: unknown): TowerReward | null {
  const r = x as Partial<{ kind: string; boon: string }> | null;
  if (!r || typeof r !== "object") return null;
  if (r.kind === "heal" || r.kind === "food") return { kind: r.kind };
  if (r.kind === "boon" && (TOWER_BOONS as readonly unknown[]).includes(r.boon))
    return { kind: "boon", boon: r.boon as TowerBoon };
  return null;
}

function parseRun(x: unknown): TowerRun | null {
  const r = x as Partial<TowerRun> | null;
  if (
    !r ||
    typeof r !== "object" ||
    !isNum(r.seed) ||
    !Number.isInteger(r.floor) ||
    r.floor! < 1 ||
    !Number.isInteger(r.baseLevel) ||
    !Array.isArray(r.team) ||
    r.team.length !== 3 ||
    !r.team.every((id) => typeof id === "string") ||
    !Array.isArray(r.hp) ||
    r.hp.length !== 3 ||
    !r.hp.every(isNum) ||
    !(r.hp[0]! > 0) ||
    !isNum(r.food)
  )
    return null;
  const boons = Object.fromEntries(
    TOWER_BOONS.flatMap((b) => {
      const n = (r.boons as Record<string, unknown> | undefined)?.[b];
      return Number.isInteger(n) && (n as number) > 0 ? [[b, n as number]] : [];
    }),
  );
  const offer = Array.isArray(r.offer)
    ? r.offer.map(parseReward).filter((o): o is TowerReward => o !== null)
    : null;
  return {
    seed: r.seed! >>> 0,
    floor: r.floor!,
    baseLevel: r.baseLevel!,
    team: [...r.team],
    hp: r.hp.map((h) => Math.max(0, Math.min(1, h))),
    food: clampTowerFood(r.food!),
    boons,
    offer: offer && offer.length > 0 ? offer : null,
    active: r.active === true,
  };
}

export function parseTower(raw: unknown): TowerState {
  const t = raw as Partial<TowerState> | null;
  if (!t || typeof t !== "object") return NEW_TOWER;
  return {
    best: Number.isInteger(t.best) && t.best! > 0 ? t.best! : 0,
    run: parseRun(t.run),
  };
}

/** Áp phần thưởng đã chọn lên lượt leo. */
export function applyTowerReward(run: TowerRun, reward: TowerReward): TowerRun {
  switch (reward.kind) {
    case "heal":
      return {
        ...run,
        hp: run.hp.map((h) =>
          h > 0 ? Math.min(1, h + TOWER_HEAL) : TOWER_REVIVE,
        ),
      };
    case "food":
      return { ...run, food: clampTowerFood(run.food + TOWER_FOOD) };
    case "boon":
      return {
        ...run,
        boons: {
          ...run.boons,
          [reward.boon]: (run.boons[reward.boon] ?? 0) + 1,
        },
      };
  }
}
