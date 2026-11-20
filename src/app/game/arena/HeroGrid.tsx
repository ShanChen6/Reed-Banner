"use client";

// Lưới tướng có tìm tên, lọc theo hệ và nghề, cắt trang: dùng cho lượt cấm và lượt chọn ở Đấu người 3vs3, và chia hai
// đạo quân ở Viễn Chinh.

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { ELEMENTS, PROFESSIONS, type Element, type Profession } from "@/core";
import { ChoiceChip, Input } from "@/components/ui";
import { PageControls, usePagedItems } from "@/components/ui/Pagination";
import { cn } from "@/lib/cn";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";

export interface HeroGridItem {
  readonly id: string;
  readonly name: string;
  readonly element?: Element;
  readonly profession?: Profession;
  readonly level?: number;
  /** Lý do không chọn được; có thì thẻ mờ và không bấm được. */
  readonly blocked?: string | null;
  /** Tướng đổi được hệ và nghề (Đinh Bộ Lĩnh): khớp mọi bộ lọc hệ, nghề. */
  readonly anyBuild?: boolean;
}

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();

/** Lọc theo tên (không dấu), hệ và nghề. */
export function filterHeroes<T extends HeroGridItem>(items: readonly T[], query: string, element: Element | "all", profession: Profession | "all"): T[] {
  const q = fold(query.trim());
  return items.filter((h) =>
    (!q || fold(h.name).includes(q)) &&
    (h.anyBuild || element === "all" || h.element === element) &&
    (h.anyBuild || profession === "all" || h.profession === profession));
}

export default function HeroGrid({
  items,
  selected,
  onSelect,
  label,
  pageSize = 12,
  disabled = false,
  isSelected,
  badge,
  cardStyle,
  extraFilter,
  gridClassName = "sm:grid-cols-2 lg:grid-cols-3",
}: {
  items: readonly HeroGridItem[];
  selected: string | null;
  /** `filter` là hệ, nghề đang lọc lúc bấm, để tướng đổi được bộ (anyBuild) lấy theo. */
  onSelect: (id: string, filter: { readonly element: Element | "all"; readonly profession: Profession | "all" }) => void;
  label: string;
  pageSize?: number;
  disabled?: boolean;
  /** Chọn nhiều: thay cho `selected`. */
  isSelected?: (id: string) => boolean;
  /** Nhãn ở góc phải thẻ (ví dụ đạo quân đang chứa tướng). */
  badge?: (id: string) => ReactNode;
  cardStyle?: (id: string) => CSSProperties | undefined;
  /** Bộ lọc riêng của màn, nằm trên hàng lọc hệ; `matches` lọc thêm danh sách. */
  extraFilter?: { readonly node: ReactNode; readonly matches: (id: string) => boolean };
  /** Số cột theo khổ màn (mặc định 1/2/3); màn rộng như sảnh Giao Tranh truyền thêm cột. */
  gridClassName?: string;
}) {
  const [query, setQuery] = useState("");
  const [element, setElement] = useState<Element | "all">("all");
  const [profession, setProfession] = useState<Profession | "all">("all");
  const matches = extraFilter?.matches;
  const shown = useMemo(
    () => filterHeroes(items, query, element, profession).filter((h) => !matches || matches(h.id)),
    [items, query, element, profession, matches],
  );
  const paged = usePagedItems(shown, pageSize);
  const resetPage = () => paged.setPage(0);
  return (
    <div className="flex flex-col gap-2" role="group" aria-label={label}>
      <div className="flex flex-col gap-2">
        <Input
          type="search"
          aria-label="Tìm tướng theo tên"
          placeholder="Tìm tên tướng…"
          value={query}
          onChange={(e) => { setQuery(e.currentTarget.value); resetPage(); }}
          className="min-h-11 sm:max-w-xs"
        />
        {extraFilter?.node}
        <div className="flex flex-col gap-1.5 lg:flex-row lg:flex-wrap lg:items-center lg:gap-4">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo hệ">
          <ChoiceChip selected={element === "all"} onClick={() => { setElement("all"); resetPage(); }}>Mọi hệ</ChoiceChip>
          {ELEMENTS.map((e) => (
            <ChoiceChip key={e} selected={element === e} className="min-w-11 px-2" aria-label={`Hệ ${ELEMENT_NAME[e]}`} title={`Hệ ${ELEMENT_NAME[e]}`}
              onClick={() => { setElement(e); resetPage(); }}>
              <ElementIcon element={e} className="size-5" />
            </ChoiceChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo nghề">
          <ChoiceChip selected={profession === "all"} onClick={() => { setProfession("all"); resetPage(); }}>Mọi nghề</ChoiceChip>
          {PROFESSIONS.map((p) => (
            <ChoiceChip key={p} selected={profession === p} className="min-w-11 px-2" aria-label={`Nghề ${PROFESSION_NAME[p]}`} title={`Nghề ${PROFESSION_NAME[p]}`}
              onClick={() => { setProfession(p); resetPage(); }}>
              <ProfessionIcon profession={p} className="size-5" />
            </ChoiceChip>
          ))}
        </div>
        </div>
      </div>
      <p className="text-caption text-on-wood-soft" role="status">
        {shown.length === items.length ? `${items.length} tướng` : `${shown.length}/${items.length} tướng khớp bộ lọc`}
      </p>
      {shown.length === 0 ? (
        <p className="py-4 text-center text-sm text-on-wood-soft">Không có tướng khớp bộ lọc.</p>
      ) : (
        <div {...paged.listProps} className={cn("grid grid-cols-1 gap-2", gridClassName)}>
          {paged.pageItems.map((h) => (
            <ChoiceChip
              key={h.id}
              size="md"
              selected={isSelected ? isSelected(h.id) : selected === h.id}
              style={cardStyle?.(h.id)}
              disabled={disabled || !!h.blocked}
              onClick={() => onSelect(h.id, { element, profession })}
              className={cn("items-center justify-start gap-2.5 p-2 text-left", h.blocked && "opacity-60")}
            >
              <Portrait id={h.id} element={h.element ?? "moc"} profession={h.profession ?? "tuongSi"} className="size-11 shrink-0" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-baseline justify-between gap-1">
                  <strong className="truncate">{h.name}</strong>
                  {h.level !== undefined && <span className="shrink-0 text-caption font-normal opacity-80">cấp {h.level}</span>}
                </span>
                {h.element && h.profession && (
                  <span className="flex items-center gap-1 text-caption font-normal">
                    <ElementIcon element={h.element} className="size-4" />
                    <ProfessionIcon profession={h.profession} className="size-4" />
                    <span className="sr-only">{ELEMENT_NAME[h.element]}, {PROFESSION_NAME[h.profession]}</span>
                  </span>
                )}
                {h.blocked && <span className="text-caption font-normal">{h.blocked}</span>}
              </span>
              {badge?.(h.id)}
            </ChoiceChip>
          ))}
        </div>
      )}
      <PageControls paged={paged} label={`Phân trang ${label.toLowerCase()}`} />
    </div>
  );
}
