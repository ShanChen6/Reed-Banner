// Tổng quan chiến dịch suy ra hoàn toàn từ state server: số sứ quân theo kết cục, nhiệm vụ còn thiếu tới M24
// và hai tuyến địa lý mở sau Chương III (freeze mục 2.2), tổng kết từng vùng và cửa vào Đỗ Động. Không ghi gì vào
// hồ sơ.

import {
  campaignNodeUnlocked,
  chapterCompleted,
  type CampaignProgressV2,
} from "../progress/campaignState";
import {
  CAMPAIGN_FACTION_RESOLUTIONS,
  campaignFactionView,
  factionResolutionOfMission,
  type CampaignFactionStatus,
  type CampaignFactionView,
} from "./factions";
import {
  CAMPAIGN_MISSION_IDS,
  isCombatStoryNode,
  storyNodeById,
  type CampaignChapter,
  type CampaignMissionId,
} from "./storyNodes";

export interface CampaignFactionTally {
  readonly allied: number;
  readonly submitted: number;
  readonly dispersed: number;
  readonly defeated: number;
  /** Sứ quân chưa có kết cục trong hồ sơ. */
  readonly unresolved: number;
}

export function campaignFactionTally(
  campaign: CampaignProgressV2,
): CampaignFactionTally {
  const tally: Record<CampaignFactionStatus | "unresolved", number> = {
    allied: 0,
    submitted: 0,
    dispersed: 0,
    defeated: 0,
    unresolved: 0,
  };
  for (const r of CAMPAIGN_FACTION_RESOLUTIONS) {
    const record = campaign.factions[r.faction];
    tally[record ? record.status : "unresolved"] += 1;
  }
  return tally;
}

/** Nhiệm vụ chưa hoàn thành, theo thứ tự ID. */
export function campaignMissionsRemaining(
  campaign: CampaignProgressV2,
): readonly CampaignMissionId[] {
  return CAMPAIGN_MISSION_IDS.filter((id) => !campaign.completed.includes(id));
}

export interface CampaignRoute {
  readonly id: "west" | "east";
  readonly chapter: CampaignChapter;
  readonly name: string;
  readonly missions: readonly CampaignMissionId[];
}

/** Hai tuyến địa lý sau Chương III. Thứ tự đi tuyến nào trước là của game, không phải lịch sử. */
export const CAMPAIGN_ROUTES: readonly CampaignRoute[] = [
  {
    id: "west",
    chapter: 4,
    name: "Tuyến tây",
    missions: ["M13", "M14", "M15", "M16"],
  },
  {
    id: "east",
    chapter: 5,
    name: "Tuyến đông",
    missions: ["M17", "M18", "M19", "M20"],
  },
];

export interface CampaignRouteStatus {
  readonly route: CampaignRoute;
  readonly open: boolean;
  readonly done: number;
  /** Nhiệm vụ kế tiếp server cho phép (đã mở, chưa xong), nếu có. */
  readonly next?: CampaignMissionId;
}

export function campaignRouteStatus(
  campaign: CampaignProgressV2,
): readonly CampaignRouteStatus[] {
  return CAMPAIGN_ROUTES.map((route) => {
    const next = route.missions.find(
      (id) =>
        !campaign.completed.includes(id) && campaignNodeUnlocked(campaign, id),
    );
    return {
      route,
      open: campaignNodeUnlocked(campaign, route.missions[0]!),
      done: route.missions.filter((id) => campaign.completed.includes(id))
        .length,
      ...(next ? { next } : {}),
    };
  });
}

/** Hội quân Hoa Lư (tổng kết giai đoạn chính trị) hiện khi server đã ghi đủ Chương III. */
export function campaignMusterReady(campaign: CampaignProgressV2): boolean {
  return chapterCompleted(campaign, 3);
}

/** Tên ngắn của nhiệm vụ để hiện trong danh sách còn thiếu. */
export function missionLabel(id: CampaignMissionId): string {
  return `${id} ${storyNodeById(id)?.title ?? ""}`.trim();
}

export type CampaignRegionState = "completed" | "open" | "locked";

export interface CampaignRouteRegion {
  readonly mission: CampaignMissionId;
  readonly place: string;
  readonly state: CampaignRegionState;
  /** Kết cục sứ quân đã ghi trong hồ sơ (chỉ có khi nhiệm vụ đã hoàn thành). */
  readonly faction?: CampaignFactionView;
  /** Nhiệm vụ có trận: đánh lại được, không nhận thưởng nhiệm vụ lần hai. */
  readonly battle: boolean;
  readonly bestTurns?: number;
}

export interface CampaignRouteSummary {
  readonly route: CampaignRoute;
  readonly regions: readonly CampaignRouteRegion[];
  readonly complete: boolean;
}

/** Tổng kết từng vùng của một tuyến, suy hoàn toàn từ hồ sơ server. */
export function campaignRouteSummary(
  campaign: CampaignProgressV2,
  routeId: CampaignRoute["id"],
): CampaignRouteSummary {
  const route = CAMPAIGN_ROUTES.find((r) => r.id === routeId)!;
  const regions = route.missions.map((mission): CampaignRouteRegion => {
    const node = storyNodeById(mission)!;
    const done = campaign.completed.includes(mission);
    const fate = factionResolutionOfMission(mission);
    const best = campaign.bestBattleTurns[mission];
    return {
      mission,
      place: node.location.name,
      state: done
        ? "completed"
        : campaignNodeUnlocked(campaign, mission)
          ? "open"
          : "locked",
      ...(done && fate
        ? { faction: campaignFactionView(campaign.factions, fate.faction) }
        : {}),
      battle: isCombatStoryNode(node),
      ...(best !== undefined ? { bestTurns: best } : {}),
    };
  });
  return {
    route,
    regions,
    complete: regions.every((r) => r.state === "completed"),
  };
}

/** Cửa vào Đỗ Động (M21): cần cả hai tuyến; liệt kê các vùng còn thiếu theo thứ tự tuyến. */
export function campaignFinaleGate(campaign: CampaignProgressV2): {
  readonly ready: boolean;
  readonly missing: readonly CampaignMissionId[];
} {
  const missing = CAMPAIGN_ROUTES.flatMap((r) =>
    r.missions.filter((id) => !campaign.completed.includes(id)),
  );
  return {
    ready: campaignNodeUnlocked(campaign, "M21"),
    missing,
  };
}
