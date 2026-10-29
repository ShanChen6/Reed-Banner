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
  const sourceBoxes = JSON.parse(readFileSync("docs/06-art/nhan-vat/nguyen-bac-boxes.json", "utf8"));
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

test("Nghiêm Thiết có tranh đánh thường, tuyệt chiêu, bị hạ gục; thiết trận hệ Kim và texture khớp tọa độ", () => {
  const rig = rigOf("nghiemThiet");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "spear");
  assert.equal(rig.strikeFx, "ironFormation");
  assert.equal(rig.poses?.attack?.name, "pose-attack");
  assert.equal(rig.poses?.cast, undefined);
  assert.equal(rig.poses?.ultimate?.name, "pose-ultimate");
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
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
  let bytes = statSync("public/art/characters/nghiem-thiet/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Lâm Tùng có bốn tranh, trúc lâm hút sinh khí hệ Mộc, khớp nằm trong lớp và texture khớp tọa độ", () => {
  const rig = rigOf("lamTung");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, undefined);
  assert.equal(rig.strikeFx, "bambooSap");
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  contains(rig.blade[0], rig.parts.sword);
  for (const [name, box] of [...Object.entries(rig.parts), ...rig.cloth.map((c) => [c.name, c.box] as const)]) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/lam-tung/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Đàm Thảo có bốn tranh, dây gai hệ Mộc, cầu ngọc nằm trên trượng và texture khớp tọa độ", () => {
  const rig = rigOf("damThao");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "staff");
  assert.equal(rig.strikeFx, "thornBind");
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
  let bytes = statSync("public/art/characters/dam-thao/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Hoàng Mộc có bốn tranh, rễ già giữ thành hệ Mộc, khiên nâng được và texture khớp tọa độ", () => {
  const rig = rigOf("hoangMoc");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "spear");
  assert.equal(rig.strikeFx, "rootGuard");
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
  for (const [name, box] of Object.entries(rig.parts)) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/hoang-moc/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Lục Diệp có bốn tranh, vòng lá hồi sinh hệ Mộc, hồ lô lắc quanh nắm tay và texture khớp tọa độ", () => {
  const rig = rigOf("lucDiep");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "gourd");
  assert.equal(rig.strikeFx, "leafBloom");
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
  let bytes = statSync("public/art/characters/luc-diep/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Nhan Trúc có bốn tranh, sương độc hệ Mộc, khớp nằm trong lớp và texture khớp tọa độ", () => {
  const rig = rigOf("nhanTruc");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "fan");
  assert.equal(rig.strikeFx, "poisonMist");
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
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
  let bytes = statSync("public/art/characters/nhan-truc/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Sầm Tuệ có bốn tranh, bày trận hệ Mộc, khớp nằm trong lớp và texture khớp tọa độ", () => {
  const rig = rigOf("samTue");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "spear");
  assert.equal(rig.strikeFx, "groveWard");
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
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
  let bytes = statSync("public/art/characters/sam-tue/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Hồ Lãng có bốn tranh, giáo băng hệ Thủy, khớp nằm trong lớp và texture khớp tọa độ", () => {
  const rig = rigOf("hoLang");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "spear");
  assert.equal(rig.strikeFx, "frostSpear");
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
  let bytes = statSync("public/art/characters/ho-lang/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Kha Sơn có bốn tranh, sơn hà trấn kích hệ Thổ, rìu theo nhịp chém và texture khớp tọa độ", () => {
  const rig = rigOf("khaSon");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, undefined);
  assert.equal(rig.strikeFx, "mountainCrush");
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
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
  let bytes = statSync("public/art/characters/kha-son/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Đào Lam dùng rig tướng sĩ mới: bốn tranh, cột nước hệ Thủy, cầu nước nằm trên trượng và texture khớp tọa độ", () => {
  const rig = rigOf("daoLam");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "staff");
  assert.equal(rig.strikeFx, "waterPillar");
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
  let bytes = statSync("public/art/characters/dao-lam/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Thái Hà có bốn tranh, thủy trại hệ Thủy, khiên nâng được và texture khớp tọa độ", () => {
  const rig = rigOf("thaiHa");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "spear");
  assert.equal(rig.strikeFx, "tideBulwark");
  assert.ok((rig.shieldRaise ?? 0) < 0);
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
  let bytes = statSync("public/art/characters/thai-ha/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Mai Thanh có bốn tranh, cam lộ hệ Thủy, hồ lô xoay quanh nắm tay và texture khớp tọa độ", () => {
  const rig = rigOf("maiThanh");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "gourd");
  assert.equal(rig.strikeFx, "springDew");
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
  let bytes = statSync("public/art/characters/mai-thanh/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Quách Ẩn có bốn tranh, thủy độn hệ Thủy, quạt phẩy theo nắm tay và texture khớp tọa độ", () => {
  const rig = rigOf("quachAn");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "fan");
  assert.equal(rig.strikeFx, "tideMist");
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
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
  let bytes = statSync("public/art/characters/quach-an/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Vi Triều có bốn tranh, triều dâng hệ Thủy, cờ lệnh theo nhịp giáo và texture khớp tọa độ", () => {
  const rig = rigOf("viTrieu");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "spear");
  assert.equal(rig.strikeFx, "tideSiege");
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
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
  let bytes = statSync("public/art/characters/vi-trieu/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Hà Vân có bốn tranh, mưa lửa hệ Hỏa, cầu lửa ở đầu trượng và texture khớp tọa độ", () => {
  const rig = rigOf("haVan");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "staff");
  assert.equal(rig.strikeFx, "fireRain");
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
  let bytes = statSync("public/art/characters/ha-van/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Tôn Diệm có bốn tranh, hỏa công liên kế hệ Hỏa, lá cờ bay trên cán theo nhịp giáo và texture khớp tọa độ", () => {
  const rig = rigOf("tonDiem");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "spear");
  assert.equal(rig.strikeFx, "fireChain");
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.joints.shoulder, rig.parts.sword);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  const flag = rig.cloth.find((c) => c.name === "flag");
  assert.ok(flag?.onWeapon, "lá cờ phải buộc trên cán");
  // Mép buộc của lá cờ sát cán cờ.
  assert.ok(flag.box.x + flag.box.w >= rig.parts.sword.x);
  for (const [name, box] of [...Object.entries(rig.parts), [flag.name, flag.box] as const]) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/ton-diem/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Lý Liệt có bốn tranh, chém lửa hệ Hỏa, đại đao theo nhịp giáo và texture khớp tọa độ", () => {
  const rig = rigOf("lyLiet");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "spear");
  assert.equal(rig.strikeFx, "flameCleave");
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
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
  let bytes = statSync("public/art/characters/ly-liet/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Trương Viêm có bốn tranh, tường lửa hệ Hỏa, khiên nâng được và texture khớp tọa độ", () => {
  const rig = rigOf("truongViem");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "spear");
  assert.equal(rig.strikeFx, "flameWall");
  assert.ok((rig.shieldRaise ?? 0) < 0);
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
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
  let bytes = statSync("public/art/characters/truong-viem/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Hồng Đan có bốn tranh, đan hỏa hệ Hỏa, hồ lô lắc quanh nắm tay và texture khớp tọa độ", () => {
  const rig = rigOf("hongDan");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "gourd");
  assert.equal(rig.strikeFx, "emberMend");
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
  let bytes = statSync("public/art/characters/hong-dan/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Ninh Hỏa có bốn tranh, hỏa thiêu kho lương hệ Hỏa, quạt phẩy theo nắm tay và texture khớp tọa độ", () => {
  const rig = rigOf("ninhHoa");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "fan");
  assert.equal(rig.strikeFx, "granaryBlaze");
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
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
  let bytes = statSync("public/art/characters/ninh-hoa/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Doãn Nham có bốn tranh, địa mạch hệ Thổ, viên hổ phách nằm trên trượng và texture khớp tọa độ", () => {
  const rig = rigOf("doanNham");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "staff");
  assert.equal(rig.strikeFx, "earthSurge");
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
  let bytes = statSync("public/art/characters/doan-nham/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Lê Thạch có bốn tranh, khiêu khích hệ Thổ, khiên mây nâng được và texture khớp tọa độ", () => {
  const rig = rigOf("leThach");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "spear");
  assert.equal(rig.strikeFx, "tauntRoar");
  assert.ok((rig.shieldRaise ?? 0) < 0);
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.joints.shoulder, rig.parts.sword);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  const boxes = { ...rig.parts, ...Object.fromEntries(rig.cloth.map((c) => [c.name, c.box])) };
  for (const [name, box] of Object.entries(boxes)) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/le-thach/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Bế Liên có bốn tranh, hồi phục hệ Thổ, bầu nậm xoay quanh cổ tay và texture khớp tọa độ", () => {
  const rig = rigOf("beLien");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "gourd");
  assert.equal(rig.strikeFx, "earthMend");
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.joints.shoulder, rig.parts.sword);
  contains(rig.grip!, rig.parts.arm);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  for (const [name, box] of Object.entries(rig.parts)) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/be-lien/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Mã Nhạc có bốn tranh, đoạn đạo tuyệt lương hệ Thổ, quạt nan phẩy theo nắm tay và texture khớp tọa độ", () => {
  const rig = rigOf("maNhac");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "fan");
  assert.equal(rig.strikeFx, "roadSever");
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
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
  let bytes = statSync("public/art/characters/ma-nhac/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Tạ Thạch có bốn tranh, bát trận thạch lũy hệ Thổ, lá cờ bay trên cán theo nhịp giáo và texture khớp tọa độ", () => {
  const rig = rigOf("taThach");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "spear");
  assert.equal(rig.strikeFx, "stoneBastion");
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.joints.shoulder, rig.parts.sword);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  const flag = rig.cloth.find((c) => c.name === "flag");
  assert.ok(flag?.onWeapon, "lá cờ phải buộc trên cán");
  // Mép buộc của lá cờ sát cán cờ.
  assert.ok(flag.box.x <= rig.parts.sword.x + rig.parts.sword.w);
  for (const [name, box] of [...Object.entries(rig.parts), [flag.name, flag.box] as const]) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/ta-thach/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Tống Tấn có bốn tranh, lôi đao liên trảm hệ Lôi, kiếm theo nhịp chém và texture khớp tọa độ", () => {
  const rig = rigOf("tongTan");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, undefined);
  assert.equal(rig.strikeFx, "thunderCleave");
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.joints.shoulder, rig.parts.sword);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  for (const p of rig.blade) contains(p, rig.parts.sword);
  for (const [name, box] of [...Object.entries(rig.parts), ...rig.cloth.map((c) => [c.name, c.box] as const)]) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/tong-tan/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Vũ Lôi có bốn tranh, thiên lôi giáng thế hệ Lôi, quả cầu nằm trên trượng và texture khớp tọa độ", () => {
  const rig = rigOf("vuLoi");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "staff");
  assert.equal(rig.strikeFx, "heavenStrike");
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.orb!, rig.parts.sword);
  for (const p of rig.blade) contains(p, rig.parts.sword);
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
  let bytes = statSync("public/art/characters/vu-loi/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Ông Chấn có bốn tranh, chấn lôi thiết vệ hệ Lôi, khiên mây nâng được và texture khớp tọa độ", () => {
  const rig = rigOf("ongChan");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "spear");
  assert.equal(rig.strikeFx, "thunderAegis");
  assert.ok((rig.shieldRaise ?? 0) < 0);
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.joints.shoulder, rig.parts.sword);
  for (const p of rig.blade) contains(p, rig.parts.sword);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  const boxes = { ...rig.parts, ...Object.fromEntries(rig.cloth.map((c) => [c.name, c.box])) };
  for (const [name, box] of Object.entries(boxes)) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/ong-chan/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Tiêu Minh có bốn tranh, lôi châm hồi phục hệ Lôi, đôi hồ lô xoay quanh cổ tay và texture khớp tọa độ", () => {
  const rig = rigOf("tieuMinh");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "gourd");
  assert.equal(rig.strikeFx, "thunderMend");
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
  contains(rig.joints.shoulder, rig.parts.arm);
  contains(rig.grip!, rig.parts.arm);
  contains(rig.joints.elbowR, rig.parts.armR);
  contains(rig.joints.neck, rig.parts.head);
  contains(rig.joints.neck, rig.parts.body);
  for (const [name, box] of Object.entries(rig.parts)) {
    const data: Buffer = readFileSync(`public${partUrl(rig, name)}`);
    assert.equal(data.toString("ascii", 12, 16), "VP8X");
    assert.equal(data.readUIntLE(24, 3) + 1, Math.floor(box.w * rig.texScale), name);
    assert.equal(data.readUIntLE(27, 3) + 1, Math.floor(box.h * rig.texScale), name);
  }
  let bytes = statSync("public/art/characters/tieu-minh/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Từ Kinh có bốn tranh, kinh lôi hệ Lôi, quạt sắt phẩy theo nắm tay và texture khớp tọa độ", () => {
  const rig = rigOf("tuKinh");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "fan");
  assert.equal(rig.strikeFx, "stormSeal");
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
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
  let bytes = statSync("public/art/characters/tu-kinh/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Mạc Vân có bốn tranh, lôi trận hệ Lôi, cờ lệnh theo nhịp giáo và texture khớp tọa độ", () => {
  const rig = rigOf("macVan");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "spear");
  assert.equal(rig.strikeFx, "thunderRout");
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
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
  let bytes = statSync("public/art/characters/mac-van/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Hứa Lăng có bốn tranh, phong đao hệ Phong, khăn bay theo gió và texture khớp tọa độ", () => {
  const rig = rigOf("huaLang");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.strikeFx, "galeSlash");
  assert.deepEqual(rig.cloth.map((c) => c.name), ["ribbon"]);
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
  let bytes = statSync("public/art/characters/hua-lang/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Liễu Yên có bốn tranh, cuồng lưu hệ Phong, cầu ngọc ở đầu trượng và texture khớp tọa độ", () => {
  const rig = rigOf("lieuYen");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "staff");
  assert.equal(rig.strikeFx, "galeVortex");
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
  let bytes = statSync("public/art/characters/lieu-yen/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Mạnh Tường có bốn tranh, phong lũy hệ Phong, khiên nâng được và texture khớp tọa độ", () => {
  const rig = rigOf("manhTuong");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "spear");
  assert.equal(rig.strikeFx, "galeBulwark");
  assert.ok((rig.shieldRaise ?? 0) < 0);
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
  let bytes = statSync("public/art/characters/manh-tuong/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Bạch Sương có bốn tranh, gió lành hệ Phong, hồ lô lắc quanh nắm tay và texture khớp tọa độ", () => {
  const rig = rigOf("bachSuong");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "gourd");
  assert.equal(rig.strikeFx, "galeMend");
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
  let bytes = statSync("public/art/characters/bach-suong/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});

test("Bùi Phiêu có bốn tranh, phiêu phong hệ Phong, quạt lông phẩy theo nắm tay và texture khớp tọa độ", () => {
  const rig = rigOf("buiPhieu");
  assert.ok(rig?.skeleton === "warrior");
  assert.equal(rig.weapon, "fan");
  assert.equal(rig.strikeFx, "galeRift");
  for (const kind of ["attack", "cast", "ultimate"] as const) assert.equal(rig.poses?.[kind]?.name, `pose-${kind}`);
  assert.equal(rig.down?.name, "pose-down");
  const contains = (p: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) =>
    assert.ok(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h, `${JSON.stringify(p)} ngoài lớp`);
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
  let bytes = statSync("public/art/characters/bui-phieu/portrait.webp").size;
  for (const name of partsOf(rig)) bytes += statSync(`public${partUrl(rig, name)}`).size;
  assert.ok(bytes <= 350_000, `${bytes} bytes vượt ngân sách`);
});
