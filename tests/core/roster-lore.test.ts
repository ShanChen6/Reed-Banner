import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ALL_COMPANIONS, CHARACTER_LORE, EXPANSION_COMPANIONS, FACTIONS, RELATIONS, relatedTo, STARTER_COMPANIONS } from "../../src/core";

const nameOf = (id: string) => ALL_COMPANIONS.find((c) => c.id === id)!.name;
describe("Tiểu sử nhân vật (lore)", () => {
  it("đủ 56 nhân vật: 42 tướng thường và 14 Xạ thủ, Sát thủ; mọi id có trong roster", () => {
    const ids = Object.keys(CHARACTER_LORE);
    assert.equal(ids.length, 56);
    for (const id of ids) assert.ok(ALL_COMPANIONS.some((c) => c.id === id), `${id} không có trong roster`);
    for (const c of EXPANSION_COMPANIONS) assert.ok(CHARACTER_LORE[c.id], `${c.id} thiếu tiểu sử`);
    for (const c of STARTER_COMPANIONS) assert.ok(CHARACTER_LORE[c.id], `${c.id} thiếu tiểu sử`);
    assert.equal(ids.filter((id) => !EXPANSION_COMPANIONS.some((c) => c.id === id)).length, 42);
  });

  it("ngoại hiệu không trùng nhau, không trùng họ tên, và không rỗng", () => {
    const seen = new Set<string>();
    for (const [id, l] of Object.entries(CHARACTER_LORE)) {
      assert.ok(l.epithet.length > 0, id);
      assert.ok(!seen.has(l.epithet), `ngoại hiệu trùng: ${l.epithet}`);
      seen.add(l.epithet);
      assert.notEqual(l.epithet, nameOf(id), `${id}: ngoại hiệu trùng tên hiển thị`);
    }
  });

  it("họ tên hiển thị không trùng nhau trong toàn roster", () => {
    const names = ALL_COMPANIONS.map((c) => c.name);
    assert.equal(new Set(names).size, names.length);
  });

  it("đúng ba tên đổi họ và 14 tên mới của Xạ thủ, Sát thủ; id không đổi", () => {
    assert.equal(nameOf("chauNgoc"), "Trần Ngọc");
    assert.equal(nameOf("beLien"), "Mã Liên");
    assert.equal(nameOf("daoLam"), "Vi Lam");
    assert.equal(nameOf("bachNoLang"), "Đoàn Cự");
    assert.equal(CHARACTER_LORE.bachNoLang!.epithet, "Bạch Nỏ Lang");
    assert.equal(nameOf("voAnh"), "Liễu Thiều");
    assert.equal(CHARACTER_LORE.voAnh!.epithet, "Vô Ảnh");
  });

  it("13 phe: 20 nghĩa quân Hoa Lư và 36 lính hoặc hàng binh của 12 sứ quân", () => {
    assert.equal(Object.keys(FACTIONS).length, 13);
    const by = (f: string) => Object.values(CHARACTER_LORE).filter((l) => l.faction === f).length;
    assert.equal(by("hoaLu"), 20);
    assert.equal(Object.values(CHARACTER_LORE).filter((l) => l.faction !== "hoaLu").length, 36);
    for (const l of Object.values(CHARACTER_LORE)) assert.ok(l.faction in FACTIONS);
  });

  it("quan hệ trỏ đúng nhân vật, mã không trùng, mỗi người tối đa hai mối đã chốt", () => {
    assert.equal(new Set(RELATIONS.map((r) => r.code)).size, RELATIONS.length);
    const chot = new Map<string, number>();
    for (const r of RELATIONS) {
      assert.ok(CHARACTER_LORE[r.a] && CHARACTER_LORE[r.b], r.code);
      if (r.level === "chot") for (const id of [r.a, r.b]) chot.set(id, (chot.get(id) ?? 0) + 1);
    }
    for (const [id, n] of chot) assert.ok(n <= 2, `${id} có ${n} mối đã chốt`);
  });

  it("ruột thịt cùng họ (anh em, cha con)", () => {
    const RUOT = new Set(["Anh", "Em gái", "Em trai", "Cha", "Con trai", "Con gái"]);
    for (const r of RELATIONS) {
      if (!RUOT.has(r.aIs)) continue;
      assert.equal(nameOf(r.a).split(" ")[0], nameOf(r.b).split(" ")[0], `${r.code}: ${nameOf(r.a)} và ${nameOf(r.b)} khác họ`);
    }
  });

  it("relatedTo chỉ trả mối đã chốt mặc định, đúng vai hai chiều", () => {
    assert.deepEqual(relatedTo("tranCuong").map((p) => `${p.role}: ${p.name}`), ["Em gái: Trần Ngọc"]);
    assert.deepEqual(relatedTo("chauNgoc").map((p) => `${p.role}: ${p.name}`), ["Anh: Trần Cương"]);
    assert.equal(relatedTo("viTrieu").length, 0);
    assert.equal(relatedTo("viTrieu", ["chot", "goiMo"]).length, 1);
  });

  it("nhân vật lịch sử và sứ quân không có tiểu sử hư cấu", () => {
    for (const id of ["dinhBoLinh", "nguyenBac", "leHoan", "tranLam", "kieuCongHan"]) assert.equal(CHARACTER_LORE[id], undefined);
  });
});
