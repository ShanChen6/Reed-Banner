// Khai Lộ: mini game xóa khối ô ngọc, luật ở docs/02-game-modes/khai-lo/gdd.md.
// Chạm một ô thuộc nhóm từ 2 ô cùng loại liền cạnh: cả nhóm biến mất, ô phía trên rơi xuống, cột trống thì các cột bên
// phải dồn sang trái. Không có ô mới rơi vào, nên mỗi bàn là một bài toán tất định theo seed. Logic thuần, không đọc giờ:
// Cấp tốc do giao diện đếm giờ, hết giờ thì gửi "timeUp".

import { createRng, type Rng } from "../rng";
import { ELEMENTS, type Element } from "../battle/elements";

export const KL_WIDTH = 10;
export const KL_HEIGHT = 12;
/** Dọn sạch bàn: thưởng điểm 300 + 50 × màn. Cân bằng 20/11/2026: thưởng nhỏ lại để điểm gom khối (n²) quyết định
 *  thứ hạng, trước đây thưởng dọn sạch chiếm 84% tổng điểm. Chế độ Thường (Shan 20/11/2026): không dọn sạch là thua. */
export const KL_CLEAR_BONUS_BASE = 300;
export const KL_CLEAR_BONUS_PER_LEVEL = 50;
/** 7 đạo cụ theo 7 hệ (Shan 20/11/2026): xóa quân hệ nào bằng cách chạm khối thì thanh nạp của hệ đó đầy dần; đủ số quân
 *  thì được 1 đạo cụ của hệ ấy. Quân bị đạo cụ phá không nạp, để đạo cụ đến từ việc gom khối.
 *  21/11/2026: 90 → 180 vì mỗi bàn chỉ còn 3 hệ nên mỗi hệ nhiều quân gấp đôi. */
export const KL_TOOL_CHARGE = 180;
const noTools = (): Record<KlTool, number> => ({ kim: 0, moc: 0, thuy: 0, hoa: 0, tho: 0, loi: 0, phong: 0 });
/** Đạo cụ lúc bắt đầu ván: mỗi hệ KL_START_TOOLS cái. */
export const KL_START_TOOLS = 1;
const startTools = (): Record<KlTool, number> => ({ kim: KL_START_TOOLS, moc: KL_START_TOOLS, thuy: KL_START_TOOLS, hoa: KL_START_TOOLS, tho: KL_START_TOOLS, loi: KL_START_TOOLS, phong: KL_START_TOOLS });
/** Tim (Shan 20/11/2026, như 30 tim của Block'D; 21/11 giảm còn 15 khi Thường chỉ 3 hệ): chế độ Thường bắt đầu với KL_START_HEARTS tim. Hết màn còn sót
 *  bao nhiêu quân thì mất bấy nhiêu tim; không đủ tim đỡ số quân sót thì hết ván. Dọn sạch bàn được thêm KL_CLEAR_HEARTS tim. */
export const KL_START_HEARTS = 15;
export const KL_CLEAR_HEARTS = 3;
/** Lượt hoàn tác mỗi màn (không cộng dồn sang màn sau). */
export const KL_UNDO_PER_LEVEL = 1;
export const KL_MIN_GROUP = 2;
/** Ô ×3 xuất hiện từ màn/bậc này (trước đó chỉ có ×2). */
export const KL_MULT3_FROM = 6;

/** Đạo cụ mang tên hệ của nó: kim Kim Đao (hàng), thuy Thủy Triều (cột), hoa Hỏa Cầu (3×3), loi Lôi Phạt (cùng hệ),
 *  moc Mộc Linh (đổi hệ một quân), tho Địa Chấn (hàng đáy), phong Lốc Phong (xoay 8 ô). */
export type KlTool = Element;

/** Thưởng điểm khi dọn sạch bàn ở màn này. */
export function clearBonus(level: number): number {
  return KL_CLEAR_BONUS_BASE + KL_CLEAR_BONUS_PER_LEVEL * level;
}


