import type { WarriorRig } from "./types";

/**
 * Mạc Vân, quân sư hệ Lôi (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 29/10: áo tím thêu mặt trời và sấm vàng, dây buộc tóc bện tím, tù và sừng đeo lưng, kiếm lưỡi lượn sóng trong vỏ
 * đỏ. Ảnh đứng 1024×1536 tách lớp bằng code: kiếm trong vỏ cùng bàn tay đặt trên chuôi lắc nhẹ quanh cổ tay (`raise`
 * nhỏ để vỏ kiếm không vung xa), vạt áo sau vỏ vá theo hàng; bàn tay chống hông và đầu tách riêng. Tranh đứng trên
 * tảng đá thổi tù và làm phong thái.
 */
export const MAC_VAN: WarriorRig = {
  skeleton: "warrior",
  dir: "mac-van",
  texScale: 0.5,
  foot: { x: 470, y: 1505 },
  height: 1480,
  parts: {
    body: { x: 201, y: 36, w: 576, h: 1486 },
    armR: { x: 600, y: 590, w: 126, h: 112 },
    sword: { x: 511, y: 607, w: 220, h: 588 },
    arm: { x: 448, y: 540, w: 146, h: 90 },
    head: { x: 384, y: 36, w: 218, h: 226 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 470, y: 575 },
    elbowR: { x: 700, y: 610 },
    neck: { x: 500, y: 250 },
  },
  blade: [{ x: 560, y: 700 }, { x: 712, y: 1180 }],
  strikeFx: "thunderRout",
  fxColor: 0xb48cff,
  // Lao tới đâm kiếm lượn sóng, tay kia vung ra sau (đánh thường), giơ kiếm dựng đứng thổi tù và (ra chiêu), hét lớn
  // kéo kiếm hai tay chém ngược (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 29, y: 15 },
      anchor: { x: 520, y: 985 }, scale: 1.1, burst: { x: 1490, y: 130 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 167, y: 11 },
      anchor: { x: 440, y: 1490 }, scale: 1, burst: { x: 930, y: 160 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 59, y: 11 },
      anchor: { x: 950, y: 985 }, scale: 1.12, burst: { x: 300, y: 320 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 30, y: 13 },
    anchor: { x: 700, y: 930 }, scale: 1.05 },
};
