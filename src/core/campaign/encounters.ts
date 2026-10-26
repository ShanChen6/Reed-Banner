// Nội dung trận của Campaign V2: đối thủ, cấp và lời khuyên trước trận cho từng nhiệm vụ có trận đánh.
// Chỉ khai báo những nhiệm vụ đã có nội dung; nhiệm vụ chưa có encounter thì server từ chối tạo trận.
// Luật trận, AI và chỉ số vẫn thuộc Battle Engine: ở đây chỉ chọn ai ra trận và ở cấp nào.

import type { FighterConfig } from "../battle";
import { ELEMENTS, elementRelation, type Element } from "../battle/elements";
import { FOOD_MAX, FOOD_UPKEEP, FOOD_UPKEEP_BINH_LINH } from "../battle/rules";
import type { Profile } from "../progress/profile";
import { CAMPAIGN_FOOD_MAX } from "../progress/campaignState";
import { encounterFighter, type EncounterFoe } from "./warlords";
import { campaignPhaseTurns, campaignScenarioByNode } from "./scenarios";
import {
  isCombatStoryNode,
  storyNodeById,
  type BattleScenario,
  type CampaignMissionId,
} from "./storyNodes";

export interface CampaignEncounter {
  readonly nodeId: CampaignMissionId;
  /**
   * Phải trùng `encounterKey` của một phase trong kế hoạch scenario: thường là `BattleScenario.encounterKey`,
   * công thành có một encounter cho mỗi phase (`<key>-breach`, `<key>-escort`, `<key>-assault`).
   */
  readonly encounterKey: string;
  /** Đối thủ theo thứ tự ra trận; đối thủ đầu là thủ lĩnh của trận. */
  readonly foes: readonly EncounterFoe[];
  readonly level: number;
  /** Cấp gợi ý cho nhân vật chính. Thấp hơn chỉ hiện cảnh báo, không chặn. */
  readonly recommendedLevel: number;
  /** Lương phe đối thủ khi vào trận; bỏ trống là lương mặc định của trận. */
  readonly foeFood?: number;
  /** Số lượt dự trù để tính lương gợi ý, cho trận dài hơn mức mặc định. */
  readonly plannedTurns?: number;
}

/**
 * M03: toán vũ trang vô danh do game sáng tác (mission matrix: `fictional`, không nêu tên triều Ngô hay ngày).
 * Trận mở đầu cho hồ sơ mới: 1vs1, Dễ, đối thủ cấp 1 nên cấp gợi ý cũng là 1.
 */
