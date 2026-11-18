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
  await expect(page.getByRole("link", { name: "Trình danh để chơi" })).toBeVisible();
  expectClean(problems);
});

test("Viễn Chinh: sa bàn có tranh riêng, chia đạo quân có lọc và tự chia", async ({ page }) => {
  const problems = watchProblems(page);
  await page.goto("/game/expedition");
  const art = await page.request.get("/art/expedition/ai-bac.webp");
  expect(art.ok()).toBe(true);
  await page.getByRole("button", { name: "Tự chia theo cấp" }).click();
  await expect(page.getByText(/Đạo Chính · 3\/3/)).toBeVisible();
  await expect(page.getByText(/Biệt Đạo · 3\/3/)).toBeVisible();
  await page.getByRole("group", { name: "Lọc theo đạo quân" }).getByRole("button", { name: "Biệt Đạo" }).click();
  await expect(page.getByText("3/5 tướng khớp bộ lọc")).toBeVisible();
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
    // Mặc định đã chọn các tướng cấp cao nhất, tối đa 8 (tài khoản mới có 5 tướng nên chọn hết).
    await page.getByRole("button", { name: "Khóa đội hình và bắt đầu leo" }).click();
    await expect(page.getByRole("heading", { name: /Chuẩn bị tầng 1\// })).toBeVisible();
    // Dừng phải xác nhận; bấm Leo tiếp thì giữ nguyên lượt leo.
    await page.getByRole("button", { name: "Dừng lượt leo" }).click();
    await page.getByRole("button", { name: "Leo tiếp" }).click();
    await page.getByRole("button", { name: "Đánh tầng 1" }).click();
    await expect(page.getByRole("grid", { name: "Bàn cờ" })).toBeVisible();
    expectClean(problems);
  });

  test("Trấn Ải: chọn đội, vào đợt 1, quay lại thấy lượt chơi đang dở", async ({ page }) => {
    const problems = watchProblems(page);
    await page.goto("/game/survival");
    await page.getByRole("tab", { name: "Bảng xếp hạng" }).click();
    await expect(page.getByRole("heading", { name: "Bảng xếp hạng mùa này" })).toBeVisible();
    // Bậc Trấn Ải: tài khoản mới chưa vượt đợt nào nên bậc Đồng còn khóa.
    await expect(page.getByRole("region", { name: "Bậc Trấn Ải" }).getByRole("button", { name: "Bậc Đồng: chưa đạt mốc" })).toHaveText("Còn 1 đợt");
    await page.getByRole("tab", { name: "Chơi" }).click();
    await page.getByRole("button", { name: "Tự chọn đội mạnh" }).click();
    await page.getByRole("button", { name: "Bắt đầu Trấn Ải" }).click();
    await expect(page.getByRole("grid", { name: "Bàn cờ" })).toBeVisible();
    // Lượt chơi lưu trên máy chủ: về màn Trấn Ải thấy tiến độ và nút vào lại, không mở lượt mới chồng lên.
    await page.goto("/game/survival");
    await expect(page.getByRole("heading", { name: /Đang đánh dở đợt 1/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Bắt đầu Trấn Ải" })).toHaveCount(0);
    await page.getByRole("button", { name: "Vào lại đợt 1" }).click();
    await expect(page.getByRole("grid", { name: "Bàn cờ" })).toBeVisible();
    expectClean(problems);
  });

  test("Điểm danh và nhiệm vụ ngày nằm ở Nhật Lệnh, màn Nhiệm vụ chỉ dẫn sang", async ({ page }) => {
    const problems = watchProblems(page);
    // Màn Nhiệm vụ chỉ còn thẻ dẫn sang Nhật Lệnh.
    await page.goto("/game/quests");
    const link = page.getByRole("link", { name: "Sang Nhật Lệnh" });
    await expect(link).toBeVisible();
    await expect(page.getByRole("meter", { name: "Nhận Nhật Lệnh", exact: true })).toHaveCount(0);
    await link.click();
    await expect(page.getByRole("heading", { name: "Nhiệm vụ ngày" })).toBeVisible();
    await page.getByRole("button", { name: "Điểm danh", exact: true }).click();
    // Đã điểm danh thì khung thu thành một dòng; bấm mới mở chuỗi 7 ngày.
    await expect(page.getByText("Đã điểm danh hôm nay")).toBeVisible();
    await expect(page.getByText("Ngày 7")).toBeHidden();
    await page.getByText("Xem chuỗi").click();
    await expect(page.getByText("Ngày 7")).toBeVisible();
    await expect(page.getByRole("meter", { name: "Nhận Nhật Lệnh", exact: true })).toBeVisible();
    await page.getByRole("tab", { name: "Bảng xếp hạng" }).click();
    await expect(page.getByRole("heading", { name: "Bảng hôm nay" })).toBeVisible();
    expectClean(problems);
  });

  test("Quần Hùng: bảng xếp hạng ở hàng thẻ, đối thủ có nhãn so lực chiến, 1vs1 chọn nghề hệ bằng chip", async ({ page }) => {
    const problems = watchProblems(page);
    await page.goto("/game/arena");
    await expect(page.getByRole("heading", { name: "Đội ra trận" })).toBeVisible();
    await page.getByText(/Đổi tướng ra trận/).click();
    await page.getByRole("button", { name: "Bỏ Hà Vân khỏi đội ra trận" }).click();
    await expect(page.getByRole("button", { name: "Đánh" }).first()).toBeDisabled();
    await page.getByRole("button", { name: "Lấy theo Doanh Trại" }).click();
    await expect(page.getByRole("button", { name: "Đánh" }).first()).toBeEnabled();
    await expect(page.getByText("Ngang sức").first()).toBeVisible();
    await page.getByRole("tab", { name: "Bảng xếp hạng" }).click();
    await expect(page.getByRole("heading", { name: "Đấu bóng ma" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Bậc hạng Quần Hùng" })).toBeVisible();
    await page.getByRole("region", { name: "Bậc hạng Quần Hùng" }).getByRole("button", { name: "Nhận thưởng bậc Đồng" }).click();
    await expect(page.getByText(/Đã nhận 50 vàng thưởng bậc Đồng và .* Lương phẩm hệ .* \(đã vào túi đồ\)\./)).toBeVisible();
    // Nhận một lần rồi nút khóa; bậc chưa đạt cũng khóa.
    await expect(page.getByRole("region", { name: "Bậc hạng Quần Hùng" }).getByRole("button", { name: "Bậc Đồng: đã nhận thưởng" })).toBeDisabled();
    await expect(page.getByRole("region", { name: "Bậc hạng Quần Hùng" }).getByRole("button", { name: "Bậc Bạc: chưa đạt mốc" })).toBeDisabled();
    // Đấu người: một dải chung 1vs1 và 3vs3, nhận Đồng rồi khóa.
    const pvpTiers = page.getByRole("region", { name: "Bậc hạng Đấu người" });
    await pvpTiers.getByRole("button", { name: "Nhận thưởng bậc Đồng" }).click();
    await expect(pvpTiers.getByRole("button", { name: "Bậc Đồng: đã nhận thưởng" })).toBeDisabled();
    await page.getByRole("tab", { name: "Chơi" }).click();
    await page.getByRole("button", { name: "Đấu người" }).click();
    await page.getByRole("group", { name: "Hệ của Đinh Bộ Lĩnh" }).getByRole("button", { name: "Lôi" }).click();
    await expect(page.getByText("Tướng sĩ · Lôi")).toBeVisible();
    expectClean(problems);
  });

  test("Tháp Thí Luyện: mở tầng 1 và thấy nút vào tầng", async ({ page }) => {
    const problems = watchProblems(page);
    await page.goto("/game/trial");
    await expect(page.getByRole("button", { name: "Vào tầng" })).toBeVisible();
    expectClean(problems);
  });
});
