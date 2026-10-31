import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { test } from "node:test";
import { characterCatalog } from "../../src/app/demo/characters/catalog";
import { partUrl, partsOf, rigOf } from "../../src/app/game/stage/rigs";

test("bảng xem thử chỉ có nhân vật có rig, dung lượng khớp các file thật", async () => {
  const characters = await characterCatalog();
  assert.ok(characters.length > 0);
  assert.equal(new Set(characters.map((c) => c.id)).size, characters.length);
  for (const character of characters) {
    const rig = rigOf(character.id);
    assert.ok(rig);
    assert.equal(character.assets.length, 7);
    for (const file of character.files) assert.equal(file.bytes, statSync(`public${file.url}`).size);
    const urls = new Set(character.files.map((file) => file.url));
    assert.equal(urls.size, character.files.length);
    for (const name of partsOf(rig)) assert.ok(urls.has(partUrl(rig, name)));
  }
  for (const id of ["nguyenBac", "dinhDien", "luuCo", "trinhTu", "dinhLien", "tranLam", "phamBachHo", "ngoXuongXi", "tranCuong", "kieuCongHan", "nguyenKhoan", "kieuThuan", "lyKhue", "nguyenThuTiep", "luDuong", "nguyenSieu", "doCanhThac", "chuNgan", "caoKien", "chauNgoc", "toKim", "nghiemThiet", "lamTung", "hoangMoc", "lucDiep", "nhanTruc", "samTue", "hoLang", "khaSon", "daoLam", "thaiHa", "damThao", "maiThanh", "quachAn", "viTrieu", "haVan", "tonDiem", "lyLiet", "truongViem", "hongDan", "ninhHoa", "doanNham", "leThach", "beLien", "maNhac", "taThach", "tongTan", "vuLoi", "ongChan", "tieuMinh", "tuKinh", "macVan", "huaLang", "lieuYen", "manhTuong", "bachSuong", "buiPhieu", "phungPhong", "bachNoLang", "thanhLamXa", "lamGiangPhiDiep", "xichDiemLuan", "tranSonThach", "loiMinhXa", "tatPhongLang", "dinhNgoc", "bachPhongDao", "docAnh", "hanGiangKhach", "xichDa", "diaAn", "loiAnh", "voAnh", "dinhBoLinh"]) {
    const character = characters.find((c) => c.id === id)!;
    assert.ok(character.assets.every((a) => a.file || a.kind === "attack" || (a.kind === "cast" && (id === "nguyenKhoan" || id === "nguyenSieu" || id === "nghiemThiet")) || a.kind === "style"), `${id} cần đủ năm ảnh đối chiếu`);
    assert.ok(character.files.reduce((sum, file) => sum + file.bytes, 0) <= 350_000);
    const portrait = character.assets.find((a) => a.kind === "portrait")!.file!;
    assert.ok(portrait.bytes < 30_000);
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

test("Xạ thủ và Sát thủ đã vào roster; chỉ Đinh Ngọc còn là nhân vật xem thử", async () => {
  const { ALL_COMPANIONS } = await import("../../src/core");
  const characters = await characterCatalog();
  const archers = ["bachNoLang", "thanhLamXa", "lamGiangPhiDiep", "xichDiemLuan", "tranSonThach", "loiMinhXa", "tatPhongLang"];
  for (const id of archers) {
    const archer = characters.find((c) => c.id === id);
    assert.ok(archer && !archer.previewOnly);
    assert.equal(archer.profession, "xaThu");
    assert.ok(ALL_COMPANIONS.some((c) => c.id === id));
  }
  const assassins = ["bachPhongDao", "docAnh", "hanGiangKhach", "xichDa", "diaAn", "loiAnh", "voAnh"];
  for (const id of assassins) {
    const assassin = characters.find((c) => c.id === id);
    assert.ok(assassin && !assassin.previewOnly);
    assert.equal(assassin.profession, "satThu");
    assert.ok(ALL_COMPANIONS.some((c) => c.id === id));
  }
  const special = characters.find((c) => c.id === "dinhNgoc");
  assert.ok(special?.previewOnly);
  assert.equal(special.title, "Vạn Tượng Hành Giả");
  assert.ok(!ALL_COMPANIONS.some((c) => c.id === "dinhNgoc"));
  assert.ok(characters.filter((c) => !archers.includes(c.id) && !assassins.includes(c.id) && c.id !== "dinhNgoc").every((c) => !c.previewOnly));
});
