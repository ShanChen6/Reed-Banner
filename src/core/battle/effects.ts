// Hiệu ứng trạng thái, xem docs/01-gameplay/hieu-ung.md.

export const EFFECT_KINDS = [
  "shield",
  "freeze",
  "freezeImmune",
  "burn",
  "poison",
  "atkUp",
  "atkDown",
  "defUp",
  "defDown",
  "regen",
  "taunt",
  "reflect",
  "silence",
] as const;
export type EffectKind = (typeof EFFECT_KINDS)[number];

export interface Effect {
  readonly kind: EffectKind;
  /** shield: lượng hấp thụ còn lại; burn/regen: máu mỗi lượt; atk/def/reflect: tỉ lệ (0.25 = 25%). */
  value: number;
  /** Poison stack source: fighter instance, never character ID. */
  readonly source?: { readonly side: 0 | 1; readonly fighter: number };
  /** Số lượt còn lại của phe bị ảnh hưởng; null là tới khi hết (Khiên). */
  turns: number | null;
}

/** Bị Thanh tẩy xóa. */
export const NEGATIVE_EFFECTS: readonly EffectKind[] = ["freeze", "burn", "poison", "atkDown", "defDown", "silence"];
/** Bị Xua tan xóa. */
export const POSITIVE_EFFECTS: readonly EffectKind[] = ["shield", "atkUp", "defUp", "regen", "reflect"];

export const FREEZE_MAX_TURNS = 2;
export const TAUNT_MAX_TURNS = 2;
export const FREEZE_IMMUNE_TURNS = 1;

export function findEffect(effects: readonly Effect[], kind: EffectKind): Effect | undefined {
  return effects.find((e) => e.kind === kind);
}

export function hasEffect(effects: readonly Effect[], kind: EffectKind): boolean {
  return findEffect(effects, kind) !== undefined;
}

/**
 * Thêm hiệu ứng. Cùng loại thì làm mới, không cộng dồn: giữ giá trị mạnh hơn và thời lượng dài hơn.
 * Trả về false nếu bị chặn (Đóng băng khi đang miễn nhiễm).
 */
export function addEffect(effects: Effect[], incoming: Effect): boolean {
  let effect = incoming;
  if (effect.kind === "freeze") {
    if (hasEffect(effects, "freezeImmune")) return false;
    effect = { ...effect, turns: Math.min(FREEZE_MAX_TURNS, effect.turns ?? FREEZE_MAX_TURNS) };
  }
  if (effect.kind === "taunt") effect = { ...effect, turns: Math.min(TAUNT_MAX_TURNS, effect.turns ?? TAUNT_MAX_TURNS) };

  if (effect.kind === "poison") {
    if (!effect.source || effect.turns !== 2 || !Number.isFinite(effect.value) || effect.value <= 0) return false;
    const stacks = effects.filter(e => e.kind === 'poison');
    const same = stacks.find(e => e.source?.side === effect.source!.side && e.source?.fighter === effect.source!.fighter);
    if (same) { same.value = Math.max(same.value, effect.value); same.turns = 2; return true; }
    if (stacks.length >= 2) return false;
    effects.push({...effect, source:{...effect.source}}); return true;
  }
  const existing = findEffect(effects, effect.kind);
  if (!existing) {
    effects.push({ ...effect });
    return true;
  }
  existing.value = Math.max(existing.value, effect.value);
  existing.turns = existing.turns === null || effect.turns === null ? null : Math.max(existing.turns, effect.turns);
  return true;
}

export function removeEffects(effects: Effect[], kinds: readonly EffectKind[]): EffectKind[] {
  const removed: EffectKind[] = [];
  for (let i = effects.length - 1; i >= 0; i--) {
    if (kinds.includes(effects[i]!.kind)) removed.push(...effects.splice(i, 1).map((e) => e.kind));
  }
  return removed;
}

/**
 * Cuối lượt của phe bị ảnh hưởng: trừ thời hạn, bỏ hiệu ứng hết hạn.
 * Đóng băng tan thì cho miễn nhiễm 1 lượt. Trả về các loại vừa hết hạn.
 */
export function tickDurations(effects: Effect[]): EffectKind[] {
  const expired: EffectKind[] = [];
  for (let i = effects.length - 1; i >= 0; i--) {
    const e = effects[i]!;
    if (e.turns === null) continue;
    e.turns--;
    if (e.turns <= 0) {
      effects.splice(i, 1);
      expired.push(e.kind);
    }
  }
  if (expired.includes("freeze")) effects.push({ kind: "freezeImmune", value: 0, turns: FREEZE_IMMUNE_TURNS });
  return expired;
}

/** Hệ số ATK hoặc DEF từ hiệu ứng: 1 + tăng − giảm, không âm. */
export function statModifier(effects: readonly Effect[], up: EffectKind, down: EffectKind): number {
  return Math.max(0, 1 + (findEffect(effects, up)?.value ?? 0) - (findEffect(effects, down)?.value ?? 0));
}
