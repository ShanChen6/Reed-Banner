import {
  HUMAN,
  applyStoneAward,
  DESTINY_STONE_MILESTONES,
  generateDestinyOffer,
  isDualTowerV1,
  planDestinyFloorClear,
  settleDestinyFloor,
  validateDestinyMatchTag,
  type Match,
} from "@/core";
import { updateProfile, type ProfileStore } from "./profiles";
import { resolveDestinyFloor } from "./destinyContent";
import { activeDestinyCycle } from "./destinyCycle";
import { reconcileDestinyCycle } from "./destinyExpire";
import type { DestinyLeaderboardStore, DestinyLeaderboardSubmission } from "./destinyLeaderboard";
import { destinyEnabled } from "./featureFlags";

export interface DestinyResult {
  readonly floor: number;
  readonly won: boolean;
  readonly phase: "reward" | "done";
}

export async function settleDestinyMatch(
  ownerId: string,
  matchId: string,
  match: Match,
  deps: { readonly profiles: ProfileStore; readonly now: number; readonly destinySecret?: string; readonly destinyLeaderboard?: DestinyLeaderboardStore; readonly destinyEnabled?: boolean },
): Promise<DestinyResult | undefined> {
  if (!destinyEnabled(deps)) return undefined;
  const tag = match.destiny?.tag;
  if (!tag || !deps.destinySecret) return undefined;
  const scheduled = activeDestinyCycle(deps.now);
  if (!scheduled.ok || scheduled.cycle.cycleId !== tag.cycleId) {
    await reconcileDestinyCycle(deps.profiles, ownerId, deps.now);
    return undefined;
  }
  let result: DestinyResult | undefined;
  let leaderboard: DestinyLeaderboardSubmission | undefined;
  const updated = await updateProfile(
    deps.profiles,
    ownerId,
    (profile) => {
      if (!isDualTowerV1(profile.dualTower))
        return { ok: false as const, error: "unsupported_schema" as const };
      const progress = profile.dualTower.destiny;
      const run = progress.run;
      if (!run || run.matchId !== matchId || run.cycleId !== tag.cycleId || run.floor !== tag.floor)
        return { ok: false as const, error: "stale_match" as const };
      const resolved = resolveDestinyFloor(run, deps.destinySecret!);
      if (!resolved.ok || validateDestinyMatchTag(tag, resolved.floor, match.battle, run.roster) !== null)
        return { ok: false as const, error: "invalid_match" as const };
      const settled = settleDestinyFloor(run, match.battle);
      if (!settled.ok) return { ok: false as const, error: settled.error };
      const withoutMatch = { ...settled.run, matchId: undefined };
      const nextRun = settled.won
        ? { ...withoutMatch, offer: generateDestinyOffer(withoutMatch) }
        : { ...withoutMatch, offer: null };
      if (settled.won && (!nextRun.offer || nextRun.offer.length !== 3))
        return { ok: false as const, error: "invalid_offer" as const };
      const planned = settled.won
        ? planDestinyFloorClear(progress, {
            cycleId: tag.cycleId,
            floor: tag.floor,
            milestones: DESTINY_STONE_MILESTONES,
          })
        : { ok: true as const, next: progress, events: [] };
      if (!planned.ok) return { ok: false as const, error: planned.error };
      const awarded = applyStoneAward(profile, planned.events, {
        destiny: { ...planned.next, run: nextRun },
      });
      if (!awarded.ok) return { ok: false as const, error: awarded.error };
      result = { floor: tag.floor, won: match.battle.winner === HUMAN, phase: nextRun.phase === "reward" ? "reward" : "done" };
      leaderboard = settled.won ? {
        eventId: matchId,
        cycleId: tag.cycleId,
        ownerId,
        clearedFloor: tag.floor,
        totalTurns: nextRun.totalTurns ?? 0,
        completedAt: deps.now,
      } : undefined;
      return {
        ok: true as const,
        profile: awarded.profile,
      };
    },
    deps.now,
  );
  if (!updated.ok) {
    console.error("Không chốt được trận Destiny", matchId, updated.error);
    return undefined;
  }
  if (leaderboard && deps.destinyLeaderboard) {
    try {
      await deps.destinyLeaderboard.submit(leaderboard);
    } catch (error) {
      console.error("Không ghi được BXH Destiny", matchId, error);
    }
  }
  return result;
}
