// Tính cách của máy (Shan chốt 27/11/2026): sứ quân, tướng lịch sử và nhân vật đặc biệt chơi cùng người khi vắng người.
// Mỗi nhân vật một tính cách (nhóm lối đánh) cộng một nét riêng nhỏ. Tính cách chỉ đổi trọng số khi AI chấm nước đi và
// kỹ năng; độ mạnh vẫn theo độ khó, AI vẫn không đọc luồng ô rơi (ngang bằng thông tin, docs/01-gameplay/ai.md).
// Không truyền tính cách thì AI chấm y như trước.

import { isAlive, otherSide } from "../battle";
import type { AiView } from "./ai";

export type PersonalityId = "manhCong" | "thuThanh" | "muuPha" | "tichLuc" | "lieuLinh" | "laoLuyen" | "hoChu" | "tuyCo";

/** Hệ số nhân lên phần điểm của từng nhóm khi AI chấm; 1 là như AI gốc. */
export interface AiWeights {
  /** Sát thương từ ô kiếm và kỹ năng. */
  readonly damage: number;
  /** Thưởng kết liễu. */
  readonly kill: number;
  /** Hồi máu, khiên, bánh chưng, buff giữ thân. */
  readonly sustain: number;
  /** Phần giữ thân dành cho đồng đội khác (đội, một đồng minh), nhân thêm sau `sustain`. */
  readonly allyCare: number;
  /** Hiệu ứng xấu lên đối thủ, phá buff, rút năng lượng, cắt lương. */
  readonly disrupt: number;
  /** Ô âm dương và kỹ năng nạp năng lượng. */
  readonly energy: number;
  /** Thêm lượt, ô đặc biệt, kỹ năng đổi bàn cờ. */
  readonly tempo: number;
  /** Nhân độ ngẫu nhiên của độ khó. */
  readonly noise: number;
  /** Chỉ dùng kỹ năng đáng ít nhất tỉ lệ này so với kỹ năng đáng nhất (AI gốc 0,8); cao thì để dành nhiều hơn. */
  readonly saveForBetter: number;
  /** Cộng điểm kỳ vọng ô mới kể cả ở độ khó thấp. */
  readonly lookahead: boolean;
}

export const BASE_WEIGHTS: AiWeights = {
  damage: 1, kill: 1, sustain: 1, allyCare: 1, disrupt: 1, energy: 1, tempo: 1, noise: 1, saveForBetter: 0.8, lookahead: false,
};

export interface Personality {
  readonly id: PersonalityId;
  readonly name: string;
  /** Một câu tả lối đánh, hiện cho người chơi. */
  readonly summary: string;
  readonly weights: AiWeights;
}

const w = (partial: Partial<AiWeights>): AiWeights => ({ ...BASE_WEIGHTS, ...partial });

export const PERSONALITIES: Readonly<Record<PersonalityId, Personality>> = {
  manhCong: { id: "manhCong", name: "Mãnh công", summary: "Săn ô kiếm, ưu tiên kết liễu, có chiêu sát thương là tung ngay.",
    weights: w({ damage: 1.25, kill: 1.5, sustain: 0.8, disrupt: 0.85, energy: 0.9, saveForBetter: 0.65 }) },
  thuThanh: { id: "thuThanh", name: "Thủ thành", summary: "Giữ máu, giữ lương, dựng khiên rồi mới đánh, không vội.",
    weights: w({ damage: 0.85, sustain: 1.6, disrupt: 0.9, tempo: 0.9 }) },
  muuPha: { id: "muuPha", name: "Mưu phá", summary: "Phá buff, rút năng lượng, cắt lương, khống chế đối thủ.",
    weights: w({ damage: 0.9, sustain: 0.9, disrupt: 1.7 }) },
  tichLuc: { id: "tichLuc", name: "Tích lực", summary: "Gom âm dương, để dành tuyệt chiêu rồi tung một lần.",
    weights: w({ damage: 0.9, energy: 1.8, saveForBetter: 0.95 }) },
  lieuLinh: { id: "lieuLinh", name: "Liều lĩnh", summary: "Săn chuỗi rơi, ô đặc biệt, thêm lượt; lúc rất hay, lúc hớ.",
    weights: w({ damage: 1.1, sustain: 0.7, tempo: 1.8, noise: 1.6, saveForBetter: 0.7 }) },
  laoLuyen: { id: "laoLuyen", name: "Lão luyện", summary: "Cân bằng, tính trước ô sắp rơi, ít khi hớ.",
    weights: w({ noise: 0.5, lookahead: true }) },
  hoChu: { id: "hoChu", name: "Hộ chủ", summary: "Che chở đồng đội yếu: hồi, khiên, khiêu khích cho người khác trước.",
    weights: w({ damage: 0.9, sustain: 1.3, allyCare: 1.6, disrupt: 0.9 }) },
  tuyCo: { id: "tuyCo", name: "Tùy cơ", summary: "Dẫn thế thì thủ chắc, bị dồn thì đánh liều, ngang thì đánh cân.",
    weights: BASE_WEIGHTS },
};

