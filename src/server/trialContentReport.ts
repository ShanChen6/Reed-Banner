// Mô phỏng nhanh, tất định cho report nội dung Trial. Đây là công cụ cân bằng, không tham gia runtime/API.
import { playAiTurn } from "@/core/ai";
import { createBattle, type Element, type Profession } from "@/core/battle";
import { autoProgress, newProfile, type Profile } from "@/core/progress";
import { analyzeFeasibility, profileCandidates } from "@/core/tower/puzzleValidator";
import { resolveFloor } from "@/core/tower/floorContract";
import { prepareTowerLineup } from "@/core/tower/prepare";
import { toFloorDefinition, trialEnemyBuilder, type TrialFloorSpec } from "@/core/tower/trialFloors";

export interface TrialContentResult {
  readonly floor: number;
  readonly legalTeams: number;
  readonly sampleTeams: number;
  readonly wins: number;
  readonly successRate: number;
  readonly sampleIds: readonly string[];
  readonly sampleTurns: number | null;
}

export function trialTestProfile(level: number): Profile {
  const base = newProfile();
  return {
    ...base,
    main: autoProgress(level, base.profession),
    companions: Object.fromEntries(
      Object.keys(base.companions).map((id) => [id, autoProgress(level, null)]),
    ),
  };
}

export function evaluateTrialFloor(
  spec: TrialFloorSpec,
  sampleTeams = 12,
  profile: Profile = trialTestProfile(spec.enemy.level),
): TrialContentResult {
  const feasibility = analyzeFeasibility(spec.rules, profileCandidates(profile), { maxSamples: sampleTeams });
  const resolved = resolveFloor(toFloorDefinition(spec), "trial", trialEnemyBuilder(spec));
  if (feasibility.status !== "feasible" || !resolved.ok)
    return { floor: spec.floor, legalTeams: 0, sampleTeams: 0, wins: 0, successRate: 0, sampleIds: [], sampleTurns: null };

  let wins = 0;
  let sampleIds: readonly string[] = [];
  let sampleTurns: number | null = null;
  for (const lineup of feasibility.samples) {
    const [leader, a, b] = lineup.members;
    const prepared = prepareTowerLineup(profile, {
      mode: "trial",
      companions: [a.id, b.id],
      leaderBuild: { element: leader.element as Element, profession: leader.profession as Profession },
    }, spec.rules);
    if (!prepared.ok) continue;
    let state = createBattle({
      sides: [prepared.lineup.side, { fighters: resolved.floor.foes, leader: 0 }],
      seed: spec.board.publicSeed,
      timer: false,
      firstSide: 0,
      weights: resolved.floor.weights,
    }).state;
    let turns = 0;
    for (let guard = 0; guard < 200 && state.winner === null; guard++) {
      if (state.turn.side === 0) {
        if (turns >= spec.turnLimit) break;
        turns++;
      }
      state = playAiTurn(state, state.turn.side === 0 ? "hard" : spec.difficulty).state;
    }
    if (state.winner === 0 && turns <= spec.turnLimit) {
      wins++;
      if (sampleTurns === null || turns < sampleTurns) {
        sampleTurns = turns;
        sampleIds = prepared.lineup.ids;
      }
    }
  }
  return {
    floor: spec.floor,
    legalTeams: feasibility.lineupsValid,
    sampleTeams: feasibility.samples.length,
    wins,
    successRate: feasibility.samples.length === 0 ? 0 : wins / feasibility.samples.length,
    sampleIds,
    sampleTurns,
  };
}

export const evaluateTrialContent = (floors: readonly TrialFloorSpec[]) =>
  floors.map((spec) => evaluateTrialFloor(spec));
