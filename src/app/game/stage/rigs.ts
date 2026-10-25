/**
 * Dữ liệu dựng hình động nhân vật trên sân khấu trận. Tọa độ theo hệ của file PSD gốc (1024×1024); ảnh
 * từng lớp nằm ở public/art/characters/<thư mục>/<lớp>.webp và được thu nhỏ theo `texScale` cho nhẹ.
 * Cách tách lớp và dựng khớp: docs/design/15-ke-hoach-do-hoa.md mục 4.4.
 */

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface PartBox extends Point {
  readonly w: number;
  readonly h: number;
}

/** Các lớp của bộ xương pháp sư, xếp từ dưới lên trên. */
export const MAGE_PARTS = [
  "backhair",
  "legs",
  "bottom",
  "boots",
  "top",
  "neck",
  "armL",
  "armR",
  "ribbon",
  "waterL",
  "waterR",
  "gourd",
  "head",
  "eyeL",
  "eyeR",
] as const;

export type MagePart = (typeof MAGE_PARTS)[number];

/** Khớp xoay của bộ xương pháp sư. `gourd`: điểm hồ lô lắc trong tay. */
export type MageJoint =
  | "upper"
  | "armL"
  | "armR"
  | "waterL"
  | "waterR"
  | "gourd"
  | "head"
  | "eyeL"
  | "eyeR";

export interface MageRig {
  readonly skeleton: "mage";
  /** Thư mục ảnh dưới /art/characters/. */
  readonly dir: string;
  /** Tỉ lệ ảnh lớp so với tọa độ gốc (0.5: ảnh bằng nửa kích thước PSD). */
  readonly texScale: number;
  /** Điểm giữa hai bàn chân: chỗ đặt nhân vật xuống sân. */
  readonly foot: Point;
  /** Chiều cao nhân vật trong hệ tọa độ gốc, để co về cỡ ô trên sân. */
  readonly height: number;
  readonly parts: Readonly<Record<MagePart, PartBox>>;
  readonly joints: Readonly<Record<MageJoint, Point>>;
  /** Màu hạt và vòng sóng khi thi triển. */
  readonly fxColor: number;
}

/** Gió uốn một lớp vải (lưới): càng xa đầu buộc càng bay nhiều. */
export interface Wind {
  readonly axis: "x" | "y";
  /** Vị trí (0..1) dọc theo trục bắt đầu chịu gió. */
  readonly start: number;
  readonly amp: number;
  readonly freq: number;
  readonly k: number;
  readonly phase: number;
  /** Lượn theo chiều dọc thay vì ngang (dải lụa, áo choàng bay ngang). */
  readonly vertical?: boolean;
  /** Đầu buộc ở cuối trục (bên phải hoặc bên dưới) thay vì đầu trục. */
  readonly reverse?: boolean;
}

/** Lớp cố định của bộ xương tướng sĩ. Kiếm và tay cầm kiếm cùng xoay quanh vai. */
export type WarriorPart = "body" | "armR" | "sword" | "arm" | "head";

export interface WarriorRig {
  readonly skeleton: "warrior";
  /** Nhịp vũ khí riêng; bỏ trống giữ nhát chém của các tướng sĩ cũ. */
  readonly weapon?: "spear" | "fan" | "gourd" | "staff";
  /** Điểm cầm để hồ lô lắc nhẹ trong tay, cùng hệ tọa độ ảnh nguồn. */
  readonly grip?: Point;
  /** Tay áo dài uốn theo gió trong cùng khớp với tay cầm quạt. */
  readonly sleeveWind?: Wind;
  readonly dir: string;
  readonly texScale: number;
  readonly foot: Point;
  readonly height: number;
  readonly parts: Readonly<Record<WarriorPart, PartBox>>;
  /** Lớp vải bay theo gió. `behind`: vẽ sau thân (áo choàng, dải buộc tóc), còn lại vẽ ngay trên thân. */
  readonly cloth: readonly { readonly name: string; readonly box: PartBox; readonly wind: Wind; readonly behind?: boolean; readonly overArms?: boolean }[];
  /** Lớp phủ lên tay cầm kiếm (giáp vai, tay áo) để che chỗ nối ở vai. */
  readonly covers: readonly { readonly name: string; readonly box: PartBox }[];
  /** shoulder: vai tay cầm kiếm (cả tay và kiếm xoay quanh đây); elbowR: khuỷu tay không; neck: cổ. */
  readonly joints: Readonly<Record<"shoulder" | "elbowR" | "neck", Point>>;
  /** Chuôi và mũi kiếm lúc đứng yên, để đặt hào quang dọc lưỡi. */
  readonly blade: readonly [Point, Point];
  readonly fxColor: number;
  /** Tâm quả cầu đầu trượng: đốm sáng riêng nhấp nháy theo tay. */
  readonly orb?: Point;
  /**
   * Hiệu ứng lúc đòn trúng vẽ trên cả sân: `lightning` phóng sét tới đối thủ, tuyệt chiêu giáng sét xuống cả đội;
   * `earthWard` và `leafBloom` chỉ ở tuyệt chiêu, dựng vòm khiên đất hoặc nở vòng lá hồi sinh quanh từng đồng đội;
   * `armorPierce` chỉ ở tuyệt chiêu, phóng mũi sáng xuyên giáp tới đối thủ đứng đầu; `supplyDrain` chỉ ở tuyệt
   * chiêu, phủ sương băng lên cả đội đối thủ và hút hạt sáng từ họ về người tung chiêu; `waterPillar` chỉ ở tuyệt
   * chiêu, phun cột nước rồi đóng băng dưới chân từng đối thủ; `flameWall` chỉ ở tuyệt chiêu, dựng tường lửa
   * quanh chính mình và bén lửa lên từng đối thủ; `groundSlam` chỉ ở tuyệt chiêu, nứt đất dưới chân đối thủ đứng
   * đầu và dựng vòm khiên đất quanh cả đội mình; `needleVolley` chỉ ở tuyệt chiêu, bắn tỏa kim bạc tới từng đối thủ;
   * `steelBulwark` chỉ ở tuyệt chiêu, dựng tường thép trước mặt chính mình; `silverGrace` chỉ ở tuyệt chiêu, rải kim
   * bạc và vòng sáng hồi máu quanh từng đồng đội; `coinScatter` chỉ ở tuyệt chiêu, tung tiền vàng khỏi đối thủ đứng
   * đầu kèm ấn câm lặng; `ironFormation` chỉ ở tuyệt chiêu, khiên nứt trên từng đối thủ và mũi tên vàng ở từng đồng
   * đội; `bambooSap` chỉ ở tuyệt chiêu, chém lá trúc lên đối thủ đứng đầu và hút sinh khí về chính mình.
   */
  readonly strikeFx?:
    | "lightning"
    | "earthWard"
    | "leafBloom"
    | "armorPierce"
    | "supplyDrain"
    | "waterPillar"
    | "flameWall"
    | "groundSlam"
    | "needleVolley"
    | "steelBulwark"
    | "silverGrace"
    | "coinScatter"
    | "ironFormation"
    | "bambooSap";
  /** Khiên trên tay không cầm vũ khí: góc (radian) nâng khiên khi vào thế, đỡ đòn, được tăng (ứng với `raise` = 1). */
  readonly shieldRaise?: number;
  readonly poses?: Readonly<Partial<Record<PoseKind, PoseArt>>>;
  /** Tranh bị hạ gục: hết máu thì hình động mờ dần sang tranh này. */
  readonly down?: Omit<PoseArt, "burst">;
}

/**
 * Tranh tư thế vẽ riêng (đánh thường, ra chiêu, tuyệt chiêu): game thay hình động bằng tranh này trong khoảnh khắc ra
 * đòn. Tọa độ theo ảnh gốc của tranh; ảnh xuất ra đã cắt sát và thu nhỏ theo texScale của rig.
 */
export interface PoseArt {
  readonly name: string;
  /** Tranh có thể thu nhỏ hơn các mảnh rig; tọa độ vẫn theo ảnh nguồn. */
  readonly texScale?: number;
  /** Góc trên trái của phần đã cắt trong ảnh gốc. */
  readonly origin: Point;
  /** Điểm trong tranh đặt trùng chân nhân vật đứng (giữa hai bàn chân, mặt đất). */
  readonly anchor: Point;
  /** Phóng ảnh gốc của tranh về cỡ người trong rig (so theo khóa thắt lưng). */
  readonly scale: number;
  /** Chỗ tóe tia sáng lúc trúng đòn. */
  readonly burst: Point;
}

