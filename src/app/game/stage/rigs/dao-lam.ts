import type { WarriorRig } from "./types";

/**
 * Vi Lam (tên cũ Đào Lam), pháp sư hệ Thủy (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 10/11 (nền trong suốt
 * sẵn), thay bộ 26/10: áo lam viền hoa văn sao, dải lụa xanh buộc tóc, trượng gỗ cầu đá lam. Ảnh đứng (976×1612, giữ
 * nguyên khổ) tách lớp bằng code: trượng cùng nắm tay xoay quanh cổ tay, cầu đá sáng riêng; bàn tay buông và đầu tách
 * riêng, lòng ống tay sau cổ tay vá bằng khuếch tán màu. Tranh đứng ngắm lòng bàn tay làm tranh phong thái.
 */
export const DAO_LAM: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "dao-lam",
  texScale: 0.5,
  foot: { x: 500, y: 1595 },
  height: 1590,
  parts: {
    body: { x: 232, y: 0, w: 586, h: 1606 },
    armR: { x: 740, y: 715, w: 78, h: 108 },
    sword: { x: 122, y: 360, w: 140, h: 420 },
    arm: { x: 172, y: 585, w: 88, h: 88 },
    head: { x: 330, y: 0, w: 286, h: 258 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 215, y: 630 },
    elbowR: { x: 765, y: 725 },
    neck: { x: 505, y: 245 },
  },
  blade: [{ x: 215, y: 630 }, { x: 155, y: 385 }],
  orb: { x: 155, y: 385 },
  strikeFx: "waterPillar",
  fxColor: 0x2f7fc1,
  // Hai tay cầm trượng chĩa cầu đá tới (đánh thường), dựng trượng xòe tay (ra chiêu), thế tấn đẩy chưởng kéo trượng ngang (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 153, y: 0 },
      anchor: { x: 510, y: 1535 }, scale: 1, burst: { x: 920, y: 590 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 105, y: 0 },
      anchor: { x: 580, y: 1530 }, scale: 1, burst: { x: 830, y: 260 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 3, y: 0 },
      anchor: { x: 560, y: 1440 }, scale: 1, burst: { x: 1010, y: 300 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 4, y: 8 },
    anchor: { x: 760, y: 1000 }, scale: 1.06 },
};
