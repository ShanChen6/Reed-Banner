import type { WarriorRig } from "./types";

/**
 * Lữ Đường, sứ quân Tế Giang, pháp sư hệ Thủy. Bộ tranh Shan gửi 12/11 (7 tranh rời, nền trong suốt): tóc búi tết
 * đuôi sam, áo choàng ngắn xanh thêu sóng và mái chèo vàng, giáp lá da, chuông đồng bên hông, đinh ba cán gỗ (thay bộ
 * trượng cầu nước cũ). Ảnh đứng tách lớp bằng code: nắm tay phải cùng cây đinh ba dựng đứng xoay quanh nắm tay (cổ
 * tay áo sau cán vá nội suy theo hàng), cẳng tay trái buông phủ lại, đầu. Tư thế giữ tranh nguồn 1536×1024. Hệ tọa
 * độ: ảnh đứng 1024×1536.
 */
export const LU_DUONG: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "lu-duong",
  texScale: 0.5,
  foot: { x: 513, y: 1505 },
  height: 1400,
  parts: {
    body: { x: 228, y: 104, w: 522, h: 1406 },
    armR: { x: 660, y: 690, w: 90, h: 224 },
    sword: { x: 225, y: 10, w: 118, h: 1496 },
    arm: { x: 250, y: 438, w: 74, h: 80 },
    head: { x: 433, y: 104, w: 174, h: 242 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 285, y: 478 },
    elbowR: { x: 705, y: 705 },
    neck: { x: 520, y: 330 },
  },
  blade: [{ x: 288, y: 470 }, { x: 288, y: 30 }],
  strikeFx: "waterPillar",
  fxColor: 0x2f7fc1,
  // Tấn dài hai tay đâm đinh ba (đánh thường), dựng đinh ba, tay kia đẩy chưởng (ra chiêu), hô lớn lao tới, đinh ba
  // chĩa chếch lên (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 48, y: 16 },
      anchor: { x: 530, y: 1000 }, scale: 1.02, burst: { x: 1500, y: 360 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 425, y: 4 },
      anchor: { x: 770, y: 1012 }, scale: 1.02, burst: { x: 1150, y: 215 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 74, y: 20 },
      anchor: { x: 635, y: 1010 }, scale: 1.02, burst: { x: 1500, y: 420 } },
  },
  // Quỳ một gối, cúi đầu, tay chống đất, đinh ba rơi trước mặt.
  down: { name: "pose-down", texScale: 0.4, origin: { x: 66, y: 11 },
    anchor: { x: 700, y: 880 }, scale: 1.02 },
};
