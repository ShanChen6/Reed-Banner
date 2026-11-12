import type { WarriorRig } from "./types";

/**
 * Mã Nhạc, mưu sĩ hệ Thổ (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 03/11: ông đồ hói áo vàng đất gile nâu thêu phù hiệu ba thanh, đoản kiếm chuôi đỏ giắt hông, ống thẻ tre treo dây thay
 * quạt nan. Ảnh đứng 1024×1536 tách lớp bằng code: ống thẻ tre treo dây đung đưa dưới nắm tay, nắm tay xoay quanh cổ tay
 * (vạt áo sau ống vá khuếch tán), bàn tay đặt trên chuôi kiếm là tay không, đầu tách riêng. Tranh ngồi xếp bằng trên
 * chiếu làm phong thái.
 */
export const MA_NHAC: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 597, y: 600 },
  dir: "ma-nhac",
  texScale: 0.5,
  foot: { x: 500, y: 1500 },
  height: 1450,
  parts: {
    body: { x: 189, y: 51, w: 532, h: 1450 },
    armR: { x: 296, y: 548, w: 108, h: 118 },
    sword: { x: 587, y: 599, w: 82, h: 298 },
    arm: { x: 582, y: 548, w: 84, h: 74 },
    head: { x: 400, y: 51, w: 216, h: 250 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 645, y: 566 },
    elbowR: { x: 330, y: 562 },
    neck: { x: 510, y: 290 },
  },
  blade: [{ x: 597, y: 600 }, { x: 635, y: 890 }],
  strikeFx: "roadSever",
  fxColor: 0xc8923a,
  // Lao tới đâm đoản kiếm, tay kia cầm vỏ (đánh thường), giơ kiếm cạnh vai, hai ngón chỉ đường (ra chiêu), tấn rộng cầm
  // kiếm ngang hông, tay kia đẩy chưởng (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 68, y: 6 },
      anchor: { x: 580, y: 1014 }, scale: 1, burst: { x: 1490, y: 280 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 158, y: 30 },
      anchor: { x: 470, y: 1510 }, scale: 1, burst: { x: 960, y: 270 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 223, y: 12 },
      anchor: { x: 700, y: 1014 }, scale: 1, burst: { x: 1320, y: 200 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 35, y: 19 },
    anchor: { x: 800, y: 1000 }, scale: 1 },
};
