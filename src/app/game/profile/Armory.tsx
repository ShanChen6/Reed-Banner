"use client";

// Tab Kho đồ: toàn bộ túi đồ (sức chứa BAG_LIMIT), lọc theo loại ô, chi tiết món đang chọn với mặc/tháo/bán, và
// chế độ "Ghép đồ" chỉ mở khi người chơi bấm. Điều kiện, phí và kết quả ghép là của @/core (mergeGear); ở đây
// chỉ làm mờ món không ghép cùng được để dễ chọn.

import { useState } from "react";
import {
  BAG_LIMIT,
  ENHANCE_BONUS,
  ENHANCE_MAX,
  enhanceCost,
  GEAR_SLOTS,
  itemStat,
  MAIN_ID,
  MAX_LEVEL,
  mergeCost,
  progressOf,
  SELL_GOLD,
  SLOT_STAT,
  wearerOf,
  type Element,
  type GearItem,
  type GearSlot,
  type Profile,
  type ProfileAction,
} from "@/core";
import { Select, XIcon } from "@/components/ui";
import { Pagination } from "@/components/ui/Pagination";
import { ItemIcon, type ItemArtId } from "../art/items";
import { ITEMS } from "../items/catalog";
import { GearIcon, GearActionIcon } from "../art/gear";
import { gearText, PROFESSION_NAME, SLOT_NAME, TIER_CLASS } from "../battle/labels";
import { SceneLink } from "../SceneContext";
import { fighterOf, STAT_NAME, XpBooks } from "./HeroDetail";
import { ShopGlyph } from "./glyphs";
import { nameOf, ownedIds } from "./roster";

type Shelf = "all" | "weapon" | "armor" | "jewelry";
const SHELVES: readonly { id: Shelf; name: string; slots: readonly GearSlot[] }[] = [
  { id: "all", name: "Tất cả", slots: GEAR_SLOTS },
  { id: "weapon", name: "Vũ khí", slots: ["vuKhi"] },
  { id: "armor", name: "Phục sức", slots: ["dinhMao", "yPhuc", "hoThu", "baoNgoa"] },
  { id: "jewelry", name: "Trang sức", slots: ["gioiChi", "hangLien", "hoPhu", "ngocBoi"] },
];

