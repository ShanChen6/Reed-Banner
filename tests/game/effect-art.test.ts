import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { EFFECT_KINDS } from "../../src/core";
import { effectArt } from "../../src/app/game/art/effects";

test("mọi hiệu ứng trạng thái có icon tròn", () => {
  for (const kind of EFFECT_KINDS) {
    const src = effectArt(kind);
    assert.ok(src, kind);
    assert.ok(existsSync(`public${src}`), src);
  }
});

test("loại lạ không có ảnh, hiện chữ dự phòng", () => {
  assert.equal(effectArt("khongCo"), undefined);
});
