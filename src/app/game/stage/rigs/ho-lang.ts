import type { WarriorRig } from "./types";

/**
 * Hồ Lãng, tướng sĩ hệ Thủy (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 09/11 (nền trong suốt sẵn), thay bộ
 * 26/10: áo xanh sẫm vân sông, giáp da tán đinh, đinh ba đồng và lưới chài đeo hông. Ảnh đứng tách lớp bằng code: đinh
 * ba cùng nắm tay phải xoay quanh cổ tay theo nhịp đẩy giáo, bàn tay trái chống hông, đầu kèm khăn lam. Phần cẳng tay
 * sau cán được vá. Tranh ngồi mũi thuyền vá lưới làm tranh phong thái. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const HO_LANG: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "ho-lang",
  texScale: 0.5,
  foot: { x: 520, y: 1480 },
  height: 1385,
  parts: {
    body: { x: 222, y: 105, w: 608, h: 1386 },
    armR: { x: 568, y: 628, w: 122, h: 96 },
    sword: { x: 184, y: 10, w: 184, h: 1480 },
    arm: { x: 235, y: 380, w: 82, h: 84 },
    head: { x: 362, y: 105, w: 280, h: 226 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 280, y: 440 },
    elbowR: { x: 680, y: 660 },
    neck: { x: 540, y: 320 },
  },
  blade: [{ x: 280, y: 440 }, { x: 278, y: 30 }],
  strikeFx: "frostSpear",
  fxColor: 0x2f7fc1,
  // Đâm đinh ba ngang tầm ngực (đánh thường), quăng lưới chài (ra chiêu), giơ đinh ba chỉ trời vươn tay (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 59, y: 95 },
      anchor: { x: 550, y: 935 }, scale: 1, burst: { x: 1495, y: 360 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 33, y: 33 },
      anchor: { x: 455, y: 1470 }, scale: 0.87, burst: { x: 880, y: 700 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 29, y: 9 },
      anchor: { x: 487, y: 1478 }, scale: 1, burst: { x: 487, y: 64 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 50, y: 99 },
    anchor: { x: 760, y: 880 }, scale: 1 },
};
