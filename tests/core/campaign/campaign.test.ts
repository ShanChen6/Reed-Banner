import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyCampaignResult,
  applyProfileAction,
  BOSS_HP,
  CAMPAIGN,
  CAMPAIGN_FOOD_MAX,
  CAMPAIGN_FOOD_MIN,
  createBattle,
  FOOD_PRICE,
  HERO_COMPANIONS,
  isHero,
  mainSkills,
  newProfile,
  parseProfile,
  professionSkills,
  profileTeam,
  stageById,
  stageFighter,
  stageFoes,
  stageUnlocked,
} from "../../../src/core";

describe("chiến dịch", () => {
  it("dữ liệu màn hợp lệ: id không trùng, số đối thủ đúng thể thức, dựng được trận", () => {
    assert.equal(new Set(CAMPAIGN.map((s) => s.id)).size, CAMPAIGN.length);
    for (const s of CAMPAIGN) {
      assert.equal(s.foes.length, s.mode === "3v3" ? 3 : 1, s.id);
      const foes = stageFoes(s);
      assert.equal(new Set(foes.map((f) => f.id)).size, foes.length);
      // Tỉ lệ ô của luật màn phải hợp lệ (createBattle kiểm tra).
      createBattle({
        sides: [
          { fighters: foes, leader: 0 },
          { fighters: foes, leader: 0 },
        ],
        seed: 1,
        ...(s.weights ? { weights: s.weights } : {}),
      });
    }
  });

  it("sứ quân có bộ kỹ năng theo nguyên tố như nhân vật chính; trùm thêm máu", () => {
    const tran = stageById("boHai")!.foes[0]!;
    const lv20 = stageFighter({ ...tran }, 20);
    assert.deepEqual(
      lv20.skills,
      mainSkills(tran.element).map((s) => s.id),
    );
    assert.equal(lv20.name, "Trần Lãm");
    const boss = stageById("doDong")!;
    const plain = stageFighter(boss.foes[0]!, boss.level);
    assert.equal(stageFoes(boss)[0]!.maxHp, Math.round(plain.maxHp * BOSS_HP));
  });

  it("mở màn lần lượt; qua màn lần đầu thưởng vàng, lương mang sang trong khoảng cho phép", () => {
    let p = newProfile();
    assert.ok(stageUnlocked(p.campaign, "coLau"));
    assert.ok(!stageUnlocked(p.campaign, "boHai"));
    const lost = applyCampaignResult(p, "coLau", false, 3);
    assert.equal(lost.result.firstClear, false);
    assert.equal(lost.profile.campaign.food, CAMPAIGN_FOOD_MIN);
    const won = applyCampaignResult(p, "coLau", true, 140);
    p = won.profile;
    assert.equal(won.result.bonusGold, stageById("coLau")!.firstClearGold);
    assert.equal(p.gold, won.result.bonusGold);
    assert.equal(p.campaign.food, CAMPAIGN_FOOD_MAX);
    assert.ok(stageUnlocked(p.campaign, "boHai"));
    const again = applyCampaignResult(p, "coLau", true, 50);
    assert.equal(again.result.bonusGold, 0);
    assert.deepEqual(again.profile.campaign.cleared, ["coLau"]);
  });

  it("doanh trại: mua lương bằng vàng, không quá mức tối đa", () => {
    const p = {
      ...newProfile(),
      gold: 1000,
      campaign: { cleared: [], food: 90 },
    };
    const r = applyProfileAction(p, { type: "buyFood", amount: 30 });
    assert.ok(r.ok);
    assert.equal(r.profile.campaign.food, CAMPAIGN_FOOD_MAX);
    assert.equal(r.profile.gold, 1000 - 10 * FOOD_PRICE);
    const full = applyProfileAction(r.profile, { type: "buyFood", amount: 10 });
    assert.deepEqual(full, { ok: false, error: "foodFull" });
    assert.deepEqual(
      applyProfileAction({ ...p, gold: 0 }, { type: "buyFood", amount: 10 }),
      { ok: false, error: "notEnoughGold" },
    );
  });

  it("hồ sơ cũ chưa có chiến dịch vẫn đọc được", () => {
    const old = { ...newProfile() } as Record<string, unknown>;
    delete old.campaign;
    assert.deepEqual(parseProfile(old).campaign, newProfile().campaign);
    assert.equal(
      parseProfile({
        ...newProfile(),
        campaign: { cleared: ["coLau", 3], food: 999 },
      }).campaign.food,
      CAMPAIGN_FOOD_MAX,
    );
  });
});

describe("tướng lịch sử gia nhập", () => {
  it("mỗi tướng lịch sử gia nhập ở đúng một màn, màn đó có câu kể", () => {
    for (const h of HERO_COMPANIONS) {
      const stages = CAMPAIGN.filter((s) => s.joins === h.id);
      assert.equal(stages.length, 1, h.id);
      assert.ok(stages[0]!.joinStory, h.id);
    }
    assert.ok(CAMPAIGN.every((s) => !s.joins || isHero(s.joins)));
  });

  it("qua màn lần đầu thì tướng gia nhập ở cấp của màn, đánh lại không cộng nữa", () => {
    const stage = CAMPAIGN.find((s) => s.joins === "leHoan")!;
    const first = applyCampaignResult(newProfile(), stage.id, true, 50);
    assert.equal(first.result.joined, "leHoan");
    const p = first.profile.companions.leHoan!;
    assert.equal(p.level, stage.level);
    assert.equal(p.skillPoints, stage.level - 1);
    const again = applyCampaignResult(first.profile, stage.id, true, 50);
    assert.equal(again.result.joined, undefined);
    assert.equal(
      applyCampaignResult(newProfile(), stage.id, false, 50).result.joined,
      undefined,
    );
  });

  it("tướng lịch sử mang bộ kỹ năng theo nguyên tố, nâng theo ô, không mua chiêu nhánh", () => {
    let profile = applyCampaignResult(newProfile(), "tamDai", true, 50).profile;
    const kit = mainSkills("loi");
    let r = applyProfileAction(profile, {
      type: "chooseTeam",
      companions: ["haVan", "leHoan"],
    });
    assert.ok(r.ok);
    profile = r.profile;
    const hero = profileTeam(profile, profile.team)[2]!;
    assert.equal(hero.id, "leHoan");
    assert.equal(hero.name, "Lê Hoàn");
    assert.equal(hero.profession, "quanSu");
    // Cấp 8: mở ô 1, 2 và 3 (ô 3 mở ở cấp 5).
    assert.deepEqual(
      hero.skills,
      kit.filter((s) => [1, 2, 3].includes(s.slot!)).map((s) => s.id),
    );
    r = applyProfileAction(profile, {
      type: "upgrade",
      character: "leHoan",
      key: "o1",
    });
    assert.ok(r.ok);
    assert.equal(r.profile.companions.leHoan!.skillLevels.o1, 2);
    const branch = professionSkills("quanSu").find((s) => s.tier === 2)!;
    assert.deepEqual(
      applyProfileAction(profile, {
        type: "buyBranch",
        character: "leHoan",
        skill: branch.id,
      }),
      {
        ok: false,
        error: "invalidSkill",
      },
    );
    // Tướng lịch sử không bán ở cửa hàng.
    assert.equal(
      applyProfileAction(newProfile(), {
        type: "buyCompanion",
        character: "leHoan",
      }).ok,
      false,
    );
  });
});
