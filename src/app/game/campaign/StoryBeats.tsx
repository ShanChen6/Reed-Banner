"use client";

// Khối lời kể dùng chung cho màn Chiến dịch và màn hội kiến: nhãn nguồn, đoạn kể, cảnh dựng, ghi chú sử.

import {
  BASIS_LABEL,
  SOURCE_TITLE,
  missionCopy,
  type CampaignChoiceTone,
  type CampaignFactionStatus,
  type StoryBeat,
} from "@/core";

const BASIS_STYLE: Record<StoryBeat["basis"], string> = {
  recorded: "border-sky-400/60 bg-sky-500/15 text-sky-100",
  legend: "border-violet-400/60 bg-violet-500/15 text-violet-100",
  reconstructed: "border-amber-400/60 bg-amber-500/10 text-amber-100",
  fictional: "border-stone-400/50 bg-stone-500/15 text-stone-200",
  disputed: "border-rose-400/60 bg-rose-500/10 text-rose-100",
};

export function BasisBadge({ basis }: { basis: StoryBeat["basis"] }) {
  return (
    <span
      title={BASIS_LABEL[basis].hint}
      className={`inline-block shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${BASIS_STYLE[basis]}`}
    >
      {BASIS_LABEL[basis].name}
    </span>
  );
}

export function Beats({ beats }: { beats: readonly StoryBeat[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {beats.map((b, i) => {
        const sources = (b.refs ?? []).filter((r) => r.startsWith("S"));
        return (
          <li key={i} className="rounded-md bg-black/25 p-2 text-sm">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <BasisBadge basis={b.basis} />
              {b.speaker && (
                <span className="text-xs text-stone-400">
                  Thoại của {b.speaker}, không phải trích dẫn sử
                </span>
              )}
            </div>
            <p
              className={b.speaker ? "text-amber-50" : "text-stone-200 italic"}
            >
              {b.speaker && (
                <span className="font-semibold text-amber-300 not-italic">
                  {b.speaker}:{" "}
                </span>
              )}
              {b.speaker ? `“${b.text}”` : b.text}
            </p>
            {b.refs && b.refs.length > 0 && (
              <p className="mt-1 text-[11px] text-stone-400">
                Nguồn: {b.refs.join(", ")}
                {sources.length > 0 &&
                  ` · ${sources.map((s) => SOURCE_TITLE[s] ?? s).join("; ")}`}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export const TONE_TEXT: Record<CampaignChoiceTone, string> = {
  protective: "Che chở",
  pragmatic: "Thực tế",
  resolute: "Cứng rắn",
};

export const FACTION_STATUS_TEXT: Record<CampaignFactionStatus, string> = {
  allied: "Liên minh",
  submitted: "Quy phục",
  dispersed: "Tan rã",
  defeated: "Đánh dẹp",
};

/** Cảnh dựng mở màn: khung riêng, luôn là lời game. */
export function Cinematic({ nodeId }: { nodeId: string }) {
  const beats = missionCopy(nodeId)?.cinematic;
  if (!beats?.length) return null;
  return (
    <figure className="rounded-lg border border-amber-500/30 bg-gradient-to-b from-black/50 to-[#3a2a1c]/60 p-3">
      <figcaption className="mb-1 text-[10px] tracking-widest text-amber-300/70 uppercase">
        Cảnh dựng · game sáng tác
      </figcaption>
      {beats.map((b, i) => (
        <p key={i} className="font-serif text-sm text-amber-50/90 italic">
          {b.text}
        </p>
      ))}
    </figure>
  );
}

export function SourceNotes({
  nodeId,
  label = "Ghi chú nguồn",
}: {
  nodeId: string;
  label?: string;
}) {
  const notes = missionCopy(nodeId)?.sourceNotes;
  if (!notes?.length) return null;
  return (
    <details className="rounded-md border border-sky-400/30 bg-sky-500/5 p-2 text-sm">
      <summary className="flex min-h-11 cursor-pointer items-center rounded font-semibold text-sky-200 focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-none">
        {label}
      </summary>
      <div className="mt-2 flex flex-col gap-3">
        {notes.map((n) => (
          <section key={n.title}>
            <h3 className="mb-1 text-xs font-semibold text-sky-100">
              {n.title}
            </h3>
            <Beats beats={n.beats} />
          </section>
        ))}
      </div>
    </details>
  );
}
