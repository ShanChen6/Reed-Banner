import type { Difficulty } from "../ai";

/** Public IDs are frozen by docs/02-game-modes/campaign/design-freeze.md. */
export const CAMPAIGN_MISSION_IDS = [
  "M01",
  "M02",
  "M03",
  "M04",
  "M05",
  "M06",
  "M07",
  "M08",
  "M09",
  "M10",
  "M11",
  "M12",
  "M13",
  "M14",
  "M15",
  "M16",
  "M17",
  "M18",
  "M19",
  "M20",
  "M21",
  "M22",
  "M23",
  "M24",
] as const;

export type CampaignMissionId = (typeof CAMPAIGN_MISSION_IDS)[number];
export type CampaignChapter = 1 | 2 | 3 | 4 | 5 | 6;

export const HISTORICAL_REFERENCE_IDS = [
  "E01",
  "E02",
  "E03",
  "E04",
  "E04a",
  "E06",
  "E07",
  "E08",
  "E09",
  "E10",
  "E11",
  "E12",
  "E13",
  "S01",
  "S02",
  "S03",
  "S04",
  "S05",
  "S06",
  "S07",
  "S08",
  "U01",
  "U02",
  "U03",
  "U04",
  "U06",
  "U07",
  "W01",
  "W02",
  "W03",
  "W04",
  "W05",
  "W06",
  "W07",
  "W08",
  "W09",
  "W10",
  "W11",
  "W12",
] as const;

export type HistoricalReferenceId =
  (typeof HISTORICAL_REFERENCE_IDS)[number];
export type HistoricalBasis =
  | "recorded"
  | "legend"
  | "reconstructed"
  | "fictional"
  | "disputed";

export interface StoryLocation {
  readonly name: string;
  readonly modernRegion?: string;
  readonly certainty: "recorded" | "traditional" | "disputed" | "fictional";
}

/** Campaign rewards deliberately have no stone or gear field. */
export interface StoryNodeReward {
  readonly firstClearGold: number;
}

export type CampaignCompanionId =
  | "dinhLien"
  | "nguyenBac"
  | "dinhDien"
  | "luuCo"
  | "trinhTu"
  | "leHoan";

export type RaidTargetId =
  | "tranLam"
  | "phamBachHo"
  | "ngoXuongXi"
  | "ngoNhatKhanh"
  | "nguyenKhoan"
  | "kieuCongHan"
  | "kieuThuan"
  | "lyKhue"
  | "nguyenThuTiep"
  | "luDuong"
  | "nguyenSieu"
  | "doCanhThac";

export type UnlockedContent =
  | { readonly kind: "companion"; readonly id: CampaignCompanionId }
  | { readonly kind: "raid"; readonly target: RaidTargetId };

export interface BattleScenario {
  readonly id: string;
  /** Resolves to encounter content in a later Campaign battle-content task. */
  readonly encounterKey: string;
  readonly mode: "1v1" | "3v3";
  readonly difficulty: Difficulty;
  readonly objective:
    | "defeatEnemies"
    | "surviveTurns"
    | "breakSiege"
    | "bossPhases";
}

export interface BossBattleScenario extends BattleScenario {
  readonly bossTarget: RaidTargetId;
}

interface StoryNodeBase {
  readonly id: CampaignMissionId;
  readonly slug: string;
  readonly title: string;
  readonly chapter: CampaignChapter;
  readonly historicalBasis: readonly HistoricalBasis[];
  readonly references: readonly HistoricalReferenceId[];
  readonly location: StoryLocation;
  readonly prereqs: readonly CampaignMissionId[];
  readonly rewards: StoryNodeReward;
  readonly unlockedContent: readonly UnlockedContent[];
}

interface NonCombatStoryNode extends StoryNodeBase {
  readonly scenario?: never;
}

export interface StoryEventNode extends NonCombatStoryNode {
  readonly type: "story";
}

export interface DiplomacyNode extends NonCombatStoryNode {
  readonly type: "diplomacy";
}

export interface PreparationNode extends NonCombatStoryNode {
  readonly type: "preparation";
}

interface CombatStoryNode extends StoryNodeBase {
  readonly scenario: BattleScenario;
}

