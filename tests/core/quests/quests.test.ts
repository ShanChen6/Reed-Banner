import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyProfileAction,
  CHAPTER1_STAGES,
  CHECKIN_GOLD,
  DAILY_QUESTS,
  newProfile,
  parseProfile,
  questProgress,
  recordMatch,
  STORY_NODES,
  vnDay,
  vnWeek,
  WEEKLY_QUESTS,
  type MatchSummary,
  type Profile,
} from "../../../src/core";

const DAY = 24 * 60 * 60 * 1000;
/** Thứ Ba 20/10/2026, 10 giờ sáng giờ Việt Nam. */
const T = Date.UTC(2026, 9, 20, 3);
const win: MatchSummary = { mode: "normal", won: true, coins: 12, waves: 0 };

function played(p: Profile, ms: MatchSummary[], now = T): Profile {
  return {
    ...p,
    quests: ms.reduce((q, m) => recordMatch(q, m, now), p.quests),
  };
}

describe("nhiệm vụ, thành tựu, điểm danh", () => {
  it("ngày và tuần theo giờ Việt Nam, tuần bắt đầu thứ Hai", () => {
    assert.equal(vnDay(T), "2026-10-20");
    assert.equal(vnWeek(T), "2026-10-19");
    assert.equal(vnWeek(Date.UTC(2026, 9, 25, 16, 59)), "2026-10-19");
    assert.equal(vnWeek(Date.UTC(2026, 9, 25, 17, 0)), "2026-10-26");
  });

  it("đếm trận theo chế độ, nhận thưởng một lần, sang ngày mới thì làm lại", () => {
    let p = played(newProfile(), [win, win, { ...win, won: false }]);
    const play3 = DAILY_QUESTS.find((q) => q.id === "d.play3")!;
    assert.deepEqual(questProgress(p.quests, play3, T), {
      value: 3,
      done: true,
      claimed: false,
    });
    const r = applyProfileAction(p, { type: "claimQuest", id: "d.play3" }, T);
    assert.ok(r.ok);
    assert.equal(r.profile.gold, p.gold + play3.gold);
    p = r.profile;
    assert.deepEqual(
      applyProfileAction(p, { type: "claimQuest", id: "d.play3" }, T),
      { ok: false, error: "questClaimed" },
    );
    assert.deepEqual(
      applyProfileAction(p, { type: "claimQuest", id: "d.daily" }, T),
      { ok: false, error: "questNotDone" },
    );
    // Hôm sau: nhiệm vụ ngày làm lại, nhiệm vụ tuần giữ tiến độ.
    const next = T + DAY;
    assert.equal(questProgress(p.quests, play3, next).value, 0);
    const win15 = WEEKLY_QUESTS.find((q) => q.id === "w.win15")!;
    assert.equal(questProgress(p.quests, win15, next).value, 2);
    assert.equal(questProgress(p.quests, win15, T + 7 * DAY).value, 0);
    assert.equal(p.quests.totals.win, 2);
  });

  it("nhiệm vụ chiến dịch, sinh tồn đếm đúng chế độ", () => {
    const p = played(newProfile(), [
      { mode: "raid", won: true, coins: 0, waves: 0 },
      { mode: "campaign", won: false, coins: 0, waves: 0 },
      { mode: "survival", won: true, coins: 0, waves: 7 },
      { mode: "daily", won: false, coins: 0, waves: 0 },
    ]);
    assert.deepEqual(p.quests.weekStats, {
      play: 4,
      win: 2,
      campaign: 1,
      waves: 7,
      daily: 1,
    });
  });

  it("điểm danh: mỗi ngày một lần, liền ngày thì tăng, đứt thì về ngày 1, đủ 7 thì lại từ đầu", () => {
    let p = newProfile();
    const golds: number[] = [];
    for (let d = 0; d < 8; d++) {
      const r = applyProfileAction(p, { type: "checkIn" }, T + d * DAY);
      assert.ok(r.ok);
      golds.push(r.profile.gold - p.gold);
      p = r.profile;
    }
    assert.deepEqual(golds, [...CHECKIN_GOLD, CHECKIN_GOLD[0]]);
    assert.equal(p.quests.totals.bestStreak, 7);
    assert.deepEqual(
      applyProfileAction(p, { type: "checkIn" }, T + 7 * DAY + 1000),
      { ok: false, error: "alreadyCheckedIn" },
    );
    const gap = applyProfileAction(p, { type: "checkIn" }, T + 10 * DAY);
    assert.ok(gap.ok);
    assert.equal(gap.profile.quests.checkIn.streak, 1);
  });

  it("thành tựu đọc từ hồ sơ, nhận một lần; hồ sơ cũ đọc ra nhiệm vụ trống", () => {
    assert.equal(
      CHAPTER1_STAGES,
      STORY_NODES.filter((node) => node.chapter === 1).length,
    );
    const p = played(newProfile(), [win]);
    const r = applyProfileAction(p, { type: "claimAchievement", id: "a.win1" });
    assert.ok(r.ok);
    assert.equal(r.profile.gold, 50);
    assert.deepEqual(
      applyProfileAction(r.profile, { type: "claimAchievement", id: "a.win1" }),
      { ok: false, error: "questClaimed" },
    );
    assert.deepEqual(
      applyProfileAction(p, { type: "claimAchievement", id: "a.survival10" }),
      { ok: false, error: "questNotDone" },
    );
    const old = JSON.parse(JSON.stringify(newProfile()));
    delete old.quests;
    assert.equal(parseProfile(old)!.quests.checkIn.streak, 0);
    const bad = {
      ...old,
      quests: { totals: { win: -3, play: 2 }, checkIn: { streak: 99 } },
    };
    assert.deepEqual(parseProfile(bad)!.quests.totals, { play: 2 });
    assert.equal(parseProfile(bad)!.quests.checkIn.streak, 0);
  });
});
