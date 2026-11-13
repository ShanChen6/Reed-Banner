import type { PartBox, Point, PoseArt, WarriorRig } from "./types";

/**
 * Hình động NPC hư cấu của Bình Loạn (id trong `src/core/campaign/encounters.ts`, `hero: false`). Bộ tranh Shan gửi
 * 14/11/2026 (27 NPC): ảnh đứng 1024×1536 và bốn tranh tư thế (đánh thường, ra chiêu, tuyệt chiêu, gục).
 *
 * Khác nhân vật chính, NPC không tách tay và vũ khí: thân là nguyên ảnh đứng, chỉ đầu tách lớp để gật nhẹ theo nhịp
 * thở; ba lớp tay/vũ khí là ảnh trống 2×2. Lúc ra đòn game thay bằng tranh tư thế nên không thiếu nhát vung.
 * Hiệu ứng tuyệt chiêu và màu mượn của nhân vật kèm cùng nghề, cùng hệ (`adaptiveFx`, xem `rigFor`); `fxColor` chỉ
 * là màu dự phòng theo hệ. Tọa độ theo ảnh nguồn của từng tranh.
 */

const EMPTY = 4;

interface NpcArt {
  readonly dir: string;
  readonly weapon?: WarriorRig["weapon"];
  readonly foot: Point;
  readonly height: number;
  readonly body: PartBox;
  readonly head: PartBox;
  readonly neck: Point;
  /** Vũ khí trong ảnh đứng (chuôi, mũi): chỗ đặt hào quang và khớp vai của lớp tay trống. */
  readonly blade: readonly [Point, Point];
  readonly fxColor: number;
  readonly poses: NonNullable<WarriorRig["poses"]>;
  readonly down: NonNullable<WarriorRig["down"]>;
}

function pose(
  name: string,
  origin: Point,
  anchor: Point,
  scale: number,
  burst: Point,
): PoseArt {
  return { name, texScale: 0.4, origin, anchor, scale, burst };
}

function down(
  origin: Point,
  anchor: Point,
  scale: number,
): Omit<PoseArt, "burst"> {
  return { name: "pose-down", texScale: 0.4, origin, anchor, scale };
}

function npcRig(a: NpcArt): WarriorRig {
  const [grip] = a.blade;
  const empty = { x: grip.x, y: grip.y, w: EMPTY, h: EMPTY };
  return {
    skeleton: "warrior",
    ...(a.weapon ? { weapon: a.weapon } : {}),
    ...(a.weapon === "gourd" ? { grip } : {}),
    dir: a.dir,
    texScale: 0.5,
    foot: a.foot,
    height: a.height,
    parts: {
      body: a.body,
      armR: empty,
      sword: empty,
      arm: empty,
      head: a.head,
    },
    cloth: [],
    covers: [],
    joints: { shoulder: grip, elbowR: grip, neck: a.neck },
    blade: a.blade,
    adaptiveFx: true,
    fxColor: a.fxColor,
    poses: a.poses,
    down: a.down,
  };
}

