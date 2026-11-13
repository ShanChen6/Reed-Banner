import type { WarriorRig } from "./types";

/**
 * Đinh Liễn, pháp sư hệ Thủy. Bộ tranh Shan gửi 12/11 là một tờ ghép 6 dáng (1536×1024, nền trong suốt): áo giáp vảy
 * nâu, áo choàng chàm, kiếm thẳng chuôi xanh thay thủ bản gỗ. Mỗi dáng phóng ×3 làm hệ tọa độ (ảnh đứng đặt vào khung
 * 1024×1536). Ảnh đứng hai tay chồng lên chuôi kiếm chống trước người: kiếm (chuôi, đốc, lưỡi) tách thành lớp xoay quanh
 * chỗ nắm, phần sau lưỡi kiếm vá bằng nội suy ngang; hai bàn tay ở lại thân (lớp nắm tay chỉ là mép ngón dưới), đuôi
 * bao kiếm là lớp armR lắc nhẹ, đầu tách riêng.
 */
export const DINH_LIEN: WarriorRig = {
  skeleton: "warrior",
  dir: "dinh-lien",
  texScale: 0.5,
  foot: { x: 510, y: 1515 },
  height: 1490,
  parts: {
    body: { x: 234, y: 34, w: 554, h: 1492 },
    armR: { x: 705, y: 1035, w: 86, h: 76 },
    sword: { x: 578, y: 780, w: 120, h: 728 },
    arm: { x: 612, y: 745, w: 58, h: 46 },
    head: { x: 395, y: 34, w: 216, h: 296 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 640, y: 775 },
    elbowR: { x: 750, y: 1045 },
    neck: { x: 505, y: 320 },
  },
  blade: [{ x: 640, y: 800 }, { x: 641, y: 1500 }],
  strikeFx: "royalSeal",
  fxColor: 0x9fe3ff,
  // Tấn dài đâm kiếm thẳng tay (đánh thường), dựng kiếm bên vai, tay kia đẩy chưởng (ra chiêu), hai tay giơ kiếm chéo
  // qua đầu trong thế tấn (tuyệt chiêu). Tranh tư thế lưu đúng cỡ ô trong tờ ghép (texScale 1/3).
  poses: {
    attack: { name: "pose-attack", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 705, y: 1248 }, scale: 1, burst: { x: 1644, y: 303 } },
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 420, y: 1638 }, scale: 1, burst: { x: 810, y: 369 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 618, y: 1521 }, scale: 1, burst: { x: 948, y: 40 } },
  },
  // Ngồi bệt, tay ôm đầu, kiếm rơi dưới đất.
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 0, y: 0 },
    anchor: { x: 600, y: 1030 }, scale: 1 },
};
