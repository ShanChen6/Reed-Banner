// Thoại ngắn của Đinh Bộ Lĩnh trong Tam Quân Kỳ (Shan yêu cầu 23/11/2026). Lời game sáng tác cho buổi tập trận trên sa bàn,
// không phải lời nhân vật lịch sử. Bộ Lĩnh luôn cầm quân Đỏ, nên thoại nói theo phía quân Đỏ dù bạn cầm phe nào.

import { RED, inCheck, stackPieces, type Position } from "@/core/tam-quan-ky";

export type LineKind = "start" | "check" | "checked" | "hero" | "win" | "lose" | "draw";

export const BO_LINH_LINES: Readonly<Record<LineKind, readonly string[]>> = {
  start: [
    "Cờ lau đã dựng. Quân ta nghe hiệu trống mà tiến!",
    "Sa bàn này là đất Hoa Lư, ta thuộc từng gò từng lạch.",
    "Bộ binh giữ đất, thuyền giữ đầm, thiên mã chờ lệnh. Bày trận!",
  ],
  check: [
    "Chiếu tướng! Chủ tướng bên kia liệu mà giữ mình.",
    "Vây lại, đừng để hắn thoát qua cầu tre.",
    "Một nước nữa thôi, siết chặt vòng vây!",
  ],
  checked: [
    "Che chở chủ tướng! Lui quân về sát bên.",
    "Bị chiếu rồi. Bình tĩnh, gỡ từng nước một.",
    "Giữ vững soái trướng, đừng để họ thừa cơ.",
  ],
  hero: [
    "Giỏi lắm! Cắm bông lau vàng cho người này.",
    "Có công chiếu tướng, từ nay ngươi là anh hùng của trận.",
  ],
  win: [
    "Trận tập hôm nay quân ta thắng. Mai lại bày sa bàn mới!",
    "Cờ lau phất cao! Ai theo ta, ai cũng có phần công.",
  ],
  lose: [
    "Thua một ván, học được một bài. Bày lại sa bàn!",
    "Họ đánh khéo thật. Lần sau ta giữ cầu tre chặt hơn.",
  ],
  draw: ["Hai bên cùng cạn nước đi. Hòa cũng là một bài học."],
};

const redHeroes = (pos: Position) =>
  pos.board.reduce((n, s) => n + (s && s.carrier.color === RED ? stackPieces(s).filter((p) => p.hero).length : 0), 0);

/** Thoại sau một nước đi: thắng thua trước, rồi chiếu tướng, rồi có anh hùng mới bên Đỏ. Null là im lặng. */
export function lineAfterMove(before: Position, after: Position): LineKind | null {
  if (after.result) return after.result.winner === null ? "draw" : after.result.winner === RED ? "win" : "lose";
  if (inCheck(after, after.toMove)) return after.toMove === RED ? "checked" : "check";
  if (redHeroes(after) > redHeroes(before)) return "hero";
  return null;
}

/** Chọn một câu theo số nước đã đi, để cùng một ván luôn ra cùng câu và câu đổi dần qua các lần. */
export const pickLine = (kind: LineKind, turn: number): string => {
  const list = BO_LINH_LINES[kind];
  return list[turn % list.length]!;
};