/** Thường: không giới hạn thời gian, hết khối thì hết màn, quân sót trừ tim.
 *  Cấp tốc (Shan 21/11/2026): cùng luật hết bàn là qua màn, nhưng giờ thay tim: dọn sạch cộng giây, mỗi quân sót trừ
 *  giây, sang màn mới ngay không dừng. Hết giờ là hết ván. Lõi không đọc giờ: giao diện cộng/trừ theo sự kiện levelPassed. */
export type KlMode = "classic" | "timed";
/** Cấp tốc: giờ lúc bắt đầu ván, giây cộng khi dọn sạch bàn, giây trừ cho mỗi quân sót. */
export const KL_TIMED_START_SECONDS = 90;
export const KL_TIMED_CLEAR_SECONDS = 40;
export const KL_TIMED_LEFT_SECONDS = 1;

/** Cấp tốc: số giây cộng (dương) hoặc trừ (âm) khi hết một bàn còn `left` quân. */
export function timedSeconds(left: number): number {
  return left === 0 ? KL_TIMED_CLEAR_SECONDS : -KL_TIMED_LEFT_SECONDS * left;
}

export interface KlCell {
  /** Mã riêng của ô, giữ nguyên khi ô rơi/dồn để giao diện làm hoạt ảnh. */
  readonly id: number;
  /** Quân nguyên tố (7 hệ của game), mỗi hệ một màu riêng. */
  readonly kind: Element;
  /** Ô số (Shan 20/11/2026, theo ô số 2, 3 của Block'D): khối chứa nó được nhân ×2 hoặc ×3 điểm. Không có là quân thường. */
  readonly mult?: 2 | 3;
}

export type KlPhase = "playing" | "stuck" | "levelDone" | "over";

export interface KlLevelSummary {
  readonly level: number;
  readonly cleared: boolean;
  readonly left: number;
  readonly bonus: number;
  /** Tim mất (quân sót) hoặc được thêm (dọn sạch, số âm nghĩa là cộng). */
  readonly hearts: number;
}

export interface KlState {
  readonly version: 1;
  readonly mode: KlMode;
  readonly seed: number;
  readonly level: number;
  readonly width: number;
  readonly height: number;
  /** Hàng trước, hàng 0 ở trên cùng; null là ô trống. */
  readonly cells: readonly (KlCell | null)[];
  readonly score: number;
  /** Thường: tim còn lại để đỡ quân sót cuối màn. Cấp tốc không dùng. */
  readonly hearts: number;
  readonly tools: Readonly<Record<KlTool, number>>;
  /** Điểm đã nạp vào thanh của từng đạo cụ (chưa đủ một đạo cụ). */
  readonly charge: Readonly<Record<KlTool, number>>;
  /** Số bàn đã chia ở bậc/màn hiện tại (Cấp tốc chia bàn mới cùng bậc), để sinh bàn khác nhau theo seed. */
  readonly deal: number;
  readonly undo: number;
  readonly moves: number;
  readonly phase: KlPhase;
  readonly nextId: number;
  readonly summary: KlLevelSummary | null;
  /** Trạng thái trước nước vừa đi, để hoàn tác (chỉ giữ một bước). */
  readonly prev: KlState | null;
}

export type KlAction =
  | { readonly type: "pick"; readonly index: number }
  | { readonly type: "tool"; readonly tool: KlTool; readonly index: number }
  | { readonly type: "undo" }
  /** Thường: kết thúc màn. Cấp tốc: bỏ bàn đang bế tắc, chia bàn mới cùng bậc. */
  | { readonly type: "endLevel" }
  | { readonly type: "nextLevel" }
  /** Cấp tốc: giao diện báo hết giờ. */
  | { readonly type: "timeUp" }
  /** Đầu hàng: kết thúc lượt chơi ngay, giữ điểm đã đạt. */
  | { readonly type: "surrender" };

