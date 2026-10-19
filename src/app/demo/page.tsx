import type { Metadata } from "next";
import DemoGame from "./DemoGame";

export const metadata: Metadata = {
  title: "Chơi thử · Cờ Lau",
  description: "Trận chơi thử offline: Đinh Bộ Lĩnh và đồng đội đấu AI Tianwu.",
};

export default async function DemoPage({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  const { theme } = await searchParams;
  return <DemoGame theme={theme === "light" ? "light" : "dark"} />;
}
