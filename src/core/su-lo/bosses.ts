// Boss trấn cổng của từng mê cung Sử Lộ (GDD mục 5.5). Sử chép có nguồn; thoại là lời game, không phải trích dẫn sử.

import type { SlEra } from "./questions";

export interface SlBoss {
  readonly era: SlEra;
  readonly name: string;
  /** Một câu giới thiệu khi gặp boss (lời game). */
  readonly intro: string;
  /** Sử chép mở mỗi pha (0: lúc gặp, 1: còn 2/3, 2: còn 1/3), kèm mã nguồn. */
  readonly phases: readonly [string, string, string];
  /** Thoại của game ở mỗi pha, UI ghi rõ "lời game". */
  readonly lines: readonly [string, string, string];
  readonly sources: readonly string[];
  /** Nguồn đã có trong sổ chưa; false thì mê cung chưa mở. */
  readonly sourced: boolean;
}

export const SL_BOSSES: Readonly<Record<SlEra, SlBoss>> = {
  ngo: {
    era: "ngo",
    name: "Thủy quân Nam Hán",
    intro: "Chiến thuyền phương Bắc chắn lối ra. Phá được thủy quân thì mới thoát khỏi mê cung.",
    phases: [
      "Sử gia Lê Văn Hưu khen Tiền Ngô vương đã \"phá trăm vạn binh của Lưu Hoằng Tháo\" (Toàn thư, đời Ngô, lời bàn).",
      "Sau thắng lợi ấy, mùa xuân năm 939 Ngô Quyền xưng vương (Toàn thư, mục Kỷ Hợi 939).",
      "Ngô Quyền đóng đô ở Loa thành, tức thành Cổ Loa (Toàn thư, đoạn mở đầu đời Tiền Ngô vương).",
    ],
    lines: ["Thuyền giặc dàn kín mặt sông!", "Hàng thuyền đầu đã rối.", "Thủy quân giặc tan vỡ!"],
    sources: ["S03"],
    sourced: true,
  },
  loanSuQuan: {
    era: "loanSuQuan",
    name: "Vòng vây Hoa Lư năm 951",
    intro: "Quân hai vua Ngô vây kín Hoa Lư. Giữ được thành thì đường ra mới mở.",
    phases: [
      "Năm 951, hai vua Ngô đem quân đánh Hoa Lư của Đinh Bộ Lĩnh (Toàn thư, Hậu Ngô Vương, mục Tân Hợi 951).",
      "Sử kể Đinh Liễn bị bắt làm con tin trong cuộc vây ấy; đây là tình tiết sử muộn kể lại (cùng mục).",
      "Vây hơn một tháng không hạ được, quân Ngô rút về (cùng mục).",
    ],
    lines: ["Lũy Hoa Lư phải giữ!", "Quân vây đã núng.", "Quân Ngô rút lui!"],
    sources: ["S02", "S04"],
    sourced: true,
  },
  dinh: {
    era: "dinh",
    name: "Thủy quân Chiêm Thành (năm 979)",
    intro: "Chưa mở: cần xác minh nguồn trước khi dùng.",
    phases: ["", "", ""],
    lines: ["", "", ""],
    sources: [],
    sourced: false,
  },
  tienLe: {
    era: "tienLe",
    name: "Quân Tống (năm 981)",
    intro: "Chưa mở: cần xác minh nguồn trước khi dùng.",
    phases: ["", "", ""],
    lines: ["", "", ""],
    sources: [],
    sourced: false,
  },
};
