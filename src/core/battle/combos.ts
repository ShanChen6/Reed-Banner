// Combo definitions and pure projections shared by battle, AI, UI and future roster entries.
import { chasePassives, CHASE_PASSIVES } from "./chase";
import type { BattleState, Fighter, FighterConfig, SideIndex } from "./state";
import type { SkillDef } from "./skills";

export type ComboSignalKind =
  | "armorBroken"
  | "controlled"
  | "dispelled"
  | "skillDamage"
  | "healed"
  | "shieldAbsorbed";
export type ComboPayoff = "damage" | "sustain" | "drain" | "discount";
export interface ComboPassiveDef {
  readonly id: string;
  readonly name: string;
  readonly triggers: readonly ComboSignalKind[];
  readonly payoff: ComboPayoff;
  readonly value: number;
  readonly targeted: boolean;
  readonly receiverOnly?: boolean;
  readonly description: string;
}
export const COMBO_PASSIVES = {
  pursuit: {
    id: "pursuit",
    name: "Thừa thắng",
    triggers: ["armorBroken", "dispelled"],
    payoff: "damage",
    value: 0.2,
    targeted: true,
    description:
      "Đồng đội phá giáp hoặc xua tan thành công: đòn kiếm/kỹ năng sát thương tiếp theo vào mục tiêu đó tăng 20% sát thương.",
  },
  resonance: {
    id: "resonance",
    name: "Hội tụ",
    triggers: ["controlled"],
    payoff: "damage",
    value: 0.2,
    targeted: true,
    description:
      "Đồng đội áp Đóng băng/Câm lặng thành công: đòn kiếm/kỹ năng sát thương tiếp theo vào mục tiêu đó tăng 20% sát thương.",
  },
  retaliation: {
    id: "retaliation",
    name: "Hộ vệ phản kích",
    triggers: ["shieldAbsorbed"],
    payoff: "damage",
    value: 0.2,
    targeted: false,
    receiverOnly: true,
    description:
      "Khiên do đồng đội chủ động cấp cho mình thực sự đỡ đòn kiếm/kỹ năng: đòn kiếm/kỹ năng sát thương tiếp theo tăng 20% sát thương.",
  },
  renewal: {
    id: "renewal",
    name: "Tiếp sức",
    triggers: ["skillDamage"],
    payoff: "sustain",
    value: 0.25,
    targeted: false,
    description:
      "Đồng đội dùng kỹ năng gây mất HP thực: kỹ năng hồi/cấp Khiên hữu hiệu tiếp theo tăng 25% lượng gốc của các bước hồi/Khiên trực tiếp, trước hệ số Tinh thần của người nhận.",
  },
  interdiction: {
    id: "interdiction",
    name: "Đoạn tiếp tế",
    triggers: ["controlled", "dispelled"],
    payoff: "drain",
    value: 10,
    targeted: true,
    description:
      "Đồng đội khống chế hoặc xua tan thành công: kỹ năng trừ năng lượng tiếp theo vào mục tiêu đó trừ thêm 10, tối đa năng lượng đang có.",
  },
  coordination: {
    id: "coordination",
    name: "Hiệp lực",
    triggers: ["healed", "shieldAbsorbed"],
    payoff: "discount",
    value: 10,
    targeted: false,
    description:
      "Đồng đội dùng kỹ năng hồi HP thực hoặc Khiên do đồng đội cấp cho người khác đỡ đòn chủ động: kỹ năng tiếp theo giảm 10 năng lượng, không thấp hơn 0.",
  },
} as const satisfies Record<string, ComboPassiveDef>;
export type ComboPassiveId = keyof typeof COMBO_PASSIVES;
export const PROFESSION_COMBO: Readonly<
  Record<FighterConfig["profession"], ComboPassiveId>
