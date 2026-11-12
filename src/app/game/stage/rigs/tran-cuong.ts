import type { WarriorRig } from "./types";

/**
 * Trần Cương, tướng sĩ hệ Kim. Bộ tranh phong cách mới Shan gửi 09/11 (nền trong suốt sẵn), thay bộ 24/10: giáp da
 * vảy đồng, khăn trắng buộc tóc, đại đao tua lau trắng. Ảnh đứng tách lớp bằng code: đao cùng nắm tay phải xoay
 * quanh cổ tay, bàn tay trái chống hông xoay quanh cổ tay, đầu kèm khăn. Phần quần và xà cạp sau lưỡi đao được vá
 * (nội suy ngang lưỡi, xà cạp chân xa lấy vân từ chân gần). Tranh đứng chống đao làm tranh phong thái.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const TRAN_CUONG: WarriorRig = {
  skeleton: "warrior",
  dir: "tran-cuong",
  texScale: 0.5,
  foot: { x: 480, y: 1505 },
  height: 1520,
  parts: {
    body: { x: 138, y: 5, w: 684, h: 1520 },
    armR: { x: 612, y: 572, w: 138, h: 114 },
    sword: { x: 37, y: 651, w: 700, h: 744 },
    arm: { x: 132, y: 722, w: 94, h: 120 },
    head: { x: 315, y: 5, w: 272, h: 248 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 175, y: 740 },
    elbowR: { x: 735, y: 600 },
    neck: { x: 510, y: 240 },
  },
  blade: [{ x: 270, y: 885 }, { x: 745, y: 1398 }],
  fxColor: 0xffd27a,
  // Ba tranh ra đòn: chém ngang tầm thắt lưng (đánh thường), dựng đao trước mặt (ra chiêu), giơ đao quá đầu (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 25, y: 16 },
      anchor: { x: 650, y: 970 }, scale: 1, burst: { x: 1500, y: 470 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 81, y: 14 },
      anchor: { x: 505, y: 1490 }, scale: 1, burst: { x: 605, y: 40 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 50, y: 61 },
      anchor: { x: 515, y: 1490 }, scale: 1.05, burst: { x: 950, y: 75 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 37, y: 31 },
    anchor: { x: 760, y: 1000 }, scale: 1.06 },
};
