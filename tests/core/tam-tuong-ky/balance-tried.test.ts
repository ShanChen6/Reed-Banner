// Cân bằng nguyên tố ở bước ghép đầu và cảnh báo cặp đã thử (Shan, 04/11/2026).
// Tài liệu: docs/02-game-modes/tam-tuong-ky/can-bang-va-canh-bao.md.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PACK_1,
  PACK_1_2,
  PACK_1_2_3,
  TTK_TRIED_KEEP,
  buildCatalog,
  combineInRanked,
  combineInSession,
  computeMetrics,
  grantBundles,
  newTtkAccount,
  normalizeTtkAccount,
  openSession,
  parseTtkAccount,
  triedPairsOf,
  withTriedPair,
  type Pack,
  type TtkAccount,
} from "../../../src/core/tam-tuong-ky";

const ELEMENTS = ["elt.kim", "elt.moc", "elt.thuy", "elt.hoa", "elt.tho", "elt.loi", "elt.phong"];
const BALANCE_IDS = ["bronzeCast", "steam", "fireStorm", "bellows", "oreJade", "windFire", "thunderCloud", "rainStorm", "lightningTree", "fulgurite", "thunderSteel"].map((x) => `r.${x}`);
let n = 0;
const rid = () => `req-${String(++n).padStart(6, "0")}`;

describe("cân bằng nguyên tố", () => {
  const base = PACK_1_2_3.recipes.filter((r) => ELEMENTS.includes(r.first) && ELEMENTS.includes(r.second));

  it("Sổ ba gói: 27 cặp gốc có công thức; mỗi hệ có 7–8 cặp, ở ô trước và ô sau đều ≥ 3", () => {
    assert.equal(base.length, 27);
    for (const e of ELEMENTS) {
      const total = base.filter((r) => r.first === e || r.second === e).length;
      assert.ok(total >= 7 && total <= 8, `${e}: ${total}`);
      assert.ok(base.filter((r) => r.first === e).length >= 3, `${e} ô trước`);
      assert.ok(base.filter((r) => r.second === e).length >= 3, `${e} ô sau`);
    }
  });

  it("11 cặp mới chỉ ra vật liệu bậc 1 sẵn có: không thêm yếu tố, không đổi số lần ghép hay số đơn vị của yếu tố nào", () => {
    const added = PACK_1.recipes.filter((r) => BALANCE_IDS.includes(r.id));
    assert.equal(added.length, 11);
    const before = (p: Pack): Pack => ({ ...p, recipes: p.recipes.filter((r) => !BALANCE_IDS.includes(r.id)) });
    for (const p of [PACK_1, PACK_1_2, PACK_1_2_3]) {
      const now = computeMetrics(p);
      const old = computeMetrics(before(p));
      for (const node of p.nodes) assert.deepEqual(now.get(node.id), old.get(node.id), `${p.id} ${node.id}`);
    }
    for (const r of added) assert.equal(PACK_1.nodes.find((x) => x.id === r.result)?.kind, "material", r.id);
  });
});

describe("cặp đã thử", () => {
  const catalog = buildCatalog(PACK_1);
  const fresh = (): TtkAccount => {
    const r = openSession(newTtkAccount(catalog), rid(), 0);
    assert.ok(r.ok);
    return r.account;
  };

  it("Thường: ghép sai lần đầu vẫn trừ lần ghép và ghi cặp; ghép đúng không ghi", () => {
    const a = fresh();
    const miss = combineInSession(catalog, a, rid(), "elt.hoa", "elt.hoa", 0);
    assert.ok(miss.ok && miss.response.kind === "combine");
    assert.equal(miss.response.status, "noRecipe");
    assert.equal(miss.account.session!.combinesLeft, a.session!.combinesLeft - 1);
    assert.deepEqual(miss.account.triedPairs, ["elt.hoa>elt.hoa"]);
    const hit = combineInSession(catalog, miss.account, rid(), "elt.moc", "elt.moc", 0);
    assert.ok(hit.ok);
    assert.deepEqual(hit.account.triedPairs, ["elt.hoa>elt.hoa"]);
    // Ghép lại cặp đã thử: vẫn trừ như lần đầu (cảnh báo nằm ở màn chơi), danh sách không nhân đôi.
    const again = combineInSession(catalog, hit.account, rid(), "elt.hoa", "elt.hoa", 0);
    assert.ok(again.ok);
    assert.equal(again.account.session!.combinesLeft, hit.account.session!.combinesLeft - 1);
    assert.deepEqual(again.account.triedPairs, ["elt.hoa>elt.hoa"]);
  });

  it("Hạng: ghép sai mất nguyên liệu và ghi cặp; thứ tự có nghĩa", () => {
    const a = grantBundles(newTtkAccount(catalog), 1);
    const r = combineInRanked(catalog, a, rid(), "elt.hoa", "elt.moc", "2026-11-02");
    assert.ok(r.ok && r.response.kind === "rankedCombine");
    assert.equal(r.response.status, "noRecipe");
    assert.deepEqual(r.account.triedPairs, ["elt.hoa>elt.moc"]);
    assert.deepEqual(triedPairsOf(catalog, r.account), ["elt.hoa>elt.moc"]);
  });

  it("cặp về sau có công thức thì không còn cảnh báo; lưu qua JSON; giữ tối đa số cặp gần nhất", () => {
    const old = { ...newTtkAccount(catalog), triedPairs: ["elt.phong>elt.loi", "elt.hoa>elt.hoa"] };
    assert.deepEqual(triedPairsOf(catalog, old), ["elt.hoa>elt.hoa"]);
    assert.deepEqual(parseTtkAccount(JSON.parse(JSON.stringify(old)))?.triedPairs, old.triedPairs);
    assert.equal(parseTtkAccount(JSON.parse(JSON.stringify(newTtkAccount(catalog))))?.triedPairs, undefined);
    let a: TtkAccount = newTtkAccount(catalog);
    for (let i = 0; i < TTK_TRIED_KEEP + 5; i++) a = withTriedPair(a, `x${i}`, "y");
    assert.equal(a.triedPairs!.length, TTK_TRIED_KEEP);
    assert.equal(a.triedPairs!.at(-1), `x${TTK_TRIED_KEEP + 4}>y`);
    assert.deepEqual(normalizeTtkAccount(old, catalog).triedPairs, old.triedPairs);
  });
});
