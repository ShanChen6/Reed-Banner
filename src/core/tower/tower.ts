// Leo tháp (lộ trình 5.1): chuỗi tầng 3vs3, máu và lương mang sang, giữa các tầng chọn 1 trong 3 phần thưởng.
// Mỗi lượt leo sinh đối thủ từ seed riêng. Số liệu là điểm xuất phát do Claude đặt, chờ Shan duyệt.
// Xem docs/design/09-che-do-choi.md mục 3.

import type { Difficulty } from "../ai";
import type { FighterConfig } from "../battle";
import { STANDARD_WEIGHTS, type SpawnWeights } from "../board";
import { BOSS_HP, HOME_TERRAIN, RAID_STAGES, stageFighter } from "../campaign";
import {
  BOON_BONUS,
  clampTowerFood,
  leveledFoe,
  MAIN_ID,
  MAX_LEVEL,
  profileTeam,
  TOWER_BOONS,
  TOWER_FOOD_START,
  type Profile,
  type TowerReward,
  type TowerRun,
} from "../progress";
import { createRng, type Rng } from "../rng";
import { SHOP_COMPANIONS, STARTER_COMPANIONS } from "../roster";

/** Cứ chừng này tầng có một tầng trùm: thủ lĩnh là một sứ quân, máu ×BOSS_HP, đánh trên sân nhà. */
export const TOWER_BOSS_EVERY = 5;
/** Cấp đối thủ tầng 1 thấp hơn cấp nhân vật chính chừng này; mỗi tầng sau +1 cấp. */
export const TOWER_LEVEL_OFFSET = 2;
/** Quá cấp tối đa thì mỗi tầng đối thủ mạnh thêm chừng này (máu và công). */
export const TOWER_OVERCAP = 0.05;
/** Vàng thưởng khi lần đầu qua một tầng trùm (nhân số tầng). */
export const TOWER_BOSS_GOLD = 40;

/** Độ khó AI theo tầng. */
export function towerDifficulty(floor: number): Difficulty {
  if (floor <= 2) return "normal";
  if (floor <= 7) return "hard";
  if (floor <= 14) return "boss";
  return "nightmare";
}

export const isBossFloor = (floor: number) => floor % TOWER_BOSS_EVERY === 0;

const FOE_POOL: readonly FighterConfig[] = [
  ...STARTER_COMPANIONS,
  ...SHOP_COMPANIONS.map((c) => c.fighter),
];

const floorSeed = (seed: number, floor: number, salt = 0) =>
  (seed ^ Math.imul(floor + salt * 1000, 0x9e3779b1)) >>> 0;

function pickDistinct<T>(rng: Rng, items: readonly T[], n: number): T[] {
  const pool = [...items];
  return Array.from(
    { length: n },
    () => pool.splice(rng.int(0, pool.length - 1), 1)[0]!,
  );
}

function overcap(f: FighterConfig, over: number): FighterConfig {
  if (over <= 0) return f;
  const k = 1 + TOWER_OVERCAP * over;
  return { ...f, maxHp: Math.round(f.maxHp * k), atk: Math.round(f.atk * k) };
}

export interface TowerFloor {
  readonly floor: number;
  readonly level: number;
  readonly boss: boolean;
  readonly difficulty: Difficulty;
  readonly weights: SpawnWeights;
  readonly foes: FighterConfig[];
}

