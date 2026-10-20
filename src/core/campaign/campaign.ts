// Chiến dịch chương 1 "Cờ lau dẹp loạn": Đinh Bộ Lĩnh từ thuở chăn trâu ở Hoa Lư tới khi dẹp xong 12 sứ quân.
// Thứ tự màn, lời dẫn và số liệu là điểm xuất phát do Claude đặt, chờ Shan duyệt. Xem docs/design/09-che-do-choi.md.
// Sứ quân là nhân vật lịch sử có bộ 6 kỹ năng theo nguyên tố như Đinh Bộ Lĩnh; tùy tướng đi kèm dùng chiêu theo nghề.

import { BASE_STATS } from "../roster";
import {
  professionSkills,
  signatureOf,
  type Element,
  type FighterConfig,
  type Profession,
} from "../battle";
import { STANDARD_WEIGHTS, type SpawnWeights } from "../board";
import type { Difficulty } from "../ai";
import {
  autoProgress,
  buildMain,
  clampCampaignFood,
  leveledFoe,
  NEW_PROGRESS,
  SKILL_POINTS_PER_LEVEL,
  totalXpFor,
  type CampaignState,
  type CharacterProgress,
  type Profile,
} from "../progress";

export interface StageFoe {
  readonly id: string;
  readonly name: string;
  readonly element: Element;
  readonly profession: Profession;
  /** Nhân vật lịch sử: bộ 6 kỹ năng theo nguyên tố như nhân vật chính. Tùy tướng: chiêu theo nghề. */
  readonly hero: boolean;
  /** Tước hiệu của sứ quân, ví dụ Trần Minh Công. */
  readonly title?: string;
}

export interface CampaignStage {
  readonly id: string;
  readonly title: string;
  /** Đất đóng quân của đối thủ. */
  readonly place: string;
  /** Vùng đất ngày nay. */
  readonly region: string;
  /** Lời dẫn ngắn trước trận. */
  readonly story: string;
  readonly mode: "1v1" | "3v3";
  readonly difficulty: Difficulty;
  /** Cấp của mọi đối thủ trong màn. */
  readonly level: number;
  /** Đối thủ theo vị trí; người đầu là thủ lĩnh. */
  readonly foes: readonly StageFoe[];
  /** Trùm: máu ×1,5. */
  readonly boss?: boolean;
  /** Luật màn (tùy chọn): lương của phe AI theo kịch bản, tỉ lệ ô riêng, và câu mô tả hiện cho người chơi. */
  readonly foeFood?: number;
  readonly weights?: SpawnWeights;
  readonly rule?: string;
  /** Cấp gợi ý cho Đinh Bộ Lĩnh; bỏ trống là cấp đối thủ + RECOMMENDED_LEVEL_BONUS. Cân bằng `pnpm sim -- --stage`. */
  readonly recommended?: number;
  /** Vàng thưởng thêm lần đầu qua màn. */
  readonly firstClearGold: number;
  /** Tướng lịch sử gia nhập đội lần đầu qua màn (id trong HERO_COMPANIONS), ở cấp của màn. */
  readonly joins?: string;
  /** Câu kể khi tướng gia nhập. */
  readonly joinStory?: string;
  /** Thoại của thủ lĩnh đối thủ: trước trận, khi người chơi thắng, khi người chơi thua. */
  readonly lines: StageLines;
}

export interface StageLines {
  readonly before: string;
  readonly win: string;
  readonly lose: string;
}

/** Trùm có thêm chừng này lần máu. */
export const BOSS_HP = 1.5;

const hero = (
  id: string,
  name: string,
  element: Element,
  profession: Profession,
  title: string,
): StageFoe => ({ id, name, element, profession, hero: true, title });
const aide = (
  id: string,
  name: string,
  element: Element,
  profession: Profession,
): StageFoe => ({ id, name, element, profession, hero: false });

/** Sông nước: ít bánh chưng (khó giữ lương), nhiều âm dương. */
const RIVER: SpawnWeights = { ...STANDARD_WEIGHTS, banhChung: 9, amDuong: 22 };

