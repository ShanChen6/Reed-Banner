import type { WarriorRig } from "./types";

/**
 * Lâm Tùng, tướng sĩ hệ Mộc (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 09/11 (nền trong suốt sẵn), thay bộ
 * 25/10: áo xanh lá, giáp mây bện cánh sen, côn gỗ lim bịt đồng (đổi nhịp vũ khí từ kiếm sang trượng). Ảnh đứng tách
 * lớp bằng code: côn cùng nắm tay phải xoay quanh cổ tay, bàn tay trái buông, đầu kèm khăn xanh. Phần ống tay sau côn
 * được vá. Tranh ngồi gốc cây gài nhành tùng làm tranh phong thái. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const LAM_TUNG: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "lam-tung",
  texScale: 0.5,
  foot: { x: 480, y: 1500 },
  height: 1504,
  parts: {
    body: { x: 202, y: 11, w: 538, h: 1504 },
    armR: { x: 661, y: 772, w: 90, h: 130 },
    sword: { x: 238, y: 234, w: 42, h: 1272 },
    arm: { x: 203, y: 588, w: 96, h: 94 },
    head: { x: 357, y: 11, w: 228, h: 226 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 258, y: 600 },
    elbowR: { x: 700, y: 780 },
    neck: { x: 520, y: 225 },
  },
  blade: [{ x: 258, y: 620 }, { x: 258, y: 240 }],
  strikeFx: "bambooSap",
  fxColor: 0x4f9a4a,
  // Đâm côn thẳng (đánh thường), dựng côn trước ngực (ra chiêu), giơ côn ngang qua đầu (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 26, y: 16 },
      anchor: { x: 505, y: 975 }, scale: 1, burst: { x: 1495, y: 370 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 95, y: 15 },
      anchor: { x: 530, y: 1495 }, scale: 1, burst: { x: 515, y: 290 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 46, y: 94 },
      anchor: { x: 515, y: 1470 }, scale: 1.05, burst: { x: 960, y: 110 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 39, y: 18 },
    anchor: { x: 780, y: 900 }, scale: 1 },
};
