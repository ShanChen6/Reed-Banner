// Trang đấu trường bóng ma: điểm, đội phòng thủ, các đối thủ đang bày. Bấm Đánh thì server tạo trận rồi
// chuyển sang /play.

import type { Metadata } from "next";
import ArenaScreen from "./ArenaScreen";

export const metadata: Metadata = {
  title: "Đấu trường bóng ma · Cờ Lau",
  description:
    "PvP không đồng bộ: đánh với đội phòng thủ của người chơi khác do AI điều khiển, leo bảng điểm đấu trường.",
};

export default function ArenaPage() {
  return <ArenaScreen />;
}
