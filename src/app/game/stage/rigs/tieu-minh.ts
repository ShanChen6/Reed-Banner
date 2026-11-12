import type { WarriorRig } from "./types";

/**
 * Tiêu Minh, y sư hệ Lôi (tướng cửa hàng). Bộ tranh Shan gửi 29/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code như
 * Mã Liên: bàn tay nắm dây cùng đôi hồ lô tím xoay quanh cổ tay (chỗ hồ lô che vạt áo được vá màu), cẳng tay buông bên
 * phải và đầu tách riêng. Tranh ngồi chạm ống kim làm tranh phong thái. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const TIEU_MINH: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 335, y: 610 },
  dir: "tieu-minh",
  texScale: 0.5,
  foot: { x: 480, y: 1490 },
  height: 1520,
  parts: {
    body: { x: 263, y: 0, w: 626, h: 1535 },
    armR: { x: 672, y: 466, w: 215, h: 262 },
    sword: { x: 292, y: 659, w: 156, h: 159 },
    arm: { x: 322, y: 587, w: 109, h: 80 },
    head: { x: 366, y: 0, w: 281, h: 215 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 335, y: 610 },
    elbowR: { x: 705, y: 480 },
    neck: { x: 530, y: 200 },
  },
  blade: [{ x: 335, y: 610 }, { x: 380, y: 800 }],
  strikeFx: "thunderMend",
  fxColor: 0xb48cff,
  // Đẩy chưởng ra trước (đánh thường), nâng đôi hồ lô trước ngực (ra chiêu), nhón kim châm sắp phóng (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 99, y: 17 },
      anchor: { x: 510, y: 1480 }, scale: 1, burst: { x: 925, y: 270 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 71, y: 8 },
      anchor: { x: 510, y: 1480 }, scale: 1, burst: { x: 525, y: 440 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 66, y: 10 },
      anchor: { x: 520, y: 1480 }, scale: 0.95, burst: { x: 765, y: 265 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 45, y: 3 },
    anchor: { x: 760, y: 985 }, scale: 0.82 },
};
