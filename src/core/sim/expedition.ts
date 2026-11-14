// Mô phỏng Viễn Chinh: một kế hoạch tham lam điều hai đạo quân (đi đường ngắn nhất, chờ giáp công trước thành
// đích, đóng quân khi cả hai đuối), mọi trận do AI đánh thay người chơi. Thuần, tất định theo seed.

import { simRageOption } from "./rage";
import { playAiTurn, type Difficulty } from "../ai";
import { createBattle, type BattleState } from "../battle";
import {
  EXPEDITION_MAPS,
  campExpedition,
  createExpeditionRun,
  expeditionEdgeDays,
  expeditionMapOf,
  expeditionNeighbors,
  expeditionNode,
  expeditionArmySide,
  expeditionFoeSide,
  expeditionStars,
  marchExpedition,
  beginExpeditionBattle,
  expeditionBattleRef,
  expeditionMatchTag,
  expeditionObjectiveMet,
  expeditionEdgeKey,
  expeditionEdgeKind,
  expeditionEnding,
  expeditionMissionDone,
  expeditionHops,
  expeditionScenarioOf,
  expeditionTideOpen,
  scoutExpedition,
  EXPEDITION_SCOUT_SIGHT,
  type ExpeditionEncounter,
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
  /**
   * Sa bàn thường: có đi làm nhiệm vụ hộ tống không (mặc định có). Tắt để đo độ khó khi người chơi bỏ nhiệm vụ. Cửa
   * Biển luôn làm vì kết thúc phụ thuộc vào đó.
   */
  readonly escort?: boolean;
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
  readonly scouts: number;
  /** Kết thúc riêng (Cửa Biển) nếu có. */
  readonly ending: string | null;
  /** Việc phụ đã làm: chặn viện binh, đưa dân về, giữ kho lương trước phản công. */
  readonly cut: boolean;
  readonly saved: boolean;
  readonly marketHeld: boolean;
  /** Thắng và đã xong nhiệm vụ của sa bàn (đưa người về, chặn viện binh). */
  readonly mission: boolean;
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
  camp: 0, village: -1, outpost: 2, watchtower: 2, granary: 2, fort: 3, citadel: 9, bridge: 4, shoal: 0,
};

const hpRatio = (run: ExpeditionRun, i: ArmyIndex) => {
  const a = run.armies[i];
  const fs = a.ids.map((id) => a.fighters[id]!);
  return fs.reduce((s, f) => s + f.hp, 0) / fs.reduce((s, f) => s + f.config.maxHp, 0);
};

/**
 * Số ngày đi ít nhất theo những gì kế hoạch biết: bỏ đường đã biết bị phá, bỏ cửa nước đã biết đang lên, không đi
 * xuyên thành đích.
 */
function route(run: ExpeditionRun, from: string, to: string): number {
  const map = expeditionMapOf(run);
  const cost = (a: string, b: string) => {
    if (run.knownBroken?.includes(expeditionEdgeKey(a, b))) return Infinity;
    if (run.tideKnown && expeditionEdgeKind(map, a, b) === "tide" && !expeditionTideOpen(run)) return Infinity;
    return expeditionEdgeDays(map, a, b);
  };
  const best = new Map<string, number>([[from, 0]]);
  const open = new Set([from]);
  while (open.size > 0) {
    let id = "";
    let d = Infinity;
    for (const x of open) if (best.get(x)! < d) { d = best.get(x)!; id = x; }
    open.delete(id);
    if (id === to) return d;
    if (id === map.citadel && id !== from) continue;
    for (const n of expeditionNeighbors(map, id)) {
      const nd = d + cost(id, n);
      if (nd < (best.get(n) ?? Infinity)) { best.set(n, nd); open.add(n); }
    }
  }
  return Infinity;
}

const routeTo = (run: ExpeditionRun, from: string, targets: readonly string[]) => Math.min(...targets.map((t) => route(run, from, t)));

