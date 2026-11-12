// Viễn Chinh trên server: xem sa bàn, xuất quân, tiến quân (mở trận khi gặp đồn), đóng quân, rút quân.
// Trận chơi qua /api/battles như mọi trận; bước cộng thưởng gọi expeditionSettle.ts để chốt vào lượt viễn chinh.

import {
  AI_SIDE,
  EXPEDITION_MAPS,
  EXPEDITION_TIERS,
  EXPEDITION_TIER_INFO,
  HUMAN,
  NEW_EXPEDITION,
  abandonExpedition,
  applyExpeditionEnd,
  beginExpeditionBattle,
  campExpedition,
  EXPEDITION_RUNS_PER_DAY,
  countExpeditionRun,
  createExpeditionRun,
  createRng,
  expeditionActive,
  expeditionArmySide,
  expeditionEncounter,
  expeditionFoeSide,
  expeditionMapOf,
  expeditionRunsLeft,
  expeditionTierUnlocked,
  expeditionVisible,
  expeditionBattleRef,
  expeditionChaseEncounter,
  expeditionCounterEncounter,
  expeditionMatchTag,
  expeditionScenarioOf,
  isExpeditionCombatNode,
  marchExpedition,
  scoutExpedition,
  type ExpeditionEncounter,
  type ExpeditionObjective,
  matchOver,
  parseExpeditionStart,
  startMatch,
  viewOf,
  vnDay,
  type BattleEvent,
  type Element,
  type ExpeditionRun,
  type ExpeditionState,
  type MatchView,
  type Profession,
} from "@/core";
import { getBattle, type Deps } from "./battles";
import { FEATURE_DISABLED_ERROR, expeditionEnabled } from "./featureFlags";
import { loadProfile, updateProfile } from "./profiles";
import type { MatchRecord } from "./store";

export type ExpeditionError =
  | "badRequest"
  | "runActive"
  | "noRun"
  | "notMarching"
  | "badMap"
  | "tierLocked"
  | "badArmy"
  | "duplicate"
  | "notOwned"
  | "notAdjacent"
  | "armyDown"
  | "conflict"
  | "dailyLimit"
  | "roadBroken"
  | "highTide"
  | "counterPending"
  | typeof FEATURE_DISABLED_ERROR;

export interface FoePreview {
  readonly id: string;
  readonly name: string;
  readonly element: Element;
  readonly profession: Profession;
  readonly level: number;
  readonly maxHp: number;
  readonly hpRatio: number;
}

export interface EncounterPreview {
  readonly node: string;
  readonly difficulty: string;
  readonly power: number;
  readonly pincer: boolean;
  readonly foes: readonly FoePreview[];
  /** Trận riêng: truy binh, phản công, phá cổng. */
  readonly mode?: string;
  readonly objective?: ExpeditionObjective;
}

function preview(e: ExpeditionEncounter): EncounterPreview {
  return {
    node: e.node,
    difficulty: e.difficulty,
    power: Math.round(e.power * 100) / 100,
    pincer: e.pincer,
    foes: e.foes.map((f, i) => ({
      id: f.id,
      name: f.name,
      element: f.element,
      profession: f.profession,
      level: e.level,
      maxHp: f.maxHp,
      hpRatio: e.hpRatio[i] ?? 1,
    })),
    ...(e.mode ? { mode: e.mode } : {}),
    ...(e.objective ? { objective: e.objective } : {}),
  };
}

/** Đối thủ của mọi ô còn địch, theo từng đạo (giáp công khác nhau tùy đạo nào đánh). Không có seed. */
function previews(run: ExpeditionRun): Record<string, readonly [EncounterPreview, EncounterPreview]> {
  const out: Record<string, readonly [EncounterPreview, EncounterPreview]> = {};
  // Sương mù: chỉ báo trước địch ở ô đang thấy.
  const visible = expeditionVisible(run);
  for (const node of expeditionMapOf(run).nodes) {
    if (!isExpeditionCombatNode(node.kind) || run.nodes[node.id]?.cleared || !visible.has(node.id)) continue;
    const one = (army: 0 | 1): EncounterPreview => preview(expeditionEncounter(run, node.id, army)!);
    out[node.id] = [one(0), one(1)];
  }
  return out;
}

