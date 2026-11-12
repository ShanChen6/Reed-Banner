import type { WarriorRig } from "./types";

/**
 * Âu Thu (ngoại hiệu Hàn Giang Khách), sát thủ hệ Thủy (RB-071, nghề Sát thủ chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan
 * gửi 12/11 (nền trong suốt sẵn). Ảnh đứng tay không (đoản đao giấu trong tay áo, chỉ hiện ở tranh tư thế): bàn tay buông
 * bên phải tách thành nắm tay + ngón (lớp "sword") xoay quanh cổ tay, bàn tay trái và đầu tách riêng; áo tơi lá ở lại
 * thân. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const HAN_GIANG_KHACH: WarriorRig = {
  skeleton: "warrior",
  dir: "han-giang-khach",
  texScale: 0.5,
  foot: { x: 510, y: 1520 },
  height: 1505,
  parts: {
    body: { x: 260, y: 12, w: 480, h: 1516 },
    armR: { x: 295, y: 792, w: 70, h: 112 },
    sword: { x: 676, y: 868, w: 54, h: 46 },
    arm: { x: 676, y: 788, w: 62, h: 82 },
    head: { x: 355, y: 12, w: 260, h: 244 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 705, y: 794 },
    elbowR: { x: 322, y: 798 },
    neck: { x: 550, y: 245 },
  },
  blade: [{ x: 705, y: 850 }, { x: 715, y: 905 }],
  strikeFx: "tideBlade",
  fxColor: 0x2f7fc1,
  // Tấn chéo đâm đoản đao, tay kia ngửa chưởng (đánh thường), thu đao bên hông đẩy chưởng (ra chiêu), tấn dài vung tay
  // đâm đao xuống thấp (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 342, y: 15 },
      anchor: { x: 580, y: 995 }, scale: 1.1, burst: { x: 1060, y: 300 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 304, y: 9 },
      anchor: { x: 740, y: 990 }, scale: 1.1, burst: { x: 1300, y: 250 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 93, y: 10 },
      anchor: { x: 660, y: 995 }, scale: 1.05, burst: { x: 1470, y: 630 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 27, y: 49 },
    anchor: { x: 700, y: 950 }, scale: 1 },
};
