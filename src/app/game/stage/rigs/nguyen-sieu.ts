import type { WarriorRig } from "./types";

/**
 * Nguyễn Siêu, sứ quân Tây Phù Liệt, binh lính hệ Hỏa. Bộ tranh Shan gửi 12/11 (7 tranh rời, nền trong suốt): khăn
 * đỏ, áo đỏ thêu lũy lửa vàng, giáp lá đen, giáo mũi thoi, khiên hình giọt nước đỏ viền đồng. Ảnh đứng tách lớp như
 * Nguyễn Khoan: nắm tay phải cùng cây giáo dựng đứng xoay quanh nắm tay, khiên là lớp tay không xoay quanh cẳng tay
 * trái sau khiên, nâng lên khi vào thế và đỡ đòn (vạt giáp sau khiên kéo dài từ mép rồi làm mờ), đầu cùng dải khăn.
 * Tư thế giữ tranh nguồn 1536×1024. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const NGUYEN_SIEU: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "nguyen-sieu",
  texScale: 0.5,
  foot: { x: 516, y: 1505 },
  height: 1363,
  parts: {
    body: { x: 183, y: 150, w: 598, h: 1364 },
    armR: { x: 626, y: 505, w: 250, h: 622 },
    sword: { x: 225, y: 14, w: 52, h: 1490 },
    arm: { x: 198, y: 412, w: 98, h: 104 },
    head: { x: 364, y: 150, w: 208, h: 222 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 248, y: 462 },
    elbowR: { x: 690, y: 620 },
    neck: { x: 470, y: 355 },
  },
  blade: [{ x: 250, y: 470 }, { x: 250, y: 30 }],
  shieldRaise: -0.35,
  strikeFx: "flameWall",
  fxColor: 0xd9502a,
  // Tấn thấp đâm giáo qua mép khiên (đánh thường), hô xung phong, khiên đẩy tới, giáo chĩa thấp (ra chiêu), tấn rộng
  // khiên dựng chắn trước, giáo gác ngang vai (tuyệt chiêu Hỏa Lũy, thủ thân).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 48, y: 12 },
      anchor: { x: 605, y: 985 }, scale: 1.03, burst: { x: 1495, y: 335 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 122, y: 14 },
      anchor: { x: 800, y: 1000 }, scale: 1.03, burst: { x: 1520, y: 490 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 48, y: 18 },
      anchor: { x: 630, y: 1000 }, scale: 1.03, burst: { x: 1495, y: 280 } },
  },
  // Quỳ một gối, cúi đầu, tay chống đất, giáo và khiên rơi trước mặt.
  down: { name: "pose-down", texScale: 0.4, origin: { x: 75, y: 36 },
    anchor: { x: 680, y: 900 }, scale: 1.03 },
};
