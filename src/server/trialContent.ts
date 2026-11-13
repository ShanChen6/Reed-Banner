// Nội dung phát hành Tháp Thí Luyện: 50 tầng cố định (1-20 là bản V1, 21-50 thêm 11/11/2026). Chỉ chứa dữ liệu trận;
// cân bằng chạy `pnpm exec tsx scripts/trial-content-report.ts`, kiểm tra bằng `pnpm exec tsx scripts/trial-puzzle-qa.ts`;
// luật và bảng thưởng ở docs/02-game-modes/dual-tower/00-02-rules.md §12.
import { trialFloorId, type FloorRules, type TrialFloorSpec } from "@/core";

const STANDARD = { kiem: 18, amDuong: 16, banhChung: 15, tim: 15, vang: 11, sach: 11, trong: 14 } as const;
const OFFENSE = { kiem: 24, amDuong: 15, banhChung: 12, tim: 14, vang: 10, sach: 10, trong: 15 } as const;
const LOW_HEAL = { kiem: 22, amDuong: 16, banhChung: 15, tim: 8, vang: 12, sach: 12, trong: 15 } as const;
const TACTICAL = { kiem: 18, amDuong: 18, banhChung: 12, tim: 12, vang: 12, sach: 12, trong: 16 } as const;

interface FloorInput {
  readonly title: string; readonly intro: string; readonly rules: FloorRules;
  readonly foes: readonly [string, string, string]; readonly level: number; readonly power: number;
  readonly difficulty: TrialFloorSpec["difficulty"]; readonly turnLimit: number; readonly stones: number;
  readonly weights?: TrialFloorSpec["board"]["weights"];
  readonly contentVersion?: number;
}

const floor = (index: number, input: FloorInput): TrialFloorSpec => ({
  schema: 1, id: trialFloorId(index), floor: index, contentVersion: input.contentVersion ?? 1,
  narrative: { title: input.title, intro: input.intro }, difficulty: input.difficulty, rules: input.rules,
  enemy: { foeIds: input.foes, level: input.level, power: input.power },
  board: { publicSeed: 0x5a17_0000 + index * 7919, weights: input.weights ?? STANDARD },
  serverSalt: 0x2d41_0000 + index * 104729, turnLimit: input.turnLimit,
  win: { kind: "defeatAll" }, firstClearStones: input.stones,
  unlock: { requiresFloor: index === 1 ? null : index - 1 },
});

