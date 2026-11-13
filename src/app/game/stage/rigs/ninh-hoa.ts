import type { WarriorRig } from "./types";

/**
 * Ninh Hỏa, mưu sĩ hệ Hỏa (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 03/11: áo choàng đỏ viền răng cưa thêu thành lũy, búi tóc buộc dải đỏ, quạt lông vũ viền vàng có tua đỏ. Ảnh đứng
 * 1024×1536 tách lớp bằng code: quạt cùng nắm tay xoay quanh cổ tay (ngực áo sau quạt vá màu áo, chỉ lộ mép khi quạt
 * nhích), tay trái chắp sau lưng nên lớp tay không là túi gấm treo thắt lưng đung đưa, đầu tách riêng. Tranh nghiêng
 * người che quạt trước miệng làm phong thái.
 */
export const NINH_HOA: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  dir: "ninh-hoa",
  texScale: 0.5,
  foot: { x: 500, y: 1525 },
  height: 1506,
  parts: {
    body: { x: 255, y: 19, w: 496, h: 1508 },
    armR: { x: 596, y: 684, w: 78, h: 108 },
    sword: { x: 308, y: 279, w: 232, h: 448 },
    arm: { x: 338, y: 468, w: 96, h: 86 },
    head: { x: 430, y: 19, w: 196, h: 244 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 385, y: 505 },
    elbowR: { x: 632, y: 692 },
    neck: { x: 530, y: 250 },
  },
  blade: [{ x: 400, y: 470 }, { x: 425, y: 320 }],
  strikeFx: "granaryBlaze",
  fxColor: 0xe0602a,
  // Tấn rộng, quạt hạ ngang hông, hai ngón chỉ đường (đánh thường), giơ quạt cạnh đầu, tay trái đưa ngang (ra chiêu),
  // quạt che mặt, tay trái úp chưởng ra lệnh đốt kho lương (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 231, y: 4 },
      anchor: { x: 720, y: 1022 }, scale: 1, burst: { x: 1200, y: 180 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 147, y: 12 },
      anchor: { x: 470, y: 1525 }, scale: 1, burst: { x: 950, y: 310 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 174, y: 7 },
      anchor: { x: 465, y: 1527 }, scale: 1, burst: { x: 830, y: 280 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 69, y: 13 },
    anchor: { x: 760, y: 1000 }, scale: 0.95 },
};
