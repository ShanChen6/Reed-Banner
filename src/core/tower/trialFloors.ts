// Dữ liệu tầng Tháp Thí Luyện (Trial): schema, parse nghiêm ngặt, registry chỉ đọc, bản công khai.
// Chưa chứa nội dung 20 tầng và không phát thưởng; số liệu là do task nội dung sau cung cấp.
// Xem docs/02-game-modes/dual-tower/00-02-rules.md §3.
import type { Difficulty } from "../ai";
import { TILE_KINDS, validateWeights, type SpawnWeights } from "../board";
import type { FighterConfig } from "../battle";
import { leveledFoe, MAX_LEVEL, TRIAL_FLOORS } from "../progress";
import { SHOP_COMPANIONS, STARTER_COMPANIONS } from "../roster";
import type { EnemyBuilder, FloorDefinition } from "./floorContract";
import { validateFloorRules, type FloorRules, type RuleIssue } from "./floorRules";

export const TRIAL_FLOOR_SCHEMA = 1;
export const TURN_LIMIT_MAX = 99;
export const FIRST_CLEAR_STONES_MAX = 1000;

const DIFFICULTIES: readonly Difficulty[] = ["easy", "normal", "hard", "boss", "nightmare"];

/** Điều kiện thắng. Battle engine chưa tự áp; server đánh giá kết quả theo kiểu này ở task sau. */
export type WinCriteria =
  | { readonly kind: "defeatAll" }
  | { readonly kind: "defeatLeader" }
  | { readonly kind: "surviveTurns"; readonly turns: number };

export interface TrialFloorSpec {
  readonly schema: typeof TRIAL_FLOOR_SCHEMA;
  /** Id ổn định "trial.fNN", khớp số tầng. */
  readonly id: string;
  readonly floor: number;
  /** Tăng khi nội dung tầng đổi, để trận/thưởng cũ không so sai bản. */
  readonly contentVersion: number;
  readonly narrative: { readonly title: string; readonly intro: string };
  readonly difficulty: Difficulty;
  readonly rules: FloorRules;
  readonly enemy: {
    /** 1-3 id tướng đối thủ (kho tướng khởi đầu + cửa hàng). */
    readonly foeIds: readonly string[];
    /** Server-only: cấp và hệ số sức mạnh. */
    readonly level: number;
    readonly power: number;
  };
  readonly board: {
    /** Công khai: client dùng để xem trước bàn cờ. */
    readonly publicSeed: number;
    /** Server-only: tỉ lệ rơi ô; thiếu thì dùng chuẩn. */
    readonly weights?: SpawnWeights;
  };
  /** Server-only: muối cho AI/RNG nội bộ của trận; không bao giờ gửi cho client. */
  readonly serverSalt: number;
  /** Số lượt tối đa của người chơi; hết lượt mà chưa thắng là thua. */
  readonly turnLimit: number;
  readonly win: WinCriteria;
  /** Đá lần đầu qua tầng. Chỉ là dữ liệu, chưa phát. */
  readonly firstClearStones: number;
  /** Tầng phải qua trước (null chỉ ở tầng 1). */
  readonly unlock: { readonly requiresFloor: number | null };
}

/** Phần client được thấy: không có hệ số sức mạnh/cấp đối thủ, tỉ lệ rơi ô, muối server. */
export interface TrialFloorPublic {
  readonly id: string;
  readonly floor: number;
  readonly contentVersion: number;
  readonly narrative: TrialFloorSpec["narrative"];
  readonly difficulty: Difficulty;
  readonly rules: FloorRules;
  readonly foeIds: readonly string[];
  readonly publicSeed: number;
  readonly turnLimit: number;
  readonly win: WinCriteria;
  readonly firstClearStones: number;
  readonly unlock: TrialFloorSpec["unlock"];
}

export type TrialFloorIssueCode =
  | "not_object"
  | "unknown_key"
  | "missing_key"
  | "bad_schema"
  | "bad_id"
  | "bad_floor"
  | "bad_version"
  | "bad_text"
  | "bad_difficulty"
  | "bad_enemy"
  | "unknown_foe"
  | "bad_board"
  | "bad_number"
  | "bad_win"
  | "bad_unlock"
  | "bad_rules"
  | "inconsistent";

