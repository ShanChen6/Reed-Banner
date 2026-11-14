// Kho câu hỏi Sử Lộ, quy tắc soạn và duyệt ở docs/02-game-modes/su-lo/gdd.md mục 10.
// Mỗi câu ghi claim và nguồn theo sổ nguồn (docs/02-game-modes/campaign/history-sources.md cho S01–S11 và E/W/U,
// docs/02-game-modes/su-lo/nguon-su.md cho claim SL..). Câu có `quote` thì test kiểm câu trích có trong sổ.
// Trạng thái: "verified" = Claude duyệt lần 1; "approved" = Shan duyệt lần 2. Bản chơi thử dùng cả hai.

export type SlEra = "ngo" | "loanSuQuan" | "dinh" | "tienLe";
export type SlQuestionKind = "choice" | "trueFalse" | "year" | "order" | "match" | "reading";
export type SlQuestionStatus = "draft" | "verified" | "approved" | "retired";
export type SlDifficulty = 1 | 2 | 3;

export interface SlQuestionSource {
  readonly id: string;
  readonly locator: string;
  readonly quote?: string;
}

export interface SlQuestion {
  readonly id: string;
  readonly era: SlEra;
  readonly difficulty: SlDifficulty;
  readonly kind: SlQuestionKind;
  readonly prompt: string;
  /** Câu trích hiện trên bia đá (dạng reading). */
  readonly passage?: string;
  /** choice/year/trueFalse/reading: các đáp án; order: các mục cần xếp; match: cột trái. */
  readonly options: readonly string[];
  /** match: cột phải. */
  readonly matchWith?: readonly string[];
  /**
   * choice/year/trueFalse/reading: chỉ số đáp án đúng; order: chỉ số trong `options` theo thứ tự đúng;
   * match: với mỗi mục cột trái, chỉ số mục cột phải đúng.
   */
  readonly answer: number | readonly number[];
  readonly explanation: string;
  readonly hint?: string;
  readonly people?: readonly string[];
  readonly places?: readonly string[];
  readonly claims: readonly string[];
  readonly basis: "recorded" | "legend" | "disputed";
  readonly confidence: "high" | "medium" | "low";
  readonly sources: readonly SlQuestionSource[];
  readonly status: SlQuestionStatus;
  readonly rev: number;
}

const TF = ["Đúng", "Sai"] as const;
const V = "verified" as const;

