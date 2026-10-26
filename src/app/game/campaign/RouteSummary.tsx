"use client";

// Tổng kết một tuyến địa lý (Chương IV tây, Chương V đông): kết cục từng vùng, số lượt tốt nhất của trận và các
// vùng còn thiếu trước Đỗ Động. Chỉ đọc hồ sơ server; xem lại hay đánh lại không đổi tiến độ.

import {
  CAMPAIGN_ROUTES,
  campaignFinaleGate,
  campaignRouteSummary,
  companionById,
  missionLabel,
  storyNodeById,
  type CampaignMissionId,
  type CampaignProgressV2,
  type CampaignRoute,
} from "@/core";
import { AtlasCorners } from "./AtlasFrame";
import { FACTION_STATUS_TEXT } from "./StoryBeats";

const FOCUS =
  "focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-none";

/** Kết cục kèm cách kể, theo phân loại ledger (resolutionMethod). */
export const METHOD_TEXT: Readonly<Record<string, string>> = {
  alliance: "liên minh, có sử chép",
  recordedSubmission: "quy phục, có sử chép",
  reconstructedAccord: "quy phục qua hội đàm do game tái dựng",
  politicalAccord: "quy phục qua thỏa thuận chính trị tái dựng",
  regionalAccession: "vùng theo về theo tổng thuật, còn tranh luận",
  dispersal: "tan rã theo tổng thuật",
  campaign: "đánh dẹp theo tổng thuật",
};

/** Một tuyến: tên, tiến độ và từng vùng. `active` khi tuyến thuộc chương đang xem. */
function RouteColumn({
  campaign,
  routeId,
  active,
  onPick,
}: {
  campaign: CampaignProgressV2;
  routeId: CampaignRoute["id"];
  active: boolean;
  onPick: (id: CampaignMissionId) => void;
}) {
  const { route, regions, complete } = campaignRouteSummary(campaign, routeId);
  const done = regions.filter((r) => r.state === "completed").length;
  return (
    <section
      aria-labelledby={`route-${route.id}`}
      aria-current={active ? "true" : undefined}
      className={`atlas-route flex flex-col gap-2 rounded-lg border p-2.5 ${active ? "atlas-route-active" : ""} ${complete ? "atlas-route-done" : ""}`}
    >
      <h3
        id={`route-${route.id}`}
        className="flex items-baseline justify-between gap-2 font-bold"
      >
        <span>
          {route.name}
          <span className="atlas-muted ml-1.5 text-xs font-normal">
            Chương {ROUTE_ROMAN[route.chapter]}
          </span>
        </span>
        <span className="text-sm">
          {complete ? "✓ " : ""}
          {done}/{regions.length} vùng
        </span>
      </h3>
      <ol className="grid gap-1.5 text-sm xl:grid-cols-2">
        {regions.map((r) => (
          <li key={r.mission}>
            <button
              type="button"
              disabled={r.state === "locked"}
              onClick={() => onPick(r.mission)}
              className={`atlas-mission flex min-h-11 w-full flex-col items-start rounded-md border px-2 py-1 text-left disabled:cursor-not-allowed ${FOCUS}`}
            >
              <span className="font-semibold">
                {r.state === "completed" ? "✓ " : ""}
                {regionName(r.place, r.mission)}
              </span>
              <span className="atlas-muted text-xs">
                {r.faction?.resolved
                  ? `${companionById(r.faction.faction)?.name ?? r.faction.faction}: ${METHOD_TEXT[r.faction.resolutionMethod] ?? FACTION_STATUS_TEXT[r.faction.status].toLowerCase()}`
                  : r.state === "open"
                    ? "Đang mở"
                    : r.state === "locked"
                      ? "Chưa mở"
                      : "Đã xong"}
                {r.bestTurns !== undefined
                  ? ` · tốt nhất ${r.bestTurns} lượt`
                  : ""}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Tên vùng kèm tên nhiệm vụ; bỏ phần lặp khi tên nhiệm vụ đã chứa tên đất (vd. "Siêu Loại"). */
function regionName(place: string, mission: CampaignMissionId) {
  const title = missionLabel(mission);
  return title.includes(place) ? title : `${place} · ${title}`;
}

const ROUTE_ROMAN = ["", "I", "II", "III", "IV", "V", "VI"] as const;

/**
 * Hai tuyến tây và đông đi song song sau Chương III, gặp nhau ở Đỗ Động: Đỗ Động mở khi xong vùng cuối của cả hai
 * tuyến (prereqs của node). Tuyến của chương đang xem được viền nổi; mọi trạng thái đọc từ hồ sơ server.
 */
export default function RouteSummary({
  campaign,
  chapter,
  onPick,
}: {
  campaign: CampaignProgressV2;
  /** Chương đang xem, để làm nổi tuyến của chương đó. */
  chapter: number;
  onPick: (id: CampaignMissionId) => void;
}) {
  const gate = campaignFinaleGate(campaign);
  const allDone = CAMPAIGN_ROUTES.every(
    (r) => campaignRouteSummary(campaign, r.id).complete,
  );
  const finale = storyNodeById("M21")!;
  const finaleDone = campaign.completed.includes(finale.id);
  return (
    <section
      aria-labelledby="route-board-title"
      className="atlas-frame atlas-frame-paper flex flex-col gap-2 p-3"
    >
      <AtlasCorners />
      <h2 id="route-board-title" className="px-1 font-bold">
        Hai tuyến hội quân
      </h2>
      <div className="grid gap-2 md:grid-cols-2">
        {CAMPAIGN_ROUTES.map((r) => (
          <RouteColumn
            key={r.id}
            campaign={campaign}
            routeId={r.id}
            active={r.chapter === chapter}
            onPick={onPick}
          />
        ))}
      </div>
      {/* Điểm hội: hai tuyến cùng dẫn tới Đỗ Động. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-sm">
        <span aria-hidden className="atlas-muted">
          Tây + Đông →
        </span>
        <button
          type="button"
          disabled={!gate.ready}
          onClick={() => onPick(finale.id)}
          className={`atlas-mission flex min-h-11 items-center gap-2 rounded-md border px-3 py-1 font-semibold disabled:cursor-not-allowed ${FOCUS}`}
        >
          {finaleDone ? "✓ " : gate.ready ? "" : "🔒 "}
          {finale.title}
        </button>
        <span className="atlas-muted min-w-0 flex-1 text-xs">
          {finaleDone
            ? "Đã qua Đỗ Động."
            : gate.ready
              ? "Hai tuyến đã xong: Đỗ Động đã mở."
              : `Mở khi xong cả hai tuyến. Còn thiếu: ${gate.missing.map(missionLabel).join(", ")}.`}
        </span>
      </div>
      {allDone && (
        <p className="atlas-muted px-1 text-xs">
          Xem lại nhiệm vụ không ghi thêm gì. Đánh lại trận chỉ nhận thưởng trận
          thường; thưởng nhiệm vụ và thế cục sứ quân đã ghi một lần.
        </p>
      )}
    </section>
  );
}
