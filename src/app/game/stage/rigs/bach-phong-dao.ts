import type { WarriorRig } from "./types";

/**
 * Phan Quyên (ngoại hiệu Bạch Phong Đao), sát thủ hệ Kim (RB-069, nghề Sát thủ chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi
 * 12/11 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code: dao găm cùng nắm tay buông bên trái xoay quanh cổ tay theo nhịp
 * chém, bàn tay phải giơ chưởng và đầu tách riêng; bao dao ở lại thân. Tuyệt chiêu dùng chung hiệu ứng xuyên giáp với
 * Bạch Nỏ Lang. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const BACH_PHONG_DAO: WarriorRig = {
  skeleton: "warrior",
  dir: "bach-phong-dao",
  texScale: 0.5,
  foot: { x: 500, y: 1520 },
  height: 1510,
  parts: {
    body: { x: 197, y: 8, w: 602, h: 1518 },
    armR: { x: 645, y: 292, w: 84, h: 154 },
    sword: { x: 185, y: 874, w: 82, h: 186 },
    arm: { x: 168, y: 772, w: 86, h: 116 },
    head: { x: 358, y: 8, w: 262, h: 254 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 220, y: 778 },
    elbowR: { x: 712, y: 435 },
    neck: { x: 520, y: 250 },
  },
  blade: [{ x: 230, y: 880 }, { x: 264, y: 1060 }],
  strikeFx: "boltBreach",
  fxColor: 0x9ea4ad,
  // Bước tới đâm dao thấp, tay kia che ngực (đánh thường), kéo dao ra sau, tay kia đẩy chưởng (ra chiêu), lao dài đâm
  // thẳng dao ngang vai (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 347, y: 10 },
      anchor: { x: 650, y: 995 }, scale: 1.15, burst: { x: 1160, y: 460 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 294, y: 7 },
      anchor: { x: 720, y: 995 }, scale: 1.15, burst: { x: 1210, y: 270 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 52, y: 16 },
      anchor: { x: 640, y: 995 }, scale: 1.05, burst: { x: 1500, y: 280 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 27, y: 72 },
    anchor: { x: 750, y: 960 }, scale: 1 },
};
