// Hồ sơ người chơi: tiến trình nhân vật chính và các nhân vật kèm, vàng, lựa chọn trước trận.
// Dữ liệu thuần: /demo lưu ở trình duyệt, /play lưu trên server (bảng `profiles`).

import type { Element, FighterConfig, Profession } from "../battle";
import { withGear, type GearItem, type GearSlot, type Tier } from "../gear";
import {
  companionById,
  isHero,
  shopPrice,
  STARTER_COMPANIONS,
} from "../roster";
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
  applyTowerReward,
  NEW_TOWER,
  parseTower,
  type TowerState,
} from "./towerState";
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
  buildCompanion,
  buildHero,
  buildMain,
  buyBranch,
  NEW_PROGRESS,
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
  readonly element: Element;
  readonly profession: Profession;
  readonly main: CharacterProgress;
  /** Nhân vật kèm đã có (khởi đầu và mua ở cửa hàng), theo id. */
  readonly companions: Readonly<Record<string, CharacterProgress>>;
  /** 2 nhân vật kèm ra trận 3vs3, lấy trong số đã có. */
  readonly team: readonly string[];
  /** Chiêu nhánh nấc 2 mang vào trận, theo id nhân vật kèm. */
  readonly branchChoice: Readonly<Record<string, string>>;
  readonly gold: number;
  /** Túi đồ: mọi món đang có, kể cả món đang mặc. */
  readonly bag: readonly GearItem[];
  /** Ô trang bị theo id nhân vật (chính và kèm), lưu id món trong túi. */
  readonly loadouts: Readonly<Record<string, SavedLoadout>>;
  /** Số dùng cho id món kế tiếp (`g<n>`), để server và /demo cấp id giống nhau. */
  readonly nextItemId: number;
  /** Tiến độ chiến dịch: màn đã qua, lương mang sang. */
  readonly campaign: CampaignState;
  /** Leo tháp: kỷ lục và lượt leo đang dở. */
  readonly tower: TowerState;
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
    element: "moc",
    profession: "tuongSi",
    main: NEW_PROGRESS,
    companions: Object.fromEntries(
      STARTER_COMPANIONS.map((c) => [c.id, NEW_PROGRESS]),
    ),
    team: DEFAULT_TEAM,
    branchChoice: {},
    gold: 0,
    bag: [],
    loadouts: {},
    nextItemId: 1,
    campaign: NEW_CAMPAIGN,
    tower: NEW_TOWER,
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
    if (!base || !ownsCompanion(profile, id)) return [];
    return [
      withGear(
        isHero(id)
          ? buildHero(base, progressOf(profile, id))
          : buildCompanion(
              base,
              progressOf(profile, id),
              profile.branchChoice[id],
            ),
        loadoutOf(profile, id),
      ),
    ];
  });
  return [main, ...companions];
}

/** Đối thủ AI ở một cấp: tiến trình tự dựng (tiêu đều điểm kỹ năng, mua cả hai nhánh). */
export function leveledFoe(base: FighterConfig, level: number): FighterConfig {
  const p = autoProgress(level, base.profession, base.id);
  // Đối thủ AI luân phiên chiêu nhánh theo id để hai nhánh đều xuất hiện.
  const branch =
    p.branches.length > 1
      ? p.branches[(level + base.id.length) % p.branches.length]
      : undefined;
  return buildCompanion(base, p, branch);
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
  const saved = Object.entries(p.companions ?? {}).filter(
    ([id, cp]) => companionById(id) && isProgress(cp),
  );
  const companions = { ...fresh.companions, ...Object.fromEntries(saved) };
  const next: Profile = {
    ...fresh,
    ...p,
    companions,
    team: fresh.team,
    branchChoice: p.branchChoice ?? {},
    ...parseInventory(p),
    campaign: parseCampaign(p.campaign),
    tower: parseTower(p.tower),
    survival: parseSurvival(p.survival),
    quests: parseQuests(p.quests),
  };
  return Array.isArray(p.team) && validTeam(next, p.team)
    ? { ...next, team: p.team }
    : next;
}

// ——— Thao tác trên hồ sơ (client gửi ý định, server áp bằng chính các hàm này) ———

