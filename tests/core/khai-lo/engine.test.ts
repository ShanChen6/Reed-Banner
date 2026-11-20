import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Element } from "../../../src/core/battle/elements";
import {
  KL_NEAR_CLEAR_BONUS,
  clearBonus,
  KL_TIMED_START_SECONDS,
  KL_TOOL_CHARGE,
  timedGoal,
  KL_START_TOOLS,
  allGroups,
  createGame,
  generateBoard,
  groupAt,
  groupScore,
  hasGroup,
  levelConfig,
  parseGame,
  serializeGame,
  settle,
  tilesLeft,
  transition,
  type KlCell,
  type KlState,
} from "../../../src/core/khai-lo";

const K: Record<string, Element> = { a: "kim", b: "moc", c: "thuy", d: "hoa" };

/** Dựng bàn từ chuỗi: mỗi dòng là một hàng, "." là ô trống, chữ hoa là ô hào quang. */
function board(rows: string[]): { cells: (KlCell | null)[]; width: number; height: number } {
  let id = 1;
  const cells = rows.flatMap((row) =>
    [...row].map((ch) => (ch === "." ? null : { id: id++, kind: K[ch.toLowerCase()] as Element, ...(ch !== ch.toLowerCase() ? { banner: true as const } : {}) })),
  );
  return { cells, width: (rows[0] as string).length, height: rows.length };
}

function stateOf(rows: string[], over: Partial<KlState> = {}): KlState {
  const b = board(rows);
  return { ...createGame(1, "classic", b.width, b.height), ...b, nextId: 1000, tools: kit(), ...over };
}

/** Kho đạo cụ: mặc định 0 mọi hệ, ghi đè hệ cần dùng. */
const kit = (over: Partial<Record<Element, number>> = {}): Record<Element, number> => ({ kim: 0, moc: 0, thuy: 0, hoa: 0, tho: 0, loi: 0, phong: 0, ...over });

const draw = (s: Pick<KlState, "cells" | "width">) => {
  const inv = Object.fromEntries(Object.entries(K).map(([k, v]) => [v, k]));
  const out: string[] = [];
  for (let r = 0; r < s.cells.length / s.width; r++)
    out.push(s.cells.slice(r * s.width, (r + 1) * s.width).map((c) => (c ? inv[c.kind] : ".")).join(""));
  return out;
};

describe("Khai Lộ: nhóm và trọng lực", () => {
  it("loang 4 hướng, không đi chéo", () => {
    const b = board(["aab", "bab", "bba"]);
    assert.deepEqual(groupAt(b.cells, b.width, b.height, 0), [0, 1, 4]);
    assert.deepEqual(groupAt(b.cells, b.width, b.height, 8), [8]);
  });

  it("rơi xuống đáy và dồn cột trống sang trái", () => {
    const b = board(["a.b", "a.b", "a.c"]);
    const cells = b.cells.slice();
    for (const i of [0, 3, 6]) cells[i] = null;
    assert.deepEqual(draw({ cells: settle(cells, 3, 3), width: 3 }), ["b..", "b..", "c.."]);
  });

  it("điểm nhóm n² × (1 + số ô hào quang)", () => {
    assert.equal(groupScore(3, 0), 9);
    assert.equal(groupScore(5, 2), 75);
  });
});

