"use client";

// Màn chọn chế độ Trận Đồ. Mỗi bậc là một tấm bản đồ: thẻ xếp hạng hiện bản đồ của kỳ mờ sương (lộ dần theo tiến độ), đồng hồ
// kỳ, hạng hiện tại và thang thưởng; thẻ chơi thường dẫn vào ván ngẫu nhiên. Có hai tab (Xếp hạng, Chơi thường) khi xếp
// hạng đang mở, và bộ sưu tập địa danh đã khai thông.

import { useEffect, useRef, useState } from "react";
import { REWARD_GOLD, REWARD_TIERS, RULESETS, rewardGold, type Ruleset } from "@/core/binh-phap";
import { SceneLink } from "../SceneContext";
import CustomForm from "./CustomForm";
import { MAP_POOL, mapFor } from "./maps";
import MapCard from "./MapCard";
import type { LevelOverview, Overview } from "./rankedClient";
import RewardLadder from "./RewardLadder";
import Rules from "./Rules";
import { formatRemaining } from "./time";

const TIER_LABEL = Object.fromEntries(REWARD_TIERS.map((t) => [t.tier, t.label])) as Record<string, string>;
const CADENCE = { day: "Kỳ theo ngày", week: "Kỳ theo tuần" } as const;

function Heading({ title, sub }: { title: string; sub: string }) {
  return (
    <header>
      <p className="text-xs font-semibold tracking-[0.25em] text-[var(--atlas-gold)] uppercase">{sub}</p>
      <h1 className="atlas-title font-serif text-3xl font-bold">{title}</h1>
    </header>
  );
}

/**
 * Thời gian hiện tại theo giờ server (ms), cập nhật mỗi 20 giây; 0 trước khi chạy ở client (tránh lệch hydration). Gọi
 * `onExpire` một lần cho mỗi kỳ vừa hết để tải lại bảng.
 */
function useServerNow(overview: Overview | null, onExpire: () => void): number {
  const [now, setNow] = useState(0);
  const offset = useRef(0);
  const fired = useRef<Set<number>>(new Set());
  useEffect(() => {
    offset.current = overview?.now ? overview.now - Date.now() : 0;
    setNow(Date.now() + offset.current);
  }, [overview]);
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now() + offset.current), 20_000);
    return () => window.clearInterval(t);
  }, []);
  useEffect(() => {
    if (now === 0) return;
    for (const l of overview?.levels ?? []) {
      if (l.endsAt <= now && !fired.current.has(l.endsAt)) {
        fired.current.add(l.endsAt);
        onExpire();
      }
    }
  }, [now, overview, onExpire]);
  return now;
}

function progressOf(l: LevelOverview): number {
  const m = l.mine;
  if (!m) return 0;
  if (m.status === "won") return 1;
  const playable = m.puzzle.cells.filter((c) => !c.blocked).length;
  return playable === 0 ? 0 : m.puzzle.coveredCount / playable;
}

function RankedCard({ l, now, busy, canPlay, onPlay }: { l: LevelOverview; now: number; busy: boolean; canPlay: boolean; onPlay: (level: string) => void }) {
  const rules = RULESETS.find((r) => r.id === l.level);
  const map = mapFor(l.level, l.theme);
  const m = l.mine;
  const reveal = progressOf(l);
  const reward = m?.status === "won" && m.rank ? rewardGold(l.level, m.rank, l.winners) : null;
  const action = !m ? "Chơi tính hạng" : m.status === "playing" ? "Tiếp tục" : "Xem ván";
  const status = !m
    ? "Chưa chơi kỳ này. Mỗi kỳ chỉ một ván."
    : m.status === "playing"
      ? `Đang chơi dở: đã khai thông ${Math.round(reveal * 100)}%.`
      : m.status === "won"
        ? `Đã thắng: ${m.score} điểm.`
        : "Đã thua, không vào bảng xếp hạng.";
  return (
    <li className="home-mode atlas-frame atlas-frame-wood flex flex-col">
      <MapCard map={map} reveal={reveal} hidden={!m} caption={CADENCE[l.cadence]} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-serif text-xl font-bold text-[var(--atlas-title)]">{rules?.name}</h3>
          <span className="text-sm text-[var(--atlas-muted)]">{rules?.randomSize ? `cỡ ${rules.randomSize.min}–${rules.randomSize.max}` : `${rules?.width}×${rules?.height}`}</span>
        </div>
        <p className="text-sm text-[var(--atlas-muted)]">
          Còn <b className="text-[var(--atlas-title)]">{now ? formatRemaining(l.endsAt - now) : "…"}</b> · {l.winners} người đã thắng
        </p>
        <p className="text-[15px]">{status}</p>
        {reward && m?.rank && (
          <p className="rounded border border-[#C9A25A]/50 bg-[#C9A25A]/15 px-3 py-1.5 text-[15px]">
            Hạng <b>{m.rank}/{l.winners}</b> ({TIER_LABEL[reward.tier]}) · thưởng dự kiến <b>{reward.gold} vàng</b>
            <span className="block text-xs text-[var(--atlas-muted)]">Hạng có thể đổi tới hết kỳ; thưởng nhận khi kỳ khép lại.</span>
          </p>
        )}
        <RewardLadder level={l.level} rank={m?.status === "won" ? (m.rank ?? null) : null} winners={l.winners} />
        <button type="button" disabled={busy || !canPlay} onClick={() => onPlay(l.level)} className="home-cta mt-auto min-h-12 rounded-lg px-4 font-serif font-bold disabled:opacity-60">
          {canPlay ? action : "Đăng nhập để chơi"}
        </button>
        <details>
          <summary className="cursor-pointer font-serif font-semibold text-[var(--atlas-title)]">Bảng xếp hạng ({l.top.length})</summary>
          {l.top.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--atlas-muted)]">Chưa có ai thắng trong kỳ này.</p>
          ) : (
            <ol className="mt-2 flex flex-col gap-1 text-[15px]">
              {l.top.slice(0, 10).map((r) => (
                <li key={r.rank} className={`flex justify-between gap-2 ${r.mine ? "font-bold text-[var(--atlas-gold)]" : ""}`}>
                  <span className="truncate">{r.rank}. {r.name}</span>
                  <span className="shrink-0">{r.score} đ · {r.turns} nước</span>
                </li>
              ))}
            </ol>
          )}
        </details>
      </div>
    </li>
  );
}

