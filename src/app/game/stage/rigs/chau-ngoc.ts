import type { WarriorRig } from "./types";

/**
 * Trần Ngọc (tên cũ Châu Ngọc), y sư hệ Kim (tướng cửa hàng). Bộ tranh Shan gửi 25/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng
 * code: bàn tay cầm hồ lô sứ xoay quanh cổ tay, hồ lô lắc nhẹ quanh nắm tay; bàn tay buông và đầu tách riêng.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const CHAU_NGOC: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 465, y: 560 },
  dir: "chau-ngoc",
  texScale: 0.5,
  foot: { x: 450, y: 1480 },
  height: 1470,
  parts: {
    body: { x: 129, y: 19, w: 678, h: 1496 },
    armR: { x: 783, y: 675, w: 67, h: 116 },
    sword: { x: 431, y: 485, w: 98, h: 141 },
    arm: { x: 372, y: 510, w: 119, h: 81 },
    head: { x: 425, y: 55, w: 176, h: 201 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 385, y: 545 },
    elbowR: { x: 800, y: 690 },
    neck: { x: 510, y: 250 },
  },
  blade: [{ x: 465, y: 560 }, { x: 480, y: 500 }],
  strikeFx: "silverGrace",
  fxColor: 0x9ea4ad,
  // Gạt tay đỡ, hồ lô giữ bên hông (đánh thường), đưa hồ lô ra trao thuốc (ra chiêu), rút kim châm (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 208, y: 3 },
      anchor: { x: 600, y: 1490 }, scale: 1, burst: { x: 880, y: 300 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 184, y: 9 },
      anchor: { x: 560, y: 1490 }, scale: 1, burst: { x: 880, y: 450 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 19, y: 10 },
      anchor: { x: 600, y: 1480 }, scale: 1, burst: { x: 700, y: 430 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 7, y: 51 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};
