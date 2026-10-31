import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  leaderBuildOptions,
  validateFloorRules,
  validateLineup,
  type FloorRules,
  type LineupMember,
} from "../../../src/core";

const L = "dinhBoLinh";
const m = (
  id: string,
  element: LineupMember["element"],
  profession: LineupMember["profession"],
): LineupMember => ({ id, element, profession });
const codes = (r: ReturnType<typeof validateLineup>) =>
  r.ok ? [] : r.errors.map((e) => e.code);

const lead = m(L, "moc", "tuongSi");
const a = m("haVan", "kim", "binhLinh");
const b = m("maiThanh", "thuy", "ySu");

describe("luật tầng", () => {
  it("không luật: đội 3 hợp lệ; idempotent", () => {
    assert.deepEqual(validateLineup({}, [lead, a, b]), { ok: true });
    assert.deepEqual(validateLineup({}, [lead, a, b]), { ok: true });
  });

  it("cấm Hỏa: báo đúng người vi phạm, kể cả thủ lĩnh sau khi đổi hệ", () => {
    const rules: FloorRules = { bannedElements: ["hoa"] };
    assert.equal(validateLineup(rules, [lead, a, b]).ok, true);
    const r = validateLineup(rules, [{ ...lead, element: "hoa" }, a, b]);
    assert.deepEqual(codes(r), ["banned_element"]);
    assert.deepEqual(!r.ok && r.errors[0]!.members, [L]);
  });

  it("cấm Pháp sư", () => {
    const rules: FloorRules = { bannedProfessions: ["phapSu"] };
    assert.deepEqual(
      codes(validateLineup(rules, [lead, { ...a, profession: "phapSu" }, b])),
      ["banned_profession"],
    );
  });

  it("bắt buộc Binh lính", () => {
    const rules: FloorRules = { minProfessions: { binhLinh: 1 } };
    assert.equal(validateLineup(rules, [lead, a, b]).ok, true);
    assert.deepEqual(codes(validateLineup(rules, [lead, b, m("x", "tho", "muuSi")])), ["min_profession"]);
  });

  it("3 nghề khác nhau", () => {
    const rules: FloorRules = { maxSameProfession: 1 };
    assert.equal(validateLineup(rules, [lead, a, b]).ok, true);
    assert.deepEqual(
      codes(validateLineup(rules, [lead, a, { ...b, profession: "binhLinh" }])),
      ["max_same_profession"],
    );
  });

  it("giới hạn theo hệ/nghề cụ thể và tối thiểu theo hệ", () => {
    const rules: FloorRules = { maxElements: { kim: 0 }, minElements: { thuy: 1 } };
    assert.deepEqual(codes(validateLineup(rules, [lead, a, b])), ["max_element"]);
    assert.deepEqual(codes(validateLineup(rules, [lead, { ...a, element: "tho" }, { ...b, element: "loi" }])), ["min_element"]);
  });

  it("leader vi phạm: sai slot, thiếu, sai số lượng, trùng", () => {
    assert.deepEqual(codes(validateLineup({}, [a, lead, b])), ["leader_missing"]);
    assert.ok(codes(validateLineup({}, [lead, a])).includes("size"));
    assert.ok(codes(validateLineup({}, [lead, a, b, a])).includes("size"));
    assert.deepEqual(codes(validateLineup({}, [lead, a, a])), ["duplicate_member"]);
  });

  it("đổi build thủ lĩnh: luật áp theo build mới", () => {
    const rules: FloorRules = { bannedProfessions: ["tuongSi"], minProfessions: { phapSu: 1 } };
    assert.equal(validateLineup(rules, [lead, a, b]).ok, false);
    assert.equal(validateLineup(rules, [{ ...lead, profession: "phapSu" }, a, b]).ok, true);
    const opts = leaderBuildOptions(rules, L, [a, b]);
    assert.ok(opts.length > 0);
    assert.ok(opts.every((o) => o.profession === "phapSu"));
  });

  it("leaderBuildOptions rỗng khi không có build nào cứu được", () => {
    assert.deepEqual(leaderBuildOptions({ bannedElements: ["kim"] }, L, [a, b]), []);
  });

  it("validate schema luật: hợp lệ", () => {
    assert.deepEqual(validateFloorRules({ bannedElements: ["hoa"], maxSameProfession: 1 }), []);
    assert.deepEqual(validateFloorRules({}), []);
  });

  it("validate schema luật: sai kiểu, khóa lạ, số sai", () => {
    const c = (x: unknown) => validateFloorRules(x).map((i) => i.code);
    assert.deepEqual(c(null), ["invalid_number"]);
    assert.ok(c({ foo: 1 }).includes("unknown_key"));
    assert.ok(c({ bannedElements: ["lua"] }).includes("unknown_key"));
    assert.ok(c({ minProfessions: { binhLinh: -1 } }).includes("invalid_number"));
    assert.ok(c({ maxSameElement: 0 }).includes("invalid_number"));
    assert.ok(c({ minProfessions: { thuy: 1 } }).includes("unknown_key"));
  });

  it("mâu thuẫn và bất khả thi", () => {
    const c = (x: unknown) => validateFloorRules(x).map((i) => i.code);
    assert.ok(c({ bannedElements: ["hoa"], minElements: { hoa: 1 } }).includes("banned_and_required"));
    assert.ok(c({ minProfessions: { binhLinh: 2 }, maxProfessions: { binhLinh: 1 } }).includes("min_exceeds_max"));
    assert.ok(c({ minElements: { hoa: 2, kim: 2 } }).includes("min_total_exceeds_size"));
    assert.ok(c({ minProfessions: { binhLinh: 2 }, maxSameProfession: 1 }).includes("min_exceeds_max"));
    // Cấm 6 hệ rồi bắt 3 tướng khác nhau về hệ: chỉ còn 1 hệ nên không thể.
    assert.deepEqual(
      c({ bannedElements: ["kim", "moc", "thuy", "hoa", "tho", "loi"], maxSameElement: 1 }),
      ["unsatisfiable"],
    );
    assert.deepEqual(
      c({ bannedProfessions: ["tuongSi", "phapSu", "binhLinh", "ySu", "muuSi", "quanSu", "xaThu", "satThu"] }),
      ["unsatisfiable"],
    );
  });
});
