import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { achievementById, achievementProgress, applyProfileAction, newProfile, parseProfile, parseProfileAction, FORMATION_PLACE_IDS } from "../../src/core";

describe("bộ sưu tập địa danh trong hồ sơ (V2-05)", () => {
  it("collectPlaces gộp, bỏ trùng và bỏ id lạ", () => {
    let p = newProfile();
    for (const ids of [["hoaLu", "coLoa"], ["hoaLu", "khongCo", "bachDang"]]) {
      const r = applyProfileAction(p, { type: "collectPlaces", ids });
      assert.ok(r.ok);
      p = r.profile;
    }
    assert.deepEqual(p.formation?.collection, ["hoaLu", "coLoa", "bachDang"]);
  });

  it("parseProfileAction chỉ nhận mảng chuỗi tối đa 100", () => {
    assert.ok(parseProfileAction({ type: "collectPlaces", ids: ["hoaLu"] }));
    assert.equal(parseProfileAction({ type: "collectPlaces", ids: [1] }), null);
    assert.equal(parseProfileAction({ type: "collectPlaces", ids: Array(101).fill("hoaLu") }), null);
    assert.equal(parseProfileAction({ type: "collectPlaces" }), null);
  });

  it("hồ sơ đọc lại giữ id hợp lệ, id lạ bị bỏ", () => {
    const raw = { ...newProfile(), formation: { collection: ["hoaLu", "x", "hoaLu"] } };
    assert.deepEqual(parseProfile(raw).formation?.collection, ["hoaLu"]);
  });

  it("mốc 5/15/30 địa danh: nhận thưởng đúng một lần", () => {
    const def = achievementById("a.places5")!;
    assert.equal(def.gold, 200);
    let p = applyProfileAction(newProfile(), { type: "collectPlaces", ids: FORMATION_PLACE_IDS.slice(0, 4) });
    assert.ok(p.ok);
    assert.equal(achievementProgress(p.profile, def).done, false);
    const claimEarly = applyProfileAction(p.profile, { type: "claimAchievement", id: "a.places5" });
    assert.ok(!claimEarly.ok);
    p = applyProfileAction(p.profile, { type: "collectPlaces", ids: FORMATION_PLACE_IDS.slice(0, 5) });
    assert.ok(p.ok);
    const got = applyProfileAction(p.profile, { type: "claimAchievement", id: "a.places5" });
    assert.ok(got.ok && got.profile.gold === 200);
    assert.ok(!applyProfileAction(got.profile, { type: "claimAchievement", id: "a.places5" }).ok);
    assert.equal(achievementById("a.places30")!.target, FORMATION_PLACE_IDS.length);
  });
});
