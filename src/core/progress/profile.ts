// Hồ sơ người chơi: tiến trình nhân vật chính và các nhân vật kèm, vàng, lựa chọn trước trận.
// Dữ liệu thuần: /demo lưu ở trình duyệt, /play lưu trên server (bảng `profiles`).

import {isLeaderProfession, normalizeProfession, type Element, type FighterConfig, type Profession} from "../battle";
import { withGear, type GearItem, type GearSlot, type Tier } from "../gear";
import {
  companionById,
  isReleasedCompanion,
  shopPrice,
  STARTER_COMPANIONS,
} from "../roster";
import { warlordUnlockMission } from "../campaign/recruits";
import {
  buyGear,
  equipItem,
  loadoutOf,
  mergeGear,
  parseInventory,
  sellItem,
  unequipItem,
  type GearOrder,
  type InventoryError,
  type SavedLoadout,
} from "./inventory";
import {
  CAMPAIGN_FOOD_MAX,
  FOOD_PRICE,
  NEW_CAMPAIGN,
  parseCampaign,
  type CampaignState,
} from "./campaignState";
import {
  NEW_DUAL_TOWER,
  parseDualTower,
  parseStones,
  type DualTowerState,
} from "./dualTowerState";
import {
  checkIn,
  claimQuest,
  NEW_QUESTS,
  parseQuests,
  type QuestError,
  type QuestState,
} from "./quests";
import { achievementById, achievementProgress } from "./achievements";
import {
  addXp,
  autoProgress,
  buildAide,
  buildCompanion,
  buildMain,
  mainSlotKey,
  NEW_PROGRESS,
  UPGRADE_COST,
  BRANCH_COST,
  upgradeSkill,
  type BattleRewards,
  type CharacterProgress,
  type ProgressError,
} from "./progress";

export const MAIN_ID = "dinhBoLinh";
/** Đội 3vs3 mặc định của hồ sơ mới. */
export const DEFAULT_TEAM: readonly string[] = ["haVan", "maiThanh"];

export interface Profile {
  readonly version: 1;
  readonly skillLayout: 2;
  readonly element: Element;
  readonly profession: Profession;
  /** Preserve unsupported historical leader choice without inventing a new DBL kit. */
  readonly unavailableLeaderProfession?: Profession;
  readonly main: CharacterProgress;
  /** Nhân vật kèm đã có (khởi đầu và mua ở cửa hàng), theo id. */
  readonly companions: Readonly<Record<string, CharacterProgress>>;
  /** 2 nhân vật kèm ra trận 3vs3, lấy trong số đã có. */
  readonly team: readonly string[];
  readonly gold: number;
  /** Túi đồ: mọi món đang có, kể cả món đang mặc. */
  readonly bag: readonly GearItem[];
  /** Ô trang bị theo id nhân vật (chính và kèm), lưu id món trong túi. */
  readonly loadouts: Readonly<Record<string, SavedLoadout>>;
  /** Số dùng cho id món kế tiếp (`g<n>`), để server và /demo cấp id giống nhau. */
  readonly nextItemId: number;
  /** Campaign V2 graph progress, kèm bậc Đánh trùm. */
  readonly campaign: CampaignState;
  /** Đá Cường Hóa của tài khoản: số nguyên không âm. */
  readonly stones: number;
  /** Song Tháp (Trial/Destiny). */
  readonly dualTower: DualTowerState;
  /** Sinh tồn: kỷ lục số đợt (lượt chơi nằm trong trận, không lưu ở hồ sơ). */
  readonly survival: SurvivalState;
  /** Nhiệm vụ ngày/tuần, số đếm cho thành tựu, điểm danh. */
  readonly quests: QuestState;
}

export interface SurvivalState {
  readonly best: number;
}

export const NEW_SURVIVAL: SurvivalState = { best: 0 };

function parseSurvival(raw: unknown): SurvivalState {
  const best = (raw as Partial<SurvivalState> | null)?.best;
  return { best: Number.isInteger(best) && best! > 0 ? best! : 0 };
}

export function newProfile(): Profile {
  return {
    version: 1,
    skillLayout: 2,
    element: "moc",
    profession: "tuongSi",
    main: NEW_PROGRESS,
    companions: Object.fromEntries(
      STARTER_COMPANIONS.map((c) => [c.id, NEW_PROGRESS]),
    ),
    team: DEFAULT_TEAM,
    gold: 0,
    bag: [],
    loadouts: {},
    nextItemId: 1,
    campaign: NEW_CAMPAIGN,
    stones: 0,
    dualTower: NEW_DUAL_TOWER,
    survival: NEW_SURVIVAL,
    quests: NEW_QUESTS,
  };
}

