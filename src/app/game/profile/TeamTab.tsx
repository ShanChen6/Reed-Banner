"use client";

// Tab Đội hình: đội 3vs3 mang vào Giao Tranh, Quần Hùng, Bình Loạn… gồm chủ tướng Đinh Bộ Lĩnh và đúng 2 nhân vật
// kèm (luật chooseTeam của @/core). Chọn một vị trí rồi bấm tướng sĩ để đưa vào; tướng đang ở vị trí kia thì hai
// người đổi chỗ. Mua thêm tướng ở Cửa hàng.

import { useState } from "react";
import { MAIN_ID, type Profile, type ProfileAction } from "@/core";
import { ElementIcon, ELEMENT_COLOR, ProfessionIcon } from "../art/icons";
import { ProfileArt } from "../art/ProfileArt";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import { SceneLink } from "../SceneContext";
import { HeroCard } from "./HeroList";
import { SearchGlyph, ShopGlyph, TeamGlyph } from "./glyphs";
import { fold, rosterEntry, sortRoster, type RosterEntry } from "./roster";

export default function TeamTab({
  profile,
  roster,
  busy,
  onAction,
  onView,
}: {
  profile: Profile;
  roster: readonly RosterEntry[];
  busy: boolean;
  onAction: (a: ProfileAction) => Promise<string | null>;
  /** Mở tướng sĩ ở tab Tướng sĩ. */
  onView: (id: string) => void;
}) {
  const [slot, setSlot] = useState<0 | 1>(0);
  const [query, setQuery] = useState("");
  const members = [MAIN_ID, ...profile.team].map((id) => rosterEntry(profile, id));
  const q = fold(query);
  const bench = sortRoster(
    roster.filter((e) => e.id !== MAIN_ID && (!q || fold(e.name).includes(q))),
    "team",
  );

  const place = (id: string) => {
    const team = [...profile.team];
    const other = 1 - slot;
    if (team[slot] === id) return;
    if (team[other] === id) team[other] = team[slot]!;
    team[slot] = id;
    void onAction({ type: "chooseTeam", companions: team });
  };

  return (
    <div className="flex flex-col gap-3">
      <section aria-labelledby="team-title" className="barracks-panel rounded-lg p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="team-title" className="barracks-title flex items-center gap-2 font-serif text-xl font-bold">
            <TeamGlyph className="size-5 text-[var(--frame-gold-hi)]" /> Đội hình 3vs3
          </h2>
          <p className="text-sm text-[var(--on-wood-soft)]">Chủ tướng luôn ra trận; chọn 2 nhân vật kèm.</p>
        </div>
        <ol className="mt-3 grid gap-3 sm:grid-cols-3">
          {members.map((m, i) => {
            const pickable = i > 0;
            const on = pickable && slot === i - 1;
            return (
              <li key={m.id} className={`team-card relative flex flex-col overflow-hidden rounded-lg ${on ? "is-selected" : ""}`}>
                <div className="relative flex h-44 items-end justify-center overflow-hidden" style={{ background: `radial-gradient(circle at 50% 70%, ${ELEMENT_COLOR[m.element]}88, var(--tone-1b110c) 72%)` }}>
                  <ProfileArt id={m.id} element={m.element} profession={m.profession} className="h-full max-w-full object-contain object-bottom" fallbackClassName="mb-3 size-32" />
                  <span className="absolute top-2 left-2 rounded bg-black/65 px-2 py-0.5 text-sm font-semibold text-title-on-wood">{i === 0 ? "Chủ tướng" : `Vị trí ${i + 1}`}</span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-serif text-lg font-bold text-title-on-wood">{m.name}</span>
                    <span className="text-sm text-on-wood tabular-nums">Cấp {m.level}</span>
                  </div>
                  <p className="flex items-center gap-3 text-sm text-[var(--on-wood-soft)]">
                    <span className="flex items-center gap-1">
                      <ElementIcon element={m.element} className="size-4" /> {ELEMENT_NAME[m.element]}
                    </span>
                    <span className="flex items-center gap-1">
                      <ProfessionIcon profession={m.profession} className="size-4" /> {PROFESSION_NAME[m.profession]}
                    </span>
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    {pickable && (
                      <button type="button" aria-pressed={on} onClick={() => setSlot((i - 1) as 0 | 1)} className={`barracks-btn min-h-10 pointer-coarse:min-h-11 flex-1 rounded-md px-3 ${on ? "is-on" : ""}`}>
                        {on ? "Đang chọn vị trí này" : "Đổi người"}
                      </button>
                    )}
                    <button type="button" onClick={() => onView(m.id)} className="barracks-btn min-h-10 pointer-coarse:min-h-11 flex-1 rounded-md px-3">
                      Xem tướng
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="bench-title" className="barracks-panel rounded-lg p-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id="bench-title" className="barracks-title min-w-0 flex-1 font-serif text-lg font-bold">
            Chọn người cho vị trí {slot + 2}
          </h3>
          <label className="barracks-field relative flex min-h-10 pointer-coarse:min-h-11 min-w-0 flex-[0_1_16rem] items-center rounded-md">
            <SearchGlyph className="pointer-events-none absolute left-3 size-4 text-[var(--on-wood-soft)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên…"
              aria-label="Tìm nhân vật kèm theo tên"
              className="size-full min-h-10 pointer-coarse:min-h-11 bg-transparent pr-2 pl-9 text-[15px] text-on-wood outline-none placeholder:text-on-wood-soft"
            />
          </label>
          <SceneLink scene="SHOP" className="barracks-btn flex min-h-10 pointer-coarse:min-h-11 items-center gap-1.5 rounded-md px-3">
            <ShopGlyph className="size-4" /> Tuyển thêm ở Cửa hàng
          </SceneLink>
        </div>
        {bench.length === 0 ? (
          <p className="py-6 text-center text-[15px] text-[var(--on-wood-soft)]">Không tìm thấy nhân vật kèm phù hợp.</p>
        ) : (
          <ul aria-label="Nhân vật kèm đã có" className="barracks-scroll mt-3 grid max-h-[28rem] grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2 overflow-y-auto pr-1">
            {bench.map((e) => (
              <li key={e.key} className={busy ? "pointer-events-none opacity-60" : ""}>
                <HeroCard entry={e} selected={profile.team[slot] === e.id} tabbable onClick={() => place(e.id)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
