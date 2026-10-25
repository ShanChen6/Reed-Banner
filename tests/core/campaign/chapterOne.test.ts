import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BASIS_LABEL,
  CHAPTER_ONE,
  campaignBattleAdvice,
  campaignEncounter,
  campaignEncounterFoes,
  campaignScenarioByNode,
  campaignSurviveTurns,
  chapterOneCopyErrors,
  missionCopy,
  newProfile,
  storyNodeById,
} from "../../../src/core";

describe("Chương I: lời dẫn và nhãn sử liệu", () => {
  it("lựa chọn khớp allowlist, thoại luôn hư cấu, sử chép luôn có mã nguồn", () => {
    assert.deepEqual(chapterOneCopyErrors(), []);
  });

  it("M01 là truyền thuyết, M02 có claim sử chép: người chơi thấy hai lớp khác nhau", () => {
    const m01 = missionCopy("M01")!;
    const m02 = missionCopy("M02")!;
    assert.ok(m01.intro.some((b) => b.basis === "legend"));
    assert.ok(!m01.intro.some((b) => b.basis === "recorded"));
    assert.ok(m02.intro.some((b) => b.basis === "recorded"));
    assert.notEqual(BASIS_LABEL.legend.name, BASIS_LABEL.recorded.name);
    assert.ok(CHAPTER_ONE.legendVsRecord.legend.length > 0);
    assert.ok(CHAPTER_ONE.legendVsRecord.record.length > 0);
  });

  it("M03 hoàn toàn hư cấu và không nêu triều Ngô hay năm", () => {
    const m03 = missionCopy("M03")!;
    const beats = [...m03.intro, ...m03.outro, ...(m03.defeat ?? [])];
    assert.ok(beats.every((b) => b.basis === "fictional"));
    for (const beat of beats) {
      assert.doesNotMatch(beat.text, /Ngô|\b9\d\d\b/);
    }
    assert.ok(m03.objective);
  });

  it("M01–M04 chơi được; vùng khoanh là Hoa Lư như nhiệm vụ", () => {
    assert.deepEqual([...CHAPTER_ONE.playable], ["M01", "M02", "M03", "M04"]);
    for (const id of CHAPTER_ONE.playable) {
      assert.ok(missionCopy(id));
      assert.equal(storyNodeById(id)!.location.name, CHAPTER_ONE.region.name);
    }
  });
});

describe("Chương I: encounter M03 và lời khuyên trước trận", () => {
  it("M03 có đúng thủ lĩnh mà mục tiêu cầm cự cần; nhiệm vụ story không có encounter", () => {
    const foes = campaignEncounterFoes("M03")!;
    const objective = campaignScenarioByNode("M03")!.phases[0]!.objective;
    assert.equal(foes.length, 1);
    assert.equal(objective.type, "surviveTurns");
    if (objective.type === "surviveTurns")
      assert.equal(foes[0]!.id, objective.bossFighterId);
    assert.equal(campaignSurviveTurns("M03"), 4);
    assert.equal(campaignEncounterFoes("M01"), undefined);
  });

  it("hồ sơ mới đủ cấp và đủ lương cho M03, không bị ép cày", () => {
    const advice = campaignBattleAdvice(newProfile(), "M03")!;
    assert.equal(advice.mode, "1v1");
    assert.equal(advice.underLevel, false);
    assert.equal(
      advice.recommendedLevel,
      campaignEncounter("M03")!.recommendedLevel,
    );
    assert.equal(advice.suggestedFood, 50);
    assert.equal(advice.lowFood, false);
    assert.deepEqual(advice.team, []);
  });

  it("gợi ý hệ khắc thủ lĩnh và cảnh báo khi lương thấp", () => {
    const profile = newProfile();
    const hungry = {
      ...profile,
      campaign: { ...profile.campaign, supply: 20 },
    };
    const advice = campaignBattleAdvice(hungry, "M03")!;
    assert.equal(advice.leaderElement, "tho");
    assert.deepEqual([...advice.counterElements].sort(), ["moc", "phong"]);
    assert.deepEqual([...advice.weakElements].sort(), ["loi", "thuy"]);
    assert.equal(advice.lowFood, true);
  });

  it("cảnh báo cấp thấp khi cấp gợi ý cao hơn nhân vật chính", () => {
    const profile = newProfile();
    const advice = campaignBattleAdvice(
      { ...profile, main: { ...profile.main, level: 0 } },
      "M03",
    )!;
    assert.equal(advice.underLevel, true);
  });
});

describe("Chương I: M04 Hoa Lư năm 951", () => {
  it("3vs3 Thường, cầm cự 6 lượt, tướng tiên phong là thủ lĩnh mục tiêu", () => {
    const foes = campaignEncounterFoes("M04")!;
    const objective = campaignScenarioByNode("M04")!.phases[0]!.objective;
    assert.equal(foes.length, 3);
    assert.equal(campaignSurviveTurns("M04"), 6);
    if (objective.type === "surviveTurns")
      assert.equal(foes[0]!.id, objective.bossFighterId);
    const advice = campaignBattleAdvice(newProfile(), "M04")!;
    assert.equal(advice.mode, "3v3");
    assert.deepEqual(advice.team, newProfile().team);
    assert.equal(advice.suggestedFood, 60);
  });

  it("lời dẫn 951 có sử chép kèm nguồn, con tin chỉ kể gián tiếp, không ai trong trận mang tên người có thật", () => {
    const m04 = missionCopy("M04")!;
    const recorded = m04.intro.filter((b) => b.basis === "recorded");
    assert.ok(
      recorded.some((b) => b.text.includes("951") && b.refs?.includes("E04")),
    );
    assert.ok(recorded.some((b) => b.refs?.includes("E04a")));
    // Không gán thoại cho hai vua Ngô; không tuyên bố nhà Ngô bị tiêu diệt hay Đinh Liễn được cứu/chết.
    const beats = [
      ...m04.intro,
      ...m04.outro,
      ...m04.choices.flatMap((c) => c.beats),
    ];
    for (const b of beats) {
      assert.doesNotMatch(b.speaker ?? "", /Ngô/);
      assert.doesNotMatch(b.text, /tiêu diệt nhà Ngô|giải cứu|Liễn (chết|tử)/);
    }
    assert.ok(
      m04.outro.some((b) => b.basis === "recorded" && b.refs?.includes("E04")),
    );
    for (const f of campaignEncounterFoes("M04")!)
      assert.doesNotMatch(f.name, /Xương|Quyền|Tam Kha/);
  });
});
