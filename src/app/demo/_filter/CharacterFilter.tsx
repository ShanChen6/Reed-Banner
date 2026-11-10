"use client";

import { ELEMENTS, PROFESSIONS, type Element, type GameProfession } from "@/core";
import { ElementIcon, ProfessionIcon } from "@/app/game/art/icons";
import { ELEMENT_NAME, PROFESSION_NAME } from "@/app/game/battle/labels";

export interface CharacterFilterValue {
  readonly profession: GameProfession | null;
  readonly element: Element | null;
}

export const NO_CHARACTER_FILTER: CharacterFilterValue = { profession: null, element: null };

/** Khớp nhân vật với bộ lọc: bỏ trống một ô nghĩa là không lọc theo ô đó. */
export function matchesCharacterFilter(c: { readonly profession: GameProfession; readonly element: Element }, f: CharacterFilterValue): boolean {
  return (f.profession === null || c.profession === f.profession) && (f.element === null || c.element === f.element);
}

const chip = "inline-flex items-center gap-1 rounded-lg border border-stone-600 px-2.5 py-1.5 text-sm aria-pressed:border-amber-300 aria-pressed:bg-amber-900/50";

/** Hai hàng nút lọc nghề và hệ dùng chung cho các trang xem thử nhân vật. Bấm lại nút đang chọn để bỏ lọc. */
export default function CharacterFilter({
  value, onChange, shown, total,
}: {
  value: CharacterFilterValue;
  onChange: (next: CharacterFilterValue) => void;
  shown: number;
  total: number;
}) {
  const active = value.profession !== null || value.element !== null;
  return (
    <div className="space-y-2 rounded-xl border border-amber-900/70 bg-black/20 p-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Lọc theo nghề">
        <span className="w-12 text-xs text-stone-400">Nghề</span>
        <button type="button" aria-pressed={value.profession === null} className={chip} onClick={() => onChange({ ...value, profession: null })}>Tất cả</button>
        {PROFESSIONS.map((p) => (
          <button key={p} type="button" aria-pressed={value.profession === p} className={chip}
            onClick={() => onChange({ ...value, profession: value.profession === p ? null : p })}>
            <ProfessionIcon profession={p} className="size-4" /> {PROFESSION_NAME[p]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Lọc theo hệ">
        <span className="w-12 text-xs text-stone-400">Hệ</span>
        <button type="button" aria-pressed={value.element === null} className={chip} onClick={() => onChange({ ...value, element: null })}>Tất cả</button>
        {ELEMENTS.map((e) => (
          <button key={e} type="button" aria-pressed={value.element === e} className={chip}
            onClick={() => onChange({ ...value, element: value.element === e ? null : e })}>
            <ElementIcon element={e} className="size-4" /> {ELEMENT_NAME[e]}
          </button>
        ))}
      </div>
      <p className="text-xs text-stone-400" role="status">
        Đang hiện {shown}/{total} nhân vật
        {active && (
          <button type="button" className="ml-2 text-amber-300 underline" onClick={() => onChange(NO_CHARACTER_FILTER)}>Bỏ lọc</button>
        )}
      </p>
    </div>
  );
}