export const CAMPAIGN: readonly CampaignStage[] = [
  {
    id: "coLau",
    title: "Cờ lau tập trận",
    place: "Hoa Lư",
    region: "Ninh Bình",
    story:
      "Thuở chăn trâu ở động Hoa Lư, cậu bé Bộ Lĩnh lấy bông lau làm cờ, bày trận đánh nhau với trẻ chăn trâu xóm bên.",
    mode: "1v1",
    difficulty: "easy",
    level: 1,
    recommended: 4,
    foes: [aide("coLau-tre", "Trẻ chăn trâu xóm bên", "tho", "binhLinh")],
    firstClearGold: 100,
    lines: {
      before:
        "Cờ lau thì làm gì nổi gậy tre! Xóm này chưa ai thắng được bọn ta.",
      win: "Thôi, thua thì thua. Từ nay xóm ta theo cờ lau của anh.",
      lose: "Về nhà chăn trâu đi! Mai lại đến mà thử.",
    },
    joins: "nguyenBac",
    joinStory:
      "Nguyễn Bặc, bạn chăn trâu cùng xóm, phục tài Bộ Lĩnh và theo làm tướng.",
  },
  {
    id: "boHai",
    title: "Thử tài ở Bố Hải Khẩu",
    place: "Bố Hải Khẩu",
    region: "Kỳ Bố, Thái Bình",
    story:
      "Nghe tiếng sứ quân Trần Lãm, Bộ Lĩnh tìm đến đầu quân. Trần Minh Công muốn thử tài người trẻ trước khi giao binh quyền.",
    mode: "1v1",
    difficulty: "easy",
    level: 2,
    recommended: 6,
    foes: [hero("tranLam", "Trần Lãm", "thuy", "quanSu", "Trần Minh Công")],
    firstClearGold: 150,
    lines: {
      before: "Người trẻ muốn cầm quân thì trước hết phải qua được tay lão.",
      win: "Giỏi! Lão già rồi, binh quyền Bố Hải giao cả cho con.",
      lose: "Còn non lắm. Ở lại luyện thêm rồi lão thử lần nữa.",
    },
    joins: "dinhDien",
    joinStory:
      "Đinh Điền, bạn thuở nhỏ ở Hoa Lư, mang quân theo Bộ Lĩnh về Bố Hải Khẩu.",
  },
  {
    id: "dangChau",
    title: "Thu phục Đằng Châu",
    place: "Đằng Châu",
    region: "Kim Động, Hưng Yên",
    story:
      "Phạm Bạch Hổ giữ Đằng Châu. Muốn ông quy phục, phải thắng ông một trận cho phục.",
    mode: "1v1",
    difficulty: "easy",
    level: 3,
    recommended: 6,
    foes: [
      hero("phamBachHo", "Phạm Bạch Hổ", "hoa", "tuongSi", "Phạm Phòng Át"),
    ],
    firstClearGold: 200,
    lines: {
      before: "Bạch Hổ này giữ Đằng Châu bằng gươm, không bằng lời hứa.",
      win: "Hổ thua thì phục. Đằng Châu xin theo Hoa Lư.",
      lose: "Gươm Đằng Châu chưa cùn đâu. Về mà mài lại gươm của mình đi.",
    },
    joins: "luuCo",
    joinStory: "Lưu Cơ, người cùng quê Hoa Lư, về giúp Bộ Lĩnh bàn mưu.",
  },
  {
    id: "binhKieu",
    title: "Đánh Bình Kiều",
    place: "Bình Kiều",
    region: "Triệu Sơn, Thanh Hóa",
    story:
      "Ngô Xương Xí, cháu Ngô Quyền, giữ Bình Kiều. Quân Hoa Lư lần đầu ra trận đủ ba tướng.",
    mode: "3v3",
    difficulty: "normal",
    level: 5,
    recommended: 8,
    foes: [
      hero("ngoXuongXi", "Ngô Xương Xí", "kim", "muuSi", "Kiều công"),
      aide("binhKieu-pho", "Phó tướng Bình Kiều", "kim", "binhLinh"),
      aide("binhKieu-y", "Lang y Bình Kiều", "thuy", "ySu"),
    ],
    firstClearGold: 250,
    lines: {
      before: "Dòng dõi Ngô Vương há phải cúi đầu trước kẻ chăn trâu?",
      win: "Ta thua mưu chứ không thua ý chí. Bình Kiều mở cổng.",
      lose: "Bình Kiều vẫn là đất nhà Ngô. Lui quân đi.",
    },
    joins: "trinhTu",
    joinStory: "Trịnh Tú theo Bộ Lĩnh từ buổi đầu, lo thuốc men và quân lương.",
  },
  {
    id: "duongLam",
    title: "Đường Lâm quy phục",
    place: "Đường Lâm",
    region: "Sơn Tây, Hà Nội",
    story:
      "Ngô Nhật Khánh (còn gọi Ngô Nam Chỉ), dòng dõi nhà Ngô, đóng ở Đường Lâm. Ông chỉ chịu hàng khi thấy quân Hoa Lư đủ mạnh.",
    mode: "3v3",
    difficulty: "normal",
    level: 6,
    recommended: 9,
    foes: [
      hero("ngoNhatKhanh", "Ngô Nhật Khánh", "phong", "quanSu", "Ngô Nam công"),
      aide("duongLam-pho", "Phó tướng Đường Lâm", "tho", "tuongSi"),
      aide("duongLam-y", "Lang y Đường Lâm", "moc", "ySu"),
    ],
    firstClearGold: 300,
    lines: {
      before: "Đường Lâm đất thiêng, gió nơi này không thổi theo ai cả.",
      win: "Gió đã đổi chiều. Đường Lâm xin quy phục.",
      lose: "Gió Đường Lâm đẩy các ngươi về Hoa Lư rồi.",
    },
  },
  {
    id: "tamDai",
    title: "Vây thành Tam Đái",
    place: "Tam Đái",
    region: "Vĩnh Tường, Vĩnh Phúc",
    story:
      "Nguyễn Khoan cố thủ Tam Đái. Thành bị vây đã lâu, kho lương bên trong cạn dần.",
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
    foeFood: 25,
    rule: "Thành bị vây: đối thủ vào trận chỉ có 25 lương.",
    firstClearGold: 350,
    lines: {
      before:
        "Thành Tam Đái chưa từng bị phá. Lương cạn thì ta ăn rễ cây mà giữ.",
      win: "Thành vỡ rồi... Mở cổng cho dân ra ngoài kiếm ăn.",
      lose: "Thấy chưa? Đói bụng vẫn giữ được thành.",
    },
    joins: "leHoan",
    joinStory:
      "Lê Hoàn, người Ái Châu, đến đầu quân và được Bộ Lĩnh giao cầm một cánh quân.",
  },
  {
    id: "phongChau",
    title: "Lên Phong Châu",
    place: "Phong Châu",
    region: "Bạch Hạc, Phú Thọ",
    story:
      "Kiều Công Hãn giữ Phong Châu, đất cũ của các vua Hùng, nơi dân quen nghề binh.",
    mode: "3v3",
    difficulty: "normal",
    level: 9,
    recommended: 14,
    foes: [
      hero("kieuCongHan", "Kiều Công Hãn", "loi", "phapSu", "Kiều Tam Chế"),
      aide("phongChau-pho", "Phó tướng Phong Châu", "tho", "binhLinh"),
      aide("phongChau-muu", "Mưu thần Phong Châu", "phong", "muuSi"),
    ],
    firstClearGold: 400,
    lines: {
      before: "Đất vua Hùng có sấm sét che chở. Kẻ nào dám lên Phong Châu?",
      win: "Sấm sét cũng phải nhường người có chí. Phong Châu nghe lệnh Hoa Lư.",
      lose: "Trời Phong Châu đã ra oai. Về đi, đừng quay lại.",
    },
    joins: "dinhLien",
    joinStory:
      "Đinh Liễn, con trưởng của Bộ Lĩnh, đã đủ tuổi theo cha ra trận.",
  },
  {
    id: "hoiHo",
    title: "Qua đầm Hồi Hồ",
    place: "Hồi Hồ",
    region: "Cẩm Khê, Phú Thọ",
    story:
      "Kiều Thuận đóng ở Hồi Hồ, ba mặt là đầm. Quân Hoa Lư phải lội nước mà đánh.",
    mode: "3v3",
    difficulty: "hard",
    level: 10,
    recommended: 14,
    foes: [
      hero("kieuThuan", "Kiều Thuận", "moc", "ySu", "Kiều Lệnh công"),
      aide("hoiHo-pho", "Phó tướng Hồi Hồ", "thuy", "binhLinh"),
      aide("hoiHo-phap", "Thầy pháp Hồi Hồ", "moc", "phapSu"),
    ],
    weights: RIVER,
    rule: "Đầm lầy: ít ô bánh chưng, nhiều ô âm dương.",
    firstClearGold: 450,
    lines: {
      before: "Đầm Hồi Hồ bùn sâu nước đục, quân lạ vào là sa lầy.",
      win: "Các ngươi qua được đầm này thì ta còn giữ làm gì nữa.",
      lose: "Bùn Hồi Hồ giữ chân các ngươi rồi đấy.",
    },
  },
  {
    id: "sieuLoai",
    title: "Đánh Siêu Loại",
    place: "Siêu Loại",
    region: "Thuận Thành, Bắc Ninh",
    story:
      "Lý Khuê giữ Siêu Loại, vùng đất có chùa chiền và người tài. Quân ông thiện chiến, ít khi lùi.",
    mode: "3v3",
    difficulty: "hard",
    level: 12,
    recommended: 16,
    foes: [
      hero("lyKhue", "Lý Khuê", "kim", "tuongSi", "Lý Lãng công"),
      aide("sieuLoai-pho", "Phó tướng Siêu Loại", "kim", "binhLinh"),
      aide("sieuLoai-quan", "Quân sư Siêu Loại", "tho", "quanSu"),
    ],
    firstClearGold: 500,
    lines: {
      before: "Giáp Siêu Loại dày nhất vùng này. Kiếm nào chém nổi?",
      win: "Giáp dày cũng có kẽ hở. Siêu Loại hàng.",
      lose: "Kiếm các ngươi gãy cả rồi. Về rèn lại đi.",
    },
  },
  {
    id: "tienDu",
    title: "Hạ Tiên Du",
    place: "Tiên Du",
    region: "Tiên Du, Bắc Ninh",
    story: "Nguyễn Thủ Tiệp xưng Vũ Ninh Vương ở Tiên Du, quân đông lương đủ.",
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
    foeFood: 100,
    rule: "Kho lương đầy: đối thủ vào trận với 100 lương.",
    firstClearGold: 550,
    lines: {
      before: "Kho lương Tiên Du đầy ắp, đánh lâu bao nhiêu ta cũng chịu được.",
      win: "Lương đầy mà người không đồng lòng thì cũng thua. Kho này giao cho ngươi.",
      lose: "Đánh lâu thì ai đói trước? Các ngươi đấy.",
    },
  },
  {
    id: "teGiang",
    title: "Thủy chiến Tế Giang",
    place: "Tế Giang",
    region: "Văn Giang, Hưng Yên",
    story: "Lữ Đường giữ Tế Giang bên bờ sông, quân quen đánh trên nước.",
    mode: "3v3",
    difficulty: "hard",
    level: 15,
    recommended: 18,
    foes: [
      hero("luDuong", "Lữ Đường", "thuy", "phapSu", "Lữ Tá công"),
      aide("teGiang-pho", "Phó tướng Tế Giang", "thuy", "binhLinh"),
      aide("teGiang-quan", "Quân sư Tế Giang", "phong", "quanSu"),
    ],
    weights: RIVER,
    rule: "Sông nước: ít ô bánh chưng, nhiều ô âm dương.",
    firstClearGold: 600,
    lines: {
      before: "Thủy quân Tế Giang thuộc từng khúc sông. Lên thuyền mà đánh!",
      win: "Sông nước cũng có ngày cạn. Tế Giang xin theo.",
      lose: "Sóng Tế Giang đánh dạt các ngươi rồi.",
    },
  },
  {
    id: "tayPhuLiet",
    title: "Tây Phù Liệt",
    place: "Tây Phù Liệt",
    region: "Thanh Trì, Hà Nội",
    story:
      "Nguyễn Siêu đóng ở Tây Phù Liệt, đắp thành hai lớp, quân hơn vạn người.",
    mode: "3v3",
    difficulty: "hard",
    level: 17,
    recommended: 21,
    foes: [
      hero("nguyenSieu", "Nguyễn Siêu", "hoa", "binhLinh", "Nguyễn Hữu công"),
      aide("tayPhuLiet-pho", "Phó tướng Tây Phù Liệt", "hoa", "tuongSi"),
      aide("tayPhuLiet-muu", "Mưu thần Tây Phù Liệt", "loi", "muuSi"),
    ],
    firstClearGold: 700,
    lines: {
      before: "Lũy lửa Phù Liệt cháy ngày đêm. Đến gần là bỏng.",
      win: "Lửa tắt rồi. Tây Phù Liệt không giữ nữa.",
      lose: "Lửa còn cháy, các ngươi còn chưa qua được.",
    },
  },
  {
    id: "doDong",
    title: "Thành Đỗ Động",
    place: "Đỗ Động Giang",
    region: "Thanh Oai, Hà Nội",
    story:
      "Đỗ Cảnh Thạc là sứ quân cứng cỏi nhất, giữ thành Đỗ Động hơn một năm. Hạ được ông, loạn 12 sứ quân chấm dứt.",
    mode: "3v3",
    difficulty: "boss",
    level: 20,
    recommended: 24,
    boss: true,
    foes: [
      hero("doCanhThac", "Đỗ Cảnh Thạc", "tho", "tuongSi", "Đỗ Lệnh công"),
      aide("doDong-pho", "Phó tướng Đỗ Động", "kim", "binhLinh"),
      aide("doDong-quan", "Quân sư Đỗ Động", "thuy", "quanSu"),
    ],
    foeFood: 100,
    rule: "Trùm cuối: Đỗ Cảnh Thạc thêm 50% máu, thành có lương đầy.",
    firstClearGold: 1000,
    lines: {
      before:
        "Bộ Lĩnh! Mười một sứ quân đã hàng, nhưng Đỗ Động còn ta. Thành này chỉ mất khi ta ngã.",
      win: "Thiên hạ về một mối rồi... Ngươi hãy giữ yên bờ cõi.",
      lose: "Mười hai sứ quân chưa dẹp xong đâu. Đỗ Động còn đứng vững.",
    },
  },
];

