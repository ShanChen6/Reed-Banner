// Do Thám: giải đố dò bẫy trên sa bàn, luật ở docs/02-game-modes/do-tham/gdd.md.
// Mở ô để biết số bẫy quanh nó, cắm cờ lau lên ô nghi có bẫy, mở hết ô an toàn là thắng. Bàn chỉ được đặt bẫy ở
// nước mở đầu tiên (ô đầu và 8 ô quanh luôn an toàn) và được chọn để suy luận được từ đầu đến cuối, không phải đoán.
// Logic thuần, không đọc đồng hồ; mọi ngẫu nhiên đi qua seed (src/core/rng.ts) nên một ván phát lại được.

import { createRng } from "../rng";
import { ELEMENTS, type Element } from "../battle/elements";

export type DtLevel = "nhapMon" | "thuong" | "kho";

export interface DtLevelConfig {
  readonly width: number;
  readonly height: number;
  readonly mines: number;
}

/** Ba bậc theo cỡ kinh điển: 9×9 với 10 bẫy, 16×16 với 40 bẫy, 30×16 với 99 bẫy. */
export const DT_LEVELS: Readonly<Record<DtLevel, DtLevelConfig>> = {
  nhapMon: { width: 9, height: 9, mines: 10 },
  thuong: { width: 16, height: 16, mines: 40 },
  kho: { width: 30, height: 16, mines: 99 },
};

export const DT_LEVEL_ORDER: readonly DtLevel[] = ["nhapMon", "thuong", "kho"];

/** Số đạo cụ nguyên tố mang vào mỗi ván; mỗi đạo cụ dùng một lần. */
export const DT_ITEM_PICKS = 2;

/** Số lần thử đặt bẫy lại để có bàn suy luận được; hết số lần thì dùng bàn cuối và đánh dấu `guessFree: false`. */
export const DT_MAX_ATTEMPTS = 600;

export type DtCell = "hidden" | "open" | "flag";
export type DtPhase = "ready" | "playing" | "won" | "lost";

export interface DtItemSlot {
  readonly element: Element;
  readonly used: boolean;
}

export type DtInfo =
  | { readonly kind: "area"; readonly index: number; readonly count: number }
  | { readonly kind: "line"; readonly axis: "row" | "col"; readonly at: number; readonly count: number }
  | { readonly kind: "hint"; readonly index: number; readonly certain: "safe" | "mine" };

export interface DtState {
  readonly version: 1;
  readonly level: DtLevel;
  readonly seed: number;
  readonly width: number;
  readonly height: number;
  readonly mines: number;
  readonly phase: DtPhase;
  /** Vị trí bẫy; null cho tới nước mở đầu tiên. */
  readonly trap: readonly boolean[] | null;
  /** Số bẫy quanh mỗi ô; null cho tới nước mở đầu tiên. */
  readonly counts: readonly number[] | null;
  readonly cells: readonly DtCell[];
  readonly moves: number;
  readonly items: readonly DtItemSlot[];
  /** Khiên đất của hệ Thổ: chưa dùng, đang giữ, đã đỡ một lần sa bẫy. */
  readonly shield: "none" | "active" | "spent";
  /** Ô bẫy làm thua ván. */
  readonly hit: number | null;
  /** Bàn có suy luận được hết không; false khi hết số lần thử mà vẫn chưa ra bàn như vậy. */
  readonly guessFree: boolean;
  /** Thông tin vừa nhận từ đạo cụ, mất ở nước kế tiếp. */
  readonly info: DtInfo | null;
}

export type DtAction =
  | { readonly type: "open"; readonly index: number }
  | { readonly type: "flag"; readonly index: number }
  | { readonly type: "chord"; readonly index: number }
  | { readonly type: "item"; readonly element: Element; readonly index?: number; readonly axis?: "row" | "col" };

export type DtReason =
  | "notPlaying"
  | "outOfBounds"
  | "flagged"
  | "alreadyOpen"
  | "notOpen"
  | "chordMismatch"
  | "noItem"
  | "used"
  | "needTarget"
  | "notStarted"
  | "noHint"
  | "noTarget";

export type DtResult =
  | { readonly ok: true; readonly state: DtState }
  | { readonly ok: false; readonly reason: DtReason };

/** Các ô kề (8 hướng) của một ô. */
export function neighbors(index: number, width: number, height: number): number[] {
  const x = index % width;
  const y = Math.floor(index / width);
  const out: number[] = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) out.push(ny * width + nx);
    }
  }
  return out;
}

