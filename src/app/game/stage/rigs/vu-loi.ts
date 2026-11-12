import type { WarriorRig } from "./types";

/**
 * Vũ Lôi, pháp sư hệ Lôi (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 10/11 (nền trong suốt sẵn), thay bộ 29/10:
 * áo tím thêu mặt trời và tia sét, khăn tím buộc búi tóc, kiếm gỗ đào khắc vân sét (vũ khí đổi từ trượng sang kiếm).
 * Ảnh đứng (983×1600, giữ khổ) tách lớp bằng code: kiếm cùng nắm tay xoay quanh cổ tay theo nhịp chém, bàn tay kết ấn
 * hai ngón và đầu tách riêng. Tranh đứng kết ấn dùng cả cho ra chiêu; tranh hai tay dựng kiếm làm tranh phong thái.
 * Cỡ người các tranh tư thế so theo chiều cao đầu.
 */
export const VU_LOI: WarriorRig = {
  skeleton: "warrior",
  dir: "vu-loi",
  texScale: 0.5,
  foot: { x: 460, y: 1580 },
  height: 1575,
  parts: {
    body: { x: 91, y: 6, w: 682, h: 1586 },
    armR: { x: 170, y: 107, w: 108, h: 194 },
    sword: { x: 772, y: 614, w: 98, h: 950 },
    arm: { x: 772, y: 670, w: 88, h: 90 },
    head: { x: 310, y: 6, w: 228, h: 240 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 815, y: 720 },
    elbowR: { x: 230, y: 290 },
    neck: { x: 440, y: 235 },
  },
  blade: [{ x: 812, y: 820 }, { x: 810, y: 1550 }],
  strikeFx: "heavenStrike",
  fxColor: 0xb48cff,
  // Đâm kiếm thẳng (đánh thường), kết ấn hai ngón gọi sét (ra chiêu), giơ kiếm qua đầu xòe tay (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 17, y: 10 },
      anchor: { x: 430, y: 1495 }, scale: 0.85, burst: { x: 1005, y: 372 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 91, y: 6 },
      anchor: { x: 460, y: 1580 }, scale: 1, burst: { x: 205, y: 105 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 62, y: 11 },
      anchor: { x: 575, y: 1335 }, scale: 1.05, burst: { x: 887, y: 24 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 7, y: 9 },
    anchor: { x: 600, y: 1200 }, scale: 0.7 },
};
