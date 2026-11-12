import type { WarriorRig } from "./types";

/**
 * Nguyễn Khoan, sứ quân Tam Đái, binh lính hệ Thổ. Bộ tranh Shan gửi 12/11 (8 tranh rời, nền trong suốt): khăn nâu
 * đỏ, khăn quàng thêu vạch vàng, giáp lá da, giáo mũi chữ thập, khiên tròn viền đồng. Ảnh đứng tách lớp bằng code:
 * nắm tay phải cùng cây giáo dựng đứng xoay quanh nắm tay (cổ tay áo sau cán vá nội suy theo hàng), khiên là lớp tay
 * không xoay quanh cẳng tay trái sau khiên, nâng lên khi vào thế và đỡ đòn (ống tay và vạt giáp sau khiên kéo dài từ
 * mép trái rồi làm mờ), đầu cùng dải khăn. Tư thế giữ tranh nguồn 1536×1024. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const NGUYEN_KHOAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "nguyen-khoan",
  texScale: 0.5,
  foot: { x: 535, y: 1500 },
  height: 1330,
  parts: {
    body: { x: 186, y: 10, w: 606, h: 1498 },
    armR: { x: 672, y: 573, w: 216, h: 438 },
    sword: { x: 196, y: 12, w: 80, h: 1506 },
    arm: { x: 188, y: 520, w: 94, h: 100 },
    head: { x: 409, y: 173, w: 204, h: 202 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 234, y: 568 },
    elbowR: { x: 720, y: 700 },
    neck: { x: 550, y: 360 },
  },
  blade: [{ x: 236, y: 560 }, { x: 236, y: 30 }],
  shieldRaise: -0.35,
  strikeFx: "earthWard",
  fxColor: 0xa5772f,
  // Đâm giáo qua mép khiên (đánh thường), tấn rộng dựng giáo, khiên chắn trước (ra chiêu), hô xung phong, khiên đẩy
  // tới, giáo chĩa thấp (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 80, y: 41 },
      anchor: { x: 515, y: 990 }, scale: 1, burst: { x: 1480, y: 345 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 283, y: 10 },
      anchor: { x: 865, y: 995 }, scale: 1.15, burst: { x: 580, y: 30 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 40, y: 30 },
      anchor: { x: 570, y: 990 }, scale: 1, burst: { x: 1490, y: 470 } },
  },
  // Quỳ một gối, cúi đầu, tay chống đất, giáo và khiên rơi bên cạnh.
  down: { name: "pose-down", texScale: 0.4, origin: { x: 31, y: 28 },
    anchor: { x: 650, y: 840 }, scale: 1 },
};