/**
 * Cấp gợi ý cho Đinh Bộ Lĩnh: mô phỏng (AI Thường đánh thay người chơi) cho tỉ lệ thắng khoảng 30–95% khi hơn
 * đối thủ 3 cấp, nên người chơi thật ở mức này qua được màn sau vài lần thử.
 */
export const RECOMMENDED_LEVEL_BONUS = 3;

/** Cấp gợi ý của màn. */
export function recommendedLevel(stage: CampaignStage): number {
  return stage.recommended ?? stage.level + RECOMMENDED_LEVEL_BONUS;
}

export function stageById(id: string): CampaignStage | undefined {
  return CAMPAIGN.find((s) => s.id === id);
}

/** Màn mở khi là màn đầu hoặc màn trước đã qua. */
export function stageUnlocked(campaign: CampaignState, id: string): boolean {
  const i = CAMPAIGN.findIndex((s) => s.id === id);
  return i === 0 || (i > 0 && campaign.cleared.includes(CAMPAIGN[i - 1]!.id));
}

/** Dựng một đối thủ của màn ở cấp của màn. */
export function stageFighter(foe: StageFoe, level: number): FighterConfig {
  if (foe.hero) {
    const kit = buildMain(
      autoProgress(level, null),
      foe.element,
      foe.profession,
      foe.id,
    );
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

/** Đội đối thủ của màn, đã tính máu trùm. */
export function stageFoes(stage: CampaignStage): FighterConfig[] {
  return stage.foes.map((f, i) => {
    const fighter = stageFighter(f, stage.level);
    return stage.boss && i === 0
      ? { ...fighter, maxHp: Math.round(fighter.maxHp * BOSS_HP) }
      : fighter;
  });
}

export interface CampaignResult {
  /** Lần đầu qua màn này. */
  readonly firstClear: boolean;
  readonly bonusGold: number;
  /** Lương mang sang trận sau. */
  readonly food: number;
  /** Tướng lịch sử vừa gia nhập đội. */
  readonly joined?: string;
}

/** Tướng gia nhập ở cấp `level`, giữ nguyên điểm kỹ năng để người chơi tự nâng. */
function autoJoin(level: number): CharacterProgress {
  const lv = Math.max(1, Math.floor(level));
  return {
    ...NEW_PROGRESS,
    xp: totalXpFor(lv),
    level: lv,
    skillPoints: (lv - 1) * SKILL_POINTS_PER_LEVEL,
  };
}

/**
 * Cộng kết quả trận chiến dịch vào hồ sơ: lương còn lại mang sang (kẹp trong khoảng cho phép), thắng lần đầu
 * thì ghi màn đã qua và thưởng thêm vàng.
 */
export function applyCampaignResult(
  profile: Profile,
  stageId: string,
  won: boolean,
  foodLeft: number,
): { profile: Profile; result: CampaignResult } {
  const stage = stageById(stageId);
  const firstClear =
    !!stage && won && !profile.campaign.cleared.includes(stageId);
  const bonusGold = firstClear ? stage!.firstClearGold : 0;
  const food = clampCampaignFood(foodLeft);
  const joined =
    firstClear &&
    stage!.joins &&
    !Object.hasOwn(profile.companions, stage!.joins)
      ? stage!.joins
      : undefined;
  const companions = joined
    ? { ...profile.companions, [joined]: autoJoin(stage!.level) }
    : profile.companions;
  const campaign: CampaignState = {
    ...profile.campaign,
    cleared: firstClear
      ? [...profile.campaign.cleared, stageId]
      : profile.campaign.cleared,
    food,
  };
  return {
    profile: {
      ...profile,
      gold: profile.gold + bonusGold,
      companions,
      campaign,
    },
    result: { firstClear, bonusGold, food, ...(joined ? { joined } : {}) },
  };
}
