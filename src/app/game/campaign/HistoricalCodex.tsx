"use client";

// Sử ký trong game (CAMP-08.02). Hai khối:
// - MissionSources: panel "Sử liệu" ở khung chi tiết nhiệm vụ — nhãn, mốc có ghi chép, điểm còn tranh luận, sứ quân
//   liên quan, nguồn kèm đường dẫn, và phần nào là cơ chế game.
// - WarlordCodex: "Sứ quân ký" 12 hồ sơ, mở dần theo tiến độ server ghi để không lộ nội dung chưa tới.
// Mọi câu ở đây là tóm tắt của sổ nguồn (docs/02-game-modes/campaign/history-sources.md), không phải lời nhân vật hay trích
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
      className="text-info underline decoration-info/50 underline-offset-2 hover:text-on-wood focus-visible:ring-2 focus-visible:ring-info focus-visible:outline-none"
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
        <li key={s.id} className="text-caption text-on-wood-soft">
          <span className="font-mono text-on-wood-soft/80">{s.id}</span>{" "}
          <ExternalLink href={s.url}>{s.title}</ExternalLink>
          <span className="block text-on-wood-soft">
            {s.publisher} · {KIND_TEXT[s.kind]} · chỗ cần xem: {s.locator}
          </span>
          <span className="block text-on-wood-soft/80">Giới hạn: {s.limits}</span>
        </li>
      ))}
    </ul>
  );
}