/** Rig NPC theo id đối thủ trong trận. */
export const NPC_RIGS: Readonly<Record<string, WarriorRig>> = {
  // Tay chèo toán cướp (Mộc, tướng sĩ): dao găm tay phải, mái chèo tay trái.
  "bo-hai-raider-boatman": npcRig({
    dir: "bo-hai-raider-boatman",
    foot: { x: 503, y: 1449 },
    height: 1359,
    body: { x: 222, y: 96, w: 692, h: 1360 },
    head: { x: 320, y: 100, w: 250, h: 226 },
    neck: { x: 480, y: 315 },
    blade: [
      { x: 300, y: 840 },
      { x: 485, y: 1118 },
    ],
    fxColor: 0x4f9a4a,
    poses: {
      attack: pose("pose-attack", { x: 75, y: 8 }, { x: 575, y: 1015 }, 1, {
        x: 1465,
        y: 156,
      }),
      cast: pose("pose-cast", { x: 16, y: 11 }, { x: 511, y: 1524 }, 0.85, {
        x: 987,
        y: 123,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 4, y: 96 },
        { x: 511, y: 1480 },
        0.85,
        { x: 986, y: 207 },
      ),
    },
    down: down({ x: 69, y: 6 }, { x: 776, y: 963 }, 0.82),
  }),
  // Thủ lĩnh toán cướp ven biển (Thủy, binh lính): đao cong chống trước người, cuộn thừng trên vai.
  "bo-hai-raider-chief": npcRig({
    dir: "bo-hai-raider-chief",
    foot: { x: 508, y: 1521 },
    height: 1516,
    body: { x: 250, y: 10, w: 522, h: 1518 },
    head: { x: 284, y: 10, w: 316, h: 290 },
    neck: { x: 515, y: 290 },
    blade: [
      { x: 520, y: 840 },
      { x: 450, y: 1490 },
    ],
    fxColor: 0x4aa3d9,
    poses: {
      attack: pose("pose-attack", { x: 92, y: 5 }, { x: 524, y: 1019 }, 1, {
        x: 1459,
        y: 209,
      }),
      cast: pose("pose-cast", { x: 72, y: 10 }, { x: 491, y: 1519 }, 1, {
        x: 974,
        y: 324,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 71, y: 15 },
        { x: 527, y: 1522 },
        1,
        { x: 719, y: 35 },
      ),
    },
    down: down({ x: 197, y: 12 }, { x: 793, y: 961 }, 0.82),
  }),
  // Kẻ dò đường (Lôi, mưu sĩ): quạt giấy gập trong tay, túi thẻ tre.
  "bo-hai-raider-scout": npcRig({
    dir: "bo-hai-raider-scout",
    weapon: "fan",
    foot: { x: 506, y: 1526 },
    height: 1521,
    body: { x: 226, y: 6, w: 538, h: 1528 },
    head: { x: 330, y: 6, w: 266, h: 284 },
    neck: { x: 500, y: 275 },
    blade: [
      { x: 445, y: 570 },
      { x: 420, y: 690 },
    ],
    fxColor: 0x9a6ae0,
    poses: {
      attack: pose("pose-attack", { x: 169, y: 34 }, { x: 654, y: 988 }, 1, {
        x: 1225,
        y: 214,
      }),
      cast: pose("pose-cast", { x: 16, y: 8 }, { x: 424, y: 1529 }, 1, {
        x: 990,
        y: 225,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 11, y: 65 },
        { x: 529, y: 1510 },
        1,
        { x: 995, y: 267 },
      ),
    },
    down: down({ x: 51, y: 14 }, { x: 637, y: 960 }, 0.82),
  }),
  // Thân binh Đỗ Động (Hỏa, tướng sĩ): giáo dựng bên phải, kiếm đeo hông.
  "do-dong-guard": npcRig({
    dir: "do-dong-guard",
    weapon: "spear",
    foot: { x: 517, y: 1511 },
    height: 1496,
    body: { x: 188, y: 6, w: 610, h: 1512 },
    head: { x: 388, y: 14, w: 212, h: 276 },
    neck: { x: 490, y: 275 },
    blade: [
      { x: 232, y: 640 },
      { x: 224, y: 20 },
    ],
    fxColor: 0xe0552b,
    poses: {
      attack: pose("pose-attack", { x: 23, y: 17 }, { x: 544, y: 1006 }, 1, {
        x: 1491,
        y: 289,
      }),
      cast: pose("pose-cast", { x: 13, y: 110 }, { x: 474, y: 1430 }, 1, {
        x: 992,
        y: 435,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 7, y: 214 },
        { x: 508, y: 1389 },
        1,
        { x: 994, y: 793 },
      ),
    },
    down: down({ x: 39, y: 11 }, { x: 766, y: 969 }, 0.82),
  }),
  // Lang y Đỗ Động (Mộc, y sư): bầu thuốc cầm trước ngực, dao trong vỏ.
  "do-dong-healer": npcRig({
    dir: "do-dong-healer",
    weapon: "gourd",
    foot: { x: 509, y: 1520 },
    height: 1510,
    body: { x: 238, y: 8, w: 528, h: 1520 },
    head: { x: 328, y: 10, w: 294, h: 300 },
    neck: { x: 540, y: 300 },
    blade: [
      { x: 660, y: 620 },
      { x: 670, y: 720 },
    ],
    fxColor: 0x4f9a4a,
    poses: {
      attack: pose("pose-attack", { x: 254, y: 10 }, { x: 699, y: 1012 }, 1, {
        x: 1256,
        y: 431,
      }),
      cast: pose("pose-cast", { x: 29, y: 215 }, { x: 484, y: 1422 }, 0.9, {
        x: 987,
        y: 935,
      }),
      ultimate: pose("pose-ultimate", { x: 55, y: 7 }, { x: 451, y: 1526 }, 1, {
        x: 990,
        y: 464,
      }),
    },
    down: down({ x: 127, y: 11 }, { x: 749, y: 964 }, 0.82),
  }),
  // Lính canh đầm (Mộc, pháp sư): sào tre buộc thòng lọng.
  "do-dong-lookout": npcRig({
    dir: "do-dong-lookout",
    weapon: "staff",
    foot: { x: 517, y: 1520 },
    height: 1515,
    body: { x: 178, y: 8, w: 610, h: 1520 },
    head: { x: 380, y: 8, w: 226, h: 278 },
    neck: { x: 520, y: 270 },
    blade: [
      { x: 265, y: 680 },
      { x: 262, y: 150 },
    ],
    fxColor: 0x4f9a4a,
    poses: {
      attack: pose("pose-attack", { x: 58, y: 8 }, { x: 500, y: 1013 }, 1, {
        x: 1487,
        y: 166,
      }),
      cast: pose("pose-cast", { x: 102, y: 5 }, { x: 463, y: 1525 }, 1, {
        x: 889,
        y: 250,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 44, y: 24 },
        { x: 509, y: 1477 },
        1,
        { x: 985, y: 43 },
      ),
    },
    down: down({ x: 64, y: 11 }, { x: 760, y: 966 }, 0.82),
  }),
  // Đội trưởng giữ đường (Thổ, tướng sĩ): đao cong chống trước người.
  "do-dong-road-captain": npcRig({
    dir: "do-dong-road-captain",
    foot: { x: 508, y: 1521 },
    height: 1511,
    body: { x: 246, y: 6, w: 530, h: 1522 },
    head: { x: 296, y: 10, w: 296, h: 286 },
    neck: { x: 510, y: 280 },
    blade: [
      { x: 530, y: 850 },
      { x: 450, y: 1490 },
    ],
    fxColor: 0xb98a4a,
    poses: {
      attack: pose("pose-attack", { x: 81, y: 10 }, { x: 514, y: 1020 }, 1, {
        x: 1462,
        y: 209,
      }),
      cast: pose("pose-cast", { x: 64, y: 13 }, { x: 491, y: 1518 }, 1, {
        x: 975,
        y: 324,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 71, y: 14 },
        { x: 528, y: 1522 },
        1,
        { x: 722, y: 34 },
      ),
    },
    down: down({ x: 190, y: 9 }, { x: 792, y: 962 }, 0.82),
  }),
  // Quân sư Đỗ Động (Thủy, quân sư): quạt giấy gập trong tay, túi thẻ tre.
  "do-dong-strategist": npcRig({
    dir: "do-dong-strategist",
    weapon: "fan",
    foot: { x: 505, y: 1525 },
    height: 1515,
    body: { x: 224, y: 6, w: 540, h: 1526 },
    head: { x: 330, y: 10, w: 264, h: 276 },
    neck: { x: 500, y: 270 },
    blade: [
      { x: 440, y: 570 },
      { x: 410, y: 690 },
    ],
    fxColor: 0x4aa3d9,
    poses: {
      attack: pose("pose-attack", { x: 179, y: 30 }, { x: 663, y: 987 }, 1, {
        x: 1249,
        y: 214,
      }),
      cast: pose("pose-cast", { x: 16, y: 5 }, { x: 424, y: 1528 }, 1, {
        x: 991,
        y: 225,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 10, y: 63 },
        { x: 528, y: 1509 },
        1,
        { x: 996, y: 267 },
      ),
    },
    down: down({ x: 50, y: 13 }, { x: 638, y: 960 }, 0.82),
  }),
  // Phó tướng Đỗ Động (Kim, binh lính): giáo dựng bên phải, kiếm đeo hông.
  "do-dong-vanguard": npcRig({
    dir: "do-dong-vanguard",
    weapon: "spear",
    foot: { x: 518, y: 1511 },
    height: 1501,
    body: { x: 212, y: 6, w: 580, h: 1512 },
    head: { x: 394, y: 16, w: 210, h: 280 },
    neck: { x: 510, y: 280 },
    blade: [
      { x: 262, y: 640 },
      { x: 262, y: 20 },
    ],
    fxColor: 0xe8c55a,
    poses: {
      attack: pose("pose-attack", { x: 27, y: 20 }, { x: 542, y: 1006 }, 1, {
        x: 1493,
        y: 291,
      }),
      cast: pose("pose-cast", { x: 12, y: 111 }, { x: 473, y: 1429 }, 1, {
        x: 992,
        y: 435,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 6, y: 213 },
        { x: 508, y: 1388 },
        1,
        { x: 995, y: 793 },
      ),
    },
    down: down({ x: 40, y: 17 }, { x: 766, y: 970 }, 0.82),
  }),
  // Thủ lĩnh vô danh ở Hoa Lư (Thổ, binh lính): đao cong chống trước người, khăn vấn nâu.
  "hoa-lu-raider-chief": npcRig({
    dir: "hoa-lu-raider-chief",
    foot: { x: 508, y: 1521 },
    height: 1521,
    body: { x: 248, y: 10, w: 522, h: 1518 },
    head: { x: 300, y: 10, w: 270, h: 280 },
    neck: { x: 420, y: 275 },
    blade: [
      { x: 420, y: 820 },
      { x: 420, y: 700 },
    ],
    fxColor: 0xb98a4a,
    poses: {
      attack: pose("pose-attack", { x: 101, y: 8 }, { x: 533, y: 1019 }, 1, {
        x: 1479,
        y: 211,
      }),
      cast: pose("pose-cast", { x: 72, y: 13 }, { x: 491, y: 1519 }, 1, {
        x: 955,
        y: 321,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 72, y: 14 },
        { x: 528, y: 1522 },
        1,
        { x: 721, y: 34 },
      ),
    },
    down: down({ x: 188, y: 8 }, { x: 788, y: 962 }, 0.82),
  }),
  // Tướng giữ bờ đầm Hồi Hồ (Thủy, binh lính): giáo dựng bên phải, áo choàng xanh lá.
  "hoi-ho-bank-guard": npcRig({
    dir: "hoi-ho-bank-guard",
    weapon: "spear",
    foot: { x: 518, y: 1510 },
    height: 1510,
    body: { x: 214, y: 4, w: 588, h: 1514 },
    head: { x: 392, y: 12, w: 210, h: 278 },
    neck: { x: 452, y: 275 },
    blade: [
      { x: 452, y: 820 },
      { x: 452, y: 700 },
    ],
    fxColor: 0x4aa3d9,
    poses: {
      attack: pose("pose-attack", { x: 26, y: 22 }, { x: 542, y: 1006 }, 1, {
        x: 1490,
        y: 291,
      }),
      cast: pose("pose-cast", { x: 12, y: 111 }, { x: 473, y: 1429 }, 1, {
        x: 992,
        y: 435,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 7, y: 213 },
        { x: 508, y: 1387 },
        1,
        { x: 994, y: 793 },
      ),
    },
    down: down({ x: 42, y: 17 }, { x: 768, y: 969 }, 0.82),
  }),
  // Thầy pháp Hồi Hồ (Mộc, pháp sư): gậy gỗ buộc tua, chuỗi hạt.
  "hoi-ho-ritualist": npcRig({
    dir: "hoi-ho-ritualist",
    weapon: "staff",
    foot: { x: 517, y: 1520 },
    height: 1520,
    body: { x: 192, y: 6, w: 596, h: 1522 },
    head: { x: 378, y: 6, w: 230, h: 284 },
    neck: { x: 467, y: 275 },
    blade: [
      { x: 467, y: 820 },
      { x: 467, y: 700 },
    ],
    fxColor: 0x4f9a4a,
    poses: {
      attack: pose("pose-attack", { x: 59, y: 8 }, { x: 498, y: 1013 }, 1, {
        x: 1468,
        y: 181,
      }),
      cast: pose("pose-cast", { x: 99, y: 6 }, { x: 431, y: 1527 }, 1, {
        x: 894,
        y: 250,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 50, y: 19 },
        { x: 509, y: 1477 },
        1,
        { x: 967, y: 42 },
      ),
    },
    down: down({ x: 58, y: 9 }, { x: 769, y: 974 }, 0.82),
  }),
  // Tướng tiên phong quân Ngô (Kim, tướng sĩ): giáo dựng bên phải, áo choàng xanh xám.
  "ngo-951-field-commander": npcRig({
    dir: "ngo-951-field-commander",
    weapon: "spear",
    foot: { x: 517, y: 1509 },
    height: 1509,
    body: { x: 190, y: 6, w: 616, h: 1510 },
    head: { x: 390, y: 16, w: 216, h: 274 },
    neck: { x: 459, y: 275 },
    blade: [
      { x: 459, y: 820 },
      { x: 459, y: 700 },
    ],
    fxColor: 0xe8c55a,
    poses: {
      attack: pose("pose-attack", { x: 25, y: 23 }, { x: 541, y: 1006 }, 1, {
        x: 1483,
        y: 292,
      }),
      cast: pose("pose-cast", { x: 12, y: 113 }, { x: 474, y: 1429 }, 1, {
        x: 992,
        y: 435,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 7, y: 214 },
        { x: 507, y: 1388 },
        1,
        { x: 995, y: 793 },
      ),
    },
    down: down({ x: 40, y: 23 }, { x: 767, y: 969 }, 0.82),
  }),
  // Lính quân Ngô (Thổ, binh lính): kiếm ngắn, khiên da tròn.
  "ngo-951-soldier": npcRig({
    dir: "ngo-951-soldier",
    foot: { x: 498, y: 1523 },
    height: 1523,
    body: { x: 180, y: 12, w: 700, h: 1518 },
    head: { x: 368, y: 12, w: 210, h: 278 },
    neck: { x: 449, y: 275 },
    blade: [
      { x: 449, y: 820 },
      { x: 449, y: 700 },
    ],
    fxColor: 0xb98a4a,
    poses: {
      attack: pose("pose-attack", { x: 75, y: 4 }, { x: 574, y: 1016 }, 1, {
        x: 1431,
        y: 243,
      }),
      cast: pose("pose-cast", { x: 15, y: 11 }, { x: 512, y: 1524 }, 1, {
        x: 989,
        y: 1502,
      }),
      ultimate: pose("pose-ultimate", { x: 4, y: 96 }, { x: 513, y: 1480 }, 1, {
        x: 988,
        y: 628,
      }),
    },
    down: down({ x: 73, y: 12 }, { x: 769, y: 967 }, 0.82),
  }),
  // Mưu sĩ quân Ngô (Thủy, mưu sĩ): quạt giấy gập trong tay, túi thẻ tre.
  "ngo-951-strategist": npcRig({
    dir: "ngo-951-strategist",
    weapon: "fan",
    foot: { x: 506, y: 1526 },
    height: 1526,
    body: { x: 226, y: 6, w: 538, h: 1528 },
    head: { x: 330, y: 6, w: 262, h: 284 },
    neck: { x: 442, y: 275 },
    blade: [
      { x: 442, y: 820 },
      { x: 442, y: 700 },
    ],
    fxColor: 0x4aa3d9,
    poses: {
      attack: pose("pose-attack", { x: 192, y: 31 }, { x: 663, y: 988 }, 1, {
        x: 1250,
        y: 215,
      }),
      cast: pose("pose-cast", { x: 15, y: 8 }, { x: 424, y: 1528 }, 1, {
        x: 990,
        y: 227,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 13, y: 61 },
        { x: 528, y: 1511 },
        1,
        { x: 995, y: 266 },
      ),
    },
    down: down({ x: 52, y: 19 }, { x: 640, y: 959 }, 0.82),
  }),
  // Mưu sĩ Phong Châu (Phong, mưu sĩ): quạt giấy gập trong tay, áo tím.
  "phong-chau-strategist": npcRig({
    dir: "phong-chau-strategist",
    weapon: "fan",
    foot: { x: 506, y: 1524 },
    height: 1524,
    body: { x: 224, y: 8, w: 538, h: 1524 },
    head: { x: 328, y: 8, w: 268, h: 282 },
    neck: { x: 446, y: 275 },
    blade: [
      { x: 446, y: 820 },
      { x: 446, y: 700 },
    ],
    fxColor: 0x7fd0c0,
    poses: {
      attack: pose("pose-attack", { x: 163, y: 33 }, { x: 659, y: 989 }, 1, {
        x: 1218,
        y: 216,
      }),
      cast: pose("pose-cast", { x: 16, y: 8 }, { x: 424, y: 1529 }, 1, {
        x: 990,
        y: 227,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 10, y: 63 },
        { x: 528, y: 1510 },
        1,
        { x: 996, y: 266 },
      ),
    },
    down: down({ x: 49, y: 12 }, { x: 637, y: 960 }, 0.82),
  }),
  // Tướng giữ đường Phong Châu (Thổ, binh lính): giáo dựng bên phải, áo tím.
  "phong-chau-vanguard": npcRig({
    dir: "phong-chau-vanguard",
    weapon: "spear",
    foot: { x: 517, y: 1510 },
    height: 1510,
    body: { x: 198, y: 6, w: 606, h: 1512 },
    head: { x: 394, y: 16, w: 210, h: 274 },
    neck: { x: 465, y: 275 },
    blade: [
      { x: 465, y: 820 },
      { x: 465, y: 700 },
    ],
    fxColor: 0xb98a4a,
    poses: {
      attack: pose("pose-attack", { x: 17, y: 19 }, { x: 543, y: 1006 }, 1, {
        x: 1486,
        y: 287,
      }),
      cast: pose("pose-cast", { x: 12, y: 113 }, { x: 474, y: 1430 }, 1, {
        x: 992,
        y: 435,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 7, y: 213 },
        { x: 508, y: 1388 },
        1,
        { x: 995, y: 792 },
      ),
    },
    down: down({ x: 43, y: 12 }, { x: 767, y: 970 }, 0.82),
  }),
  // Lang y Tây Phù Liệt (Mộc, y sư): bầu thuốc cầm trước ngực, dao trong vỏ.
  "phu-liet-healer": npcRig({
    dir: "phu-liet-healer",
    weapon: "gourd",
    foot: { x: 510, y: 1520 },
    height: 1520,
    body: { x: 238, y: 10, w: 528, h: 1518 },
    head: { x: 328, y: 10, w: 256, h: 280 },
    neck: { x: 433, y: 275 },
    blade: [
      { x: 433, y: 820 },
      { x: 433, y: 700 },
    ],
    fxColor: 0x4f9a4a,
    poses: {
      attack: pose("pose-attack", { x: 264, y: 8 }, { x: 704, y: 1013 }, 1, {
        x: 1272,
        y: 431,
      }),
      cast: pose("pose-cast", { x: 26, y: 214 }, { x: 485, y: 1421 }, 1, {
        x: 986,
        y: 937,
      }),
      ultimate: pose("pose-ultimate", { x: 54, y: 7 }, { x: 451, y: 1526 }, 1, {
        x: 991,
        y: 465,
      }),
    },
    down: down({ x: 128, y: 11 }, { x: 751, y: 964 }, 0.82),
  }),
  // Toán trưởng chặn đường Tây Phù Liệt (Phong, tướng sĩ): đao cong chống trước người.
  "phu-liet-raid-leader": npcRig({
    dir: "phu-liet-raid-leader",
    foot: { x: 508, y: 1521 },
    height: 1521,
    body: { x: 250, y: 10, w: 522, h: 1518 },
    head: { x: 354, y: 10, w: 214, h: 280 },
    neck: { x: 417, y: 275 },
    blade: [
      { x: 417, y: 820 },
      { x: 417, y: 700 },
    ],
    fxColor: 0x7fd0c0,
    poses: {
      attack: pose("pose-attack", { x: 73, y: 10 }, { x: 502, y: 1019 }, 1, {
        x: 1448,
        y: 210,
      }),
      cast: pose("pose-cast", { x: 72, y: 12 }, { x: 491, y: 1519 }, 1, {
        x: 961,
        y: 322,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 71, y: 15 },
        { x: 529, y: 1522 },
        1,
        { x: 719, y: 35 },
      ),
    },
    down: down({ x: 188, y: 15 }, { x: 791, y: 963 }, 0.82),
  }),
  // Thám báo Tây Phù Liệt (Lôi, mưu sĩ): quạt giấy gập trong tay, túi thẻ tre.
  "phu-liet-scout": npcRig({
    dir: "phu-liet-scout",
    weapon: "fan",
    foot: { x: 506, y: 1525 },
    height: 1525,
    body: { x: 224, y: 6, w: 550, h: 1526 },
    head: { x: 328, y: 6, w: 268, h: 284 },
    neck: { x: 445, y: 275 },
    blade: [
      { x: 445, y: 820 },
      { x: 445, y: 700 },
    ],
    fxColor: 0x9a6ae0,
    poses: {
      attack: pose("pose-attack", { x: 289, y: 34 }, { x: 657, y: 987 }, 1, {
        x: 1224,
        y: 215,
      }),
      cast: pose("pose-cast", { x: 16, y: 7 }, { x: 424, y: 1528 }, 1, {
        x: 990,
        y: 226,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 10, y: 65 },
        { x: 529, y: 1511 },
        1,
        { x: 997, y: 268 },
      ),
    },
    down: down({ x: 50, y: 15 }, { x: 635, y: 960 }, 0.82),
  }),
  // Phó tướng Tây Phù Liệt (Hỏa, tướng sĩ): giáo dựng bên phải, áo đỏ.
  "phu-liet-vanguard": npcRig({
    dir: "phu-liet-vanguard",
    weapon: "spear",
    foot: { x: 518, y: 1510 },
    height: 1510,
    body: { x: 208, y: 6, w: 592, h: 1512 },
    head: { x: 392, y: 14, w: 214, h: 276 },
    neck: { x: 464, y: 275 },
    blade: [
      { x: 464, y: 820 },
      { x: 464, y: 700 },
    ],
    fxColor: 0xe0552b,
    poses: {
      attack: pose("pose-attack", { x: 13, y: 22 }, { x: 543, y: 1006 }, 1, {
        x: 1477,
        y: 291,
      }),
      cast: pose("pose-cast", { x: 13, y: 111 }, { x: 474, y: 1429 }, 1, {
        x: 989,
        y: 434,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 7, y: 213 },
        { x: 509, y: 1387 },
        1,
        { x: 993, y: 793 },
      ),
    },
    down: down({ x: 40, y: 14 }, { x: 766, y: 969 }, 0.82),
  }),
  // Cung thủ trên lũy (Hỏa, pháp sư): cung gỗ tay trái, ống tên sau lưng.
  "phu-liet-wall-archer": npcRig({
    dir: "phu-liet-wall-archer",
    foot: { x: 517, y: 1520 },
    height: 1520,
    body: { x: 226, y: 6, w: 564, h: 1522 },
    head: { x: 378, y: 6, w: 226, h: 284 },
    neck: { x: 469, y: 275 },
    blade: [
      { x: 469, y: 820 },
      { x: 469, y: 700 },
    ],
    fxColor: 0xe0552b,
    poses: {
      attack: pose("pose-attack", { x: 60, y: 8 }, { x: 499, y: 1013 }, 1, {
        x: 1390,
        y: 147,
      }),
      cast: pose("pose-cast", { x: 127, y: 8 }, { x: 465, y: 1527 }, 1, {
        x: 899,
        y: 250,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 51, y: 48 },
        { x: 509, y: 1477 },
        1,
        { x: 782, y: 68 },
      ),
    },
    down: down({ x: 106, y: 14 }, { x: 714, y: 897 }, 0.82),
  }),
  // Đội trưởng giữ lũy (Thổ, binh lính): giáp da đan, đao cong chống trước người.
  "phu-liet-wall-captain": npcRig({
    dir: "phu-liet-wall-captain",
    foot: { x: 508, y: 1522 },
    height: 1522,
    body: { x: 246, y: 6, w: 534, h: 1524 },
    head: { x: 294, y: 6, w: 254, h: 284 },
    neck: { x: 397, y: 275 },
    blade: [
      { x: 397, y: 820 },
      { x: 397, y: 700 },
    ],
    fxColor: 0xb98a4a,
    poses: {
      attack: pose("pose-attack", { x: 85, y: 9 }, { x: 520, y: 1019 }, 1, {
        x: 1468,
        y: 211,
      }),
      cast: pose("pose-cast", { x: 72, y: 12 }, { x: 491, y: 1519 }, 1, {
        x: 947,
        y: 325,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 70, y: 16 },
        { x: 528, y: 1523 },
        1,
        { x: 719, y: 36 },
      ),
    },
    down: down({ x: 191, y: 13 }, { x: 794, y: 962 }, 0.82),
  }),
  // Quân sư Siêu Loại (Thổ, quân sư): áo xám, quạt giấy, túi thẻ tre.
  "sieu-loai-strategist": npcRig({
    dir: "sieu-loai-strategist",
    weapon: "fan",
    foot: { x: 506, y: 1526 },
    height: 1526,
    body: { x: 132, y: 8, w: 632, h: 1526 },
    head: { x: 300, y: 8, w: 294, h: 282 },
    neck: { x: 446, y: 275 },
    blade: [
      { x: 446, y: 820 },
      { x: 446, y: 700 },
    ],
    fxColor: 0xb98a4a,
    poses: {
      attack: pose("pose-attack", { x: 169, y: 34 }, { x: 661, y: 987 }, 1, {
        x: 1238,
        y: 215,
      }),
      cast: pose("pose-cast", { x: 15, y: 8 }, { x: 424, y: 1528 }, 1, {
        x: 990,
        y: 227,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 11, y: 63 },
        { x: 529, y: 1510 },
        1,
        { x: 996, y: 267 },
      ),
    },
    down: down({ x: 51, y: 16 }, { x: 659, y: 960 }, 0.82),
  }),
  // Phó tướng Siêu Loại (Kim, binh lính): giáp da, giáo dài tay phải, kiếm đeo hông.
  "sieu-loai-vanguard": npcRig({
    dir: "sieu-loai-vanguard",
    weapon: "spear",
    foot: { x: 520, y: 1512 },
    height: 1512,
    body: { x: 188, y: 4, w: 624, h: 1516 },
    head: { x: 394, y: 16, w: 212, h: 274 },
    neck: { x: 458, y: 275 },
    blade: [
      { x: 458, y: 820 },
      { x: 458, y: 700 },
    ],
    fxColor: 0xe8c55a,
    poses: {
      attack: pose("pose-attack", { x: 24, y: 18 }, { x: 542, y: 1006 }, 1, {
        x: 1491,
        y: 288,
      }),
      cast: pose("pose-cast", { x: 12, y: 112 }, { x: 474, y: 1430 }, 1, {
        x: 993,
        y: 435,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 7, y: 197 },
        { x: 508, y: 1387 },
        1,
        { x: 994, y: 793 },
      ),
    },
    down: down({ x: 39, y: 16 }, { x: 768, y: 969 }, 0.82),
  }),
  // Lang y Tiên Du (Mộc, y sư): áo lam, hồ lô thuốc tay trái, chùm thảo dược trước ngực.
  "tien-du-healer": npcRig({
    dir: "tien-du-healer",
    weapon: "gourd",
    foot: { x: 508, y: 1520 },
    height: 1520,
    body: { x: 236, y: 8, w: 532, h: 1520 },
    head: { x: 324, y: 8, w: 258, h: 282 },
    neck: { x: 431, y: 275 },
    blade: [
      { x: 650, y: 430 },
      { x: 650, y: 370 },
    ],
    fxColor: 0x4f9a4a,
    poses: {
      attack: pose("pose-attack", { x: 263, y: 9 }, { x: 704, y: 1012 }, 1, {
        x: 1262,
        y: 432,
      }),
      cast: pose("pose-cast", { x: 27, y: 213 }, { x: 485, y: 1421 }, 1, {
        x: 986,
        y: 932,
      }),
      ultimate: pose("pose-ultimate", { x: 50, y: 7 }, { x: 451, y: 1527 }, 1, {
        x: 991,
        y: 464,
      }),
    },
    down: down({ x: 129, y: 12 }, { x: 752, y: 963 }, 0.82),
  }),
  // Phó tướng Tiên Du (Thủy, tướng sĩ): giáp da, áo choàng lam, giáo dài.
  "tien-du-vanguard": npcRig({
    dir: "tien-du-vanguard",
    weapon: "spear",
    foot: { x: 518, y: 1511 },
    height: 1511,
    body: { x: 200, y: 6, w: 602, h: 1512 },
    head: { x: 388, y: 14, w: 212, h: 276 },
    neck: { x: 454, y: 275 },
    blade: [
      { x: 454, y: 820 },
      { x: 454, y: 700 },
    ],
    fxColor: 0x4aa3d9,
    poses: {
      attack: pose("pose-attack", { x: 25, y: 24 }, { x: 543, y: 1004 }, 1, {
        x: 1490,
        y: 289,
      }),
      cast: pose("pose-cast", { x: 12, y: 107 }, { x: 474, y: 1429 }, 1, {
        x: 992,
        y: 435,
      }),
      ultimate: pose(
        "pose-ultimate",
        { x: 7, y: 213 },
        { x: 508, y: 1387 },
        1,
        { x: 994, y: 793 },
      ),
    },
    down: down({ x: 42, y: 17 }, { x: 768, y: 970 }, 0.82),
  }),
};
