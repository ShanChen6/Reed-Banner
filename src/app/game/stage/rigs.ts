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
  readonly weapon?: "spear" | "fan" | "gourd";
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
  readonly poses?: Readonly<Partial<Record<PoseKind, PoseArt>>>;
  /** Tranh bị hạ gục: hết máu thì hình động mờ dần sang tranh này. */
  readonly down?: Omit<PoseArt, "burst">;
}

/**
 * Tranh tư thế vẽ riêng (ra chiêu, tuyệt chiêu): game thay hình động bằng tranh này trong khoảnh khắc ra
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

export type PoseKind = "cast" | "ultimate";

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
 * Trần Cương, tướng sĩ hệ Kim. Tách lớp bằng code từ bản thiết kế phẳng (không có PSD): phần bị tay, kiếm
 * và vạt áo che được vá tạm, nên động tác giữ biên độ vừa phải. Hệ tọa độ: ảnh toàn thân 628×1035.
 */
const TRAN_CUONG: WarriorRig = {
  skeleton: "warrior",
  dir: "tran-cuong",
  texScale: 0.5,
  foot: { x: 400, y: 1018 },
  height: 1035,
  parts: {
    body: { x: 2, y: 0, w: 626, h: 1035 },
    armR: { x: 518, y: 340, w: 103, h: 245 },
    sword: { x: 1, y: 373, w: 249, h: 662 },
    arm: { x: 158, y: 284, w: 159, h: 235 },
    head: { x: 339, y: 8, w: 124, h: 145 },
  },
  cloth: [
    {
      name: "apron",
      box: { x: 392, y: 538, w: 120, h: 270 },
      wind: { axis: "y", start: 0.3, amp: 6, freq: 1.2, k: 2.4, phase: 0.8 },
    },
  ],
  covers: [{ name: "pauldron", box: { x: 204, y: 114, w: 145, h: 189 } }],
  joints: {
    shoulder: { x: 268, y: 262 },
    elbowR: { x: 540, y: 385 },
    neck: { x: 402, y: 150 },
  },
  blade: [
    { x: 225, y: 530 },
    { x: 30, y: 1020 },
  ],
  fxColor: 0xffd27a,
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

/** Hình động theo id nhân vật. Nhân vật chưa có hình động thì sân khấu dùng chân dung. */
const RIGS: Readonly<Record<string, Rig>> = {
  daoLam: DAO_LAM,
  tranCuong: TRAN_CUONG,
  dinhBoLinh: DINH_BO_LINH,
  nguyenBac: NGUYEN_BAC,
  dinhDien: DINH_DIEN,
  luuCo: LUU_CO,
  trinhTu: TRINH_TU,
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