const mix = (seed: number, salt: number): number => (seed ^ Math.imul(salt + 1, 0x9e3779b1)) >>> 0;

// ---------------------------------------------------------------------------------------------------------------------
// Suy luận
// ---------------------------------------------------------------------------------------------------------------------

/** Góc nhìn của người dò: -1 ô chưa mở chưa biết, -2 ô đã biết có bẫy, từ 0 là số đã hiện trên ô mở. */
export type DtView = readonly number[];

export interface DtDeduction {
  readonly safe: readonly number[];
  readonly mine: readonly number[];
}

interface Constraint {
  readonly cells: readonly number[];
  readonly rem: number;
}

/**
 * Tìm các ô chắc chắn an toàn hoặc chắc chắn có bẫy từ những gì đang hiện trên bàn. Dùng ba luật: ô số đã đủ bẫy hoặc chỉ còn
 * bấy nhiêu ô trống; hai ô số mà ô trống của ô này nằm trọn trong ô kia (hiệu số bẫy suy ra phần còn lại); tổng số bẫy.
 */
export function deduce(width: number, height: number, view: DtView, totalMines: number): DtDeduction {
  const safe = new Set<number>();
  const mine = new Set<number>();
  const constraints: Constraint[] = [];
  for (let i = 0; i < view.length; i++) {
    const v = view[i] as number;
    if (v < 0) continue;
    const unknown: number[] = [];
    let known = 0;
    for (const n of neighbors(i, width, height)) {
      const nv = view[n] as number;
      if (nv === -1) unknown.push(n);
      else if (nv === -2) known++;
    }
    if (unknown.length === 0) continue;
    const rem = v - known;
    if (rem < 0 || rem > unknown.length) continue;
    constraints.push({ cells: unknown, rem });
    if (rem === 0) unknown.forEach((c) => safe.add(c));
    else if (rem === unknown.length) unknown.forEach((c) => mine.add(c));
  }
  if (safe.size === 0 && mine.size === 0) {
    const byCell = new Map<number, number[]>();
    constraints.forEach((c, ci) => c.cells.forEach((cell) => byCell.set(cell, [...(byCell.get(cell) ?? []), ci])));
    for (let a = 0; a < constraints.length; a++) {
      const A = constraints[a] as Constraint;
      const rivals = byCell.get(A.cells[0] as number) ?? [];
      for (const b of rivals) {
        if (b === a) continue;
        const B = constraints[b] as Constraint;
        if (B.cells.length <= A.cells.length) continue;
        const inB = new Set(B.cells);
        if (!A.cells.every((c) => inB.has(c))) continue;
        const inA = new Set(A.cells);
        const rest = B.cells.filter((c) => !inA.has(c));
        const diff = B.rem - A.rem;
        if (diff === 0) rest.forEach((c) => safe.add(c));
        else if (diff === rest.length) rest.forEach((c) => mine.add(c));
      }
    }
  }
  if (safe.size === 0 && mine.size === 0) {
    let unknown = 0;
    let known = 0;
    for (const v of view) {
      if (v === -1) unknown++;
      else if (v === -2) known++;
    }
    const left = totalMines - known;
    if (unknown > 0 && (left === 0 || left === unknown)) {
      const into = left === 0 ? safe : mine;
      for (let i = 0; i < view.length; i++) if (view[i] === -1) into.add(i);
    }
  }
  return { safe: [...safe], mine: [...mine] };
}

/**
 * Như `deduce` nhưng lặp lại: bẫy suy ra được ở bước trước tính vào bước sau, tới khi ra ô an toàn hoặc hết suy luận.
 * Trả về mọi bẫy đã suy ra và các ô an toàn tìm được.
 */
export function deduceClosure(width: number, height: number, view: DtView, totalMines: number): DtDeduction {
  const work = [...view];
  const mines = new Set<number>();
  for (;;) {
    const d = deduce(width, height, work, totalMines);
    const fresh = d.mine.filter((i) => work[i] === -1);
    if (d.safe.length > 0) return { safe: d.safe, mine: [...new Set([...mines, ...fresh])] };
    if (fresh.length === 0) return { safe: [], mine: [...mines] };
    for (const i of fresh) {
      work[i] = -2;
      mines.add(i);
    }
  }
}

