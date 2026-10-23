import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAIN_ID,
  newProfile,
  prepareTowerLineup,
  profileTeam,
  towerHpFromRatio,
  towerHpToRatio,
  type FloorRules,
  type PreparedLineupInput,
  type PreparedLineupResult,
} from "../../../src/core";

const profile = () => {
  const p = newProfile();
  return { ...p, main: { ...p.main, level: 20 } };
};
const [A, B] = ["haVan", "maiThanh"];
const trial = (extra: Partial<PreparedLineupInput> = {}) =>
  ({ mode: "trial", companions: [A, B], ...extra }) as PreparedLineupInput;
const err = (r: PreparedLineupResult) => (r.ok ? null : r.error);

describe("chuẩn bị đội Song Tháp", () => {
  it("Trial hợp lệ: thủ lĩnh slot 0, config khớp profileTeam, Profile không đổi", () => {
    const p = profile();
    const before = structuredClone(p);
    const r = prepareTowerLineup(p, trial(), {});
    assert.ok(r.ok);
    if (!r.ok) return;
    assert.deepEqual(r.lineup.ids, [MAIN_ID, A, B]);
    assert.deepEqual(r.lineup.side.fighters, profileTeam(p, [A, B]));
    assert.equal(r.lineup.side.leader, 0);
    assert.deepEqual(r.lineup.hpRatios, [1, 1, 1]);
    assert.deepEqual(p, before);
    assert.deepEqual(prepareTowerLineup(p, trial(), {}), r);
  });

  it("đổi nghề/hệ thủ lĩnh: áp vào config, không ghi Profile", () => {
    const p = profile();
    const r = prepareTowerLineup(
      p,
      trial({ leaderBuild: { profession: "phapSu", element: "hoa" } }),
      {},
    );
    assert.ok(r.ok);
    if (!r.ok) return;
    const leader = r.lineup.side.fighters[0]!;
    assert.equal(leader.profession, "phapSu");
    assert.equal(leader.element, "hoa");
    assert.equal(p.profession, "tuongSi");
    assert.equal(p.element, "moc");
  });

  it("thiếu một trường build thì giữ của hồ sơ; trường sai bị từ chối", () => {
    const p = profile();
    const r = prepareTowerLineup(p, trial({ leaderBuild: { element: "kim" } }), {});
    assert.ok(r.ok && r.lineup.leaderBuild.profession === p.profession);
    assert.deepEqual(
      err(prepareTowerLineup(p, trial({ leaderBuild: { element: "lua" as never } }), {})),
      { code: "invalid_leader_build", field: "element" },
    );
    assert.deepEqual(
      err(prepareTowerLineup(p, trial({ leaderBuild: { profession: "x" as never } }), {})),
      { code: "invalid_leader_build", field: "profession" },
    );
  });

  it("cấm hệ của thủ lĩnh sau khi đổi build", () => {
    const rules: FloorRules = { bannedElements: ["kim"] };
    const p = profile();
    assert.ok(prepareTowerLineup(p, trial(), rules).ok);
    const e = err(prepareTowerLineup(p, trial({ leaderBuild: { element: "kim" } }), rules));
    assert.equal(e?.code, "rule_violation");
    if (e?.code === "rule_violation") {
      assert.equal(e.errors[0]!.code, "banned_element");
      assert.deepEqual(e.errors[0]!.members, [MAIN_ID]);
    }
  });

  it("từ chối: id trùng, thủ lĩnh làm tướng kèm, chưa sở hữu, sai số lượng, rác", () => {
    const p = profile();
    const t = (companions: unknown) =>
      err(prepareTowerLineup(p, { mode: "trial", companions } as never, {}));
    assert.deepEqual(t([A, A]), { code: "duplicate_member", id: A });
    assert.deepEqual(t([MAIN_ID, A]), { code: "duplicate_member", id: MAIN_ID });
    assert.deepEqual(t([A, "khongCo"]), { code: "not_owned", id: "khongCo" });
    assert.deepEqual(t([A]), { code: "companion_count" });
    assert.deepEqual(t([A, B, "c"]), { code: "companion_count" });
    assert.deepEqual(t("x"), { code: "invalid_input" });
    assert.deepEqual(t([A, 5]), { code: "invalid_input" });
    assert.deepEqual(err(prepareTowerLineup(p, null as never, {})), { code: "invalid_input" });
    assert.deepEqual(
      err(prepareTowerLineup(p, { mode: "legacy", companions: [A, B] } as never, {})),
      { code: "invalid_input" },
    );
  });

  const destiny = (over: Record<string, unknown> = {}) =>
    ({
      mode: "destiny",
      companions: [A, B],
      roster: [MAIN_ID, A, B],
      hp: { [MAIN_ID]: 0.5, [A]: 1, [B]: 0.25 },
      ...over,
    }) as PreparedLineupInput;

  it("Destiny: giữ tỉ lệ máu theo slot", () => {
    const r = prepareTowerLineup(profile(), destiny(), {});
    assert.ok(r.ok);
    if (r.ok) assert.deepEqual(r.lineup.hpRatios, [0.5, 1, 0.25]);
  });

  it("Destiny: fighter gục không được chọn; thủ lĩnh gục cũng vậy", () => {
    assert.deepEqual(
      err(prepareTowerLineup(profile(), destiny({ hp: { [MAIN_ID]: 1, [A]: 0, [B]: 1 } }), {})),
      { code: "fighter_downed", id: A },
    );
    assert.deepEqual(
      err(prepareTowerLineup(profile(), destiny({ hp: { [MAIN_ID]: 0, [A]: 1, [B]: 1 } }), {})),
      { code: "fighter_downed", id: MAIN_ID },
    );
  });

  it("Destiny: ngoài roster khóa, roster hỏng, HP hỏng", () => {
    const p = profile();
    assert.deepEqual(
      err(prepareTowerLineup(p, destiny({ roster: [MAIN_ID, A] }), {})),
      { code: "not_in_roster", id: B },
    );
    assert.deepEqual(err(prepareTowerLineup(p, destiny({ roster: [A, MAIN_ID, B] }), {})), { code: "invalid_roster" });
    assert.deepEqual(err(prepareTowerLineup(p, destiny({ roster: [MAIN_ID, A, A, B] }), {})), { code: "invalid_roster" });
    assert.deepEqual(
      err(prepareTowerLineup(p, destiny({ hp: { [MAIN_ID]: 1, [A]: 1.5, [B]: 1 } }), {})),
      { code: "invalid_hp", id: A },
    );
    assert.deepEqual(
      err(prepareTowerLineup(p, destiny({ hp: { [MAIN_ID]: 1, [A]: 1 } }), {})),
      { code: "invalid_hp", id: B },
    );
  });

  it("roundtrip tỉ lệ máu qua đổi build thủ lĩnh", () => {
    assert.equal(towerHpFromRatio(100, 0), 0);
    assert.equal(towerHpFromRatio(100, 0.001), 1);
    assert.equal(towerHpFromRatio(100, 1), 100);
    for (const maxHp of [37, 100, 541])
      for (const ratio of [0.1, 0.5, 0.77, 1]) {
        const back = towerHpToRatio(towerHpFromRatio(maxHp, ratio), maxHp);
        assert.ok(Math.abs(back - ratio) <= 0.5 / maxHp + 1e-9);
      }
    // Tỉ lệ (không phải số máu) được lưu, nên đổi maxHp không lệch dần.
    const r = prepareTowerLineup(profile(), destiny({ leaderBuild: { profession: "quanSu" } }), {});
    assert.ok(r.ok);
    if (r.ok) {
      assert.equal(r.lineup.hpRatios[0], 0.5);
      const hp = towerHpFromRatio(r.lineup.side.fighters[0]!.maxHp, r.lineup.hpRatios[0]);
      assert.ok(hp >= 1);
    }
  });

  it("leader build chọn hợp luật: nghề bị cấm ở build mới bị chặn, cấm nghề mặc định vẫn đổi được", () => {
    const rules: FloorRules = { bannedProfessions: ["tuongSi"] };
    const p = profile();
    assert.equal(err(prepareTowerLineup(p, trial(), rules))?.code, "rule_violation");
    assert.ok(prepareTowerLineup(p, trial({ leaderBuild: { profession: "phapSu" } }), rules).ok);
  });
});