/** `attack`: tranh đánh thường, thay nhát chém của hình động nếu nhân vật có. */
export type PoseKind = "attack" | "cast" | "ultimate";

export type Rig = MageRig | WarriorRig;

/** Lớp ảnh của một bộ xương. */
export function partsOf(rig: Rig): readonly string[] {
  return rig.skeleton === "mage"
    ? MAGE_PARTS
    : [
        "body",
        "armR",
        "sword",
        "arm",
        "head",
        ...rig.cloth.map((c) => c.name),
        ...rig.covers.map((c) => c.name),
        ...Object.values(rig.poses ?? {}).map((p) => p.name),
        ...(rig.down ? [rig.down.name] : []),
      ];
}

/** Đào Lam, pháp sư hệ Thủy: bản thử Đ0, tách bằng live2dlayer (xem docs/design/15-ke-hoach-do-hoa.md). */
const DAO_LAM: MageRig = {
  skeleton: "mage",
  dir: "dao-lam",
  texScale: 0.5,
  foot: { x: 495, y: 1010 },
  height: 1000,
  parts: {
    backhair: { x: 198, y: 37, w: 589, h: 712 },
    legs: { x: 413, y: 746, w: 67, h: 186 },
    bottom: { x: 208, y: 336, w: 625, h: 644 },
    boots: { x: 415, y: 810, w: 161, h: 205 },
    top: { x: 187, y: 133, w: 652, h: 642 },
    neck: { x: 463, y: 105, w: 48, h: 72 },
    armL: { x: 555, y: 257, w: 216, h: 352 },
    armR: { x: 221, y: 200, w: 207, h: 319 },
    ribbon: { x: 458, y: 10, w: 281, h: 152 },
    waterL: { x: 183, y: 39, w: 264, h: 413 },
    waterR: { x: 551, y: 110, w: 294, h: 452 },
    gourd: { x: 230, y: 46, w: 175, h: 283 },
    head: { x: 449, y: 44, w: 95, h: 116 },
    eyeL: { x: 503, y: 103, w: 23, h: 14 },
    eyeR: { x: 473, y: 95, w: 23, h: 13 },
  },
  joints: {
    upper: { x: 500, y: 420 },
    armL: { x: 592, y: 292 },
    armR: { x: 410, y: 250 },
    waterL: { x: 360, y: 200 },
    waterR: { x: 628, y: 368 },
    gourd: { x: 358, y: 200 },
    head: { x: 492, y: 166 },
    eyeL: { x: 514, y: 110 },
    eyeR: { x: 484, y: 102 },
  },
  fxColor: 0x9fe3ff,
};

/**
 * Trần Cương, tướng sĩ hệ Kim. Bộ tranh Shan gửi 24/10 (nền đã trong suốt): ảnh đứng tách lớp bằng code, lưỡi đao
 * tách bằng GrabCut, phần thân sau lưỡi vá theo màu áo; ba tranh ra đòn thay cho nhát chém của hình động.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const TRAN_CUONG: WarriorRig = {
  skeleton: "warrior",
  dir: "tran-cuong",
  texScale: 0.5,
  foot: { x: 530, y: 1508 },
  height: 1518,
  parts: {
    body: { x: 56, y: 7, w: 912, h: 1518 },
    armR: { x: 716, y: 538, w: 123, h: 288 },
    sword: { x: 57, y: 661, w: 845, h: 628 },
    arm: { x: 122, y: 346, w: 225, h: 484 },
    head: { x: 418, y: 10, w: 210, h: 239 },
  },
  cloth: [
    { name: "ribbon", box: { x: 299, y: 93, w: 147, h: 133 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 6, freq: 1.7, k: 3.6, phase: 0.4, vertical: true, reverse: true } },
  ],
  covers: [{ name: "pauldron", box: { x: 223, y: 262, w: 168, h: 103 } }],
  joints: {
    shoulder: { x: 282, y: 358 },
    elbowR: { x: 775, y: 555 },
    neck: { x: 530, y: 240 },
  },
  blade: [{ x: 290, y: 860 }, { x: 905, y: 1288 }],
  fxColor: 0xffd27a,
  // Ba tranh ra đòn: chém ngang thấp (đánh thường), chém vươn (ra chiêu), giơ đao bổ xuống (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 1 / 3, origin: { x: 18, y: 10 },
      anchor: { x: 660, y: 1100 }, scale: 1.06, burst: { x: 1355, y: 1000 } },
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 31, y: 7 },
      anchor: { x: 620, y: 1100 }, scale: 1, burst: { x: 1382, y: 555 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 10, y: 5 },
      anchor: { x: 640, y: 1190 }, scale: 1.1, burst: { x: 1273, y: 482 } },
  },
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 8, y: 40 },
    anchor: { x: 780, y: 940 }, scale: 1 },
};

/**
 * Đinh Bộ Lĩnh, nhân vật chính, bản tướng quân. Ảnh Shan gửi đã có nền trong suốt; tách lớp bằng code như
 * Trần Cương. Áo choàng và dải buộc tóc bay theo gió từ phía vai và búi tóc. Hệ tọa độ: ảnh 1024×1536.
 */
const DINH_BO_LINH: WarriorRig = {
  skeleton: "warrior",
  dir: "dinh-bo-linh",
  texScale: 0.5,
  foot: { x: 600, y: 1492 },
  height: 1500,
  parts: {
    body: { x: 17, y: 1, w: 958, h: 1516 },
    armR: { x: 830, y: 524, w: 135, h: 300 },
    sword: { x: 17, y: 586, w: 469, h: 784 },
    arm: { x: 312, y: 495, w: 163, h: 304 },
    head: { x: 545, y: 8, w: 183, h: 260 },
  },
  cloth: [
    {
      name: "ribbon",
      box: { x: 298, y: 67, w: 281, h: 256 },
      wind: { axis: "x", start: 0.2, amp: 14, freq: 1.8, k: 4.5, phase: 0.3, vertical: true, reverse: true },
      behind: true,
    },
    {
      name: "cape",
      box: { x: 56, y: 387, w: 340, h: 624 },
      wind: { axis: "x", start: 0.15, amp: 16, freq: 1.2, k: 3.2, phase: 1.4, vertical: true, reverse: true },
      behind: true,
    },
    {
      name: "sash",
      box: { x: 640, y: 610, w: 84, h: 405 },
      wind: { axis: "y", start: 0.15, amp: 5, freq: 1.3, k: 2.6, phase: 2.1 },
    },
  ],
  covers: [{ name: "sleeve", box: { x: 384, y: 380, w: 122, h: 126 } }],
  joints: {
    shoulder: { x: 430, y: 470 },
    elbowR: { x: 855, y: 555 },
    neck: { x: 630, y: 262 },
  },
  blade: [
    { x: 300, y: 815 },
    { x: 30, y: 1360 },
  ],
  fxColor: 0xffc46b,
  // Hai tranh tư thế Shan gửi, nền tách bằng rembg (isnet-anime).
  poses: {
    cast: {
      name: "pose-cast",
      origin: { x: 0, y: 11 },
      anchor: { x: 670, y: 1005 },
      scale: 1.17,
      burst: { x: 1520, y: 240 },
    },
    ultimate: {
      name: "pose-ultimate",
      origin: { x: 0, y: 55 },
      anchor: { x: 735, y: 1530 },
      scale: 1.02,
      burst: { x: 1050, y: 1460 },
    },
  },
  // Nền ô vuông vẽ sẵn tách bằng rembg; cỡ so theo khóa thắt lưng (73 px đứng, 85 px nằm).
  down: {
    name: "pose-down",
    origin: { x: 10, y: 42 },
    anchor: { x: 850, y: 865 },
    scale: 0.86,
  },
};