export const SL_QUESTIONS: readonly SlQuestion[] = [
  // ── Mê cung I: Ngô Quyền dựng nước ──
  {
    id: "sl-ngo-001", era: "ngo", difficulty: 1, kind: "choice",
    prompt: "Mùa xuân năm 939, Ngô Quyền làm gì?",
    options: ["Xưng hoàng đế", "Xưng vương", "Nhận chức Tiết độ sứ", "Nhường ngôi cho con"], answer: 1,
    explanation: "Toàn thư chép năm 939: \"mùa Xuân, Vương mới xưng vương, lập Dương thị làm vương hậu\". Ngô Quyền xưng vương, không xưng đế.",
    hint: "Sử gọi ông là Tiền Ngô vương.", people: ["Ngô Quyền"],
    claims: ["E01"], basis: "recorded", confidence: "high",
    sources: [{ id: "S03", locator: "Đời Ngô, mục Kỷ Hợi 939", quote: "mùa Xuân, Vương mới xưng vương, lập Dương thị làm vương hậu" }],
    status: V, rev: 1,
  },
  {
    id: "sl-ngo-002", era: "ngo", difficulty: 1, kind: "trueFalse",
    prompt: "Năm 939, Ngô Quyền xưng hoàng đế.",
    options: TF, answer: 1,
    explanation: "Ngô Quyền xưng vương năm 939, không dùng danh hiệu hoàng đế.",
    people: ["Ngô Quyền"], claims: ["E01"], basis: "recorded", confidence: "high",
    sources: [{ id: "S03", locator: "Đời Ngô, mục Kỷ Hợi 939" }], status: V, rev: 1,
  },
  {
    id: "sl-ngo-003", era: "ngo", difficulty: 2, kind: "choice",
    prompt: "Năm 939, Ngô Quyền lập ai làm vương hậu?",
    options: ["Dương thị", "Lê thị", "Kiều thị", "Đinh thị"], answer: 0,
    explanation: "Toàn thư chép Ngô Quyền xưng vương và \"lập Dương thị làm vương hậu\".",
    hint: "Họ của bà trùng với họ của người sau này cướp ngôi nhà Ngô.", people: ["Ngô Quyền"],
    claims: ["E01"], basis: "recorded", confidence: "high",
    sources: [{ id: "S03", locator: "Đời Ngô, mục Kỷ Hợi 939", quote: "lập Dương thị làm vương hậu" }],
    status: V, rev: 1,
  },
  {
    id: "sl-ngo-004", era: "ngo", difficulty: 2, kind: "year",
    prompt: "Ngô Quyền mất năm nào?",
    options: ["939", "944", "951", "965"], answer: 1,
    explanation: "Toàn thư chép Ngô Quyền mất năm 944 (Giáp Thìn).",
    people: ["Ngô Quyền"], claims: ["E01"], basis: "recorded", confidence: "high",
    sources: [{ id: "S03", locator: "Đời Ngô, mục Giáp Thìn 944" }], status: V, rev: 1,
  },
  {
    id: "sl-ngo-005", era: "ngo", difficulty: 2, kind: "choice",
    prompt: "Sau khi Ngô Quyền mất, ai cướp ngôi?",
    options: ["Ngô Xương Văn", "Kiều Công Hãn", "Dương Tam Kha", "Đỗ Cảnh Thạc"], answer: 2,
    explanation: "Toàn thư chép Ngô Quyền mất năm 944 và \"Tam Kha cướp ngôi\" ở mục năm 945. Câu không hỏi năm vì cách gắn năm còn khác nhau.",
    people: ["Dương Tam Kha", "Ngô Quyền"], claims: ["E02"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S03", locator: "Đời Ngô, mục Ất Tỵ 945" }], status: V, rev: 1,
  },
  {
    id: "sl-ngo-006", era: "ngo", difficulty: 2, kind: "reading",
    prompt: "Sử gia Lê Văn Hưu khen một vị vua đã \"phá trăm vạn binh của Lưu Hoằng Tháo\". Đó là ai?",
    passage: "\"…phá trăm vạn binh của Lưu Hoằng Tháo…\" (lời bàn của Lê Văn Hưu về Tiền Ngô vương).",
    options: ["Dương Đình Nghệ", "Ngô Quyền", "Đinh Bộ Lĩnh", "Ngô Xương Văn"], answer: 1,
    explanation: "Lê Văn Hưu khen Tiền Ngô vương Ngô Quyền đã phá quân của Lưu Hoằng Tháo nước Nam Hán.",
    people: ["Ngô Quyền"], claims: ["SL01"], basis: "recorded", confidence: "high",
    sources: [{ id: "S03", locator: "Đời Ngô, lời bàn của Lê Văn Hưu về Tiền Ngô vương", quote: "phá trăm vạn binh của Lưu Hoằng Tháo" }],
    status: V, rev: 1,
  },
  {
    id: "sl-ngo-007", era: "ngo", difficulty: 2, kind: "choice",
    prompt: "Theo Toàn thư, Ngô Quyền đóng đô ở đâu?",
    options: ["Hoa Lư", "Loa thành", "Đại La", "Bố Hải"], answer: 1,
    explanation: "Đoạn mở đầu đời Tiền Ngô vương trong Toàn thư chép ông \"đóng đô ở Loa thành\" (thành Cổ Loa).",
    places: ["Loa thành"], people: ["Ngô Quyền"], claims: ["SL02"], basis: "recorded", confidence: "high",
    sources: [{ id: "S03", locator: "Đời Ngô, đoạn mở đầu đời Tiền Ngô vương", quote: "đóng đô ở Loa thành" }],
    status: V, rev: 1,
  },
  {
    id: "sl-ngo-008", era: "ngo", difficulty: 2, kind: "choice",
    prompt: "Ai lật đổ Dương Tam Kha, khôi phục nhà Ngô?",
    options: ["Ngô Xương Văn", "Ngô Nhật Khánh", "Đinh Bộ Lĩnh", "Trần Lãm"], answer: 0,
    explanation: "Ngô Xương Văn, con Ngô Quyền, lật Dương Tam Kha; nhà Hậu Ngô có Nam Tấn Vương và Thiên Sách Vương. Năm khôi phục sách chép khác nhau (950 hay 951) nên câu không hỏi năm.",
    people: ["Ngô Xương Văn", "Dương Tam Kha"], claims: ["E03"], basis: "recorded", confidence: "high",
    sources: [{ id: "S05", locator: "Nhà Ngô, đoạn Hậu Ngô" }, { id: "S02", locator: "Hậu Ngô Vương, mục Tân Hợi 951" }],
    status: V, rev: 1,
  },
  {
    id: "sl-ngo-009", era: "ngo", difficulty: 3, kind: "choice",
    prompt: "Nam Tấn Vương và Thiên Sách Vương là gì?",
    options: ["Vương hiệu của hai vua nhà Hậu Ngô", "Hai niên hiệu nhà Ngô", "Hai sứ quân thời loạn", "Hai kinh đô nhà Ngô"], answer: 0,
    explanation: "Nhà Hậu Ngô có hai vua cùng trị: Nam Tấn Vương và Thiên Sách Vương. Đây là vương hiệu, không phải niên hiệu.",
    claims: ["E03"], basis: "recorded", confidence: "high",
    sources: [{ id: "S02", locator: "Hậu Ngô Vương, mục Tân Hợi 951" }], status: V, rev: 1,
  },

  // ── Mê cung II: Loạn sứ quân ──
  {
    id: "sl-loan-001", era: "loanSuQuan", difficulty: 1, kind: "trueFalse",
    prompt: "Năm 951, hai vua Ngô đem quân vây Hoa Lư và hạ được thành.",
    options: TF, answer: 1,
    explanation: "Hai vua Ngô đánh Hoa Lư không hạ được, rút quân về.",
    places: ["Hoa Lư"], claims: ["E04"], basis: "recorded", confidence: "high",
    sources: [{ id: "S02", locator: "Hậu Ngô Vương, mục Tân Hợi 951" }], status: V, rev: 1,
  },
  {
    id: "sl-loan-002", era: "loanSuQuan", difficulty: 1, kind: "choice",
    prompt: "Năm 951, hai vua Ngô đem quân đánh nơi nào nhưng không hạ được?",
    options: ["Bố Hải", "Hoa Lư", "Đằng Châu", "Phong Châu"], answer: 1,
    explanation: "Năm 951 hai vua Ngô đánh Hoa Lư của Đinh Bộ Lĩnh, không hạ được, phải rút về.",
    places: ["Hoa Lư"], people: ["Đinh Bộ Lĩnh"], claims: ["E04"], basis: "recorded", confidence: "high",
    sources: [{ id: "S02", locator: "Hậu Ngô Vương, mục Tân Hợi 951" }, { id: "S04", locator: "Đinh Tiên Hoàng, đoạn 951" }],
    status: V, rev: 1,
  },
  {
    id: "sl-loan-003", era: "loanSuQuan", difficulty: 3, kind: "choice",
    prompt: "Theo sử chép, trong cuộc vây Hoa Lư năm 951, Đinh Liễn ở đâu?",
    options: ["Làm con tin trong tay quân Ngô", "Giữ cửa biển Bố Hải", "Đi sứ phương Bắc", "Chỉ huy quân giữ thành"], answer: 0,
    explanation: "Sử kể Đinh Liễn làm con tin, bị quân Ngô treo lên dọa giết. Đây là tình tiết kể lại trong sử muộn, chi tiết không chắc chắn.",
    people: ["Đinh Liễn"], places: ["Hoa Lư"], claims: ["E04a"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S02", locator: "Hậu Ngô Vương, mục Tân Hợi 951" }], status: V, rev: 1,
  },
  {
    id: "sl-loan-004", era: "loanSuQuan", difficulty: 2, kind: "year",
    prompt: "Ngô Xương Văn (Nam Tấn Vương) mất trận năm nào?",
    options: ["951", "954", "965", "968"], answer: 2,
    explanation: "Toàn thư chép Ngô Xương Văn mất trận năm 965 (Ất Sửu).",
    people: ["Ngô Xương Văn"], claims: ["E06"], basis: "recorded", confidence: "high",
    sources: [{ id: "S02", locator: "Hậu Ngô Vương, mục Ất Sửu 965" }], status: V, rev: 1,
  },
  {
    id: "sl-loan-005", era: "loanSuQuan", difficulty: 3, kind: "year",
    prompt: "Ngô Xương Ngập (Thiên Sách Vương) mất năm nào?",
    options: ["944", "951", "954", "965"], answer: 2,
    explanation: "Toàn thư chép Ngô Xương Ngập mất năm 954 (Giáp Dần).",
    people: ["Ngô Xương Ngập"], claims: ["E05"], basis: "recorded", confidence: "high",
    sources: [{ id: "S02", locator: "Hậu Ngô Vương, mục Giáp Dần 954" }], status: V, rev: 1,
  },
  {
    id: "sl-loan-006", era: "loanSuQuan", difficulty: 2, kind: "choice",
    prompt: "Trần Lãm xưng là gì và giữ nơi nào?",
    options: ["Trần Minh Công, giữ cửa biển Bố Hải", "Trần Lãm Công, giữ Đường Lâm", "Trần Minh Công, giữ Đằng Châu", "Trần Lãm Công, giữ Tế Giang"], answer: 0,
    explanation: "Toàn thư mục 966: \"Trần Lãm, xưng là Trần Minh Công, giữ cửa biển Bố-Hải.\"",
    people: ["Trần Lãm"], places: ["Bố Hải"], claims: ["W01"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục 966", quote: "Trần Lãm, xưng là Trần Minh Công, giữ cửa biển Bố-Hải." }],
    status: V, rev: 1,
  },
  {
    id: "sl-loan-007", era: "loanSuQuan", difficulty: 1, kind: "choice",
    prompt: "Đinh Bộ Lĩnh cùng người con nào sang nương tựa Trần Minh Công?",
    options: ["Đinh Toàn", "Đinh Liễn", "Đinh Điền", "Hạng Lang"], answer: 1,
    explanation: "Toàn thư: \"Đinh Bộ Lĩnh nghe Trần Minh Công có đức mà không con, bèn cùng với con là Liễn sang nương tựa.\"",
    people: ["Đinh Bộ Lĩnh", "Đinh Liễn", "Trần Lãm"], claims: ["E08"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục Đinh Mão 967", quote: "Đinh Bộ Lĩnh nghe Trần Minh Công có đức mà không con, bèn cùng với con là Liễn sang nương tựa." }],
    status: V, rev: 1,
  },
  {
    id: "sl-loan-008", era: "loanSuQuan", difficulty: 2, kind: "reading",
    prompt: "Theo đoạn trích, vì sao Đinh Bộ Lĩnh sang nương tựa Trần Minh Công?",
    passage: "\"Đinh Bộ Lĩnh nghe Trần Minh Công có đức mà không con, bèn cùng với con là Liễn sang nương tựa.\" (Toàn thư, mục 967)",
    options: ["Vì Trần Minh Công có đức mà không có con", "Vì thua trận phải chạy trốn", "Vì được triều đình sai đến", "Vì muốn chiếm cửa biển"], answer: 0,
    explanation: "Sử chép Đinh Bộ Lĩnh nghe Trần Minh Công có đức mà không con nên đem Liễn sang nương tựa. Năm bắt đầu quan hệ này còn bàn cãi.",
    people: ["Đinh Bộ Lĩnh", "Trần Lãm"], claims: ["E08"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục Đinh Mão 967", quote: "Đinh Bộ Lĩnh nghe Trần Minh Công có đức mà không con, bèn cùng với con là Liễn sang nương tựa." }],
    status: V, rev: 1,
  },
  {
    id: "sl-loan-009", era: "loanSuQuan", difficulty: 2, kind: "choice",
    prompt: "Theo Toàn thư, Trần Minh Công đối đãi với Đinh Bộ Lĩnh thế nào?",
    options: ["Nuôi làm con, giao cho cầm quân", "Bắt giam làm con tin", "Đuổi về Hoa Lư", "Gả con gái rồi cho về"], answer: 0,
    explanation: "Toàn thư: \"Minh Công thấy người mặt mũi khôi ngô, lại có độ lượng, bèn nuôi làm con. Nhân giao cho cầm quân…\"",
    people: ["Trần Lãm", "Đinh Bộ Lĩnh"], claims: ["E08"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục Đinh Mão 967", quote: "Minh Công thấy người mặt mũi khôi ngô, lại có độ lượng, bèn nuôi làm con. Nhân giao cho cầm quân…" }],
    status: V, rev: 1,
  },
  {
    id: "sl-loan-010", era: "loanSuQuan", difficulty: 3, kind: "choice",
    prompt: "Theo Toàn thư, Phạm Phòng Át (Phạm Bạch Hổ) đã làm gì?",
    options: ["Tử trận ở Đằng Châu", "Đem binh về hàng", "Rút ra biển", "Liên minh rồi phản lại"], answer: 1,
    explanation: "Toàn thư mục 967: \"Phạm Phòng Át đem binh về hàng.\" Về sau ông giữ chức Thân vệ tướng quân.",
    people: ["Phạm Bạch Hổ"], places: ["Đằng Châu"], claims: ["E09", "W02"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục 967", quote: "Phạm Phòng Át đem binh về hàng." }],
    status: V, rev: 1,
  },
  {
    id: "sl-loan-011", era: "loanSuQuan", difficulty: 3, kind: "choice",
    prompt: "Sau khi về với Đinh Bộ Lĩnh, Phạm Phòng Át giữ chức gì?",
    options: ["Thân vệ tướng quân", "Thập đạo tướng quân", "Định quốc công", "Tiết độ sứ"], answer: 0,
    explanation: "Phạm Phòng Át đem quân về hàng, sau giữ chức Thân vệ tướng quân.",
    people: ["Phạm Bạch Hổ"], claims: ["E09"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục 967" }], status: V, rev: 1,
  },
  {
    id: "sl-loan-012", era: "loanSuQuan", difficulty: 2, kind: "choice",
    prompt: "Phạm Bạch Hổ xưng là gì và giữ nơi nào?",
    options: ["Phạm Phòng Át, giữ Đằng Châu", "Phạm Lệnh Công, giữ Tiên Du", "Phạm Phòng Át, giữ Phong Châu", "Phạm Tá Công, giữ Tế Giang"], answer: 0,
    explanation: "Toàn thư mục 966: \"Phạm Bạch Hổ, xưng là Phạm Phòng Át, giữ Đằng châu.\"",
    people: ["Phạm Bạch Hổ"], places: ["Đằng Châu"], claims: ["W02"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục 966", quote: "Phạm Bạch Hổ, xưng là Phạm Phòng Át, giữ Đằng châu." }],
    status: V, rev: 1,
  },
  {
    id: "sl-loan-013", era: "loanSuQuan", difficulty: 2, kind: "match",
    prompt: "Nối sứ quân với nơi giữ.",
    options: ["Trần Lãm", "Phạm Bạch Hổ", "Ngô Xương Xí"], matchWith: ["Bình Kiều", "Bố Hải", "Đằng Châu"], answer: [1, 2, 0],
    explanation: "Toàn thư liệt kê các sứ quân cùng nơi họ giữ ở mục năm 966; danh sách không phải thứ tự giao chiến.",
    people: ["Trần Lãm", "Phạm Bạch Hổ", "Ngô Xương Xí"], claims: ["W01", "W02", "W03"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục 966" }], status: V, rev: 1,
  },
  {
    id: "sl-loan-014", era: "loanSuQuan", difficulty: 3, kind: "choice",
    prompt: "Theo lời chua trong Toàn thư, Bình Kiều (nơi Ngô Xương Xí giữ) ở đâu?",
    options: ["Hưng Yên", "Thanh Hóa", "\"Nay không rõ chỗ nào\"", "Hoa Lư"], answer: 2,
    explanation: "Lời chua ghi \"Bình Kiều, nay không rõ chỗ nào.\" Sách đời sau định vị khác nhau (Hưng Yên, Thanh Hóa), nên đây vẫn là điểm còn bàn.",
    places: ["Bình Kiều"], people: ["Ngô Xương Xí"], claims: ["W03", "U03"], basis: "disputed", confidence: "medium",
    sources: [{ id: "S01", locator: "Ngô sứ quân, lời chua Bình Kiều", quote: "Bình Kiều, nay không rõ chỗ nào." }],
    status: V, rev: 1,
  },
  {
    id: "sl-loan-015", era: "loanSuQuan", difficulty: 3, kind: "choice",
    prompt: "Theo Toàn thư, Ngô Xương Xí là con của ai?",
    options: ["Thiên Sách Vương", "Nam Tấn Vương", "Dương Tam Kha", "Trần Minh Công"], answer: 0,
    explanation: "Toàn thư mở mục Ngô sứ quân ghi Ngô Xương Xí là con Thiên Sách Vương; ông giữ Bình Kiều.",
    people: ["Ngô Xương Xí"], claims: ["W03"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, đoạn mở mục" }], status: V, rev: 1,
  },
  {
    id: "sl-loan-016", era: "loanSuQuan", difficulty: 2, kind: "choice",
    prompt: "Ngô Nhật Khánh xưng là gì?",
    options: ["Ngô Lãm Công", "Ngô Nam Công", "Ngô Lệnh Công", "Ngô Minh Công"], answer: 0,
    explanation: "Toàn thư mục 966: Ngô Nhật Khánh xưng là Ngô Lãm Công, giữ Đường Lâm (có thuyết nói giữ Giao Thủy).",
    people: ["Ngô Nhật Khánh"], places: ["Đường Lâm"], claims: ["W04"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục 966", quote: "Ngô Nhật Khánh, xưng là Ngô Lãm Công, giữ Đường Lâm" }],
    status: V, rev: 1,
  },
  {
    id: "sl-loan-017", era: "loanSuQuan", difficulty: 3, kind: "choice",
    prompt: "Theo lời chua trong Toàn thư, Ngô Nhật Khánh là người thế nào với Ngô Quyền?",
    options: ["Người trong họ Ngô Quyền", "Con rể Ngô Quyền", "Tướng của Dương Tam Kha", "Người họ Trần ở Bố Hải"], answer: 0,
    explanation: "Lời chua: \"Ngô Nhật Khánh, người trong họ Ngô Quyền.\"",
    people: ["Ngô Nhật Khánh", "Ngô Quyền"], claims: ["W04"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, lời chua Nhật Khánh", quote: "Ngô Nhật Khánh, người trong họ Ngô Quyền." }],
    status: V, rev: 1,
  },
  {
    id: "sl-loan-018", era: "loanSuQuan", difficulty: 2, kind: "choice",
    prompt: "Nguyễn Khoan xưng là gì và giữ nơi nào?",
    options: ["Nguyễn Thái Bình, giữ Tam Đái", "Nguyễn Hữu Công, giữ Tây Phù Liệt", "Nguyễn Lệnh Công, giữ Tiên Du", "Nguyễn Thái Bình, giữ Hồi Hồ"], answer: 0,
    explanation: "Toàn thư mục 966 chép Nguyễn Khoan xưng Nguyễn Thái Bình, giữ Tam Đái. \"Thái Bình\" ở đây không phải niên hiệu năm 970.",
    people: ["Nguyễn Khoan"], places: ["Tam Đái"], claims: ["W05"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục 966" }], status: V, rev: 1,
  },
  {
    id: "sl-loan-019", era: "loanSuQuan", difficulty: 2, kind: "choice",
    prompt: "Kiều Công Hãn xưng là gì và giữ nơi nào?",
    options: ["Kiều Tam Chế, giữ Phong Châu", "Kiều Lệnh Công, giữ Hồi Hồ", "Kiều Tam Chế, giữ Siêu Loại", "Kiều Lệnh Công, giữ Phong Châu"], answer: 0,
    explanation: "Toàn thư mục 966 chép Kiểu Công Hãn (Kiều Công Hãn) xưng Kiểu Tam Chế, giữ Phong Châu.",
    people: ["Kiều Công Hãn"], places: ["Phong Châu"], claims: ["W06"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục 966" }], status: V, rev: 1,
  },
  {
    id: "sl-loan-020", era: "loanSuQuan", difficulty: 2, kind: "choice",
    prompt: "Kiều Thuận xưng là gì và giữ nơi nào?",
    options: ["Kiều Lệnh Công, giữ Hồi Hồ", "Kiều Tam Chế, giữ Phong Châu", "Kiều Lệnh Công, giữ Tế Giang", "Kiều Minh Công, giữ Hồi Hồ"], answer: 0,
    explanation: "Toàn thư mục 966 chép Kiểu Thuận (Kiều Thuận) xưng Kiểu Lệnh Công, giữ Hồi Hồ.",
    people: ["Kiều Thuận"], places: ["Hồi Hồ"], claims: ["W07"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục 966" }], status: V, rev: 1,
  },
  {
    id: "sl-loan-021", era: "loanSuQuan", difficulty: 3, kind: "choice",
    prompt: "Lý Khuê giữ vùng nào?",
    options: ["Siêu Loại", "Tiên Du", "Tế Giang", "Tam Đái"], answer: 0,
    explanation: "Toàn thư mục 966 chép Lý Khuê xưng Lý Lãng Công (có bản chép Lý Lang Công), giữ Siêu Loại.",
    people: ["Lý Khuê"], places: ["Siêu Loại"], claims: ["W08"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục 966" }, { id: "S05", locator: "Nhà Ngô, danh sách Thập nhị sứ quân" }],
    status: V, rev: 1,
  },
  {
    id: "sl-loan-022", era: "loanSuQuan", difficulty: 2, kind: "choice",
    prompt: "Nguyễn Thủ Tiệp xưng là gì và giữ nơi nào?",
    options: ["Nguyễn Lệnh Công, giữ Tiên Du", "Nguyễn Thái Bình, giữ Tam Đái", "Nguyễn Hữu Công, giữ Tiên Du", "Nguyễn Lệnh Công, giữ Phong Châu"], answer: 0,
    explanation: "Toàn thư mục 966 chép Nguyễn Thủ Tiệp xưng Nguyễn Lệnh Công, giữ Tiên Du.",
    people: ["Nguyễn Thủ Tiệp"], places: ["Tiên Du"], claims: ["W09"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục 966" }], status: V, rev: 1,
  },
  {
    id: "sl-loan-023", era: "loanSuQuan", difficulty: 2, kind: "choice",
    prompt: "Lữ Đường (Toàn thư chép Lã Đường) giữ nơi nào?",
    options: ["Tế Giang", "Bố Hải", "Hồi Hồ", "Đỗ Động Giang"], answer: 0,
    explanation: "Toàn thư mục 966 chép Lã Đường xưng Lã Tá Công, giữ Tế Giang; Việt Nam sử lược chép Lữ Đường, Lữ Tá Công.",
    people: ["Lữ Đường"], places: ["Tế Giang"], claims: ["W10"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục 966" }, { id: "S05", locator: "Nhà Ngô, danh sách Thập nhị sứ quân" }],
    status: V, rev: 1,
  },
  {
    id: "sl-loan-024", era: "loanSuQuan", difficulty: 3, kind: "choice",
    prompt: "Nguyễn Siêu xưng là gì và giữ nơi nào?",
    options: ["Nguyễn Hữu Công, giữ Tây Phù Liệt", "Nguyễn Lệnh Công, giữ Tây Phù Liệt", "Nguyễn Hữu Công, giữ Tiên Du", "Nguyễn Thái Bình, giữ Tây Phù Liệt"], answer: 0,
    explanation: "Toàn thư mục 966 chép Nguyễn Siêu xưng Nguyễn Hữu Công, giữ Tây Phù Liệt.",
    people: ["Nguyễn Siêu"], places: ["Tây Phù Liệt"], claims: ["W11"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục 966" }], status: V, rev: 1,
  },
  {
    id: "sl-loan-025", era: "loanSuQuan", difficulty: 2, kind: "choice",
    prompt: "Đỗ Cảnh Thạc xưng là gì và giữ nơi nào?",
    options: ["Đỗ Cảnh Công, giữ Đỗ Động Giang", "Đỗ Lệnh Công, giữ Đỗ Động Giang", "Đỗ Cảnh Công, giữ Tế Giang", "Đỗ Minh Công, giữ Bố Hải"], answer: 0,
    explanation: "Toàn thư mục 966 chép Đỗ Cảnh Thạc xưng Đỗ Cảnh Công, giữ Đỗ Động Giang.",
    people: ["Đỗ Cảnh Thạc"], places: ["Đỗ Động Giang"], claims: ["W12"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục 966" }], status: V, rev: 1,
  },
  {
    id: "sl-loan-026", era: "loanSuQuan", difficulty: 2, kind: "match",
    prompt: "Nối sứ quân với nơi giữ.",
    options: ["Nguyễn Khoan", "Lữ Đường", "Nguyễn Thủ Tiệp"], matchWith: ["Tiên Du", "Tam Đái", "Tế Giang"], answer: [1, 2, 0],
    explanation: "Toàn thư mục 966: Nguyễn Khoan giữ Tam Đái, Lã (Lữ) Đường giữ Tế Giang, Nguyễn Thủ Tiệp giữ Tiên Du.",
    people: ["Nguyễn Khoan", "Lữ Đường", "Nguyễn Thủ Tiệp"], claims: ["W05", "W09", "W10"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục 966" }], status: V, rev: 1,
  },
  {
    id: "sl-loan-027", era: "loanSuQuan", difficulty: 3, kind: "match",
    prompt: "Nối sứ quân với nơi giữ.",
    options: ["Kiều Công Hãn", "Nguyễn Siêu", "Đỗ Cảnh Thạc"], matchWith: ["Đỗ Động Giang", "Phong Châu", "Tây Phù Liệt"], answer: [1, 2, 0],
    explanation: "Toàn thư mục 966: Kiều Công Hãn giữ Phong Châu, Nguyễn Siêu giữ Tây Phù Liệt, Đỗ Cảnh Thạc giữ Đỗ Động Giang.",
    people: ["Kiều Công Hãn", "Nguyễn Siêu", "Đỗ Cảnh Thạc"], claims: ["W06", "W11", "W12"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục 966" }], status: V, rev: 1,
  },
  {
    id: "sl-loan-028", era: "loanSuQuan", difficulty: 1, kind: "trueFalse",
    prompt: "Thứ tự các sứ quân trong danh sách của Toàn thư cũng là thứ tự Đinh Bộ Lĩnh đánh dẹp họ.",
    options: TF, answer: 1,
    explanation: "Danh sách chỉ liệt kê các thế lực; sử không cho biết thứ tự từng trận, và nhiều người quy phục chứ không bị đánh.",
    claims: ["E07", "E13"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục 966 và phụ chú số 2" }], status: V, rev: 1,
  },
  {
    id: "sl-loan-029", era: "loanSuQuan", difficulty: 1, kind: "trueFalse",
    prompt: "\"Nguyễn Thái Bình\" trong danh sách sứ quân là niên hiệu Thái Bình năm 970.",
    options: TF, answer: 1,
    explanation: "Nguyễn Thái Bình là cách xưng của sứ quân Nguyễn Khoan. Niên hiệu Thái Bình của nhà Đinh bắt đầu năm 970, là chuyện khác.",
    people: ["Nguyễn Khoan"], claims: ["W05", "E11"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục 966" }, { id: "S04", locator: "Đinh Tiên Hoàng, đoạn Canh Ngọ" }],
    status: V, rev: 1,
  },
  {
    id: "sl-loan-030", era: "loanSuQuan", difficulty: 3, kind: "year",
    prompt: "Toàn thư chép danh sách mười hai sứ quân ở mục năm nào?",
    options: ["951", "965", "966", "968"], answer: 2,
    explanation: "Danh sách nằm ở mục năm 966 (Bính Dần). Phụ chú của sách lưu ý các thế lực không nhất thiết cùng nổi lên năm đó.",
    claims: ["E07"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục Bính Dần 966" }], status: V, rev: 1,
  },
  {
    id: "sl-loan-031", era: "loanSuQuan", difficulty: 1, kind: "choice",
    prompt: "Tương truyền thuở nhỏ chăn trâu, Đinh Bộ Lĩnh cùng bạn bè lấy gì làm cờ khi bày trận?",
    options: ["Lá chuối", "Bông lau", "Cành tre", "Vải đỏ"], answer: 1,
    explanation: "Đây là truyền thuyết sách sử có kể, không phải chuyện xác định được ngày tháng.",
    people: ["Đinh Bộ Lĩnh"], claims: ["E12"], basis: "legend", confidence: "low",
    sources: [{ id: "S04", locator: "Đinh Tiên Hoàng, đoạn đầu" }, { id: "S07", locator: "đoạn sử và truyền thuyết" }],
    status: V, rev: 1,
  },
  {
    id: "sl-loan-032", era: "loanSuQuan", difficulty: 3, kind: "order",
    prompt: "Xếp các sự kiện theo thời gian, từ sớm tới muộn.",
    options: ["Hai vua Ngô vây Hoa Lư", "Ngô Quyền xưng vương", "Ngô Xương Văn mất trận", "Ngô Quyền mất"], answer: [1, 3, 0, 2],
    explanation: "Ngô Quyền xưng vương (939) → Ngô Quyền mất (944) → hai vua Ngô vây Hoa Lư (951) → Ngô Xương Văn mất trận (965).",
    claims: ["E01", "E04", "E06"], basis: "recorded", confidence: "high",
    sources: [{ id: "S03", locator: "Đời Ngô, mục 939 và 944" }, { id: "S02", locator: "Hậu Ngô Vương, mục 951 và 965" }],
    status: V, rev: 1,
  },

  // ── Mê cung III: Nhà Đinh (mới có câu từ mốc 968–970) ──
  {
    id: "sl-dinh-001", era: "dinh", difficulty: 1, kind: "choice",
    prompt: "Năm 968, Đinh Bộ Lĩnh lên ngôi hoàng đế và đặt quốc hiệu là gì?",
    options: ["Đại Việt", "Đại Cồ Việt", "Vạn Xuân", "Đại Nam"], answer: 1,
    explanation: "Năm 968 Đinh Bộ Lĩnh lên ngôi, đặt quốc hiệu Đại Cồ Việt, đóng đô ở Hoa Lư.",
    people: ["Đinh Bộ Lĩnh"], claims: ["E10"], basis: "recorded", confidence: "high",
    sources: [{ id: "S04", locator: "Đinh Tiên Hoàng, đoạn Mậu Thìn" }, { id: "S08", locator: "đoạn năm 968" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-002", era: "dinh", difficulty: 1, kind: "choice",
    prompt: "Năm 968, Đinh Bộ Lĩnh định đô ở đâu?",
    options: ["Loa thành", "Hoa Lư", "Đại La", "Phong Châu"], answer: 1,
    explanation: "Đinh Bộ Lĩnh lên ngôi năm 968 và định đô ở Hoa Lư.",
    people: ["Đinh Bộ Lĩnh"], places: ["Hoa Lư"], claims: ["E10"], basis: "recorded", confidence: "high",
    sources: [{ id: "S04", locator: "Đinh Tiên Hoàng, đoạn Mậu Thìn" }, { id: "S08", locator: "đoạn năm 968" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-003", era: "dinh", difficulty: 2, kind: "year",
    prompt: "Niên hiệu Thái Bình của nhà Đinh bắt đầu năm nào?",
    options: ["966", "968", "970", "979"], answer: 2,
    explanation: "Đinh Bộ Lĩnh lên ngôi năm 968, tới năm 970 mới đặt niên hiệu Thái Bình. Hai mốc này hay bị nhầm.",
    claims: ["E11"], basis: "recorded", confidence: "high",
    sources: [{ id: "S04", locator: "Đinh Tiên Hoàng, đoạn Canh Ngọ" }, { id: "S08", locator: "đoạn sau khi đặt quốc hiệu" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-004", era: "dinh", difficulty: 1, kind: "trueFalse",
    prompt: "Năm Đinh Bộ Lĩnh lên ngôi (968) cũng là năm đặt niên hiệu Thái Bình.",
    options: TF, answer: 1,
    explanation: "Lên ngôi năm 968, niên hiệu Thái Bình bắt đầu năm 970.",
    claims: ["E10", "E11"], basis: "recorded", confidence: "high",
    sources: [{ id: "S04", locator: "Đinh Tiên Hoàng, đoạn Mậu Thìn và Canh Ngọ" }], status: V, rev: 1,
  },
  {
    id: "sl-dinh-005", era: "dinh", difficulty: 2, kind: "choice",
    prompt: "Đinh Bộ Lĩnh là con của ai?",
    options: ["Đinh Công Trứ", "Đinh Điền", "Trần Lãm", "Ngô Xương Văn"], answer: 0,
    explanation: "Đinh Bộ Lĩnh người Hoa Lư, con Đinh Công Trứ.",
    people: ["Đinh Bộ Lĩnh"], places: ["Hoa Lư"], claims: ["E00"], basis: "recorded", confidence: "high",
    sources: [{ id: "S04", locator: "Đinh Tiên Hoàng, đoạn đầu" }, { id: "S08", locator: "đoạn đầu" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-006", era: "dinh", difficulty: 3, kind: "order",
    prompt: "Xếp các sự kiện theo thời gian, từ sớm tới muộn.",
    options: ["Đặt niên hiệu Thái Bình", "Ngô Quyền xưng vương", "Đinh Bộ Lĩnh lên ngôi", "Hai vua Ngô vây Hoa Lư"], answer: [1, 3, 2, 0],
    explanation: "Ngô Quyền xưng vương (939) → vây Hoa Lư (951) → Đinh Bộ Lĩnh lên ngôi (968) → niên hiệu Thái Bình (970).",
    claims: ["E01", "E04", "E10", "E11"], basis: "recorded", confidence: "high",
    sources: [{ id: "S03", locator: "Đời Ngô, mục 939" }, { id: "S02", locator: "Hậu Ngô Vương, mục 951" }, { id: "S04", locator: "Đinh Tiên Hoàng, đoạn Mậu Thìn và Canh Ngọ" }],
    status: V, rev: 1,
  },
];

/** Claim có trong sổ nguồn (Campaign ledger mục 3–4, warlord matrix và sổ nguồn Sử Lộ). */
export const SL_KNOWN_CLAIMS: ReadonlySet<string> = new Set([
  ...Array.from({ length: 14 }, (_, i) => `E${String(i).padStart(2, "0")}`),
  "E04a",
  ...Array.from({ length: 12 }, (_, i) => `W${String(i + 1).padStart(2, "0")}`),
  ...Array.from({ length: 8 }, (_, i) => `U0${i + 1}`),
  "SL01",
  "SL02",
]);

/** Nguồn có trong sổ: S01–S11 của Campaign. Nguồn mới (S12+) thêm vào sổ Sử Lộ trước rồi thêm vào đây. */
export const SL_KNOWN_SOURCES: ReadonlySet<string> = new Set(Array.from({ length: 11 }, (_, i) => `S${String(i + 1).padStart(2, "0")}`));

/** Câu được dùng khi chơi: bản chơi thử dùng cả câu Claude duyệt lần 1 và câu Shan đã duyệt. */
export function isPlayable(q: SlQuestion): boolean {
  return q.status === "verified" || q.status === "approved";
}

const isPerm = (a: readonly number[], n: number) => a.length === n && new Set(a).size === n && a.every((x) => Number.isInteger(x) && x >= 0 && x < n);

/** Lỗi soạn câu theo quy tắc ở GDD mục 10.3; mảng rỗng là hợp lệ. */
export function questionErrors(q: SlQuestion): string[] {
  const e: string[] = [];
  if (!/^sl-(ngo|loan|dinh|tienle)-\d{3}$/.test(q.id)) e.push("id sai mẫu");
  if (q.prompt.trim() === "" || q.explanation.trim() === "") e.push("thiếu câu hỏi hoặc giải thích");
  if (q.sources.length === 0) e.push("thiếu nguồn");
  for (const s of q.sources) {
    if (!SL_KNOWN_SOURCES.has(s.id)) e.push(`nguồn ${s.id} chưa có trong sổ`);
    if (s.locator.trim() === "") e.push(`nguồn ${s.id} thiếu locator`);
  }
  if (q.claims.length === 0) e.push("thiếu claim");
  for (const c of q.claims) if (!SL_KNOWN_CLAIMS.has(c)) e.push(`claim ${c} chưa có trong sổ`);
  if (new Set(q.options).size !== q.options.length) e.push("đáp án trùng nhau");
  const single = q.kind === "choice" || q.kind === "year" || q.kind === "reading" || q.kind === "trueFalse";
  if (single) {
    if (typeof q.answer !== "number" || q.answer < 0 || q.answer >= q.options.length) e.push("đáp án đúng không nằm trong options");
    if (q.kind === "trueFalse" && (q.options.length !== 2 || q.options[0] !== "Đúng" || q.options[1] !== "Sai")) e.push("đúng/sai phải có options Đúng, Sai");
    if (q.kind !== "trueFalse" && q.options.length !== 4) e.push("cần 4 đáp án");
  }
  if (q.kind === "order" && (typeof q.answer === "number" || !isPerm(q.answer, q.options.length) || q.options.length < 3)) e.push("thứ tự đúng không hợp lệ");
  if (q.kind === "match") {
    if (!q.matchWith || q.matchWith.length !== q.options.length) e.push("cột nối không khớp");
    else if (typeof q.answer === "number" || !isPerm(q.answer, q.options.length)) e.push("cặp nối không hợp lệ");
  }
  if (q.kind === "reading" && !q.passage) e.push("đọc hiểu cần câu trích");
  if (q.kind === "trueFalse" && q.difficulty !== 1) e.push("đúng/sai chỉ dùng cho ô Lục");
  if (q.basis === "disputed" && (q.kind === "year" || q.kind === "trueFalse")) e.push("mốc còn tranh cãi không hỏi dạng năm hay đúng/sai");
  if (q.basis === "legend" && !/tương truyền|theo truyền thuyết/i.test(q.prompt)) e.push("truyền thuyết phải ghi tương truyền");
  return e;
}

/** Kiểm câu trả lời: số cho câu một đáp án, mảng cho xếp thứ tự và nối. */
export function isCorrect(q: SlQuestion, answer: number | readonly number[] | null): boolean {
  if (answer === null) return false;
  if (typeof q.answer === "number") return answer === q.answer;
  if (typeof answer === "number") return false;
  const want = q.answer;
  return answer.length === want.length && answer.every((x, i) => x === want[i]);
}

export function questionById(id: string): SlQuestion | undefined {
  return SL_QUESTIONS.find((q) => q.id === id);
}
