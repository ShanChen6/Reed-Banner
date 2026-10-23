// Claim/settle quyền quét Trial bằng optimistic CAS trên profile.
import {
  applyStoneAward,
  isDualTowerV1,
  planTrialSweepState,
  stoneKeys,
  trialSweepStoneAmount,
  type StoneAwardError,
  type TrialSweepTier,
} from "@/core";
import { updateProfile, type ProfileStore } from "./profiles";

export type TrialSweepClaimResult =
  | {
      readonly ok: true;
      readonly claimed: boolean;
      readonly dateKey: string;
      readonly tier: TrialSweepTier;
      readonly claimedAt: number;
    }
  | { readonly ok: false; readonly error: "unsupported_schema" | "invalid_time" | "no_cleared_floors" | "conflict" };

export async function claimTrialSweepState(
  profiles: ProfileStore,
  ownerId: string,
  now: number,
): Promise<TrialSweepClaimResult> {
  let outcome: Exclude<TrialSweepClaimResult, { readonly ok: false }> | undefined;
  const updated = await updateProfile<Exclude<TrialSweepClaimResult, { readonly ok: true }>["error"]>(
    profiles,
    ownerId,
    (profile) => {
      if (!isDualTowerV1(profile.dualTower)) return { ok: false, error: "unsupported_schema" };
      const planned = planTrialSweepState(profile.dualTower.trial, now);
      if (!planned.ok) return planned;
      outcome = {
        ok: true,
        claimed: planned.claimed,
        dateKey: planned.dateKey,
        tier: planned.tier,
        claimedAt: planned.claimedAt,
      };
      return {
        ok: true,
        profile: planned.next === profile.dualTower.trial
          ? profile
          : { ...profile, dualTower: { ...profile.dualTower, trial: planned.next } },
      };
    },
    now,
  );
  return updated.ok ? outcome! : { ok: false, error: updated.error };
}

export type TrialSweepSettlementResult =
  | {
      readonly ok: true;
      readonly granted: number;
      readonly stones: number;
      readonly dateKey: string;
      readonly tier: TrialSweepTier;
      readonly claimedAt: number;
    }
  | {
      readonly ok: false;
      readonly error:
        | StoneAwardError
        | "invalid_time"
        | "no_cleared_floors"
        | "conflict";
    };

/**
 * Atomic sweep settlement: derive entitlement from server progress, then persist
 * receipt + unique ledger key + wallet balance in one versioned profile write.
 */
export async function settleTrialSweep(
  profiles: ProfileStore,
  ownerId: string,
  now: number,
): Promise<TrialSweepSettlementResult> {
  let outcome: Exclude<TrialSweepSettlementResult, { readonly ok: false }> | undefined;
  const updated = await updateProfile<Exclude<TrialSweepSettlementResult, { readonly ok: true }>["error"]>(
    profiles,
    ownerId,
    (profile) => {
      if (!isDualTowerV1(profile.dualTower)) return { ok: false, error: "unsupported_schema" };
      const planned = planTrialSweepState(profile.dualTower.trial, now);
      if (!planned.ok) return planned;
      const awarded = applyStoneAward(
        profile,
        [{
          kind: "stone",
          mode: "trial",
          source: "trial_sweep",
          amount: trialSweepStoneAmount(planned.tier),
          key: stoneKeys.trialSweep(planned.dateKey),
        }],
        { trial: planned.next },
      );
      if (!awarded.ok) return awarded;
      outcome = {
        ok: true,
        granted: awarded.granted,
        stones: awarded.profile.stones,
        dateKey: planned.dateKey,
        tier: planned.tier,
        claimedAt: planned.claimedAt,
      };
      return { ok: true, profile: awarded.profile };
    },
    now,
  );
  return updated.ok ? outcome! : { ok: false, error: updated.error };
}
