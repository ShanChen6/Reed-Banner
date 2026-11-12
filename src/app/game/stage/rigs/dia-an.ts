import type { WarriorRig } from "./types";

/**
 * Cát Tàng (ngoại hiệu Địa Ẩn), sát thủ hệ Thổ (RB-073, nghề Sát thủ chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi 12/11
 * (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code: móng vuốt tay phải tách khỏi bàn tay để cùng xoay quanh cổ tay, bàn
 * tay trái cùng móng vuốt và đầu (cả khăn quấn) tách riêng; dây móc ở lại thân. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const DIA_AN: WarriorRig = {
  skeleton: "warrior",
  dir: "dia-an",
  texScale: 0.5,
  foot: { x: 500, y: 1490 },
  height: 1460,
  parts: {
    body: { x: 170, y: 35, w: 684, h: 1460 },
    armR: { x: 745, y: 688, w: 136, h: 146 },
    sword: { x: 151, y: 739, w: 96, h: 108 },
    arm: { x: 156, y: 690, w: 144, h: 158 },
    head: { x: 400, y: 35, w: 208, h: 256 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 235, y: 700 },
    elbowR: { x: 790, y: 698 },
    neck: { x: 520, y: 280 },
  },
  blade: [{ x: 200, y: 750 }, { x: 175, y: 845 }],
  strikeFx: "earthClaw",
  fxColor: 0xc8963c,
  // Co gối đá ngang, hai tay giương vuốt (đánh thường), ngồi tấn thấp vươn vuốt tới trước (ra chiêu), tấn rộng một vuốt
  // giơ cao một vuốt chĩa xuống (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 334, y: 9 },
      anchor: { x: 520, y: 1005 }, scale: 1.1, burst: { x: 1200, y: 440 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 251, y: 18 },
      anchor: { x: 760, y: 990 }, scale: 1.1, burst: { x: 1330, y: 250 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 214, y: 8 },
      anchor: { x: 640, y: 995 }, scale: 1.1, burst: { x: 1240, y: 600 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 33, y: 406 },
    anchor: { x: 760, y: 935 }, scale: 1 },
};
