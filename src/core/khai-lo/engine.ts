// Khai Lộ: mini game xóa khối ô ngọc, luật ở docs/02-game-modes/khai-lo/gdd.md.
// Chạm một ô thuộc nhóm từ 2 ô cùng loại liền cạnh: cả nhóm biến mất, ô phía trên rơi xuống, cột trống thì các cột bên
// phải dồn sang trái. Không có ô mới rơi vào, nên mỗi bàn là một bài toán tất định theo seed. Logic thuần, không đọc giờ:
// Cấp tốc do giao diện đếm giờ, hết giờ thì gửi "timeUp".

import { createRng, type Rng } from "../rng";
import { ELEMENTS, type Element } from "../battle/elements";

export const KL_WIDTH = 10;
export const KL_HEIGHT = 8;
/** Quân lực ban đầu; hết màn, mỗi ô còn sót trừ 1. Về 0 là hết ván. */
export const KL_START_TROOPS = 30;
/** Dọn sạch bàn: cộng quân lực và điểm thưởng (300 + 50 × màn). Cân bằng 20/11/2026: thưởng nhỏ lại để điểm gom khối
 *  (n²) quyết định thứ hạng, trước đây thưởng dọn sạch chiếm 84% tổng điểm. */
export const KL_CLEAR_TROOPS = 4;
export const KL_CLEAR_BONUS_BASE = 300;
export const KL_CLEAR_BONUS_PER_LEVEL = 50;
/** Gần sạch: còn tối đa 3 quân vẫn được thưởng nhỏ (quân lực vẫn trừ theo quân còn lại). */
export const KL_NEAR_CLEAR_LEFT = 3;
export const KL_NEAR_CLEAR_BONUS = 100;
/** Mỗi loại đạo cụ giữ tối đa 5 (trước là 9): tránh dồn kho kéo ván quá dài. */
export const KL_MAX_TOOLS = 5;
/** Thanh nạp đạo cụ (Shan 20/11/2026): điểm gom khối nạp đồng thời hai thanh, đầy thanh thì được 1 đạo cụ loại đó.
 *  Thưởng dọn sạch và thưởng gần sạch không nạp, để đạo cụ đến từ việc gom khối to. */
export const KL_TOOL_CHARGE: Readonly<Record<KlTool, number>> = { whirl: 800, thunder: 1200 };
export const KL_START_TOOLS: Readonly<Record<KlTool, number>> = { whirl: 1, thunder: 1 };
/** Lượt hoàn tác mỗi màn (không cộng dồn sang màn sau). */
export const KL_UNDO_PER_LEVEL = 1;
export const KL_MIN_GROUP = 2;

export type KlTool = "whirl" | "thunder";

/** Thưởng điểm khi dọn sạch bàn ở màn này. */
export function clearBonus(level: number): number {
  return KL_CLEAR_BONUS_BASE + KL_CLEAR_BONUS_PER_LEVEL * level;
}


/** Thường: không giới hạn thời gian, hết khối thì hết màn và trừ quân lực.
 *  Cấp tốc (Shan 20/11/2026): mỗi bậc có một mốc điểm; đạt mốc thì lên bậc, giờ còn lại cộng dồn thêm giờ của bậc mới.
 *  Bàn dọn sạch hoặc hết đường thì chia bàn mới cùng bậc. Hết giờ là hết ván; không dùng quân lực. */
export type KlMode = "classic" | "timed";
/** Cấp tốc: giờ lúc bắt đầu ván và giờ cộng thêm mỗi lần lên bậc (giây). */
export const KL_TIMED_START_SECONDS = 90;
export const KL_TIMED_LEVEL_SECONDS = 40;
/** Cấp tốc: điểm cần thêm để qua bậc n là 400 + 50 × (n − 1). */
export const KL_TIMED_GOAL_BASE = 400;
export const KL_TIMED_GOAL_STEP = 50;

/** Cấp tốc: tổng điểm cần đạt để qua bậc này (mốc cộng dồn từ đầu ván). */
export function timedGoal(level: number): number {
  return KL_TIMED_GOAL_BASE * level + (KL_TIMED_GOAL_STEP * level * (level - 1)) / 2;
}

