import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildLabel, footerLinks } from "../../src/app/game/footerLinks";

describe("liên kết footer màn game", () => {
  it("chỉ có liên kết nội bộ khi chưa cấu hình gì", () => {
    assert.deepEqual(footerLinks({}).map((l) => l.label), ["Giới thiệu", "Hỏi đáp"]);
  });

  it("thêm liên kết ngoài đã đặt địa chỉ https, mở ở thẻ mới", () => {
    const links = footerLinks({ NEXT_PUBLIC_FEEDBACK_URL: "https://forms.example/gop-y", NEXT_PUBLIC_PRIVACY_URL: "https://example.vn/quyen-rieng-tu" });
    assert.deepEqual(links.map((l) => l.label), ["Giới thiệu", "Hỏi đáp", "Góp ý và báo lỗi", "Quyền riêng tư"]);
    assert.ok(links.filter((l) => l.external).every((l) => l.href.startsWith("https://")));
  });

  it("bỏ qua địa chỉ không phải http(s) để tránh liên kết nguy hiểm hoặc chết", () => {
    const links = footerLinks({ NEXT_PUBLIC_FEEDBACK_URL: "javascript:alert(1)", NEXT_PUBLIC_COMMUNITY_URL: "", NEXT_PUBLIC_TERMS_URL: "   " });
    assert.deepEqual(links.map((l) => l.label), ["Giới thiệu", "Hỏi đáp"]);
  });

  it("mã bản dựng chỉ hiện 7 ký tự đầu, không có thì null", () => {
    assert.equal(buildLabel("0123456789abcdef"), "0123456");
    assert.equal(buildLabel(undefined), null);
  });
});
