import { COMBO_PASSIVES, CHASE_PASSIVES, chasePassives, type FighterConfig, type ComboPassiveId, type SkillDef } from '@/core';
import { skillText } from './labels';

/** The prepared opportunity is profession passive1; three automatic reactions complete the loadout. */
export default function SkillDetails({skills,passive,fighter}:{skills:readonly SkillDef[];passive?:ComboPassiveId;fighter?:Pick<FighterConfig,'profession'|'element'|'chasePassives'>}) {
  const reactions=fighter?chasePassives(fighter):[];
  return <details className="w-full rounded border border-current/15 p-2 text-xs">
    <summary className="cursor-pointer font-semibold">Bộ 6 chủ động · 4 bị động</summary>
    {passive && <p className="mt-2 text-amber-200" aria-label="Bị động nghề 1">Nghề 1 · {COMBO_PASSIVES[passive].name}: {COMBO_PASSIVES[passive].description}</p>}
    <ul className="mt-2 space-y-2 text-amber-200">{reactions.map((id,i)=><li key={id}>{i===0?'Nghề 2':`Hệ ${i}`} · {CHASE_PASSIVES[id].name}: {CHASE_PASSIVES[id].description}</li>)}</ul>
    <p className="mt-2 opacity-70">Cơ hội nghề 1 không tự tung chiêu, không cộng dồn; hết hạn sau hai lượt thường kế tiếp, lượt thêm không rút thời hạn. Xua tan xóa cơ hội.</p>
    <p className="mt-2 opacity-70">Truy kích tự nối trong cùng hành động, không tốn lượt hay năng lượng. Mỗi bị động tối đa một lần; toàn chuỗi tối đa 12 phản ứng, sâu 4. Câm lặng/Đóng băng chặn phản ứng.</p>
    <ul className="mt-2 space-y-2">{skills.map(skill=><li key={skill.id}>{skillText(skill)}</li>)}</ul>
  </details>;
}
