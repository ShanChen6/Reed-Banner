// Thử thách hằng ngày (lộ trình 5.2): mỗi ngày một đề chung cho mọi người chơi (đội, đối thủ, bàn cờ, luật
// sân), mỗi người đánh một lần, xếp hạng theo điểm. Seed của ngày chỉ nằm trên server.
// Số liệu là điểm xuất phát do Claude đặt, chờ Shan duyệt. Xem docs/02-game-modes/README.md mục 5.1.

import type { Difficulty } from "../ai";
import {
  ELEMENTS,
  LEGACY_PROFESSIONS as PROFESSIONS,
  type BattleState,
  type Element,
  type FighterConfig,
  type Profession,
} from "../battle";
import type { SpawnWeights } from "../board";
import { HOME_TERRAIN, WARLORD_ENCOUNTERS, warlordLeader } from "../campaign";
import {
  autoProgress,
  leveledFoe,
  newProfile,
  profileTeam,
  vnDay,
} from "../progress";
import { createRng, type Rng } from "../rng";
import { SHOP_COMPANIONS, STARTER_COMPANIONS } from "../roster";

/** Mọi người cùng cấp và không trang bị, để chỉ còn tài đánh. */
export const DAILY_LEVEL = 10;
export const DAILY_DIFFICULTY: Difficulty = "hard";
/** Vàng thưởng khi đánh xong đề ngày. */
export const DAILY_GOLD = { win: 150, loss: 50 } as const;

/** Khóa ngày dạng YYYY-MM-DD, đổi lúc 0 giờ giờ Việt Nam (cùng mốc với nhiệm vụ ngày). */
export const dailyKey = vnDay;

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

/** Đề của một ngày: như nhau với mọi người chơi cùng seed. */
export interface DailySetup {
  readonly element: Element;
  readonly profession: Profession;
  /** Đội người chơi: Đinh Bộ Lĩnh rồi 2 nhân vật kèm. */
  readonly team: FighterConfig[];
  /** Đối thủ: một sứ quân dẫn 2 tùy tướng, đánh trên sân nhà của sứ quân. */
  readonly foes: FighterConfig[];
  /** Sứ quân dẫn đội đối thủ (id trong danh mục 12 sứ quân, để hiện tên đất). */
  readonly warlord: string;
  readonly weights: SpawnWeights;
  readonly difficulty: Difficulty;
}

export function dailySetup(seed: number): DailySetup {
  const rng = createRng(seed >>> 0);
  const element = ELEMENTS[rng.int(0, ELEMENTS.length - 1)]!;
  const profession = PROFESSIONS[rng.int(0, PROFESSIONS.length - 1)]!;
  const warlord =
    WARLORD_ENCOUNTERS[rng.int(0, WARLORD_ENCOUNTERS.length - 1)]!;
  const picks = pickDistinct(rng, POOL, 4);
  const p = newProfile();
  const [main] = profileTeam({
    ...p,
    element,
    profession,
    main: autoProgress(DAILY_LEVEL, null),
  });
  const leader = warlordLeader(warlord, DAILY_LEVEL);
  return {
    element,
    profession,
    team: [main!, ...picks.slice(0, 2).map((f) => leveledFoe(f, DAILY_LEVEL))],
    foes: [leader, ...picks.slice(2).map((f) => leveledFoe(f, DAILY_LEVEL))],
    warlord: warlord.id,
    weights: HOME_TERRAIN[leader.element],
    difficulty: DAILY_DIFFICULTY,
  };
}

export interface DailyScore {
  readonly won: boolean;
  /** Tổng số lượt của trận (hai phe). */
  readonly turns: number;
  /** Phần nghìn: thắng là máu còn lại của đội, thua là sát thương đã gây cho đối thủ. */
  readonly permille: number;
  /** Điểm xếp hạng: thắng luôn trên thua; thắng ít lượt hơn, rồi còn nhiều máu hơn, đứng trên. */
  readonly score: number;
}

const hpPermille = (fs: readonly { hp: number; maxHp: number }[]) =>
  Math.round(
    (1000 * fs.reduce((a, f) => a + f.hp, 0)) /
      fs.reduce((a, f) => a + f.maxHp, 0),
  );

export function dailyScore(battle: BattleState): DailyScore {
  const won = battle.winner === 0;
  const turns = battle.turn.number;
  const permille = won
    ? hpPermille(battle.sides[0].fighters)
    : 1000 - hpPermille(battle.sides[1].fighters);
  const score = won
    ? 1_000_000 - Math.min(turns, 999) * 1000 + permille
    : permille;
  return { won, turns, permille, score };
}
