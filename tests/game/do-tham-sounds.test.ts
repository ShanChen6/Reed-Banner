import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { deduceClosure, dtAct, newGame, viewOf, type DtAction, type DtState } from "../../src/core/do-tham";
import { CUE_IDS, DOTHAM_CUES } from "../../src/app/game/audio/cues";
import { CUE_GAP_MS, cuesForAction, cueTimes, DOTHAM_PRELOAD, LOSE_AFTER_TRAP_MS } from "../../src/app/game/do-tham/sounds";

const mid = (s: DtState) => Math.floor(s.height / 2) * s.width + Math.floor(s.width / 2);
const step = (s: DtState, a: DtAction) => {
  const r = dtAct(s, a);
  assert.ok(r.ok, JSON.stringify(a));
  const cues = cuesForAction(s, r.state, a);
  return { next: r.state, cues, ids: cues.map((c) => c.id) };
};

describe("âm thanh Do Thám", () => {
  it("nước đầu lan rộng ra tiếng lan; dò bằng suy luận tới khi thắng thì kết bằng tiếng thắng", () => {
    let s = newGame("nhapMon", 5);
    const first = step(s, { type: "open", index: mid(s) });
    assert.deepEqual(first.ids, ["dotham.cascade"]);
    s = first.next;
    const all: string[] = [];
    for (let g = 0; g < 2000 && s.phase === "playing"; g++) {
      const d = deduceClosure(s.width, s.height, viewOf(s), s.mines);
      const safe = d.safe.find((i) => s.cells[i] === "hidden");
      if (safe === undefined) break;
      const r = step(s, { type: "open", index: safe });
      all.push(...r.ids);
      s = r.next;
    }
    for (const c of all) assert.ok((CUE_IDS as readonly string[]).includes(c), c);
    if (s.phase === "won") assert.equal(all.at(-1), "dotham.win");
    assert.ok(all.includes("dotham.open"));
  });

  it("sập bẫy: tiếng bẫy rồi tiếng thua; khiên đất đỡ thì có tiếng khiên, không thua", () => {
    let s = step(newGame("nhapMon", 9, ["tho"]), { type: "open", index: 0 }).next;
    const trapAt = s.trap!.findIndex((t, i) => t && s.cells[i] === "hidden");
    const lost = step(s, { type: "open", index: trapAt });
    assert.deepEqual(lost.ids, ["dotham.trap", "dotham.lose"]);
    // Tiếng thua chờ tiếng sập bẫy vang gần hết, không vào sau một nhịp ngắn như các tiếng khác.
    assert.deepEqual(cueTimes(lost.cues), [0, LOSE_AFTER_TRAP_MS]);
    const armed = step(s, { type: "item", element: "tho" });
    assert.deepEqual(armed.ids, ["battle.skill.tho"]);
    s = armed.next;
    const saved = step(s, { type: "open", index: trapAt });
    assert.equal(saved.next.phase, "playing");
    assert.ok(saved.ids.includes("dotham.shield"));
  });

  it("cắm cờ và gỡ cờ cùng một tiếng, gỡ thì trầm hơn", () => {
    const s = step(newGame("nhapMon", 3), { type: "open", index: 0 }).next;
    const i = s.cells.findIndex((c) => c === "hidden");
    const on = dtAct(s, { type: "flag", index: i });
    assert.ok(on.ok);
    assert.deepEqual(cuesForAction(s, on.state, { type: "flag", index: i }), [{ id: "dotham.flag" }]);
    const off = dtAct(on.state, { type: "flag", index: i });
    assert.ok(off.ok);
    const c = cuesForAction(on.state, off.state, { type: "flag", index: i });
    assert.equal(c[0]!.id, "dotham.flag");
    assert.ok(c[0]!.rate! < 1);
  });

  it("các tiếng của một nước đi cách nhau một nhịp mặc định, cộng dồn", () => {
    assert.deepEqual(cueTimes([]), []);
    assert.deepEqual(cueTimes([{ id: "dotham.open" }, { id: "dotham.flag" }, { id: "dotham.win" }]), [0, CUE_GAP_MS, 2 * CUE_GAP_MS]);
  });

  it("manifest có tệp cho mọi cue Do Thám và nhạc; tải sẵn đủ tiếng đạo cụ", () => {
    const m = JSON.parse(readFileSync("public/audio/manifest.json", "utf8")) as { sfx: Record<string, unknown>; music: Record<string, unknown> };
    for (const c of DOTHAM_CUES) assert.ok(m.sfx[c], c);
    assert.ok(m.music.dotham);
    // Mọi cue và nhạc Do Thám dùng tệp riêng của chế độ, không còn mượn tệp của chế độ khác.
    for (const c of DOTHAM_CUES) for (const f of (m.sfx[c] as { files: string[] }).files) assert.match(f, /^sfx\/do-tham\//, c);
    assert.equal((m.music.dotham as { file: string }).file, "music/dotham");
    for (const c of DOTHAM_PRELOAD) assert.ok(m.sfx[c], c);
  });
});
