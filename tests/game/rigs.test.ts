import assert from "node:assert/strict";
import { statSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { partsOf, partUrl, rigOf } from "../../src/app/game/stage/rigs";

test("Nguyễn Bặc có đủ lớp WebP và hai tranh trong ngân sách 350 KB", () => {
  const rig = rigOf("nguyenBac");
  assert.ok(rig && rig.skeleton === "warrior");
  assert.ok(rig.forearms);
  assert.equal(rig.poses?.cast?.name, "pose-cast");
  assert.equal(rig.poses?.ultimate?.name, "pose-ultimate");
  const names = partsOf(rig);
  assert.equal(new Set(names).size, names.length);
  let bytes = 0;
  for (const name of names) {
    const path: string = `public${partUrl(rig, name)}`;
    const data: Buffer = readFileSync(path);
    assert.equal(data.toString("ascii", 0, 4), "RIFF", path);
    assert.equal(data.toString("ascii", 8, 12), "WEBP", path);
    bytes += statSync(path).size;
  }
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});
