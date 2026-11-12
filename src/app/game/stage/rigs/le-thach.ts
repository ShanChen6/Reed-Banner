import type { WarriorRig } from "./types";

/**
 * Lê Thạch, binh lính hệ Thổ (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11 (nền trong suốt sẵn), thay bộ 09/11:
 * nón lá, áo gi lê xanh rêu thêu hoa văn, khăn đỏ thắt lưng, giáo mũi đồng tua đỏ và khiên mây cài lông trắng. Ảnh đứng
 * 1024×1536 tách lớp bằng code: giáo cùng nắm tay xoay quanh cổ tay (cán giáo trước vạt áo vá bằng nội suy ngang), khiên
 * mây kèm lông trắng nâng lên khi vào thế và đỡ đòn (vạt áo sau khiên vá bằng mảnh áo bên cạnh), đầu đội nón tách riêng.
 * Tranh quỳ một gối chống giáo làm phong thái.
 */
export const LE_THACH: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "le-thach",
  texScale: 0.5,
  foot: { x: 500, y: 1505 },
  height: 1420,
  parts: {
    body: { x: 175, y: 87, w: 558, h: 1432 },
    armR: { x: 538, y: 367, w: 354, h: 618 },
    sword: { x: 207, y: 1, w: 78, h: 1504 },
    arm: { x: 180, y: 458, w: 112, h: 136 },
    head: { x: 330, y: 87, w: 300, h: 258 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 250, y: 525 },
    elbowR: { x: 640, y: 560 },
    neck: { x: 500, y: 330 },
  },
  blade: [{ x: 250, y: 520 }, { x: 250, y: 15 }],
  shieldRaise: -0.35,
  strikeFx: "tauntRoar",
  fxColor: 0xc8963c,
  // Tấn thấp đâm giáo ngang, khiên đeo lưng (đánh thường), dang chân đẩy khiên ra trước (ra chiêu), lao tới đâm giáo
  // dưới khiên (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 46, y: 42 },
      anchor: { x: 500, y: 960 }, scale: 1.13, burst: { x: 1460, y: 345 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 18, y: 3 },
      anchor: { x: 510, y: 1500 }, scale: 1, burst: { x: 850, y: 600 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 24, y: 5 },
      anchor: { x: 650, y: 950 }, scale: 1.13, burst: { x: 1456, y: 522 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 42, y: 64 },
    anchor: { x: 800, y: 900 }, scale: 1.05 },
};
