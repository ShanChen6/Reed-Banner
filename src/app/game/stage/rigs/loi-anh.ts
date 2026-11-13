import type { WarriorRig } from "./types";

/**
 * Mẫn Tuyên (ngoại hiệu Lôi Ảnh), sát thủ hệ Lôi (RB-074, nghề Sát thủ chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi 12/11
 * (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code: hộp kim đồng cùng bàn tay phải đỡ hộp xoay quanh cổ tay (vạt áo sau hộp
 * vá bằng vải ngay dưới), bàn tay trái buông và đầu (cả bím tóc) tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const LOI_ANH: WarriorRig = {
  skeleton: "warrior",
  dir: "loi-anh",
  texScale: 0.5,
  foot: { x: 500, y: 1520 },
  height: 1505,
  parts: {
    body: { x: 233, y: 14, w: 516, h: 1514 },
    armR: { x: 705, y: 800, w: 56, h: 118 },
    sword: { x: 255, y: 784, w: 128, h: 102 },
    arm: { x: 230, y: 778, w: 76, h: 116 },
    head: { x: 390, y: 14, w: 228, h: 248 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 262, y: 790 },
    elbowR: { x: 735, y: 808 },
    neck: { x: 520, y: 250 },
  },
  blade: [{ x: 260, y: 830 }, { x: 380, y: 830 }],
  strikeFx: "stormVolley",
  fxColor: 0xb48cff,
  // Tấn dài mở hộp phóng mưa kim (đánh thường), giơ hộp qua vai đẩy chưởng (ra chiêu), quỳ một gối mở hộp xả trận mưa kim
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 176, y: 3 },
      anchor: { x: 620, y: 1000 }, scale: 1.1, burst: { x: 1250, y: 170 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 135, y: 6 },
      anchor: { x: 620, y: 995 }, scale: 1.1, burst: { x: 1360, y: 330 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 59, y: 4 },
      anchor: { x: 600, y: 990 }, scale: 1.1, burst: { x: 1250, y: 210 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 192, y: 5 },
    anchor: { x: 760, y: 960 }, scale: 1 },
};
