import {
  EMPTY_LOADOUT,
  buildMain,
  equip,
  withGear,
  type Element,
  type Profession,
  type SurvivalBreakView,
} from "@/core";
import type { SurvivalAction } from "@/core";

export interface SurvivalTacticalDraft {
  readonly activeIds: readonly string[];
  readonly profession: Profession;
  readonly element: Element;
  readonly reviveId?: string;
}

export function previewLeaderBuild(
  basis: NonNullable<SurvivalBreakView["leaderBuildBasis"]>,
  profession: Profession,
  element: Element,
) {
  let loadout = EMPTY_LOADOUT;
  for (const item of basis.equipment) {
    const result = equip(loadout, item);
    if (!result.ok) return null;
    loadout = result.loadout;
  }
  const config = withGear(
    buildMain(basis.progress, element, profession),
    loadout,
  );
  const hp = basis.hp === 0
    ? 0
    : Math.max(1, Math.min(config.maxHp, Math.round(basis.hpRatio * config.maxHp)));
  return { config, hp };
}

export function validTacticalLineup(
  activeIds: readonly string[],
  originalActiveIds: readonly string[],
  fighters: SurvivalBreakView["fighters"],
): boolean {
  if (
    activeIds.length !== 3 ||
    activeIds[0] !== "dinhBoLinh" ||
    new Set(activeIds).size !== 3
  )
    return false;
  const byId = new Map(fighters.map((fighter) => [fighter.id, fighter]));
  if (activeIds.some((id) => !byId.has(id))) return false;
  const livingReserveRemains = fighters.some(
    (fighter) =>
      !activeIds.includes(fighter.id) &&
      fighter.hpAfterRecovery > 0,
  );
  return activeIds.slice(1).every((id, index) => {
    const fighter = byId.get(id);
    if (!fighter) return false;
    if (fighter.hpAfterRecovery > 0) return true;
    return (
      originalActiveIds[index + 1] === id &&
      !livingReserveRemains
    );
  });
}

export function buildSurvivalNextWaveAction(
  draft: SurvivalTacticalDraft,
  originalActiveIds: readonly string[],
  originalProfession: Profession,
  originalElement: Element,
): SurvivalAction {
  const activeIdsChanged = draft.activeIds.some(
    (id, index) => id !== originalActiveIds[index],
  );
  const buildChanged =
    draft.profession !== originalProfession ||
    draft.element !== originalElement;
  return {
    type: "nextWave",
    ...(draft.reviveId ? { revive: draft.reviveId } : {}),
    ...(activeIdsChanged ? { activeIds: [...draft.activeIds] } : {}),
    ...(buildChanged
      ? {
          leaderBuild: {
            profession: draft.profession,
            element: draft.element,
          },
        }
      : {}),
  };
}
