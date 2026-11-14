// Sử Lộ: đổ xúc xắc đi qua mê cung, dừng ô nào trả lời câu sử ô đó. Luật ở docs/02-game-modes/su-lo/gdd.md.
// Đúng thì ô thành đã thông (cờ lau); sai thì tướng quay về ô bắt đầu lượt. Không giới hạn số lượt: số lượt
// chỉ để chấm sao và xếp hạng. Logic thuần, không đọc đồng hồ; mọi ngẫu nhiên qua seed nên một lượt chơi phát lại được.

import { createRng, type Rng } from "../rng";
import { SL_BOSSES } from "./bosses";
import { adjacency, bfs, edgeKey, generateMaze, SL_LEVELS, type SlLevel, type SlMaze } from "./maze";
import { isCorrect, isPlayable, questionById, SL_QUESTIONS, type SlDifficulty, type SlEra, type SlQuestion } from "./questions";
import { newSkirmish, skAct, type SkAction, type SkState } from "./skirmish";

export const SL_ERAS: readonly SlEra[] = ["ngo", "loanSuQuan", "dinh", "tienLe"];
export const SL_ERA_NAME: Readonly<Record<SlEra, string>> = {
  ngo: "Ngô Quyền dựng nước",
  loanSuQuan: "Loạn sứ quân",
  dinh: "Nhà Đinh",
  tienLe: "Nhà Tiền Lê",
};

export type SlAid = "locLoi" | "doiCau" | "hoiTuong" | "hoaToc";
export const SL_AIDS: readonly SlAid[] = ["locLoi", "doiCau", "hoiTuong", "hoaToc"];
/** Trợ giúp cấp sẵn mỗi màn (GDD mục 6). */
export const SL_START_AIDS: Readonly<Record<SlAid, number>> = { locLoi: 2, doiCau: 1, hoiTuong: 1, hoaToc: 1 };
/** Tổng số lần dùng trợ giúp tối đa mỗi màn. */
export const SL_AID_USE_MAX = 6;

/** Ban tham mưu: tướng lịch sử, không cần sở hữu. `tags` là tên người, nơi mà tướng đó rành. */
export interface SlAdvisor {
  readonly id: string;
  readonly name: string;
  readonly tags: readonly string[];
}

export const SL_ADVISORS: readonly SlAdvisor[] = [
  { id: "dinhBoLinh", name: "Đinh Bộ Lĩnh", tags: ["Đinh Bộ Lĩnh", "Hoa Lư", "Trần Lãm", "Đinh Liễn"] },
  { id: "nguyenBac", name: "Nguyễn Bặc", tags: ["Hoa Lư", "Đinh Bộ Lĩnh"] },
  { id: "dinhDien", name: "Đinh Điền", tags: ["Hoa Lư", "Đinh Bộ Lĩnh"] },
  { id: "leHoan", name: "Lê Hoàn", tags: ["Lê Hoàn"] },
  { id: "trinhTu", name: "Trịnh Tú", tags: ["Bố Hải", "Trần Lãm"] },
  { id: "luuCo", name: "Lưu Cơ", tags: ["Hoa Lư"] },
  { id: "dinhLien", name: "Đinh Liễn", tags: ["Đinh Liễn", "Trần Lãm", "Bố Hải"] },
  { id: "tranLam", name: "Trần Lãm", tags: ["Trần Lãm", "Bố Hải"] },
  { id: "phamBachHo", name: "Phạm Bạch Hổ", tags: ["Phạm Bạch Hổ", "Đằng Châu"] },
  { id: "ngoXuongXi", name: "Ngô Xương Xí", tags: ["Ngô Xương Xí", "Bình Kiều", "Ngô Quyền", "Ngô Xương Văn", "Ngô Xương Ngập"] },
  { id: "ngoNhatKhanh", name: "Ngô Nhật Khánh", tags: ["Ngô Nhật Khánh", "Đường Lâm", "Ngô Quyền"] },
  { id: "doCanhThac", name: "Đỗ Cảnh Thạc", tags: ["Đỗ Cảnh Thạc", "Đỗ Động Giang"] },
];

export type SlPhase = "roll" | "move" | "question" | "skirmish" | "won";

