import type { WarriorRig } from "./types";

/**
 * Lê Hoàn, quân sư hệ Lôi. Bộ tranh Shan gửi 31/10 (nền trong suốt sẵn), thay bộ cầm cờ lệnh cũ: giáp vảy sắt viền da,
 * khăn chít trán, áo choàng đỏ sẫm, kiếm thẳng. Ảnh đứng tách lớp bằng code như Đinh Bộ Lĩnh: cẳng tay cầm kiếm cùng
 * thanh kiếm xoay quanh khuỷu, cẳng tay trái buông bên hông, đầu (chỗ cẳng tay che áo được vá màu). Đổi vũ khí nhưng giữ
 * nhịp động tác của bộ cờ lệnh cũ (nhịp giáo: đẩy tới nhẹ, không vung vòng). Tranh kéo áo choàng ngoái nhìn làm tranh
 * phong thái. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const LE_HOAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "le-hoan",
  texScale: 0.5,
  foot: { x: 560, y: 1495 },
  height: 1495,
  parts: {
    body: { x: 255, y: 5, w: 700, h: 1500 },
    armR: { x: 656, y: 520, w: 177, h: 247 },
    sword: { x: 69, y: 686, w: 296, h: 526 },
    arm: { x: 262, y: 548, w: 117, h: 259 },
    head: { x: 500, y: 9, w: 169, h: 217 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 335, y: 560 },
    elbowR: { x: 790, y: 545 },
    neck: { x: 590, y: 215 },
  },
  blade: [
    { x: 280, y: 815 },
    { x: 70, y: 1210 },
  ],
  strikeFx: "thunderMarch",
  fxColor: 0xb98cff,
  // Thủ kiếm, chỉ tay về phía trước (đánh thường), xòe tay ra lệnh (ra chiêu), giơ kiếm qua đầu (tuyệt chiêu). Cỡ so
  // theo khóa thắt lưng (62 px đứng).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 5, y: 65 },
      anchor: { x: 560, y: 1470 }, scale: 1, burst: { x: 800, y: 640 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 11, y: 48 },
      anchor: { x: 450, y: 1470 }, scale: 1, burst: { x: 990, y: 240 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 51, y: 33 },
      anchor: { x: 440, y: 1480 }, scale: 1, burst: { x: 690, y: 45 } },
  },
  // Ngồi bệt, tay chống đất, kiếm rơi bên cạnh.
  down: { name: "pose-down", texScale: 0.3, origin: { x: 11, y: 226 },
    anchor: { x: 500, y: 1240 }, scale: 0.95 },
};
