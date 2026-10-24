import {
  AI_SIDE,
  HUMAN,
  applyDestinyBoonReward,
  applyDestinyRecovery,
  createDestinyFloorBattle,
  createDestinyRun,
  generateDestinyCycleRules,
  generateDestinyOffer,
  hashString,
  isDualTowerV1,
  makeDestinyMatchTag,
  matchOver,
  profileTeam,
  viewOf,
  type DestinyLeaderBuild,
  type DestinyRewardOffer,
  type DestinyRun,
  type BattleEvent,
  type Match,
  type MatchView,
} from "@/core";
import { getBattle, type Deps } from "./battles";
import { loadProfile, updateProfile } from "./profiles";
import type { MatchRecord } from "./store";
import { resolveDestinyFloor } from "./destinyContent";
import { activeDestinyCycle, destinyCycleSeed, publicDestinyCycle } from "./destinyCycle";
import { hasExpiredDestinyRun, reconcileDestinyCycle } from "./destinyExpire";

export type DestinyError =
  | "bad_request"
  | "unsupported_schema"
  | "invalid_secret"
  | "run_exists"
  | "no_run"
  | "cycle_expired"
  | "invalid_phase"
  | "invalid_roster"
  | "invalid_lineup"
  | "floor_not_found"
  | "stale_reward"
  | "invalid_reward"
  | "conflict";

export type DestinyDeps = Deps & { readonly destinySecret: string };

const secretValid = (deps: Deps): deps is DestinyDeps =>
  typeof deps.destinySecret === "string" && deps.destinySecret.length >= 16;

export async function destinyOverview(ownerId: string | null, deps: Deps) {
  const scheduled = activeDestinyCycle(deps.now);
  const cycle = scheduled.ok ? publicDestinyCycle(scheduled.cycle) : null;
  const cycleId = cycle?.cycleId ?? null;
  if (!ownerId) return { supported: true, cycleId, cycle, stones: 0, progress: null, floor: null };
  const reconciled = await reconcileDestinyCycle(deps.profiles, ownerId, deps.now);
  const profile = reconciled.ok ? reconciled.profile : (await loadProfile(deps.profiles, ownerId)).profile;
  if (!isDualTowerV1(profile.dualTower))
    return { supported: false, cycleId, cycle, stones: profile.stones, progress: null, floor: null };
  const progress = profile.dualTower.destiny;
  const run = progress.run;
  const visibleRun = run?.phase === "reward" && run.fighters?.dinhBoLinh?.downed &&
      !run.offer?.some(({ kind }) => kind === "rescue")
    ? { ...run, offer: generateDestinyOffer(run) }
    : run;
  const resolved = run && secretValid(deps) && run.cycleId === cycleId
    ? resolveDestinyFloor(run, deps.destinySecret)
    : null;
  return {
    supported: true,
    cycleId,
    cycle,
    stones: profile.stones,
    progress: { ...progress, run: visibleRun },
    floor: resolved?.ok
      ? { floor: resolved.floor.floor, rules: resolved.floor.rules, difficulty: resolved.floor.difficulty, foes: resolved.floor.foes }
      : null,
  };
}

