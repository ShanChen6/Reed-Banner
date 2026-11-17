export type SurvivalRosterSelectionError =
  | "activeCount"
  | "duplicateFighter"
  | "unownedFighter"
  | "tooManyReserves";

export interface SurvivalRosterPayload {
  readonly companions: readonly string[];
  readonly reserveCompanions: readonly string[];
}

export function validateSurvivalRosterSelection(
  ownedIds: readonly string[],
  activeIds: readonly string[],
  reserveIds: readonly string[],
): SurvivalRosterSelectionError | null {
  if (activeIds.length !== 2 || activeIds.some((id) => !id))
    return "activeCount";
  if (reserveIds.length > 2) return "tooManyReserves";

  const selectedIds = [...activeIds, ...reserveIds.filter(Boolean)];
  if (new Set(selectedIds).size !== selectedIds.length)
    return "duplicateFighter";
  const owned = new Set(ownedIds);
  if (selectedIds.some((id) => !owned.has(id)))
    return "unownedFighter";
  return null;
}

export function survivalRosterPayload(
  activeIds: readonly string[],
  reserveIds: readonly string[],
): SurvivalRosterPayload {
  return {
    companions: [...activeIds],
    reserveCompanions: reserveIds.filter(Boolean),
  };
}

/** Bốn ô chọn trước lượt chơi: phó tướng 1, phó tướng 2, dự bị 1, dự bị 2; ô trống là chuỗi rỗng. */
export type SurvivalSlots = readonly [string, string, string, string];

export const EMPTY_SURVIVAL_SLOTS: SurvivalSlots = ["", "", "", ""];

export const SURVIVAL_SLOT_LABEL = [
  "Phó tướng 1",
  "Phó tướng 2",
  "Dự bị 1",
  "Dự bị 2",
] as const;

/** Ô sẽ nhận tướng kế tiếp: ô người chơi đang chọn, không thì ô trống đầu tiên (phó tướng trước dự bị). */
export function survivalTargetSlot(
  slots: SurvivalSlots,
  focus: number | null,
): number | null {
  if (focus !== null && focus >= 0 && focus < slots.length) return focus;
  const empty = slots.indexOf("");
  return empty >= 0 ? empty : null;
}

/**
 * Bấm một tướng trong danh sách: đang ở ô nào thì rút ra (ô đó thành ô đang chọn); chưa có thì đặt vào ô đích,
 * thay người đang đứng ở đó. Đội đủ bốn và không chọn ô nào thì giữ nguyên.
 */
export function toggleSurvivalSlot(
  slots: SurvivalSlots,
  id: string,
  focus: number | null,
): { readonly slots: SurvivalSlots; readonly focus: number | null } {
  const next = [...slots] as [string, string, string, string];
  const at = slots.indexOf(id);
  if (at >= 0) {
    next[at] = "";
    return { slots: next, focus: at };
  }
  const target = survivalTargetSlot(slots, focus);
  if (target === null) return { slots, focus };
  next[target] = id;
  return { slots: next, focus: null };
}

/** Bỏ các id không còn sở hữu (hoặc trùng) khỏi bản chọn đã nhớ. */
export function cleanSurvivalSlots(
  raw: unknown,
  ownedIds: readonly string[],
): SurvivalSlots | null {
  if (!Array.isArray(raw) || raw.length !== 4) return null;
  const owned = new Set(ownedIds);
  const seen = new Set<string>();
  const out = raw.map((id) => {
    if (typeof id !== "string" || !owned.has(id) || seen.has(id)) return "";
    seen.add(id);
    return id;
  });
  return out as unknown as SurvivalSlots;
}

/** Gợi ý đội: bốn tướng cấp cao nhất (bằng cấp thì chỉ số tổng cao hơn), hai người đầu ra trận. */
export function suggestSurvivalSlots(
  fighters: readonly { readonly id: string; readonly level: number; readonly power: number }[],
): SurvivalSlots {
  const top = [...fighters]
    .sort((a, b) => b.level - a.level || b.power - a.power || a.id.localeCompare(b.id))
    .slice(0, 4)
    .map((f) => f.id);
  return [top[0] ?? "", top[1] ?? "", top[2] ?? "", top[3] ?? ""];
}
