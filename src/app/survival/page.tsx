// Trang sinh tồn: kỷ lục, đội ra trận, luật đợt. Bấm Bắt đầu thì server tạo trận rồi chuyển sang /play để đánh.

import type { Metadata } from "next";
import SurvivalScreen from "./SurvivalScreen";

export const metadata: Metadata = {
  title: "Sinh tồn · Cờ Lau",
  description:
    "Sinh tồn: một trận 3vs3 không dừng, đối thủ kéo đến theo đợt mạnh dần trên cùng bàn cờ.",
};

export default function SurvivalPage() {
  return <SurvivalScreen />;
}
