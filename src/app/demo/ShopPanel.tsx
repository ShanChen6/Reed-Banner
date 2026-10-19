"use client";

// Cửa hàng nhân vật kèm và chọn đội 3vs3 của /demo và /play. Luật nằm trong @/core (applyProfileAction);
// ở đây chỉ hiển thị và gửi thao tác, giống ProgressPanel.

import { useState } from "react";
import { ALL_COMPANIONS, ownsCompanion, shopPrice, ultimateOf, type FighterConfig, type Profile, type ProfileAction } from "@/core";
import { ElementIcon } from "./art/icons";
import { Portrait } from "./art/portraits";
import { ELEMENT_NAME, PROFESSION_NAME } from "./labels";
import { PROFILE_ERROR } from "./ProgressPanel";

function CompanionCard({
  c,
  profile,
  selected,
  disabled,
  onPick,
  onBuy,
}: {
  c: FighterConfig;
  profile: Profile;
  selected: boolean;
  disabled: boolean;
  onPick: () => void;
  onBuy: () => void;
}) {
  const owned = ownsCompanion(profile, c.id);
  const price = shopPrice(c.id);
  const ultimate = ultimateOf(c.id);
  return (
    <li
      className={`flex items-center gap-2 rounded p-1.5 ${selected ? "bg-emerald-600/25 ring-1 ring-emerald-500" : "bg-black/5"} ${owned ? "" : "opacity-80"}`}
    >
      <Portrait id={c.id} element={c.element} profession={c.profession} className="size-9 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 font-semibold">
          <span className="truncate">{c.name}</span>
          <ElementIcon element={c.element} className="size-3.5 shrink-0" />
        </div>
        <div className="truncate opacity-70" title={ultimate ? `Tuyệt chiêu: ${ultimate.name}` : undefined}>
          {PROFESSION_NAME[c.profession]} · {ELEMENT_NAME[c.element]}
          {ultimate && <> · {ultimate.name}</>}
        </div>
      </div>
      {owned ? (
        <button
          type="button"
          disabled={disabled}
          aria-pressed={selected}
          onClick={onPick}
          className={`rounded px-2 py-0.5 text-[10px] ${selected ? "bg-emerald-600 text-white" : "bg-black/15"} disabled:opacity-40`}
        >
          {selected ? "Ra trận" : "Chọn"}
        </button>
      ) : (
        <button
          type="button"
          disabled={disabled || price === undefined || profile.gold < price}
          onClick={onBuy}
          className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-stone-950 tabular-nums disabled:opacity-35"
          title={price !== undefined && profile.gold < price ? `Cần ${price} vàng` : undefined}
        >
          Mua {price}
        </button>
      )}
    </li>
  );
}

/**
 * `locked` khi đang đánh: chỉ xem. Chọn đội: bấm một nhân vật chưa ra trận thì người đó thay người được
 * chọn sớm nhất. `onAction` trả về mã lỗi, hoặc null khi thành công.
 */
export default function ShopPanel({
  profile,
  locked,
  onAction,
}: {
  profile: Profile;
  locked: boolean;
  onAction: (a: ProfileAction) => Promise<string | null>;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const commit = (a: ProfileAction) => {
    setBusy(true);
    void onAction(a).then((error) => {
      setBusy(false);
      setMessage(error ? (PROFILE_ERROR[error as keyof typeof PROFILE_ERROR] ?? error) : null);
    });
  };
  const pick = (id: string) => {
    if (profile.team.includes(id)) return;
    commit({ type: "chooseTeam", companions: [profile.team[1]!, id] });
  };

  const owned = ALL_COMPANIONS.filter((c) => ownsCompanion(profile, c.id));
  const forSale = ALL_COMPANIONS.filter((c) => !ownsCompanion(profile, c.id));
  const card = (c: FighterConfig) => (
    <CompanionCard
      key={c.id}
      c={c}
      profile={profile}
      selected={profile.team.includes(c.id)}
      disabled={locked || busy}
      onPick={() => pick(c.id)}
      onBuy={() => commit({ type: "buyCompanion", character: c.id })}
    />
  );

  return (
    <section aria-label="Đội hình và cửa hàng" className="rounded-lg bg-[var(--panel)] p-2 text-xs">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Đội hình 3vs3</h2>
        <span className="tabular-nums">Vàng: {profile.gold}</span>
        {message && <span className="text-rose-500">{message}</span>}
      </div>
      {locked && <p className="mb-2 opacity-70">Đang trong trận: đổi đội và mua nhân vật sau khi trận kết thúc.</p>}
      <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">{owned.map(card)}</ul>
      {forSale.length > 0 && (
        <>
          <h3 className="mt-3 mb-1.5 font-semibold">Cửa hàng nhân vật kèm</h3>
          <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">{forSale.map(card)}</ul>
        </>
      )}
      <p className="mt-2 opacity-60">
        Chọn 2 nhân vật kèm ra trận cùng Đinh Bộ Lĩnh. Nhân vật mua về bắt đầu ở cấp 1, tuyệt chiêu mở ở cấp 10.
      </p>
    </section>
  );
}