export interface SlActiveQuestion {
  readonly id: string;
  /** Ô đang hỏi; với câu Quân sư hiến kế là ô boss. */
  readonly cell: number;
  /** Cửa ải: số câu còn phải trả lời sau câu này. */
  readonly chainLeft: number;
  readonly forCounsel: boolean;
  /** Đáp án bị Lọc lời hoặc Hỏi tướng ẩn đi. */
  readonly hidden: readonly number[];
  readonly hint: string | null;
}

export interface SlBlocked {
  readonly key: string;
  readonly until: number;
}

export type SlEventKind =
  | "start"
  | "rolled"
  | "noMove"
  | "correct"
  | "wrong"
  | "trapDisarmed"
  | "trapSprung"
  | "luck"
  | "gateOpen"
  | "stele"
  | "bossWon"
  | "bossLost"
  | "won"
  | "aid";

export interface SlEvent {
  readonly kind: SlEventKind;
  readonly text: string;
  /** Sử chép của câu vừa trả lời. */
  readonly explanation?: string;
  readonly questionId?: string;
}

export interface SlState {
  readonly version: 1;
  readonly level: SlLevel;
  readonly era: SlEra;
  readonly seed: number;
  readonly maze: SlMaze;
  readonly advisors: readonly string[];
  readonly phase: SlPhase;
  readonly pos: number;
  readonly turnStart: number;
  readonly roll: number | null;
  /** Ngựa chiến: được đi tiếp một đoạn không tính lượt. */
  readonly bonusMove: boolean;
  /** Trạm ngựa: lượt kế đổ hai xúc xắc, lấy số lớn. */
  readonly doubleRoll: boolean;
  readonly cleared: readonly boolean[];
  readonly visited: readonly boolean[];
  /** Ô đã lộ loại (bẫy ẩn, ô ngoài sương) nhờ Trinh sát, Mật thư hoặc đã dừng vào. */
  readonly revealed: readonly boolean[];
  /** Lối tắt đã mở. */
  readonly unlocked: readonly string[];
  readonly blocked: readonly SlBlocked[];
  readonly turns: number;
  readonly correct: number;
  readonly wrong: number;
  readonly seals: number;
  readonly aids: Readonly<Record<SlAid, number>>;
  readonly aidsUsed: number;
  readonly question: SlActiveQuestion | null;
  readonly asked: readonly string[];
  readonly review: readonly string[];
  /** Thành lực còn lại của boss qua các lần giao tranh. */
  readonly bossHp: number;
  readonly skirmish: SkState | null;
  readonly skirmishCount: number;
  readonly rng: number;
  readonly event: SlEvent;
}

const LUCK_NAME = { nguaChien: "Ngựa chiến", tramNgua: "Trạm ngựa", matThu: "Mật thư", trinhSat: "Đồn trinh sát", suQuan: "Sử quan" } as const;
const TRAP_NAME = { phucBinh: "Phục binh", cocNgam: "Cọc ngầm", nuocLu: "Nước lũ", lacLoi: "Lạc lối", thichKhach: "Thích khách", dotCau: "Đốt cầu" } as const;
export const SL_LUCK_NAME: Readonly<Record<keyof typeof LUCK_NAME, string>> = LUCK_NAME;
export const SL_TRAP_NAME: Readonly<Record<keyof typeof TRAP_NAME, string>> = TRAP_NAME;
export const SL_AID_NAME: Readonly<Record<SlAid, string>> = { locLoi: "Lọc lời", doiCau: "Đổi câu", hoiTuong: "Hỏi tướng", hoaToc: "Hỏa tốc" };

/** Mê cung có đủ boss có nguồn và câu hỏi để chơi thử. */
export function eraPlayable(era: SlEra): boolean {
  return SL_BOSSES[era].sourced && SL_QUESTIONS.some((q) => q.era === era && isPlayable(q));
}

