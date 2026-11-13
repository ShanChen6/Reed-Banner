// Smoke test: mọi màn mở được, không lỗi JS, không lỗi máy chủ, không tràn ngang; vài luồng chính đi được tới trận.
// Không kiểm luật chơi (việc của test đơn vị trong tests/), chỉ kiểm game còn chạy được trên trình duyệt thật.
import { expect, test } from "@playwright/test";
import { SCENES, SCENE_SLUG, SCENE_TITLE, type Scene } from "../src/app/game/scene";
import { expectClean, expectNoHorizontalOverflow, registerAccount, watchProblems } from "./helpers";

/** Màn tài khoản và màn trận có test riêng; mọi màn còn lại lấy thẳng từ danh sách phân cảnh nên màn mới tự được kiểm. */
const SKIPPED: readonly Scene[] = ["PLAYING", "LOGIN", "REGISTER", "FORGOT_PASSWORD", "RESET_PASSWORD"];
const SCREENS = SCENES.filter((scene) => !SKIPPED.includes(scene));

test("trang chủ mở được", async ({ page }) => {
  const problems = watchProblems(page);
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("h1").first()).toBeAttached();
  await expectNoHorizontalOverflow(page);
  expectClean(problems);
});

test("khách chơi được trận Thao Luyện", async ({ page }) => {
  const problems = watchProblems(page);
  // Thao Luyện vào thẳng một trận offline, không qua sảnh chọn đội.
  await page.goto("/game/practice");
  await expect(page.getByRole("grid", { name: "Bàn cờ" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expectClean(problems);
});

test("khách bị chặn ở chế độ xếp hạng và thấy màn nhắc đăng nhập", async ({ page }) => {
  const problems = watchProblems(page);
  await page.goto("/game/destiny");
  await expect(page.getByRole("link", { name: "Đăng nhập để chơi" })).toBeVisible();
  expectClean(problems);
});

test.describe("tài khoản đã đăng nhập", () => {
  test.beforeEach(async ({ page }) => {
    await registerAccount(page);
  });

  test("mọi màn mở được, không lỗi, không tràn ngang", async ({ page }) => {
    test.setTimeout(240_000);
    const problems = watchProblems(page);
    for (const scene of SCREENS) {
      const name = SCENE_TITLE[scene];
      await test.step(name, async () => {
        await page.goto(`/game/${SCENE_SLUG[scene]}`);
        await page.waitForLoadState("networkidle");
        await expect(page.getByRole("banner"), `${name}: thanh đầu trang hiện tên màn`).toContainText(name);
        await expect(page.getByText(/^(Không tải được|Chưa mở được|Chưa nhận được)/), `${name}: tải được dữ liệu`).toHaveCount(0);
        await expectNoHorizontalOverflow(page);
        expectClean(problems);
      });
    }
  });

  test("Giao Tranh online tạo được trận trên máy chủ", async ({ page }) => {
    const problems = watchProblems(page);
    await page.goto("/game/play");
    await page.getByRole("button", { name: "Vào trận" }).click();
    await expect(page.getByRole("grid", { name: "Bàn cờ" })).toBeVisible();
    expectClean(problems);
  });

  test("Tháp Thiên Mệnh: khóa đội hình, chuẩn bị tầng 1, vào trận", async ({ page }) => {
    const problems = watchProblems(page);
    await page.goto("/game/destiny");
    // Mặc định đã chọn mọi tướng đang có.
    await page.getByRole("button", { name: "Khóa đội hình và bắt đầu leo" }).click();
    await expect(page.getByRole("heading", { name: /Chuẩn bị tầng 1\// })).toBeVisible();
    // Dừng phải xác nhận; bấm Leo tiếp thì giữ nguyên lượt leo.
    await page.getByRole("button", { name: "Dừng lượt leo" }).click();
    await page.getByRole("button", { name: "Leo tiếp" }).click();
    await page.getByRole("button", { name: "Đánh tầng 1" }).click();
    await expect(page.getByRole("grid", { name: "Bàn cờ" })).toBeVisible();
    expectClean(problems);
  });

  test("Tháp Thí Luyện: mở tầng 1 và thấy nút vào tầng", async ({ page }) => {
    const problems = watchProblems(page);
    await page.goto("/game/trial");
    await expect(page.getByRole("button", { name: "Vào tầng" })).toBeVisible();
    expectClean(problems);
  });
});
