import type { WarriorRig } from "./types";

/**
 * Đinh Bộ Lĩnh, nhân vật chính, bản tướng quân. Bộ tranh Shan gửi 31/10 (nền trong suốt sẵn), thay bộ cũ: giáp vảy đen
 * viền đồng, áo trắng, áo choàng đỏ. Ảnh đứng tách lớp bằng code: cẳng tay cầm đao cùng thanh đao xoay quanh khuỷu,
 * bàn tay đặt trên khóa thắt lưng, đầu, hai vạt áo choàng bay theo gió sau lưng (chỗ đao và cẳng tay che vạt trái được
 * vá màu). Tranh đứng chống đao làm tranh phong thái, tranh quỳ chống bao đao làm tranh gục.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const DINH_BO_LINH: WarriorRig = {
  skeleton: "warrior",
  dir: "dinh-bo-linh",
  texScale: 0.5,
  foot: { x: 540, y: 1495 },
  height: 1495,
  parts: {
    body: { x: 283, y: 15, w: 711, h: 1497 },
    armR: { x: 640, y: 503, w: 164, h: 105 },
    sword: { x: 31, y: 679, w: 345, h: 670 },
    arm: { x: 268, y: 540, w: 108, h: 261 },
    head: { x: 482, y: 16, w: 158, h: 203 },
  },
  cloth: [
    {
      name: "capeL",
      box: { x: 49, y: 408, w: 332, h: 1095 },
      wind: { axis: "y", start: 0.2, amp: 12, freq: 1.2, k: 3, phase: 1.4 },
      behind: true,
    },
    {
      name: "capeR",
      box: { x: 796, y: 711, w: 199, h: 569 },
      wind: { axis: "y", start: 0.15, amp: 9, freq: 1.4, k: 2.8, phase: 0.5 },
      behind: true,
    },
  ],
  covers: [],
  joints: {
    shoulder: { x: 328, y: 556 },
    elbowR: { x: 785, y: 525 },
    neck: { x: 565, y: 205 },
  },
  blade: [
    { x: 300, y: 830 },
    { x: 35, y: 1345 },
  ],
  fxColor: 0xffc46b,
  // Chém ngang (đánh thường), đâm đao chéo lên (ra chiêu), vung đao qua đầu (tuyệt chiêu). Cỡ so theo khóa thắt lưng
  // (65 px đứng).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 30, y: 60 },
      anchor: { x: 610, y: 1470 }, scale: 1.1, burst: { x: 975, y: 575 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 3, y: 3 },
      anchor: { x: 560, y: 1475 }, scale: 1.05, burst: { x: 985, y: 30 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 9, y: 22 },
      anchor: { x: 480, y: 1480 }, scale: 1, burst: { x: 800, y: 60 } },
  },
  // Quỳ một gối, tay chống bao đao.
  down: { name: "pose-down", texScale: 0.3, origin: { x: 83, y: 107 },
    anchor: { x: 520, y: 1400 }, scale: 0.97 },
};