export function newRun(level: SlLevel, era: SlEra, seed: number, advisors: readonly string[] = ["dinhBoLinh", "nguyenBac"]): SlState {
  const maze = generateMaze(level, era, seed);
  const n = maze.cells.length;
  const visited = new Array<boolean>(n).fill(false);
  visited[maze.start] = true;
  const cleared = new Array<boolean>(n).fill(false);
  cleared[maze.start] = true;
  return {
    version: 1,
    level,
    era,
    seed,
    maze,
    advisors: advisors.filter((a) => SL_ADVISORS.some((x) => x.id === a)).slice(0, 2),
    phase: "roll",
    pos: maze.start,
    turnStart: maze.start,
    roll: null,
    bonusMove: false,
    doubleRoll: false,
    cleared,
    visited,
    revealed: new Array<boolean>(n).fill(false),
    unlocked: [],
    blocked: [],
    turns: 0,
    correct: 0,
    wrong: 0,
    seals: 0,
    aids: { ...SL_START_AIDS },
    aidsUsed: 0,
    question: null,
    asked: [],
    review: [],
    bossHp: SL_LEVELS[level].bossHp,
    skirmish: null,
    skirmishCount: 0,
    rng: createRng(seed ^ 0x5a17).state(),
    event: { kind: "start", text: `Mê cung ${SL_ERA_NAME[era]}. Đổ xúc xắc để lên đường.` },
  };
}

// ── Đồ thị ──

function edgeOpen(s: SlState, a: number, b: number): boolean {
  const key = edgeKey(a, b);
  const e = s.maze.edges.find((x) => edgeKey(x.a, x.b) === key);
  if (!e) return false;
  if (e.locked && !s.unlocked.includes(key)) return false;
  return !s.blocked.some((x) => x.key === key && x.until > s.turns);
}

export function neighborsOf(s: SlState, i: number): number[] {
  const out: number[] = [];
  for (const e of s.maze.edges) {
    const j = e.a === i ? e.b : e.b === i ? e.a : -1;
    if (j >= 0 && edgeOpen(s, i, j)) out.push(j);
  }
  return out;
}

/** Ô không được đi xuyên qua (chỉ được dừng ở đó): cửa ải và boss chưa thông. Cổng chỉ vào được khi boss đã hạ. */
function stopsHere(s: SlState, i: number): boolean {
  const k = s.maze.cells[i]!.kind;
  return (k === "gate" || k === "boss") && !s.cleared[i];
}

function enterable(s: SlState, i: number): boolean {
  if (s.maze.cells[i]!.kind === "exit") return s.cleared[s.maze.boss] === true;
  return true;
}

/** Ô tới được với số bước 1..roll, đi không quay đầu trên cạnh vừa đi; trả về đường ngắn nhất tới từng ô. */
export function reachable(s: SlState, roll: number = s.roll ?? 0): Map<number, number[]> {
  const out = new Map<number, number[]>();
  const walk = (cur: number, prev: number, path: number[]) => {
    if (path.length > 0) {
      const old = out.get(cur);
      if (!old || old.length > path.length) out.set(cur, path);
    }
    if (path.length >= roll) return;
    if (path.length > 0 && (stopsHere(s, cur) || s.maze.cells[cur]!.kind === "exit")) return;
    for (const nx of neighborsOf(s, cur)) {
      if (nx === prev || !enterable(s, nx)) continue;
      walk(nx, cur, [...path, nx]);
    }
  };
  walk(s.pos, -1, []);
  out.delete(s.pos);
  return out;
}

/** Ô thấy được loại (ngoài sương): trong bán kính sương quanh tướng, đã đi qua, hoặc đã lộ. */
export function visibleCells(s: SlState): boolean[] {
  const fog = SL_LEVELS[s.level].fog;
  const n = s.maze.cells.length;
  if (fog === null) return new Array<boolean>(n).fill(true);
  const dist = bfs(adjacency(s.maze, () => true), s.pos);
  return s.maze.cells.map((_, i) => s.visited[i] === true || s.revealed[i] === true || (dist[i]! >= 0 && dist[i]! <= fog));
}

/** Bẫy ẩn chưa lộ trông như ô câu hỏi Vàng. */
export function trapShown(s: SlState, i: number): boolean {
  const c = s.maze.cells[i]!;
  return c.kind === "trap" && (!c.hidden || s.revealed[i] === true);
}

// ── Câu hỏi ──

