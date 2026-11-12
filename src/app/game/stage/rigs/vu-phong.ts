import type { WarriorRig } from "./types";

/**
 * Vũ Phong (Trần Vũ Phong – Vân Du Tử), nhân vật đặc biệt dung hợp tám nghề/bảy hệ, phòng thủ Phong (đang thiết kế, chưa
 * có trong roster; chỉ có trên trang xem thử, docs/03-characters/vu-phong.md). Bộ tranh Shan gửi 02/11 (nền trong suốt
 * sẵn). Ảnh đứng tách lớp bằng code: trượng trúc cùng nắm tay phải xoay quanh cổ tay, bàn tay trái, đầu (cả dải buộc tóc)
 * và đuôi khăn bay tách riêng; thân giữ búi tóc sau lưng, hồ lô và túi. Trượng dựng xuống đất nên dùng nhịp `staff` nhẹ.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const VU_PHONG: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "vu-phong",
  texScale: 0.5,
  foot: { x: 510, y: 1500 },
  height: 1490,
  parts: {
    body: { x: 184, y: 209, w: 822, h: 1308 },
    armR: { x: 711, y: 728, w: 76, h: 124 },
    sword: { x: 187, y: 691, w: 86, h: 800 },
    arm: { x: 174, y: 584, w: 118, h: 118 },
    head: { x: 382, y: 6, w: 286, h: 260 },
  },
  cloth: [
    { name: "scarf", box: { x: 697, y: 316, w: 306, h: 198 },
      wind: { axis: "x", start: 0.12, amp: 9, freq: 1.5, k: 3.2, phase: 0.5, vertical: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 240, y: 604 },
    elbowR: { x: 745, y: 752 },
    neck: { x: 520, y: 245 },
  },
  blade: [{ x: 245, y: 700 }, { x: 220, y: 1478 }],
  strikeFx: "galeRout",
  fxColor: 0x2e9e90,
  // Quét trượng ngang thấp, tay trái mở (đánh thường), chùng gối bước ngang dẫn mưa bằng chưởng trái, trượng chúc chéo
  // (ra chiêu ô2), tấn rộng dựng trượng chéo trên đầu dang tay trái gọi gió (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 56, y: 74 },
      anchor: { x: 487, y: 1478 }, scale: 1, burst: { x: 930, y: 748 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 22, y: 290 },
      anchor: { x: 495, y: 1296 }, scale: 0.92, burst: { x: 967, y: 622 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 22, y: 0 },
      anchor: { x: 570, y: 1282 }, scale: 0.92, burst: { x: 1155, y: 385 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 32, y: 10 },
    anchor: { x: 870, y: 965 }, scale: 0.85 },
};
