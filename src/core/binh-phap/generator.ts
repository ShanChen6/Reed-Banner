// Sinh quân từ RNG có seed. Không dùng Math.random hay Date; trạng thái RNG là một số nguyên lưu trong state.

import type { Rng } from "../rng";
import { charactersFor } from "./catalog";
import type { Piece, Ruleset } from "./types";

/**
 * Quân kế tiếp. `previous` là quân vừa dùng: sau một quân đặc biệt luôn ra quân thường (chống chuỗi đặc biệt); không sinh Thu Hồi khi bàn trống.
 * Thứ tự gọi RNG cố định: một lần chọn loại, rồi (nếu quân thường) nghề, hệ, người đại diện.
 */
export function nextPiece(rng: Rng, rules: Ruleset, serial: number, previous: Piece | null, boardHasPieces: boolean): Piece {
  const uid = `p${serial}`;
  const roll = rng.int(0, 999);
  if (previous === null || previous.kind === "normal") {
    if (roll < rules.wildPermille) return { kind: "wild", uid };
    // Bàn chưa có quân thì Thu Hồi vô dụng: nhường chỗ cho quân thường.
    if (boardHasPieces && roll < rules.wildPermille + rules.eraserPermille) return { kind: "eraser", uid };
  }
  const profession = rules.professions[rng.int(0, rules.professions.length - 1)]!;
  const element = rules.elements[rng.int(0, rules.elements.length - 1)]!;
  const people = charactersFor(profession, element);
  const who = people[rng.int(0, people.length - 1)]!;
  return { kind: "normal", uid, characterId: who.characterId, profession, element };
}
