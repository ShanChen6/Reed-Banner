import type { NextConfig } from "next";

// Các trang cũ nay là phân cảnh của màn chơi /game; giữ đường dẫn cũ để link đã chia sẻ (và iframe ShanVerse
// trỏ tới /demo) vẫn chạy. Tham số (?returnTo=, ?resume=, ?theme=, …) được giữ nguyên khi chuyển.
const OLD_PAGES: Record<string, string> = {
  "/play": "/game/play",
  "/demo": "/game/practice",
  "/campaign": "/game/campaign",
  // Leo tháp cũ đã gỡ (còn Tháp Thí Luyện và Tháp Vận Mệnh): link cũ về màn chính.
  "/tower": "/game",
  "/game/tower": "/game",
  "/survival": "/game/survival",
  "/daily": "/game/daily",
  "/arena": "/game/arena",
  "/quests": "/game/quests",
  "/leaderboard": "/game/leaderboard",
  "/profile": "/game/profile",
  "/login": "/game/login",
  "/register": "/game/register",
  "/account": "/game/account",
  "/dang-nhap": "/game/login",
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  redirects: async () => [
    { source: "/login", has: [{ type: "query", key: "form", value: "register" }], destination: "/game/register", permanent: true },
    ...Object.entries(OLD_PAGES).map(([source, destination]) => ({ source, destination, permanent: true })),
  ],
};

export default nextConfig;
