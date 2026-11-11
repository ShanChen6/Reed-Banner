import {
  ELEMENTS,
  MAIN_ID,
  PROFESSIONS,
  leaderBuildOptions,
  validateLineup,
  type DestinyBoon,
  type DestinyBoonRarity,
  type DestinyLeaderBuild,
  type DestinyRewardOffer,
  type DestinyRun,
  type FloorRules,
} from "@/core";

export const DESTINY_ERROR_TEXT: Readonly<Record<string, string>> = {
  featureDisabled: "Tháp Thiên Mệnh đang tạm đóng; tiến trình và trận dở được giữ nguyên.",
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
  return legalLeaderBuilds(run, rules, activeIds)[0] ?? { element: ELEMENTS[0], profession: PROFESSIONS[0]! };
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

export const DESTINY_RARITY_NAME: Readonly<Record<DestinyBoonRarity, string>> = {
  common: "Thường",
  rare: "Hiếm",
  epic: "Cực hiếm",
};

/** Tên và mô tả một lần cộng dồn; số liệu khớp DESTINY_BOON_CATALOG ở core. */
export const DESTINY_BOON_TEXT: Readonly<Record<DestinyBoon, { readonly name: string; readonly body: string }>> = {
  atk: { name: "Mài gươm", body: "Cả đội +10% công." },
  def: { name: "Giáp dày", body: "Cả đội +15% thủ." },
  hp: { name: "Cường thân", body: "Cả đội +10% máu tối đa." },
  elementalEdge: { name: "Đồng hệ", body: "Tướng cùng hệ với thủ lĩnh +8% công." },
  armoredFormation: { name: "Trận giáp", body: "Tướng đang mang trang bị +8% thủ." },
  supplyCache: { name: "Tiếp tế", body: "Mỗi tướng vào trận có thêm 10 năng lượng." },
  battleDrum: { name: "Trống trận", body: "Vào trận có thêm 10 Nộ khí." },
  granary: { name: "Kho lương", body: "Nhận ngay 15 lương (tối đa 100)." },
  vanguard: { name: "Tiên phong", body: "Thủ lĩnh +8% công." },
  professionUnity: { name: "Đồng nghề", body: "Tướng cùng nghề với thủ lĩnh +8% thủ." },
  lastStand: { name: "Tử chiến", body: "Tướng vào trận dưới 50% máu +12% công." },
  rearGuard: { name: "Hậu quân", body: "Sau mỗi tầng thắng, tướng dự bị còn sống hồi 5% máu." },
  terrain: { name: "Địa lợi", body: "Bàn cờ ra nhiều ô hợp hệ thủ lĩnh hơn, bớt ô vàng và sách." },
  recuperate: { name: "Dưỡng sức", body: "Sau mỗi tầng thắng, tướng vừa ra trận còn sống hồi 4% máu." },
  mandate: { name: "Quân lệnh", body: "Cả đội +5% công, thủ và máu tối đa. Chỉ xuất hiện từ tầng 11." },
};