describe("Khai Lộ: luật nước đi", () => {
  it("chạm ô lẻ bị từ chối, chạm nhóm thì xóa cả nhóm và cộng điểm", () => {
    const s = stateOf(["abb", "acc", "abb"]);
    const bad = transition(stateOf(["abc", "bca", "cab"]), { type: "pick", index: 0 });
    assert.deepEqual(bad, { ok: false, reason: "single" });
    const r = transition(s, { type: "pick", index: 4 });
    assert.ok(r.ok);
    assert.equal(r.state.score, 4);
    assert.deepEqual(draw(r.state), ["a..", "abb", "abb"]);
  });

  it("ô hào quang nhân điểm nhóm", () => {
    const r = transition(stateOf(["aA", "bc"], { tools: kit({ hoa: 1 }) }), { type: "pick", index: 0 });
    assert.ok(r.ok);
    assert.equal(r.state.score, groupScore(2, 1));
  });

  it("ván mới có sẵn mỗi hệ một đạo cụ", () => {
    assert.deepEqual(createGame(1).tools, kit({ kim: KL_START_TOOLS, moc: KL_START_TOOLS, thuy: KL_START_TOOLS, hoa: KL_START_TOOLS, tho: KL_START_TOOLS, loi: KL_START_TOOLS, phong: KL_START_TOOLS }));
  });

  it("dọn sạch bàn: thưởng 300 + 50 × màn, không tự cộng đạo cụ", () => {
    const s = stateOf(["aa", "aa"]);
    const r = transition(s, { type: "pick", index: 0 });
    assert.ok(r.ok);
    assert.equal(r.state.phase, "levelDone");
    assert.equal(clearBonus(1), 350);
    assert.equal(r.state.score, 16 + clearBonus(1));
    assert.deepEqual(r.state.tools, kit());
    const n = transition(r.state, { type: "nextLevel" });
    assert.ok(n.ok);
    assert.equal(n.state.level, 2);
    assert.equal(n.state.phase, "playing");
  });

  it("chạm khối nạp thanh của hệ đó, đủ quân thì +1 đạo cụ hệ ấy, tích không giới hạn", () => {
    const s = stateOf(["aab", "bcd"], { charge: kit({ kim: KL_TOOL_CHARGE - 1 }) });
    const r = transition(s, { type: "pick", index: 0 });
    assert.ok(r.ok);
    assert.deepEqual(r.state.tools, kit({ kim: 1 }));
    assert.deepEqual(r.state.charge, kit({ kim: 1 }));
    assert.ok(r.events.some((e) => e.type === "toolCharged" && e.tool === "kim"));
    assert.equal(r.state.phase, "stuck");
    const many = transition(stateOf(["aab", "bcd"], { tools: kit({ kim: 20 }), charge: kit({ kim: KL_TOOL_CHARGE - 1 }) }), { type: "pick", index: 0 });
    assert.ok(many.ok);
    assert.equal(many.state.tools.kim, 21);
    assert.equal(many.state.charge.kim, 1);
    // hoàn tác trả lại cả đạo cụ và thanh nạp
    const u = transition(r.state, { type: "undo" });
    assert.ok(u.ok);
    assert.deepEqual(u.state.tools, s.tools);
    assert.deepEqual(u.state.charge, s.charge);
  });

  it("quân bị đạo cụ phá không nạp thanh", () => {
    const r = transition(stateOf(["abcd", "bcda", "cdab"], { tools: kit({ hoa: 1 }) }), { type: "tool", tool: "hoa", index: 0 });
    assert.ok(r.ok);
    assert.deepEqual(r.state.charge, kit());
  });

  it("Thường: hết khối mà còn quân, hết đạo cụ là thua ngay", () => {
    const r = transition(stateOf(["aab", "aac"]), { type: "pick", index: 0 });
    assert.ok(r.ok);
    assert.equal(r.state.phase, "over");
    assert.equal(r.state.summary?.left, 2);
    assert.equal(r.state.summary?.bonus, 0);
    assert.ok(r.events.some((e) => e.type === "over"));
  });

  it("hết khối còn đạo cụ thì bế tắc; chịu thua là hết ván", () => {
    const s = stateOf(["aab", "bcd"], { tools: kit({ loi: 1 }) });
    const r = transition(s, { type: "pick", index: 0 });
    assert.ok(r.ok);
    assert.equal(r.state.phase, "stuck");
    const e = transition(r.state, { type: "endLevel" });
    assert.ok(e.ok);
    assert.equal(e.state.phase, "over");
    assert.equal(e.state.summary?.cleared, false);
  });

  it("Lốc Phong xoay 8 ô quanh tâm theo chiều kim đồng hồ, không dùng ở mép", () => {
    const s = stateOf(["abc", "dad", "cba"], { tools: kit({ phong: 1 }) });
    assert.deepEqual(transition(s, { type: "tool", tool: "phong", index: 1 }), { ok: false, reason: "edge" });
    const r = transition(s, { type: "tool", tool: "phong", index: 4 });
    assert.ok(r.ok);
    assert.deepEqual(draw(r.state), ["dab", "cac", "bad"]);
    assert.equal(r.state.tools.phong, 0);
  });

  it("chưa có đạo cụ thì không dùng được", () => {
    assert.deepEqual(transition(stateOf(["ab", "cd"]), { type: "tool", tool: "hoa", index: 0 }), { ok: false, reason: "noTool" });
  });

  it("Hỏa Cầu phá vùng 3×3, không cộng điểm", () => {
    const r = transition(stateOf(["abcd", "bcda", "cdab"], { tools: kit({ hoa: 1 }) }), { type: "tool", tool: "hoa", index: 0 });
    assert.ok(r.ok);
    assert.equal(r.state.score, 0);
    assert.equal(tilesLeft(r.state.cells), 8);
  });

  it("Kim Đao chém một hàng, Thủy Triều cuốn một cột, Địa Chấn phá hàng đáy", () => {
    const base = ["abcd", "bcda", "cdab"];
    const kim = transition(stateOf(base, { tools: kit({ kim: 1 }) }), { type: "tool", tool: "kim", index: 5 });
    assert.ok(kim.ok);
    assert.deepEqual(draw(kim.state), ["....", "abcd", "cdab"]);
    const thuy = transition(stateOf(base, { tools: kit({ thuy: 1 }) }), { type: "tool", tool: "thuy", index: 0 });
    assert.ok(thuy.ok);
    assert.deepEqual(draw(thuy.state), ["bcd.", "cda.", "dab."]);
    const tho = transition(stateOf(base, { tools: kit({ tho: 1 }) }), { type: "tool", tool: "tho", index: 0 });
    assert.ok(tho.ok);
    assert.deepEqual(draw(tho.state), ["....", "abcd", "bcda"]);
  });

  it("Lôi Phạt xóa mọi quân cùng hệ với ô chọn", () => {
    const r = transition(stateOf(["abcd", "bcda", "cdab"], { tools: kit({ loi: 1 }) }), { type: "tool", tool: "loi", index: 0 });
    assert.ok(r.ok);
    assert.equal(tilesLeft(r.state.cells), 9);
    assert.ok(r.state.cells.every((c) => c?.kind !== "kim"));
  });

  it("Mộc Linh đổi quân sang hệ của khối lớn nhất kề nó", () => {
    const s = stateOf(["bba", "cad", "ccd"], { tools: kit({ moc: 2 }) });
    const r = transition(s, { type: "tool", tool: "moc", index: 4 });
    assert.ok(r.ok);
    // kề ô giữa: b (khối 2), c (khối 3), d (khối 2) → đổi sang c
    assert.equal(r.state.cells[4]?.kind, "thuy");
    const lone = stateOf(["aa", "aa"], { tools: kit({ moc: 1 }) });
    assert.deepEqual(transition(lone, { type: "tool", tool: "moc", index: 0 }), { ok: false, reason: "noTarget" });
  });

  it("đọc bản lưu cũ có Lốc/Sấm: Lốc thành Lốc Phong, Sấm thành Hỏa Cầu", () => {
    const old = JSON.parse(serializeGame(createGame(5))) as Record<string, unknown>;
    old.tools = { whirl: 2, thunder: 1 };
    old.charge = { whirl: 100, thunder: 5 };
    const p = parseGame(JSON.stringify(old));
    assert.deepEqual(p?.tools, kit({ phong: 2, hoa: 1 }));
    assert.deepEqual(p?.charge, kit());
  });

  it("hoàn tác một bước, mỗi màn một lần", () => {
    const s = stateOf(["aab", "ccb", "dda"]);
    const r = transition(s, { type: "pick", index: 0 });
    assert.ok(r.ok);
    const u = transition(r.state, { type: "undo" });
    assert.ok(u.ok);
    assert.deepEqual(u.state.cells, s.cells);
    assert.equal(u.state.score, 0);
    assert.equal(u.state.undo, 0);
    const r2 = transition(u.state, { type: "pick", index: 0 });
    assert.ok(r2.ok);
    assert.deepEqual(transition(r2.state, { type: "undo" }), { ok: false, reason: "noUndo" });
  });
});

