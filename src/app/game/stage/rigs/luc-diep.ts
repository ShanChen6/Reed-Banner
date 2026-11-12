import type { WarriorRig } from "./types";

/**
 * Lục Diệp, y sư hệ Mộc (tướng cửa hàng). Bộ tranh Shan gửi 25/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code:
 * bàn tay cầm hồ lô xoay quanh cổ tay, hồ lô đan mây lắc quanh nắm tay như các y sư khác; bàn tay buông và đầu tách
 * riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const LUC_DIEP: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 205, y: 400 },
  dir: "luc-diep",
  texScale: 0.5,
  foot: { x: 520, y: 1500 },
  height: 1490,
  parts: {
    body: { x: 275, y: 9, w: 622, h: 1515 },
    armR: { x: 771, y: 685, w: 66, h: 97 },
    sword: { x: 136, y: 298, w: 189, h: 283 },
    arm: { x: 170, y: 365, w: 121, h: 91 },
    head: { x: 417, y: 10, w: 224, h: 231 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 280, y: 420 },
    elbowR: { x: 790, y: 700 },
    neck: { x: 530, y: 230 },
  },
  blade: [{ x: 205, y: 400 }, { x: 200, y: 330 }],
  strikeFx: "leafBloom",
  fxColor: 0x4f9a4a,
  // Đẩy chưởng, hồ lô giữ bên hông (đánh thường), mở nắp hồ lô (ra chiêu), nâng hồ lô trao thuốc cho đồng đội (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 60, y: 20 },
      anchor: { x: 560, y: 1500 }, scale: 1, burst: { x: 690, y: 380 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 62, y: 15 },
      anchor: { x: 500, y: 1505 }, scale: 1, burst: { x: 650, y: 330 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 25, y: 7 },
      anchor: { x: 590, y: 1490 }, scale: 1, burst: { x: 900, y: 450 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 13, y: 61 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};
