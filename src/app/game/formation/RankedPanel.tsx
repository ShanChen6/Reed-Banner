"use client";

// Khu Xếp hạng của Trận Đồ: ba bậc có bảng (Thường, Khó, Đại trận), ván của mình, top 10 và thưởng chờ nhận.
// Dữ liệu từ GET /api/formation; điểm, hạng và thưởng do server tính.

import { REWARD_GOLD, REWARD_TIERS, rulesetById } from "@/core/binh-phap";
import type { LevelOverview, Overview } from "./rankedClient";

const TIER_LABEL = Object.fromEntries(REWARD_TIERS.map((t) => [t.tier, t.label])) as Record<string, string>;
const CADENCE_TEXT = { day: "Kỳ theo ngày", week: "Kỳ theo tuần" } as const;
const FIRST_ROWS = 5;

function status(l: LevelOverview): { text: string; action: string; disabled: boolean } {
  const m = l.mine;
  if (!m) return { text: "Chưa chơi kỳ này", action: "Chơi tính hạng", disabled: false };
  if (m.status === "playing") return { text: "Đang chơi dở", action: "Tiếp tục", disabled: false };
  if (m.status === "won") return { text: `Đã thắng: ${m.score} điểm${m.rank ? `, hạng ${m.rank}` : ""}`, action: "Xem ván", disabled: false };
  return { text: "Đã thua, không vào bảng", action: "Xem ván", disabled: false };
}

export default function RankedPanel({
  overview,
  busy,
  note,
  onPlay,
  onClaim,
}: {
  overview: Overview;
  busy: boolean;
  note: string;
  onPlay: (level: string) => void;
  onClaim: (level: string, period: string) => void;
}) {
  const pending = overview.levels.flatMap((l) => l.claimable);
  return (
    <section aria-labelledby="tran-do-ranked" className="flex flex-col gap-4">
      <header>
        <p className="text-xs font-semibold tracking-[0.25em] text-[var(--atlas-gold)] uppercase">Có thưởng</p>
        <h1 id="tran-do-ranked" className="atlas-title font-serif text-3xl font-bold">Trận Đồ · Xếp hạng</h1>
        <p className="mt-1 max-w-2xl text-[15px] text-[var(--atlas-ink-on-wood)]/90">
          Mỗi kỳ mỗi bậc chỉ một ván, cả kỳ ai cũng gặp cùng một bàn cờ. Thắng mới có hạng; điểm cao hơn, rồi ít nước hơn, rồi nộp sớm hơn thì đứng trên. Thưởng nhận sau khi kỳ khép lại.
        </p>
      </header>

      <p role="status" aria-live="polite" className="min-h-6 text-[15px] text-[var(--atlas-title)]">{note}</p>

      {pending.length > 0 && (
        <section aria-label="Thưởng chờ nhận" className="atlas-frame atlas-frame-wood p-4">
          <h2 className="mb-2 font-serif text-xl font-bold text-[var(--atlas-title)]">Thưởng chờ nhận</h2>
          <ul className="flex flex-col gap-2">
            {pending.map((c) => (
              <li key={`${c.level}-${c.period}`} className="flex flex-wrap items-center justify-between gap-2 text-[15px]">
                <span>
                  {rulesetById(c.level)?.name} · kỳ {c.period}: hạng {c.rank}/{c.winners} ({TIER_LABEL[c.tier]}) · <b>{c.gold} vàng</b>
                </span>
                <button type="button" onClick={() => onClaim(c.level, c.period)} className="home-cta min-h-11 rounded-lg px-5 font-serif font-bold">Nhận</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ul className="grid gap-4 lg:grid-cols-3">
        {overview.levels.map((l) => {
          const rules = rulesetById(l.level);
          const s = status(l);
          const gold = REWARD_GOLD[l.level];
          return (
            <li key={l.level} className="atlas-frame atlas-frame-wood flex flex-col gap-3 p-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[var(--atlas-title)]">{rules?.name}</h2>
                <p className="text-sm text-[var(--atlas-muted)]">{CADENCE_TEXT[l.cadence]} {l.period} · {l.winners} người đã thắng</p>
              </div>
              <p className="text-[15px]">{s.text}</p>
              <button
                type="button"
                disabled={busy || s.disabled}
                onClick={() => onPlay(l.level)}
                className="home-cta min-h-12 rounded-lg px-4 font-serif font-bold disabled:opacity-60"
              >
                {s.action}
              </button>
              {gold && (
                <p className="text-sm text-[var(--atlas-muted)]">
                  Thưởng: hạng nhất {gold.top1} vàng · thắng ván {gold.win} vàng
                </p>
              )}
              <details>
                <summary className="cursor-pointer font-serif font-semibold text-[var(--atlas-title)]">Bảng xếp hạng</summary>
                {l.top.length === 0 ? (
                  <p className="mt-2 text-sm text-[var(--atlas-muted)]">Chưa có ai thắng trong kỳ này.</p>
                ) : (
                  <ol className="mt-2 flex flex-col gap-1 text-[15px]">
                    {l.top.slice(0, FIRST_ROWS * 2).map((r) => (
                      <li key={r.rank} className={`flex justify-between gap-2 ${r.mine ? "font-bold text-[var(--atlas-gold)]" : ""}`}>
                        <span>{r.rank}. {r.name}</span>
                        <span>{r.score} đ · {r.turns} nước</span>
                      </li>
                    ))}
                  </ol>
                )}
              </details>
            </li>
          );
        })}
      </ul>
      <details className="atlas-frame atlas-frame-wood p-4">
        <summary className="cursor-pointer font-serif font-bold text-[var(--atlas-title)]">Bảng thưởng theo hạng</summary>
        <p className="mt-2 text-sm text-[var(--atlas-muted)]">Mỗi người nhận đúng một bậc theo hạng cuối kỳ. Bảng ít người vẫn có thưởng; nửa trên tính làm tròn lên.</p>
        <table className="mt-2 w-full text-left text-[15px]">
          <thead>
            <tr className="text-[var(--atlas-muted)]">
              <th className="py-1 pr-2 font-normal">Bậc</th>
              {REWARD_TIERS.map((t) => <th key={t.tier} className="py-1 pr-2 font-normal">{t.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {overview.levels.map((l) => (
              <tr key={l.level}>
                <th scope="row" className="py-1 pr-2 text-left font-semibold">{rulesetById(l.level)?.name}</th>
                {REWARD_TIERS.map((t) => <td key={t.tier} className="py-1 pr-2">{REWARD_GOLD[l.level]?.[t.tier]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
