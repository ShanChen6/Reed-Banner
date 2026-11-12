import type { WarriorRig } from "./types";

/**
 * Nguyễn Thủ Tiệp, sứ quân Tiên Du, mưu sĩ hệ Thủy. Bộ tranh Shan gửi 12/11: khăn chít xanh đen, áo choàng ngắn thêu
 * sao bốn cánh, giáp lá, kiếm chuôi rồng bạc (thay bộ quạt lông cũ; phất trần giắt bên hông). Ảnh đứng tách lớp bằng
 * code: hai bàn tay chắp trên chuôi cùng thanh kiếm cắm mũi xuống xoay quanh nắm tay (chỗ kiếm che giáp, quần vá nội
 * suy theo hàng rồi làm mờ, ống ủng sau lưỡi kéo dài từ mép), cổ tay trái phủ lại, đầu cùng dải khăn. Năm tranh tư thế
 * cắt từ một tấm 1536×1024 (đứng, phong thái, đánh thường | ra chiêu, tuyệt chiêu, gục), giữ cỡ ô. Hệ tọa độ: ảnh
 * đứng 1024×1536.
 */
export const NGUYEN_THU_TIEP: WarriorRig = {
  skeleton: "warrior",
  dir: "nguyen-thu-tiep",
  texScale: 0.5,
  foot: { x: 565, y: 1508 },
  height: 1474,
  parts: {
    body: { x: 197, y: 34, w: 630, h: 1492 },
    armR: { x: 690, y: 588, w: 82, h: 76 },
    sword: { x: 580, y: 755, w: 184, h: 758 },
    arm: { x: 600, y: 632, w: 150, h: 138 },
    head: { x: 353, y: 34, w: 250, h: 262 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 673, y: 700 },
    elbowR: { x: 730, y: 625 },
    neck: { x: 555, y: 280 },
  },
  blade: [{ x: 670, y: 940 }, { x: 663, y: 1505 }],
  strikeFx: "supplyDrain",
  fxColor: 0x2f7fc1,
  // Sải bước đâm kiếm thẳng (đánh thường), dựng kiếm bên vai, tay kia xòe chặn (ra chiêu), hai tay vung kiếm chéo qua
  // đầu trong thế tấn rộng (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 525, y: 1236 }, scale: 1.06, burst: { x: 1704, y: 300 } },
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 360, y: 1608 }, scale: 1.06, burst: { x: 840, y: 390 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 594, y: 1509 }, scale: 1.06, burst: { x: 900, y: 15 } },
  },
  // Ngồi bệt ôm trán, tay chống đất, kiếm và phất trần rơi trước mặt.
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 0, y: 0 },
    anchor: { x: 720, y: 1113 }, scale: 1.06 },
};
