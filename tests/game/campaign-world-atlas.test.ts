import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";
import {
  CAMPAIGN_CHAPTERS,
  CAMPAIGN_FACTION_IDS,
  factionResolutionOf,
} from "../../src/core";
import {
  PLACED_STRONGHOLDS,
  PLACE_LON_LAT,
  UNANCHORED_MISSIONS,
  UNPLACED_STRONGHOLDS,
  WORLD_H,
  WORLD_STRONGHOLDS,
  WORLD_W,
  chapterStrongholds,
  chapterThumbUrl,
  strongholdGlyph,
  strongholdLeader,
  strongholdOfMission,
  strongholdState,
  type Box,
} from "../../src/app/game/campaign/worldAtlas";

describe("Bản đồ Sử ký toàn cảnh", () => {
  it("13 điểm: Hoa Lư là đầu não, 12 cứ điểm đúng 12 sứ quân", () => {
    assert.equal(WORLD_STRONGHOLDS.length, 13);
    const hq = WORLD_STRONGHOLDS.filter((s) => s.faction === null);
    assert.deepEqual(
      hq.map((s) => s.place),
      ["Hoa Lư"],
    );
    assert.deepEqual(
      WORLD_STRONGHOLDS.flatMap((s) => (s.faction ? [s.faction] : [])).sort(),
      [...CAMPAIGN_FACTION_IDS].sort(),
    );
  });

  it("nhiệm vụ kết cục của mỗi sứ quân nằm ở cứ điểm của họ", () => {
    for (const s of WORLD_STRONGHOLDS) {
      if (!s.faction) continue;
      const r = factionResolutionOf(s.faction)!;
      assert.ok(s.missions.includes(r.mission), `${s.faction} ${r.mission}`);
    }
    assert.deepEqual(strongholdOfMission("M06")?.missions, [
      "M05",
      "M06",
      "M07",
      "M08",
    ]);
    assert.deepEqual(strongholdOfMission("M24")?.missions, [
      "M01",
      "M02",
      "M03",
      "M04",
      "M09",
      "M10",
      "M23",
      "M24",
    ]);
  });

  it("mỗi nhiệm vụ thuộc nhiều nhất một điểm; chỉ M22 không gắn đất", () => {
    const all = WORLD_STRONGHOLDS.flatMap((s) => s.missions);
    assert.equal(new Set(all).size, all.length);
    assert.deepEqual(UNANCHORED_MISSIONS, ["M22"]);
  });

  it("Bình Kiều không có tọa độ, các điểm khác nằm trong khung và không sát nhau", () => {
    assert.deepEqual(
      UNPLACED_STRONGHOLDS.map((s) => [s.faction, s.place, s.certainty]),
      [["ngoXuongXi", "Bình Kiều", "disputed"]],
    );
    const margin = 90;
    for (const s of PLACED_STRONGHOLDS) {
      const [x, y] = s.at!;
      assert.ok(x >= margin && x <= WORLD_W - margin, `${s.place} x ${x}`);
      assert.ok(y >= margin && y <= WORLD_H - margin, `${s.place} y ${y}`);
    }
    for (let i = 0; i < PLACED_STRONGHOLDS.length; i++)
      for (let j = i + 1; j < PLACED_STRONGHOLDS.length; j++) {
        const a = PLACED_STRONGHOLDS[i]!;
        const b = PLACED_STRONGHOLDS[j]!;
        const d = Math.hypot(a.at![0] - b.at![0], a.at![1] - b.at![1]);
        assert.ok(d >= 120, `${a.place}–${b.place} cách ${d.toFixed(0)}`);
      }
  });

  it("chọn chương chỉ làm nổi các điểm có nhiệm vụ của chương", () => {
    const ch2 = CAMPAIGN_CHAPTERS.find((c) => c.chapter === 2)!;
    assert.deepEqual(chapterStrongholds(ch2.missions), ["tranLam"]);
    const ch3 = CAMPAIGN_CHAPTERS.find((c) => c.chapter === 3)!;
    assert.deepEqual(chapterStrongholds(ch3.missions), [
      "hoaLu",
      "phamBachHo",
      "ngoXuongXi",
    ]);
    for (const c of CAMPAIGN_CHAPTERS)
      assert.ok(existsSync(`public${chapterThumbUrl(c.chapter)}`), c.title);
  });

  it("cờ, thành và tên đất của các điểm không đè nhau, không tràn khung", () => {
    // Cờ, thành và tên của cùng một điểm được phép chạm nhau; chỉ kiểm giữa hai điểm khác nhau.
    const boxes: [string, string, Box][] = PLACED_STRONGHOLDS.flatMap((s) => {
      const g = strongholdGlyph(s, strongholdLeader(s));
      return [
        [s.id, `${s.place} cờ`, g.flag],
        [s.id, `${s.place} thành`, g.city],
        [s.id, `${s.place} tên`, g.label],
      ] as [string, string, Box][];
    });
    const hit = (a: Box, b: Box) =>
      a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
    for (const [, name, b] of boxes)
      assert.ok(
        b[0] >= 0 && b[1] >= 0 && b[2] <= WORLD_W && b[3] <= WORLD_H,
        name,
      );
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const [oa, a, ba] = boxes[i]!;
        const [ob, b, bb] = boxes[j]!;
        if (oa === ob) continue;
        assert.ok(!hit(ba, bb), `${a} đè ${b}`);
      }
  });

  it("cờ theo thế cục server: chưa ghi thì trung tính, Hoa Lư là đầu não", () => {
    const tam = WORLD_STRONGHOLDS.find((s) => s.faction === "nguyenKhoan")!;
    const tran = WORLD_STRONGHOLDS.find((s) => s.faction === "tranLam")!;
    assert.equal(strongholdState(WORLD_STRONGHOLDS[0]!, {}), "hq");
    assert.equal(strongholdState(tam, {}), "unresolved");
    assert.equal(
      strongholdState(tran, { tranLam: { status: "allied", mission: "M06" } }),
      "alliance",
    );
    assert.equal(
      strongholdState(tam, {
        nguyenKhoan: { status: "dispersed", mission: "M14" },
      }),
      "uncertain",
    );
  });

  it("bố cục minh họa giữ thứ tự đông–tây, bắc–nam của vị trí gần đúng", () => {
    for (const a of PLACED_STRONGHOLDS)
      for (const b of PLACED_STRONGHOLDS) {
        const [la, pa] = [PLACE_LON_LAT[a.place]!, a.at!];
        const [lb, pb] = [PLACE_LON_LAT[b.place]!, b.at!];
        if (la[0] - lb[0] > 0.15)
          assert.ok(pa[0] > pb[0], `${a.place} phải ở phía đông ${b.place}`);
        if (la[1] - lb[1] > 0.15)
          assert.ok(pa[1] < pb[1], `${a.place} phải ở phía bắc ${b.place}`);
      }
  });

  it("có tranh nền đúng khung tọa độ", () => {
    assert.ok(existsSync("public/art/campaign/world-map.webp"));
  });
});
