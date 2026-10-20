import type { NextConfig } from "next";

// Các trang cũ nay là phân cảnh của màn chơi /game; giữ đường dẫn cũ để link đã chia sẻ (và iframe ShanVerse
// trỏ tới /demo) vẫn chạy. Tham số (?returnTo=, ?resume=, ?theme=, …) được giữ nguyên khi chuyển.
const OLD_PAGES: Record<string, string> = {
  "/play": "/game/play",
  "/demo": "/game/practice",
  "/campaign": "/game/campaign",
  "/tower": "/game/tower",
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
