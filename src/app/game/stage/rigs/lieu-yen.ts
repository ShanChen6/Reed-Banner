import type { WarriorRig } from "./types";

/**
 * Liễu Yên, pháp sư hệ Phong (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 10/11 (nền trong suốt sẵn), thay bộ 29/10:
 * áo vải mộc thêu cổng làng, băng đô xanh, phất trần đuôi ngựa trắng thay trượng trúc. Ảnh đứng (1006×1563, giữ khổ)
 * tách lớp bằng code: cẳng tay giơ ngửa bàn tay xoay quanh khuỷu theo nhịp quạt (phất trần ôm bên hông nằm yên trong
 * thân vì đuôi lông phủ lên tay áo), chuông đồng đeo thắt lưng đung đưa quanh móc, đầu tách riêng. Tranh dựng phất trần
 * xòe tay làm ra chiêu; tranh giơ phất trần qua đầu (bản rõ hơn) làm phong thái; tranh nằm làm gục. Cỡ người các tranh
 * tư thế so theo chiều cao đầu.
 */
export const LIEU_YEN: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  dir: "lieu-yen",
  texScale: 0.5,
  foot: { x: 400, y: 1545 },
  height: 1535,
  parts: {
    body: { x: 213, y: 10, w: 528, h: 1544 },
    armR: { x: 589, y: 545, w: 68, h: 204 },
    sword: { x: 671, y: 241, w: 232, h: 254 },
    arm: { x: 671, y: 420, w: 86, h: 76 },
    head: { x: 380, y: 10, w: 204, h: 266 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 712, y: 478 },
    elbowR: { x: 612, y: 556 },
    neck: { x: 500, y: 255 },
  },
  blade: [{ x: 770, y: 350 }, { x: 885, y: 258 }],
  strikeFx: "galeVortex",
  fxColor: 0x2e9e90,
  // Lướt tới quét phất trần (đánh thường), dựng phất trần xòe tay (ra chiêu), giơ phất trần qua đầu vươn tay gọi lốc
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 290, y: 8 },
      anchor: { x: 575, y: 1020 }, scale: 1.35, burst: { x: 1150, y: 250 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 73, y: 8 },
      anchor: { x: 475, y: 1545 }, scale: 1, burst: { x: 70, y: 545 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 26, y: 2 },
      anchor: { x: 510, y: 1495 }, scale: 1.15, burst: { x: 985, y: 410 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 18, y: 202 },
    anchor: { x: 880, y: 850 }, scale: 0.85 },
};