function shuffleIds<T>(arr: T[], rng: Rng): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** Chọn câu: ưu tiên đúng giai đoạn (khoảng 70%), đúng độ khó, chưa hỏi trong lượt chơi; thiếu thì nới dần. */
export function pickQuestion(s: SlState, rng: Rng, want: { difficulty: SlDifficulty; kinds?: readonly string[]; exclude?: readonly string[] }): SlQuestion {
  const pool = SL_QUESTIONS.filter(isPlayable).filter((q) => !(want.exclude ?? []).includes(q.id));
  const kindOk = (q: SlQuestion) => !want.kinds || want.kinds.includes(q.kind);
  const preferEra = rng.next() < 0.7;
  const tiers: ((q: SlQuestion) => boolean)[] = [
    (q) => kindOk(q) && q.difficulty === want.difficulty && !s.asked.includes(q.id) && (!preferEra || q.era === s.era),
    (q) => kindOk(q) && q.difficulty === want.difficulty && !s.asked.includes(q.id),
    (q) => kindOk(q) && Math.abs(q.difficulty - want.difficulty) <= 1 && !s.asked.includes(q.id),
    (q) => q.difficulty === want.difficulty && !s.asked.includes(q.id),
    (q) => !s.asked.includes(q.id),
    () => true,
  ];
  for (const t of tiers) {
    const c = pool.filter(t);
    if (c.length > 0) return shuffleIds(c, rng)[0]!;
  }
  return SL_QUESTIONS[0]!;
}

function askAt(s: SlState, rng: Rng, cell: number): SlState {
  const c = s.maze.cells[cell]!;
  let want: { difficulty: SlDifficulty; kinds?: readonly string[] };
  let chainLeft = 0;
  if (c.kind === "question") want = { difficulty: c.difficulty };
  else if (c.kind === "trap") want = { difficulty: 2 };
  else if (c.kind === "luck") want = { difficulty: 1 };
  else if (c.kind === "stele") want = { difficulty: 2, kinds: ["reading"] };
  else if (c.kind === "gate") {
    want = { difficulty: 2 };
    chainLeft = 1;
  } else want = { difficulty: 1 };
  const q = pickQuestion(s, rng, want);
  return {
    ...s,
    phase: "question",
    question: { id: q.id, cell, chainLeft, forCounsel: false, hidden: [], hint: null },
    asked: [...s.asked, q.id],
  };
}

// ── Hành động ──

export type SlAction =
  | { readonly type: "roll" }
  | { readonly type: "move"; readonly to: number }
  | { readonly type: "answer"; readonly answer: number | readonly number[] | null }
  | { readonly type: "aid"; readonly aid: SlAid; readonly value?: number; readonly advisor?: string }
  | { readonly type: "skirmish"; readonly action: Exclude<SkAction, { type: "counsel" }> }
  | { readonly type: "retreat" };

export type SlReason =
  | "wrongPhase"
  | "notReachable"
  | "noAid"
  | "aidLimit"
  | "aidNotHere"
  | "badValue"
  | "badAdvisor"
  | "skirmish"
  | "over";

export type SlResult = { readonly ok: true; readonly state: SlState } | { readonly ok: false; readonly reason: SlReason; readonly detail?: string };

const fail = (reason: SlReason, detail?: string): SlResult => (detail ? { ok: false, reason, detail } : { ok: false, reason });

function withRng(s: SlState, f: (rng: Rng) => SlState): SlState {
  const rng = createRng(s.rng);
  const next = f(rng);
  return { ...next, rng: rng.state() };
}

function setAt<T>(arr: readonly T[], i: number, v: T): T[] {
  const out = arr.slice();
  out[i] = v;
  return out;
}

function startTurn(s: SlState, roll: number): SlState {
  const turns = s.turns + 1;
  const base: SlState = { ...s, turns, roll, turnStart: s.pos, doubleRoll: false, bonusMove: false };
  const targets = reachable(base, roll);
  if (targets.size === 0) {
    return { ...base, phase: "roll", roll: null, event: { kind: "noMove", text: `Đổ được ${roll}, nhưng không có lối nào đi được. Chờ lượt sau.` } };
  }
  return { ...base, phase: "move", event: { kind: "rolled", text: `Đổ được ${roll}. Chọn ô muốn tới (được dừng sớm).` } };
}

