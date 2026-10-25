// Danh mục trận 12 sứ quân dùng chung (WarlordEncounterCatalog, design-freeze mục 5), tách khỏi chiến dịch 13 màn
// cũ đã gỡ ở CAMP-08.04. Đánh trùm, Leo tháp, Sinh tồn, Thử thách ngày và Đấu trường đọc danh mục này, không
// đọc nhiệm vụ Campaign V2. Thứ tự, nguyên tố, nghề, cấp và tùy tướng giữ đúng bản cũ để các chế độ đó chọn
// đối thủ y như trước với cùng seed. `encounterId` là id màn cũ, chỉ còn làm id nội bộ của trận.
// Thoại là lời game sáng tác cho trận Đánh trùm (chỉ 6 sứ quân bị đánh dẹp dùng, raids.ts), không phải lời nhân vật
// lịch sử.

import { BASE_STATS } from "../roster";
import {
  professionSkills,
  signatureOf,
  type Element,
  type FighterConfig,
  type Profession,
} from "../battle";
import type { Difficulty } from "../ai";
import { STANDARD_WEIGHTS, type SpawnWeights } from "../board";
import { buildCampaignLeader, leveledFoe } from "../progress";
import type { CampaignFactionId } from "./factions";

export interface EncounterFoe {
  readonly id: string;
  readonly name: string;
  readonly element: Element;
  readonly profession: Profession;
  /** Thủ lĩnh AI: preset 6 chiêu theo hệ, luôn kèm chiêu riêng. Tùy tướng: chiêu theo nghề. */
  readonly hero: boolean;
  /** Tước hiệu của sứ quân, ví dụ Trần Minh Công. */
  readonly title?: string;
}

export interface EncounterLines {
  readonly before: string;
  readonly win: string;
  readonly lose: string;
}

export interface WarlordEncounter {
  /** Id sứ quân, trùng id thế cục Campaign V2 và id Đánh trùm. */
  readonly id: CampaignFactionId;
  /** Id màn cũ, chỉ dùng nội bộ (encounter ID). Không phải nhiệm vụ V2 và không quy đổi sang tiến độ V2. */
  readonly encounterId: string;
  /** Đất đóng quân theo sổ nguồn. */
  readonly place: string;
  /** Vùng ngày nay, chỉ để định hướng; không dùng làm tên gọi thế kỷ X. */
  readonly modernRegion: string;
  readonly mode: "1v1" | "3v3";
  /** Độ khó AI gốc, Đánh trùm nâng từ mức này. */
  readonly difficulty: Difficulty;
  /** Cấp gốc của cả đội đối thủ. */
  readonly level: number;
  /** Cấp gợi ý gốc cho Đinh Bộ Lĩnh. */
  readonly recommended: number;
  /** Người đầu là sứ quân, sau là tùy tướng. */
  readonly foes: readonly EncounterFoe[];
  readonly lines: EncounterLines;
}

/**
 * Sân nhà: bàn cờ nghiêng về loại ô hợp với nguyên tố của sứ quân. Cả hai phe cùng ăn ô, nhưng sứ quân giữ
 * kho nên vào trận đầy lương (FOOD_MAX). Bản đầu cho sứ quân luôn đi trước thì quá khó (mô phỏng 20/10/2026).
 */
export const HOME_TERRAIN: Readonly<Record<Element, SpawnWeights>> = {
  kim: { ...STANDARD_WEIGHTS, kiem: 22, tim: 11 },
  moc: { ...STANDARD_WEIGHTS, tim: 19, vang: 9, sach: 9 },
  thuy: { ...STANDARD_WEIGHTS, banhChung: 9, amDuong: 22 },
  hoa: { ...STANDARD_WEIGHTS, kiem: 24, banhChung: 12, tim: 12 },
  tho: { ...STANDARD_WEIGHTS, banhChung: 21, vang: 9, sach: 10, kiem: 15 },
  loi: {
    ...STANDARD_WEIGHTS,
    amDuong: 22,
    trong: 17,
    banhChung: 12,
    tim: 12,
    vang: 9,
    sach: 10,
  },
  phong: {
    ...STANDARD_WEIGHTS,
    trong: 20,
    amDuong: 19,
    banhChung: 12,
    tim: 12,
    vang: 9,
    sach: 10,
  },
};