> = {
  xaThu: "pursuit",
  satThu: "resonance",
  tuongSi: "pursuit",
  phapSu: "resonance",
  binhLinh: "retaliation",
  ySu: "renewal",
  muuSi: "interdiction",
  quanSu: "coordination",
};
export interface ComboRef {
  readonly side: SideIndex;
  readonly fighter: number;
}
export interface ComboOpportunity {
  readonly passive: ComboPassiveId;
  readonly source: ComboRef;
  readonly target?: ComboRef;
  readonly openedBy: number;
  readonly expiresAt: number;
}
export interface ShieldGrant {
  amount: number;
  readonly source: ComboRef;
  readonly action: number;
  /** Reaction shields retain chase provenance but cannot open prepared opportunities. */
  readonly reaction?: boolean;
}
export interface ComboState {
  readonly version: 1;
  sequence: number;
  sideTurns: [number, number];
}
export type ComboEvent = {
  readonly type: "combo";
  readonly side: SideIndex;
  readonly fighter: number;
  readonly passive: ComboPassiveId;
  readonly action: number;
  readonly turn?: number;
  readonly outcome: "opened" | "used" | "expired" | "broken";
  readonly source?: ComboRef;
  readonly target?: ComboRef;
  readonly reason?: "dispel" | "ownerDown" | "targetDown";
};
export function comboPassive(
  f: Pick<FighterConfig, "comboPassive">,
): ComboPassiveDef | undefined {
  return f.comboPassive ? COMBO_PASSIVES[f.comboPassive] : undefined;
}
export function comboReady(
  state: Pick<BattleState, "sides" | "comboState">,
  ref: ComboRef,
): ComboOpportunity | undefined {
  const f = state.sides[ref.side].fighters[ref.fighter];
  const ready = f?.comboReady;
  if (
    !f ||
    f.hp <= 0 ||
    !ready ||
    f.effects.some((e) => e.kind === "silence" || e.kind === "freeze")
  )
    return undefined;
  if (
    !state.comboState ||
    state.comboState.sideTurns[ref.side] >= ready.expiresAt
  )
    return undefined;
  if (
    ready.target &&
    (state.sides[ready.target.side].fighters[ready.target.fighter]?.hp ?? 0) <=
      0
  )
    return undefined;
  return ready;
}
export function comboSkillCost(
  f: Pick<Fighter, "comboReady" | "effects" | "hp">,
  def: SkillDef,
): number {
  const ready = f.comboReady;
  return ready &&
    f.hp > 0 &&
    !f.effects.some((e) => e.kind === "silence" || e.kind === "freeze") &&
    COMBO_PASSIVES[ready.passive].payoff === "discount"
    ? Math.max(0, def.cost - COMBO_PASSIVES[ready.passive].value)
    : def.cost;
}
export function comboMultiplier(
  state: Pick<BattleState, "sides" | "comboState">,
  actor: ComboRef,
  payoff: "damage" | "sustain",
  target?: ComboRef,
): number {
  const ready = comboReady(state, actor);
  if (!ready) return 1;
  const p = COMBO_PASSIVES[ready.passive];
  return p.payoff === payoff &&
    (!ready.target ||
      (target &&
        ready.target.side === target.side &&
        ready.target.fighter === target.fighter))
    ? 1 + p.value
    : 1;
}
export function comboDescription(
  f: Pick<FighterConfig, "comboPassive"> & Partial<Pick<FighterConfig,"profession"|"element"|"chasePassives">>,
): string {
  const p = comboPassive(f);
  const chase = f.profession && f.element ? chasePassives({profession:f.profession,element:f.element,chasePassives:f.chasePassives}).map(id=>`${CHASE_PASSIVES[id].name}: ${CHASE_PASSIVES[id].description}`).join(" · ") : "";
  return p
    ? `${p.name}: ${p.description} Cơ hội nghề 1 không tự tung chiêu; chỉ một cơ hội, không cộng dồn. Dùng trong hai lượt thường tiếp theo của phe; lượt thêm không rút thời hạn. Câm lặng/Đóng băng chặn kích hoạt và tận dụng; Xua tan xóa cơ hội. ${chase ? `Ba bị động truy kích: ${chase} Mỗi bị động một lần/hành động; chuỗi tối đa12 phản ứng, sâu4.` : ""}`
    : "";
}

/** Potential openers only; engine still requires the actual effect to succeed. */
export function skillComboOpeners(def: SkillDef): ComboSignalKind[] {
  const signals = new Set<ComboSignalKind>();
  for (const step of def.steps) {
    if (step.type === "damage") signals.add("skillDamage");
    if (step.type === "heal") signals.add("healed");
    if (step.type === "dispel") signals.add("dispelled");
    if (step.type === "effect") {
      if (step.effect === "defDown") signals.add("armorBroken");
      if (step.effect === "freeze" || step.effect === "silence")
        signals.add("controlled");
      if (
        step.effect === "shield" &&
        (step.to === "team" ||
          (step.to === "targets" &&
            (def.target === "team" || def.target === "ally")))
      )
        signals.add("shieldAbsorbed");
    }
  }
  return [...signals];
}
export function skillComboPartners(def: SkillDef): string[] {
  const kinds = skillComboOpeners(def);
  return [...Object.values(COMBO_PASSIVES),...Object.values(CHASE_PASSIVES)]
    .filter((p) =>
      (p.triggers as readonly ComboSignalKind[]).some((k) => kinds.includes(k)),
    )
    .map((p) => p.name);
}

/** Upgrade a stored loadout only when constructing a NEW match, never mutate an ongoing battle. */
export function withComboPassive<T extends FighterConfig>(
  f: T,
): T & { readonly comboPassive: ComboPassiveId } {
  return {
    ...f,
    comboPassive: f.comboPassive ?? PROFESSION_COMBO[f.profession],
    chasePassives: chasePassives(f),
  };
}

/** Bounded visible-state estimate for removing a prepared opportunity; never reads board RNG. */
export function comboOpportunityValue(
  state: Pick<BattleState, "sides" | "comboState">,
  ref: ComboRef,
): number {
  const ready = comboReady(state, ref);
  if (!ready) return 0;
  const f = state.sides[ref.side].fighters[ref.fighter]!;
  const p = COMBO_PASSIVES[ready.passive];
  switch (p.payoff) {
    case "damage":
      return Math.min(
        ready.target
          ? state.sides[ready.target.side].fighters[ready.target.fighter]!.hp
          : Infinity,
        f.atk * 2 * p.value,
      );
    case "sustain":
      return f.maxHp * 0.22 * p.value;
    case "drain":
      return (
        Math.min(
          p.value,
          ready.target
            ? state.sides[ready.target.side].fighters[ready.target.fighter]!
                .energy
            : 0,
        ) *
        f.atk *
        0.05
      );
    case "discount":
      return p.value * f.atk * 0.05;
  }
}
