import type { WarriorRig } from "./types";

/**
 * Đỗ Cảnh Thạc, sứ quân Đỗ Động (trùm chiến dịch), tướng sĩ hệ Thổ. Bộ tranh Shan gửi 12/11: lão tướng râu bạc khăn
 * cam, áo choàng vàng thêu mũi giáo, giáp lá sắt, búa tạ vuông. Ảnh đứng tách lớp bằng code: nắm tay phải cùng cán búa
 * và đầu búa xoay quanh nắm tay (chỗ cán che giáp vá nội suy theo hàng rồi làm mờ, ống chân sau đầu búa kéo dài từ mép),
 * bàn tay trái chống hông phủ lại, đầu cùng dải khăn. Năm tranh tư thế cắt từ một tấm 1536×1024 (đứng, phong thái,
 * đánh thường | ra chiêu, tuyệt chiêu, gục), giữ cỡ ô. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const DO_CANH_THAC: WarriorRig = {
  skeleton: "warrior",
  dir: "do-canh-thac",
  texScale: 0.5,
  foot: { x: 526, y: 1508 },
  height: 1474,
  parts: {
    body: { x: 43, y: 34, w: 938, h: 1490 },
    armR: { x: 742, y: 632, w: 112, h: 122 },
    sword: { x: 228, y: 505, w: 290, h: 1012 },
    arm: { x: 272, y: 545, w: 162, h: 154 },
    head: { x: 262, y: 34, w: 400, h: 284 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 350, y: 620 },
    elbowR: { x: 800, y: 690 },
    neck: { x: 520, y: 300 },
  },
  blade: [{ x: 357, y: 560 }, { x: 360, y: 1400 }],
  strikeFx: "groundSlam",
  fxColor: 0xa5772f,
  // Tấn thấp đẩy búa ngang ra trước (đánh thường), hai tay giữ cán búa ngang ngực (ra chiêu), giơ búa qua vai bổ xuống
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 600, y: 1359 }, scale: 1.01, burst: { x: 1470, y: 690 } },
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 570, y: 1518 }, scale: 1.01, burst: { x: 120, y: 525 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 630, y: 1548 }, scale: 1.01, burst: { x: 165, y: 120 } },
  },
  // Quỳ một gối, tay chống đất, cúi đầu, búa rơi bên cạnh.
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 0, y: 0 },
    anchor: { x: 720, y: 1224 }, scale: 1.01 },
};
