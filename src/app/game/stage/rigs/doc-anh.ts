import type { WarriorRig } from "./types";

/**
 * Nông Sâm (ngoại hiệu Độc Ảnh), sát thủ hệ Mộc (RB-070, nghề Sát thủ chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi 12/11
 * (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code: kim châm độc cùng nắm tay phải buông thấp xoay quanh cổ tay, bàn tay
 * trái và đầu (cả khăn buộc) tách riêng; ống tre, bầu độc ở lại thân. Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const DOC_ANH: WarriorRig = {
  skeleton: "warrior",
  dir: "doc-anh",
  texScale: 0.5,
  foot: { x: 500, y: 1520 },
  height: 1505,
  parts: {
    body: { x: 233, y: 20, w: 520, h: 1508 },
    armR: { x: 704, y: 762, w: 62, h: 134 },
    sword: { x: 283, y: 893, w: 36, h: 42 },
    arm: { x: 216, y: 762, w: 72, h: 132 },
    head: { x: 374, y: 20, w: 256, h: 226 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 255, y: 770 },
    elbowR: { x: 735, y: 770 },
    neck: { x: 520, y: 235 },
  },
  blade: [{ x: 262, y: 852 }, { x: 313, y: 934 }],
  strikeFx: "venomNeedle",
  fxColor: 0x4f9a4a,
  // Tấn dài vươn tay phóng châm (đánh thường), quỳ một gối kẹp châm ngang ngực (ra chiêu), tấn rộng giơ châm cạnh tai,
  // tay kia đẩy chưởng (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 45, y: 27 },
      anchor: { x: 640, y: 995 }, scale: 1.05, burst: { x: 1490, y: 265 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 304, y: 18 },
      anchor: { x: 760, y: 990 }, scale: 1.05, burst: { x: 575, y: 340 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 290, y: 12 },
      anchor: { x: 760, y: 990 }, scale: 1.05, burst: { x: 1270, y: 330 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 100, y: 70 },
    anchor: { x: 720, y: 950 }, scale: 1 },
};
