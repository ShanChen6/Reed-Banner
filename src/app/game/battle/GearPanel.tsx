"use client";

// Túi đồ và 9 ô trang bị của Chơi thử (Tiến trình) và Chơi online, kèm cửa hàng trang bị. Luật nằm trong
// @/core (applyProfileAction); ở đây chỉ hiển thị và gửi thao tác, giống ProgressPanel.

import { useState } from "react";
import {
  BAG_LIMIT,
  companionById,
  ELEMENTS,
  GEAR_SETS,
  GEAR_SLOTS,
  equip,
  getGearSet,
  gearStats,
  itemStat,
  loadoutOf,
  MAIN_ID,
  mergeCost,
  PROFESSIONS,
  SELL_GOLD,
  SHOP_GEAR_PRICE,
  wearerOf,
  type Element,
  type GearItem,
  type GearSlot,
  type Profession,
  type Profile,
  type ProfileAction,
  type Tier,
} from "@/core";
import { GearIcon } from "../art/gear";
import {
  ELEMENT_NAME,
  gearText,
  PROFESSION_NAME,
  SLOT_NAME,
  TIER_COLOR_NAME,
} from "./labels";
import { PROFILE_ERROR } from "./ProgressPanel";

const nameOf = (id: string) =>
  id === MAIN_ID ? "Đinh Bộ Lĩnh" : (companionById(id)?.name ?? id);
const professionOf = (profile: Profile, id: string): Profession =>
  id === MAIN_ID ? profile.profession : companionById(id)!.profession;
const elementOf = (profile: Profile, id: string): Element =>
  id === MAIN_ID ? profile.element : companionById(id)!.element;

const SLOT_ORDER = Object.fromEntries(
  GEAR_SLOTS.map((s, i) => [s, i]),
) as Record<GearSlot, number>;
const byShelf = (a: GearItem, b: GearItem) =>
  SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot] ||
  b.tier - a.tier ||
  a.element.localeCompare(b.element);

const signed = (value: number, suffix = "") =>
  `${value >= 0 ? "+" : ""}${value}${suffix}`;

export function activeBonusText(
  bonus: ReturnType<typeof gearStats>["bonuses"][number],
): string {
  const name = bonus.kind === "set"
    ? `Bộ ${getGearSet(bonus.id)?.name ?? bonus.id}`
    : `Cộng hưởng ${ELEMENT_NAME[bonus.id as Element]}`;
  const stats = Object.entries(bonus.bonus)
    .map(([stat, value]) => `${stat === "maxHp" ? "Máu" : stat.toUpperCase()} +${Math.round(value * 100)}%`)
    .join(" · ");
  return `${name} ${bonus.level}: ${stats}`;
}

/** So sánh đúng kết quả trang bị sau khi thay món cùng ô, kể cả mốc bộ/cộng hưởng. */
export function gearComparison(
  profile: Profile,
  character: string,
  item: GearItem,
): string | null {
  const profession = professionOf(profile, character);
  const element = elementOf(profile, character);
  const before = gearStats(loadoutOf(profile, character), element, profession);
  const next = equip(
    loadoutOf(profile, character),
    item,
    character === MAIN_ID ? undefined : profession,
  );
  if (!next.ok) return null;
  const after = gearStats(next.loadout, element, profession);
  const parts = (["atk", "maxHp", "def"] as const).flatMap((stat) => {
    const flat = after.flat[stat] - before.flat[stat];
    const percent = Math.round((after.percent[stat] - before.percent[stat]) * 100);
    const name = stat === "maxHp" ? "Máu" : stat.toUpperCase();
    return [flat ? `${name} ${signed(flat)}` : null, percent ? `${name} ${signed(percent, "%")}` : null].filter(Boolean);
  });
  return parts.length ? `So với đang mặc: ${parts.join(" · ")}` : "So với đang mặc: không đổi tổng chỉ số";
}

const SHOP_TIERS = Object.keys(SHOP_GEAR_PRICE).map(Number) as Tier[];

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; text: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex items-center gap-1">
      <span className="opacity-70">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded bg-black/20 px-1 py-0.5"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.text}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * `teamIds` là đội mang vào trận (nhân vật chính và nhân vật kèm). `locked` khi đang đánh: chỉ xem.
 * Bấm món trong túi để chọn (tối đa 3); 1 món thì mặc, tháo hoặc bán, 3 món thì ghép.
 */
