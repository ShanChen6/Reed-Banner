import type { WarriorRig } from "./types";

/** Lưu Cơ, mưu sĩ hệ Kim. Dùng khớp vai của rig tướng sĩ với nhịp phẩy quạt riêng. */
export const LUU_CO: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  sleeveWind: { axis: "y", start: 0.38, amp: 4, freq: 1.3, k: 2.7, phase: 0.3 },
  dir: "luu-co",
  texScale: 0.5,
  foot: { x: 611, y: 1505 },
  height: 1502,
  parts: {
    body: { x: 76, y: 10, w: 900, h: 1502 },
    armR: { x: 752, y: 423, w: 216, h: 645 },
    sword: { x: 19, y: 275, w: 351, h: 456 },
    arm: { x: 93, y: 373, w: 396, h: 598 },
    head: { x: 468, y: 10, w: 212, h: 244 },
  },
  cloth: [
    { name: "ribbon", box: { x: 259, y: 123, w: 273, h: 160 }, wind: { axis: "x", start: 0.2, amp: 4, freq: 1.5, k: 3.0, phase: 0.2, reverse: true, vertical: true }, behind: true },
    { name: "sash", box: { x: 218, y: 696, w: 298, h: 363 }, wind: { axis: "y", start: 0.18, amp: 3, freq: 1.2, k: 2.8, phase: 1.3 } },
    { name: "apron", box: { x: 506, y: 798, w: 74, h: 563 }, wind: { axis: "y", start: 0.2, amp: 2, freq: 1.4, k: 2.6, phase: 2.1 } },
  ],
  covers: [{ name: "sleeve", box: { x: 347, y: 263, w: 162, h: 152 } }],
  joints: {
    shoulder: { x: 436, y: 392 },
    elbowR: { x: 775, y: 470 },
    neck: { x: 599, y: 243 },
  },
  blade: [{ x: 276, y: 558 }, { x: 140, y: 335 }],
  fxColor: 0xf0cf8a,
  poses: {
    // Đánh thường: tranh Shan gửi 03/11, quét quạt lông ngang người (cỡ so theo đầu).
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 15, y: 87 }, anchor: { x: 565, y: 1380 }, scale: 1.05, burst: { x: 880, y: 500 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 10, y: 30 }, anchor: { x: 620, y: 1513 }, scale: 1, burst: { x: 150, y: 170 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 8, y: 13 }, anchor: { x: 565, y: 1510 }, scale: 1, burst: { x: 947, y: 80 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 40, y: 37 }, anchor: { x: 850, y: 1007 }, scale: 1 },
};
