import type { WarriorRig } from "./types";

/**
 * Nguyễn Bặc, tướng sĩ Hỏa. Bộ tranh Shan gửi 12/11 là một tờ ghép 6 dáng (1536×1024, nền trong suốt): giáp lá đồng,
 * áo choàng đỏ, khăn đỏ buộc trán, đại đao một lưỡi. Mỗi dáng phóng ×3 làm hệ tọa độ (ảnh đứng đặt vào khung
 * 1024×1536). Ảnh đứng tách lớp bằng code: đại đao (cả tua đỏ) cùng nắm tay phải xoay quanh cổ tay, bàn tay trái chống
 * hông lắc nhẹ (thân giữ nguyên bản dưới), đầu (cả đuôi khăn) tách riêng.
 */
export const NGUYEN_BAC: WarriorRig = {
  skeleton: "warrior",
  dir: "nguyenBac",
  texScale: 0.5,
  foot: { x: 520, y: 1515 },
  height: 1490,
  parts: {
    body: { x: 255, y: 34, w: 750, h: 1492 },
    head: { x: 440, y: 34, w: 290, h: 252 },
    arm: { x: 256, y: 760, w: 104, h: 84 },
    armR: { x: 698, y: 612, w: 104, h: 92 },
    sword: { x: 18, y: 842, w: 354, h: 658 },
  },
  joints: {
    shoulder: { x: 320, y: 790 },
    elbowR: { x: 770, y: 630 },
    neck: { x: 600, y: 275 },
  },
  cloth: [],
  covers: [],
  blade: [{ x: 300, y: 880 }, { x: 25, y: 1470 }],
  strikeFx: "fireBanner",
  fxColor: 0xff783d,
  // Tấn rộng hai tay kéo đao ngang hông (đánh thường), vươn thẳng tay chém đao tới trước, tay kia xòe ra sau (ra chiêu),
  // hai tay giơ đao qua đầu bổ xuống (tuyệt chiêu). Tranh tư thế lưu đúng cỡ ô trong tờ ghép (texScale 1/3).
  poses: {
    attack: { name: "pose-attack", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 669, y: 1314 }, scale: 1.02, burst: { x: 1720, y: 147 } },
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 642, y: 1323 }, scale: 1.02, burst: { x: 1740, y: 80 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 459, y: 1485 }, scale: 1.02, burst: { x: 1059, y: 30 } },
  },
  // Quỳ gục, tay chống đất, đao rơi bên gối.
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 0, y: 0 },
    anchor: { x: 690, y: 1120 }, scale: 1.02 },
};
