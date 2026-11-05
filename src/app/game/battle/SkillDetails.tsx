import { COMBO_PASSIVES, CHASE_PASSIVES, chasePassives, type FighterConfig, type ComboPassiveId, type SkillDef } from '@/core';
import { PassiveIcon } from '../art/passives';
import { skillText } from './labels';
import { fusionPassiveLines } from './special-labels';

/** The prepared opportunity is profession passive1; three automatic reactions complete the loadout. Fusion characters list four fixed passives. */
export default function SkillDetails({skills,passive,fighter}:{skills:readonly SkillDef[];passive?:ComboPassiveId;fighter?:Pick<FighterConfig,'profession'|'element'|'chasePassives'|'special'|'comboPassive'>}) {
  const reactions=fighter?chasePassives(fighter):[];
  const fusion=fighter?fusionPassiveLines(fighter):[];
  if(fusion.length)return <details className="w-full rounded border border-current/15 p-2 text-xs">
    <summary className="cursor-pointer font-semibold">Bộ 6 chủ động · 4 nội tại dung hợp</summary>
    <ul className="mt-2 space-y-2 text-frame-gold">{fusion.map(line=><li key={line.label}>{line.label} · {line.name}: {line.description}</li>)}</ul>
    <p className="mt-2 opacity-70">Nhân vật dung hợp không nhận nội tại nghề mặc định; chỉ bốn nội tại này. Truy kích tự nối trong cùng hành động, không tốn lượt hay năng lượng; mỗi nội tại tối đa một lần mỗi hành động, toàn chuỗi tối đa 12 phản ứng, sâu 4. Đóng băng/Câm lặng chặn phản ứng; riêng nội tại cuối lượt vẫn chạy khi còn sống.</p>
    <ul className="mt-2 space-y-2">{skills.map(skill=><li key={skill.id}>{skillText(skill)}</li>)}</ul>
  </details>;
  return <details className="w-full rounded border border-current/15 p-2 text-xs">
    <summary className="cursor-pointer font-semibold">Bộ 6 chủ động · 4 bị động</summary>
    {passive && <p className="mt-2 flex items-start gap-2 text-frame-gold" aria-label="Bị động nghề 1"><PassiveIcon id={passive} name={COMBO_PASSIVES[passive].name} className="size-7" /><span>Nghề 1 · {COMBO_PASSIVES[passive].name}: {COMBO_PASSIVES[passive].description}</span></p>}
    <ul className="mt-2 space-y-2 text-frame-gold">{reactions.map((id,i)=><li key={id} className="flex items-start gap-2"><PassiveIcon id={id} name={CHASE_PASSIVES[id].name} className="size-7" /><span>{i===0?'Nghề 2':`Hệ ${i}`} · {CHASE_PASSIVES[id].name}: {CHASE_PASSIVES[id].description}</span></li>)}</ul>
    <p className="mt-2 opacity-70">Cơ hội nghề 1 không tự tung chiêu, không cộng dồn; hết hạn sau hai lượt thường kế tiếp, lượt thêm không rút thời hạn. Xua tan xóa cơ hội.</p>
    <p className="mt-2 opacity-70">Truy kích tự nối trong cùng hành động, không tốn lượt hay năng lượng. Mỗi bị động tối đa một lần; toàn chuỗi tối đa 12 phản ứng, sâu 4. Câm lặng/Đóng băng chặn phản ứng.</p>
    <ul className="mt-2 space-y-2">{skills.map(skill=><li key={skill.id}>{skillText(skill)}</li>)}</ul>
  </details>;
}
