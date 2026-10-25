import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  autoProgress,
  buildCompanion,
  applyProfileAction,
  CAMPAIGN_FACTION_IDS,
  CAMPAIGN_FOOD_MAX,
  createBattle,
  encounterFighter,
  FOOD_PRICE,
  HERO_COMPANIONS,
  HOME_TERRAIN,
  legacyHeroSkills,
  characterSkills,
  legacyElementSkills,
  newProfile,
  parseProfile,
  profileTeam,
  signatureOf,
  NEW_PROGRESS,
  SKILL_POINTS_PER_LEVEL,
  totalXpFor,
  WARLORD_ENCOUNTERS,
  warlordEncounter,
  warlordLeader,
  type Profile,
} from "../../../src/core";

// Chiến dịch 13 màn cũ đã gỡ ở CAMP-08.04. Ở đây còn: danh mục 12 sứ quân dùng chung, doanh trại, chuyển hồ sơ
// cũ, tướng lịch sử và chiêu riêng.
describe("danh mục 12 sứ quân", () => {
  it("đủ 12 sứ quân theo id thế cục, không trùng, số đối thủ đúng thể thức, dựng được trận", () => {
    assert.deepEqual(
      WARLORD_ENCOUNTERS.map((w) => w.id),
      [...CAMPAIGN_FACTION_IDS],
    );
    assert.equal(new Set(WARLORD_ENCOUNTERS.map((w) => w.encounterId)).size, 12);
    for (const w of WARLORD_ENCOUNTERS) {
      assert.equal(w.foes.length, w.mode === "3v3" ? 3 : 1, w.id);
      assert.equal(w.foes[0]!.id, w.id);
      assert.ok(w.foes[0]!.hero && w.foes.slice(1).every((f) => !f.hero));
      const foes = w.foes.map((f) => encounterFighter(f, w.level));
      assert.equal(new Set(foes.map((f) => f.id)).size, foes.length);
      createBattle({
        sides: [
          { fighters: foes, leader: 0 },
          { fighters: foes, leader: 0 },
        ],
        seed: 1,
        weights: HOME_TERRAIN[w.foes[0]!.element],
      });
      assert.ok(w.place && w.modernRegion && w.foes[0]!.title, w.id);
      assert.ok(w.lines.before && w.lines.win && w.lines.lose, w.id);
      assert.ok(w.recommended >= w.level, w.id);
    }
  });

  it("sứ quân có bộ kỹ năng theo nguyên tố như nhân vật chính (ô 5 là chiêu riêng)", () => {
    const tran = warlordEncounter("tranLam")!;
    const lv20 = warlordLeader(tran, 20);
    assert.deepEqual(
      lv20.skills,
      legacyHeroSkills(tran.foes[0]!.element, "tranLam").map((s) => s.id),
    );
    assert.equal(lv20.name, "Trần Lãm");
  });
});

describe("chiến dịch: doanh trại và hồ sơ cũ", () => {
  it("doanh trại: mua lương bằng vàng, không quá mức tối đa", () => {
    const p = {
      ...newProfile(),
      gold: 1000,
      campaign: { ...newProfile().campaign, supply: 90 },
    };
    const r = applyProfileAction(p, { type: "buyFood", amount: 30 });
    assert.ok(r.ok);
    assert.equal(r.profile.campaign.supply, CAMPAIGN_FOOD_MAX);
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
    const migrated = parseProfile({
      ...newProfile(),
      campaign: { cleared: ["coLau", 3], food: 999, raids: { boHai: 2 } },
    }).campaign;
    assert.equal(migrated.supply, 60);
    assert.deepEqual(migrated.completed, []);
    // Bậc Đánh trùm theo id màn cũ chuyển sang id sứ quân.
    assert.deepEqual(migrated.raids, { tranLam: 2 });
  });
});

describe("tướng lịch sử", () => {
  it("tướng lịch sử mang bộ nghề + hệ, nâng theo ô, không mua chiêu nhánh", () => {
    // Lê Hoàn mở theo mốc V2 (M24); ở đây dựng sẵn ở cấp 8 như mở khóa ở cấp nhân vật chính.
    const base = newProfile();
    let profile: Profile = {
      ...base,
      companions: {
        ...base.companions,
        leHoan: {
          ...NEW_PROGRESS,
          level: 8,
          xp: totalXpFor(8),
          skillPoints: 7 * SKILL_POINTS_PER_LEVEL,
        },
      },
    };
    const kit = characterSkills("quanSu", "loi", "leHoan");
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

describe("chiêu riêng", () => {
  it("sứ quân luôn mang chiêu riêng thay ô 5, kể cả khi cấp chưa mở ô 5", () => {
    const warlords = WARLORD_ENCOUNTERS.map((w) => w.foes[0]!);
    assert.equal(new Set(warlords.map((f) => f.id)).size, 12);
    for (const f of warlords) {
      const sig = signatureOf(f.id);
      assert.ok(sig, f.id);
      assert.equal(sig.slot, 4);
      const fighter = encounterFighter(f, 2);
      assert.ok(fighter.skills!.includes(sig.id), f.id);
      const slot5 = legacyElementSkills(f.element).find((d) => d.slot === 5)!;
      assert.ok(!encounterFighter(f, 25).skills!.includes(slot5.id), f.id);
    }
  });

  it("tướng lịch sử có chiêu riêng ở ô 5, mở ở cấp 10 như nhân vật chính", () => {
    for (const h of HERO_COMPANIONS) {
      const sig = signatureOf(h.id)!;
      assert.ok(sig, h.id);
      assert.ok(h.skills!.includes(sig.id));
      assert.deepEqual(
        legacyHeroSkills(h.element, h.id).map((d) => d.slot),
        [1, 2, 3, 4, 5, 6],
      );
      assert.ok(!buildCompanion(h, autoProgress(9, null)).skills!.includes(sig.id));
      const at20 = buildCompanion(h, autoProgress(20, null));
      assert.ok(at20.skills!.includes(sig.id));
      assert.equal(
        at20.skillLevels![sig.id],
        autoProgress(20, null).skillLevels.o4 ?? 1,
      );
    }
  });

});
