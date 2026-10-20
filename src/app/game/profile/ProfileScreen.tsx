"use client";

// Màn hồ sơ nhân vật kiểu bảng nhân vật trong game: bên trái chân dung với 9 ô trang bị xung quanh, thanh
// máu/kinh nghiệm và bảng chỉ số; bên phải túi đồ dạng lưới có lọc và trang. Mọi luật nằm trong @/core
// (applyProfileAction), server kiểm tra lại; ở đây chỉ hiển thị và gửi thao tác.

import { useEffect, useMemo, useState } from "react";
import {
  activeBonuses,
  BAG_LIMIT,
  companionById,
  equippedItems,
  getGearSet,
  itemStat,
  loadoutOf,
  MAIN_ID,
  MAX_LEVEL,
  mergeCost,
  ownsCompanion,
  ALL_COMPANIONS,
  profileTeam,
  progressOf,
  SELL_GOLD,
  SLOT_STAT,
  totalXpFor,
  ultimateOf,
  wearerOf,
  xpToNext,
  type ActiveBonus,
  type FighterConfig,
  type GearItem,
  type GearSlot,
  type GearStat,
  type NonWeaponSlot,
  type Profile,
  type ProfileAction,
} from "@/core";
import { GearIcon } from "../art/gear";
import { ElementIcon, ELEMENT_COLOR, ProfessionIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { GearShop } from "../battle/GearPanel";
import {
  ELEMENT_NAME,
  gearText,
  PROFESSION_NAME,
  SLOT_NAME,
  TIER_CLASS,
} from "../battle/labels";
import { fetchProfile, sendProfileAction } from "../battle/online";
import ProgressPanel, { PROFILE_ERROR } from "../battle/ProgressPanel";
import ShopPanel from "../battle/ShopPanel";
import { SceneLink } from "../SceneContext";

type Tab = "character" | "skills" | "shop";
const TABS: readonly { id: Tab; name: string }[] = [
  { id: "character", name: "Nhân vật" },
  { id: "skills", name: "Kỹ năng" },
  { id: "shop", name: "Đội hình & cửa hàng" },
];

type Filter = "all" | "weapon" | "armor" | "jewelry";
const FILTERS: readonly {
  id: Filter;
  name: string;
  slots: readonly GearSlot[];
}[] = [
  { id: "all", name: "Tất cả", slots: [] },
  { id: "weapon", name: "Vũ khí", slots: ["vuKhi"] },
  {
    id: "armor",
    name: "Phục sức",
    slots: ["dinhMao", "yPhuc", "hoThu", "baoNgoa"],
  },
  {
    id: "jewelry",
    name: "Trang sức",
    slots: ["gioiChi", "hangLien", "hoPhu", "ngocBoi"],
  },
];

/** Ô trang bị hai bên chân dung, vũ khí ở giữa phía dưới. */
const LEFT_SLOTS: readonly NonWeaponSlot[] = [
  "dinhMao",
  "yPhuc",
  "hoThu",
  "baoNgoa",
];
const RIGHT_SLOTS: readonly NonWeaponSlot[] = [
  "gioiChi",
  "hangLien",
  "hoPhu",
  "ngocBoi",
];

const BAG_COLS = 8;
const BAG_PAGE = BAG_COLS * 5;

const STAT_NAME: Record<GearStat, string> = {
  maxHp: "Máu",
  atk: "Công (ATK)",
  def: "Thủ (DEF)",
};

const nameOf = (id: string) =>
  id === MAIN_ID ? "Đinh Bộ Lĩnh" : (companionById(id)?.name ?? id);

/** Cấu hình vào trận của một nhân vật theo hồ sơ, có hoặc không tính trang bị. */
function fighterOf(
  profile: Profile,
  id: string,
  withGear = true,
): FighterConfig {
  const p = withGear ? profile : { ...profile, loadouts: {} };
  return id === MAIN_ID ? profileTeam(p)[0]! : profileTeam(p, [id])[1]!;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

function bonusText(b: ActiveBonus): string {
  const what =
    b.kind === "set"
      ? `Bộ ${getGearSet(b.id)?.name ?? b.id}`
      : `Cộng hưởng ${ELEMENT_NAME[b.id as keyof typeof ELEMENT_NAME]}`;
  const parts = (Object.entries(b.bonus) as [GearStat, number][]).map(
    ([s, v]) => `${STAT_NAME[s]} +${pct(v)}`,
  );
  return `${what} (${b.level} món): ${parts.join(", ")}`;
}

/** Thanh có chữ ở giữa, như thanh máu trong game. */
function Bar({
  value,
  max,
  label,
  tone,
}: {
  value: number;
  max: number;
  label: string;
  tone: "hp" | "xp" | "gold";
}) {
  const fill = {
    hp: "from-rose-500 to-red-700",
    xp: "from-sky-400 to-sky-700",
    gold: "from-amber-300 to-amber-600",
  }[tone];
  const icon = { hp: "❤", xp: "★", gold: "◉" }[tone];
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-4 text-center ${tone === "hp" ? "text-rose-400" : tone === "xp" ? "text-sky-300" : "text-amber-300"}`}
        aria-hidden
      >
        {icon}
      </span>
      <div
        className="relative h-4 flex-1 overflow-hidden rounded-full border border-black/50 bg-black/40 shadow-inner"
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemax={max}
      >
        <div
          className={`h-full bg-gradient-to-b ${fill}`}
          style={{
            width: `${Math.min(100, (value / Math.max(1, max)) * 100)}%`,
          }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-white [text-shadow:0_1px_1px_#000]">
          {label}
        </span>
      </div>
    </div>
  );
}

/** Một ô trang bị quanh chân dung. */
function SlotButton({
  slot,
  item,
  fallbackElement,
  profession,
  selected,
  onClick,
}: {
  slot: GearSlot;
  item: GearItem | undefined;
  fallbackElement: FighterConfig["element"];
  profession: FighterConfig["profession"];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={item ? gearText(item) : `${SLOT_NAME[slot]}: trống`}
      className={`group relative rounded-lg border-2 bg-black/30 p-0.5 shadow-[inset_0_1px_3px_#0008] transition ${
        selected
          ? "border-amber-300"
          : "border-[#8a6a3b] hover:border-amber-400"
      }`}
    >
      <GearIcon
        slot={slot}
        element={item?.element ?? fallbackElement}
        tier={item?.tier}
        profession={
          slot === "vuKhi" ? (item?.profession ?? profession) : undefined
        }
        className={`size-11 sm:size-12 ${item ? "" : "opacity-25 grayscale"}`}
      />
      <span className="sr-only">
        {item ? gearText(item) : `${SLOT_NAME[slot]} trống`}
      </span>
    </button>
  );
}

export default function ProfileScreen({
  playerName,
}: {
  playerName: string | null;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<Tab>("character");
  const [who, setWho] = useState<string>(MAIN_ID);
  const [selected, setSelected] = useState<string | null>(null);
  const [mergeTray, setMergeTray] = useState<string[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetchProfile().then((r) => {
      if (r.profile) setProfile(r.profile);
      else setLoadError(true);
    });
  }, []);

  const act = async (a: ProfileAction): Promise<string | null> => {
    setBusy(true);
    const r = await sendProfileAction(a);
    setBusy(false);
    if (r.profile) setProfile(r.profile);
    const error = r.error ?? null;
    setMessage(
      error
        ? (PROFILE_ERROR[error as keyof typeof PROFILE_ERROR] ?? error)
        : null,
    );
    return error;
  };

  const owned = useMemo(
    () =>
      profile
        ? [
            MAIN_ID,
            ...ALL_COMPANIONS.filter((c) => ownsCompanion(profile, c.id)).map(
              (c) => c.id,
            ),
          ]
        : [],
    [profile],
  );

  if (!profile) {
    return (
      <Frame>
        <p className="py-24 text-center text-stone-300">
          {loadError
            ? "Không tải được hồ sơ, thử tải lại trang."
            : "Đang tải hồ sơ…"}
        </p>
      </Frame>
    );
  }

  const character = owned.includes(who) ? who : MAIN_ID;
  const fighter = fighterOf(profile, character);
  const bare = fighterOf(profile, character, false);
  const progress = progressOf(profile, character);
  const loadout = loadoutOf(profile, character);
  const worn = equippedItems(loadout, fighter.profession);
  const bonuses = activeBonuses(worn);
  const slotItem = (slot: GearSlot): GearItem | undefined =>
    slot === "vuKhi"
      ? loadout.weapons[fighter.profession]
      : loadout.slots[slot as NonWeaponSlot];
  const xpMax = progress.level >= MAX_LEVEL ? 1 : xpToNext(progress.level);
  const xpNow =
    progress.level >= MAX_LEVEL ? 1 : progress.xp - totalXpFor(progress.level);
  const ultimate = character === MAIN_ID ? undefined : ultimateOf(character);

  const shelf = FILTERS.find((f) => f.id === filter)!;
  const bag = [...profile.bag]
    .filter((it) => shelf.slots.length === 0 || shelf.slots.includes(it.slot))
    .sort(
      (a, b) =>
        b.tier - a.tier ||
        a.slot.localeCompare(b.slot) ||
        a.element.localeCompare(b.element),
    );
  const pages = Math.max(1, Math.ceil(BAG_LIMIT / BAG_PAGE));
  const visible = bag.slice(page * BAG_PAGE, (page + 1) * BAG_PAGE);
  const item = selected
    ? profile.bag.find((it) => it.id === selected)
    : undefined;
  const wearer = item ? wearerOf(profile, item.id) : null;
  const trayItems = mergeTray.flatMap((id) =>
    profile.bag.filter((it) => it.id === id),
  );

  const run = (a: ProfileAction, after?: () => void) =>
    void act(a).then((error) => {
      if (!error) after?.();
    });

  const stats: readonly [string, string][] = [
    ["Máu", `${fighter.maxHp}`],
    ["Công (ATK)", `${fighter.atk}`],
    ["Thủ (DEF)", `${fighter.def}`],
    ["Nguyên tố", ELEMENT_NAME[fighter.element]],
    ["Nghề", PROFESSION_NAME[fighter.profession]],
    ["Điểm kỹ năng", `${progress.skillPoints}`],
    ["Trang bị", `${worn.length}/9`],
    ["Kỹ năng", `${fighter.skills?.length ?? 0}`],
  ];
  const gearBonus: Partial<Record<string, number>> = {
    "Máu": fighter.maxHp - bare.maxHp,
    "Công (ATK)": fighter.atk - bare.atk,
    "Thủ (DEF)": fighter.def - bare.def,
  };

  return (
    <Frame>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-stone-400">Người chơi:</span>
          <span className="font-semibold text-amber-200">
            {playerName ?? "Khách"}
          </span>
          {!playerName && (
            <SceneLink
              scene="LOGIN"
              params={{ returnTo: "/game/profile" }}
              className="rounded bg-amber-500 px-2 py-0.5 text-xs font-semibold text-stone-950"
            >
              Đăng nhập để giữ hồ sơ
            </SceneLink>
          )}
        </div>
        {message && <span className="text-sm text-rose-400">{message}</span>}
      </div>

      <div
        className="mb-3 grid grid-cols-3 gap-2"
        role="tablist"
        aria-label="Mục hồ sơ"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md border-2 px-2 py-1.5 text-sm font-bold tracking-wide shadow-[0_2px_0_#0006] ${
              tab === t.id
                ? "border-amber-200 bg-gradient-to-b from-amber-300 to-amber-600 text-stone-950"
                : "border-[#c79a4a] bg-gradient-to-b from-[#8f2f1f] to-[#5a1e14] text-amber-100 hover:from-[#a33a26]"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {tab === "skills" && (
        <ProgressPanel
          profile={profile}
          teamIds={[MAIN_ID, ...profile.team]}
          locked={busy}
          storage="lưu trên server"
          onAction={act}
        />
      )}

      {tab === "shop" && (
        <div className="flex flex-col gap-3">
          <ShopPanel profile={profile} locked={busy} onAction={act} />
          <section
            aria-label="Cửa hàng trang bị"
            className="rounded-lg bg-[var(--panel)] p-2 text-xs"
          >
            <h2 className="mb-2 font-semibold">Cửa hàng trang bị</h2>
            <GearShop profile={profile} disabled={busy} onBuy={(a) => run(a)} />
          </section>
        </div>
      )}

      {tab === "character" && (
        <div className="grid gap-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          {/* Bên trái: nhân vật */}
          <section
            aria-label="Nhân vật"
            className="rounded-xl border-2 border-[#8a6a3b] bg-[#2a1f19]/90 p-3 shadow-[inset_0_0_24px_#0009]"
          >
            <div
              className="mb-3 flex flex-wrap gap-1"
              role="tablist"
              aria-label="Chọn nhân vật"
            >
              {owned.map((id) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={character === id}
                  onClick={() => {
                    setWho(id);
                    setSelected(null);
                  }}
                  className={`flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 text-xs ${
                    character === id
                      ? "bg-amber-500 font-semibold text-stone-950"
                      : "bg-black/30 text-stone-200 hover:bg-black/50"
                  }`}
                >
                  <Portrait
                    id={id}
                    element={
                      id === MAIN_ID
                        ? profile.element
                        : companionById(id)!.element
                    }
                    profession={
                      id === MAIN_ID
                        ? profile.profession
                        : companionById(id)!.profession
                    }
                    className="size-6"
                  />
                  {nameOf(id)}
                  {profile.team.includes(id) && (
                    <span title="Đang ra trận">⚑</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-stretch justify-center gap-2 sm:gap-3">
              <div className="flex flex-col justify-between gap-1.5">
                {LEFT_SLOTS.map((slot) => (
                  <SlotButton
                    key={slot}
                    slot={slot}
                    item={slotItem(slot)}
                    fallbackElement={fighter.element}
                    profession={fighter.profession}
                    selected={!!item && slotItem(slot)?.id === item.id}
                    onClick={() => setSelected(slotItem(slot)?.id ?? null)}
                  />
                ))}
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div
                  className="relative flex aspect-[4/3] w-full max-w-72 items-center justify-center overflow-hidden rounded-lg border-2 border-amber-300/80 shadow-[0_0_0_2px_#3b2a1d,inset_0_0_40px_#000a]"
                  style={{
                    background: `radial-gradient(circle at 50% 60%, ${ELEMENT_COLOR[fighter.element]}cc 0%, #3b1d12 55%, #140d0a 100%)`,
                  }}
                >
                  <svg
                    viewBox="0 0 200 150"
                    className="absolute inset-0 size-full opacity-25"
                    aria-hidden
                  >
                    {[60, 48, 36, 24].map((r) => (
                      <circle
                        key={r}
                        cx={100}
                        cy={88}
                        r={r}
                        fill="none"
                        stroke="#f3d27a"
                        strokeWidth={r === 60 ? 1.5 : 0.8}
                        strokeDasharray={r % 24 === 0 ? "3 3" : undefined}
                      />
                    ))}
                    {Array.from({ length: 16 }, (_, i) => {
                      const a = (i / 16) * Math.PI * 2;
                      return (
                        <line
                          key={i}
                          x1={100 + Math.cos(a) * 14}
                          y1={88 + Math.sin(a) * 14}
                          x2={100 + Math.cos(a) * 22}
                          y2={88 + Math.sin(a) * 22}
                          stroke="#f3d27a"
                          strokeWidth={1}
                        />
                      );
                    })}
                  </svg>
                  <Portrait
                    id={character}
                    element={fighter.element}
                    profession={fighter.profession}
                    className="relative size-32 drop-shadow-[0_6px_10px_#000c] sm:size-36"
                  />
                  <span className="absolute top-1.5 left-2 flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-[11px] text-amber-100">
                    <ElementIcon
                      element={fighter.element}
                      className="size-3.5"
                    />{" "}
                    {ELEMENT_NAME[fighter.element]}
                  </span>
                  <span className="absolute top-1.5 right-2 flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-[11px] text-amber-100">
                    <ProfessionIcon
                      profession={fighter.profession}
                      className="size-3.5"
                    />{" "}
                    {PROFESSION_NAME[fighter.profession]}
                  </span>
                </div>
                <SlotButton
                  slot="vuKhi"
                  item={slotItem("vuKhi")}
                  fallbackElement={fighter.element}
                  profession={fighter.profession}
                  selected={!!item && slotItem("vuKhi")?.id === item.id}
                  onClick={() => setSelected(slotItem("vuKhi")?.id ?? null)}
                />
              </div>
              <div className="flex flex-col justify-between gap-1.5">
                {RIGHT_SLOTS.map((slot) => (
                  <SlotButton
                    key={slot}
                    slot={slot}
                    item={slotItem(slot)}
                    fallbackElement={fighter.element}
                    profession={fighter.profession}
                    selected={!!item && slotItem(slot)?.id === item.id}
                    onClick={() => setSelected(slotItem(slot)?.id ?? null)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between border-b border-[#8a6a3b]/60 pb-1">
              <span className="text-base font-bold text-amber-200">
                {nameOf(character)}
              </span>
              <span className="font-semibold text-amber-100">
                Cấp {progress.level}
              </span>
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              <Bar
                tone="hp"
                value={fighter.maxHp}
                max={fighter.maxHp}
                label={`${fighter.maxHp}/${fighter.maxHp}`}
              />
              <Bar
                tone="xp"
                value={xpNow}
                max={xpMax}
                label={
                  progress.level >= MAX_LEVEL
                    ? "Cấp tối đa"
                    : `${xpNow}/${xpMax} (${((xpNow / xpMax) * 100).toFixed(1)}%)`
                }
              />
              <Bar
                tone="gold"
                value={profile.gold}
                max={Math.max(profile.gold, 1000)}
                label={`${profile.gold} vàng`}
              />
            </div>

            <dl className="mt-3 grid grid-cols-2 overflow-hidden rounded-md border border-[#8a6a3b]/60 text-sm">
              {stats.map(([k, v], i) => (
                <div
                  key={k}
                  className={`flex items-center justify-between gap-2 px-2 py-1 ${Math.floor(i / 2) % 2 === 0 ? "bg-black/25" : "bg-black/10"}`}
                >
                  <dt className="text-stone-300">{k}</dt>
                  <dd className="font-semibold text-stone-50 tabular-nums">
                    {v}
                    {(gearBonus[k] ?? 0) > 0 && (
                      <span className="ml-1 text-xs text-emerald-400">
                        (+{gearBonus[k]})
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            {(bonuses.length > 0 || ultimate) && (
              <ul className="mt-2 flex flex-col gap-0.5 text-xs text-stone-300">
                {bonuses.map((b) => (
                  <li
                    key={`${b.kind}-${b.id}-${b.level}`}
                    className="text-emerald-300"
                  >
                    ✦ {bonusText(b)}
                  </li>
                ))}
                {ultimate && (
                  <li>
                    Tuyệt chiêu:{" "}
                    <span className="font-semibold text-amber-200">
                      {ultimate.name}
                    </span>
                    {progress.level < 10 && (
                      <span className="opacity-70"> (mở ở cấp 10)</span>
                    )}
                  </li>
                )}
              </ul>
            )}
          </section>

          {/* Bên phải: túi đồ */}
          <section
            aria-label="Túi đồ"
            className="flex flex-col rounded-xl border-2 border-[#8a6a3b] bg-[#2a1f19]/90 p-3 shadow-[inset_0_0_24px_#0009]"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold text-amber-200">
                Túi đồ ({profile.bag.length}/{BAG_LIMIT})
              </h2>
              <div
                className="flex gap-1"
                role="tablist"
                aria-label="Lọc túi đồ"
              >
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={filter === f.id}
                    onClick={() => {
                      setFilter(f.id);
                      setPage(0);
                    }}
                    className={`rounded px-2 py-0.5 text-xs ${filter === f.id ? "bg-amber-500 font-semibold text-stone-950" : "bg-black/30 text-stone-200"}`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-2 flex gap-1" aria-label="Trang túi đồ">
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-current={page === i}
                  onClick={() => setPage(i)}
                  className={`min-w-7 rounded border px-1.5 text-xs font-semibold ${
                    page === i
                      ? "border-amber-200 bg-gradient-to-b from-amber-200 to-amber-500 text-stone-950"
                      : "border-[#8a6a3b] bg-black/30 text-stone-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <ul
              className="grid gap-1.5"
              style={{
                gridTemplateColumns: `repeat(${BAG_COLS}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: BAG_PAGE }, (_, i) => {
                const it = visible[i];
                if (!it) {
                  return (
                    <li
                      key={`empty-${i}`}
                      aria-hidden
                      className="aspect-square rounded-lg border border-[#8a6a3b]/40 bg-black/25 shadow-[inset_0_1px_3px_#0008]"
                    />
                  );
                }
                const by = wearerOf(profile, it.id);
                const inTray = mergeTray.includes(it.id);
                return (
                  <li key={it.id} className="relative aspect-square">
                    <button
                      type="button"
                      aria-pressed={selected === it.id}
                      onClick={() =>
                        setSelected(selected === it.id ? null : it.id)
                      }
                      title={`${gearText(it)}${by ? ` · ${nameOf(by)} đang mặc` : ""}`}
                      className={`size-full rounded-lg ${selected === it.id ? "ring-2 ring-amber-300" : inTray ? "ring-2 ring-sky-400" : ""}`}
                    >
                      <GearIcon
                        slot={it.slot}
                        element={it.element}
                        tier={it.tier}
                        profession={it.profession}
                        className="size-full"
                      />
                    </button>
                    {by && (
                      <span className="pointer-events-none absolute right-0.5 bottom-0.5 rounded bg-emerald-700 px-1 text-[9px] leading-tight font-bold text-white">
                        E
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Chi tiết món đang chọn */}
            <div className="mt-3 min-h-24 rounded-lg border border-[#8a6a3b]/60 bg-black/30 p-2 text-sm">
              {item ? (
                <div className="flex gap-3">
                  <GearIcon
                    slot={item.slot}
                    element={item.element}
                    tier={item.tier}
                    profession={item.profession}
                    className="size-16 shrink-0"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className={`font-semibold ${TIER_CLASS[item.tier]}`}>
                      {gearText(item)}
                    </p>
                    <p className="text-xs text-stone-300">
                      {STAT_NAME[SLOT_STAT[item.slot]]} +
                      {itemStat(item, fighter.element)} khi {nameOf(character)}{" "}
                      mặc
                      {wearer && <> · {nameOf(wearer)} đang mặc</>}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {wearer !== character && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            run({ type: "equip", character, item: item.id })
                          }
                          className="rounded bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white disabled:opacity-40"
                        >
                          Mặc cho {nameOf(character)}
                        </button>
                      )}
                      {wearer && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            run({
                              type: "unequip",
                              character: wearer,
                              item: item.id,
                            })
                          }
                          className="rounded bg-black/40 px-2 py-0.5 text-xs disabled:opacity-40"
                        >
                          Tháo
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setMergeTray((t) =>
                            t.includes(item.id)
                              ? t.filter((x) => x !== item.id)
                              : [...t, item.id].slice(-3),
                          )
                        }
                        className="rounded bg-sky-700 px-2 py-0.5 text-xs text-white"
                      >
                        {mergeTray.includes(item.id)
                          ? "Bỏ khỏi ghép"
                          : "Đưa vào ghép"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          run({ type: "sell", item: item.id }, () => {
                            setSelected(null);
                            setMergeTray((t) => t.filter((x) => x !== item.id));
                          })
                        }
                        className="rounded bg-black/40 px-2 py-0.5 text-xs disabled:opacity-40"
                      >
                        Bán +{SELL_GOLD[item.tier]}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-400">
                  Chọn một món trong túi hoặc trên người để xem chi tiết. Thắng
                  trận chắc chắn rơi 1 món; mua thêm ở thẻ Đội hình &amp; cửa
                  hàng.
                </p>
              )}
            </div>

            {/* Khay ghép */}
            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-sky-500/50 p-2 text-xs">
              <span className="text-stone-300">Ghép:</span>
              {[0, 1, 2].map((i) => {
                const it = trayItems[i];
                return it ? (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() =>
                      setMergeTray((t) => t.filter((x) => x !== it.id))
                    }
                    title={`${gearText(it)} · bấm để bỏ`}
                  >
                    <GearIcon
                      slot={it.slot}
                      element={it.element}
                      tier={it.tier}
                      profession={it.profession}
                      className="size-9"
                    />
                  </button>
                ) : (
                  <span
                    key={i}
                    className="size-9 rounded-lg border border-[#8a6a3b]/40 bg-black/25"
                  />
                );
              })}
              <button
                type="button"
                disabled={busy || trayItems.length !== 3}
                onClick={() =>
                  run({ type: "merge", items: mergeTray, main: 0 }, () =>
                    setMergeTray([]),
                  )
                }
                className="rounded bg-amber-500 px-2 py-1 font-semibold text-stone-950 disabled:opacity-35"
              >
                Ghép
                {trayItems.length === 3
                  ? ` (−${mergeCost(trayItems[0]!.tier)} vàng)`
                  : ""}
              </button>
              <span className="text-stone-400">
                3 món cùng ô, cùng hệ, cùng phẩm; giữ bộ của món đầu.
              </span>
            </div>
          </section>
        </div>
      )}
    </Frame>
  );
}

/** Khung ngoài: nền trận, dải tiêu đề, nút đóng về màn chính. */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 bg-[radial-gradient(ellipse_at_top,#4a2418_0%,#17110e_60%)] px-2 py-4 text-stone-100 [--gold:#d4a24c] [--panel:#271d18] sm:px-4">
      <div className="relative mx-auto max-w-6xl rounded-2xl border-4 border-[#c79a4a] bg-[#1d1511] p-3 pt-10 shadow-[0_0_0_2px_#3b2a1d,0_12px_40px_#000c] sm:p-4 sm:pt-12">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-xl border-4 border-[#c79a4a] bg-gradient-to-b from-[#fbf3df] to-[#e6d3a7] px-8 py-1.5 shadow-[0_4px_0_#0006] sm:px-12">
          <h1 className="text-lg font-black tracking-[0.2em] text-[#5a1e14] sm:text-xl">
            HỒ SƠ
          </h1>
        </div>
        <SceneLink
          scene="MENU"
          aria-label="Đóng, về màn chính"
          className="absolute -top-4 -right-3 flex size-10 items-center justify-center rounded-full border-4 border-amber-200 bg-gradient-to-b from-rose-500 to-red-800 text-xl font-black text-white shadow-[0_3px_0_#0007]"
        >
          ✕
        </SceneLink>
        {children}
      </div>
    </main>
  );
}
