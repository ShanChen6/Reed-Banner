import type { WarriorRig } from "./types";

/**
 * Lương Triệt (ngoại hiệu Lôi Minh Xạ), xạ thủ hệ Lôi (RB-067, nghề chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi
 * 11/11 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code: nắm tay giơ ngang vai kẹp lôi châm vung quanh cổ tay, bàn tay
 * buông bên hông lắc nhẹ, đầu (cả dải buộc tóc tím) tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const LOI_MINH_XA: WarriorRig = {
  skeleton: "warrior",
  dir: "loi-minh-xa",
  texScale: 0.5,
  foot: { x: 510, y: 1515 },
  height: 1505,
  parts: {
    body: { x: 206, y: 5, w: 582, h: 1522 },
    armR: { x: 712, y: 788, w: 76, h: 120 },
    sword: { x: 251, y: 229, w: 156, h: 54 },
    arm: { x: 211, y: 265, w: 108, h: 84 },
    head: { x: 321, y: 5, w: 320, h: 246 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 252, y: 338 },
    elbowR: { x: 750, y: 795 },
    neck: { x: 540, y: 235 },
  },
  blade: [{ x: 255, y: 270 }, { x: 404, y: 232 }],
  strikeFx: "voltNeedle",
  fxColor: 0xb48cff,
  // Tấn rộng phóng châm, tay kia chắn trước ngực (đánh thường), giơ châm qua đầu, tay kia đẩy chưởng (ra chiêu), kẹp hai
  // châm sau đầu lấy đà ném (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 217, y: 7 },
      anchor: { x: 630, y: 990 }, scale: 1.05, burst: { x: 1400, y: 130 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 181, y: 8 },
      anchor: { x: 700, y: 995 }, scale: 1.05, burst: { x: 1300, y: 420 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 277, y: 4 },
      anchor: { x: 690, y: 995 }, scale: 1.05, burst: { x: 1260, y: 215 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 54, y: 5 },
    anchor: { x: 680, y: 945 }, scale: 1 },
};