const ENCOUNTERS: readonly CampaignEncounter[] = [
  {
    nodeId: "M03",
    encounterKey: "hoa-lu-approach",
    foes: [
      {
        id: "hoa-lu-raider-chief",
        name: "Thủ lĩnh vô danh",
        element: "tho",
        profession: "binhLinh",
        hero: false,
      },
    ],
    level: 1,
    recommendedLevel: 1,
  },
  {
    // M04: cuộc tiến quân năm 951 có sử chép (E04, S02); tướng và đội hình là game tái dựng, không mang tên
    // người có thật. Không có hai vua Ngô trên bàn cờ.
    nodeId: "M04",
    encounterKey: "hoa-lu-951",
    foes: [
      {
        id: "ngo-951-field-commander",
        name: "Tướng tiên phong quân Ngô",
        element: "kim",
        profession: "tuongSi",
        hero: false,
      },
      {
        id: "ngo-951-soldier",
        name: "Lính quân Ngô",
        element: "tho",
        profession: "binhLinh",
        hero: false,
      },
      {
        id: "ngo-951-strategist",
        name: "Mưu sĩ quân Ngô",
        element: "thuy",
        profession: "muuSi",
        hero: false,
      },
    ],
    level: 1,
    recommendedLevel: 2,
  },
  /**
   * M07: toán cướp ven biển ghép từ nhiều nhóm vô danh (mission matrix: `fictional`, không mang tên sứ quân
   * hay thế lực có thật). Trần Lãm là đồng minh nên không ra trận ở phe đối thủ. Sim CAMP-05.04: ~50% ở cấp gợi ý.
   * CAMP-09.02: trận đánh thật đầu tiên nên hạ về đối thủ cấp 2, AI Dễ (storyNodes) cho ~66% với đội tướng lịch sử,
   * 58% với đội khởi đầu (docs/02-game-modes/campaign/balance-report.md).
   */
  {
    nodeId: "M07",
    encounterKey: "bo-hai-joint-operation",
    foes: [
      {
        id: "bo-hai-raider-chief",
        name: "Thủ lĩnh toán cướp ven biển",
        element: "thuy",
        profession: "binhLinh",
        hero: false,
      },
      {
        id: "bo-hai-raider-boatman",
        name: "Tay chèo toán cướp",
        element: "moc",
        profession: "tuongSi",
        hero: false,
      },
      {
        id: "bo-hai-raider-scout",
        name: "Kẻ dò đường",
        element: "loi",
        profession: "muuSi",
        hero: false,
      },
    ],
    level: 2,
    recommendedLevel: 3,
  },
  /**
   * M15: Kiều Công Hãn giữ Phong Châu và bị đánh dẹp theo tổng thuật (W06, S06). Hệ và nghề giữ như sứ quân
   * này ở màn cũ và Đánh trùm; hai tùy tướng vô danh do game đặt. Trục tiến quân, đội hình và diễn biến là
   * `reconstructed`. Sim CAMP-05.04 (`pnpm sim -- --mission M15`): ~50–58% ở cấp gợi ý.
   */
  {
    nodeId: "M15",
    encounterKey: "phong-chau",
    foes: [
      {
        id: "kieuCongHan",
        name: "Kiều Công Hãn",
        element: "loi",
        profession: "phapSu",
        hero: true,
        title: "Kiều Tam Chế",
      },
      {
        id: "phong-chau-vanguard",
        name: "Tướng giữ đường Phong Châu",
        element: "tho",
        profession: "binhLinh",
        hero: false,
      },
      {
        id: "phong-chau-strategist",
        name: "Mưu sĩ Phong Châu",
        element: "phong",
        profession: "muuSi",
        hero: false,
      },
    ],
    level: 5,
    recommendedLevel: 6,
  },
  /**
   * M16: Kiều Thuận giữ Hồi Hồ và bị đánh dẹp theo tổng thuật (W07, S06). Bàn đầm lầy là luật game. Hai tùy
   * tướng vô danh do game đặt. Sim CAMP-05.04: cấp gợi ý 8 cho ~55–62%.
   */
  {
    nodeId: "M16",
    encounterKey: "hoi-ho",
    foes: [
      {
        id: "kieuThuan",
        name: "Kiều Thuận",
        element: "moc",
        profession: "ySu",
        hero: true,
        title: "Kiều Lệnh Công",
      },
      {
        id: "hoi-ho-bank-guard",
        name: "Tướng giữ bờ đầm",
        element: "thuy",
        profession: "binhLinh",
        hero: false,
      },
      {
        id: "hoi-ho-ritualist",
        name: "Thầy pháp Hồi Hồ",
        element: "moc",
        profession: "phapSu",
        hero: false,
      },
    ],
    level: 6,
    recommendedLevel: 8,
  },
  /**
   * M17: Lý Khuê giữ Siêu Loại và bị đánh dẹp theo tổng thuật (W08, S06); ai chỉ huy, chết trận hay đầu hàng
   * không rõ (U07). Bàn cờ chuẩn. Hai tùy tướng vô danh. Sim CAMP-05.04: ~70–74%, cấp chênh ít tác dụng; dễ hơn M15 do đội hình.
   */
  {
    nodeId: "M17",
    encounterKey: "sieu-loai",
    foes: [
      {
        id: "lyKhue",
        name: "Lý Khuê",
        element: "kim",
        profession: "tuongSi",
        hero: true,
        title: "Lý Lãng Công",
      },
      {
        id: "sieu-loai-vanguard",
        name: "Phó tướng Siêu Loại",
        element: "kim",
        profession: "binhLinh",
        hero: false,
      },
      {
        id: "sieu-loai-strategist",
        name: "Quân sư Siêu Loại",
        element: "tho",
        profession: "quanSu",
        hero: false,
      },
    ],
    level: 6,
    recommendedLevel: 6,
  },
  /**
   * M18: Nguyễn Thủ Tiệp giữ Tiên Du và bị đánh dẹp theo tổng thuật (W09, S06). Sức ép lương của một lực lượng
   * đông dựng bằng tham số Campaign sẵn có: đối thủ vào trận đầy lương, bàn ít bánh chưng, lương gợi ý tính cho
   * trận dài hơn. "Kho lương đầy" là luật game (`fictional`), không suy từ địa danh. Sim CAMP-05.04: cấp gợi ý 8 cho ~53–54%, không có trận hòa.
   */
  {
    nodeId: "M18",
    encounterKey: "tien-du",
    foes: [
      {
        id: "nguyenThuTiep",
        name: "Nguyễn Thủ Tiệp",
        element: "thuy",
        profession: "muuSi",
        hero: true,
        title: "Nguyễn Lệnh Công",
      },
      {
        id: "tien-du-vanguard",
        name: "Phó tướng Tiên Du",
        element: "thuy",
        profession: "tuongSi",
        hero: false,
      },
      {
        id: "tien-du-healer",
        name: "Lang y Tiên Du",
        element: "moc",
        profession: "ySu",
        hero: false,
      },
    ],
    level: 6,
    recommendedLevel: 8,
    foeFood: 100,
    plannedTurns: 10,
  },
  /**
   * M20: Nguyễn Siêu giữ Tây Phù Liệt và bị đánh dẹp theo tổng thuật (W11, S06). Ba trận nối nhau (Shan chọn gộp
   * nhánh tiếp viện vào M20): phá lũy với toán giữ lũy vô danh, giữ đoàn lương trước toán chặn đường (tình tiết
   * phục vụ gameplay), rồi đối đầu quân của Nguyễn Siêu. Quân số, số lớp lũy, lũy lửa không phải dữ kiện (U07).
   * Lương mang sang giữa các phase qua hồ sơ Campaign. Cấp đặt tạm theo M18, chưa sim.
   */
  {
    nodeId: "M20",
    encounterKey: "tay-phu-liet-breach",
    foes: [
      {
        id: "phu-liet-wall-captain",
        name: "Đội trưởng giữ lũy",
        element: "tho",
        profession: "binhLinh",
        hero: false,
      },
      {
        id: "phu-liet-wall-guard",
        name: "Lính giữ cổng",
        element: "kim",
        profession: "binhLinh",
        hero: false,
      },
      {
        id: "phu-liet-wall-archer",
        name: "Cung thủ trên lũy",
        element: "hoa",
        profession: "phapSu",
        hero: false,
      },
    ],
    level: 6,
    recommendedLevel: 8,
  },
  {
    nodeId: "M20",
    encounterKey: "tay-phu-liet-escort",
    foes: [
      {
        id: "phu-liet-raid-leader",
        name: "Toán trưởng chặn đường",
        element: "phong",
        profession: "tuongSi",
        hero: false,
      },
      {
        id: "phu-liet-raider",
        name: "Quân cướp lương",
        element: "hoa",
        profession: "tuongSi",
        hero: false,
      },
      {
        id: "phu-liet-scout",
        name: "Thám báo",
        element: "loi",
        profession: "muuSi",
        hero: false,
      },
    ],
    level: 6,
    recommendedLevel: 8,
  },
  {
    nodeId: "M20",
    encounterKey: "tay-phu-liet-assault",
    foes: [
      {
        id: "nguyenSieu",
        name: "Nguyễn Siêu",
        element: "hoa",
        profession: "binhLinh",
        hero: true,
        title: "Nguyễn Hữu Công",
      },
      {
        id: "phu-liet-vanguard",
        name: "Phó tướng Tây Phù Liệt",
        element: "hoa",
        profession: "tuongSi",
        hero: false,
      },
      {
        id: "phu-liet-healer",
        name: "Lang y Tây Phù Liệt",
        element: "moc",
        profession: "ySu",
        hero: false,
      },
    ],
    level: 7,
    recommendedLevel: 8,
  },
  /**
   * M21: Đỗ Cảnh Thạc giữ sông Đỗ Động (S01) và bị đánh dẹp (S04, S06, W12). Ba trận: mở đường vây với quân giữ
   * đường vô danh, rồi hai phase trùm. Phase trùm đầu dừng khi máu Đỗ Cảnh Thạc xuống nửa; phase cuối ông vào
   * trận với máu còn lại cùng hai tùy tướng mới. Trận cuối, vây một năm, người hạ đều không phải dữ kiện (U07).
   * CAMP-09.02: phase mở đường hạ cấp 7 → 6 vì là phase khó nhất (38%) dù không có trùm; nay 45–56%, hai phase
   * trùm giữ cấp 8 (docs/02-game-modes/campaign/balance-report.md).
   */
  {
    nodeId: "M21",
    encounterKey: "do-dong-road",
    foes: [
      {
        id: "do-dong-road-captain",
        name: "Đội trưởng giữ đường",
        element: "tho",
        profession: "tuongSi",
        hero: false,
      },
      {
        id: "do-dong-boatman",
        name: "Lính giữ bến",
        element: "thuy",
        profession: "binhLinh",
        hero: false,
      },
      {
        id: "do-dong-lookout",
        name: "Lính canh đầm",
        element: "moc",
        profession: "phapSu",
        hero: false,
      },
    ],
    level: 6,
    recommendedLevel: 9,
  },
  {
    nodeId: "M21",
    encounterKey: "do-dong-boss-1",
    foes: [
      {
        id: "doCanhThac",
        name: "Đỗ Cảnh Thạc",
        element: "tho",
        profession: "tuongSi",
        hero: true,
        title: "Đỗ Cảnh Công",
      },
      {
        id: "do-dong-vanguard",
        name: "Phó tướng Đỗ Động",
        element: "kim",
        profession: "binhLinh",
        hero: false,
      },
      {
        id: "do-dong-strategist",
        name: "Quân sư Đỗ Động",
        element: "thuy",
        profession: "quanSu",
        hero: false,
      },
    ],
    level: 8,
    recommendedLevel: 9,
  },
  {
    nodeId: "M21",
    encounterKey: "do-dong-boss-2",
    foes: [
      {
        id: "doCanhThac",
        name: "Đỗ Cảnh Thạc",
        element: "tho",
        profession: "tuongSi",
        hero: true,
        title: "Đỗ Cảnh Công",
      },
      {
        id: "do-dong-guard",
        name: "Thân binh Đỗ Động",
        element: "hoa",
        profession: "tuongSi",
        hero: false,
      },
      {
        id: "do-dong-healer",
        name: "Lang y Đỗ Động",
        element: "moc",
        profession: "ySu",
        hero: false,
      },
    ],
    level: 8,
    recommendedLevel: 9,
  },
];