/** Lượt gửi cho client: bỏ seed (đối thủ đã có trong `encounters`) và đường bị phá chưa lộ. */
function publicRun(run: ExpeditionRun | null) {
  if (!run) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { seed, broken, ...rest } = run;
  return rest;
}

/**
 * Kịch bản của lượt cho client, chỉ những khối sa bàn có: viện binh, phản công, đoàn dân, trận giữ, phá cổng; lịch con
 * nước chỉ khi đã biết. Không gửi danh sách đường có thể bị phá, chỉ báo sa bàn có đường bị phá. Kèm trận riêng đang chờ
 * (phản công) và trận truy binh nếu rời làng lúc này.
 */
function scenarioView(run: ExpeditionRun) {
  const scenario = expeditionScenarioOf(run);
  if (!scenario) return null;
  const { refugees, counter: counterRule, reinforcements, tide, hold, gate } = scenario;
  const holder = counterRule ? run.armies.findIndex((a) => a.at === counterRule.node) : -1;
  const carrier = run.refugees === 0 || run.refugees === 1 ? run.refugees : null;
  const chase =
    refugees && carrier !== null && run.armies[carrier].at === refugees.village && !run.nodes[refugees.chaseUnless]?.cleared
      ? expeditionChaseEncounter(run, refugees.village)
      : null;
  const counter = run.market?.status === "due" && holder >= 0 ? expeditionCounterEncounter(run, holder as 0 | 1) : null;
  return {
    endings: !!scenario.endingGold,
    brokenRoads: !!scenario.broken,
    ...(refugees
      ? {
          village: refugees.village,
          home: refugees.home,
          chaseUnless: refugees.chaseUnless,
          refugeeTitle: refugees.title ?? "Rút dân",
          refugeeNoun: refugees.noun ?? "đoàn dân",
        }
      : {}),
    ...(scenario.missionGold && !scenario.endingGold ? { missionGold: scenario.missionGold } : {}),
    ...(counterRule ? { market: counterRule.node, counterAfterDays: counterRule.afterDays } : {}),
    ...(reinforcements ? { reinforcementDays: reinforcements.days, reinforcementLabel: reinforcements.label } : {}),
    ...(tide ? { tideDays: run.tideKnown ? tide.days : null, tideRevealedBy: tide.revealedBy } : {}),
    ...(hold ? { holdNodes: hold.nodes, holdTurns: hold.turns } : {}),
    ...(gate ? { gate: true, gateSkipFrom: gate.skipFrom ?? null } : {}),
    ...(chase ? { chase: preview(chase) } : {}),
    ...(counter ? { counter: { army: holder, ...preview(counter) } } : {}),
  };
}

export async function expeditionOverview(ownerId: string | null, deps: Deps) {
  if (!expeditionEnabled(deps)) return { enabled: false as const, error: FEATURE_DISABLED_ERROR };
  let state: ExpeditionState = NEW_EXPEDITION;
  if (ownerId) {
    let stored = await loadProfile(deps.profiles, ownerId);
    const run = stored.profile.expedition?.run;
    // Trận đã xong mà chưa chốt (đóng tab giữa chừng): mở lại trận để bước cộng thưởng chạy, rồi đọc lại hồ sơ.
    if (run?.phase === "battle" && run.battle) {
      await getBattle(run.battle.matchId, ownerId, deps);
      stored = await loadProfile(deps.profiles, ownerId);
    }
    state = stored.profile.expedition ?? NEW_EXPEDITION;
  }
  return {
    enabled: true as const,
    maps: Object.values(EXPEDITION_MAPS).map((map) => ({
      ...map,
      tiers: EXPEDITION_TIERS.map((tier) => ({
        tier,
        ...EXPEDITION_TIER_INFO[tier],
        unlocked: expeditionTierUnlocked(state, map.id, tier),
        stars: state.stars[`${map.id}:${tier}`] ?? 0,
        bestDays: state.bestDays?.[`${map.id}:${tier}`] ?? null,
      })),
    })),
    cleared: state.cleared,
    runsLeft: expeditionRunsLeft(state, vnDay(deps.now)),
    runsPerDay: EXPEDITION_RUNS_PER_DAY,
    run: publicRun(state.run),
    encounters: state.run && state.run.phase === "march" ? previews(state.run) : {},
    visible: state.run ? [...expeditionVisible(state.run)] : [],
    scenario: state.run && state.run.phase === "march" ? scenarioView(state.run) : null,
  };
}