export type ProfileAction =
  /** Nâng kỹ năng: nhân vật chính theo ô ("o1".."o6"), nhân vật kèm theo id chiêu. */
  | {
      readonly type: "upgrade";
      readonly character: string;
      readonly key: string;
    }
  | {
      readonly type: "buyBranch";
      readonly character: string;
      readonly skill: string;
    }
  /** Chọn chiêu nhánh nấc 2 đã mua để mang vào trận. */
  | {
      readonly type: "chooseBranch";
      readonly character: string;
      readonly skill: string;
    }
  /** Mua nhân vật kèm ở cửa hàng bằng vàng. */
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
  /** Leo tháp: chọn phần thưởng thứ `index` sau khi thắng tầng. */
  | { readonly type: "towerPick"; readonly index: number }
  /** Leo tháp: bỏ lượt leo đang dở (không được lúc đang đánh). */
  | { readonly type: "towerQuit" }
  /** Điểm danh hôm nay. */
  | { readonly type: "checkIn" }
  /** Nhận thưởng nhiệm vụ ngày/tuần hoặc thành tựu đã xong. */
  | { readonly type: "claimQuest"; readonly id: string }
  | { readonly type: "claimAchievement"; readonly id: string };

export type ProfileError =
  | ProgressError
  | InventoryError
  | "foodFull"
  | "noTowerOffer"
  | "towerBusy"
  | QuestError;

function towerPick(profile: Profile, index: number): ProfileActionResult {
  const run = profile.tower.run;
  const reward = run?.offer?.[index];
  if (!run || !reward) return { ok: false, error: "noTowerOffer" };
  return {
    ok: true,
    profile: {
      ...profile,
      tower: {
        ...profile.tower,
        run: { ...applyTowerReward(run, reward), offer: null },
      },
    },
  };
}

/** Mua lương ở doanh trại; mua quá mức tối đa thì chỉ tính phần còn chứa được. */
function buyFood(profile: Profile, amount: number): ProfileActionResult {
  const room = CAMPAIGN_FOOD_MAX - profile.campaign.food;
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
      campaign: { ...profile.campaign, food: profile.campaign.food + n },
    },
  };
}
export type ProfileActionResult =
  | { readonly ok: true; readonly profile: Profile }
  | { readonly ok: false; readonly error: ProfileError };

/** Mua nhân vật kèm ở cửa hàng: trừ vàng, nhân vật vào hồ sơ ở cấp 1. */
function buyCompanion(profile: Profile, id: string): ProfileActionResult {
  const price = shopPrice(id);
  if (price === undefined) return { ok: false, error: "invalidSkill" };
  if (ownsCompanion(profile, id)) return { ok: false, error: "owned" };
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
  if (action.type === "towerPick") return towerPick(profile, action.index);
  if (action.type === "towerQuit") {
    if (profile.tower.run?.active) return { ok: false, error: "towerBusy" };
    return {
      ok: true,
      profile: { ...profile, tower: { ...profile.tower, run: null } },
    };
  }
  const isMain = action.character === MAIN_ID;
  const base = isMain ? undefined : companionById(action.character);
  if (!isMain && !base) return { ok: false, error: "invalidSkill" };
  // Tướng lịch sử nâng theo ô như nhân vật chính (nghề null), không có chiêu nhánh.
  const slotKit = isMain || isHero(action.character);
  const profession = slotKit ? null : base!.profession;
  if (!isMain && !ownsCompanion(profile, action.character))
    return { ok: false, error: "notOwned" };
  const p = progressOf(profile, action.character);
  switch (action.type) {
    case "upgrade": {
      const r = upgradeSkill(
        p,
        action.key,
        profession,
        slotKit ? undefined : action.character,
      );
      return r.ok
        ? {
            ok: true,
            profile: withProgress(profile, action.character, r.progress),
          }
        : r;
    }
    case "buyBranch": {
      if (profession === null) return { ok: false, error: "invalidSkill" };
      const r = buyBranch(p, action.skill, profession);
      return r.ok
        ? {
            ok: true,
            profile: withProgress(profile, action.character, r.progress),
          }
        : r;
    }
    case "chooseBranch":
      if (!p.branches.includes(action.skill))
        return { ok: false, error: "locked" };
      return {
        ok: true,
        profile: {
          ...profile,
          branchChoice: {
            ...profile.branchChoice,
            [action.character]: action.skill,
          },
        },
      };
  }
}

/** Kiểm tra hình dạng thao tác gửi lên; null khi không hợp lệ. */
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
  if (a.type === "towerPick")
    return Number.isInteger(a.index)
      ? { type: "towerPick", index: a.index as number }
      : null;
  if (a.type === "towerQuit") return { type: "towerQuit" };
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
  if (a.type === "upgrade" && typeof a.key === "string")
    return { type: "upgrade", character: a.character, key: a.key };
  if (
    (a.type === "buyBranch" || a.type === "chooseBranch") &&
    typeof a.skill === "string"
  ) {
    return { type: a.type, character: a.character, skill: a.skill };
  }
  return null;
}
