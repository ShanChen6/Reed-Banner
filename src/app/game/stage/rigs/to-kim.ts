import type { WarriorRig } from "./types";

/**
 * Tô Kim, mưu sĩ hệ Kim (tướng khởi đầu). Bộ tranh phong cách mới Shan gửi 09/11 (nền trong suốt sẵn): quạt xếp nan sắt
 * có tua, cân đồng và túi tiền đeo hông. Ảnh đứng tách lớp bằng code: quạt cùng tua và nắm tay phẩy quanh cổ tay, phần
 * áo sau quạt vá bằng chép tiếp dải viền vòng tròn theo chu kỳ hoa văn; bàn tay chống hông xoay quanh cổ tay, đầu tách
 * riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const TO_KIM: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  dir: "to-kim",
  texScale: 0.5,
  foot: { x: 460, y: 1525 },
  height: 1514,
  parts: {
    body: { x: 36, y: 11, w: 772, h: 1520 },
    armR: { x: 533, y: 573, w: 138, h: 88 },
    sword: { x: 37, y: 408, w: 386, h: 428 },
    arm: { x: 189, y: 625, w: 94, h: 72 },
    head: { x: 408, y: 11, w: 190, h: 240 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 240, y: 665 },
    elbowR: { x: 650, y: 600 },
    neck: { x: 515, y: 235 },
  },
  blade: [{ x: 240, y: 660 }, { x: 250, y: 420 }],
  strikeFx: "coinScatter",
  fxColor: 0x9ea4ad,
  // Bước tới vung quạt xòe về phía đối thủ (đánh thường), chĩa quạt gấp, tay kia bắt ấn hai ngón (ra chiêu), tấn rộng giơ
  // quạt cao, tay kia xòe về phía đối thủ (tuyệt chiêu). Cỡ tranh ngang ảnh đứng.
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 42, y: 17 },
      anchor: { x: 470, y: 1520 }, scale: 1, burst: { x: 900, y: 260 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 157, y: 9 },
      anchor: { x: 465, y: 1527 }, scale: 1, burst: { x: 985, y: 390 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 9, y: 8 },
      anchor: { x: 465, y: 1528 }, scale: 1, burst: { x: 1000, y: 430 } },
  },
  // Ngồi bệt tựa tay lên gối, quạt rơi bên tay, túi tiền đổ ra vài đồng.
  down: { name: "pose-down", texScale: 0.4, origin: { x: 52, y: 23 },
    anchor: { x: 640, y: 900 }, scale: 1 },
};
