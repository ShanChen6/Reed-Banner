import type { WarriorRig } from "./types";

/**
 * Quách Ẩn, mưu sĩ hệ Thủy (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 26/10: ông lão chài áo chàm thêu mặt trời, nón lá và cần câu đeo lưng, trường kiếm chuôi rồng ngọc thay quạt giấy. Ảnh
 * đứng 1024×1536 tách lớp bằng code: kiếm chống đất cùng hai bàn tay chồng trên chuôi nghiêng quanh chuôi kiếm (vạt áo
 * và ống quần sau kiếm vá theo hàng), phao câu treo dây đung đưa làm lớp tay không, đầu tách riêng. Tranh ngồi đá câu
 * cá làm phong thái.
 */
export const QUACH_AN: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "quach-an",
  texScale: 0.5,
  foot: { x: 500, y: 1519 },
  height: 1503,
  parts: {
    body: { x: 226, y: 16, w: 508, h: 1504 },
    armR: { x: 252, y: 150, w: 18, h: 84 },
    sword: { x: 544, y: 626, w: 142, h: 894 },
    arm: { x: 528, y: 532, w: 156, h: 118 },
    head: { x: 470, y: 70, w: 160, h: 260 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 604, y: 630 },
    elbowR: { x: 262, y: 153 },
    neck: { x: 560, y: 320 },
  },
  blade: [{ x: 606, y: 660 }, { x: 622, y: 1500 }],
  strikeFx: "tideMist",
  fxColor: 0x2f7fc1,
  // Lao tới đâm kiếm (đánh thường), dựng kiếm trước mặt, tay kia đưa ngang (ra chiêu), tấn rộng kéo kiếm ngang hông,
  // tay kia đẩy chưởng (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 34, y: 8 },
      anchor: { x: 560, y: 1009 }, scale: 1, burst: { x: 1500, y: 355 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 111, y: 8 },
      anchor: { x: 440, y: 1527 }, scale: 1, burst: { x: 960, y: 430 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 65, y: 11 },
      anchor: { x: 640, y: 1012 }, scale: 1, burst: { x: 1330, y: 520 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 10, y: 14 },
    anchor: { x: 760, y: 1000 }, scale: 0.95 },
};
