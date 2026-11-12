import type { WarriorRig } from "./types";

/**
 * Doãn Nham, pháp sư hệ Thổ (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 10/11 (nền trong suốt sẵn), thay bộ
 * 28/10: áo nâu đất thêu dây leo, khăn cam buộc búi tóc bạc, trượng gỗ buộc đá, chuông đồng đeo cổ tay. Ảnh đứng
 * (1037×1517, giữ khổ) tách lớp bằng code: trượng cùng nắm tay xoay quanh cổ tay, khối đá đầu trượng sáng riêng; bàn
 * tay xòe và đầu tách riêng. Tranh ngồi xổm chống trượng làm tranh phong thái. Tranh ra đòn và tuyệt chiêu vẽ người
 * nhỏ hơn trong khung nên phóng ×1,3 và ×1,25.
 */
export const DOAN_NHAM: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "doan-nham",
  texScale: 0.5,
  foot: { x: 540, y: 1490 },
  height: 1480,
  parts: {
    body: { x: 159, y: 13, w: 772, h: 1492 },
    armR: { x: 822, y: 240, w: 166, h: 192 },
    sword: { x: 55, y: 56, w: 148, h: 1438 },
    arm: { x: 81, y: 450, w: 132, h: 122 },
    head: { x: 334, y: 13, w: 276, h: 252 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 150, y: 510 },
    elbowR: { x: 850, y: 415 },
    neck: { x: 500, y: 250 },
  },
  blade: [{ x: 150, y: 510 }, { x: 115, y: 100 }],
  orb: { x: 115, y: 100 },
  strikeFx: "earthSurge",
  fxColor: 0xd8902e,
  // Chĩa trượng đầu đá ngang về phía đối thủ (đánh thường), chống trượng xòe tay trấn (ra chiêu), tấn thấp kéo đầu đá
  // sát đất (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 89, y: 3 },
      anchor: { x: 540, y: 1125 }, scale: 1.3, burst: { x: 1240, y: 450 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 55, y: 12 },
      anchor: { x: 560, y: 1500 }, scale: 1, burst: { x: 880, y: 280 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 29, y: 5 },
      anchor: { x: 585, y: 1140 }, scale: 1.25, burst: { x: 1240, y: 1030 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 31, y: 6 },
    anchor: { x: 760, y: 900 }, scale: 1.15 },
};
