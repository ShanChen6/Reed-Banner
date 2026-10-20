import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyCampaignResult,
  autoProgress,
  buildCompanion,
  applyProfileAction,
  BOSS_HP,
  CAMPAIGN,
  CAMPAIGN_FOOD_MAX,
  CAMPAIGN_FOOD_MIN,
  createBattle,
  FOOD_PRICE,
  HERO_COMPANIONS,
  heroSkills,
  isHero,
  mainSkills,
  newProfile,
  parseProfile,
  RECOMMENDED_LEVEL_BONUS,
  recommendedLevel,
  runBattle,
  stageMatchups,
  stagePlayerTeam,
  stageTeamIds,
  profileTeam,
  stageById,
  stageFighter,
  stageFoes,
  stageUnlocked,
  signatureOf,
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

  it("sứ quân có bộ kỹ năng theo nguyên tố như nhân vật chính (ô 5 là chiêu riêng); trùm thêm máu", () => {
    const tran = stageById("boHai")!.foes[0]!;
    const lv20 = stageFighter({ ...tran }, 20);
    assert.deepEqual(
      lv20.skills,
      heroSkills(tran.element, tran.id).map((s) => s.id),
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
      campaign: { cleared: [], food: 90, raids: {}, bestTurns: {} },
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

describe("chiêu riêng và thoại", () => {
  it("sứ quân luôn mang chiêu riêng thay ô 5, kể cả khi cấp chưa mở ô 5", () => {
    const warlords = CAMPAIGN.flatMap((s) => s.foes.filter((f) => f.hero));
    assert.equal(new Set(warlords.map((f) => f.id)).size, 12);
    for (const f of warlords) {
      const sig = signatureOf(f.id);
      assert.ok(sig, f.id);
      assert.equal(sig.slot, 5);
      const fighter = stageFighter(f, 2);
      assert.ok(fighter.skills!.includes(sig.id), f.id);
      const slot5 = mainSkills(f.element).find((d) => d.slot === 5)!;
      assert.ok(!stageFighter(f, 25).skills!.includes(slot5.id), f.id);
    }
  });

  it("tướng lịch sử có chiêu riêng ở ô 5, mở ở cấp 20 như nhân vật chính", () => {
    for (const h of HERO_COMPANIONS) {
      const sig = signatureOf(h.id)!;
      assert.ok(sig, h.id);
      assert.ok(h.skills!.includes(sig.id));
      assert.deepEqual(
        heroSkills(h.element, h.id).map((d) => d.slot),
        [1, 2, 3, 4, 5, 6],
      );
      assert.ok(!buildCompanion(h, autoProgress(19, null)).skills!.includes(sig.id));
      const at20 = buildCompanion(h, autoProgress(20, null));
      assert.ok(at20.skills!.includes(sig.id));
      assert.equal(
        at20.skillLevels![sig.id],
        autoProgress(20, null).skillLevels.o5 ?? 1,
      );
    }
  });

  it("mỗi màn có thoại trước trận, khi thắng và khi thua; sứ quân có tước hiệu, màn có vùng đất ngày nay", () => {
    for (const s of CAMPAIGN) {
      assert.ok(s.region, s.id);
      for (const f of s.foes.filter((x) => x.hero)) assert.ok(f.title, f.id);
      assert.ok(s.lines.before && s.lines.win && s.lines.lose, s.id);
    }
  });
});

describe("mô phỏng theo màn", () => {
  it("đội người chơi theo cấp gợi ý, đội kèm là 2 tướng gia nhập gần nhất; trận mang luật màn", () => {
    const tamDai = stageById("tamDai")!;
    assert.deepEqual(stageTeamIds(tamDai, "heroes"), ["luuCo", "trinhTu"]);
    assert.deepEqual(stageTeamIds(stageById("binhKieu")!, "heroes"), [
      "dinhDien",
      "luuCo",
    ]);
    assert.deepEqual(stageTeamIds(tamDai, "default"), ["haVan", "maiThanh"]);
    const team = stagePlayerTeam(tamDai);
    assert.equal(team.length, 3);
    assert.equal(stagePlayerTeam(stageById("boHai")!).length, 1);
    const [m] = stageMatchups(tamDai, 1);
    assert.equal(m!.sides[1].food, tamDai.foeFood);
    assert.deepEqual(
      stageMatchups(stageById("hoiHo")!, 1)[0]!.weights,
      stageById("hoiHo")!.weights,
    );
    const r = runBattle(m!, { difficulty: ["normal", tamDai.difficulty] });
    assert.ok(r.turns > 0);
    assert.equal(
      recommendedLevel(tamDai),
      tamDai.recommended ?? tamDai.level + RECOMMENDED_LEVEL_BONUS,
    );
  });
});
