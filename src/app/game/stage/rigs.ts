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

/** Các lớp của bộ xương tướng sĩ, xếp từ dưới lên trên. Kiếm nằm trong nhóm tay, dưới lớp tay. */
export const WARRIOR_PARTS = [
  "body",
  "apron",
  "armR",
  "sword",
  "arm",
  "pauldron",
  "head",
] as const;

export type WarriorPart = (typeof WARRIOR_PARTS)[number];

export interface WarriorRig {
  readonly skeleton: "warrior";
  readonly dir: string;
  readonly texScale: number;
  readonly foot: Point;
  readonly height: number;
  readonly parts: Readonly<Record<WarriorPart, PartBox>>;
  /** shoulder: vai tay cầm kiếm (cả tay và kiếm xoay quanh đây); elbowR: khuỷu tay không; neck: cổ. */
  readonly joints: Readonly<Record<"shoulder" | "elbowR" | "neck", Point>>;
  /** Chuôi và mũi kiếm lúc đứng yên, để đặt hào quang dọc lưỡi. */
  readonly blade: readonly [Point, Point];
  readonly fxColor: number;
}

export type Rig = MageRig | WarriorRig;

/** Lớp ảnh của một bộ xương. */
export function partsOf(rig: Rig): readonly string[] {
  return rig.skeleton === "mage" ? MAGE_PARTS : WARRIOR_PARTS;
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
    apron: { x: 392, y: 538, w: 120, h: 270 },
    armR: { x: 518, y: 340, w: 103, h: 245 },
    sword: { x: 1, y: 373, w: 249, h: 662 },
    arm: { x: 158, y: 284, w: 159, h: 235 },
    pauldron: { x: 204, y: 114, w: 145, h: 189 },
    head: { x: 339, y: 8, w: 124, h: 145 },
  },
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

/** Hình động theo id nhân vật. Nhân vật chưa có hình động thì sân khấu dùng chân dung. */
const RIGS: Readonly<Record<string, Rig>> = {
  daoLam: DAO_LAM,
  tranCuong: TRAN_CUONG,
};

export function rigOf(id: string): Rig | null {
  return RIGS[id] ?? null;
}

/** Đường dẫn ảnh của một lớp. */
export function partUrl(rig: Rig, part: string): string {
  return `/art/characters/${rig.dir}/${part}.webp`;
}