/** Số ô kho một trang: chia hết cho 8 và 12 cột nên hàng nào cũng đầy (Shan 18/11/2026: hiện cả ô trống). */
const BAG_PAGE = 96;

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
  /** Kệ Vật phẩm (lương, Đá Cường Hóa, sách kinh nghiệm) và vật phẩm đang xem. */
  const [itemShelf, setItemShelf] = useState(false);
  const [goodId, setGoodId] = useState<ItemArtId | null>(null);
  const [slotFilter, setSlotFilter] = useState<GearSlot | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [merging, setMerging] = useState(false);
  const [tray, setTray] = useState<string[]>([]);
  const [target, setTarget] = useState<string>(focusCharacter);
  const [page, setPage] = useState(0);
  const [goodPage, setGoodPage] = useState(0);

  const slots = SHELVES.find((s) => s.id === shelf)!.slots;
  const items = profile.bag
    .filter((it) => slots.includes(it.slot) && (slotFilter === "all" || it.slot === slotFilter))
    .sort((a, b) => b.tier - a.tier || SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot] || a.element.localeCompare(b.element) || a.id.localeCompare(b.id));
  const item = profile.bag.find((it) => it.id === selected) ?? null;
  const trayItems = tray.flatMap((id) => profile.bag.filter((it) => it.id === id));
  const first = trayItems[0];
  // Không lọc thì lưới đủ sức chứa của kho (ô trống vẫn hiện); có lọc thì đủ trang cuối của kết quả.
  const filtered = shelf !== "all" || slotFilter !== "all";
  const cells = filtered ? Math.max(BAG_PAGE, Math.ceil(items.length / BAG_PAGE) * BAG_PAGE) : Math.max(BAG_LIMIT, items.length);
  const pages = Math.max(1, Math.ceil(cells / BAG_PAGE));
  const current = Math.min(page, pages - 1);
  const from = current * BAG_PAGE;
  const pageItems = items.slice(from, from + BAG_PAGE);
  const empties = Math.max(0, Math.min(BAG_PAGE, cells - from) - pageItems.length);
  // Kệ Vật phẩm cùng khuôn với trang bị: lưới ô vuông đủ một trang, ô trống, phân trang khi nhiều hơn một trang.
  const goods = ITEMS.map((g) => ({ g, n: g.have(profile) })).filter((x) => x.n > 0);
  const goodPages = Math.max(1, Math.ceil(goods.length / BAG_PAGE));
  const goodCurrent = Math.min(goodPage, goodPages - 1);
  const goodSlice = goods.slice(goodCurrent * BAG_PAGE, (goodCurrent + 1) * BAG_PAGE);

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
      <section aria-label="Kho đồ" className="barracks-panel flex flex-col rounded-lg p-3 lg:min-h-[calc(100dvh-14rem)]">
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
            className={`barracks-btn flex min-h-10 pointer-coarse:min-h-11 items-center gap-1.5 rounded-lg px-3 text-[15px] ${merging ? "is-on" : ""}`}
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
                aria-pressed={!itemShelf && shelf === s.id}
                onClick={() => {
                  setItemShelf(false);
                  setShelf(s.id);
                  setSlotFilter("all");
                  setPage(0);
                }}
                className={`barracks-btn min-h-9 pointer-coarse:min-h-11 rounded-lg px-3 text-[15px] ${!itemShelf && shelf === s.id ? "is-on" : ""}`}
              >
                {s.name} <span className="text-sm opacity-75 tabular-nums">{n}</span>
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={itemShelf}
            onClick={() => {
              setItemShelf(true);
              setMerging(false);
              setTray([]);
            }}
            className={`barracks-btn min-h-9 pointer-coarse:min-h-11 rounded-lg px-3 text-[15px] ${itemShelf ? "is-on" : ""}`}
          >
            Vật phẩm <span className="text-sm opacity-75 tabular-nums">{ITEMS.filter((g) => g.have(profile) > 0).length}</span>
          </button>
          {!itemShelf && slots.length > 1 && (
            <Select
              aria-label="Lọc theo ô"
              uiSize="sm"
              active={slotFilter !== "all"}
              value={slotFilter}
              onChange={(e) => {
                setSlotFilter(e.target.value as GearSlot | "all");
                setPage(0);
              }}
              className="ml-auto text-[15px]"
            >
              <option value="all">Mọi ô</option>
              {slots.map((s) => (
                <option key={s} value={s}>
                  {SLOT_NAME[s]}
                </option>
              ))}
            </Select>
          )}
        </div>
        {merging && (
          <p className="mt-2 text-sm text-[var(--on-wood-soft)]">Chọn 3 món cùng ô, cùng hệ, cùng phẩm (vũ khí cùng nghề). Món không ghép chung được sẽ mờ đi.</p>
        )}

        {itemShelf ? (
          <div className="mt-2 flex flex-1 flex-col gap-2">
            {goods.length === 0 && (
              <div className="flex flex-wrap items-center justify-center gap-3 py-2 text-center text-[15px] text-[var(--on-wood-soft)]">
                <p>Chưa có vật phẩm nào.</p>
                <SceneLink scene="SHOP" className="barracks-btn flex min-h-10 pointer-coarse:min-h-11 items-center gap-1.5 rounded-lg px-4">
                  <ShopGlyph className="size-4" /> Mua ở Cửa Hàng
                </SceneLink>
              </div>
            )}
            <ul className="grid grid-cols-8 gap-1 sm:gap-2 xl:grid-cols-12" aria-label="Vật phẩm trong kho">
              {goodSlice.map(({ g, n }) => (
                <li key={g.id} className="relative">
                  <button
                    type="button"
                    aria-pressed={goodId === g.id}
                    onClick={() => setGoodId(goodId === g.id ? null : g.id)}
                    aria-label={`${g.name}, có ${n} ${g.unit}`}
                    title={`${g.name}, ${n} ${g.unit}`}
                    className={`gear-slot relative flex aspect-square w-full items-center justify-center rounded-lg p-0.5 ${goodId === g.id ? "is-selected" : ""}`}
                  >
                    <ItemIcon id={g.id} className="size-full" />
                  </button>
                  <span className="pointer-events-none absolute right-1 bottom-1 rounded-lg bg-black/70 px-1 text-[11px] leading-tight font-bold text-frame-gold-hi tabular-nums" aria-hidden>
                    ×{n}
                  </span>
                </li>
              ))}
              {Array.from({ length: BAG_PAGE - goodSlice.length }, (_, i) => (
                <li key={`empty-${i}`} aria-hidden className="aspect-square rounded-lg border border-dashed border-[var(--frame-line-soft)] bg-black/20" />
              ))}
            </ul>
            {goodPages > 1 && (
              <Pagination
                label="Trang vật phẩm"
                className="mt-auto pt-2"
                hasPrevious={goodCurrent > 0}
                hasNext={goodCurrent < goodPages - 1}
                onPrevious={() => setGoodPage(goodCurrent - 1)}
                onNext={() => setGoodPage(goodCurrent + 1)}
              >
                <span className="text-caption text-on-wood-soft tabular-nums">Trang {goodCurrent + 1}/{goodPages}</span>
              </Pagination>
            )}
          </div>
        ) : (
        <div className="mt-2 flex flex-1 flex-col gap-2">
          {items.length === 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 py-2 text-center text-[15px] text-[var(--on-wood-soft)]">
              <p>{profile.bag.length === 0 ? "Kho đồ trống. Thắng trận chắc chắn rơi 1 món." : "Không có món nào thuộc loại này."}</p>
              <SceneLink scene="SHOP" className="barracks-btn flex min-h-10 pointer-coarse:min-h-11 items-center gap-1.5 rounded-lg px-4">
                <ShopGlyph className="size-4" /> Mua ở Cửa Hàng
              </SceneLink>
            </div>
          )}
          <ul className="grid grid-cols-8 gap-1 sm:gap-2 xl:grid-cols-12" aria-label="Trang bị trong kho">
              {pageItems.map((it) => {
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
                      title={`${gearText(it)}${by ? `, ${nameOf(by)} đang dùng` : ""}`}
                      className={`gear-slot relative flex aspect-square w-full items-center justify-center rounded-lg p-0.5 ${on ? "is-selected" : ""} ${dim ? "opacity-35" : ""}`}
                    >
                      <GearIcon slot={it.slot} element={it.element} tier={it.tier} set={it.set} profession={it.profession} className="size-full" />
                    </button>
                    {!!it.enhance && (
                      <span className="pointer-events-none absolute top-1 left-1 rounded-lg bg-black/70 px-1 text-[11px] leading-tight font-bold text-frame-gold-hi tabular-nums" aria-hidden>
                        +{it.enhance}
                      </span>
                    )}
                    {by && (
                      <span className="pointer-events-none absolute right-1 bottom-1 rounded-lg bg-success-surface px-1 text-[11px] leading-tight font-bold text-success" aria-hidden>
                        Mặc
                      </span>
                    )}
                  </li>
                );
              })}
              {Array.from({ length: empties }, (_, i) => (
                <li key={`empty-${i}`} aria-hidden className="aspect-square rounded-lg border border-dashed border-[var(--frame-line-soft)] bg-black/20" />
              ))}
            </ul>
          {pages > 1 && (
            <Pagination
              label="Trang kho đồ"
              className="mt-auto pt-2"
              hasPrevious={current > 0}
              hasNext={current < pages - 1}
              onPrevious={() => setPage(current - 1)}
              onNext={() => setPage(current + 1)}
            >
              <span className="text-caption text-on-wood-soft tabular-nums">Trang {current + 1}/{pages}</span>
            </Pagination>
          )}
        </div>
        )}
      </section>

      <aside aria-label={itemShelf ? "Chi tiết vật phẩm" : merging ? "Ghép đồ" : "Chi tiết trang bị"} className="barracks-panel rounded-lg p-3 lg:sticky lg:top-3">
        {itemShelf ? (
          <GoodPanel
            profile={profile}
            id={goodId}
            hero={target}
            onHero={setTarget}
            busy={busy}
            onAction={onAction}
            onEnhance={() => {
              // Đá Cường Hóa: sang kệ trang bị, chọn sẵn món đầu tiên tướng đang chọn đang mặc (nếu có) để mở khung Cường hóa.
              const worn = profile.bag.find((it) => wearerOf(profile, it.id) === target) ?? profile.bag[0];
              setItemShelf(false);
              setShelf("all");
              setSlotFilter("all");
              setMerging(false);
              setSelected(worn?.id ?? null);
            }}
          />
        ) : merging ? (
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
            {item.slot === "vuKhi" && item.profession ? `Chỉ nghề ${PROFESSION_NAME[item.profession]}` : "Mọi tướng quân mặc được"}
          </p>
          <p className="mt-1 text-[15px]">{wearer ? <>Đang ở <b className="text-success">{nameOf(wearer)}</b></> : "Chưa ai dùng"}</p>
        </div>
      </div>

      <div className="barracks-inset flex flex-col gap-2 rounded-lg p-2.5">
        <label className="flex flex-col gap-1 text-sm text-[var(--on-wood-soft)]">
          Mặc cho
          <Select value={to} onChange={(e) => onTarget(e.target.value)} className="text-[15px]">
            {who.map((id) => (
              <option key={id} value={id}>
                {nameOf(id)}
              </option>
            ))}
          </Select>
        </label>
        <p className="text-sm tabular-nums">
          {STAT_NAME[SLOT_STAT[item.slot]]} +{itemStat(item, element)} khi {nameOf(to)} mặc
        </p>
        <div className="flex flex-wrap gap-2">
          {wearer !== to && (
            <button type="button" disabled={busy} onClick={() => onAction({ type: "equip", character: to, item: item.id })} className="barracks-btn is-action min-h-10 pointer-coarse:min-h-11 rounded-lg px-3 disabled:opacity-50">
              {wearer ? `Chuyển sang ${nameOf(to)}` : `Mặc cho ${nameOf(to)}`}
            </button>
          )}
          {wearer && (
            <button type="button" disabled={busy} onClick={() => onAction({ type: "unequip", character: wearer, item: item.id })} className="barracks-btn min-h-10 pointer-coarse:min-h-11 rounded-lg px-3 disabled:opacity-50">
              Tháo khỏi {nameOf(wearer)}
            </button>
          )}
        </div>
      </div>

      <EnhanceBox profile={profile} item={item} element={element} who={nameOf(to)} busy={busy} onAction={onAction} />

      <button type="button" disabled={busy} onClick={() => onAction({ type: "sell", item: item.id }, onSold)} className="barracks-btn flex min-h-10 pointer-coarse:min-h-11 items-center gap-1.5 self-start rounded-lg px-3 disabled:opacity-50">
        <GearActionIcon action="sell" className="size-6" />
        Bán lấy {SELL_GOLD[item.tier]} vàng{wearer ? " (tháo ra trước)" : ""}
      </button>
    </div>
  );
}