function land(s: SlState, rng: Rng, cell: number): SlState {
  const visited = setAt(s.visited, cell, true);
  const kind = s.maze.cells[cell]!.kind;
  const base = { ...s, pos: cell, visited, roll: null };
  if (kind === "exit") {
    return { ...base, phase: "won", event: { kind: "won", text: "Qua cổng thành, thoát khỏi mê cung!" } };
  }
  if (s.cleared[cell]) {
    return { ...base, phase: "roll", event: { kind: "rolled", text: "Ô đã thông. Đổ xúc xắc tiếp." } };
  }
  if (kind === "boss") {
    const cfg = SL_LEVELS[s.level];
    const sk = newSkirmish(rng.int(1, 0x7fffffff), cfg.bossHp, s.bossHp, cfg.skirmishMoves);
    const boss = SL_BOSSES[s.era];
    return { ...base, phase: "skirmish", skirmish: sk, skirmishCount: s.skirmishCount + 1, event: { kind: "start", text: `Giao tranh: ${boss.name}. ${boss.intro}` } };
  }
  const revealed = kind === "trap" ? setAt(s.revealed, cell, true) : s.revealed;
  return askAt({ ...base, revealed }, rng, cell);
}

function stepToward(s: SlState, from: number, steps: number): number {
  const dist = bfs(adjacency(s.maze, (e) => !e.locked || s.unlocked.includes(edgeKey(e.a, e.b))), s.maze.start);
  let cur = from;
  for (let k = 0; k < steps; k++) {
    const back = neighborsOf(s, cur).find((v) => dist[v]! >= 0 && dist[v]! < dist[cur]!);
    if (back === undefined) break;
    cur = back;
  }
  return cur;
}

function springTrap(s: SlState, rng: Rng, cell: number): { state: SlState; text: string } {
  const c = s.maze.cells[cell]!;
  if (c.kind !== "trap") return { state: s, text: "" };
  const name = TRAP_NAME[c.trap];
  switch (c.trap) {
    case "phucBinh":
      return { state: { ...s, turns: s.turns + 1 }, text: `${name}: mất một lượt.` };
    case "cocNgam":
      return { state: { ...s, turns: s.turns + 2 }, text: `${name}: mắc kẹt, mất hai lượt.` };
    case "nuocLu": {
      const to = stepToward(s, s.pos, 2);
      return { state: { ...s, pos: to, visited: setAt(s.visited, to, true) }, text: `${name}: bị cuốn lùi thêm.` };
    }
    case "lacLoi": {
      const opts = s.cleared.map((v, i) => (v ? i : -1)).filter((i) => i >= 0 && s.maze.cells[i]!.kind !== "boss");
      const to = opts.length > 0 ? opts[rng.int(0, opts.length - 1)]! : s.maze.start;
      return { state: { ...s, pos: to }, text: `${name}: lạc sang một ô đã đi.` };
    }
    case "thichKhach": {
      const have = (Object.keys(s.aids) as SlAid[]).filter((a) => s.aids[a] > 0);
      if (have.length === 0) return { state: s, text: `${name}: may là không còn trợ giúp nào để mất.` };
      const lost = have[rng.int(0, have.length - 1)]!;
      return { state: { ...s, aids: { ...s.aids, [lost]: s.aids[lost] - 1 } }, text: `${name}: mất một ${SL_AID_NAME[lost]}.` };
    }
    case "dotCau": {
      const ns = neighborsOf(s, s.pos);
      if (ns.length <= 1) return { state: s, text: `${name}: may là lối này không có cầu để đốt.` };
      const v = ns[rng.int(0, ns.length - 1)]!;
      return { state: { ...s, blocked: [...s.blocked, { key: edgeKey(s.pos, v), until: s.turns + 3 }] }, text: `${name}: một lối bị chặn ba lượt.` };
    }
  }
}

