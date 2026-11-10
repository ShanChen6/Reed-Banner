"use client";

import { useState } from "react";
import type { Element, GameProfession } from "@/core";
import { Portrait } from "@/app/game/art/portraits";
import { ELEMENT_NAME, PROFESSION_NAME } from "@/app/game/battle/labels";
import CharacterFilter, { matchesCharacterFilter, NO_CHARACTER_FILTER, type CharacterFilterValue } from "../_filter/CharacterFilter";

export interface GalleryCharacter {
  readonly id: string;
  readonly name: string;
  readonly element: Element;
  readonly profession: GameProfession;
}

/** Lưới chân dung mọi nhân vật trong roster, lọc được theo nghề và hệ để rà từng nhóm. */
export default function CharacterGallery({ characters }: { characters: readonly GalleryCharacter[] }) {
  const [filter, setFilter] = useState<CharacterFilterValue>(NO_CHARACTER_FILTER);
  const shown = characters.filter((c) => matchesCharacterFilter(c, filter));
  return (
    <div className="space-y-3">
      <CharacterFilter value={filter} onChange={setFilter} shown={shown.length} total={characters.length} />
      <div className="flex flex-wrap gap-4 text-sm">
        {shown.map((f) => (
          <figure key={f.id} className="flex flex-col items-center gap-1">
            <div className="flex items-end gap-2">
              <Portrait id={f.id} element={f.element} profession={f.profession} className="size-20" />
              <Portrait id={f.id} element={f.element} profession={f.profession} className="size-8" />
            </div>
            <figcaption className="text-center text-xs">
              {f.name}
              <br />
              <span className="opacity-60">{PROFESSION_NAME[f.profession]} · {ELEMENT_NAME[f.element]}</span>
            </figcaption>
          </figure>
        ))}
        {shown.length === 0 && <p className="text-stone-400">Không có nhân vật nào khớp bộ lọc.</p>}
      </div>
    </div>
  );
}