export interface BattleNode extends CombatStoryNode {
  readonly type: "battle";
}

export interface DefenseNode extends CombatStoryNode {
  readonly type: "defense";
}

export interface SiegeNode extends CombatStoryNode {
  readonly type: "siege";
}

export interface BossNode extends StoryNodeBase {
  readonly type: "boss";
  readonly scenario: BossBattleScenario;
}

export type StoryNode =
  | StoryEventNode
  | DiplomacyNode
  | PreparationNode
  | BattleNode
  | DefenseNode
  | SiegeNode
  | BossNode;

const location = (
  name: string,
  modernRegion: string | undefined,
  certainty: StoryLocation["certainty"],
): StoryLocation => ({
  name,
  ...(modernRegion ? { modernRegion } : {}),
  certainty,
});

const reward = (firstClearGold: number): StoryNodeReward => ({
  firstClearGold,
});

const scenario = (
  id: CampaignMissionId,
  encounterKey: string,
  difficulty: Difficulty,
  mode: BattleScenario["mode"] = "3v3",
  objective: BattleScenario["objective"] = "defeatEnemies",
): BattleScenario => ({
  id: `${id}-battle`,
  encounterKey,
  mode,
  difficulty,
  objective,
});

const bossScenario = (
  id: CampaignMissionId,
  encounterKey: string,
  bossTarget: RaidTargetId,
  difficulty: Difficulty,
): BossBattleScenario => ({
  ...scenario(id, encounterKey, difficulty, "3v3", "bossPhases"),
  bossTarget,
});

/**
 * Canonical Campaign V2 content registry. Narrative copy remains in the
 * narrative bible/mission matrix; this registry owns runtime identity,
 * progression metadata and the boundary to battle content.
 */
