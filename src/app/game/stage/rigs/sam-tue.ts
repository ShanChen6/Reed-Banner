import type { WarriorRig } from "./types";

/**
 * Sầm Tuệ, quân sư hệ Mộc (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 26/10: áo lục thêu sen vàng, tóc búi điểm bạc, cờ lệnh đuôi én trên cán trúc mũi giáo, ống thẻ tre. Ảnh đứng 1024×1536
 * tách lớp bằng code: cán cờ cùng lá cờ và nắm tay xoay quanh cổ tay theo nhịp giáo (vạt váy sau cán vá theo hàng),
 * bàn tay ôm ống thẻ tre và đầu tách riêng. Tranh quỳ gối nghe ngóng làm phong thái.
 */
export const SAM_TUE: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "sam-tue",
  texScale: 0.5,
  foot: { x: 630, y: 1520 },
  height: 1320,
  parts: {
    body: { x: 349, y: 202, w: 538, h: 1332 },
    armR: { x: 655, y: 540, w: 122, h: 202 },
    sword: { x: 24, y: 7, w: 396, h: 1516 },
    arm: { x: 332, y: 488, w: 68, h: 106 },
    head: { x: 497, y: 202, w: 208, h: 196 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 390, y: 578 },
    elbowR: { x: 745, y: 680 },
    neck: { x: 610, y: 385 },
  },
  blade: [{ x: 372, y: 600 }, { x: 318, y: 10 }],
  strikeFx: "groveWard",
  fxColor: 0x4f9a4a,
  // Tấn thấp đâm cờ giáo, lá cờ bay sau lưng (đánh thường), giơ cao cờ lệnh tay kia chỉ hướng (ra chiêu), đâm thẳng cờ
  // giáo lá cờ bay phía trước (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 37, y: 73 },
      anchor: { x: 740, y: 968 }, scale: 1.07, burst: { x: 1490, y: 432 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 28, y: 10 },
      anchor: { x: 520, y: 1530 }, scale: 1.03, burst: { x: 990, y: 515 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 24, y: 42 },
      anchor: { x: 560, y: 985 }, scale: 1.07, burst: { x: 1500, y: 280 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 74, y: 25 },
    anchor: { x: 520, y: 900 }, scale: 1.05 },
};
