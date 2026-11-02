import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AMBIENCE_IDS, MUSIC_IDS } from "../../src/app/game/audio/cues";
import { SELF, soundOfScene } from "../../src/app/game/audio/sceneMusic";
import { SCENES } from "../../src/app/game/scene";

describe("âm thanh theo phân cảnh", () => {
  it("mọi phân cảnh có khai báo hợp lệ và chỉ dùng mã nhạc/âm nền đã có", () => {
    for (const scene of SCENES) {
      const s = soundOfScene(scene);
      if (s.music !== null && s.music !== SELF) assert.ok((MUSIC_IDS as readonly string[]).includes(s.music), `${scene}: ${s.music}`);
      if (s.ambience !== null) assert.ok((AMBIENCE_IDS as readonly string[]).includes(s.ambience), `${scene}: ${s.ambience}`);
    }
  });

  it("phân cảnh tự lo nhạc: Trận Đồ và trận đánh; bản đồ chiến dịch có nhạc và âm nền", () => {
    for (const s of ["FORMATION", "PLAYING", "PRACTICE"] as const) assert.equal(soundOfScene(s).music, SELF);
    assert.deepEqual(soundOfScene("CAMPAIGN"), { music: "atlas", ambience: "atlas" });
  });

  it("màn chính, cửa hàng, hồ sơ và đăng nhập im lặng", () => {
    for (const s of ["MENU", "SHOP", "PROFILE", "LOGIN", "QUESTS", "LEADERBOARD", "DAILY"] as const) assert.deepEqual(soundOfScene(s), { music: null, ambience: null });
  });

  it("Tháp, Đấu trường, Sinh tồn mỗi nơi một bài", () => {
    assert.equal(soundOfScene("TRIAL").music, "tower_trial");
    assert.equal(soundOfScene("DESTINY").music, "tower_destiny");
    assert.equal(soundOfScene("ARENA").music, "arena");
    assert.equal(soundOfScene("SURVIVAL").music, "survival");
  });
});
