// Trạng thái trận đấu: dữ liệu thuần, tuần tự hóa được (lưu DB, gửi client).

import type { Board, SpawnWeights } from "../board";
import type { Effect } from "./effects";
import type { Element } from "./elements";
import type { Profession } from "./rules";

export interface FighterConfig {
  readonly id: string;
  readonly name: string;
  readonly element: Element;
  readonly profession: Profession;
  readonly maxHp: number;
  readonly atk: number;
  readonly def: number;
  /** Kỹ năng chủ động mang vào trận (id trong SKILLS). */
  readonly skills?: readonly string[];
}

export interface Fighter extends FighterConfig {
  hp: number;
  energy: number;
  /** Tinh thần chiến đấu, 0..SPIRIT_MAX; giảm khi trận kéo dài. */
  spirit: number;
  effects: Effect[];
}

export interface SideConfig {
  /** Theo vị trí 1, 2, 3. 1vs1 chỉ có một người. */
  readonly fighters: readonly FighterConfig[];
  /** Chỉ số thủ lĩnh: nhân vật chính, hoặc vị trí 1 của đội AI. */
  readonly leader: number;
  readonly food?: number;
}

export interface Side {
  readonly fighters: Fighter[];
  readonly leader: number;
  food: number;
  rage: number;
  /** Số lượt của phe còn lại của kỹ năng bị động; 0 là không có hiệu lực. */
  passiveTurns: number;
  /** Vàng và sách thu được, dùng cho phần thưởng ngoài trận. */
  gold: number;
  books: number;
}

export type SideIndex = 0 | 1;

export interface TurnState {
  readonly side: SideIndex;
  /** Người hành động hiện tại. */
  actor: number;
  /** Người vừa ra tay ở lần trước trong cùng phe; không được chọn liên tiếp (3vs3). */
  lastActor: number | null;
  /** Những người đã ra tay trong lượt này của phe, kể cả lượt thêm. */
  acted: number[];
  /** Lần ra tay hiện tại là lượt thêm. */
  extra: boolean;
  /** Đã dùng kỹ năng trong lần ra tay này (tối đa 1). */
  skillUsed: boolean;
  /** Mốc hết giờ (ms); null khi tắt đồng hồ. */
  deadline: number | null;
  /** Số lượt đã bắt đầu của cả trận, tính từ 1. */
  number: number;
}

export interface BattleState {
  readonly sides: [Side, Side];
  board: Board;
  /** Trạng thái luồng ngẫu nhiên của bàn cờ (bàn khởi đầu và ô rơi). */
  boardRng: number;
  /** Trạng thái luồng ngẫu nhiên riêng của AI, tách khỏi luồng bàn cờ. */
  aiRng: number;
  readonly weights: SpawnWeights;
  readonly timer: boolean;
  turn: TurnState;
  /** Người cuối cùng đã ra tay của mỗi phe, để chọn người kế tiếp ở lượt sau. */
  lastActors: [number | null, number | null];
  winner: SideIndex | null;
}

export function isAlive(f: Fighter): boolean {
  return f.hp > 0;
}

export function canAct(f: Fighter): boolean {
  return isAlive(f) && !f.effects.some((e) => e.kind === "freeze");
}

export function otherSide(side: SideIndex): SideIndex {
  return side === 0 ? 1 : 0;
}
