"use client";

// Màn chọn chế độ Trận Đồ. Mỗi bậc có ảnh thumbnail cố định (V2-02): thẻ xếp hạng có đồng hồ
// kỳ, hạng hiện tại và thang thưởng; thẻ chơi thường dẫn vào ván ngẫu nhiên. Có hai tab (Xếp hạng, Chơi thường) khi xếp
// hạng đang mở, và bộ sưu tập địa danh đã khai thông.

import { ModeBanner } from "@/components/game-ui";
import { Tabs, buttonVariants } from "@/components/ui";
import { useEffect, useRef, useState } from "react";
import { useAudio } from "../audio/AudioProvider";
import { REWARD_GOLD, REWARD_TIERS, RULESETS, rewardGold, type Ruleset } from "@/core/binh-phap";
import { SceneLink } from "../SceneContext";
import CustomForm from "./CustomForm";
import LevelCard from "./LevelCard";
import { MAP_POOL } from "./maps";
import type { LevelOverview, Overview } from "./rankedClient";
import RewardLadder from "./RewardLadder";
import { ModeGuidePanel } from "../ModeGuide";
import { formatRemaining } from "./time";

type Tab = "ranked" | "practice" | "board" | "rewards" | "guide";
const TIER_LABEL = Object.fromEntries(REWARD_TIERS.map((t) => [t.tier, t.label])) as Record<string, string>;
const CADENCE = { day: "Kỳ theo ngày", week: "Kỳ theo tuần" } as const;

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
    <li className="home-mode ui-frame flex h-full flex-col">
      <LevelCard level={l.level} ranked name={rules?.name} caption={CADENCE[l.cadence]} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="sr-only">{rules?.name}</h3>
          <span className="text-sm text-on-wood-soft">{rules?.randomSize ? `cỡ ${rules.randomSize.min}–${rules.randomSize.max}` : `${rules?.width}×${rules?.height}`}</span>
        </div>
        <p className="text-sm text-on-wood-soft">
          Còn <b className="text-title-on-wood">{now ? formatRemaining(l.endsAt - now) : "…"}</b> · {l.winners} người đã thắng
        </p>
        <div className="flex min-h-[7.5rem] flex-col gap-2">
          <p className="text-[15px]">{status}</p>
          {reward && m?.rank && (
            <p className="rounded border border-frame-gold/50 bg-frame-gold/15 px-3 py-1.5 text-[15px]">
              Hạng <b>{m.rank}/{l.winners}</b> ({TIER_LABEL[reward.tier]}) · thưởng dự kiến <b>{reward.gold} vàng</b>
              <span className="block text-caption text-on-wood-soft">Hạng có thể đổi tới hết kỳ; thưởng nhận khi kỳ khép lại.</span>
            </p>
          )}
        </div>
        <RewardLadder level={l.level} rank={m?.status === "won" ? (m.rank ?? null) : null} winners={l.winners} />
        <button type="button" disabled={busy || !canPlay} onClick={() => onPlay(l.level)} className={buttonVariants({ className: "mt-auto min-h-12 px-4" })}>
          {canPlay ? action : "Trình danh để chơi"}
        </button>
      </div>
    </li>
  );
}

