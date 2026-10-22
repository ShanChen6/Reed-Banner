import type { SkillDef } from '@/core';
import { skillText } from './labels';

/** Native details works with keyboard and touch; title alone is unavailable on mobile. */
export default function SkillDetails({skills}:{skills:readonly SkillDef[]}) {
  return <details className="w-full rounded border border-current/15 p-2 text-xs">
    <summary className="cursor-pointer font-semibold">Chi tiết kỹ năng</summary>
    <ul className="mt-2 space-y-2">{skills.map(skill=><li key={skill.id}>{skillText(skill)}</li>)}</ul>
  </details>;
}
