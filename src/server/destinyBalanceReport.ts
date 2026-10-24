import {
  DESTINY_STONE_MILESTONES,
  MAIN_ID,
  SHOP_COMPANIONS,
  analyzeFeasibility,
  applyDestinyBoonReward,
  applyDestinyRecovery,
  autoProgress,
  createDestinyFloorBattle,
  createDestinyRun,
  destinyCycleStoneReward,
  generateDestinyCycleRules,
  generateDestinyOffer,
  hashString,
  leaderBuildOptions,
  newProfile,
  playAiTurn,
  profileCandidates,
  settleDestinyFloor,
  type DestinyLeaderBuild,
  type DestinyRewardOffer,
  type DestinyRun,
  type Profile,
} from "@/core";
import { destinyCycleById, destinyCycleSeed } from "./destinyCycle";
import { resolveDestinyFloor } from "./destinyContent";

export type DestinySimPolicy = "boon_first" | "recovery_first";
export interface DestinySimResult {
  readonly cycleId: string; readonly rosterCap: number; readonly level: number; readonly policy: DestinySimPolicy;
  readonly floors: number; readonly turns: number; readonly food: number; readonly hpRatio: number;
  readonly revives: number; readonly boonPicks: number; readonly recoveryPicks: number; readonly stones: number;
}

const SECRET = "destiny-balance-simulation-v1";

function profileAt(level: number, neededCompanions: number): Profile {
  const base = newProfile();
  const extras = SHOP_COMPANIONS.slice(0, Math.max(0, neededCompanions - Object.keys(base.companions).length));
  const ids = [...Object.keys(base.companions), ...extras.map(({ fighter }) => fighter.id)];
  return {
    ...base,
    main: autoProgress(level, base.profession),
    companions: Object.fromEntries(ids.map((id) => [id, autoProgress(level, null)])),
  };
}

function lineup(run: DestinyRun, rules: Parameters<typeof analyzeFeasibility>[0]) {
  if (!run.fighters?.[MAIN_ID] || run.fighters[MAIN_ID]!.downed) return null;
  const alive = run.roster.slice(1).filter((id) => (run.fighters?.[id]?.hp ?? 0) > 0);
  const pairs: [string, string][] = [];
  for (let i = 0; i < alive.length; i++) for (let j = i + 1; j < alive.length; j++) pairs.push([alive[i]!, alive[j]!]);
  pairs.sort((a, b) => b.reduce((sum, id) => sum + run.fighters![id]!.hp / run.fighters![id]!.config.maxHp, 0) -
    a.reduce((sum, id) => sum + run.fighters![id]!.hp / run.fighters![id]!.config.maxHp, 0));
  for (const [a, b] of pairs) {
    const companions = [a, b].map((id) => {
      const f = run.fighters![id]!;
      return { id, element: f.config.element, profession: f.config.profession };
    });
    const builds = leaderBuildOptions(rules, MAIN_ID, companions);
    if (builds[0]) return { activeIds: [MAIN_ID, a, b], leaderBuild: builds[0] as DestinyLeaderBuild };
  }
  return null;
}

function chooseReward(run: DestinyRun, policy: DestinySimPolicy): { offer: DestinyRewardOffer; targets: readonly string[] } | null {
  const offers = generateDestinyOffer(run);
  const leader = run.fighters?.[MAIN_ID];
  if (leader?.downed || leader?.hp === 0) return { offer: { kind: "rescue" }, targets: [MAIN_ID] };
  const recovery = (offer: DestinyRewardOffer) => {
    if (offer.kind === "boon") return null;
    const candidates = run.roster.filter((id) => {
      const f = run.fighters![id]!;
      return offer.kind === "rescue" ? f.downed : !f.downed && f.hp < f.config.maxHp;
    }).sort((a, b) => run.fighters![a]!.hp / run.fighters![a]!.config.maxHp - run.fighters![b]!.hp / run.fighters![b]!.config.maxHp);
    if (candidates.length === 0) return null;
    return { offer, targets: offer.kind === "field_medic" ? candidates.slice(0, 3) : candidates.slice(0, 1) };
  };
  if (policy === "recovery_first") for (const offer of offers) { const pick = recovery(offer); if (pick) return pick; }
  const boon = offers.find((offer) => offer.kind === "boon");
  if (boon) return { offer: boon, targets: [] };
  for (const offer of offers) { const pick = recovery(offer); if (pick) return pick; }
  return null;
}

