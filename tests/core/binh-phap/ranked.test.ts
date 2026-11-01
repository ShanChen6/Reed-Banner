import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_RANKED_TURNS,
  RANKED_LEVELS,
  REWARD_GOLD,
  REWARD_TIERS,
  RULESETS,
  compareResults,
  createPuzzle,
  periodClosed,
  periodEnd,
  periodKey,
  publicPuzzle,
  rewardGold,
  rewardTier,
} from "../../../src/core/binh-phap";

const VN = (iso: string) => Date.parse(iso) - 7 * 3600_000; // giờ Việt Nam → mốc UTC

describe("kỳ xếp hạng", () => {
  it("Thường và Khó đổi kỳ lúc 0 giờ Việt Nam, Đại trận đổi vào thứ Hai", () => {
    const thu = VN("2026-11-04T23:59:59Z"); // thứ Tư 23:59 VN
    assert.equal(periodKey("thuong", thu), "2026-11-04");
    assert.equal(periodKey("kho", thu + 1000), "2026-11-05");
    assert.equal(periodKey("dai-tran", thu), "2026-11-02"); // thứ Hai
    assert.equal(periodKey("dai-tran", VN("2026-11-09T00:00:00Z")), "2026-11-09");
    assert.equal(periodKey("dai-tran", VN("2026-11-08T23:59:59Z")), "2026-11-02"); // Chủ nhật vẫn kỳ cũ
  });

  it("bậc học và bậc lạ không có kỳ", () => {
    assert.equal(periodKey("huong-dan", 0), null);
    assert.equal(periodKey("la", 0), null);
  });

  it("kỳ khép lại khi sang kỳ sau", () => {
    const now = VN("2026-11-05T10:00:00Z");
    assert.equal(periodClosed("thuong", "2026-11-04", now), true);
    assert.equal(periodClosed("thuong", "2026-11-05", now), false);
    assert.equal(periodClosed("dai-tran", "2026-11-02", now), false);
    assert.equal(periodClosed("dai-tran", "2026-11-02", VN("2026-11-09T00:00:01Z")), true);
  });

  it("mọi bậc xếp hạng là bậc có thật, không gồm bậc hướng dẫn, và có bảng thưởng", () => {
    for (const l of RANKED_LEVELS) {
      assert.ok(RULESETS.some((r) => r.id === l.id));
      assert.ok(REWARD_GOLD[l.id]);
    }
    assert.ok(!RANKED_LEVELS.some((l) => l.id === "huong-dan"));
  });
});

describe("thời điểm kết thúc kỳ", () => {
  it("kỳ ngày kết thúc lúc 0 giờ giờ Việt Nam hôm sau; kỳ tuần vào thứ Hai kế tiếp", () => {
    const wed = VN("2026-11-04T12:00:00Z"); // thứ Tư 12 giờ trưa VN
    assert.equal(periodEnd("thuong", wed), VN("2026-11-05T00:00:00Z"));
    assert.equal(periodEnd("kho", wed), VN("2026-11-05T00:00:00Z"));
    assert.equal(periodEnd("dai-tran", wed), VN("2026-11-09T00:00:00Z"));
    // Đúng mốc đổi kỳ thì kỳ mới bắt đầu, kết thúc sau một kỳ nữa.
    assert.equal(periodEnd("thuong", VN("2026-11-05T00:00:00Z")), VN("2026-11-06T00:00:00Z"));
    assert.equal(periodEnd("dai-tran", VN("2026-11-09T00:00:00Z")), VN("2026-11-16T00:00:00Z"));
    assert.equal(periodEnd("huong-dan", wed), null);
    // Kỳ luôn kết thúc đúng lúc periodClosed đổi.
    for (const lvl of ["thuong", "dai-tran"]) {
      const end = periodEnd(lvl, wed)!;
      assert.equal(periodKey(lvl, end - 1), periodKey(lvl, wed));
      assert.notEqual(periodKey(lvl, end), periodKey(lvl, wed));
    }
  });
});

