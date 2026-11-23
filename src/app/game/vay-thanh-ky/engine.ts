// Lời nhắn giữa màn chơi và luồng nghĩ của máy (sứ quân). Chạy được cả trong web worker lẫn luồng chính.
import { chooseMove, guessDead, replay, type BoardSize, type Level, type Mode } from "@/core/co-vay";

type Common = { id: number; size: BoardSize; mode: Mode; moves: number[]; seed: number };
export type EngineRequest = (Common & { kind: "move"; level: Level }) | (Common & { kind: "dead" });
export type EngineResponse =
  | { id: number; kind: "move"; move: number; resign: boolean }
  | { id: number; kind: "dead"; dead: number[] }
  | { id: number; kind: "error"; message: string };

export function handle(request: EngineRequest): EngineResponse {
  const pos = replay(request.size, request.mode, request.moves);
  if (!pos) return { id: request.id, kind: "error", message: "illegal move record" };
  if (request.kind === "dead") return { id: request.id, kind: "dead", dead: guessDead(pos, request.seed) };
  const { move, resign } = chooseMove(pos, request.level, request.seed, () => performance.now());
  return { id: request.id, kind: "move", move, resign };
}