/** Encounter của một phase (mặc định phase đầu); undefined khi nhiệm vụ chưa có nội dung trận. */
export function campaignEncounter(
  nodeId: string,
  phaseIndex = 0,
): CampaignEncounter | undefined {
  const key = campaignScenarioByNode(nodeId)?.phases[phaseIndex]?.encounterKey;
  return key === undefined
    ? undefined
    : ENCOUNTERS.find((e) => e.nodeId === nodeId && e.encounterKey === key);
}

export function campaignBattleScenario(
  nodeId: string,
): BattleScenario | undefined {
  const node = storyNodeById(nodeId);
  return node && isCombatStoryNode(node) ? node.scenario : undefined;
}

/** Đối thủ đã dựng ở cấp của encounter; undefined khi nhiệm vụ chưa có nội dung trận. */
export function campaignEncounterFoes(
  nodeId: string,
  phaseIndex = 0,
): FighterConfig[] | undefined {
  const encounter = campaignEncounter(nodeId, phaseIndex);
  if (!encounter) return undefined;
  return encounter.foes.map((foe) => encounterFighter(foe, encounter.level));
}

/** Số lượt người chơi cần cầm cự (phòng thủ, hoặc phase giữ đoàn lương), undefined với mục tiêu khác. */
export function campaignSurviveTurns(
  nodeId: string,
  phaseIndex = 0,
): number | undefined {
  return campaignPhaseTurns(nodeId, phaseIndex);
}

