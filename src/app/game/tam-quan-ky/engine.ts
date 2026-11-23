// Lời nhắn giữa màn chơi và luồng nghĩ của sứ quân (máy). Chạy được cả trong web worker lẫn luồng chính.
import { chooseMove, replay, type Level, type Move } from "@/core/tam-quan-ky";

export type EngineRequest = { id: number; moves: Move[]; level: Level; seed: number };
export type EngineResponse = { id: number; move: Move | null } | { id: number; error: string };

export function handle(request: EngineRequest): EngineResponse {
  const { move } = chooseMove(replay(request.moves), request.level, request.seed, () => performance.now());
  return { id: request.id, move };
}
