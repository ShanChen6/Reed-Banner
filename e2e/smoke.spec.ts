// Smoke test: mọi màn mở được, không lỗi JS, không lỗi máy chủ, không tràn ngang; vài luồng chính đi được tới trận.
// Không kiểm luật chơi (việc của test đơn vị trong tests/), chỉ kiểm game còn chạy được trên trình duyệt thật.
import { expect, test } from "@playwright/test";
import { SCENES, SCENE_SLUG, SCENE_TITLE, type Scene } from "../src/app/game/scene";
import { expectClean, expectNoHorizontalOverflow, playMode, registerAccount, watchProblems } from "./helpers";

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

test("Thao Luyện: Đầu hàng hỏi lại trước khi chốt thua", async ({ page }) => {
  const problems = watchProblems(page);
  await page.goto("/game/practice");
  await expect(page.getByRole("grid", { name: "Bàn cờ" })).toBeVisible();
  await page.getByRole("button", { name: "Đầu hàng" }).click();
  const dialog = page.getByRole("dialog", { name: "Đầu hàng?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Chơi tiếp" }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: "Đầu hàng" }).click();
  await dialog.getByRole("button", { name: "Đầu hàng" }).click();
  // Chữ hiện ở cả thanh trạng thái lẫn bảng kết quả.
  await expect(page.getByText("Chúa công thua", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Đầu hàng" })).toHaveCount(0);
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
  await playMode(page);
  const art = await page.request.get("/art/expedition/ai-bac.webp");
  expect(art.ok()).toBe(true);
  await page.getByRole("button", { name: "Tự chia theo cấp" }).click();
  await expect(page.getByText(/Đạo Chính, 3\/3/)).toBeVisible();
  await expect(page.getByText(/Biệt Đạo, 3\/3/)).toBeVisible();
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
    await playMode(page);
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
    await page.getByRole("tab", { name: "Công trạng" }).click();
    await expect(page.getByRole("heading", { name: "Công trạng mùa này" })).toBeVisible();
    // Bậc Trấn Ải: tài khoản mới chưa vượt đợt nào nên bậc Đồng còn khóa.
    await expect(page.getByRole("region", { name: "Bậc Trấn Ải" }).getByRole("button", { name: "Bậc Đồng: chưa đạt mốc" })).toHaveText("Còn 1 đợt");
    await page.getByRole("tab", { name: "Chơi" }).click();
    await page.getByRole("button", { name: "Tự chọn đội mạnh" }).click();
    await page.getByRole("button", { name: "Bắt đầu Trấn Ải" }).click();
    await expect(page.getByRole("grid", { name: "Bàn cờ" })).toBeVisible();
    // Lượt chơi lưu trên máy chủ: về màn Trấn Ải thấy tiến độ và nút vào lại, không mở lượt mới chồng lên.
    await page.goto("/game/survival");
    await playMode(page);
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
    await playMode(page);
    await expect(page.getByRole("heading", { name: "Nhiệm vụ ngày" })).toBeVisible();
    await page.getByRole("button", { name: "Điểm danh", exact: true }).click();
    // Đã điểm danh thì khung thu thành một dòng; bấm mới mở chuỗi 7 ngày.
    await expect(page.getByText("Đã điểm danh hôm nay")).toBeVisible();
    await expect(page.getByText("Ngày 7")).toBeHidden();
    await page.getByText("Xem chuỗi").click();
    await expect(page.getByText("Ngày 7")).toBeVisible();
    await expect(page.getByRole("meter", { name: "Nhận Nhật Lệnh", exact: true })).toBeVisible();
    await page.getByRole("tab", { name: "Công trạng" }).click();
    await expect(page.getByRole("heading", { name: "Bảng hôm nay" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Bậc Nhật Lệnh" }).getByRole("button", { name: "Bậc Đồng: chưa đạt mốc" })).toHaveText("Còn 1 ngày");
    expectClean(problems);
  });

  test("Ban Thưởng: một trang gom dải bậc của mọi chế độ xếp hạng, nhận một lần rồi khóa", async ({ page }) => {
    const problems = watchProblems(page);
    await page.goto("/game");
    await page.getByRole("link", { name: "Ban Thưởng" }).first().click();
    await expect(page).toHaveURL(/\/game\/tier-rewards$/);
    for (const mode of ["Quần Hùng", "Đấu người", "Trấn Ải", "Trận Đồ", "Nhật Lệnh", "Tháp Thiên Mệnh", "Tầm Tướng Ký"])
      await expect(page.getByRole("region", { name: `Bậc ${mode}`, exact: true })).toBeVisible();
    // Chưa vào Quần Hùng thì dải khóa; Đấu người nhận Đồng rồi khóa.
    await expect(page.getByRole("region", { name: "Bậc Quần Hùng", exact: true }).getByRole("button", { name: "Bậc Đồng: chưa vào chế độ" })).toBeDisabled();
    await expect(page.getByText("Vào Quần Hùng một lần để mở dải bậc này.")).toBeVisible();
    const pvp = page.getByRole("region", { name: "Bậc Đấu người", exact: true });
    await pvp.getByRole("button", { name: "Nhận thưởng bậc Đồng" }).click();
    await expect(page.getByText(/Đã nhận 50 vàng thưởng bậc Đồng/)).toBeVisible();
    await expect(pvp.getByRole("button", { name: "Bậc Đồng: đã nhận thưởng" })).toBeDisabled();
    await expect(page.getByRole("region", { name: "Bậc Trấn Ải", exact: true }).getByRole("button", { name: "Bậc Đồng: chưa đạt mốc" })).toHaveText("Còn 1 đợt");
    expectClean(problems);
  });

  test("Tầm Tướng Ký: Vạn Vật Lục chỉ xem công thức; bấm ô trống mở hộp thoại chọn nguyên liệu cho đúng ô đó", async ({ page }) => {
    const problems = watchProblems(page);
    await page.goto("/game/tam-tuong-ky");
    await playMode(page);
    // Bấm yếu tố ở Vạn Vật Lục chỉ mở sổ công thức, không đặt vào ô (Shan 20/11/2026).
    await page.locator("#ttk-library").getByRole("button", { name: /^Mộc/ }).click();
    await expect(page.locator("#ttk-library").getByRole("button", { name: /^Mộc/ })).toHaveAttribute("aria-current", "true");
    await expect(page.getByRole("button", { name: "Chọn nguyên liệu cho ô trước" })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Bỏ Mộc khỏi/ })).toHaveCount(0);
    await page.getByRole("button", { name: "Chọn nguyên liệu cho ô sau" }).click();
    const dialog = page.getByRole("dialog", { name: "Chọn nguyên liệu cho ô sau" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("searchbox").fill("thuy");
    await dialog.getByRole("button", { name: /^Thủy/ }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: "Bỏ Thủy khỏi ô sau" })).toBeVisible();
    // Ô trước vẫn trống, vẫn mở được hộp thoại; Esc đóng.
    await page.getByRole("button", { name: "Chọn nguyên liệu cho ô trước" }).click();
    await expect(page.getByRole("dialog", { name: "Chọn nguyên liệu cho ô trước" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Chọn nguyên liệu cho ô trước" })).toBeHidden();
    expectClean(problems);
  });

  test("Sử Lộ: sa bàn vẽ trên bản đồ của thời kỳ", async ({ page }) => {
    const problems = watchProblems(page);
    await page.goto("/game/maze");
    await playMode(page);
    await page.getByRole("button", { name: /Lên đường/ }).click();
    await expect(page.getByRole("group", { name: /^Sa bàn mê cung .*, bản đồ sông Bạch Đằng$/ })).toBeVisible();
    expectClean(problems);
  });

  test("Sử Lộ: chọn mê cung ở màn riêng, trong ván chỉ đầu hàng mới về màn chọn", async ({ page }) => {
    const problems = watchProblems(page);
    await page.goto("/game/maze");
    await playMode(page);
    await page.getByRole("radio", { name: /Loạn sứ quân/ }).click();
    await page.getByRole("radio", { name: /^Khó/ }).click();
    await page.getByRole("button", { name: "Lên đường" }).click();
    await expect(page.getByRole("group", { name: /^Sa bàn mê cung 7 hàng 10 cột, bản đồ thành đất của sứ quân$/ })).toBeVisible();
    // Trong ván không còn chỗ đổi mê cung.
    await expect(page.getByRole("radiogroup", { name: "Mê cung" })).toHaveCount(0);
    await page.getByRole("button", { name: "Đầu hàng" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Chơi tiếp" }).click();
    await expect(page.getByRole("group", { name: /^Sa bàn mê cung/ })).toBeVisible();
    await page.getByRole("button", { name: "Đầu hàng" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Đầu hàng" }).click();
    await expect(page.getByRole("radiogroup", { name: "Mê cung" })).toBeVisible();
    // Ván dở đã xóa: tải lại vẫn ở màn chọn.
    await page.reload();
    await playMode(page);
    await expect(page.getByRole("radiogroup", { name: "Mê cung" })).toBeVisible();
    expectClean(problems);
  });

  test("Tài khoản: tải ảnh đại diện từ máy, ảnh hiện ở thanh đầu trang", async ({ page }) => {
    const problems = watchProblems(page);
    await page.goto("/game/account");
    await page.getByRole("button", { name: "Đổi ảnh đại diện" }).click();
    // Ảnh PNG 40×20 dựng ngay trong test; trình duyệt cắt vuông, thu về 256px rồi mới gửi.
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAACgAAAAUCAIAAABwJOjsAAAAJ0lEQVR4nGPcoiHHMBCAaUBsHbV41OJRi0ctHrV41OJRi0ctHhAAAAEEASIER3dmAAAAAElFTkSuQmCC", "base64");
    await page.getByRole("dialog", { name: "Chọn ảnh đại diện" }).locator('input[type="file"]').setInputFiles({ name: "anh.png", mimeType: "image/png", buffer: png });
    await expect(page.getByRole("img", { name: "Ảnh đại diện" })).toHaveAttribute("src", /^data:image\/(webp|jpeg);base64,/);
    expectClean(problems);
  });

  test("Hợp Kích: ghép ba tướng bất kỳ, Đinh Bộ Lĩnh theo bộ lọc, chuỗi phản ứng và liên kết theo cặp", async ({ page }) => {
    const problems = watchProblems(page);
    await page.goto("/game/combos");
    const grid = page.getByRole("group", { name: "Chọn tướng phối hợp" });
    // Lưới luôn có đủ mọi tướng (nhiều trang): tìm theo tên rồi chọn.
    const choose = async (name: string) => {
      await grid.getByRole("searchbox").fill(name);
      await grid.getByRole("button").filter({ hasText: name }).first().click();
    };
    await choose("Hà Vân");
    await expect(page.getByRole("button", { name: "Ô tướng 1: Hà Vân" })).toBeVisible();
    // Đinh Bộ Lĩnh khớp mọi bộ lọc; bấm ông khi đang lọc hệ Hỏa thì ông mang hệ Hỏa.
    await grid.getByRole("button", { name: "Hệ Hỏa" }).click();
    await choose("Đinh Bộ Lĩnh");
    await expect(page.getByRole("button", { name: "Ô tướng 2: Đinh Bộ Lĩnh" })).toContainText("Hỏa");
    await grid.getByRole("button", { name: "Mọi hệ" }).click();
    await choose("Mai Thanh");
    await expect(page.getByRole("table", { name: /Số liên kết theo người phát tín hiệu/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Chuỗi phản ứng" })).toBeVisible();
    await expect(page.locator("summary").filter({ hasText: "liên kết" }).first()).toBeVisible();
    expectClean(problems);
  });

  test("Quần Hùng: bảng xếp hạng ở hàng thẻ, đối thủ có nhãn so lực chiến, 1vs1 chọn nghề hệ bằng chip", async ({ page }) => {
    const problems = watchProblems(page);
    await page.goto("/game/arena");
    await playMode(page);
    await expect(page.getByRole("heading", { name: "Đội ra trận" })).toBeVisible();
    await page.getByText(/Đổi tướng ra trận/).click();
    await page.getByRole("button", { name: "Bỏ Hà Vân khỏi đội ra trận" }).click();
    await expect(page.getByRole("button", { name: "Đánh" }).first()).toBeDisabled();
    await page.getByRole("button", { name: "Lấy theo Doanh Trại" }).click();
    await expect(page.getByRole("button", { name: "Đánh" }).first()).toBeEnabled();
    await expect(page.getByText("Ngang sức").first()).toBeVisible();
    await page.getByRole("tab", { name: "Công trạng" }).click();
    await expect(page.getByRole("heading", { name: "Đấu bóng ma" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Bậc hạng Quần Hùng" })).toBeVisible();
    await page.getByRole("region", { name: "Bậc hạng Quần Hùng" }).getByRole("button", { name: "Nhận thưởng bậc Đồng" }).click();
    await expect(page.getByText(/Đã nhận 50 vàng thưởng bậc Đồng và .* Lương phẩm hệ .* \(đã vào kho đồ\)\./)).toBeVisible();
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
    await expect(page.getByText("Tướng sĩ, Lôi")).toBeVisible();
    expectClean(problems);
  });

  test("Trận Đồ: mặc định Chơi thường, Chiến tích gộp bảng, thưởng và bộ sưu tập", async ({ page }) => {
    const problems = watchProblems(page);
    await page.goto("/game/formation");
    await playMode(page);
    const tabs = page.getByRole("tablist", { name: "Chế độ" }).getByRole("tab");
    await expect(tabs).toHaveText(["Chơi thường", "Xếp hạng", "Chiến tích", "Hướng dẫn"]);
    await expect(page.getByRole("tab", { name: "Chơi thường" })).toHaveAttribute("aria-selected", "true");
    await page.getByRole("tab", { name: "Xếp hạng" }).click();
    await expect(page.getByRole("button", { name: "Chơi", exact: true }).first()).toBeVisible();
    await page.getByRole("tab", { name: /Chiến tích/ }).click();
    await expect(page.getByText(/Bộ sưu tập địa danh/)).toBeVisible();
    await expect(page.getByRole("region", { name: "Bậc Trận Đồ" }).getByRole("button", { name: "Bậc Đồng: chưa đạt mốc" })).toHaveText("Còn 1 ván");
    // Bảng luôn đủ 10 hạng (ô trống khi chưa có người); thưởng cuối kỳ nằm cùng hàng hạng và điểm.
    await expect(page.getByRole("list", { name: /^Hạng 4 tới/ }).first()).toBeVisible();
    expectClean(problems);
  });

  test("Tháp Thí Luyện: mở tầng 1 và thấy nút vào tầng", async ({ page }) => {
    const problems = watchProblems(page);
    await page.goto("/game/trial");
    await playMode(page);
    await expect(page.getByRole("button", { name: "Vào tầng" })).toBeVisible();
    expectClean(problems);
  });
});
