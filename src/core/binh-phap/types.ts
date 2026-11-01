// Trận Đồ (Binh Pháp): game xếp quân độc lập với Battle Engine. Luật ở docs/02-game-modes/future/02-binh-phap-gdd.md (mục 11).
// Mọi kiểu ở đây là dữ liệu thuần, chuyển được sang JSON.

import type { Element, Profession } from "../battle";

/** Quân thường: chỉ `profession` và `element` chi phối luật, `characterId` chỉ để vẽ chân dung. */
export interface NormalPiece {
  readonly kind: "normal";
  readonly uid: string;
  readonly characterId: string;
  readonly profession: Profession;
  readonly element: Element;
}
/** Quân Lệnh (wild): đặt ở ô trống bất kỳ, khớp mọi quân kề. */
export interface WildPiece {
  readonly kind: "wild";
  readonly uid: string;
}
/** Thu Hồi (eraser): đặt lên ô đang có quân để xóa quân đó, giữ nguyên vệt khai thông. */
export interface EraserPiece {
  readonly kind: "eraser";
  readonly uid: string;
}
export type Piece = NormalPiece | WildPiece | EraserPiece;
/** Quân đã nằm trên bàn (không bao giờ là Thu Hồi). */
export type BoardPiece = NormalPiece | WildPiece;

export interface Cell {
  /** Ô chướng ngại (địa hình): không đặt được quân, không cần khai thông, không tính vào hàng/cột kín. */
  readonly blocked: boolean;
  /** Ô đã khai thông: đặt quân vào một lần là giữ mãi, kể cả khi quân bị dọn. */
  readonly covered: boolean;
  readonly piece: BoardPiece | null;
}

export type Phase = "playing" | "won" | "lost";

export type Command =
  | { readonly kind: "place"; readonly row: number; readonly col: number }
  | { readonly kind: "discard" };

/** Bộ luật một ván. Đổi bất kỳ trường nào phải tăng `version` để save cũ không bị hiểu sai. */
export interface Ruleset {
  readonly id: string;
  readonly version: number;
  readonly name: string;
  readonly blurb: string;
  readonly width: number;
  readonly height: number;
  readonly professions: readonly Profession[];
  readonly elements: readonly Element[];
  /** Xác suất sinh quân đặc biệt, tính theo phần nghìn. Không bao giờ sinh hai quân đặc biệt liên tiếp. */
  readonly wildPermille: number;
  readonly eraserPermille: number;
  /** Số ô chướng ngại sinh ngẫu nhiên theo seed, tính theo phần trăm diện tích bàn (0 = bàn đặc). */
  readonly obstaclePercent: number;
  /** Thanh Bỏ Lệnh chạy 0..maxHeat; bỏ quân khi thanh đã đầy là thua. */
  readonly maxHeat: number;
  readonly score: ScoreWeights;
}

export interface ScoreWeights {
  readonly place: number;
  /** Cộng thêm cho mỗi quân kề khớp cả nghề lẫn hệ. */
  readonly perfectNeighbor: number;
  readonly line: number;
  readonly win: number;
  /** Thưởng thắng thêm cho mỗi vạch Bỏ Lệnh còn trống. */
  readonly winPerHeatLeft: number;
  /** Thưởng thắng thêm cho mỗi nước chơi nhanh hơn "chuẩn" (chuẩn = parTurnsPerCell × số ô chơi được). */
  readonly winPerTurnSaved: number;
  readonly parTurnsPerCell: number;
}

export interface PuzzleState {
  readonly schemaVersion: number;
  readonly rulesetId: string;
  readonly rulesVersion: number;
  readonly seed: number;
  readonly width: number;
  readonly height: number;
  /** Hàng trước cột sau: ô (r, c) ở chỉ số r * width + c. */
  readonly cells: readonly Cell[];
  readonly hand: Piece;
  readonly discardHeat: number;
  readonly score: number;
  readonly placed: number;
  readonly discarded: number;
  readonly linesCleared: number;
  readonly coveredCount: number;
  readonly phase: Phase;
  /** Số lệnh hợp lệ đã chạy; cũng là số thứ tự quân sinh ra (uid). */
  readonly turn: number;
  readonly rngState: number;
}

export type PuzzleEvent =
  | { readonly type: "placed"; readonly row: number; readonly col: number; readonly piece: BoardPiece }
  | { readonly type: "covered"; readonly row: number; readonly col: number }
  | { readonly type: "erased"; readonly row: number; readonly col: number; readonly piece: BoardPiece }
  | { readonly type: "lineCleared"; readonly axis: "row" | "col"; readonly index: number }
  | { readonly type: "discarded"; readonly piece: Piece; readonly heat: number }
  | { readonly type: "heat"; readonly heat: number }
  | { readonly type: "spawned"; readonly piece: Piece }
  | { readonly type: "won" }
  | { readonly type: "lost"; readonly reason: "heat" };

export type RejectReason =
  | "finished"
  | "outOfBounds"
  | "blocked"
  | "occupied"
  | "empty"
  | "notAdjacent"
  | "mismatch"
  | "invalidCommand";

export type Transition =
  | { readonly ok: true; readonly state: PuzzleState; readonly events: readonly PuzzleEvent[] }
  | { readonly ok: false; readonly reason: RejectReason };

/** Kết quả kiểm tra một ô cho quân đang cầm; `blockers` là chỉ số các ô kề làm quân không đặt được. */
export type PlacementCheck =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: Exclude<RejectReason, "finished" | "invalidCommand">; readonly blockers: readonly number[] };
