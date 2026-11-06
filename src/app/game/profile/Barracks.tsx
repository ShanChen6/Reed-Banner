"use client";

// Doanh Trại (phân cảnh PROFILE, đường dẫn /game/profile giữ nguyên): Tướng sĩ (danh sách + chi tiết + trang bị),
// Đội hình, Kho đồ; Cửa hàng là lối vào riêng sang phân cảnh SHOP. Chỉ hiển thị và gửi thao tác hồ sơ qua
// `onAction`; luật nằm ở @/core, server kiểm tra lại. Trạng thái tìm/lọc/sắp xếp/cuộn sống ở đây nên đổi tab
// hay mở chi tiết trên điện thoại rồi quay lại vẫn giữ nguyên.

import { MODE_CONTENT_WIDTH } from "@/components/game-ui";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MAIN_ID, type GearSlot, type Profile, type ProfileAction } from "@/core";
import { SceneLink } from "../SceneContext";
import Armory from "./Armory";
import GearPicker from "./GearPicker";
import { CoinGlyph, ShopGlyph } from "./glyphs";
import HeroDetail from "./HeroDetail";
import HeroList from "./HeroList";
import { NO_FILTER, rosterOf, visibleRoster, type RosterEntry, type RosterFilter, type RosterSort } from "./roster";
import TeamTab from "./TeamTab";

type Tab = "heroes" | "team" | "armory";
const TABS: readonly { id: Tab; name: string }[] = [
  { id: "heroes", name: "Tướng sĩ" },
  { id: "team", name: "Đội hình" },
  { id: "armory", name: "Kho đồ" },
];

const MOBILE = "(max-width: 1023.98px)";