function PracticeCard({ rules, best, theme, onStart }: { rules: Ruleset; best: number; theme: number; onStart: (r: Ruleset) => void }) {
  const map = mapFor(rules.id, theme);
  return (
    <li>
      <button type="button" aria-label={`${rules.name}: chơi thường. ${rules.blurb}`} onClick={() => onStart(rules)} className="home-mode atlas-frame atlas-frame-wood flex w-full flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--atlas-gold)]">
        <MapCard map={map} reveal={best > 0 ? 1 : 0.4} hidden caption="Bản đồ đổi mỗi ván" />
        <span className="flex flex-col gap-1 p-4">
          <span className="font-serif text-xl font-bold text-[var(--atlas-title)]">{rules.name}</span>
          <span className="text-[15px] leading-snug text-[var(--atlas-ink-on-wood)]/90">{rules.blurb}</span>
          <span className="text-sm text-[var(--atlas-muted)]">
            {rules.randomSize ? `cỡ ngẫu nhiên ${rules.randomSize.min}–${rules.randomSize.max}` : `${rules.width}×${rules.height}`} · {rules.professions.length} nghề × {rules.elements.length} hệ{rules.obstaclePercent > 0 ? " · có chướng ngại" : ""}
            {best ? ` · Điểm cao nhất ${best}` : ""}
          </span>
        </span>
      </button>
    </li>
  );
}

function Collection({ collected }: { collected: readonly string[] }) {
  return (
    <details className="atlas-frame atlas-frame-wood p-4">
      <summary className="cursor-pointer font-serif text-lg font-bold text-[var(--atlas-title)]">
        Bộ sưu tập địa danh: {collected.length}/{MAP_POOL.length}
      </summary>
      <p className="mt-1 text-sm text-[var(--atlas-muted)]">Khai thông trọn một sa bàn để thêm địa danh của bản đồ đó (ván chơi thường hay xếp hạng đều tính). Lưu ở máy này.</p>
      <ul className="mt-2 grid grid-cols-2 gap-1.5 text-[15px] sm:grid-cols-3">
        {MAP_POOL.map((m) => {
          const has = collected.includes(m.id);
          return (
            <li key={m.id} className={`rounded border px-2 py-1 ${has ? "border-[#C9A25A]/70 bg-[#C9A25A]/15" : "border-[#8F6A32]/30 text-[var(--atlas-muted)]"}`}>
              {has ? <><span aria-hidden>✓ </span>{m.place}</> : <span aria-label="chưa khai thông">? ? ?</span>}
            </li>
          );
        })}
      </ul>
    </details>
  );
}

