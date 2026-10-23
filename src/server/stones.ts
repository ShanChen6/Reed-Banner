// Cấp Đá Cường Hóa phía server: đọc hồ sơ, lập kế hoạch từ trạng thái mới nhất, cộng đá và ghi mốc
// trong MỘT lần ghi có version. Hai request đồng thời: bên thua đọc lại, thấy mốc đã nhận và không cộng lần hai.
import {
  applyStoneAward,
  isDualTowerV1,
  type Profile,
  type SettleError,
  type SettlePlan,
  type SettleResult,
  type StoneAwardError,
  type StoneAwardPatch,
  type TrialProgress,
  type DestinyProgress,
} from "@/core";
import { updateProfile, type ProfileStore } from "./profiles";

export type StonePlanner = (state: {
  readonly trial: TrialProgress;
  readonly destiny: DestinyProgress;
}) =>
  | { readonly ok: true; readonly patch: StoneAwardPatch; readonly plan: Pick<SettlePlan<unknown>, "events"> }
  | { readonly ok: false; readonly error: SettleError };

export type AwardError = StoneAwardError | SettleError | "conflict";

export type AwardOutcome =
  | { readonly ok: true; readonly stones: number; readonly granted: number }
  | { readonly ok: false; readonly error: AwardError };

/** Kế hoạch từ trạng thái Trial: bọc kết quả `planTrial*` của core. */
export const trialPlanner =
  (plan: (t: TrialProgress) => SettleResult<TrialProgress>): StonePlanner =>
  ({ trial }) => {
    const r = plan(trial);
    return r.ok ? { ok: true, patch: { trial: r.next }, plan: r } : r;
  };

export const destinyPlanner =
  (plan: (d: DestinyProgress) => ReturnType<typeof import("@/core").planDestinyCycleEnd>): StonePlanner =>
  ({ destiny }) => {
    const r = plan(destiny);
    return r.ok ? { ok: true, patch: { destiny: r.next }, plan: r } : r;
  };

export async function awardStones(
  store: ProfileStore,
  ownerId: string,
  planner: StonePlanner,
  now: number,
): Promise<AwardOutcome> {
  let granted = 0;
  const r = await updateProfile<AwardError>(
    store,
    ownerId,
    (p: Profile) => {
      if (!isDualTowerV1(p.dualTower)) return { ok: false, error: "unsupported_schema" };
      const planned = planner({ trial: p.dualTower.trial, destiny: p.dualTower.destiny });
      if (!planned.ok) return planned;
      const awarded = applyStoneAward(p, planned.plan.events, planned.patch);
      if (!awarded.ok) return awarded;
      granted = awarded.granted;
      return { ok: true, profile: awarded.profile };
    },
    now,
  );
  return r.ok ? { ok: true, stones: r.stored.profile.stones, granted } : r;
}