/** Nguyễn Bặc, tướng sĩ Hỏa. Mảnh vá từ ảnh phẳng; tọa độ ráp 1024×1536. */
const NGUYEN_BAC: WarriorRig = {
  skeleton: "warrior",
  dir: "nguyenBac",
  texScale: 0.5,
  foot: { x: 620, y: 1518 },
  height: 1518,
  parts: {
    body: { x: 235, y: 178, w: 774, h: 1344 },
    head: { x: 488, y: 3, w: 230, h: 280 },
    arm: { x: 259, y: 446, w: 200, h: 358 },
    armR: { x: 821, y: 486, w: 162, h: 342 },
    sword: { x: 18, y: 614, w: 412, h: 740 },
  },
  joints: {
    shoulder: { x: 411, y: 470 },
    elbowR: { x: 850, y: 525 },
    neck: { x: 598, y: 245 },
  },
  cloth: [
    { name: "cape", box: { x: 41, y: 466, w: 316, h: 682 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 6, freq: 1.2, k: 3.2, phase: 1.4, reverse: true, vertical: true } },
    { name: "ribbon", box: { x: 253, y: 99, w: 264, h: 282 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 6, freq: 1.8, k: 4.5, phase: 0.3, reverse: true, vertical: true } },
    { name: "sash", box: { x: 604, y: 579, w: 152, h: 576 },
      wind: { axis: "y", start: 0.25, amp: 2, freq: 1.3, k: 2.6, phase: 2.1 } },
  ],
  covers: [{ name: "shoulder", box: { x: 335, y: 264, w: 146, h: 242 } }],
  blade: [{ x: 295, y: 825 }, { x: 20, y: 1350 }],
  fxColor: 0xff783d,
  down: {
    name: "pose-ko", texScale: 1 / 3,
    origin: { x: 9, y: 63 }, anchor: { x: 850, y: 980 },
    scale: 1,
  },
  poses: {
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 13, y: 6 }, anchor: { x: 810, y: 1020 }, scale: 1.25, burst: { x: 1500, y: 245 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 13, y: 10 }, anchor: { x: 650, y: 1006 }, scale: 1.25, burst: { x: 1500, y: 30 } },
  },
};

/** Đinh Điền, binh lính hệ Thổ. Tọa độ giữ nguyên theo ảnh nguồn 1024×1536. */
const DINH_DIEN: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "dinh-dien",
  texScale: 0.5,
  foot: { x: 560, y: 1508 },
  height: 1510,
  parts: {
    body: { x: 206, y: 65, w: 808, h: 1447 },
    armR: { x: 711, y: 439, w: 304, h: 562 },
    sword: { x: 44, y: 3, w: 246, h: 1418 },
    arm: { x: 164, y: 490, w: 198, h: 188 },
    head: { x: 402, y: 65, w: 276, h: 252 }
  },
  cloth: [
    {
      name: "ribbon",
      box: { x: 285, y: 181, w: 122, h: 146 },
      wind: { axis: "x", start: 0.2, amp: 3, freq: 1.4, k: 2.6, phase: 0.0, reverse: true, vertical: true },
      behind: true
    },
    {
      name: "sash",
      box: { x: 350, y: 623, w: 188, h: 268 },
      wind: { axis: "y", start: 0.2, amp: 3, freq: 1.4, k: 2.6, phase: 0.7 }
    },
    {
      name: "plume",
      box: { x: 587, y: 704, w: 252, h: 330 },
      wind: { axis: "y", start: 0.2, amp: 3, freq: 1.4, k: 2.6, phase: 1.4 },
      overArms: true
    }
  ],
  covers: [
    {
      name: "sleeve",
      box: { x: 258, y: 400, w: 118, h: 158 }
    }
  ],
  joints: {
    shoulder: { x: 331, y: 518 },
    elbowR: { x: 767, y: 489 },
    neck: { x: 529, y: 301 }
  },
  blade: [
    { x: 180, y: 240 },
    { x: 145, y: 4 }
  ],
  fxColor: 0xd9ad65,
  poses: {
    cast: {
      origin: { x: 75, y: 13 },
      scale: 0.95,
      texScale: 1 / 3,
      name: "pose-cast",
      anchor: { x: 615, y: 1005 },
      burst: { x: 1510, y: 244 }
    },
    ultimate: {
      origin: { x: 35, y: 11 },
      scale: 0.95,
      texScale: 1 / 3,
      name: "pose-ultimate",
      anchor: { x: 803, y: 1000 },
      burst: { x: 1380, y: 750 }
    }
  },
  down: {
    origin: { x: 127, y: 5 },
    scale: 0.95,
    texScale: 1 / 3,
    name: "pose-down",
    anchor: { x: 725, y: 1004 }
  }
};

/** Lưu Cơ, mưu sĩ hệ Kim. Dùng khớp vai của rig tướng sĩ với nhịp phẩy quạt riêng. */
const LUU_CO: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  sleeveWind: { axis: "y", start: 0.38, amp: 4, freq: 1.3, k: 2.7, phase: 0.3 },
  dir: "luu-co",
  texScale: 0.5,
  foot: { x: 611, y: 1505 },
  height: 1502,
  parts: {
    body: { x: 76, y: 10, w: 900, h: 1502 },
    armR: { x: 752, y: 423, w: 216, h: 645 },
    sword: { x: 19, y: 275, w: 351, h: 456 },
    arm: { x: 93, y: 373, w: 396, h: 598 },
    head: { x: 468, y: 10, w: 212, h: 244 },
  },
  cloth: [
    { name: "ribbon", box: { x: 259, y: 123, w: 273, h: 160 }, wind: { axis: "x", start: 0.2, amp: 4, freq: 1.5, k: 3.0, phase: 0.2, reverse: true, vertical: true }, behind: true },
    { name: "sash", box: { x: 218, y: 696, w: 298, h: 363 }, wind: { axis: "y", start: 0.18, amp: 3, freq: 1.2, k: 2.8, phase: 1.3 } },
    { name: "apron", box: { x: 506, y: 798, w: 74, h: 563 }, wind: { axis: "y", start: 0.2, amp: 2, freq: 1.4, k: 2.6, phase: 2.1 } },
  ],
  covers: [{ name: "sleeve", box: { x: 347, y: 263, w: 162, h: 152 } }],
  joints: {
    shoulder: { x: 436, y: 392 },
    elbowR: { x: 775, y: 470 },
    neck: { x: 599, y: 243 },
  },
  blade: [{ x: 276, y: 558 }, { x: 140, y: 335 }],
  fxColor: 0xf0cf8a,
  poses: {
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 10, y: 30 }, anchor: { x: 620, y: 1513 }, scale: 1, burst: { x: 150, y: 170 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 8, y: 13 }, anchor: { x: 565, y: 1510 }, scale: 1, burst: { x: 947, y: 80 } },
  },
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 40, y: 37 }, anchor: { x: 850, y: 1007 }, scale: 1 },
};

/** Trịnh Tú, y sư hệ Mộc. Khớp trong ảnh nguồn 1024×1536, hồ lô có điểm cầm riêng. */
const TRINH_TU: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 167, y: 414 },
  dir: "trinh-tu",
  texScale: 0.5,
  foot: { x: 583, y: 1510 },
  height: 1509,
  parts: {
    body: { x: 263, y: 15, w: 691, h: 1509 },
    armR: { x: 795, y: 483, w: 174, h: 347 },
    sword: { x: 60, y: 276, w: 228, h: 394 },
    arm: { x: 124, y: 366, w: 314, h: 177 },
    head: { x: 553, y: 15, w: 177, h: 219 },
  },
  cloth: [
    { name: "ribbon", box: { x: 348, y: 70, w: 207, h: 194 }, wind: { axis: "x", start: 0.18, amp: 4, freq: 1.6, k: 3.0, phase: 0.2, reverse: true, vertical: true }, behind: true },
    { name: "cape", box: { x: 106, y: 740, w: 327, h: 384 }, wind: { axis: "y", start: 0.2, amp: 4, freq: 1.2, k: 2.8, phase: 1.3 }, behind: true },
    { name: "apron", box: { x: 354, y: 631, w: 263, h: 444 }, wind: { axis: "y", start: 0.2, amp: 2, freq: 1.4, k: 2.6, phase: 2.1 } },
  ],
  covers: [
    { name: "sleeve", box: { x: 331, y: 356, w: 111, h: 92 } },
    { name: "sleeveR", box: { x: 786, y: 488, w: 127, h: 102 } },
  ],
  joints: {
    shoulder: { x: 416, y: 399 },
    elbowR: { x: 849, y: 557 },
    neck: { x: 613, y: 232 },
  },
  blade: [{ x: 167, y: 414 }, { x: 157, y: 285 }],
  fxColor: 0x9bd777,
  poses: {
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 43, y: 45 }, anchor: { x: 690, y: 1508 }, scale: 1, burst: { x: 170, y: 165 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 12, y: 57 }, anchor: { x: 680, y: 1508 }, scale: 1, burst: { x: 220, y: 225 } },
  },
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 23, y: 36 }, anchor: { x: 920, y: 1000 }, scale: 1 },
};

