import { expect, test, type Page } from "@playwright/test";

/**
 * Ghi lại lỗi JS trên trang và phản hồi 5xx cùng nguồn. Gọi ở đầu test, kiểm ở cuối bằng `expectClean`.
 * Phản hồi 401/403/404 là hợp lệ (khách bị chặn, cờ tắt) nên không tính.
 */
export function watchProblems(page: Page): string[] {
  const problems: string[] = [];
  const origin = new URL(test.info().project.use.baseURL ?? "http://localhost").origin;
  page.on("pageerror", (error) => problems.push(`Lỗi JS: ${error.message.slice(0, 200)}`));
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (response.status() >= 500 && url.origin === origin) problems.push(`${response.status()} ${url.pathname}`);
  });
  return problems;
}

export function expectClean(problems: readonly string[]): void {
  expect(problems, "Không có lỗi JS hay lỗi máy chủ").toEqual([]);
}

/** Không có thanh cuộn ngang (lỗi bố cục hay gặp nhất trên điện thoại). */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, "Trang không tràn ngang").toBeLessThanOrEqual(1);
}

/** Đăng ký một tài khoản mới (kho trong bộ nhớ của bản test) và chờ về màn chính. */
export async function registerAccount(page: Page): Promise<string> {
  const username = `e2e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const password = "E2e-test-password-1";
  await page.goto("/game/register");
  await page.fill("input[name=username]", username);
  await page.fill("input[name=password]", password);
  await page.fill("input[name=confirm]", password);
  await Promise.all([
    page.waitForURL((url) => url.pathname.startsWith("/game") && !/\/(login|register)/.test(url.pathname)),
    page.locator("form:has(input[name=confirm]) button[type=submit]").click(),
  ]);
  return username;
}
