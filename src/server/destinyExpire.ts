import {
  DESTINY_HISTORY_MAX,
  isDualTowerV1,
  type DestinyCycleHistory,
  type DestinyProgress,
  type Profile,
} from "@/core";
import { loadProfile, updateProfile, type ProfileStore } from "./profiles";
import { activeDestinyCycle } from "./destinyCycle";

export interface DestinyExpireResult {
  readonly expired: boolean;
  readonly cycleId: string;
}

export const hasExpiredDestinyRun = (profile: Profile, cycleId: string): boolean =>
  isDualTowerV1(profile.dualTower) && !!profile.dualTower.destiny.run?.cycleId &&
  profile.dualTower.destiny.run.cycleId !== cycleId;

function closeProgress(progress: DestinyProgress, cycleId: string, now: number): DestinyProgress {
  const run = progress.run;
  const oldCycleId = run?.cycleId ?? progress.cycleId;
  if (!oldCycleId || oldCycleId === cycleId) return progress;
  const phase = run?.phase ?? "none";
  // settledFloor chỉ nói kết quả đã xử lý (kể cả thua); cycleBest mới là receipt tầng đã clear.
  const clearedFloor = progress.cycleBest;
  const record: DestinyCycleHistory = {
    cycleId: oldCycleId,
    bestFloor: progress.cycleBest,
    clearedFloor,
    closedAt: now,
    phaseAtClose: phase,
    pendingRewardDropped: phase === "reward",
    cycleRewardClaimed: progress.cycleRewardClaimed,
  };
  const history = [...(progress.history ?? []).filter((entry) => entry.cycleId !== oldCycleId), record]
    .slice(-DESTINY_HISTORY_MAX);
  return {
    cycleId,
    cycleBest: 0,
    run: run ? { ...run, active: false, phase: "done", matchId: undefined, offer: null } : null,
    claimedMilestones: [],
    cycleRewardClaimed: false,
    history,
  };
}

/** Đồng bộ cycle bằng CAS. Không cấp thưởng và không chạm inventory/stone/Tower/Trial. */
export async function reconcileDestinyCycle(
  profiles: ProfileStore,
  ownerId: string,
  now: number,
): Promise<{ readonly ok: true; readonly value: DestinyExpireResult; readonly profile: Profile } |
  { readonly ok: false; readonly error: "invalid_time" | "unsupported_schema" | "conflict" }> {
  const scheduled = activeDestinyCycle(now);
  if (!scheduled.ok) return { ok: false, error: "invalid_time" };
  const loaded = await loadProfile(profiles, ownerId);
  if (!isDualTowerV1(loaded.profile.dualTower)) return { ok: false, error: "unsupported_schema" };
  const before = loaded.profile.dualTower.destiny;
  const effectiveCycle = before.run?.active ? before.run.cycleId : before.cycleId;
  if (effectiveCycle === scheduled.cycle.cycleId)
    return {
      ok: true,
      value: { expired: false, cycleId: scheduled.cycle.cycleId },
      profile: loaded.profile,
    };
  let expired = false;
  const updated = await updateProfile(
    profiles,
    ownerId,
    (profile) => {
      expired = false;
      if (!isDualTowerV1(profile.dualTower))
        return { ok: false as const, error: "unsupported_schema" as const };
      const current = profile.dualTower.destiny;
      const currentEffective = current.run?.active ? current.run.cycleId : current.cycleId;
      if (currentEffective === scheduled.cycle.cycleId)
        return { ok: true as const, profile };
      const next = closeProgress(current, scheduled.cycle.cycleId, now);
      expired = next !== current;
      return {
        ok: true as const,
        profile: {
          ...profile,
          dualTower: {
            ...profile.dualTower,
            destiny: expired ? next : { ...current, cycleId: scheduled.cycle.cycleId },
          },
        },
      };
    },
    now,
  );
  if (!updated.ok) return { ok: false, error: updated.error };
  return {
    ok: true,
    value: { expired, cycleId: scheduled.cycle.cycleId },
    profile: updated.stored.profile,
  };
}