/** Lê Hoàn, quân sư hệ Lôi. Cờ lệnh và tay trái dùng nhịp đẩy của giáo; hai tà áo cùng dải buộc tóc bay phía sau. */
const LE_HOAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "le-hoan",
  texScale: 0.5,
  foot: { x: 650, y: 1513 },
  height: 1505,
  parts: {
    body: { x: 10, y: 9, w: 960, h: 1506 },
    armR: { x: 744, y: 370, w: 266, h: 300 },
    sword: { x: 51, y: 8, w: 484, h: 762 },
    arm: { x: 190, y: 340, w: 415, h: 340 },
    head: { x: 552, y: 9, w: 215, h: 226 },
  },
  cloth: [
    {
      name: "ribbon",
      box: { x: 527, y: 83, w: 97, h: 146 },
      wind: { axis: "x", start: 0.2, amp: 4, freq: 1.6, k: 3, phase: 0.2, reverse: true, vertical: true },
      behind: true,
    },
    {
      name: "cape",
      box: { x: 9, y: 535, w: 495, h: 704 },
      wind: { axis: "y", start: 0.18, amp: 4, freq: 1.2, k: 2.8, phase: 1.1 },
      behind: true,
    },
    {
      name: "capeR",
      box: { x: 695, y: 432, w: 293, h: 786 },
      wind: { axis: "y", start: 0.2, amp: 3, freq: 1.35, k: 2.7, phase: 2 },
      behind: true,
    },
  ],
  covers: [
    { name: "sleeve", box: { x: 409, y: 245, w: 196, h: 175 } },
    { name: "sleeveR", box: { x: 690, y: 225, w: 216, h: 230 } },
  ],
  joints: {
    shoulder: { x: 520, y: 330 },
    elbowR: { x: 820, y: 420 },
    neck: { x: 650, y: 220 },
  },
  blade: [{ x: 235, y: 470 }, { x: 145, y: 12 }],
  fxColor: 0xb98cff,
  poses: {
    cast: {
      name: "pose-cast",
      texScale: 1 / 3,
      origin: { x: 0, y: 0 },
      anchor: { x: 640, y: 1495 },
      scale: 1,
      burst: { x: 55, y: 25 },
    },
    ultimate: {
      name: "pose-ultimate",
      texScale: 1 / 3,
      origin: { x: 0, y: 0 },
      anchor: { x: 620, y: 1505 },
      scale: 1,
      burst: { x: 985, y: 380 },
    },
  },
  down: {
    name: "pose-down",
    texScale: 1 / 3,
    origin: { x: 11, y: 10 },
    anchor: { x: 800, y: 1005 },
    scale: 0.8,
  },
};

/** Đinh Liễn, pháp sư hệ Thủy. Tọa độ theo tranh 1024×1536; nâng pháp trượng nhẹ từ vai. */
const DINH_LIEN: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "dinh-lien",
  texScale: 0.5,
  foot: { x: 625, y: 1508 },
  height: 1513,
  parts: {
    body: { x: 251, y: 10, w: 770, h: 1513 },
    armR: { x: 820, y: 518, w: 193, h: 101 },
    sword: { x: 33, y: 91, w: 245, h: 445 },
    arm: { x: 5, y: 314, w: 488, h: 556 },
    head: { x: 546, y: 10, w: 203, h: 217 },
  },
  cloth: [
    { name: "ribbon", box: { x: 272, y: 81, w: 318, h: 204 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 5, freq: 1.6, k: 2.8, phase: 0.3, vertical: true, reverse: true } },
    { name: "cape", box: { x: 10, y: 588, w: 553, h: 669 }, behind: true,
      wind: { axis: "y", start: 0.2, amp: 4, freq: 1.2, k: 2.8, phase: 1.2 } },
    { name: "sash", box: { x: 461, y: 551, w: 196, h: 268 },
      wind: { axis: "y", start: 0.2, amp: 2, freq: 1.35, k: 2.8, phase: 2.1 } },
  ],
  covers: [{ name: "sleeve", box: { x: 400, y: 223, w: 138, h: 140 } }],
  joints: {
    shoulder: { x: 465, y: 330 },
    elbowR: { x: 846, y: 550 },
    neck: { x: 645, y: 211 },
  },
  blade: [{ x: 193, y: 369 }, { x: 95, y: 155 }],
  fxColor: 0x9fe3ff,
  poses: {
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 0, y: 66 },
      anchor: { x: 555, y: 1465 }, scale: 1, burst: { x: 920, y: 174 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 11, y: 10 },
      anchor: { x: 620, y: 1505 }, scale: 1, burst: { x: 450, y: 75 } },
  },
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 12, y: 12 },
    anchor: { x: 930, y: 945 }, scale: 0.88 },
};

/** Trần Lãm, quân sư hệ Thủy. Cờ lệnh đẩy nhẹ; tọa độ theo tranh 1024×1536. */
const TRAN_LAM: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "tran-lam",
  texScale: 0.5,
  foot: { x: 610, y: 1508 },
  height: 1505,
  parts: {
    body: { x: 27, y: 43, w: 980, h: 1472 },
    armR: { x: 817, y: 435, w: 190, h: 222 },
    sword: { x: 15, y: 12, w: 332, h: 1393 },
    arm: { x: 256, y: 502, w: 115, h: 133 },
    head: { x: 457, y: 43, w: 225, h: 305 },
  },
  cloth: [
    { name: "ribbon", box: { x: 321, y: 86, w: 187, h: 182 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 4, freq: 1.6, k: 2.8, phase: 0.3, vertical: true, reverse: true } },
    { name: "sash", box: { x: 505, y: 575, w: 88, h: 368 },
      wind: { axis: "y", start: 0.2, amp: 2, freq: 1.3, k: 2.6, phase: 1.4 } },
  ],
  covers: [{ name: "sleeve", box: { x: 296, y: 344, w: 148, h: 197 } }],
  joints: {
    shoulder: { x: 365, y: 505 },
    elbowR: { x: 825, y: 545 },
    neck: { x: 554, y: 270 },
  },
  blade: [{ x: 300, y: 550 }, { x: 287, y: 18 }],
  fxColor: 0x7fcaff,
  poses: {
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 13, y: 3 },
      anchor: { x: 650, y: 1510 }, scale: 1, burst: { x: 100, y: 50 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 7, y: 18 },
      anchor: { x: 645, y: 1510 }, scale: 1, burst: { x: 960, y: 220 } },
  },
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 36, y: 99 },
    anchor: { x: 955, y: 910 }, scale: 1 },
};

/** Phạm Bạch Hổ, tướng sĩ hệ Hỏa. Tách lớp từ tranh 1024×1536, áo choàng lông hổ bay sau tay đao. */
const PHAM_BACH_HO: WarriorRig = {
  skeleton: "warrior",
  dir: "pham-bach-ho",
  texScale: 0.5,
  foot: { x: 650, y: 1510 },
  height: 1511,
  parts: {
    body: { x: 93, y: 10, w: 929, h: 1511 },
    armR: { x: 819, y: 403, w: 146, h: 222 },
    sword: { x: 3, y: 580, w: 481, h: 757 },
    arm: { x: 272, y: 382, w: 234, h: 385 },
    head: { x: 573, y: 10, w: 206, h: 226 },
  },
  cloth: [
    { name: "ribbon", box: { x: 219, y: 62, w: 433, h: 306 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 6, freq: 1.6, k: 3, phase: 0.3, vertical: true, reverse: true } },
    { name: "cape", box: { x: 151, y: 312, w: 415, h: 844 }, behind: true,
      wind: { axis: "y", start: 0.2, amp: 4, freq: 1.2, k: 2.8, phase: 1.4 } },
    { name: "apron", box: { x: 315, y: 850, w: 321, h: 193 },
      wind: { axis: "y", start: 0.3, amp: 2, freq: 1.35, k: 2.6, phase: 2.1 } },
  ],
  covers: [{ name: "sleeve", box: { x: 353, y: 301, w: 183, h: 126 } }],
  joints: {
    shoulder: { x: 440, y: 400 },
    elbowR: { x: 905, y: 450 },
    neck: { x: 685, y: 207 },
  },
  blade: [{ x: 315, y: 780 }, { x: 10, y: 1330 }],
  fxColor: 0xff913f,
  poses: {
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 29, y: 67 },
      anchor: { x: 710, y: 1006 }, scale: 1.12, burst: { x: 1500, y: 90 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 37, y: 9 },
      anchor: { x: 800, y: 1010 }, scale: 1, burst: { x: 1440, y: 430 } },
  },
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 21, y: 61 },
    anchor: { x: 910, y: 965 }, scale: 1 },
};

