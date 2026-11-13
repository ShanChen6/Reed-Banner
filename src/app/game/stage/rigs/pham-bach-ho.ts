import type { WarriorRig } from "./types";

/**
 * Phạm Bạch Hổ, tướng sĩ hệ Hỏa. Bộ tranh Shan gửi 12/11: áo đỏ nâu thêu vết vuốt hổ, giáp vảy, khoác da hổ trắng vằn
 * đen khi ra trận, đao cong một lưỡi. Ảnh đứng tách lớp bằng code: nắm tay phải cùng thanh đao buông bên trái xoay quanh
 * nắm tay (chỗ lưỡi đao che quần và xà cạp vá nội suy theo hàng rồi làm mờ), bàn tay trái đặt trên đai phủ lại, đầu.
 * Năm tranh tư thế cắt từ một tấm 1536×1024 (đứng, phong thái, đánh thường | ra chiêu, tuyệt chiêu, gục), giữ cỡ ô.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
export const PHAM_BACH_HO: WarriorRig = {
  skeleton: "warrior",
  dir: "pham-bach-ho",
  texScale: 0.5,
  foot: { x: 545, y: 1520 },
  height: 1490,
  parts: {
    body: { x: 140, y: 34, w: 744, h: 1492 },
    armR: { x: 672, y: 600, w: 120, h: 102 },
    sword: { x: 186, y: 884, w: 298, h: 568 },
    arm: { x: 172, y: 790, w: 94, h: 96 },
    head: { x: 400, y: 34, w: 240, h: 266 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 218, y: 836 },
    elbowR: { x: 730, y: 640 },
    neck: { x: 520, y: 290 },
  },
  blade: [{ x: 215, y: 890 }, { x: 475, y: 1450 }],
  strikeFx: "tigerClaw",
  fxColor: 0xff913f,
  // Sải bước đâm đao thẳng ra trước (đánh thường), đứng thẳng giơ đao dựng đứng (ra chiêu), hai tay vung đao qua vai
  // trong thế tấn rộng (tuyệt chiêu). Tranh giữ cỡ ô của tấm gốc.
  poses: {
    attack: { name: "pose-attack", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 570, y: 1386 }, scale: 1.02, burst: { x: 1500, y: 144 } },
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 495, y: 1584 }, scale: 1.02, burst: { x: 200, y: 90 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 0, y: 0 },
      anchor: { x: 705, y: 1461 }, scale: 1.02, burst: { x: 840, y: 40 } },
  },
  // Quỳ một gối, cúi đầu, tay chống đất, đao cong rơi bên cạnh.
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 0, y: 0 },
    anchor: { x: 600, y: 1122 }, scale: 1.02 },
};
