import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";
import { MODE_INFO } from "../../src/app/game/modeInfo";

// Màn cần đăng nhập (UI-S2) hiện mô tả và luật/thưởng chính của mọi chế độ mà GameShell chặn khách.
const GATED = ["DESTINY", "SURVIVAL", "DAILY", "ARENA", "TAM_TUONG_KY", "LEADERBOARD"] as const;

describe("thông tin chế độ cho màn cần đăng nhập", () => {
  it("mọi chế độ chặn khách đều có mô tả và luật/thưởng", () => {
    for (const s of GATED) {
      assert.ok(MODE_INFO[s]?.text, s);
      assert.ok((MODE_INFO[s]?.perks?.length ?? 0) > 0, s);
    }
  });
  it("tranh banner có thật trong public/art/home", () => {
    for (const info of Object.values(MODE_INFO)) {
      if (info?.art) assert.ok(existsSync(`public/art/home/${info.art}.webp`), info.art);
    }
  });
});