/** Ngô Xương Xí, mưu sĩ hệ Kim. Quạt lông và tay áo dùng nhịp phẩy nhẹ, tọa độ tranh 1024×1536. */
const NGO_XUONG_XI: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  sleeveWind: { axis: "y", start: 0.4, amp: 2, freq: 1.3, k: 2.7, phase: 0.4 },
  dir: "ngo-xuong-xi",
  texScale: 0.5,
  foot: { x: 610, y: 1510 },
  height: 1513,
  parts: {
    body: { x: 37, y: 11, w: 977, h: 1513 },
    armR: { x: 813, y: 502, w: 118, h: 117 },
    sword: { x: 15, y: 87, w: 358, h: 450 },
    arm: { x: 140, y: 331, w: 434, h: 503 },
    head: { x: 575, y: 11, w: 190, h: 205 },
  },
  cloth: [
    { name: "ribbon", box: { x: 408, y: 105, w: 211, h: 204 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 4, freq: 1.5, k: 3, phase: 0.3, vertical: true, reverse: true } },
    { name: "train", box: { x: 27, y: 826, w: 327, h: 341 }, behind: true,
      wind: { axis: "y", start: 0.2, amp: 3, freq: 1.2, k: 2.8, phase: 1.4 } },
    { name: "sash", box: { x: 563, y: 674, w: 88, h: 190 },
      wind: { axis: "y", start: 0.2, amp: 2, freq: 1.35, k: 2.6, phase: 2.1 } },
  ],
  covers: [{ name: "sleeve", box: { x: 400, y: 280, w: 195, h: 122 } }],
  joints: {
    shoulder: { x: 520, y: 365 },
    elbowR: { x: 881, y: 546 },
    neck: { x: 686, y: 200 },
  },
  blade: [{ x: 324, y: 385 }, { x: 130, y: 160 }],
  fxColor: 0xf1d28c,
  poses: {
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 11, y: 10 },
      anchor: { x: 610, y: 1510 }, scale: 1, burst: { x: 190, y: 230 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 11, y: 34 },
      anchor: { x: 595, y: 1485 }, scale: 1.02, burst: { x: 965, y: 365 } },
  },
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 13, y: 13 },
    anchor: { x: 940, y: 985 }, scale: 1 },
};

/**
 * Kiều Công Hãn, sứ quân Phong Châu, pháp sư hệ Lôi. Bộ tranh Shan gửi 24/10: ảnh đứng tách lớp bằng code (trượng
 * cùng bàn tay cầm, bàn tay vươn, đầu, dải khăn), phần thân sau trượng vá bằng inpaint. Tranh đánh thường và tuyệt
 * chiêu có nền ca-rô vẽ sẵn, đã tách nền bằng code. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const KIEU_CONG_HAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "kieu-cong-han",
  texScale: 0.5,
  foot: { x: 560, y: 1476 },
  height: 1390,
  parts: {
    body: { x: 55, y: 79, w: 959, h: 1409 },
    armR: { x: 812, y: 149, w: 194, h: 230 },
    sword: { x: 104, y: 140, w: 183, h: 661 },
    arm: { x: 196, y: 440, w: 107, h: 155 },
    head: { x: 454, y: 90, w: 174, h: 217 },
  },
  cloth: [
    { name: "ribbon", box: { x: 57, y: 210, w: 279, h: 184 }, behind: true,
      wind: { axis: "x", start: 0.15, amp: 7, freq: 1.6, k: 3.2, phase: 0.5, vertical: true, reverse: true } },
  ],
  covers: [],
  // Tay và trượng xoay quanh cổ tay, chỗ ống tay áo che.
  joints: {
    shoulder: { x: 262, y: 575 },
    elbowR: { x: 840, y: 350 },
    neck: { x: 545, y: 290 },
  },
  blade: [{ x: 240, y: 470 }, { x: 226, y: 199 }],
  orb: { x: 226, y: 199 },
  strikeFx: "lightning",
  fxColor: 0xb98cff,
  // Đẩy trượng phóng sét (đánh thường), thế tấn vung trượng (ra chiêu), giơ trượng qua đầu gọi sét (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 36, y: 10 },
      anchor: { x: 640, y: 1185 }, scale: 1, burst: { x: 1238, y: 368 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 8, y: 9 },
      anchor: { x: 735, y: 1170 }, scale: 1, burst: { x: 62, y: 72 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 16, y: 5 },
      anchor: { x: 490, y: 1505 }, scale: 1.05, burst: { x: 812, y: 62 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 21, y: 67 },
    anchor: { x: 760, y: 960 }, scale: 0.9 },
};

/**
 * Nguyễn Khoan, sứ quân Tam Đái, binh lính hệ Thổ. Bộ tranh Shan gửi 24/10 (nền đã trong suốt): ảnh đứng tách lớp
 * bằng code. Giáo cùng nắm tay xoay quanh cổ tay; khiên mây là lớp tay không, nâng lên khi vào thế và đỡ đòn,
 * phần thân sau khiên vá bằng ảnh đối xứng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const NGUYEN_KHOAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "nguyen-khoan",
  texScale: 0.5,
  foot: { x: 560, y: 1480 },
  height: 1375,
  parts: {
    body: { x: 144, y: 110, w: 799, h: 1380 },
    armR: { x: 700, y: 435, w: 290, h: 524 },
    sword: { x: 53, y: 9, w: 100, h: 1489 },
    arm: { x: 82, y: 543, w: 97, h: 112 },
    head: { x: 392, y: 113, w: 187, h: 236 },
  },
  cloth: [
    { name: "ribbon", box: { x: 247, y: 205, w: 154, h: 136 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 6, freq: 1.5, k: 3, phase: 0.8, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 165, y: 600 },
    elbowR: { x: 722, y: 650 },
    neck: { x: 500, y: 330 },
  },
  blade: [{ x: 128, y: 600 }, { x: 122, y: 12 }],
  shieldRaise: -0.35,
  strikeFx: "earthWard",
  fxColor: 0xa5772f,
  // Đâm giáo sau khiên (đánh thường), giơ giáo qua đầu trấn thủ (tuyệt chiêu); ra chiêu dùng nhịp đẩy giáo.
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 4, y: 6 },
      anchor: { x: 640, y: 1145 }, scale: 1, burst: { x: 1300, y: 145 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 18, y: 10 },
      anchor: { x: 650, y: 1185 }, scale: 1, burst: { x: 1290, y: 320 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 0, y: 16 },
    anchor: { x: 640, y: 930 }, scale: 0.9 },
};

/**
 * Kiều Thuận, sứ quân Hồi Hồ, y sư hệ Mộc. Bộ tranh Shan gửi 24/10 (nền đã trong suốt): ảnh đứng tách lớp bằng
 * code. Bàn tay cầm hồ lô xoay quanh cổ tay, hồ lô treo dây lắc quanh nắm tay; bàn tay phải, đầu và dải khăn
 * tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const KIEU_THUAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 150, y: 205 },
  dir: "kieu-thuan",
  texScale: 0.5,
  foot: { x: 560, y: 1500 },
  height: 1490,
  parts: {
    body: { x: 49, y: 0, w: 927, h: 1536 },
    armR: { x: 892, y: 679, w: 116, h: 154 },
    sword: { x: 19, y: 168, w: 182, h: 460 },
    arm: { x: 108, y: 175, w: 163, h: 181 },
    head: { x: 558, y: 12, w: 165, h: 251 },
  },
  cloth: [
    { name: "ribbon", box: { x: 270, y: 101, w: 291, h: 160 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 6, freq: 1.6, k: 3, phase: 0.6, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 240, y: 315 },
    elbowR: { x: 910, y: 705 },
    neck: { x: 640, y: 245 },
  },
  blade: [{ x: 150, y: 205 }, { x: 110, y: 470 }],
  strikeFx: "leafBloom",
  fxColor: 0x4f9a4a,
  // Hồ lô buông thấp kết ấn (đánh thường), ôm hồ lô mở tay (ra chiêu), thế tấn rộng vươn tay về đồng minh (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 62, y: 10 },
      anchor: { x: 680, y: 1165 }, scale: 1.05, burst: { x: 910, y: 340 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 15, y: 5 },
      anchor: { x: 430, y: 1500 }, scale: 1, burst: { x: 930, y: 300 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 17, y: 2 },
      anchor: { x: 665, y: 1170 }, scale: 1.05, burst: { x: 620, y: 410 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 16, y: 75 },
    anchor: { x: 800, y: 930 }, scale: 0.9 },
};

/**
 * Lý Khuê, sứ quân Siêu Loại, tướng sĩ hệ Kim. Bộ tranh Shan gửi 24/10 (nền đã trong suốt, trừ tranh phong thái
 * có nền ca-rô vẽ sẵn đã tách bằng code): ảnh đứng tách lớp bằng code. Cẳng tay và kiếm đồng xoay quanh khuỷu,
 * phần thân sau lưỡi kiếm vá bằng inpaint. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const LY_KHUE: WarriorRig = {
  skeleton: "warrior",
  dir: "ly-khue",
  texScale: 0.5,
  foot: { x: 600, y: 1500 },
  height: 1495,
  parts: {
    body: { x: 10, y: 3, w: 1014, h: 1525 },
    armR: { x: 895, y: 557, w: 110, h: 264 },
    sword: { x: 184, y: 634, w: 624, h: 592 },
    arm: { x: 255, y: 506, w: 171, h: 290 },
    head: { x: 610, y: 11, w: 172, h: 252 },
  },
  cloth: [
    { name: "ribbon", box: { x: 148, y: 85, w: 473, h: 326 }, behind: true,
      wind: { axis: "x", start: 0.15, amp: 8, freq: 1.5, k: 3.2, phase: 0.4, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 350, y: 545 },
    elbowR: { x: 930, y: 590 },
    neck: { x: 715, y: 250 },
  },
  blade: [{ x: 380, y: 800 }, { x: 772, y: 1190 }],
  strikeFx: "armorPierce",
  fxColor: 0x9ea4ad,
  // Thế thủ thấp chém chéo (đánh thường), đâm vươn tay (ra chiêu), lao người đâm xuyên giáp (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 16, y: 3 },
      anchor: { x: 730, y: 1175 }, scale: 1.05, burst: { x: 1150, y: 1000 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 16, y: 7 },
      anchor: { x: 640, y: 985 }, scale: 1.15, burst: { x: 1505, y: 300 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 6, y: 13 },
      anchor: { x: 620, y: 960 }, scale: 1.15, burst: { x: 1505, y: 400 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 6, y: 73 },
    anchor: { x: 780, y: 950 }, scale: 0.9 },
};

/**
 * Nguyễn Thủ Tiệp, sứ quân Tiên Du, mưu sĩ hệ Thủy. Bộ tranh Shan gửi 24/10 (ảnh đứng và tranh đánh thường nền
 * trong suốt sẵn; ra chiêu, tuyệt chiêu, tranh gục và tranh phong thái có nền ca-rô vẽ sẵn, đã tách bằng code).
 * Ảnh đứng tách lớp bằng code: bàn tay cầm quạt lông phẩy quanh cổ tay, bàn tay kết ấn, đầu và dải khăn tách
 * riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const NGUYEN_THU_TIEP: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  dir: "nguyen-thu-tiep",
  texScale: 0.5,
  foot: { x: 650, y: 1505 },
  height: 1500,
  parts: {
    body: { x: 27, y: 10, w: 982, h: 1510 },
    armR: { x: 768, y: 232, w: 111, h: 147 },
    sword: { x: 11, y: 108, w: 338, h: 583 },
    arm: { x: 252, y: 345, w: 87, h: 88 },
    head: { x: 568, y: 10, w: 160, h: 259 },
  },
  cloth: [
    { name: "ribbon", box: { x: 345, y: 140, w: 226, h: 189 }, behind: true,
      wind: { axis: "x", start: 0.15, amp: 7, freq: 1.5, k: 3, phase: 0.7, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 318, y: 395 },
    elbowR: { x: 850, y: 360 },
    neck: { x: 660, y: 262 },
  },
  blade: [{ x: 280, y: 370 }, { x: 120, y: 230 }],
  strikeFx: "supplyDrain",
  fxColor: 0x2f7fc1,
  // Vung quạt thế tấn (đánh thường), thu quạt sát người tay kia đánh lạc hướng (ra chiêu), chỉ tay về tuyến lương
  // đối phương, quạt giữ ngang hông (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 12, y: 2 },
      anchor: { x: 760, y: 1170 }, scale: 1.05, burst: { x: 130, y: 380 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 11, y: 2 },
      anchor: { x: 530, y: 1170 }, scale: 1.05, burst: { x: 1080, y: 290 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 11, y: 5 },
      anchor: { x: 600, y: 1170 }, scale: 1.05, burst: { x: 1170, y: 255 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 14, y: 21 },
    anchor: { x: 800, y: 940 }, scale: 0.9 },
};

/**
 * Lữ Đường, sứ quân Tế Giang, pháp sư hệ Thủy. Bộ tranh Shan gửi 24/10 (nền trong suốt sẵn, trừ tranh tuyệt chiêu
 * và tranh phong thái có nền ca-rô vẽ sẵn, đã tách bằng code). Không có ảnh đứng khổ dọc nên rig tách từ tranh thế
 * tấn 1312×1199: trượng cầu nước cùng nắm tay xoay quanh cổ tay, cầu nước sáng riêng; bàn tay xòe, đầu và dải khăn
 * tách riêng. Hệ tọa độ: ảnh đứng 1312×1199.
 */
