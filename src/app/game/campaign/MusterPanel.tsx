"use client";

// Hội quân Hoa Lư: tổng kết giai đoạn chính trị khi server đã ghi đủ Chương III. Không phải nhiệm vụ, không có
// thưởng hay trận; chỉ đọc hồ sơ server để duyệt đội, lương, thế cục sứ quân và mở hai tuyến địa lý theo freeze.

import {
  CAMPAIGN_FACTION_RESOLUTIONS,
  CAMPAIGN_FOOD_MAX,
  FOOD_PRICE,
  campaignFactionTally,
  campaignMissionsRemaining,
  campaignRouteStatus,
  companionById,
  missionCopy,
  missionLabel,
  type CampaignMissionId,
  type Profile,
  type ProfileAction,
} from "@/core";
import { BasisBadge, FACTION_STATUS_TEXT } from "./StoryBeats";

const FOCUS =
  "focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-none";

export default function MusterPanel({
  profile,
  busy,
  onAction,
  onPick,
}: {
  profile: Profile;
  busy: boolean;
  onAction: (a: ProfileAction) => void;
  onPick: (id: CampaignMissionId) => void;
}) {
  const campaign = profile.campaign;
  const tally = campaignFactionTally(campaign);
  const remaining = campaignMissionsRemaining(campaign);
  const routes = campaignRouteStatus(campaign);
  const missingFood = CAMPAIGN_FOOD_MAX - campaign.supply;
  const buy = Math.min(missingFood, Math.floor(profile.gold / FOOD_PRICE));
  const resolved = CAMPAIGN_FACTION_RESOLUTIONS.filter(
    (r) => campaign.factions[r.faction],
  );

  return (
    <section
      aria-labelledby="muster-title"
      className="flex flex-col gap-3 rounded-xl border-2 border-[var(--gold)] bg-[#2a1f19]/90 p-4"
    >
      <header>
        <p className="text-xs tracking-widest text-amber-300/80 uppercase">
          Tổng kết Chương III · Hội quân Hoa Lư
        </p>
        <h2 id="muster-title" className="text-xl font-black text-amber-100">
          Giai đoạn hội kiến khép lại
        </h2>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-stone-300">
          <BasisBadge basis="reconstructed" />
          Cảnh hội quân do game dựng để tổng kết, không phải sự kiện có ngày
          tháng trong sử. Đây không phải nhiệm vụ: không có trận, không có
          thưởng thêm.
        </p>
      </header>

      <div>
        <h3 className="text-sm font-semibold text-amber-200">
          Thế cục sứ quân
        </h3>
        <ul className="mt-1 grid grid-cols-2 gap-1.5 text-sm sm:grid-cols-5">
          {(
            [
              ["Liên minh", tally.allied],
              ["Quy phục", tally.submitted],
              ["Tan rã", tally.dispersed],
              ["Đánh dẹp", tally.defeated],
              ["Chưa có kết cục", tally.unresolved],
            ] as const
          ).map(([label, n]) => (
            <li
              key={label}
              className="rounded-md border border-white/10 bg-black/30 p-2"
            >
              <span className="block text-lg font-black text-amber-50">
                {n}
                <span className="text-xs font-normal text-stone-400">/12</span>
              </span>
              <span className="text-xs text-stone-300">{label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-1 text-xs text-stone-300">
          {resolved
            .map(
              (r) =>
                `${companionById(r.faction)?.name ?? r.faction}: ${FACTION_STATUS_TEXT[r.status].toLowerCase()} (${r.mission})`,
            )
            .join(" · ")}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-white/10 bg-black/25 p-2 text-sm">
          <h3 className="font-semibold text-amber-200">Đội hình</h3>
          <p className="text-stone-200">
            Đinh Bộ Lĩnh cấp {profile.main.level}
          </p>
          <ul className="text-stone-300">
            {profile.team.map((id) => (
              <li key={id}>
                {companionById(id)?.name ?? id} cấp{" "}
                {profile.companions[id]?.level ?? 1}
              </li>
            ))}
          </ul>
          {campaign.unlockedHeroes.length > 0 && (
            <p className="mt-1 text-xs text-emerald-300">
              Đồng hành đã mở khóa:{" "}
              {campaign.unlockedHeroes
                .map((id) => companionById(id)?.name ?? id)
                .join(", ")}
            </p>
          )}
          <p className="mt-1 text-xs text-stone-400">
            Đổi đội ở mục Đội hình & cửa hàng.
          </p>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-2 text-sm">
          <h3 className="font-semibold text-amber-200">Tài nguyên</h3>
          <p className="text-stone-200">
            {profile.gold} vàng · {campaign.supply}/{CAMPAIGN_FOOD_MAX} lương
          </p>
          {missingFood > 0 && (
            <button
              type="button"
              disabled={busy || buy <= 0}
              onClick={() => onAction({ type: "buyFood", amount: buy })}
              className={`mt-1 min-h-11 rounded bg-amber-500 px-3 font-semibold text-stone-950 disabled:opacity-35 ${FOCUS}`}
            >
              Mua {buy} lương ({buy * FOOD_PRICE} vàng)
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-amber-200">
          Hai tuyến đã mở
        </h3>
        <p className="text-xs text-stone-400">
          Đi tuyến nào trước là lựa chọn chơi, không phải thứ tự lịch sử. Sử
          không ghi trình tự giải quyết từng nơi. Cả hai tuyến phải xong mới tới
          Đỗ Động.
        </p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {routes.map(({ route, open, done, next }) => {
            const ready = !!next && !!missionCopy(next);
            return (
              <li
                key={route.id}
                className="flex flex-col gap-1 rounded-lg border border-white/15 bg-black/30 p-2 text-sm"
              >
                <p className="font-bold text-amber-50">
                  {route.name} · Chương {route.chapter === 4 ? "IV" : "V"}
                </p>
                <p className="text-stone-300">
                  {done}/{route.missions.length} nhiệm vụ ·{" "}
                  {open ? "đã mở" : "chưa mở"}
                </p>
                {next && (
                  <button
                    type="button"
                    disabled={!ready}
                    onClick={() => onPick(next)}
                    className={`min-h-11 rounded border border-amber-400/60 bg-amber-500/15 px-3 text-left font-semibold text-amber-100 disabled:cursor-not-allowed disabled:opacity-45 ${FOCUS}`}
                  >
                    {ready ? "Tới " : "Sắp có: "}
                    {missionLabel(next)}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <details className="text-sm">
        <summary
          className={`flex min-h-11 cursor-pointer items-center font-semibold text-amber-200 ${FOCUS}`}
        >
          Còn {remaining.length}/24 nhiệm vụ cho chiến dịch toàn quốc
        </summary>
        <ul className="mt-1 grid gap-0.5 text-xs text-stone-300 sm:grid-cols-2">
          {remaining.map((id) => (
            <li key={id}>{missionLabel(id)}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
