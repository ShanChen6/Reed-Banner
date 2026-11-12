import type { WarriorRig } from "./types";

/**
 * Trương Viêm, binh lính hệ Hỏa (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 10/11: giáp vảy đỏ viền hoa văn, đuốc đeo hông, kích ba mũi cán đồng thay đao và khiên. Ảnh đứng 1024×1536 tách lớp
 * bằng code: kích cùng nắm tay xoay quanh cổ tay (cán nằm ngoài thân nên không cần vá), bàn tay chống hông là tay không,
 * đầu tách riêng. Tranh ngồi khúc gỗ cười lớn làm phong thái.
 */
export const TRUONG_VIEM: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "truong-viem",
  texScale: 0.5,
  foot: { x: 500, y: 1515 },
  height: 1505,
  parts: {
    body: { x: 252, y: 104, w: 542, h: 1414 },
    armR: { x: 625, y: 595, w: 122, h: 112 },
    sword: { x: 154, y: 10, w: 158, h: 1496 },
    arm: { x: 198, y: 434, w: 70, h: 94 },
    head: { x: 466, y: 104, w: 176, h: 198 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 238, y: 512 },
    elbowR: { x: 685, y: 650 },
    neck: { x: 555, y: 290 },
  },
  blade: [{ x: 232, y: 512 }, { x: 232, y: 30 }],
  strikeFx: "flameWall",
  fxColor: 0xd9502a,
  // Đâm kích thẳng (đánh thường), dựng kích trước ngực (ra chiêu), gầm lên lao kích (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 42, y: 98 },
      anchor: { x: 560, y: 965 }, scale: 1.12, burst: { x: 1500, y: 380 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 155, y: 15 },
      anchor: { x: 505, y: 1515 }, scale: 1.1, burst: { x: 510, y: 60 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 35, y: 41 },
      anchor: { x: 640, y: 1005 }, scale: 0.95, burst: { x: 1500, y: 530 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 42, y: 25 },
    anchor: { x: 860, y: 965 }, scale: 1.05 },
};
