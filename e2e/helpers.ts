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
  // Trên điện thoại, nội dung tràn làm trình duyệt nới khung nhìn (innerWidth lớn hơn bề rộng máy) nên so với bề rộng
  // khung nhìn đã đặt, không so với innerWidth.
  const width = page.viewportSize()?.width ?? 0;
  const overflow = await page.evaluate((w) => Math.max(document.documentElement.scrollWidth, window.innerWidth) - (w || window.innerWidth), width);
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

/** Điện thoại (dự án Playwright "mobile"): Hướng dẫn là bảng trượt đáy mở từ nút "?", không phải thẻ. */
export function isPhone(): boolean {
  return test.info().project.name === "mobile";
}

/**
 * Vào chế độ nào cũng gặp Hướng dẫn trước (19/11/2026): bấm "Vào chơi" để sang thẻ Chơi. Trên điện thoại Hướng dẫn tự
 * mở thành bảng trượt đáy ở lần đầu vào chế độ (21/11/2026): bấm "Vào chơi" trong bảng để đóng; đã đóng một lần thì thôi.
 */
export async function playMode(page: Page): Promise<void> {
  if (isPhone()) {
    const sheet = page.getByRole("dialog", { name: "Hướng dẫn" });
    // Đã đóng bảng ở lần vào trước (cùng trình duyệt) thì bảng không tự mở nữa.
    const shown = await sheet.waitFor({ state: "visible", timeout: 5_000 }).then(() => true, () => false);
    if (!shown) return;
    await sheet.getByRole("button", { name: "Vào chơi" }).click();
    await expect(sheet).toBeHidden();
    return;
  }
  // Màn vừa một màn hình (từ 1280px) bỏ nút "Vào chơi" ở Hướng dẫn: bấm thẻ chơi (thẻ đầu) thay vào.
  const enter = page.getByRole("button", { name: "Vào chơi" });
  const playTab = page.getByRole("tablist", { name: "Màn chế độ" }).getByRole("tab").first();
  await expect(enter.or(playTab).first()).toBeVisible();
  if (await enter.isVisible()) await enter.click();
  else await playTab.click();
}

/** Tên các thẻ chế độ như người chơi thấy: điện thoại không có thẻ Hướng dẫn. */
export function modeTabs(...tabs: string[]): string[] {
  return isPhone() ? tabs : [...tabs, "Hướng dẫn"];
}
