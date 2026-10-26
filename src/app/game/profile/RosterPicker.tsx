"use client";

import { Input, Select } from "@/components/ui";

import { useState } from "react";
import {
  companionById,
  ELEMENTS,
  MAIN_ID,
  PROFESSIONS,
  progressOf,
  type Element,
  type Profession,
  type Profile,
} from "@/core";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";

type Sort = "team" | "level" | "name";

const SORT_NAME: Readonly<Record<Sort, string>> = {
  team: "Đội hình trước",
  level: "Cấp cao trước",
  name: "Theo tên",
};

/** Lưới đủ cao cho 2 hàng; mở rộng thì hiện hết. */
const COLLAPSED = "max-h-[10.5rem] overflow-y-auto";

/** Bỏ dấu để tìm "dinh" ra "Đinh". */
const fold = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();

interface Entry {
  readonly id: string;
  readonly name: string;
  readonly element: Element;
  readonly profession: Profession;
  readonly level: number;
  readonly team: number;
}

/**
 * Chọn nhân vật ở hồ sơ khi đã có nhiều người: lưới chân dung kèm cấp, tìm theo tên, lọc theo hệ và nghề,
 * sắp xếp. Nhân vật chính và đội đang ra trận đứng đầu theo mặc định.
 */
export default function RosterPicker({
  profile,
  ids,
  selected,
  onSelect,
}: {
  profile: Profile;
  ids: readonly string[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [element, setElement] = useState<Element | null>(null);
  const [profession, setProfession] = useState<Profession | null>(null);
  const [sort, setSort] = useState<Sort>("team");
  const [expanded, setExpanded] = useState(false);

  const entries: Entry[] = ids.map((id) => {
    const base = id === MAIN_ID ? null : companionById(id)!;
    const team = id === MAIN_ID ? 0 : profile.team.indexOf(id);
    return {
      id,
      name: base?.name ?? "Đinh Bộ Lĩnh",
      element: base?.element ?? profile.element,
      profession: base?.profession ?? profile.profession,
      level: progressOf(profile, id).level,
      team: team < 0 ? Infinity : team,
    };
  });
  const q = fold(query.trim());
  const shown = entries
    .filter(
      (e) =>
        (!q || fold(e.name).includes(q)) &&
        (!element || e.element === element) &&
        (!profession || e.profession === profession),
    )
    .sort((a, b) => {
      const byName = a.name.localeCompare(b.name, "vi");
      if (sort === "name") return byName;
      if (sort === "level") return b.level - a.level || byName;
      return a.team - b.team || b.level - a.level || byName;
    });
  const filtered = q !== "" || element !== null || profession !== null;
  const chip = (on: boolean) =>
    `flex size-7 shrink-0 items-center justify-center rounded-md border ${
      on ? "border-amber-300 bg-amber-500/30" : "border-white/10 bg-black/30 hover:bg-black/50"
    }`;

  return (
    <div className="mb-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm nhân vật…"
          aria-label="Tìm nhân vật theo tên"
          className="min-w-0 flex-1 basis-32 text-xs"
        />
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          aria-label="Sắp xếp nhân vật"
          className="text-xs"
        >
          {(Object.keys(SORT_NAME) as Sort[]).map((s) => (
            <option key={s} value={s}>
              {SORT_NAME[s]}
            </option>
          ))}
        </Select>
        <span className="text-[11px] text-muted">
          {shown.length}/{entries.length}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1" aria-label="Lọc theo hệ và nghề">
        {ELEMENTS.map((el) => (
          <button
            key={el}
            type="button"
            aria-pressed={element === el}
            title={ELEMENT_NAME[el]}
            onClick={() => setElement(element === el ? null : el)}
            className={chip(element === el)}
          >
            <ElementIcon element={el} className="size-4.5" />
            <span className="sr-only">{ELEMENT_NAME[el]}</span>
          </button>
        ))}
        <span className="mx-0.5 h-5 w-px bg-white/15" aria-hidden />
        {PROFESSIONS.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={profession === p}
            title={PROFESSION_NAME[p]}
            onClick={() => setProfession(profession === p ? null : p)}
            className={chip(profession === p)}
          >
            <ProfessionIcon profession={p} className="size-4.5" />
            <span className="sr-only">{PROFESSION_NAME[p]}</span>
          </button>
        ))}
        {filtered && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setElement(null);
              setProfession(null);
            }}
            className="ml-1 rounded px-1.5 py-0.5 text-[11px] text-amber-200 hover:bg-black/40"
          >
            Bỏ lọc
          </button>
        )}
      </div>
      <ul
        role="listbox"
        aria-label="Chọn nhân vật"
        className={`grid grid-cols-[repeat(auto-fill,minmax(4.25rem,1fr))] gap-1 rounded-lg bg-black/20 p-1 ${expanded ? "" : COLLAPSED}`}
      >
        {shown.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              role="option"
              aria-selected={selected === e.id}
              onClick={() => onSelect(e.id)}
              title={`${e.name} · Cấp ${e.level}${e.team !== Infinity ? " · Đang ra trận" : ""}`}
              className={`relative flex w-full flex-col items-center gap-0.5 rounded-md px-0.5 py-1 text-center ${
                selected === e.id
                  ? "bg-amber-500/25 ring-2 ring-amber-400"
                  : "hover:bg-white/5"
              }`}
            >
              <Portrait
                id={e.id}
                element={e.element}
                profession={e.profession}
                level={e.level}
                className="size-11"
              />
              <span className="w-full truncate text-[10px] leading-tight text-stone-200">{e.name}</span>
              {e.team !== Infinity && (
                <span className="absolute top-0.5 right-1 text-[10px] text-amber-300" aria-hidden>
                  ⚑
                </span>
              )}
            </button>
          </li>
        ))}
        {shown.length === 0 && (
          <li className="col-span-full py-3 text-center text-xs text-muted">Không có nhân vật nào khớp.</li>
        )}
      </ul>
      {entries.length > 10 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="self-center rounded px-2 py-0.5 text-[11px] text-amber-200 hover:bg-black/40"
        >
          {expanded ? "Thu gọn" : "Xem tất cả"}
        </button>
      )}
    </div>
  );
}
