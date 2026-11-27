"use client";

// Cửa Hàng: một chỗ mua tướng (nhân vật kèm), trang bị và vật phẩm (lương) bằng vàng. Không có luật mới ở đây:
// mọi giao dịch là thao tác hồ sơ (buyCompanion, buyGear, buyFood) do @/core áp dụng và server kiểm tra lại;
// màn này chỉ hiển thị và gửi thao tác, dùng lại ShopPanel của hồ sơ; trang bị ở GearStore, vật phẩm ở ItemsStore.
// Bố cục (Shan 18/11/2026): banner bến buôn kèm tài sản đang có, cột quầy hàng bên trái (hàng ngang trên điện thoại),
// nội dung quầy bên phải.

import { useState, type KeyboardEvent } from "react";
import { BAG_LIMIT, CAMPAIGN_FOOD_MAX, GEAR_SETS } from "@/core";
import { ModeBanner, ModeLoading, ModeScreen } from "@/components/game-ui";
import { Alert } from "@/components/ui";
import { cn } from "@/lib/cn";
import { GearIcon } from "../art/gear";
import { ProfessionIcon } from "../art/icons";
import { ItemIcon } from "../art/items";
import ShopPanel from "../battle/ShopPanel";
import GearStore from "./GearStore";
import ItemsStore from "./ItemsStore";
import { useProfile } from "../profile/useProfile";

type Tab = "heroes" | "gear" | "items";

export default function ShopScreen() {
  const { profile, loadError, busy, message, act } = useProfile();
  const [tab, setTab] = useState<Tab>("heroes");

  if (!profile)
    return (
      <ModeScreen label="Cửa Hàng">
        <h1 className="sr-only">Cửa Hàng</h1>
        <ModeLoading error={loadError ? "Chưa mở được hồ sơ. Xin tải lại trang." : null} label="Đang mở Cửa Hàng…" sections={2} />
      </ModeScreen>
    );

  const stalls: readonly { value: Tab; label: string; note: string; icon: React.ReactNode }[] = [
    { value: "heroes", label: "Tướng", note: "Tuyển tướng quân về trại", icon: <ProfessionIcon profession={profile.profession} className="size-7" /> },
    {
      value: "gear",
      label: "Trang bị",
      note: `${GEAR_SETS.length} bộ, chín ô trang bị`,
      icon: <GearIcon slot="vuKhi" element={profile.element} tier={2} set={GEAR_SETS[0]!.id} profession={profile.profession} className="size-8" />,
    },
    { value: "items", label: "Vật phẩm", note: "Lương, Đá Cường Hóa, sách", icon: <ItemIcon id="stone" className="size-8" /> },
  ];

  // Mũi tên đổi quầy như một nhóm thẻ (lên/xuống trên máy tính, trái/phải trên điện thoại).
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const at = stalls.findIndex((s) => s.value === tab);
    const next = stalls[(at + step + stalls.length) % stalls.length]!.value;
    setTab(next);
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-stall="${next}"]`)?.focus();
  };

  return (
    <ModeScreen label="Cửa Hàng" card>
      <ModeBanner
        title="Cửa Hàng"
        kicker="Bến buôn quân doanh"
        description="Tuyển tướng, sắm trang bị, tích lương trước khi xuất quân. Món mua về vào kho đồ, mặc và ghép ở Doanh Trại."
        art="/art/formation/maps/benThuyen.webp"
        artPosition="50% 60%"
        stats={[
          { label: "Vàng", value: profile.gold.toLocaleString("vi-VN") },
          { label: "Kho đồ", value: `${profile.bag.length}/${BAG_LIMIT}` },
          { label: "Lương", value: `${profile.campaign.supply}/${CAMPAIGN_FOOD_MAX}` },
          { label: "Đá Cường Hóa", value: profile.stones },
        ]}
      />
      {message && <Alert className="p-3 text-sm">{message}</Alert>}
      <div className="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <div role="tablist" aria-label="Quầy hàng" aria-orientation="vertical" onKeyDown={onKey} className="grid grid-cols-3 gap-2 lg:flex lg:flex-col lg:self-start">
          {stalls.map((s) => {
            const on = s.value === tab;
            return (
              <button
                key={s.value}
                type="button"
                role="tab"
                data-stall={s.value}
                aria-selected={on}
                aria-controls="shop-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => setTab(s.value)}
                className={cn(
                  "flex min-h-14 min-w-0 items-center gap-2 rounded-lg border px-2 py-2 text-left transition-colors max-sm:flex-col max-sm:justify-center max-sm:text-center sm:gap-3 sm:px-3",
                  on ? "border-frame-gold bg-frame-gold/15 shadow-[inset_3px_0_0_var(--frame-gold)]" : "border-frame-line-soft bg-wood-inset hover:border-frame-gold/60",
                )}
              >
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-lg bg-black/25 sm:size-10">{s.icon}</span>
                <span className="min-w-0">
                  <span className={cn("block font-serif font-bold whitespace-nowrap", on ? "text-title-on-wood" : "text-on-wood")}>{s.label}</span>
                  <span className="block truncate text-caption text-on-wood-soft max-lg:hidden">{s.note}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div id="shop-panel" role="tabpanel" aria-label={stalls.find((s) => s.value === tab)!.label} className="min-w-0">
          {tab === "heroes" && <ShopPanel sellOnly profile={profile} locked={busy} onAction={act} />}
          {tab === "gear" && <GearStore profile={profile} disabled={busy} onBuy={(a) => void act(a)} />}
          {tab === "items" && <ItemsStore profile={profile} busy={busy} onAction={(a) => void act(a)} />}
        </div>
      </div>
    </ModeScreen>
  );
}
