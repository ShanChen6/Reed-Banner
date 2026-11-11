"use client";

// Chọn hai người đi cùng trước trận Bình Loạn. Bể nhân vật sẽ lớn nên có tìm tên (bỏ dấu), lọc hệ/nghề, lọc "khắc
// thủ lĩnh địch", và chỉ hiện hai hàng đầu khi chưa lọc. Người đang chọn luôn đứng đầu để không bị lọc mất.
// Không dùng cuộn lồng (Shan không muốn cuộn trong thẻ): danh sách dài thì cắt trang như mẫu /demo/ui.

import { useState } from "react";
import { companionById, ELEMENTS, type Element, type Profession } from "@/core";
import { choiceVariants } from "@/components/ui";
import { PageControls, usePagedItems } from "@/components/ui/Pagination";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import { fold } from "../profile/roster";

/** Số thẻ mỗi trang (khoảng hai hàng ở màn rộng). */
const PAGE = 12;

export default function CompanionPicker({
  owned,
  team,
  max = 2,
  marks = [],
  onToggle,
  labelId,
}: {
  owned: readonly string[];
  team: readonly string[];
  max?: number;
  /** Hệ khắc thủ lĩnh đối phương: đánh dấu ★ và có nút lọc riêng. */
  marks?: readonly Element[];
  onToggle: (id: string) => void;
  labelId: string;
}) {
  const [query, setQuery] = useState("");
  const [element, setElement] = useState<Element | "counter" | null>(null);
  const [profession, setProfession] = useState<Profession | "">("");

  const people = owned.flatMap((id) => {
    const c = companionById(id);
    return c ? [c] : [];
  });
  const professions = [...new Set(people.map((c) => c.profession))];
  const q = fold(query);
  const match = people.filter(
    (c) =>
      (q === "" || fold(c.name).includes(q)) &&
      (element === null ||
        (element === "counter" ? marks.includes(c.element) : c.element === element)) &&
      (profession === "" || c.profession === profession),
  );
  const filtered = q !== "" || element !== null || profession !== "";
  // Người đang chọn lên đầu (kể cả khi bộ lọc loại họ), rồi tới hệ khắc địch, rồi theo thứ tự có sẵn.
  const chosen = team.flatMap((id) => {
    const c = companionById(id);
    return c ? [c] : [];
  });
  const rest = match
    .filter((c) => !team.includes(c.id))
    .sort((a, b) => Number(marks.includes(b.element)) - Number(marks.includes(a.element)));
  const list = [...chosen, ...rest];
  const paged = usePagedItems(list, PAGE);
  const shown = paged.pageItems;
  // Đổi bộ lọc thì về trang đầu.
  const filter = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    paged.setPage(0);
  };
  const pickElement = filter(setElement);

  const chip = (className = "") =>
    choiceVariants({ size: "sm", className: `min-h-9 gap-1 px-2 text-caption font-normal ${className}` });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Lọc người đi cùng">
        <input
          type="search"
          value={query}
          onChange={(e) => filter(setQuery)(e.target.value)}
          placeholder="Tìm tên…"
          aria-label="Tìm người đi cùng theo tên"
          className="min-h-9 w-36 rounded-control border border-frame-line bg-wood-inset px-2 text-caption text-on-wood placeholder:text-on-wood-soft pointer-coarse:min-h-11"
        />
        <button type="button" aria-pressed={element === null} onClick={() => pickElement(null)} className={chip()}>
          Mọi hệ
        </button>
        {marks.length > 0 && (
          <button
            type="button"
            aria-pressed={element === "counter"}
            onClick={() => pickElement(element === "counter" ? null : "counter")}
            className={chip()}
          >
            <span className={element === "counter" ? "" : "text-jade"}>★</span> Khắc địch
          </button>
        )}
        {ELEMENTS.map((e) => (
          <button
            key={e}
            type="button"
            aria-pressed={element === e}
            aria-label={`Hệ ${ELEMENT_NAME[e]}`}
            title={ELEMENT_NAME[e]}
            onClick={() => pickElement(element === e ? null : e)}
            className={chip("px-1.5")}
          >
            <ElementIcon element={e} className="size-4" />
          </button>
        ))}
        <select
          value={profession}
          onChange={(e) => filter(setProfession)(e.target.value as Profession | "")}
          aria-label="Lọc theo nghề"
          className="min-h-9 rounded-control border border-frame-line bg-wood-inset px-2 text-caption text-on-wood pointer-coarse:min-h-11"
        >
          <option value="">Mọi nghề</option>
          {professions.map((p) => (
            <option key={p} value={p}>
              {PROFESSION_NAME[p]}
            </option>
          ))}
        </select>
      </div>

      <ul className="grid grid-cols-[repeat(auto-fill,minmax(12.5rem,1fr))] gap-1.5" role="group" aria-labelledby={labelId}>
        {shown.map((c) => {
          const on = team.includes(c.id);
          return (
            <li key={c.id}>
              <button
                type="button"
                aria-pressed={on}
                disabled={!on && team.length >= max}
                onClick={() => onToggle(c.id)}
                className={choiceVariants({
                  size: "sm",
                  className: "w-full justify-start gap-2 px-2 py-1 text-left font-normal",
                })}
              >
                <Portrait id={c.id} element={c.element} profession={c.profession} className="size-9 shrink-0" />
                <span className="min-w-0 leading-tight">
                  <span className="block truncate font-semibold">
                    {c.name}
                    {marks.includes(c.element) && <span className={on ? "" : "text-jade"}> ★</span>}
                  </span>
                  <span className="flex items-center gap-1 text-caption opacity-80">
                    <ElementIcon element={c.element} className="size-3.5" />
                    {ELEMENT_NAME[c.element]} ·
                    <ProfessionIcon profession={c.profession} className="size-3.5" />
                    {PROFESSION_NAME[c.profession]}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {list.length === chosen.length && filtered && (
        <p className="text-caption text-on-wood-soft">Không có ai khớp bộ lọc.</p>
      )}
      <PageControls paged={paged} label="Trang người đi cùng" />
    </div>
  );
}