export async function startDestinyRun(
  ownerId: string,
  raw: unknown,
  deps: Deps,
): Promise<{ readonly ok: true; readonly run: DestinyRun } | { readonly ok: false; readonly error: DestinyError }> {
  if (!secretValid(deps)) return { ok: false, error: "invalid_secret" };
  if (!raw || typeof raw !== "object") return { ok: false, error: "bad_request" };
  const rosterIds = (raw as Record<string, unknown>).rosterIds;
  if (!Array.isArray(rosterIds) || !rosterIds.every((id) => typeof id === "string"))
    return { ok: false, error: "bad_request" };
  const reconciled = await reconcileDestinyCycle(deps.profiles, ownerId, deps.now);
  if (!reconciled.ok) return { ok: false, error: reconciled.error === "unsupported_schema" ? "unsupported_schema" : "conflict" };
  const scheduled = activeDestinyCycle(deps.now);
  if (!scheduled.ok) return { ok: false, error: "bad_request" };
  const cycle = scheduled.cycle;
  const cycleId = cycle.cycleId;
  const rulesSeed = destinyCycleSeed(cycle, deps.destinySecret, "rules");
  if (!rulesSeed) return { ok: false, error: "invalid_secret" };
  let created: DestinyRun | undefined;
  const updated = await updateProfile(
    deps.profiles,
    ownerId,
    (profile) => {
      if (!isDualTowerV1(profile.dualTower))
        return { ok: false as const, error: "unsupported_schema" as const };
      const current = profile.dualTower.destiny;
      if (current.run?.active && current.run.cycleId === cycleId)
        return { ok: false as const, error: "run_exists" as const };
      const configs = profileTeam(profile, rosterIds.slice(1));
      const members = configs.slice(1).map(({ id, element, profession }) => ({ id, element, profession }));
      const rules = generateDestinyCycleRules(cycleId, rulesSeed, members);
      if (!rules.ok) return { ok: false as const, error: "invalid_roster" as const };
      const made = createDestinyRun(profile, deps.now, rosterIds, rules.snapshot.floors.map(({ rules: floorRules }) => floorRules));
      if (!made.ok) return { ok: false as const, error: "invalid_roster" as const };
      created = { ...made.run, rulesVersion: cycle.rulesVersion };
      const sameCycle = current.cycleId === cycleId;
      return {
        ok: true as const,
        profile: {
          ...profile,
          dualTower: {
            ...profile.dualTower,
            destiny: {
              cycleId,
              cycleBest: sameCycle ? current.cycleBest : 0,
              run: created,
              claimedMilestones: sameCycle ? current.claimedMilestones : [],
              cycleRewardClaimed: sameCycle && current.cycleRewardClaimed,
              history: current.history ?? [],
            },
          },
        },
      };
    },
    deps.now,
  );
  if (!updated.ok) return { ok: false, error: updated.error as DestinyError };
  return { ok: true, run: created! };
}

interface StartBattleInput {
  readonly activeIds: readonly string[];
  readonly leaderBuild: DestinyLeaderBuild;
}

function parseBattleInput(raw: unknown): StartBattleInput | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  if (!Array.isArray(value.activeIds) || !value.activeIds.every((id) => typeof id === "string") ||
      !value.leaderBuild || typeof value.leaderBuild !== "object") return null;
  const build = value.leaderBuild as Record<string, unknown>;
  if (typeof build.element !== "string" || typeof build.profession !== "string") return null;
  return value as unknown as StartBattleInput;
}

export type DestinyBattleStartResult =
  | { readonly ok: true; readonly id: string; readonly view: MatchView; readonly events: readonly BattleEvent[]; readonly resumed: boolean }
  | { readonly ok: false; readonly error: DestinyError };