export type KlEvent =
  | { readonly type: "removed"; readonly cells: readonly number[]; readonly gained: number }
  /** Dùng đạo cụ: removed là ô bị phá (Mộc Linh, Lốc Phong không phá ô nào). */
  | { readonly type: "toolUsed"; readonly tool: KlTool; readonly index: number; readonly removed: readonly number[] }
  | { readonly type: "undone" }
  | { readonly type: "levelDone"; readonly summary: KlLevelSummary }
  | { readonly type: "over" }
  | { readonly type: "newLevel"; readonly level: number }
  /** Đầy thanh nạp: +1 đạo cụ. */
  | { readonly type: "toolCharged"; readonly tool: KlTool }
  /** Cấp tốc: hết bàn, sang màn `level` ngay; giao diện cộng `seconds` (âm là trừ) vào giờ còn lại. */
  | { readonly type: "levelPassed"; readonly level: number; readonly cleared: boolean; readonly left: number; readonly bonus: number; readonly seconds: number }
  | { readonly type: "timeUp" }
  | { readonly type: "surrender" };

export type KlReason = "notPlaying" | "outOfBounds" | "empty" | "single" | "noTool" | "edge" | "noUndo" | "notStuck" | "noTarget";

export type KlResult =
  | { readonly ok: true; readonly state: KlState; readonly events: readonly KlEvent[] }
  | { readonly ok: false; readonly reason: KlReason };

export interface KlLevelConfig {
  /** Số loại ô trên bàn: càng nhiều càng khó nối nhóm. */
  readonly kinds: number;
  /** Số ô số trên bàn; từ màn KL_MULT3_FROM có thể ra ô ×3. */
  readonly mults: number;
  readonly maxMult: 2 | 3;
  /** Xác suất bẻ vụn khối khi sinh bàn (0–1): quân trùng hệ với ô trái hoặc trên bị đổi sang hệ khác. */
  readonly scatter: number;
}

/** Shan 21/11/2026: mỗi bàn (cả hai chế độ) chỉ KL_KINDS hệ; độ khó tăng bằng cách bẻ vụn khối theo màn. */
export const KL_KINDS = 3;
export const KL_SCATTER_PER_LEVEL = 0.1;
export const KL_SCATTER_MAX = 1;

export function levelConfig(level: number): KlLevelConfig {
  const kinds = KL_KINDS;
  const scatter = Math.min(KL_SCATTER_MAX, KL_SCATTER_PER_LEVEL * (level - 1));
  const mults = level < 2 ? 0 : Math.min(5, 1 + Math.floor((level - 2) / 3));
  const maxMult = level < KL_MULT3_FROM ? 2 : 3;
  return { kinds, mults, maxMult, scatter };
}

/** Điểm một khối n quân: n² nhân với tích các ô số trong khối (×2 và ×3 cùng khối là ×6). */
export function groupScore(size: number, mult = 1): number {
  return size * size * mult;
}

export function levelSeed(seed: number, level: number, deal = 0): number {
  return (seed ^ Math.imul(level, 0x9e3779b1) ^ Math.imul(deal, 0x85ebca6b)) >>> 0;
}

const shuffled = <T>(xs: readonly T[], rng: Rng): T[] => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    const t = a[i] as T;
    a[i] = a[j] as T;
    a[j] = t;
  }
  return a;
};

