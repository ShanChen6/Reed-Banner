import type { WarriorRig } from "./types";

/**
 * Lý Liệt, tướng sĩ hệ Hỏa (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 09/11 (nền trong suốt sẵn), thay bộ
 * 26/10: áo đỏ gạch ba vạch vuốt cam, giáp da tán đinh đồng, đao cán dài buộc dải vải đỏ. Ảnh đứng tách lớp bằng code
 * như Hồ Lãng: đao (cả dải vải) cùng nắm tay phải xoay quanh cổ tay theo nhịp giáo, bàn tay trái chống hông, đầu tách
 * riêng. Phần cẳng tay và hộ uyển sau cán được vá. Tranh vác đao trên vai làm tranh phong thái.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const LY_LIET: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "ly-liet",
  texScale: 0.5,
  foot: { x: 520, y: 1500 },
  height: 1270,
  parts: {
    body: { x: 263, y: 242, w: 488, h: 1272 },
    armR: { x: 595, y: 685, w: 96, h: 88 },
    sword: { x: 216, y: 7, w: 156, h: 1490 },
    arm: { x: 300, y: 460, w: 72, h: 76 },
    head: { x: 370, y: 242, w: 264, h: 208 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 335, y: 500 },
    elbowR: { x: 680, y: 700 },
    neck: { x: 500, y: 435 },
  },
  blade: [{ x: 335, y: 500 }, { x: 330, y: 20 }],
  strikeFx: "flameCleave",
  fxColor: 0xd9502a,
  // Tấn rộng đâm đao ngang (đánh thường), hất đao chéo lên (ra chiêu), hai tay giơ đao qua đầu (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 44, y: 116 },
      anchor: { x: 520, y: 945 }, scale: 1, burst: { x: 1500, y: 420 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 10, y: 159 },
      anchor: { x: 515, y: 1345 }, scale: 1, burst: { x: 990, y: 170 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 12, y: 8 },
      anchor: { x: 480, y: 1495 }, scale: 1, burst: { x: 990, y: 25 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 36, y: 99 },
    anchor: { x: 760, y: 880 }, scale: 1 },
};
