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
import { buttonVariants } from "@/components/ui";
import { BasisBadge, FACTION_STATUS_TEXT } from "./StoryBeats";

const FOCUS =
  "focus-visible:ring-2 focus-visible:ring-frame-gold focus-visible:outline-none";

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
      className="flex flex-col gap-3 rounded-xl border-2 border-frame-gold bg-wood/90 p-4"
    >
      <header>
        <p className="text-kicker text-frame-gold">
          Tổng kết Chương III · Hội quân Hoa Lư
        </p>
        <h2 id="muster-title" className="text-xl font-black text-title-on-wood">
          Giai đoạn hội kiến khép lại
        </h2>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-on-wood-soft">
          <BasisBadge basis="reconstructed" />
          Cảnh hội quân do game dựng để tổng kết, không phải sự kiện có ngày
          tháng trong sử. Đây không phải nhiệm vụ: không có trận, không có
          thưởng thêm.
        </p>
      </header>

      <div>
        <h3 className="text-sm font-semibold text-frame-gold">
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
              <span className="block text-lg font-black text-on-wood">
                {n}
                <span className="text-caption font-normal text-on-wood-soft">/12</span>
              </span>
              <span className="text-caption text-on-wood-soft">{label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-1 text-caption text-on-wood-soft">
          {resolved
            .map(
              (r) =>
                `${companionById(r.faction)?.name ?? r.faction}: ${FACTION_STATUS_TEXT[r.status].toLowerCase()}`,
            )
            .join(" · ")}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-white/10 bg-black/25 p-2 text-sm">
          <h3 className="font-semibold text-frame-gold">Đội hình</h3>
          <p className="text-on-wood">
            Đinh Bộ Lĩnh cấp {profile.main.level}
          </p>
          <ul className="text-on-wood-soft">
            {profile.team.map((id) => (
              <li key={id}>
                {companionById(id)?.name ?? id} cấp{" "}
                {profile.companions[id]?.level ?? 1}
              </li>
            ))}
          </ul>
          {campaign.unlockedHeroes.length > 0 && (
            <p className="mt-1 text-caption text-jade">
              Đồng hành đã mở khóa:{" "}
              {campaign.unlockedHeroes
                .map((id) => companionById(id)?.name ?? id)
                .join(", ")}
            </p>
          )}
          <p className="mt-1 text-caption text-on-wood-soft">
            Đổi đội ở mục Đội hình & cửa hàng.
          </p>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-2 text-sm">
          <h3 className="font-semibold text-frame-gold">Tài nguyên</h3>
          <p className="text-on-wood">
            {profile.gold} vàng · {campaign.supply}/{CAMPAIGN_FOOD_MAX} lương
          </p>
          {missingFood > 0 && (
            <button
              type="button"
              disabled={busy || buy <= 0}
              onClick={() => onAction({ type: "buyFood", amount: buy })}
              className={buttonVariants({ size: "sm", className: "mt-1 min-h-11" })}
            >
              Mua {buy} lương ({buy * FOOD_PRICE} vàng)
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-frame-gold">
          Hai tuyến đã mở
        </h3>
        <p className="text-caption text-on-wood-soft">
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
                <p className="font-bold text-on-wood">
                  {route.name} · Chương {route.chapter === 4 ? "IV" : "V"}
                </p>
                <p className="text-on-wood-soft">
                  {done}/{route.missions.length} nhiệm vụ ·{" "}
                  {open ? "đã mở" : "chưa mở"}
                </p>
                {next && (
                  <button
                    type="button"
                    disabled={!ready}
                    onClick={() => onPick(next)}
                    className={buttonVariants({ variant: "secondary", size: "sm", className: "min-h-11 justify-start text-left" })}
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
          className={`flex min-h-11 cursor-pointer items-center font-semibold text-frame-gold ${FOCUS}`}
        >
          Còn {remaining.length}/24 nhiệm vụ cho chiến dịch toàn quốc
        </summary>
        <ul className="mt-1 grid gap-0.5 text-caption text-on-wood-soft sm:grid-cols-2">
          {remaining.map((id) => (
            <li key={id}>{missionLabel(id)}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
