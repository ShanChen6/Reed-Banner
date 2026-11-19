import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { distanceTo, findBestSwap, newRun, questionById, reachable, slAct, type SlAction, type SlState } from "../../src/core/su-lo";
import { CUE_IDS, SULO_CUES } from "../../src/app/game/audio/cues";
import { cuesForAction, musicFor, SULO_PRELOAD } from "../../src/app/game/su-lo/sounds";

const must = (s: SlState, a: SlAction): SlState => {
  const r = slAct(s, a);
  assert.ok(r.ok, JSON.stringify(a));
  return r.state;
};

const rightAnswer = (s: SlState) => {
  const q = questionById(s.question!.id)!;
  return typeof q.answer === "number" ? q.answer : [...q.answer];
};

/** Chơi hết một mê cung (trả lời đúng, đi về phía cổng), gom mọi cue phát ra. */
function playAll(seed: number): { cues: string[]; musics: Set<string> } {
  let s = newRun("de", "loanSuQuan", seed);
  const cues: string[] = [];
  const musics = new Set<string>([musicFor(s)]);
  for (let step = 0; step < 4000 && s.phase !== "won"; step++) {
    let a: SlAction;
    if (s.phase === "roll") a = { type: "roll" };
    else if (s.phase === "move") {
      const dist = distanceTo(s, s.maze.exit);
      const d = (i: number) => (dist[i]! < 0 ? 999 : dist[i]!);
      a = { type: "move", to: [...reachable(s).keys()].sort((x, y) => d(x) - d(y))[0]! };
    } else if (s.phase === "question") a = { type: "answer", answer: rightAnswer(s) };
    else {
      const sk = s.skirmish!;
      const mv = findBestSwap(sk);
      a = sk.energy >= 100 ? { type: "skirmish", action: { type: "stratagem", row: 7 } } : mv ? { type: "skirmish", action: { type: "swap", ...mv } } : { type: "retreat" };
    }
    const next = must(s, a);
    cues.push(...cuesForAction(s, next, a));
    musics.add(musicFor(next));
    s = next;
  }
  assert.equal(s.phase, "won");
  return { cues, musics };
}

describe("âm thanh Sử Lộ", () => {
  it("cả ván có tiếng đổ xúc xắc, đi quân, trả lời đúng, trận trùm và thoát mê cung; mọi cue đã khai báo", () => {
    const { cues, musics } = playAll(7);
    for (const c of cues) assert.ok((CUE_IDS as readonly string[]).includes(c), c);
    for (const c of ["sulo.roll", "sulo.move", "sulo.correct", "sulo.boss", "sulo.bosswon", "sulo.won"]) assert.ok(cues.includes(c), c);
    assert.equal(cues.at(-1), "sulo.won");
    assert.deepEqual([...musics].sort(), ["sulo_boss", "sulo_maze"]);
  });

  it("trả lời sai ra tiếng sai; nước đi không đổi sự kiện thì chỉ có tiếng của nước đi", () => {
    const s = { ...newRun("de", "ngo", 3) };
    const rolled = must(s, { type: "roll" });
    assert.equal(cuesForAction(s, rolled, { type: "roll" })[0], "sulo.roll");
    const same = { ...rolled, event: s.event };
    assert.deepEqual(cuesForAction(s, same, { type: "roll" }), ["sulo.roll"]);
    const wrong = { ...rolled, event: { kind: "wrong" as const, text: "" } };
    assert.deepEqual(cuesForAction(rolled, wrong, { type: "answer", answer: 0 }), ["sulo.wrong"]);
  });

  it("nhạc: mê cung khi chưa vào ván hoặc ngoài trận, nhạc trận khi đang đánh trùm", () => {
    const s = newRun("de", "ngo", 1);
    assert.equal(musicFor(null), "sulo_maze");
    assert.equal(musicFor(s), "sulo_maze");
  });

  it("manifest có tệp cho mọi cue Sử Lộ và cả hai bản nhạc; tải sẵn đủ tiếng trận trùm", () => {
    const m = JSON.parse(readFileSync("public/audio/manifest.json", "utf8")) as { sfx: Record<string, unknown>; music: Record<string, unknown> };
    for (const c of SULO_CUES) assert.ok(m.sfx[c], c);
    assert.ok(m.music.sulo_maze && m.music.sulo_boss);
    for (const c of ["battle.swap", "battle.invalid", "battle.match3"]) assert.ok(SULO_PRELOAD.includes(c as never), c);
  });
});