/** Sinh bàn cho một màn: loại ô xáo theo seed, ô số ×2, ×3 rải ngẫu nhiên. Luôn có ít nhất một nhóm chạm được. */
export function generateBoard(
  seed: number,
  level: number,
  firstId: number,
  width = KL_WIDTH,
  height = KL_HEIGHT,
  deal = 0,
): { cells: (KlCell | null)[]; nextId: number } {
  const rng = createRng(levelSeed(seed, level, deal));
  const { kinds, mults, maxMult, scatter } = levelConfig(level);
  const pool = shuffled(ELEMENTS, rng).slice(0, kinds);
  const pick = (avoid?: Element) => {
    const from = avoid ? pool.filter((k) => k !== avoid) : pool;
    return from[rng.int(0, from.length - 1)] as Element;
  };
  for (;;) {
    let id = firstId;
    const cells: (KlCell | null)[] = [];
    for (let i = 0; i < width * height; i++) {
      let kind = pick();
      if (scatter > 0) {
        const left = i % width > 0 ? cells[i - 1]?.kind : undefined;
        const up = i >= width ? cells[i - width]?.kind : undefined;
        if ((kind === left || kind === up) && rng.next() < scatter) kind = pick(kind);
      }
      cells.push({ id: id++, kind });
    }
    const order = shuffled(
      cells.map((_, i) => i),
      rng,
    ).slice(0, mults);
    for (const i of order) cells[i] = { ...(cells[i] as KlCell), mult: rng.int(2, maxMult) as 2 | 3 };
    if (hasGroup(cells, width, height)) return { cells, nextId: id };
  }
}

export function createGame(seed: number, mode: KlMode = "classic", width = KL_WIDTH, height = KL_HEIGHT): KlState {
  const s = seed >>> 0;
  const { cells, nextId } = generateBoard(s, 1, 1, width, height);
  return {
    version: 1,
    mode,
    seed: s,
    level: 1,
    width,
    height,
    cells,
    score: 0,
    hearts: KL_START_HEARTS,
    tools: startTools(),
    charge: noTools(),
    deal: 0,
    undo: KL_UNDO_PER_LEVEL,
    moves: 0,
    phase: "playing",
    nextId,
    summary: null,
    prev: null,
  };
}

const neighbors = (i: number, width: number, height: number): number[] => {
  const r = Math.floor(i / width);
  const c = i % width;
  const out: number[] = [];
  if (r > 0) out.push(i - width);
  if (r < height - 1) out.push(i + width);
  if (c > 0) out.push(i - 1);
  if (c < width - 1) out.push(i + 1);
  return out;
};

/** Nhóm ô cùng loại liền cạnh chứa ô i (loang 4 hướng), sắp tăng dần. Ô trống trả về mảng rỗng. */
export function groupAt(cells: readonly (KlCell | null)[], width: number, height: number, i: number): number[] {
  const start = cells[i];
  if (!start) return [];
  const seen = new Set<number>([i]);
  const stack = [i];
  while (stack.length) {
    const cur = stack.pop() as number;
    for (const n of neighbors(cur, width, height)) {
      if (!seen.has(n) && cells[n]?.kind === start.kind) {
        seen.add(n);
        stack.push(n);
      }
    }
  }
  return [...seen].sort((a, b) => a - b);
}

export function hasGroup(cells: readonly (KlCell | null)[], width: number, height: number): boolean {
  for (let i = 0; i < cells.length; i++) {
    const k = cells[i]?.kind;
    if (!k) continue;
    const c = i % width;
    if ((c < width - 1 && cells[i + 1]?.kind === k) || (i + width < width * height && cells[i + width]?.kind === k)) return true;
  }
  return false;
}

/** Mọi nhóm chạm được (≥ 2 ô), mỗi nhóm một lần. */
export function allGroups(cells: readonly (KlCell | null)[], width: number, height: number): number[][] {
  const seen = new Set<number>();
  const out: number[][] = [];
  for (let i = 0; i < cells.length; i++) {
    if (seen.has(i) || !cells[i]) continue;
    const g = groupAt(cells, width, height, i);
    for (const j of g) seen.add(j);
    if (g.length >= KL_MIN_GROUP) out.push(g);
  }
  return out;
}