export function simulateDestinyCycle(cycleId: string, rosterCap: 3 | 5 | 8, level: 5 | 10 | 20 | 30, policy: DestinySimPolicy): DestinySimResult {
  const cycle = destinyCycleById(cycleId);
  if (!cycle) throw new Error(`cycle không hợp lệ: ${cycleId}`);
  const profile = profileAt(level, rosterCap - 1);
  const roster = [MAIN_ID, ...Object.keys(profile.companions).slice(0, rosterCap - 1)];
  const candidates = profileCandidates(profile).filter(({ id }) => roster.includes(id));
  const rulesSeed = destinyCycleSeed(cycle, SECRET, "rules")!;
  const rules = generateDestinyCycleRules(cycleId, rulesSeed, candidates);
  if (!rules.ok) throw new Error(`không sinh được luật cap ${rosterCap}`);
  const created = createDestinyRun(profile, cycle.startAt, roster, rules.snapshot.floors.map((floor) => floor.rules));
  if (!created.ok) throw new Error(`không tạo được run: ${created.error}`);
  let run: DestinyRun = { ...created.run, rulesVersion: cycle.rulesVersion };
  let turns = 0, revives = 0, boonPicks = 0, recoveryPicks = 0, floors = 0;
  for (let floor = 1; floor <= 10; floor++) {
    const content = resolveDestinyFloor(run, SECRET);
    if (!content.ok) break;
    const selected = lineup(run, content.floor.rules);
    if (!selected) break;
    const battleSeed = destinyCycleSeed(cycle, SECRET, "battle")!;
    const made = createDestinyFloorBattle(run, {
      ...selected, rules: content.floor.rules, foes: { fighters: content.floor.foes, leader: 0 },
      seed: hashString(`${battleSeed}|${run.floor}`), timer: false, firstSide: 0, weights: content.floor.weights,
    });
    if (!made.ok) break;
    let state = made.state;
    for (let guard = 0; guard < 300 && state.winner === null; guard++)
      state = playAiTurn(state, state.turn.side === 0 ? "hard" : content.floor.difficulty).state;
    if (state.winner === null) state.winner = 1;
    const settled = settleDestinyFloor(made.run, state);
    if (!settled.ok) break;
    run = settled.run;
    turns += state.turn.number;
    if (!settled.won) break;
    floors = floor;
    const pick = chooseReward(run, policy);
    if (!pick) break;
    if (pick.offer.kind === "boon") {
      const applied = applyDestinyBoonReward(run, { floor, boonId: pick.offer.boonId });
      if (!applied.ok) break;
      run = applied.run; boonPicks++;
    } else {
      const applied = applyDestinyRecovery(run, { floor, kind: pick.offer.kind, targetIds: pick.targets });
      if (!applied.ok) break;
      run = applied.run; recoveryPicks++;
      if (pick.offer.kind === "rescue") revives++;
    }
  }
  const fighters = Object.values(run.fighters ?? {});
  const hpRatio = fighters.length === 0 ? 0 : fighters.reduce((sum, f) => sum + f.hp / f.config.maxHp, 0) / fighters.length;
  const milestone = DESTINY_STONE_MILESTONES.filter(({ floor }) => floor <= floors).reduce((sum, item) => sum + item.stones, 0);
  return { cycleId, rosterCap, level, policy, floors, turns, food: run.food, hpRatio, revives, boonPicks, recoveryPicks,
    stones: milestone + destinyCycleStoneReward(floors) };
}

export function summarize(values: readonly number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const at = (q: number) => sorted[Math.min(sorted.length - 1, Math.ceil(q * sorted.length) - 1)] ?? 0;
  return { mean: values.reduce((a, b) => a + b, 0) / Math.max(1, values.length), median: at(0.5), p90: at(0.9) };
}
