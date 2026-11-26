import { expect, test } from "@playwright/test";
import { expectClean, expectNoHorizontalOverflow, playMode, registerAccount, watchProblems } from "./helpers";

test("Hành Thương Ký: mua hàng ở chợ rồi xuất hành sang điểm kề", async ({ page }) => {
  test.setTimeout(90_000);
  const problems = watchProblems(page);
  await registerAccount(page);
  await page.goto("/game/trade");
  await playMode(page);
  await expect(page.getByRole("group", { name: "Bản đồ giao thương" })).toBeVisible({ timeout: 15_000 });
  await expectNoHorizontalOverflow(page);

  await page.getByRole("spinbutton", { name: "Số Lúa gạo" }).fill("10");
  await page.getByRole("button", { name: "Mua", exact: true }).first().click();
  await expect(page.getByText("Đã mua 10 Lúa gạo.")).toBeVisible({ timeout: 10_000 });

  await page.locator('g[role=button][aria-label*="đi thẳng tới được"]').first().click();
  await page.getByRole("button", { name: /^Xuất hành tới/ }).click();
  await expect(page.getByText(/Đoàn hàng đã lên đường tới/)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Đang đi .* còn/)).toBeVisible();
  expectClean(problems);
});