/** Trọng lực rồi dồn cột: ô rơi xuống đáy cột, cột trống hẳn bị bỏ và các cột bên phải dồn sang trái. */
export function settle(cells: readonly (KlCell | null)[], width: number, height: number): (KlCell | null)[] {
  const columns: (KlCell | null)[][] = [];
  for (let c = 0; c < width; c++) {
    const stack: KlCell[] = [];
    for (let r = 0; r < height; r++) {
      const cell = cells[r * width + c];
      if (cell) stack.push(cell);
    }
    if (stack.length) columns.push([...Array<null>(height - stack.length).fill(null), ...stack]);
  }
  const out: (KlCell | null)[] = Array(width * height).fill(null);
  columns.forEach((col, c) => col.forEach((cell, r) => (out[r * width + c] = cell)));
  return out;
}

/** 8 ô quanh tâm theo chiều kim đồng hồ, bắt đầu từ góc trên trái. */
export function ringOf(center: number, width: number): number[] {
  const r = Math.floor(center / width);
  const c = center % width;
  const at = (dr: number, dc: number) => (r + dr) * width + (c + dc);
  return [at(-1, -1), at(-1, 0), at(-1, 1), at(0, 1), at(1, 1), at(1, 0), at(1, -1), at(0, -1)];
}

export function isWhirlCenter(center: number, width: number, height: number): boolean {
  const r = Math.floor(center / width);
  const c = center % width;
  return r >= 1 && r <= height - 2 && c >= 1 && c <= width - 2;
}

/** Vùng 3×3 quanh ô (cắt theo mép bàn). */
export function thunderArea(center: number, width: number, height: number): number[] {
  const r = Math.floor(center / width);
  const c = center % width;
  const out: number[] = [];
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const rr = r + dr;
      const cc = c + dc;
      if (rr >= 0 && rr < height && cc >= 0 && cc < width) out.push(rr * width + cc);
    }
  return out;
}

export function tilesLeft(cells: readonly (KlCell | null)[]): number {
  return cells.reduce((n, c) => n + (c ? 1 : 0), 0);
}

/** Quân xóa bằng chạm khối nạp thanh của hệ đó; đầy thanh thì +1 đạo cụ, không giới hạn số tích được (Shan 20/11/2026). */
function addCharge(s: KlState, kind: Element, count: number, events: KlEvent[]): KlState {
  const tools = { ...s.tools };
  const charge = { ...s.charge };
  let c = charge[kind] + count;
  while (c >= KL_TOOL_CHARGE) {
    c -= KL_TOOL_CHARGE;
    tools[kind] += 1;
    events.push({ type: "toolCharged", tool: kind });
  }
  charge[kind] = c;
  return { ...s, tools, charge };
}

const hasTools = (s: KlState) => ELEMENTS.some((e) => s.tools[e] > 0);

/** Ô bị đạo cụ tác động khi dùng ở ô index: remove là ô bị phá, change là ô đổi chỗ/đổi hệ. Dùng cho cả lõi và xem trước. */
export function toolTargets(
  cells: readonly (KlCell | null)[],
  width: number,
  height: number,
  tool: KlTool,
  index: number,
): { readonly remove: readonly number[]; readonly change: readonly number[] } | KlReason {
  const r = Math.floor(index / width);
  const c = index % width;
  const filled = (xs: number[]) => xs.filter((i) => cells[i]);
  const all = (pred: (i: number) => boolean) => filled(cells.map((_, i) => i).filter(pred));
  switch (tool) {
    case "kim": {
      const remove = all((i) => Math.floor(i / width) === r);
      return remove.length ? { remove, change: [] } : "empty";
    }
    case "thuy": {
      const remove = all((i) => i % width === c);
      return remove.length ? { remove, change: [] } : "empty";
    }
    case "hoa": {
      const remove = filled(thunderArea(index, width, height));
      return remove.length ? { remove, change: [] } : "empty";
    }
    case "tho": {
      const remove = all((i) => Math.floor(i / width) === height - 1);
      return remove.length ? { remove, change: [] } : "empty";
    }
    case "loi": {
      const kind = cells[index]?.kind;
      if (!kind) return "empty";
      return { remove: all((i) => cells[i]?.kind === kind), change: [] };
    }
    case "moc": {
      if (!cells[index]) return "empty";
      return mocTarget(cells, width, height, index) ? { remove: [], change: [index] } : "noTarget";
    }
    case "phong": {
      if (!isWhirlCenter(index, width, height)) return "edge";
      return { remove: [], change: ringOf(index, width) };
    }
  }
}

