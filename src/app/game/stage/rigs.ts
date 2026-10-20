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
  readonly dir: string;
  readonly texScale: number;
  readonly foot: Point;
  readonly height: number;
  readonly parts: Readonly<Record<WarriorPart, PartBox>>;
  /** Lớp vải bay theo gió. `behind`: vẽ sau thân (áo choàng, dải buộc tóc), còn lại vẽ ngay trên thân. */
  readonly cloth: readonly { readonly name: string; readonly box: PartBox; readonly wind: Wind; readonly behind?: boolean }[];
  /** Lớp phủ lên tay cầm kiếm (giáp vai, tay áo) để che chỗ nối ở vai. */
  readonly covers: readonly { readonly name: string; readonly box: PartBox }[];
  /** shoulder: vai tay cầm kiếm (cả tay và kiếm xoay quanh đây); elbowR: khuỷu tay không; neck: cổ. */
  readonly joints: Readonly<Record<"shoulder" | "elbowR" | "neck", Point>>;
  /** Chuôi và mũi kiếm lúc đứng yên, để đặt hào quang dọc lưỡi. */
  readonly blade: readonly [Point, Point];
  readonly fxColor: number;
  readonly poses?: Readonly<Partial<Record<PoseKind, PoseArt>>>;
  /** Cẳng tay rời: đao đi theo khuỷu tay, bắp tay vẫn xoay quanh vai. */
  readonly forearms?: {
    readonly sword: { readonly box: PartBox; readonly joint: Point };
    readonly free: { readonly box: PartBox; readonly joint: Point };
  };
}

/**
 * Tranh tư thế vẽ riêng (ra chiêu, tuyệt chiêu): game thay hình động bằng tranh này trong khoảnh khắc ra
 * đòn. Tọa độ theo ảnh gốc của tranh; ảnh xuất ra đã cắt sát và thu nhỏ theo texScale của rig.
 */
export interface PoseArt {
  readonly name: string;
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
        ...(rig.forearms ? ["forearm", "forearmR"] : []),
        ...rig.cloth.map((c) => c.name),
        ...rig.covers.map((c) => c.name),
        ...Object.values(rig.poses ?? {}).map((p) => p.name),
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
};

/** Nguyễn Bặc, tướng sĩ Hỏa. Mảnh vá từ ảnh phẳng; tọa độ ráp 1024×1536. */
const NGUYEN_BAC: WarriorRig = {
  skeleton: "warrior",
  dir: "nguyenBac",
  texScale: 0.5,
  foot: { x: 650, y: 1518 },
  height: 1518,
  parts: {
    body: { x: 340, y: 210, w: 654, h: 1308 },
    head: { x: 565, y: 30, w: 224, h: 273 },
    arm: { x: 345, y: 400, w: 270, h: 146 },
    armR: { x: 750, y: 390, w: 230, h: 156 },
    sword: { x: 55, y: 660, w: 402, h: 730 },
  },
  forearms: {
    sword: { box: { x: 345, y: 505, w: 270, h: 306 }, joint: { x: 495, y: 525 } },
    free: { box: { x: 750, y: 505, w: 230, h: 326 }, joint: { x: 870, y: 525 } },
  },
  joints: {
    shoulder: { x: 550, y: 420 },
    elbowR: { x: 800, y: 410 },
    neck: { x: 685, y: 280 },
  },
  cloth: [
    { name: "cape", box: { x: 110, y: 380, w: 450, h: 760 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 12, freq: 1.2, k: 3.2, phase: 1.4, reverse: true, vertical: true } },
    { name: "ribbon", box: { x: 310, y: 70, w: 350, h: 250 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 10, freq: 1.8, k: 4.5, phase: 0.3, reverse: true, vertical: true } },
    { name: "sash", box: { x: 500, y: 456, w: 300, h: 690 },
      wind: { axis: "y", start: 0.25, amp: 5, freq: 1.3, k: 2.6, phase: 2.1 } },
    { name: "feathers", box: { x: 640, y: 580, w: 265, h: 310 },
      wind: { axis: "y", start: 0.2, amp: 4, freq: 1.5, k: 2.5, phase: 0.8 } },
  ],
  covers: [
    { name: "shoulder", box: { x: 345, y: 260, w: 270, h: 200 } },
    { name: "shoulderR", box: { x: 750, y: 250, w: 230, h: 200 } },
  ],
  blade: [{ x: 340, y: 855 }, { x: 60, y: 1385 }],
  fxColor: 0xff783d,
  poses: {
    cast: { name: "pose-cast", origin: { x: 13, y: 6 }, anchor: { x: 810, y: 1020 }, scale: 1.25, burst: { x: 1500, y: 245 } },
    ultimate: { name: "pose-ultimate", origin: { x: 13, y: 10 }, anchor: { x: 650, y: 1006 }, scale: 1.25, burst: { x: 1500, y: 30 } },
  },
};

/** Hình động theo id nhân vật. Nhân vật chưa có hình động thì sân khấu dùng chân dung. */
const RIGS: Readonly<Record<string, Rig>> = {
  daoLam: DAO_LAM,
  tranCuong: TRAN_CUONG,
  dinhBoLinh: DINH_BO_LINH,
  nguyenBac: NGUYEN_BAC,
};

export function rigOf(id: string): Rig | null {
  return RIGS[id] ?? null;
}

/** Đường dẫn ảnh của một lớp. */
export function partUrl(rig: Rig, part: string): string {
  return `/art/characters/${rig.dir}/${part}.webp`;
}
