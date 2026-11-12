import type { WarriorRig } from "./types";

/**
 * Ông Chấn, binh lính hệ Lôi (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 29/10: áo gile tím thêu núi sét, đôi dùi trống giắt lưng, giản sắt gai xoắn thay giáo và khiên. Ảnh đứng 1024×1536 tách
 * lớp bằng code: giản cùng nắm tay xoay quanh cổ tay (giản nằm ngoài thân, đoạn cẳng tay sau chuôi để trống), nắm tay
 * buông là tay không, đầu tách riêng. Tranh gác chân lên trống làm phong thái.
 */
export const ONG_CHAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "ong-chan",
  texScale: 0.5,
  foot: { x: 500, y: 1518 },
  height: 1430,
  parts: {
    body: { x: 193, y: 87, w: 662, h: 1436 },
    armR: { x: 745, y: 770, w: 110, h: 114 },
    sword: { x: 164, y: 8, w: 70, h: 870 },
    arm: { x: 152, y: 626, w: 92, h: 100 },
    head: { x: 415, y: 87, w: 212, h: 230 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 222, y: 668 },
    elbowR: { x: 800, y: 825 },
    neck: { x: 530, y: 300 },
  },
  blade: [{ x: 200, y: 640 }, { x: 205, y: 20 }],
  strikeFx: "thunderAegis",
  fxColor: 0xb48cff,
  // Đâm giản ngang tấn thấp (đánh thường), hai tay dựng giản trước ngực (ra chiêu), vung giản qua đầu (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 101, y: 14 },
      anchor: { x: 680, y: 1018 }, scale: 1.12, burst: { x: 1470, y: 410 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 91, y: 26 },
      anchor: { x: 505, y: 1519 }, scale: 1, burst: { x: 620, y: 40 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 40, y: 14 },
      anchor: { x: 510, y: 1508 }, scale: 1.05, burst: { x: 880, y: 25 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 18, y: 21 },
    anchor: { x: 760, y: 990 }, scale: 1.1 },
};
