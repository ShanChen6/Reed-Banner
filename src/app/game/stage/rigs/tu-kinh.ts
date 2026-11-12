import type { WarriorRig } from "./types";

/**
 * Từ Kinh, mưu sĩ hệ Lôi (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * cũ: người dò đường tóc xoăn băng trán chàm, áo tím thêu núi sét, cuộn bản đồ đeo vai, ống bút lông giắt thắt lưng, roi
 * xích đốt sắt thay quạt. Ảnh đứng 1024×1536 tách lớp bằng code: cán roi và nắm tay xoay quanh cổ tay, dây xích treo từ
 * khoen đầu cán đung đưa (nằm ngoài thân nên không cần vá), bàn tay nắm quai đeo trước ngực là tay không, đầu tách riêng.
 * Tranh đứng trên đá chỉ đường cầm bản đồ làm phong thái.
 */
export const TU_KINH: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 178, y: 380 },
  dir: "tu-kinh",
  texScale: 0.5,
  foot: { x: 520, y: 1499 },
  height: 1480,
  parts: {
    body: { x: 234, y: 20, w: 558, h: 1480 },
    armR: { x: 510, y: 350, w: 106, h: 120 },
    sword: { x: 155, y: 401, w: 46, h: 1024 },
    arm: { x: 165, y: 357, w: 140, h: 216 },
    head: { x: 440, y: 20, w: 250, h: 310 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 262, y: 505 },
    elbowR: { x: 592, y: 448 },
    neck: { x: 560, y: 315 },
  },
  blade: [{ x: 178, y: 400 }, { x: 178, y: 1400 }],
  strikeFx: "stormSeal",
  fxColor: 0xb48cff,
  // Tấn rộng quất xích thẳng ra trước (đánh thường), giơ cán roi qua đầu quay xích, tay kia đưa ngang (ra chiêu), hai tay
  // vung cán roi quét xích vòng sau lưng, miệng quát (tuyệt chiêu). Tranh ngang vẽ người nhỏ hơn nên phóng theo cỡ đầu.
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 15, y: 45 },
      anchor: { x: 450, y: 1013 }, scale: 1.15, burst: { x: 1490, y: 290 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 309, y: 7 },
      anchor: { x: 620, y: 1018 }, scale: 1.4, burst: { x: 1060, y: 370 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 84, y: 11 },
      anchor: { x: 820, y: 1013 }, scale: 1.15, burst: { x: 240, y: 850 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 53, y: 25 },
    anchor: { x: 760, y: 960 }, scale: 1.25 },
};