describe("Khai Lộ: sinh bàn và lưu ván", () => {
  it("cùng seed cùng bàn, luôn có nhóm, số loại ô tăng theo màn", () => {
    assert.deepEqual(generateBoard(42, 3, 1), generateBoard(42, 3, 1));
    for (let level = 1; level <= 20; level++) {
      const { cells } = generateBoard(7, level, 1);
      assert.ok(hasGroup(cells, 10, 8));
      assert.equal(new Set(cells.map((c) => c?.kind)).size <= levelConfig(level).kinds, true);
      assert.equal(cells.filter((c) => c?.banner).length, levelConfig(level).banners);
    }
    assert.equal(levelConfig(3).kinds, 3);
    assert.equal(levelConfig(4).kinds, 4);
    assert.equal(levelConfig(8).kinds, 5);
    assert.equal(levelConfig(13).kinds, 5);
    assert.equal(levelConfig(14).kinds, 6);
  });

  it("chơi tham lam tới hết ván luôn kết thúc, không kẹt", () => {
    let s = createGame(123);
    for (let step = 0; step < 5000 && s.phase !== "over"; step++) {
      if (s.phase === "levelDone") {
        const n = transition(s, { type: "nextLevel" });
        assert.ok(n.ok);
        s = n.state;
        continue;
      }
      const groups = allGroups(s.cells, s.width, s.height);
      const r = groups.length
        ? transition(s, { type: "pick", index: (groups.sort((a, b) => b.length - a.length)[0] as number[])[0] as number })
        : transition(s, { type: "endLevel" });
      assert.ok(r.ok);
      s = r.state;
    }
    assert.equal(s.phase, "over");
  });

  it("lưu rồi đọc lại giữ nguyên ván, dữ liệu hỏng trả về null", () => {
    const s = createGame(9);
    assert.deepEqual(parseGame(serializeGame(s)), s);
    assert.equal(parseGame("{"), null);
    assert.equal(parseGame(JSON.stringify({ ...s, version: 2 })), null);
  });
});

