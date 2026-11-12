import type { WarriorRig } from "./types";

/**
 * Nhan Trúc, mưu sĩ hệ Mộc (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 25/10: áo xanh rêu thêu lá trúc và mặt trời, bó thẻ tre đeo lưng, trâm đồng, bút lông cán sắt thay quạt nan. Ảnh đứng
 * 1024×1536 tách lớp bằng code: bút cùng nắm tay xoay quanh cổ tay (vạt áo sau cán vá theo cột, sau nắm tay vá khuếch
 * tán), bình mực treo thắt lưng đung đưa làm lớp tay không, đầu tách riêng. Tranh ghi sổ bên ngựa thồ lương làm phong
 * thái.
 */
export const NHAN_TRUC: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "nhan-truc",
  texScale: 0.5,
  foot: { x: 490, y: 1532 },
  height: 1530,
  parts: {
    body: { x: 234, y: 2, w: 500, h: 1532 },
    armR: { x: 606, y: 662, w: 74, h: 110 },
    sword: { x: 355, y: 575, w: 406, h: 212 },
    arm: { x: 450, y: 574, w: 144, h: 80 },
    head: { x: 470, y: 2, w: 156, h: 328 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 470, y: 612 },
    elbowR: { x: 646, y: 668 },
    neck: { x: 545, y: 318 },
  },
  blade: [{ x: 590, y: 615 }, { x: 755, y: 576 }],
  strikeFx: "poisonMist",
  fxColor: 0x4f9a4a,
  // Tấn rộng đâm bút ra trước (đánh thường), dựng bút cạnh vai, tay kia đẩy chưởng (ra chiêu), vung bút qua đầu, tay
  // kia xòe ra (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 128, y: 3 },
      anchor: { x: 560, y: 1018 }, scale: 1, burst: { x: 1460, y: 238 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 150, y: 3 },
      anchor: { x: 500, y: 1531 }, scale: 1, burst: { x: 920, y: 440 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 29, y: 20 },
      anchor: { x: 480, y: 1534 }, scale: 1, burst: { x: 900, y: 445 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 36, y: 10 },
    anchor: { x: 760, y: 990 }, scale: 1 },
};