export async function startDestinyBattle(
  ownerId: string,
  raw: unknown,
  deps: Deps,
): Promise<DestinyBattleStartResult> {
  if (!secretValid(deps)) return { ok: false, error: "invalid_secret" };
  const input = parseBattleInput(raw);
  if (!input) return { ok: false, error: "bad_request" };
  const reconciled = await reconcileDestinyCycle(deps.profiles, ownerId, deps.now);
  if (!reconciled.ok) return { ok: false, error: reconciled.error === "unsupported_schema" ? "unsupported_schema" : "conflict" };
  if (reconciled.value.expired || hasExpiredDestinyRun(reconciled.profile, reconciled.value.cycleId))
    return { ok: false, error: "cycle_expired" };
  let stored = await loadProfile(deps.profiles, ownerId);
  if (!isDualTowerV1(stored.profile.dualTower)) return { ok: false, error: "unsupported_schema" };
  let run = stored.profile.dualTower.destiny.run;
  if (!run) return { ok: false, error: "no_run" };
  const scheduled = activeDestinyCycle(deps.now);
  if (!scheduled.ok || run.cycleId !== scheduled.cycle.cycleId ||
      (run.rulesVersion !== undefined && run.rulesVersion !== scheduled.cycle.rulesVersion))
    return { ok: false, error: "cycle_expired" };
  if (run.phase === "battle" && run.matchId) {
    const resumed = await getBattle(run.matchId, ownerId, deps);
    if (resumed.ok) return { ok: true, id: resumed.id, view: resumed.view, events: resumed.events, resumed: true };
    stored = await loadProfile(deps.profiles, ownerId);
    run = isDualTowerV1(stored.profile.dualTower) ? stored.profile.dualTower.destiny.run : null;
    if (!run || run.phase !== "prepare") return { ok: false, error: "invalid_phase" };
  }
  if (run.phase !== "prepare") return { ok: false, error: "invalid_phase" };
  const resolved = resolveDestinyFloor(run, deps.destinySecret);
  if (!resolved.ok) return { ok: false, error: resolved.error === "floor_not_found" ? "floor_not_found" : "bad_request" };
  const battleSeed = destinyCycleSeed(scheduled.cycle, deps.destinySecret, "battle");
  if (!battleSeed) return { ok: false, error: "invalid_secret" };
  const made = createDestinyFloorBattle(run, {
    activeIds: input.activeIds,
    leaderBuild: input.leaderBuild,
    rules: resolved.floor.rules,
    foes: { fighters: resolved.floor.foes, leader: 0 },
    seed: hashString(`${battleSeed}|${run.floor}`),
    now: deps.now,
    timer: true,
    firstSide: HUMAN,
    weights: resolved.floor.weights,
  });
  if (!made.ok) return { ok: false, error: "invalid_lineup" };
  const matchId = deps.newId();
  const match: Match = {
    battle: made.state,
    difficulty: resolved.floor.difficulty,
    seq: 0,
    startedAt: deps.now,
    lastHumanAt: deps.now,
    forfeited: false,
    destiny: { tag: makeDestinyMatchTag(resolved.floor, input.activeIds) },
  };
  const updated = await updateProfile(
    deps.profiles,
    ownerId,
    (profile) => {
      if (!isDualTowerV1(profile.dualTower)) return { ok: false as const, error: "unsupported_schema" as const };
      const current = profile.dualTower.destiny.run;
      if (!current || current.phase !== "prepare" || current.cycleId !== run!.cycleId || current.floor !== run!.floor)
        return { ok: false as const, error: "conflict" as const };
      return {
        ok: true as const,
        profile: {
          ...profile,
          dualTower: {
            ...profile.dualTower,
            destiny: {
              ...profile.dualTower.destiny,
              run: { ...current, phase: "battle" as const, matchId, offer: null },
            },
          },
        },
      };
    },
    deps.now,
  );
  if (!updated.ok) return { ok: false, error: updated.error as DestinyError };
  const record: MatchRecord = { id: matchId, ownerId, match, createdAt: deps.now, updatedAt: deps.now };
  await deps.store.create(record);
  return { ok: true, id: matchId, view: viewOf(match), events: made.events, resumed: false };
}

