import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { CHASE_PASSIVES, COMBO_PASSIVES, PLAYABLE_COMPANIONS, chasePassives } from "../../src/core";
import { PASSIVE_ART, passiveArt } from "../../src/app/game/art/passives";

test("29 ảnh bị động: đúng mã COMBO/CHASE, có file", () => {
  assert.equal(PASSIVE_ART.size, 29);
  for (const id of PASSIVE_ART) {
    assert.ok(id in COMBO_PASSIVES || id in CHASE_PASSIVES, id);
    assert.ok(existsSync(`public/art/passives/${id}.webp`), id);
  }
  for (const id of Object.keys(COMBO_PASSIVES)) assert.ok(passiveArt(id), id);
});

test("mọi bị động truy kích dùng chung từ 2 nhân vật trở lên đều có ảnh", () => {
  const users = new Map<string, number>();
  for (const f of PLAYABLE_COMPANIONS) for (const id of chasePassives(f)) users.set(id, (users.get(id) ?? 0) + 1);
  for (const [id, n] of users) if (n > 1) assert.ok(passiveArt(id), id);
});
