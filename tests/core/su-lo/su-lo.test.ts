import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  SL_LEVEL_ORDER,
  SL_LEVELS,
  SL_ERA_TRAPS,
  SL_QUESTIONS,
  SL_TRAPS,
  adjacency,
  bfs,
  distanceTo,
  eraPlayable,
  findBestSwap,
  generateMaze,
  isCorrect,
  newRun,
  newSkirmish,
  questionById,
  questionErrors,
  reachable,
  skAct,
  slAct,
  starsOf,
  type SlAction,
  type SlState,
} from "../../../src/core/su-lo";

const ledger = [
  readFileSync("docs/02-game-modes/campaign/history-sources.md", "utf8"),
  readFileSync("docs/02-game-modes/su-lo/nguon-su.md", "utf8"),
].join("\n");

const must = (s: SlState, a: SlAction): SlState => {
  const r = slAct(s, a);
  assert.ok(r.ok, `${JSON.stringify(a)} -> ${r.ok ? "" : r.reason} ${r.ok ? "" : (r.detail ?? "")}`);
  return r.state;
};

/** Trả lời theo tỉ lệ đúng `p` (dùng rng riêng của test để tất định). */
function answerFor(s: SlState, good: boolean): number | number[] {
  const q = questionById(s.question!.id)!;
  if (good) return typeof q.answer === "number" ? q.answer : [...q.answer];
  if (typeof q.answer === "number") return (q.answer + 1) % q.options.length;
  return [...q.answer].reverse();
}

function play(seed: number, level: (typeof SL_LEVEL_ORDER)[number], pCorrect: number, maxSteps = 4000): SlState {
  let s = newRun(level, "loanSuQuan", seed);
  let r = seed * 9301 + 49297;
  const rand = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  for (let step = 0; step < maxSteps && s.phase !== "won"; step++) {
    if (s.phase === "roll") s = must(s, { type: "roll" });
    else if (s.phase === "move") {
      // Đi tới ô gần cổng nhất trong các ô tới được.
      const dist = distanceTo(s, s.maze.exit);
      const d = (i: number) => (dist[i]! < 0 ? 999 : dist[i]!);
      const opts = [...reachable(s).keys()].sort((a, b) => d(a) - d(b));
      s = must(s, { type: "move", to: opts[0]! });
    } else if (s.phase === "question") s = must(s, { type: "answer", answer: answerFor(s, rand() < pCorrect) });
    else if (s.phase === "skirmish") {
      const mv = findBestSwap(s.skirmish!);
      if (s.skirmish!.energy >= 100) s = must(s, { type: "skirmish", action: { type: "stratagem", row: 7 } });
      else if (mv) s = must(s, { type: "skirmish", action: { type: "swap", from: mv.from, to: mv.to } });
      else s = must(s, { type: "retreat" });
    }
  }
  return s;
}

describe("Sử Lộ · kho câu hỏi", () => {
  it("mọi câu đúng quy tắc soạn và id không trùng", () => {
    for (const q of SL_QUESTIONS) assert.deepEqual(questionErrors(q), [], q.id);
    assert.equal(new Set(SL_QUESTIONS.map((q) => q.id)).size, SL_QUESTIONS.length);
  });

  it("câu trích (quote) có nguyên văn trong sổ nguồn", () => {
    for (const q of SL_QUESTIONS) for (const s of q.sources) if (s.quote) assert.ok(ledger.includes(s.quote), `${q.id}: "${s.quote}"`);
  });

  it("đáp án đúng được chấm đúng, đáp án khác bị chấm sai", () => {
    for (const q of SL_QUESTIONS) {
      const good = typeof q.answer === "number" ? q.answer : [...q.answer];
      assert.ok(isCorrect(q, good), q.id);
      assert.ok(!isCorrect(q, null));
      if (typeof q.answer === "number") assert.ok(!isCorrect(q, (q.answer + 1) % q.options.length));
    }
  });

  it("mê cung I, II chơi được; III, IV chưa mở vì thiếu nguồn", () => {
    assert.ok(eraPlayable("ngo"));
    assert.ok(eraPlayable("loanSuQuan"));
    assert.ok(!eraPlayable("dinh"));
    assert.ok(!eraPlayable("tienLe"));
  });
});

describe("Sử Lộ · sinh mê cung", () => {
  for (const level of SL_LEVEL_ORDER) {
    it(`bậc ${level}: liền một khối, cổng chỉ vào qua boss, đường đủ dài`, () => {
      for (let seed = 1; seed <= 40; seed++) {
        const m = generateMaze(level, "loanSuQuan", seed);
        const all = bfs(adjacency(m, () => true), m.start);
        assert.ok(all.every((d) => d >= 0), "mọi ô nối với xuất phát");
        const exitEdges = m.edges.filter((e) => e.a === m.exit || e.b === m.exit);
        assert.equal(exitEdges.length, 1);
        assert.ok(exitEdges[0]!.a === m.boss || exitEdges[0]!.b === m.boss);
        assert.ok(m.shortest >= 6, `quãng ngắn nhất ${m.shortest}`);
        assert.equal(m.cells.length, SL_LEVELS[level].cols * SL_LEVELS[level].rows);
        assert.ok(m.cells.filter((c) => c.kind === "gate").length >= 1);
      }
    });
  }

  it("cùng seed thì cùng mê cung", () => {
    assert.deepEqual(generateMaze("thuong", "ngo", 7), generateMaze("thuong", "ngo", 7));
  });

  it("bẫy của từng giai đoạn nằm trong bộ bẫy chung", () => {
    for (const set of Object.values(SL_ERA_TRAPS)) for (const t of set) assert.ok(SL_TRAPS.includes(t), t);
  });
});

