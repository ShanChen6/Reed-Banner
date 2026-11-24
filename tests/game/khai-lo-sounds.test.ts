import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CUE_IDS, KHAILO_CUES } from "../../src/app/game/audio/cues";
import { BIG_GROUP, cuesForEvents, rejectCue, removeRate } from "../../src/app/game/khai-lo/sounds";

const cells = (n: number) => Array.from({ length: n }, (_, i) => i);

describe("âm thanh Khai Lộ", () => {
  it("khối nhỏ phát khailo.remove, khối to cao tiếng hơn, từ BIG_GROUP quân là khailo.big", () => {
    assert.deepEqual(cuesForEvents([{ type: "removed", cells: cells(2), gained: 4 }]).map((c) => c.id), ["khailo.remove", "khailo.fall"]);
    assert.equal(cuesForEvents([{ type: "removed", cells: cells(2), gained: 4 }])[0]!.rate, 1);
    const small = cuesForEvents([{ type: "removed", cells: cells(3), gained: 9 }])[0]!;
    const mid = cuesForEvents([{ type: "removed", cells: cells(BIG_GROUP - 1), gained: 49 }])[0]!;
    assert.ok((mid.rate ?? 1) > (small.rate ?? 1));
    assert.equal(cuesForEvents([{ type: "removed", cells: cells(BIG_GROUP), gained: 64 }])[0]!.id, "khailo.big");
    assert.equal(removeRate(100), 1.25);
  });

  it("đạo cụ phá quân cũng có tiếng, đạo cụ không phá quân và sự kiện khác im", () => {
    assert.equal(cuesForEvents([{ type: "toolUsed", tool: "hoa", index: 0, removed: cells(9) }])[0]!.id, "khailo.big");
    assert.deepEqual(cuesForEvents([{ type: "toolUsed", tool: "moc", index: 0, removed: [] }, { type: "undone" }]), []);
  });

  it("mỗi id một lần mỗi lô; mọi cue đã khai báo và có trong manifest", () => {
    const out = cuesForEvents([{ type: "removed", cells: cells(2), gained: 4 }, { type: "removed", cells: cells(3), gained: 9 }]);
    assert.deepEqual(out.map((c) => c.id), ["khailo.remove", "khailo.fall"]);
    const manifest = JSON.parse(readFileSync("public/audio/manifest.json", "utf8")) as { sfx: Record<string, unknown> };
    for (const id of KHAILO_CUES) {
      assert.ok((CUE_IDS as readonly string[]).includes(id));
      assert.ok(manifest.sfx[id], id);
    }
  });

  it("nạp đầy, tim đổi sau màn, lệnh bị từ chối", () => {
    assert.equal(cuesForEvents([{ type: "toolCharged", tool: "kim" }])[0]!.id, "khailo.charged");
    const gain = cuesForEvents([{ type: "levelDone", summary: { level: 1, cleared: true, left: 0, bonus: 350, hearts: -3 } }]);
    const loss = cuesForEvents([{ type: "levelDone", summary: { level: 1, cleared: false, left: 4, bonus: 0, hearts: 4 } }]);
    assert.equal(gain[0]!.id, "khailo.heart");
    assert.ok((loss[0]!.rate ?? 1) < (gain[0]!.rate ?? 1));
    assert.equal(rejectCue("single"), "khailo.reject");
    assert.equal(rejectCue("outOfBounds"), null);
    assert.equal(rejectCue("notPlaying"), null);
  });
});