/** Chi tiết một vật phẩm trong kho: số đang có, công dụng, nơi dùng, lối sang Cửa Hàng. */
/** Chi tiết vật phẩm đang chọn và chỗ dùng ngay: sách cho tướng chọn ở đây, đá sang khung Cường hóa, lương sang Bình Loạn. */
function GoodPanel({
  profile,
  id,
  hero,
  onHero,
  busy,
  onAction,
  onEnhance,
}: {
  profile: Profile;
  id: ItemArtId | null;
  hero: string;
  onHero: (id: string) => void;
  busy: boolean;
  onAction: (a: ProfileAction) => Promise<string | null>;
  onEnhance: () => void;
}) {
  const g = ITEMS.find((x) => x.id === id);
  if (!g) return <p className="py-6 text-center text-[15px] text-[var(--on-wood-soft)]">Chọn một vật phẩm để xem số đang có và cách dùng.</p>;
  const have = g.have(profile);
  const heroes = ownedIds(profile);
  const reader = heroes.includes(hero) ? hero : (heroes[0] ?? MAIN_ID);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <ItemIcon id={g.id} className="size-16 shrink-0" />
        <div className="min-w-0">
          <h3 className="barracks-title font-serif text-lg font-bold">{g.name}</h3>
          <p className="text-[15px] tabular-nums">
            Đang có <b className="text-title-on-wood">{have}</b> {g.unit}
            {g.id === "food" && ` / ${g.max}`}
          </p>
        </div>
      </div>
      <p className="text-sm text-[var(--on-wood-soft)]">{g.text}</p>

      {g.id === "xpBook" && have > 0 && (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-sm text-[var(--on-wood-soft)]">
            Dùng cho
            <Select value={reader} onChange={(e) => onHero(e.target.value)} className="text-[15px]">
              {heroes.map((h) => (
                <option key={h} value={h}>
                  {nameOf(h)}, cấp {progressOf(profile, h).level}
                </option>
              ))}
            </Select>
          </label>
          {progressOf(profile, reader).level >= MAX_LEVEL ? (
            <p className="text-sm text-[var(--on-wood-soft)]">{nameOf(reader)} đã đạt cấp tối đa.</p>
          ) : (
            <XpBooks profile={profile} id={reader} busy={busy} onAction={onAction} />
          )}
        </div>
      )}
      {g.id === "stone" && have > 0 && (
        <button type="button" onClick={onEnhance} className="barracks-btn is-action flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-4">
          Chọn trang bị để cường hóa
        </button>
      )}
      {g.id === "food" && (
        <SceneLink scene="CAMPAIGN" className="barracks-btn is-action flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-4">
          Sang Bình Loạn
        </SceneLink>
      )}
      <p className="text-sm"><b>Dùng ở:</b> {g.use}</p>
      <SceneLink scene="SHOP" className="barracks-btn flex min-h-10 pointer-coarse:min-h-11 items-center gap-1.5 self-start rounded-lg px-4">
        <ShopGlyph className="size-4" /> Mua thêm ở Cửa Hàng, {g.price} vàng/{g.unit}
      </SceneLink>
    </div>
  );
}

