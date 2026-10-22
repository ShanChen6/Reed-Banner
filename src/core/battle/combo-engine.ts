import {
  COMBO_PASSIVES,
  comboReady,
  type ComboEvent,
  type ComboRef,
  type ComboSignalKind,
  type ComboOpportunity,
  type ComboPassiveDef,
  comboMultiplier,
} from "./combos";
import type { BattleState, SideIndex } from "./state";

interface Signal {
  kind: ComboSignalKind;
  source: ComboRef;
  target: ComboRef;
  action: number;
}
/** One deterministic queue per action. Gameplay never depends on audit logging or board RNG. */
export class ComboEngine {
  private queue: Signal[] = [];
  private skill:
    | { source: ComboRef; action: number; combo: boolean }
    | undefined;
  private spent: { actor: ComboRef; ready: ComboOpportunity } | undefined;
  private suppressed = 0;
  private drainSpent = false;
  constructor(
    private state: BattleState,
    private emit: (e: ComboEvent) => void,
  ) {}
  private fighter(r: ComboRef) {
    return this.state.sides[r.side].fighters[r.fighter]!;
  }
  private meta() {
    return (
      this.state.comboState ??
      (this.state.comboState = { version: 1, sequence: 0, sideTurns: [0, 0] })
    );
  }
  beginTurn(side: SideIndex) {
    if (
      !this.state.comboState &&
      !this.state.sides.some((s) => s.fighters.some((f) => f.comboPassive))
    )
      return;
    const m = this.meta();
    m.sideTurns[side]++;
    this.state.sides[side].fighters.forEach((f, i) => {
      if (f.comboReady && m.sideTurns[side] >= f.comboReady.expiresAt) {
        this.emit({
          type: "combo",
          side,
          fighter: i,
          passive: f.comboReady.passive,
          action: f.comboReady.openedBy,
          outcome: "expired",
        });
        delete f.comboReady;
      }
    });
  }
  beginSkill(source: ComboRef) {
    if (
      !this.state.comboState &&
      !this.state.sides.some((s) => s.fighters.some((f) => f.comboPassive))
    )
      return;
    this.skill = { source, action: ++this.meta().sequence, combo: false };
  }
  finishSkill() {
    this.flush();
    this.skill = undefined;
    this.spent = undefined;
  }
  withoutTriggers(fn: () => void) {
    this.suppressed++;
    try {
      fn();
    } finally {
      this.suppressed--;
    }
  }
  signal(kind: ComboSignalKind, target: ComboRef) {
    if (this.skill && !this.skill.combo && !this.suppressed)
      this.queue.push({
        kind,
        source: this.skill.source,
        target,
        action: this.skill.action,
      });
  }
  private take(
    actor: ComboRef,
    payoff: string,
    target?: ComboRef,
  ): ComboOpportunity | undefined {
    if (this.suppressed) return undefined;
    const prior = this.spent;
    if (
      prior &&
      prior.actor.side === actor.side &&
      prior.actor.fighter === actor.fighter
    ) {
      const p = COMBO_PASSIVES[prior.ready.passive];
      return p.payoff === payoff &&
        (!prior.ready.target ||
          (target &&
            target.side === prior.ready.target.side &&
            target.fighter === prior.ready.target.fighter))
        ? prior.ready
        : undefined;
    }
    const ready = comboReady(this.state, actor);
    if (!ready) return;
    const p = COMBO_PASSIVES[ready.passive];
    if (
      p.payoff !== payoff ||
      (ready.target &&
        (!target ||
          target.side !== ready.target.side ||
          target.fighter !== ready.target.fighter))
    )
      return;
    delete this.fighter(actor).comboReady;
    this.spent = { actor, ready };
    if (this.skill) this.skill.combo = true;
    this.emit({
      type: "combo",
      ...actor,
      passive: ready.passive,
      action: ready.openedBy,
      outcome: "used",
      source: ready.source,
      target: ready.target,
    });
    return ready;
  }
  damageRatio(actor: ComboRef, target: ComboRef) {
    const r = this.take(actor, "damage", target);
    return r ? 1 + COMBO_PASSIVES[r.passive].value : 1;
  }
  sustainPotential() {
    if (!this.skill || this.suppressed) return 1;
    const r = this.spent?.ready;
    if (r && COMBO_PASSIVES[r.passive].payoff === "sustain")
      return 1 + COMBO_PASSIVES[r.passive].value;
    return comboMultiplier(this.state, this.skill.source, "sustain");
  }
  sustainRatio(useful: boolean) {
    if (!useful || !this.skill) return 1;
    const r = this.take(this.skill.source, "sustain");
    return r ? 1 + COMBO_PASSIVES[r.passive].value : 1;
  }
  drainExtra(target: ComboRef) {
    if (!this.skill || this.drainSpent || this.fighter(target).energy <= 0)
      return 0;
    const r = this.take(this.skill.source, "drain", target);
    if (r) this.drainSpent = true;
    return r ? COMBO_PASSIVES[r.passive].value : 0;
  }
  discount() {
    if (this.skill) this.take(this.skill.source, "discount");
  }
  shieldGranted(target: ComboRef, amount: number) {
    if (amount <= 0) return;
    const f = this.fighter(target);
    const q = f.comboShield ?? (f.comboShield = []);
    if (this.skill && !this.skill.combo && !this.suppressed)
      q.push({ amount, source: this.skill.source, action: this.skill.action });
    else q.push({ amount, source: target, action: 0 }); // Non-skill/self grants cannot open retaliation.
  }
  shieldAbsorbed(target: ComboRef, amount: number, activeAttack: boolean) {
    const q = this.fighter(target).comboShield ?? [];
    while (amount > 0 && q.length) {
      const grant = q[0]!;
      const n = Math.min(amount, grant.amount);
      grant.amount -= n;
      amount -= n;
      if (
        n > 0 &&
        activeAttack &&
        !this.suppressed &&
        grant.action > 0 &&
        grant.source.side === target.side &&
        grant.source.fighter !== target.fighter
      )
        this.queue.push({
          kind: "shieldAbsorbed",
          source: grant.source,
          target,
          action: grant.action,
        });
      if (grant.amount === 0) q.shift();
    }
  }
  removeShield(target: ComboRef) {
    delete this.fighter(target).comboShield;
  }
  breakReady(target: ComboRef, reason: "dispel" | "ownerDown" | "targetDown") {
    const f = this.fighter(target);
    if (f.comboReady) {
      const r = f.comboReady;
      delete f.comboReady;
      this.emit({
        type: "combo",
        ...target,
        passive: r.passive,
        action: r.openedBy,
        outcome: "broken",
        reason,
      });
      return true;
    }
    return false;
  }
  down(target: ComboRef) {
    this.breakReady(target, "ownerDown");
    this.removeShield(target);
    this.state.sides.forEach((s, side) =>
      s.fighters.forEach((f, fighter) => {
        if (
          f.comboReady?.target?.side === target.side &&
          f.comboReady.target.fighter === target.fighter
        )
          this.breakReady({ side: side as SideIndex, fighter }, "targetDown");
      }),
    );
  }
  flush() {
    const signals = this.queue;
    this.queue = [];
    // A combo-enhanced action cannot open further opportunities, including shield-trigger side chains.
    for (const e of signals) {
      if (this.skill?.combo || this.spent || this.state.winner !== null)
        continue;
      const source = this.fighter(e.source);
      if (source.hp <= 0) continue;
      this.state.sides[e.source.side].fighters.forEach((f, i) => {
        const id = f.comboPassive;
        if (
          !id ||
          f.hp <= 0 ||
          i === e.source.fighter ||
          f.comboReady ||
          f.effects.some((x) => x.kind === "silence" || x.kind === "freeze")
        )
          return;
        const p: ComboPassiveDef = COMBO_PASSIVES[id];
        if (
          !(p.triggers as readonly ComboSignalKind[]).includes(e.kind) ||
          (p.receiverOnly && i !== e.target.fighter)
        )
          return;
        if (
          e.kind !== "healed" &&
          e.kind !== "shieldAbsorbed" &&
          e.target.side === e.source.side
        )
          return;
        if (this.fighter(e.target).hp <= 0) return;
        const turn = this.meta().sideTurns[e.source.side];
        if (f.comboOpenedAt === turn) return;
        const ready: ComboOpportunity = {
          passive: id,
          source: e.source,
          target: p.targeted ? e.target : undefined,
          openedBy: e.action,
          expiresAt: turn + 3,
        };
        f.comboReady = ready;
        f.comboOpenedAt = turn;
        this.emit({
          type: "combo",
          side: e.source.side,
          fighter: i,
          passive: id,
          action: e.action,
          outcome: "opened",
          source: e.source,
          target: ready.target,
        });
      });
    }
  }
}