/** Người chơi đã có nhân vật kèm này chưa. */
export function ownsCompanion(profile: Profile, id: string): boolean {
  return (
    Object.hasOwn(profile.companions, id) && companionById(id) !== undefined
  );
}

function validTeam(profile: Profile, ids: readonly unknown[]): boolean {
  return (
    ids.length === 2 &&
    ids[0] !== ids[1] &&
    ids.every((id) => typeof id === "string" && ownsCompanion(profile, id))
  );
}

export function progressOf(profile: Profile, id: string): CharacterProgress {
  return id === MAIN_ID
    ? profile.main
    : (profile.companions[id] ?? NEW_PROGRESS);
}

export function withProgress(
  profile: Profile,
  id: string,
  p: CharacterProgress,
): Profile {
  return id === MAIN_ID
    ? { ...profile, main: p }
    : { ...profile, companions: { ...profile.companions, [id]: p } };
}

/**
 * Đội của người chơi theo hồ sơ: nhân vật chính rồi các nhân vật kèm theo `companionIds`. Nhân vật chưa có
 * bị bỏ qua.
 */
export function profileTeam(
  profile: Profile,
  companionIds: readonly string[] = [],
): FighterConfig[] {
  const main = withGear(
    buildMain(profile.main, profile.element, profile.profession),
    loadoutOf(profile, MAIN_ID),
  );
  const companions = companionIds.flatMap((id) => {
    const base = companionById(id);
    if (!base || !isReleasedCompanion(id) || !ownsCompanion(profile, id)) return [];
    return [
      withGear(
        buildCompanion(base, progressOf(profile, id)),
        loadoutOf(profile, id),
      ),
    ];
  });
  return [main, ...companions];
}

/**
 * Đối thủ AI ở một cấp, tiến trình tự dựng (tiêu đều điểm kỹ năng). Nhân vật kèm dựng như của người chơi;
 * tùy tướng chiến dịch dùng chiêu nghề, mua cả hai nhánh.
 */
export function leveledFoe(base: FighterConfig, level: number): FighterConfig {
  if (companionById(base.id)) return buildCompanion(base, autoProgress(level, null));
  const p = autoProgress(level, base.profession);
  // Đối thủ AI luân phiên chiêu nhánh theo id để hai nhánh đều xuất hiện.
  const branch =
    p.branches.length > 1
      ? p.branches[(level + base.id.length) % p.branches.length]
      : undefined;
  return buildAide(base, p, branch);
}

export interface LevelUp {
  readonly id: string;
  readonly level: number;
}

/**
 * Cộng phần thưởng cuối trận vào hồ sơ. `ids` là id nhân vật của phe người chơi theo vị trí, cùng thứ tự
 * với `rewards.xp`.
 */
export function applyRewards(
  profile: Profile,
  ids: readonly string[],
  rewards: BattleRewards,
): { profile: Profile; levelUps: LevelUp[] } {
  let next: Profile = { ...profile, gold: profile.gold + rewards.gold };
  const levelUps: LevelUp[] = [];
  ids.forEach((id, i) => {
    const gain = addXp(progressOf(next, id), rewards.xp[i] ?? 0);
    next = withProgress(next, id, gain.progress);
    if (gain.levelsGained > 0)
      levelUps.push({ id, level: gain.progress.level });
  });
  return { profile: next, levelUps };
}

function isProgress(x: unknown): x is CharacterProgress {
  const p = x as CharacterProgress | null;
  return (
    !!p &&
    typeof p.xp === "number" &&
    typeof p.level === "number" &&
    typeof p.skillPoints === "number" &&
    typeof p.skillLevels === "object" &&
    Array.isArray(p.branches)
  );
}

/**
 * Tiến trình nhân vật kèm lưu từ trước khi mọi nhân vật kèm nâng theo ô (chiêu nghề, chiêu nhánh): đặt lại
 * kỹ năng cũ và hoàn đúng điểm đã chi để người chơi nâng lại. Cấp và kinh nghiệm giữ nguyên.
 */