/** Đếm bẫy quanh từng ô. */
export function countAround(trap: readonly boolean[], width: number, height: number): number[] {
  return trap.map((_, i) => neighbors(i, width, height).reduce((n, c) => n + (trap[c] ? 1 : 0), 0));
}

/** Giả lập người dò chỉ dùng suy luận từ nước mở đầu: bàn có giải được không cần đoán. */
export function isGuessFree(trap: readonly boolean[], width: number, height: number, mines: number, first: number): boolean {
  const counts = countAround(trap, width, height);
  const view: number[] = new Array<number>(trap.length).fill(-1);
  const open = (start: number): boolean => {
    const stack = [start];
    while (stack.length > 0) {
      const i = stack.pop() as number;
      if (view[i] !== -1) continue;
      if (trap[i]) return false;
      view[i] = counts[i] as number;
      if (counts[i] === 0) stack.push(...neighbors(i, width, height));
    }
    return true;
  };
  if (!open(first)) return false;
  for (;;) {
    const d = deduce(width, height, view, mines);
    if (d.safe.length === 0 && d.mine.length === 0) break;
    for (const i of d.mine) {
      if (!trap[i]) return false;
      view[i] = -2;
    }
    for (const i of d.safe) if (!open(i)) return false;
  }
  return view.every((v, i) => trap[i] || v >= 0);
}

export interface DtLayout {
  readonly trap: readonly boolean[];
  readonly guessFree: boolean;
  readonly attempts: number;
}

/** Đặt bẫy cho một lần thử: ô đầu và 8 ô quanh luôn an toàn. */
function placeTraps(seed: number, attempt: number, width: number, height: number, mines: number, first: number): boolean[] {
  const rng = createRng(mix(seed, attempt));
  const blocked = new Set([first, ...neighbors(first, width, height)]);
  const pool: number[] = [];
  for (let i = 0; i < width * height; i++) if (!blocked.has(i)) pool.push(i);
  for (let k = 0; k < mines; k++) {
    const j = rng.int(k, pool.length - 1);
    const t = pool[k] as number;
    pool[k] = pool[j] as number;
    pool[j] = t;
  }
  const trap: boolean[] = new Array<boolean>(width * height).fill(false);
  for (let k = 0; k < mines; k++) trap[pool[k] as number] = true;
  return trap;
}

/** Sinh bàn từ seed và ô mở đầu: thử đặt lại tới khi bàn suy luận được. Cùng seed và ô đầu thì ra cùng một bàn. */
export function generateLayout(seed: number, width: number, height: number, mines: number, first: number, guessFree = true): DtLayout {
  let trap: boolean[] = [];
  for (let attempt = 0; attempt < DT_MAX_ATTEMPTS; attempt++) {
    trap = placeTraps(seed, attempt, width, height, mines, first);
    if (!guessFree) return { trap, guessFree: false, attempts: attempt + 1 };
    if (isGuessFree(trap, width, height, mines, first)) return { trap, guessFree: true, attempts: attempt + 1 };
  }
  return { trap, guessFree: false, attempts: DT_MAX_ATTEMPTS };
}

// ---------------------------------------------------------------------------------------------------------------------
// Ván chơi
// ---------------------------------------------------------------------------------------------------------------------

/** Ván mới ở một bậc, mang theo tối đa `DT_ITEM_PICKS` đạo cụ nguyên tố khác nhau. */
export function newGame(level: DtLevel, seed: number, picks: readonly Element[] = []): DtState {
  const { width, height, mines } = DT_LEVELS[level];
  const chosen = [...new Set(picks)].filter((e) => ELEMENTS.includes(e)).slice(0, DT_ITEM_PICKS);
  return {
    version: 1,
    level,
    seed: seed >>> 0,
    width,
    height,
    mines,
    phase: "ready",
    trap: null,
    counts: null,
    cells: new Array<DtCell>(width * height).fill("hidden"),
    moves: 0,
    items: chosen.map((element) => ({ element, used: false })),
    shield: "none",
    hit: null,
    guessFree: true,
    info: null,
  };
}

/** Góc nhìn hiện tại của ván: dùng cho hướng dẫn nước chắc chắn và cho giao diện. Cờ không được tin. */
export function viewOf(state: DtState): number[] {
  const { counts } = state;
  return state.cells.map((c, i) => (c === "open" && counts ? (counts[i] as number) : -1));
}

