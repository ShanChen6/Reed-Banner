"use client";

// M22 "Giang Sơn Một Mối": hồ sơ 12 sứ quân đọc từ thế cục hồ sơ server. Mỗi hồ sơ nêu vùng, nhiệm vụ đã giải
// quyết, nhóm kết cục, cách kể và độ tin cậy; không có trận hay thanh máu.

import {
  campaignWorldLedger,
  companionById,
  storyNodeById,
  type CampaignLedgerGroup,
  type CampaignProgressV2,
} from "@/core";
import { METHOD_TEXT } from "./RouteSummary";

const GROUP_NAME: Readonly<Record<CampaignLedgerGroup, string>> = {
  alliance: "Liên minh",
  submission: "Theo về (quy phục)",
  military: "Đánh dẹp",
  uncertain: "Tan rã / còn tranh luận",
};

const CONFIDENCE_TEXT = {
  high: "cao",
  medium: "vừa",
  mediumLow: "vừa đến thấp",
} as const;

export default function FactionDossiers({
  campaign,
}: {
  campaign: CampaignProgressV2;
}) {
  const ledger = campaignWorldLedger(campaign.factions);
  return (
    <section
      aria-labelledby="dossiers-title"
      className="rounded-xl border border-amber-500/30 bg-black/30 p-3 text-sm"
    >
      <h3 id="dossiers-title" className="font-semibold text-amber-200">
        Hồ sơ 12 sứ quân · {ledger.resolvedCount}/12 có kết cục
      </h3>
      <p className="mb-2 text-xs text-stone-400">
        Đọc từ thế cục đã ghi trong hồ sơ của bạn. Nhãn độ tin cậy theo bảng
        nguồn của game.
      </p>
      <ol className="grid gap-1.5 sm:grid-cols-2">
        {ledger.rows.map(({ resolution: r, view }) => {
          const node = storyNodeById(r.mission);
          return (
            <li key={r.faction}>
              <details className="rounded-md border border-white/10 bg-black/30 p-2">
                <summary className="cursor-pointer font-semibold text-amber-50">
                  {companionById(r.faction)?.name ?? r.faction}
                  <span className="ml-1 text-xs font-normal text-stone-400">
                    · {GROUP_NAME[r.group]}
                  </span>
                </summary>
                <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 text-xs text-stone-300">
                  <dt className="text-stone-500">Vùng</dt>
                  <dd>
                    {node?.location.name}
                    {node?.location.modernRegion
                      ? ` (nay ${node.location.modernRegion})`
                      : ""}
                  </dd>
                  <dt className="text-stone-500">Nhiệm vụ</dt>
                  <dd>
                    {r.mission} · {node?.title}
                  </dd>
                  <dt className="text-stone-500">Kết cục</dt>
                  <dd>
                    {view.resolved
                      ? (METHOD_TEXT[view.resolutionMethod] ?? view.status)
                      : "chưa có kết cục"}
                  </dd>
                  <dt className="text-stone-500">Độ tin cậy</dt>
                  <dd>{CONFIDENCE_TEXT[r.confidence]}</dd>
                </dl>
              </details>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