/** Tầng `floor` của lượt leo: cùng seed luôn ra cùng đối thủ. */
export function towerFloor(
  run: Pick<TowerRun, "seed" | "baseLevel">,
  floor: number,
): TowerFloor {
  const rng = createRng(floorSeed(run.seed, floor));
  const raw = run.baseLevel + floor - 1;
  const level = Math.max(1, Math.min(MAX_LEVEL, raw));
  const over = raw - MAX_LEVEL;
  const boss = isBossFloor(floor);
  const aides = pickDistinct(rng, FOE_POOL, boss ? 2 : 3).map((f) =>
    overcap(leveledFoe(f, level), over),
  );
  if (!boss)
    return {
      floor,
      level,
      boss,
      difficulty: towerDifficulty(floor),
      weights: STANDARD_WEIGHTS,
      foes: aides,
    };
  const stage = RAID_STAGES[rng.int(0, RAID_STAGES.length - 1)]!;
  const leader = overcap(stageFighter(stage.foes[0]!, level), over);
  return {
    floor,
    level,
    boss,
    difficulty: towerDifficulty(floor),
    weights: HOME_TERRAIN[leader.element],
    foes: [{ ...leader, maxHp: Math.round(leader.maxHp * BOSS_HP) }, ...aides],
  };
}

/** Bắt đầu lượt leo mới với đội đang chọn ở hồ sơ, đầy máu, lương khởi đầu. */
export function newTowerRun(profile: Profile, seed: number): TowerRun {
  return {
    seed: seed >>> 0,
    floor: 1,
    baseLevel: Math.max(1, profile.main.level - TOWER_LEVEL_OFFSET),
    team: [MAIN_ID, ...profile.team],
    hp: [1, 1, 1],
    food: TOWER_FOOD_START,
    boons: {},
    offer: null,
    active: false,
  };
}

/** Đội người chơi ở tháp: dựng theo hồ sơ hiện tại (cấp, trang bị), cộng phúc đã nhận. */
export function towerTeam(profile: Profile, run: TowerRun): FighterConfig[] {
  const k = (b: (typeof TOWER_BOONS)[number]) =>
    1 + BOON_BONUS[b] * (run.boons[b] ?? 0);
  return profileTeam(profile, run.team.slice(1)).map((f) => ({
    ...f,
    maxHp: Math.round(f.maxHp * k("hp")),
    atk: Math.round(f.atk * k("atk")),
    def: Math.round(f.def * k("def")),
  }));
}

/** Ba phần thưởng sau khi thắng tầng: hồi máu, thêm lương, một phúc ngẫu nhiên. */
export function towerOffer(run: TowerRun, floor: number): TowerReward[] {
  const rng = createRng(floorSeed(run.seed, floor, 1));
  const boon = TOWER_BOONS[rng.int(0, TOWER_BOONS.length - 1)]!;
  return [{ kind: "heal" }, { kind: "food" }, { kind: "boon", boon }];
}

export interface TowerResult {
  readonly floor: number;
  readonly won: boolean;
  /** Tầng cao nhất đã qua sau trận. */
  readonly best: number;
  readonly newBest: boolean;
  /** Vàng thưởng lần đầu qua tầng trùm. */
  readonly bonusGold: number;
}

/**
 * Cộng kết quả trận ở tháp. Thắng: lên tầng, mang máu và lương còn lại, chờ chọn phần thưởng. Thua: hết lượt leo.
 * `hp` là tỉ lệ máu cuối trận của phe người chơi theo vị trí.
 */
export function applyTowerResult(
  profile: Profile,
  won: boolean,
  hp: readonly number[],
  food: number,
): { profile: Profile; result: TowerResult } {
  const run = profile.tower.run;
  if (!run)
    return {
      profile,
      result: {
        floor: 0,
        won,
        best: profile.tower.best,
        newBest: false,
        bonusGold: 0,
      },
    };
  const floor = run.floor;
  const newBest = won && floor > profile.tower.best;
  const best = newBest ? floor : profile.tower.best;
  const bonusGold = newBest && isBossFloor(floor) ? TOWER_BOSS_GOLD * floor : 0;
  const next: TowerRun | null = won
    ? {
        ...run,
        floor: floor + 1,
        hp: run.hp.map((_, i) => Math.max(0, Math.min(1, hp[i] ?? 0))),
        food: clampTowerFood(food),
        offer: towerOffer(run, floor),
        active: false,
      }
    : null;
  return {
    profile: {
      ...profile,
      gold: profile.gold + bonusGold,
      tower: { best, run: next },
    },
    result: { floor, won, best, newBest, bonusGold },
  };
}
