// Nội dung phát hành Tháp Thí Luyện V1: 20 tầng cố định. Chỉ chứa dữ liệu trận;
// lý do thiết kế và bằng chứng validator nằm ở docs/dual-tower/02-06-trial-content-report.md.
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
}

const floor = (index: number, input: FloorInput): TrialFloorSpec => ({
  schema: 1, id: trialFloorId(index), floor: index, contentVersion: 1,
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
  floor(8, { title: "Ba Vai Trò", intro: "Ba active phải làm ba nghề khác nhau.", rules: { maxSameProfession: 1 }, foes: ["toKim", "leThach", "maiThanh"], level: 4, power: 0.60, difficulty: "normal", turnLimit: 31, stones: 3 }),
  floor(9, { title: "Tam Hành", intro: "Ba active phải mang ba hệ khác nhau.", rules: { maxSameElement: 1 }, foes: ["haVan", "toKim", "phungPhong"], level: 5, power: 0.62, difficulty: "normal", turnLimit: 30, stones: 3 }),
  floor(10, { title: "Công Thủ Tương Trợ", intro: "Đội phải có cả Binh lính và Y sư.", rules: { minProfessions: { binhLinh: 1, ySu: 1 } }, foes: ["leThach", "maiThanh", "haVan"], level: 5, power: 0.64, difficulty: "hard", turnLimit: 30, stones: 4 }),
  floor(11, { title: "Nhịp Trống Gấp", intro: "Bàn cờ nhiều kiếm hơn, nhưng chỉ có 28 lượt.", rules: {}, foes: ["haVan", "toKim", "leThach"], level: 6, power: 0.64, difficulty: "normal", turnLimit: 28, stones: 4, weights: OFFENSE }),
  floor(12, { title: "Đường Dài Ít Tim", intro: "Ô tim hiếm; giữ máu trong giới hạn 28 lượt.", rules: {}, foes: ["maiThanh", "phungPhong", "toKim"], level: 6, power: 0.64, difficulty: "normal", turnLimit: 28, stones: 4, weights: LOW_HEAL }),
  floor(13, { title: "Thế Cờ Cân Não", intro: "Năng lượng và trống xuất hiện nhiều hơn trên bàn cố định.", rules: {}, foes: ["phungPhong", "haVan", "maiThanh"], level: 7, power: 0.66, difficulty: "hard", turnLimit: 27, stones: 4, weights: TACTICAL }),
  floor(14, { title: "Đánh Nhanh", intro: "Tận dụng bàn nhiều kiếm để hạ đội hình cứng trong 26 lượt.", rules: {}, foes: ["leThach", "toKim", "phungPhong"], level: 7, power: 0.68, difficulty: "hard", turnLimit: 26, stones: 4, weights: OFFENSE }),
  floor(15, { title: "Cạn Nguồn", intro: "Ít hồi phục và giới hạn 26 lượt thử khả năng điều phối.", rules: {}, foes: ["maiThanh", "leThach", "haVan"], level: 8, power: 0.68, difficulty: "hard", turnLimit: 26, stones: 5, weights: LOW_HEAL }),
  floor(16, { title: "Thủy Khắc Hỏa", intro: "Cấm Hỏa và bắt buộc ít nhất một tướng Thủy.", rules: { bannedElements: ["hoa"], minElements: { thuy: 1 } }, foes: ["haVan", "toKim", "leThach"], level: 8, power: 0.70, difficulty: "boss", turnLimit: 28, stones: 5, weights: STANDARD }),
  floor(17, { title: "Không Trùng Hành", intro: "Không dùng Y sư và ba active phải khác hệ.", rules: { bannedProfessions: ["ySu"], maxSameElement: 1 }, foes: ["maiThanh", "phungPhong", "toKim"], level: 9, power: 0.72, difficulty: "boss", turnLimit: 28, stones: 5, weights: TACTICAL }),
  floor(18, { title: "Quân Trận Phân Minh", intro: "Cần một Binh lính và ba active khác nghề.", rules: { minProfessions: { binhLinh: 1 }, maxSameProfession: 1 }, foes: ["leThach", "haVan", "phungPhong"], level: 9, power: 0.74, difficulty: "boss", turnLimit: 27, stones: 5, weights: OFFENSE }),
  floor(19, { title: "Neo Đất", intro: "Cấm Phong và bắt buộc ít nhất một tướng hệ Thổ.", rules: { bannedElements: ["phong"], minElements: { tho: 1 } }, foes: ["phungPhong", "toKim", "maiThanh"], level: 10, power: 0.76, difficulty: "boss", turnLimit: 27, stones: 6, weights: LOW_HEAL }),
  floor(20, { title: "Cửa Ải Song Tháp", intro: "Không dùng Pháp sư; ba active phải khác hệ để hạ thủ lĩnh cuối.", rules: { bannedProfessions: ["phapSu"], maxSameElement: 1 }, foes: ["haVan", "leThach", "phungPhong"], level: 10, power: 0.78, difficulty: "nightmare", turnLimit: 28, stones: 8, weights: TACTICAL }),
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
];
