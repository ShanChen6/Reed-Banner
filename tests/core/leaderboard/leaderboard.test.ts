import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyCampaignResult,
  boardScores,
  describeScore,
  isBoardId,
  newProfile,
  UNKNOWN_STAGE_TURNS,
} from "../../../src/core";

describe("bảng xếp hạng", () => {
  it("chiến dịch giữ số lượt ít nhất mỗi màn khi thắng", () => {
    let p = applyCampaignResult(newProfile(), "coLau", true, 50, 40).profile;
    p = applyCampaignResult(p, "coLau", true, 50, 52).profile;
    assert.equal(p.campaign.bestTurns.coLau, 40);
    p = applyCampaignResult(p, "coLau", true, 50, 31).profile;
    assert.equal(p.campaign.bestTurns.coLau, 31);
    p = applyCampaignResult(p, "boHai", false, 50, 10).profile;
    assert.equal(p.campaign.bestTurns.boHai, undefined);
  });

  it("điểm: nhiều màn hơn luôn đứng trên, cùng số màn thì ít lượt hơn đứng trên", () => {
    const a = applyCampaignResult(newProfile(), "coLau", true, 50, 40).profile;
    const b = applyCampaignResult(a, "boHai", true, 50, 300).profile;
    const fast = applyCampaignResult(
      newProfile(),
      "coLau",
      true,
      50,
      20,
    ).profile;
    const score = (p: typeof a, board: string) =>
      boardScores(p).find((s) => s.board === board)!.score;
    assert.ok(score(b, "campaign") > score(a, "campaign"));
    assert.ok(score(fast, "campaign") > score(a, "campaign"));
    assert.ok(score(fast, "stage:coLau") > score(a, "stage:coLau"));
    assert.deepEqual(describeScore("campaign", score(b, "campaign")), {
      main: 2,
      turns: 340,
    });
    assert.deepEqual(describeScore("stage:coLau", -20), { main: 20 });
    // Màn qua từ trước khi có bảng (chưa có số lượt) tính như UNKNOWN_STAGE_TURNS.
    const old = {
      ...newProfile(),
      campaign: { ...newProfile().campaign, cleared: ["coLau"] },
    };
    assert.deepEqual(describeScore("campaign", score(old, "campaign")), {
      main: 1,
      turns: UNKNOWN_STAGE_TURNS,
    });
    assert.deepEqual(boardScores(newProfile()), []);
  });

  it("tên bảng hợp lệ", () => {
    assert.ok(isBoardId("campaign") && isBoardId("stage:coLau"));
    assert.ok(
      !isBoardId("stage:") && !isBoardId("stage:a;drop") && !isBoardId(1),
    );
  });
});
