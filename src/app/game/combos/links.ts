// Liên kết phối hợp trong một đội (trang Phối Hợp, Shan 19/11/2026): kỹ năng chủ động của tướng A phát tín hiệu
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
  readonly passives: readonly { readonly passive: PassiveRef; readonly label: string }[];
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
