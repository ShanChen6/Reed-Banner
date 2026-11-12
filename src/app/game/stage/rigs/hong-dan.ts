import type { WarriorRig } from "./types";

/**
 * Hồng Đan, y sư hệ Hỏa (tướng cửa hàng). Bộ tranh Shan gửi 26/10 (nền trong suốt sẵn), tranh tuyệt chiêu gửi bổ sung
 * sau. Ảnh đứng tách lớp bằng code như Mai Thanh: bàn tay xách hồ lô xoay quanh cổ tay, hồ lô lắc quanh nắm tay; bàn tay
 * buông và đầu tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const HONG_DAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 290, y: 690 },
  dir: "hong-dan",
  texScale: 0.5,
  foot: { x: 560, y: 1510 },
  height: 1500,
  parts: {
    body: { x: 284, y: 10, w: 541, h: 1510 },
    armR: { x: 735, y: 697, w: 54, h: 92 },
    sword: { x: 199, y: 642, w: 164, h: 257 },
    arm: { x: 252, y: 662, w: 76, h: 84 },
    head: { x: 390, y: 10, w: 217, h: 194 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 290, y: 680 },
    elbowR: { x: 758, y: 712 },
    neck: { x: 520, y: 195 },
  },
  blade: [{ x: 290, y: 690 }, { x: 270, y: 850 }],
  strikeFx: "emberMend",
  fxColor: 0xd9502a,
  // Phẩy tay rắc thuốc, hồ lô xách thấp (đánh thường), ôm hồ lô mở nút (ra chiêu), hai tay nâng hồ lô trao thuốc cho cả
  // đội (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 145, y: 12 },
      anchor: { x: 590, y: 1510 }, scale: 1, burst: { x: 430, y: 300 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 137, y: 15 },
      anchor: { x: 585, y: 1515 }, scale: 1, burst: { x: 680, y: 600 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 43, y: 11 },
      anchor: { x: 535, y: 1510 }, scale: 1, burst: { x: 850, y: 350 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 39, y: 38 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};
