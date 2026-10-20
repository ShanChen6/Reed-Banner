// Trang chiến dịch: bản đồ các màn chương 1, lương mang sang, doanh trại. Bấm Xuất quân thì server tạo trận
// theo màn rồi chuyển sang /play để đánh.

import type { Metadata } from "next";
import CampaignScreen from "./CampaignScreen";

export const metadata: Metadata = {
  title: "Chiến dịch · Cờ Lau",
  description:
    "Chiến dịch Cờ lau dẹp loạn: Đinh Bộ Lĩnh từ thuở chăn trâu tới khi dẹp xong 12 sứ quân.",
};

export default function CampaignPage() {
  return <CampaignScreen />;
}
