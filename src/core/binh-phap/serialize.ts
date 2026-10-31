// Lưu và nạp ván dở. Đọc ngược fail-closed: bất kỳ trường nào sai kiểu hay sai luật thì trả null, không ném lỗi.

import { ELEMENTS, PROFESSIONS } from "../battle";
import { RULESETS, SCHEMA_VERSION } from "./rulesets";
import type { BoardPiece, Cell, Piece, PuzzleState } from "./types";

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isInt = (v: unknown, min: number, max: number): v is number => Number.isInteger(v) && (v as number) >= min && (v as number) <= max;
const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0 && v.length <= 64;

function parsePiece(v: unknown, allowEraser: boolean): Piece | null {
  if (!isObj(v) || !isStr(v.uid)) return null;
  if (v.kind === "wild") return { kind: "wild", uid: v.uid };
  if (v.kind === "eraser") return allowEraser ? { kind: "eraser", uid: v.uid } : null;
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
    if (v.width !== rules.width || v.height !== rules.height) return null;
    if (!Array.isArray(v.cells) || v.cells.length !== rules.width * rules.height) return null;
    const cells: Cell[] = [];
    let covered = 0;
    for (const c of v.cells as unknown[]) {
      if (!isObj(c) || typeof c.covered !== "boolean") return null;
      let piece: BoardPiece | null = null;
      if (c.piece !== null) {
        const p = parsePiece(c.piece, false);
        if (!p || p.kind === "eraser") return null;
        piece = p;
      }
      // Quân đang nằm trên bàn thì ô chắc chắn đã khai thông.
      if (piece && !c.covered) return null;
      if (c.covered) covered += 1;
      cells.push({ covered: c.covered, piece });
    }
    const hand = parsePiece(v.hand, true);
    if (!hand) return null;
    const phase = v.phase;
    if (phase !== "playing" && phase !== "won" && phase !== "lost") return null;
    if (v.coveredCount !== covered) return null;
    if (phase === "won" && covered !== cells.length) return null;
    if (phase === "playing" && covered === cells.length) return null;
    if (!isInt(v.seed, 0, 0xffffffff) || !isInt(v.rngState, 0, 0xffffffff)) return null;
    if (!isInt(v.discardHeat, 0, rules.maxHeat)) return null;
    const counters = [v.score, v.placed, v.discarded, v.linesCleared, v.turn];
    if (!counters.every((n) => isInt(n, 0, 1e9))) return null;
    return {
      schemaVersion: SCHEMA_VERSION,
      rulesetId: rules.id,
      rulesVersion: rules.version,
      seed: v.seed as number,
      width: rules.width,
      height: rules.height,
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
