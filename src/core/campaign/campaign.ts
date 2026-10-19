// Chiến dịch chương 1 "Cờ lau dẹp loạn": Đinh Bộ Lĩnh từ thuở chăn trâu ở Hoa Lư tới khi dẹp xong 12 sứ quân.
// Thứ tự màn, lời dẫn và số liệu là điểm xuất phát do Claude đặt, chờ Shan duyệt. Xem docs/design/09-che-do-choi.md.
// Sứ quân là nhân vật lịch sử có bộ 6 kỹ năng theo nguyên tố như Đinh Bộ Lĩnh; tùy tướng đi kèm dùng chiêu theo nghề.

import { BASE_STATS } from "../roster";
import {
  professionSkills,
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
  type CampaignState,
  type Profile,
} from "../progress";

export interface StageFoe {
  readonly id: string;
  readonly name: string;
  readonly element: Element;
  readonly profession: Profession;
  /** Nhân vật lịch sử: bộ 6 kỹ năng theo nguyên tố như nhân vật chính. Tùy tướng: chiêu theo nghề. */
  readonly hero: boolean;
}

export interface CampaignStage {
  readonly id: string;
  readonly title: string;
  /** Đất đóng quân của đối thủ. */
  readonly place: string;
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
  /** Vàng thưởng thêm lần đầu qua màn. */
  readonly firstClearGold: number;
}

/** Trùm có thêm chừng này lần máu. */
export const BOSS_HP = 1.5;

