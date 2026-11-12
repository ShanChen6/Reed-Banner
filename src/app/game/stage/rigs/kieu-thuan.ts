import type { WarriorRig } from "./types";

/**
 * Kiều Thuận, sứ quân Hồi Hồ, y sư hệ Mộc. Bộ tranh Shan gửi 12/11: khăn chít lá, áo lá sen, giáp vảy nâu đỏ, bầu thuốc
 * treo dây ở tay phải, kiếm ngắn trong vỏ bên hông trái. Ảnh đứng tách lớp bằng code: nắm tay phải xoay quanh cổ tay,
 * bầu thuốc lắc quanh nắm tay (giáp sau bầu vá bằng vân giáp soi gương ngay bên phải, phần ngoài mép váy để trong), bàn
 * tay trái chống hông là lớp tay không, đầu. Tranh đánh thường có nền tối sẵn nên tách bằng GrabCut. Năm tranh tư thế
 * để riêng, giữ tọa độ ảnh gốc. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const KIEU_THUAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 362, y: 712 },
  dir: "kieu-thuan",
  texScale: 0.5,
  foot: { x: 480, y: 1505 },
  height: 1485,
  parts: {
    body: { x: 211, y: 20, w: 602, h: 1504 },
    armR: { x: 588, y: 540, w: 116, h: 104 },
    sword: { x: 260, y: 700, w: 124, h: 242 },
    arm: { x: 281, y: 661, w: 100, h: 92 },
    head: { x: 400, y: 40, w: 220, h: 290 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 320, y: 668 },
    elbowR: { x: 690, y: 575 },
    neck: { x: 505, y: 300 },
  },
  blade: [{ x: 362, y: 712 }, { x: 320, y: 935 }],
  strikeFx: "leafBloom",
  fxColor: 0x4f9a4a,
  // Rút kiếm đâm, tay trái mở chặn (đánh thường), tấn rộng ôm bầu thuốc, tay đưa về phía trước (ra chiêu), áp bầu lên
  // ngực, mở tay về đồng minh (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 34, y: 107 },
      anchor: { x: 520, y: 1385 }, scale: 1.05, burst: { x: 895, y: 220 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 82, y: 13 },
      anchor: { x: 700, y: 1000 }, scale: 1, burst: { x: 1310, y: 320 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 63, y: 19 },
      anchor: { x: 400, y: 1500 }, scale: 1, burst: { x: 920, y: 290 } },
  },
  // Nằm nghiêng, tay buông, bầu thuốc rơi cạnh tay.
  down: { name: "pose-down", texScale: 0.4, origin: { x: 15, y: 142 },
    anchor: { x: 900, y: 800 }, scale: 0.9 },
};
