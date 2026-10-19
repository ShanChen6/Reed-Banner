import type { Metadata } from "next";
import DemoGame from "../demo/DemoGame";

export const metadata: Metadata = {
  title: "Chơi online · Cờ Lau",
  description: "Trận online do server xử lý: Đinh Bộ Lĩnh và đồng đội đấu AI Tianwu, mỗi lượt 30 giây.",
};

export default async function PlayPage({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  const { theme } = await searchParams;
  return <DemoGame theme={theme === "light" ? "light" : "dark"} online />;
}