/** Mộc Linh: hệ mới của quân index là hệ của khối lớn nhất kề nó (khác hệ hiện tại). */
function mocTarget(cells: readonly (KlCell | null)[], width: number, height: number, index: number): Element | null {
  const cell = cells[index];
  if (!cell) return null;
  let best: Element | null = null;
  let size = 0;
  for (const n of neighbors(index, width, height)) {
    const k = cells[n]?.kind;
    if (!k || k === cell.kind) continue;
    const g = groupAt(cells, width, height, n).length;
    if (g > size) {
      size = g;
      best = k;
    }
  }
  return best;
}

/** Tích các ô số trong khối (1 nếu không có). */
export function groupMult(cells: readonly (KlCell | null)[], group: readonly number[]): number {
  return group.reduce((m, i) => m * (cells[i]?.mult ?? 1), 1);
}

/** Sau mỗi nước: bàn sạch hoặc hết nhóm mà cũng hết đạo cụ thì tự kết thúc màn; hết nhóm còn đạo cụ thì "bế tắc". */
function afterMove(s: KlState, events: KlEvent[]): KlState {
  const left = tilesLeft(s.cells);
  if (left > 0 && hasGroup(s.cells, s.width, s.height)) return { ...s, phase: "playing" };
  if (left > 0 && hasTools(s)) return { ...s, phase: "stuck" };
  return s.mode === "timed" ? passTimed(s, events) : finishLevel(s, events);
}

/** Cấp tốc: hết bàn (hoặc người chơi kết thúc màn) thì tính thưởng dọn sạch, báo số giây cộng/trừ, chia ngay bàn màn sau. */
function passTimed(s: KlState, events: KlEvent[]): KlState {
  const left = tilesLeft(s.cells);
  const bonus = left === 0 ? clearBonus(s.level) : 0;
  const level = s.level + 1;
  events.push({ type: "levelPassed", level, cleared: left === 0, left, bonus, seconds: timedSeconds(left) });
  const { cells, nextId } = generateBoard(s.seed, level, s.nextId, s.width, s.height);
  return { ...s, score: s.score + bonus, level, cells, nextId, deal: 0, undo: KL_UNDO_PER_LEVEL, phase: "playing", summary: null, prev: null };
}

/** Thường: dọn sạch thì thưởng điểm và tim; còn quân sót thì mỗi quân trừ 1 tim, không đủ tim đỡ thì hết ván. */
function finishLevel(s: KlState, events: KlEvent[]): KlState {
  const left = tilesLeft(s.cells);
  const cleared = left === 0;
  const bonus = cleared ? clearBonus(s.level) : 0;
  const lost = cleared ? -KL_CLEAR_HEARTS : left;
  const dead = left > s.hearts;
  const summary: KlLevelSummary = { level: s.level, cleared, left, bonus, hearts: lost };
  events.push({ type: "levelDone", summary });
  if (dead) events.push({ type: "over" });
  const done: KlState = { ...s, score: s.score + bonus, hearts: dead ? s.hearts : s.hearts - lost, summary, phase: dead ? "over" : "levelDone", prev: null };
  // Shan 21/11/2026: dọn sạch thì tự sang màn sau, không hiện bảng hỏi; còn quân sót mới hiện bảng kết màn (báo tim mất).
  return cleared ? nextLevel(done, events) : done;
}

