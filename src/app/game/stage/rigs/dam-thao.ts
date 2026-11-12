import type { WarriorRig } from "./types";

/**
 * Đàm Thảo, pháp sư hệ Mộc (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 09/11 (nền trong suốt sẵn), thay bộ
 * 25/10: áo xanh rêu thêu bông lau, tóc tết dài, gậy cành chạc buộc nhành lá. Ảnh đứng tách lớp bằng code: gậy cùng
 * nắm tay xoay quanh cổ tay, nhành lá ở chạc gậy sáng như cầu ngọc; bàn tay cầm bím tóc và đầu tách riêng (chỗ bàn
 * tay che bím tóc vá bằng khuếch tán màu). Tranh đứng ngắm nhành lá làm tranh phong thái. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const DAM_THAO: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "dam-thao",
  texScale: 0.5,
  foot: { x: 420, y: 1500 },
  height: 1500,
  parts: {
    body: { x: 225, y: 9, w: 538, h: 1522 },
    armR: { x: 528, y: 448, w: 96, h: 102 },
    sword: { x: 100, y: 305, w: 142, h: 1222 },
    arm: { x: 171, y: 490, w: 92, h: 142 },
    head: { x: 403, y: 9, w: 236, h: 246 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 210, y: 545 },
    elbowR: { x: 600, y: 520 },
    neck: { x: 520, y: 240 },
  },
  blade: [{ x: 210, y: 545 }, { x: 210, y: 330 }],
  orb: { x: 210, y: 330 },
  strikeFx: "thornBind",
  fxColor: 0x4f9a4a,
  // Đâm gậy thẳng về phía đối thủ (đánh thường), chống gậy xòe tay gọi rừng (ra chiêu), giơ gậy vươn tay (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 35, y: 10 },
      anchor: { x: 540, y: 985 }, scale: 1, burst: { x: 1495, y: 340 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 55, y: 15 },
      anchor: { x: 420, y: 1495 }, scale: 1, burst: { x: 909, y: 192 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 32, y: 9 },
      anchor: { x: 480, y: 1495 }, scale: 1, burst: { x: 717, y: 38 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 83, y: 28 },
    anchor: { x: 760, y: 1000 }, scale: 1.06 },
};
