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

test("khớp Nguyễn Bặc nằm trong vùng chồng, kích thước texture khớp tọa độ rig", () => {
  const rig = rigOf("nguyenBac");
  assert.ok(rig?.skeleton === "warrior" && rig.forearms);
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) => {
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h,
      `khớp ${JSON.stringify(p)} ngoài lớp ${JSON.stringify(box)}`);
  };
  for (const [upper, lower, shoulder, coverName] of [
    [rig.parts.arm, rig.forearms.sword, rig.joints.shoulder, "shoulder"],
    [rig.parts.armR, rig.forearms.free, rig.joints.elbowR, "shoulderR"],
  ] as const) {
    const cover = rig.covers.find((c) => c.name === coverName);
    assert.ok(cover);
    contains(shoulder, cover.box);
    contains(shoulder, upper);
    contains(lower.joint, upper);
    contains(lower.joint, lower.box);
  }
  const boxes = [
    ...Object.entries(rig.parts),
    ["forearm", rig.forearms.sword.box], ["forearmR", rig.forearms.free.box],
    ...rig.covers.map((c) => [c.name, c.box] as const),
  ] as const;
  for (const [name, box] of boxes) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    // WebP mở rộng lưu kích thước trừ một bằng 24 bit; các lớp này đều có alpha.
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
});
