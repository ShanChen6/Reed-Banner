"use client";

// Vùng trái của tab Tướng quân: tìm, lọc, sắp xếp và lưới thẻ có vùng cuộn riêng. Trạng thái tìm/lọc/sắp xếp nằm ở
// Barracks để giữ nguyên khi đổi tab hay mở chi tiết trên điện thoại; ở đây chỉ hiển thị và báo thay đổi.

import { useId, useRef, useState, type KeyboardEvent, type Ref } from "react";
import { ELEMENTS, PROFESSIONS, type Element, type Profession } from "@/core";
import { ElementIcon, ELEMENT_COLOR, ProfessionIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { bustUrl, portraitUrl } from "../art/portrait-data";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import {
  isFiltered,
  NO_FILTER,
  SORT_NAME,
  type RosterEntry,
  type RosterFilter,
  type RosterSort,
  type TeamFilter,
} from "./roster";
import { FilterGlyph, SearchGlyph, SortGlyph, TeamGlyph, XGlyph } from "./glyphs";

const TEAM_FILTER_NAME: Readonly<Record<Exclude<TeamFilter, "all">, string>> = {
  in: "Trong đội hình",
  out: "Ngoài đội hình",
};

/** Số tướng hiện mỗi đợt ở danh sách Tướng quân. */
const HERO_BATCH = 24;

const toggle = <T,>(list: readonly T[], v: T): T[] => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export default function HeroList({
  entries,
  shown,
  filter,
  onFilter,
  sort,
  onSort,
  selectedKey,
  onSelect,
  scrollRef,
}: {
  /** Mọi tướng quân đã có. */
  entries: readonly RosterEntry[];
  /** Kết quả sau lọc và sắp xếp. */
  shown: readonly RosterEntry[];
  filter: RosterFilter;
  onFilter: (f: RosterFilter) => void;
  sort: RosterSort;
  onSort: (s: RosterSort) => void;
  selectedKey: string | null;
  onSelect: (e: RosterEntry) => void;
  scrollRef?: Ref<HTMLDivElement>;
}) {
  const [panel, setPanel] = useState(false);
  // Có thể có hàng chục tướng: hiện dần từng đợt để trang không dài hàng nghìn px trên điện thoại.
  const [limit, setLimit] = useState(HERO_BATCH);
  const panelId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const active = filter.elements.length + filter.professions.length + (filter.team === "all" ? 0 : 1);
  const selected = entries.find((e) => e.key === selectedKey) ?? null;
  const hiddenSelected = selected !== null && !shown.some((e) => e.key === selected.key);
  const focusKey = shown.some((e) => e.key === selectedKey) ? selectedKey : (shown[0]?.key ?? null);
  // Tướng đang chọn luôn nằm trong phần đã hiện.
  const selectedAt = shown.findIndex((e) => e.key === selectedKey);
  const visible = shown.slice(0, Math.max(limit, selectedAt + 1));

  // Lưới dùng roving tabindex: Tab vào một thẻ, mũi tên đi trong lưới, Home/End về đầu/cuối.
  const onGridKey = (ev: KeyboardEvent<HTMLUListElement>) => {
    const buttons = [...(listRef.current?.querySelectorAll<HTMLButtonElement>("button[data-key]") ?? [])];
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    const cols = Math.max(
      1,
      getComputedStyle(listRef.current!).gridTemplateColumns.split(" ").filter(Boolean).length,
    );
    const step: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols };
    let next = at;
    if (ev.key in step) next = Math.min(buttons.length - 1, Math.max(0, at + step[ev.key]!));
    else if (ev.key === "Home") next = 0;
    else if (ev.key === "End") next = buttons.length - 1;
    else return;
    ev.preventDefault();
    buttons[next]?.focus();
  };

  const chip = (label: string, onRemove: () => void, icon?: React.ReactNode) => (
    <li key={label}>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Bỏ lọc ${label}`}
        className="barracks-chip flex min-h-8 pointer-coarse:min-h-11 items-center gap-1.5 rounded-full px-3 text-sm"
      >
        {icon}
        {label}
        <XGlyph className="size-3.5 opacity-80" />
      </button>
    </li>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="barracks-title flex items-center gap-2 font-serif text-xl font-bold">
          <TeamGlyph className="size-5 text-[var(--frame-gold-hi)]" />
          Tướng quân
        </h2>
        <span className="font-serif text-lg font-semibold text-[var(--frame-gold-hi)] tabular-nums" aria-label={`Có ${entries.length} tướng quân`}>
          {entries.length}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <label className="barracks-field relative flex min-h-10 pointer-coarse:min-h-11 min-w-0 basis-full items-center">
          <SearchGlyph className="pointer-events-none absolute left-3 size-4 text-[var(--on-wood-soft)]" />
          <input
            type="search"
            value={filter.query}
            onChange={(e) => onFilter({ ...filter, query: e.target.value })}
            placeholder="Tìm theo tên…"
            aria-label="Tìm tướng quân theo tên, gõ có dấu hoặc không dấu"
            className="size-full min-h-10 pointer-coarse:min-h-11 rounded-md bg-transparent pr-2 pl-9 text-[15px] text-on-wood outline-none placeholder:text-on-wood-soft"
          />
        </label>
        <div className="flex min-w-0 basis-full gap-2">
          <button
            type="button"
            aria-expanded={panel}
            aria-controls={panelId}
            onClick={() => setPanel(!panel)}
            className={`barracks-btn flex min-h-10 pointer-coarse:min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-md px-3 text-[15px] whitespace-nowrap ${panel ? "is-on" : ""}`}
          >
            <FilterGlyph className="size-4" />
            Bộ lọc
            {active > 0 && (
              <span className="rounded-full bg-[var(--frame-gold-hi)] px-1.5 text-caption font-bold text-primary-foreground tabular-nums">{active}</span>
            )}
          </button>
          <label className="barracks-field relative flex min-h-10 pointer-coarse:min-h-11 min-w-0 flex-1 items-center">
            <SortGlyph className="pointer-events-none absolute left-2.5 size-4 text-[var(--on-wood-soft)]" />
            <select
              value={sort}
              onChange={(e) => onSort(e.target.value as RosterSort)}
              aria-label="Sắp xếp tướng quân"
              className="size-full min-h-10 pointer-coarse:min-h-11 cursor-pointer appearance-none rounded-md bg-transparent pr-6 pl-8 text-[15px] text-on-wood outline-none"
            >
              {(Object.keys(SORT_NAME) as RosterSort[]).map((s) => (
                <option key={s} value={s} className="bg-wood-inset">
                  {SORT_NAME[s]}
                </option>
              ))}
            </select>
            <span aria-hidden className="pointer-events-none absolute right-2.5 text-caption text-[var(--on-wood-soft)]">▾</span>
          </label>
        </div>
      </div>

      {panel && (
        <div id={panelId} role="group" aria-label="Bộ lọc tướng quân" className="barracks-inset mt-2 flex flex-col gap-2 rounded-md p-2.5 text-sm">
          <FilterRow label="Hệ">
            {ELEMENTS.map((el) => (
              <IconToggle
                key={el}
                on={filter.elements.includes(el)}
                label={ELEMENT_NAME[el]}
                onClick={() => onFilter({ ...filter, elements: toggle(filter.elements, el) })}
              >
                <ElementIcon element={el} className="size-5" />
              </IconToggle>
            ))}
          </FilterRow>
          <FilterRow label="Nghề">
            {PROFESSIONS.map((p) => (
              <IconToggle
                key={p}
                on={filter.professions.includes(p)}
                label={PROFESSION_NAME[p]}
                onClick={() => onFilter({ ...filter, professions: toggle(filter.professions, p) })}
              >
                <ProfessionIcon profession={p} className="size-5" />
              </IconToggle>
            ))}
          </FilterRow>
          <FilterRow label="Đội">
            {(["all", "in", "out"] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={filter.team === t}
                onClick={() => onFilter({ ...filter, team: t })}
                className={`barracks-btn min-h-9 pointer-coarse:min-h-11 rounded-md px-3 ${filter.team === t ? "is-on" : ""}`}
              >
                {t === "all" ? "Tất cả" : TEAM_FILTER_NAME[t]}
              </button>
            ))}
          </FilterRow>
        </div>
      )}

      {isFiltered(filter) && (
        <ul className="mt-2 flex flex-wrap items-center gap-1.5" aria-label="Bộ lọc đang áp dụng">
          {filter.query.trim() !== "" && chip(`“${filter.query.trim()}”`, () => onFilter({ ...filter, query: "" }))}
          {filter.elements.map((el: Element) =>
            chip(
              ELEMENT_NAME[el],
              () => onFilter({ ...filter, elements: filter.elements.filter((x) => x !== el) }),
              <ElementIcon element={el} className="size-4" />,
            ),
          )}
          {filter.professions.map((p: Profession) =>
            chip(
              PROFESSION_NAME[p],
              () => onFilter({ ...filter, professions: filter.professions.filter((x) => x !== p) }),
              <ProfessionIcon profession={p} className="size-4" />,
            ),
          )}
          {filter.team !== "all" && chip(TEAM_FILTER_NAME[filter.team], () => onFilter({ ...filter, team: "all" }))}
          <li>
            <button type="button" onClick={() => onFilter(NO_FILTER)} className="min-h-8 pointer-coarse:min-h-11 rounded px-2 text-sm text-[var(--frame-gold-hi)] underline-offset-2 hover:underline">
              Xóa tất cả
            </button>
          </li>
        </ul>
      )}

      <p className="mt-2 px-1 text-sm text-[var(--on-wood-soft)]" aria-live="polite">
        <span className="font-semibold text-on-wood tabular-nums">{shown.length}</span> / {entries.length} tướng quân
      </p>

      {hiddenSelected && (
        <p role="status" className="barracks-inset mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md px-3 py-2 text-sm">
          <span className="min-w-0 flex-1">
            Đang xem <b className="text-title-on-wood">{selected.name}</b>, không khớp bộ lọc nên không có trong danh sách.
          </span>
          <button type="button" onClick={() => onFilter(NO_FILTER)} className="text-[var(--frame-gold-hi)] underline-offset-2 hover:underline">
            Bỏ lọc
          </button>
        </p>
      )}

      <div ref={scrollRef} className="barracks-scroll mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1" tabIndex={-1}>
        {shown.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-[15px] text-[var(--on-wood-soft)]">
            <p>{entries.length === 0 ? "Chưa có tướng quân nào." : "Không tìm thấy tướng quân phù hợp."}</p>
            {isFiltered(filter) && (
              <button type="button" onClick={() => onFilter(NO_FILTER)} className="barracks-btn min-h-10 pointer-coarse:min-h-11 rounded-md px-4">
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <ul
            ref={listRef}
            aria-label="Danh sách tướng quân"
            onKeyDown={onGridKey}
            className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2 pb-1"
          >
            {visible.map((e) => (
              <li key={e.key}>
                <HeroCard entry={e} selected={e.key === selectedKey} tabbable={e.key === focusKey} onClick={() => onSelect(e)} />
              </li>
            ))}
          </ul>
        )}
        {shown.length > visible.length && (
          <div className="flex justify-center py-3">
            <button type="button" onClick={() => setLimit(visible.length + HERO_BATCH)} className="barracks-btn min-h-11 rounded-md px-5">
              Hiện thêm tướng ({shown.length - visible.length} còn lại)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-11 shrink-0 pt-2 text-[var(--on-wood-soft)]">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function IconToggle({ on, label, onClick, children }: { on: boolean; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`barracks-btn flex size-9 items-center justify-center rounded-md ${on ? "is-on" : ""}`}
    >
      {children}
    </button>
  );
}

export function HeroCard({
  entry,
  selected,
  tabbable,
  onClick,
}: {
  entry: RosterEntry;
  selected: boolean;
  tabbable: boolean;
  onClick: () => void;
}) {
  const photo = portraitUrl(entry.id);
  const bust = bustUrl(entry.id);
  const status = entry.team === 0 ? "Chủ tướng" : entry.team !== null ? "Đang trong đội hình" : null;
  return (
    <button
      type="button"
      data-key={entry.key}
      aria-pressed={selected}
      tabIndex={tabbable ? 0 : -1}
      onClick={onClick}
      aria-label={`${entry.name}, cấp ${entry.level}, ${ELEMENT_NAME[entry.element]}, ${PROFESSION_NAME[entry.profession]}${status ? `, ${status}` : ""}`}
      className={`hero-card group flex w-full flex-col overflow-hidden rounded-md text-left ${selected ? "is-selected" : ""}`}
    >
      <span
        className="relative block aspect-square w-full overflow-hidden"
        style={{ background: bust ? "var(--wood-inset)" : `radial-gradient(circle at 50% 35%, ${ELEMENT_COLOR[entry.element]}99, var(--tone-22150f) 75%)` }}
      >
        {bust ? (
          // eslint-disable-next-line @next/next/no-img-element -- chân dung bán thân tĩnh 384px, nền tranh có sẵn.
          <img src={bust} alt="" loading="lazy" draggable={false} className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.03]" />
        ) : photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh chân dung tĩnh 192px.
          <img src={photo} alt="" loading="lazy" draggable={false} className="size-full object-cover object-top transition-transform duration-200 group-hover:scale-[1.03]" />
        ) : (
          <Portrait id={entry.id} element={entry.element} profession={entry.profession} className="size-full p-2" />
        )}
        <span className="absolute top-1 left-1 rounded-full bg-black/55 p-0.5">
          <ElementIcon element={entry.element} className="size-4" />
        </span>
        {status && (
          <span className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-[var(--frame-gold-hi)]" title={status}>
            <TeamGlyph className="size-3.5" />
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent pt-4 pb-0.5 text-center text-[13px] font-semibold text-title-on-wood tabular-nums">
          Cấp {entry.level}
        </span>
      </span>
      <span className="flex min-h-[2.6rem] items-center justify-center px-1 py-1 text-center text-sm leading-tight font-semibold text-on-wood">
        <span className="line-clamp-2 break-words">{entry.name}</span>
      </span>
    </button>
  );
}
