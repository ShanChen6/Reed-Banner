import type { WarriorRig } from "./types";

/**
 * Tạ Thạch, quân sư hệ Thổ (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 29/10: ông lão tóc bạc búi trâm ngọc, áo nâu thêu mũi giáo vàng, gậy gỗ đỏ chuôi đồng mũi sắt, cuộn bản đồ sông nước.
 * Ảnh đứng 1024×1536 tách lớp bằng code: gậy cùng nắm tay xoay quanh cổ tay (vạt áo sau gậy vá theo hàng), bàn tay ôm
 * bản đồ và đầu tách riêng; bỏ lá cờ bay của bộ cũ. Tranh hai tay chống gậy, bản đồ đeo lưng làm phong thái.
 */
export const TA_THACH: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "ta-thach",
  texScale: 0.5,
  foot: { x: 500, y: 1480 },
  height: 1440,
  parts: {
    body: { x: 157, y: 45, w: 702, h: 1444 },
    armR: { x: 596, y: 605, w: 128, h: 112 },
    sword: { x: 274, y: 476, w: 72, h: 1016 },
    arm: { x: 238, y: 555, w: 120, h: 132 },
    head: { x: 355, y: 45, w: 266, h: 300 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 300, y: 620 },
    elbowR: { x: 650, y: 640 },
    neck: { x: 500, y: 320 },
  },
  blade: [{ x: 312, y: 480 }, { x: 300, y: 1490 }],
  strikeFx: "stoneBastion",
  fxColor: 0xd09a48,
  // Tấn thấp hai tay đẩy gậy tới (đánh thường), cúi đầu hai tay cắm gậy xuống đất (ra chiêu), hét lớn vung gậy qua
  // đầu bổ xuống (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 58, y: 10 },
      anchor: { x: 540, y: 985 }, scale: 1, burst: { x: 1480, y: 415 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 147, y: 44 },
      anchor: { x: 360, y: 1440 }, scale: 1, burst: { x: 630, y: 330 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 264, y: 12 },
      anchor: { x: 710, y: 985 }, scale: 1, burst: { x: 1300, y: 25 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 25, y: 10 },
    anchor: { x: 500, y: 960 }, scale: 1 },
};
