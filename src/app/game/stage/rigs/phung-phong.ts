import type { WarriorRig } from "./types";

/**
 * Phùng Phong, quân sư hệ Phong (tướng khởi đầu). Bộ 7 tranh phong cách mới Shan gửi 09/11 (nền trong suốt sẵn): gậy trúc
 * buộc dải vải xanh, sáo trúc giắt đai. Ảnh đứng tách lớp bằng code: gậy (cả dải vải) xoay quanh cổ tay cùng nắm tay,
 * ống tay sau gậy vá bằng phản chiếu nếp áo bên phải; bàn tay trái buông xoay quanh cổ tay trong ống tay, đầu (cả khăn)
 * tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const PHUNG_PHONG: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "phung-phong",
  texScale: 0.5,
  foot: { x: 480, y: 1500 },
  height: 1481,
  parts: {
    body: { x: 185, y: 19, w: 582, h: 1494 },
    armR: { x: 634, y: 722, w: 80, h: 152 },
    sword: { x: 134, y: 199, w: 140, h: 1312 },
    arm: { x: 212, y: 362, w: 80, h: 94 },
    head: { x: 343, y: 19, w: 224, h: 244 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 250, y: 450 },
    elbowR: { x: 688, y: 738 },
    neck: { x: 500, y: 240 },
  },
  blade: [{ x: 241, y: 1490 }, { x: 253, y: 215 }],
  strikeFx: "galeRout",
  fxColor: 0x2e9e90,
  // Tấn thấp đâm gậy ngang về phía đối thủ (đánh thường), thổi sáo cạnh gậy dựng (ra chiêu), giơ gậy chéo trên đầu
  // xòe tay gọi gió (tuyệt chiêu). Cỡ so theo bề ngang khăn đầu.
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 153, y: 13 },
      anchor: { x: 320, y: 990 }, scale: 1.17, burst: { x: 1405, y: 275 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 69, y: 16 },
      anchor: { x: 450, y: 1495 }, scale: 1, burst: { x: 880, y: 215 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 13, y: 14 },
      anchor: { x: 260, y: 1500 }, scale: 1.27, burst: { x: 975, y: 545 } },
  },
  // Ngồi bệt chống tay, gậy và sáo rơi trước mặt.
  down: { name: "pose-down", texScale: 0.4, origin: { x: 58, y: 41 },
    anchor: { x: 600, y: 850 }, scale: 1 },
};