const LU_DUONG: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "lu-duong",
  texScale: 0.5,
  foot: { x: 710, y: 1180 },
  height: 1180,
  parts: {
    body: { x: 34, y: 3, w: 1277, h: 1194 },
    armR: { x: 1142, y: 202, w: 137, h: 119 },
    sword: { x: 45, y: 25, w: 441, h: 758 },
    arm: { x: 272, y: 398, w: 81, h: 85 },
    head: { x: 705, y: 19, w: 118, h: 212 },
  },
  cloth: [
    { name: "ribbon", box: { x: 470, y: 45, w: 231, h: 166 }, behind: true,
      wind: { axis: "x", start: 0.15, amp: 7, freq: 1.5, k: 3, phase: 0.9, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 330, y: 440 },
    elbowR: { x: 1150, y: 265 },
    neck: { x: 760, y: 220 },
  },
  blade: [{ x: 300, y: 440 }, { x: 135, y: 100 }],
  orb: { x: 135, y: 100 },
  strikeFx: "waterPillar",
  fxColor: 0x2f7fc1,
  // Chĩa trượng thẳng tới (đánh thường), dựng trượng đẩy ấn (ra chiêu), vung trượng ngang chỉ thế nước (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 41, y: 33 },
      anchor: { x: 680, y: 1150 }, scale: 1.05, burst: { x: 1240, y: 150 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 8, y: 3 },
      anchor: { x: 650, y: 1165 }, scale: 1, burst: { x: 1166, y: 146 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 19, y: 95 },
      anchor: { x: 670, y: 1090 }, scale: 1.12, burst: { x: 66, y: 204 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 15, y: 63 },
    anchor: { x: 1000, y: 870 }, scale: 0.85 },
};

