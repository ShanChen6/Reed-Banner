import type { WarriorRig } from "./types";

/**
 * Hà Vân, pháp sư hệ Hỏa (tướng khởi đầu). Bộ tranh phong cách mới Shan gửi 09/11/2026 (ảnh chuẩn, nền trong suốt). Ảnh đứng
 * tách lớp bằng code: trượng ngắn và nắm tay xoay quanh cổ tay, cầu lửa sáng riêng; bàn tay buông và đầu tách riêng;
 * thân đã xóa trượng, tay và dải lụa rồi vá lại phần vải phía sau; dải lụa đỏ trên tóc là lớp riêng bay theo gió.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const HA_VAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "ha-van",
  texScale: 0.5,
  foot: { x: 494, y: 1535 },
  height: 1530,
  parts: {
    body: { x: 214, y: 0, w: 563, h: 1536 },
    armR: { x: 669, y: 745, w: 61, h: 140 },
    sword: { x: 198, y: 304, w: 95, h: 447 },
    arm: { x: 204, y: 561, w: 75, h: 84 },
    head: { x: 378, y: 0, w: 211, h: 235 },
  },
  cloth: [
    { name: "ribbon", box: { x: 288, y: 62, w: 147, h: 369 }, behind: true,
      wind: { axis: "y", start: 0.12, amp: 9, freq: 1.5, k: 3.4, phase: 0.5 } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 242, y: 603 },
    elbowR: { x: 700, y: 748 },
    neck: { x: 525, y: 230 },
  },
  blade: [{ x: 242, y: 610 }, { x: 240, y: 365 }],
  orb: { x: 240, y: 365 },
  strikeFx: "fireRain",
  fxColor: 0xd9502a,
  // Chĩa trượng cầu lửa tới (đánh thường), hạ trượng xòe tay (ra chiêu), giơ cao trượng chỉ tay gọi mưa lửa (tuyệt chiêu).
  poses: {
    // Tranh gốc quay mặt sang trái; đã lật ngang tệp để nhân vật phe trái chĩa trượng về phía đối thủ (tọa độ 1024 - x).
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 45, y: 130 },
      anchor: { x: 514, y: 1444 }, scale: 1, burst: { x: 959, y: 300 } },
    // Đã lật ngang tệp để bàn tay xòe hướng về phía đối thủ (tọa độ 1024 - x cũ).
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 214, y: 1 },
      anchor: { x: 531, y: 1533 }, scale: 1, burst: { x: 809, y: 400 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 43, y: 7 },
      anchor: { x: 473, y: 1527 }, scale: 1, burst: { x: 990, y: 345 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 32, y: 208 },
    anchor: { x: 770, y: 941 }, scale: 0.85 },
};
