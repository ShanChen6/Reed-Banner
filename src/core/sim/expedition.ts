// Mô phỏng Viễn Chinh: một kế hoạch tham lam điều hai đạo quân (đi đường ngắn nhất, chờ giáp công trước thành
// đích, đóng quân khi cả hai đuối), mọi trận do AI đánh thay người chơi. Thuần, tất định theo seed.

import { playAiTurn, type Difficulty } from "../ai";
import { createBattle, type BattleState } from "../battle";
import {
  EXPEDITION_MAPS,
  campExpedition,
  createExpeditionRun,
  expeditionDistance,
  expeditionEdgeDays,
  expeditionEncounter,
  expeditionMapOf,
  expeditionNeighbors,
  expeditionNode,
  expeditionArmySide,
  expeditionFoeSide,
  expeditionStars,
  marchExpedition,
  beginExpeditionBattle,
  settleExpeditionBattle,
  NEW_EXPEDITION,
  type ArmyIndex,
  type ExpeditionMapId,
  type ExpeditionRun,
  type ExpeditionTier,
  type ExpeditionNodeKind,
} from "../expedition";
import { autoProgress, newProfile, type Profile } from "../progress";
import { createRng } from "../rng";
import { STARTER_COMPANIONS } from "../roster";
import { DEFAULT_MAX_TURNS } from "./sim";

export interface ExpeditionSimOptions {
  readonly map: ExpeditionMapId;
  readonly tier: ExpeditionTier;
  /** Cấp của cả 6 người; mặc định là cấp gợi ý của bậc. */
  readonly level: number;
  readonly seed: number;
  /** AI đánh thay người chơi. */
  readonly player?: Difficulty;
  /** Ghi từng ngày (gỡ lỗi kế hoạch). */
  readonly trace?: (line: string) => void;
}

export interface ExpeditionSimResult {
  readonly won: boolean;
  readonly days: number;
  readonly stars: number;
  readonly battles: number;
  readonly battlesLost: number;
  readonly camps: number;
  readonly pincers: number;
  readonly endReason: string | null;
  readonly turns: number;
}

/** Hồ sơ mô phỏng: Đinh Bộ Lĩnh và 5 nhân vật khởi đầu cùng cấp, không trang bị. */
export function expeditionSimProfile(level: number): Profile {
  const p = newProfile();
  return {
    ...p,
    main: autoProgress(level, null),
    companions: Object.fromEntries(STARTER_COMPANIONS.map((c) => [c.id, autoProgress(level, null)])),
  };
}

const THREAT: Readonly<Record<ExpeditionNodeKind, number>> = {
  camp: 0, village: -1, outpost: 2, watchtower: 2, granary: 2, fort: 3, citadel: 9,
};

const hpRatio = (run: ExpeditionRun, i: ArmyIndex) => {
  const a = run.armies[i];
  const fs = a.ids.map((id) => a.fighters[id]!);
  return fs.reduce((s, f) => s + f.hp, 0) / fs.reduce((s, f) => s + f.config.maxHp, 0);
};

/** Bước kế trên đường ngắn nhất tới một trong các đích, ưu tiên ô ít nguy hiểm. */
function stepToward(run: ExpeditionRun, i: ArmyIndex, targets: readonly string[]): string | null {
  const map = expeditionMapOf(run);
  const at = run.armies[i].at;
  const dist = (from: string) => Math.min(...targets.map((t) => expeditionDistance(map, from, t)));
  const here = dist(at);
  if (here === 0 || here === Infinity) return null;
  const options = expeditionNeighbors(map, at).filter(
    (n) => n !== map.citadel && dist(n) + expeditionEdgeDays(map, at, n) === here,
  );
  if (options.length === 0) return null;
  const threat = (n: string) => (run.nodes[n]?.cleared ? -2 : THREAT[expeditionNode(map, n)!.kind]);
  return options.sort((a, b) => threat(a) - threat(b))[0]!;
}

interface Plan { readonly kind: "march"; readonly army: ArmyIndex; readonly to: string }
type Decision = Plan | { readonly kind: "camp" };