export const TRIAL_FLOOR_DATA: readonly TrialFloorSpec[] = [
  floor(1, { title: "Tránh Lửa", intro: "Đội tiên phong Hỏa bị chặn; hãy thử hai đồng đội khác.", rules: { bannedElements: ["hoa"] }, foes: ["leThach", "maiThanh", "toKim"], level: 1, power: 0.42, difficulty: "easy", turnLimit: 36, stones: 2 }),
  floor(2, { title: "Im Tiếng Pháp Sư", intro: "Pháp sư không được ra trận trong thử thách này.", rules: { bannedProfessions: ["phapSu"] }, foes: ["haVan", "leThach", "phungPhong"], level: 1, power: 0.46, difficulty: "easy", turnLimit: 35, stones: 2 }),
  floor(3, { title: "Cửa Không Kim", intro: "Khí Kim bị phong tỏa; đổi hệ thủ lĩnh nếu cần.", rules: { bannedElements: ["kim"] }, foes: ["toKim", "maiThanh", "phungPhong"], level: 2, power: 0.48, difficulty: "easy", turnLimit: 34, stones: 2 }),
  floor(4, { title: "Không Y Sư", intro: "Không thể dựa vào Y sư; ưu tiên kết thúc trận sớm.", rules: { bannedProfessions: ["ySu"] }, foes: ["haVan", "leThach", "toKim"], level: 2, power: 0.52, difficulty: "easy", turnLimit: 33, stones: 2 }),
  floor(5, { title: "Lặng Gió", intro: "Hệ Phong bị cấm trước cửa ải đầu tiên.", rules: { bannedElements: ["phong"] }, foes: ["phungPhong", "maiThanh", "leThach"], level: 3, power: 0.54, difficulty: "normal", turnLimit: 32, stones: 3 }),
  floor(6, { title: "Lá Chắn Tiền Quân", intro: "Đội hình phải có ít nhất một Binh lính.", rules: { minProfessions: { binhLinh: 1 } }, foes: ["leThach", "haVan", "toKim"], level: 3, power: 0.56, difficulty: "normal", turnLimit: 32, stones: 3 }),
  floor(7, { title: "Mạch Nước", intro: "Mang ít nhất một tướng hệ Thủy để vượt ải.", rules: { minElements: { thuy: 1 } }, foes: ["maiThanh", "haVan", "phungPhong"], level: 4, power: 0.58, difficulty: "normal", turnLimit: 31, stones: 3 }),
  floor(8, { title: "Ba Vai Trò", intro: "Ba tướng ra trận phải làm ba nghề khác nhau.", rules: { maxSameProfession: 1 }, foes: ["toKim", "leThach", "maiThanh"], level: 4, power: 0.60, difficulty: "normal", turnLimit: 31, stones: 3 }),
  floor(9, { title: "Tam Hành", intro: "Ba tướng ra trận phải mang ba hệ khác nhau.", rules: { maxSameElement: 1 }, foes: ["haVan", "toKim", "phungPhong"], level: 5, power: 0.62, difficulty: "normal", turnLimit: 30, stones: 3 }),
  floor(10, { title: "Công Thủ Tương Trợ", intro: "Đội phải có cả Binh lính và Y sư.", rules: { minProfessions: { binhLinh: 1, ySu: 1 } }, foes: ["leThach", "maiThanh", "haVan"], level: 5, power: 0.64, difficulty: "hard", turnLimit: 30, stones: 4 }),
  floor(11, { title: "Nhịp Trống Gấp", intro: "Bàn cờ nhiều kiếm hơn, nhưng chỉ có 28 lượt.", rules: {}, foes: ["haVan", "toKim", "leThach"], level: 6, power: 0.64, difficulty: "normal", turnLimit: 28, stones: 4, weights: OFFENSE }),
  floor(12, { title: "Đường Dài Ít Tim", intro: "Ô tim hiếm; giữ máu trong giới hạn 28 lượt.", rules: {}, foes: ["maiThanh", "phungPhong", "toKim"], level: 6, power: 0.64, difficulty: "normal", turnLimit: 28, stones: 4, weights: LOW_HEAL }),
  floor(13, { title: "Thế Cờ Cân Não", intro: "Năng lượng và trống xuất hiện nhiều hơn trên bàn cố định.", rules: {}, foes: ["phungPhong", "haVan", "maiThanh"], level: 7, power: 0.66, difficulty: "hard", turnLimit: 27, stones: 4, weights: TACTICAL }),
  floor(14, { title: "Đánh Nhanh", intro: "Tận dụng bàn nhiều kiếm để hạ đội hình cứng trong 26 lượt.", rules: {}, foes: ["leThach", "toKim", "phungPhong"], level: 7, power: 0.68, difficulty: "hard", turnLimit: 26, stones: 4, weights: OFFENSE }),
  floor(15, { title: "Cạn Nguồn", intro: "Ít hồi phục và giới hạn 26 lượt thử khả năng điều phối.", rules: {}, foes: ["maiThanh", "leThach", "haVan"], level: 8, power: 0.68, difficulty: "hard", turnLimit: 26, stones: 5, weights: LOW_HEAL }),
  floor(16, { title: "Thủy Khắc Hỏa", intro: "Cấm Hỏa và bắt buộc ít nhất một tướng Thủy.", rules: { bannedElements: ["hoa"], minElements: { thuy: 1 } }, foes: ["haVan", "toKim", "leThach"], level: 8, power: 0.62, difficulty: "boss", turnLimit: 28, stones: 5, weights: STANDARD, contentVersion: 2 }),
  floor(17, { title: "Không Trùng Hành", intro: "Không dùng Y sư và ba tướng ra trận phải khác hệ.", rules: { bannedProfessions: ["ySu"], maxSameElement: 1 }, foes: ["maiThanh", "phungPhong", "toKim"], level: 9, power: 0.72, difficulty: "boss", turnLimit: 28, stones: 5, weights: TACTICAL }),
  floor(18, { title: "Quân Trận Phân Minh", intro: "Cần một Binh lính và ba tướng khác nghề.", rules: { minProfessions: { binhLinh: 1 }, maxSameProfession: 1 }, foes: ["leThach", "haVan", "phungPhong"], level: 9, power: 0.74, difficulty: "boss", turnLimit: 27, stones: 5, weights: OFFENSE }),
  floor(19, { title: "Neo Đất", intro: "Cấm Phong và bắt buộc ít nhất một tướng hệ Thổ.", rules: { bannedElements: ["phong"], minElements: { tho: 1 } }, foes: ["phungPhong", "toKim", "maiThanh"], level: 10, power: 0.70, difficulty: "boss", turnLimit: 27, stones: 6, weights: LOW_HEAL, contentVersion: 2 }),
  floor(20, { title: "Cửa Ải Song Tháp", intro: "Không dùng Pháp sư; ba tướng ra trận phải khác hệ để qua cửa ải giữa tháp.", rules: { bannedProfessions: ["phapSu"], maxSameElement: 1 }, foes: ["haVan", "leThach", "phungPhong"], level: 10, power: 0.60, difficulty: "nightmare", turnLimit: 28, stones: 8, weights: TACTICAL, contentVersion: 2 }),
  // Chặng III (21-30): luật đơn chưa dùng ở 20 tầng đầu, đưa Xạ thủ và Sát thủ vào; đối thủ lấy từ tướng cửa hàng.
  floor(21, { title: "Rừng Khép", intro: "Hệ Mộc bị cấm; đối thủ lại toàn tướng rừng xanh.", rules: { bannedElements: ["moc"] }, foes: ["hoangMoc", "lucDiep", "lamTung"], level: 11, power: 0.60, difficulty: "normal", turnLimit: 30, stones: 6 }),
  floor(22, { title: "Buông Cung", intro: "Xạ thủ không được ra trận; hãy áp sát mà đánh.", rules: { bannedProfessions: ["xaThu"] }, foes: ["bachNoLang", "thaiHa", "tieuMinh"], level: 12, power: 0.62, difficulty: "normal", turnLimit: 30, stones: 6 }),
  floor(23, { title: "Tầm Xa", intro: "Đội phải có ít nhất một Xạ thủ; thủ lĩnh có thể tự cầm cung.", rules: { minProfessions: { xaThu: 1 } }, foes: ["caoKien", "hongDan", "quachAn"], level: 12, power: 0.90, difficulty: "normal", turnLimit: 30, stones: 6 }),
  floor(24, { title: "Không Bóng Tối", intro: "Sát thủ bị cấm; đối thủ thì vẫn giấu dao trong tay áo.", rules: { bannedProfessions: ["satThu"] }, foes: ["bachPhongDao", "khaSon", "bachSuong"], level: 13, power: 0.85, difficulty: "normal", turnLimit: 30, stones: 6 }),
  floor(25, { title: "Lưỡi Dao Thầm", intro: "Đội phải có ít nhất một Sát thủ để phá hàng sau của địch.", rules: { minProfessions: { satThu: 1 } }, foes: ["truongViem", "lieuYen", "beLien"], level: 14, power: 0.90, difficulty: "hard", turnLimit: 29, stones: 7 }),
  floor(26, { title: "Cạn Dòng", intro: "Hệ Thủy bị cấm, nghĩa là Mai Thanh phải ở lại hậu doanh.", rules: { bannedElements: ["thuy"] }, foes: ["lyLiet", "ninhHoa", "tonDiem"], level: 14, power: 0.85, difficulty: "hard", turnLimit: 29, stones: 7 }),
  floor(27, { title: "Gọi Sấm", intro: "Đội phải có ít nhất một tướng hệ Lôi.", rules: { minElements: { loi: 1 } }, foes: ["taThach", "maNhac", "doanNham"], level: 15, power: 1.10, difficulty: "hard", turnLimit: 29, stones: 7 }),
  floor(28, { title: "Không Khiên", intro: "Binh lính bị cấm; không còn ai đứng chắn phía trước.", rules: { bannedProfessions: ["binhLinh"] }, foes: ["vuLoi", "xichDiemLuan", "tongTan"], level: 16, power: 0.45, difficulty: "hard", turnLimit: 28, stones: 7 }),
  floor(29, { title: "Mưu Trước Trận", intro: "Đội phải có ít nhất một Mưu sĩ bày kế.", rules: { minProfessions: { muuSi: 1 } }, foes: ["nghiemThiet", "samTue", "hanGiangKhach"], level: 16, power: 0.85, difficulty: "hard", turnLimit: 28, stones: 7 }),
  floor(30, { title: "Ải Lôi Đình", intro: "Hệ Lôi bị cấm trước ba tướng sấm sét giữ ải.", rules: { bannedElements: ["loi"] }, foes: ["ongChan", "macVan", "loiMinhXa"], level: 17, power: 1.05, difficulty: "boss", turnLimit: 30, stones: 10 }),
  // Chặng IV (31-40): hai luật ghép, kèm bàn cờ đặc biệt.
  floor(31, { title: "Kim Mộc Đều Im", intro: "Cấm cả hệ Kim lẫn hệ Mộc.", rules: { bannedElements: ["kim", "moc"] }, foes: ["chuNgan", "damThao", "nhanTruc"], level: 18, power: 1.20, difficulty: "hard", turnLimit: 29, stones: 8 }),
  floor(32, { title: "Lửa Không Thuốc", intro: "Cần một tướng hệ Hỏa, cấm Y sư; bàn cờ nhiều kiếm.", rules: { minElements: { hoa: 1 }, bannedProfessions: ["ySu"] }, foes: ["hoLang", "viTrieu", "lamGiangPhiDiep"], level: 18, power: 1.05, difficulty: "hard", turnLimit: 28, stones: 8, weights: OFFENSE }),
  floor(33, { title: "Văn Võ Đều Vắng", intro: "Cấm Tướng sĩ và Pháp sư; phải thắng bằng mưu và nhịp trống.", rules: { bannedProfessions: ["tuongSi", "phapSu"] }, foes: ["tuKinh", "manhTuong", "chauNgoc"], level: 19, power: 0.85, difficulty: "hard", turnLimit: 28, stones: 8, weights: TACTICAL }),
  floor(34, { title: "Gió Chia Ba Ngả", intro: "Cần một tướng hệ Phong và ba tướng ra trận phải khác nghề.", rules: { minElements: { phong: 1 }, maxSameProfession: 1 }, foes: ["tranSonThach", "diaAn", "khaSon"], level: 20, power: 1.20, difficulty: "hard", turnLimit: 28, stones: 8 }),
  floor(35, { title: "Ải Khô Hạn", intro: "Cấm hệ Thủy, bắt buộc có Binh lính; ô tim rất hiếm.", rules: { bannedElements: ["thuy"], minProfessions: { binhLinh: 1 } }, foes: ["lyLiet", "xichDa", "hongDan"], level: 20, power: 0.72, difficulty: "boss", turnLimit: 29, stones: 9, weights: LOW_HEAL }),
  floor(36, { title: "Tên Không Lửa", intro: "Cần một Xạ thủ, cấm hệ Hỏa; bàn cờ nhiều kiếm.", rules: { minProfessions: { xaThu: 1 }, bannedElements: ["hoa"] }, foes: ["thanhLamXa", "docAnh", "hoangMoc"], level: 21, power: 0.85, difficulty: "hard", turnLimit: 27, stones: 9, weights: OFFENSE }),
  floor(37, { title: "Rời Đất", intro: "Cấm hệ Thổ và ba tướng ra trận phải khác hệ.", rules: { bannedElements: ["tho"], maxSameElement: 1 }, foes: ["huaLang", "tatPhongLang", "buiPhieu"], level: 22, power: 0.85, difficulty: "hard", turnLimit: 27, stones: 9, weights: TACTICAL }),
  floor(38, { title: "Thuốc Và Kế", intro: "Cần cả Y sư lẫn Mưu sĩ; ô tim rất hiếm.", rules: { minProfessions: { ySu: 1, muuSi: 1 } }, foes: ["tranCuong", "bachNoLang", "nghiemThiet"], level: 22, power: 1.50, difficulty: "hard", turnLimit: 27, stones: 9, weights: LOW_HEAL }),
  floor(39, { title: "Kim Không Quân Sư", intro: "Cần một tướng hệ Kim, cấm Quân sư.", rules: { minElements: { kim: 1 }, bannedProfessions: ["quanSu"] }, foes: ["loiAnh", "tieuMinh", "tongTan"], level: 23, power: 1.10, difficulty: "hard", turnLimit: 27, stones: 9 }),
  floor(40, { title: "Ải Ba Hệ Ba Nghề", intro: "Ba tướng ra trận phải khác hệ và khác nghề.", rules: { maxSameElement: 1, maxSameProfession: 1 }, foes: ["caoKien", "vuLoi", "bachSuong"], level: 24, power: 0.85, difficulty: "boss", turnLimit: 29, stones: 12, weights: TACTICAL }),
  // Chặng V (41-50): ba luật ghép; ải trùm ở 45 và đỉnh tháp ở 50.
  floor(41, { title: "Thủy Hỏa Bất Dung", intro: "Cấm hệ Hỏa và hệ Thủy, bắt buộc có Binh lính.", rules: { bannedElements: ["hoa", "thuy"], minProfessions: { binhLinh: 1 } }, foes: ["thaiHa", "truongViem", "quachAn"], level: 25, power: 0.60, difficulty: "hard", turnLimit: 27, stones: 10 }),
  floor(42, { title: "Rừng Ba Lối", intro: "Cần một tướng hệ Mộc, cấm Pháp sư, ba tướng khác nghề.", rules: { minElements: { moc: 1 }, bannedProfessions: ["phapSu"], maxSameProfession: 1 }, foes: ["doanNham", "maNhac", "tranSonThach"], level: 25, power: 0.95, difficulty: "hard", turnLimit: 27, stones: 10, weights: TACTICAL }),
  floor(43, { title: "Gươm Vắng Chủ", intro: "Cấm hệ Kim, cấm Tướng sĩ, ba tướng ra trận phải khác hệ.", rules: { bannedElements: ["kim"], bannedProfessions: ["tuongSi"], maxSameElement: 1 }, foes: ["lamTung", "samTue", "thanhLamXa"], level: 26, power: 1.10, difficulty: "hard", turnLimit: 27, stones: 10, weights: OFFENSE }),
  floor(44, { title: "Nước Lặng", intro: "Cần hệ Thủy, cần Y sư, cấm hệ Phong.", rules: { minElements: { thuy: 1 }, minProfessions: { ySu: 1 }, bannedElements: ["phong"] }, foes: ["khaSon", "taThach", "diaAn"], level: 26, power: 1.20, difficulty: "hard", turnLimit: 27, stones: 10 }),
  floor(45, { title: "Ải Không Mưu", intro: "Cấm Mưu sĩ và Quân sư, bắt buộc có một tướng hệ Thổ; ô tim rất hiếm.", rules: { bannedProfessions: ["muuSi", "quanSu"], minElements: { tho: 1 } }, foes: ["huaLang", "lieuYen", "voAnh"], level: 27, power: 1.10, difficulty: "boss", turnLimit: 28, stones: 12, weights: LOW_HEAL }),
  floor(46, { title: "Dao Trong Giông", intro: "Cần một Sát thủ, cấm hệ Lôi, ba tướng ra trận phải khác hệ.", rules: { minProfessions: { satThu: 1 }, bannedElements: ["loi"], maxSameElement: 1 }, foes: ["ongChan", "tuKinh", "loiAnh"], level: 28, power: 1.20, difficulty: "hard", turnLimit: 26, stones: 12, weights: TACTICAL }),
  floor(47, { title: "Lửa Trần", intro: "Cấm Y sư và Binh lính, bắt buộc có một tướng hệ Hỏa; bàn cờ nhiều kiếm.", rules: { bannedProfessions: ["ySu", "binhLinh"], minElements: { hoa: 1 } }, foes: ["hoLang", "daoLam", "hanGiangKhach"], level: 28, power: 0.76, difficulty: "hard", turnLimit: 26, stones: 12, weights: OFFENSE }),
  floor(48, { title: "Cung Sau Khiên", intro: "Cần Xạ thủ, cần Binh lính, cấm hệ Mộc.", rules: { minProfessions: { xaThu: 1, binhLinh: 1 }, bannedElements: ["moc"] }, foes: ["tranCuong", "chuNgan", "bachPhongDao"], level: 29, power: 0.82, difficulty: "hard", turnLimit: 26, stones: 12 }),
  floor(49, { title: "Trước Đỉnh Tháp", intro: "Cấm hệ Thổ và hệ Phong, ba tướng ra trận phải khác nghề; ô tim rất hiếm.", rules: { bannedElements: ["tho", "phong"], maxSameProfession: 1 }, foes: ["lyLiet", "xichDiemLuan", "tonDiem"], level: 30, power: 0.95, difficulty: "boss", turnLimit: 27, stones: 12, weights: LOW_HEAL }),
  floor(50, { title: "Đỉnh Tháp Thí Luyện", intro: "Ba tướng ra trận phải khác hệ, khác nghề và không có Y sư.", rules: { maxSameElement: 1, maxSameProfession: 1, bannedProfessions: ["ySu"] }, foes: ["tranCuong", "vuLoi", "voAnh"], level: 30, power: 1.35, difficulty: "nightmare", turnLimit: 28, stones: 20, weights: TACTICAL }),
];

