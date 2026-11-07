"use client";

// Tab Kho đồ: toàn bộ túi đồ (sức chứa BAG_LIMIT), lọc theo loại ô, chi tiết món đang chọn với mặc/tháo/bán, và
// chế độ "Ghép đồ" chỉ mở khi người chơi bấm. Điều kiện, phí và kết quả ghép là của @/core (mergeGear); ở đây
// chỉ làm mờ món không ghép cùng được để dễ chọn.

import { useState } from "react";
import {
  BAG_LIMIT,
  GEAR_SLOTS,
  itemStat,
  MAIN_ID,
  mergeCost,
  SELL_GOLD,
  SLOT_STAT,
  wearerOf,
  type GearItem,
  type GearSlot,
  type Profile,
  type ProfileAction,
} from "@/core";
import { GearIcon, GearActionIcon } from "../art/gear";
import { gearText, PROFESSION_NAME, SLOT_NAME, TIER_CLASS } from "../battle/labels";
import { SceneLink } from "../SceneContext";
import { fighterOf, STAT_NAME } from "./HeroDetail";
import { ShopGlyph, XGlyph } from "./glyphs";
import { nameOf, ownedIds } from "./roster";

type Shelf = "all" | "weapon" | "armor" | "jewelry";
const SHELVES: readonly { id: Shelf; name: string; slots: readonly GearSlot[] }[] = [
  { id: "all", name: "Tất cả", slots: GEAR_SLOTS },
  { id: "weapon", name: "Vũ khí", slots: ["vuKhi"] },
  { id: "armor", name: "Phục sức", slots: ["dinhMao", "yPhuc", "hoThu", "baoNgoa"] },
  { id: "jewelry", name: "Trang sức", slots: ["gioiChi", "hangLien", "hoPhu", "ngocBoi"] },
];

const SLOT_ORDER = Object.fromEntries(GEAR_SLOTS.map((s, i) => [s, i])) as Record<GearSlot, number>;

/** Ba món ghép được với nhau khi cùng ô, cùng hệ, cùng phẩm (vũ khí: cùng nghề). */
const mergeable = (a: GearItem, b: GearItem) =>
  a.slot === b.slot && a.element === b.element && a.tier === b.tier && a.profession === b.profession;

