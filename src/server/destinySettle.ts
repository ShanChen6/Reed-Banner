import {
  HUMAN,
  generateDestinyOffer,
  isDualTowerV1,
  settleDestinyFloor,
  validateDestinyMatchTag,
  type Match,
} from "@/core";
import { updateProfile, type ProfileStore } from "./profiles";
import { resolveDestinyFloor } from "./destinyContent";

export interface DestinyResult {
  readonly floor: number;
  readonly won: boolean;
  readonly phase: "reward" | "done";
}

export async function settleDestinyMatch(
  ownerId: string,
  matchId: string,
  match: Match,
  deps: { readonly profiles: ProfileStore; readonly now: number; readonly destinySecret?: string },
): Promise<DestinyResult | undefined> {
  const tag = match.destiny?.tag;
  if (!tag || !deps.destinySecret) return undefined;
  let result: DestinyResult | undefined;
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
      result = { floor: tag.floor, won: match.battle.winner === HUMAN, phase: nextRun.phase === "reward" ? "reward" : "done" };
      return {
        ok: true as const,
        profile: {
          ...profile,
          dualTower: {
            ...profile.dualTower,
            destiny: {
              ...progress,
              cycleBest: settled.won ? Math.max(progress.cycleBest, tag.floor) : progress.cycleBest,
              run: nextRun,
            },
          },
        },
      };
    },
    deps.now,
  );
  if (!updated.ok) {
    console.error("Không chốt được trận Destiny", matchId, updated.error);
    return undefined;
  }
  return result;
}
