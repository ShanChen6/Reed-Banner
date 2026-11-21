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
    explanation: "Toàn thư chép năm 939: “mùa Xuân, Vương mới xưng vương, lập Dương thị làm vương hậu”. Ngô Quyền xưng vương, không xưng đế.",
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
    explanation: "Toàn thư chép Ngô Quyền xưng vương và “lập Dương thị làm vương hậu”.",
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
    explanation: "Toàn thư chép Ngô Quyền mất năm 944 và “Tam Kha cướp ngôi” ở mục năm 945. Câu không hỏi năm vì cách gắn năm còn khác nhau.",
    people: ["Dương Tam Kha", "Ngô Quyền"], claims: ["E02"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S03", locator: "Đời Ngô, mục Ất Tỵ 945" }], status: V, rev: 1,
  },
  {
    id: "sl-ngo-006", era: "ngo", difficulty: 2, kind: "reading",
    prompt: "Sử gia Lê Văn Hưu khen một vị vua đã “phá trăm vạn binh của Lưu Hoằng Tháo”. Đó là ai?",
    passage: "“…phá trăm vạn binh của Lưu Hoằng Tháo…” (lời bàn của Lê Văn Hưu về Tiền Ngô vương).",
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
    explanation: "Đoạn mở đầu đời Tiền Ngô vương trong Toàn thư chép ông “đóng đô ở Loa thành” (thành Cổ Loa).",
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
    explanation: "Toàn thư mục 966: “Trần Lãm, xưng là Trần Minh Công, giữ cửa biển Bố-Hải.”",
    people: ["Trần Lãm"], places: ["Bố Hải"], claims: ["W01"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục 966", quote: "Trần Lãm, xưng là Trần Minh Công, giữ cửa biển Bố-Hải." }],
    status: V, rev: 1,
  },
  {
    id: "sl-loan-007", era: "loanSuQuan", difficulty: 1, kind: "choice",
    prompt: "Đinh Bộ Lĩnh cùng người con nào sang nương tựa Trần Minh Công?",
    options: ["Đinh Toàn", "Đinh Liễn", "Đinh Điền", "Hạng Lang"], answer: 1,
    explanation: "Toàn thư: “Đinh Bộ Lĩnh nghe Trần Minh Công có đức mà không con, bèn cùng với con là Liễn sang nương tựa.”",
    people: ["Đinh Bộ Lĩnh", "Đinh Liễn", "Trần Lãm"], claims: ["E08"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục Đinh Mão 967", quote: "Đinh Bộ Lĩnh nghe Trần Minh Công có đức mà không con, bèn cùng với con là Liễn sang nương tựa." }],
    status: V, rev: 1,
  },
  {
    id: "sl-loan-008", era: "loanSuQuan", difficulty: 2, kind: "reading",
    prompt: "Theo đoạn trích, vì sao Đinh Bộ Lĩnh sang nương tựa Trần Minh Công?",
    passage: "“Đinh Bộ Lĩnh nghe Trần Minh Công có đức mà không con, bèn cùng với con là Liễn sang nương tựa.” (Toàn thư, mục 967)",
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
    explanation: "Toàn thư: “Minh Công thấy người mặt mũi khôi ngô, lại có độ lượng, bèn nuôi làm con. Nhân giao cho cầm quân…”",
    people: ["Trần Lãm", "Đinh Bộ Lĩnh"], claims: ["E08"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, mục Đinh Mão 967", quote: "Minh Công thấy người mặt mũi khôi ngô, lại có độ lượng, bèn nuôi làm con. Nhân giao cho cầm quân…" }],
    status: V, rev: 1,
  },
  {
    id: "sl-loan-010", era: "loanSuQuan", difficulty: 3, kind: "choice",
    prompt: "Theo Toàn thư, Phạm Phòng Át (Phạm Bạch Hổ) đã làm gì?",
    options: ["Tử trận ở Đằng Châu", "Đem binh về hàng", "Rút ra biển", "Liên minh rồi phản lại"], answer: 1,
    explanation: "Toàn thư mục 967: “Phạm Phòng Át đem binh về hàng.” Về sau ông giữ chức Thân vệ tướng quân.",
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
    explanation: "Toàn thư mục 966: “Phạm Bạch Hổ, xưng là Phạm Phòng Át, giữ Đằng châu.”",
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
    options: ["Hưng Yên", "Thanh Hóa", "“Nay không rõ chỗ nào”", "Hoa Lư"], answer: 2,
    explanation: "Lời chua ghi “Bình Kiều, nay không rõ chỗ nào.” Sách đời sau định vị khác nhau (Hưng Yên, Thanh Hóa), nên đây vẫn là điểm còn bàn.",
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
    explanation: "Lời chua: “Ngô Nhật Khánh, người trong họ Ngô Quyền.”",
    people: ["Ngô Nhật Khánh", "Ngô Quyền"], claims: ["W04"], basis: "recorded", confidence: "high",
    sources: [{ id: "S01", locator: "Ngô sứ quân, lời chua Nhật Khánh", quote: "Ngô Nhật Khánh, người trong họ Ngô Quyền." }],
    status: V, rev: 1,
  },
  {
    id: "sl-loan-018", era: "loanSuQuan", difficulty: 2, kind: "choice",
    prompt: "Nguyễn Khoan xưng là gì và giữ nơi nào?",
    options: ["Nguyễn Thái Bình, giữ Tam Đái", "Nguyễn Hữu Công, giữ Tây Phù Liệt", "Nguyễn Lệnh Công, giữ Tiên Du", "Nguyễn Thái Bình, giữ Hồi Hồ"], answer: 0,
    explanation: "Toàn thư mục 966 chép Nguyễn Khoan xưng Nguyễn Thái Bình, giữ Tam Đái. “Thái Bình” ở đây không phải niên hiệu năm 970.",
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
    prompt: "“Nguyễn Thái Bình” trong danh sách sứ quân là niên hiệu Thái Bình năm 970.",
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

  // ── Mê cung III: Nhà Đinh (968–980) ──
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
  {
    id: "sl-dinh-007", era: "dinh", difficulty: 2, kind: "choice",
    prompt: "Năm 968, bầy tôi dâng Đinh Bộ Lĩnh tôn hiệu gì?",
    options: ["Đại Hành Hoàng Đế", "Đại Thắng Minh Hoàng Đế", "Nam Việt Vương", "Giao Chỉ Quận Vương"], answer: 1,
    explanation: "Toàn thư chép năm 968: “Bầy tôi dâng tôn hiệu là Đại Thắng Minh Hoàng Đế”. Đại Hành là hiệu của Lê Hoàn về sau.",
    people: ["Đinh Bộ Lĩnh"], claims: ["SL04"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S12", locator: "Kỷ nhà Đinh, mục Mậu Thìn 968", quote: "Bầy tôi dâng tôn hiệu là Đại Thắng Minh Hoàng Đế" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-008", era: "dinh", difficulty: 1, kind: "choice",
    prompt: "Đinh Tiên Hoàng đặt gì ở sân triều để răn kẻ trái phép?",
    options: ["Trống đồng lớn", "Vạc dầu và cũi nuôi hổ", "Bia đá khắc luật", "Chuông đồng"], answer: 1,
    explanation: "Toàn thư chép vua đặt vạc lớn ở sân triều, nuôi hổ trong cũi: “Kẻ nào trái phép phải chịu tội bỏ vạc dầu, cho hổ ăn”.",
    people: ["Đinh Bộ Lĩnh"], places: ["Hoa Lư"], claims: ["SL05"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S12", locator: "Kỷ nhà Đinh, mục Mậu Thìn 968", quote: "Kẻ nào trái phép phải chịu tội bỏ vạc dầu, cho hổ ăn" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-009", era: "dinh", difficulty: 2, kind: "choice",
    prompt: "Năm 969, Đinh Tiên Hoàng phong con trưởng Đinh Liễn làm gì?",
    options: ["Vệ Vương", "Nam Việt Vương", "Kình Thiên Đại Vương", "Đông Thành Vương"], answer: 1,
    explanation: "Toàn thư chép năm 969 vua “phong con trưởng là Liễn làm Nam Việt Vương”. Vệ Vương là tước của Đinh Toàn.",
    people: ["Đinh Liễn", "Đinh Bộ Lĩnh"], claims: ["SL06"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S12", locator: "Kỷ nhà Đinh, mục Kỷ Tỵ 969", quote: "phong con trưởng là Liễn làm Nam Việt Vương" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-010", era: "dinh", difficulty: 1, kind: "trueFalse",
    prompt: "Năm 970, Đinh Tiên Hoàng lập năm hoàng hậu.",
    options: TF, answer: 0,
    explanation: "Toàn thư chép năm 970: “Lập 5 hoàng hậu”. Sử gia Lê Văn Hưu chê việc này làm rối thứ bậc.",
    people: ["Đinh Bộ Lĩnh"], claims: ["SL07"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S12", locator: "Kỷ nhà Đinh, mục Canh Ngọ 970", quote: "Lập 5 hoàng hậu" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-011", era: "dinh", difficulty: 2, kind: "choice",
    prompt: "Năm 971, ai được phong Định quốc công?",
    options: ["Lưu Cơ", "Lê Hoàn", "Nguyễn Bặc", "Đinh Điền"], answer: 2,
    explanation: "Toàn thư chép năm 971: “Lấy Nguyễn Bặc làm Định quốc công”, Lưu Cơ làm Đô hộ phủ sĩ sư, Lê Hoàn làm Thập đạo tướng quân.",
    people: ["Nguyễn Bặc"], claims: ["SL08"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S12", locator: "Kỷ nhà Đinh, mục Tân Mùi 971", quote: "Lấy Nguyễn Bặc làm Định quốc công, Lưu cơ làm Đô hộ phủ sĩ sư" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-012", era: "dinh", difficulty: 1, kind: "choice",
    prompt: "Dưới triều Đinh, Lê Hoàn giữ chức gì?",
    options: ["Thập đạo tướng quân", "Định quốc công", "Đô hộ phủ sĩ sư", "Tăng lục"], answer: 0,
    explanation: "Năm 971 nhà Đinh định cấp bậc văn võ, Lê Hoàn làm Thập đạo tướng quân, tức tướng coi quân mười đạo.",
    people: ["Lê Hoàn"], claims: ["SL08"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S12", locator: "Kỷ nhà Đinh, mục Tân Mùi 971" }, { id: "S13", locator: "Đời Phế Đế, đoạn nối ngôi 979" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-013", era: "dinh", difficulty: 3, kind: "match",
    prompt: "Nối mỗi người với chức được giao năm 971.",
    options: ["Nguyễn Bặc", "Lưu Cơ", "Lê Hoàn", "Trương Ma Ni"],
    matchWith: ["Thập đạo tướng quân", "Tăng lục", "Định quốc công", "Đô hộ phủ sĩ sư"], answer: [2, 3, 0, 1],
    explanation: "Năm 971: Nguyễn Bặc làm Định quốc công, Lưu Cơ làm Đô hộ phủ sĩ sư, Lê Hoàn làm Thập đạo tướng quân, Trương Ma Ni làm Tăng lục.",
    people: ["Nguyễn Bặc", "Lưu Cơ", "Lê Hoàn"], claims: ["SL08", "SL09"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S12", locator: "Kỷ nhà Đinh, mục Tân Mùi 971", quote: "được ban hiệu là Khuông Việt đại sư, Trương Ma Ni làm Tăng lục" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-014", era: "dinh", difficulty: 3, kind: "choice",
    prompt: "Năm 971, nhà sư Ngô Chân Lưu được ban hiệu gì?",
    options: ["Vạn Hạnh thiền sư", "Sùng chân uy nghi", "Khuông Việt đại sư", "Tăng lục"], answer: 2,
    explanation: "Toàn thư chép Ngô Chân Lưu “được ban hiệu là Khuông Việt đại sư”. Tăng lục là chức của Trương Ma Ni, Sùng chân uy nghi trao cho đạo sĩ Đặng Huyền Quang.",
    claims: ["SL09"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S12", locator: "Kỷ nhà Đinh, mục Tân Mùi 971", quote: "được ban hiệu là Khuông Việt đại sư" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-015", era: "dinh", difficulty: 2, kind: "choice",
    prompt: "Năm 974, nhà Đinh định quân mười đạo. Mỗi đạo có bao nhiêu quân?",
    options: ["5 quân", "10 quân", "12 quân", "100 quân"], answer: 1,
    explanation: "Toàn thư chép năm 974 “quy định về quân mười đạo: mỗi đạo có 10 quân”, mỗi quân 10 lữ, mỗi lữ 10 tốt, mỗi tốt 10 ngũ, mỗi ngũ 10 người.",
    claims: ["SL11"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S12", locator: "Kỷ nhà Đinh, mục Giáp Tuất 974", quote: "quy định về quân mười đạo: mỗi đạo có 10 quân" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-016", era: "dinh", difficulty: 2, kind: "choice",
    prompt: "Năm 973, nhà Tống sai sứ phong Đinh Tiên Hoàng tước gì?",
    options: ["Nam Bình Vương", "Nam Việt Vương", "Giao Chỉ Quận Vương", "Đông Thành Vương"], answer: 2,
    explanation: "Năm 973 Đinh Liễn đi sứ về, nhà Tống sai sứ sang phong vua làm Giao Chỉ Quận Vương.",
    people: ["Đinh Bộ Lĩnh", "Đinh Liễn"], claims: ["SL10"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S12", locator: "Kỷ nhà Đinh, mục Quý Dậu 973" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-017", era: "dinh", difficulty: 2, kind: "choice",
    prompt: "Năm 978, Đinh Tiên Hoàng lập ai làm hoàng thái tử?",
    options: ["Đinh Liễn", "Đinh Toàn", "Hạng Lang", "Đinh Điền"], answer: 2,
    explanation: "Năm 978 vua lập con nhỏ là Hạng Lang làm hoàng thái tử và “phong con thứ là Toàn làm Vệ Vương”, dù con trưởng Đinh Liễn có công.",
    people: ["Đinh Bộ Lĩnh", "Đinh Liễn"], claims: ["SL12"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S12", locator: "Kỷ nhà Đinh, mục Mậu Dần 978", quote: "phong con thứ là Toàn làm Vệ Vương" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-018", era: "dinh", difficulty: 2, kind: "reading",
    prompt: "Đọc câu sử chép năm 979. Người bị giết là ai?",
    passage: "“Liễn vì vậy bất bình, sai người ngầm giết đi.” (Toàn thư, Kỷ nhà Đinh, năm 979).",
    options: ["Đỗ Thích", "Hạng Lang", "Đinh Toàn", "Nguyễn Bặc"], answer: 1,
    explanation: "Đinh Liễn bất bình vì em nhỏ Hạng Lang được lập làm thái tử, nên sai người giết Hạng Lang.",
    people: ["Đinh Liễn"], claims: ["SL12", "SL13"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S12", locator: "Kỷ nhà Đinh, mục Kỷ Mão 979", quote: "Liễn vì vậy bất bình, sai người ngầm giết đi." }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-019", era: "dinh", difficulty: 1, kind: "choice",
    prompt: "Mùa đông năm 979, ai giết Đinh Tiên Hoàng và Nam Việt Vương Liễn?",
    options: ["Phạm Hạp", "Ngô Nhật Khánh", "Đỗ Thích", "Hầu Nhân Bảo"], answer: 2,
    explanation: "Toàn thư chép Chi hậu nội nhân Đỗ Thích giết vua ở sân cung, “lại giết luôn cả Nam Việt Vương Liễn”.",
    people: ["Đinh Bộ Lĩnh", "Đinh Liễn"], claims: ["SL14"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S12", locator: "Kỷ nhà Đinh, mục Kỷ Mão 979", quote: "lại giết luôn cả Nam Việt Vương Liễn" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-020", era: "dinh", difficulty: 2, kind: "choice",
    prompt: "Ai sai người bắt Đỗ Thích đem chém?",
    options: ["Lê Hoàn", "Nguyễn Bặc", "Đinh Điền", "Lưu Cơ"], answer: 1,
    explanation: "Toàn thư chép: “Đinh quốc công Nguyễn Bặc sai người bắt đem chém”.",
    people: ["Nguyễn Bặc"], claims: ["SL14"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S12", locator: "Kỷ nhà Đinh, mục Kỷ Mão 979", quote: "Đinh quốc công Nguyễn Bặc sai người bắt đem chém" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-021", era: "dinh", difficulty: 1, kind: "choice",
    prompt: "Sau biến cố năm 979, ai được rước lên ngôi nhà Đinh?",
    options: ["Vệ Vương Đinh Toàn", "Nam Việt Vương Đinh Liễn", "Hạng Lang", "Nguyễn Bặc"], answer: 0,
    explanation: "Đinh Điền cùng Thập đạo tướng quân Lê Hoàn “rước Vệ Vương Toàn lên ngôi Hoàng đế”.",
    people: ["Lê Hoàn", "Đinh Điền"], claims: ["SL15"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S12", locator: "Kỷ nhà Đinh, mục Kỷ Mão 979", quote: "rước Vệ Vương Toàn lên ngôi Hoàng đế" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-022", era: "dinh", difficulty: 2, kind: "choice",
    prompt: "Đinh Toàn nối ngôi khi mấy tuổi?",
    options: ["3 tuổi", "6 tuổi", "12 tuổi", "16 tuổi"], answer: 1,
    explanation: "Toàn thư chép: “Vua nối ngôi khi mới 6 tuổi.” Vì vua còn nhỏ, Lê Hoàn nắm việc nước.",
    claims: ["SL16"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S13", locator: "Đời Phế Đế, đoạn đầu", quote: "Vua nối ngôi khi mới 6 tuổi." }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-023", era: "dinh", difficulty: 2, kind: "choice",
    prompt: "Khi nhiếp chính cho vua nhỏ Đinh Toàn, Lê Hoàn tự xưng là gì?",
    options: ["Định quốc công", "Phó Vương", "Nam Việt Vương", "Đô hộ phủ sĩ sư"], answer: 1,
    explanation: "Toàn thư chép Lê Hoàn nhiếp chính như Chu Công, “tự xưng là Phó Vương”.",
    people: ["Lê Hoàn"], claims: ["SL17"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S13", locator: "Đời Phế Đế, đoạn trước mục 980", quote: "tự xưng là Phó Vương" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-024", era: "dinh", difficulty: 3, kind: "choice",
    prompt: "Nguyễn Bặc, Đinh Điền cùng ai khởi binh vì ngờ Lê Hoàn làm hại vua nhỏ?",
    options: ["Phạm Cự Lạng", "Phạm Hạp", "Lưu Cơ", "Trịnh Tú"], answer: 1,
    explanation: "Toàn thư chép Nguyễn Bặc, Đinh Điền, Phạm Hạp “ngờ Hoàn sẽ làm điều bất lợi cho vua nhỏ” nên dấy binh. Phạm Cự Lạng về sau lại là người tôn Lê Hoàn lên ngôi.",
    people: ["Nguyễn Bặc", "Đinh Điền", "Lê Hoàn"], claims: ["SL18"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S13", locator: "Đời Phế Đế, đoạn trước mục 980", quote: "ngờ Hoàn sẽ làm điều bất lợi cho vua nhỏ" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-025", era: "dinh", difficulty: 1, kind: "trueFalse",
    prompt: "Nguyễn Bặc và Đinh Điền khởi binh, đánh bại được Lê Hoàn.",
    options: TF, answer: 1,
    explanation: "Lê Hoàn thắng: Đinh Điền bị chém tại trận, Nguyễn Bặc bị bắt rồi bị chém.",
    people: ["Nguyễn Bặc", "Đinh Điền", "Lê Hoàn"], claims: ["SL18"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S13", locator: "Đời Phế Đế, đoạn trước mục 980", quote: "chém Điền tại trận" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-026", era: "dinh", difficulty: 2, kind: "choice",
    prompt: "Ngô Nhật Khánh dẫn bao nhiêu thuyền quân Chiêm Thành định đánh Hoa Lư?",
    options: ["Khoảng một trăm chiếc", "Ba trăm chiếc", "Hơn nghìn chiếc", "Hơn vạn chiếc"], answer: 2,
    explanation: "Toàn thư chép Ngô Nhật Khánh “dẫn thuyền quân Chiêm Thành hơn nghìn chiếc vào cướp”, muốn đánh thành Hoa Lư.",
    people: ["Ngô Nhật Khánh"], places: ["Hoa Lư"], claims: ["SL19"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S13", locator: "Đời Phế Đế, mục Canh Thìn 980", quote: "dẫn thuyền quân Chiêm Thành hơn nghìn chiếc vào cướp" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-027", era: "dinh", difficulty: 2, kind: "reading",
    prompt: "Đọc câu sử chép. Đoàn thuyền bị đắm là của ai?",
    passage: "“…gặp gió bão nổi lên, thuyền đều lật đắm…” (Toàn thư, đời Đinh Phế Đế, năm 980).",
    options: ["Thủy quân Nam Hán của Lưu Hoằng Tháo", "Ngô Nhật Khánh và quân Chiêm Thành", "Quân Tống của Hầu Nhân Bảo", "Phạm Bạch Hổ"], answer: 1,
    explanation: "Đoàn thuyền Chiêm Thành do Ngô Nhật Khánh dẫn gặp bão, thuyền lật đắm; “chỉ có thuyền của vua Chiêm thoát trở về nước”.",
    people: ["Ngô Nhật Khánh"], claims: ["SL19"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S13", locator: "Đời Phế Đế, mục Canh Thìn 980", quote: "gặp gió bão nổi lên, thuyền đều lật đắm" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-028", era: "dinh", difficulty: 3, kind: "choice",
    prompt: "Theo Toàn thư, thuyền Chiêm Thành của Ngô Nhật Khánh vào theo hai cửa biển nào?",
    options: ["Bạch Đằng và Bố Hải", "Đại Ác và Tiểu Khang", "Thần Phù và Cơ La", "Nam Giới và Bạch Đằng"], answer: 1,
    explanation: "Toàn thư chép đoàn thuyền đi “theo hai cửa biển Đại Ác và Tiểu Khang”, đêm ấy gặp bão.",
    people: ["Ngô Nhật Khánh"], claims: ["SL19"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S13", locator: "Đời Phế Đế, mục Canh Thìn 980", quote: "theo hai cửa biển Đại Ác và Tiểu Khang" }],
    status: V, rev: 1,
  },
  {
    id: "sl-dinh-029", era: "dinh", difficulty: 3, kind: "order",
    prompt: "Xếp các việc thời Đinh Tiên Hoàng theo thời gian, từ sớm tới muộn.",
    options: ["Lập Hạng Lang làm thái tử", "Lập năm hoàng hậu", "Đỗ Thích giết vua", "Định quân mười đạo"], answer: [1, 3, 0, 2],
    explanation: "Lập năm hoàng hậu (970) → định quân mười đạo (974) → lập Hạng Lang làm thái tử (978) → Đỗ Thích giết vua (979).",
    claims: ["SL07", "SL11", "SL12", "SL14"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S12", locator: "Kỷ nhà Đinh, mục 970, 974, 978 và 979" }],
    status: V, rev: 1,
  },

  // ── Mê cung IV: Nhà Tiền Lê (980–1009) ──
  {
    id: "sl-tienle-001", era: "tienLe", difficulty: 1, kind: "choice",
    prompt: "Lê Hoàn là người ở đâu?",
    options: ["Hoa Lư", "Ái Châu", "Đường Lâm", "Phong Châu"], answer: 1,
    explanation: "Toàn thư mở đầu kỷ nhà Lê: vua họ Lê, tên húy là Hoàn, “người Ái Châu”.",
    hint: "Mê cung này vẽ trên đất quê ông.", people: ["Lê Hoàn"], places: ["Ái Châu"],
    claims: ["SL22"], basis: "recorded", confidence: "high",
    sources: [{ id: "S14", locator: "Kỷ nhà Lê, đoạn đầu", quote: "người Ái Châu" }, { id: "S17", locator: "Kỷ nhà Lê, tờ 13a" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-002", era: "tienLe", difficulty: 1, kind: "choice",
    prompt: "Năm 980, ai sai lấy áo long cổn khoác lên người Lê Hoàn, mời lên ngôi?",
    options: ["Vệ Vương Đinh Toàn", "Thái hậu nhà Đinh", "Nguyễn Bặc", "Ngô Nhật Khánh"], answer: 1,
    explanation: "Thấy quân sĩ đều theo, thái hậu “sai lấy áo long cổn khoác lên người” Lê Hoàn và mời lên ngôi hoàng đế.",
    people: ["Lê Hoàn"], claims: ["SL21"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S13", locator: "Đời Phế Đế, mục Canh Thìn 980", quote: "sai lấy áo long cổn khoác lên người" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-003", era: "tienLe", difficulty: 2, kind: "choice",
    prompt: "Đại tướng quân nào cùng tướng sĩ vào cung xin tôn Lê Hoàn làm Thiên tử?",
    options: ["Phạm Hạp", "Phạm Cự Lạng", "Đinh Điền", "Lưu Cơ"], answer: 1,
    explanation: "Phạm Cự Lạng cùng các tướng mặc giáp vào cung, nói vua nhỏ chưa coi được việc nước, xin “trước hãy tôn lập ông Thập đạo làm Thiên tử”.",
    people: ["Lê Hoàn"], claims: ["SL21"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S13", locator: "Đời Phế Đế, mục Canh Thìn 980", quote: "trước hãy tôn lập ông Thập đạo làm Thiên tử" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-004", era: "tienLe", difficulty: 1, kind: "choice",
    prompt: "Lê Hoàn lên ngôi năm 980, đổi niên hiệu là gì?",
    options: ["Thái Bình", "Thiên Phúc", "Thuận Thiên", "Cảnh Thụy"], answer: 1,
    explanation: "Lê Hoàn lên ngôi, đổi niên hiệu là Thiên Phúc. Thái Bình là niên hiệu nhà Đinh, Cảnh Thụy là niên hiệu của Lê Long Đĩnh.",
    people: ["Lê Hoàn"], claims: ["SL21"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S13", locator: "Đời Phế Đế, mục Canh Thìn 980" }, { id: "S14", locator: "Kỷ nhà Lê, mục Tân Tỵ 981" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-005", era: "tienLe", difficulty: 1, kind: "trueFalse",
    prompt: "Lê Hoàn lên ngôi thì giáng vua nhỏ Đinh Toàn làm Vệ Vương.",
    options: TF, answer: 0,
    explanation: "Năm 980 Lê Hoàn lên ngôi, đổi niên hiệu Thiên Phúc và giáng vua nhỏ làm Vệ Vương.",
    people: ["Lê Hoàn"], claims: ["SL21"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S13", locator: "Đời Phế Đế, mục Canh Thìn 980" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-006", era: "tienLe", difficulty: 2, kind: "choice",
    prompt: "Năm 980, viên quan Tống nào dâng thư xin đánh nước ta khi nhà Đinh rối ren?",
    options: ["Lưu Hoằng Tháo", "Hầu Nhân Bảo", "Tôn Toàn Hưng", "Trần Khâm Tộ"], answer: 1,
    explanation: "Toàn thư chép: “Thái thường bác sĩ Hầu Nhân Bảo dâng thư tâu với vua Tống”. Sau đó Tống cử Hầu Nhân Bảo, Tôn Toàn Hưng… chia đường sang.",
    claims: ["SL20"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S13", locator: "Đời Phế Đế, mục Canh Thìn 980, tháng 6", quote: "Thái thường bác sĩ Hầu Nhân Bảo dâng thư tâu với vua Tống" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-007", era: "tienLe", difficulty: 2, kind: "choice",
    prompt: "Năm 981, Lê Hoàn sai quân đóng cọc ngăn sông nào để chặn quân Tống?",
    options: ["Bạch Đằng", "Chi Lăng", "Như Nguyệt", "Hát Giang"], answer: 1,
    explanation: "Toàn thư chép năm 981 vua “sai quân sĩ đóng cọc ngăn sông Chi Lăng”.",
    people: ["Lê Hoàn"], places: ["Chi Lăng"], claims: ["SL23"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S14", locator: "Kỷ nhà Lê, mục Tân Tỵ 981", quote: "sai quân sĩ đóng cọc ngăn sông Chi Lăng" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-008", era: "tienLe", difficulty: 2, kind: "choice",
    prompt: "Năm 981, Lê Hoàn dùng kế gì để giết tướng Tống Hầu Nhân Bảo?",
    options: ["Sai quân trá hàng để dụ rồi chém", "Thả bè lửa đốt thuyền", "Đánh úp doanh trại lúc nửa đêm", "Vây thành cho tới khi hết lương"], answer: 0,
    explanation: "Toàn thư chép: “Vua sai quân sĩ trá hàng để dụ Nhân Bảo, đem chém”. Quân Tống thua lớn.",
    people: ["Lê Hoàn"], claims: ["SL23"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S14", locator: "Kỷ nhà Lê, mục Tân Tỵ 981", quote: "Vua sai quân sĩ trá hàng để dụ Nhân Bảo, đem chém" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-009", era: "tienLe", difficulty: 1, kind: "trueFalse",
    prompt: "Năm 981, tướng Tống Hầu Nhân Bảo bị quân Lê Hoàn giết.",
    options: TF, answer: 0,
    explanation: "Lê Hoàn sai quân trá hàng dụ Hầu Nhân Bảo rồi chém, quân Tống thua lớn.",
    people: ["Lê Hoàn"], claims: ["SL23"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S14", locator: "Kỷ nhà Lê, mục Tân Tỵ 981" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-010", era: "tienLe", difficulty: 2, kind: "choice",
    prompt: "Trước khi Lê Hoàn đánh Chiêm Thành năm 982, sứ giả nào của ta bị người Chiêm bắt giữ?",
    options: ["Phạm Cự Lạng và Lưu Cơ", "Từ Mục và Ngô Tử Canh", "Đào Cam Mộc và Lý Công Uẩn", "Nguyễn Bặc và Đinh Điền"], answer: 1,
    explanation: "Toàn thư chép vua sai Từ Mục, Ngô Tử Canh “sang sứ Chiêm Thành, bị người Chiêm bắt giữ”, nên năm 982 vua thân đi đánh.",
    claims: ["SL24"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S14", locator: "Kỷ nhà Lê, mục Nhâm Ngọ 982", quote: "sang sứ Chiêm Thành, bị người Chiêm bắt giữ" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-011", era: "tienLe", difficulty: 3, kind: "choice",
    prompt: "Trong trận đánh Chiêm Thành năm 982, ai bị chém tại trận?",
    options: ["Ngô Nhật Khánh", "Bê Mi Thuế", "Hầu Nhân Bảo", "Tôn Toàn Hưng"], answer: 1,
    explanation: "Năm 982 quân Lê Hoàn chém Bê Mi Thuế tại trận, rồi “san phẳng thành trì, phá hủy tông miếu” Chiêm Thành. Ngô Nhật Khánh đã chết đuối năm 980.",
    people: ["Lê Hoàn"], claims: ["SL24", "SL19"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S14", locator: "Kỷ nhà Lê, mục Nhâm Ngọ 982", quote: "san phẳng thành trì, phá hủy tông miếu" }, { id: "S13", locator: "Đời Phế Đế, mục Canh Thìn 980" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-012", era: "tienLe", difficulty: 2, kind: "choice",
    prompt: "Năm 987, Lê Hoàn lần đầu cày ruộng tịch điền ở đâu?",
    options: ["Núi Đọi", "Hoa Lư", "Chi Lăng", "Cổ Loa"], answer: 0,
    explanation: "Toàn thư chép năm 987 “vua lần đầu cày ruộng tịch điền ở núi Đọi”.",
    people: ["Lê Hoàn"], claims: ["SL26"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S14", locator: "Kỷ nhà Lê, mục Đinh Hợi 987", quote: "vua lần đầu cày ruộng tịch điền ở núi Đọi" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-013", era: "tienLe", difficulty: 2, kind: "year",
    prompt: "Lê Hoàn đổi niên hiệu Hưng Thống năm nào?",
    options: ["980", "989", "994", "1005"], answer: 1,
    explanation: "Toàn thư ghi năm Kỷ Sửu 989 là Hưng Thống năm thứ 1. Thiên Phúc bắt đầu năm 980, Ứng Thiên năm 994.",
    people: ["Lê Hoàn"], claims: ["SL27"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S14", locator: "Kỷ nhà Lê, mục Kỷ Sửu 989" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-014", era: "tienLe", difficulty: 3, kind: "order",
    prompt: "Xếp các niên hiệu theo thời gian, từ sớm tới muộn.",
    options: ["Hưng Thống", "Thái Bình", "Ứng Thiên", "Thiên Phúc"], answer: [1, 3, 0, 2],
    explanation: "Thái Bình (nhà Đinh, 970) → Thiên Phúc (980) → Hưng Thống (989) → Ứng Thiên (994).",
    claims: ["E11", "SL21", "SL27"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S04", locator: "Đinh Tiên Hoàng, đoạn Canh Ngọ" }, { id: "S14", locator: "Kỷ nhà Lê, mục 981, 989 và 994" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-015", era: "tienLe", difficulty: 2, kind: "choice",
    prompt: "Năm 989, thái tử Thau con Lê Hoàn được phong gì?",
    options: ["Nam Việt Vương", "Kình Thiên Đại Vương", "Vệ Vương", "Đông Thành Vương"], answer: 1,
    explanation: "Toàn thư chép năm 989: “Phong thái tử Thau làm Kình Thiên Đại Vương”. Đông Thành Vương là tước của Ngân Tích.",
    people: ["Lê Hoàn"], claims: ["SL27"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S14", locator: "Kỷ nhà Lê, mục Kỷ Sửu 989", quote: "Phong thái tử Thau làm Kình Thiên Đại Vương" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-016", era: "tienLe", difficulty: 3, kind: "match",
    prompt: "Nối mỗi người con của Lê Hoàn với tước được phong năm 989.",
    options: ["Thau", "Ngân Tích", "Việt"],
    matchWith: ["Nam Phong Vương", "Kình Thiên Đại Vương", "Đông Thành Vương"], answer: [1, 2, 0],
    explanation: "Năm 989: thái tử Thau làm Kình Thiên Đại Vương, Ngân Tích làm Đông Thành Vương, Việt làm Nam Phong Vương.",
    people: ["Lê Hoàn"], claims: ["SL27"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S14", locator: "Kỷ nhà Lê, mục Kỷ Sửu 989" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-017", era: "tienLe", difficulty: 2, kind: "choice",
    prompt: "Lê Long Việt (Lê Trung Tông) lên ngôi được bao lâu thì bị giết?",
    options: ["3 ngày", "8 tháng", "1 năm", "3 năm"], answer: 0,
    explanation: "Toàn thư chép Trung Tông “Lên ngôi được 3 ngày thì bị em cùng mẹ là Long Đĩnh giết”. Ở ngôi 8 tháng là Đinh Toàn.",
    claims: ["SL28"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S15", locator: "Đời Trung Tông, đoạn đầu", quote: "Lên ngôi được 3 ngày thì bị em cùng mẹ là Long Đĩnh giết" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-018", era: "tienLe", difficulty: 1, kind: "choice",
    prompt: "Ai giết vua Lê Trung Tông để cướp ngôi?",
    options: ["Lý Công Uẩn", "Lê Long Đĩnh", "Đào Cam Mộc", "Đông Thành Vương"], answer: 1,
    explanation: "Lê Long Việt lên ngôi được 3 ngày thì bị em cùng mẹ là Lê Long Đĩnh giết.",
    claims: ["SL28"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S15", locator: "Đời Trung Tông, đoạn đầu" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-019", era: "tienLe", difficulty: 2, kind: "reading",
    prompt: "Đọc câu sử chép. Vị vua nào được nói tới?",
    passage: "“…vì vua mắc bệnh trĩ phải nằm mà coi chầu…” (Toàn thư, kỷ nhà Lê).",
    options: ["Lê Hoàn", "Lê Long Việt", "Lê Long Đĩnh", "Đinh Toàn"], answer: 2,
    explanation: "Lê Long Đĩnh mắc bệnh phải nằm coi chầu nên đời sau gọi là Lê Ngọa Triều (vua nằm).",
    claims: ["SL29"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S16", locator: "Đời Ngọa Triều, đoạn đầu", quote: "vì vua mắc bệnh trĩ phải nằm mà coi chầu" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-020", era: "tienLe", difficulty: 2, kind: "choice",
    prompt: "Năm 1008, Lê Long Đĩnh dùng niên hiệu gì?",
    options: ["Ứng Thiên", "Cảnh Thụy", "Hưng Thống", "Thiên Phúc"], answer: 1,
    explanation: "Toàn thư ghi năm Mậu Thân 1008 là “niên hiệu Cảnh Thụy năm thứ 1”.",
    claims: ["SL30"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S16", locator: "Đời Ngọa Triều, mục Mậu Thân 1008", quote: "niên hiệu Cảnh Thụy năm thứ 1" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-021", era: "tienLe", difficulty: 1, kind: "choice",
    prompt: "Năm 1009, sau khi Lê Long Đĩnh mất, ai lên ngôi?",
    options: ["Lê Long Việt", "Lý Công Uẩn", "Đào Cam Mộc", "Đinh Toàn"], answer: 1,
    explanation: "Tháng 10 năm 1009 Lê Long Đĩnh mất, Lý Công Uẩn lên ngôi, nhà Tiền Lê kết thúc.",
    claims: ["SL31"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S16", locator: "Đời Ngọa Triều, mục Kỷ Dậu 1009" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-022", era: "tienLe", difficulty: 3, kind: "choice",
    prompt: "Năm 1009, viên Chi hậu nào dò biết ý Lý Công Uẩn và khuyên nhận ngôi?",
    options: ["Đỗ Thích", "Đào Cam Mộc", "Phạm Cự Lạng", "Từ Mục"], answer: 1,
    explanation: "Toàn thư chép: “Khi ấy Chi hậu là Đào Cam Mộc dò biết Công Uẩn có muốn nhận việc truyền ngôi”. Đỗ Thích cũng là Chi hậu nhưng ở năm 979.",
    claims: ["SL31"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S16", locator: "Đời Ngọa Triều, mục Kỷ Dậu 1009", quote: "Khi ấy Chi hậu là Đào Cam Mộc dò biết Công Uẩn có muốn nhận việc truyền ngôi" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-023", era: "tienLe", difficulty: 3, kind: "choice",
    prompt: "Năm 982, Lê Hoàn lập Hoàng thái hậu nhà Đinh là Dương thị làm gì?",
    options: ["Trinh Minh hoàng hậu", "Đại Thắng Minh Hoàng Hậu", "Đan Gia hoàng hậu", "Vệ Vương phi"], answer: 1,
    explanation: "Toàn thư chép năm 982: “Lập Hoàng thái hậu nhà Đinh là Dương thị làm Đại Thắng Minh Hoàng Hậu”. Đan Gia, Trinh Minh là tên hai trong năm hoàng hậu của Đinh Tiên Hoàng.",
    claims: ["SL25", "SL07"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S14", locator: "Kỷ nhà Lê, mục Nhâm Ngọ 982", quote: "Lập Hoàng thái hậu nhà Đinh là Dương thị làm Đại Thắng Minh Hoàng Hậu" }, { id: "S12", locator: "Kỷ nhà Đinh, mục Canh Ngọ 970" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-024", era: "tienLe", difficulty: 3, kind: "order",
    prompt: "Xếp các sự kiện theo thời gian, từ sớm tới muộn.",
    options: ["Lê Hoàn đánh Chiêm Thành", "Đỗ Thích giết Đinh Tiên Hoàng", "Lê Hoàn chém Hầu Nhân Bảo", "Lê Hoàn lên ngôi"], answer: [1, 3, 2, 0],
    explanation: "Đỗ Thích giết vua (979) → Lê Hoàn lên ngôi (980) → chém Hầu Nhân Bảo, phá quân Tống (981) → đánh Chiêm Thành (982).",
    people: ["Lê Hoàn"], claims: ["SL14", "SL21", "SL23", "SL24"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S12", locator: "Kỷ nhà Đinh, mục Kỷ Mão 979" }, { id: "S13", locator: "Đời Phế Đế, mục Canh Thìn 980" }, { id: "S14", locator: "Kỷ nhà Lê, mục 981 và 982" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-025", era: "tienLe", difficulty: 1, kind: "trueFalse",
    prompt: "Lê Long Đĩnh là người lập ra nhà Lý.",
    options: TF, answer: 1,
    explanation: "Lê Long Đĩnh là vua cuối nhà Tiền Lê. Sau khi ông mất năm 1009, Lý Công Uẩn lên ngôi.",
    claims: ["SL31"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S16", locator: "Đời Ngọa Triều, mục Kỷ Dậu 1009" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-026", era: "tienLe", difficulty: 2, kind: "reading",
    prompt: "Đọc câu sử chép năm 981. Ai ra lệnh này?",
    passage: "“…sai quân sĩ đóng cọc ngăn sông Chi Lăng…” (Toàn thư, kỷ nhà Lê, năm 981).",
    options: ["Ngô Quyền", "Đinh Bộ Lĩnh", "Lê Hoàn", "Lê Long Đĩnh"], answer: 2,
    explanation: "Năm 981 quân Tống tiến sang, Lê Hoàn sai đóng cọc ngăn sông Chi Lăng, rồi dụ Hầu Nhân Bảo trá hàng mà chém.",
    people: ["Lê Hoàn"], places: ["Chi Lăng"], claims: ["SL23"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S14", locator: "Kỷ nhà Lê, mục Tân Tỵ 981", quote: "sai quân sĩ đóng cọc ngăn sông Chi Lăng" }],
    status: V, rev: 1,
  },
  {
    id: "sl-tienle-027", era: "tienLe", difficulty: 2, kind: "year",
    prompt: "Lê Hoàn (Lê Đại Hành) mất năm nào?",
    options: ["1000", "1005", "1009", "1010"], answer: 1,
    explanation: "Lê Hoàn mất năm Ất Tỵ 1005 ở điện Trường Xuân. Cùng năm, Lê Long Việt nối ngôi được 3 ngày thì bị Lê Long Đĩnh giết. Năm 1009 là năm Long Đĩnh mất.",
    people: ["Lê Hoàn"], claims: ["SL32", "SL28"], basis: "recorded", confidence: "medium",
    sources: [{ id: "S15", locator: "Đời Trung Tông, đoạn đầu" }, { id: "S16", locator: "Đời Ngọa Triều, thân bài năm 1005" }],
    status: V, rev: 1,
  },
];

/** Claim có trong sổ nguồn (Campaign ledger mục 3–4, warlord matrix và sổ nguồn Sử Lộ). */
export const SL_KNOWN_CLAIMS: ReadonlySet<string> = new Set([
  ...Array.from({ length: 14 }, (_, i) => `E${String(i).padStart(2, "0")}`),
  "E04a",
  ...Array.from({ length: 12 }, (_, i) => `W${String(i + 1).padStart(2, "0")}`),
  ...Array.from({ length: 8 }, (_, i) => `U0${i + 1}`),
  ...Array.from({ length: 32 }, (_, i) => `SL${String(i + 1).padStart(2, "0")}`),
]);

/** Nguồn có trong sổ: S01–S11 của Campaign, S12–S17 của sổ Sử Lộ. Nguồn mới thêm vào sổ trước rồi thêm vào đây. */
export const SL_KNOWN_SOURCES: ReadonlySet<string> = new Set(Array.from({ length: 17 }, (_, i) => `S${String(i + 1).padStart(2, "0")}`));

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
