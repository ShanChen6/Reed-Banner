import type { WarriorRig } from "./types";

/**
 * Bạch Sương, y sư hệ Phong (tướng cửa hàng). Bộ tranh Shan gửi 29/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code
 * như Mai Thanh: bàn tay xách hồ lô ngọc trắng xoay quanh cổ tay, hồ lô lắc quanh nắm tay; bàn tay buông và đầu tách
 * riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const BACH_SUONG: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 255, y: 625 },
  dir: "bach-suong",
  texScale: 0.5,
  foot: { x: 530, y: 1505 },
  height: 1500,
  parts: {
    body: { x: 282, y: 16, w: 638, h: 1508 },
    armR: { x: 740, y: 697, w: 58, h: 119 },
    sword: { x: 210, y: 624, w: 153, h: 412 },
    arm: { x: 208, y: 568, w: 95, h: 77 },
    head: { x: 407, y: 16, w: 216, h: 266 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 290, y: 600 },
    elbowR: { x: 755, y: 712 },
    neck: { x: 540, y: 255 },
  },
  blade: [{ x: 255, y: 625 }, { x: 290, y: 880 }],
  strikeFx: "galeMend",
  fxColor: 0x2e9e90,
  // Tấn thấp đẩy chưởng, hồ lô xách bên hông (đánh thường), ôm hồ lô mở nút (ra chiêu), vươn tay ban gió lành cho cả đội
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 103, y: 17 },
      anchor: { x: 570, y: 1490 }, scale: 1, burst: { x: 700, y: 420 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 228, y: 5 },
      anchor: { x: 515, y: 1505 }, scale: 1, burst: { x: 660, y: 280 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 109, y: 14 },
      anchor: { x: 470, y: 1505 }, scale: 1, burst: { x: 990, y: 380 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 2, y: 209 },
    anchor: { x: 520, y: 1300 }, scale: 0.9 },
};
