// Lưu và nạp ván dở. Đọc ngược fail-closed: bất kỳ trường nào sai kiểu hay sai luật thì trả null, không ném lỗi.

import { ELEMENTS, PROFESSIONS } from "../battle";
import { playableCount } from "./rules";
import { RULESETS, SCHEMA_VERSION } from "./rulesets";
import type { BoardPiece, Cell, Piece, PuzzleState } from "./types";

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isInt = (v: unknown, min: number, max: number): v is number => Number.isInteger(v) && (v as number) >= min && (v as number) <= max;
const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0 && v.length <= 64;

/** Tập không rỗng, không trùng, mọi phần tử thuộc danh sách cho phép. */
function parseSet(v: unknown, allowed: readonly string[]): string[] | null {
  if (!Array.isArray(v) || v.length === 0 || v.length > allowed.length) return null;
  if (!v.every((x) => typeof x === "string" && allowed.includes(x))) return null;
  return new Set(v).size === v.length ? (v as string[]) : null;
}

function parsePiece(v: unknown, allowEraser: boolean): Piece | null {
  if (!isObj(v) || !isStr(v.uid)) return null;
  if (v.kind === "wild") return { kind: "wild", uid: v.uid };
  if (v.kind === "eraser") return allowEraser ? { kind: "eraser", uid: v.uid } : null;
  if (v.kind === "multi") {
    if (!isStr(v.characterId)) return null;
    const professions = parseSet(v.professions, PROFESSIONS);
    const elements = parseSet(v.elements, ELEMENTS);
    if (!professions || !elements) return null;
    return { kind: "multi", uid: v.uid, characterId: v.characterId, professions: professions as never, elements: elements as never };
  }
  if (v.kind !== "normal" || !isStr(v.characterId)) return null;
  const { profession, element } = v;
  if (!(PROFESSIONS as readonly unknown[]).includes(profession) || !(ELEMENTS as readonly unknown[]).includes(element)) return null;
  return { kind: "normal", uid: v.uid, characterId: v.characterId, profession: profession as never, element: element as never };
}

export function serializePuzzle(state: PuzzleState): string {
  return JSON.stringify(state);
}

export function parsePuzzle(raw: unknown): PuzzleState | null {
  try {
    const v = typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;
    if (!isObj(v) || v.schemaVersion !== SCHEMA_VERSION) return null;
    const rules = RULESETS.find((r) => r.id === v.rulesetId && r.version === v.rulesVersion);
    if (!rules) return null;
    const sizeOk = (n: unknown, fixed: number) => (rules.randomSize ? isInt(n, rules.randomSize.min, rules.randomSize.max) : n === fixed);
    if (!sizeOk(v.width, rules.width) || !sizeOk(v.height, rules.height)) return null;
    if (!Array.isArray(v.cells) || v.cells.length !== (v.width as number) * (v.height as number)) return null;
    const cells: Cell[] = [];
    let covered = 0;
    for (const c of v.cells as unknown[]) {
      if (!isObj(c) || typeof c.covered !== "boolean" || typeof c.blocked !== "boolean") return null;
      if (c.blocked && (c.covered || c.piece !== null)) return null;
      let piece: BoardPiece | null = null;
      if (c.piece !== null) {
        const p = parsePiece(c.piece, false);
        if (!p || p.kind === "eraser") return null;
        piece = p;
      }
      // Quân đang nằm trên bàn thì ô chắc chắn đã khai thông.
      if (piece && !c.covered) return null;
      if (c.covered) covered += 1;
      cells.push({ blocked: c.blocked, covered: c.covered, piece });
    }
    const hand = parsePiece(v.hand, true);
    if (!hand) return null;
    const phase = v.phase;
    if (phase !== "playing" && phase !== "won" && phase !== "lost") return null;
    if (v.coveredCount !== covered) return null;
    const playable = playableCount(cells);
    if (playable === 0) return null;
    if (phase === "won" && covered !== playable) return null;
    if (phase === "playing" && covered === playable) return null;
    if (!isInt(v.seed, 0, 0xffffffff) || !isInt(v.rngState, 0, 0xffffffff)) return null;
    if (!isInt(v.discardHeat, 0, rules.maxHeat)) return null;
    const counters = [v.score, v.placed, v.discarded, v.linesCleared, v.turn];
    if (!counters.every((n) => isInt(n, 0, 1e9))) return null;
    return {
      schemaVersion: SCHEMA_VERSION,
      rulesetId: rules.id,
      rulesVersion: rules.version,
      seed: v.seed as number,
      width: v.width as number,
      height: v.height as number,
      cells,
      hand,
      discardHeat: v.discardHeat as number,
      score: v.score as number,
      placed: v.placed as number,
      discarded: v.discarded as number,
      linesCleared: v.linesCleared as number,
      coveredCount: covered,
      phase,
      turn: v.turn as number,
      rngState: v.rngState as number,
    };
  } catch {
    return null;
  }
}