export default function GearPanel({
  profile,
  teamIds,
  locked,
  onAction,
}: {
  profile: Profile;
  teamIds: readonly string[];
  locked: boolean;
  onAction: (a: ProfileAction) => Promise<string | null>;
}) {
  const [who, setWho] = useState<string>(MAIN_ID);
  const [picked, setPicked] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const character = teamIds.includes(who) ? who : MAIN_ID;
  const disabled = locked || busy;
  const commit = (a: ProfileAction) => {
    setBusy(true);
    void onAction(a).then((error) => {
      setBusy(false);
      setMessage(
        error
          ? (PROFILE_ERROR[error as keyof typeof PROFILE_ERROR] ?? error)
          : null,
      );
      if (!error) setPicked([]);
    });
  };
  const toggle = (id: string) =>
    setPicked((cur) =>
      cur.includes(id)
        ? cur.filter((x) => x !== id)
        : cur.length >= 3
          ? [...cur.slice(1), id]
          : [...cur, id],
    );

  const loadout = loadoutOf(profile, character);
  const profession = professionOf(profile, character);
  const stats = gearStats(loadout, elementOf(profile, character), profession);
  const bySlot = (slot: GearSlot): GearItem | undefined =>
    slot === "vuKhi"
      ? loadout.weapons[profession]
      : loadout.slots[slot as Exclude<GearSlot, "vuKhi">];
  const items = picked.flatMap((id) =>
    profile.bag.filter((it) => it.id === id),
  );
  const one = items.length === 1 ? items[0]! : null;
  const wearer = one ? wearerOf(profile, one.id) : null;

  return (
    <section
      aria-label="Trang bị"
      className="rounded-lg bg-[var(--panel)] p-2 text-xs"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">
          Trang bị · Túi đồ {profile.bag.length}/{BAG_LIMIT}
        </h2>
        <span className="tabular-nums">Vàng: {profile.gold}</span>
        {message && <span className="text-rose-500">{message}</span>}
      </div>
      {locked && (
        <p className="mb-2 opacity-70">
          Đang trong trận: đổi trang bị sau khi trận kết thúc.
        </p>
      )}

      <div
        className="mb-2 flex flex-wrap gap-1"
        role="tablist"
        aria-label="Nhân vật"
      >
        {teamIds.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={character === id}
            onClick={() => setWho(id)}
            className={`rounded px-2 py-0.5 ${character === id ? "bg-amber-500 font-semibold text-stone-950" : "bg-black/15"}`}
          >
            {nameOf(id)}
          </button>
        ))}
      </div>

      <div
        className="flex flex-wrap items-center gap-1"
        aria-label={`Ô trang bị của ${nameOf(character)}`}
      >
        {GEAR_SLOTS.map((slot) => {
          const item = bySlot(slot);
          return (
            <button
              key={slot}
              type="button"
              disabled={disabled || !item}
              onClick={() =>
                item && commit({ type: "unequip", character, item: item.id })
              }
              title={
                item
                  ? `${gearText(item)} · bấm để tháo`
                  : `${SLOT_NAME[slot]}: trống`
              }
              className={`rounded ${item ? "" : "opacity-30"} disabled:cursor-default`}
            >
              <GearIcon
                slot={slot}
                element={item?.element ?? elementOf(profile, character)}
                tier={item?.tier}
                profession={slot === "vuKhi" ? profession : undefined}
                className="size-9"
              />
            </button>
          );
        })}
        <span className="ml-1 tabular-nums opacity-80">
          +{stats.flat.atk} ATK · +{stats.flat.maxHp} Máu · +{stats.flat.def}{" "}
          DEF · +{Math.round(stats.percent.atk * 100)}% ATK · +{Math.round(stats.percent.maxHp * 100)}% Máu · +{Math.round(stats.percent.def * 100)}% DEF
        </span>
      </div>
      {stats.bonuses.length > 0 && (
        <ul className="mt-1 space-y-0.5 opacity-80" aria-label="Thưởng bộ và cộng hưởng đang kích hoạt">
          {stats.bonuses.map((bonus) => <li key={`${bonus.kind}-${bonus.id}-${bonus.level}`}>{activeBonusText(bonus)}</li>)}
        </ul>
      )}

      <h3 className="mt-3 mb-1 font-semibold">Túi đồ</h3>
      {profile.bag.length === 0 ? (
        <p className="opacity-60">
          Chưa có món nào. Thắng trận chắc chắn rơi 1 món; cũng có thể mua ở cửa
          hàng bên dưới.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-1">
          {[...profile.bag].sort(byShelf).map((it) => {
            const on = picked.includes(it.id);
            const worn = wearerOf(profile, it.id);
            return (
              <li key={it.id} className="relative">
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(it.id)}
                  title={`${gearText(it)}${worn ? ` · ${nameOf(worn)} đang mặc` : ""}`}
                  className={`rounded ${on ? "ring-2 ring-amber-400" : ""}`}
                >
                  <GearIcon
                    slot={it.slot}
                    element={it.element}
                    tier={it.tier}
                    profession={it.profession}
                    className="size-9"
                  />
                </button>
                {worn && (
                  <span className="pointer-events-none absolute -top-1 -right-1 rounded-full bg-emerald-600 px-1 text-[9px] text-white">
                    {nameOf(worn).split(" ").at(-1)![0]}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {items.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded bg-black/10 p-1.5">
          {one ? (
            <>
              <span className="min-w-0 flex-1">
                {gearText(one)}
                {wearer && (
                  <span className="opacity-70">
                    {" "}
                    · {nameOf(wearer)} đang mặc
                  </span>
                )}
                <span className="block opacity-70">
                  +{itemStat(one, elementOf(profile, character))} chỉ số · {gearComparison(profile, character, one)}
                </span>
              </span>
              {wearer !== character && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    commit({ type: "equip", character, item: one.id })
                  }
                  className="rounded bg-emerald-600 px-2 py-0.5 text-white disabled:opacity-40"
                >
                  Mặc cho {nameOf(character)}
                </button>
              )}
              {wearer && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    commit({ type: "unequip", character: wearer, item: one.id })
                  }
                  className="rounded bg-black/20 px-2 py-0.5 disabled:opacity-40"
                >
                  Tháo
                </button>
              )}
              <button
                type="button"
                disabled={disabled}
                onClick={() => commit({ type: "sell", item: one.id })}
                className="rounded bg-black/20 px-2 py-0.5 disabled:opacity-40"
              >
                Bán +{SELL_GOLD[one.tier]}
              </button>
            </>
          ) : items.length === 3 ? (
            <>
              <span className="min-w-0 flex-1">
                Ghép 3 món thành 1 món phẩm cao hơn, giữ bộ của món chọn đầu
                tiên.
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  commit({ type: "merge", items: picked, main: 0 })
                }
                className="rounded bg-amber-500 px-2 py-0.5 font-semibold text-stone-950 disabled:opacity-40"
              >
                Ghép (−{mergeCost(items[0]!.tier)} vàng)
              </button>
            </>
          ) : (
            <span className="flex-1 opacity-70">
              Chọn thêm để đủ 3 món cùng ô, cùng hệ, cùng phẩm rồi ghép.
            </span>
          )}
          <button
            type="button"
            onClick={() => setPicked([])}
            className="rounded bg-black/20 px-2 py-0.5"
          >
            Bỏ chọn
          </button>
        </div>
      )}

      <h3 className="mt-3 mb-1 font-semibold">Cửa hàng trang bị</h3>
      <GearShop profile={profile} disabled={disabled} onBuy={commit} />
      <p className="mt-2 opacity-60">
        Mỗi món chỉ một người mặc. Vũ khí của Đinh Bộ Lĩnh giữ riêng theo nghề;
        nhân vật kèm chỉ mặc vũ khí đúng nghề. Ghép cần 3 món cùng ô, cùng hệ,
        cùng phẩm (vũ khí cùng nghề).
      </p>
    </section>
  );
}

