"use client";

// Màn chọn chế độ Trận Đồ (Shan 18/11/2026): thẻ Chơi thường (mặc định), Xếp hạng, Chiến tích, Hướng dẫn. Mỗi bậc có ảnh
// thumbnail cố định (V2-02). Thẻ xếp hạng gọn: đồng hồ kỳ, số người thắng, ván của mình và thưởng dự kiến. Chiến tích gộp
// thưởng chờ nhận, bảng xếp hạng từng bậc (kiểu bục vinh danh) kèm thang thưởng, bảng thưởng theo hạng và bộ sưu tập địa danh.

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
import { ModeGuidePanel } from "../ModeGuide";
import { formatRemaining } from "./time";
import { RankBoard } from "../leaderboard/RankBoard";
import FormationTierPanel from "./FormationTierPanel";

type Tab = "practice" | "ranked" | "record" | "guide";
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
  const top = REWARD_GOLD[l.level]?.top1;
  const action = !m ? "Chơi" : m.status === "playing" ? "Tiếp tục" : "Xem ván";
  const size = rules?.randomSize ? `cỡ ${rules.randomSize.min}–${rules.randomSize.max}` : `${rules?.width}×${rules?.height}`;
  return (
    <li className="home-mode ui-frame flex h-full flex-col">
      <LevelCard level={l.level} ranked name={rules?.name} caption={CADENCE[l.cadence]} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="sr-only">{rules?.name}</h3>
        <ul className="flex flex-wrap gap-1.5 text-caption" aria-label="Thông tin kỳ">
          <li className="rounded-full bg-black/30 px-2.5 py-1 text-on-wood-soft">{size}</li>
          <li className="rounded-full bg-black/30 px-2.5 py-1 text-on-wood-soft">
            Còn <b className="text-title-on-wood">{now ? formatRemaining(l.endsAt - now) : "…"}</b>
          </li>
          <li className="rounded-full bg-black/30 px-2.5 py-1 text-on-wood-soft">{l.winners} người đã thắng</li>
          {top !== undefined && <li className="rounded-full bg-frame-gold/15 px-2.5 py-1 font-semibold text-frame-gold">Nhất {top} vàng</li>}
        </ul>
        {!m ? (
          <p className="text-sm text-on-wood-soft">Mỗi kỳ một ván, cả kỳ cùng một bản đồ.</p>
        ) : m.status === "playing" ? (
          <div className="flex flex-col gap-1">
            <p className="text-sm">Đang chơi dở · khai thông {Math.round(reveal * 100)}%</p>
            <div className="h-1.5 overflow-hidden rounded-full bg-black/40" aria-hidden>
              <div className="h-full bg-frame-gold" style={{ width: `${reveal * 100}%` }} />
            </div>
          </div>
        ) : m.status === "won" ? (
          <div className="rounded-lg border border-frame-gold/50 bg-frame-gold/10 px-3 py-2">
            <p className="text-sm">
              Đã thắng <b>{m.score} điểm</b>
              {m.rank ? (
                <>
                  {" "}· hạng <b>{m.rank}/{l.winners}</b>
                </>
              ) : null}
            </p>
            {reward && (
              <p className="text-caption text-on-wood-soft">
                {TIER_LABEL[reward.tier]} · dự kiến <b className="text-frame-gold">{reward.gold} vàng</b> khi kỳ khép lại
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-on-wood-soft">Đã thua kỳ này, không vào bảng.</p>
        )}
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
  const [tab, setTab] = useState<Tab>("practice");
  const [boardLevel, setBoardLevel] = useState<string | null>(null);
  // Vào Trận Đồ mặc định ở Chơi thường; xếp hạng tắt thì chỉ còn Chơi thường, Chiến tích (bộ sưu tập) và Hướng dẫn.
  const active: Tab = !rankedOn && tab === "ranked" ? "practice" : tab;
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
          { value: "practice" as const, label: "Chơi thường" },
          ...(rankedOn ? [{ value: "ranked" as const, label: "Xếp hạng" }] : []),
          {
            value: "record" as const,
            label: (
              <>
                Chiến tích
                {overview?.canPlay && pending.length > 0 && <span role="img" aria-label={`${pending.length} thưởng chờ nhận`} className="ml-1.5 inline-block size-2 rounded-full bg-lacquer-hi align-middle" />}
              </>
            ),
          },
          { value: "guide" as const, label: "Hướng dẫn" },
        ]}
      />

      {active === "guide" && <ModeGuidePanel scene="FORMATION" />}

      {active === "ranked" && rankedOn && (
        <section aria-label="Xếp hạng" className="flex flex-col gap-4">
          <p className="max-w-3xl text-sm text-on-wood-soft">
            Mỗi kỳ mỗi bậc một ván, cùng một bản đồ cho mọi người. Thắng mới có hạng: điểm cao hơn, rồi ít nước hơn, rồi nộp sớm hơn. Bảng và thưởng ở thẻ Chiến tích.
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
          <p className="max-w-2xl text-sm text-on-wood-soft">Chơi bao nhiêu ván tùy thích. Bản đồ và chướng ngại ngẫu nhiên mỗi ván.</p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {RULESETS.map((r) => (
              <PracticeCard key={r.id} rules={r} best={best[r.id] ?? 0} onStart={onStart} />
            ))}
          </ul>
          <CustomForm onStart={onStart} />
        </section>
      )}

      {active === "record" && (
        <section aria-label="Chiến tích" className="flex flex-col gap-4">
          {rankedOn && gate}
          <p role="status" aria-live="polite" className="min-h-6 text-[15px] text-title-on-wood">{note}</p>
          {rankedOn && overview?.canPlay && pending.length > 0 && (
            <section aria-label="Thưởng chờ nhận" className="ui-frame border-frame-gold p-4">
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
          {rankedOn && overview?.canPlay && <FormationTierPanel />}
          {rankedOn && overview?.canPlay && overview.levels.length > 0 && (
            <>
              <Tabs
                label="Bậc"
                value={boardLevel ?? overview.levels[0]!.level}
                onChange={setBoardLevel}
                size="sm"
                items={overview.levels.map((l) => ({ value: l.level, label: RULESETS.find((r) => r.id === l.level)?.name ?? l.level }))}
              />
              {overview.levels.filter((l) => l.level === (boardLevel ?? overview.levels[0]!.level)).map((l) => (
                <div key={l.level} className="ui-frame flex flex-col gap-4 p-4">
                  <p className="text-sm text-on-wood-soft">{CADENCE[l.cadence]} · còn {now ? formatRemaining(l.endsAt - now) : "…"} · {l.winners} người đã thắng</p>
                  {l.top.length === 0 ? (
                    <p className="py-4 text-center text-[15px] text-on-wood-soft">Chưa có ai thắng trong kỳ này.</p>
                  ) : (
                    <RankBoard
                      entries={l.top.slice(0, 20).map((r) => ({ rank: r.rank, name: r.name, mine: r.mine, score: `${r.score} đ`, detail: `${r.turns} nước`, reward: rewardGold(l.level, r.rank, l.winners)?.gold ?? null }))}
                      mine={
                        l.mine?.status === "won" && l.mine.rank
                          ? { rank: l.mine.rank, score: `${l.mine.score} đ`, reward: rewardGold(l.level, l.mine.rank, l.winners)?.gold ?? null }
                          : { rank: null, score: null }
                      }
                    />
                  )}
                </div>
              ))}
            </>
          )}
          {rankedOn && (
            <details className="ui-frame p-4">
              <summary className="cursor-pointer font-serif font-bold text-title-on-wood">Bảng thưởng theo hạng</summary>
              <p className="mt-2 text-sm text-on-wood-soft">Mỗi người nhận đúng một bậc theo hạng cuối kỳ. Bảng ít người vẫn có thưởng; nửa trên tính làm tròn lên. Thưởng nhận được sau khi kỳ khép lại.</p>
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
          )}
          <Collection collected={collection} />
        </section>
      )}

    </>
  );
}
