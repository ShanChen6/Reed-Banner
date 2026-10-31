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
import { GearShop } from "../battle/GearPanel";
import { fetchProfile, sendProfileAction } from "../battle/online";
import { PROFILE_ERROR } from "../battle/ProgressPanel";
import ShopPanel from "../battle/ShopPanel";
import { SceneLink } from "../SceneContext";

type Tab = "heroes" | "gear" | "items";
const TABS: readonly { id: Tab; name: string }[] = [
  { id: "heroes", name: "Tướng" },
  { id: "gear", name: "Trang bị" },
  { id: "items", name: "Vật phẩm" },
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
    <main className="ui-screen px-2 py-4 sm:px-4">
      <div className="relative mx-auto max-w-6xl rounded-2xl border-4 border-[#c79a4a] bg-[#1d1511] p-3 pt-10 shadow-[0_0_0_2px_#3b2a1d,0_12px_40px_#000c] sm:p-4 sm:pt-12">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-xl border-4 border-[#c79a4a] bg-gradient-to-b from-[#fbf3df] to-[#e6d3a7] px-8 py-1.5 shadow-[0_4px_0_#0006] sm:px-12">
          <h1 className="text-lg font-black tracking-[0.2em] text-[#5a1e14] sm:text-xl">CỬA HÀNG</h1>
        </div>
        <SceneLink
          scene="MENU"
          aria-label="Đóng, về màn chính"
          className="absolute -top-4 -right-3 flex size-10 items-center justify-center rounded-full border-4 border-amber-200 bg-gradient-to-b from-rose-500 to-red-800 text-xl font-black text-white shadow-[0_3px_0_#0007]"
        >
          ✕
        </SceneLink>

        {!profile ? (
          <p className="py-24 text-center text-foreground-secondary">
            {loadError ? "Không tải được hồ sơ, thử tải lại trang." : "Đang mở cửa hàng…"}
          </p>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="rounded-full border border-amber-500/50 bg-black/40 px-3 py-1 text-sm font-semibold text-amber-200">
                Vàng: {profile.gold}
              </p>
              {message && (
                <p role="alert" className="text-sm text-rose-300">
                  {message}
                </p>
              )}
            </div>

            <div className="mb-3 grid grid-cols-3 gap-2" role="tablist" aria-label="Mục cửa hàng">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-md border-2 px-2 py-1.5 text-sm font-bold tracking-wide shadow-[0_2px_0_#0006] ${
                    tab === t.id
                      ? "border-amber-200 bg-gradient-to-b from-amber-300 to-amber-600 text-stone-950"
                      : "border-[#c79a4a] bg-gradient-to-b from-[#8f2f1f] to-[#5a1e14] text-amber-100 hover:from-[#a33a26]"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            {tab === "heroes" && <ShopPanel profile={profile} locked={busy} onAction={act} />}

            {tab === "gear" && (
              <section aria-label="Cửa hàng trang bị" className="rounded-lg bg-[var(--panel)] p-2 text-xs">
                <h2 className="mb-2 font-semibold">Trang bị</h2>
                <GearShop profile={profile} disabled={busy} onBuy={(a) => void act(a)} />
              </section>
            )}

            {tab === "items" && <ItemsTab profile={profile} busy={busy} onAction={act} />}
          </>
        )}
      </div>
    </main>
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
    <section aria-label="Vật phẩm" className="rounded-lg bg-[var(--panel)] p-3 text-sm">
      <h2 className="mb-1 font-semibold">Lương thực</h2>
      <p className="mb-2 text-xs text-foreground-secondary">
        Lương mang vào trận Bình Loạn kế tiếp. Có {supply}/{CAMPAIGN_FOOD_MAX}; mỗi phần giá {FOOD_PRICE} vàng.
      </p>
      {room <= 0 ? (
        <p className="text-xs text-foreground-secondary">Kho lương đã đầy.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((n) => (
            <button
              key={n}
              type="button"
              disabled={busy || affordable < n}
              onClick={() => void onAction({ type: "buyFood", amount: n })}
              className="min-h-11 rounded bg-amber-500 px-3 font-semibold text-stone-950 disabled:opacity-35"
            >
              Mua {n} lương ({n * FOOD_PRICE} vàng)
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