function migrateCompanion(p: CharacterProgress): CharacterProgress {
  const slotKeys = new Set([1, 2, 3, 4, 5, 6].map(mainSlotKey));
  const legacy =
    p.branches.length > 0 ||
    Object.keys(p.skillLevels).some((k) => !slotKeys.has(k));
  return legacy
    ? {
        ...p,
        skillLevels: Object.fromEntries(Object.entries(p.skillLevels).filter(([k]) => slotKeys.has(k))),
        branches: [],
        skillPoints: p.skillPoints + Object.entries(p.skillLevels)
          .filter(([k]) => !slotKeys.has(k))
          .reduce((sum, [, lv]) => sum + [1, 2, 3, 4].filter(i => i < lv).reduce((n, i) => n + UPGRADE_COST[i]!, 0), 0)
          + new Set(p.branches).size * BRANCH_COST,
      }
    : p;
}

/** Layout 1: o5 ultimate/o4 advanced role. Swap keys, not levels or points. */
export function migrateSkillSlots(p: CharacterProgress): CharacterProgress {
 const levels={...p.skillLevels};delete levels.o4;delete levels.o5;
 if(p.skillLevels.o4!==undefined)levels.o5=p.skillLevels.o4;
 if(p.skillLevels.o5!==undefined)levels.o4=p.skillLevels.o5;
 return {...p,skillLevels:levels};
}
/** Đọc hồ sơ đã lưu; dữ liệu hỏng hoặc khác phiên bản thì trả về hồ sơ mới. */
export function parseProfile(raw: unknown): Profile {
  const p = raw as Profile | null;
  const fresh = newProfile();
  if (
    !p ||
    p.version !== 1 ||
    !isProgress(p.main) ||
    typeof p.gold !== "number"
  )
    return fresh;
  // Nhân vật khởi đầu luôn có; nhân vật mua giữ lại nếu còn trong danh sách.
  const saved = Object.entries(p.companions ?? {}).flatMap(([id, cp]) =>
    companionById(id) && isProgress(cp) ? [[id, p.skillLayout === 2 ? migrateCompanion(cp) : migrateSkillSlots(migrateCompanion(cp))]] : [],
  );
  // Bỏ trường cũ: chiêu nhánh mang vào trận của nhân vật kèm, leo tháp cũ (đã gỡ, song tháp ở `dualTower`).
  const rest: Partial<Profile> & { branchChoice?: unknown; tower?: unknown } = { ...p };
  delete rest.branchChoice;
  delete rest.tower;
  const companions = { ...fresh.companions, ...Object.fromEntries(saved) };
  const next: Profile = {
    ...fresh,
    ...rest,
    skillLayout: 2,
    profession: isLeaderProfession(p.profession) ? p.profession : fresh.profession,
    ...(!isLeaderProfession(p.profession) && normalizeProfession(p.profession) ? {unavailableLeaderProfession:normalizeProfession(p.profession)} : {}),
    main: p.skillLayout === 2 ? p.main : migrateSkillSlots(p.main),
    companions,
    team: fresh.team,
    ...parseInventory(p),
    campaign: parseCampaign(p.campaign),
    stones: parseStones(p.stones),
    dualTower: parseDualTower(p.dualTower),
    survival: parseSurvival(p.survival),
    quests: parseQuests(p.quests),
  };
  return Array.isArray(p.team) && validTeam(next, p.team)
    ? { ...next, team: p.team }
    : next;
}

// ——— Thao tác trên hồ sơ (client gửi ý định, server áp bằng chính các hàm này) ———

export type ProfileAction =
  /** Nâng kỹ năng theo ô ("o1".."o6"), nhân vật chính và nhân vật kèm như nhau. */
  | {
      readonly type: "upgrade";
      readonly character: string;
      readonly key: string;
    }
  /** Mua nhân vật kèm ở cửa hàng bằng vàng (sứ quân: sau nhiệm vụ mốc Campaign V2 của họ). */
  | { readonly type: "buyCompanion"; readonly character: string }
  /** Chọn 2 nhân vật kèm đã có ra trận 3vs3. */
  | { readonly type: "chooseTeam"; readonly companions: readonly string[] }
  /** Mặc/tháo một món trong túi cho nhân vật (chính hoặc kèm). */
  | {
      readonly type: "equip" | "unequip";
      readonly character: string;
      readonly item: string;
    }
  /** Ghép 3 món; `main` là vị trí món chính (lấy bộ của món này). */
  | {
      readonly type: "merge";
      readonly items: readonly string[];
      readonly main: number;
    }
  | { readonly type: "sell"; readonly item: string }
  | ({ readonly type: "buyGear" } & GearOrder)
  /** Doanh trại chiến dịch: đổi vàng lấy lương mang vào trận kế tiếp. */
  | { readonly type: "buyFood"; readonly amount: number }
  /** Điểm danh hôm nay. */
  | { readonly type: "checkIn" }
  /** Nhận thưởng nhiệm vụ ngày/tuần hoặc thành tựu đã xong. */
  | { readonly type: "claimQuest"; readonly id: string }
  | { readonly type: "claimAchievement"; readonly id: string };

