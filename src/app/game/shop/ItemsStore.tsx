"use client";

// Quầy Vật phẩm của Cửa Hàng (Shan 19/11/2026): lưới thẻ nhỏ, mỗi vật phẩm một thẻ (biểu tượng riêng, tên, giá, số đang
// có, mô tả ngắn, nút mua theo gói) để thêm vật phẩm mới vẫn gọn. Danh mục ở ../items/catalog.ts; lương còn ghi tinh
// thần theo mức lương (moraleOf, MORALE_DAMAGE của @/core).

import { MORALE_DAMAGE, moraleOf, type Morale, type Profile, type ProfileAction } from "@/core";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { ItemIcon } from "../art/items";
import { ITEMS, type ItemDef } from "../items/catalog";

const MORALE_NAME: Record<Morale, string> = { eager: "Hăng hái", normal: "Bình thường", hungry: "Đói", starving: "Cạn lương" };

const damageText = (m: Morale) => {
  const pct = Math.round((MORALE_DAMAGE[m] - 1) * 100);
  return pct === 0 ? "sát thương giữ nguyên" : `sát thương ${pct > 0 ? "+" : ""}${pct}%`;
};

function ItemCard({ item, profile, busy, onAction }: { item: ItemDef; profile: Profile; busy: boolean; onAction: (a: ProfileAction) => void }) {
  const have = item.have(profile);
  const room = item.max - have;
  const affordable = Math.floor(profile.gold / item.price);
  // Gói mua: 1, 10 và vừa đầy (lương) — bỏ gói trùng hoặc vượt chỗ trống.
  const packs = [1, 10, ...(item.id === "food" ? [room] : [])].filter((n, i, a) => n > 0 && n <= room && a.indexOf(n) === i);
  const morale = item.id === "food" ? moraleOf(have) : null;
  return (
    <li className="ui-frame-inset flex flex-col gap-2 p-3">
      <div className="flex items-center gap-3">
        <ItemIcon id={item.id} className="size-12 shrink-0" />
        <div className="min-w-0 flex-1">
          <h2 className="ui-title-on-wood truncate font-serif text-base font-bold">{item.name}</h2>
          <p className="text-caption text-on-wood-soft tabular-nums">
            {item.price} vàng / {item.unit} · đang có <b className="text-on-wood">{have}</b>
            {item.id === "food" && `/${item.max}`}
          </p>
        </div>
      </div>
      <p className="text-caption text-on-wood-soft">{item.text}</p>
      {morale && (
        <p className={cn("text-caption", morale === "eager" ? "text-frame-gold" : morale === "normal" ? "text-on-wood-soft" : "text-danger")}>
          {MORALE_NAME[morale]} · {damageText(morale)}
        </p>
      )}
      <div className="mt-auto flex flex-wrap gap-1.5">
        {room <= 0 ? (
          <span className="text-caption text-on-wood-soft">Đã đầy.</span>
        ) : (
          packs.map((n) => (
            <Button
              key={n}
              type="button"
              size="sm"
              variant={n === 1 ? "primary" : "secondary"}
              disabled={busy || affordable < n}
              title={affordable < n ? `Cần ${n * item.price} vàng` : undefined}
              aria-label={`Mua ${n} ${item.unit} ${item.name}, ${n * item.price} vàng`}
              onClick={() => onAction(item.buy(n))}
              className="tabular-nums"
            >
              {item.id === "food" && n === room && n > 10 ? "Đầy" : `+${n}`} · {n * item.price}
            </Button>
          ))
        )}
      </div>
    </li>
  );
}

export default function ItemsStore({ profile, busy, onAction }: { profile: Profile; busy: boolean; onAction: (a: ProfileAction) => void }) {
  return (
    <section aria-label="Vật phẩm">
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ITEMS.map((it) => (
          <ItemCard key={it.id} item={it} profile={profile} busy={busy} onAction={onAction} />
        ))}
      </ul>
    </section>
  );
}