export interface BotCharacter {
  readonly id: string;
  readonly personality: PersonalityId;
  /** Nét riêng, hiện cho người chơi. */
  readonly quirk: string;
  /** Hệ số nét riêng, nhân thêm lên trọng số của tính cách. */
  readonly tweak: Partial<Record<"damage" | "kill" | "sustain" | "allyCare" | "disrupt" | "energy" | "tempo" | "noise", number>>;
  /** Thoại ngắn khi vào trận, khi thắng, khi thua (Shan duyệt). */
  readonly lines: { readonly open: string; readonly win: string; readonly lose: string };
}

/** 12 sứ quân, 6 tướng lịch sử và 2 nhân vật đặc biệt chơi cùng người (id theo roster). */
export const BOT_CHARACTERS: readonly BotCharacter[] = [
  { id: "tranLam", personality: "laoLuyen", quirk: "Lão tướng Bố Hải, nước nào cũng tính chắc.", tweak: { sustain: 1.1 }, lines: { open: "Bố Hải Khẩu chưa từng vội. Mời.", win: "Đánh chắc thì thắng chắc.", lose: "Hậu sinh khả úy. Lão phục rồi." } },
  { id: "phamBachHo", personality: "manhCong", quirk: "Thấy ô kiếm là không nhịn được.", tweak: { damage: 1.1 }, lines: { open: "Hổ ra khỏi núi thì phải có mồi.", win: "Nanh vuốt chưa cùn!", lose: "Hổ cũng có lúc sa cơ." } },
  { id: "ngoXuongXi", personality: "muuPha", quirk: "Dòng dõi Ngô vương, chuộng cắt lương đối thủ.", tweak: { disrupt: 1.1, sustain: 1.1 }, lines: { open: "Thành Bình Kiều không mở cửa cho kẻ đói.", win: "Hết lương thì quân tự tan.", lose: "Dòng Ngô ghi nhớ trận này." } },
  { id: "ngoNhatKhanh", personality: "muuPha", quirk: "Khó lường, có lúc bỏ thế chắc để chơi nước lạ.", tweak: { noise: 1.4 }, lines: { open: "Đường Lâm có nhiều lối, ngươi đoán được lối nào?", win: "Thế cờ đổi rồi, ngươi chậm một bước.", lose: "Hôm nay ta lui, chưa phải là hàng." } },
  { id: "nguyenKhoan", personality: "thuThanh", quirk: "Giữ Tam Đái như giữ nhà, lương không bao giờ cạn.", tweak: { sustain: 1.1 }, lines: { open: "Tam Đái đứng vững, chẳng sợ gió.", win: "Giữ được nhà thì thắng được trận.", lose: "Lũy vỡ một góc, còn xây lại được." } },
  { id: "kieuCongHan", personality: "tichLuc", quirk: "Gom sấm đủ rồi mới giáng.", tweak: { energy: 1.1 }, lines: { open: "Mây Phong Châu đang tụ.", win: "Sấm đã giáng, ai còn đứng nổi?", lose: "Sấm chưa kịp rền đã tạnh." } },
  { id: "kieuThuan", personality: "thuThanh", quirk: "Giữ Hồi Hồ bằng thuốc men, hồi máu sớm hơn ai hết.", tweak: { allyCare: 1.2 }, lines: { open: "Hồi Hồ có thuốc, cũng có gươm.", win: "Thuốc của ta còn, máu của ngươi hết.", lose: "Lần sau ta mang thêm thuốc." } },
  { id: "lyKhue", personality: "manhCong", quirk: "Giáp dày, dám đổi máu lấy đòn.", tweak: { sustain: 0.8, kill: 1.1 }, lines: { open: "Giáp Siêu Loại dày nhất vùng, cứ đánh.", win: "Đổi máu lấy đòn, ta lời.", lose: "Giáp dày cũng có chỗ hở." } },
  { id: "nguyenThuTiep", personality: "tuyCo", quirk: "Lệnh công Tiên Du, thế nào theo thế ấy.", tweak: { disrupt: 1.1 }, lines: { open: "Tiên Du theo thế mà đi.", win: "Thời đến thì ta tiến.", lose: "Thời chưa đến, ta đợi." } },
  { id: "luDuong", personality: "tichLuc", quirk: "Chờ nước lên rồi mới mở cửa cống.", tweak: { energy: 1.1, tempo: 1.1 }, lines: { open: "Nước Tế Giang lên chậm mà sâu.", win: "Cửa cống mở, ai cản được nước?", lose: "Nước rút rồi, còn mùa sau." } },
  { id: "nguyenSieu", personality: "manhCong", quirk: "Đánh nhanh thắng nhanh, ưa thêm lượt.", tweak: { tempo: 1.2 }, lines: { open: "Tây Phù Liệt không đợi ai.", win: "Nhanh hơn một nhịp là đủ.", lose: "Nhanh quá thành vấp." } },
  { id: "doCanhThac", personality: "lieuLinh", quirk: "Cứng đầu, thua thế vẫn lao lên.", tweak: { damage: 1.1 }, lines: { open: "Đỗ Động chưa bao giờ lùi.", win: "Cứng đầu mới thắng được.", lose: "Thua thế, không thua chí." } },
  { id: "nguyenBac", personality: "manhCong", quirk: "Mở đường máu cho chủ tướng.", tweak: { allyCare: 1.2 }, lines: { open: "Mở đường cho chủ tướng!", win: "Đường đã thông.", lose: "Mạt tướng còn sống thì còn đánh." } },
  { id: "dinhDien", personality: "hoChu", quirk: "Đứng trước đồng đội như một bức tường.", tweak: { sustain: 1.1 }, lines: { open: "Muốn qua thì bước qua ta trước.", win: "Đồng đội còn đứng, ta còn đứng.", lose: "Tường đổ một lần, dựng lại hai lần." } },
  { id: "luuCo", personality: "muuPha", quirk: "Tính kỹ đường lương của đối thủ.", tweak: { disrupt: 1.1 }, lines: { open: "Lương ngươi đi đường nào, ta đã biết.", win: "Tính trước một bước, thắng trước một trận.", lose: "Có chỗ ta tính sót." } },
  { id: "trinhTu", personality: "hoChu", quirk: "Thấy đồng đội đuối là chữa ngay.", tweak: { allyCare: 1.1 }, lines: { open: "Đồng đội cứ đánh, có ta lo phía sau.", win: "Không ai phải ngã hôm nay.", lose: "Ta chữa chậm một nhịp." } },
  { id: "leHoan", personality: "laoLuyen", quirk: "Nhìn trận như nhìn bàn cờ, đánh đúng lúc.", tweak: { kill: 1.1 }, lines: { open: "Trận như bàn cờ, đi đúng lúc là đủ.", win: "Đúng lúc thì một nước cũng thắng.", lose: "Ván này ngươi đi đúng lúc hơn ta." } },
  { id: "dinhLien", personality: "tichLuc", quirk: "Tuổi trẻ nóng lòng, tích đủ là tung.", tweak: { damage: 1.1 }, lines: { open: "Tích đủ rồi, xem đây!", win: "Phụ vương sẽ vui lòng.", lose: "Ta còn trẻ, còn học được." } },
  { id: "minhNguyet", personality: "laoLuyen", quirk: "Giữ vững đã, rồi hãy tiến.", tweak: { sustain: 1.1, allyCare: 1.1 }, lines: { open: "Giữ vững đã, rồi hãy tiến.", win: "Mỗi người một sở trường, nối lại là thắng.", lose: "Đường còn dài, nghỉ một chút rồi đi tiếp." } },
  { id: "vuPhong", personality: "tuyCo", quirk: "Gió đổi chiều thì đổi đường, không đổi ý.", tweak: { tempo: 1.1 }, lines: { open: "Mây không hỏi núi có cho đi qua không.", win: "Gió thuận rồi.", lose: "Gió đổi chiều thì ta đổi đường." } },
];