/** Ngưỡng lương giữ tinh thần "bình thường" (moraleOf: từ 30 trở lên). */
const MORALE_NORMAL_FOOD = 30;
/** Lượt dự phòng cho trận phải hạ hết đối thủ (không có số lượt cố định). */
const DEFAULT_PLANNED_TURNS = 6;

export interface CampaignBattleAdvice {
  readonly mode: "1v1" | "3v3";
  readonly recommendedLevel: number;
  readonly playerLevel: number;
  /** Nhân vật chính thấp hơn cấp gợi ý: chỉ cảnh báo, vẫn được xuất quân. */
  readonly underLevel: boolean;
  /** Lương gợi ý để đi hết trận mà tinh thần không tụt xuống đói. */
  readonly suggestedFood: number;
  readonly food: number;
  readonly lowFood: boolean;
  /** Hệ khắc thủ lĩnh đối phương. */
  readonly counterElements: readonly Element[];
  /** Hệ bị thủ lĩnh đối phương khắc. */
  readonly weakElements: readonly Element[];
  readonly leaderElement: Element;
  /** 3vs3: hai người đi kèm đang chọn ở hồ sơ. */
  readonly team: readonly string[];
}

/**
 * Lời khuyên trước trận suy ra từ encounter và hồ sơ. Lương gợi ý = ngưỡng tinh thần bình thường cộng phần
 * ăn mỗi lượt theo luật hiện hành; không đổi luật lương hay giá lương.
 */
