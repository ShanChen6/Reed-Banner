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