export const flagsOf = (state: Pick<DtState, "cells">): number => state.cells.filter((c) => c === "flag").length;
export const openedOf = (state: Pick<DtState, "cells">): number => state.cells.filter((c) => c === "open").length;

export const isOver = (state: Pick<DtState, "phase">): boolean => state.phase === "won" || state.phase === "lost";

interface Work {
  readonly state: DtState;
  cells: DtCell[];
  hit: number | null;
  shield: DtState["shield"];
}

const begin = (state: DtState): Work => ({ state, cells: [...state.cells], hit: null, shield: state.shield });

/** Mở một ô và lan ra theo ô số 0. Trúng bẫy thì thua, trừ khi khiên đất còn. Trả về true nếu ván vẫn tiếp tục. */
function reveal(w: Work, start: number): boolean {
  const { trap, counts, width, height } = w.state;
  const stack = [start];
  while (stack.length > 0) {
    const i = stack.pop() as number;
    if (w.cells[i] === "open") continue;
    if (w.cells[i] === "flag" && i !== start) continue;
    if (trap?.[i]) {
      if (w.shield === "active") {
        w.shield = "spent";
        w.cells[i] = "flag";
        continue;
      }
      w.hit = i;
      return false;
    }
    w.cells[i] = "open";
    if (counts?.[i] === 0) stack.push(...neighbors(i, width, height));
  }
  return true;
}

function finish(w: Work, extra: Partial<DtState> = {}): DtState {
  const s = w.state;
  const trap = s.trap;
  let cells = w.cells;
  let phase: DtPhase = w.hit !== null ? "lost" : s.phase === "ready" && trap ? "playing" : s.phase;
  if (phase === "playing" && trap) {
    const cleared = cells.every((c, i) => trap[i] || c === "open");
    if (cleared) {
      phase = "won";
      cells = cells.map((c, i) => (trap[i] ? "flag" : c));
    }
  }
  return { ...s, cells, phase, hit: w.hit, shield: w.shield, info: null, ...extra };
}

const inside = (s: DtState, index: number | undefined): index is number =>
  index !== undefined && Number.isInteger(index) && index >= 0 && index < s.width * s.height;

function startIfNeeded(state: DtState, first: number): DtState {
  if (state.trap) return state;
  const layout = generateLayout(state.seed, state.width, state.height, state.mines, first);
  return {
    ...state,
    trap: layout.trap,
    counts: countAround(layout.trap, state.width, state.height),
    guessFree: layout.guessFree,
  };
}

function area(s: DtState, center: number): number[] {
  return [center, ...neighbors(center, s.width, s.height)];
}

function itemOf(s: DtState, element: Element): DtItemSlot | undefined {
  return s.items.find((it) => it.element === element);
}

function markItem(s: DtState, element: Element, used: boolean): readonly DtItemSlot[] {
  return s.items.map((it) => (it.element === element ? { ...it, used } : it));
}

