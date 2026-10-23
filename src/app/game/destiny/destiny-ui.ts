import {
  ELEMENTS,
  MAIN_ID,
  PROFESSIONS,
  leaderBuildOptions,
  validateLineup,
  type DestinyLeaderBuild,
  type DestinyRewardOffer,
  type DestinyRun,
  type FloorRules,
} from "@/core";

export const DESTINY_ERROR_TEXT: Readonly<Record<string, string>> = {
  bad_request: "Dữ liệu gửi lên không hợp lệ.",
  invalid_roster: "Roster này không có đội hợp luật cho toàn chu kỳ.",
  invalid_lineup: "Đội active không hợp luật tầng hoặc có tướng đã gục.",
  invalid_phase: "Run đã đổi trạng thái ở tab khác. Hãy tải lại.",
  stale_reward: "Phần thưởng này đã được xử lý hoặc không còn hiệu lực.",
  invalid_reward: "Mục tiêu phần thưởng không hợp lệ.",
  conflict: "Dữ liệu vừa thay đổi ở tab khác. Hãy thử lại.",
  cycle_expired: "Chu kỳ đã kết thúc. Hãy bắt đầu run mới.",
  run_exists: "Đã có run trong chu kỳ này.",
  network: "Không kết nối được máy chủ.",
};

export function aliveIds(run: DestinyRun): readonly string[] {
  return run.roster.filter((id) => {
    const fighter = run.fighters?.[id];
    return fighter && !fighter.downed && fighter.hp > 0;
  });
}

export function legalLeaderBuilds(
  run: DestinyRun,
  rules: FloorRules,
  activeIds: readonly string[],
): readonly DestinyLeaderBuild[] {
  if (!run.fighters || activeIds.length !== 3 || activeIds[0] !== MAIN_ID) return [];
  const companions = activeIds.slice(1).flatMap((id) => {
    const fighter = run.fighters?.[id];
    return fighter ? [{ id, element: fighter.config.element, profession: fighter.config.profession }] : [];
  });
  return companions.length === 2 ? leaderBuildOptions(rules, MAIN_ID, companions) : [];
}

export function lineupLegal(
  run: DestinyRun,
  rules: FloorRules,
  activeIds: readonly string[],
  build: DestinyLeaderBuild,
): boolean {
  if (!run.fighters || activeIds.length !== 3 || activeIds[0] !== MAIN_ID ||
      activeIds.some((id) => !aliveIds(run).includes(id))) return false;
  const members = activeIds.map((id) => id === MAIN_ID
    ? { id, ...build }
    : { id, element: run.fighters![id]!.config.element, profession: run.fighters![id]!.config.profession });
  return validateLineup(rules, members, MAIN_ID).ok;
}

export function defaultDestinyBuild(
  run: DestinyRun,
  rules: FloorRules,
  activeIds: readonly string[],
): DestinyLeaderBuild {
  return legalLeaderBuilds(run, rules, activeIds)[0] ?? { element: ELEMENTS[0], profession: PROFESSIONS[0] };
}

export function rewardTargetLimit(offer: DestinyRewardOffer): { min: number; max: number; downed: boolean } {
  switch (offer.kind) {
    case "targeted_heal": return { min: 1, max: 1, downed: false };
    case "field_medic": return { min: 1, max: 3, downed: false };
    case "rescue": return { min: 1, max: 1, downed: true };
    case "boon": return { min: 0, max: 0, downed: false };
  }
}

export function rewardCandidates(run: DestinyRun, offer: DestinyRewardOffer): readonly string[] {
  if (!run.fighters || offer.kind === "boon") return [];
  const target = rewardTargetLimit(offer);
  return run.roster.filter((id) => {
    const fighter = run.fighters![id]!;
    return target.downed ? fighter.downed || fighter.hp <= 0 : !fighter.downed && fighter.hp > 0 && fighter.hp < fighter.config.maxHp;
  });
}