describe("Khai Lộ: Cấp tốc", () => {
  it("mốc điểm cộng dồn theo bậc: 400 + 50 × (bậc − 1)", () => {
    assert.equal(timedGoal(1), 400);
    assert.equal(timedGoal(2), 850);
    assert.equal(timedGoal(3), 1350);
  });

  it("đạt mốc thì lên bậc ngay, chia bàn mới", () => {
    const s = stateOf(["aab", "bcd"], { mode: "timed", score: timedGoal(1) - 4 });
    const r = transition(s, { type: "pick", index: 0 });
    assert.ok(r.ok);
    assert.equal(r.state.level, 2);
    assert.equal(r.state.phase, "playing");
    assert.equal(r.state.deal, 0);
    assert.ok(r.events.some((e) => e.type === "goalReached" && e.level === 2));
    assert.equal(tilesLeft(r.state.cells), 6);
    assert.equal(r.state.prev, null);
  });

  it("bàn dọn sạch thì thưởng rồi chia bàn mới cùng bậc", () => {
    const s = stateOf(["aa", "aa"], { mode: "timed" });
    const r = transition(s, { type: "pick", index: 0 });
    assert.ok(r.ok);
    assert.equal(r.state.level, 1);
    assert.equal(r.state.deal, 1);
    assert.equal(r.state.phase, "playing");
    assert.equal(r.state.score, 16 + clearBonus(1));
    assert.equal(tilesLeft(r.state.cells), 4);
    assert.ok(r.events.some((e) => e.type === "redeal" && e.cleared));
  });

  it("bàn hết đường còn tối đa 3 quân: thưởng gần sạch rồi chia bàn mới", () => {
    const r = transition(stateOf(["aab", "aac"], { mode: "timed" }), { type: "pick", index: 0 });
    assert.ok(r.ok);
    assert.equal(r.state.phase, "playing");
    assert.equal(r.state.score, 16 + KL_NEAR_CLEAR_BONUS);
    assert.equal(r.state.deal, 1);
  });

  it("thưởng dọn sạch đủ mốc thì lên bậc luôn", () => {
    const r = transition(stateOf(["aa", "aa"], { mode: "timed", score: timedGoal(1) - 100 }), { type: "pick", index: 0 });
    assert.ok(r.ok);
    assert.equal(r.state.level, 2);
  });

  it("bế tắc chỉ đổi bàn khi đã hết khối; Thường không có timeUp", () => {
    const playing = stateOf(["aab", "bcd"], { mode: "timed", tools: kit({ hoa: 1 }) });
    assert.deepEqual(transition(playing, { type: "endLevel" }), { ok: false, reason: "notStuck" });
    const stuck = transition(playing, { type: "pick", index: 0 });
    assert.ok(stuck.ok);
    assert.equal(stuck.state.phase, "stuck");
    const d = transition(stuck.state, { type: "endLevel" });
    assert.ok(d.ok);
    assert.equal(d.state.deal, 1);
    assert.equal(d.state.phase, "playing");
    assert.deepEqual(transition(stateOf(["aa", "bb"]), { type: "timeUp" }), { ok: false, reason: "notPlaying" });
  });

  it("hết giờ là hết ván", () => {
    const r = transition(stateOf(["aab", "ccd"], { mode: "timed" }), { type: "timeUp" });
    assert.ok(r.ok);
    assert.equal(r.state.phase, "over");
    assert.ok(r.events.some((e) => e.type === "over"));
    assert.equal(KL_TIMED_START_SECONDS, 90);
  });

  it("chia bàn khác nhau theo lượt chia", () => {
    const a = generateBoard(3, 1, 1, 10, 8, 0).cells.map((c) => c?.kind).join();
    const b = generateBoard(3, 1, 1, 10, 8, 1).cells.map((c) => c?.kind).join();
    assert.notEqual(a, b);
  });

  it("lưu/đọc giữ chế độ; bản lưu cũ không có chế độ là Thường", () => {
    const t = createGame(5, "timed");
    assert.equal(parseGame(serializeGame(t))?.mode, "timed");
    const old = JSON.parse(serializeGame(createGame(5))) as Record<string, unknown>;
    delete old.mode;
    assert.equal(parseGame(JSON.stringify(old))?.mode, "classic");
  });
});