export type ProfileError =
  | ProgressError
  | InventoryError
  | "foodFull"
  | QuestError;

/** Mua lương ở doanh trại; mua quá mức tối đa thì chỉ tính phần còn chứa được. */
function buyFood(profile: Profile, amount: number): ProfileActionResult {
  const room = CAMPAIGN_FOOD_MAX - profile.campaign.supply;
  const n = Math.min(Math.floor(amount), room);
  if (room <= 0) return { ok: false, error: "foodFull" };
  if (n <= 0) return { ok: false, error: "invalidItem" };
  const cost = n * FOOD_PRICE;
  if (profile.gold < cost) return { ok: false, error: "notEnoughGold" };
  return {
    ok: true,
    profile: {
      ...profile,
      gold: profile.gold - cost,
      campaign: { ...profile.campaign, supply: profile.campaign.supply + n },
    },
  };
}
export type ProfileActionResult =
  | { readonly ok: true; readonly profile: Profile }
  | { readonly ok: false; readonly error: ProfileError };

/**
 * Nhân vật `id` đã mở bán chưa: sứ quân mở khi đã xong nhiệm vụ Campaign V2 tương ứng (freeze mục 5,
 * M08–M21), không còn theo màn 13 màn cũ; còn lại mở sẵn.
 */
export function shopUnlocked(profile: Profile, id: string): boolean {
  const mission = warlordUnlockMission(id);
  return mission === undefined || profile.campaign.completed.includes(mission);
}

export type CampaignResetEnvironment = "development" | "test" | "production";
export type CampaignResetResult =
  | { readonly ok: true; readonly profile: Profile }
  | { readonly ok: false; readonly error: "campaignResetForbidden" };

/**
 * Explicit development-only reset. Raid tiers and every non-Campaign profile
 * field survive; calling it repeatedly produces the same profile.
 */
export function resetCampaignProgressForDev(
  profile: Profile,
  environment: CampaignResetEnvironment | string,
): CampaignResetResult {
  if (environment !== "development" && environment !== "test")
    return { ok: false, error: "campaignResetForbidden" };
  return {
    ok: true,
    profile: {
      ...profile,
      campaign: { ...NEW_CAMPAIGN, raids: profile.campaign.raids },
    },
  };
}

/** Mua nhân vật kèm ở cửa hàng: trừ vàng, nhân vật vào hồ sơ ở cấp 1. Sứ quân cần qua nhiệm vụ mốc V2 của họ trước. */
function buyCompanion(profile: Profile, id: string): ProfileActionResult {
  const price = shopPrice(id);
  if (price === undefined) return { ok: false, error: "invalidSkill" };
  if (ownsCompanion(profile, id)) return { ok: false, error: "owned" };
  if (!shopUnlocked(profile, id)) return { ok: false, error: "locked" };
  if (profile.gold < price) return { ok: false, error: "notEnoughGold" };
  return {
    ok: true,
    profile: {
      ...profile,
      gold: profile.gold - price,
      companions: { ...profile.companions, [id]: NEW_PROGRESS },
    },
  };
}

/**
 * `now` là giờ server (ms), cần cho điểm danh và nhiệm vụ theo ngày; các thao tác khác không dùng.
 */
