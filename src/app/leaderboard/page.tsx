// Trang bảng xếp hạng: chiến dịch, từng màn, tháp, sinh tồn.

import type { Metadata } from "next";
import LeaderboardScreen from "./LeaderboardScreen";

export const metadata: Metadata = {
  title: "Bảng xếp hạng · Cờ Lau",
  description:
    "Bảng xếp hạng Cờ Lau: tiến độ chiến dịch, ít lượt nhất mỗi màn, leo tháp, sinh tồn.",
};

export default function LeaderboardPage() {
  return <LeaderboardScreen />;
}
