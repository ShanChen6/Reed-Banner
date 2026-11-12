import type { WarriorRig } from "./types";

/**
 * Mai Thanh, y sư hệ Thủy (tướng khởi đầu). Bộ tranh phong cách mới Shan gửi 09/11/2026 (ảnh chuẩn, nền trong suốt;
 * prompt ở docs/06-art/prompts/mai-thanh.md). Ảnh đứng tách lớp bằng code: hồ lô men xanh lắc quanh nắm tay, nắm tay
 * xoay quanh cổ tay; bàn tay buông và đầu tách riêng; thân đã xóa hồ lô, nắm tay và bàn tay rồi vá phần vải phía sau.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const MAI_THANH: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 262, y: 790 },
  dir: "mai-thanh",
  texScale: 0.5,
  foot: { x: 445, y: 1528 },
  height: 1520,
  parts: {
    body: { x: 234, y: 7, w: 568, h: 1524 },
    armR: { x: 582, y: 652, w: 76, h: 108 },
    sword: { x: 170, y: 780, w: 152, h: 330 },
    arm: { x: 229, y: 728, w: 70, h: 100 },
    head: { x: 372, y: 7, w: 234, h: 242 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 266, y: 742 },
    elbowR: { x: 628, y: 656 },
    neck: { x: 540, y: 235 },
  },
  blade: [{ x: 262, y: 790 }, { x: 258, y: 1108 }],
  strikeFx: "springDew",
  fxColor: 0x2f7fc1,
  // Bước tới đẩy chưởng, hồ lô đung đưa sau lưng (đánh thường), nâng hồ lô hai tay trước ngực (ra chiêu), giơ cao hồ lô
  // một tay, tay kia ngửa ra trao (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 16, y: 15 },
      anchor: { x: 465, y: 1520 }, scale: 1, burst: { x: 940, y: 330 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 197, y: 9 },
      anchor: { x: 441, y: 1530 }, scale: 1, burst: { x: 712, y: 190 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 50, y: 16 },
      anchor: { x: 467, y: 1525 }, scale: 1, burst: { x: 225, y: 260 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 65, y: 29 },
    anchor: { x: 760, y: 970 }, scale: 0.9 },
};
