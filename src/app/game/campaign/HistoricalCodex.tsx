"use client";

// Sử ký trong game (CAMP-08.02). Hai khối:
// - MissionSources: panel "Sử liệu" ở khung chi tiết nhiệm vụ — nhãn, mốc có ghi chép, điểm còn tranh luận, sứ quân
//   liên quan, nguồn kèm đường dẫn, và phần nào là cơ chế game.
// - WarlordCodex: "Sứ quân ký" 12 hồ sơ, mở dần theo tiến độ server ghi để không lộ nội dung chưa tới.
// Mọi câu ở đây là tóm tắt của sổ nguồn (docs/campaign-v2/history-sources.md), không phải lời nhân vật hay trích
// nguyên văn.

import {
  BASIS_LABEL,
  historySource,
  missionHistory,
  warlordCodex,
  type CampaignMissionId,
  type CampaignProgressV2,
  type HistoryConfidence,
  type HistorySource,
} from "@/core";
import { BasisBadge } from "./StoryBeats";
import { METHOD_TEXT } from "./RouteSummary";

const CONFIDENCE_TEXT: Readonly<Record<HistoryConfidence, string>> = {
  high: "cao",
  medium: "vừa",
  mediumLow: "vừa đến thấp",
  low: "thấp",
};

const KIND_TEXT: Readonly<Record<HistorySource["kind"], string>> = {
  officialHistory: "chính sử",
  synthesis: "sử tổng hợp",
  modernSummary: "tổng thuật hiện đại",
};

const CERTAINTY_TEXT = {
  recorded: "địa danh có sử chép",
  traditional: "định vị theo truyền thống",
  disputed: "vị trí còn tranh luận",
  fictional: "địa điểm do game dựng",
} as const;

/** Liên kết ra trang ngoài: mở thẻ mới, không cho trang đích điều khiển trang game. */
function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer external"
      referrerPolicy="no-referrer"
      className="text-sky-300 underline decoration-sky-500/50 underline-offset-2 hover:text-sky-200 focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-none"
    >
      {children}
      <span aria-hidden> ↗</span>
      <span className="sr-only"> (mở trang ngoài trong thẻ mới)</span>
    </a>
  );
}

