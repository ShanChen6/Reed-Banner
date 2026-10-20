// Trang thử thách hằng ngày: đề hôm nay, lượt của mình, bảng xếp hạng. Bấm Đánh thì server tạo trận rồi
// chuyển sang /play.

import type { Metadata } from "next";
import DailyScreen from "./DailyScreen";

export const metadata: Metadata = {
  title: "Thử thách ngày · Cờ Lau",
  description:
    "Thử thách hằng ngày: một đề chung cho mọi người, mỗi người đánh một lần, xếp hạng theo số lượt.",
};

export default function DailyPage() {
  return <DailyScreen />;
}
