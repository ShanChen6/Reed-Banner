import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { FORMATION_PLACE_IDS } from "../../src/core";
import { MAP_POOL, mapFor } from "../../src/app/game/formation/maps";

const PROMPTS = readFileSync("docs/06-art/prompts/tran-do-hinh-anh.md", "utf8");

describe("kho bản đồ Trận Đồ", () => {
  it("id địa danh hợp lệ trong hồ sơ (core) khớp kho bản đồ", () => {
    assert.deepEqual([...FORMATION_PLACE_IDS].sort(), MAP_POOL.map((m) => m.id).sort());
  });

  it("có từ 30 bản đồ, id duy nhất và đúng định dạng", () => {
    assert.ok(MAP_POOL.length >= 30, `chỉ có ${MAP_POOL.length}`);
    const ids = MAP_POOL.map((m) => m.id);
    assert.equal(new Set(ids).size, ids.length, "trùng id");
    for (const m of MAP_POOL) {
      assert.match(m.id, /^[a-zA-Z][a-zA-Z0-9]*$/, m.id);
      assert.ok(m.place.length > 0 && m.blurb.length > 10, m.id);
      assert.ok(m.kind === "lich-su" || m.kind === "canh-quan", m.id);
    }
  });

  it("mọi tệp trong public/art/formation/maps đều được dùng, và ngược lại (không quên khai báo ảnh thật)", () => {
    const files = readdirSync("public/art/formation/maps").filter((f) => f.endsWith(".webp")).map((f) => f.slice(0, -5)).sort();
    const real = MAP_POOL.filter((m) => m.src.startsWith("/art/formation/maps/")).map((m) => m.id).sort();
    assert.deepEqual(real, files);
  });

  it("mọi ảnh trỏ tới tệp có thật trong public (ảnh giữ chỗ hoặc ảnh thật)", () => {
    for (const m of MAP_POOL) assert.ok(existsSync(`public${m.src}`), `${m.id}: thiếu ${m.src}`);
  });

  it("mọi bản đồ trong kho có prompt tạo ảnh đầy đủ trong docs", () => {
    for (const m of MAP_POOL) {
      const at = PROMPTS.indexOf(`#### \`${m.id}\``);
      assert.ok(at >= 0, `thiếu prompt cho ${m.id} ở docs/06-art/prompts/tran-do-hinh-anh.md`);
      const body = PROMPTS.slice(at, PROMPTS.indexOf("\n####", at + 5) >= 0 ? PROMPTS.indexOf("\n####", at + 5) : undefined);
      assert.match(body, /```text\n[^`]{80,}\n```/, `prompt của ${m.id} quá ngắn hoặc thiếu khối mã`);
      assert.ok(body.includes(`maps/${m.id}.webp`), `${m.id}: thiếu tên tệp`);
    }
  });

  it("có prompt cho ô che và đủ bốn icon chướng ngại", () => {
    assert.match(PROMPTS, /## 2\. Ô che đặc kín/);
    for (const k of ["nui", "rung", "damLay", "thanhLuy"]) {
      assert.ok(PROMPTS.includes(`#### \`${k}\``), `thiếu prompt chướng ngại ${k}`);
      assert.ok(PROMPTS.includes(`obstacles/${k}.webp`), k);
    }
  });

  it("mapFor ổn định, phủ đủ kho khi theme đổi, và các bậc không trùng nhau trong cùng kỳ", () => {
    assert.equal(mapFor("kho", 123).id, mapFor("kho", 123).id);
    const seen = new Set(Array.from({ length: 400 }, (_, t) => mapFor("thuong", t).id));
    assert.equal(seen.size, MAP_POOL.length);
    for (let t = 0; t < 50; t++) {
      const four = new Set(["huong-dan", "thuong", "kho", "dai-tran"].map((l) => mapFor(l, t).id));
      assert.equal(four.size, 4, `theme ${t}`);
    }
    assert.ok(mapFor("la-hoa", 7).place.length > 0);
    assert.ok(mapFor("thuong", -5).place.length > 0);
  });
});