function applyLuck(s: SlState, cell: number): { state: SlState; text: string } {
  const c = s.maze.cells[cell]!;
  if (c.kind !== "luck") return { state: s, text: "" };
  const name = LUCK_NAME[c.luck];
  switch (c.luck) {
    case "nguaChien":
      return { state: { ...s, bonusMove: true }, text: `${name}: đi tiếp ngay 2 bước, không tính lượt.` };
    case "tramNgua":
      return { state: { ...s, doubleRoll: true }, text: `${name}: lượt sau đổ hai xúc xắc, lấy số lớn.` };
    case "matThu": {
      const locked = s.maze.edges.filter((e) => e.locked && !s.unlocked.includes(edgeKey(e.a, e.b)));
      if (locked.length === 0) return { state: s, text: `${name}: mọi lối tắt đã mở.` };
      const dist = bfs(adjacency(s.maze, () => true), cell);
      locked.sort((x, y) => Math.min(dist[x.a]!, dist[x.b]!) - Math.min(dist[y.a]!, dist[y.b]!));
      const e = locked[0]!;
      const revealed = s.revealed.slice();
      revealed[e.a] = true;
      revealed[e.b] = true;
      return { state: { ...s, unlocked: [...s.unlocked, edgeKey(e.a, e.b)], revealed }, text: `${name}: lộ và mở một lối tắt gần nhất.` };
    }
    case "trinhSat": {
      const dist = bfs(adjacency(s.maze, () => true), cell);
      return { state: { ...s, revealed: s.revealed.map((v, i) => v || (dist[i]! >= 0 && dist[i]! <= 3)) }, text: `${name}: lộ mọi ô trong bán kính 3.` };
    }
    case "suQuan": {
      const low = SL_AIDS.reduce((m, a) => (s.aids[a] < s.aids[m] ? a : m), SL_AIDS[0]!);
      return { state: { ...s, aids: { ...s.aids, [low]: s.aids[low] + 1 } }, text: `${name}: thêm một ${SL_AID_NAME[low]}.` };
    }
  }
}

/** Câu Đỏ đúng ở ô kề lối tắt khóa thì mở lối đó (ô "người dẫn đường"). */
function unlockAround(s: SlState, cell: number): SlState {
  const keys = s.maze.edges.filter((e) => e.locked && (e.a === cell || e.b === cell)).map((e) => edgeKey(e.a, e.b)).filter((k) => !s.unlocked.includes(k));
  return keys.length === 0 ? s : { ...s, unlocked: [...s.unlocked, ...keys] };
}

function answerQuestion(s: SlState, rng: Rng, answer: number | readonly number[] | null): SlState {
  const aq = s.question!;
  const q = questionById(aq.id)!;
  const ok = isCorrect(q, answer);
  const explain = { explanation: q.explanation, questionId: q.id };

  if (aq.forCounsel) {
    const r = skAct(s.skirmish!, { type: "counsel", correct: ok });
    const sk = r.ok ? r.state : s.skirmish!;
    const next: SlState = {
      ...s,
      question: null,
      phase: "skirmish",
      skirmish: sk,
      correct: s.correct + (ok ? 1 : 0),
      wrong: s.wrong + (ok ? 0 : 1),
      review: ok ? s.review : [...s.review, q.id],
      event: { kind: ok ? "correct" : "wrong", text: ok ? "Quân sư hiến kế đúng: phá giáp, Thành lực giảm mạnh." : "Kế chưa thành. Đánh tiếp.", ...explain },
    };
    return settleSkirmish(next, rng);
  }

  if (!ok) {
    const cell = aq.cell;
    let next: SlState = {
      ...s,
      question: null,
      phase: "roll",
      pos: s.turnStart,
      wrong: s.wrong + 1,
      review: [...s.review, q.id],
      bonusMove: false,
    };
    let text = "Chưa đúng. Tướng quay về ô bắt đầu lượt.";
    if (s.maze.cells[cell]!.kind === "trap") {
      const r = springTrap(next, rng, cell);
      next = r.state;
      text = `Chưa đúng, sa bẫy. Tướng quay về ô bắt đầu lượt. ${r.text}`;
      return { ...next, event: { kind: "trapSprung", text, ...explain } };
    }
    return { ...next, event: { kind: "wrong", text, ...explain } };
  }

  const cellKind = s.maze.cells[aq.cell]!;
  if (aq.chainLeft > 0) {
    const q2 = pickQuestion(s, rng, { difficulty: 3, exclude: [q.id] });
    return {
      ...s,
      correct: s.correct + 1,
      question: { id: q2.id, cell: aq.cell, chainLeft: aq.chainLeft - 1, forCounsel: false, hidden: [], hint: null },
      asked: [...s.asked, q2.id],
      event: { kind: "correct", text: "Đúng. Cửa ải còn một câu nữa.", ...explain },
    };
  }

  let next: SlState = { ...s, question: null, phase: "roll", correct: s.correct + 1, cleared: setAt(s.cleared, aq.cell, true) };
  let kind: SlEventKind = "correct";
  let text = "Đúng! Cắm cờ lau ở ô này.";
  if (cellKind.kind === "question") {
    next = { ...next, seals: next.seals + cellKind.difficulty - 1 };
    if (cellKind.difficulty === 3) next = unlockAround(next, aq.cell);
    if (cellKind.difficulty > 1) text = `Đúng! +${cellKind.difficulty - 1} Ấn sử.`;
  } else if (cellKind.kind === "trap") {
    next = { ...next, seals: next.seals + 1 };
    kind = "trapDisarmed";
    text = `Đúng, gỡ được bẫy ${TRAP_NAME[cellKind.trap]}. +1 Ấn sử.`;
  } else if (cellKind.kind === "luck") {
    const r = applyLuck(next, aq.cell);
    next = r.state;
    kind = "luck";
    text = `Đúng! ${r.text}`;
  } else if (cellKind.kind === "gate") {
    kind = "gateOpen";
    text = "Đúng cả hai câu, cửa ải đã mở.";
  } else if (cellKind.kind === "stele") {
    next = { ...next, seals: next.seals + 1 };
    kind = "stele";
    text = "Đọc đúng bia đá. +1 Ấn sử.";
  }
  if (next.bonusMove) {
    next = { ...next, phase: "move", roll: 2, turnStart: next.pos };
    if (reachable(next, 2).size === 0) next = { ...next, phase: "roll", roll: null, bonusMove: false };
  }
  return { ...next, event: { kind, text, ...explain } };
}