export interface KlCell {
  /** Mã riêng của ô, giữ nguyên khi ô rơi/dồn để giao diện làm hoạt ảnh. */
  readonly id: number;
  /** Quân nguyên tố (7 hệ của game), mỗi hệ một màu riêng. */
  readonly kind: Element;
  /** Ô hào quang: nhóm chứa nó được nhân điểm (×1 thêm cho mỗi ô hào quang). */
  readonly banner?: true;
}

export type KlPhase = "playing" | "stuck" | "levelDone" | "over";

export interface KlLevelSummary {
  readonly level: number;
  readonly cleared: boolean;
  readonly left: number;
  readonly bonus: number;
  readonly troopsDelta: number;
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
  readonly troops: number;
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
  | { readonly type: "whirl"; readonly index: number }
  | { readonly type: "thunder"; readonly index: number }
  | { readonly type: "undo" }
  /** Thường: kết thúc màn. Cấp tốc: bỏ bàn đang bế tắc, chia bàn mới cùng bậc. */
  | { readonly type: "endLevel" }
  | { readonly type: "nextLevel" }
  /** Cấp tốc: giao diện báo hết giờ. */
  | { readonly type: "timeUp" };

export type KlEvent =
  | { readonly type: "removed"; readonly cells: readonly number[]; readonly gained: number }
  | { readonly type: "whirled"; readonly center: number }
  | { readonly type: "thundered"; readonly cells: readonly number[] }
  | { readonly type: "undone" }
  | { readonly type: "levelDone"; readonly summary: KlLevelSummary }
  | { readonly type: "over" }
  | { readonly type: "newLevel"; readonly level: number }
  /** Đầy thanh nạp: +1 đạo cụ. */
  | { readonly type: "toolCharged"; readonly tool: KlTool }
  /** Cấp tốc: đạt mốc, lên bậc mới (giao diện cộng thêm KL_TIMED_LEVEL_SECONDS). */
  | { readonly type: "goalReached"; readonly level: number }
  /** Cấp tốc: chia bàn mới cùng bậc (bàn dọn sạch hoặc hết đường); cleared/left/bonus như kết màn. */
  | { readonly type: "redeal"; readonly cleared: boolean; readonly left: number; readonly bonus: number }
  | { readonly type: "timeUp" };

export type KlReason = "notPlaying" | "outOfBounds" | "empty" | "single" | "noTool" | "edge" | "noUndo" | "notStuck";

export type KlResult =
  | { readonly ok: true; readonly state: KlState; readonly events: readonly KlEvent[] }
  | { readonly ok: false; readonly reason: KlReason };

export interface KlLevelConfig {
  /** Số loại ô trên bàn: càng nhiều càng khó nối nhóm. */
  readonly kinds: number;
  readonly banners: number;
}

export function levelConfig(level: number): KlLevelConfig {
  const kinds = level <= 3 ? 3 : level <= 7 ? 4 : level <= 13 ? 5 : 6;
  const banners = level < 3 ? 0 : Math.min(4, 1 + Math.floor((level - 3) / 3));
  return { kinds, banners };
}

/** Điểm một nhóm n ô có b ô hào quang: n² × (1 + b). */
export function groupScore(size: number, banners: number): number {
  return size * size * (1 + banners);
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

/** Sinh bàn cho một màn: loại ô xáo theo seed, ô hào quang rải ngẫu nhiên. Luôn có ít nhất một nhóm chạm được. */
export function generateBoard(seed: number, level: number, firstId: number, width = KL_WIDTH, height = KL_HEIGHT, deal = 0): { cells: (KlCell | null)[]; nextId: number } {
  const rng = createRng(levelSeed(seed, level, deal));
  const { kinds, banners } = levelConfig(level);
  const pool = shuffled(ELEMENTS, rng).slice(0, kinds);
  for (;;) {
    let id = firstId;
    const cells: (KlCell | null)[] = Array.from({ length: width * height }, () => ({ id: id++, kind: pool[rng.int(0, pool.length - 1)] as Element }));
    const order = shuffled(
      cells.map((_, i) => i),
      rng,
    ).slice(0, banners);
    for (const i of order) cells[i] = { ...(cells[i] as KlCell), banner: true };
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
    troops: KL_START_TROOPS,
    tools: { ...KL_START_TOOLS },
    charge: { whirl: 0, thunder: 0 },
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

/** Điểm gom khối nạp vào hai thanh đạo cụ; đầy thanh thì +1 đạo cụ (kho đầy thì thanh dừng ở mức đầy). */
function addCharge(s: KlState, gained: number, events: KlEvent[]): KlState {
  const tools = { ...s.tools };
  const charge = { ...s.charge };
  for (const t of ["whirl", "thunder"] as const) {
    const need = KL_TOOL_CHARGE[t];
    let c = charge[t] + gained;
    while (c >= need && tools[t] < KL_MAX_TOOLS) {
      c -= need;
      tools[t] += 1;
      events.push({ type: "toolCharged", tool: t });
    }
    charge[t] = Math.min(c, need);
  }
  return { ...s, tools, charge };
}

const levelBonus = (level: number, left: number) => (left === 0 ? clearBonus(level) : left <= KL_NEAR_CLEAR_LEFT ? KL_NEAR_CLEAR_BONUS : 0);

/** Cấp tốc: chia bàn mới; level khác bậc hiện tại nghĩa là vừa lên bậc. */
function deal(s: KlState, level: number): KlState {
  const n = level === s.level ? s.deal + 1 : 0;
  const { cells, nextId } = generateBoard(s.seed, level, s.nextId, s.width, s.height, n);
  return { ...s, level, cells, nextId, deal: n, undo: level === s.level ? s.undo : KL_UNDO_PER_LEVEL, phase: "playing", prev: null };
}

/** Cấp tốc: đủ mốc thì lên bậc (có thể lên nhiều bậc một lúc), mỗi bậc một bàn mới. */
function checkGoal(s: KlState, events: KlEvent[]): KlState {
  let level = s.level;
  while (s.score >= timedGoal(level)) {
    level += 1;
    events.push({ type: "goalReached", level });
  }
  return level === s.level ? s : deal(s, level);
}

/** Sau mỗi nước: bàn sạch hoặc hết nhóm mà cũng hết đạo cụ thì tự kết thúc màn (Cấp tốc: chia bàn mới);
 *  hết nhóm còn đạo cụ thì "bế tắc". */
function afterMove(s: KlState, events: KlEvent[]): KlState {
  if (s.mode === "timed") {
    const leveled = checkGoal(s, events);
    if (leveled !== s) return leveled;
  }
  const left = tilesLeft(s.cells);
  if (left > 0 && hasGroup(s.cells, s.width, s.height)) return { ...s, phase: "playing" };
  if (left > 0 && s.tools.whirl + s.tools.thunder > 0) return { ...s, phase: "stuck" };
  return s.mode === "timed" ? redeal(s, events) : finishLevel(s, events);
}

/** Cấp tốc: bàn hết đường (hoặc người chơi bỏ bàn bế tắc) thì tính thưởng dọn sạch/gần sạch rồi chia bàn mới cùng bậc. */
function redeal(s: KlState, events: KlEvent[]): KlState {
  const left = tilesLeft(s.cells);
  const bonus = levelBonus(s.level, left);
  events.push({ type: "redeal", cleared: left === 0, left, bonus });
  const scored = { ...s, score: s.score + bonus };
  const leveled = checkGoal(scored, events);
  return leveled !== scored ? leveled : deal(scored, s.level);
}

function finishLevel(s: KlState, events: KlEvent[]): KlState {
  const left = tilesLeft(s.cells);
  const cleared = left === 0;
  const bonus = levelBonus(s.level, left);
  const troopsDelta = cleared ? KL_CLEAR_TROOPS : -left;
  const troops = s.troops + troopsDelta;
  const summary: KlLevelSummary = { level: s.level, cleared, left, bonus, troopsDelta };
  events.push({ type: "levelDone", summary });
  const over = troops <= 0;
  if (over) events.push({ type: "over" });
  return { ...s, score: s.score + bonus, troops: Math.max(0, troops), summary, phase: over ? "over" : "levelDone", prev: null };
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
      const banners = group.reduce((n, i) => n + (state.cells[i]?.banner ? 1 : 0), 0);
      const gained = groupScore(group.length, banners);
      const cells = state.cells.slice();
      for (const i of group) cells[i] = null;
      events.push({ type: "removed", cells: group, gained });
      const next = addCharge(
        { ...state, cells: settle(cells, state.width, state.height), score: state.score + gained, moves: state.moves + 1, prev: withPrev(state) },
        gained,
        events,
      );
      return { ok: true, state: afterMove(next, events), events };
    }
    case "whirl": {
      if (!active) return { ok: false, reason: "notPlaying" };
      if (!inBounds(state, action.index)) return { ok: false, reason: "outOfBounds" };
      if (state.tools.whirl <= 0) return { ok: false, reason: "noTool" };
      if (!isWhirlCenter(action.index, state.width, state.height)) return { ok: false, reason: "edge" };
      const ring = ringOf(action.index, state.width);
      const cells = state.cells.slice();
      ring.forEach((to, k) => (cells[to] = state.cells[ring[(k + ring.length - 1) % ring.length] as number] ?? null));
      events.push({ type: "whirled", center: action.index });
      const next: KlState = {
        ...state,
        cells: settle(cells, state.width, state.height),
        tools: { ...state.tools, whirl: state.tools.whirl - 1 },
        moves: state.moves + 1,
        prev: withPrev(state),
      };
      return { ok: true, state: afterMove(next, events), events };
    }
    case "thunder": {
      if (!active) return { ok: false, reason: "notPlaying" };
      if (!inBounds(state, action.index)) return { ok: false, reason: "outOfBounds" };
      if (state.tools.thunder <= 0) return { ok: false, reason: "noTool" };
      const area = thunderArea(action.index, state.width, state.height).filter((i) => state.cells[i]);
      if (!area.length) return { ok: false, reason: "empty" };
      const cells = state.cells.slice();
      for (const i of area) cells[i] = null;
      events.push({ type: "thundered", cells: area });
      const next: KlState = {
        ...state,
        cells: settle(cells, state.width, state.height),
        tools: { ...state.tools, thunder: state.tools.thunder - 1 },
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
      if (state.mode === "timed") {
        // Cấp tốc chỉ bỏ bàn khi đã bế tắc, tránh chia lại liên tục để tìm bàn dễ.
        if (state.phase !== "stuck") return { ok: false, reason: "notStuck" };
        return { ok: true, state: redeal(state, events), events };
      }
      return { ok: true, state: finishLevel(state, events), events };
    }
    case "timeUp": {
      if (state.mode !== "timed" || state.phase === "over") return { ok: false, reason: "notPlaying" };
      events.push({ type: "timeUp" }, { type: "over" });
      return { ok: true, state: { ...state, phase: "over", prev: null }, events };
    }
    case "nextLevel": {
      if (state.phase !== "levelDone" || state.mode === "timed") return { ok: false, reason: "notPlaying" };
      const level = state.level + 1;
      const { cells, nextId } = generateBoard(state.seed, level, state.nextId, state.width, state.height);
      events.push({ type: "newLevel", level });
      return {
        ok: true,
        state: { ...state, level, cells, nextId, deal: 0, undo: KL_UNDO_PER_LEVEL, phase: "playing", summary: null, prev: null },
        events,
      };
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
    ((v as KlCell).banner === undefined || (v as KlCell).banner === true));

/** Đọc lại ván đã lưu; dữ liệu hỏng hoặc khác phiên bản trả về null. */
export function parseGame(text: string | null): KlState | null {
  if (!text) return null;
  try {
    const v = JSON.parse(text) as Partial<KlState>;
    const phases: KlPhase[] = ["playing", "stuck", "levelDone", "over"];
    const num = (x: unknown) => typeof x === "number" && Number.isFinite(x) && x >= 0;
    if (v.version !== 1 || !num(v.seed) || !num(v.level) || !num(v.score) || !num(v.troops) || !num(v.moves) || !num(v.undo) || !num(v.nextId)) return null;
    if (!Number.isInteger(v.width) || !Number.isInteger(v.height) || (v.width as number) < 3 || (v.height as number) < 3) return null;
    if (!Array.isArray(v.cells) || v.cells.length !== (v.width as number) * (v.height as number) || !v.cells.every(isCell)) return null;
    if (!v.tools || !num(v.tools.whirl) || !num(v.tools.thunder)) return null;
    if (!phases.includes(v.phase as KlPhase)) return null;
    const mode: KlMode = v.mode === "timed" ? "timed" : "classic";
    const charge = v.charge && num(v.charge.whirl) && num(v.charge.thunder) ? v.charge : { whirl: 0, thunder: 0 };
    const deal = num(v.deal) ? (v.deal as number) : 0;
    return { ...(v as KlState), mode, charge, deal, summary: v.summary ?? null, prev: null };
  } catch {
    return null;
  }
}
