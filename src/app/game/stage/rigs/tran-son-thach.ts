import type { WarriorRig } from "./types";

/**
 * Kha Thạch (ngoại hiệu Trấn Sơn Thạch), xạ thủ hệ Thổ (RB-066). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong
 * suốt sẵn), thay bộ 30/10: áo chần bông vàng đất thêu thẻ gỗ, áo trong nâu, đai đỏ, túi đá đan bên hông, đá phi dẹt.
 * Ảnh đứng 1024×1536 tách lớp bằng code: bàn tay cầm đá cùng viên đá vung quanh cổ tay (nằm ngoài thân nên không cần
 * vá), bàn tay chống hông và đầu tách riêng. Tranh ngồi trên tảng đá xem viên đá làm phong thái.
 */
export const TRAN_SON_THACH: WarriorRig = {
  skeleton: "warrior",
  dir: "tran-son-thach",
  texScale: 0.5,
  foot: { x: 500, y: 1515 },
  height: 1505,
  parts: {
    body: { x: 175, y: 9, w: 666, h: 1516 },
    armR: { x: 641, y: 660, w: 108, h: 102 },
    sword: { x: 175, y: 750, w: 108, h: 62 },
    arm: { x: 150, y: 698, w: 96, h: 128 },
    head: { x: 380, y: 10, w: 266, h: 250 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 205, y: 712 },
    elbowR: { x: 715, y: 668 },
    neck: { x: 540, y: 235 },
  },
  blade: [{ x: 200, y: 790 }, { x: 278, y: 760 }],
  strikeFx: "stoneGuard",
  fxColor: 0xc8963c,
  // Tấn rộng phóng đá dẹt bay tới (đánh thường), giơ đá ngang vai tay kia đẩy chưởng (ra chiêu), giơ cao đá qua đầu lấy
  // đà ném (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 139, y: 9 },
      anchor: { x: 610, y: 985 }, scale: 1.05, burst: { x: 1390, y: 170 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 239, y: 6 },
      anchor: { x: 695, y: 985 }, scale: 1.05, burst: { x: 1300, y: 260 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 235, y: 7 },
      anchor: { x: 740, y: 995 }, scale: 1.05, burst: { x: 1300, y: 480 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 62, y: 5 },
    anchor: { x: 650, y: 930 }, scale: 1 },
};
