"use client";

// Cửa Hàng: một chỗ mua tướng (nhân vật kèm), trang bị và vật phẩm (lương) bằng vàng. Không có luật mới ở đây:
// mọi giao dịch là thao tác hồ sơ (buyCompanion, buyGear, buyFood) do @/core áp dụng và server kiểm tra lại;
// màn này chỉ hiển thị và gửi thao tác, dùng lại ShopPanel và GearShop của hồ sơ.

import { useEffect, useState } from "react";
import type { Profile, ProfileAction } from "@/core";
import { ModeScreen, OrnateFrame } from "@/components/game-ui";
import { Alert, Tabs, type TabItem } from "@/components/ui";
import { GearShop } from "../battle/GearPanel";
import { fetchProfile, sendProfileAction } from "../battle/online";
import { PROFILE_ERROR } from "../battle/ProgressPanel";
import ShopPanel from "../battle/ShopPanel";
import ItemsStore from "./ItemsStore";

type Tab = "heroes" | "gear" | "items";
const TABS: readonly TabItem<Tab>[] = [
  { value: "heroes", label: "Tướng" },
  { value: "gear", label: "Trang bị" },
  { value: "items", label: "Vật phẩm" },
];

export default function ShopScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<Tab>("heroes");
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
    setMessage(error ? (PROFILE_ERROR[error as keyof typeof PROFILE_ERROR] ?? error) : null);
    return error;
  };

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
            {tab === "heroes" && <ShopPanel profile={profile} locked={busy} onAction={act} />}
            {tab === "gear" && (
              <section aria-label="Cửa hàng trang bị" className="ui-frame-inset p-3 text-sm">
                <h2 className="ui-title-on-wood mb-1 text-base">Trang bị</h2>
                <p className="mb-3 text-caption text-on-wood-soft">Chọn ô, hệ, bộ và phẩm rồi mua; món mới vào túi đồ ở Hồ sơ.</p>
                <GearShop profile={profile} disabled={busy} onBuy={(a) => void act(a)} />
              </section>
            )}
            {tab === "items" && <ItemsStore profile={profile} busy={busy} onAction={(a) => void act(a)} />}
          </div>
        </OrnateFrame>
      )}
    </ModeScreen>
  );
}
