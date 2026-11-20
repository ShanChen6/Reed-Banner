"use client";

// Lưới tướng có tìm tên, lọc theo hệ và nghề, cắt trang: dùng cho lượt cấm và lượt chọn ở Đấu người 3vs3, và chia hai
// đạo quân ở Viễn Chinh.

import { useMemo, type CSSProperties, type ReactNode } from "react";
import type { Element, Profession } from "@/core";
import { ChoiceChip } from "@/components/ui";
import { PageControls, usePagedItems } from "@/components/ui/Pagination";
import { cn } from "@/lib/cn";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import { HeroFilterBar, filterHeroes, useHeroFilter } from "./HeroFilterBar";

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
  const matches = extraFilter?.matches;
  const [filter, updateFilter] = useHeroFilter();
  const { element, profession } = filter;
  const shown = useMemo(
    () => filterHeroes(items, filter.query, element, profession).filter((h) => !matches || matches(h.id)),
    [items, filter.query, element, profession, matches],
  );
  const paged = usePagedItems(shown, pageSize);
  // Đổi bộ lọc thì về trang đầu.
  const setFilter = (patch: Parameters<typeof updateFilter>[0]) => { updateFilter(patch); paged.setPage(0); };
  return (
    <div className="flex flex-col gap-2" role="group" aria-label={label}>
      <HeroFilterBar filter={filter} onChange={setFilter} extra={extraFilter?.node} />
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
