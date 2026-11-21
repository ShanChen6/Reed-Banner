// Khối lấp chỗ trống ở cột ngắn khi hai cột của màn chế độ cao bằng nhau (Shan chọn "kết hợp" 20/11/2026).
// Chế độ có `art` thì hiện tranh kèm thơ đè lên; chưa có tranh thì hiện mẹo chơi và thơ trên nền gỗ lõm.
// Tranh Shan vẽ (900 × 1200, đáy tối sẵn để đặt thơ) ở public/art/column-fill/<chế độ>.webp, điền `art`; prompt ở
// /mnt/project-files/art/prompts/tranh-lap-cot.md. Thơ dùng nguyên tác phiên âm Hán Việt (tác phẩm cổ, không vướng
// bản quyền bản dịch).

export interface ColumnPoem {
  readonly lines: readonly string[];
  readonly source: string;
}

export interface ColumnFillEntry {
  /** Đường dẫn tranh trong public/, để trống khi chưa vẽ. */
  readonly art?: string;
  readonly poem: ColumnPoem;
  /** Mẹo chơi ngắn, chỉ hiện khi chưa có tranh. */
  readonly tips: readonly string[];
}

export type ColumnFillMode = "daily" | "arena" | "destiny" | "survival" | "trial" | "clearPath" | "quests";

const NAM_QUOC_SON_HA: ColumnPoem = {
  lines: ["Nam quốc sơn hà Nam đế cư,", "Tiệt nhiên định phận tại thiên thư.", "Như hà nghịch lỗ lai xâm phạm,", "Nhữ đẳng hành khan thủ bại hư."],
  source: "Nam quốc sơn hà",
};

export const COLUMN_FILL: Readonly<Record<ColumnFillMode, ColumnFillEntry>> = {
  daily: {
    art: "/art/column-fill/daily.webp",
    poem: {
      lines: ["Đoạt sáo Chương Dương độ,", "Cầm Hồ Hàm Tử quan.", "Thái bình tu trí lực,", "Vạn cổ thử giang san."],
      source: "Trần Quang Khải, Tụng giá hoàn kinh sư",
    },
    tips: [
      "Đề hôm nay chung cho mọi người: cùng nước đi thì gặp cùng ô rơi.",
      "Nhiệm vụ ngày làm mới lúc 0 giờ, nhớ nhận thưởng trước khi qua ngày.",
    ],
  },
  arena: {
    art: "/art/column-fill/arena.webp",
    poem: {
      lines: ["Hoành sóc giang sơn cáp kỷ thu,", "Tam quân tì hổ khí thôn ngưu.", "Nam nhi vị liễu công danh trái,", "Tu thính nhân gian thuyết Vũ hầu."],
      source: "Phạm Ngũ Lão, Thuật hoài",
    },
    tips: [
      "Đội phòng thủ là bản chụp: đổi đội ở Doanh Trại rồi bấm cập nhật.",
      "Đánh đối thủ mạnh hơn được nhiều điểm hơn khi thắng.",
    ],
  },
  destiny: {
    art: "/art/column-fill/destiny.webp",
    poem: {
      lines: ["Quốc tộ như đằng lạc,", "Nam thiên lý thái bình.", "Vô vi cư điện các,", "Xứ xứ tức đao binh."],
      source: "Pháp Thuận, Quốc tộ",
    },
    tips: [
      "Mỗi tầng chỉ ba người ra trận; người còn lại nghỉ, máu và Nộ giữ qua tầng.",
      "Giữ tướng có hệ khắc (★) cho tầng có đối thủ cùng hệ.",
    ],
  },
  survival: {
    art: "/art/column-fill/survival.webp",
    poem: NAM_QUOC_SON_HA,
    tips: [
      "Dự bị không đánh nhưng hồi 10% máu mỗi lần nghỉ và thay người gục.",
      "Đối thủ mạnh dần theo đợt: giữ tướng hồi máu cho các đợt sau.",
    ],
  },
  trial: {
    art: "/art/column-fill/trial.webp",
    poem: {
      lines: ["Mạc vị xuân tàn hoa lạc tận,", "Đình tiền tạc dạ nhất chi mai."],
      source: "Mãn Giác thiền sư, Cáo tật thị chúng",
    },
    tips: [
      "Đánh lại tầng đã qua bao nhiêu lần cũng được; Đá Cường Hóa chỉ nhận lần đầu.",
      "Đọc luật tầng trước khi chọn tướng kèm: nghề hoặc hệ bị cấm sẽ mờ đi.",
    ],
  },
  // Khai Lộ (Shan chọn phương án A 20/11/2026): tranh mở đường, prompt ở /mnt/project-files/art/prompts/khai-lo-nen.md.
  // Tranh cắt từ phần cây đa bên trái của nền Khai Lộ (public/art/khai-lo/bg.webp) Shan vẽ.
  clearPath: {
    art: "/art/column-fill/clear-path.webp",
    poem: {
      lines: ["Thôn hậu thôn tiền đạm tự yên,", "Bán vô bán hữu tịch dương biên.", "Mục đồng địch lý quy ngưu tận,", "Bạch lộ song song phi hạ điền."],
      source: "Trần Nhân Tông, Thiên Trường vãn vọng",
    },
    tips: [
      "Khối càng lớn điểm càng cao: gom quân cùng hệ lại rồi mới xóa.",
      "Để dành đạo cụ cho mấy quân lẻ cuối bàn.",
    ],
  },
  quests: {
    poem: {
      lines: ["Trí chủ hữu hoài phù địa trục,", "Tẩy binh vô lộ vãn thiên hà.", "Quốc thù vị báo đầu tiên bạch,", "Kỷ độ Long Tuyền đái nguyệt ma."],
      source: "Đặng Dung, Cảm hoài",
    },
    tips: [
      "Nhiệm vụ tuần làm mới lúc 0 giờ thứ Hai, nhận thưởng trước khi qua tuần.",
      "Nhóm thành tựu có thưởng chờ nhận tự mở sẵn.",
      "Điểm danh và nhiệm vụ ngày nhận ở Nhật Lệnh.",
    ],
  },
};
