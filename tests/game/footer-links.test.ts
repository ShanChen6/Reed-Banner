import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildLabel, footerLinks, socialLinks } from "../../src/app/game/footerLinks";

const UNLOCKED = { NEXT_PUBLIC_LINKS_UNLOCKED: "true" };

describe("liên kết footer màn game", () => {
  it("luôn hiện bốn mục góp ý, cộng đồng, điều khoản, quyền riêng tư; liên kết nội bộ luôn có địa chỉ", () => {
    const links = footerLinks({});
    assert.deepEqual(links.map((l) => l.label), ["Giới thiệu", "Hỏi đáp", "Góp ý và báo lỗi", "Cộng đồng", "Điều khoản", "Quyền riêng tư"]);
    assert.ok(links.slice(0, 2).every((l) => l.href !== null && !l.external));
  });

  it("mặc định bốn liên kết ngoài bị khóa: href null dù đã đặt địa chỉ", () => {
    const links = footerLinks({ NEXT_PUBLIC_FEEDBACK_URL: "https://forms.example/gop-y", NEXT_PUBLIC_PRIVACY_URL: "https://example.vn/quyen-rieng-tu" });
    assert.ok(links.slice(2).every((l) => l.href === null && !l.external));
  });

  it("mở khóa thì mục có địa chỉ https thành liên kết thật mở ở thẻ mới, mục chưa có vẫn href null", () => {
    const links = footerLinks({ ...UNLOCKED, NEXT_PUBLIC_FEEDBACK_URL: " https://forms.example/gop-y ", NEXT_PUBLIC_PRIVACY_URL: "https://example.vn/quyen-rieng-tu" });
    const by = Object.fromEntries(links.map((l) => [l.label, l]));
    assert.equal(by["Góp ý và báo lỗi"]!.href, "https://forms.example/gop-y");
    assert.equal(by["Góp ý và báo lỗi"]!.external, true);
    assert.equal(by["Quyền riêng tư"]!.href, "https://example.vn/quyen-rieng-tu");
    assert.equal(by["Cộng đồng"]!.href, null);
  });

  it("địa chỉ không phải http(s) không bao giờ thành liên kết, kể cả khi đã mở khóa", () => {
    const links = footerLinks({ ...UNLOCKED, NEXT_PUBLIC_FEEDBACK_URL: "javascript:alert(1)", NEXT_PUBLIC_COMMUNITY_URL: "", NEXT_PUBLIC_TERMS_URL: "   " });
    assert.ok(links.slice(2).every((l) => l.href === null));
  });

  it("chỉ giá trị đúng 'true' mới mở khóa", () => {
    for (const v of ["1", "TRUE", "yes", ""]) {
      const links = footerLinks({ NEXT_PUBLIC_LINKS_UNLOCKED: v, NEXT_PUBLIC_FEEDBACK_URL: "https://forms.example/gop-y" });
      assert.equal(links.find((l) => l.label === "Góp ý và báo lỗi")!.href, null, v);
    }
  });
});

describe("mạng xã hội liên hệ", () => {
  it("danh sách hiển thị: 4 nền tảng đã có địa chỉ, 3 nền tảng chờ; YouTube và Zalo ẩn", () => {
    const s = socialLinks({});
    assert.deepEqual(s.map((x) => x.label), ["Facebook", "TikTok", "LinkedIn", "GitHub", "Instagram", "Discord", "X"]);
    assert.deepEqual(s.map((x) => x.configured), [true, true, true, true, false, false, false]);
  });

  it("mặc định bị khóa: không nền tảng nào có href hay mở thẻ mới, dù đã có địa chỉ", () => {
    assert.ok(socialLinks({}).every((x) => x.href === null && !x.external));
  });

  it("mở khóa thì bốn nền tảng đã có địa chỉ thành liên kết thật đúng như chủ game cung cấp, ba nền tảng chờ vẫn không có liên kết", () => {
    const s = socialLinks(UNLOCKED);
    const by = Object.fromEntries(s.map((x) => [x.label, x]));
    assert.equal(by.Facebook!.href, "https://www.facebook.com/tran.tieuthien.73/");
    assert.equal(by.GitHub!.href, "https://github.com/ShanChen6");
    assert.equal(by.TikTok!.href, "https://www.tiktok.com/@chenhongshan611");
    assert.equal(by.LinkedIn!.href, "https://www.linkedin.com/in/shanchen8/");
    assert.ok(["Facebook", "TikTok", "LinkedIn", "GitHub"].every((k) => by[k]!.external));
    assert.ok(["Instagram", "Discord", "X"].every((k) => by[k]!.href === null && !by[k]!.external));
  });

  it("biến môi trường ghi đè địa chỉ, thêm nền tảng ẩn và mở khóa nền tảng chờ; địa chỉ không phải http(s) bị bỏ qua", () => {
    const s = socialLinks({ ...UNLOCKED, NEXT_PUBLIC_SOCIAL_INSTAGRAM: "https://instagram.com/colau", NEXT_PUBLIC_SOCIAL_YOUTUBE: "https://youtube.com/@colau", NEXT_PUBLIC_SOCIAL_X: "javascript:alert(1)", NEXT_PUBLIC_SOCIAL_FACEBOOK: "https://facebook.com/khac" });
    const by = Object.fromEntries(s.map((x) => [x.label, x]));
    assert.equal(by.Instagram!.href, "https://instagram.com/colau");
    assert.equal(by.YouTube!.href, "https://youtube.com/@colau");
    assert.equal(by.X!.href, null);
    assert.equal(by.X!.configured, false);
    assert.equal(by.Facebook!.href, "https://facebook.com/khac");
    assert.ok(!("Zalo" in by));
  });

  it("khi khóa, địa chỉ vẫn được lưu: nền tảng có địa chỉ đặt qua biến vẫn tính là đã cấu hình", () => {
    const by = Object.fromEntries(socialLinks({ NEXT_PUBLIC_SOCIAL_INSTAGRAM: "https://instagram.com/colau" }).map((x) => [x.label, x]));
    assert.equal(by.Instagram!.configured, true);
    assert.equal(by.Instagram!.href, null);
  });
});

describe("mã bản dựng", () => {
  it("chỉ hiện 7 ký tự đầu, không có thì null", () => {
    assert.equal(buildLabel("0123456789abcdef"), "0123456");
    assert.equal(buildLabel(undefined), null);
  });
});
