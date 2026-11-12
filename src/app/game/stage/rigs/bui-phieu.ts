import type { WarriorRig } from "./types";

/**
 * Bùi Phiêu, mưu sĩ hệ Phong (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * cũ: thư sinh áo xanh xám tay rộng thêu cổng làng, búi tóc buộc lụa xanh, sổ da treo thắt lưng, quạt giấy nan nâu. Ảnh
 * đứng 977×1609 (giữ khổ) tách lớp bằng code: quạt cùng nắm tay và cổ tay áo trong xoay quanh cổ tay (quạt nằm ngoài thân
 * nên không cần vá), bàn tay buông bên kia tách riêng (tay áo phía sau vá màu), đầu tách riêng. Tranh tay chống cằm làm
 * phong thái.
 */
export const BUI_PHIEU: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  dir: "bui-phieu",
  texScale: 0.5,
  foot: { x: 510, y: 1593 },
  height: 1561,
  parts: {
    body: { x: 201, y: 32, w: 748, h: 1562 },
    armR: { x: 761, y: 750, w: 70, h: 128 },
    sword: { x: 28, y: 600, w: 220, h: 284 },
    arm: { x: 139, y: 657, w: 108, h: 114 },
    head: { x: 440, y: 32, w: 220, h: 314 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 238, y: 690 },
    elbowR: { x: 785, y: 760 },
    neck: { x: 545, y: 330 },
  },
  blade: [{ x: 200, y: 720 }, { x: 70, y: 650 }],
  strikeFx: "galeRift",
  fxColor: 0x2e9e90,
  // Chĩa quạt thẳng ra trước, tay kia úp ngang hông (đánh thường), tấn rộng rút quạt ngang thắt lưng như rút kiếm (ra
  // chiêu), giơ quạt bên vai, tay kia ngửa ra quát lệnh (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 14, y: 20 },
      anchor: { x: 470, y: 1607 }, scale: 0.98, burst: { x: 940, y: 500 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 19, y: 16 },
      anchor: { x: 520, y: 1545 }, scale: 1.02, burst: { x: 290, y: 530 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 13, y: 19 },
      anchor: { x: 400, y: 1662 }, scale: 0.95, burst: { x: 880, y: 480 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 10, y: 40 },
    anchor: { x: 850, y: 960 }, scale: 1 },
};
