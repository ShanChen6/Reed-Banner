import type { WarriorRig } from "./types";

/**
 * Đinh Điền, binh lính hệ Thổ. Bộ tranh Shan gửi 12/11 là một tờ ghép 6 dáng (1536×1024, nền trong suốt); mỗi dáng phóng
 * ×3 làm hệ tọa độ (ảnh đứng đặt vào khung 1024×1536). Ảnh đứng tách lớp bằng code: giáo cùng nắm tay phải xoay quanh cổ
 * tay, khiên gỗ lớn bên trái là lớp armR lắc nhẹ (thân giữ nguyên phần sau khiên), đầu (cả nón lá, dải buộc đỏ) tách riêng.
 */
export const DINH_DIEN: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "dinh-dien",
  texScale: 0.5,
  foot: { x: 520, y: 1515 },
  height: 1490,
  parts: {
    body: { x: 239, y: 114, w: 700, h: 1412 },
    armR: { x: 655, y: 375, w: 284, h: 802 },
    sword: { x: 84, y: 34, w: 202, h: 1476 },
    arm: { x: 150, y: 598, w: 90, h: 116 },
    head: { x: 330, y: 114, w: 350, h: 232 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 205, y: 655 },
    elbowR: { x: 700, y: 420 },
    neck: { x: 500, y: 335 },
  },
  blade: [{ x: 195, y: 600 }, { x: 182, y: 40 }],
  fxColor: 0xd9ad65,
  // Đâm giáo ngang ngực sau khiên (đánh thường), tấn rộng kéo giáo ngang hông (ra chiêu), lao tới đâm giáo chếch xuống,
  // khiên chắn sau lưng (tuyệt chiêu). Tranh tư thế lưu đúng cỡ ô trong tờ ghép (texScale 1/3).
  poses: {
    attack: { name: "pose-attack", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 700, y: 1188 }, scale: 1, burst: { x: 1520, y: 325 } },
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 640, y: 1101 }, scale: 1, burst: { x: 1480, y: 294 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 690, y: 1146 }, scale: 1, burst: { x: 1500, y: 744 } },
  },
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 0, y: 0 },
    anchor: { x: 650, y: 1390 }, scale: 1 },
};
