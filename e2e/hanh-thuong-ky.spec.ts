import { expect, test } from "@playwright/test";
import { TRADE_ITEMS } from "../src/core/trade/goods";
import { expectClean, expectNoHorizontalOverflow, playMode, registerAccount, watchProblems } from "./helpers";

test("Hành Thương Ký: mua hàng ở chợ rồi xuất hành sang điểm kề", async ({ page }) => {
  test.setTimeout(90_000);
  const problems = watchProblems(page);
  await registerAccount(page);
  await page.goto("/game/trade");
  await playMode(page);
  await expect(page.getByRole("group", { name: "Bản đồ giao thương" })).toBeVisible({ timeout: 15_000 });
  await expectNoHorizontalOverflow(page);

  // Chợ dạng thẻ: chạm thẻ món đầu tiên rồi mua 3 đơn vị.
  const card = page.getByRole("list", { name: "Hàng chợ bày" }).getByRole("button").first();
  // Tên món có thể chứa dấu phẩy ("Cá khô, tôm khô"), nên lấy tên dài nhất khớp đầu nhãn thay vì cắt ở dấu phẩy đầu.
  const label = (await card.getAttribute("aria-label")) ?? "";
  const name = TRADE_ITEMS.map((i) => i.name).filter((n) => label.startsWith(`${n}, `)).sort((a, b) => b.length - a.length)[0]!;
  await card.click();
  await page.getByRole("spinbutton", { name: `Số ${name}` }).fill("3");
  await page.getByRole("button", { name: "Mua", exact: true }).last().click();
  await expect(page.getByText(`Đã mua 3 ${name}.`)).toBeVisible({ timeout: 10_000 });

  await page.locator('g[role=button][aria-label*="đi thẳng tới được"]').first().click();
  await page.getByRole("button", { name: /^Xuất hành tới/ }).click();
  await expect(page.getByText(/Đoàn hàng đã lên đường tới/)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Đang đi .* còn/)).toBeVisible();
  expectClean(problems);
});
