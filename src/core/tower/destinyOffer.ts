import { type DestinyRewardOffer, type DestinyRun } from "../progress";
import { createRng } from "../rng";
import { destinyBoonOffer } from "./destinyBoons";
import { destinyRecoveryCandidates } from "./destinyReward";
import { hashString } from "./floorContract";

export const DESTINY_OFFER_SIZE = 3;

/** Ba lựa chọn hữu ích, xác định bởi cycle/floor; không có Cứu viện khi không ai gục. */
export function generateDestinyOffer(run: DestinyRun): readonly DestinyRewardOffer[] {
  if (!run.cycleId || run.stateVersion !== 1 || !run.fighters) return [];
  const candidates: DestinyRewardOffer[] = [];
  if (destinyRecoveryCandidates(run, "targeted_heal").length > 0)
    candidates.push({ kind: "targeted_heal" });
  if (destinyRecoveryCandidates(run, "field_medic").length > 0)
    candidates.push({ kind: "field_medic" });
  if (destinyRecoveryCandidates(run, "rescue").length > 0)
    candidates.push({ kind: "rescue" });
  candidates.push(...destinyBoonOffer(run, DESTINY_OFFER_SIZE).map((boonId) => ({ kind: "boon" as const, boonId })));

  const rng = createRng(hashString(`reward|${run.cycleId}|${run.floor}`));
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [candidates[i], candidates[j]] = [candidates[j]!, candidates[i]!];
  }
  return candidates.slice(0, DESTINY_OFFER_SIZE);
}
