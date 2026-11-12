"use client";

// Cửa Hàng: một chỗ mua tướng (nhân vật kèm), trang bị và vật phẩm (lương) bằng vàng. Không có luật mới ở đây:
// mọi giao dịch là thao tác hồ sơ (buyCompanion, buyGear, buyFood) do @/core áp dụng và server kiểm tra lại;
// màn này chỉ hiển thị và gửi thao tác, dùng lại ShopPanel của hồ sơ; trang bị ở GearStore, vật phẩm ở ItemsStore.

import { useState } from "react";
import { ModeScreen, OrnateFrame } from "@/components/game-ui";
import { Alert, Tabs, type TabItem } from "@/components/ui";
import ShopPanel from "../battle/ShopPanel";
import GearStore from "./GearStore";
import ItemsStore from "./ItemsStore";
import { useProfile } from "../profile/useProfile";

type Tab = "heroes" | "gear" | "items";
const TABS: readonly TabItem<Tab>[] = [
  { value: "heroes", label: "Tướng" },
  { value: "gear", label: "Trang bị" },
  { value: "items", label: "Vật phẩm" },
];

export default function ShopScreen() {
  const { profile, loadError, busy, message, act } = useProfile();
  const [tab, setTab] = useState<Tab>("heroes");

  return (
    <ModeScreen label="Cửa Hàng">
      <h1 className="sr-only">Cửa Hàng</h1>
      {!profile ? (
        <OrnateFrame as="div" role="status" className="py-16 text-center text-on-wood-soft">
          {loadError ? "Không tải được hồ sơ, thử tải lại trang." : "Đang mở cửa hàng…"}
        </OrnateFrame>
      ) : (
        <OrnateFrame level="raised" className="flex flex-col gap-3">
          <Tabs label="Mục cửa hàng" items={TABS} value={tab} onChange={setTab} fullWidth panelId="shop-panel" className="[&>button]:whitespace-nowrap [&>button]:px-2" />
          {message && <Alert className="p-3 text-sm">{message}</Alert>}
          <div id="shop-panel" role="tabpanel" className="min-w-0">
            {tab === "heroes" && <ShopPanel sellOnly profile={profile} locked={busy} onAction={act} />}
            {tab === "gear" && <GearStore profile={profile} disabled={busy} onBuy={(a) => void act(a)} />}
            {tab === "items" && <ItemsStore profile={profile} busy={busy} onAction={(a) => void act(a)} />}
          </div>
        </OrnateFrame>
      )}
    </ModeScreen>
  );
}
