import type { WarriorRig } from "./types";

/**
 * Mã Liên (tên cũ Bế Liên), y sư hệ Thổ (tướng cửa hàng). Bộ tranh Shan gửi 28/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code như
 * Hồng Đan: bàn tay đặt trên quả bầu nậm lớn cùng bầu nậm xoay quanh cổ tay (chỗ bầu che thân được vá màu), cẳng tay
 * buông bên phải và đầu quấn khăn tách riêng. Tranh tay vuốt vòng bạc làm tranh phong thái. Hệ tọa độ: ảnh đứng
 * 1024×1536.
 */
export const BE_LIEN: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 318, y: 592 },
  dir: "be-lien",
  texScale: 0.5,
  foot: { x: 520, y: 1505 },
  height: 1500,
  parts: {
    body: { x: 233, y: 2, w: 533, h: 1528 },
    armR: { x: 680, y: 578, w: 113, h: 254 },
    sword: { x: 232, y: 490, w: 225, h: 340 },
    arm: { x: 288, y: 580, w: 106, h: 126 },
    head: { x: 392, y: 0, w: 229, h: 241 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 318, y: 592 },
    elbowR: { x: 712, y: 582 },
    neck: { x: 530, y: 232 },
  },
  blade: [{ x: 318, y: 592 }, { x: 340, y: 820 }],
  strikeFx: "earthMend",
  fxColor: 0xd4a94e,
  // Đẩy chưởng ra trước (đánh thường), nhón viên thuốc khỏi lọ nhỏ (ra chiêu), xòe tay trao sinh khí cho cả đội
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 124, y: 9 },
      anchor: { x: 560, y: 1470 }, scale: 1, burst: { x: 930, y: 260 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 204, y: 10 },
      anchor: { x: 570, y: 1480 }, scale: 1, burst: { x: 615, y: 345 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 110, y: 12 },
      anchor: { x: 560, y: 1470 }, scale: 1, burst: { x: 930, y: 480 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 36, y: 19 },
    anchor: { x: 800, y: 990 }, scale: 0.8 },
};
