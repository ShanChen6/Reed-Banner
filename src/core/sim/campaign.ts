// Mô phỏng một màn chiến dịch: đội người chơi dựng theo tiến trình tự dựng ở một cấp, đấu đội của màn với
// đúng luật màn (lương, tỉ lệ ô, máu trùm). AI Thường đánh thay người chơi, đối thủ theo độ khó của màn.
// Dùng để cân cấp gợi ý, xem docs/design/09-che-do-choi.md mục 2.1.

import type { FighterConfig, SideIndex } from "../battle";
import {
  CAMPAIGN,
  recommendedLevel,
  stageFoes,
  type CampaignStage,
} from "../campaign";
import type { Element } from "../battle";
import {
  autoProgress,
  buildCompanion,
  buildHero,
  buildMain,
  CAMPAIGN_FOOD_START,
  DEFAULT_TEAM,
} from "../progress";
import { companionById, isHero } from "../roster";
import type { Matchup } from "./sim";

/**
 * Đội kèm của người chơi: "default" là đội khởi đầu (Hà Vân, Mai Thanh); "heroes" là 2 tướng lịch sử gia
 * nhập gần nhất trước màn này (chưa đủ 2 thì bù bằng đội khởi đầu).
 */
export type StageTeam = "default" | "heroes";

export interface StageSimOptions {
  /** Cấp của cả đội người chơi; bỏ trống là cấp gợi ý của màn. */
  readonly level?: number;
  /** Nguyên tố của Đinh Bộ Lĩnh; bỏ trống thì xoay vòng 7 hệ theo trận để không lệch theo một hệ. */
  readonly element?: Element;
  readonly team?: StageTeam;
  readonly food?: number;
}

/** Id 2 nhân vật kèm người chơi mang vào màn theo `team`. */
export function stageTeamIds(stage: CampaignStage, team: StageTeam): string[] {
  if (team === "default") return [...DEFAULT_TEAM];
  const before = CAMPAIGN.slice(0, CAMPAIGN.indexOf(stage)).flatMap((s) =>
    s.joins ? [s.joins] : [],
  );
  return [
    ...before.slice(-2),
    ...DEFAULT_TEAM.filter((id) => !before.includes(id)),
  ].slice(0, 2);
}

function companionAt(id: string, level: number): FighterConfig {
  const base = companionById(id)!;
  if (isHero(id)) return buildHero(base, autoProgress(level, null));
  const p = autoProgress(level, base.profession, id);
  return buildCompanion(base, p, p.branches[0]);
}

/** Đội người chơi ở một màn. 1vs1 chỉ có Đinh Bộ Lĩnh. */
export function stagePlayerTeam(
  stage: CampaignStage,
  options: StageSimOptions = {},
): FighterConfig[] {
  const level = options.level ?? recommendedLevel(stage);
  const main = buildMain(
    autoProgress(level, null),
    options.element ?? "moc",
    "tuongSi",
  );
  if (stage.mode === "1v1") return [main];
  return [
    main,
    ...stageTeamIds(stage, options.team ?? "heroes").map((id) =>
      companionAt(id, level),
    ),
  ];
}

/** `count` trận của một màn, phe đi trước luân phiên. Phe 0 là người chơi. */
export function stageMatchups(
  stage: CampaignStage,
  count: number,
  seed = 1,
  options: StageSimOptions = {},
): Matchup[] {
  const player = stagePlayerTeam(stage, options);
  const foes = stageFoes(stage);
  return Array.from({ length: count }, (_, i) => ({
    sides: [
      {
        fighters: player,
        leader: 0,
        food: options.food ?? CAMPAIGN_FOOD_START,
      },
      {
        fighters: foes,
        leader: 0,
        ...(stage.foeFood !== undefined ? { food: stage.foeFood } : {}),
      },
    ],
    seed: (seed + i * 7919) >>> 0,
    firstSide: (i % 2) as SideIndex,
    ...(stage.weights ? { weights: stage.weights } : {}),
  }));
}
