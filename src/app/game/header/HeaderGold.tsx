"use client";

// Vàng hiện có ở thanh header, cạnh avatar. Đọc từ hồ sơ trên server (/api/profile, khách cũng có hồ sơ), tải lại
// mỗi khi đổi phân cảnh và khi màn nào đó báo hồ sơ đổi (sự kiện PROFILE_GOLD_EVENT từ battle/online.ts), nên
// mua bán, nhận thưởng xong là số cập nhật. Chưa tải được thì không hiện gì, không bày số giả.

import { useEffect, useState } from "react";
import { fetchProfile, PROFILE_GOLD_EVENT } from "../battle/online";
import type { Scene } from "../scene";

const FORMAT = new Intl.NumberFormat("vi-VN");

export default function HeaderGold({ scene }: { scene: Scene }) {
  const [gold, setGold] = useState<number | null>(null);

  useEffect(() => {
    let live = true;
    void fetchProfile().then((r) => {
      if (live && r.profile) setGold(r.profile.gold);
    });
    return () => {
      live = false;
    };
  }, [scene]);

  useEffect(() => {
    const onGold = (e: Event) => setGold((e as CustomEvent<number>).detail);
    window.addEventListener(PROFILE_GOLD_EVENT, onGold);
    return () => window.removeEventListener(PROFILE_GOLD_EVENT, onGold);
  }, []);

  if (gold === null) return null;
  const text = FORMAT.format(gold);
  return (
    <p title={`Vàng: ${text}`} className="game-header-chip game-header-gold flex h-9 shrink-0 items-center gap-1 rounded-full pr-2.5 pl-1 md:pr-3 font-serif text-sm font-semibold tabular-nums md:h-10 md:gap-2 md:pr-4 md:text-base">
      <CoinGlyph />
      <span className="sr-only">Vàng: </span>
      {text}
    </p>
  );
}

function CoinGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-6 shrink-0 md:size-8">
      <defs>
        <radialGradient id="hdr-coin" cx="38%" cy="32%" r="70%">
          <stop offset="0" stopColor="#ffe9a8" />
          <stop offset="0.55" stopColor="#d9a441" />
          <stop offset="1" stopColor="#8a5a1c" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="9.5" fill="url(#hdr-coin)" stroke="#5c3a12" strokeWidth={0.8} />
      <circle cx="12" cy="12" r="6.6" fill="none" stroke="#8a5a1c" strokeWidth={0.9} />
      <rect x="10" y="10" width="4" height="4" fill="#6b4416" />
    </svg>
  );
}
