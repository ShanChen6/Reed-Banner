import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  boardScores,
  completeCampaignNode,
  describeScore,
  isBoardId,
  newProfile,
  UNKNOWN_STAGE_TURNS,
} from "../../../src/core";

describe("bảng xếp hạng", () => {
  it("chiến dịch giữ số lượt ít nhất cho node battle", () => {
    let p = newProfile();
    for (const id of ["M01", "M02"] as const) {
      const result = completeCampaignNode(p.campaign, id);
      assert.ok(result.ok);
      p = { ...p, campaign: result.campaign };
    }
    let result = completeCampaignNode(p.campaign, "M03", { turns: 40 });
    assert.ok(result.ok);
    p = { ...p, campaign: result.campaign };
    result = completeCampaignNode(p.campaign, "M03", { turns: 52 });
    assert.ok(result.ok);
    p = { ...p, campaign: result.campaign };
    assert.equal(p.campaign.bestBattleTurns.M03, 40);
    result = completeCampaignNode(p.campaign, "M03", { turns: 31 });
    assert.ok(result.ok);
    assert.equal(result.campaign.bestBattleTurns.M03, 31);
  });

  it("điểm: nhiều màn hơn luôn đứng trên, cùng số màn thì ít lượt hơn đứng trên", () => {
    const withNodes = (turns: number) => {
      let p = newProfile();
      for (const id of ["M01", "M02"] as const) {
        const result = completeCampaignNode(p.campaign, id);
        assert.ok(result.ok);
        p = { ...p, campaign: result.campaign };
      }
      const result = completeCampaignNode(p.campaign, "M03", { turns });
      assert.ok(result.ok);
      return { ...p, campaign: result.campaign };
    };
    const a = withNodes(40);
    const bResult = completeCampaignNode(a.campaign, "M04", { turns: 300 });
    assert.ok(bResult.ok);
    const b = { ...a, campaign: bResult.campaign };
    const fast = withNodes(20);
    const score = (p: typeof a, board: string) =>
      boardScores(p).find((s) => s.board === board)!.score;
    assert.ok(score(b, "campaign") > score(a, "campaign"));
    assert.ok(score(fast, "campaign") > score(a, "campaign"));
    assert.ok(score(fast, "mission:M03") > score(a, "mission:M03"));
    // 4 nhiệm vụ; chỉ M03 (40) và M04 (300) là trận nên cộng lượt, sự kiện M01/M02 không cộng.
    assert.deepEqual(describeScore("campaign", score(b, "campaign")), {
      main: 4,
      turns: 340,
    });
    assert.deepEqual(describeScore("mission:M03", -20), { main: 20 });
    // Bảng từng trận chỉ có nhiệm vụ có trận, không có bảng của sự kiện.
    assert.deepEqual(
      boardScores(b)
        .map((s) => s.board)
        .filter((x) => x.startsWith("mission:")),
      ["mission:M03", "mission:M04"],
    );
    // Nhiệm vụ có trận đã xong mà chưa có số lượt tính như UNKNOWN_STAGE_TURNS; sự kiện không tính lượt.
    const old = {
      ...newProfile(),
      campaign: {
        ...newProfile().campaign,
        completed: ["M01", "M02", "M03"] as const,
      },
    };
    assert.deepEqual(describeScore("campaign", score(old, "campaign")), {
      main: 3,
      turns: UNKNOWN_STAGE_TURNS,
    });
    assert.deepEqual(boardScores(newProfile()), []);
  });

  it("tên bảng hợp lệ", () => {
    assert.ok(isBoardId("campaign") && isBoardId("mission:M03"));
    // Bảng màn cũ, nhiệm vụ sự kiện và id lạ bị từ chối.
    assert.ok(
      !isBoardId("stage:M03") &&
        !isBoardId("stage:coLau") &&
        !isBoardId("mission:M01") &&
        !isBoardId("mission:") &&
        !isBoardId("mission:a;drop") &&
        !isBoardId(1),
    );
  });
});
