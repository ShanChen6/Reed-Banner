"use client";

// Chọn nghề và hệ cho Đinh Bộ Lĩnh ở Đấu người (1vs1 và lượt chọn 3vs3): chip có biểu tượng thay cho hai ô thả xuống,
// kèm chân dung xem trước. Mục bị cấm (3vs3) hiện mờ, không bấm được.

import { ELEMENTS, MAIN_ID, PROFESSIONS, type Element, type Profession } from "@/core";
import { ChoiceChip } from "@/components/ui";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";

export default function LeaderBuildPicker({
  element,
  profession,
  onChange,
  bannedElements = [],
  bannedProfessions = [],
  disabled = false,
  note,
}: {
  element: Element;
  profession: Profession;
  onChange: (next: { element: Element; profession: Profession }) => void;
  bannedElements?: readonly Element[];
  bannedProfessions?: readonly Profession[];
  disabled?: boolean;
  note?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex shrink-0 items-center gap-3 sm:w-40 sm:flex-col sm:text-center">
        <Portrait id={MAIN_ID} element={element} profession={profession} className="size-16 shrink-0 sm:size-20" />
        <div className="min-w-0 text-sm">
          <p className="font-bold text-title-on-wood">Đinh Bộ Lĩnh</p>
          <p className="text-on-wood-soft">
            {PROFESSION_NAME[profession]}, {ELEMENT_NAME[element]}
          </p>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Nghề của Đinh Bộ Lĩnh">
          <span className="w-10 shrink-0 text-caption text-on-wood-soft">Nghề</span>
          {PROFESSIONS.map((p) => {
            const banned = bannedProfessions.includes(p);
            return (
              <ChoiceChip key={p} selected={profession === p} disabled={disabled || banned} className="gap-1"
                title={banned ? "Nghề này đã bị cấm" : undefined}
                onClick={() => onChange({ element, profession: p })}>
                <ProfessionIcon profession={p} className="size-4" />
                <span className={banned ? "line-through" : undefined}>{PROFESSION_NAME[p]}</span>
              </ChoiceChip>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Hệ của Đinh Bộ Lĩnh">
          <span className="w-10 shrink-0 text-caption text-on-wood-soft">Hệ</span>
          {ELEMENTS.map((e) => {
            const banned = bannedElements.includes(e);
            return (
              <ChoiceChip key={e} selected={element === e} disabled={disabled || banned} className="gap-1"
                title={banned ? "Hệ này đã bị cấm" : undefined}
                onClick={() => onChange({ element: e, profession })}>
                <ElementIcon element={e} className="size-4" />
                <span className={banned ? "line-through" : undefined}>{ELEMENT_NAME[e]}</span>
              </ChoiceChip>
            );
          })}
        </div>
        {note && <p className="text-caption text-on-wood-soft">{note}</p>}
      </div>
    </div>
  );
}
