import type { WarriorRig } from "./types";

/**
 * Lý Diệm (ngoại hiệu Xích Diệm Luân), xạ thủ hệ Hỏa (RB-065). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong
 * suốt sẵn), thay bộ 30/10: áo đỏ thêu vuốt lửa vàng, đai cam, dây bện đỏ buộc tóc, chùm chìa khóa đồng bên hông, vòng
 * sắt viền răng cưa vàng. Ảnh đứng 1024×1536 tách lớp bằng code: vòng sắt cùng nắm tay buông vung quanh cổ tay (vạt áo
 * sau vòng vá theo hàng), bàn tay chống hông và đầu (cả đuôi tóc) tách riêng. Tranh ngồi trên bao lúa lau vòng làm
 * phong thái.
 */
export const XICH_DIEM_LUAN: WarriorRig = {
  skeleton: "warrior",
  dir: "xich-diem-luan",
  texScale: 0.5,
  foot: { x: 520, y: 1515 },
  height: 1505,
  parts: {
    body: { x: 267, y: 9, w: 522, h: 1520 },
    armR: { x: 600, y: 550, w: 106, h: 106 },
    sword: { x: 167, y: 835, w: 246, h: 274 },
    arm: { x: 245, y: 785, w: 102, h: 106 },
    head: { x: 330, y: 10, w: 290, h: 258 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 300, y: 805 },
    elbowR: { x: 680, y: 575 },
    neck: { x: 515, y: 250 },
  },
  blade: [{ x: 290, y: 850 }, { x: 290, y: 1100 }],
  strikeFx: "flameDisc",
  fxColor: 0xd9502a,
  // Tấn rộng phóng vòng sắt bay tới (đánh thường), kéo vòng thấp sau lưng tay kia chỉ hướng (ra chiêu), giơ vòng qua đầu
  // lấy đà phóng (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 99, y: 7 },
      anchor: { x: 560, y: 990 }, scale: 1.1, burst: { x: 1330, y: 210 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 106, y: 7 },
      anchor: { x: 1210, y: 985 }, scale: 1.1, burst: { x: 1440, y: 420 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 214, y: 6 },
      anchor: { x: 780, y: 1000 }, scale: 1.1, burst: { x: 1270, y: 300 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 93, y: 8 },
    anchor: { x: 1100, y: 960 }, scale: 1 },
};
