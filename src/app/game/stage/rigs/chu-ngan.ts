import type { WarriorRig } from "./types";

/**
 * Chu Ngân, pháp sư hệ Kim (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 09/11 (nền trong suốt sẵn), thay bộ
 * 24/10: áo trắng vàng viền bạc, trượng vàng cầu pha lê treo ba chuông và ống kim. Ảnh đứng tách lớp bằng code: trượng
 * cùng nắm tay xoay quanh cổ tay, cầu pha lê sáng riêng; bàn tay buông và đầu tách riêng. Phần tóc, ống tay và vạt áo
 * sau trượng vá bằng nội suy ngang. Tranh đứng xem thẻ bạc làm tranh phong thái. Tranh nhiều chi tiết nên tư thế co
 * 0,34 lần để giữ ngân sách. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const CHU_NGAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "chu-ngan",
  texScale: 0.5,
  foot: { x: 480, y: 1500 },
  height: 1350,
  parts: {
    body: { x: 34, y: 179, w: 950, h: 1344 },
    armR: { x: 722, y: 845, w: 76, h: 116 },
    sword: { x: 288, y: 17, w: 134, h: 1484 },
    arm: { x: 318, y: 490, w: 80, h: 86 },
    head: { x: 440, y: 179, w: 226, h: 206 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 358, y: 530 },
    elbowR: { x: 765, y: 860 },
    neck: { x: 560, y: 370 },
  },
  blade: [{ x: 358, y: 530 }, { x: 355, y: 75 }],
  orb: { x: 355, y: 75 },
  strikeFx: "needleVolley",
  fxColor: 0x9ea4ad,
  // Chĩa trượng tới (đánh thường), dựng trượng xòe tay (ra chiêu), giơ trượng cao vươn tay (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.34, origin: { x: 21, y: 17 },
      anchor: { x: 260, y: 935 }, scale: 1, burst: { x: 1450, y: 228 } },
    cast: { name: "pose-cast", texScale: 0.34, origin: { x: 28, y: 12 },
      anchor: { x: 535, y: 1480 }, scale: 1, burst: { x: 985, y: 485 } },
    ultimate: { name: "pose-ultimate", texScale: 0.34, origin: { x: 10, y: 15 },
      anchor: { x: 480, y: 1490 }, scale: 1, burst: { x: 256, y: 64 } },
  },
  down: { name: "pose-down", texScale: 0.34, origin: { x: 11, y: 48 },
    anchor: { x: 760, y: 880 }, scale: 1 },
};