/**
 * Nguyễn Siêu, sứ quân Tây Phù Liệt, binh lính hệ Hỏa. Bộ tranh Shan gửi 24/10 (nền trong suốt sẵn, trừ tranh gục
 * và tranh phong thái cạnh cột cờ có nền ca-rô vẽ sẵn, tách bằng code). Ảnh đứng tách lớp như Nguyễn Khoan: giáo
 * có cờ đuôi nheo cùng nắm tay xoay quanh cổ tay, khiên mây là lớp tay không nâng lên khi vào thế và đỡ đòn.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const NGUYEN_SIEU: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "nguyen-sieu",
  texScale: 0.5,
  foot: { x: 530, y: 1490 },
  height: 1340,
  parts: {
    body: { x: 151, y: 172, w: 786, h: 1351 },
    armR: { x: 760, y: 515, w: 253, h: 566 },
    sword: { x: 66, y: 8, w: 242, h: 1480 },
    arm: { x: 184, y: 598, w: 101, h: 119 },
    head: { x: 480, y: 172, w: 195, h: 231 },
  },
  cloth: [
    { name: "ribbon", box: { x: 288, y: 260, w: 209, h: 180 }, behind: true,
      wind: { axis: "x", start: 0.15, amp: 7, freq: 1.6, k: 3, phase: 1.1, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 262, y: 655 },
    elbowR: { x: 790, y: 640 },
    neck: { x: 560, y: 395 },
  },
  blade: [{ x: 230, y: 650 }, { x: 282, y: 20 }],
  shieldRaise: -0.35,
  strikeFx: "flameWall",
  fxColor: 0xd9502a,
  // Đâm giáo sau khiên (đánh thường), thế thủ giơ khiên trấn lũy (tuyệt chiêu); ra chiêu dùng nhịp đẩy giáo.
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 17, y: 14 },
      anchor: { x: 680, y: 955 }, scale: 1.1, burst: { x: 1495, y: 110 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 99, y: 2 },
      anchor: { x: 680, y: 1120 }, scale: 1.1, burst: { x: 1120, y: 510 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 17, y: 87 },
    anchor: { x: 760, y: 900 }, scale: 0.9 },
};

/**
 * Đỗ Cảnh Thạc, sứ quân Đỗ Động (trùm chiến dịch), tướng sĩ hệ Thổ. Bộ tranh Shan gửi 24/10 (ảnh đứng nền trong
 * suốt sẵn; bốn tranh ra đòn, tranh gục và tranh phong thái trên thuyền có nền ca-rô vẽ sẵn, tách bằng code). Ảnh
 * đứng tách lớp bằng code: cẳng tay bọc giáp cùng chùy vuông xoay quanh khuỷu theo nhịp chém, cẳng tay trái, đầu và
 * dải khăn tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const DO_CANH_THAC: WarriorRig = {
  skeleton: "warrior",
  dir: "do-canh-thac",
  texScale: 0.5,
  foot: { x: 630, y: 1480 },
  height: 1440,
  parts: {
    body: { x: 11, y: 18, w: 997, h: 1500 },
    armR: { x: 866, y: 598, w: 148, h: 281 },
    sword: { x: 19, y: 351, w: 407, h: 1045 },
    arm: { x: 168, y: 500, w: 211, h: 323 },
    head: { x: 578, y: 48, w: 162, h: 219 },
  },
  cloth: [
    { name: "ribbon", box: { x: 345, y: 79, w: 244, h: 127 }, behind: true,
      wind: { axis: "x", start: 0.15, amp: 7, freq: 1.5, k: 3, phase: 1.3, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 285, y: 525 },
    elbowR: { x: 890, y: 615 },
    neck: { x: 660, y: 262 },
  },
  blade: [{ x: 240, y: 780 }, { x: 240, y: 1200 }],
  strikeFx: "groundSlam",
  fxColor: 0xa5772f,
  // Quét chùy thấp hai tay (đánh thường), một tay vung chùy ngang (ra chiêu), giơ chùy qua vai bổ xuống (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 22, y: 29 },
      anchor: { x: 650, y: 1150 }, scale: 1.2, burst: { x: 1152, y: 948 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 4, y: 3 },
      anchor: { x: 850, y: 965 }, scale: 1.25, burst: { x: 154, y: 461 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 33, y: 3 },
      anchor: { x: 715, y: 1130 }, scale: 1.2, burst: { x: 219, y: 204 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 11, y: 17 },
    anchor: { x: 850, y: 880 }, scale: 0.9 },
};

/**
 * Chu Ngân, pháp sư hệ Kim (tướng cửa hàng). Bộ tranh Shan gửi 24/10 (ảnh đứng, đánh thường, ra chiêu nền trong
 * suốt sẵn; tuyệt chiêu, tranh gục và tranh phong thái bên voi có nền ca-rô vẽ sẵn, tách bằng code). Tranh đánh
 * thường vẽ quay sang trái nên được lật ngang cho cùng hướng các tranh khác. Ảnh đứng tách lớp: trượng đồng ba chuông
 * cùng nắm tay xoay quanh cổ tay, cầu bạc sáng riêng; bàn tay bắt ấn và đầu tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const CHU_NGAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "chu-ngan",
  texScale: 0.5,
  foot: { x: 600, y: 1505 },
  height: 1480,
  parts: {
    body: { x: 7, y: 24, w: 1011, h: 1502 },
    armR: { x: 710, y: 343, w: 109, h: 120 },
    sword: { x: 84, y: 6, w: 250, h: 1511 },
    arm: { x: 170, y: 478, w: 86, h: 95 },
    head: { x: 524, y: 24, w: 180, h: 279 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 240, y: 528 },
    elbowR: { x: 800, y: 440 },
    neck: { x: 625, y: 295 },
  },
  blade: [{ x: 215, y: 520 }, { x: 120, y: 60 }],
  orb: { x: 120, y: 60 },
  strikeFx: "needleVolley",
  fxColor: 0x9ea4ad,
  // Chĩa trượng tới (đánh thường), dựng trượng xòe tay bắt ấn (ra chiêu), hai tay đẩy trượng hướng ống kim (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 11, y: 11 },
      anchor: { x: 540, y: 985 }, scale: 1.25, burst: { x: 1468, y: 85 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 7, y: 9 },
      anchor: { x: 510, y: 1490 }, scale: 1, burst: { x: 930, y: 384 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 67, y: 11 },
      anchor: { x: 730, y: 960 }, scale: 1.25, burst: { x: 1450, y: 77 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 17, y: 51 },
    anchor: { x: 820, y: 900 }, scale: 0.9 },
};

/**
 * Cao Kiên, binh lính hệ Kim (tướng cửa hàng). Bộ tranh Shan gửi 25/10 (ảnh đứng, ra chiêu, đánh thường nền trong
 * suốt sẵn; tuyệt chiêu và tranh gục có nền ca-rô vẽ sẵn, tách bằng code). Tranh đánh thường vẽ mũi giáo chĩa sang
 * trái nên được lật ngang cho đâm về phía đối thủ. Ảnh đứng tách lớp như Nguyễn Khoan: giáo cùng nắm tay xoay quanh
 * cổ tay, khiên mây nâng lên khi vào thế và đỡ đòn, đầu và dải khăn tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const CAO_KIEN: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "cao-kien",
  texScale: 0.5,
  foot: { x: 560, y: 1470 },
  height: 1330,
  parts: {
    body: { x: 63, y: 144, w: 906, h: 1377 },
    armR: { x: 681, y: 538, w: 327, h: 538 },
    sword: { x: 47, y: 9, w: 216, h: 1466 },
    arm: { x: 92, y: 868, w: 108, h: 153 },
    head: { x: 405, y: 144, w: 177, h: 212 },
  },
  cloth: [
    { name: "ribbon", box: { x: 330, y: 227, w: 101, h: 139 }, behind: true,
      wind: { axis: "x", start: 0.15, amp: 6, freq: 1.6, k: 3, phase: 0.2, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 145, y: 945 },
    elbowR: { x: 700, y: 700 },
    neck: { x: 535, y: 352 },
  },
  blade: [{ x: 150, y: 940 }, { x: 210, y: 15 }],
  shieldRaise: -0.35,
  strikeFx: "steelBulwark",
  fxColor: 0x9ea4ad,
  // Đâm giáo (đánh thường), giơ khiên thế thủ (ra chiêu), núp sau khiên giáo chĩa thấp (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 14, y: 17 },
      anchor: { x: 656, y: 965 }, scale: 1.35, burst: { x: 1485, y: 179 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 177, y: 7 },
      anchor: { x: 805, y: 1075 }, scale: 1.3, burst: { x: 1168, y: 405 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 28, y: 15 },
      anchor: { x: 900, y: 970 }, scale: 1.35, burst: { x: 1271, y: 452 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 25, y: 86 },
    anchor: { x: 820, y: 880 }, scale: 0.9 },
};

/**
 * Châu Ngọc, y sư hệ Kim (tướng cửa hàng). Bộ tranh Shan gửi 25/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng
 * code: bàn tay cầm hồ lô sứ xoay quanh cổ tay, hồ lô lắc nhẹ quanh nắm tay; bàn tay buông và đầu tách riêng.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const CHAU_NGOC: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 465, y: 560 },
  dir: "chau-ngoc",
  texScale: 0.5,
  foot: { x: 450, y: 1480 },
  height: 1470,
  parts: {
    body: { x: 129, y: 19, w: 678, h: 1496 },
    armR: { x: 783, y: 675, w: 67, h: 116 },
    sword: { x: 431, y: 485, w: 98, h: 141 },
    arm: { x: 372, y: 510, w: 119, h: 81 },
    head: { x: 425, y: 55, w: 176, h: 201 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 385, y: 545 },
    elbowR: { x: 800, y: 690 },
    neck: { x: 510, y: 250 },
  },
  blade: [{ x: 465, y: 560 }, { x: 480, y: 500 }],
  strikeFx: "silverGrace",
  fxColor: 0x9ea4ad,
  // Gạt tay đỡ, hồ lô giữ bên hông (đánh thường), đưa hồ lô ra trao thuốc (ra chiêu), rút kim châm (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 208, y: 3 },
      anchor: { x: 600, y: 1490 }, scale: 1, burst: { x: 880, y: 300 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 184, y: 9 },
      anchor: { x: 560, y: 1490 }, scale: 1, burst: { x: 880, y: 450 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 19, y: 10 },
      anchor: { x: 600, y: 1480 }, scale: 1, burst: { x: 700, y: 430 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 7, y: 51 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};

/**
 * Tô Kim, mưu sĩ hệ Kim (tướng khởi đầu). Bộ tranh Shan gửi 25/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code:
 * quạt lông đen cùng nắm tay phẩy quanh cổ tay theo nhịp quạt, bàn tay chống hông, đầu và đuôi khăn đen tách riêng.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const TO_KIM: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  dir: "to-kim",
  texScale: 0.5,
  foot: { x: 540, y: 1500 },
  height: 1490,
  parts: {
    body: { x: 186, y: 10, w: 709, h: 1514 },
    armR: { x: 645, y: 585, w: 101, h: 126 },
    sword: { x: 94, y: 221, w: 312, h: 390 },
    arm: { x: 255, y: 478, w: 64, h: 98 },
    head: { x: 465, y: 11, w: 160, h: 252 },
  },
  cloth: [
    { name: "ribbon", box: { x: 370, y: 102, w: 121, h: 229 }, behind: true,
      wind: { axis: "y", start: 0.2, amp: 5, freq: 1.4, k: 2.8, phase: 0.6 } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 285, y: 540 },
    elbowR: { x: 665, y: 610 },
    neck: { x: 560, y: 255 },
  },
  blade: [{ x: 280, y: 500 }, { x: 180, y: 300 }],
  strikeFx: "coinScatter",
  fxColor: 0x9ea4ad,
  // Phẩy quạt thấp ra sau (đánh thường), chỉ tay quạt kề ngực (ra chiêu), thế tấn rộng chỉ tay quạt giơ cao (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 8, y: 8 },
      anchor: { x: 640, y: 1480 }, scale: 1, burst: { x: 90, y: 620 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 2, y: 8 },
      anchor: { x: 400, y: 1480 }, scale: 1, burst: { x: 1006, y: 300 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 1, y: 8 },
      anchor: { x: 510, y: 1490 }, scale: 1, burst: { x: 1012, y: 270 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 13, y: 23 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};

/**
 * Nghiêm Thiết, quân sư hệ Kim (tướng cửa hàng). Bộ tranh Shan gửi 25/10 (nền trong suốt sẵn; tranh ra chiêu gửi trùng
 * tranh đánh thường nên ra chiêu dùng nhịp đẩy cờ của rig). Tranh đánh thường vẽ cờ chĩa sang trái nên được lật ngang.
 * Ảnh đứng tách lớp bằng code: cờ lệnh cùng nắm tay xoay quanh cổ tay theo nhịp giáo như Lê Hoàn, bàn tay cầm thẻ tre
 * và đầu tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const NGHIEM_THIET: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "nghiem-thiet",
  texScale: 0.5,
  foot: { x: 560, y: 1500 },
  height: 1400,
  parts: {
    body: { x: 207, y: 113, w: 798, h: 1409 },
    armR: { x: 745, y: 650, w: 181, h: 225 },
    sword: { x: 25, y: 1, w: 354, h: 1495 },
    arm: { x: 301, y: 568, w: 105, h: 88 },
    head: { x: 521, y: 113, w: 147, h: 223 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 360, y: 610 },
    elbowR: { x: 790, y: 700 },
    neck: { x: 590, y: 330 },
  },
  blade: [{ x: 362, y: 600 }, { x: 362, y: 20 }],
  strikeFx: "ironFormation",
  fxColor: 0x9ea4ad,
  // Chĩa cờ lệnh về phía đối thủ (đánh thường), giơ cao cờ đẩy thẻ tre ra lệnh (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 0, y: 145 },
      anchor: { x: 308, y: 1450 }, scale: 1, burst: { x: 994, y: 440 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 26, y: 4 },
      anchor: { x: 450, y: 1480 }, scale: 1, burst: { x: 930, y: 560 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 34, y: 48 },
    anchor: { x: 1000, y: 820 }, scale: 0.85 },
};

/**
 * Lâm Tùng, tướng sĩ hệ Mộc (tướng cửa hàng). Bộ tranh Shan gửi 25/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng
 * code: cẳng tay xăm tùng cùng kiếm thẳng xoay quanh khuỷu theo nhịp chém, bàn tay trái, đầu và dải khăn xanh tách
 * riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const LAM_TUNG: WarriorRig = {
  skeleton: "warrior",
  dir: "lam-tung",
  texScale: 0.5,
  foot: { x: 590, y: 1500 },
  height: 1500,
  parts: {
    body: { x: 336, y: 0, w: 635, h: 1525 },
    armR: { x: 785, y: 750, w: 100, h: 131 },
    sword: { x: 12, y: 699, w: 389, h: 623 },
    arm: { x: 282, y: 540, w: 114, h: 291 },
    head: { x: 560, y: 36, w: 143, h: 200 },
  },
  cloth: [
    { name: "ribbon", box: { x: 455, y: 23, w: 141, h: 162 }, behind: true,
      wind: { axis: "x", start: 0.15, amp: 7, freq: 1.6, k: 3, phase: 0.3, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 340, y: 560 },
    elbowR: { x: 800, y: 770 },
    neck: { x: 625, y: 230 },
  },
  blade: [{ x: 300, y: 800 }, { x: 20, y: 1300 }],
  strikeFx: "bambooSap",
  fxColor: 0x4f9a4a,
  // Đâm kiếm thẳng (đánh thường), thế tấn chĩa kiếm chéo lên (ra chiêu), giơ kiếm qua đầu bổ xuống (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 12, y: 5 },
      anchor: { x: 460, y: 985 }, scale: 1.35, burst: { x: 1500, y: 260 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 161, y: 11 },
      anchor: { x: 780, y: 985 }, scale: 1.35, burst: { x: 1290, y: 20 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 259, y: 12 },
      anchor: { x: 850, y: 985 }, scale: 1.35, burst: { x: 940, y: 25 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 57, y: 139 },
    anchor: { x: 800, y: 900 }, scale: 0.9 },
};

/** Hình động theo id nhân vật. Nhân vật chưa có hình động thì sân khấu dùng chân dung. */
const RIGS: Readonly<Record<string, Rig>> = {
  daoLam: DAO_LAM,
  tranCuong: TRAN_CUONG,
  dinhBoLinh: DINH_BO_LINH,
  nguyenBac: NGUYEN_BAC,
  dinhDien: DINH_DIEN,
  luuCo: LUU_CO,
  trinhTu: TRINH_TU,
  leHoan: LE_HOAN,
  dinhLien: DINH_LIEN,
  tranLam: TRAN_LAM,
  phamBachHo: PHAM_BACH_HO,
  ngoXuongXi: NGO_XUONG_XI,
  kieuCongHan: KIEU_CONG_HAN,
  nguyenKhoan: NGUYEN_KHOAN,
  kieuThuan: KIEU_THUAN,
  lyKhue: LY_KHUE,
  nguyenThuTiep: NGUYEN_THU_TIEP,
  luDuong: LU_DUONG,
  nguyenSieu: NGUYEN_SIEU,
  doCanhThac: DO_CANH_THAC,
  chuNgan: CHU_NGAN,
  caoKien: CAO_KIEN,
  chauNgoc: CHAU_NGOC,
  toKim: TO_KIM,
  nghiemThiet: NGHIEM_THIET,
  lamTung: LAM_TUNG,
};

export function rigOf(id: string): Rig | null {
  return RIGS[id] ?? null;
}

export function rigIds(): readonly string[] {
  return Object.keys(RIGS);
}

/** Đường dẫn ảnh của một lớp. */
export function partUrl(rig: Rig, part: string): string {
  return `/art/characters/${rig.dir}/${part}.webp`;
}