function applyItem(state: DtState, a: Extract<DtAction, { type: "item" }>): DtResult {
  const slot = itemOf(state, a.element);
  if (!slot) return { ok: false, reason: "noItem" };
  if (slot.used) return { ok: false, reason: "used" };
  if (state.phase !== "playing" && !(a.element === "tho" && state.phase === "ready")) {
    return { ok: false, reason: state.phase === "ready" ? "notStarted" : "notPlaying" };
  }
  const items = markItem(state, a.element, true);
  const trap = state.trap;
  switch (a.element) {
    case "tho":
      return { ok: true, state: { ...state, items, shield: "active", info: null } };
    case "kim": {
      if (!trap) return { ok: false, reason: "notStarted" };
      const hidden = state.cells.flatMap((c, i) => (c === "hidden" && trap[i] ? [i] : []));
      if (hidden.length === 0) return { ok: false, reason: "noTarget" };
      const edge = hidden.filter((i) => neighbors(i, state.width, state.height).some((n) => state.cells[n] === "open"));
      const pool = edge.length > 0 ? edge : hidden;
      const rng = createRng(mix(state.seed, 1000 + state.moves));
      const pick = pool[rng.int(0, pool.length - 1)] as number;
      const w = begin(state);
      w.cells[pick] = "flag";
      return { ok: true, state: finish(w, { items, moves: state.moves + 1 }) };
    }
    case "moc": {
      if (!inside(state, a.index)) return { ok: false, reason: a.index === undefined ? "needTarget" : "outOfBounds" };
      if (state.cells[a.index] !== "hidden") return { ok: false, reason: state.cells[a.index] === "flag" ? "flagged" : "alreadyOpen" };
      const w = begin(state);
      if (trap?.[a.index]) w.cells[a.index] = "flag";
      else reveal(w, a.index);
      return { ok: true, state: finish(w, { items, moves: state.moves + 1 }) };
    }
    case "hoa": {
      if (!inside(state, a.index)) return { ok: false, reason: a.index === undefined ? "needTarget" : "outOfBounds" };
      const w = begin(state);
      for (const i of area(state, a.index)) {
        if (w.cells[i] === "open") continue;
        if (trap?.[i]) w.cells[i] = "flag";
        else {
          w.cells[i] = "hidden";
          reveal(w, i);
        }
      }
      return { ok: true, state: finish(w, { items, moves: state.moves + 1 }) };
    }
    case "thuy": {
      if (!inside(state, a.index)) return { ok: false, reason: a.index === undefined ? "needTarget" : "outOfBounds" };
      const count = area(state, a.index).filter((i) => trap?.[i]).length;
      return { ok: true, state: { ...state, items, info: { kind: "area", index: a.index, count } } };
    }
    case "loi": {
      if (!inside(state, a.index) || !a.axis) return { ok: false, reason: "needTarget" };
      const at = a.axis === "row" ? Math.floor(a.index / state.width) : a.index % state.width;
      let count = 0;
      if (a.axis === "row") for (let x = 0; x < state.width; x++) count += trap?.[at * state.width + x] ? 1 : 0;
      else for (let y = 0; y < state.height; y++) count += trap?.[y * state.width + at] ? 1 : 0;
      return { ok: true, state: { ...state, items, info: { kind: "line", axis: a.axis, at, count } } };
    }
    case "phong": {
      const d = deduceClosure(state.width, state.height, viewOf(state), state.mines);
      const safe = d.safe.find((i) => state.cells[i] !== "flag") ?? d.safe[0];
      if (safe !== undefined) return { ok: true, state: { ...state, items, info: { kind: "hint", index: safe, certain: "safe" } } };
      const trapCell = d.mine.find((i) => state.cells[i] !== "flag");
      if (trapCell === undefined) return { ok: false, reason: "noHint" };
      return { ok: true, state: { ...state, items, info: { kind: "hint", index: trapCell, certain: "mine" } } };
    }
    default:
      return { ok: false, reason: "noItem" };
  }
}

/** Đạo cụ cần chọn ô hoặc hàng/cột trước khi dùng. */
export const DT_ITEM_TARGET: Readonly<Record<Element, "none" | "cell" | "line">> = {
  kim: "none",
  moc: "cell",
  thuy: "cell",
  hoa: "cell",
  tho: "none",
  loi: "line",
  phong: "none",
};

export function dtAct(state: DtState, action: DtAction): DtResult {
  if (isOver(state)) return { ok: false, reason: "notPlaying" };
  if (action.type === "item") return applyItem(state, action);
  if (!inside(state, action.index)) return { ok: false, reason: "outOfBounds" };
  const index = action.index;
  const cell = state.cells[index] as DtCell;
  if (action.type === "flag") {
    if (cell === "open") return { ok: false, reason: "alreadyOpen" };
    const w = begin(state);
    w.cells[index] = cell === "flag" ? "hidden" : "flag";
    return { ok: true, state: { ...finish(w), moves: state.moves } };
  }
  if (action.type === "open") {
    if (cell === "flag") return { ok: false, reason: "flagged" };
    if (cell === "open") return { ok: false, reason: "alreadyOpen" };
    const started = startIfNeeded(state, index);
    const w = begin(started);
    reveal(w, index);
    return { ok: true, state: finish(w, { moves: state.moves + 1 }) };
  }
  // Mở nhanh: ô số đã đủ cờ xung quanh thì mở nốt các ô còn lại.
  if (cell !== "open" || !state.counts) return { ok: false, reason: "notOpen" };
  const around = neighbors(index, state.width, state.height);
  const flags = around.filter((n) => state.cells[n] === "flag").length;
  if (flags !== state.counts[index]) return { ok: false, reason: "chordMismatch" };
  const w = begin(state);
  for (const n of around) {
    if (w.cells[n] !== "hidden") continue;
    if (!reveal(w, n)) break;
  }
  return { ok: true, state: finish(w, { moves: state.moves + 1 }) };
}