export const TRIAL_DESIGN_REASON: readonly string[] = [
  "Dạy lệnh cấm hệ; vẫn còn bốn tướng khởi đầu hợp lệ.", "Dạy lệnh cấm nghề và đổi nghề thủ lĩnh.",
  "Lặp mẫu cấm hệ để xác nhận preview thủ lĩnh.", "Bỏ Y sư nhưng giảm sức mạnh địch để tránh ngõ cụt.",
  "Chốt nhóm nhập môn bằng độ khó normal đầu tiên.", "Lê Thạch khởi đầu bảo đảm điều kiện Binh lính.",
  "Mai Thanh khởi đầu bảo đảm điều kiện Thủy.", "Roster khởi đầu phủ đủ nghề để tạo ba vai trò.",
  "Năm tướng khởi đầu khác hệ nên không cần tướng hiếm.", "Lê Thạch và Mai Thanh là lời giải miễn phí.",
  "Bàn thiên công bù áp lực 28 lượt.", "Giới thiệu ít hồi phục trước khi tăng thêm sức mạnh địch.",
  "Tăng năng lượng/trống để khuyến khích kỹ năng.", "Siết lượt trên bàn thiên công.",
  "Kết hợp ít hồi phục và giới hạn lượt, vẫn tự do chọn đội.", "Cấm Hỏa + cần Thủy; Mai Thanh bảo đảm eligibility.",
  "Cấm Y sư + ba hệ khác nhau; roster đầu có nhiều tổ hợp.", "Cần Binh lính + ba nghề; Lê Thạch là lời giải miễn phí.",
  "Cấm Phong + cần Thổ; Lê Thạch là lời giải miễn phí.", "Boss cuối ghép cấm Pháp sư + ba hệ, không cần tướng hiếm.",
  "Mở chặng III bằng lệnh cấm Mộc; đối thủ đầu tiên lấy từ tướng cửa hàng.", "Giới thiệu nghề Xạ thủ qua lệnh cấm.",
  "Thủ lĩnh đổi sang Xạ thủ là lời giải miễn phí.", "Giới thiệu nghề Sát thủ qua lệnh cấm.",
  "Thủ lĩnh đổi sang Sát thủ là lời giải miễn phí.", "Cấm Thủy loại Mai Thanh, buộc tìm nguồn hồi khác.",
  "Roster khởi đầu không có Lôi; thủ lĩnh đổi hệ là lời giải.", "Bỏ Lê Thạch để thử đội không tiền quân.",
  "Tô Kim khởi đầu bảo đảm điều kiện Mưu sĩ.", "Ải trùm chặng III: ba tướng Lôi, cấm dùng Lôi đáp lại.",
  "Luật kép đầu chặng IV; còn Hà Vân, Lê Thạch, Mai Thanh, Phùng Phong.", "Hà Vân bảo đảm Hỏa; bàn thiên công bù việc thiếu Y sư.",
  "Loại Hà Vân và hai nghề công chính, đẩy sang Mưu sĩ/Quân sư.", "Phùng Phong bảo đảm Phong; starter vốn khác nghề.",
  "Ải trùm: Lê Thạch bắt buộc, không Mai Thanh, ít tim.", "Thủ lĩnh cầm cung; Hà Vân phải nghỉ.",
  "Loại Lê Thạch và buộc ba hệ; starter vốn khác hệ.", "Mai Thanh và Tô Kim là lời giải miễn phí trên bàn ít tim.",
  "Tô Kim bảo đảm Kim; Phùng Phong phải nghỉ.", "Ải trùm chặng IV ghép hai luật đa dạng của tầng 8 và 9.",
  "Luật ba đầu tiên; Lê Thạch là neo đội hình.", "Thủ lĩnh hệ Mộc; loại Hà Vân, buộc ba nghề.",
  "Loại Tô Kim và build Tướng sĩ; buộc ba hệ.", "Mai Thanh thỏa cả hai điều kiện bắt buộc.",
  "Ải trùm: chỉ còn ba starter hợp lệ, Lê Thạch bắt buộc.", "Thủ lĩnh Sát thủ, đội ba hệ không Lôi.",
  "Hà Vân bắt buộc; không Khiên, không thuốc.", "Thủ lĩnh Xạ thủ đi cùng Lê Thạch.",
  "Còn Hà Vân, Mai Thanh, Tô Kim; siết hồi phục trước đỉnh tháp.", "Đỉnh tháp ghép ba luật đa dạng; starter vẫn đủ lời giải.",
];
