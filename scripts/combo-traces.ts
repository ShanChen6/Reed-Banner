/** Selected diagnostic replays. Counterfactual action is evaluated AFTER choosing, never shown to AI. */
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import {
  act,
  createBattle,
  chooseSkill,
  chooseMove,
  bestWhirl,
  canFreeWhirl,
  selectableActors,
  toView,
  createRng,
  PASSIVE,
  stageById,
  type BattleAction,
  type BattleEvent,
} from "../src/core";
import {
  screeningCases,
  spiritCases,
  pressureCases,
  campaignAuditCases,
} from "../src/core/sim/audit";
const root = "docs/reports/2026-10-22-combo";
const manifest = JSON.parse(
  readFileSync(`${root}/trace-manifest.json`, "utf8"),
) as { reason: string; group: string; caseId: string }[];
const cases = [
  ...screeningCases(),
  ...spiritCases(),
  ...pressureCases(),
  ...campaignAuditCases(),
];
const summaries = [];
for (const [i, selected] of manifest.entries())
  for (const mode of ["on", "off"] as const) {
    const c = structuredClone(cases.find((c) => c.id === selected.caseId)!);
    if (!c) throw new Error("Unknown case");
    if (mode === "off")
      for (const side of c.matchup.sides)
        for (const f of side.fighters)
          delete (f as { comboPassive?: string }).comboPassive;
    const expected = JSON.parse(
      gunzipSync(readFileSync(`${root}/${selected.group}-${mode}.jsonl.gz`))
        .toString()
        .trim()
        .split("\n")
        .find((l) => JSON.parse(l).caseId === c.id)!,
    );
    const created = createBattle({
      ...c.matchup,
      timer: false,
      audit: true,
      experimentalSpirit: "A",
    });
    let state = created.state;
    const counts = {
      turns: [0, 0],
      damage: 0,
      absorbed: 0,
      heal: 0,
      shield: 0,
      starvationDamage: 0,
    };
    const observed = (events: readonly BattleEvent[]) => {
      let beyond = false;
      for (const e of events) {
        if (e.type === "auditTurn" && e.number > 120) beyond = true;
        if (beyond) continue;
        if (e.type === "auditTurn") counts.turns[e.side]!++;
        if (e.type === "damage") {
          counts.damage += e.amount;
          counts.absorbed += e.absorbed;
          if (e.source === "starvation") counts.starvationDamage += e.amount;
        }
        if (e.type === "sustain") counts[e.kind] += e.effective;
      }
    };
    observed(created.events);
    const effect = (events: readonly BattleEvent[]) => ({
      directDamage: events.reduce(
        (n, e) =>
          n +
          (e.type === "damage" && (e.source === "skill" || e.source === "sword")
            ? e.amount
            : 0),
        0,
      ),
      absorbed: events.reduce(
        (n, e) => n + (e.type === "damage" ? e.absorbed : 0),
        0,
      ),
      heal: events.reduce(
        (n, e) =>
          n + (e.type === "sustain" && e.kind === "heal" ? e.effective : 0),
        0,
      ),
      shield: events.reduce(
        (n, e) =>
          n + (e.type === "sustain" && e.kind === "shield" ? e.effective : 0),
        0,
      ),
      ko: events
        .filter((e) => e.type === "ko")
        .map((e) => (e.type === "ko" ? `${e.side}:${e.fighter}` : "")),
    });
    const trace: unknown[] = [];
    let used = 0,
      enabledCasts = 0,
      enabledKo = 0,
      extraDamage = 0,
      extraHeal = 0,
      extraShield = 0;
    const apply = (action: BattleAction) => {
      const previous = state;
      const r = act(previous, action, 0);
      if (!r.ok) throw new Error(r.error);
      let counterfactual: unknown;
      if (r.events.some((e) => e.type === "combo" && e.outcome === "used")) {
        used++;
        const plain = structuredClone(previous);
        delete plain.sides[plain.turn.side].fighters[plain.turn.actor]!
          .comboReady;
        const baseline = act(plain, action, 0);
        const actual = effect(r.events);
        if (!baseline.ok) {
          enabledCasts++;
          counterfactual = { withoutComboRejected: baseline.error, actual };
        } else {
          const base = effect(baseline.events);
          const extraKo = actual.ko.filter((id) => !base.ko.includes(id));
          enabledKo += extraKo.length;
          extraDamage += actual.directDamage - base.directDamage;
          extraHeal += actual.heal - base.heal;
          extraShield += actual.shield - base.shield;
          counterfactual = { actual, withoutReady: base, extraKo };
        }
      }
      observed(r.events);
      trace.push({
        turn: previous.turn.number,
        side: previous.turn.side,
        actor: previous.turn.actor,
        hp: previous.sides.map((s) => s.fighters.map((f) => f.hp)),
        action,
        events: r.events,
        counterfactual,
      });
      state = r.state;
    };
    let chunks = 0;
    while (
      state.winner === null &&
      state.turn.number <= 120 &&
      chunks++ < 240
    ) {
      const side = state.turn.side,
        number = state.turn.number;
      const difficulty =
        c.group === "campaign" && side !== c.focalSide
          ? stageById(c.stage!)!.difficulty
          : "normal";
      while (
        state.winner === null &&
        state.turn.side === side &&
        state.turn.number === number
      ) {
        if (!selectableActors(state).length) break;
        if (canFreeWhirl(state)) {
          const free = bestWhirl(toView(state), PASSIVE.phongFreeWhirlTurns);
          if (free.score > 0) apply({ type: "whirl", whirl: free.whirl });
          if (state.winner !== null) break;
        }
        const skill = chooseSkill(toView(state));
        if (skill) apply(skill);
        if (state.winner !== null) break;
        const rng = createRng(state.aiRng);
        const move = chooseMove(toView(state), difficulty, rng);
        state = { ...state, aiRng: rng.state() };
        apply({ type: "swap", from: move.from, to: move.to });
      }
      if (state.turn.number === number && state.winner === null)
        throw new Error("Replay stalled");
    }
    const winner = state.turn.number > 120 ? null : state.winner;
    if (
      winner !== expected.winner ||
      JSON.stringify(counts.turns) !== JSON.stringify(expected.counts.turns)
    )
      throw new Error(`Replay outcome mismatch ${c.id}`);
    for (const k of [
      "damage",
      "absorbed",
      "heal",
      "shield",
      "starvationDamage",
    ] as const)
      if (counts[k] !== expected.counts[k])
        throw new Error(`Replay metric mismatch ${c.id} ${k}`);
    if (used !== expected.combos.used)
      throw new Error("Replay combo use mismatch");
    const name = `trace-${i}-${selected.reason}-${mode}.json.gz`;
    writeFileSync(
      `${root}/${name}`,
      gzipSync(
        JSON.stringify({
          caseId: c.id,
          mode,
          reason: selected.reason,
          cap: 120,
          winner,
          counts,
          trace,
        }),
      ),
    );
    summaries.push({
      file: name,
      caseId: c.id,
      mode,
      reason: selected.reason,
      used,
      enabledCasts,
      enabledKo,
      extraDamage,
      extraHeal,
      extraShield,
      matchedPrimary: true,
    });
  }
writeFileSync(
  `${root}/trace-counterfactuals.json`,
  JSON.stringify(summaries, null, 2),
);
console.log(JSON.stringify(summaries, null, 2));
