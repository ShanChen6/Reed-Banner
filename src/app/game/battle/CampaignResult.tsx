"use client";
// Lớp phủ kết thúc trận nhiệm vụ Bình Loạn: đạt mục tiêu, qua phase công thành, hoặc thất bại; kèm thưởng lần đầu.

import {
  storyNodeById,
  type CampaignScenarioTag,
  missionCopy,
  type Fighter,
} from "@/core";

import { SceneLink } from "../SceneContext";

import { buttonVariants } from "@/components/ui";

import {
  type Outcome,
} from "./demoSetup";

export interface CampaignResultProps {
  readonly bossThreshold: number | undefined;
  readonly labels: readonly string[];
  readonly outcome: Outcome | null;
  readonly phaseAdvanced: boolean;
  readonly phaseBoss: Fighter | undefined;
  /** Chỉ hiện khi đang chơi nhiệm vụ Bình Loạn. */
  readonly scenario: CampaignScenarioTag;
  readonly scenarioFailed: boolean;
}

export function CampaignResult({
  bossThreshold,
  labels,
  outcome,
  phaseAdvanced,
  phaseBoss,
  scenario,
  scenarioFailed,
}: CampaignResultProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-wood-lo/90 p-4 text-center text-on-wood">
      <p className="text-kicker text-frame-gold">
        {scenario.nodeId} · {storyNodeById(scenario.nodeId)?.title}
      </p>
      <p className="text-xl font-bold">
        {scenarioFailed
          ? "Phòng tuyến chưa giữ được"
          : phaseAdvanced
            ? `Qua giai đoạn ${scenario.phaseIndex + 1}/${labels.length}: ${labels[scenario.phaseIndex]}`
            : "Hoàn thành mục tiêu!"}
      </p>
      {phaseAdvanced ? (
        <p className="max-w-sm text-sm text-on-wood-soft italic">
          {`${bossThreshold ? `${phaseBoss?.name ?? "Trùm"} lui về tuyến trong với ${Math.round((Math.max(0, phaseBoss?.hp ?? 0) / (phaseBoss?.maxHp ?? 1)) * 100)}% máu. ` : ""}Trận chưa kết thúc, nhiệm vụ chưa hoàn thành. Giai đoạn tiếp theo: ${labels[scenario.phaseIndex + 1]}. Lương còn lại mang sang trận sau.`}
        </p>
      ) : (
        // Thắng thì lời kết, thua thì lời thua: đọc đủ mọi câu, không chiếu lời thắng sau trận thua.
        <div className="flex max-h-[40vh] max-w-md flex-col gap-1.5 overflow-y-auto text-sm">
          {(
            (scenarioFailed
              ? missionCopy(scenario.nodeId)?.defeat
              : missionCopy(scenario.nodeId)?.outro) ?? []
          ).map((b, i) => (
            <p
              key={i}
              className={
                b.speaker ? "text-on-wood" : "text-on-wood-soft italic"
              }
            >
              {b.speaker && (
                <span className="font-semibold text-frame-gold">
                  {b.speaker}:{" "}
                </span>
              )}
              {b.speaker ? `“${b.text}”` : b.text}
            </p>
          ))}
        </div>
      )}
      {outcome && (
        <p className="text-sm">
          +{outcome.rewards.xp[0]} kinh nghiệm mỗi người · +
          {outcome.rewards.gold} vàng
          {outcome.campaignV2?.firstClear &&
            ` · thưởng lần đầu +${outcome.campaignV2.totalGold} vàng`}
        </p>
      )}
      <SceneLink
        scene="CAMPAIGN"
        className={buttonVariants({ size: "sm" })}
      >
        {phaseAdvanced ? "Chuẩn bị giai đoạn tiếp" : "Về Bình Loạn"}
      </SceneLink>
    </div>
  );
}
