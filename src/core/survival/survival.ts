// Sinh tồn (lộ trình 5.3): một trận 3vs3 không dừng trên cùng bàn cờ, đối thủ kéo đến theo đợt mạnh dần.
// Giữa hai đợt: người còn sống hồi máu, thêm lương, hồi sinh tối đa 1 người. Điểm là số đợt đã vượt qua.
// Số liệu là điểm xuất phát do Claude đặt, chờ Shan duyệt. Xem docs/design/09-che-do-choi.md mục 4.

import type { Difficulty } from "../ai";
import {
  FOOD_MAX,
  type BattleState,
  type FighterConfig,
  type Element,
  type Profession,
  type WaveConfig,
} from "../battle";
import { BOSS_HP, RAID_STAGES, stageFighter } from "../campaign";
import { leveledFoe, MAX_LEVEL, type Profile } from "../progress";
import { createRng, type Rng } from "../rng";
import { SHOP_COMPANIONS, STARTER_COMPANIONS } from "../roster";

/** Người còn sống hồi chừng này phần máu tối đa giữa hai đợt. */
export const SURVIVAL_HEAL = 0.2;
/** Lương cộng thêm giữa hai đợt. */
export const SURVIVAL_FOOD = 25;
/** Người gục tự đứng dậy sau chừng này đợt, tính cả đợt bị gục (gục ở đợt 3 thì nghỉ đợt 4, vào lại đợt 5). */
export const SURVIVAL_REVIVE_WAVES = 2;
/** Lương để hồi sinh ngay ở lần nghỉ giữa đợt. */
export const SURVIVAL_REVIVE_FOOD = 40;
/** Máu khi hồi sinh, theo phần máu tối đa; năng lượng về 0. */
export const SURVIVAL_REVIVE_HP = 0.3;
/** Cứ chừng này đợt có một đợt trùm: một sứ quân dẫn hai tùy tướng, máu ×BOSS_HP. */
export const SURVIVAL_BOSS_EVERY = 5;
/** Đợt 1–2 có 2 đối thủ, từ đợt 3 có 3. */
export const SURVIVAL_SMALL_WAVES = 2;
/** Đối thủ tăng 1 cấp sau chừng này đợt (tối đa 30). */
export const SURVIVAL_WAVES_PER_LEVEL = 4;
/** Sức mạnh đối thủ (nhân vào máu và công): đợt 1 là START, mỗi đợt sau cộng STEP. */
export const SURVIVAL_POWER_START = 0.45;
export const SURVIVAL_POWER_STEP = 0.05;
/** Máu đối thủ nhân thêm hệ số này để mỗi đợt ngắn (mục tiêu 6–10 lượt mỗi bên). */
export const SURVIVAL_FOE_HP = 0.6;
/** Vàng thưởng cho mỗi đợt đã vượt qua khi lượt chơi kết thúc. */
export const SURVIVAL_WAVE_GOLD = 10;

/** Lượt chơi sinh tồn, lưu trong trận. `seed` chỉ nằm trên server. */
export interface SurvivalRun {
  readonly seed: number;
  /** Cấp nhân vật chính lúc bắt đầu; đối thủ tính cấp từ đây. */
  readonly baseLevel: number;
  /** Đợt đang đánh (hoặc vừa thắng, khi đang nghỉ). */
  readonly wave: number;
  /** Theo vị trí phe người chơi: đợt mà người đó gục, null khi còn đứng. Ghi lúc nghỉ giữa đợt. */
  readonly downed: readonly (number | null)[];
  /** Lượt chơi đã kết thúc (thua, dừng lại, hoặc bỏ dở quá 24 giờ). */
  readonly done: boolean;
}

export interface SurvivalWave {
  readonly wave: number;
  readonly level: number;
  readonly boss: boolean;
  readonly difficulty: Difficulty;
  readonly foes: FighterConfig[];
}

export const isBossWave = (wave: number) => wave % SURVIVAL_BOSS_EVERY === 0;

export const survivalPower = (wave: number) =>
  SURVIVAL_POWER_START + SURVIVAL_POWER_STEP * (wave - 1);

/** Độ khó AI theo đợt. */
export function survivalDifficulty(wave: number): Difficulty {
  if (wave <= 2) return "easy";
  if (wave <= 6) return "normal";
  if (wave <= 12) return "hard";
  if (wave <= 20) return "boss";
  return "nightmare";
}

const FOE_POOL: readonly FighterConfig[] = [
  ...STARTER_COMPANIONS,
  ...SHOP_COMPANIONS.map((c) => c.fighter),
];

const waveSeed = (seed: number, wave: number) =>
  (seed ^ Math.imul(wave, 0x85ebca6b)) >>> 0;

function pickDistinct<T>(rng: Rng, items: readonly T[], n: number): T[] {
  const pool = [...items];
  return Array.from(
    { length: n },
    () => pool.splice(rng.int(0, pool.length - 1), 1)[0]!,
  );
}

function scaled(f: FighterConfig, k: number): FighterConfig {
  return {
    ...f,
    maxHp: Math.round(f.maxHp * k * SURVIVAL_FOE_HP),
    atk: Math.round(f.atk * k),
  };
}

export function newSurvivalRun(profile: Profile, seed: number): SurvivalRun {
  return {
    seed: seed >>> 0,
    baseLevel: profile.main.level,
    wave: 1,
    downed: [null, null, null],
    done: false,
  };
}

