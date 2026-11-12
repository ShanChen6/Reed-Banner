import type { WarriorRig } from "./types";

/**
 * Tống Tấn, tướng sĩ hệ Lôi (tướng cửa hàng). Bộ tranh Shan gửi 29/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code
 * như Kha Sơn: cẳng tay bọc da cùng trường kiếm buông chéo xoay quanh khuỷu theo nhịp chém, cẳng tay buông và đầu tách
 * riêng, đuôi dải buộc tóc tím bay sau đầu. Tranh chống kiếm đứng nghỉ làm tranh phong thái. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const TONG_TAN: WarriorRig = {
  skeleton: "warrior",
  dir: "tong-tan",
  texScale: 0.5,
  foot: { x: 620, y: 1510 },
  height: 1510,
  parts: {
    body: { x: 373, y: 4, w: 628, h: 1518 },
    armR: { x: 830, y: 521, w: 110, h: 332 },
    sword: { x: 18, y: 538, w: 480, h: 900 },
    arm: { x: 368, y: 538, w: 130, h: 260 },
    head: { x: 576, y: 4, w: 198, h: 240 },
  },
  cloth: [
    { name: "ribbon", box: { x: 492, y: 90, w: 110, h: 144 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 6, freq: 1.7, k: 3.6, phase: 0.4, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 445, y: 560 },
    elbowR: { x: 868, y: 555 },
    neck: { x: 650, y: 232 },
  },
  blade: [{ x: 372, y: 830 }, { x: 40, y: 1400 }],
  strikeFx: "thunderCleave",
  fxColor: 0xb08cff,
  // Hai tay kéo kiếm chém ngang (đánh thường), hất kiếm chéo lên (ra chiêu), giơ kiếm qua đầu chuẩn bị nhát chém cuối
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 25, y: 44 },
      anchor: { x: 387, y: 1480 }, scale: 0.95, burst: { x: 990, y: 587 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 10, y: 11 },
      anchor: { x: 370, y: 1490 }, scale: 1, burst: { x: 960, y: 80 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 31, y: 14 },
      anchor: { x: 410, y: 1500 }, scale: 0.9, burst: { x: 700, y: 45 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 14, y: 278 },
    anchor: { x: 560, y: 1250 }, scale: 0.9 },
};
