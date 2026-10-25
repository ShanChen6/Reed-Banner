"use client";

// Sổ thế cục 12 vùng: nhóm kết cục theo ledger đã duyệt (1 liên minh, 3 quy phục, 6 đánh dẹp, 2 tan rã/còn tranh
// luận). Chỉ đọc thế cục hồ sơ server; không đếm "12 trận thắng" và không gộp các loại kết cục với nhau.

import {
  CAMPAIGN_LEDGER_EXPECTED,
  CAMPAIGN_LEDGER_GROUPS,
  CAMPAIGN_UNIFICATION_NODE,
  campaignWorldLedger,
  companionById,
  type CampaignLedgerGroup,
  type CampaignProgressV2,
} from "@/core";
import { METHOD_TEXT } from "./RouteSummary";

const GROUP_NAME: Readonly<Record<CampaignLedgerGroup, string>> = {
  alliance: "Liên minh",
  submission: "Quy phục",
  military: "Đánh dẹp",
  uncertain: "Tan rã / còn tranh luận",
};

const CONFIDENCE_TEXT = {
  high: "độ tin cậy cao",
  medium: "độ tin cậy vừa",
  mediumLow: "độ tin cậy vừa đến thấp",
} as const;

export default function WorldLedger({
  campaign,
}: {
  campaign: CampaignProgressV2;
}) {
  const ledger = campaignWorldLedger(campaign.factions);
  if (ledger.resolvedCount === 0) return null;
  return (
    <section
      aria-labelledby="world-ledger-title"
      className="rounded-xl border border-white/10 bg-black/25 p-3 text-sm"
    >
      <h3
        id="world-ledger-title"
        className="mb-1 text-xs tracking-widest text-amber-300/80 uppercase"
      >
        Sổ thế cục 12 vùng · {ledger.resolvedCount}/12 có kết cục
      </h3>
      <ul className="mb-2 grid grid-cols-2 gap-1 text-xs">
        {CAMPAIGN_LEDGER_GROUPS.map((group) => (
          <li
            key={group}
            className="rounded border border-white/10 bg-black/30 px-2 py-1"
          >
            <span className="font-bold text-amber-50">
              {ledger.resolved[group]}/{CAMPAIGN_LEDGER_EXPECTED[group]}
            </span>{" "}
            <span className="text-stone-300">{GROUP_NAME[group]}</span>
          </li>
        ))}
      </ul>
      {CAMPAIGN_LEDGER_GROUPS.map((group) => (
        <div key={group} className="mb-1">
          <p className="text-xs font-semibold text-amber-200">
            {GROUP_NAME[group]}
          </p>
          <ul className="flex flex-col gap-0.5">
            {ledger.rows
              .filter((row) => row.resolution.group === group)
              .map(({ resolution: r, view }) => (
                <li
                  key={r.faction}
                  className="flex justify-between gap-2 text-xs"
                >
                  <span className="shrink-0">
                    {companionById(r.faction)?.name ?? r.faction}
                  </span>
                  <span className="text-right text-stone-400">
                    {view.resolved
                      ? `${METHOD_TEXT[view.resolutionMethod] ?? view.status} · ${CONFIDENCE_TEXT[view.confidence]} · ${view.mission}`
                      : `chưa có kết cục · ${r.mission}`}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      ))}
      <p className="mt-2 text-xs text-stone-300">
        {ledger.allResolved
          ? `Đủ 12 vùng có kết cục; ${CAMPAIGN_UNIFICATION_NODE} đã có thể mở. Đây là bốn loại kết cục khác nhau, không phải mười hai trận thắng.`
          : `${CAMPAIGN_UNIFICATION_NODE} chỉ mở khi đủ 12 vùng có kết cục. Còn thiếu: ${ledger.missingMissions.join(", ")}.`}
      </p>
    </section>
  );
}
