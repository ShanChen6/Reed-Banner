import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FULLSCREEN_SCENES, SCENES } from "../../src/app/game/scene";

describe("nút toàn màn hình theo phân cảnh", () => {
  it("chỉ gồm phân cảnh có thật", () => {
    for (const s of FULLSCREEN_SCENES) assert.ok((SCENES as readonly string[]).includes(s), s);
  });

  it("hiện ở mọi màn, kể cả Chiến Trường, Cửa Hàng, Doanh Trại và tài khoản", () => {
    for (const s of SCENES) assert.ok(FULLSCREEN_SCENES.has(s), s);
  });
});
