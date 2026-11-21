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
      "Sử gia Lê Văn Hưu khen Tiền Ngô vương đã “phá trăm vạn binh của Lưu Hoằng Tháo” (Toàn thư, đời Ngô, lời bàn).",
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
    name: "Chiến thuyền Chiêm Thành",
    intro: "Hơn nghìn chiến thuyền Chiêm Thành theo cửa biển kéo về Hoa Lư. Phá được đoàn thuyền thì đường ra mới mở.",
    phases: [
      "Năm 980, Ngô Nhật Khánh “dẫn thuyền quân Chiêm Thành hơn nghìn chiếc vào cướp”, muốn đánh Hoa Lư (Toàn thư, đời Đinh Phế Đế, mục Canh Thìn 980).",
      "Đoàn thuyền đi “theo hai cửa biển Đại Ác và Tiểu Khang” (cùng mục).",
      "Đêm ấy “gặp gió bão nổi lên, thuyền đều lật đắm”; chỉ thuyền vua Chiêm thoát về nước (cùng mục).",
    ],
    lines: ["Thuyền Chiêm phủ kín cửa biển!", "Sóng lớn đã nổi.", "Đoàn thuyền giặc tan trong bão!"],
    sources: ["S13"],
    sourced: true,
  },
  tienLe: {
    era: "tienLe",
    name: "Quân Tống (năm 981)",
    intro: "Quân Tống chia đường tràn sang. Chặn được giặc thì đường ra mới mở.",
    phases: [
      "Năm 980, vua Tống cử Hầu Nhân Bảo, Tôn Toàn Hưng… “hẹn ngày cùng sang xâm lược” (Toàn thư, đời Đinh Phế Đế, mục Canh Thìn 980).",
      "Năm 981, Lê Hoàn “sai quân sĩ đóng cọc ngăn sông Chi Lăng” (Toàn thư, kỷ nhà Lê, mục Tân Tỵ 981).",
      "Vua sai quân trá hàng dụ Hầu Nhân Bảo rồi chém; quân Tống thua lớn (cùng mục).",
    ],
    lines: ["Giặc Tống tràn qua biên ải!", "Hàng cọc đã chặn lối.", "Quân Tống tan vỡ!"],
    sources: ["S13", "S14"],
    sourced: true,
  },
};