export default function Barracks({
  profile,
  busy,
  message,
  onAction,
  playerName,
  roster: rosterOverride,
}: {
  profile: Profile;
  busy: boolean;
  message: string | null;
  onAction: (a: ProfileAction) => Promise<string | null>;
  /** null: khách. undefined: không hiện dòng người chơi (trang xem thử). */
  playerName?: string | null;
  /** Chỉ trang xem thử: danh sách dựng sẵn (nhân bản để thử 100 tướng). Màn thật dựng từ hồ sơ. */
  roster?: readonly RosterEntry[];
}) {
  const [tab, setTab] = useState<Tab>("heroes");
  const [filter, setFilter] = useState<RosterFilter>(NO_FILTER);
  const [sort, setSort] = useState<RosterSort>("team");
  const roster = useMemo(() => rosterOverride ?? rosterOf(profile), [rosterOverride, profile]);
  const [selectedKey, setSelectedKey] = useState<string | null>(roster[0]?.key ?? null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [openSlot, setOpenSlot] = useState<GearSlot | null>(null);
  const listScroll = useRef<HTMLDivElement>(null);
  const savedY = useRef(0);
  const detailTop = useRef<HTMLDivElement>(null);

  const shown = useMemo(() => visibleRoster(roster, filter, sort), [roster, filter, sort]);
  // Nhân vật đang xem giữ nguyên dù bộ lọc ẩn họ; chỉ khi không còn trong hồ sơ mới lùi về mục đầu.
  const selected = roster.find((e) => e.key === selectedKey) ?? roster[0] ?? null;

  const restore = useRef(false);
  useEffect(() => {
    if (!mobileDetail) return;
    detailTop.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [mobileDetail]);
  // Quay lại danh sách trên điện thoại: khôi phục chỗ cuộn ngay sau khi danh sách hiện lại, rồi đặt tiêu điểm vào thẻ.
  useLayoutEffect(() => {
    if (mobileDetail || !restore.current) return;
    restore.current = false;
    window.scrollTo({ top: savedY.current, behavior: "instant" });
    listScroll.current?.querySelector<HTMLButtonElement>(`button[data-key="${CSS.escape(selectedKey ?? "")}"]`)?.focus({ preventScroll: true });
  }, [mobileDetail, selectedKey]);

  const select = (e: RosterEntry) => {
    setSelectedKey(e.key);
    setOpenSlot(null);
    if (window.matchMedia(MOBILE).matches) {
      savedY.current = window.scrollY;
      setMobileDetail(true);
    }
  };
  const back = () => {
    restore.current = true;
    setMobileDetail(false);
  };
  const view = (id: string) => {
    const e = roster.find((x) => x.id === id);
    if (e) setSelectedKey(e.key);
    setTab("heroes");
    setMobileDetail(window.matchMedia(MOBILE).matches);
  };

  return (
    <main className="barracks ui-mode-screen">
      <div className={`mx-auto flex w-full flex-col gap-3 ${MODE_CONTENT_WIDTH}`}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="grid min-w-0 flex-[1_1_22rem] grid-cols-3 gap-1.5 sm:max-w-[34rem]" role="tablist" aria-label="Mục Doanh Trại">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`barracks-tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls="barracks-panel"
                onClick={() => setTab(t.id)}
                className={`barracks-tab min-h-11 rounded-md px-2 font-serif text-base font-bold sm:text-[17px] ${tab === t.id ? "is-on" : ""}`}
              >
                {t.name}
              </button>
            ))}
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {playerName === null && (
              <SceneLink scene="LOGIN" params={{ returnTo: "/game/profile" }} className="barracks-btn flex min-h-10 items-center rounded-md px-3 text-sm">
                Đăng nhập để giữ Doanh Trại
              </SceneLink>
            )}
            <SceneLink scene="SHOP" className="barracks-btn flex min-h-11 items-center gap-2 rounded-md px-3 font-serif text-[15px] font-semibold">
              <ShopGlyph className="size-5" /> Cửa hàng
            </SceneLink>
            <span className="barracks-pill is-gold min-h-11 px-3 text-base" aria-label={`Vàng: ${profile.gold}`}>
              <CoinGlyph className="size-5" />
              <span className="font-semibold tabular-nums">{profile.gold.toLocaleString("vi-VN")}</span>
            </span>
          </div>
        </div>

        {message && (
          <p role="alert" className="rounded-md border border-rose-400/40 bg-rose-950/60 px-3 py-2 text-[15px] text-rose-100">
            {message}
          </p>
        )}

        <div id="barracks-panel" role="tabpanel" aria-labelledby={`barracks-tab-${tab}`}>
          {tab === "heroes" && (
            <div className="grid gap-3 lg:h-[max(34rem,calc(100dvh-10.5rem))] lg:grid-cols-[minmax(0,38fr)_minmax(0,62fr)]">
              <section aria-label="Danh sách tướng sĩ" className={`barracks-panel min-h-0 flex-col rounded-lg p-3 lg:flex ${mobileDetail ? "hidden" : "flex"}`}>
                <HeroList
                  entries={roster}
                  shown={shown}
                  filter={filter}
                  onFilter={setFilter}
                  sort={sort}
                  onSort={setSort}
                  selectedKey={selected?.key ?? null}
                  onSelect={select}
                  scrollRef={listScroll}
                />
              </section>
              <section
                ref={detailTop}
                aria-label="Chi tiết tướng sĩ"
                className={`barracks-panel barracks-scroll min-h-0 scroll-mt-20 rounded-lg p-3 sm:p-4 lg:block lg:overflow-y-auto ${mobileDetail ? "block" : "hidden"}`}
              >
                {selected ? (
                  <HeroDetail
                    profile={profile}
                    id={selected.id}
                    busy={busy}
                    onAction={onAction}
                    openSlot={openSlot}
                    onOpenSlot={setOpenSlot}
                    onBack={back}
                  />
                ) : (
                  <p className="py-16 text-center text-[var(--bk-soft)]">Chưa có tướng sĩ để xem.</p>
                )}
              </section>
            </div>
          )}

          {tab === "team" && <TeamTab profile={profile} roster={roster.filter((e) => e.key === e.id)} busy={busy} onAction={onAction} onView={view} />}

          {tab === "armory" && (
            <Armory profile={profile} busy={busy} onAction={onAction} focusCharacter={selected?.id ?? MAIN_ID} />
          )}
        </div>
      </div>

      {openSlot && selected && tab === "heroes" && (
        <GearPicker key={`${selected.id}-${openSlot}`} profile={profile} id={selected.id} slot={openSlot} busy={busy} onAction={onAction} onClose={() => setOpenSlot(null)} />
      )}
    </main>
  );
}
