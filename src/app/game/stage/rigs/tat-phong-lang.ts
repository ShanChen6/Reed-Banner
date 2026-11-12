import type { WarriorRig } from "./types";

/**
 * Giáp Yến (ngoại hiệu Tật Phong Lăng), xạ thủ hệ Phong (RB-068, nghề chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi
 * 11/11 (nền trong suốt sẵn). Ảnh đứng hai tay cầm dải lụa võng thành vòng nên vòng lụa ở lại thân; đầu lụa rủ bên trái
 * cùng bàn tay trái lắc nhẹ quanh cổ tay như hồ lô của y sư, bàn tay phải và đầu (cả bím tóc trên) tách riêng. Hệ tọa
 * độ: ảnh đứng 1024×1536.
 */
export const TAT_PHONG_LANG: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 210, y: 738 },
  dir: "tat-phong-lang",
  texScale: 0.5,
  foot: { x: 440, y: 1520 },
  height: 1505,
  parts: {
    body: { x: 147, y: 11, w: 806, h: 1518 },
    armR: { x: 795, y: 526, w: 86, h: 76 },
    sword: { x: 98, y: 735, w: 146, h: 328 },
    arm: { x: 162, y: 636, w: 104, h: 106 },
    head: { x: 320, y: 11, w: 300, h: 252 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 212, y: 645 },
    elbowR: { x: 808, y: 560 },
    neck: { x: 545, y: 245 },
  },
  blade: [{ x: 210, y: 738 }, { x: 150, y: 1050 }],
  strikeFx: "silkGale",
  fxColor: 0x2e9e90,
  // Tấn trước đấm thẳng phóng lụa (đánh thường), đá ngang quét lụa bay vòng (ra chiêu), vung lụa thành cung lớn qua đầu
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 69, y: 5 },
      anchor: { x: 390, y: 995 }, scale: 1.2, burst: { x: 1300, y: 520 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 115, y: 11 },
      anchor: { x: 380, y: 995 }, scale: 1.2, burst: { x: 1050, y: 550 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 129, y: 11 },
      anchor: { x: 440, y: 1000 }, scale: 1.2, burst: { x: 1240, y: 330 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 97, y: 14 },
    anchor: { x: 640, y: 950 }, scale: 1.1 },
};
