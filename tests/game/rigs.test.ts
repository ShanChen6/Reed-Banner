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

test("Nguyễn Khoan có tranh đánh thường, tuyệt chiêu, bị hạ gục; khiên nâng được, khớp nằm trong lớp", () => {
  const rig = rigOf("nguyenKhoan");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "spear");
  assert.equal(rig.strikeFx, "earthWard");
  assert.equal(rig.fxColor, 0xa5772f);
  assert.ok((rig.shieldRaise ?? 0) < 0, "khiên nâng lên ngược chiều kim đồng hồ quanh khuỷu");
  assert.equal(rig.poses?.attack?.name, "pose-attack");
  assert.equal(rig.poses?.cast, undefined);
  assert.equal(rig.poses?.ultimate?.name, "pose-ultimate");
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.elbowR, rig.parts.body);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  for (const [name, box] of [...Object.entries(rig.parts), ...rig.cloth.map((c) => [c.name, c.box] as const)]) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/nguyen-khoan/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Kiều Thuận có bốn tranh, vòng lá hệ Mộc, hồ lô lắc quanh nắm tay và khớp nằm trong lớp", () => {
  const rig = rigOf("kieuThuan");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "gourd");
  assert.equal(rig.strikeFx, "leafBloom");
  assert.equal(rig.fxColor, 0x4f9a4a);
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.grip!, rig.parts.arm);
  contains(rig.grip!, rig.parts.sword);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.elbowR, rig.parts.body);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  for (const [name, box] of [...Object.entries(rig.parts), ...rig.cloth.map((c) => [c.name, c.box] as const)]) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/kieu-thuan/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Lý Khuê có bốn tranh, mũi sáng phá giáp hệ Kim, khớp nằm trong lớp và texture khớp tọa độ", () => {
  const rig = rigOf("lyKhue");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, undefined);
  assert.equal(rig.strikeFx, "armorPierce");
  assert.equal(rig.fxColor, 0x9ea4ad);
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.elbowR, rig.parts.body);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  contains(rig.blade[0], rig.parts.sword);
  for (const [name, box] of [...Object.entries(rig.parts), ...rig.cloth.map((c) => [c.name, c.box] as const)]) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/ly-khue/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Nguyễn Thủ Tiệp có bốn tranh, đoạt lương hệ Thủy, khớp nằm trong lớp và texture khớp tọa độ", () => {
  const rig = rigOf("nguyenThuTiep");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "fan");
  assert.equal(rig.strikeFx, "supplyDrain");
  assert.equal(rig.fxColor, 0x2f7fc1);
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  for (const [name, box] of [...Object.entries(rig.parts), ...rig.cloth.map((c) => [c.name, c.box] as const)]) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/nguyen-thu-tiep/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Lữ Đường có bốn tranh, cột nước hệ Thủy, cầu nước nằm trên trượng và texture khớp tọa độ", () => {
  const rig = rigOf("luDuong");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "staff");
  assert.equal(rig.strikeFx, "waterPillar");
  assert.equal(rig.fxColor, 0x2f7fc1);
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.orb!, rig.parts.sword);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  for (const [name, box] of [...Object.entries(rig.parts), ...rig.cloth.map((c) => [c.name, c.box] as const)]) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/lu-duong/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Nguyễn Siêu có tranh đánh thường, tuyệt chiêu, bị hạ gục; tường lửa hệ Hỏa, khiên nâng được", () => {
  const rig = rigOf("nguyenSieu");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "spear");
  assert.equal(rig.strikeFx, "flameWall");
  assert.equal(rig.fxColor, 0xd9502a);
  assert.ok((rig.shieldRaise ?? 0) < 0);
  assert.equal(rig.poses?.attack?.name, "pose-attack");
  assert.equal(rig.poses?.cast, undefined);
  assert.equal(rig.poses?.ultimate?.name, "pose-ultimate");
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.elbowR, rig.parts.body);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  for (const [name, box] of [...Object.entries(rig.parts), ...rig.cloth.map((c) => [c.name, c.box] as const)]) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/nguyen-sieu/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Đỗ Cảnh Thạc có bốn tranh, đập đất hệ Thổ, khớp nằm trong lớp và texture khớp tọa độ", () => {
  const rig = rigOf("doCanhThac");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, undefined);
  assert.equal(rig.strikeFx, "groundSlam");
  assert.equal(rig.fxColor, 0xa5772f);
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  contains(rig.blade[1], rig.parts.sword);
  for (const [name, box] of [...Object.entries(rig.parts), ...rig.cloth.map((c) => [c.name, c.box] as const)]) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/do-canh-thac/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Chu Ngân có bốn tranh, ngân châm hệ Kim, cầu bạc nằm trên trượng và texture khớp tọa độ", () => {
  const rig = rigOf("chuNgan");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "staff");
  assert.equal(rig.strikeFx, "needleVolley");
  assert.equal(rig.fxColor, 0x9ea4ad);
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.orb!, rig.parts.sword);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  for (const [name, box] of Object.entries(rig.parts)) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/chu-ngan/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Cao Kiên có bốn tranh, tường thép hệ Kim, khiên nâng được và texture khớp tọa độ", () => {
  const rig = rigOf("caoKien");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "spear");
  assert.equal(rig.strikeFx, "steelBulwark");
  assert.ok((rig.shieldRaise ?? 0) < 0);
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.elbowR, rig.parts.body);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  for (const [name, box] of [...Object.entries(rig.parts), ...rig.cloth.map((c) => [c.name, c.box] as const)]) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/cao-kien/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Châu Ngọc có bốn tranh, mưa kim bạc hệ Kim, hồ lô lắc quanh nắm tay và texture khớp tọa độ", () => {
  const rig = rigOf("chauNgoc");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "gourd");
  assert.equal(rig.strikeFx, "silverGrace");
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.grip!, rig.parts.arm);
  contains(rig.grip!, rig.parts.sword);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  for (const [name, box] of Object.entries(rig.parts)) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/chau-ngoc/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Tô Kim có bốn tranh, tiền vàng ly tán hệ Kim, khớp nằm trong lớp và texture khớp tọa độ", () => {
  const rig = rigOf("toKim");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "fan");
  assert.equal(rig.strikeFx, "coinScatter");
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  for (const [name, box] of [...Object.entries(rig.parts), ...rig.cloth.map((c) => [c.name, c.box] as const)]) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/to-kim/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});