const hero = (
  id: string,
  name: string,
  element: Element,
  profession: Profession,
): StageFoe => ({ id, name, element, profession, hero: true });
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
    story:
      "Thuở chăn trâu ở động Hoa Lư, cậu bé Bộ Lĩnh lấy bông lau làm cờ, bày trận đánh nhau với trẻ chăn trâu xóm bên.",
    mode: "1v1",
    difficulty: "easy",
    level: 1,
    foes: [aide("coLau-tre", "Trẻ chăn trâu xóm bên", "tho", "binhLinh")],
    firstClearGold: 100,
  },
  {
    id: "boHai",
    title: "Thử tài ở Bố Hải Khẩu",
    place: "Bố Hải Khẩu",
    story:
      "Nghe tiếng sứ quân Trần Lãm, Bộ Lĩnh tìm đến đầu quân. Trần Minh Công muốn thử tài người trẻ trước khi giao binh quyền.",
    mode: "1v1",
    difficulty: "easy",
    level: 2,
    foes: [hero("tranLam", "Trần Lãm", "thuy", "quanSu")],
    firstClearGold: 150,
  },
  {
    id: "dangChau",
    title: "Thu phục Đằng Châu",
    place: "Đằng Châu",
    story:
      "Phạm Bạch Hổ giữ Đằng Châu. Muốn ông quy phục, phải thắng ông một trận cho phục.",
    mode: "1v1",
    difficulty: "normal",
    level: 3,
    foes: [hero("phamBachHo", "Phạm Bạch Hổ", "hoa", "tuongSi")],
    firstClearGold: 200,
  },
  {
    id: "binhKieu",
    title: "Đánh Bình Kiều",
    place: "Bình Kiều",
    story:
      "Ngô Xương Xí, cháu Ngô Quyền, giữ Bình Kiều. Quân Hoa Lư lần đầu ra trận đủ ba tướng.",
    mode: "3v3",
    difficulty: "normal",
    level: 5,
    foes: [
      hero("ngoXuongXi", "Ngô Xương Xí", "kim", "muuSi"),
      aide("binhKieu-pho", "Phó tướng Bình Kiều", "kim", "binhLinh"),
      aide("binhKieu-y", "Lang y Bình Kiều", "thuy", "ySu"),
    ],
    firstClearGold: 250,
  },
  {
    id: "duongLam",
    title: "Đường Lâm quy phục",
    place: "Đường Lâm",
    story:
      "Ngô Nhật Khánh, dòng dõi nhà Ngô, đóng ở Đường Lâm. Ông chỉ chịu hàng khi thấy quân Hoa Lư đủ mạnh.",
    mode: "3v3",
    difficulty: "normal",
    level: 6,
    foes: [
      hero("ngoNhatKhanh", "Ngô Nhật Khánh", "phong", "quanSu"),
      aide("duongLam-pho", "Phó tướng Đường Lâm", "tho", "tuongSi"),
      aide("duongLam-y", "Lang y Đường Lâm", "moc", "ySu"),
    ],
    firstClearGold: 300,
  },
  {
    id: "tamDai",
    title: "Vây thành Tam Đái",
    place: "Tam Đái",
    story:
      "Nguyễn Khoan cố thủ Tam Đái. Thành bị vây đã lâu, kho lương bên trong cạn dần.",
    mode: "3v3",
    difficulty: "normal",
    level: 8,
    foes: [
      hero("nguyenKhoan", "Nguyễn Khoan", "tho", "binhLinh"),
      aide("tamDai-pho", "Phó tướng Tam Đái", "tho", "binhLinh"),
      aide("tamDai-phap", "Thầy pháp Tam Đái", "hoa", "phapSu"),
    ],
    foeFood: 25,
    rule: "Thành bị vây: đối thủ vào trận chỉ có 25 lương.",
    firstClearGold: 350,
  },
  {
    id: "phongChau",
    title: "Lên Phong Châu",
    place: "Phong Châu",
    story:
      "Kiều Công Hãn giữ Phong Châu, đất cũ của các vua Hùng, nơi dân quen nghề binh.",
    mode: "3v3",
    difficulty: "normal",
    level: 10,
    foes: [
      hero("kieuCongHan", "Kiều Công Hãn", "loi", "phapSu"),
      aide("phongChau-pho", "Phó tướng Phong Châu", "kim", "tuongSi"),
      aide("phongChau-muu", "Mưu thần Phong Châu", "phong", "muuSi"),
    ],
    firstClearGold: 400,
  },
  {
    id: "hoiHo",
    title: "Qua đầm Hồi Hồ",
    place: "Hồi Hồ",
    story:
      "Kiều Thuận đóng ở Hồi Hồ, ba mặt là đầm. Quân Hoa Lư phải lội nước mà đánh.",
    mode: "3v3",
    difficulty: "hard",
    level: 12,
    foes: [
      hero("kieuThuan", "Kiều Thuận", "moc", "ySu"),
      aide("hoiHo-pho", "Phó tướng Hồi Hồ", "thuy", "binhLinh"),
      aide("hoiHo-phap", "Thầy pháp Hồi Hồ", "moc", "phapSu"),
    ],
    weights: RIVER,
    rule: "Đầm lầy: ít ô bánh chưng, nhiều ô âm dương.",
    firstClearGold: 450,
  },
  {
    id: "sieuLoai",
    title: "Đánh Siêu Loại",
    place: "Siêu Loại",
    story:
      "Lý Khuê giữ Siêu Loại, vùng đất có chùa chiền và người tài. Quân ông thiện chiến, ít khi lùi.",
    mode: "3v3",
    difficulty: "hard",
    level: 14,
    foes: [
      hero("lyKhue", "Lý Khuê", "kim", "tuongSi"),
      aide("sieuLoai-pho", "Phó tướng Siêu Loại", "kim", "binhLinh"),
      aide("sieuLoai-quan", "Quân sư Siêu Loại", "tho", "quanSu"),
    ],
    firstClearGold: 500,
  },
  {
    id: "tienDu",
    title: "Hạ Tiên Du",
    place: "Tiên Du",
    story: "Nguyễn Thủ Tiệp xưng Vũ Ninh Vương ở Tiên Du, quân đông lương đủ.",
    mode: "3v3",
    difficulty: "hard",
    level: 16,
    foes: [
      hero("nguyenThuTiep", "Nguyễn Thủ Tiệp", "thuy", "muuSi"),
      aide("tienDu-pho", "Phó tướng Tiên Du", "thuy", "tuongSi"),
      aide("tienDu-y", "Lang y Tiên Du", "moc", "ySu"),
    ],
    foeFood: 100,
    rule: "Kho lương đầy: đối thủ vào trận với 100 lương.",
    firstClearGold: 550,
  },
  {
    id: "teGiang",
    title: "Thủy chiến Tế Giang",
    place: "Tế Giang",
    story: "Lã Đường giữ Tế Giang bên bờ sông, quân quen đánh trên nước.",
    mode: "3v3",
    difficulty: "hard",
    level: 18,
    foes: [
      hero("laDuong", "Lã Đường", "thuy", "phapSu"),
      aide("teGiang-pho", "Phó tướng Tế Giang", "thuy", "binhLinh"),
      aide("teGiang-quan", "Quân sư Tế Giang", "phong", "quanSu"),
    ],
    weights: RIVER,
    rule: "Sông nước: ít ô bánh chưng, nhiều ô âm dương.",
    firstClearGold: 600,
  },
  {
    id: "tayPhuLiet",
    title: "Tây Phù Liệt",
    place: "Tây Phù Liệt",
    story:
      "Nguyễn Siêu đóng ở Tây Phù Liệt, đắp thành hai lớp, quân hơn vạn người.",
    mode: "3v3",
    difficulty: "hard",
    level: 20,
    foes: [
      hero("nguyenSieu", "Nguyễn Siêu", "hoa", "binhLinh"),
      aide("tayPhuLiet-pho", "Phó tướng Tây Phù Liệt", "hoa", "tuongSi"),
      aide("tayPhuLiet-muu", "Mưu thần Tây Phù Liệt", "loi", "muuSi"),
    ],
    firstClearGold: 700,
  },
  {
    id: "doDong",
    title: "Thành Đỗ Động",
    place: "Đỗ Động Giang",
    story:
      "Đỗ Cảnh Thạc là sứ quân cứng cỏi nhất, giữ thành Đỗ Động hơn một năm. Hạ được ông, loạn 12 sứ quân chấm dứt.",
    mode: "3v3",
    difficulty: "boss",
    level: 22,
    boss: true,
    foes: [
      hero("doCanhThac", "Đỗ Cảnh Thạc", "tho", "tuongSi"),
      aide("doDong-pho", "Phó tướng Đỗ Động", "kim", "binhLinh"),
      aide("doDong-quan", "Quân sư Đỗ Động", "thuy", "quanSu"),
    ],
    foeFood: 100,
    rule: "Trùm cuối: Đỗ Cảnh Thạc thêm 50% máu, thành có lương đầy.",
    firstClearGold: 1000,
  },
];

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
    );
    return { ...kit, id: foe.id, name: foe.name };
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
  const campaign: CampaignState = {
    cleared: firstClear
      ? [...profile.campaign.cleared, stageId]
      : profile.campaign.cleared,
    food,
  };
  return {
    profile: { ...profile, gold: profile.gold + bonusGold, campaign },
    result: { firstClear, bonusGold, food },
  };
}
