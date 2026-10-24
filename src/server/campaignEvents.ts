import {
  campaignEventByNode,
  campaignNodeUnlocked,
  applyCampaignFirstClear,
  isCampaignMissionId,
  type CampaignEventDefinition,
  type CampaignHistoricalOutcome,
  type CampaignMissionId,
  type Profile,
} from "@/core";
import { updateProfile, type ProfileStore } from "./profiles";

export interface CampaignEventInput {
  readonly eventId: string;
  readonly nodeId: CampaignMissionId;
  readonly choice: string;
}

export interface CampaignEventOutcome {
  readonly eventId: string;
  readonly nodeId: CampaignMissionId;
  readonly choice: string;
  readonly narrationKey: string;
  readonly historicalOutcome?: CampaignHistoricalOutcome;
  readonly firstClear: boolean;
  readonly rewardGold: number;
}

export type CampaignEventError =
  | "badRequest"
  | "notEvent"
  | "locked"
  | "invalidChoice"
  | "conflict";

export type CampaignEventResult =
  | {
      readonly ok: true;
      readonly outcome: CampaignEventOutcome;
      readonly profile: Profile;
      readonly version: number;
    }
  | { readonly ok: false; readonly error: CampaignEventError };

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseCampaignEventInput(
  raw: unknown,
): CampaignEventInput | null {
  if (!object(raw)) return null;
  const { eventId, nodeId, choice } = raw;
  if (
    typeof eventId !== "string" ||
    !/^[A-Za-z0-9_-]{8,80}$/.test(eventId) ||
    typeof nodeId !== "string" ||
    !isCampaignMissionId(nodeId) ||
    typeof choice !== "string" ||
    choice.length < 1 ||
    choice.length > 80
  )
    return null;
  return { eventId, nodeId, choice };
}

function choiceOf(event: CampaignEventDefinition, choice: string) {
  return event.choices.find((candidate) => candidate.id === choice);
}

/**
 * Server-authoritative non-combat settlement. It never calls battle rewards,
 * quest match recording, gear drops or stone settlement.
 */
export async function completeCampaignEvent(
  store: ProfileStore,
  ownerId: string,
  input: CampaignEventInput,
  now: number,
): Promise<CampaignEventResult> {
  const event = campaignEventByNode(input.nodeId);
  if (!event) return { ok: false, error: "notEvent" };
  const selected = choiceOf(event, input.choice);
  if (!selected) return { ok: false, error: "invalidChoice" };
  let settled: CampaignEventOutcome | undefined;

  const updated = await updateProfile(
    store,
    ownerId,
    (profile) => {
      if (!campaignNodeUnlocked(profile.campaign, input.nodeId))
        return { ok: false as const, error: "locked" as const };
      const previousChoice = profile.campaign.storyChoices[input.nodeId];
      if (
        profile.campaign.completed.includes(input.nodeId) &&
        previousChoice !== undefined &&
        previousChoice !== input.choice
      )
        return { ok: false as const, error: "invalidChoice" as const };

      const completion = applyCampaignFirstClear(profile, {
        nodeId: input.nodeId,
        source: "event",
        choice: input.choice,
        flags: ["choiceSubmitted", "outroViewed"],
      });
      if (!completion.ok)
        return {
          ok: false as const,
          error:
            completion.error === "invalidChoice"
              ? ("invalidChoice" as const)
              : ("locked" as const),
        };

      const firstClear = completion.reward.firstClear;
      const rewardGold = completion.reward.totalGold;
      settled = {
        eventId: input.eventId,
        nodeId: input.nodeId,
        choice: input.choice,
        narrationKey: selected.narrationKey,
        ...(event.outcome ? { historicalOutcome: event.outcome } : {}),
        firstClear,
        rewardGold,
      };
      return {
        ok: true as const,
        profile: completion.profile,
      };
    },
    now,
  );

  if (!updated.ok) return { ok: false, error: updated.error };
  return {
    ok: true,
    outcome: settled!,
    profile: updated.stored.profile,
    version: updated.stored.version,
  };
}

export function campaignEventHttpStatus(error: CampaignEventError): number {
  if (error === "badRequest") return 400;
  if (error === "conflict") return 409;
  return 422;
}
