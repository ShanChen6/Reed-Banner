import type { WarriorRig } from "./types";

/**
 * Lý Khuê, sứ quân Siêu Loại, tướng sĩ hệ Kim. Bộ tranh Shan gửi 12/11: áo choàng trắng ngà vá vảy vàng, giáp vảy bạc,
 * kiếm thẳng. Ảnh đứng tách lớp bằng code: hai bàn tay chắp trên chuôi cùng thanh kiếm cắm mũi xuống đất xoay quanh
 * nắm tay (chỗ kiếm che giáp và vạt áo vá nội suy theo hàng rồi làm mờ), cổ tay trái phủ lại, đầu. Năm tranh tư thế cắt
 * từ một tấm 1536×1024 (đứng, phong thái, đánh thường | ra chiêu, tuyệt chiêu, gục), giữ cỡ ô. Hệ tọa độ: ảnh đứng
 * 1024×1536.
 */
export const LY_KHUE: WarriorRig = {
  skeleton: "warrior",
  dir: "ly-khue",
  texScale: 0.5,
  foot: { x: 552, y: 1500 },
  height: 1466,
  parts: {
    body: { x: 154, y: 34, w: 716, h: 1476 },
    armR: { x: 650, y: 560, w: 96, h: 102 },
    sword: { x: 503, y: 735, w: 146, h: 790 },
    arm: { x: 493, y: 600, w: 162, h: 140 },
    head: { x: 386, y: 34, w: 202, h: 242 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 572, y: 680 },
    elbowR: { x: 700, y: 610 },
    neck: { x: 505, y: 255 },
  },
  blade: [{ x: 574, y: 880 }, { x: 575, y: 1515 }],
  strikeFx: "armorPierce",
  fxColor: 0x9ea4ad,
  // Sải bước đâm kiếm thẳng (đánh thường), giơ kiếm dựng đứng, tay kia xòe chặn (ra chiêu), hai tay vung kiếm qua đầu
  // trong thế tấn rộng (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 510, y: 1182 }, scale: 1.11, burst: { x: 1620, y: 294 } },
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 390, y: 1629 }, scale: 1.11, burst: { x: 120, y: 60 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 555, y: 1392 }, scale: 1.11, burst: { x: 1080, y: 285 } },
  },
  // Ngồi bệt dựa tay, cúi đầu, kiếm rơi nằm trước mặt.
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 0, y: 0 },
    anchor: { x: 660, y: 957 }, scale: 1.11 },
};