function nextLevel(s: KlState, events: KlEvent[]): KlState {
  const level = s.level + 1;
  const { cells, nextId } = generateBoard(s.seed, level, s.nextId, s.width, s.height);
  events.push({ type: "newLevel", level });
  return { ...s, level, cells, nextId, deal: 0, undo: KL_UNDO_PER_LEVEL, phase: "playing", summary: null, prev: null };
}

const inBounds = (s: KlState, i: number) => Number.isInteger(i) && i >= 0 && i < s.width * s.height;
const withPrev = (s: KlState): KlState => ({ ...s, prev: null });

export function transition(state: KlState, action: KlAction): KlResult {
  const events: KlEvent[] = [];
  const active = state.phase === "playing" || state.phase === "stuck";
  switch (action.type) {
    case "pick": {
      if (!active) return { ok: false, reason: "notPlaying" };
      if (!inBounds(state, action.index)) return { ok: false, reason: "outOfBounds" };
      if (!state.cells[action.index]) return { ok: false, reason: "empty" };
      const group = groupAt(state.cells, state.width, state.height, action.index);
      if (group.length < KL_MIN_GROUP) return { ok: false, reason: "single" };
      const gained = groupScore(group.length, groupMult(state.cells, group));
      const cells = state.cells.slice();
      for (const i of group) cells[i] = null;
      events.push({ type: "removed", cells: group, gained });
      const next = addCharge(
        { ...state, cells: settle(cells, state.width, state.height), score: state.score + gained, moves: state.moves + 1, prev: withPrev(state) },
        state.cells[action.index]!.kind,
        group.length,
        events,
      );
      return { ok: true, state: afterMove(next, events), events };
    }
    case "tool": {
      if (!active) return { ok: false, reason: "notPlaying" };
      if (!inBounds(state, action.index)) return { ok: false, reason: "outOfBounds" };
      if (!(ELEMENTS as readonly string[]).includes(action.tool) || state.tools[action.tool] <= 0) return { ok: false, reason: "noTool" };
      const t = toolTargets(state.cells, state.width, state.height, action.tool, action.index);
      if (typeof t === "string") return { ok: false, reason: t };
      const cells = state.cells.slice();
      if (action.tool === "phong") {
        const ring = ringOf(action.index, state.width);
        ring.forEach((to, k) => (cells[to] = state.cells[ring[(k + ring.length - 1) % ring.length] as number] ?? null));
      } else if (action.tool === "moc") {
        const kind = mocTarget(state.cells, state.width, state.height, action.index) as Element;
        cells[action.index] = { ...(state.cells[action.index] as KlCell), kind };
      } else {
        for (const i of t.remove) cells[i] = null;
      }
      events.push({ type: "toolUsed", tool: action.tool, index: action.index, removed: t.remove });
      const next: KlState = {
        ...state,
        cells: settle(cells, state.width, state.height),
        tools: { ...state.tools, [action.tool]: state.tools[action.tool] - 1 },
        moves: state.moves + 1,
        prev: withPrev(state),
      };
      return { ok: true, state: afterMove(next, events), events };
    }
    case "undo": {
      if (!active || !state.prev) return { ok: false, reason: "noUndo" };
      if (state.undo <= 0) return { ok: false, reason: "noUndo" };
      events.push({ type: "undone" });
      return { ok: true, state: { ...state.prev, undo: state.undo - 1, prev: null }, events };
    }
    case "endLevel": {
      if (!active) return { ok: false, reason: "notPlaying" };
      return { ok: true, state: state.mode === "timed" ? passTimed(state, events) : finishLevel(state, events), events };
    }
    case "timeUp": {
      if (state.mode !== "timed" || state.phase === "over") return { ok: false, reason: "notPlaying" };
      events.push({ type: "timeUp" }, { type: "over" });
      return { ok: true, state: { ...state, phase: "over", prev: null }, events };
    }
    case "surrender": {
      if (state.phase === "over") return { ok: false, reason: "notPlaying" };
      events.push({ type: "surrender" }, { type: "over" });
      return { ok: true, state: { ...state, phase: "over", summary: null, prev: null }, events };
    }
    case "nextLevel": {
      if (state.phase !== "levelDone" || state.mode === "timed") return { ok: false, reason: "notPlaying" };
      return { ok: true, state: nextLevel(state, events), events };
    }
  }
}