export function botCharacter(id: string): BotCharacter | undefined {
  return BOT_CHARACTERS.find((c) => c.id === id);
}

/** Bỏ hậu tố bản sao (ví dụ "tranLam#2") nếu có, để tra theo id roster. */
const baseId = (id: string): string => id.split(/[#:@]/)[0]!;

/**
 * Trọng số mà AI dùng cho người đang hành động. Truyền id nhân vật (hoặc "auto" để lấy theo người hành động) và nhận
 * trọng số đã cộng nét riêng; Tùy cơ đổi theo thế trận nhìn thấy (tỉ lệ máu hai phe).
 */
export function resolveWeights(view: AiView, personality: PersonalityId | "auto" | undefined): AiWeights {
  if (personality === undefined) return BASE_WEIGHTS;
  const me = view.sides[view.turn.side].fighters[view.turn.actor];
  const character = me ? botCharacter(baseId(me.id)) : undefined;
  const id = personality === "auto" ? character?.personality : personality;
  if (id === undefined) return BASE_WEIGHTS;
  let base = PERSONALITIES[id].weights;
  if (id === "tuyCo") {
    const ratio = (side: 0 | 1) => {
      const fs = view.sides[side].fighters;
      return fs.filter(isAlive).reduce((a, f) => a + f.hp, 0) / Math.max(1, fs.reduce((a, f) => a + f.maxHp, 0));
    };
    const lead = ratio(view.turn.side) - ratio(otherSide(view.turn.side));
    base = lead > 0.15 ? PERSONALITIES.thuThanh.weights : lead < -0.15 ? PERSONALITIES.lieuLinh.weights : PERSONALITIES.laoLuyen.weights;
  }
  const tweak = personality === "auto" || character?.personality === id ? character?.tweak : undefined;
  if (!tweak) return base;
  const out: Record<string, number | boolean> = { ...base };
  for (const [k, v] of Object.entries(tweak)) out[k] = (base[k as keyof AiWeights] as number) * v;
  return out as unknown as AiWeights;
}
