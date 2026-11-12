import {
  ELEMENTS,
  MAIN_ID,
  PROFESSIONS,
  destinyFloorTier,
  destinyTierDifficulty,
  leaderBuildOptions,
  vnDay,
  validateLineup,
  type DestinyBoon,
  type DestinyBoonRarity,
  type DestinyLeaderBuild,
  type DestinyRewardOffer,
  type DestinyRulesVersion,
  type DestinyRun,
  type Element,
  type FloorRules,
  type Profession,
} from "@/core";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";

/** Mã lỗi từ API. Dùng từ của người chơi: "lượt leo" (một lần leo tháp với đội đã khóa), "đội hình", "tướng ra trận". */
export const DESTINY_ERROR_TEXT: Readonly<Record<string, string>> = {
  featureDisabled: "Tháp Thiên Mệnh đang tạm đóng. Tiến trình và trận đang dở được giữ nguyên.",
  bad_request: "Yêu cầu không hợp lệ. Hãy tải lại trang rồi thử lại.",
  invalid_roster: "Đội hình này không xếp được ba tướng hợp luật cho mọi tầng của chu kỳ. Hãy chọn thêm tướng.",
  invalid_lineup: "Ba tướng ra trận chưa hợp luật tầng, hoặc có tướng đã gục.",
  invalid_phase: "Lượt leo vừa thay đổi ở một thiết bị hoặc thẻ khác. Hãy tải lại trang.",
  stale_reward: "Phần thưởng này đã được nhận hoặc không còn hiệu lực.",
  invalid_reward: "Chưa chọn đúng tướng nhận phần thưởng này.",
  conflict: "Dữ liệu vừa thay đổi ở nơi khác. Hãy thử lại.",
  cycle_expired: "Chu kỳ đã kết thúc. Hãy khóa đội hình và bắt đầu lượt leo mới.",
  run_exists: "Bạn đang có một lượt leo trong chu kỳ này.",
  floor_not_found: "Không tìm thấy tầng này. Hãy tải lại trang.",
  invalid_secret: "Máy chủ chưa sẵn sàng cho Tháp Thiên Mệnh. Hãy thử lại sau.",
  unsupported_schema: "Dữ liệu Song Tháp của bạn thuộc phiên bản mới hơn, chưa chơi được ở bản này.",
  network: "Không kết nối được máy chủ. Hãy kiểm tra mạng rồi thử lại.",
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

/** Tên và mô tả một lần chọn (chọn lại thì cộng dồn); số liệu khớp DESTINY_BOON_CATALOG ở core. */
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
  lastStand: { name: "Tử chiến", body: "Tướng vào trận khi còn dưới 50% máu được +12% công." },
  rearGuard: { name: "Hậu quân", body: "Sau mỗi tầng thắng, tướng dự bị còn sống hồi 5% máu." },
  terrain: { name: "Địa lợi", body: "Bàn cờ ra nhiều ô hợp hệ thủ lĩnh hơn, bớt ô vàng và sách." },
  recuperate: { name: "Dưỡng sức", body: "Sau mỗi tầng thắng, tướng vừa ra trận còn sống hồi 4% máu." },
  mandate: { name: "Quân lệnh", body: "Cả đội +5% công, thủ và máu tối đa." },
};

export interface DestinyCompanionOption {
  readonly id: string;
  readonly name: string;
  readonly element: Element;
  readonly profession: Profession;
  readonly hp: number;
  readonly maxHp: number;
  readonly energy: number;
  readonly selected: boolean;
  readonly disabled: boolean;
  /** Lý do không chọn được, hiện cho người chơi. */
  readonly reason: string | null;
}

/**
 * Tướng trong đội hình đã khóa (trừ thủ lĩnh) cho bước chọn người ra trận. Tướng gục hoặc bị luật tầng cấm
 * thì khóa kèm lý do; đã đủ 2 người thì các tướng còn lại khóa tạm. Tướng đang chọn luôn bấm được để bỏ chọn.
 */
export function destinyCompanionOptions(
  run: DestinyRun,
  rules: FloorRules,
  activeIds: readonly string[],
): readonly DestinyCompanionOption[] {
  const full = activeIds.filter((id) => id !== MAIN_ID).length >= 2;
  return run.roster.filter((id) => id !== MAIN_ID).flatMap((id) => {
    const fighter = run.fighters?.[id];
    if (!fighter) return [];
    const { element, profession, name, maxHp } = fighter.config;
    const selected = activeIds.includes(id);
    const reason = fighter.downed || fighter.hp <= 0 ? "Đã gục, cần Cứu viện"
      : rules.bannedElements?.includes(element) ? `Hệ ${ELEMENT_NAME[element]} bị cấm ở tầng này`
      : rules.bannedProfessions?.includes(profession) ? `Nghề ${PROFESSION_NAME[profession]} bị cấm ở tầng này`
      : !selected && full ? "Đã đủ 2 tướng, bỏ chọn một người để đổi"
      : null;
    return [{
      id, name, element, profession, hp: fighter.hp, maxHp, energy: fighter.energy,
      selected, disabled: reason !== null && !selected, reason,
    }];
  });
}

export interface DestinyTierSpan {
  readonly tier: number;
  readonly from: number;
  readonly to: number;
  readonly difficulty: ReturnType<typeof destinyTierDifficulty>;
}

/** Các chặng của tháp (nhóm tầng cùng độ khó), để vẽ hành trình. */
export function destinyTierSpans(floorCount: number, version: DestinyRulesVersion): readonly DestinyTierSpan[] {
  const spans: DestinyTierSpan[] = [];
  for (let floor = 1; floor <= floorCount; floor++) {
    const tier = destinyFloorTier(floor, version);
    const last = spans.at(-1);
    if (last && last.tier === tier) spans[spans.length - 1] = { ...last, to: floor };
    else spans.push({ tier, from: floor, to: floor, difficulty: destinyTierDifficulty(tier) });
  }
  return spans;
}

const dayMonth = (time: number) => {
  const [, month, day] = vnDay(time).split("-");
  return `${day}/${month}`;
};

/** "16/11 – 22/11" theo giờ Việt Nam; ngày cuối là ngày còn chơi được. */
export const formatCycleRange = (startAt: number, endAt: number): string =>
  `${dayMonth(startAt)} – ${dayMonth(endAt - 1)}`;

/** Thời gian còn lại của chu kỳ, làm tròn xuống: "còn 4 ngày", "còn 5 giờ", "còn dưới 1 giờ". */
export function formatCycleLeft(endAt: number, now: number): string {
  const hours = Math.floor((endAt - now) / 3_600_000);
  if (hours < 0) return "đã kết thúc";
  if (hours < 1) return "còn dưới 1 giờ";
  return hours < 24 ? `còn ${hours} giờ` : `còn ${Math.floor(hours / 24)} ngày`;
}
