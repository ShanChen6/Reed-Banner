// Trang leo tháp: lượt leo đang dở, chọn phần thưởng giữa các tầng. Bấm Lên tầng thì server tạo trận rồi
// chuyển sang /play để đánh.

import type { Metadata } from "next";
import TowerScreen from "./TowerScreen";

export const metadata: Metadata = {
  title: "Leo tháp · Cờ Lau",
  description:
    "Leo tháp: chuỗi trận 3vs3 mạnh dần, máu và lương mang sang giữa các tầng.",
};

export default function TowerPage() {
  return <TowerScreen />;
}
