"use client";

// Hàng lọc tướng dùng chung: ô tìm tên, chip hệ, chip nghề. HeroGrid (Đấu người, Viễn Chinh) và danh sách tướng kèm
// Tháp Thí Luyện cùng dùng để bộ lọc giống nhau ở mọi màn.

import { useState, type ReactNode } from "react";
import { ELEMENTS, PROFESSIONS, type Element, type Profession } from "@/core";
import { FilterBar } from "@/components/game-ui";
import { ChoiceChip, Input } from "@/components/ui";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";

export interface HeroFilter {
  readonly query: string;
  readonly element: Element | "all";
  readonly profession: Profession | "all";
}

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();

/** Lọc theo tên (không dấu), hệ và nghề. `anyBuild` (Đinh Bộ Lĩnh đổi được bộ) khớp mọi hệ, nghề. */
export function filterHeroes<T extends { readonly name: string; readonly element?: Element; readonly profession?: Profession; readonly anyBuild?: boolean }>(
  items: readonly T[],
  query: string,
  element: Element | "all",
  profession: Profession | "all",
): T[] {
  const q = fold(query.trim());
  return items.filter((h) =>
    (!q || fold(h.name).includes(q)) &&
    (h.anyBuild || element === "all" || h.element === element) &&
    (h.anyBuild || profession === "all" || h.profession === profession));
}

/** Trạng thái bộ lọc (tên, hệ, nghề). */
export function useHeroFilter() {
  const [filter, setFilter] = useState<HeroFilter>({ query: "", element: "all", profession: "all" });
  const update = (patch: Partial<HeroFilter>) => setFilter((f) => ({ ...f, ...patch }));
  return [filter, update] as const;
}

export function HeroFilterBar({
  filter,
  onChange,
  extra,
  search = true,
}: {
  filter: HeroFilter;
  onChange: (patch: Partial<HeroFilter>) => void;
  /** Bộ lọc riêng của màn, nằm giữa ô tìm và hàng lọc hệ. */
  extra?: ReactNode;
  /** false: bỏ ô tìm tên (màn đã đặt ô tìm riêng, hàng chip nằm trong hộp Lọc). */
  search?: boolean;
}) {
  const { query, element, profession } = filter;
  return (
    <FilterBar label="Bộ lọc tướng">
      {search && (
        <Input
          type="search"
          aria-label="Tìm tướng theo tên"
          placeholder="Tìm tên tướng…"
          value={query}
          onChange={(e) => onChange({ query: e.currentTarget.value })}
          className="min-h-11 sm:max-w-xs"
        />
      )}
      {extra}
      <div className="flex flex-col gap-1.5 lg:flex-row lg:flex-wrap lg:items-center lg:gap-4">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo hệ">
          <ChoiceChip selected={element === "all"} onClick={() => onChange({ element: "all" })}>Mọi hệ</ChoiceChip>
          {ELEMENTS.map((e) => (
            <ChoiceChip key={e} selected={element === e} className="min-w-11 px-2" aria-label={`Hệ ${ELEMENT_NAME[e]}`} title={`Hệ ${ELEMENT_NAME[e]}`}
              onClick={() => onChange({ element: e })}>
              <ElementIcon element={e} className="size-5" />
            </ChoiceChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo nghề">
          <ChoiceChip selected={profession === "all"} onClick={() => onChange({ profession: "all" })}>Mọi nghề</ChoiceChip>
          {PROFESSIONS.map((p) => (
            <ChoiceChip key={p} selected={profession === p} className="min-w-11 px-2" aria-label={`Nghề ${PROFESSION_NAME[p]}`} title={`Nghề ${PROFESSION_NAME[p]}`}
              onClick={() => onChange({ profession: p })}>
              <ProfessionIcon profession={p} className="size-5" />
            </ChoiceChip>
          ))}
        </div>
      </div>
    </FilterBar>
  );
}
