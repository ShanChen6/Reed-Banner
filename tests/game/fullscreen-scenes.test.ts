import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FULLSCREEN_SCENES, SCENES } from "../../src/app/game/scene";

describe("nút toàn màn hình theo phân cảnh", () => {
  it("chỉ gồm phân cảnh có thật", () => {
    for (const s of FULLSCREEN_SCENES) assert.ok((SCENES as readonly string[]).includes(s), s);
  });

  it("hiện ở các màn trận, không hiện ở màn chính, cửa hàng, hồ sơ và tài khoản", () => {
    for (const s of ["PLAYING", "PRACTICE", "CAMPAIGN", "SURVIVAL", "ARENA", "TRIAL", "DESTINY"] as const) assert.ok(FULLSCREEN_SCENES.has(s), s);
    for (const s of ["MENU", "SHOP", "PROFILE", "LEADERBOARD", "QUESTS", "LOGIN", "ACCOUNT"] as const) assert.ok(!FULLSCREEN_SCENES.has(s), s);
  });
});
