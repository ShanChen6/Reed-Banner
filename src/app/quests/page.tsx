// Trang nhiệm vụ: điểm danh, nhiệm vụ ngày/tuần, thành tựu.

import type { Metadata } from "next";
import QuestsScreen from "./QuestsScreen";

export const metadata: Metadata = {
  title: "Nhiệm vụ · Cờ Lau",
  description: "Điểm danh mỗi ngày, nhiệm vụ ngày và tuần, thành tựu.",
};

export default function QuestsPage() {
  return <QuestsScreen />;
}
