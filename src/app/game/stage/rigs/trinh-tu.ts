import type { WarriorRig } from "./types";

/** Trịnh Tú, y sư hệ Mộc. Khớp trong ảnh nguồn 1024×1536, hồ lô có điểm cầm riêng. */
export const TRINH_TU: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 167, y: 414 },
  dir: "trinh-tu",
  texScale: 0.5,
  foot: { x: 583, y: 1510 },
  height: 1509,
  parts: {
    body: { x: 263, y: 15, w: 691, h: 1509 },
    armR: { x: 795, y: 483, w: 174, h: 347 },
    sword: { x: 60, y: 276, w: 228, h: 394 },
    arm: { x: 124, y: 366, w: 314, h: 177 },
    head: { x: 553, y: 15, w: 177, h: 219 },
  },
  cloth: [
    { name: "ribbon", box: { x: 348, y: 70, w: 207, h: 194 }, wind: { axis: "x", start: 0.18, amp: 4, freq: 1.6, k: 3.0, phase: 0.2, reverse: true, vertical: true }, behind: true },
    { name: "cape", box: { x: 106, y: 740, w: 327, h: 384 }, wind: { axis: "y", start: 0.2, amp: 4, freq: 1.2, k: 2.8, phase: 1.3 }, behind: true },
    { name: "apron", box: { x: 354, y: 631, w: 263, h: 444 }, wind: { axis: "y", start: 0.2, amp: 2, freq: 1.4, k: 2.6, phase: 2.1 } },
  ],
  covers: [
    { name: "sleeve", box: { x: 331, y: 356, w: 111, h: 92 } },
    { name: "sleeveR", box: { x: 786, y: 488, w: 127, h: 102 } },
  ],
  joints: {
    shoulder: { x: 416, y: 399 },
    elbowR: { x: 849, y: 557 },
    neck: { x: 613, y: 232 },
  },
  blade: [{ x: 167, y: 414 }, { x: 157, y: 285 }],
  fxColor: 0x9bd777,
  poses: {
    // Đánh thường: tranh Shan gửi 03/11, tấn rộng ôm bầu thuốc, tay trái đẩy ra (cỡ so theo đầu).
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 81, y: 29 }, anchor: { x: 669, y: 1230 }, scale: 1.15, burst: { x: 1026, y: 382 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 43, y: 45 }, anchor: { x: 690, y: 1508 }, scale: 1, burst: { x: 170, y: 165 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 12, y: 57 }, anchor: { x: 680, y: 1508 }, scale: 1, burst: { x: 220, y: 225 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 23, y: 36 }, anchor: { x: 920, y: 1000 }, scale: 1 },
};
