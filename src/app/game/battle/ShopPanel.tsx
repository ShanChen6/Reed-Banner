"use client";

// Cửa hàng nhân vật kèm và chọn đội 3vs3 của Chơi thử và Chơi online. Luật nằm trong @/core (applyProfileAction);
// ở đây chỉ hiển thị và gửi thao tác, giống ProgressPanel.

import { useState } from "react";
import {
  ALL_COMPANIONS,
  CAMPAIGN,
  ELEMENTS,
  PROFESSIONS,
  HERO_COMPANIONS,
  isHero,
  isWarlord,
  ownsCompanion,
  personalSkillOf,
  shopPrice,
  shopUnlocked,
  shopUnlockStage,
  WARLORD_COMPANIONS,
  type Element,
  type FighterConfig,
  type Profession,
  type Profile,
  type ProfileAction,
} from "@/core";
import { ElementIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
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
  const ultimate = personalSkillOf(c.id);
  const hero = isHero(c.id);
  const warlord = isWarlord(c.id);
  // Tướng lịch sử chưa gia nhập: không bán, chỉ báo màn chiến dịch sẽ mở. Sứ quân: mở bán khi qua màn của họ.
  const lockStage = owned
    ? undefined
    : hero
      ? CAMPAIGN.find((s) => s.joins === c.id)
      : !shopUnlocked(profile, c.id)
        ? CAMPAIGN.find((s) => s.id === shopUnlockStage(c.id))
        : undefined;
  return (
    <li
      className={`flex min-w-0 items-center gap-2 rounded p-1.5 ${selected ? "bg-emerald-600/25 ring-1 ring-emerald-500" : "bg-black/5"} ${owned ? "" : "opacity-80"}`}
    >
      <Portrait id={c.id} element={c.element} profession={c.profession} className="size-9 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 font-semibold">
          <span className="truncate">{c.name}</span>
          <ElementIcon element={c.element} className="size-3.5 shrink-0" />
        </div>
        <div className="truncate opacity-70" title={ultimate ? `${hero || warlord ? "Chiêu riêng" : "Tuyệt chiêu"}: ${ultimate.name}` : undefined}>
          {PROFESSION_NAME[c.profession]} · {ELEMENT_NAME[c.element]}
          {ultimate && <> · {ultimate.name}</>}
          {hero && <> · Tướng lịch sử</>}
          {warlord && <> · Sứ quân</>}
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
      ) : lockStage ? (
        <span className="min-w-0 max-w-[45%] text-right text-[10px] opacity-70">Mở sau màn “{lockStage.title}”</span>
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
  const [profFilter, setProfFilter] = useState<Profession | "all">("all");
  const [elemFilter, setElemFilter] = useState<Element | "all">("all");
  const shown = (c: FighterConfig) =>
    (profFilter === "all" || c.profession === profFilter) && (elemFilter === "all" || c.element === elemFilter);

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
  const forSale = ALL_COMPANIONS.filter(
    (c) => !ownsCompanion(profile, c.id) && shopPrice(c.id) !== undefined && !isWarlord(c.id) && shown(c),
  );
  const warlordsLeft = WARLORD_COMPANIONS.map((w) => w.fighter).filter((c) => !ownsCompanion(profile, c.id) && shown(c));
  const heroesLeft = HERO_COMPANIONS.filter((c) => !ownsCompanion(profile, c.id) && shown(c));
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
      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">{owned.map(card)}</ul>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-semibold">Lọc nhân vật chưa có:</span>
        <select
          aria-label="Lọc theo nghề"
          value={profFilter}
          onChange={(e) => setProfFilter(e.target.value as Profession | "all")}
          className="rounded bg-black/10 px-1 py-0.5"
        >
          <option value="all">Mọi nghề</option>
          {PROFESSIONS.map((p) => (
            <option key={p} value={p}>
              {PROFESSION_NAME[p]}
            </option>
          ))}
        </select>
        <select
          aria-label="Lọc theo hệ"
          value={elemFilter}
          onChange={(e) => setElemFilter(e.target.value as Element | "all")}
          className="rounded bg-black/10 px-1 py-0.5"
        >
          <option value="all">Mọi hệ</option>
          {ELEMENTS.map((el) => (
            <option key={el} value={el}>
              {ELEMENT_NAME[el]}
            </option>
          ))}
        </select>
      </div>
      {forSale.length > 0 && (
        <>
          <h3 className="mt-3 mb-1.5 font-semibold">Cửa hàng tướng thường</h3>
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">{forSale.map(card)}</ul>
        </>
      )}
      {warlordsLeft.length > 0 && (
        <>
          <h3 className="mt-3 mb-1.5 font-semibold">Sứ quân (mở bán khi đánh bại ở chiến dịch)</h3>
          <p className="mb-2 text-xs opacity-75">Khi tuyển về, sứ quân dùng 3 chiêu nghề + 2 chiêu hệ + chiêu riêng ô 5 mở cấp 10. Khi làm đối thủ chiến dịch, họ giữ bộ hệ của màn và luôn có chiêu riêng; bộ chiêu có thể khác.</p>
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">{warlordsLeft.map(card)}</ul>
        </>
      )}
      {heroesLeft.length > 0 && (
        <>
          <h3 className="mt-3 mb-1.5 font-semibold">Tướng lịch sử (gia nhập qua chiến dịch)</h3>
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">{heroesLeft.map(card)}</ul>
        </>
      )}
      <p className="mt-2 opacity-60">
        Mọi nhân vật kèm có 3 chiêu nghề, 2 chiêu hệ và 1 tuyệt chiêu như Đinh Bộ Lĩnh, nâng theo ô; ô 5 là tuyệt chiêu (tướng thường) hoặc chiêu riêng (tướng lịch sử, sứ quân). Chọn 2 nhân vật kèm ra trận cùng Đinh Bộ Lĩnh. Nhân vật mua về bắt đầu ở cấp 1.
      </p>
    </section>
  );
}
