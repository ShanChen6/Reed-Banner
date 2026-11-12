import type { WarriorRig } from "./types";

/**
 * Nghiêm Thiết, quân sư hệ Kim (tướng cửa hàng). Bộ tranh Shan vẽ lại gửi 03/11 (RB-025; nền trong suốt sẵn, riêng tranh
 * gục nền đen đã tách). Ảnh đứng tách lớp bằng code: cờ lệnh cùng nắm tay phải xoay quanh chỗ cầm theo nhịp giáo, bàn tay
 * trái ôm bó thẻ tre xoay quanh khuỷu, đầu kèm dải buộc tóc tách riêng (vải cờ dưới dải tóc đã vá). Hệ tọa độ: ảnh đứng
 * 1024×1536.
 */
export const NGHIEM_THIET: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "nghiem-thiet",
  texScale: 0.5,
  foot: { x: 545, y: 1505 },
  height: 1380,
  parts: {
    body: { x: 191, y: 166, w: 774, h: 1358 },
    armR: { x: 590, y: 510, w: 197, h: 222 },
    sword: { x: 152, y: 2, w: 408, h: 1438 },
    arm: { x: 192, y: 447, w: 75, h: 98 },
    head: { x: 401, y: 166, w: 210, h: 191 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 232, y: 495 },
    elbowR: { x: 775, y: 668 },
    neck: { x: 548, y: 340 },
  },
  blade: [{ x: 232, y: 495 }, { x: 180, y: 20 }],
  strikeFx: "ironFormation",
  fxColor: 0x9ea4ad,
  // Phất cờ ngang hông (đánh thường), dựng cờ giơ thẻ tre hô hiệu lệnh (ra chiêu), cờ chéo, thẻ tre vạch thế trận
  // (tuyệt chiêu). Cỡ so theo đầu với ảnh đứng.
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 14, y: 73 },
      anchor: { x: 570, y: 1495 }, scale: 0.95, burst: { x: 760, y: 760 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 45, y: 4 },
      anchor: { x: 490, y: 1515 }, scale: 1, burst: { x: 900, y: 555 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 20, y: 14 },
      anchor: { x: 545, y: 1505 }, scale: 1, burst: { x: 950, y: 560 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 39, y: 10 },
    anchor: { x: 760, y: 1012 }, scale: 0.85 },
};
