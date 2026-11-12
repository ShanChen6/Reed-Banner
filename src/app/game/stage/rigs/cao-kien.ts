import type { WarriorRig } from "./types";

/**
 * Cao Kiên, binh lính hệ Kim (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 10/11 (nền trong suốt sẵn), thay bộ 25/10:
 * giáp vảy da đinh bạc, dây thừng chéo vai buộc túi vải, khiên mây đinh đồng. Ảnh đứng 1024×1536 tách lớp bằng code:
 * giáo dựng cùng nắm tay xoay quanh cổ tay (cổ tay sau cán vá bằng nội suy ngang), khiên mây nâng lên khi vào thế và đỡ
 * đòn (phần giáp sau khiên vá bằng mảnh giáp bên cạnh), đầu tách riêng. Shan gửi ba tranh động tác nên tranh núp khiên
 * chĩa giáo thấp dùng cho cả ra chiêu và tuyệt chiêu; tranh ngồi lau giáo làm phong thái.
 */
export const CAO_KIEN: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "cao-kien",
  texScale: 0.5,
  foot: { x: 560, y: 1485 },
  height: 1260,
  parts: {
    body: { x: 139, y: 226, w: 754, h: 1264 },
    armR: { x: 621, y: 500, w: 272, h: 366 },
    sword: { x: 137, y: 12, w: 78, h: 1474 },
    arm: { x: 133, y: 438, w: 84, h: 96 },
    head: { x: 430, y: 226, w: 174, h: 172 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 175, y: 500 },
    elbowR: { x: 700, y: 690 },
    neck: { x: 520, y: 385 },
  },
  blade: [{ x: 175, y: 500 }, { x: 175, y: 20 }],
  shieldRaise: -0.35,
  strikeFx: "steelBulwark",
  fxColor: 0x9ea4ad,
  // Đâm giáo thẳng (đánh thường), núp sau khiên giáo chĩa thấp (ra chiêu và tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 40, y: 10 },
      anchor: { x: 620, y: 870 }, scale: 1.03, burst: { x: 1735, y: 245 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 13, y: 21 },
      anchor: { x: 965, y: 925 }, scale: 1.05, burst: { x: 1400, y: 480 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 13, y: 21 },
      anchor: { x: 965, y: 925 }, scale: 1.05, burst: { x: 1400, y: 480 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 60, y: 56 },
    anchor: { x: 1000, y: 870 }, scale: 0.95 },
};