export default function ModeScreen({
  overview,
  best,
  busy,
  note,
  collection,
  onPlayRanked,
  onClaim,
  onStart,
  onExpire,
}: {
  overview: Overview | null;
  best: Record<string, number>;
  busy: boolean;
  note: string;
  collection: readonly string[];
  onPlayRanked: (level: string) => void;
  onClaim: (level: string, period: string) => void;
  onStart: (rules: Ruleset) => void;
  onExpire: () => void;
}) {
  const rankedOn = overview?.enabled === true;
  const [tab, setTab] = useState<"ranked" | "practice" | null>(null);
  const active = tab ?? (rankedOn && overview?.canPlay ? "ranked" : "practice");
  const now = useServerNow(overview, onExpire);
  const pending = (overview?.levels ?? []).flatMap((l) => l.claimable);
  // Bản đồ mẫu trên thẻ chơi thường đổi mỗi ngày (chỉ để trang trí; ván thật chọn bản đồ ngẫu nhiên).
  const dayTheme = Math.floor(now / 86_400_000);

  return (
    <>
      <Heading title="Trận Đồ" sub="Bày quân lệnh, lộ bản đồ" />
      <p className="max-w-2xl font-serif text-lg text-[var(--atlas-title)]">
        Bày quân tướng theo nghề và hệ để khai thông toàn bộ sa bàn. Mỗi ô khai thông lộ một mảnh bản đồ thời Loạn 12 sứ quân.
      </p>

      {rankedOn && (
        <div role="tablist" aria-label="Chế độ" className="flex gap-2">
          {(["ranked", "practice"] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={active === t} onClick={() => setTab(t)} className={`min-h-11 rounded-full px-5 font-serif font-semibold ${active === t ? "bg-[#C9A25A] text-[#2B1F15]" : "bg-white/10 hover:bg-white/15"}`}>
              {t === "ranked" ? "Xếp hạng · có thưởng" : "Chơi thường"}
            </button>
          ))}
        </div>
      )}

      {active === "ranked" && rankedOn && (
        <section aria-label="Xếp hạng" className="flex flex-col gap-4">
          <p className="max-w-2xl text-[15px] text-[var(--atlas-ink-on-wood)]/90">
            Mỗi kỳ mỗi bậc chỉ một ván, cả kỳ ai cũng gặp cùng một bản đồ. Thắng mới có hạng: điểm cao hơn, rồi ít nước hơn, rồi nộp sớm hơn thì đứng trên. Thưởng nhận sau khi kỳ khép lại.
          </p>
          {!overview?.canPlay && (
            <div role="note" className="atlas-frame atlas-frame-wood flex flex-wrap items-center justify-between gap-3 p-4">
              <p className="max-w-xl text-[15px]">Chế độ xếp hạng chỉ dành cho tài khoản đã đăng nhập. Chơi thường vẫn thoải mái, không cần đăng nhập.</p>
              <SceneLink scene="LOGIN" className="home-cta flex min-h-12 items-center rounded-lg px-6 font-serif font-bold">Đăng nhập</SceneLink>
            </div>
          )}
          <p role="status" aria-live="polite" className="min-h-6 text-[15px] text-[var(--atlas-title)]">{note}</p>
          {overview?.canPlay && pending.length > 0 && (
            <section aria-label="Thưởng chờ nhận" className="atlas-frame atlas-frame-wood p-4">
              <h2 className="mb-2 font-serif text-xl font-bold text-[var(--atlas-title)]">Thưởng chờ nhận</h2>
              <ul className="flex flex-col gap-2">
                {pending.map((c) => (
                  <li key={`${c.level}-${c.period}`} className="flex flex-wrap items-center justify-between gap-2 text-[15px]">
                    <span>
                      {RULESETS.find((r) => r.id === c.level)?.name} · kỳ {c.period}: hạng {c.rank}/{c.winners} ({TIER_LABEL[c.tier]}) · <b>{c.gold} vàng</b>
                    </span>
                    <button type="button" onClick={() => onClaim(c.level, c.period)} className="home-cta min-h-11 rounded-lg px-5 font-serif font-bold">Nhận</button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {overview && overview.levels.length > 0 && (
            <ul className="grid gap-4 lg:grid-cols-3">
              {overview.levels.map((l) => (
                <RankedCard key={l.level} l={l} now={now} busy={busy} canPlay={overview.canPlay} onPlay={onPlayRanked} />
              ))}
            </ul>
          )}
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
                {Object.keys(REWARD_GOLD).map((id) => (
                  <tr key={id}>
                    <th scope="row" className="py-1 pr-2 text-left font-semibold">{RULESETS.find((r) => r.id === id)?.name}</th>
                    {REWARD_TIERS.map((t) => <td key={t.tier} className="py-1 pr-2">{REWARD_GOLD[id]?.[t.tier]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </section>
      )}

      {active === "practice" && (
        <section aria-label="Chơi thường" className="flex flex-col gap-4">
          <p className="max-w-2xl text-[15px] text-[var(--atlas-ink-on-wood)]/90">Chơi thường: không thưởng, không xếp hạng, chơi bao nhiêu ván tùy thích. Bản đồ và chướng ngại ngẫu nhiên mỗi ván.</p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {RULESETS.map((r) => (
              <PracticeCard key={r.id} rules={r} best={best[r.id] ?? 0} theme={dayTheme} onStart={onStart} />
            ))}
          </ul>
          <CustomForm onStart={onStart} />
        </section>
      )}

      <Collection collected={collection} />
      <section aria-labelledby="tran-do-rules" className="atlas-frame atlas-frame-wood p-4">
        <h2 id="tran-do-rules" className="mb-2 font-serif text-xl font-bold text-[var(--atlas-title)]">Luật chơi</h2>
        <Rules />
      </section>
      <SceneLink scene="MENU" className="home-secondary flex min-h-12 w-fit items-center rounded-lg px-6 font-serif font-semibold">Về màn chính</SceneLink>
    </>
  );
}