export const STORY_NODES = [
  {
    id: "M01",
    slug: "co-lau-trong-ky-uc",
    title: "Cờ lau trong ký ức",
    chapter: 1,
    type: "story",
    historicalBasis: ["legend"],
    references: ["E12", "S04", "S07"],
    location: location("Hoa Lư", "Ninh Bình", "traditional"),
    prereqs: [],
    rewards: reward(50),
    unlockedContent: [],
  },
  {
    id: "M02",
    slug: "sau-trieu-ngo-quyen",
    title: "Sau triều Ngô Quyền",
    chapter: 1,
    type: "story",
    historicalBasis: ["recorded", "reconstructed"],
    references: ["E01", "E02", "E03", "S03", "S05"],
    location: location("Hoa Lư", "Ninh Bình", "traditional"),
    prereqs: ["M01"],
    rewards: reward(50),
    unlockedContent: [],
  },
  {
    id: "M03",
    slug: "giu-loi-vao-hoa-lu",
    title: "Giữ lối vào Hoa Lư",
    chapter: 1,
    type: "defense",
    historicalBasis: ["fictional"],
    references: ["E04"],
    location: location("Hoa Lư", "Ninh Bình", "traditional"),
    prereqs: ["M02"],
    rewards: reward(250),
    unlockedContent: [],
    scenario: scenario(
      "M03",
      "hoa-lu-approach",
      "easy",
      "1v1",
      "surviveTurns",
    ),
  },
  {
    id: "M04",
    slug: "hoa-lu-nam-951",
    title: "Hoa Lư, năm 951",
    chapter: 1,
    type: "defense",
    historicalBasis: ["recorded", "reconstructed"],
    references: ["E04", "E04a", "S02", "S04"],
    location: location("Hoa Lư", "Ninh Bình", "recorded"),
    prereqs: ["M03"],
    rewards: reward(250),
    unlockedContent: [{ kind: "companion", id: "dinhLien" }],
    scenario: scenario(
      "M04",
      "hoa-lu-951",
      "normal",
      "3v3",
      "surviveTurns",
    ),
  },
  {
    id: "M05",
    slug: "duong-ra-bo-hai",
    title: "Đường ra Bố Hải",
    chapter: 2,
    type: "preparation",
    historicalBasis: ["recorded", "reconstructed", "disputed"],
    references: ["E08", "U02", "S01"],
    location: location("Bố Hải Khẩu", "Thái Bình", "traditional"),
    prereqs: ["M04"],
    rewards: reward(75),
    unlockedContent: [],
  },
  {
    id: "M06",
    slug: "hoi-kien-tran-minh-cong",
    title: "Hội kiến Trần Minh Công",
    chapter: 2,
    type: "diplomacy",
    historicalBasis: ["recorded", "fictional"],
    references: ["E08", "W01", "S01", "U02"],
    location: location("Bố Hải Khẩu", "Thái Bình", "traditional"),
    prereqs: ["M05"],
    rewards: reward(150),
    unlockedContent: [],
  },
  {
    id: "M07",
    slug: "hai-doi-mot-co-hieu",
    title: "Hai đội một cờ hiệu",
    chapter: 2,
    type: "battle",
    historicalBasis: ["fictional"],
    references: ["E08"],
    location: location("Vùng Bố Hải", "Thái Bình", "fictional"),
    prereqs: ["M06"],
    rewards: reward(250),
    unlockedContent: [],
    // CAMP-09.02: AI Dễ cho trận đánh thật đầu tiên (balance-report.md).
    scenario: scenario("M07", "bo-hai-joint-operation", "easy"),
  },
  {
    id: "M08",
    slug: "ganh-quan-bo-hai",
    title: "Gánh quân Bố Hải",
    chapter: 2,
    type: "story",
    historicalBasis: ["recorded", "reconstructed", "disputed"],
    references: ["E08", "S01", "U02", "W01"],
    location: location("Bố Hải Khẩu", "Thái Bình", "traditional"),
    prereqs: ["M07"],
    rewards: reward(50),
    unlockedContent: [
      { kind: "companion", id: "nguyenBac" },
      { kind: "raid", target: "tranLam" },
    ],
  },
  {
    id: "M09",
    slug: "tin-du-nam-965",
    title: "Tin dữ năm 965",
    chapter: 3,
    type: "story",
    historicalBasis: ["recorded", "reconstructed"],
    references: ["E06", "S02"],
    location: location("Hoa Lư", "Ninh Bình", "traditional"),
    prereqs: ["M08"],
    rewards: reward(50),
    unlockedContent: [],
  },
  {
    id: "M10",
    slug: "ban-do-khong-co-thu-tu",
    title: "Bản đồ không có thứ tự",
    chapter: 3,
    type: "preparation",
    historicalBasis: ["recorded", "reconstructed", "disputed"],
    references: ["E07", "U01", "U07"],
    location: location("Hoa Lư", "Ninh Bình", "traditional"),
    prereqs: ["M09"],
    rewards: reward(50),
    unlockedContent: [],
  },
  {
    id: "M11",
    slug: "dang-chau-quy-phuc",
    title: "Đằng Châu quy phục",
    chapter: 3,
    type: "diplomacy",
    historicalBasis: ["recorded", "fictional"],
    references: ["E09", "S01", "W02"],
    location: location("Đằng Châu", "Hưng Yên", "recorded"),
    prereqs: ["M10"],
    rewards: reward(150),
    unlockedContent: [{ kind: "raid", target: "phamBachHo" }],
  },
  {
    id: "M12",
    slug: "binh-kieu-tu-dinh",
    title: "Bình Kiều tự định",
    chapter: 3,
    type: "diplomacy",
    historicalBasis: ["recorded", "reconstructed", "disputed"],
    references: ["S06", "S07", "U03", "W03"],
    location: location("Bình Kiều", undefined, "disputed"),
    prereqs: ["M11"],
    rewards: reward(150),
    unlockedContent: [
      { kind: "companion", id: "dinhDien" },
      { kind: "raid", target: "ngoXuongXi" },
    ],
  },
  {
    id: "M13",
    slug: "duong-lam-va-loi-cam-ket",
    title: "Đường Lâm và lời cam kết",
    chapter: 4,
    type: "diplomacy",
    historicalBasis: ["recorded", "reconstructed", "disputed"],
    references: ["S01", "S06", "U04", "W04"],
    location: location("Đường Lâm", "Sơn Tây, Hà Nội", "disputed"),
    prereqs: ["M12"],
    rewards: reward(150),
    unlockedContent: [{ kind: "raid", target: "ngoNhatKhanh" }],
  },
  {
    id: "M14",
    slug: "tam-dai-roi-thanh",
    title: "Tam Đái rời thành",
    chapter: 4,
    type: "preparation",
    historicalBasis: ["recorded", "reconstructed", "disputed"],
    references: ["S07", "U06", "W05", "S01"],
    location: location("Tam Đái", "Vĩnh Phúc", "traditional"),
    prereqs: ["M13"],
    rewards: reward(150),
    unlockedContent: [{ kind: "raid", target: "nguyenKhoan" }],
  },
  {
    id: "M15",
    slug: "phong-chau",
    title: "Phong Châu",
    chapter: 4,
    type: "boss",
    historicalBasis: ["recorded", "reconstructed"],
    references: ["S06", "U07", "W06", "S01"],
    location: location("Phong Châu", "Phú Thọ", "recorded"),
    prereqs: ["M14"],
    rewards: reward(250),
    unlockedContent: [{ kind: "raid", target: "kieuCongHan" }],
    scenario: bossScenario("M15", "phong-chau", "kieuCongHan", "hard"),
  },
  {
    id: "M16",
    slug: "hoi-ho",
    title: "Hồi Hồ",
    chapter: 4,
    type: "boss",
    historicalBasis: ["recorded", "reconstructed", "fictional"],
    references: ["S06", "U07", "W07", "S01"],
    location: location("Hồi Hồ", "Phú Thọ", "recorded"),
    prereqs: ["M15"],
    rewards: reward(250),
    unlockedContent: [
      { kind: "companion", id: "luuCo" },
      { kind: "raid", target: "kieuThuan" },
    ],
    scenario: bossScenario("M16", "hoi-ho", "kieuThuan", "hard"),
  },
  {
    id: "M17",
    slug: "sieu-loai",
    title: "Siêu Loại",
    chapter: 5,
    type: "boss",
    historicalBasis: ["recorded", "reconstructed", "disputed"],
    references: ["S06", "U07", "W08", "S01"],
    location: location("Siêu Loại", "Bắc Ninh", "recorded"),
    prereqs: ["M12"],
    rewards: reward(250),
    unlockedContent: [{ kind: "raid", target: "lyKhue" }],
    scenario: bossScenario("M17", "sieu-loai", "lyKhue", "hard"),
  },
  {
    id: "M18",
    slug: "tien-du",
    title: "Tiên Du",
    chapter: 5,
    type: "boss",
    historicalBasis: ["recorded", "reconstructed"],
    references: ["S06", "U07", "W09", "S01"],
    location: location("Tiên Du", "Bắc Ninh", "recorded"),
    prereqs: ["M17"],
    rewards: reward(250),
    unlockedContent: [{ kind: "raid", target: "nguyenThuTiep" }],
    scenario: bossScenario("M18", "tien-du", "nguyenThuTiep", "hard"),
  },
  {
    id: "M19",
    slug: "te-giang-mo-duong",
    title: "Tế Giang mở đường",
    chapter: 5,
    type: "diplomacy",
    historicalBasis: ["recorded", "reconstructed", "disputed"],
    references: ["S07", "U06", "W10", "S01", "S05"],
    location: location("Tế Giang", "Hưng Yên", "recorded"),
    prereqs: ["M18"],
    rewards: reward(150),
    unlockedContent: [{ kind: "raid", target: "luDuong" }],
  },
  {
    id: "M20",
    slug: "tay-phu-liet",
    title: "Tây Phù Liệt",
    chapter: 5,
    type: "siege",
    historicalBasis: ["recorded", "reconstructed", "disputed", "fictional"],
    references: ["S06", "U07", "W11", "S01"],
    location: location("Tây Phù Liệt", "Hà Nội", "recorded"),
    prereqs: ["M19"],
    rewards: reward(250),
    unlockedContent: [
      { kind: "companion", id: "trinhTu" },
      { kind: "raid", target: "nguyenSieu" },
    ],
    scenario: scenario(
      "M20",
      "tay-phu-liet",
      "hard",
      "3v3",
      "breakSiege",
    ),
  },
  {
    id: "M21",
    slug: "do-dong",
    title: "Đỗ Động",
    chapter: 6,
    type: "boss",
    historicalBasis: ["recorded", "reconstructed", "disputed", "fictional"],
    references: ["S04", "S06", "U07", "W12", "S01"],
    location: location("Đỗ Động Giang", "Hà Nội", "recorded"),
    prereqs: ["M16", "M20"],
    rewards: reward(250),
    unlockedContent: [{ kind: "raid", target: "doCanhThac" }],
    scenario: bossScenario("M21", "do-dong", "doCanhThac", "boss"),
  },
  {
    id: "M22",
    // Slug giữ nguyên để ID ổn định (storyNodes test khóa slug); tên hiển thị đổi theo freeze 1.1.
    slug: "sau-tieng-trong-tran",
    title: "Giang Sơn Một Mối",
    chapter: 6,
    // CAMP-07.01 (freeze amendment): sự kiện tổng kết 12 vùng, không phải trận; không thêm đối thủ lịch sử.
    type: "story",
    historicalBasis: ["recorded", "reconstructed", "fictional", "disputed"],
    references: ["E10", "E13", "S06"],
    location: location("Các vùng đã về một mối", undefined, "fictional"),
    prereqs: ["M21"],
    rewards: reward(150),
    unlockedContent: [],
  },
  {
    id: "M23",
    slug: "hoi-quan-hoa-lu",
    // CAMP-07.02: tên hiển thị theo task (freeze 1.1); vẫn là cảnh hội quân/council, không có trận.
    title: "Kiến thiết kinh đô Hoa Lư",
    chapter: 6,
    type: "preparation",
    historicalBasis: ["recorded", "reconstructed", "fictional"],
    references: ["E10", "S04", "S08"],
    location: location("Hoa Lư", "Ninh Bình", "recorded"),
    prereqs: ["M22"],
    rewards: reward(50),
    unlockedContent: [],
  },
  {
    id: "M24",
    slug: "dai-co-viet-968",
    // CAMP-07.03: tên hiển thị theo task (freeze 1.1); slug giữ để ID ổn định.
    title: "Đại Lễ Đăng Quang năm 968",
    chapter: 6,
    type: "story",
    historicalBasis: ["recorded", "reconstructed", "fictional"],
    references: ["E10", "E11", "S04", "S08"],
    location: location("Hoa Lư", "Ninh Bình", "recorded"),
    prereqs: ["M23"],
    rewards: reward(300),
    unlockedContent: [{ kind: "companion", id: "leHoan" }],
  },
] as const satisfies readonly StoryNode[];