/** Đối thủ của đợt `wave`: cùng seed luôn ra cùng đội. */
export function survivalWave(
  run: Pick<SurvivalRun, "seed" | "baseLevel">,
  wave: number,
): SurvivalWave {
  const rng = createRng(waveSeed(run.seed, wave));
  const level = Math.max(
    1,
    Math.min(
      MAX_LEVEL,
      run.baseLevel + Math.floor((wave - 1) / SURVIVAL_WAVES_PER_LEVEL),
    ),
  );
  const k = survivalPower(wave);
  const boss = isBossWave(wave);
  const count = boss ? 2 : wave <= SURVIVAL_SMALL_WAVES ? 2 : 3;
  const aides = pickDistinct(rng, FOE_POOL, count).map((f) =>
    scaled(leveledFoe(f, level), k),
  );
  const difficulty = survivalDifficulty(wave);
  if (!boss) return { wave, level, boss, difficulty, foes: aides };
  const stage = RAID_STAGES[rng.int(0, RAID_STAGES.length - 1)]!;
  const leader = scaled(stageFighter(stage.foes[0]!, level), k);
  return {
    wave,
    level,
    boss,
    difficulty,
    foes: [{ ...leader, maxHp: Math.round(leader.maxHp * BOSS_HP) }, ...aides],
  };
}

/** Báo trước đợt kế tiếp: chỉ tên, hệ, nghề, không lộ seed. */
export interface WavePreview {
  readonly wave: number;
  readonly boss: boolean;
  readonly level: number;
  readonly foes: readonly {
    readonly id: string;
    readonly name: string;
    readonly element: Element;
    readonly profession: Profession;
  }[];
}

export function wavePreview(
  run: Pick<SurvivalRun, "seed" | "baseLevel">,
  wave: number,
): WavePreview {
  const w = survivalWave(run, wave);
  return {
    wave,
    boss: w.boss,
    level: w.level,
    foes: w.foes.map(({ id, name, element, profession }) => ({
      id,
      name,
      element,
      profession,
    })),
  };
}

/** Đang nghỉ giữa hai đợt: phe người chơi vừa thắng đợt hiện tại và lượt chơi chưa kết thúc. */
export const survivalBreak = (run: SurvivalRun, battle: BattleState) =>
  !run.done && battle.winner === 0;

/** Số đợt đã vượt qua. */
export const survivalCleared = (run: SurvivalRun, battle: BattleState) =>
  battle.winner === 0 ? run.wave : run.wave - 1;

/** Người gục sau đợt vừa xong: ai mới gục thì ghi đợt hiện tại. */
export function downedAfterWave(
  run: Pick<SurvivalRun, "downed" | "wave">,
  battle: BattleState,
): (number | null)[] {
  return battle.sides[0].fighters.map((f, i) =>
    f.hp > 0 ? null : (run.downed[i] ?? run.wave),
  );
}

export type SurvivalError = "noBreak" | "invalidRevive" | "notEnoughFood";

export type BreakPlan =
  | {
      readonly ok: true;
      readonly run: SurvivalRun;
      readonly wave: SurvivalWave;
      readonly config: WaveConfig;
    }
  | { readonly ok: false; readonly error: SurvivalError };

/**
 * Lần nghỉ giữa đợt: cộng lương, hồi sinh tối đa 1 người, dựng đợt kế. `paidRevive` là vị trí người chơi
 * trả SURVIVAL_REVIVE_FOOD lương để hồi sinh ngay; bỏ trống thì hồi sinh tự động người đã nghỉ đủ đợt.
 */
export function planBreak(
  run: SurvivalRun,
  battle: BattleState,
  paidRevive?: number,
): BreakPlan {
  if (!survivalBreak(run, battle)) return { ok: false, error: "noBreak" };
  const downed = downedAfterWave(run, battle);
  let food = Math.min(FOOD_MAX, battle.sides[0].food + SURVIVAL_FOOD);
  let revive: number | null = null;
  if (paidRevive !== undefined) {
    if (downed[paidRevive] == null)
      return { ok: false, error: "invalidRevive" };
    if (food < SURVIVAL_REVIVE_FOOD)
      return { ok: false, error: "notEnoughFood" };
    food -= SURVIVAL_REVIVE_FOOD;
    revive = paidRevive;
  } else {
    revive = autoRevive(run.wave, downed);
  }
  if (revive !== null) downed[revive] = null;
  const wave = survivalWave(run, run.wave + 1);
  return {
    ok: true,
    run: { ...run, wave: wave.wave, downed },
    wave,
    config: {
      wave: wave.wave,
      foes: { fighters: wave.foes, leader: 0 },
      heal: SURVIVAL_HEAL,
      food,
      revive: revive === null ? [] : [revive],
      reviveHp: SURVIVAL_REVIVE_HP,
    },
  };
}

/** Người tự hồi sinh ở lần nghỉ sau đợt `cleared`: gục sớm nhất trong số đã nghỉ đủ đợt. */
export function autoRevive(
  cleared: number,
  downed: readonly (number | null)[],
): number | null {
  let pick: number | null = null;
  downed.forEach((d, i) => {
    if (d === null || cleared - d < SURVIVAL_REVIVE_WAVES - 1) return;
    if (pick === null || d < downed[pick]!) pick = i;
  });
  return pick;
}

export interface SurvivalResult {
  readonly cleared: number;
  readonly best: number;
  readonly newBest: boolean;
  readonly gold: number;
}

/** Cộng kết quả lượt chơi sinh tồn vào hồ sơ: kỷ lục và vàng theo số đợt. */
export function applySurvivalResult(
  profile: Profile,
  cleared: number,
): { profile: Profile; result: SurvivalResult } {
  const newBest = cleared > profile.survival.best;
  const best = newBest ? cleared : profile.survival.best;
  const gold = SURVIVAL_WAVE_GOLD * cleared;
  return {
    profile: {
      ...profile,
      gold: profile.gold + gold,
      survival: { best },
    },
    result: { cleared, best, newBest, gold },
  };
}
