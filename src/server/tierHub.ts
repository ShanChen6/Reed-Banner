// Trang Ban Thưởng: gom mọi dải bậc của các chế độ xếp hạng (Quần Hùng, Đấu người, Trấn Ải, Trận Đồ, Nhật Lệnh, Tháp
// Thiên Mệnh, Tầm Tướng Ký) vào một tổng quan và một lệnh nhận. Thước đo đọc trên server (hồ sơ, kho đấu trường, kho
// PvP); nhận thưởng gọi đúng hàm nhận của từng chế độ, nên luật "mỗi bậc một lần" giữ nguyên. Luật ở
// docs/02-game-modes/README.md mục 5.9.

import {
  ARENA_START,
  ARENA_TIERS,
  FORMATION_TIERS,
  MODE_TIERS,
  SURVIVAL_TIERS,
  modeTierClaims,
  pvpTierClaims,
  type ArenaTier,
  type GearItem,
  type ModeTierId,
  type Profile,
} from "@/core";
import { claimArenaTierReward, claimModeTierReward, claimSurvivalTierReward, type ArenaStore } from "./arena";
import { claimFormationTierReward } from "./formation";
import { loadProfile, type ProfileStore } from "./profiles";
import { claimPvpTierReward, pvpTierRating, type PvpStore } from "./pvp";

export const TIER_HUB_IDS = ["arena", "pvp", "survival", "formation", "daily", "destiny", "tamTuongKy"] as const;
export type TierHubId = (typeof TIER_HUB_IDS)[number];
export const isTierHubId = (x: unknown): x is TierHubId => typeof x === "string" && (TIER_HUB_IDS as readonly string[]).includes(x);

/** Một dải trên trang Ban Thưởng. */
export interface TierLadderView {
  readonly id: TierHubId;
  /** Tên chế độ, đồng thời là phân cảnh để mở chế độ đó. */
  readonly mode: string;
  readonly scene: string;
  readonly measure: string;
  readonly unit: string;
  readonly score: number;
  readonly tiers: readonly ArenaTier[];
  readonly claimed: readonly string[];
  /** Chưa vào chế độ lần nào nên dải còn khóa (Quần Hùng: chưa có bản ghi đấu trường). */
  readonly locked?: boolean;
}

export interface TierHubDeps {
  readonly profiles: ProfileStore;
  readonly arena?: ArenaStore;
  /** Có thì Đấu người đang bật. */
  readonly pvp?: PvpStore;
  readonly now: number;
  /** Chế độ đang bật theo cờ; chế độ tắt thì không có dải. */
  readonly enabled: { readonly formation: boolean; readonly destiny: boolean; readonly tamTuongKy: boolean };
}

const modeView = (id: ModeTierId, mode: string, scene: string, profile: Profile): TierLadderView => {
  const l = MODE_TIERS[id];
  return { id, mode, scene, measure: l.measure, unit: l.unit, score: l.score(profile), tiers: l.tiers, claimed: modeTierClaims(profile, id) };
};

/** Tổng quan mọi dải bậc của người chơi, theo thứ tự chế độ trên trang. */
export async function tierOverview(ownerId: string, deps: TierHubDeps): Promise<TierLadderView[]> {
  const { profile } = await loadProfile(deps.profiles, ownerId);
  const out: TierLadderView[] = [];
  if (deps.arena) {
    const row = await deps.arena.get(ownerId);
    out.push({ id: "arena", mode: "Quần Hùng", scene: "ARENA", measure: "Điểm hạng đấu bóng ma.", unit: "điểm", score: row?.rating ?? ARENA_START, tiers: ARENA_TIERS, claimed: profile.arenaTiers ?? [], ...(row ? {} : { locked: true }) });
  }
  if (deps.pvp)
    out.push({ id: "pvp", mode: "Đấu người", scene: "ARENA", measure: "Điểm hạng cao hơn giữa 1vs1 và 3vs3 xếp hạng.", unit: "điểm", score: await pvpTierRating(ownerId, { pvp: deps.pvp }), tiers: ARENA_TIERS, claimed: pvpTierClaims(profile) });
  out.push({ id: "survival", mode: "Trấn Ải", scene: "SURVIVAL", measure: "Kỷ lục số đợt vượt trong một lượt chơi.", unit: "đợt", score: profile.survival.best, tiers: SURVIVAL_TIERS, claimed: profile.survivalTiers ?? [] });
  if (deps.enabled.formation)
    out.push({ id: "formation", mode: "Trận Đồ", scene: "FORMATION", measure: "Số ván xếp hạng đã thắng (cả ba bậc).", unit: "ván", score: profile.formationWins ?? 0, tiers: FORMATION_TIERS, claimed: profile.formationTiers ?? [] });
  out.push(modeView("daily", "Nhật Lệnh", "DAILY", profile));
  if (deps.enabled.destiny) out.push(modeView("destiny", "Tháp Thiên Mệnh", "DESTINY", profile));
  if (deps.enabled.tamTuongKy) out.push(modeView("tamTuongKy", "Tầm Tướng Ký", "TAM_TUONG_KY", profile));
  return out;
}

export type HubClaimResult =
  | { readonly ok: true; readonly gold: number; readonly item: GearItem | null; readonly soldFor: number }
  | { readonly ok: false; readonly error: string };

/** Nhận một bậc của dải `id` bằng đúng hàm nhận của chế độ đó. */
export async function claimHubTier(ownerId: string, id: TierHubId, tier: string, deps: TierHubDeps): Promise<HubClaimResult> {
  switch (id) {
    case "arena":
      // Chưa vào Quần Hùng (chưa có bản ghi đấu trường) thì hàm nhận báo chưa đạt: phải vào chế độ trước (Shan 18/11/2026).
      return deps.arena ? claimArenaTierReward(ownerId, tier, { arena: deps.arena, profiles: deps.profiles, now: deps.now }) : { ok: false, error: "featureDisabled" };
    case "pvp":
      return deps.pvp ? claimPvpTierReward(ownerId, tier, { pvp: deps.pvp, profiles: deps.profiles, now: deps.now }) : { ok: false, error: "featureDisabled" };
    case "survival":
      return claimSurvivalTierReward(ownerId, tier, deps);
    case "formation":
      return deps.enabled.formation ? claimFormationTierReward(deps, ownerId, tier) : { ok: false, error: "featureDisabled" };
    case "destiny":
      if (!deps.enabled.destiny) return { ok: false, error: "featureDisabled" };
      return claimModeTierReward(ownerId, id, tier, deps);
    case "tamTuongKy":
      if (!deps.enabled.tamTuongKy) return { ok: false, error: "featureDisabled" };
      return claimModeTierReward(ownerId, id, tier, deps);
    case "daily":
      return claimModeTierReward(ownerId, id, tier, deps);
  }
}