/** Bước kế trên đường ngắn nhất (theo `route`) tới một trong các đích, ưu tiên ô ít nguy hiểm. */
function stepToward(run: ExpeditionRun, i: ArmyIndex, targets: readonly string[]): string | null {
  const map = expeditionMapOf(run);
  const at = run.armies[i].at;
  const here = routeTo(run, at, targets);
  if (here === 0 || here === Infinity) return null;
  const options = expeditionNeighbors(map, at).filter((n) => {
    if (n === map.citadel) return false;
    const step = route(run, at, n);
    return step === expeditionEdgeDays(map, at, n) && step + routeTo(run, n, targets) === here;
  });
  if (options.length === 0) return null;
  const threat = (n: string) => (run.nodes[n]?.cleared ? -2 : THREAT[expeditionNode(map, n)!.kind]);
  return options.sort((a, b) => threat(a) - threat(b))[0]!;
}

interface Plan { readonly kind: "march"; readonly army: ArmyIndex; readonly to: string }
type Decision = Plan | { readonly kind: "camp" } | { readonly kind: "scout"; readonly army: ArmyIndex };

const dist = (run: ExpeditionRun, from: string, to: string) => route(run, from, to);

/**
 * Việc phụ của kịch bản mà từng đạo nên làm trước khi tới cổng thành: chặn viện binh ở ô giữ, nhận và đưa đoàn dân
 * về. Chia cho đạo gần hơn; hai việc rơi vào cùng một đạo thì việc giữ ải sang đạo kia. Trả về đích của từng đạo
 * (undefined là đi thẳng tới cổng thành).
 */
function missionTargets(run: ExpeditionRun, alive: readonly ArmyIndex[], escort: boolean): Partial<Record<ArmyIndex, readonly string[]>> {
  const scenario = expeditionScenarioOf(run);
  const out: Partial<Record<ArmyIndex, readonly string[]>> = {};
  if (!scenario) return out;
  const map = expeditionMapOf(run);
  const daysLeft = map.days - run.day + 1;
  const nearest = (targets: readonly string[], among: readonly ArmyIndex[]) =>
    [...among].sort((a, b) => Math.min(...targets.map((t) => dist(run, run.armies[a].at, t))) - Math.min(...targets.map((t) => dist(run, run.armies[b].at, t))))[0];
  // Đoàn dân: đạo đang mang dân đưa về; chưa ai nhận thì đạo gần làng đi nhận (khi còn đủ ngày).
  const r = escort || scenario.endingGold ? scenario.refugees : undefined;
  if (r) {
    const carrier = run.refugees === 0 || run.refugees === 1 ? run.refugees : undefined;
    const homes = [r.home, ...(scenario.counter && run.market?.status === "held" ? [scenario.counter.node] : [])];
    if (carrier !== undefined && alive.includes(carrier)) {
      // Rời làng khi đồn chặn chưa chiếm thì gặp truy binh: dọn đồn trước nếu nó kề làng và nằm trên đường về
      // (đồn lệch đường thì đánh truy binh còn nhanh hơn quay lui).
      const toHome = (from: string) => Math.min(...homes.map((h) => dist(run, from, h)));
      const blocker = run.armies[carrier].at === r.village && !run.nodes[r.chaseUnless]?.cleared
        && expeditionNeighbors(map, r.village).includes(r.chaseUnless) && toHome(r.chaseUnless) < toHome(r.village);
      out[carrier] = blocker ? [r.chaseUnless] : homes;
    } else if (run.refugees === undefined) {
      const who = nearest([r.village], alive);
      if (who !== undefined && dist(run, run.armies[who].at, r.village) * 2 < daysLeft) out[who] = [r.village];
    }
  }
  // Ô giữ chặn viện binh: chỉ khi còn đợt viện binh chưa tới.
  const hold = scenario.hold;
  const reinf = scenario.reinforcements;
  if (hold && reinf && !run.reinforcementsCut && reinf.days.some((d) => d >= run.day)) {
    const open = hold.nodes.filter((n) => !run.nodes[n]?.cleared);
    const free = alive.filter((i) => out[i] === undefined);
    const who = nearest(open, free.length ? free : alive);
    if (open.length && who !== undefined && out[who] === undefined) out[who] = open;
  }
  return out;
}

