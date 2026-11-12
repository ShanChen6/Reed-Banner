import type { WarriorRig } from "./types";

/**
 * Đoàn Cự (ngoại hiệu Bạch Nỏ Lang), xạ thủ hệ Kim (RB-062). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt
 * sẵn), thay bộ 29/10: lão xạ thủ khăn trắng thêu cầu đá, giáp vảy xám, giáp vai da, nỏ gỗ bịt đồng, ống tên đồng bên
 * hông. Ảnh đứng 1024×1536 tách lớp bằng code: nỏ (cả dây, cò và bàn tay đỡ phía trước) xoay quanh nắm tay cầm báng,
 * ống tên lắc nhẹ thay bàn tay buông, đầu (cả đuôi khăn) tách riêng; ngực và tay áo sau nỏ, vạt áo sau ống tên vá theo
 * cột. Tranh cầm mũi tên ngắm nghía làm phong thái. Tranh tư thế vẽ người nhỏ trong khung ngang nên phóng lên.
 */
export const BACH_NO_LANG: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "bach-no-lang",
  texScale: 0.5,
  foot: { x: 420, y: 1510 },
  height: 1494,
  parts: {
    body: { x: 66, y: 22, w: 908, h: 1494 },
    armR: { x: 561, y: 620, w: 114, h: 296 },
    sword: { x: 242, y: 361, w: 706, h: 236 },
    arm: { x: 318, y: 440, w: 112, h: 90 },
    head: { x: 300, y: 22, w: 216, h: 278 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 370, y: 485 },
    elbowR: { x: 610, y: 640 },
    neck: { x: 420, y: 270 },
  },
  blade: [{ x: 370, y: 485 }, { x: 930, y: 450 }],
  strikeFx: "boltBreach",
  fxColor: 0x9ea4ad,
  // Đá tống ngang, ôm nỏ không bắn (đánh thường), đứng tấn áp má ngắm (ra chiêu), quỳ một gối ghì nỏ phóng tên phá thành
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 399, y: 8 },
      anchor: { x: 600, y: 995 }, scale: 1.3, burst: { x: 1090, y: 235 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 404, y: 8 },
      anchor: { x: 700, y: 995 }, scale: 1.3, burst: { x: 1185, y: 160 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 203, y: 4 },
      anchor: { x: 660, y: 995 }, scale: 1.05, burst: { x: 1250, y: 210 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 96, y: 4 },
    anchor: { x: 660, y: 920 }, scale: 1.15 },
};
