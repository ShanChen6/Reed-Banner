import type { WarriorRig } from "./types";

/**
 * Mạnh Tường, binh lính hệ Phong (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11 (nền trong suốt sẵn), thay bộ
 * 29/10: khăn xanh ngọc quấn đầu, giáp vảy da, giáo mũi sắt buộc dải xanh và khiên mây bầu dục nẹp chéo đồng. Ảnh đứng
 * (941×1672, giữ khổ) tách lớp bằng code: giáo cùng nắm tay xoay quanh cổ tay (cán giáo nằm ngoài thân nên không cần vá),
 * khiên mây cùng bàn tay nắm vành nâng lên khi vào thế và đỡ đòn, đầu tách riêng. Tranh tay cầm ống tre đứng tựa giáo
 * làm phong thái.
 */
export const MANH_TUONG: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "manh-tuong",
  texScale: 0.5,
  foot: { x: 480, y: 1655 },
  height: 1470,
  parts: {
    body: { x: 106, y: 172, w: 770, h: 1494 },
    armR: { x: 688, y: 438, w: 248, h: 640 },
    sword: { x: 16, y: 6, w: 164, h: 1580 },
    arm: { x: 17, y: 482, w: 90, h: 106 },
    head: { x: 400, y: 180, w: 200, h: 240 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 95, y: 555 },
    elbowR: { x: 705, y: 650 },
    neck: { x: 500, y: 400 },
  },
  blade: [{ x: 55, y: 520 }, { x: 40, y: 30 }],
  shieldRaise: -0.35,
  strikeFx: "galeBulwark",
  fxColor: 0x2e9e90,
  // Tấn rộng núp khiên đâm giáo ngang (đánh thường), đẩy khiên ra trước (ra chiêu), hạ thấp người ghì khiên che thân
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 5, y: 2 },
      anchor: { x: 200, y: 985 }, scale: 1.15, burst: { x: 1540, y: 170 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 1, y: 0 },
      anchor: { x: 450, y: 1620 }, scale: 1, burst: { x: 850, y: 600 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 1, y: 2 },
      anchor: { x: 520, y: 1595 }, scale: 1, burst: { x: 850, y: 800 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 3, y: 1 },
    anchor: { x: 1000, y: 800 }, scale: 1 },
};
