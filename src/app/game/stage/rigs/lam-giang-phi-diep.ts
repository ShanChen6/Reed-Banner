import type { WarriorRig } from "./types";

/**
 * Thái Diệp (ngoại hiệu Lam Giang Phi Diệp), xạ thủ hệ Thủy (RB-064). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền
 * trong suốt sẵn), thay bộ 30/10: áo chàm thêu sóng vàng, khăn buộc tóc xanh, mặt dây vỏ sò, phi tiêu lá liễu và ống
 * tiêu da đính sò bên hông. Ảnh đứng 1024×1536 tách lớp bằng code: phi tiêu cùng nắm tay buông vung quanh cổ tay như
 * kiếm ngắn (tay và tiêu nằm ngoài thân nên không cần vá), bàn tay buông bên ống tiêu và đầu (cả dải khăn) tách riêng.
 * Tranh ngồi xổm chống cằm nhìn phi tiêu làm phong thái.
 */
export const LAM_GIANG_PHI_DIEP: WarriorRig = {
  skeleton: "warrior",
  dir: "lam-giang-phi-diep",
  texScale: 0.5,
  foot: { x: 500, y: 1510 },
  height: 1490,
  parts: {
    body: { x: 229, y: 21, w: 560, h: 1504 },
    armR: { x: 715, y: 790, w: 72, h: 98 },
    sword: { x: 268, y: 873, w: 64, h: 128 },
    arm: { x: 235, y: 786, w: 100, h: 88 },
    head: { x: 300, y: 25, w: 300, h: 306 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 285, y: 795 },
    elbowR: { x: 750, y: 800 },
    neck: { x: 530, y: 300 },
  },
  blade: [{ x: 290, y: 875 }, { x: 290, y: 995 }],
  strikeFx: "willowTide",
  fxColor: 0x2f7fc1,
  // Bật nhảy co gối, phi tiêu giấu sau lưng (đánh thường), tấn rộng phi tiêu kéo sau, tay xòe đẩy chưởng (ra chiêu),
  // giơ cao phi tiêu sau đầu sắp phóng (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 52, y: 46 },
      anchor: { x: 450, y: 1490 }, scale: 1, burst: { x: 930, y: 650 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 112, y: 16 },
      anchor: { x: 800, y: 980 }, scale: 1.1, burst: { x: 1360, y: 400 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 41, y: 23 },
      anchor: { x: 620, y: 1300 }, scale: 1.1, burst: { x: 1100, y: 500 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 82, y: 16 },
    anchor: { x: 820, y: 960 }, scale: 1 },
};
