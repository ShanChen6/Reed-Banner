"use client";

// Tab Vật phẩm của Cửa Hàng: mỗi vật phẩm một thẻ (hình, mô tả, số đang có, nút mua theo gói). Hiện chỉ có lương
// cho Bình Loạn; giá, mức chứa và tinh thần theo lương nằm trong @/core (FOOD_PRICE, CAMPAIGN_FOOD_MAX, moraleOf).

import {
  CAMPAIGN_FOOD_MAX,
  FOOD_PRICE,
  MORALE_DAMAGE,
  moraleOf,
  type Morale,
  type Profile,
  type ProfileAction,
} from "@/core";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

const MORALE_NAME: Record<Morale, string> = {
  eager: "Hăng hái",
  normal: "Bình thường",
  hungry: "Đói",
  starving: "Cạn lương",
};

const damageText = (m: Morale) => {
  const pct = Math.round((MORALE_DAMAGE[m] - 1) * 100);
  return pct === 0 ? "sát thương giữ nguyên" : `sát thương ${pct > 0 ? "+" : ""}${pct}%`;
};

function FoodCard({ profile, busy, onAction }: { profile: Profile; busy: boolean; onAction: (a: ProfileAction) => void }) {
  const supply = profile.campaign.supply;
  const room = CAMPAIGN_FOOD_MAX - supply;
  const affordable = Math.floor(profile.gold / FOOD_PRICE);
  const morale = moraleOf(supply);
  // Gói mua: 1, 10 và vừa đầy kho; bỏ gói trùng hoặc vượt chỗ trống.
  const packs = [1, 10, room].filter((n, i, a) => n > 0 && n <= room && a.indexOf(n) === i);
  return (
    <li className="ui-frame-inset flex flex-col gap-3 p-3 sm:flex-row sm:items-start">
      <svg viewBox="0 0 96 96" aria-hidden focusable="false" className="size-20 shrink-0 self-center sm:size-24 sm:self-start">
        <image href="/art/tiles/banhChung.webp" width={96} height={96} />
      </svg>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <h2 className="ui-title-on-wood text-title">Lương thực</h2>
          <span className="text-caption text-on-wood-soft tabular-nums">{FOOD_PRICE} vàng / phần</span>
        </div>
        <p className="text-caption text-on-wood-soft">
          Mang vào trận Bình Loạn kế tiếp. Lương quyết định tinh thần: từ 70 trở lên Hăng hái ({damageText("eager")}),
          dưới 30 là Đói ({damageText("hungry")}), hết lương {damageText("starving")}.
        </p>
        <div>
          <div className="mb-1 flex justify-between text-caption tabular-nums">
            <span className="text-on-wood">Kho {supply}/{CAMPAIGN_FOOD_MAX}</span>
            <span className={cn(morale === "eager" ? "text-frame-gold" : morale === "normal" ? "text-on-wood-soft" : "text-danger")}>
              {MORALE_NAME[morale]} · {damageText(morale)}
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Lương trong kho"
            aria-valuemin={0}
            aria-valuemax={CAMPAIGN_FOOD_MAX}
            aria-valuenow={supply}
            className="relative h-2.5 overflow-hidden rounded-full bg-wood-lo ring-1 ring-frame-gold/30"
          >
            <div className="h-full bg-frame-gold" style={{ width: `${(supply / CAMPAIGN_FOOD_MAX) * 100}%` }} />
            {/* Vạch mốc Hăng hái (70). */}
            <span aria-hidden className="absolute inset-y-0 left-[70%] w-px bg-on-wood/60" />
          </div>
        </div>
        {room <= 0 ? (
          <p className="text-caption text-on-wood-soft">Kho lương đã đầy.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {packs.map((n) => (
              <Button
                key={n}
                type="button"
                size="sm"
                variant={n === room ? "primary" : "secondary"}
                disabled={busy || affordable < n}
                title={affordable < n ? `Cần ${n * FOOD_PRICE} vàng` : undefined}
                onClick={() => onAction({ type: "buyFood", amount: n })}
                className="min-h-11 tabular-nums"
              >
                {n === room && n > 10 ? "Đầy kho" : `+${n}`} · {n * FOOD_PRICE} vàng
              </Button>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

export default function ItemsStore({
  profile,
  busy,
  onAction,
}: {
  profile: Profile;
  busy: boolean;
  onAction: (a: ProfileAction) => void;
}) {
  return (
    <section aria-label="Vật phẩm">
      {/* Lưới để thêm vật phẩm mới sau này: mỗi vật phẩm một thẻ. */}
      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <FoodCard profile={profile} busy={busy} onAction={onAction} />
      </ul>
    </section>
  );
}
