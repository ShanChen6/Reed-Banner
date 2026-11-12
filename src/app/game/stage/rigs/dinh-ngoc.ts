import type { WarriorRig } from "./types";

/**
 * Đinh Ngọc, Vạn Tượng Hành Giả (RB-SP-001, nhân vật đặc biệt đang thiết kế, chưa có trong roster; chỉ có trên trang xem
 * thử). Bộ tranh Shan gửi 30/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code: kiếm thẳng cùng nắm tay phải xoay
 * quanh cổ tay theo nhịp chém, bàn tay trái và đầu tách riêng; tóc dài, bao kiếm ở lại thân. Hệ tọa độ: ảnh đứng
 * 1024×1536.
 */
export const DINH_NGOC: WarriorRig = {
  skeleton: "warrior",
  dir: "dinh-ngoc",
  texScale: 0.5,
  foot: { x: 500, y: 1500 },
  height: 1470,
  parts: {
    body: { x: 300, y: 27, w: 445, h: 1480 },
    armR: { x: 694, y: 690, w: 70, h: 140 },
    sword: { x: 274, y: 680, w: 160, h: 636 },
    arm: { x: 263, y: 690, w: 88, h: 147 },
    head: { x: 408, y: 30, w: 215, h: 235 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 305, y: 720 },
    elbowR: { x: 715, y: 705 },
    neck: { x: 515, y: 255 },
  },
  blade: [{ x: 330, y: 850 }, { x: 430, y: 1310 }],
  strikeFx: "myriadEdge",
  fxColor: 0x9ea4ad,
  // Đẩy chưởng trái, kiếm hạ thấp (đánh thường), tấn rộng đâm kiếm thấp về sau đẩy chưởng (ra chiêu), tấn rộng giơ kiếm sau
  // đầu dẫn lực (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 128, y: 33 },
      anchor: { x: 510, y: 1470 }, scale: 1, burst: { x: 960, y: 330 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 87, y: 8 },
      anchor: { x: 830, y: 1110 }, scale: 1, burst: { x: 1240, y: 480 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 304, y: 4 },
      anchor: { x: 810, y: 1110 }, scale: 1, burst: { x: 1170, y: 460 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 82, y: 66 },
    anchor: { x: 760, y: 920 }, scale: 0.85 },
};
