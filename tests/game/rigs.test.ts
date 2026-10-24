import assert from "node:assert/strict";
import { statSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { partsOf, partUrl, rigOf } from "../../src/app/game/stage/rigs";

test("Nguyễn Bặc có đủ lớp WebP và hai tranh trong ngân sách 350 KB", () => {
  const rig = rigOf("nguyenBac");
  assert.ok(rig && rig.skeleton === "warrior");
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
  assert.ok(rig?.skeleton === "warrior");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) => {
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h,
      `khớp ${JSON.stringify(p)} ngoài lớp ${JSON.stringify(box)}`);
  };
  const cap = rig.covers.find((c) => c.name === "shoulder");
  assert.ok(cap);
  contains(rig.joints.shoulder, cap.box);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.elbowR, rig.parts.body);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  const boxes = [
    ...Object.entries(rig.parts),
    ...rig.covers.map((c) => [c.name, c.box] as const),
    ...rig.cloth.map((c) => [c.name, c.box] as const),
  ] as const;
  const sourceBoxes = JSON.parse(readFileSync("docs/art/nguyen-bac-boxes.json", "utf8"));
  for (const [name, box] of boxes) {
    assert.deepEqual(box, sourceBoxes[name], `${name} lệch tọa độ cắt từ ảnh nguồn`);
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    // WebP mở rộng lưu kích thước trừ một bằng 24 bit; các lớp này đều có alpha.
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
});

test("Lê Hoàn có đủ lớp WebP, ba tranh tư thế và nằm trong ngân sách 350 KB", () => {
  const rig = rigOf("leHoan");
  assert.ok(rig && rig.skeleton === "warrior");
  assert.equal(rig.weapon, "spear");
  assert.equal(rig.poses?.cast?.name, "pose-cast");
  assert.equal(rig.poses?.ultimate?.name, "pose-ultimate");
  assert.equal(rig.down?.name, "pose-down");
  const names = partsOf(rig);
  assert.equal(new Set(names).size, names.length);
  let bytes = statSync("public/art/characters/le-hoan/portrait.webp").size;
  for (const name of names) {
    const assetPath: string = `public${partUrl(rig, name)}`;
    const data: Buffer = readFileSync(assetPath);
    assert.equal(data.toString("ascii", 0, 4), "RIFF", assetPath);
    assert.equal(data.toString("ascii", 8, 12), "WEBP", assetPath);
    bytes += statSync(assetPath).size;
  }
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Trần Cương có tranh đánh thường, ra chiêu, tuyệt chiêu, bị hạ gục; khớp nằm trong lớp và texture khớp tọa độ", () => {
  const rig = rigOf("tranCuong");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.poses?.attack?.name, "pose-attack");
  assert.equal(rig.poses?.cast?.name, "pose-cast");
  assert.equal(rig.poses?.ultimate?.name, "pose-ultimate");
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `khớp ${JSON.stringify(p)} ngoài lớp`);
  contains(rig.joints.shoulder, rig.covers[0]!.box);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  const boxes = [
    ...Object.entries(rig.parts),
    ...rig.covers.map((c) => [c.name, c.box] as const),
    ...rig.cloth.map((c) => [c.name, c.box] as const),
  ] as const;
  for (const [name, box] of boxes) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/tran-cuong/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Kiều Công Hãn có đủ bốn tranh, sét hệ Lôi, khớp nằm trong lớp và texture khớp tọa độ", () => {
  const rig = rigOf("kieuCongHan");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "staff");
  assert.equal(rig.strikeFx, "lightning");
  assert.equal(rig.fxColor, 0xb98cff);
  assert.equal(rig.poses?.attack?.name, "pose-attack");
  assert.equal(rig.poses?.cast?.name, "pose-cast");
  assert.equal(rig.poses?.ultimate?.name, "pose-ultimate");
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.elbowR, rig.parts.body);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  contains(rig.orb!, rig.parts.sword);
  for (const [name, box] of [...Object.entries(rig.parts), ...rig.cloth.map((c) => [c.name, c.box] as const)]) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  for (const art of [rig.down!, ...Object.values(rig.poses!)]) {
    const data: Buffer = readFileSync(`public${partUrl(rig, art.name)}`);
    assert.ok(data[20]! & 0x10, `${art.name} cần alpha thật`);
  }
  let bytes = statSync("public/art/characters/kieu-cong-han/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});