export async function claimDestinyReward(
  ownerId: string,
  raw: unknown,
  deps: Deps,
): Promise<{ readonly ok: true; readonly run: DestinyRun; readonly changed: boolean } | { readonly ok: false; readonly error: DestinyError }> {
  if (!raw || typeof raw !== "object") return { ok: false, error: "bad_request" };
  const input = raw as Record<string, unknown>;
  if (!Number.isInteger(input.floor) || !Number.isInteger(input.index)) return { ok: false, error: "bad_request" };
  const reconciled = await reconcileDestinyCycle(deps.profiles, ownerId, deps.now);
  if (!reconciled.ok) return { ok: false, error: reconciled.error === "unsupported_schema" ? "unsupported_schema" : "conflict" };
  if (reconciled.value.expired || hasExpiredDestinyRun(reconciled.profile, reconciled.value.cycleId))
    return { ok: false, error: "cycle_expired" };
  let next: DestinyRun | undefined;
  let changed = false;
  const updated = await updateProfile(
    deps.profiles,
    ownerId,
    (profile) => {
      next = undefined;
      changed = false;
      if (!isDualTowerV1(profile.dualTower)) return { ok: false as const, error: "unsupported_schema" as const };
      const progress = profile.dualTower.destiny;
      const run = progress.run;
      if (!run) return { ok: false as const, error: "no_run" as const };
      if (run.rewardedFloor === input.floor && run.floor === (input.floor as number) + 1) {
        next = run;
        return { ok: true as const, profile };
      }
      if (run.phase !== "reward" || run.floor !== input.floor || !run.offer)
        return { ok: false as const, error: "stale_reward" as const };
      const leader = run.fighters?.dinhBoLinh;
      const effectiveOffer = (leader?.downed || leader?.hp === 0)
        ? generateDestinyOffer(run)
        : run.offer;
      const offer = effectiveOffer[input.index as number] as DestinyRewardOffer | undefined;
      if (!offer) return { ok: false as const, error: "invalid_reward" as const };
      const applied = offer.kind === "boon"
        ? applyDestinyBoonReward(run, { floor: input.floor as number, boonId: offer.boonId })
        : applyDestinyRecovery(run, {
            floor: input.floor as number,
            kind: offer.kind,
            targetIds: Array.isArray(input.targetIds) ? input.targetIds as string[] : [],
          });
      if (!applied.ok) return { ok: false as const, error: "invalid_reward" as const };
      next = applied.run;
      changed = applied.changed;
      return {
        ok: true as const,
        profile: {
          ...profile,
          dualTower: { ...profile.dualTower, destiny: { ...progress, run: applied.run } },
        },
      };
    },
    deps.now,
  );
  if (!updated.ok) return { ok: false, error: updated.error as DestinyError };
  return { ok: true, run: next!, changed };
}

export async function stopDestinyRun(
  ownerId: string,
  deps: Deps,
): Promise<{ readonly ok: true; readonly stopped: boolean } | { readonly ok: false; readonly error: DestinyError }> {
  const reconciled = await reconcileDestinyCycle(deps.profiles, ownerId, deps.now);
  if (!reconciled.ok) return { ok: false, error: reconciled.error === "unsupported_schema" ? "unsupported_schema" : "conflict" };
  if (reconciled.value.expired || hasExpiredDestinyRun(reconciled.profile, reconciled.value.cycleId))
    return { ok: false, error: "cycle_expired" };
  const { profile } = await loadProfile(deps.profiles, ownerId);
  if (!isDualTowerV1(profile.dualTower)) return { ok: false, error: "unsupported_schema" };
  const run = profile.dualTower.destiny.run;
  if (!run || !run.active) return { ok: true, stopped: false };
  if (run.phase === "battle" && run.matchId) {
    const record = await deps.store.get(run.matchId);
    if (record && record.ownerId === ownerId && !matchOver(record.match)) {
      const battle = structuredClone(record.match.battle);
      battle.winner = AI_SIDE;
      battle.turn.deadline = null;
      const match = { ...record.match, battle, forfeited: true, seq: record.match.seq + 1 };
      if (!(await deps.store.save({ ...record, match, updatedAt: deps.now }, record.match.seq)))
        return { ok: false, error: "conflict" };
    }
    await getBattle(run.matchId, ownerId, deps);
    return { ok: true, stopped: true };
  }
  const updated = await updateProfile(
    deps.profiles,
    ownerId,
    (current) => {
      if (!isDualTowerV1(current.dualTower)) return { ok: false as const, error: "unsupported_schema" as const };
      const active = current.dualTower.destiny.run;
      if (!active || !active.active) return { ok: true as const, profile: current };
      return {
        ok: true as const,
        profile: {
          ...current,
          dualTower: {
            ...current.dualTower,
            destiny: {
              ...current.dualTower.destiny,
              run: { ...active, active: false, phase: "done" as const, offer: null, matchId: undefined },
            },
          },
        },
      };
    },
    deps.now,
  );
  return updated.ok ? { ok: true, stopped: true } : { ok: false, error: updated.error as DestinyError };
}