function settleSkirmish(s: SlState, rng: Rng): SlState {
  const sk = s.skirmish!;
  if (sk.counselPending && sk.phase === "play") {
    const q = pickQuestion(s, rng, { difficulty: 2 });
    return {
      ...s,
      phase: "question",
      question: { id: q.id, cell: s.maze.boss, chainLeft: 0, forCounsel: true, hidden: [], hint: null },
      asked: [...s.asked, q.id],
      event: { kind: "start", text: "Đủ mưu: Quân sư hiến kế. Trả lời đúng để phá giáp quân giặc." },
    };
  }
  if (sk.phase === "won") {
    return {
      ...s,
      phase: "roll",
      skirmish: null,
      bossHp: 0,
      cleared: setAt(s.cleared, s.maze.boss, true),
      seals: s.seals + 2,
      event: { kind: "bossWon", text: `Hạ được ${SL_BOSSES[s.era].name}! +2 Ấn sử. Cổng thoát đã mở.` },
    };
  }
  if (sk.phase === "lost") {
    return {
      ...s,
      phase: "roll",
      skirmish: null,
      bossHp: sk.hp,
      pos: s.turnStart,
      event: { kind: "bossLost", text: "Hết nước, quân giặc chưa tan. Tướng lui về ô bắt đầu lượt; Thành lực của giặc giữ nguyên mức đã mất." },
    };
  }
  return { ...s, phase: "skirmish", skirmish: sk };
}

