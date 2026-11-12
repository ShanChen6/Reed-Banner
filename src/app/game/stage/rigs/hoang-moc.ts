import type { WarriorRig } from "./types";

/**
 * Hoàng Mộc, binh lính hệ Mộc (tướng cửa hàng). Bộ tranh Shan gửi 11/11 (nền trong suốt sẵn), thay bộ 10/11: giáp đan cói
 * xanh, băng đô lá, nón lá đeo lưng, giỏ ống cơm lam, gậy sắt đốt tre vác vai thay liềm và khiên. Ảnh đứng 1024×1536 tách
 * lớp bằng code: gậy sắt cùng nắm tay xoay quanh cổ tay (chỗ gậy đè vai và cổ vá bằng nội suy theo pháp tuyến và khuếch
 * tán màu da), bàn tay chống hông và đầu tách riêng. Tranh ngồi thuyền ăn cơm lam làm phong thái.
 */
export const HOANG_MOC: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "hoang-moc",
  texScale: 0.5,
  foot: { x: 470, y: 1500 },
  height: 1490,
  parts: {
    body: { x: 208, y: 13, w: 572, h: 1514 },
    armR: { x: 690, y: 515, w: 74, h: 84 },
    sword: { x: 204, y: 82, w: 638, h: 278 },
    arm: { x: 236, y: 261, w: 104, h: 98 },
    head: { x: 318, y: 13, w: 288, h: 210 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 275, y: 345 },
    elbowR: { x: 750, y: 560 },
    neck: { x: 480, y: 210 },
  },
  blade: [{ x: 300, y: 320 }, { x: 830, y: 95 }],
  strikeFx: "rootGuard",
  fxColor: 0x4f9a4a,
  // Lao tới đâm gậy (đánh thường), hai tay ngang gậy thủ thế (ra chiêu), giơ gậy qua đầu xòe tay (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 34, y: 10 },
      anchor: { x: 430, y: 975 }, scale: 1.1, burst: { x: 1500, y: 265 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 61, y: 13 },
      anchor: { x: 470, y: 1500 }, scale: 1, burst: { x: 975, y: 440 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 35, y: 45 },
      anchor: { x: 470, y: 1490 }, scale: 1.1, burst: { x: 100, y: 45 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 62, y: 21 },
    anchor: { x: 900, y: 950 }, scale: 1 },
};
