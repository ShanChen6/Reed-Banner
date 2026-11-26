import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { NodeId } from "../../src/core/tam-tuong-ky";
import { CUE_IDS, TTK_CUES } from "../../src/app/game/audio/cues";
import { combineCue, slotCue } from "../../src/app/game/tam-tuong-ky/sounds";

const a = "kim" as NodeId;
const b = "moc" as NodeId;

describe("âm thanh Tầm Tướng Ký", () => {
  it("đặt nguyên liệu mới là ttk.slot; gỡ hoặc đổi chỗ là ttk.unslot; không đổi thì im", () => {
    assert.equal(slotCue([null, null], [a, null]), "ttk.slot");
    assert.equal(slotCue([a, null], [a, b]), "ttk.slot");
    assert.equal(slotCue([null, null], [a, b]), "ttk.slot");
    assert.equal(slotCue([a, b], [a, null]), "ttk.unslot");
    assert.equal(slotCue([a, b], [null, null]), "ttk.unslot");
    assert.equal(slotCue([a, b], [b, a]), "ttk.unslot");
    assert.equal(slotCue([a, null], [a, null]), null);
  });

  it("kết quả ghép: không có công thức, đã biết, không hợp lệ; khám phá mới và ra tướng chưa có tiếng", () => {
    assert.equal(combineCue({ status: "noRecipe" }), "ttk.miss");
    assert.equal(combineCue({ status: "alreadyKnown" }), "ttk.known");
    assert.equal(combineCue({ status: "created", nodeAlreadyKnown: true }), "ttk.known");
    assert.equal(combineCue({ status: "invalid" }), "ttk.reject");
    assert.equal(combineCue({ status: "created", nodeAlreadyKnown: false }), null);
    assert.equal(combineCue({ status: "created", isCharacter: true }), null);
  });

  it("mọi cue đã khai báo và có trong manifest", () => {
    const manifest = JSON.parse(readFileSync("public/audio/manifest.json", "utf8")) as { sfx: Record<string, unknown> };
    for (const id of TTK_CUES) {
      assert.ok((CUE_IDS as readonly string[]).includes(id));
      assert.ok(manifest.sfx[id], id);
    }
  });
});