type Ok<T> = { readonly ok: true } & T;
type Fail = { readonly ok: false; readonly error: ExpeditionError };


export async function startExpedition(ownerId: string, raw: unknown, deps: Deps): Promise<Ok<{ run: ReturnType<typeof publicRun> }> | Fail> {
  if (!expeditionEnabled(deps)) return { ok: false, error: FEATURE_DISABLED_ERROR };
  const input = parseExpeditionStart(raw);
  if (!input) return { ok: false, error: "badRequest" };
  let created: ExpeditionRun | undefined;
  const runId = deps.newId();
  const updated = await updateProfile(
    deps.profiles,
    ownerId,
    (profile) => {
      const state = profile.expedition ?? NEW_EXPEDITION;
      const made = createExpeditionRun(profile, state, input, runId, deps.seed);
      if (!made.ok) return made;
      // Giới hạn mỗi ngày tính lúc xuất quân; lượt đang đi dở qua ngày vẫn đi tiếp.
      const counted = countExpeditionRun(state, vnDay(deps.now));
      if (!counted) return { ok: false as const, error: "dailyLimit" as const };
      created = made.run;
      return { ok: true as const, profile: { ...profile, expedition: { ...counted, run: made.run } } };
    },
    deps.now,
  );
  if (!updated.ok) return { ok: false, error: updated.error };
  return { ok: true, run: publicRun(created!) };
}

export type ExpeditionMarchResponse =
  | Ok<{ kind: "moved"; run: ReturnType<typeof publicRun> }>
  | Ok<{ kind: "blocked"; reason: "broken" | "tide"; run: ReturnType<typeof publicRun> }>
  | Ok<{ kind: "battle"; id: string; view: MatchView; events: readonly BattleEvent[]; resumed: boolean }>
  | Fail;

/** Tiến quân. Ô có địch thì mở trận (đang có trận thì trả lại trận đó). */
export async function marchExpeditionArmy(ownerId: string, raw: unknown, deps: Deps): Promise<ExpeditionMarchResponse> {
  if (!expeditionEnabled(deps)) return { ok: false, error: FEATURE_DISABLED_ERROR };
  if (!raw || typeof raw !== "object") return { ok: false, error: "badRequest" };
  const { army, to } = raw as Record<string, unknown>;
  if ((army !== 0 && army !== 1) || typeof to !== "string") return { ok: false, error: "badRequest" };
  const { profile } = await loadProfile(deps.profiles, ownerId);
  const run = profile.expedition?.run;
  if (!run) return { ok: false, error: "noRun" };
  if (run.phase === "battle" && run.battle) {
    const resumed = await getBattle(run.battle.matchId, ownerId, deps);
    if (resumed.ok && resumed.view.battle.winner === null)
      return { ok: true, kind: "battle", id: resumed.id, view: resumed.view, events: resumed.events, resumed: true };
    return { ok: false, error: "conflict" };
  }
  const planned = marchExpedition(run, army, to);
  if (!planned.ok) return { ok: false, error: planned.error };
  if (planned.kind === "moved") {
    const saved = await saveRun(ownerId, run, planned.run, deps);
    return saved ? { ok: true, kind: "moved", run: publicRun(planned.run) } : { ok: false, error: "conflict" };
  }
  if (planned.kind === "blocked") {
    const saved = await saveRun(ownerId, run, planned.run, deps);
    return saved
      ? { ok: true, kind: "blocked", reason: planned.reason, run: publicRun(planned.run) }
      : { ok: false, error: "conflict" };
  }
  const encounter = planned.encounter;
  const matchId = deps.newId();
  const step = startMatch({
    sides: [expeditionArmySide(run, army), expeditionFoeSide(encounter)],
    difficulty: encounter.difficulty,
    seed: deps.seed,
    firstSide: HUMAN,
    now: deps.now,
    weights: encounter.weights,
    expedition: expeditionMatchTag(run, army, encounter),
  });
  const next = beginExpeditionBattle(run, expeditionBattleRef(army, encounter, matchId));
  if (!(await saveRun(ownerId, run, next, deps))) return { ok: false, error: "conflict" };
  const record: MatchRecord = { id: matchId, ownerId, match: step.match, createdAt: deps.now, updatedAt: deps.now };
  await deps.store.create(record);
  return { ok: true, kind: "battle", id: matchId, view: viewOf(step.match), events: step.events, resumed: false };
}

