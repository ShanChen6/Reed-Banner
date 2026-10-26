// 7 nguyên tố và hệ số sát thương trong trận, xem docs/01-gameplay/nguyen-to.md.

export const ELEMENTS = ["kim", "moc", "thuy", "hoa", "tho", "loi", "phong"] as const;
export type Element = (typeof ELEMENTS)[number];

const COUNTERS: Record<Element, readonly Element[]> = {
  kim: ["moc"],
  moc: ["tho", "phong"],
  thuy: ["hoa"],
  hoa: ["kim"],
  tho: ["thuy", "loi"],
  loi: ["thuy"],
  phong: ["tho"],
};

const GENERATES: Record<Element, Element | undefined> = {
  kim: "thuy",
  moc: "hoa",
  thuy: "moc",
  hoa: "tho",
  tho: "kim",
  loi: undefined,
  phong: "hoa",
};

export type ElementRelation = "counter" | "generate" | "neutral" | "countered";

/** Quan hệ của người tung đòn với mục tiêu. */
export function elementRelation(attacker: Element, target: Element): ElementRelation {
  if (COUNTERS[attacker].includes(target)) return "counter";
  if (COUNTERS[target].includes(attacker)) return "countered";
  if (GENERATES[attacker] === target) return "generate";
  return "neutral";
}

export const ELEMENT_DAMAGE: Record<ElementRelation, number> = {
  counter: 1.25,
  generate: 1.1,
  neutral: 1,
  countered: 0.75,
};

export function elementMultiplier(attacker: Element, target: Element): number {
  return ELEMENT_DAMAGE[elementRelation(attacker, target)];
}
