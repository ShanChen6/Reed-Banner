import type { WarriorRig } from "./types";

/**
 * Hứa Lăng, tướng sĩ hệ Phong (tướng cửa hàng). Bộ tranh Shan gửi 29/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng
 * code: đao cong (cả tua xanh) cùng nắm tay xoay quanh cổ tay theo nhịp chém, bàn tay phải và đầu tách riêng, dải khăn
 * xanh buộc tóc bay theo gió sau lưng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const HUA_LANG: WarriorRig = {
  skeleton: "warrior",
  dir: "hua-lang",
  texScale: 0.5,
  foot: { x: 730, y: 1510 },
  height: 1500,
  parts: {
    body: { x: 340, y: 9, w: 647, h: 1506 },
    armR: { x: 852, y: 698, w: 63, h: 127 },
    sword: { x: 8, y: 657, w: 463, h: 442 },
    arm: { x: 358, y: 688, w: 91, h: 95 },
    head: { x: 560, y: 35, w: 166, h: 204 },
  },
  cloth: [
    { name: "ribbon", box: { x: 231, y: 86, w: 329, h: 593 }, behind: true,
      wind: { axis: "y", start: 0.1, amp: 8, freq: 1.4, k: 2.6, phase: 0.3 } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 410, y: 720 },
    elbowR: { x: 875, y: 705 },
    neck: { x: 640, y: 225 },
  },
  blade: [{ x: 405, y: 735 }, { x: 20, y: 1085 }],
  strikeFx: "galeSlash",
  fxColor: 0x2e9e90,
  // Tấn rộng đưa đao ngang chém tới (đánh thường), vươn tay giơ đao chém xuống (ra chiêu), xoay người vung đao sau đầu
  // rồi bổ (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 10, y: 5 },
      anchor: { x: 540, y: 1500 }, scale: 1, burst: { x: 1010, y: 630 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 6, y: 10 },
      anchor: { x: 500, y: 1515 }, scale: 1, burst: { x: 1010, y: 25 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 45, y: 8 },
      anchor: { x: 690, y: 1165 }, scale: 1, burst: { x: 785, y: 15 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 9, y: 11 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};
