// Liên kết phối hợp trong một đội (trang Hợp Kích, Shan 19/11/2026): kỹ năng chủ động của tướng A phát tín hiệu
// (skillComboOpeners của @/core), bị động của tướng B bắt tín hiệu đó (COMBO_PASSIVES, CHASE_PASSIVES). Bị động chỉ nhận
// từ đồng đội thì A khác B; chỉ nhận từ bản thân thì A là B; còn lại ai trong phe cũng mở được. Đây là ước lượng tĩnh từ
// danh mục (cần tác dụng thực trong trận mới phát tín hiệu), không mô phỏng trận.

import {
  CHASE_PASSIVES,
  COMBO_PASSIVES,
  characterSkills,
  PROFESSION_COMBO,
  skillComboOpeners,
  type ComboSignalKind,
  type FighterConfig,
  type SkillDef,
} from "@/core";
import { fighterPassives, passiveSource, type PassiveRef } from "../battle/SkillDetails";
import { isFusion } from "../battle/special-labels";

export interface ComboMember {
  readonly id: string;
  readonly name: string;
  readonly fighter: FighterConfig;
  readonly skills: readonly SkillDef[];
  readonly passives: readonly { readonly passive: PassiveRef }[];
}

export interface ComboLink {
  /** Chỉ số người phát tín hiệu và người phản ứng trong đội. */
  readonly from: number;
  readonly to: number;
  readonly skill: SkillDef;
  readonly passive: PassiveRef;
  readonly signals: readonly ComboSignalKind[];
}

export function comboMember(id: string, fighter: FighterConfig): ComboMember {
  return {
    id,
    name: fighter.name,
    fighter,
    skills: characterSkills(fighter.profession, fighter.element, id),
    passives: fighterPassives(fighter, fighter.comboPassive ?? (isFusion(fighter) ? undefined : PROFESSION_COMBO[fighter.profession])),
  };
}

const triggersOf = (p: PassiveRef): readonly ComboSignalKind[] => (p.kind === "combo" ? COMBO_PASSIVES[p.id].triggers : CHASE_PASSIVES[p.id].triggers);

/** Mọi liên kết kỹ năng → bị động trong đội, kể cả tự phối (một người tự mở bị động của mình). */
export function comboLinks(team: readonly ComboMember[]): ComboLink[] {
  const out: ComboLink[] = [];
  team.forEach((a, from) => {
    for (const skill of a.skills) {
      const emits = skillComboOpeners(skill);
      if (emits.length === 0) continue;
      team.forEach((b, to) => {
        for (const { passive } of b.passives) {
          const who = passiveSource(passive);
          if ((who === "ally" && from === to) || (who === "self" && from !== to)) continue;
          const signals = triggersOf(passive).filter((k) => emits.includes(k));
          if (signals.length > 0) out.push({ from, to, skill, passive, signals });
        }
      });
    }
  });
  return out;
}

/** Số liên kết chéo (giữa hai người khác nhau) mà `candidate` thêm vào đội hiện có. */
export function crossLinksWith(team: readonly ComboMember[], candidate: ComboMember): number {
  const n = team.length;
  return comboLinks([...team, candidate]).filter((l) => l.from !== l.to && (l.from === n || l.to === n)).length;
}

/** Một bước của chuỗi phản ứng: tướng `fighter` (chỉ số trong đội) dùng bị động `passive`, bắt tín hiệu `signal`. */
export interface ChainStep {
  readonly fighter: number;
  readonly passive: PassiveRef;
  readonly signal: ComboSignalKind;
}

/** Chuỗi: kỹ năng của tướng `from` mở bước đầu, mỗi bước sau bắt tín hiệu do bước trước phát ra. */
export interface ComboChain {
  readonly from: number;
  readonly skill: SkillDef;
  readonly steps: readonly ChainStep[];
}

/** Giới hạn của bộ máy (CHASE_LIMITS): sâu tối đa 4 bước phản ứng. */
const MAX_DEPTH = 4;

/** Tín hiệu một phản ứng phát tiếp trong cùng hành động (battle.ts): truy kích gây mất máu, giảm Thủ là phá giáp, Câm lặng là khống chế. */
const CHAIN_EMITS: Readonly<Record<string, readonly ComboSignalKind[]>> = {
  damage: ["skillDamage"],
  armor: ["armorBroken"],
  silence: ["controlled"],
};

/**
 * Mọi chuỗi phản ứng trong đội theo luật bộ máy (combo-engine.ts): bị động `activeOnly` chỉ nhận tín hiệu của chính kỹ năng
 * (độ sâu 0); bị động Cơ hội chỉ mở từ kỹ năng và không phát tiếp; chỉ-đồng-đội thì người phản ứng khác người phát tín hiệu;
 * chỉ-bản-thân thì là chính người đó; mỗi bị động chạy một lần mỗi hành động. Bỏ bị động cần đòn của địch (phản kích, vỡ
 * Khiên) và bị động cuối lượt vì không mở từ kỹ năng của phe mình. Trả mọi đường đi có từ hai bước phản ứng.
 */