const MISSION_ID_SET = new Set<string>(CAMPAIGN_MISSION_IDS);
const HISTORICAL_REFERENCE_SET = new Set<string>(HISTORICAL_REFERENCE_IDS);
const RAID_TARGET_SET = new Set<string>([
  "tranLam",
  "phamBachHo",
  "ngoXuongXi",
  "ngoNhatKhanh",
  "nguyenKhoan",
  "kieuCongHan",
  "kieuThuan",
  "lyKhue",
  "nguyenThuTiep",
  "luDuong",
  "nguyenSieu",
  "doCanhThac",
] satisfies readonly RaidTargetId[]);
const COMPANION_SET = new Set<string>([
  "dinhLien",
  "nguyenBac",
  "dinhDien",
  "luuCo",
  "trinhTu",
  "leHoan",
] satisfies readonly CampaignCompanionId[]);

export function isCampaignMissionId(value: string): value is CampaignMissionId {
  return MISSION_ID_SET.has(value);
}

export function isCombatStoryNode(
  node: StoryNode,
): node is BattleNode | DefenseNode | SiegeNode | BossNode {
  return ["battle", "defense", "siege", "boss"].includes(node.type);
}

export function storyNodeById(id: string): StoryNode | undefined {
  return STORY_NODES.find((node) => node.id === id);
}