/** Lưu ván: bỏ bước hoàn tác để chuỗi gọn. */
export function serializeGame(state: KlState): string {
  return JSON.stringify({ ...state, prev: null });
}

const isCell = (v: unknown): v is KlCell | null =>
  v === null ||
  (typeof v === "object" &&
    v !== null &&
    Number.isInteger((v as KlCell).id) &&
    (ELEMENTS as readonly string[]).includes((v as KlCell).kind) &&
    ((v as KlCell).mult === undefined || (v as KlCell).mult === 2 || (v as KlCell).mult === 3));

/** Bản lưu trước 20/11/2026 ghi ô hào quang là banner: true, nay là ô ×2. */
const upgradeCell = (v: unknown): unknown => {
  if (!v || typeof v !== "object" || !("banner" in v)) return v;
  const { banner, ...rest } = v as Record<string, unknown>;
  return banner === true ? { ...rest, mult: 2 } : rest;
};

/** Đọc lại ván đã lưu; dữ liệu hỏng hoặc khác phiên bản trả về null. */
export function parseGame(text: string | null): KlState | null {
  if (!text) return null;
  try {
    const v = JSON.parse(text) as Partial<KlState>;
    const phases: KlPhase[] = ["playing", "stuck", "levelDone", "over"];
    const num = (x: unknown) => typeof x === "number" && Number.isFinite(x) && x >= 0;
    if (v.version !== 1 || !num(v.seed) || !num(v.level) || !num(v.score) || !num(v.moves) || !num(v.undo) || !num(v.nextId)) return null;
    if (!Number.isInteger(v.width) || !Number.isInteger(v.height) || (v.width as number) < 3 || (v.height as number) < 3) return null;
    const cells = Array.isArray(v.cells) ? v.cells.map(upgradeCell) : null;
    if (!cells || cells.length !== (v.width as number) * (v.height as number) || !cells.every(isCell)) return null;
    // Bản lưu trước 20/11/2026 có Lốc/Sấm: Lốc thành Lốc Phong, Sấm thành Hỏa Cầu (cùng vùng 3×3).
    const rawTools = (v.tools ?? {}) as Record<string, unknown>;
    const legacy = "whirl" in rawTools || "thunder" in rawTools;
    const tools = noTools();
    for (const e of ELEMENTS) if (num(rawTools[e])) tools[e] = rawTools[e] as number;
    if (legacy) {
      tools.phong = num(rawTools.whirl) ? (rawTools.whirl as number) : 0;
      tools.hoa = num(rawTools.thunder) ? (rawTools.thunder as number) : 0;
    }
    if (!phases.includes(v.phase as KlPhase)) return null;
    const mode: KlMode = v.mode === "timed" ? "timed" : "classic";
    const rawCharge = (v.charge ?? {}) as Record<string, unknown>;
    const charge = noTools();
    for (const e of ELEMENTS) if (num(rawCharge[e])) charge[e] = Math.min(KL_TOOL_CHARGE, rawCharge[e] as number);
    const deal = num(v.deal) ? (v.deal as number) : 0;
    // Bản lưu trước khi có tim: cho đủ tim ban đầu.
    const hearts = num(v.hearts) ? (v.hearts as number) : KL_START_HEARTS;
    return { ...(v as KlState), cells, mode, hearts, tools, charge, deal, summary: v.summary ?? null, prev: null };
  } catch {
    return null;
  }
}
