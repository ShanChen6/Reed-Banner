import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Đường dẫn cũ, giữ để link đã chia sẻ vẫn chạy.
  redirects: async () => [
    { source: "/dang-nhap", destination: "/login", permanent: true },
    { source: "/login", has: [{ type: "query", key: "form", value: "register" }], destination: "/register", permanent: true },
  ],
};

export default nextConfig;
