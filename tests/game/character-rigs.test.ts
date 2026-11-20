import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { test } from "node:test";
import { partUrl, partsOf, rigIds, rigOf } from "../../src/app/game/stage/rigs";

test("mỗi rig nhân vật có đủ tệp lớp trong public, tổng dung lượng gọn", () => {
  const ids = rigIds();
  assert.ok(ids.length > 0);
  for (const id of ids) {
    const rig = rigOf(id)!;
    let bytes = 0;
    for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
    assert.ok(bytes <= 350_000, `${id}: ${bytes} byte`);
  }
});

test("tranh gục được tải trong rig, alpha thật và tỉ lệ texture đúng", () => {
  const rig = rigOf("nguyenBac");
  assert.ok(rig?.skeleton === "warrior" && rig.down);
  assert.ok(partsOf(rig).includes(rig.down.name));
  for (const art of [rig.down, rig.poses!.cast!, rig.poses!.ultimate!]) {
    assert.equal(art.texScale, 1 / 3);
    const file: Buffer = readFileSync(`public${partUrl(rig, art.name)}`);
    assert.equal(file.toString("ascii", 12, 16), "VP8X");
    assert.ok(file[20]! & 0x10, `${art.name} cần alpha thật`);
  }
});
