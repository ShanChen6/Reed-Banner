// Smoke test trình duyệt (quy trình test tầng 2, docs/07-architecture/quy-trinh-test.md).
// Chạy bản build production thật với kho trong bộ nhớ: không cần database, SMTP hay khóa OAuth.
//   pnpm e2e              build rồi chạy toàn bộ (khoảng 3 phút)
//   E2E_BASE_URL=http://localhost:3000 pnpm exec playwright test   chạy vào server đang mở sẵn, bỏ qua build
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const external = process.env.E2E_BASE_URL;

/** Bật mọi chế độ đang ẩn sau cờ để smoke test đi qua hết. Khóa dưới đây chỉ dùng cho test, không phải bí mật thật. */
const SERVER_ENV = {
  SESSION_SECRET: "e2e-only-session-secret-0123456789",
  TRIAL_ENABLED: "true",
  DESTINY_ENABLED: "true",
  EXPEDITION_ENABLED: "true",
  TAM_TUONG_KY_ENABLED: "true",
  FORMATION_RANKED_ENABLED: "true",
  DATABASE_URL: "",
  NEXT_TELEMETRY_DISABLED: "1",
};

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: external ?? `http://localhost:${PORT}`,
    trace: "off",
    screenshot: "only-on-failure",
    locale: "vi-VN",
    timezoneId: "Asia/Ho_Chi_Minh",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: external ? undefined : {
    command: `pnpm exec next build && pnpm exec next start -p ${PORT}`,
    url: `http://localhost:${PORT}/game`,
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
    env: SERVER_ENV,
    stdout: "ignore",
    stderr: "pipe",
  },
});
