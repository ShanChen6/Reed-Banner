import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Đường dẫn cũ tiếng Việt, giữ để link đã chia sẻ vẫn chạy.
  redirects: async () => [{ source: "/dang-nhap", destination: "/login", permanent: true }],
};

export default nextConfig;