function decide(run: ExpeditionRun): Decision {
  const map = expeditionMapOf(run);
  const gates = expeditionNeighbors(map, map.citadel);
  const alive = ([0, 1] as const).filter((i) => hpRatio(run, i) > 0);
  const daysLeft = map.days - run.day + 1;
  const atGate = alive.filter((i) => gates.includes(run.armies[i].at));
  const away = alive.filter((i) => !gates.includes(run.armies[i].at));
  const attacker = [...atGate].sort((a, b) => hpRatio(run, b) - hpRatio(run, a))[0];
  // Chờ đạo kia tới cổng để giáp công, trừ khi không còn kịp.
  if (attacker !== undefined) {
    const waiting = away.find((i) => {
      const used = run.armies[attacker].at;
      const free = gates.filter((g) => g !== used);
      return Math.min(...(free.length ? free : gates).map((g) => expeditionDistance(map, run.armies[i].at, g))) < daysLeft - 1;
    });
    if (waiting === undefined) {
      if (hpRatio(run, attacker) < 0.6 && daysLeft > 2) return { kind: "camp" };
      return { kind: "march", army: attacker, to: map.citadel };
    }
  }
  const movers = [...away].sort((a, b) => hpRatio(run, b) - hpRatio(run, a));
  const best = movers[0];
  if (best !== undefined && hpRatio(run, best) < 0.55 && daysLeft > 4) return { kind: "camp" };
  for (const i of movers) {
    const other = run.armies[i === 0 ? 1 : 0];
    const free = gates.filter((g) => g !== other.at);
    const to = stepToward(run, i, free.length ? free : gates);
    if (to) return { kind: "march", army: i, to };
  }
  return { kind: "camp" };
}

function fight(run: ExpeditionRun, army: ArmyIndex, node: string, seed: number, player: Difficulty) {
  const encounter = expeditionEncounter(run, node, army)!;
  let { state } = createBattle({
    sides: [expeditionArmySide(run, army), expeditionFoeSide(encounter)],
    seed,
    timer: false,
    firstSide: 0,
    weights: encounter.weights,
  });
  while (state.winner === null && state.turn.number <= DEFAULT_MAX_TURNS) {
    const difficulty = state.turn.side === 0 ? player : encounter.difficulty;
    state = playAiTurn(state, difficulty).state;
  }
  if (state.winner === null) state = { ...state, winner: 1 } as BattleState;
  return { state, encounter };
}

export function simulateExpedition(o: ExpeditionSimOptions): ExpeditionSimResult {
  const profile = expeditionSimProfile(o.level);
  const ids = STARTER_COMPANIONS.map((c) => c.id);
  const made = createExpeditionRun(
    profile,
    { ...NEW_EXPEDITION, cleared: { [o.map]: 3 } },
    { map: o.map, tier: o.tier, main: ids.slice(0, 2), second: ids.slice(2, 5) },
    "sim",
    o.seed,
  );
  if (!made.ok) throw new Error(made.error);
  let run = made.run;
  const rng = createRng(o.seed ^ 0x9e3779b9);
  let battles = 0, battlesLost = 0, camps = 0, pincers = 0, turns = 0;
  const player = o.player ?? "normal";
  for (let guard = 0; guard < 64 && run.phase === "march"; guard++) {
    const d = decide(run);
    o.trace?.(`ngày ${run.day}: ${d.kind === "camp" ? "đóng quân" : `đạo ${d.army} → ${d.to}`} | máu ${hpRatio(run, 0).toFixed(2)} / ${hpRatio(run, 1).toFixed(2)}`);
    if (d.kind === "camp") {
      camps++;
      const c = campExpedition(run);
      if (!c.ok) break;
      run = c.run;
      continue;
    }
    const m = marchExpedition(run, d.army, d.to);
    if (!m.ok) {
      run = (campExpedition(run) as { ok: true; run: ExpeditionRun }).run;
      camps++;
      continue;
    }
    if (m.kind === "moved") { run = m.run; continue; }
    battles++;
    if (m.encounter.pincer) pincers++;
    const { state } = fight(run, d.army, d.to, rng.int(0, 0x7fffffff), player);
    turns += state.turn.number;
    run = beginExpeditionBattle(run, { army: d.army, node: d.to, matchId: "sim", pincer: m.encounter.pincer });
    const s = settleExpeditionBattle(run, { runId: run.id, map: run.map, tier: run.tier, node: d.to, army: d.army, day: run.day }, state);
    if (!s.ok) throw new Error(s.error);
    if (!s.won) battlesLost++;
    o.trace?.(`  trận ${s.won ? "thắng" : "thua"} sau ${state.turn.number} lượt${m.encounter.pincer ? " (giáp công)" : ""}`);
    run = s.run;
  }
  return {
    won: run.phase === "won",
    days: run.day,
    stars: expeditionStars(run),
    battles,
    battlesLost,
    camps,
    pincers,
    endReason: run.endReason ?? null,
    turns,
  };
}

export const EXPEDITION_SIM_MAPS = Object.keys(EXPEDITION_MAPS) as ExpeditionMapId[];
