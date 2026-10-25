import { SKILL_LEVEL_BONUS, SKILL_MAX_LEVEL_DISCOUNT, SKILL_SLOT_UNLOCK, skillComboPartners, type SkillDef } from "@/core";
import { SkillIcon } from "../art/skills";
import { SKILL_TARGET_NAME, skillLevelTable, skillSourceName, skillStepTexts } from "./labels";

/** Thẻ chi tiết một kỹ năng: nguồn, ô, cấp mở, mục tiêu, từng bước tác dụng và bảng số liệu cấp 1–5. */
export default function SkillInfo({ def }: { def: SkillDef }) {
  const table = skillLevelTable(def);
  const partners = skillComboPartners(def);
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-start gap-3">
        <SkillIcon def={def} className="size-12 shrink-0" />
        <div>
          <p className="font-serif text-lg font-bold leading-tight text-stone-100">{def.name}</p>
          <p className="text-xs text-stone-400">
            {skillSourceName(def)} · ô {def.slot ?? "—"} · mở ở cấp {SKILL_SLOT_UNLOCK[def.slot ?? 0] ?? 1}
          </p>
          <p className="mt-1 text-xs text-stone-300">
            <span className="text-[var(--gold)]">{def.cost} năng lượng</span> · Mục tiêu: {SKILL_TARGET_NAME[def.target]}
          </p>
        </div>
      </div>

      <ul className="list-disc space-y-1 pl-5 text-stone-200">
        {skillStepTexts(def).map((t, i) => <li key={i}>{t}</li>)}
      </ul>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <caption className="mb-1 text-left text-[0.65rem] uppercase tracking-wider text-stone-500">Theo cấp kỹ năng</caption>
          <thead>
            <tr className="text-stone-500">
              <th className="py-1 pr-2 text-left font-normal">Cấp</th>
              {table[0]!.values.map((_, i) => <th key={i} className="px-1 font-normal">{i + 1}</th>)}
            </tr>
          </thead>
          <tbody>
            {table.map((row, r) => (
              <tr key={r} className="border-t border-stone-800">
                <th scope="row" className="py-1 pr-2 text-left font-normal text-stone-400">{row.label}</th>
                {row.values.map((v, i) => <td key={i} className="px-1 text-center tabular-nums text-stone-200">{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1 text-[0.65rem] text-stone-500">Mỗi cấp +{Math.round(SKILL_LEVEL_BONUS * 100)}% hệ số chính; cấp tối đa giảm {Math.round(SKILL_MAX_LEVEL_DISCOUNT * 100)}% năng lượng. Thời lượng, số ô và xác suất giữ nguyên.</p>
      </div>

      {partners.length > 0 && <p className="text-xs text-stone-400">Mở phối hợp cho đồng đội: {partners.join(", ")}.</p>}
    </div>
  );
}
