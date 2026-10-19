import type { Metadata } from "next";
import DemoGame from "../demo/DemoGame";
import AccountBar from "./AccountBar";

export const metadata: Metadata = {
  title: "Chơi online · Cờ Lau",
  description: "Trận online do server xử lý: Đinh Bộ Lĩnh và đồng đội đấu AI Tianwu, mỗi lượt 30 giây.",
};

export default async function PlayPage({ searchParams }: { searchParams: Promise<{ theme?: string; login?: string }> }) {
  const { theme, login } = await searchParams;
  return <DemoGame theme={theme === "light" ? "light" : "dark"} online account={<AccountBar loginError={login === "error"} />} />;
}