/** Cường hóa món đang chọn: cấp hiện tại, chỉ số trước/sau, giá Đá Cường Hóa và vàng (enhanceCost của @/core). */
function EnhanceBox({
  profile,
  item,
  element,
  who,
  busy,
  onAction,
}: {
  profile: Profile;
  item: GearItem;
  element: Element;
  who: string;
  busy: boolean;
  onAction: (a: ProfileAction, after?: () => void) => void;
}) {
  const level = item.enhance ?? 0;
  const cost = enhanceCost(item);
  const now = itemStat(item, element);
  const next = cost ? itemStat({ ...item, enhance: level + 1 }, element) : now;
  const short = cost ? (profile.stones < cost.stones ? "Thiếu Đá Cường Hóa" : profile.gold < cost.gold ? "Thiếu vàng" : null) : null;
  return (
    <div className="barracks-inset flex flex-col gap-2 rounded-lg p-2.5" aria-label="Cường hóa">
      <div className="flex items-center justify-between gap-2">
        <span className="font-serif font-bold text-title-on-wood">Cường hóa +{level}/{ENHANCE_MAX}</span>
        <span className="text-sm text-[var(--on-wood-soft)] tabular-nums">Có {profile.stones} Đá Cường Hóa</span>
      </div>
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: ENHANCE_MAX }, (_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i < level ? "bg-frame-gold" : "bg-black/40"}`} />
        ))}
      </div>
      {cost ? (
        <>
          <p className="text-sm tabular-nums">
            {STAT_NAME[SLOT_STAT[item.slot]]} khi {who} mặc: {now} → <b className="text-success">{next}</b> (mỗi cấp +{Math.round(ENHANCE_BONUS * 100)}% chỉ số món)
          </p>
          <button
            type="button"
            disabled={busy || short !== null}
            onClick={() => onAction({ type: "enhance", item: item.id })}
            className="barracks-btn is-action min-h-10 pointer-coarse:min-h-11 self-start rounded-lg px-3 disabled:opacity-50"
          >
            Cường hóa lên +{level + 1}, {cost.stones} đá, {cost.gold} vàng
          </button>
          {short && (
            <p className="text-sm text-[var(--on-wood-soft)]">
              {short}.{" "}
              <SceneLink scene="SHOP" className="ui-link text-frame-gold underline underline-offset-2">Mua ở Cửa Hàng</SceneLink>
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-success">Đã cường hóa tối đa.</p>
      )}
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
                  <XIcon className="absolute top-1 right-1 size-4 rounded-full bg-black/70 p-0.5" />
                </button>
              ) : (
                <span className="gear-slot is-empty flex aspect-square w-full items-center justify-center rounded-lg text-sm text-[var(--on-wood-soft)]">{i + 1}</span>
              )}
            </li>
          );
        })}
      </ul>
      {items[0] && <p className={`text-sm ${TIER_CLASS[items[0].tier]}`}>{gearText(items[0])}</p>}
      <button type="button" disabled={busy || !ready || (cost !== null && profile.gold < cost)} onClick={onMerge} className="barracks-btn is-action flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-4 disabled:opacity-50">
        <GearActionIcon action="merge" className="size-6" />
        Ghép{cost !== null ? ` (−${cost} vàng)` : ""}
      </button>
      {cost !== null && profile.gold < cost && <p className="text-sm text-danger">Không đủ vàng: cần {cost}, có {profile.gold}.</p>}
    </div>
  );
}
