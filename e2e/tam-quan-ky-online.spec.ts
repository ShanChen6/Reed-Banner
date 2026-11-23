// Tam Quân Kỳ đấu người 1vs1: hai tài khoản trên hai trình duyệt, một người mở phòng, người kia vào bằng mã, mỗi bên đi một nước
// và thấy nước của bên kia (server làm trọng tài, src/server/tamQuanKy.ts).
import { expect, test, type Page } from "@playwright/test";
import { FILES, RANKS, fileOf, legalMoves, newGame, play, rankOf } from "../src/core/tam-quan-ky/logic";
import { isPhone, playMode, registerAccount, watchProblems, expectClean } from "./helpers";

/** Bấm vào giao điểm của ô `s` trên sa bàn (lề một đơn vị quanh bàn, xoay nửa vòng khi cầm Xanh). */
async function clickSquare(page: Page, s: number, flipped: boolean) {
  const box = await page.locator('[aria-label^="Sa bàn Tam Quân Kỳ"] svg').boundingBox();
  if (!box) throw new Error("Không thấy sa bàn");
  const col = flipped ? FILES - fileOf(s) : fileOf(s) + 1;
  const row = flipped ? rankOf(s) + 1 : RANKS - rankOf(s);
  await page.mouse.click(box.x + (col / (FILES + 1)) * box.width, box.y + (row / (RANKS + 1)) * box.height);
}

async function openOnline(page: Page) {
  await page.goto("/game/three-armies");
  await playMode(page);
  await page.getByRole("group", { name: "Cách chơi" }).getByRole("button", { name: "Đấu người 1vs1" }).click();
}

test("Tam Quân Kỳ: hai tài khoản đấu online bằng mã phòng", async ({ browser }) => {
  test.skip(isPhone(), "Luồng mở phòng trên điện thoại giống máy tính, chỉ khác bảng trượt; kiểm một lần trên máy tính.");
  test.setTimeout(120_000);
  const host = await (await browser.newContext()).newPage();
  const guest = await (await browser.newContext()).newPage();
  const problems = [...watchProblems(host), ...watchProblems(guest)];
  await registerAccount(host);
  await registerAccount(guest);

  await openOnline(host);
  await host.getByRole("button", { name: "Mở phòng" }).click();
  const codeText = host.locator("p.font-mono");
  await expect(codeText).toHaveText(/^[A-Z2-9]{6}$/);
  const code = (await codeText.textContent())!.trim();

  await openOnline(guest);
  await guest.getByLabel("Mã phòng của bạn bè").fill(code);
  await guest.getByRole("button", { name: "Vào phòng" }).click();
  await expect(guest.getByText("tới lượt")).toBeVisible();

  // Đỏ (chủ phòng) đi nước hợp lệ đầu tiên; Xanh thấy nước đó trong nhật ký rồi đi lại.
  const start = newGame();
  const first = legalMoves(start).find((m) => m.unit === "stack" && m.kind === "move")!;
  await expect(host.getByText("tới lượt")).toBeVisible();
  await clickSquare(host, first.from, false);
  await clickSquare(host, first.to, false);
  await expect(host.getByText("Nhật ký trận").locator("..").locator("li")).toHaveCount(1);
  await expect(guest.getByText("Nhật ký trận").locator("..").locator("li")).toHaveCount(1, { timeout: 10_000 });

  const reply = legalMoves(play(start, first)).find((m) => m.unit === "stack" && m.kind === "move")!;
  await clickSquare(guest, reply.from, true);
  await clickSquare(guest, reply.to, true);
  await expect(host.getByText("Nhật ký trận").locator("..").locator("li")).toHaveCount(2, { timeout: 10_000 });

  // Xanh đầu hàng: Đỏ thấy mình thắng.
  await guest.getByRole("button", { name: "Đầu hàng" }).click();
  await guest.getByRole("dialog").getByRole("button", { name: /Đầu hàng/ }).click();
  await expect(host.getByRole("dialog").getByText("Thắng trận!")).toBeVisible({ timeout: 10_000 });
  expectClean(problems);
});