export const HOME_RULE: Readonly<Record<Element, string>> = {
  kim: "Sân nhà Kim: nhiều ô kiếm, ít ô tim.",
  moc: "Sân nhà Mộc: nhiều ô tim, ít vàng và sách.",
  thuy: "Sân nhà Thủy: sông nước, nhiều âm dương, ít bánh chưng.",
  hoa: "Sân nhà Hỏa: nhiều ô kiếm, ít bánh chưng và tim.",
  tho: "Sân nhà Thổ: kho lương đầy, nhiều bánh chưng.",
  loi: "Sân nhà Lôi: nhiều âm dương và trống trận.",
  phong: "Sân nhà Phong: nhiều trống trận và âm dương.",
};

/** Trùm có thêm chừng này lần máu. */
export const BOSS_HP = 1.5;

const hero = (
  id: string,
  name: string,
  element: Element,
  profession: Profession,
  title: string,
): EncounterFoe => ({ id, name, element, profession, hero: true, title });
const aide = (
  id: string,
  name: string,
  element: Element,
  profession: Profession,
): EncounterFoe => ({ id, name, element, profession, hero: false });

/** 12 sứ quân theo thứ tự sổ nguồn W01–W12 (cũng là thứ tự Đánh trùm của bản cũ). */
export const WARLORD_ENCOUNTERS: readonly WarlordEncounter[] = [
  {
    id: "tranLam",
    encounterId: "boHai",
    place: "Bố Hải Khẩu",
    modernRegion: "Kỳ Bố, Thái Bình",
    mode: "1v1",
    difficulty: "easy",
    level: 2,
    recommended: 6,
    foes: [hero("tranLam", "Trần Lãm", "thuy", "quanSu", "Trần Minh Công")],
    lines: {
      before:
        "Luyện binh thôi, đừng nương tay. Quân hai bên cần quen nhịp của nhau.",
      win: "Quân Hoa Lư phối hợp khá lắm. Mai ta luyện tiếp.",
      lose: "Không sao, buổi tập là để thấy chỗ hở. Chỉnh lại rồi thử lần nữa.",
    },
  },
  {
    id: "phamBachHo",
    encounterId: "dangChau",
    place: "Đằng Châu",
    modernRegion: "Kim Động, Hưng Yên",
    mode: "1v1",
    difficulty: "easy",
    level: 3,
    recommended: 6,
    foes: [
      hero("phamBachHo", "Phạm Bạch Hổ", "hoa", "tuongSi", "Phạm Phòng Át"),
    ],
    lines: {
      before: "Đây chỉ là phép thử nếu lời hứa không thành. Ra tay đi.",
      win: "Giả như có đánh thì cũng vậy thôi. Lời hội kiến vẫn là lối tốt hơn.",
      lose: "Gươm Đằng Châu chưa cùn đâu. Về mà mài lại gươm của mình đi.",
    },
  },
  {
    id: "ngoXuongXi",
    encounterId: "binhKieu",
    place: "Bình Kiều",
    modernRegion: "Triệu Sơn, Thanh Hóa",
    mode: "3v3",
    difficulty: "normal",
    level: 5,
    recommended: 8,
    foes: [
      hero("ngoXuongXi", "Ngô Xương Xí", "kim", "muuSi", "Kiều công"),
      aide("binhKieu-pho", "Phó tướng Bình Kiều", "kim", "binhLinh"),
      aide("binhKieu-y", "Lang y Bình Kiều", "thuy", "ySu"),
    ],
    lines: {
      before: "Nếu lời nói không đủ, thử xem gươm có đủ không.",
      win: "Giả như có đánh thì đây là kết quả. Ta vẫn chọn bàn chuyện bằng lời.",
      lose: "Bình Kiều vẫn là đất nhà Ngô. Lui quân đi.",
    },
  },
  {
    id: "ngoNhatKhanh",
    encounterId: "duongLam",
    place: "Đường Lâm",
    modernRegion: "Sơn Tây, Hà Nội",
    mode: "3v3",
    difficulty: "normal",
    level: 6,
    recommended: 9,
    foes: [
      hero("ngoNhatKhanh", "Ngô Nhật Khánh", "phong", "quanSu", "Ngô Nam công"),
      aide("duongLam-pho", "Phó tướng Đường Lâm", "tho", "tuongSi"),
      aide("duongLam-y", "Lang y Đường Lâm", "moc", "ySu"),
    ],
    lines: {
      before: "Đường Lâm đất thiêng, gió nơi này không thổi theo ai cả.",
      win: "Giả như có đánh thì gió đã đổi chiều. Lời cam kết vẫn quý hơn.",
      lose: "Gió Đường Lâm đẩy các ngươi về Hoa Lư rồi.",
    },
  },
  {
    id: "nguyenKhoan",
    encounterId: "tamDai",
    place: "Tam Đái",
    modernRegion: "Vĩnh Tường, Vĩnh Phúc",
    mode: "3v3",
    difficulty: "normal",
    level: 8,
    recommended: 11,
    foes: [
      hero(
        "nguyenKhoan",
        "Nguyễn Khoan",
        "tho",
        "binhLinh",
        "Nguyễn Thái Bình",
      ),
      aide("tamDai-pho", "Phó tướng Tam Đái", "tho", "binhLinh"),
      aide("tamDai-phap", "Thầy pháp Tam Đái", "hoa", "phapSu"),
    ],
    lines: {
      before:
        "Giả như Tam Đái không tan mà cố thủ, thử xem quân ngươi vây được bao lâu.",
      win: "Giả như có vây thì cũng vậy. Thế Tam Đái vốn đã tan dần.",
      lose: "Thành chưa vỡ đâu. Về tính lại cách vây.",
    },
  },
  {
    id: "kieuCongHan",
    encounterId: "phongChau",
    place: "Phong Châu",
    modernRegion: "Bạch Hạc, Phú Thọ",
    mode: "3v3",
    difficulty: "normal",
    level: 9,
    recommended: 14,
    foes: [
      hero("kieuCongHan", "Kiều Công Hãn", "loi", "phapSu", "Kiều Tam Chế"),
      aide("phongChau-pho", "Phó tướng Phong Châu", "tho", "binhLinh"),
      aide("phongChau-muu", "Mưu thần Phong Châu", "phong", "muuSi"),
    ],
    lines: {
      before:
        "Đất Phong Châu có sấm sét che chở. Đấu lại một trận xem tài ai hơn.",
      win: "Sấm sét cũng phải nhường người có chí. Trận này ngươi hơn.",
      lose: "Trời Phong Châu đã ra oai. Về luyện thêm rồi hẵng đến.",
    },
  },
  {
    id: "kieuThuan",
    encounterId: "hoiHo",
    place: "Hồi Hồ",
    modernRegion: "Cẩm Khê, Phú Thọ",
    mode: "3v3",
    difficulty: "hard",
    level: 10,
    recommended: 14,
    foes: [
      hero("kieuThuan", "Kiều Thuận", "moc", "ySu", "Kiều Lệnh công"),
      aide("hoiHo-pho", "Phó tướng Hồi Hồ", "thuy", "binhLinh"),
      aide("hoiHo-phap", "Thầy pháp Hồi Hồ", "moc", "phapSu"),
    ],
    lines: {
      before: "Đầm Hồi Hồ bùn sâu nước đục, quân lạ vào là sa lầy.",
      win: "Các ngươi lại qua được đầm này. Ta phục.",
      lose: "Bùn Hồi Hồ giữ chân các ngươi rồi đấy.",
    },
  },
  {
    id: "lyKhue",
    encounterId: "sieuLoai",
    place: "Siêu Loại",
    modernRegion: "Thuận Thành, Bắc Ninh",
    mode: "3v3",
    difficulty: "hard",
    level: 12,
    recommended: 16,
    foes: [
      hero("lyKhue", "Lý Khuê", "kim", "tuongSi", "Lý Lãng công"),
      aide("sieuLoai-pho", "Phó tướng Siêu Loại", "kim", "binhLinh"),
      aide("sieuLoai-quan", "Quân sư Siêu Loại", "tho", "quanSu"),
    ],
    lines: {
      before: "Giáp Siêu Loại dày nhất vùng này. Kiếm nào chém nổi?",
      win: "Giáp dày cũng có kẽ hở. Trận này ngươi thắng.",
      lose: "Kiếm các ngươi gãy cả rồi. Về rèn lại đi.",
    },
  },
  {
    id: "nguyenThuTiep",
    encounterId: "tienDu",
    place: "Tiên Du",
    modernRegion: "Tiên Du, Bắc Ninh",
    mode: "3v3",
    difficulty: "hard",
    level: 13,
    recommended: 16,
    foes: [
      hero(
        "nguyenThuTiep",
        "Nguyễn Thủ Tiệp",
        "thuy",
        "muuSi",
        "Nguyễn Lệnh công",
      ),
      aide("tienDu-pho", "Phó tướng Tiên Du", "thuy", "tuongSi"),
      aide("tienDu-y", "Lang y Tiên Du", "moc", "ySu"),
    ],
    lines: {
      before: "Kho lương Tiên Du đầy ắp, đánh lâu bao nhiêu ta cũng chịu được.",
      win: "Lương đầy mà người không đồng lòng thì cũng thua. Lần này ngươi hơn.",
      lose: "Đánh lâu thì ai đói trước? Các ngươi đấy.",
    },
  },
  {
    id: "luDuong",
    encounterId: "teGiang",
    place: "Tế Giang",
    modernRegion: "Văn Giang, Hưng Yên",
    mode: "3v3",
    difficulty: "hard",
    level: 15,
    recommended: 18,
    foes: [
      hero("luDuong", "Lữ Đường", "thuy", "phapSu", "Lữ Tá công"),
      aide("teGiang-pho", "Phó tướng Tế Giang", "thuy", "binhLinh"),
      aide("teGiang-quan", "Quân sư Tế Giang", "phong", "quanSu"),
    ],
    lines: {
      before:
        "Đây chỉ là phép thử nếu các làng ven sông không theo về. Ra tay đi.",
      win: "Giả như có đánh thì cũng vậy thôi. Các làng đã chọn đường của họ.",
      lose: "Bờ sông Tế Giang chưa dễ qua đâu. Về mà tính lại.",
    },
  },
  {
    id: "nguyenSieu",
    encounterId: "tayPhuLiet",
    place: "Tây Phù Liệt",
    modernRegion: "Thanh Trì, Hà Nội",
    mode: "3v3",
    difficulty: "hard",
    level: 17,
    recommended: 21,
    foes: [
      hero("nguyenSieu", "Nguyễn Siêu", "hoa", "binhLinh", "Nguyễn Hữu công"),
      aide("tayPhuLiet-pho", "Phó tướng Tây Phù Liệt", "hoa", "tuongSi"),
      aide("tayPhuLiet-muu", "Mưu thần Tây Phù Liệt", "loi", "muuSi"),
    ],
    lines: {
      before: "Lũy lửa Phù Liệt cháy ngày đêm. Đến gần là bỏng.",
      win: "Lửa tắt rồi. Lần này ngươi qua được.",
      lose: "Lửa còn cháy, các ngươi còn chưa qua được.",
    },
  },
  {
    id: "doCanhThac",
    encounterId: "doDong",
    place: "Đỗ Động Giang",
    modernRegion: "Thanh Oai, Hà Nội",
    mode: "3v3",
    difficulty: "boss",
    level: 20,
    recommended: 24,
    foes: [
      hero("doCanhThac", "Đỗ Cảnh Thạc", "tho", "tuongSi", "Đỗ Lệnh công"),
      aide("doDong-pho", "Phó tướng Đỗ Động", "kim", "binhLinh"),
      aide("doDong-quan", "Quân sư Đỗ Động", "thuy", "quanSu"),
    ],
    lines: {
      before: "Đỗ Động vẫn còn người giữ. Muốn đấu lại thì vào đây.",
      win: "Thành Đỗ Động lại không cản được ngươi. Giỏi lắm.",
      lose: "Đỗ Động còn đứng vững. Về mà luyện thêm.",
    },
  },
];