describe("Sử Lộ · luật lượt", () => {
  it("sai thì về ô bắt đầu lượt, đúng thì cắm cờ", () => {
    let s = must(newRun("de", "loanSuQuan", 3), { type: "roll" });
    const start = s.pos;
    const to = [...reachable(s).keys()][0]!;
    s = must(s, { type: "move", to });
    if (s.phase === "question") {
      const wrong = must(s, { type: "answer", answer: answerFor(s, false) });
      assert.equal(wrong.pos, start);
      assert.equal(wrong.wrong, 1);
      const right = must(s, { type: "answer", answer: answerFor(s, true) });
      assert.ok(right.cleared[to] || right.question !== null);
    }
  });

  it("không đi xuyên qua cửa ải hay boss chưa thông, không vào cổng khi boss còn", () => {
    for (let seed = 1; seed <= 20; seed++) {
      let s = newRun("thuong", "loanSuQuan", seed);
      s = { ...s, phase: "move", roll: 6 };
      for (const path of reachable(s).values()) {
        for (const c of path.slice(0, -1)) assert.notEqual(s.maze.cells[c]!.kind, "gate");
        assert.ok(!path.includes(s.maze.exit));
      }
    }
  });

  it("Hỏa tốc cho chọn số bước; trợ giúp không vượt giới hạn", () => {
    const s = newRun("de", "ngo", 5);
    const r = slAct(s, { type: "aid", aid: "hoaToc", value: 4 });
    assert.ok(r.ok && r.state.roll === 4 && r.state.aids.hoaToc === 0);
    assert.ok(!slAct(s, { type: "aid", aid: "hoaToc", value: 9 }).ok);
  });

  it("Lọc lời ẩn hai đáp án sai, không ẩn đáp án đúng", () => {
    for (let seed = 1; seed <= 30; seed++) {
      let s = must(newRun("de", "loanSuQuan", seed), { type: "roll" });
      s = must(s, { type: "move", to: [...reachable(s).keys()][0]! });
      if (s.phase !== "question") continue;
      const q = questionById(s.question!.id)!;
      const r = slAct(s, { type: "aid", aid: "locLoi" });
      if (typeof q.answer !== "number" || q.options.length < 4) {
        assert.ok(!r.ok);
        continue;
      }
      assert.ok(r.ok);
      assert.equal(r.state.question!.hidden.length, 2);
      assert.ok(!r.state.question!.hidden.includes(q.answer));
      return;
    }
  });

  it("người trả lời luôn đúng thoát được ở mọi bậc; cùng seed phát lại như nhau", () => {
    for (const level of SL_LEVEL_ORDER) {
      for (let seed = 1; seed <= 8; seed++) {
        const s = play(seed, level, 1);
        assert.equal(s.phase, "won", `${level} seed ${seed}`);
        assert.ok(starsOf(s) >= 1);
      }
    }
    assert.deepEqual(play(11, "thuong", 0.7), play(11, "thuong", 0.7));
  });

  it("người trả lời đúng 50% vẫn thoát được (không giới hạn lượt)", () => {
    for (let seed = 1; seed <= 6; seed++) assert.equal(play(seed, "thuong", 0.5).phase, "won", `seed ${seed}`);
  });
});

describe("Sử Lộ · giao tranh một chiều", () => {
  it("boss không đánh lại: chỉ Thành lực và số nước thay đổi", () => {
    const sk = newSkirmish(1, 340, 340, 12);
    const mv = findBestSwap(sk)!;
    const r = skAct(sk, { type: "swap", from: mv.from, to: mv.to });
    assert.ok(r.ok);
    assert.ok(r.state.hp < 340);
    assert.ok(r.state.movesLeft <= 12);
  });

  it("đổi ô không tạo bộ ghép bị từ chối", () => {
    const sk = newSkirmish(2, 300, 300, 10);
    const r = skAct(sk, { type: "swap", from: { row: 0, col: 0 }, to: { row: 5, col: 5 } });
    assert.ok(!r.ok);
  });

  it("cân số: người đánh tham lam thắng phần lớn trận ở bậc Thường trong một hoặc hai lần", () => {
    const cfg = SL_LEVELS.thuong;
    let firstWins = 0;
    let twoTries = 0;
    const N = 40;
    for (let seed = 1; seed <= N; seed++) {
      let hp = cfg.bossHp;
      for (let attempt = 0; attempt < 2; attempt++) {
        let sk = newSkirmish(seed * 7 + attempt, cfg.bossHp, hp, cfg.skirmishMoves);
        while (sk.phase === "play") {
          if (sk.counselPending) sk = (skAct(sk, { type: "counsel", correct: true }) as { state: typeof sk }).state;
          else if (sk.energy >= 100) sk = (skAct(sk, { type: "stratagem", row: 7 }) as { state: typeof sk }).state;
          else {
            const mv = findBestSwap(sk);
            if (!mv) break;
            sk = (skAct(sk, { type: "swap", from: mv.from, to: mv.to }) as { state: typeof sk }).state;
          }
        }
        if (sk.phase === "won") {
          if (attempt === 0) firstWins++;
          twoTries++;
          break;
        }
        hp = sk.hp;
      }
    }
    // Mục tiêu: thắng ngay lần đầu khoảng 40–80%, trong hai lần gần như luôn thắng.
    assert.ok(firstWins >= N * 0.35 && firstWins <= N * 0.85, `thắng lần đầu ${firstWins}/${N}`);
    assert.ok(twoTries >= N * 0.85, `thắng trong hai lần ${twoTries}/${N}`);
  });
});
