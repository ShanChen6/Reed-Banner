"use client";

// Tổng kết một tuyến địa lý (Chương IV tây, Chương V đông): kết cục từng vùng, số lượt tốt nhất của trận và các
// vùng còn thiếu trước Đỗ Động. Chỉ đọc hồ sơ server; xem lại hay đánh lại không đổi tiến độ.

import {
  campaignFinaleGate,
  campaignRouteSummary,
  companionById,
  missionLabel,
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

export default function RouteSummary({
  campaign,
  routeId,
  onPick,
}: {
  campaign: CampaignProgressV2;
  routeId: CampaignRoute["id"];
  onPick: (id: CampaignMissionId) => void;
}) {
  const { route, regions, complete } = campaignRouteSummary(campaign, routeId);
  const gate = campaignFinaleGate(campaign);
  const other = gate.missing.filter((id) => !route.missions.includes(id));
  const done = regions.filter((r) => r.state === "completed").length;
  return (
    <section
      aria-labelledby={`route-${route.id}`}
      className={`atlas-frame atlas-frame-paper flex flex-col gap-2 p-3 ${complete ? "atlas-route-done" : ""}`}
    >
      <AtlasCorners />
      <h2 id={`route-${route.id}`} className="font-bold">
        {complete
          ? `Tổng kết ${route.name.toLowerCase()}`
          : `${route.name}: ${done}/${regions.length} vùng`}
      </h2>
      <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
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
                {r.place} · {r.mission}
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
      </ul>
      {complete && (
        <p className="atlas-muted text-xs">
          Xem lại nhiệm vụ không ghi thêm gì. Đánh lại trận chỉ nhận thưởng trận
          thường; thưởng nhiệm vụ và thế cục sứ quân đã ghi một lần.
        </p>
      )}
      <p className="atlas-muted text-xs">
        {gate.ready
          ? "Hai tuyến đã xong: Đỗ Động đã mở."
          : other.length > 0
            ? `Đỗ Động mở khi xong cả hai tuyến. Tuyến còn lại thiếu: ${other.map(missionLabel).join(", ")}.`
            : "Đỗ Động mở khi xong cả hai tuyến."}
      </p>
    </section>
  );
}
