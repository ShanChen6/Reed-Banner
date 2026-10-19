// Ký hiệu chữ cho bàn cờ, dùng trong test và khi gỡ lỗi.
// Chữ hoa: ô thường. Chữ thường: ô đặc biệt bản yếu. Chữ số 1–7: bản mạnh. Dấu chấm: ô trống.

import { createBoard, type Board } from "./grid";
import { TILE_KINDS, type Tile, type TileKind } from "./tiles";

const LETTER: Record<TileKind, string> = {
  kiem: "K",
  amDuong: "A",
  banhChung: "B",
  tim: "T",
  vang: "V",
  sach: "S",
  trong: "D",
};

export function tileToChar(tile: Tile | null): string {
  if (!tile) return ".";
  if (tile.special === "strong") return String(TILE_KINDS.indexOf(tile.kind) + 1);
  const letter = LETTER[tile.kind];
  return tile.special === "weak" ? letter.toLowerCase() : letter;
}

export function charToTile(ch: string): Tile | null {
  if (ch === ".") return null;
  const digit = Number(ch);
  if (Number.isInteger(digit) && digit >= 1 && digit <= TILE_KINDS.length) {
    return { kind: TILE_KINDS[digit - 1]!, special: "strong" };
  }
  for (const kind of TILE_KINDS) {
    if (LETTER[kind] === ch) return { kind };
    if (LETTER[kind].toLowerCase() === ch) return { kind, special: "weak" };
  }
  throw new RangeError(`Ký hiệu ô không hợp lệ: ${ch}`);
}

/** Đọc bàn từ các dòng chữ, bỏ khoảng trắng đầu/cuối và dòng rỗng. */
export function parseBoard(text: string): Board {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const rows = lines.length;
  const cols = lines[0]?.length ?? 0;
  if (lines.some((l) => l.length !== cols)) throw new RangeError("Các dòng phải dài bằng nhau");
  return createBoard(cols, rows, lines.flatMap((l) => [...l].map(charToTile)));
}

export function formatBoard(board: Board): string {
  const lines: string[] = [];
  for (let row = 0; row < board.rows; row++) {
    lines.push(board.cells.slice(row * board.cols, (row + 1) * board.cols).map(tileToChar).join(""));
  }
  return lines.join("\n");
}
