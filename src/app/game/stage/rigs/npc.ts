import type { PartBox, Point, PoseArt, WarriorRig } from "./types";

/**
 * Hình động NPC hư cấu của Bình Loạn (id trong `src/core/campaign/encounters.ts`, `hero: false`). Bộ tranh Shan gửi
 * 14/11/2026: ảnh đứng 1024×1536 và bốn tranh tư thế (đánh thường, ra chiêu, tuyệt chiêu, gục).
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

function pose(name: string, origin: Point, anchor: Point, scale: number, burst: Point): PoseArt {
  return { name, texScale: 0.4, origin, anchor, scale, burst };
}

function down(origin: Point, anchor: Point, scale: number): Omit<PoseArt, "burst"> {
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
    parts: { body: a.body, armR: empty, sword: empty, arm: empty, head: a.head },
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
    blade: [{ x: 300, y: 840 }, { x: 485, y: 1118 }],
    fxColor: 0x4f9a4a,
    poses: {
      attack: pose("pose-attack", { x: 75, y: 8 }, { x: 575, y: 1015 }, 1, { x: 1465, y: 156 }),
      cast: pose("pose-cast", { x: 16, y: 11 }, { x: 511, y: 1524 }, 0.85, { x: 987, y: 123 }),
      ultimate: pose("pose-ultimate", { x: 4, y: 96 }, { x: 511, y: 1480 }, 0.85, { x: 986, y: 207 }),
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
    blade: [{ x: 520, y: 840 }, { x: 450, y: 1490 }],
    fxColor: 0x4aa3d9,
    poses: {
      attack: pose("pose-attack", { x: 92, y: 5 }, { x: 524, y: 1019 }, 1, { x: 1459, y: 209 }),
      cast: pose("pose-cast", { x: 72, y: 10 }, { x: 491, y: 1519 }, 1, { x: 974, y: 324 }),
      ultimate: pose("pose-ultimate", { x: 71, y: 15 }, { x: 527, y: 1522 }, 1, { x: 719, y: 35 }),
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
    blade: [{ x: 445, y: 570 }, { x: 420, y: 690 }],
    fxColor: 0x9a6ae0,
    poses: {
      attack: pose("pose-attack", { x: 169, y: 34 }, { x: 654, y: 988 }, 1, { x: 1225, y: 214 }),
      cast: pose("pose-cast", { x: 16, y: 8 }, { x: 424, y: 1529 }, 1, { x: 990, y: 225 }),
      ultimate: pose("pose-ultimate", { x: 11, y: 65 }, { x: 529, y: 1510 }, 1, { x: 995, y: 267 }),
    },
    down: down({ x: 51, y: 14 }, { x: 637, y: 960 }, 0.82),
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
    blade: [{ x: 660, y: 620 }, { x: 670, y: 720 }],
    fxColor: 0x4f9a4a,
    poses: {
      attack: pose("pose-attack", { x: 254, y: 10 }, { x: 699, y: 1012 }, 1, { x: 1256, y: 431 }),
      cast: pose("pose-cast", { x: 29, y: 215 }, { x: 484, y: 1422 }, 0.9, { x: 987, y: 935 }),
      ultimate: pose("pose-ultimate", { x: 55, y: 7 }, { x: 451, y: 1526 }, 1, { x: 990, y: 464 }),
    },
    down: down({ x: 127, y: 11 }, { x: 749, y: 964 }, 0.82),
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
    blade: [{ x: 232, y: 640 }, { x: 224, y: 20 }],
    fxColor: 0xe0552b,
    poses: {
      attack: pose("pose-attack", { x: 23, y: 17 }, { x: 544, y: 1006 }, 1, { x: 1491, y: 289 }),
      cast: pose("pose-cast", { x: 13, y: 110 }, { x: 474, y: 1430 }, 1, { x: 992, y: 435 }),
      ultimate: pose("pose-ultimate", { x: 7, y: 214 }, { x: 508, y: 1389 }, 1, { x: 994, y: 793 }),
    },
    down: down({ x: 39, y: 11 }, { x: 766, y: 969 }, 0.82),
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
    blade: [{ x: 265, y: 680 }, { x: 262, y: 150 }],
    fxColor: 0x4f9a4a,
    poses: {
      attack: pose("pose-attack", { x: 58, y: 8 }, { x: 500, y: 1013 }, 1, { x: 1487, y: 166 }),
      cast: pose("pose-cast", { x: 102, y: 5 }, { x: 463, y: 1525 }, 1, { x: 889, y: 250 }),
      ultimate: pose("pose-ultimate", { x: 44, y: 24 }, { x: 509, y: 1477 }, 1, { x: 985, y: 43 }),
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
    blade: [{ x: 530, y: 850 }, { x: 450, y: 1490 }],
    fxColor: 0xb98a4a,
    poses: {
      attack: pose("pose-attack", { x: 81, y: 10 }, { x: 514, y: 1020 }, 1, { x: 1462, y: 209 }),
      cast: pose("pose-cast", { x: 64, y: 13 }, { x: 491, y: 1518 }, 1, { x: 975, y: 324 }),
      ultimate: pose("pose-ultimate", { x: 71, y: 14 }, { x: 528, y: 1522 }, 1, { x: 722, y: 34 }),
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
    blade: [{ x: 440, y: 570 }, { x: 410, y: 690 }],
    fxColor: 0x4aa3d9,
    poses: {
      attack: pose("pose-attack", { x: 179, y: 30 }, { x: 663, y: 987 }, 1, { x: 1249, y: 214 }),
      cast: pose("pose-cast", { x: 16, y: 5 }, { x: 424, y: 1528 }, 1, { x: 991, y: 225 }),
      ultimate: pose("pose-ultimate", { x: 10, y: 63 }, { x: 528, y: 1509 }, 1, { x: 996, y: 267 }),
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
    blade: [{ x: 262, y: 640 }, { x: 262, y: 20 }],
    fxColor: 0xe8c55a,
    poses: {
      attack: pose("pose-attack", { x: 27, y: 20 }, { x: 542, y: 1006 }, 1, { x: 1493, y: 291 }),
      cast: pose("pose-cast", { x: 12, y: 111 }, { x: 473, y: 1429 }, 1, { x: 992, y: 435 }),
      ultimate: pose("pose-ultimate", { x: 6, y: 213 }, { x: 508, y: 1388 }, 1, { x: 995, y: 793 }),
    },
    down: down({ x: 40, y: 17 }, { x: 766, y: 970 }, 0.82),
  }),
};
