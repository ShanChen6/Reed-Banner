// Trạng thái trận đấu: dữ liệu thuần, tuần tự hóa được (lưu DB, gửi client).

import type { ComboPassiveId, ComboOpportunity, ShieldGrant, ComboState } from "./combos";
import type { Board, SpawnWeights } from "../board";
import type { Effect } from "./effects";
import type { Element } from "./elements";
import type { SpiritExperiment, Profession } from "./rules";

export interface FighterConfig {
  /** Three immediate reactions; fourth passive is comboPassive. Explicit list freezes battle snapshots. */
  readonly chasePassives?: readonly import("./chase").ChasePassiveId[];
  readonly id: string;
  readonly name: string;
  readonly element: Element;
  readonly profession: Profession;
  readonly maxHp: number;
  readonly atk: number;
  readonly def: number;
  /** Kỹ năng chủ động mang vào trận (id trong SKILLS). */
  readonly comboPassive?: ComboPassiveId;
  readonly skills?: readonly string[];
  /** Cấp của từng kỹ năng (id → 1..5); bỏ trống là cấp 1. */
  readonly skillLevels?: Readonly<Record<string, number>>;
  /** Cấp nhân vật (1..30) để giao diện hiển thị; luật trận không đọc. Bỏ trống là chưa dựng theo cấp. */
  readonly level?: number;
}

export interface Fighter extends FighterConfig {
  comboReady?: ComboOpportunity;
  comboOpenedAt?: number;
  comboShield?: ShieldGrant[];
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
  /** Máu lúc vào trận theo tỉ lệ máu tối đa, theo vị trí (0 là đã ngã); bỏ trống là đầy máu. Leo tháp dùng. */
  readonly hpRatio?: readonly number[];
}

export interface Side {
  readonly fighters: Fighter[];
  readonly leader: number;
  food: number;
  rage: number;
  /** Số lượt của phe còn lại của kỹ năng bị động; 0 là không có hiệu lực. */
  passiveTurns: number;
  /** Số lần xoay lốc xoáy miễn phí còn lại của bị động Phong đang có hiệu lực. */
  freeWhirls: number;
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
  /** Đã dùng lần xoay miễn phí của bị động Phong trong lần ra tay này. */
  whirlUsed: boolean;
  /** Mốc hết giờ (ms); null khi tắt đồng hồ. */
  deadline: number | null;
  /** Số lượt đã bắt đầu của cả trận, tính từ 1. */
  number: number;
}

export interface BattleState {
  comboState?: ComboState;
  /** Chỉ thiết lập nội bộ bởi harness, không nhận từ payload tạo trận của ứng dụng. */
  readonly experimentalSpirit?: SpiritExperiment;
  readonly audit?: boolean;
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
