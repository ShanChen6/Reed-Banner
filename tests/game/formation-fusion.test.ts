import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { FUSION_CHARACTERS, RULESETS } from "../../src/core/binh-phap";
import { portraitUrl } from "../../src/app/game/art/portrait-data";

test("quân dung hợp của Trận Đồ đều có chân dung thật và chỉ ở Khó, Đại trận", () => {
  assert.deepEqual(FUSION_CHARACTERS.map((f) => f.characterId).sort(), ["dinhNgoc", "vuPhong"]);
  for (const f of FUSION_CHARACTERS) {
    const url = portraitUrl(f.characterId);
    assert.ok(url && existsSync(`public${url}`), `${f.characterId} thiếu chân dung`);
  }
  for (const r of RULESETS) {
    const ids = r.fusions.map((f) => f.characterId).sort();
    assert.deepEqual(ids, r.id === "kho" || r.id === "dai-tran" ? ["dinhNgoc", "vuPhong"] : [], r.id);
  }
});
