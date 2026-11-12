import type { WarriorRig } from "./types";

/**
 * Ngô Nhật Khánh (Ngô Nam công), quân sư hệ Phong. Bộ tranh Shan gửi 12/11: khăn đỏ tía đính bài đồng, áo giao lĩnh
 * tía, áo khoác cộc nâu, khăn vai vàng nghệ, giáo tua đỏ, kiếm tra vỏ hông trái. Ảnh đứng tách lớp bằng code: nắm tay
 * cùng cây giáo dựng đứng xoay quanh nắm tay (giáo nằm ngoài thân nên không cần vá), bàn tay đặt trên chuôi kiếm phủ
 * lại, đầu cùng dải khăn. Năm tranh tư thế cắt từ một tấm 1536×1024 (đứng, phong thái, đánh thường | ra chiêu, tuyệt
 * chiêu, gục), giữ cỡ ô. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const NGO_NHAT_KHANH: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "ngo-nhat-khanh",
  texScale: 0.5,
  foot: { x: 541, y: 1505 },
  height: 1384,
  parts: {
    body: { x: 297, y: 121, w: 536, h: 1404 },
    armR: { x: 592, y: 700, w: 106, h: 100 },
    sword: { x: 191, y: 34, w: 118, h: 1486 },
    arm: { x: 230, y: 586, w: 100, h: 92 },
    head: { x: 322, y: 121, w: 272, h: 236 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 278, y: 630 },
    elbowR: { x: 645, y: 750 },
    neck: { x: 550, y: 337 },
  },
  blade: [{ x: 275, y: 630 }, { x: 270, y: 40 }],
  fxColor: 0x2e9e90,
  // Tấn thấp hai tay đâm giáo ngang (đánh thường), dựng giáo, tay kia giơ ra hiệu (ra chiêu), bước tới giương giáo chéo
  // cao (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 504, y: 1092 }, scale: 1.08, burst: { x: 1374, y: 624 } },
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 375, y: 1590 }, scale: 1.08, burst: { x: 855, y: 330 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 474, y: 1458 }, scale: 1.08, burst: { x: 1305, y: 30 } },
  },
  // Ngồi bệt ngả người, một chân duỗi, giáo rơi nằm trước mặt.
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 0, y: 0 },
    anchor: { x: 750, y: 987 }, scale: 1.08 },
};
