// Nhận diện cờ của từng cứ điểm trên bản đồ Sử ký (Polish V2 P06): dáng cờ + hình vẽ giữa cờ, gắn cố định theo
// id. Đây là ký hiệu game tự đặt để người chơi phân biệt các phe, KHÔNG phải huy hiệu lịch sử (sử không chép cờ
// của 12 sứ quân). Màu nền cờ vẫn là trạng thái thế cục lấy từ hồ sơ server (STATE_COLOR), tách hẳn khỏi đây.

import type { StrongholdId } from "./worldAtlas";

/** Dáng cờ: đuôi én (khía giữa), vuông, nhọn đáy, đuôi hai dải (riêng Hoa Lư). */
export type FlagShape = "notch" | "square" | "point" | "twin";

export interface FactionMark {
  readonly shape: FlagShape;
  /** Gợi ý ngắn để đọc mã nguồn: hình vẽ lấy ý từ tên đất, không có giá trị sử liệu. */
  readonly motif: string;
  /** Nét vẽ trong hệ tọa độ tâm (0, 0), khung khoảng ±11. */
  readonly glyph: string;
  /** Phần tô đặc (nếu có), cùng hệ tọa độ. */
  readonly fill?: string;
}

export const FACTION_MARKS: Readonly<Record<StrongholdId, FactionMark>> = {
  hoaLu: {
    shape: "twin",
    motif: "mặt trời trống đồng",
    glyph:
      "M0,-11 L0,-7 M0,7 L0,11 M-11,0 L-7,0 M7,0 L11,0 M-7.8,-7.8 L-5,-5 M5,5 L7.8,7.8 M-7.8,7.8 L-5,5 M5,-5 L7.8,-7.8",
    fill: "M0,-4.5 A4.5,4.5 0 1 1 0,4.5 A4.5,4.5 0 1 1 0,-4.5 Z",
  },
  tranLam: {
    shape: "notch",
    motif: "sóng cửa biển",
    glyph: "M-10,-3 Q-5,-9 0,-3 T10,-3 M-10,5 Q-5,-1 0,5 T10,5",
  },
  phamBachHo: {
    shape: "square",
    motif: "ba vạch vuốt",
    glyph: "M-7,-9 L-3,9 M-1,-10 L3,10 M5,-9 L9,7",
  },
  ngoXuongXi: {
    shape: "point",
    motif: "cầu vòm",
    glyph: "M-11,6 L11,6 M-8,6 Q0,-10 8,6 M-4,6 L-4,1 M4,6 L4,1",
  },
  ngoNhatKhanh: {
    shape: "square",
    motif: "cổng làng",
    glyph: "M-10,-7 L10,-7 M-7,-7 L-7,10 M7,-7 L7,10 M-8,-2 L8,-2",
  },
  nguyenKhoan: {
    shape: "notch",
    motif: "ba dải",
    glyph: "M-9,-7 L9,-7 M-9,0 L9,0 M-9,7 L9,7",
  },
  kieuCongHan: {
    shape: "point",
    motif: "đỉnh núi",
    glyph: "M-11,8 L-3,-8 L2,1 L5,-4 L11,8 Z",
  },
  kieuThuan: {
    shape: "square",
    motif: "mặt hồ",
    glyph:
      "M0,-10 A10,10 0 1 1 0,10 A10,10 0 1 1 0,-10 Z M0,-4.5 A4.5,4.5 0 1 1 0,4.5 A4.5,4.5 0 1 1 0,-4.5 Z",
  },
  lyKhue: {
    shape: "notch",
    motif: "cánh sen",
    glyph:
      "M0,9 Q-6,0 0,-10 Q6,0 0,9 Z M0,9 Q-11,5 -10,-4 Q-3,-1 0,9 M0,9 Q11,5 10,-4 Q3,-1 0,9",
  },
  nguyenThuTiep: {
    shape: "point",
    motif: "sao bốn cánh",
    glyph:
      "M0,-11 L2.5,-2.5 L11,0 L2.5,2.5 L0,11 L-2.5,2.5 L-11,0 L-2.5,-2.5 Z",
  },
  luDuong: {
    shape: "square",
    motif: "dòng sông",
    glyph: "M-3,-11 Q4,-6 -1,0 T1,11 M4,-11 Q11,-6 6,0 T8,11",
  },
  nguyenSieu: {
    shape: "notch",
    motif: "lũy có răng cưa",
    glyph:
      "M-10,9 L-10,-6 L-6,-6 L-6,-2 L-2,-2 L-2,-6 L2,-6 L2,-2 L6,-2 L6,-6 L10,-6 L10,9 Z",
  },
  doCanhThac: {
    shape: "point",
    motif: "mũi giáo",
    glyph: "M0,-11 L5,-2 L1.5,-2 L1.5,11 L-1.5,11 L-1.5,-2 L-5,-2 Z",
  },
};

/** Khung cờ theo dáng, cờ rộng 40 cao 64 treo ở y = -112 (cùng hệ tọa độ Banner trên bản đồ). */
export function flagPath(shape: FlagShape): string {
  switch (shape) {
    case "notch":
      return "M-20,-112 L20,-112 L20,-48 L0,-58 L-20,-48 Z";
    case "square":
      return "M-20,-112 L20,-112 L20,-50 L-20,-50 Z";
    case "point":
      return "M-20,-112 L20,-112 L20,-60 L0,-44 L-20,-60 Z";
    case "twin":
      return "M-24,-114 L24,-114 L24,-40 L12,-52 L0,-40 L-12,-52 L-24,-40 Z";
  }
}