describe("hạng và thưởng", () => {
  it("điểm cao hơn đứng trên, bằng điểm thì ít nước hơn, rồi nộp sớm hơn", () => {
    const a = { score: 900, turns: 50, finishedAt: 5 };
    assert.ok(compareResults(a, { score: 800, turns: 10, finishedAt: 1 }) < 0);
    assert.ok(compareResults(a, { score: 900, turns: 60, finishedAt: 1 }) < 0);
    assert.ok(compareResults(a, { score: 900, turns: 50, finishedAt: 9 }) < 0);
    assert.equal(compareResults(a, { ...a }), 0);
  });

  it("bảng ít người vẫn có thưởng: một mình một bảng là hạng nhất", () => {
    assert.equal(rewardTier(1, 1), "top1");
    assert.equal(rewardTier(1, 2), "top1");
    assert.equal(rewardTier(2, 2), "top3");
    assert.equal(rewardTier(3, 3), "top3");
    assert.equal(rewardTier(4, 4), "top10");
  });

  it("bậc theo hạng khi bảng đông", () => {
    assert.equal(rewardTier(1, 40), "top1");
    assert.equal(rewardTier(3, 40), "top3");
    assert.equal(rewardTier(10, 40), "top10");
    assert.equal(rewardTier(11, 40), "half");
    assert.equal(rewardTier(20, 40), "half");
    assert.equal(rewardTier(21, 40), "win");
    assert.equal(rewardTier(16, 31), "half"); // nửa trên làm tròn lên: ceil(31/2) = 16
    assert.equal(rewardTier(17, 31), "win");
  });

  it("mỗi người đúng một bậc, bậc không đảo ngược theo hạng", () => {
    const order = REWARD_TIERS.map((t) => t.tier);
    for (const winners of [1, 2, 3, 5, 8, 10, 15, 40, 200]) {
      let last = -1;
      for (let rank = 1; rank <= winners; rank++) {
        const t = rewardTier(rank, winners);
        assert.ok(t, `hạng ${rank}/${winners}`);
        const at = order.indexOf(t!);
        assert.ok(at >= last, `hạng ${rank}/${winners} bậc ${t} tốt hơn hạng liền trước`);
        last = at;
      }
    }
  });

  it("hạng không hợp lệ không có thưởng", () => {
    for (const [r, w] of [[0, 5], [6, 5], [-1, 5], [1.5, 5], [1, 0]] as const) assert.equal(rewardTier(r, w), null);
  });

  it("vàng tăng theo bậc thưởng và theo mức độ chơi", () => {
    for (const id of ["thuong", "kho", "dai-tran"]) {
      const g = REWARD_GOLD[id]!;
      assert.ok(g.top1 > g.top3 && g.top3 > g.top10 && g.top10 > g.half && g.half > g.win && g.win > 0, id);
    }
    for (const tier of Object.keys(REWARD_GOLD.thuong!) as (keyof (typeof REWARD_GOLD)["thuong"])[]) {
      assert.ok(REWARD_GOLD.thuong![tier]! < REWARD_GOLD.kho![tier]! && REWARD_GOLD.kho![tier]! < REWARD_GOLD["dai-tran"]![tier]!);
    }
    assert.deepEqual(rewardGold("kho", 1, 20), { tier: "top1", gold: 300 });
    assert.equal(rewardGold("huong-dan", 1, 20), null);
  });
});

describe("bản gửi cho client", () => {
  it("không lộ seed và trạng thái RNG", () => {
    const view = publicPuzzle(createPuzzle(RULESETS[1]!, 123456));
    assert.ok(!("seed" in view) && !("rngState" in view));
    assert.ok(view.cells.length > 0 && view.hand);
    assert.ok(MAX_RANKED_TURNS >= 300);
  });
});