/** Đáng trinh sát: sa bàn có đường bị phá và quanh đạo còn ít nhất hai đường có thể bị phá chưa rõ. */
function worthScouting(run: ExpeditionRun, i: ArmyIndex): boolean {
  const rule = expeditionScenarioOf(run)?.broken;
  if (!rule) return false;
  const map = expeditionMapOf(run);
  const at = run.armies[i].at;
  const near = (id: string) => expeditionHops(map, at, id) <= EXPEDITION_SCOUT_SIGHT;
  const unknown = rule.edges.filter(([a, b]) => {
    const key = expeditionEdgeKey(a, b);
    const seen = run.scouted?.includes(a) && run.scouted?.includes(b);
    return !seen && !run.knownBroken?.includes(key) && near(a) && near(b);
  });
  return unknown.length >= 2;
}

function decide(run: ExpeditionRun, escort: boolean): Decision {
  const map = expeditionMapOf(run);
  const scenario = expeditionScenarioOf(run);
  // Giặc phản công kho lương: đạo đứng đó phải đánh trước.
  if (run.market?.status === "due") {
    const i: ArmyIndex = run.armies[0].at === marketNode(run) ? 0 : 1;
    return { kind: "march", army: i, to: run.armies[i].at };
  }
  const gates = expeditionNeighbors(map, map.citadel);
  const alive = ([0, 1] as const).filter((i) => hpRatio(run, i) > 0);
  // Đạo đang đứng giữ kho lương chờ phản công thì ở yên, trừ khi đạo đó đang phải đi chặn viện binh.
  const nextReinf = scenario?.reinforcements?.days.find((d) => d >= run.day);
  const urgentHold = (i: ArmyIndex, goals: readonly string[] | undefined) =>
    nextReinf !== undefined && !!goals?.some((g) => scenario?.hold?.nodes.includes(g))
      && nextReinf - run.day <= routeTo(run, run.armies[i].at, goals!) + 1;
  const allMissions = missionTargets(run, alive, escort);
  const sitter = scenario?.counter && run.market?.status === "pending"
    ? alive.find((i) => run.armies[i].at === scenario.counter!.node)
    : undefined;
  const holding = sitter !== undefined && !urgentHold(sitter, allMissions[sitter]) ? sitter : undefined;
  const missions = holding === undefined ? allMissions : missionTargets(run, alive.filter((i) => i !== holding), escort);
  const daysLeft = map.days - run.day + 1;
  const atGate = alive.filter((i) => gates.includes(run.armies[i].at) && missions[i] === undefined && i !== holding);
  const away = alive.filter((i) => !atGate.includes(i) && i !== holding);
  const attacker = [...atGate].sort((a, b) => hpRatio(run, b) - hpRatio(run, a))[0];
  // Chờ đạo kia tới cổng để giáp công, trừ khi không còn kịp.
  if (attacker !== undefined) {
    const waiting = away.find((i) => {
      const used = run.armies[attacker].at;
      const free = gates.filter((g) => g !== used);
      return routeTo(run, run.armies[i].at, free.length ? free : gates) < daysLeft - 1;
    });
    if (waiting === undefined) {
      if (hpRatio(run, attacker) < 0.6 && daysLeft > 2) return { kind: "camp" };
      return { kind: "march", army: attacker, to: map.citadel };
    }
  }
  // Đạo nào còn đường dài nhất (kể cả việc phụ rồi về cổng) đi trước; đạo dưới 55% máu nghỉ trừ khi sắp hết ngày.
  // Chia cổng: mỗi đạo một cổng khác nhau, chọn cách chia để đạo về muộn hơn về sớm nhất (tránh hai đạo dồn một
  // ngả rồi một đạo phải vòng sang ngả kia). Đạo đang làm việc phụ tính từ đích việc phụ.
  const from = (i: ArmyIndex) => missions[i]?.[0] ?? run.armies[i].at;
  let gateOf: Partial<Record<ArmyIndex, string>> = {};
  if (gates.length >= 2) {
    let best = Infinity;
    for (const g0 of gates)
      for (const g1 of gates) {
        if (g0 === g1) continue;
        const cost = Math.max(route(run, from(0), g0), route(run, from(1), g1));
        if (cost < best) { best = cost; gateOf = { 0: g0, 1: g1 }; }
      }
  }
  const goalsOf = (i: ArmyIndex) => {
    if (missions[i]) return missions[i]!;
    const other = run.armies[i === 0 ? 1 : 0];
    const free = gates.filter((g) => g !== other.at);
    const nearest = free.length ? free : gates;
    // Chỉ theo cổng được chia khi không xa hơn cổng gần nhất quá một ngày (Quần Đảo: vòng biển rất xa).
    const mine = gateOf[i];
    if (mine && alive.includes(i === 0 ? 1 : 0) && route(run, run.armies[i].at, mine) <= routeTo(run, run.armies[i].at, nearest) + 1)
      return [mine];
    return nearest;
  };
  const remaining = (i: ArmyIndex) => {
    const at = run.armies[i].at;
    if (!missions[i]) return routeTo(run, at, goalsOf(i));
    return Math.min(...missions[i]!.map((g) => route(run, at, g) + routeTo(run, g, gates)));
  };
  // Đạo đi chặn viện binh được ưu tiên khi đợt viện binh kế tiếp sắp tới (còn vừa đủ ngày để tới ô giữ).
  const urgent = (i: ArmyIndex) => urgentHold(i, missions[i]);
  const movers = away
    .filter((i) => hpRatio(run, i) >= 0.55 || daysLeft <= 4)
    .sort((a, b) => Number(urgent(b)) - Number(urgent(a)) || remaining(b) - remaining(a) || hpRatio(run, b) - hpRatio(run, a));
  if (movers.length === 0) return { kind: "camp" };
  for (const i of movers) {
    const goals = goalsOf(i);
    if (worthScouting(run, i) && !run.scouted?.includes(run.armies[i].at)) return { kind: "scout", army: i };
    const to = stepToward(run, i, goals);
    if (to) return { kind: "march", army: i, to };
  }
  return { kind: "camp" };
}

