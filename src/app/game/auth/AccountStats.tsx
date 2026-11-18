"use client";

// Dải chỉ số của trang Tài khoản: đọc hồ sơ (vàng, đá, tướng quân, cấp chủ tướng, trận thắng) để người chơi thấy tài
// khoản đang giữ những gì. Hồ sơ chưa tải thì giữ chỗ bằng dấu "…" để bố cục không nhảy.

import { useProfile } from "../profile/useProfile";

export function AccountStats() {
  const { profile, loadError } = useProfile();
  const stats: readonly { label: string; value: string }[] = [
    { label: "Vàng", value: profile ? profile.gold.toLocaleString("vi-VN") : "…" },
    { label: "Đá Cường Hóa", value: profile ? String(profile.stones) : "…" },
    { label: "Tướng quân", value: profile ? String(Object.keys(profile.companions).length + 1) : "…" },
    { label: "Cấp chủ tướng", value: profile ? String(profile.main.level) : "…" },
    { label: "Trận thắng", value: profile ? String(profile.quests.totals.win ?? 0) : "…" },
  ];
  if (loadError) return <p className="text-sm text-on-wood-soft">Chưa mở được hồ sơ. Xin tải lại trang.</p>;
  return (
    <dl className="grid grid-cols-3 gap-2 sm:grid-cols-5" aria-label="Tài sản trong trại">
      {stats.map((s) => (
        <div key={s.label} className="ui-frame-inset flex flex-col gap-0.5 px-3 py-2">
          <dt className="text-caption text-on-wood-soft">{s.label}</dt>
          <dd className="text-lg font-bold tabular-nums text-title-on-wood">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