function SourceList({ sources }: { sources: readonly HistorySource[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {sources.map((s) => (
        <li key={s.id} className="text-xs text-stone-300">
          <span className="font-mono text-stone-500">{s.id}</span>{" "}
          <ExternalLink href={s.url}>{s.title}</ExternalLink>
          <span className="block text-stone-400">
            {s.publisher} · {KIND_TEXT[s.kind]} · chỗ cần xem: {s.locator}
          </span>
          <span className="block text-stone-500">Giới hạn: {s.limits}</span>
        </li>
      ))}
    </ul>
  );
}

export function MissionSources({ nodeId }: { nodeId: CampaignMissionId }) {
  const h = missionHistory(nodeId);
  return (
    <details className="rounded-md border border-sky-400/40 bg-sky-950/30 p-2 text-sm">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 rounded font-semibold text-sky-200 focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-none">
        Sử liệu
        <span className="text-xs font-normal text-stone-400">
          sự kiện, nguồn và phần game dựng
        </span>
      </summary>
      <div className="mt-2 flex flex-col gap-3">
        <p className="text-xs text-stone-400">
          Đây là ghi chú nguồn của game, tóm tắt theo sổ nguồn, không phải lời
          nhân vật và không phải trích nguyên văn.
        </p>

        <section aria-label="Loại nội dung">
          <h3 className="mb-1 text-xs font-semibold text-sky-100">
            Nhiệm vụ này gồm
          </h3>
          <ul className="flex flex-col gap-1">
            {h.basis.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2 text-xs text-stone-300"
              >
                <BasisBadge basis={b} />
                <span>{BASIS_LABEL[b].hint}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-stone-400">
            Địa danh: {h.location.name} ({CERTAINTY_TEXT[h.location.certainty]})
            {h.location.modernRegion
              ? ` · ngày nay: ${h.location.modernRegion}`
              : ""}
          </p>
        </section>

        {h.claims.length > 0 && (
          <section aria-label="Mốc có ghi chép">
            <h3 className="mb-1 text-xs font-semibold text-sky-100">
              Sự kiện theo sổ nguồn
            </h3>
            <ul className="flex flex-col gap-1.5">
              {h.claims.map((c) => (
                <li key={c.id} className="rounded bg-black/25 p-2 text-xs">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    {c.basis.map((b) => (
                      <BasisBadge key={b} basis={b} />
                    ))}
                    <span className="text-stone-500">
                      {c.id} · độ tin cậy {CONFIDENCE_TEXT[c.confidence]} ·
                      nguồn {c.sources.join(", ")}
                    </span>
                  </div>
                  <p className="text-stone-200">{c.summary}</p>
                  <p className="mt-0.5 text-stone-400">Lưu ý: {c.caveat}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {h.unresolved.length > 0 && (
          <section aria-label="Điểm còn tranh luận">
            <h3 className="mb-1 text-xs font-semibold text-rose-200">
              Còn tranh luận hoặc chưa rõ
            </h3>
            <ul className="flex flex-col gap-1.5">
              {h.unresolved.map((u) => (
                <li key={u.id} className="rounded bg-black/25 p-2 text-xs">
                  <p className="text-stone-200">
                    <span className="text-stone-500">{u.id} · </span>
                    {u.question}
                  </p>
                  <p className="mt-0.5 text-stone-400">
                    Game chọn: {u.decision}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {h.warlords.length > 0 && (
          <section aria-label="Sứ quân liên quan">
            <h3 className="mb-1 text-xs font-semibold text-sky-100">
              Sứ quân liên quan
            </h3>
            <ul className="flex flex-col gap-1.5">
              {h.warlords.map((w) => (
                <li key={w.id} className="rounded bg-black/25 p-2 text-xs">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    {w.outcomeBasis.map((b) => (
                      <BasisBadge key={b} basis={b} />
                    ))}
                    <span className="font-semibold text-amber-100">
                      {w.name}
                    </span>
                    <span className="text-stone-400">({w.title})</span>
                  </div>
                  <p className="text-stone-300">{w.outcome}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {h.sources.length > 0 && (
          <section aria-label="Nguồn tham khảo">
            <h3 className="mb-1 text-xs font-semibold text-sky-100">
              Nguồn tham khảo
            </h3>
            <SourceList sources={h.sources} />
          </section>
        )}

        <section aria-label="Phần do game dựng">
          <h3 className="mb-1 text-xs font-semibold text-stone-200">
            Phần do game dựng
          </h3>
          <ul className="list-disc pl-5 text-xs text-stone-300">
            {h.fiction.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      </div>
    </details>
  );
}

const GROUP_TEXT = {
  alliance: "Liên minh",
  submission: "Theo về (quy phục)",
  military: "Đánh dẹp",
  uncertain: "Tan rã / còn tranh luận",
} as const;

export default function WarlordCodex({
  campaign,
}: {
  campaign: CampaignProgressV2;
}) {
  const entries = warlordCodex(campaign);
  const known = entries.filter((e) => e.stage !== "unknown").length;
  return (
    <section
      aria-labelledby="warlord-codex-title"
      className="rounded-xl border border-amber-500/30 bg-black/30 p-3 text-sm"
    >
      <h2 id="warlord-codex-title" className="font-semibold text-amber-200">
        Sứ quân ký · {known}/12 hồ sơ đã mở
      </h2>
      <p className="mb-2 text-xs text-stone-400">
        Hồ sơ mở khi nhiệm vụ của sứ quân đó mở; kết cục chỉ hiện khi bạn đã đi
        qua. Số thứ tự là của sổ nguồn, không phải thứ tự đánh dẹp.
      </p>
      <ol className="grid gap-2 sm:grid-cols-2">
        {entries.map(({ record: w, resolution: r, stage, location }) => (
          <li
            key={w.id}
            className="rounded-md border border-white/10 bg-black/30 p-2"
          >
            {stage === "unknown" ? (
              <p className="text-stone-500">
                <span className="font-mono">{w.id}</span> · Chưa gặp. Hồ sơ mở
                khi tới nhiệm vụ của vùng này.
              </p>
            ) : (
              <details>
                <summary className="flex min-h-11 cursor-pointer flex-wrap items-center gap-x-1.5 font-semibold text-amber-50 focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-none">
                  <span className="font-mono text-xs text-stone-500">
                    {w.id}
                  </span>
                  {w.name}
                  <span className="text-xs font-normal text-stone-400">
                    · {location.name} ·{" "}
                    {stage === "resolved"
                      ? GROUP_TEXT[r.group]
                      : "chưa có kết cục"}
                  </span>
                </summary>
                <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-xs text-stone-300">
                  <dt className="text-stone-500">Danh hiệu</dt>
                  <dd>
                    {w.title}
                    {w.aliases.length > 0
                      ? ` (còn chép: ${w.aliases.join(", ")})`
                      : ""}
                  </dd>
                  <dt className="text-stone-500">Vùng</dt>
                  <dd>
                    {location.name}
                    {location.modernRegion
                      ? ` · ngày nay: ${location.modernRegion}`
                      : ""}
                  </dd>
                  <dt className="text-stone-500">Nhiệm vụ</dt>
                  <dd>{r.mission}</dd>
                  <dt className="text-stone-500">Kết cục</dt>
                  <dd>
                    {stage === "resolved" ? (
                      <>
                        {w.outcome}{" "}
                        <span className="text-stone-500">
                          (game kể: {METHOD_TEXT[r.settlement] ?? r.settlement})
                        </span>
                      </>
                    ) : (
                      "Chưa hiện: đi qua nhiệm vụ để mở."
                    )}
                  </dd>
                  <dt className="text-stone-500">Nguồn</dt>
                  <dd className="flex flex-wrap gap-x-2">
                    {w.sources.map((id) => {
                      const s = historySource(id);
                      return s ? (
                        <ExternalLink key={id} href={s.url}>
                          {id}
                        </ExternalLink>
                      ) : null;
                    })}
                  </dd>
                </dl>
              </details>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