export function applyProfileAction(
  profile: Profile,
  action: ProfileAction,
  now = 0,
): ProfileActionResult {
  if (action.type === "checkIn" || action.type === "claimQuest") {
    const r =
      action.type === "checkIn"
        ? checkIn(profile.quests, now)
        : claimQuest(profile.quests, action.id, now);
    return r.ok
      ? {
          ok: true,
          profile: {
            ...profile,
            quests: r.quests,
            gold: profile.gold + r.gold,
          },
        }
      : r;
  }
  if (action.type === "claimAchievement") {
    const def = achievementById(action.id);
    if (!def) return { ok: false, error: "noQuest" };
    const a = achievementProgress(profile, def);
    if (a.claimed) return { ok: false, error: "questClaimed" };
    if (!a.done) return { ok: false, error: "questNotDone" };
    return {
      ok: true,
      profile: {
        ...profile,
        gold: profile.gold + def.gold,
        quests: {
          ...profile.quests,
          achievements: [...profile.quests.achievements, def.id],
        },
      },
    };
  }
  if (action.type === "chooseTeam") {
    return validTeam(profile, action.companions)
      ? { ok: true, profile: { ...profile, team: [...action.companions] } }
      : { ok: false, error: "notOwned" };
  }
  if (action.type === "buyCompanion")
    return buyCompanion(profile, action.character);
  if (action.type === "equip")
    return equipItem(profile, action.character, action.item);
  if (action.type === "unequip")
    return unequipItem(profile, action.character, action.item);
  if (action.type === "merge")
    return mergeGear(profile, action.items, action.main);
  if (action.type === "sell") return sellItem(profile, action.item);
  if (action.type === "buyGear") return buyGear(profile, action);
  if (action.type === "buyFood") return buyFood(profile, action.amount);
  // Còn lại là nâng kỹ năng: mọi nhân vật nâng theo ô.
  if (action.type !== "upgrade") return { ok: false, error: "invalidItem" };
  const isMain = action.character === MAIN_ID;
  if (!isMain && !companionById(action.character))
    return { ok: false, error: "invalidSkill" };
  if (!isMain && !ownsCompanion(profile, action.character))
    return { ok: false, error: "notOwned" };
  const r = upgradeSkill(
    progressOf(profile, action.character),
    action.key,
    null,
  );
  return r.ok
    ? { ok: true, profile: withProgress(profile, action.character, r.progress) }
    : r;
}

/** Kiểm tra hình dạng thao tác gửi lên; null khi không hợp lệ. */
/** Current clients explicitly version slot upgrades so an old cached UI cannot upgrade the wrong skill. */
export function profileActionPayload(action:ProfileAction){
 return action.type==='upgrade'?{...action,skillLayout:2 as const}:action;
}

export function parseProfileAction(x: unknown): ProfileAction | null {
  const a = x as Record<string, unknown> | null;
  if (!a || typeof a !== "object") return null;
  if (a.type === "chooseTeam") {
    const ids = a.companions;
    return Array.isArray(ids) &&
      ids.length === 2 &&
      ids.every((id) => typeof id === "string")
      ? { type: "chooseTeam", companions: ids as string[] }
      : null;
  }
  if (a.type === "merge") {
    const ids = a.items;
    return Array.isArray(ids) &&
      ids.length === 3 &&
      ids.every((id) => typeof id === "string") &&
      Number.isInteger(a.main)
      ? { type: "merge", items: ids as string[], main: a.main as number }
      : null;
  }
  if (a.type === "sell")
    return typeof a.item === "string" ? { type: "sell", item: a.item } : null;
  if (a.type === "checkIn") return { type: "checkIn" };
  if (a.type === "claimQuest" || a.type === "claimAchievement")
    return typeof a.id === "string"
      ? a.type === "claimQuest"
        ? { type: "claimQuest", id: a.id }
        : { type: "claimAchievement", id: a.id }
      : null;
  if (a.type === "buyFood")
    return Number.isInteger(a.amount)
      ? { type: "buyFood", amount: a.amount as number }
      : null;
  if (a.type === "buyGear") {
    if (
      typeof a.slot !== "string" ||
      typeof a.element !== "string" ||
      typeof a.set !== "string" ||
      typeof a.tier !== "number"
    )
      return null;
    if (a.profession !== undefined && typeof a.profession !== "string")
      return null;
    // Giá trị cụ thể do buyGear kiểm tra.
    return {
      type: "buyGear",
      slot: a.slot as GearSlot,
      element: a.element as Element,
      set: a.set,
      tier: a.tier as Tier,
      ...(a.profession === undefined
        ? {}
        : { profession: a.profession as Profession }),
    };
  }
  if (typeof a.character !== "string") return null;
  if (
    (a.type === "equip" || a.type === "unequip") &&
    typeof a.item === "string"
  ) {
    return { type: a.type, character: a.character, item: a.item };
  }
  if (a.type === "buyCompanion")
    return { type: "buyCompanion", character: a.character };
  if (a.type === "upgrade" && typeof a.key === "string") {
    if(a.skillLayout!==undefined&&a.skillLayout!==2)return null;
    if((a.key==='o4'||a.key==='o5')&&a.skillLayout!==2)return null;
    return { type: "upgrade", character: a.character, key: a.key };
  }
  return null;
}