function PracticeCard({ rules, best, onStart }: { rules: Ruleset; best: number; onStart: (r: Ruleset) => void }) {
  return (
    <li className="h-full">
      <button type="button" aria-label={`${rules.name}: chơi thường. ${rules.blurb}`} onClick={() => onStart(rules)} className="home-mode ui-frame flex h-full w-full flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-frame-gold">
        <LevelCard level={rules.id} name={rules.name} caption="Bản đồ đổi mỗi ván" />
        <span className="flex flex-col gap-1 p-4">
          <span className="text-[15px] leading-snug text-on-wood/90">{rules.blurb}</span>
          <span className="text-sm text-on-wood-soft">
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
    <p className="ui-frame flex flex-wrap items-center justify-between gap-2 p-4 text-[15px]">
      <span>
        Bộ sưu tập địa danh: <b className="text-title-on-wood">{collected.length}/{MAP_POOL.length}</b>
        <span className="block text-sm text-on-wood-soft">Khai thông trọn một sa bàn để thêm địa danh (chơi thường hay xếp hạng đều tính).</span>
      </span>
      <SceneLink scene="QUESTS" className={buttonVariants({ className: "flex min-h-11 items-center px-5" })}>Xem trong Nhiệm vụ</SceneLink>
    </p>
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
  const [tab, setTab] = useState<Tab | null>(null);
  const [boardLevel, setBoardLevel] = useState<string | null>(null);
  const active = tab ?? (rankedOn && overview?.canPlay ? "ranked" : "practice");
  const now = useServerNow(overview, onExpire);
  const pending = (overview?.levels ?? []).flatMap((l) => l.claimable);
  // Năm giây cuối của một kỳ: mõ điểm từng giây (`now` cập nhật mỗi 20 giây nên hẹn giờ theo phần còn lại tại thời điểm đó).
  const { play: playSound } = useAudio();
  useEffect(() => {
    if (now === 0) return;
    const timers: number[] = [];
    for (const l of overview?.levels ?? []) {
      const remain = l.endsAt - now;
      for (let k = 5; k >= 1; k--) {
        const delay = remain - k * 1000;
        if (delay > 0 && delay <= 20_000) timers.push(window.setTimeout(() => playSound("formation.tick"), delay));
      }
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [now, overview, playSound]);
  // Bản đồ mẫu trên thẻ chơi thường đổi mỗi ngày (chỉ để trang trí; ván thật chọn bản đồ ngẫu nhiên).

  const gate = (
    <>
      {overview?.failed && (
        <div role="alert" className="ui-frame flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="max-w-xl text-[15px]">Chưa mở được chế độ xếp hạng. Xin kiểm tra mạng rồi thử lại; chơi thường vẫn chơi được.</p>
          <button type="button" onClick={onExpire} className={buttonVariants({ className: "flex min-h-12 items-center px-6" })}>Thử lại</button>
        </div>
      )}
      {!overview?.canPlay && !overview?.failed && (
        <div role="note" className="ui-frame flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="max-w-xl text-[15px]">Chế độ xếp hạng chỉ dành cho tài khoản đã ghi danh. Chơi thường vẫn thoải mái, không cần trình danh.</p>
          <SceneLink scene="LOGIN" className={buttonVariants({ className: "flex min-h-12 items-center px-6" })}>Trình danh</SceneLink>
        </div>
      )}
    </>
  );

  return (
    <>
      <ModeBanner
        title="Trận Đồ"
        kicker="Bày quân lệnh, lộ bản đồ"
        art="/art/home/tran-do.webp"
        description="Bày quân tướng theo nghề và hệ để khai thông toàn bộ sa bàn. Mỗi ô khai thông lộ một mảnh bản đồ thời Loạn 12 sứ quân."
      />

      <Tabs
        label="Chế độ"
        value={active}
        onChange={setTab}
        items={[
          ...(rankedOn
            ? [
                { value: "ranked" as const, label: "Xếp hạng · có thưởng" },
                { value: "practice" as const, label: "Chơi thường" },
                { value: "board" as const, label: "Bảng xếp hạng" },
                {
                  value: "rewards" as const,
                  label: (
                    <>
                      Ban thưởng
                      {overview?.canPlay && pending.length > 0 && <span role="img" aria-label={`${pending.length} thưởng chờ nhận`} className="ml-1.5 inline-block size-2 rounded-full bg-lacquer-hi align-middle" />}
                    </>
                  ),
                },
              ]
            : [{ value: "practice" as const, label: "Chơi thường" }]),
          { value: "guide" as const, label: "Hướng dẫn" },
        ]}
      />

      {active === "guide" && <ModeGuidePanel scene="FORMATION" />}

      {active === "ranked" && rankedOn && (
        <section aria-label="Xếp hạng" className="flex flex-col gap-4">
          <p className="max-w-2xl text-[15px] text-on-wood/90">
            Mỗi kỳ mỗi bậc chỉ một ván, cả kỳ ai cũng gặp cùng một bản đồ. Thắng mới có hạng: điểm cao hơn, rồi ít nước hơn, rồi nộp sớm hơn thì đứng trên. Thưởng nhận sau khi kỳ khép lại.
          </p>
          {gate}
          <p role="status" aria-live="polite" className="min-h-6 text-[15px] text-title-on-wood">{note}</p>
          {overview && overview.levels.length > 0 && (
            <ul className="grid gap-4 lg:grid-cols-3">
              {overview.levels.map((l) => (
                <RankedCard key={l.level} l={l} now={now} busy={busy} canPlay={overview.canPlay} onPlay={onPlayRanked} />
              ))}
            </ul>
          )}
        </section>
      )}

      {active === "practice" && (
        <section aria-label="Chơi thường" className="flex flex-col gap-4">
          <p className="max-w-2xl text-[15px] text-on-wood/90">Chơi thường: không thưởng, không xếp hạng, chơi bao nhiêu ván tùy thích. Bản đồ và chướng ngại ngẫu nhiên mỗi ván.</p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {RULESETS.map((r) => (
              <PracticeCard key={r.id} rules={r} best={best[r.id] ?? 0} onStart={onStart} />
            ))}
          </ul>
          <CustomForm onStart={onStart} />
        </section>
      )}

      {active === "board" && rankedOn && (
        <section aria-label="Bảng xếp hạng" className="flex flex-col gap-4">
          {gate}
          {overview?.canPlay && overview.levels.length > 0 && (
            <>
              <Tabs
                label="Bậc"
                value={boardLevel ?? overview.levels[0]!.level}
                onChange={setBoardLevel}
                size="sm"
                items={overview.levels.map((l) => ({ value: l.level, label: RULESETS.find((r) => r.id === l.level)?.name ?? l.level }))}
              />
              {overview.levels.filter((l) => l.level === (boardLevel ?? overview.levels[0]!.level)).map((l) => (
                <div key={l.level} className="ui-frame p-4">
                  <p className="mb-2 text-sm text-on-wood-soft">{CADENCE[l.cadence]} · còn {now ? formatRemaining(l.endsAt - now) : "…"} · {l.winners} người đã thắng</p>
                  {l.top.length === 0 ? (
                    <p className="text-[15px] text-on-wood-soft">Chưa có ai thắng trong kỳ này.</p>
                  ) : (
                    <ol className="flex flex-col gap-1 text-[15px]">
                      {l.top.slice(0, 10).map((r) => (
                        <li key={r.rank} className={`flex justify-between gap-2 ${r.mine ? "font-bold text-frame-gold" : ""}`}>
                          <span className="truncate">{r.rank}. {r.name}</span>
                          <span className="shrink-0">{r.score} đ · {r.turns} nước</span>
                        </li>
                      ))}
                    </ol>
                  )}
                  {l.mine?.status === "won" && l.mine.rank && l.mine.rank > 10 && (
                    <p className="mt-2 border-t border-frame-bronze/40 pt-2 text-[15px] font-bold text-frame-gold">Hạng của bạn: {l.mine.rank}/{l.winners} · {l.mine.score} đ</p>
                  )}
                </div>
              ))}
            </>
          )}
        </section>
      )}

      {active === "rewards" && rankedOn && (
        <section aria-label="Ban thưởng" className="flex flex-col gap-4">
          {gate}
          <p role="status" aria-live="polite" className="min-h-6 text-[15px] text-title-on-wood">{note}</p>
          {overview?.canPlay && pending.length > 0 && (
            <section aria-label="Thưởng chờ nhận" className="ui-frame p-4">
              <h2 className="mb-2 font-serif text-xl font-bold text-title-on-wood">Thưởng chờ nhận</h2>
              <ul className="flex flex-col gap-2">
                {pending.map((c) => (
                  <li key={`${c.level}-${c.period}`} className="flex flex-wrap items-center justify-between gap-2 text-[15px]">
                    <span>
                      {RULESETS.find((r) => r.id === c.level)?.name} · kỳ {c.period}: hạng {c.rank}/{c.winners} ({TIER_LABEL[c.tier]}) · <b>{c.gold} vàng</b>
                    </span>
                    <button type="button" onClick={() => onClaim(c.level, c.period)} className={buttonVariants({ className: "min-h-11 px-5" })}>Nhận</button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {overview?.canPlay && pending.length === 0 && <p className="text-[15px] text-on-wood-soft">Chưa có thưởng chờ nhận. Thưởng nhận được sau khi kỳ khép lại.</p>}
          {overview?.canPlay && overview.levels.length > 0 && (
            <ul className="grid gap-4 lg:grid-cols-3">
              {overview.levels.map((l) => (
                <li key={l.level} className="ui-frame flex flex-col gap-2 p-4">
                  <h3 className="font-serif text-lg font-bold text-title-on-wood">{RULESETS.find((r) => r.id === l.level)?.name}</h3>
                  <RewardLadder level={l.level} rank={l.mine?.status === "won" ? (l.mine.rank ?? null) : null} winners={l.winners} />
                </li>
              ))}
            </ul>
          )}
          <details className="ui-frame p-4">
            <summary className="cursor-pointer font-serif font-bold text-title-on-wood">Bảng thưởng theo hạng</summary>
            <p className="mt-2 text-sm text-on-wood-soft">Mỗi người nhận đúng một bậc theo hạng cuối kỳ. Bảng ít người vẫn có thưởng; nửa trên tính làm tròn lên.</p>
            <table className="mt-2 w-full text-left text-[15px]">
              <thead>
                <tr className="text-on-wood-soft">
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

      {active !== "guide" && <Collection collected={collection} />}
    </>
  );
}