const marketNode = (run: ExpeditionRun) => expeditionScenarioOf(run)?.counter?.node;

function fight(run: ExpeditionRun, army: ArmyIndex, encounter: ExpeditionEncounter, seed: number, player: Difficulty) {
  let { state } = createBattle({
    sides: [expeditionArmySide(run, army), expeditionFoeSide(encounter)],
    seed,
    timer: false,
    ...simRageOption([expeditionArmySide(run, army), expeditionFoeSide(encounter)]),
    firstSide: 0,
    weights: encounter.weights,
  });
  while (state.winner === null && state.turn.number <= DEFAULT_MAX_TURNS) {
    const difficulty = state.turn.side === 0 ? player : encounter.difficulty;
    state = playAiTurn(state, difficulty).state;
    if (expeditionObjectiveMet(encounter.objective, state)) state = { ...state, winner: 0 } as BattleState;
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
  let battles = 0, battlesLost = 0, camps = 0, pincers = 0, turns = 0, scouts = 0;
  const player = o.player ?? "normal";
  for (let guard = 0; guard < 64 && run.phase === "march"; guard++) {
    const d = decide(run, o.escort ?? true);
    o.trace?.(`ngày ${run.day}: ${d.kind === "camp" ? "đóng quân" : d.kind === "scout" ? `đạo ${d.army} trinh sát` : `đạo ${d.army} → ${d.to}`} | máu ${hpRatio(run, 0).toFixed(2)} / ${hpRatio(run, 1).toFixed(2)}`);
    if (d.kind === "scout") {
      scouts++;
      const sc = scoutExpedition(run, d.army);
      if (sc.ok) { run = sc.run; continue; }
    }
    if (d.kind === "camp" || d.kind === "scout") {
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
    if (m.kind === "moved" || m.kind === "blocked") { run = m.run; continue; }
    battles++;
    if (m.encounter.pincer) pincers++;
    const { state } = fight(run, d.army, m.encounter, rng.int(0, 0x7fffffff), player);
    turns += state.turn.number;
    const tag = expeditionMatchTag(run, d.army, m.encounter);
    run = beginExpeditionBattle(run, expeditionBattleRef(d.army, m.encounter, "sim"));
    const s = settleExpeditionBattle(run, tag, state);
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
    scouts,
    ending: expeditionEnding(run) ?? null,
    cut: run.reinforcementsCut === true,
    saved: run.refugees === "saved",
    marketHeld: run.market?.status === "held",
    mission: run.phase === "won" && expeditionMissionDone(run) === true,
  };
}

export const EXPEDITION_SIM_MAPS = Object.keys(EXPEDITION_MAPS) as ExpeditionMapId[];