export function campaignBattleAdvice(
  profile: Profile,
  nodeId: string,
  phaseIndex = 0,
): CampaignBattleAdvice | undefined {
  const encounter = campaignEncounter(nodeId, phaseIndex);
  const scenario = campaignBattleScenario(nodeId);
  if (!encounter || !scenario) return undefined;
  const leader = encounter.foes[0]!;
  const turns =
    campaignSurviveTurns(nodeId, phaseIndex) ??
    encounter.plannedTurns ??
    DEFAULT_PLANNED_TURNS;
  // Đội có Binh lính ăn ít hơn; lấy mức ăn của nhân vật chính khi đánh 1vs1.
  const upkeep =
    profile.profession === "binhLinh" ? FOOD_UPKEEP_BINH_LINH : FOOD_UPKEEP;
  const suggestedFood = Math.min(
    CAMPAIGN_FOOD_MAX,
    MORALE_NORMAL_FOOD + turns * upkeep,
  );
  const food = profile.campaign.supply;
  return {
    mode: scenario.mode,
    recommendedLevel: encounter.recommendedLevel,
    playerLevel: profile.main.level,
    underLevel: profile.main.level < encounter.recommendedLevel,
    suggestedFood,
    food,
    lowFood: food < suggestedFood,
    counterElements: ELEMENTS.filter(
      (e) => elementRelation(e, leader.element) === "counter",
    ),
    weakElements: ELEMENTS.filter(
      (e) => elementRelation(e, leader.element) === "countered",
    ),
    leaderElement: leader.element,
    team: scenario.mode === "3v3" ? profile.team : [],
  };
}

const ENCOUNTER_ERRORS = ENCOUNTERS.flatMap((encounter) => {
  const scenario = campaignBattleScenario(encounter.nodeId);
  if (!scenario) return [`${encounter.nodeId}: not a battle mission`];
  const phases = campaignScenarioByNode(encounter.nodeId)?.phases ?? [];
  const phase = phases.find((p) => p.encounterKey === encounter.encounterKey);
  if (!phase) return [`${encounter.nodeId}: encounter key mismatch`];
  if (
    ENCOUNTERS.filter(
      (e) =>
        e.nodeId === encounter.nodeId &&
        e.encounterKey === encounter.encounterKey,
    ).length !== 1
  )
    return [`${encounter.nodeId}: duplicate encounter`];
  // Nhiệm vụ nhiều phase phải có đủ encounter cho mọi phase, để server không bị kẹt giữa chừng.
  if (
    phases.some(
      (p) =>
        !ENCOUNTERS.some(
          (e) => e.nodeId === encounter.nodeId && e.encounterKey === p.encounterKey,
        ),
    )
  )
    return [`${encounter.nodeId}: missing phase encounter`];
  const count = scenario.mode === "3v3" ? 3 : 1;
  if (encounter.foes.length !== count)
    return [`${encounter.nodeId}: expected ${count} foes`];
  const objective = phase.objective;
  if (
    objective.type === "surviveTurns" &&
    encounter.foes[0]!.id !== objective.bossFighterId
  )
    return [`${encounter.nodeId}: leader must be the objective boss`];
  if (
    objective.type === "bossPhases" &&
    (encounter.foes[0]!.id !== objective.bossTarget || !encounter.foes[0]!.hero)
  )
    return [`${encounter.nodeId}: leader must be the boss warlord`];
  if (
    encounter.foeFood !== undefined &&
    !(
      Number.isSafeInteger(encounter.foeFood) &&
      encounter.foeFood >= 0 &&
      encounter.foeFood <= FOOD_MAX
    )
  )
    return [`${encounter.nodeId}: invalid foe food`];
  return [];
});
if (ENCOUNTER_ERRORS.length > 0)
  throw new Error(
    `Invalid Campaign encounters: ${ENCOUNTER_ERRORS.join("; ")}`,
  );
