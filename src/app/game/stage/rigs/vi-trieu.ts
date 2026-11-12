import type { WarriorRig } from "./types";

/**
 * Vi Triều, quân sư hệ Thủy (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 26/10: áo chàm thêu sao vàng, tóc búi khăn xanh, giáo trắng hai móc lưỡi liềm xanh, túi gấm đeo hông, dép cỏ. Ảnh đứng
 * 1024×1536 tách lớp bằng code: giáo cùng nắm tay xoay quanh cổ tay theo nhịp giáo (cán nằm ngoài thân nên không cần vá),
 * bàn tay buông và đầu tách riêng. Tranh ngồi trên tảng đá đặt giáo ngang gối làm phong thái.
 */
export const VI_TRIEU: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "vi-trieu",
  texScale: 0.5,
  foot: { x: 500, y: 1500 },
  height: 1425,
  parts: {
    body: { x: 239, y: 85, w: 526, h: 1424 },
    armR: { x: 667, y: 719, w: 64, h: 160 },
    sword: { x: 242, y: 72, w: 86, h: 1410 },
    arm: { x: 229, y: 441, w: 72, h: 106 },
    head: { x: 361, y: 85, w: 240, h: 250 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 290, y: 500 },
    elbowR: { x: 700, y: 725 },
    neck: { x: 490, y: 300 },
  },
  blade: [{ x: 266, y: 500 }, { x: 266, y: 80 }],
  strikeFx: "tideSiege",
  fxColor: 0x2f7fc1,
  // Tấn thấp đâm giáo ngang (đánh thường), dựng giáo tay kia đẩy chưởng ra lệnh (ra chiêu), hét lớn đâm chếch giáo
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 30, y: 85 },
      anchor: { x: 520, y: 950 }, scale: 0.93, burst: { x: 1480, y: 410 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 130, y: 13 },
      anchor: { x: 430, y: 1500 }, scale: 1.05, burst: { x: 950, y: 260 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 32, y: 36 },
      anchor: { x: 560, y: 955 }, scale: 0.93, burst: { x: 1460, y: 335 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 26, y: 26 },
    anchor: { x: 620, y: 925 }, scale: 0.95 },
};
