import type { WarriorRig } from "./types";

/**
 * Kiều Công Hãn, sứ quân Phong Châu, pháp sư hệ Lôi. Bộ tranh Shan gửi 12/11 (7 tranh rời, nền trong suốt): khăn chít
 * tím, áo choàng ngắn tím thêu núi sét vàng, giáp lá nâu tía, bài đồng hình sét, đao cong chuôi tím (thay bộ trượng cầu
 * Lôi cũ). Ảnh đứng tách lớp bằng code: hai bàn tay chắp trên chuôi cùng thanh đao cắm mũi xuống xoay quanh nắm tay
 * (chỗ đao che giáp và vạt áo vá nội suy theo hàng rồi làm mờ), cổ tay trái phủ lại, đầu cùng dải khăn. Tư thế giữ
 * tranh nguồn (ra chiêu khổ dọc 1024×1536, còn lại 1536×1024). Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const KIEU_CONG_HAN: WarriorRig = {
  skeleton: "warrior",
  dir: "kieu-cong-han",
  texScale: 0.5,
  foot: { x: 512, y: 1515 },
  height: 1505,
  parts: {
    body: { x: 184, y: 10, w: 606, h: 1512 },
    armR: { x: 560, y: 676, w: 54, h: 68 },
    sword: { x: 418, y: 866, w: 154, h: 618 },
    arm: { x: 455, y: 676, w: 152, h: 194 },
    head: { x: 356, y: 10, w: 222, h: 252 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 530, y: 760 },
    elbowR: { x: 590, y: 700 },
    neck: { x: 470, y: 245 },
  },
  blade: [{ x: 521, y: 905 }, { x: 418, y: 1480 }],
  strikeFx: "lightning",
  fxColor: 0xb98cff,
  // Tấn dài đâm đao thẳng, tay kia cầm vỏ (đánh thường), giơ đao dựng, tay kia đẩy chưởng gọi sét (ra chiêu), hai tay
  // giương đao qua vai bổ xuống (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 101, y: 1 },
      anchor: { x: 620, y: 1015 }, scale: 1.06, burst: { x: 1500, y: 210 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 72, y: 14 },
      anchor: { x: 440, y: 1518 }, scale: 1, burst: { x: 950, y: 560 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 384, y: 15 },
      anchor: { x: 750, y: 1012 }, scale: 1.15, burst: { x: 1000, y: 40 } },
  },
  // Quỳ một gối, cúi đầu, tay chống đất, đao rơi trước mặt.
  down: { name: "pose-down", texScale: 0.4, origin: { x: 276, y: 10 },
    anchor: { x: 760, y: 1000 }, scale: 1.06 },
};