export function comboChains(team: readonly ComboMember[]): ComboChain[] {
  const out: ComboChain[] = [];
  // `armor`: mức giảm Thủ mạnh nhất mục tiêu đang chịu trong chuỗi. Bộ máy bỏ qua truy kích giảm Thủ không mạnh hơn
  // mức đang có (existingArmor), nên hai Kim phá trong cùng đội chỉ cái đầu tiên (theo vị trí trong đội) có tác dụng.
  const walk = (from: number, skill: SkillDef, source: number, kinds: readonly ComboSignalKind[], depth: number, path: readonly ChainStep[], used: ReadonlySet<string>, armor: number) => {
    team.forEach((m, j) => {
      for (const { passive } of m.passives) {
        const key = `${j}:${passive.kind}:${passive.id}`;
        if (used.has(key)) continue;
        let emits: readonly ComboSignalKind[] = [];
        let signal: ComboSignalKind | undefined;
        if (passive.kind === "combo") {
          if (depth > 0 || j === source) continue;
          signal = COMBO_PASSIVES[passive.id].triggers.find((k) => kinds.includes(k));
        } else {
          const d = CHASE_PASSIVES[passive.id] as (typeof CHASE_PASSIVES)[keyof typeof CHASE_PASSIVES] & {
            activeOnly?: boolean; alliesOnly?: boolean; selfSource?: boolean; receiverOnly?: boolean; provenance?: boolean; attackerRecipient?: boolean; turnEnd?: unknown;
          };
          if (d.provenance || d.attackerRecipient || d.receiverOnly || d.turnEnd) continue;
          if (d.activeOnly && depth > 0) continue;
          if (d.alliesOnly && j === source) continue;
          if (d.selfSource && j !== source) continue;
          if (d.effect === "armor" && d.value <= armor) continue;
          signal = d.triggers.find((k) => kinds.includes(k));
          emits = CHAIN_EMITS[d.effect] ?? [];
        }
        if (!signal) continue;
        const next = [...path, { fighter: j, passive, signal }];
        if (next.length >= 2) out.push({ from, skill, steps: next });
        const nextArmor = passive.kind === "chase" && CHASE_PASSIVES[passive.id].effect === "armor" ? Math.max(armor, CHASE_PASSIVES[passive.id].value) : armor;
        if (emits.length > 0 && depth + 1 < MAX_DEPTH) walk(from, skill, j, emits, depth + 1, next, new Set([...used, key]), nextArmor);
      }
    });
  };
  team.forEach((m, from) => {
    for (const skill of m.skills) {
      const kinds = skillComboOpeners(skill);
      if (kinds.length) walk(from, skill, from, kinds, 0, [], new Set(), skillArmor(skill));
    }
  });
  // Chuỗi dài trước; cùng độ dài thì chuỗi qua nhiều tướng khác nhau hơn đứng trước.
  const people = (c: ComboChain) => new Set([c.from, ...c.steps.map((s) => s.fighter)]).size;
  return out.sort((a, b) => b.steps.length - a.steps.length || people(b) - people(a));
}

/** Mỗi kỹ năng một chuỗi dài nhất (đã xếp sẵn), để trang hiện gọn: chuỗi dài trước, nhiều tướng tham gia trước. */
export function bestChains(team: readonly ComboMember[], limit = 8): ComboChain[] {
  const seen = new Set<string>();
  const out: ComboChain[] = [];
  for (const c of comboChains(team)) {
    const key = `${c.from}:${c.skill.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
    if (out.length >= limit) break;
  }
  return out;
}

/** Các chiêu của một tướng cùng mở một dây phản ứng. */
export interface ChainOpener {
  readonly from: number;
  readonly skills: readonly SkillDef[];
}

/** Các chuỗi cùng dây bị động (chỉ khác chiêu mở) gộp làm một nhóm; chiêu mở xếp theo người. */
export interface ChainGroup {
  readonly steps: readonly ChainStep[];
  readonly openers: readonly ChainOpener[];
}

/**
 * Gộp chuỗi trùng dây phản ứng: nhiều chiêu (của một hay nhiều người) cùng mở một dây bị động thì chỉ hiện một dây, kèm
 * danh sách chiêu mở theo người. Giữ thứ tự của `chains` (nhóm và người mở đứng ở vị trí xuất hiện đầu tiên).
 */
export function groupChains(chains: readonly ComboChain[]): ChainGroup[] {
  const groups = new Map<string, { steps: readonly ChainStep[]; openers: { from: number; skills: SkillDef[] }[] }>();
  for (const c of chains) {
    const key = c.steps.map((s) => `${s.fighter}:${s.passive.kind}:${s.passive.id}:${s.signal}`).join(">");
    let g = groups.get(key);
    if (!g) groups.set(key, (g = { steps: c.steps, openers: [] }));
    let o = g.openers.find((x) => x.from === c.from);
    if (!o) g.openers.push((o = { from: c.from, skills: [] }));
    if (!o.skills.some((s) => s.id === c.skill.id)) o.skills.push(c.skill);
  }
  return [...groups.values()];
}

/** Mức giảm Thủ chiêu tự đặt lên địch; truy kích giảm Thủ yếu hơn mức này bị bỏ qua. */
function skillArmor(skill: SkillDef): number {
  return Math.max(0, ...skill.steps.map((st) => (st.type === "effect" && st.effect === "defDown" && st.to !== "self" && st.to !== "team" ? st.value : 0)));
}