export function MissionSources({ nodeId }: { nodeId: CampaignMissionId }) {
  const h = missionHistory(nodeId);
  return (
    <details className="rounded-md border border-info/40 bg-info/10 p-2 text-sm">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 rounded font-semibold text-info focus-visible:ring-2 focus-visible:ring-info focus-visible:outline-none">
        Sử liệu
        <span className="text-caption font-normal text-on-wood-soft">
          sự kiện, nguồn và phần game dựng
        </span>
      </summary>
      <div className="mt-2 flex flex-col gap-3">
        <p className="text-caption text-on-wood-soft">
          Đây là ghi chú nguồn của game, tóm tắt theo sổ nguồn, không phải lời
          nhân vật và không phải trích nguyên văn.
        </p>

        <section aria-label="Loại nội dung">
          <h3 className="mb-1 text-caption font-semibold text-info">
            Nhiệm vụ này gồm
          </h3>
          <ul className="flex flex-col gap-1">
            {h.basis.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2 text-caption text-on-wood-soft"
              >
                <BasisBadge basis={b} />
                <span>{BASIS_LABEL[b].hint}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-caption text-on-wood-soft">
            Địa danh: {h.location.name} ({CERTAINTY_TEXT[h.location.certainty]})
            {h.location.modernRegion
              ? ` · ngày nay: ${h.location.modernRegion}`
              : ""}
          </p>
        </section>

        {h.claims.length > 0 && (
          <section aria-label="Mốc có ghi chép">
            <h3 className="mb-1 text-caption font-semibold text-info">
              Sự kiện theo sổ nguồn
            </h3>
            <ul className="flex flex-col gap-1.5">
              {h.claims.map((c) => (
                <li key={c.id} className="rounded bg-wood-inset p-2 text-caption">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    {c.basis.map((b) => (
                      <BasisBadge key={b} basis={b} />
                    ))}
                    <span className="text-on-wood-soft/80">
                      {c.id} · độ tin cậy {CONFIDENCE_TEXT[c.confidence]} ·
                      nguồn {c.sources.join(", ")}
                    </span>
                  </div>
                  <p className="text-on-wood">{c.summary}</p>
                  <p className="mt-0.5 text-on-wood-soft">Lưu ý: {c.caveat}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {h.unresolved.length > 0 && (
          <section aria-label="Điểm còn tranh luận">
            <h3 className="mb-1 text-caption font-semibold text-danger">
              Còn tranh luận hoặc chưa rõ
            </h3>
            <ul className="flex flex-col gap-1.5">
              {h.unresolved.map((u) => (
                <li key={u.id} className="rounded bg-wood-inset p-2 text-caption">
                  <p className="text-on-wood">
                    <span className="text-on-wood-soft/80">{u.id} · </span>
                    {u.question}
                  </p>
                  <p className="mt-0.5 text-on-wood-soft">
                    Game chọn: {u.decision}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {h.warlords.length > 0 && (
          <section aria-label="Sứ quân liên quan">
            <h3 className="mb-1 text-caption font-semibold text-info">
              Sứ quân liên quan
            </h3>
            <ul className="flex flex-col gap-1.5">
              {h.warlords.map((w) => (
                <li key={w.id} className="rounded bg-wood-inset p-2 text-caption">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    {w.outcomeBasis.map((b) => (
                      <BasisBadge key={b} basis={b} />
                    ))}
                    <span className="font-semibold text-title-on-wood">
                      {w.name}
                    </span>
                    <span className="text-on-wood-soft">({w.title})</span>
                  </div>
                  <p className="text-on-wood-soft">{w.outcome}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {h.sources.length > 0 && (
          <section aria-label="Nguồn tham khảo">
            <h3 className="mb-1 text-caption font-semibold text-info">
              Nguồn tham khảo
            </h3>
            <SourceList sources={h.sources} />
          </section>
        )}

        <section aria-label="Phần do game dựng">
          <h3 className="mb-1 text-caption font-semibold text-on-wood">
            Phần do game dựng
          </h3>
          <ul className="list-disc pl-5 text-caption text-on-wood-soft">
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
      className="rounded-xl border border-frame-line-soft bg-wood-inset p-3 text-sm"
    >
      <h2 id="warlord-codex-title" className="font-semibold text-frame-gold">
        Sứ quân ký · {known}/12 hồ sơ đã mở
      </h2>
      <p className="mb-2 text-caption text-on-wood-soft">
        Hồ sơ mở khi nhiệm vụ của sứ quân đó mở; kết cục chỉ hiện khi bạn đã đi
        qua.
      </p>
      {/* Chỉ liệt kê hồ sơ đã mở (không hiện hàng khóa "W01 … W12 chưa gặp", Shan yêu cầu 07/11/2026). */}
      {known === 0 ? (
        <p className="ui-frame-inset p-3 text-center text-on-wood-soft">
          Chưa có hồ sơ sứ quân nào. Hồ sơ đầu tiên mở khi bạn tới nhiệm vụ của một sứ quân.
        </p>
      ) : (
        <ol className="grid gap-2 sm:grid-cols-2">
          {entries
            .filter((e) => e.stage !== "unknown")
            .map(({ record: w, resolution: r, stage, location }) => (
              <li
                key={w.id}
                className="rounded-md border border-frame-line-soft bg-wood-inset p-2"
              >
                <details>
                  <summary className="flex min-h-11 cursor-pointer flex-wrap items-center gap-x-1.5 font-semibold text-on-wood focus-visible:ring-2 focus-visible:ring-frame-gold focus-visible:outline-none">
                    {w.name}
                    <span className="text-caption font-normal text-on-wood-soft">
                      · {location.name} ·{" "}
                      {stage === "resolved"
                        ? GROUP_TEXT[r.group]
                        : "chưa có kết cục"}
                    </span>
                  </summary>
                  <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-caption text-on-wood-soft">
                    <dt className="text-on-wood-soft/80">Danh hiệu</dt>
                    <dd>
                      {w.title}
                      {w.aliases.length > 0
                        ? ` (còn chép: ${w.aliases.join(", ")})`
                        : ""}
                    </dd>
                    <dt className="text-on-wood-soft/80">Vùng</dt>
                    <dd>
                      {location.name}
                      {location.modernRegion
                        ? ` · ngày nay: ${location.modernRegion}`
                        : ""}
                    </dd>
                    <dt className="text-on-wood-soft/80">Nhiệm vụ</dt>
                    <dd>{r.mission}</dd>
                    <dt className="text-on-wood-soft/80">Kết cục</dt>
                    <dd>
                      {stage === "resolved" ? (
                        <>
                          {w.outcome}{" "}
                          <span className="text-on-wood-soft/80">
                            (game kể: {METHOD_TEXT[r.settlement] ?? r.settlement})
                          </span>
                        </>
                      ) : (
                        "Chưa hiện: đi qua nhiệm vụ để mở."
                      )}
                    </dd>
                    <dt className="text-on-wood-soft/80">Nguồn</dt>
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
              </li>
            ))}
        </ol>
      )}
    </section>
  );
}
