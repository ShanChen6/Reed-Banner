import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyProfileAction,
  joinSpecialCompanion,
  newProfile,
  ownsCompanion,
  parseProfile,
  profileTeam,
  recordSpecialMatch,
  recordSpecialTrialWin,
  SPECIAL_DIVERSE_WINS,
  specialFinalReady,
  specialQuestOpen,
  specialQuestProgress,
  STORY_NODES,
  type Profile,
} from "../../src/core";
import { createBattleFor, getBattle, parseNewBattle } from "../../src/server/battles";
import { loadProfile, MemoryProfileStore } from "../../src/server/profiles";
import { MemoryMatchStore } from "../../src/server/store";

const T0 = 7_000_000;

/** Hồ sơ đã qua hết các chương tới `chapter`. */
function cleared(chapter: number, base: Profile = newProfile()): Profile {
  const completed = STORY_NODES.filter((n) => n.chapter <= chapter).map((n) => n.id);
  return { ...base, campaign: { ...base.campaign, completed } };
}

describe("nhiệm vụ nhân vật đặc biệt (lõi)", () => {
  it("chỉ hiện sau chương mốc: Đinh Ngọc Chương II, Trần Vũ Phong Chương IV", () => {
    assert.equal(specialQuestOpen(newProfile(), "dinhNgoc"), false);
    assert.equal(specialQuestOpen(cleared(2), "dinhNgoc"), true);
    assert.equal(specialQuestOpen(cleared(2), "vuPhong"), false);
    assert.equal(specialQuestOpen(cleared(4), "vuPhong"), true);
    // Chưa mở thì trận thắng không được tính.
    const p = recordSpecialMatch(newProfile(), { won: true, elements: ["kim", "hoa", "thuy"] });
    assert.deepEqual(specialQuestProgress(p, "dinhNgoc"), { step: 0, wins: 0 });
  });

  it("ba bước nối tiếp, gia nhập cấp 1 đúng một lần", () => {
    let p = cleared(2);
    // Thua hoặc đội ít hơn 3 hệ thì không tính.
    p = recordSpecialMatch(p, { won: false, elements: ["kim", "hoa", "thuy"] });
    p = recordSpecialMatch(p, { won: true, elements: ["kim", "kim", "thuy"] });
    assert.equal(specialQuestProgress(p, "dinhNgoc").wins, 0);
    // Thắng tầng có luật khi còn ở bước 1 không nhảy bước.
    p = recordSpecialTrialWin(p, true);
    assert.equal(specialQuestProgress(p, "dinhNgoc").step, 0);
    for (let i = 0; i < SPECIAL_DIVERSE_WINS; i++)
      p = recordSpecialMatch(p, { won: true, elements: ["kim", "hoa", "thuy"] });
    assert.deepEqual(specialQuestProgress(p, "dinhNgoc"), { step: 1, wins: SPECIAL_DIVERSE_WINS });
    // Tầng không có luật không tính.
    p = recordSpecialTrialWin(p, false);
    assert.equal(specialQuestProgress(p, "dinhNgoc").step, 1);
    assert.equal(specialFinalReady(p, "dinhNgoc"), false);
    p = recordSpecialTrialWin(p, true);
    assert.equal(specialFinalReady(p, "dinhNgoc"), true);
    const joined = joinSpecialCompanion(p, "dinhNgoc");
    assert.equal(joined.joined, true);
    assert.equal(joined.profile.companions.dinhNgoc?.level, 1);
    assert.equal(specialQuestProgress(joined.profile, "dinhNgoc").step, 3);
    assert.equal(joinSpecialCompanion(joined.profile, "dinhNgoc").joined, false);
    // Hồ sơ lưu rồi đọc lại vẫn giữ nhân vật và tiến độ.
    const reread = parseProfile(JSON.parse(JSON.stringify(joined.profile)));
    assert.ok(ownsCompanion(reread, "dinhNgoc"));
    assert.equal(reread.specialQuests?.dinhNgoc?.step, 3);
    // Đã có thì ra trận được như nhân vật kèm thường.
    const team = applyProfileAction(reread, { type: "chooseTeam", companions: ["dinhNgoc", "haVan"] });
    assert.ok(team.ok);
    const fighters = profileTeam(team.profile, team.profile.team);
    assert.equal(fighters[1]!.id, "dinhNgoc");
    assert.equal(fighters[1]!.level, 1);
  });

  it("không mua được ở cửa hàng", () => {
    const r = applyProfileAction({ ...cleared(6), gold: 1_000_000 }, { type: "buyCompanion", character: "dinhNgoc" });
    assert.equal(r.ok, false);
  });
});

describe("nhiệm vụ nhân vật đặc biệt (server)", () => {
  it("trận thường đếm bước 1, trận cuối chỉ mở ở bước 3 và thắng thì gia nhập", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    let n = 0;
    const deps = { store, profiles, now: T0, seed: 3, newId: () => `m_${++n}` };
    const owner = "g_special";
    const cur = await loadProfile(profiles, owner);
    assert.ok(await profiles.put(owner, cleared(2, cur.profile), cur.version));

    const forceWin = async (id: string) => {
      const rec = (await store.get(id))!;
      const battle = { ...rec.match.battle, winner: 0 as const };
      assert.ok(await store.save({ ...rec, match: { ...rec.match, battle, seq: rec.match.seq + 1 } }, rec.match.seq));
      const done = await getBattle(id, owner, { store, profiles, now: T0 + 1000 });
      assert.ok(done.ok && done.outcome);
      return done.outcome;
    };

    // Kim (chính) + Hỏa + Thủy: đủ 3 hệ.
    const normal = { mode: "3v3", element: "kim", profession: "tuongSi", companions: ["haVan", "maiThanh"], difficulty: "easy" };
    for (let i = 0; i < SPECIAL_DIVERSE_WINS; i++) {
      const r = await createBattleFor(owner, parseNewBattle(normal)!, deps);
      assert.ok(r.ok);
      await forceWin(r.id);
    }
    let saved = (await loadProfile(profiles, owner)).profile;
    assert.equal(specialQuestProgress(saved, "dinhNgoc").step, 1);

    const final = { ...normal, specialQuest: "dinhNgoc" };
    assert.ok(parseNewBattle(final));
    assert.equal(parseNewBattle({ ...final, specialQuest: "khongCo" }), null);
    assert.equal(parseNewBattle({ ...final, daily: true }), null);
    assert.deepEqual(await createBattleFor(owner, parseNewBattle(final)!, deps), { ok: false, error: "badRequest" });

    const ready = await loadProfile(profiles, owner);
    assert.ok(await profiles.put(owner, recordSpecialTrialWin(ready.profile, true), ready.version));
    const r = await createBattleFor(owner, parseNewBattle(final)!, deps);
    assert.ok(r.ok);
    assert.equal(r.view.specialQuest, "dinhNgoc");
    assert.equal(r.view.difficulty, "hard");
    assert.equal(r.view.battle.sides[1].fighters[0]!.id, "dinhNgoc");
    const outcome = await forceWin(r.id);
    assert.deepEqual(outcome.specialQuest, { id: "dinhNgoc", joined: true });
    saved = (await loadProfile(profiles, owner)).profile;
    assert.ok(ownsCompanion(saved, "dinhNgoc"));
    // Đã có thì mang Đinh Ngọc vào trận thường được.
    const withHer = await createBattleFor(owner, parseNewBattle({ ...normal, companions: ["dinhNgoc", "haVan"] })!, deps);
    assert.ok(withHer.ok);
    assert.equal(withHer.view.battle.sides[0].fighters[1]!.id, "dinhNgoc");
  });
});
