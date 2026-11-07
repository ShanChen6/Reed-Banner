import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildLabel, footerLinks, pendingNotice, socialLinks, socialPendingNotice } from "../../src/app/game/footerLinks";

describe("liên kết footer màn game", () => {
  it("luôn hiện bốn mục góp ý, cộng đồng, điều khoản, quyền riêng tư; chưa có địa chỉ thì href là null", () => {
    const links = footerLinks({});
    assert.deepEqual(links.map((l) => l.label), ["Giới thiệu", "Hỏi đáp", "Góp ý và báo lỗi", "Cộng đồng", "Điều khoản", "Quyền riêng tư"]);
    assert.ok(links.slice(0, 2).every((l) => l.href !== null));
    assert.ok(links.slice(2).every((l) => l.href === null && !l.external));
  });

  it("mục đã đặt địa chỉ https thành liên kết thật mở ở thẻ mới", () => {
    const links = footerLinks({ NEXT_PUBLIC_FEEDBACK_URL: " https://forms.example/gop-y ", NEXT_PUBLIC_PRIVACY_URL: "https://example.vn/quyen-rieng-tu" });
    const byLabel = Object.fromEntries(links.map((l) => [l.label, l]));
    assert.equal(byLabel["Góp ý và báo lỗi"]!.href, "https://forms.example/gop-y");
    assert.equal(byLabel["Góp ý và báo lỗi"]!.external, true);
    assert.equal(byLabel["Quyền riêng tư"]!.href, "https://example.vn/quyen-rieng-tu");
    assert.equal(byLabel["Cộng đồng"]!.href, null);
  });

  it("địa chỉ không phải http(s) bị coi như chưa có (không tạo liên kết nguy hiểm)", () => {
    const links = footerLinks({ NEXT_PUBLIC_FEEDBACK_URL: "javascript:alert(1)", NEXT_PUBLIC_COMMUNITY_URL: "", NEXT_PUBLIC_TERMS_URL: "   " });
    assert.ok(links.slice(2).every((l) => l.href === null));
  });

  it("thông báo khi bấm mục chưa có địa chỉ nêu đúng tên mục", () => {
    assert.equal(pendingNotice("Cộng đồng"), 'Mục "Cộng đồng" đang được chuẩn bị, sẽ sớm ra mắt.');
  });

  it("mạng xã hội mặc định: 4 nền tảng có địa chỉ thật, 3 nền tảng chờ hiện với href null, YouTube và Zalo ẩn", () => {
    const s = socialLinks({});
    assert.deepEqual(s.map((x) => x.label), ["Facebook", "TikTok", "LinkedIn", "GitHub", "Instagram", "Discord", "X"]);
    assert.ok(s.slice(0, 4).every((x) => x.external && x.href?.startsWith("https://")));
    assert.ok(s.slice(4).every((x) => x.href === null && !x.external));
  });

  it("địa chỉ của chủ game đúng như đã cung cấp", () => {
    const by = Object.fromEntries(socialLinks({}).map((x) => [x.label, x.href]));
    assert.equal(by.Facebook, "https://www.facebook.com/tran.tieuthien.73/");
    assert.equal(by.GitHub, "https://github.com/ShanChen6");
    assert.equal(by.TikTok, "https://www.tiktok.com/@chenhongshan611");
    assert.equal(by.LinkedIn, "https://www.linkedin.com/in/shanchen8/");
  });

  it("biến môi trường ghi đè địa chỉ, mở khóa nền tảng chờ và nền tảng ẩn; địa chỉ không phải http(s) bị bỏ qua", () => {
    const s = socialLinks({ NEXT_PUBLIC_SOCIAL_INSTAGRAM: "https://instagram.com/colau", NEXT_PUBLIC_SOCIAL_YOUTUBE: "https://youtube.com/@colau", NEXT_PUBLIC_SOCIAL_X: "javascript:alert(1)", NEXT_PUBLIC_SOCIAL_FACEBOOK: "https://facebook.com/khac" });
    const by = Object.fromEntries(s.map((x) => [x.label, x.href]));
    assert.equal(by.Instagram, "https://instagram.com/colau");
    assert.equal(by.YouTube, "https://youtube.com/@colau");
    assert.equal(by.X, null);
    assert.equal(by.Facebook, "https://facebook.com/khac");
    assert.ok(!("Zalo" in by));
  });

  it("thông báo khi bấm mạng xã hội chưa có địa chỉ nêu đúng tên", () => {
    assert.equal(socialPendingNotice("Instagram"), "Kênh Instagram đang được chuẩn bị, sẽ sớm kết nối cùng bạn.");
  });

  it("mã bản dựng chỉ hiện 7 ký tự đầu, không có thì null", () => {
    assert.equal(buildLabel("0123456789abcdef"), "0123456");
    assert.equal(buildLabel(undefined), null);
  });
});