export interface TrialFloorIssue {
  readonly code: TrialFloorIssueCode;
  readonly path: string;
  readonly message: string;
  readonly ruleIssues?: readonly RuleIssue[];
}

export type ParseTrialFloorResult =
  | { readonly ok: true; readonly spec: TrialFloorSpec }
  | { readonly ok: false; readonly issues: readonly TrialFloorIssue[] };

const FOE_BY_ID: ReadonlyMap<string, FighterConfig> = new Map(
  [...STARTER_COMPANIONS, ...SHOP_COMPANIONS.map((c) => c.fighter)].map((f) => [f.id, f]),
);

const isObj = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === "object" && !Array.isArray(x);
const isInt = (x: unknown, min: number, max: number): x is number =>
  Number.isInteger(x) && (x as number) >= min && (x as number) <= max;
const isU32 = (x: unknown): x is number => isInt(x, 0, 0xffffffff);

export const trialFloorId = (floor: number) => `trial.f${String(floor).padStart(2, "0")}`;

const TOP_KEYS = [
  "schema", "id", "floor", "contentVersion", "narrative", "difficulty", "rules", "enemy",
  "board", "serverSalt", "turnLimit", "win", "firstClearStones", "unlock",
] as const;

function checkKeys(
  o: Record<string, unknown>,
  allowed: readonly string[],
  required: readonly string[],
  path: string,
  issues: TrialFloorIssue[],
) {
  for (const k of Object.keys(o))
    if (!allowed.includes(k))
      issues.push({ code: "unknown_key", path: path ? `${path}.${k}` : k, message: `Khóa lạ: ${k}` });
  for (const k of required)
    if (!(k in o))
      issues.push({ code: "missing_key", path: path ? `${path}.${k}` : k, message: `Thiếu khóa: ${k}` });
}