export default function Armory({
  profile,
  busy,
  onAction,
  focusCharacter,
}: {
  profile: Profile;
  busy: boolean;
  onAction: (a: ProfileAction) => Promise<string | null>;
  /** Tướng sĩ đang chọn ở tab Tướng sĩ: mặc định là người nhận khi bấm "Mặc cho". */
  focusCharacter: string;
}) {
  const [shelf, setShelf] = useState<Shelf>("all");
  const [slotFilter, setSlotFilter] = useState<GearSlot | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [merging, setMerging] = useState(false);
  const [tray, setTray] = useState<string[]>([]);
  const [target, setTarget] = useState<string>(focusCharacter);

  const slots = SHELVES.find((s) => s.id === shelf)!.slots;
  const items = profile.bag
    .filter((it) => slots.includes(it.slot) && (slotFilter === "all" || it.slot === slotFilter))
    .sort((a, b) => b.tier - a.tier || SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot] || a.element.localeCompare(b.element) || a.id.localeCompare(b.id));
  const item = profile.bag.find((it) => it.id === selected) ?? null;
  const trayItems = tray.flatMap((id) => profile.bag.filter((it) => it.id === id));
  const first = trayItems[0];

  const run = (a: ProfileAction, after?: () => void) =>
    void onAction(a).then((error) => {
      if (!error) after?.();
    });

  const clickItem = (it: GearItem) => {
    if (!merging) return setSelected(selected === it.id ? null : it.id);
    setTray((t) => (t.includes(it.id) ? t.filter((x) => x !== it.id) : t.length >= 3 ? t : [...t, it.id]));
  };

  return (
    <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,24rem)]">
      <section aria-label="Kho đồ" className="barracks-panel flex flex-col rounded-lg p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="barracks-title font-serif text-xl font-bold">
            Kho đồ <span className="text-lg text-[var(--frame-gold-hi)] tabular-nums">{profile.bag.length}/{BAG_LIMIT}</span>
          </h2>
          <button
            type="button"
            aria-pressed={merging}
            onClick={() => {
              setMerging(!merging);
              setTray([]);
            }}
            className={`barracks-btn flex min-h-10 pointer-coarse:min-h-11 items-center gap-1.5 rounded-md px-3 text-[15px] ${merging ? "is-on" : ""}`}
          >
            <GearActionIcon action="merge" className="size-6" />
            {merging ? "Thoát ghép" : "Ghép đồ"}
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-label="Lọc loại trang bị">
          {SHELVES.map((s) => {
            const n = profile.bag.filter((it) => s.slots.includes(it.slot)).length;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={shelf === s.id}
                onClick={() => {
                  setShelf(s.id);
                  setSlotFilter("all");
                }}
                className={`barracks-btn min-h-9 pointer-coarse:min-h-11 rounded-md px-3 text-[15px] ${shelf === s.id ? "is-on" : ""}`}
              >
                {s.name} <span className="text-sm opacity-75 tabular-nums">{n}</span>
              </button>
            );
          })}
          {slots.length > 1 && (
            <label className="barracks-field ml-auto flex min-h-9 pointer-coarse:min-h-11 items-center rounded-md">
              <span className="sr-only">Lọc theo ô</span>
              <select
                value={slotFilter}
                onChange={(e) => setSlotFilter(e.target.value as GearSlot | "all")}
                className="min-h-9 pointer-coarse:min-h-11 cursor-pointer bg-transparent px-2 text-[15px] text-on-wood outline-none"
              >
                <option value="all" className="bg-wood-inset">Mọi ô</option>
                {slots.map((s) => (
                  <option key={s} value={s} className="bg-wood-inset">
                    {SLOT_NAME[s]}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        {merging && (
          <p className="mt-2 text-sm text-[var(--on-wood-soft)]">Chọn 3 món cùng ô, cùng hệ, cùng phẩm (vũ khí cùng nghề). Món không ghép chung được sẽ mờ đi.</p>
        )}

        <div className="barracks-scroll mt-2 max-h-[65dvh] overflow-y-auto overscroll-contain pr-1 lg:max-h-[max(20rem,calc(100dvh-17rem))]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-[15px] text-[var(--on-wood-soft)]">
              <p>{profile.bag.length === 0 ? "Kho đồ trống. Thắng trận chắc chắn rơi 1 món." : "Không có món nào thuộc loại này."}</p>
              <SceneLink scene="SHOP" className="barracks-btn flex min-h-10 pointer-coarse:min-h-11 items-center gap-1.5 rounded-md px-4">
                <ShopGlyph className="size-4" /> Mua ở Cửa hàng
              </SceneLink>
            </div>
          ) : (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(4.25rem,1fr))] gap-2" aria-label="Trang bị trong kho">
              {items.map((it) => {
                const by = wearerOf(profile, it.id);
                const inTray = tray.includes(it.id);
                const dim = merging && !inTray && ((first && !mergeable(first, it)) || tray.length >= 3);
                const on = merging ? inTray : selected === it.id;
                return (
                  <li key={it.id} className="relative">
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => clickItem(it)}
                      aria-label={`${gearText(it)}${by ? `, ${nameOf(by)} đang dùng` : ""}`}
                      title={`${gearText(it)}${by ? ` · ${nameOf(by)} đang dùng` : ""}`}
                      className={`gear-slot relative flex aspect-square w-full items-center justify-center rounded-lg p-0.5 ${on ? "is-selected" : ""} ${dim ? "opacity-35" : ""}`}
                    >
                      <GearIcon slot={it.slot} element={it.element} tier={it.tier} set={it.set} profession={it.profession} className="size-full" />
                    </button>
                    {by && (
                      <span className="pointer-events-none absolute right-1 bottom-1 rounded bg-success-surface px-1 text-[11px] leading-tight font-bold text-success" aria-hidden>
                        Mặc
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <aside aria-label={merging ? "Ghép đồ" : "Chi tiết trang bị"} className="barracks-panel rounded-lg p-3 lg:sticky lg:top-3">
        {merging ? (
          <MergePanel profile={profile} items={trayItems} busy={busy} onRemove={(id) => setTray((t) => t.filter((x) => x !== id))} onMerge={() => run({ type: "merge", items: tray, main: 0 }, () => setTray([]))} />
        ) : item ? (
          <ItemPanel
            profile={profile}
            item={item}
            busy={busy}
            target={target}
            onTarget={setTarget}
            onAction={run}
            onSold={() => setSelected(null)}
          />
        ) : (
          <p className="py-6 text-center text-[15px] text-[var(--on-wood-soft)]">Chọn một món để xem chỉ số, người đang dùng và thao tác.</p>
        )}
      </aside>
    </div>
  );
}

function ItemPanel({
  profile,
  item,
  busy,
  target,
  onTarget,
  onAction,
  onSold,
}: {
  profile: Profile;
  item: GearItem;
  busy: boolean;
  target: string;
  onTarget: (id: string) => void;
  onAction: (a: ProfileAction, after?: () => void) => void;
  onSold: () => void;
}) {
  const wearer = wearerOf(profile, item.id);
  // Vũ khí chỉ nhân vật đúng nghề mặc được; Đinh Bộ Lĩnh giữ vũ khí riêng cho từng nghề nên luôn nhận.
  const who = ownedIds(profile).filter((id) => item.slot !== "vuKhi" || id === MAIN_ID || fighterOf(profile, id, false).profession === item.profession);
  const to = who.includes(target) ? target : (who[0] ?? MAIN_ID);
  const element = fighterOf(profile, to, false).element;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <GearIcon slot={item.slot} element={item.element} tier={item.tier} set={item.set} profession={item.profession} className="size-20 shrink-0" />
        <div className="min-w-0">
          <h3 className={`font-serif text-lg leading-snug font-bold ${TIER_CLASS[item.tier]}`}>{gearText(item)}</h3>
          <p className="text-sm text-[var(--on-wood-soft)]">
            {item.slot === "vuKhi" && item.profession ? `Chỉ nghề ${PROFESSION_NAME[item.profession]}` : "Mọi tướng sĩ mặc được"}
          </p>
          <p className="mt-1 text-[15px]">{wearer ? <>Đang ở <b className="text-success">{nameOf(wearer)}</b></> : "Chưa ai dùng"}</p>
        </div>
      </div>

      <div className="barracks-inset flex flex-col gap-2 rounded-md p-2.5">
        <label className="flex flex-col gap-1 text-sm text-[var(--on-wood-soft)]">
          Mặc cho
          <select
            value={to}
            onChange={(e) => onTarget(e.target.value)}
            className="barracks-field min-h-10 pointer-coarse:min-h-11 rounded-md bg-transparent px-2 text-[15px] text-on-wood"
          >
            {who.map((id) => (
              <option key={id} value={id} className="bg-wood-inset">
                {nameOf(id)}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm tabular-nums">
          {STAT_NAME[SLOT_STAT[item.slot]]} +{itemStat(item, element)} khi {nameOf(to)} mặc
        </p>
        <div className="flex flex-wrap gap-2">
          {wearer !== to && (
            <button type="button" disabled={busy} onClick={() => onAction({ type: "equip", character: to, item: item.id })} className="barracks-btn is-action min-h-10 pointer-coarse:min-h-11 rounded-md px-3 disabled:opacity-50">
              {wearer ? `Chuyển sang ${nameOf(to)}` : `Mặc cho ${nameOf(to)}`}
            </button>
          )}
          {wearer && (
            <button type="button" disabled={busy} onClick={() => onAction({ type: "unequip", character: wearer, item: item.id })} className="barracks-btn min-h-10 pointer-coarse:min-h-11 rounded-md px-3 disabled:opacity-50">
              Tháo khỏi {nameOf(wearer)}
            </button>
          )}
        </div>
      </div>

      <button type="button" disabled={busy} onClick={() => onAction({ type: "sell", item: item.id }, onSold)} className="barracks-btn flex min-h-10 pointer-coarse:min-h-11 items-center gap-1.5 self-start rounded-md px-3 disabled:opacity-50">
        <GearActionIcon action="sell" className="size-6" />
        Bán lấy {SELL_GOLD[item.tier]} vàng{wearer ? " (tháo ra trước)" : ""}
      </button>
    </div>
  );
}

function MergePanel({
  profile,
  items,
  busy,
  onRemove,
  onMerge,
}: {
  profile: Profile;
  items: readonly GearItem[];
  busy: boolean;
  onRemove: (id: string) => void;
  onMerge: () => void;
}) {
  const ready = items.length === 3;
  const cost = items[0] ? mergeCost(items[0].tier) : null;
  return (
    <div className="flex flex-col gap-3">
      <h3 className="barracks-title font-serif text-lg font-bold">Ghép đồ</h3>
      <p className="text-sm text-[var(--on-wood-soft)]">3 món cùng ô, cùng hệ, cùng phẩm thành 1 món phẩm cao hơn, giữ bộ của món chọn đầu tiên. Món đang mặc sẽ bị tháo.</p>
      <ul className="grid grid-cols-3 gap-2" aria-label="Món đưa vào ghép">
        {[0, 1, 2].map((i) => {
          const it = items[i];
          return (
            <li key={it?.id ?? `empty-${i}`}>
              {it ? (
                <button type="button" onClick={() => onRemove(it.id)} aria-label={`Bỏ ${gearText(it)} khỏi ghép`} className="gear-slot is-selected relative flex aspect-square w-full items-center justify-center rounded-lg p-0.5">
                  <GearIcon slot={it.slot} element={it.element} tier={it.tier} set={it.set} profession={it.profession} className="size-full" />
                  <XGlyph className="absolute top-1 right-1 size-4 rounded-full bg-black/70 p-0.5" />
                </button>
              ) : (
                <span className="gear-slot is-empty flex aspect-square w-full items-center justify-center rounded-lg text-sm text-[var(--on-wood-soft)]">{i + 1}</span>
              )}
            </li>
          );
        })}
      </ul>
      {items[0] && <p className={`text-sm ${TIER_CLASS[items[0].tier]}`}>{gearText(items[0])}</p>}
      <button type="button" disabled={busy || !ready || (cost !== null && profile.gold < cost)} onClick={onMerge} className="barracks-btn is-action flex min-h-11 items-center justify-center gap-1.5 rounded-md px-4 disabled:opacity-50">
        <GearActionIcon action="merge" className="size-6" />
        Ghép{cost !== null ? ` (−${cost} vàng)` : ""}
      </button>
      {cost !== null && profile.gold < cost && <p className="text-sm text-danger">Không đủ vàng: cần {cost}, có {profile.gold}.</p>}
    </div>
  );
}
