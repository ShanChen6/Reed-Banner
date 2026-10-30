import { ENERGY_MAX, spiritHealMultiplier } from "./rules";
import { CHASE_PASSIVES, CHASE_LIMITS, type ChasePassiveDef, type ChaseEvent, type ChaseAuditEvent, type ChasePassiveId } from "./chase";
import { COMBO_PASSIVES, comboReady, type ComboEvent, type ComboRef, type ComboSignalKind, type ComboOpportunity, type ComboPassiveDef, comboMultiplier, } from "./combos";
import type { BattleState, SideIndex } from "./state";
interface Signal {
    kind: ComboSignalKind;
    source: ComboRef;
    target: ComboRef;
    action: number;
    depth?: number;
    attacker?: ComboRef;
    provenanceOnly?: boolean;
}
/** One deterministic queue per action. Gameplay never depends on audit logging or board RNG. */
export class ComboEngine {
    private queue: Signal[] = [];
    private chaseQueue: Signal[] = [];
    private chaseUsed = new Set<string>();
    private chaseDepth = 0;
    private chaseCount = 0;
    private chaseAction: number | undefined;
    private chasing = false;
    private flushing = false;
    private skill: {
        source: ComboRef;
        action: number;
        combo: boolean;
    } | undefined;
    private spent: {
        actor: ComboRef;
        ready: ComboOpportunity;
    } | undefined;
    private suppressed = 0;
    private drainSpent = false;
    constructor(private state: BattleState, private emit: (e: ComboEvent | ChaseEvent | ChaseAuditEvent) => void, private react: (passive: ChasePassiveDef, source: ComboRef, target: ComboRef, opener: ComboRef) => void) { }
    private fighter(r: ComboRef) {
        return this.state.sides[r.side].fighters[r.fighter]!;
    }
    private meta() {
        return (this.state.comboState ??
            (this.state.comboState = { version: 1, sequence: 0, sideTurns: [0, 0] }));
    }
    beginTurn(side: SideIndex) {
        if (!this.state.comboState &&
            !this.state.sides.some((s) => s.fighters.some((f) => f.comboPassive)))
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
        if (!this.state.comboState &&
            !this.state.sides.some((s) => s.fighters.some((f) => f.comboPassive)))
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
        }
        finally {
            this.suppressed--;
        }
    }
    signal(kind: ComboSignalKind, target: ComboRef) {
        if (this.skill && !this.suppressed)
            this.chaseQueue.push({ kind, source: this.skill.source, target, action: this.skill.action, depth: this.chaseDepth });
        // Chase may continue the reaction queue, but cannot create prepared opportunities.
        if (this.skill && !this.skill.combo && !this.suppressed && !this.chasing)
            this.queue.push({
                kind,
                source: this.skill.source,
                target,
                action: this.skill.action,
            });
    }
    private take(actor: ComboRef, payoff: string, target?: ComboRef): ComboOpportunity | undefined {
        if (this.suppressed || this.chasing)
            return undefined;
        const prior = this.spent;
        if (prior &&
            prior.actor.side === actor.side &&
            prior.actor.fighter === actor.fighter) {
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
        if (!ready)
            return;
        const p = COMBO_PASSIVES[ready.passive];
        if (p.payoff !== payoff ||
            (ready.target &&
                (!target ||
                    target.side !== ready.target.side ||
                    target.fighter !== ready.target.fighter)))
            return;
        delete this.fighter(actor).comboReady;
        this.spent = { actor, ready };
        if (this.skill)
            this.skill.combo = true;
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
        if (!this.skill || this.suppressed)
            return 1;
        const r = this.spent?.ready;
        if (r && COMBO_PASSIVES[r.passive].payoff === "sustain")
            return 1 + COMBO_PASSIVES[r.passive].value;
        return comboMultiplier(this.state, this.skill.source, "sustain");
    }
    sustainRatio(useful: boolean) {
        if (!useful || !this.skill)
            return 1;
        const r = this.take(this.skill.source, "sustain");
        return r ? 1 + COMBO_PASSIVES[r.passive].value : 1;
    }
    drainExtra(target: ComboRef) {
        if (!this.skill || this.drainSpent || this.fighter(target).energy <= 0)
            return 0;
        const r = this.take(this.skill.source, "drain", target);
        if (r)
            this.drainSpent = true;
        return r ? COMBO_PASSIVES[r.passive].value : 0;
    }
    discount() {
        if (this.skill)
            this.take(this.skill.source, "discount");
    }
    shieldGranted(target: ComboRef, amount: number) {
        if (amount <= 0)
            return;
        const f = this.fighter(target);
        const q = f.comboShield ?? (f.comboShield = []);
        if (this.skill && !this.skill.combo && !this.suppressed)
            q.push({ amount, source: this.skill.source, action: this.skill.action, ...(this.chasing ? { reaction: true } : {}) });
        else
            q.push({ amount, source: target, action: 0 }); // Non-skill/self grants cannot open retaliation.
    }
    shieldAbsorbed(target: ComboRef, amount: number, activeAttack: boolean, attacker?: ComboRef) {
        if (amount > 0 && activeAttack && attacker && !this.suppressed && !this.chasing && attacker.side !== target.side) {
            this.chaseQueue.push({kind:'shieldAbsorbed',source:target,target,attacker,provenanceOnly:true,action:this.skill?.action ?? 0,depth:0});
        }
        const q = this.fighter(target).comboShield ?? [];
        while (amount > 0 && q.length) {
            const grant = q[0]!;
            const n = Math.min(amount, grant.amount);
            grant.amount -= n;
            amount -= n;
            if (n > 0 &&
                activeAttack &&
                !this.suppressed &&
                grant.action > 0 &&
                grant.source.side === target.side &&
                grant.source.fighter !== target.fighter) {
                const event: Signal = { kind: "shieldAbsorbed", source: grant.source, target, action: grant.action, depth: this.chaseDepth };
                if (!grant.reaction)
                    this.queue.push(event);
                this.chaseQueue.push(event);
            }
            if (grant.amount === 0)
                q.shift();
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
        this.state.sides.forEach((s, side) => s.fighters.forEach((f, fighter) => {
            if (f.comboReady?.target?.side === target.side &&
                f.comboReady.target.fighter === target.fighter)
                this.breakReady({ side: side as SideIndex, fighter }, "targetDown");
        }));
    }
    private audit(stage: ChaseAuditEvent['stage'], reason: string, e: Signal, fighter = e.source.fighter, passive?: ChasePassiveId) {
        if (this.state.audit) this.emit({ type: 'chaseAudit', stage, reason, side: e.source.side, fighter, passive, signal: e.kind, action: this.chaseAction ?? e.action, depth: e.depth ?? 0 });
    }
    flush() {
        if (this.flushing)
            return;
        this.flushing = true;
        if (this.chaseQueue.length && this.chaseAction === undefined)
            this.chaseAction = this.skill?.action ?? ++this.meta().sequence;
        try {
            while (this.chaseQueue.length && this.chaseCount < CHASE_LIMITS.maxReactions && this.state.winner === null) {
                const e = this.chaseQueue.shift()!;
                if ((e.depth ?? 0) >= CHASE_LIMITS.maxDepth || this.fighter(e.source).hp <= 0) {
                    this.audit('limit', (e.depth ?? 0) >= CHASE_LIMITS.maxDepth ? 'depthLimit' : 'sourceDown', e);
                    continue;
                }
                this.state.sides[e.source.side].fighters.forEach((f, i) => {
                    for (const id of f.chasePassives ?? []) {
                        const p: ChasePassiveDef = CHASE_PASSIVES[id];
                        const key = `${e.source.side}:${i}:${id}`;
                        if (!p.triggers.includes(e.kind)) continue;
                        if (!!p.attackerRecipient !== !!e.provenanceOnly) continue;
                        if (p.activeOnly && (e.depth ?? 0) !== 0) continue;
                        if (p.selfSource && i !== e.source.fighter) continue;
                        if (p.receiverOnly && i !== e.target.fighter) continue;
                        const skip = (reason: string) => this.audit('candidate', reason, e, i, id);
                        if (this.chaseCount >= CHASE_LIMITS.maxReactions || this.state.winner !== null) break;
                        if (f.hp <= 0 || f.effects.some(x => x.kind === 'silence' || x.kind === 'freeze')) { skip('blocked'); continue; }
                        if (this.chaseUsed.has(key)) { skip('alreadyUsed'); continue; }
                        if (p.alliesOnly && i === e.source.fighter) { skip('selfSource'); continue; }
                        const hostile = p.effect === 'damage' || p.effect === 'armor' || p.effect === 'drain';
                        const enemy = e.target.side !== e.source.side ? e.target : { side: (1 - e.source.side) as SideIndex, fighter: this.state.sides[(1 - e.source.side) as SideIndex].fighters.findIndex(x => x.hp > 0) };
                        let target = hostile ? enemy : e.target.side === e.source.side ? e.target : e.source;
                        if (p.selfRecipient) target = {side:e.source.side,fighter:i};
                        if (p.attackerRecipient) {
                            if (!e.attacker || e.attacker.side === e.source.side) { skip('missingAttacker'); continue; }
                            target = e.attacker;
                        }
                        if (p.effect === 'heal') {
                            const candidates = this.state.sides[e.source.side].fighters.map((x, j) => ({ x, j })).filter(({ x }) => x.hp > 0 && x.hp < x.maxHp).sort((a, b) => a.x.hp / a.x.maxHp - b.x.hp / b.x.maxHp || a.j - b.j);
                            if (!candidates.length) { skip('fullHealth'); continue; }
                            target = { side: e.source.side, fighter: candidates[0]!.j };
                        }
                        if (target.fighter < 0 || this.fighter(target).hp <= 0) { skip('targetDown'); continue; }
                        if (p.effect === 'drain' && this.fighter(target).energy <= 0) { skip('emptyEnergy'); continue; }
                        if (p.effect === 'energy' && this.fighter(target).energy >= ENERGY_MAX) { skip('fullEnergy'); continue; }
                        if (p.effect === 'shield' && Math.round(this.fighter(target).maxHp * p.value * spiritHealMultiplier(this.fighter(target).spirit, this.state.experimentalSpirit)) <= (this.fighter(target).effects.find(x => x.kind === 'shield')?.value ?? 0)) { skip('existingShield'); continue; }
                        if (p.effect === 'armor' && this.fighter(target).effects.some(x => x.kind === 'defDown' && x.value >= p.value && (x.turns === null || x.turns >= 1))) { skip('existingArmor'); continue; }
                        skip('triggered');
                        this.chaseUsed.add(key);
                        this.chaseCount++;
                        const prior = this.skill;
                        const depth = this.chaseDepth;
                        const actor = { side: e.source.side, fighter: i };
                        this.skill = { source: actor, action: this.chaseAction!, combo: false };
                        this.chasing = true;
                        this.chaseDepth = (e.depth ?? 0) + 1;
                        this.emit({ type: 'chase', ...actor, passive: id, source: e.source, target, action: this.skill.action, depth: this.chaseDepth });
                        try {
                            this.react(p, actor, target, e.source);
                        }
                        finally {
                            this.audit('end', 'resolved', e, i, id);
                            this.skill = prior;
                            this.chaseDepth = depth;
                            this.chasing = false;
                        }
                    }
                });
            }
            for (const e of this.chaseQueue) this.audit('limit', this.state.winner === null ? 'reactionLimit' : 'battleEnded', e);
            this.chaseQueue = [];
            const signals = this.queue;
            this.queue = [];
            // A combo-enhanced action cannot open further opportunities, including shield-trigger side chains.
            for (const e of signals) {
                if (this.skill?.combo || this.spent || this.state.winner !== null)
                    continue;
                const source = this.fighter(e.source);
                if (source.hp <= 0)
                    continue;
                this.state.sides[e.source.side].fighters.forEach((f, i) => {
                    const id = f.comboPassive;
                    if (!id ||
                        f.hp <= 0 ||
                        i === e.source.fighter ||
                        (f.comboReady && (f.profession as string) !== "xaThu" && (f.profession as string) !== "satThu") ||
                        f.effects.some((x) => x.kind === "silence" || x.kind === "freeze"))
                        return;
                    const p: ComboPassiveDef = COMBO_PASSIVES[id];
                    if (!(p.triggers as readonly ComboSignalKind[]).includes(e.kind) ||
                        (p.receiverOnly && i !== e.target.fighter))
                        return;
                    if (e.kind !== "healed" &&
                        e.kind !== "shieldAbsorbed" &&
                        e.target.side === e.source.side)
                        return;
                    if (this.fighter(e.target).hp <= 0)
                        return;
                    const turn = this.meta().sideTurns[e.source.side];
                    if (f.comboOpenedAt === turn && (f.profession as string) !== "xaThu" && (f.profession as string) !== "satThu")
                        return;
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
        finally {
            this.flushing = false;
        }
    }
}
