// Sinh quân từ RNG có seed. Không dùng Math.random hay Date; trạng thái RNG là một số nguyên lưu trong state.

import type { Rng } from "../rng";
import { charactersFor } from "./catalog";
import type { Cell, NormalPiece, Piece, Ruleset } from "./types";

/**
 * Quân kế tiếp. `previous` là quân vừa dùng: sau một quân đặc biệt luôn ra quân thường (chống chuỗi đặc biệt); không sinh Thu Hồi khi bàn trống; nhân vật dung hợp cũng không ra liền sau một quân đặc biệt.
 * **Quân thường luôn liên quan tới bàn** (Shan chốt 02/11/2026): khi bàn đã có quân thường, quân mới chia sẻ ít nhất một nghề hoặc một hệ với một
 * quân thường đang trên bàn (không cần còn chỗ đặt), với xác suất `relatedPermille` của bậc; phần còn lại ra ngẫu nhiên hoàn toàn. Mục đích: không phải bỏ liền nhiều quân không dính gì tới nhau, nhưng vẫn có quân liên quan mà không có chỗ đặt, để Bỏ Lệnh còn tác dụng. Chống phải bỏ liền nhiều quân không dính gì tới nhau. Quân đặc biệt (Quân Lệnh,
 * Thu Hồi, dung hợp) ra theo tỉ lệ riêng, không cần liên quan.
 * Thứ tự gọi RNG cố định: một lần chọn loại, rồi (nếu quân thường) [quân neo, nghề-hay-hệ khi bàn có quân thường], nghề, hệ, người đại diện.
 */
export function nextPiece(rng: Rng, rules: Ruleset, serial: number, previous: Piece | null, cells: readonly Cell[]): Piece {
  const uid = `p${serial}`;
  const boardHasPieces = cells.some((c) => c.piece !== null);
  const roll = rng.int(0, 999);
  if (previous === null || previous.kind === "normal") {
    if (roll < rules.wildPermille) return { kind: "wild", uid };
    // Bàn chưa có quân thì Thu Hồi vô dụng: nhường chỗ cho quân thường.
    if (boardHasPieces && roll < rules.wildPermille + rules.eraserPermille) return { kind: "eraser", uid };
    // Nhân vật dung hợp dùng chung lần tung với các quân đặc biệt khác: danh sách rỗng thì dãy quân không đổi so với trước.
    const lo = rules.wildPermille + rules.eraserPermille;
    if (rules.fusions.length > 0 && roll >= lo && roll < lo + rules.fusionPermille) {
      const who = rules.fusions[rng.int(0, rules.fusions.length - 1)]!;
      return { kind: "fusion", uid, characterId: who.characterId };
    }
  }
  // Quân neo là một quân thường bất kỳ trên bàn, KHÔNG cần còn chỗ trống kề bên: quân sinh ra có thể liên quan mà vẫn không đặt được, lúc đó Bỏ Lệnh mới có ý nghĩa.
  const anchors: NormalPiece[] = [];
  for (const c of cells) if (c.piece?.kind === "normal") anchors.push(c.piece);
  let anchor: NormalPiece | null = null;
  let keepProfession = false;
  if (anchors.length > 0) {
    const relatedRoll = rng.int(0, 999);
    const who = rng.int(0, anchors.length - 1);
    keepProfession = rng.int(0, 1) === 0;
    if (relatedRoll < rules.relatedPermille) anchor = anchors[who]!;
  }
  const pickedProfession = rules.professions[rng.int(0, rules.professions.length - 1)]!;
  const pickedElement = rules.elements[rng.int(0, rules.elements.length - 1)]!;
  const profession = anchor && keepProfession ? anchor.profession : pickedProfession;
  const element = anchor && !keepProfession ? anchor.element : pickedElement;
  const people = charactersFor(profession, element);
  const who = people[rng.int(0, people.length - 1)]!;
  return { kind: "normal", uid, characterId: who.characterId, profession, element };
}

/**
 * Rải ô chướng ngại theo seed. Mỗi ô chỉ được chặn nếu các ô còn lại vẫn liền nhau (4 hướng), nên không có vùng
 * bị cô lập. Thứ tự gọi RNG cố định: xáo toàn bộ ô một lượt (Fisher–Yates), rồi duyệt tuần tự.
 */
export function generateObstacles(rng: Rng, width: number, height: number, percent: number): boolean[] {
  const total = width * height;
  const blocked = new Array<boolean>(total).fill(false);
  const want = Math.min(Math.round((total * percent) / 100), total - 1);
  if (want <= 0) return blocked;
  const order = Array.from({ length: total }, (_, i) => i);
  for (let i = total - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  let placed = 0;
  for (const cell of order) {
    if (placed >= want) break;
    blocked[cell] = true;
    if (freeCellsConnected(blocked, width, height)) placed += 1;
    else blocked[cell] = false;
  }
  return blocked;
}

function freeCellsConnected(blocked: readonly boolean[], width: number, height: number): boolean {
  const total = width * height;
  const start = blocked.findIndex((b) => !b);
  if (start < 0) return false;
  const seen = new Set<number>([start]);
  const stack = [start];
  while (stack.length) {
    const at = stack.pop()!;
    const r = Math.floor(at / width);
    const c = at % width;
    for (const n of [r > 0 ? at - width : -1, r < height - 1 ? at + width : -1, c > 0 ? at - 1 : -1, c < width - 1 ? at + 1 : -1]) {
      if (n >= 0 && !blocked[n] && !seen.has(n)) {
        seen.add(n);
        stack.push(n);
      }
    }
  }
  return seen.size === blocked.filter((b) => !b).length && total > 0;
}
