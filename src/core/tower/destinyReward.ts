import type { DestinyFighterSnapshot, DestinyRun } from "../progress";

export const DESTINY_TARGETED_HEAL_RATIO = 0.5;
export const DESTINY_FIELD_MEDIC_RATIO = 0.2;
export const DESTINY_RESCUE_RATIO = 0.3;
export const DESTINY_FIELD_MEDIC_MAX_TARGETS = 3;

export type DestinyRecoveryKind = "targeted_heal" | "field_medic" | "rescue";

export interface DestinyRecoveryInput {
  /** Tầng vừa thắng; bắt buộc để retry sau reload không áp reward sang tầng kế. */
  readonly floor: number;
  readonly kind: DestinyRecoveryKind;
  readonly targetIds: readonly string[];
}

export type DestinyRecoveryError =
  | "invalid_run"
  | "invalid_reward"
  | "invalid_phase"
  | "wrong_floor"
  | "invalid_target_count"
  | "duplicate_target"
  | "no_candidates"
  | "fighter_not_in_roster"
  | "target_downed"
  | "target_alive"
  | "target_full_hp"
  | "leader_requires_rescue";

export type DestinyRecoveryResult =
  | { readonly ok: true; readonly run: DestinyRun; readonly changed: boolean }
  | { readonly ok: false; readonly error: DestinyRecoveryError; readonly fighterId?: string };

const isWounded = (fighter: DestinyFighterSnapshot) =>
  !fighter.downed && fighter.hp > 0 && fighter.hp < fighter.config.maxHp;

/** IDs hợp lệ cho reward, theo thứ tự roster khóa. */
export function destinyRecoveryCandidates(run: DestinyRun, kind: DestinyRecoveryKind): readonly string[] {
  if (run.stateVersion !== 1 || !run.fighters) return [];
  return run.roster.filter((id) => {
    const fighter = run.fighters![id];
    return !!fighter && (kind === "rescue" ? fighter.downed && fighter.hp === 0 : isWounded(fighter));
  });
}

function targetCountValid(kind: DestinyRecoveryKind, count: number): boolean {
  return kind === "field_medic"
    ? count >= 1 && count <= DESTINY_FIELD_MEDIC_MAX_TARGETS
    : count === 1;
}

/** Áp đúng một reward hồi phục sau tầng; không đọc Profile, lương hay stone wallet. */
export function applyDestinyRecovery(
  run: DestinyRun,
  input: DestinyRecoveryInput,
): DestinyRecoveryResult {
  if (run.stateVersion !== 1 || !run.fighters) return { ok: false, error: "invalid_run" };
  if (
    !input ||
    !["targeted_heal", "field_medic", "rescue"].includes(input.kind) ||
    !Array.isArray(input.targetIds) ||
    !input.targetIds.every((id) => typeof id === "string")
  ) return { ok: false, error: "invalid_reward" };
  if ((run.rewardedFloor ?? 0) === input.floor && run.floor === input.floor + 1)
    return { ok: true, run, changed: false };
  if (!run.active) return { ok: false, error: "invalid_run" };
  if (run.phase !== "reward" || run.settledFloor !== run.floor)
    return { ok: false, error: "invalid_phase" };
  if (!Number.isInteger(input.floor) || input.floor !== run.floor)
    return { ok: false, error: "wrong_floor" };
  const leader = run.fighters["dinhBoLinh"];
  if ((leader?.downed || leader?.hp === 0) &&
      (input.kind !== "rescue" || input.targetIds.length !== 1 || input.targetIds[0] !== "dinhBoLinh"))
    return { ok: false, error: "leader_requires_rescue" };
  if (!targetCountValid(input.kind, input.targetIds.length))
    return { ok: false, error: "invalid_target_count" };
  if (new Set(input.targetIds).size !== input.targetIds.length)
    return { ok: false, error: "duplicate_target" };
  if (destinyRecoveryCandidates(run, input.kind).length === 0)
    return { ok: false, error: "no_candidates" };

  for (const id of input.targetIds) {
    const fighter = run.fighters[id];
    if (!run.roster.includes(id) || !fighter)
      return { ok: false, error: "fighter_not_in_roster", fighterId: id };
    if (input.kind === "rescue") {
      if (!fighter.downed || fighter.hp !== 0)
        return { ok: false, error: "target_alive", fighterId: id };
    } else {
      if (fighter.downed || fighter.hp <= 0)
        return { ok: false, error: "target_downed", fighterId: id };
      if (!isWounded(fighter))
        return { ok: false, error: "target_full_hp", fighterId: id };
    }
  }

  const ratio = input.kind === "targeted_heal"
    ? DESTINY_TARGETED_HEAL_RATIO
    : input.kind === "field_medic"
      ? DESTINY_FIELD_MEDIC_RATIO
      : DESTINY_RESCUE_RATIO;
  const fighters = { ...run.fighters };
  for (const id of input.targetIds) {
    const fighter = run.fighters[id]!;
    const amount = Math.max(1, Math.round(fighter.config.maxHp * ratio));
    fighters[id] = input.kind === "rescue"
      ? { ...fighter, hp: Math.min(fighter.config.maxHp, amount), energy: 0, downed: false }
      : { ...fighter, hp: Math.min(fighter.config.maxHp, fighter.hp + amount) };
  }

  return {
    ok: true,
    changed: true,
    run: {
      ...run,
      fighters,
      hp: Object.fromEntries(run.roster.map((id) => {
        const fighter = fighters[id]!;
        return [id, fighter.hp / fighter.config.maxHp];
      })),
      rewardedFloor: input.floor,
      floor: input.floor + 1,
      phase: "prepare",
      offer: null,
    },
  };
}