export async function campExpeditionArmies(ownerId: string, deps: Deps): Promise<Ok<{ run: ReturnType<typeof publicRun> }> | Fail> {
  if (!expeditionEnabled(deps)) return { ok: false, error: FEATURE_DISABLED_ERROR };
  const { profile } = await loadProfile(deps.profiles, ownerId);
  const run = profile.expedition?.run;
  if (!run) return { ok: false, error: "noRun" };
  const camped = campExpedition(run);
  if (!camped.ok) return camped;
  return (await saveRun(ownerId, run, camped.run, deps))
    ? { ok: true, run: publicRun(camped.run) }
    : { ok: false, error: "conflict" };
}

/** Trinh sát: một đạo đứng yên một ngày vén sương quanh mình (sa bàn có kịch bản). */
export async function scoutExpeditionArmy(ownerId: string, raw: unknown, deps: Deps): Promise<Ok<{ run: ReturnType<typeof publicRun> }> | Fail> {
  if (!expeditionEnabled(deps)) return { ok: false, error: FEATURE_DISABLED_ERROR };
  const army = raw && typeof raw === "object" ? (raw as Record<string, unknown>).army : undefined;
  if (army !== 0 && army !== 1) return { ok: false, error: "badRequest" };
  const { profile } = await loadProfile(deps.profiles, ownerId);
  const run = profile.expedition?.run;
  if (!run) return { ok: false, error: "noRun" };
  const scouted = scoutExpedition(run, army);
  if (!scouted.ok) return { ok: false, error: scouted.error === "badArmy" ? "badRequest" : scouted.error };
  return (await saveRun(ownerId, run, scouted.run, deps))
    ? { ok: true, run: publicRun(scouted.run) }
    : { ok: false, error: "conflict" };
}

/** Rút khỏi viễn chinh. Đang có trận thì trận đó tính thua trước. */
export async function abandonExpeditionRun(ownerId: string, deps: Deps): Promise<Ok<{ stopped: boolean }> | Fail> {
  if (!expeditionEnabled(deps)) return { ok: false, error: FEATURE_DISABLED_ERROR };
  let { profile } = await loadProfile(deps.profiles, ownerId);
  let run = profile.expedition?.run;
  if (!run || !expeditionActive(profile.expedition)) return { ok: true, stopped: false };
  if (run.phase === "battle" && run.battle) {
    const record = await deps.store.get(run.battle.matchId);
    if (record && record.ownerId === ownerId && !matchOver(record.match)) {
      const battle = structuredClone(record.match.battle);
      battle.winner = AI_SIDE;
      battle.turn.deadline = null;
      const match = { ...record.match, battle, forfeited: true, seq: record.match.seq + 1 };
      if (!(await deps.store.save({ ...record, match, updatedAt: deps.now }, record.match.seq)))
        return { ok: false, error: "conflict" };
    }
    await getBattle(run.battle.matchId, ownerId, deps);
    ({ profile } = await loadProfile(deps.profiles, ownerId));
    run = profile.expedition?.run;
    if (!run || !expeditionActive(profile.expedition)) return { ok: true, stopped: true };
    if (run.phase !== "march") return { ok: false, error: "conflict" };
  }
  const saved = await saveRun(ownerId, run, abandonExpedition(run), deps);
  return saved ? { ok: true, stopped: true } : { ok: false, error: "conflict" };
}

/**
 * Ghi lượt mới khi lượt đang lưu vẫn đúng là `expected` (cùng id, ngày, pha); lượt vừa kết thúc thì cộng thưởng
 * kết thúc trong cùng lần ghi.
 */
async function saveRun(ownerId: string, expected: ExpeditionRun, next: ExpeditionRun, deps: Deps): Promise<boolean> {
  const updated = await updateProfile(
    deps.profiles,
    ownerId,
    (profile) => {
      const state = profile.expedition ?? NEW_EXPEDITION;
      const cur = state.run;
      if (!cur || cur.id !== expected.id || cur.day !== expected.day || cur.phase !== expected.phase)
        return { ok: false as const, error: "conflict" as const };
      const ended = applyExpeditionEnd(profile, { ...state, run: next }, createRng(deps.seed));
      return { ok: true as const, profile: { ...ended.profile, expedition: ended.state } };
    },
    deps.now,
  );
  return updated.ok;
}

