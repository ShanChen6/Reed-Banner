import type { WarriorRig } from "./types";

/**
 * Kha Sơn, tướng sĩ hệ Thổ (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11 (nền trong suốt sẵn), thay bộ 28/10:
 * đầu cạo trọc, áo nâu giáp vảy vuông, phủ việt lưỡi rìu đồng khắc mặt trời và mây. Ảnh đứng 1024×1536 tách lớp bằng
 * code: phủ việt dựng cùng nắm tay xoay quanh cổ tay theo nhịp bổ (tay áo sau cán vá bằng phản chiếu, vạt áo bằng nội suy
 * ngang), bàn tay buông và đầu tách riêng. Tranh hai tay ghì cán đứng làm phong thái.
 */
export const KHA_SON: WarriorRig = {
  skeleton: "warrior",
  // Phủ việt cán dài dựng đứng: đi nhịp vũ khí cán dài để lúc đỡ đòn, được khiên, được tăng, chiến thắng chỉ nghiêng nhẹ,
  // không lật cả cán quanh cổ tay như kiếm.
  weapon: "spear",
  dir: "kha-son",
  texScale: 0.5,
  foot: { x: 470, y: 1510 },
  height: 1410,
  parts: {
    body: { x: 177, y: 103, w: 662, h: 1424 },
    armR: { x: 745, y: 772, w: 102, h: 164 },
    sword: { x: 94, y: 11, w: 220, h: 1506 },
    arm: { x: 238, y: 432, w: 94, h: 84 },
    head: { x: 420, y: 103, w: 220, h: 228 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 285, y: 470 },
    elbowR: { x: 800, y: 790 },
    neck: { x: 520, y: 320 },
  },
  blade: [{ x: 290, y: 470 }, { x: 290, y: 20 }],
  strikeFx: "mountainCrush",
  fxColor: 0xc8963c,
  // Tấn ngang đẩy phủ việt (đánh thường), ngồi tấn ghì cán dựng (ra chiêu), vặn người bổ phủ việt chéo xuống (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 42, y: 19 },
      anchor: { x: 780, y: 990 }, scale: 1.25, burst: { x: 1440, y: 435 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 33, y: 43 },
      anchor: { x: 500, y: 1390 }, scale: 1.05, burst: { x: 440, y: 70 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 16, y: 39 },
      anchor: { x: 740, y: 1000 }, scale: 1.2, burst: { x: 1450, y: 700 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 43, y: 32 },
    anchor: { x: 900, y: 950 }, scale: 1 },
};