/** Returns every contract violation so tooling can report a complete content diff. */
export function validateStoryNodeRegistry(
  nodes: readonly StoryNode[],
): readonly string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const scenarioIds = new Set<string>();
  const unlockedCompanions = new Set<string>();
  const unlockedRaids = new Set<string>();

  if (nodes.length !== CAMPAIGN_MISSION_IDS.length)
    errors.push(`expected 24 nodes, received ${nodes.length}`);

  for (const node of nodes) {
    if (!/^M(?:0[1-9]|1[0-9]|2[0-4])$/.test(node.id))
      errors.push(`${node.id}: invalid mission ID`);
    if (ids.has(node.id)) errors.push(`${node.id}: duplicate mission ID`);
    ids.add(node.id);

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(node.slug))
      errors.push(`${node.id}: invalid slug ${node.slug}`);
    if (slugs.has(node.slug)) errors.push(`${node.id}: duplicate slug`);
    slugs.add(node.slug);

    if (node.historicalBasis.length === 0)
      errors.push(`${node.id}: missing historical basis`);
    if (node.references.length === 0)
      errors.push(`${node.id}: missing historical references`);
    for (const reference of node.references)
      if (!HISTORICAL_REFERENCE_SET.has(reference))
        errors.push(`${node.id}: unknown historical reference ${reference}`);
    for (const prereq of node.prereqs) {
      if (!MISSION_ID_SET.has(prereq))
        errors.push(`${node.id}: unknown prerequisite ${prereq}`);
      if (prereq === node.id)
        errors.push(`${node.id}: mission cannot require itself`);
    }

    if (!Number.isSafeInteger(node.rewards.firstClearGold) || node.rewards.firstClearGold < 0)
      errors.push(`${node.id}: invalid first-clear gold`);

    if (isCombatStoryNode(node)) {
      if (scenarioIds.has(node.scenario.id))
        errors.push(`${node.id}: duplicate battle scenario ID`);
      scenarioIds.add(node.scenario.id);
      if (node.scenario.id !== `${node.id}-battle`)
        errors.push(`${node.id}: unstable battle scenario ID`);
      if (node.type === "boss" && !RAID_TARGET_SET.has(node.scenario.bossTarget))
        errors.push(`${node.id}: unknown boss target ${node.scenario.bossTarget}`);
    } else if ("scenario" in node)
      errors.push(`${node.id}: non-combat node must not contain a scenario`);

    for (const unlock of node.unlockedContent) {
      if (unlock.kind === "raid") {
        if (!RAID_TARGET_SET.has(unlock.target))
          errors.push(`${node.id}: unknown raid target ${unlock.target}`);
        if (unlockedRaids.has(unlock.target))
          errors.push(`${node.id}: duplicate raid unlock ${unlock.target}`);
        unlockedRaids.add(unlock.target);
      } else {
        if (!COMPANION_SET.has(unlock.id))
          errors.push(`${node.id}: unknown companion unlock ${unlock.id}`);
        if (unlockedCompanions.has(unlock.id))
          errors.push(`${node.id}: duplicate companion unlock ${unlock.id}`);
        unlockedCompanions.add(unlock.id);
      }
    }
  }

  for (const id of CAMPAIGN_MISSION_IDS)
    if (!ids.has(id)) errors.push(`${id}: missing canonical mission`);
  for (let chapter = 1; chapter <= 6; chapter += 1)
    if (nodes.filter((node) => node.chapter === chapter).length !== 4)
      errors.push(`chapter ${chapter}: expected 4 nodes`);

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const visit = (id: string): void => {
    if (visiting.has(id)) {
      errors.push(`${id}: prerequisite cycle`);
      return;
    }
    if (visited.has(id)) return;
    const node = byId.get(id as CampaignMissionId);
    if (!node) return;
    visiting.add(id);
    for (const prereq of node.prereqs) visit(prereq);
    visiting.delete(id);
    visited.add(id);
  };
  for (const node of nodes) visit(node.id);

  return errors;
}

const STORY_NODE_ERRORS = validateStoryNodeRegistry(STORY_NODES);
if (STORY_NODE_ERRORS.length > 0)
  throw new Error(`Invalid Campaign V2 registry: ${STORY_NODE_ERRORS.join("; ")}`);
