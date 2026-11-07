"use client";

// Tab Trang bị của Cửa Hàng: chọn bộ, phẩm, hệ (và nghề cho vũ khí) bằng hình, rồi mua từ lưới 9 món, mỗi ô
// trang bị một thẻ. Giá, chỉ số và luật mua nằm trong @/core (SHOP_GEAR_PRICE, itemStat, buyGear); ở đây chỉ hiển thị.

import { useState } from "react";
import {
  BAG_LIMIT,
  ELEMENTS,
  GEAR_SETS,
  GEAR_SLOTS,
  getGearSet,
  itemStat,
  PROFESSIONS,
  SHOP_GEAR_PRICE,
  SLOT_STAT,
  type Element,
  type GearSlot,
  type Profession,
  type Profile,
  type ProfileAction,
  type StatBonus,
  type Tier,
} from "@/core";
import { Button, ChoiceChip } from "@/components/ui";
import { GearIcon, SetEmblem } from "../art/gear";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { ELEMENT_NAME, PROFESSION_NAME, SLOT_NAME, TIER_CLASS, TIER_COLOR_NAME } from "../battle/labels";
import { SceneLink } from "../SceneContext";

const SHOP_TIERS = Object.keys(SHOP_GEAR_PRICE).map(Number) as Tier[];
const STAT_NAME = { atk: "Công", maxHp: "Máu", def: "Thủ" } as const;

const bonusText = (b: StatBonus) =>
  Object.entries(b)
    .map(([stat, v]) => `${STAT_NAME[stat as keyof typeof STAT_NAME]} +${Math.round((v ?? 0) * 100)}%`)
    .join(" · ");

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-2">
      <span className="w-12 shrink-0 text-caption font-semibold text-on-wood-soft">{label}</span>
      {/* Điện thoại: một hàng cuộn ngang để thanh chọn không chiếm nửa màn hình. */}
      <div className="flex min-w-0 flex-1 items-center gap-2 max-sm:-my-1 max-sm:overflow-x-auto max-sm:py-1 sm:flex-wrap [&>*]:shrink-0">{children}</div>
    </div>
  );
}

export default function GearStore({
  profile,
  disabled,
  onBuy,
}: {
  profile: Profile;
  disabled: boolean;
  onBuy: (a: ProfileAction) => void;
}) {
  const [set, setSet] = useState<string>(GEAR_SETS[0]!.id);
  const [tier, setTier] = useState<Tier>(SHOP_TIERS[0]!);
  const [element, setElement] = useState<Element>(profile.element);
  const [profession, setProfession] = useState<Profession>(profile.profession);
  const price = SHOP_GEAR_PRICE[tier] ?? 0;
  const bagFull = profile.bag.length >= BAG_LIMIT;
  const def = getGearSet(set);

  const card = (slot: GearSlot) => {
    const weapon = slot === "vuKhi";
    const stat = SLOT_STAT[slot];
    const value = itemStat({ id: "", slot, element, tier, set, ...(weapon ? { profession } : {}) }, profile.element);
    const owned = profile.bag.filter(
      (i) => i.slot === slot && i.element === element && i.tier === tier && i.set === set && (!weapon || i.profession === profession),
    ).length;
    const short = profile.gold < price;
    return (
      <li key={slot} className="ui-frame-inset flex min-w-0 flex-col items-center gap-1 p-2 text-center">
        <GearIcon slot={slot} element={element} tier={tier} set={set} profession={weapon ? profession : undefined} className="size-14 sm:size-16" />
        <span className="w-full truncate text-sm font-semibold text-on-wood">
          {SLOT_NAME[slot]}
          {weapon && <span className="sr-only"> ({PROFESSION_NAME[profession]})</span>}
        </span>
        <span className="text-caption text-title-on-wood tabular-nums">+{value} {STAT_NAME[stat]}</span>
        {owned > 0 && <span className="text-caption text-on-wood-soft tabular-nums">Trong túi: {owned}</span>}
        <Button
          type="button"
          size="sm"
          className="mt-auto w-full px-1 text-caption tabular-nums"
          disabled={disabled || short || bagFull}
          title={bagFull ? "Túi đồ đã đầy" : short ? `Cần ${price} vàng` : undefined}
          aria-label={`Mua ${SLOT_NAME[slot]}${weapon ? ` ${PROFESSION_NAME[profession]}` : ""} ${TIER_COLOR_NAME[tier]} hệ ${ELEMENT_NAME[element]}, ${price} vàng`}
          onClick={() => onBuy({ type: "buyGear", slot, element, set, tier, ...(weapon ? { profession } : {}) })}
        >
          Mua · {price}
        </Button>
      </li>
    );
  };

  return (
    <section aria-label="Cửa hàng trang bị" className="flex flex-col gap-3 text-sm">
      <div className="ui-frame-inset flex flex-col gap-2 p-3">
        <Row label="Bộ">
          {GEAR_SETS.map((g) => (
            <ChoiceChip key={g.id} selected={set === g.id} onClick={() => setSet(g.id)}>
              <SetEmblem set={g.id} className="size-5" />
              {g.name}
            </ChoiceChip>
          ))}
        </Row>
        <Row label="Phẩm">
          {SHOP_TIERS.map((t) => (
            <ChoiceChip key={t} selected={tier === t} onClick={() => setTier(t)}>
              <span className={TIER_CLASS[t]} aria-hidden>◆</span>
              {TIER_COLOR_NAME[t]} <span className="tabular-nums opacity-70">{SHOP_GEAR_PRICE[t]} vàng</span>
            </ChoiceChip>
          ))}
        </Row>
        <Row label="Hệ">
          {ELEMENTS.map((e) => (
            <ChoiceChip key={e} selected={element === e} onClick={() => setElement(e)} title={ELEMENT_NAME[e]} className="px-2">
              <ElementIcon element={e} className="size-5" />
              <span className="max-sm:sr-only">{ELEMENT_NAME[e]}</span>
            </ChoiceChip>
          ))}
        </Row>
        <Row label="Nghề">
          {PROFESSIONS.map((p) => (
            <ChoiceChip key={p} selected={profession === p} onClick={() => setProfession(p)} title={PROFESSION_NAME[p]} className="px-2">
              <ProfessionIcon profession={p} className="size-5" />
              <span className="sr-only">{PROFESSION_NAME[p]}</span>
            </ChoiceChip>
          ))}
          <span className="text-caption text-on-wood-soft">Vũ khí: {PROFESSION_NAME[profession]}</span>
        </Row>
      </div>

      {def && (
        <p className="text-caption text-on-wood-soft">
          <span className="font-semibold text-frame-gold">Bộ {def.name}</span> · mặc 6 món: {bonusText(def.six)} · đủ 9 món: thêm {bonusText(def.nine)}.
          Chỉ số trên thẻ tính cho Đinh Bộ Lĩnh hệ {ELEMENT_NAME[profile.element]}; trang bị cùng hệ người mặc mạnh nhất.
        </p>
      )}

      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">{GEAR_SLOTS.map(card)}</ul>

      <p className="text-caption text-on-wood-soft">
        Túi đồ <span className="tabular-nums">{profile.bag.length}/{BAG_LIMIT}</span>
        {bagFull && " (đã đầy, bán bớt để mua thêm)"}. Món mới vào túi; mặc và ghép ở{" "}
        <SceneLink scene="PROFILE" className="ui-link text-frame-gold underline underline-offset-2">Doanh Trại</SceneLink>.
      </p>
    </section>
  );
}
