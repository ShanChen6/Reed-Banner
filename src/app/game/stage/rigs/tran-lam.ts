import type { WarriorRig } from "./types";

/**
 * Trần Lãm, quân sư hệ Thủy. Bộ tranh Shan gửi 12/11: khăn chít nâu, áo choàng ngắn xanh đen thêu sóng vàng, giáp
 * lá nâu, cờ lệnh nhỏ giắt sau lưng, đao dài một lưỡi cầm hai tay (thay bộ gậy gỗ cũ). Ảnh đứng tách lớp bằng code:
 * hai bàn tay cầm chuôi cùng thanh đao chĩa chéo xuống phải xoay quanh nắm tay (lưỡi nằm ngoài thân nên chỉ vá ít),
 * cẳng tay trái phủ lại, đầu cùng dải khăn. Ảnh đứng rộng nên thu theo bề ngang (đầu ở y≈190). Năm tranh tư thế cắt
 * từ một tấm 1536×1024 (đứng, phong thái, đánh thường | ra chiêu, tuyệt chiêu, gục), giữ cỡ ô. Hệ tọa độ: ảnh đứng
 * 1024×1536.
 */
export const TRAN_LAM: WarriorRig = {
  skeleton: "warrior",
  dir: "tran-lam",
  texScale: 0.5,
  foot: { x: 376, y: 1510 },
  height: 1320,
  parts: {
    body: { x: 2, y: 190, w: 890, h: 1334 },
    armR: { x: 455, y: 748, w: 88, h: 110 },
    sword: { x: 455, y: 905, w: 568, h: 368 },
    arm: { x: 350, y: 852, w: 172, h: 112 },
    head: { x: 153, y: 190, w: 264, h: 220 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 435, y: 905 },
    elbowR: { x: 500, y: 800 },
    neck: { x: 352, y: 397 },
  },
  blade: [{ x: 500, y: 955 }, { x: 1010, y: 1265 }],
  fxColor: 0x7fcaff,
  // Tấn thấp hai tay đẩy đao ngang (đánh thường), dựng đao thẳng trước ngực (ra chiêu), hai tay giơ đao qua đầu trong
  // thế tấn rộng (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 525, y: 1137 }, scale: 0.99, burst: { x: 1530, y: 276 } },
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 360, y: 1626 }, scale: 0.99, burst: { x: 435, y: 15 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 555, y: 1494 }, scale: 0.99, burst: { x: 1095, y: 24 } },
  },
  // Quỳ gối cúi đầu, tay chống đất, đao và cờ lệnh rơi trước mặt.
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 0, y: 0 },
    anchor: { x: 780, y: 1098 }, scale: 0.99 },
};
