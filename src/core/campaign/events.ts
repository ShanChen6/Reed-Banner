import { CAMPAIGN_CHOICE_IDS } from "../progress/campaignState";
import {
  STORY_NODES,
  isCombatStoryNode,
  type CampaignMissionId,
} from "./storyNodes";

export type CampaignEventPhase =
  | "meeting"
  | "dialogue"
  | "decision"
  | "completion";
export type CampaignEventKind = "meeting" | "dialogue" | "decision";
export type CampaignHistoricalOutcome =
  | "allianced"
  | "submitted"
  | "dispersed"
  | "defeated";
export type CampaignChoiceTone =
  | "protective"
  | "pragmatic"
  | "resolute";

export interface CampaignEventChoice {
  readonly id: string;
  readonly tone: CampaignChoiceTone;
  /** Presentation key only; choices never change the historical result. */
  readonly narrationKey: string;
}

export interface CampaignEventDefinition {
  readonly nodeId: CampaignMissionId;
  readonly kind: CampaignEventKind;
  readonly phases: readonly CampaignEventPhase[];
  readonly participants: readonly string[];
  readonly choices: readonly CampaignEventChoice[];
  readonly outcome?: CampaignHistoricalOutcome;
}

const OUTCOMES: Readonly<
  Partial<Record<CampaignMissionId, CampaignHistoricalOutcome>>
> = {
  // M05 is the opening audience at Bố Hải; M06 formalizes the alliance.
  M05: "allianced",
  M06: "allianced",
  M08: "allianced",
  M11: "submitted",
  M12: "submitted",
  M13: "submitted",
  M14: "dispersed",
  M15: "defeated",
  M16: "defeated",
  M17: "defeated",
  M18: "defeated",
  M19: "submitted",
  M20: "defeated",
  M21: "defeated",
};

const PARTICIPANTS: Readonly<
  Partial<Record<CampaignMissionId, readonly string[]>>
> = {
  M05: ["dinhBoLinh", "tranLam"],
  M06: ["dinhBoLinh", "tranLam"],
  M08: ["dinhBoLinh", "boHaiCommand"],
  M11: ["dinhBoLinh", "phamBachHo"],
  M12: ["dinhBoLinh", "ngoXuongXi"],
  M13: ["dinhBoLinh", "ngoNhatKhanh"],
  M14: ["dinhBoLinh", "tamDaiCommunity"],
  M19: ["dinhBoLinh", "luDuong"],
  M24: ["dinhBoLinh", "dinhLien"],
};

const TONES: readonly CampaignChoiceTone[] = [
  "protective",
  "pragmatic",
  "resolute",
];

function eventKind(nodeId: CampaignMissionId): CampaignEventKind {
  if (nodeId === "M05") return "meeting";
  const node = STORY_NODES.find((candidate) => candidate.id === nodeId)!;
  if (node.type === "diplomacy") return "decision";
  return "dialogue";
}

function phasesFor(kind: CampaignEventKind): readonly CampaignEventPhase[] {
  if (kind === "meeting")
    return ["meeting", "dialogue", "decision", "completion"];
  if (kind === "decision") return ["dialogue", "decision", "completion"];
  return ["dialogue", "decision", "completion"];
}

/** Non-combat event registry. No definition owns a BattleState or foe list. */
export const CAMPAIGN_EVENTS: readonly CampaignEventDefinition[] = STORY_NODES
  .filter((node) => !isCombatStoryNode(node))
  .map((node) => {
    const kind = eventKind(node.id);
    return {
      nodeId: node.id,
      kind,
      phases: phasesFor(kind),
      participants: PARTICIPANTS[node.id] ?? ["dinhBoLinh"],
      choices: (CAMPAIGN_CHOICE_IDS[node.id] ?? []).map((id, index) => ({
        id,
        tone: TONES[index % TONES.length]!,
        narrationKey: `campaign.${node.id}.${id}`,
      })),
      ...(OUTCOMES[node.id] ? { outcome: OUTCOMES[node.id] } : {}),
    };
  });

export function campaignEventByNode(
  nodeId: string,
): CampaignEventDefinition | undefined {
  return CAMPAIGN_EVENTS.find((event) => event.nodeId === nodeId);
}

export function campaignOutcomeForNode(
  nodeId: CampaignMissionId,
): CampaignHistoricalOutcome | undefined {
  return OUTCOMES[nodeId];
}

const EVENT_ERRORS = CAMPAIGN_EVENTS.flatMap((event) => {
  const ids = event.choices.map((choice) => choice.id);
  if (ids.length === 0) return [`${event.nodeId}: event has no choices`];
  if (new Set(ids).size !== ids.length)
    return [`${event.nodeId}: duplicate event choice`];
  if (event.phases.at(-1) !== "completion")
    return [`${event.nodeId}: event does not end in completion`];
  return [];
});
if (EVENT_ERRORS.length > 0)
  throw new Error(`Invalid Campaign event registry: ${EVENT_ERRORS.join("; ")}`);
