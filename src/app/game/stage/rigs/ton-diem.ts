import type { WarriorRig } from "./types";

/**
 * Tôn Diệm, quân sư hệ Hỏa (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 28/10: áo đỏ thêu mặt trời, đai cam, vạch sơn đỏ trên má, trâm hạt đỏ cài búi, giáo cán đỏ rồng đồng quấn cổ và bó
 * thẻ tre đeo hông. Ảnh đứng 1024×1536 tách lớp bằng code: giáo cùng nắm tay xoay quanh cổ tay theo nhịp giáo (cán nằm
 * ngoài thân nên không cần vá), bàn tay đặt trên bó thẻ tre và đầu tách riêng; bỏ lá cờ bay của bộ cũ. Tranh gác chân
 * lên ghế gỗ chống cằm làm phong thái.
 */
export const TON_DIEM: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "ton-diem",
  texScale: 0.5,
  foot: { x: 500, y: 1500 },
  height: 1415,
  parts: {
    body: { x: 251, y: 97, w: 522, h: 1416 },
    armR: { x: 540, y: 625, w: 166, h: 102 },
    sword: { x: 231, y: 13, w: 100, h: 1484 },
    arm: { x: 238, y: 479, w: 70, h: 74 },
    head: { x: 397, y: 97, w: 214, h: 234 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 296, y: 515 },
    elbowR: { x: 680, y: 665 },
    neck: { x: 540, y: 310 },
  },
  blade: [{ x: 272, y: 520 }, { x: 270, y: 15 }],
  strikeFx: "fireChain",
  fxColor: 0xe0602a,
  // Tấn thấp đâm giáo ngang (đánh thường), dựng giáo tay kia chỉ hướng (ra chiêu), hét lớn hất giáo chếch lên trời
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 30, y: 32 },
      anchor: { x: 560, y: 955 }, scale: 1.18, burst: { x: 1500, y: 280 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 176, y: 11 },
      anchor: { x: 440, y: 1490 }, scale: 1, burst: { x: 960, y: 290 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 97, y: 11 },
      anchor: { x: 660, y: 985 }, scale: 1.2, burst: { x: 1410, y: 40 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 16, y: 17 },
    anchor: { x: 620, y: 900 }, scale: 1.15 },
};