/** Cửa hàng trang bị: chọn ô, nghề (vũ khí), hệ, bộ, phẩm rồi mua. Dùng ở bảng Trang bị và phân cảnh Hồ sơ. */
export function GearShop({
  profile,
  disabled,
  onBuy,
}: {
  profile: Profile;
  disabled: boolean;
  onBuy: (a: ProfileAction) => void;
}) {
  const [order, setOrder] = useState<{
    slot: GearSlot;
    element: Element;
    set: string;
    tier: Tier;
    profession: Profession;
  }>({
    slot: "vuKhi",
    element: profile.element,
    set: GEAR_SETS[0]!.id,
    tier: SHOP_TIERS[0]!,
    profession: profile.profession,
  });
  const price = SHOP_GEAR_PRICE[order.tier] ?? 0;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        label="Ô"
        value={order.slot}
        options={GEAR_SLOTS.map((s) => ({ value: s, text: SLOT_NAME[s] }))}
        onChange={(slot) => setOrder({ ...order, slot })}
      />
      {order.slot === "vuKhi" && (
        <Select
          label="Nghề"
          value={order.profession}
          options={PROFESSIONS.map((p) => ({
            value: p,
            text: PROFESSION_NAME[p],
          }))}
          onChange={(p) => setOrder({ ...order, profession: p })}
        />
      )}
      <Select
        label="Hệ"
        value={order.element}
        options={ELEMENTS.map((e) => ({ value: e, text: ELEMENT_NAME[e] }))}
        onChange={(element) => setOrder({ ...order, element })}
      />
      <Select
        label="Bộ"
        value={order.set}
        options={GEAR_SETS.map((g) => ({ value: g.id, text: g.name }))}
        onChange={(set) => setOrder({ ...order, set })}
      />
      <Select
        label="Phẩm"
        value={String(order.tier)}
        options={SHOP_TIERS.map((t) => ({
          value: String(t),
          text: `${TIER_COLOR_NAME[t]} (${SHOP_GEAR_PRICE[t]} vàng)`,
        }))}
        onChange={(t) => setOrder({ ...order, tier: Number(t) as Tier })}
      />
      <button
        type="button"
        disabled={disabled || profile.gold < price}
        onClick={() =>
          onBuy({
            type: "buyGear",
            slot: order.slot,
            element: order.element,
            set: order.set,
            tier: order.tier,
            ...(order.slot === "vuKhi" ? { profession: order.profession } : {}),
          })
        }
        className="rounded bg-amber-500 px-2 py-0.5 font-semibold text-stone-950 disabled:opacity-35"
      >
        Mua {price}
      </button>
    </div>
  );
}
