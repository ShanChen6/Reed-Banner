import type { WarriorRig } from "./types";

/**
 * Ngô Xương Xí, sứ quân Bình Kiều, tướng sĩ hệ Kim. Bộ tranh Shan gửi 12/11: khăn chít xanh đen, áo choàng ngắn thêu
 * cầu đá, giáp vảy bạc, kiếm thẳng (thay bộ quạt lông cũ). Ảnh đứng tách lớp bằng code: nắm tay phải cùng thanh kiếm
 * buông chéo bên trái xoay quanh nắm tay (kiếm nằm ngoài thân nên không cần vá), bàn tay trái chống hông phủ lại, đầu.
 * Năm tranh tư thế cắt từ một tấm 1536×1024 (đứng, phong thái, đánh thường | ra chiêu, tuyệt chiêu, gục), giữ cỡ ô.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const NGO_XUONG_XI: WarriorRig = {
  skeleton: "warrior",
  dir: "ngo-xuong-xi",
  texScale: 0.5,
  foot: { x: 606, y: 1505 },
  height: 1471,
  parts: {
    body: { x: 134, y: 34, w: 756, h: 1492 },
    armR: { x: 700, y: 612, w: 110, h: 106 },
    sword: { x: 134, y: 896, w: 222, h: 586 },
    arm: { x: 275, y: 775, w: 104, h: 142 },
    head: { x: 453, y: 34, w: 240, h: 268 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 325, y: 850 },
    elbowR: { x: 755, y: 665 },
    neck: { x: 592, y: 285 },
  },
  blade: [{ x: 318, y: 950 }, { x: 140, y: 1475 }],
  fxColor: 0xf1d28c,
  // Sải bước đâm kiếm thẳng (đánh thường), dựng kiếm trước ngực, hai ngón chỉ về trước (ra chiêu), tấn rộng kiếm chếch
  // xuống, tay kia vươn xòe (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 534, y: 1296 }, scale: 1.04, burst: { x: 1635, y: 285 } },
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 336, y: 1563 }, scale: 1.04, burst: { x: 945, y: 300 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 810, y: 1371 }, scale: 1.04, burst: { x: 1740, y: 285 } },
  },
  // Ngồi bệt dựa gối, cúi đầu, kiếm và ống thư rơi trước mặt.
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 0, y: 0 },
    anchor: { x: 720, y: 1137 }, scale: 1.04 },
};