function applyAid(s: SlState, rng: Rng, aid: SlAid, value?: number, advisor?: string): SlResult {
  if (s.aids[aid] <= 0) return fail("noAid");
  if (s.aidsUsed >= SL_AID_USE_MAX) return fail("aidLimit");
  const spend = (st: SlState): SlState => ({ ...st, aids: { ...st.aids, [aid]: st.aids[aid] - 1 }, aidsUsed: st.aidsUsed + 1 });
  if (aid === "hoaToc") {
    if (s.phase !== "roll") return fail("aidNotHere");
    if (!Number.isInteger(value) || value! < 1 || value! > 6) return fail("badValue");
    return { ok: true, state: startTurn(spend(s), value!) };
  }
  if (s.phase !== "question" || !s.question) return fail("aidNotHere");
  const q = questionById(s.question.id)!;
  const singleAnswer = typeof q.answer === "number";
  const wrongVisible = singleAnswer ? q.options.map((_, i) => i).filter((i) => i !== q.answer && !s.question!.hidden.includes(i)) : [];
  if (aid === "locLoi") {
    if (!singleAnswer || q.options.length < 4 || wrongVisible.length < 2) return fail("aidNotHere");
    const drop = shuffleIds(wrongVisible.slice(), rng).slice(0, 2);
    return { ok: true, state: { ...spend(s), question: { ...s.question, hidden: [...s.question.hidden, ...drop] }, event: { kind: "aid", text: "Lọc lời: bỏ hai đáp án sai." } } };
  }
  if (aid === "doiCau") {
    const c = s.maze.cells[s.question.cell]!;
    const difficulty: SlDifficulty = s.question.forCounsel ? 2 : c.kind === "question" ? c.difficulty : c.kind === "luck" ? 1 : s.question.chainLeft === 0 && c.kind === "gate" ? 3 : 2;
    const q2 = pickQuestion(s, rng, { difficulty, exclude: [q.id], ...(c.kind === "stele" && !s.question.forCounsel ? { kinds: ["reading"] } : {}) });
    return {
      ok: true,
      state: { ...spend(s), question: { ...s.question, id: q2.id, hidden: [], hint: null }, asked: [...s.asked, q2.id], event: { kind: "aid", text: "Đổi câu: thay bằng câu khác." } },
    };
  }
  // Hỏi tướng
  const adv = SL_ADVISORS.find((a) => a.id === advisor);
  if (!adv || !s.advisors.includes(adv.id)) return fail("badAdvisor");
  const knows = [...(q.people ?? []), ...(q.places ?? [])].some((t) => adv.tags.includes(t));
  let hidden = s.question.hidden;
  if (knows && wrongVisible.length > 1) hidden = [...hidden, shuffleIds(wrongVisible.slice(), rng)[0]!];
  const hint = q.hint ?? (knows ? "Việc này ta từng trải, hãy tin vào đáp án còn lại." : "Ta không rành chuyện này, chỉ nhớ phải đọc kỹ từng chữ.");
  return {
    ok: true,
    state: {
      ...spend(s),
      question: { ...s.question, hidden, hint: `${adv.name}: ${hint}${knows && singleAnswer ? " (Loại thêm một đáp án sai.)" : ""}` },
      event: { kind: "aid", text: `Hỏi ${adv.name}.` },
    },
  };
}

export function slAct(s: SlState, a: SlAction): SlResult {
  if (s.phase === "won") return fail("over");
  switch (a.type) {
    case "roll": {
      if (s.phase !== "roll") return fail("wrongPhase");
      return {
        ok: true,
        state: withRng(s, (rng) => {
          const d1 = rng.int(1, 6);
          const roll = s.doubleRoll ? Math.max(d1, rng.int(1, 6)) : d1;
          return startTurn(s, roll);
        }),
      };
    }
    case "move": {
      if (s.phase !== "move") return fail("wrongPhase");
      const path = reachable(s).get(a.to);
      if (!path) return fail("notReachable");
      return { ok: true, state: withRng({ ...s, bonusMove: false }, (rng) => land({ ...s, bonusMove: false }, rng, a.to)) };
    }
    case "answer": {
      if (s.phase !== "question" || !s.question) return fail("wrongPhase");
      return { ok: true, state: withRng(s, (rng) => answerQuestion(s, rng, a.answer)) };
    }
    case "aid": {
      const rng = createRng(s.rng);
      const r = applyAid(s, rng, a.aid, a.value, a.advisor);
      return r.ok ? { ok: true, state: { ...r.state, rng: rng.state() } } : r;
    }
    case "skirmish": {
      if (s.phase !== "skirmish" || !s.skirmish) return fail("wrongPhase");
      const r = skAct(s.skirmish, a.action);
      if (!r.ok) return fail("skirmish", r.reason);
      return { ok: true, state: withRng({ ...s, skirmish: r.state }, (rng) => settleSkirmish({ ...s, skirmish: r.state }, rng)) };
    }
    case "retreat": {
      if (s.phase !== "skirmish" || !s.skirmish) return fail("wrongPhase");
      return { ok: true, state: { ...s, phase: "roll", skirmish: null, bossHp: s.skirmish.hp, pos: s.turnStart, event: { kind: "bossLost", text: "Rút khỏi trận. Thành lực của giặc giữ nguyên mức đã mất." } } };
    }
  }
}

/** Sao khi thoát (GDD mục 8.1). */
export function starsOf(s: SlState): 0 | 1 | 2 | 3 {
  if (s.phase !== "won") return 0;
  if (s.turns > SL_LEVELS[s.level].starTurns) return 1;
  return s.wrong <= 2 ? 3 : 2;
}

/** Khoảng cách theo lối đang đi được (lối tắt khóa và lối bị chặn không tính) từ mọi ô tới `target`. */
export function distanceTo(s: SlState, target: number): number[] {
  const adj = s.maze.cells.map((_, i) => neighborsOf(s, i));
  return bfs(adj, target);
}
