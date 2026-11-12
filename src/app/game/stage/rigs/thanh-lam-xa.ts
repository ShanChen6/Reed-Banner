import type { WarriorRig } from "./types";

/**
 * Quản Hiên (ngoại hiệu Thanh Lâm Xạ), xạ thủ hệ Mộc (RB-063). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong
 * suốt sẵn), thay bộ 29/10: áo lục thêu mặt trời, tóc tết đuôi sam, cung tre dài, giỏ tên đan bên hông. Ảnh đứng
 * 1024×1536 tách lớp bằng code: cung tre (cả dây) cùng bàn tay cầm cung xoay quanh cổ tay như trượng (cung nằm ngoài
 * thân nên không cần vá), bàn tay buông cạnh giỏ tên và đầu tách riêng; bím tóc, giỏ tên ở lại thân. Tranh đứng một
 * chân đặt ngón tay lên môi làm phong thái. Tranh tư thế vẽ người nhỏ trong khung ngang nên phóng lên.
 */
export const THANH_LAM_XA: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "thanh-lam-xa",
  texScale: 0.5,
  foot: { x: 430, y: 1495 },
  height: 1430,
  parts: {
    body: { x: 196, y: 67, w: 518, h: 1432 },
    armR: { x: 270, y: 740, w: 74, h: 142 },
    sword: { x: 620, y: 12, w: 170, h: 1460 },
    arm: { x: 702, y: 615, w: 88, h: 82 },
    head: { x: 335, y: 67, w: 196, h: 264 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 728, y: 660 },
    elbowR: { x: 310, y: 750 },
    neck: { x: 440, y: 300 },
  },
  blade: [{ x: 745, y: 660 }, { x: 735, y: 20 }],
  strikeFx: "thicketShot",
  fxColor: 0x4f9a4a,
  // Đứng tấn kéo căng cung bắn thẳng (đánh thường), lách người một chân co, tay xòe niệm chú (ra chiêu), hạ thấp người
  // kéo cung sát má bắn phá (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 474, y: 9 },
      anchor: { x: 680, y: 990 }, scale: 1.45, burst: { x: 1095, y: 300 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 377, y: 12 },
      anchor: { x: 1120, y: 1000 }, scale: 1.3, burst: { x: 1310, y: 460 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 106, y: 3 },
      anchor: { x: 620, y: 1000 }, scale: 1.15, burst: { x: 1390, y: 410 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 146, y: 40 },
    anchor: { x: 1100, y: 960 }, scale: 1.1 },
};
