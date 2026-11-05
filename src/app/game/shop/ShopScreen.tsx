"use client";

// Cửa Hàng: một chỗ mua tướng (nhân vật kèm), trang bị và vật phẩm (lương) bằng vàng. Không có luật mới ở đây:
// mọi giao dịch là thao tác hồ sơ (buyCompanion, buyGear, buyFood) do @/core áp dụng và server kiểm tra lại;
// màn này chỉ hiển thị và gửi thao tác, dùng lại ShopPanel và GearShop của hồ sơ.

import { useEffect, useState } from "react";
import {
  CAMPAIGN_FOOD_MAX,
  FOOD_PRICE,
  type Profile,
  type ProfileAction,
} from "@/core";
import { ModeScreen, OrnateFrame } from "@/components/game-ui";
import { Alert, Button, Tabs, type TabItem } from "@/components/ui";
import { GearShop } from "../battle/GearPanel";
import { fetchProfile, sendProfileAction } from "../battle/online";
import { PROFILE_ERROR } from "../battle/ProgressPanel";
import ShopPanel from "../battle/ShopPanel";

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
              <section aria-label="Cửa hàng trang bị" className="rounded-lg bg-[var(--panel)] p-2 text-xs">
                <h2 className="mb-2 font-semibold">Trang bị</h2>
                <GearShop profile={profile} disabled={busy} onBuy={(a) => void act(a)} />
              </section>
            )}
            {tab === "items" && <ItemsTab profile={profile} busy={busy} onAction={act} />}
          </div>
        </OrnateFrame>
      )}
    </ModeScreen>
  );
}

/** Vật phẩm: hiện chỉ có lương cho Bình Loạn (giá và mức chứa tối đa do @/core quy định). */
function ItemsTab({
  profile,
  busy,
  onAction,
}: {
  profile: Profile;
  busy: boolean;
  onAction: (a: ProfileAction) => Promise<string | null>;
}) {
  const supply = profile.campaign.supply;
  const room = CAMPAIGN_FOOD_MAX - supply;
  const affordable = Math.floor(profile.gold / FOOD_PRICE);
  const options = [1, 10, room].filter((n, i, a) => n > 0 && n <= room && a.indexOf(n) === i);
  return (
    <section aria-label="Vật phẩm" className="ui-frame-inset p-3 text-sm">
      <h2 className="ui-title-on-wood mb-1 text-base">Lương thực</h2>
      <p className="mb-3 text-caption text-on-wood-soft">
        Lương mang vào trận Bình Loạn kế tiếp. Có {supply}/{CAMPAIGN_FOOD_MAX}; mỗi phần giá {FOOD_PRICE} vàng.
      </p>
      {room <= 0 ? (
        <p className="text-caption text-on-wood-soft">Kho lương đã đầy.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((n) => (
            <Button
              key={n}
              type="button"
              disabled={busy || affordable < n}
              onClick={() => void onAction({ type: "buyFood", amount: n })}
              className="min-h-11"
            >
              Mua {n} lương ({n * FOOD_PRICE} vàng)
            </Button>
          ))}
        </div>
      )}
    </section>
  );
}
