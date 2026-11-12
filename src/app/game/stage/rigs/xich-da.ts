import type { WarriorRig } from "./types";

/**
 * Tiết Dạ (ngoại hiệu Xích Dạ), sát thủ hệ Hỏa (RB-072, nghề Sát thủ chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi 12/11
 * (nền trong suốt sẵn). Ảnh đứng hai tay buông cầm hai đao cong: đao trái cùng nắm tay xoay quanh cổ tay, nắm tay phải
 * cùng đao phải là lớp armR lắc theo nhịp, đầu tách riêng; khăn quàng, bao đao ở lại thân. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const XICH_DA: WarriorRig = {
  skeleton: "warrior",
  dir: "xich-da",
  texScale: 0.5,
  foot: { x: 500, y: 1515 },
  height: 1500,
  parts: {
    body: { x: 164, y: 23, w: 644, h: 1502 },
    armR: { x: 735, y: 792, w: 218, h: 498 },
    sword: { x: 71, y: 866, w: 190, h: 418 },
    arm: { x: 121, y: 751, w: 94, h: 116 },
    head: { x: 441, y: 23, w: 200, h: 212 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 165, y: 800 },
    elbowR: { x: 790, y: 800 },
    neck: { x: 550, y: 225 },
  },
  blade: [{ x: 150, y: 880 }, { x: 85, y: 1270 }],
  strikeFx: "twinCleave",
  fxColor: 0xd9502a,
  // Tấn dài vung một đao ra sau, một đao thu trước ngực (đánh thường), giơ cao một đao, đao kia chém ngang (ra chiêu),
  // bắt chéo hai đao trước ngực (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 51, y: 10 },
      anchor: { x: 700, y: 1000 }, scale: 1.15, burst: { x: 1100, y: 470 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 279, y: 7 },
      anchor: { x: 650, y: 995 }, scale: 1.15, burst: { x: 1420, y: 620 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 29, y: 12 },
      anchor: { x: 800, y: 995 }, scale: 1.15, burst: { x: 1270, y: 190 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 18, y: 11 },
    anchor: { x: 760, y: 960 }, scale: 1 },
};
