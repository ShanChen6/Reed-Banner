// Vây Thành Kỳ (cờ vây nguyên tố): đấu sứ quân trên trình duyệt, và hai tài khoản đấu người bằng mã phòng (server trọng tài).
import { expect, test, type Page } from "@playwright/test";
import { expectClean, isPhone, playMode, registerAccount, watchProblems } from "./helpers";

/** Bấm giao điểm (x, y) tính từ góc trên trái của bàn `size` (lề một đơn vị quanh bàn). */
async function clickPoint(page: Page, size: number, x: number, y: number) {
  const box = await page.getByTestId("vtk-board").boundingBox();
  if (!box) throw new Error("Không thấy bàn cờ");
  await page.mouse.click(box.x + ((x + 1) / (size + 1)) * box.width, box.y + ((y + 1) / (size + 1)) * box.height);
}

const stones = (page: Page) => page.getByTestId("vtk-board").locator("[data-stone]");

test("Vây Thành Kỳ: đặt quân, sứ quân đáp lại, đất đổi nền theo hệ", async ({ page }) => {
  test.skip(isPhone(), "Điện thoại đặt quân bằng hai lần chạm; luồng giống máy tính, kiểm một lần.");
  const problems = watchProblems(page);
  await page.goto("/game/go");
  await playMode(page);
  await page.getByRole("group", { name: "Nguyên tố của bạn" }).getByRole("button", { name: "Lôi" }).click();
  await page.getByRole("group", { name: "Độ khó" }).getByRole("button", { name: "Dễ" }).click();
  await page.getByRole("button", { name: /^Vào trận đấu/ }).click();
  await clickPoint(page, 9, 4, 4);
  await expect(stones(page)).toHaveCount(2, { timeout: 15_000 });
  await expect(page.getByTestId("vtk-board").locator('[data-stone="loi"]')).toHaveCount(1);
  await expect(page.getByTestId("vtk-board").locator('[data-ground="loi"]')).toHaveCount(1);
  expectClean(problems);
});

async function openOnline(page: Page) {
  await page.goto("/game/go");
  await playMode(page);
  await page.getByRole("group", { name: "Cách chơi" }).getByRole("button", { name: "Đấu người bằng mã phòng" }).click();
}

test("Vây Thành Kỳ: hai tài khoản đấu người bằng mã phòng", async ({ browser }) => {
  test.skip(isPhone(), "Luồng mở phòng trên điện thoại giống máy tính, chỉ khác bảng trượt.");
  test.setTimeout(120_000);
  const host = await (await browser.newContext()).newPage();
  const guest = await (await browser.newContext()).newPage();
  const problems = [...watchProblems(host), ...watchProblems(guest)];
  await registerAccount(host);
  await registerAccount(guest);

  await openOnline(host);
  await host.getByRole("group", { name: "Nguyên tố của bạn" }).getByRole("button", { name: "Hỏa" }).click();
  await host.getByRole("button", { name: "Mở phòng" }).click();
  const codeText = host.getByTestId("vtk-room-code");
  await expect(codeText).toHaveText(/^[A-Z2-9]{6}$/);
  const code = (await codeText.textContent())!.trim();

  await openOnline(guest);
  await guest.getByRole("group", { name: "Nguyên tố của bạn" }).getByRole("button", { name: "Thủy" }).click();
  await guest.getByLabel("Mã phòng của bạn bè").fill(code);
  await guest.getByRole("button", { name: "Vào phòng" }).click();
  await expect(host.getByText("tới lượt")).toBeVisible({ timeout: 10_000 });

  await clickPoint(host, 9, 2, 2);
  await expect(stones(guest)).toHaveCount(1, { timeout: 10_000 });
  await expect(guest.getByTestId("vtk-board").locator('[data-stone="hoa"]')).toHaveCount(1);
  await clickPoint(guest, 9, 6, 6);
  await expect(host.getByTestId("vtk-board").locator('[data-stone="thuy"]')).toHaveCount(1, { timeout: 10_000 });

  await guest.getByRole("button", { name: "Đầu hàng" }).click();
  await guest.getByRole("dialog").getByRole("button", { name: /Đầu hàng/ }).click();
  await expect(host.getByRole("dialog").getByText("Thắng trận!")).toBeVisible({ timeout: 10_000 });
  expectClean(problems);
});
