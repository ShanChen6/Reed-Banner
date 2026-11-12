import type { WarriorRig } from "./types";

/**
 * Liễu Thiều (ngoại hiệu Vô Ảnh), sát thủ hệ Phong (RB-075, nghề Sát thủ chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi 12/11
 * (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code: sáo trúc tách khỏi bàn tay phải để cùng xoay quanh cổ tay (vạt áo
 * sau sáo vá bằng vải ngay trên), bàn tay trái và đầu (cả búi tóc) tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const VO_ANH: WarriorRig = {
  skeleton: "warrior",
  dir: "vo-anh",
  texScale: 0.5,
  foot: { x: 500, y: 1515 },
  height: 1475,
  parts: {
    body: { x: 170, y: 44, w: 660, h: 1480 },
    armR: { x: 690, y: 738, w: 60, h: 78 },
    sword: { x: 169, y: 667, w: 326, h: 236 },
    arm: { x: 296, y: 704, w: 76, h: 116 },
    head: { x: 395, y: 44, w: 216, h: 206 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 330, y: 712 },
    elbowR: { x: 718, y: 745 },
    neck: { x: 505, y: 240 },
  },
  blade: [{ x: 180, y: 670 }, { x: 475, y: 880 }],
  strikeFx: "flutePulse",
  fxColor: 0x2e9e90,
  // Tấn chéo vung sáo thấp, tay kia chém chưởng (đánh thường), đứng thổi sáo (ra chiêu), tấn rộng thổi sáo gọi gió
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 394, y: 14 },
      anchor: { x: 760, y: 1000 }, scale: 1.1, burst: { x: 1100, y: 230 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 126, y: 23 },
      anchor: { x: 470, y: 1510 }, scale: 1, burst: { x: 640, y: 290 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 332, y: 9 },
      anchor: { x: 820, y: 995 }, scale: 1.1, burst: { x: 1250, y: 260 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 213, y: 10 },
    anchor: { x: 760, y: 960 }, scale: 1.05 },
};
