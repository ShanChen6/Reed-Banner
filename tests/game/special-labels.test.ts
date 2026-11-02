import assert from "node:assert/strict";
import { test } from "node:test";
import { ALL_COMPANIONS, SPECIAL_COMPANIONS, getSkill, specialById } from "../../src/core";
import { elementTitle, fusionPassiveLines, fusionSummary, isFusion } from "../../src/app/game/battle/special-labels";
import { skillSourceName, skillText } from "../../src/app/game/battle/labels";

test("nhân vật dung hợp được nhận ra, tướng thường thì không", () => {
  for (const f of SPECIAL_COMPANIONS) assert.ok(isFusion(f), f.id);
  for (const f of ALL_COMPANIONS) assert.ok(!isFusion(f), f.id);
});

test("Đinh Ngọc liệt kê đủ bốn nội tại theo thứ tự P1–P4, phối hợp ở cuối", () => {
  const lines = fusionPassiveLines(specialById("dinhNgoc")!);
  assert.deepEqual(lines.map((l) => l.label), ["Nội tại 1", "Nội tại 2", "Nội tại 3", "Nội tại 4"]);
  assert.deepEqual(lines.map((l) => l.name), ["Thổ mạch hộ thân", "Mộc tức dưỡng sinh", "Lôi ý đoạt cơ", "Phong lệnh tiếp ứng"]);
  for (const l of lines) assert.ok(l.description.length > 20, l.name);
});

test("Vũ Phong liệt kê bốn nội tại truy kích, không có bị động phối hợp", () => {
  const lines = fusionPassiveLines(specialById("vuPhong")!);
  assert.deepEqual(lines.map((l) => l.name), ["Trượng thiết hồi đáp", "Phi diệp theo gió", "Hỏa ẩn vân sau", "Lôi vân trấn pháp"]);
});

test("tướng thường không có danh sách nội tại dung hợp", () => {
  assert.deepEqual(fusionPassiveLines(ALL_COMPANIONS[0]!), []);
  assert.equal(fusionSummary(ALL_COMPANIONS[0]!), null);
});

test("chú thích hệ phân biệt hệ phòng thủ của nhân vật dung hợp", () => {
  assert.match(elementTitle(specialById("vuPhong")!), /phòng thủ Phong.*bảy hệ/);
  assert.match(elementTitle(specialById("dinhNgoc")!), /phòng thủ Kim/);
  assert.doesNotMatch(elementTitle(ALL_COMPANIONS[0]!), /phòng thủ/);
});

test("nhãn chiêu dung hợp ghi hệ của đòn, không gọi nhầm là tuyệt chiêu", () => {
  assert.match(skillSourceName(getSkill("dn_thuyAnhXuyenLuu")!), /^Chiêu dung hợp · đòn hệ Thủy$/);
  assert.match(skillSourceName(getSkill("vp_vanDuThienLy")!), /^Tuyệt chiêu nhân vật · đòn hệ Phong$/);
  assert.equal(skillSourceName(getSkill("dn_thoAnTranTam")!), "Chiêu dung hợp");
  assert.match(skillText(getSkill("vp_muaGiangYLoan")!), /đòn hệ Thủy/);
});