/** Parse và kiểm tra một tầng; không ném lỗi, trả mọi vấn đề tìm thấy. */
export function parseTrialFloorSpec(raw: unknown): ParseTrialFloorResult {
  const issues: TrialFloorIssue[] = [];
  const add = (code: TrialFloorIssueCode, path: string, message: string) =>
    issues.push({ code, path, message });
  if (!isObj(raw)) return { ok: false, issues: [{ code: "not_object", path: "", message: "Tầng phải là object" }] };

  checkKeys(raw, TOP_KEYS, TOP_KEYS.filter((k) => k !== "rules"), "", issues);
  if (raw.schema !== TRIAL_FLOOR_SCHEMA) add("bad_schema", "schema", `schema phải là ${TRIAL_FLOOR_SCHEMA}`);
  if (!isInt(raw.floor, 1, TRIAL_FLOORS)) add("bad_floor", "floor", `floor phải là 1..${TRIAL_FLOORS}`);
  else if (raw.id !== trialFloorId(raw.floor)) add("bad_id", "id", `id phải là ${trialFloorId(raw.floor)}`);
  if (!isInt(raw.contentVersion, 1, 1_000_000)) add("bad_version", "contentVersion", "contentVersion phải là số nguyên dương");

  const n = raw.narrative;
  if (!isObj(n)) add("bad_text", "narrative", "narrative phải là object");
  else {
    checkKeys(n, ["title", "intro"], ["title", "intro"], "narrative", issues);
    if (typeof n.title !== "string" || !n.title.trim() || n.title.length > 80) add("bad_text", "narrative.title", "title 1..80 ký tự");
    if (typeof n.intro !== "string" || !n.intro.trim() || n.intro.length > 600) add("bad_text", "narrative.intro", "intro 1..600 ký tự");
  }
  if (!DIFFICULTIES.includes(raw.difficulty as Difficulty)) add("bad_difficulty", "difficulty", "difficulty không hợp lệ");

  const rules = raw.rules === undefined ? {} : raw.rules;
  const ruleIssues = validateFloorRules(rules);
  if (ruleIssues.length > 0)
    issues.push({ code: "bad_rules", path: "rules", message: "Luật tầng không hợp lệ", ruleIssues });

  const e = raw.enemy;
  if (!isObj(e)) add("bad_enemy", "enemy", "enemy phải là object");
  else {
    checkKeys(e, ["foeIds", "level", "power"], ["foeIds", "level", "power"], "enemy", issues);
    if (!Array.isArray(e.foeIds) || e.foeIds.length < 1 || e.foeIds.length > 3 || new Set(e.foeIds).size !== e.foeIds.length)
      add("bad_enemy", "enemy.foeIds", "foeIds: 1-3 id không trùng");
    else
      for (const id of e.foeIds)
        if (typeof id !== "string" || !FOE_BY_ID.has(id)) add("unknown_foe", "enemy.foeIds", `Tướng không có: ${String(id)}`);
    if (!isInt(e.level, 1, MAX_LEVEL)) add("bad_enemy", "enemy.level", `level 1..${MAX_LEVEL}`);
    if (typeof e.power !== "number" || !Number.isFinite(e.power) || e.power <= 0 || e.power > 10) add("bad_enemy", "enemy.power", "power trong (0, 10]");
  }

  const b = raw.board;
  if (!isObj(b)) add("bad_board", "board", "board phải là object");
  else {
    checkKeys(b, ["publicSeed", "weights"], ["publicSeed"], "board", issues);
    if (!isU32(b.publicSeed)) add("bad_board", "board.publicSeed", "publicSeed là số nguyên 32 bit không âm");
    if (b.weights !== undefined) {
      if (!isObj(b.weights) || Object.keys(b.weights).some((k) => !(TILE_KINDS as readonly string[]).includes(k)))
        add("bad_board", "board.weights", "weights sai khóa");
      else
        try {
          validateWeights(b.weights as unknown as SpawnWeights);
        } catch (err) {
          add("bad_board", "board.weights", err instanceof Error ? err.message : "weights sai");
        }
    }
  }
  if (!isU32(raw.serverSalt)) add("bad_number", "serverSalt", "serverSalt là số nguyên 32 bit không âm");
  if (!isInt(raw.turnLimit, 1, TURN_LIMIT_MAX)) add("bad_number", "turnLimit", `turnLimit 1..${TURN_LIMIT_MAX}`);
  if (!isInt(raw.firstClearStones, 0, FIRST_CLEAR_STONES_MAX)) add("bad_number", "firstClearStones", `firstClearStones 0..${FIRST_CLEAR_STONES_MAX}`);

  const w = raw.win;
  if (!isObj(w)) add("bad_win", "win", "win phải là object");
  else if (w.kind === "defeatAll" || w.kind === "defeatLeader") checkKeys(w, ["kind"], ["kind"], "win", issues);
  else if (w.kind === "surviveTurns") {
    checkKeys(w, ["kind", "turns"], ["kind", "turns"], "win", issues);
    if (!isInt(w.turns, 1, TURN_LIMIT_MAX)) add("bad_win", "win.turns", `turns 1..${TURN_LIMIT_MAX}`);
    else if (isInt(raw.turnLimit, 1, TURN_LIMIT_MAX) && w.turns > raw.turnLimit)
      add("inconsistent", "win.turns", "turns vượt turnLimit");
  } else add("bad_win", "win.kind", "Loại điều kiện thắng không hợp lệ");

  const u = raw.unlock;
  if (!isObj(u)) add("bad_unlock", "unlock", "unlock phải là object");
  else {
    checkKeys(u, ["requiresFloor"], ["requiresFloor"], "unlock", issues);
    if (isInt(raw.floor, 1, TRIAL_FLOORS)) {
      const want = raw.floor === 1 ? null : raw.floor - 1;
      if (u.requiresFloor !== want) add("bad_unlock", "unlock.requiresFloor", `requiresFloor phải là ${want}`);
    }
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, spec: deepFreeze(structuredClone({ ...raw, rules }) as unknown as TrialFloorSpec) };
}

function deepFreeze<T>(x: T): T {
  if (x && typeof x === "object" && !Object.isFrozen(x)) {
    Object.freeze(x);
    for (const v of Object.values(x)) deepFreeze(v);
  }
  return x;
}

/** JSON ổn định (khóa sắp xếp) để lưu snapshot và so sánh. */
export function canonicalJson(x: unknown): string {
  const norm = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(norm)
      : isObj(v)
        ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, norm(v[k])]))
        : v;
  return JSON.stringify(norm(x));
}

export const serializeTrialFloor = (spec: TrialFloorSpec): string => canonicalJson(spec);