export function warlordEncounter(id: string): WarlordEncounter | undefined {
  return WARLORD_ENCOUNTERS.find((w) => w.id === id);
}

/** Dựng một đối thủ ở cấp cho trước. */
export function encounterFighter(
  foe: EncounterFoe,
  level: number,
): FighterConfig {
  if (foe.hero) {
    const kit = buildCampaignLeader(level, foe.element, foe.profession, foe.id);
    // Sứ quân luôn mang chiêu riêng (ô 5), kể cả khi cấp chưa tới mốc mở ô 5, ở cấp kỹ năng cao nhất trong bộ.
    const sig = signatureOf(foe.id);
    const levels = kit.skillLevels ?? {};
    const skills =
      sig && !kit.skills!.includes(sig.id)
        ? [...kit.skills!, sig.id]
        : kit.skills!;
    const skillLevels = sig
      ? { ...levels, [sig.id]: Math.max(1, ...Object.values(levels)) }
      : levels;
    return { ...kit, skills, skillLevels, id: foe.id, name: foe.name };
  }
  const base: FighterConfig = {
    id: foe.id,
    name: foe.name,
    element: foe.element,
    profession: foe.profession,
    ...BASE_STATS[foe.profession],
    skills: professionSkills(foe.profession).map((s) => s.id),
  };
  return leveledFoe(base, level);
}

/** Sứ quân (thủ lĩnh) của một mục trong danh mục, dựng ở cấp cho trước. */
export function warlordLeader(
  warlord: WarlordEncounter,
  level: number,
): FighterConfig {
  return encounterFighter(warlord.foes[0]!, level);
}
