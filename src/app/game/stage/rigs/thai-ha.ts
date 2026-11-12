import type { WarriorRig } from "./types";

/**
 * Thái Hà, binh lính hệ Thủy (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 10/11: chùy gai cán gỗ vác vai, lưới đánh cá và cuộn thừng vắt vai, áo chàm thêu sóng. Ảnh đứng 1024×1536 tách lớp
 * bằng code: chùy cùng nắm tay xoay quanh cổ tay (đoạn cán sau gáy che bằng lớp cổ áo tĩnh), bàn tay giữ thừng là tay
 * không, đầu tách riêng. Tranh ngồi vá lưới làm phong thái.
 */
export const THAI_HA: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "thai-ha",
  texScale: 0.5,
  foot: { x: 500, y: 1515 },
  height: 1505,
  parts: {
    body: { x: 205, y: 9, w: 646, h: 1518 },
    armR: { x: 645, y: 355, w: 102, h: 116 },
    sword: { x: 84, y: 144, w: 774, h: 204 },
    arm: { x: 258, y: 241, w: 112, h: 92 },
    head: { x: 384, y: 9, w: 246, h: 226 },
  },
  cloth: [],
  covers: [{ name: "collar", box: { x: 452, y: 209, w: 158, h: 74 } }],
  joints: {
    shoulder: { x: 318, y: 318 },
    elbowR: { x: 695, y: 412 },
    neck: { x: 510, y: 215 },
  },
  blade: [{ x: 318, y: 300 }, { x: 795, y: 205 }],
  strikeFx: "tideBulwark",
  fxColor: 0x2f7fc1,
  // Lao chùy ngang (đánh thường), dựng chùy trước ngực (ra chiêu), giơ chùy qua đầu bổ xuống (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 143, y: 10 },
      anchor: { x: 660, y: 1005 }, scale: 1.18, burst: { x: 1330, y: 490 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 204, y: 10 },
      anchor: { x: 500, y: 1515 }, scale: 1, burst: { x: 645, y: 140 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 39, y: 9 },
      anchor: { x: 520, y: 1515 }, scale: 0.95, burst: { x: 110, y: 60 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 18, y: 11 },
    anchor: { x: 760, y: 990 }, scale: 1.15 },
};