/** Bản gửi client: cắt mọi dữ liệu server-only. */
export function toPublicTrialFloor(spec: TrialFloorSpec): TrialFloorPublic {
  return deepFreeze({
    id: spec.id,
    floor: spec.floor,
    contentVersion: spec.contentVersion,
    narrative: structuredClone(spec.narrative),
    difficulty: spec.difficulty,
    rules: structuredClone(spec.rules),
    foeIds: [...spec.enemy.foeIds],
    publicSeed: spec.board.publicSeed,
    turnLimit: spec.turnLimit,
    win: structuredClone(spec.win),
    firstClearStones: spec.firstClearStones,
    unlock: structuredClone(spec.unlock),
  });
}

/** Cầu nối sang hợp đồng T01.04: định nghĩa tầng và bộ dựng đối thủ theo đúng foeIds. */
export function toFloorDefinition(spec: TrialFloorSpec): FloorDefinition {
  return {
    mode: "trial",
    floor: spec.floor,
    rules: spec.rules,
    enemy: {
      level: spec.enemy.level,
      power: spec.enemy.power,
      count: spec.enemy.foeIds.length as 1 | 2 | 3,
      difficulty: spec.difficulty,
      ...(spec.board.weights ? { weights: spec.board.weights } : {}),
    },
  };
}

export const trialEnemyBuilder =
  (spec: TrialFloorSpec): EnemyBuilder =>
  (e) =>
    spec.enemy.foeIds.map((id) => {
      const base = leveledFoe(FOE_BY_ID.get(id)!, Math.min(MAX_LEVEL, e.level));
      return {
        ...base,
        maxHp: Math.round(base.maxHp * e.power),
        atk: Math.round(base.atk * e.power),
      };
    });

export type RegistryError =
  | { readonly code: "invalid_floor"; readonly index: number; readonly issues: readonly TrialFloorIssue[] }
  | { readonly code: "duplicate_id"; readonly id: string }
  | { readonly code: "non_contiguous"; readonly expected: number; readonly got: number }
  | { readonly code: "incomplete"; readonly expected: number; readonly got: number };

export interface TrialRegistry {
  readonly size: number;
  get(floor: number): TrialFloorSpec | undefined;
  all(): readonly TrialFloorSpec[];
  publicView(floor: number): TrialFloorPublic | undefined;
  /** Chuỗi JSON ổn định của toàn bộ bảng, dùng cho snapshot test. */
  snapshot(): string;
}

export type RegistryResult =
  | { readonly ok: true; readonly registry: TrialRegistry }
  | { readonly ok: false; readonly error: RegistryError };

/**
 * Dựng registry chỉ đọc từ dữ liệu thô. Tầng phải liên tục từ 1; `requireComplete` đòi đủ TRIAL_FLOORS tầng
 * (bật khi phát hành, tắt khi dev/test).
 */
export function createTrialRegistry(
  raws: readonly unknown[],
  opts: { requireComplete?: boolean } = {},
): RegistryResult {
  const specs: TrialFloorSpec[] = [];
  const ids = new Set<string>();
  for (let i = 0; i < raws.length; i++) {
    const r = parseTrialFloorSpec(raws[i]);
    if (!r.ok) return { ok: false, error: { code: "invalid_floor", index: i, issues: r.issues } };
    if (ids.has(r.spec.id)) return { ok: false, error: { code: "duplicate_id", id: r.spec.id } };
    ids.add(r.spec.id);
    if (r.spec.floor !== i + 1)
      return { ok: false, error: { code: "non_contiguous", expected: i + 1, got: r.spec.floor } };
    specs.push(r.spec);
  }
  if (opts.requireComplete && specs.length !== TRIAL_FLOORS)
    return { ok: false, error: { code: "incomplete", expected: TRIAL_FLOORS, got: specs.length } };
  const frozen = Object.freeze([...specs]);
  const registry: TrialRegistry = {
    size: frozen.length,
    get: (floor) => frozen[floor - 1],
    all: () => frozen,
    publicView: (floor) => {
      const s = frozen[floor - 1];
      return s ? toPublicTrialFloor(s) : undefined;
    },
    snapshot: () => canonicalJson(frozen),
  };
  return { ok: true, registry: Object.freeze(registry) };
}
