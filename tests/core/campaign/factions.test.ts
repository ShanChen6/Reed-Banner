import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CAMPAIGN_FACTION_RESOLUTIONS,
  STORY_NODES,
  applyCampaignFirstClear,
  campaignCopyErrors,
  campaignEventByNode,
  completeCampaignNode,
  isCombatStoryNode,
  missionCopy,
  newProfile,
  parseCampaign,
  recordFactionResolution,
  storyNodeById,
  type CampaignMissionId,
  type Profile,
} from "../../../src/core";

const THROUGH_M10: readonly CampaignMissionId[] = [
  "M01",
  "M02",
  "M03",
  "M04",
  "M05",
  "M06",
  "M07",
  "M08",
  "M09",
  "M10",
];

function profileThrough(ids: readonly CampaignMissionId[]): Profile {
  const p = newProfile();
  let campaign = p.campaign;
  for (const id of ids) {
    const r = completeCampaignNode(campaign, id);
    assert.ok(r.ok, id);
    campaign = r.campaign;
  }
  return { ...p, campaign };
}

describe("thế cục sứ quân (FactionState)", () => {
  it("12 sứ quân, mỗi người đúng một nhiệm vụ; ba tuyến quy phục là sự kiện không có trận", () => {
    assert.equal(CAMPAIGN_FACTION_RESOLUTIONS.length, 12);
    assert.equal(
      new Set(CAMPAIGN_FACTION_RESOLUTIONS.map((r) => r.faction)).size,
      12,
    );
    assert.equal(
      new Set(CAMPAIGN_FACTION_RESOLUTIONS.map((r) => r.mission)).size,
      12,
    );
    const submissions = CAMPAIGN_FACTION_RESOLUTIONS.filter((r) =>
      ["M11", "M12", "M13"].includes(r.mission),
    );
    assert.deepEqual(
      submissions.map((r) => [r.mission, r.faction, r.status, r.settlement]),
      [
        ["M11", "phamBachHo", "submitted", "recordedSubmission"],
        ["M12", "ngoXuongXi", "submitted", "reconstructedAccord"],
        ["M13", "ngoNhatKhanh", "submitted", "politicalAccord"],
      ],
    );
    for (const r of submissions) {
      const node = storyNodeById(r.mission)!;
      assert.equal(node.type, "diplomacy");
      assert.ok(!isCombatStoryNode(node));
      const event = campaignEventByNode(r.mission)!;
      assert.equal(event.outcome, "submitted");
      assert.equal(event.faction?.faction, r.faction);
      assert.ok(event.participants.includes(r.faction));
    }
    for (const r of CAMPAIGN_FACTION_RESOLUTIONS)
      assert.ok(
        STORY_NODES.some((n) => n.id === r.mission),
        `${r.faction}: unknown mission`,
      );
  });

  it("ghi một lần: hoàn thành lại không ghi đè, không cộng gì", () => {
    const first = recordFactionResolution({}, "M11");
    assert.equal(first.recorded, true);
    const again = recordFactionResolution(first.factions, "M11");
    assert.equal(again.recorded, false);
    assert.equal(again.factions, first.factions);
    assert.equal(recordFactionResolution({}, "M09").recorded, false);
  });

  it("applyCampaignFirstClear cập nhật đúng sứ quân, lần hai không đổi", () => {
    const p = profileThrough(THROUGH_M10);
    const r = applyCampaignFirstClear(p, {
      nodeId: "M11",
      source: "event",
      choice: "retainForces",
    });
    assert.ok(r.ok);
    assert.equal(r.reward.factionRecorded, true);
    assert.deepEqual(r.profile.campaign.factions.phamBachHo, {
      status: "submitted",
      mission: "M11",
    });
    const replay = applyCampaignFirstClear(r.profile, {
      nodeId: "M11",
      source: "event",
      choice: "retainForces",
    });
    assert.ok(replay.ok);
    assert.equal(replay.reward.factionRecorded, false);
    assert.equal(replay.reward.totalGold, 0);
    assert.deepEqual(
      replay.profile.campaign.factions,
      r.profile.campaign.factions,
    );
    // Không thể hoàn thành M11 như một trận.
    const battle = applyCampaignFirstClear(p, {
      nodeId: "M11",
      source: "battle",
      turns: 5,
    });
    assert.deepEqual(battle, { ok: false, error: "wrongSource" });
  });

  it("parser suy thế cục từ nhiệm vụ đã hoàn thành, bỏ dữ liệu giả", () => {
    const p = profileThrough([...THROUGH_M10, "M11"]);
    const forged = {
      ...p.campaign,
      factions: {
        phamBachHo: { status: "defeated", mission: "M15" },
        doCanhThac: { status: "defeated", mission: "M21" },
      },
    };
    assert.deepEqual(
      parseCampaign(JSON.parse(JSON.stringify(forged))).factions,
      {
        tranLam: { status: "allied", mission: "M06" },
        phamBachHo: { status: "submitted", mission: "M11" },
      },
    );
  });
});

describe("lời dẫn M11–M13", () => {
  it("đủ ghi chú sử, cảnh dựng, 2–3 lựa chọn với giọng điệu khác nhau, không lỗi nội dung", () => {
    assert.deepEqual(campaignCopyErrors(), []);
    for (const id of ["M11", "M12", "M13"] as const) {
      const copy = missionCopy(id)!;
      assert.ok(copy.cinematic?.length, `${id}: cinematic`);
      assert.ok(
        copy.cinematic!.every((b) => b.basis === "fictional"),
        `${id}: cinematic basis`,
      );
      assert.ok(copy.sourceNotes?.length, `${id}: history note`);
      assert.ok(copy.choices.length >= 2 && copy.choices.length <= 3);
      const tones = campaignEventByNode(id)!.choices.map((c) => c.tone);
      assert.equal(new Set(tones).size, tones.length, `${id}: tones`);
      const all = [
        ...copy.intro,
        ...copy.outro,
        ...copy.choices.flatMap((c) => c.beats),
      ].map((b) => b.text);
      assert.ok(
        !all.some((t) => /đánh bại|hạ được|đầu hàng|chinh phạt/i.test(t)),
      );
      assert.ok(
        all.some((t) => /quy phục|về hàng/i.test(t)),
        `${id}: outcome`,
      );
    }
  });

  it("chi tiết hôn phối chưa kiểm chứng không được kể như sử chép", () => {
    const notes = missionCopy("M13")!.sourceNotes!.flatMap((n) => n.beats);
    const marriage = notes.filter((b) => /hôn/i.test(b.text));
    assert.ok(marriage.length > 0);
    assert.ok(marriage.every((b) => b.basis !== "recorded"));
  });
});
