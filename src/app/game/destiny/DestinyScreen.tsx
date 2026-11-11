"use client";
import RankRewardsPanel from "../rankRewards/RankRewardsPanel";
import { FrameInset, ModeBanner, ModeScreen, OrnateFrame, SectionTitle } from "@/components/game-ui";
import { Alert, Button, ChoiceChip } from "@/components/ui";
import { PageControls, usePagedItems } from "@/components/ui/Pagination";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DESTINY_BOON_CATALOG,
  DESTINY_FOOD_MAX,
  DESTINY_ROSTER_MIN,
  ELEMENTS,
  MAIN_ID,
  PROFESSIONS,
  RAGE_MAX,
  companionById,
  type DestinyLeaderBuild,
  type DestinyProgress,
  type DestinyRewardOffer,
  type DestinyRulesVersion,
  type DestinyRun,
  type FloorRules,
  type Profile,
} from "@/core";
import { cn } from "@/lib/cn";
import { ONLINE_BATTLE_KEY } from "../battle/online";
import { DIFFICULTY_NAME, ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import { Portrait } from "../art/portraits";
import { DestinyBoardPanel } from "../leaderboard/boards";
import { useScene } from "../SceneContext";
import { describeRules, RULE_TAG } from "../trial/trial-ui";
import {
  DESTINY_BOON_TEXT,
  DESTINY_ERROR_TEXT,
  DESTINY_RARITY_NAME,
  aliveIds,
  defaultDestinyBuild,
  destinyCompanionOptions,
  destinyTierSpans,
  formatCycleLeft,
  formatCycleRange,
  legalLeaderBuilds,
  lineupLegal,
  rewardCandidates,
  rewardTargetLimit,
} from "./destiny-ui";

interface DestinyMilestoneView {
  readonly id: string;
  readonly floor: number;
  readonly stones: number;
}

interface DestinyOverview {
  readonly supported: boolean;
  readonly cycleId: string | null;
  readonly cycle?: { readonly startAt: number; readonly endAt: number } | null;
  readonly stones: number;
  readonly progress: DestinyProgress | null;
  readonly floor: {
    readonly floor: number;
    readonly rules: FloorRules;
    readonly difficulty: string;
    readonly foes: readonly { readonly id: string; readonly name: string }[];
  } | null;
  /** Số tầng, version luật và mốc đá của lượt leo đang xem (chưa có lượt leo thì của chu kỳ này). */
  readonly floorCount?: number;
  readonly rulesVersion?: DestinyRulesVersion | null;
  readonly milestones?: readonly DestinyMilestoneView[];
}

interface ApiResult {
  readonly ok?: boolean;
  readonly id?: string;
  readonly error?: string;
}

async function json<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, { ...init, cache: "no-store" });
    return await response.json() as T;
  } catch {
    return null;
  }
}

const post = <T,>(url: string, body?: unknown) => json<T>(url, {
  method: "POST",
  headers: { "content-type": "application/json" },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

interface OfferText { readonly tag: string; readonly title: string; readonly body: string; readonly note?: string }

function offerText(offer: DestinyRewardOffer, run: DestinyRun): OfferText {
  switch (offer.kind) {
    case "targeted_heal": return { tag: "Hồi phục", title: "Chữa thương", body: "Một tướng còn sống hồi 50% máu tối đa." };
    case "field_medic": return { tag: "Hồi phục", title: "Quân y", body: "Tối đa ba tướng còn sống, mỗi người hồi 20% máu tối đa." };
    case "rescue": return { tag: "Hồi phục", title: "Cứu viện", body: "Một tướng đã gục đứng dậy với 30% máu và 0 năng lượng." };
    case "boon": {
      const boon = DESTINY_BOON_CATALOG[offer.boonId];
      const text = DESTINY_BOON_TEXT[offer.boonId];
      const owned = run.boons?.find(({ id }) => id === offer.boonId)?.stacks ?? 0;
      return {
        tag: `Phúc · ${DESTINY_RARITY_NAME[boon.rarity]}`,
        title: text.name,
        body: text.body,
        note: `Đang có ${owned}/${boon.maxStacks} lần. Phúc giữ tới hết lượt leo.`,
      };
    }
  }
}

const difficultyName = (d?: string) => (d ? DIFFICULTY_NAME[d as keyof typeof DIFFICULTY_NAME] ?? d : "");

function rememberBattle(id: string) {
  try { window.localStorage.setItem(ONLINE_BATTLE_KEY, id); } catch { /* server vẫn giữ matchId */ }
}

/** Thanh máu mảnh; `tone` đỏ khi dưới 30%. */
function HpBar({ hp, maxHp }: { hp: number; maxHp: number }) {
  const ratio = Math.max(0, Math.min(100, Math.round(100 * hp / Math.max(1, maxHp))));
  return (
    <div className="h-1.5 overflow-hidden rounded bg-black/40" role="img" aria-label={`Máu ${ratio}%`}>
      <div className={cn("h-full", ratio < 30 ? "bg-danger" : "bg-jade")} style={{ width: `${ratio}%` }} />
    </div>
  );
}

/** Hành trình các tầng: chia theo chặng độ khó, đánh dấu tầng đã vượt, tầng đang đứng và mốc Đá Cường Hóa. */
function FloorTrack({ floorCount, version, cleared, current, best, milestones, claimed }: {
  floorCount: number;
  version: DestinyRulesVersion;
  /** Tầng cao nhất đã vượt trong lượt leo đang chạy (0 khi không có lượt leo). */
  cleared: number;
  /** Tầng sắp đánh; null khi không có lượt leo hoặc đang chờ nhận thưởng. */
  current: number | null;
  best: number;
  milestones: readonly DestinyMilestoneView[];
  claimed: readonly string[];
}) {
  const spans = destinyTierSpans(floorCount, version);
  return (
    <OrnateFrame className="flex flex-col gap-3">
      <SectionTitle description={current !== null
        ? `Đang ở tầng ${current}. Kỷ lục chu kỳ này: tầng ${best}.`
        : cleared > 0 ? `Đã vượt tầng ${cleared}. Kỷ lục chu kỳ này: tầng ${best}.`
        : best > 0 ? `Kỷ lục chu kỳ này: tầng ${best}.` : "Chưa vượt tầng nào trong chu kỳ này."}>
        Hành trình {floorCount} tầng
      </SectionTitle>
      <ol className="grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-4" aria-label="Các tầng của tháp">
        {spans.map((span) => (
          <li key={span.tier} className="min-w-0">
            <p className="mb-1.5 text-caption text-on-wood-soft">
              Tầng {span.from === span.to ? span.from : `${span.from}–${span.to}`} · <strong className="text-on-wood">{difficultyName(span.difficulty)}</strong>
            </p>
            <ol className="grid grid-cols-5 gap-1">
              {Array.from({ length: span.to - span.from + 1 }, (_, i) => span.from + i).map((floor) => {
                const milestone = milestones.find((m) => m.floor === floor);
                const got = milestone ? claimed.includes(milestone.id) : false;
                const state = floor <= cleared ? "cleared" : floor === current ? "current" : "ahead";
                const label = `Tầng ${floor}: ${state === "cleared" ? "đã vượt" : state === "current" ? "đang ở đây" : "chưa tới"}` +
                  (milestone ? `, mốc ${milestone.stones} Đá Cường Hóa${got ? " (đã nhận)" : ""}` : "");
                return (
                  <li key={floor} title={label} aria-label={label} aria-current={state === "current" ? "step" : undefined}
                    className={cn(
                      "flex min-h-11 flex-col items-center justify-center rounded border text-sm leading-tight",
                      state === "cleared" && "border-jade/50 bg-jade/15 text-jade",
                      state === "current" && "border-frame-gold bg-frame-gold/15 font-bold text-frame-gold",
                      state === "ahead" && "border-white/10 bg-black/20 text-on-wood-soft",
                    )}>
                    <span aria-hidden>{floor}</span>
                    {milestone && (
                      <span aria-hidden className={cn("text-caption font-semibold", got ? "text-jade" : "text-frame-gold")}>
                        {got ? "✓" : "+"}{milestone.stones}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </li>
        ))}
      </ol>
      {milestones.length > 0 && (
        <p className="text-caption text-on-wood-soft">
          Số có dấu + là Đá Cường Hóa nhận khi lần đầu vượt tầng đó trong chu kỳ; dấu ✓ là đã nhận.
        </p>
      )}
    </OrnateFrame>
  );
}

export default function DestinyScreen() {
  const { go } = useScene();
  const [overview, setOverview] = useState<DestinyOverview | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roster, setRoster] = useState<readonly string[]>([]);
  const [active, setActive] = useState<readonly string[]>([]);
  const [build, setBuild] = useState<DestinyLeaderBuild | null>(null);
  const [offerIndex, setOfferIndex] = useState<number | null>(null);
  const [targets, setTargets] = useState<readonly string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [confirmStop, setConfirmStop] = useState(false);
  /** Giờ lúc tải, để tính thời gian còn lại của chu kỳ mà không đọc đồng hồ trong lúc vẽ. */
  const [loadedAt, setLoadedAt] = useState<number | null>(null);
  // Danh sách tướng chọn vào đội: cắt trang 12 (chọn giữ nguyên khi sang trang). Hook đặt trước các return sớm.
  const rosterIds = useMemo(() => (profile ? Object.keys(profile.companions).sort() : []), [profile]);
  const pagedRoster = usePagedItems(rosterIds, 12);

  const load = useCallback(async () => {
    const [destiny, stored] = await Promise.all([
      json<DestinyOverview>("/api/destiny"),
      json<{ profile?: Profile }>("/api/profile"),
    ]);
    if (!destiny || !stored?.profile) { setFailed(true); return; }
    setFailed(false);
    setOverview(destiny);
    setProfile(stored.profile);
    setLoadedAt(Date.now());
    const run = destiny.progress?.run;
    if (run?.active) {
      // Gợi ý sẵn cặp tướng còn sống đầu tiên hợp luật tầng; không có cặp nào thì lấy hai người đầu để người chơi tự đổi.
      const alive = aliveIds(run).filter((id) => id !== MAIN_ID);
      const floorRules = destiny.floor?.rules;
      let pair = alive.slice(0, 2);
      if (floorRules) {
        search: for (let i = 0; i < alive.length; i++) for (let j = i + 1; j < alive.length; j++) {
          if (legalLeaderBuilds(run, floorRules, [MAIN_ID, alive[i]!, alive[j]!]).length === 0) continue;
          pair = [alive[i]!, alive[j]!];
          break search;
        }
      }
      setActive([MAIN_ID, ...pair]);
    } else {
      setRoster([MAIN_ID, ...Object.keys(stored.profile.companions).sort()]);
    }
    setBuild(null);
    setOfferIndex(null);
    setTargets([]);
    setConfirmStop(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const run = overview?.progress?.run ?? null;
  const rules = overview?.floor?.rules ?? null;
  const builds = useMemo(() => run && rules ? legalLeaderBuilds(run, rules, active) : [], [run, rules, active]);
  const chosenBuild = build ?? (run && rules ? defaultDestinyBuild(run, rules, active) : null);
  const chosenOffer = run?.offer && offerIndex !== null ? run.offer[offerIndex] : null;
  const candidates = chosenOffer && run ? rewardCandidates(run, chosenOffer) : [];
  const leaderNeedsRescue = !!run?.fighters?.[MAIN_ID] &&
    (run.fighters[MAIN_ID]!.downed || run.fighters[MAIN_ID]!.hp <= 0);

  const fail = (error?: string) => setMessage(DESTINY_ERROR_TEXT[error ?? "network"] ?? "Không thực hiện được. Hãy tải lại trang.");
  const refreshAfter = async () => { await load(); setBusy(false); };

  const startRun = async () => {
    setBusy(true); setMessage(null);
    const result = await post<ApiResult>("/api/destiny/run", { rosterIds: roster });
    if (!result?.ok) { setBusy(false); fail(result?.error); return; }
    await refreshAfter();
  };

  const startBattle = async () => {
    if (!chosenBuild) return;
    setBusy(true); setMessage(null);
    const result = await post<ApiResult>("/api/destiny/battles", { activeIds: active, leaderBuild: chosenBuild });
    if (!result?.id) { setBusy(false); fail(result?.error); return; }
    rememberBattle(result.id);
    go("PLAYING", { resume: "1" });
  };

  const resume = () => {
    if (!run?.matchId) return;
    rememberBattle(run.matchId);
    go("PLAYING", { resume: "1" });
  };

  const claim = async () => {
    if (!run || offerIndex === null || !chosenOffer) return;
    const limit = rewardTargetLimit(chosenOffer);
    if (targets.length < limit.min || targets.length > limit.max) {
      setMessage(limit.min === limit.max ? `Hãy chọn ${limit.min} tướng nhận.` : `Hãy chọn từ ${limit.min} đến ${limit.max} tướng nhận.`);
      return;
    }
    setBusy(true); setMessage(null);
    const result = await post<ApiResult>("/api/destiny/reward", { floor: run.floor, index: offerIndex, targetIds: targets });
    if (!result?.ok) { setBusy(false); fail(result?.error); return; }
    await refreshAfter();
  };

  const stop = async () => {
    setBusy(true); setMessage(null);
    const result = await post<ApiResult>("/api/destiny/stop");
    if (!result?.ok) { setBusy(false); fail(result?.error); return; }
    await refreshAfter();
  };

  if (!overview || !profile) return (
    <ModeScreen label="Tháp Thiên Mệnh">
      <div className="py-24 text-center text-on-wood-soft">
        {failed ? (
          <>
            <p role="alert">Không tải được Tháp Thiên Mệnh.</p>
            <Button variant="secondary" className="mt-3 min-h-11" onClick={() => void load()}>Tải lại</Button>
          </>
        ) : <p role="status">Đang tải Tháp Thiên Mệnh…</p>}
      </div>
    </ModeScreen>
  );

  const fighterName = (id: string) => run?.fighters?.[id]?.config.name ?? (id === MAIN_ID ? "Đinh Bộ Lĩnh" : companionById(id)?.name ?? id);
  const noActiveRun = !run?.active && run?.phase !== "reward";
  const floorCount = overview.floorCount ?? 10;
  const version: DestinyRulesVersion = overview.rulesVersion ?? (floorCount > 10 ? 2 : 1);
  const best = overview.progress?.cycleBest ?? 0;
  const cycleText = overview.cycle
    ? `Chu kỳ ${formatCycleRange(overview.cycle.startAt, overview.cycle.endAt)}` +
      (loadedAt === null ? "" : ` · ${formatCycleLeft(overview.cycle.endAt, loadedAt)}`)
    : "Chu kỳ tuần";
  // Trong lượt leo: tầng đã vượt là tầng trước tầng đang đứng; đang chờ nhận thưởng thì tính cả tầng vừa thắng.
  const clearedInRun = run?.active ? (run.phase === "reward" ? run.floor : run.floor - 1) : run?.completed ? run.floor : 0;
  const currentFloor = run?.active && run.phase !== "reward" ? run.floor : null;
  const companions = run && rules ? destinyCompanionOptions(run, rules, active) : [];
  const pickedCount = active.filter((id) => id !== MAIN_ID).length;
  const pickBuild = (next: Partial<DestinyLeaderBuild>) => {
    if (!chosenBuild) return;
    const wanted = { ...chosenBuild, ...next };
    setBuild(builds.find((b) => b.element === wanted.element && b.profession === wanted.profession)
      ?? builds.find((b) => (next.element ? b.element === next.element : b.profession === next.profession))
      ?? chosenBuild);
  };
  const lineupOk = !!run && !!rules && !!chosenBuild && lineupLegal(run, rules, active, chosenBuild);
  const lineupHint = !run || !rules ? null
    : pickedCount < 2 ? `Chọn thêm ${2 - pickedCount} tướng ra trận.`
    : builds.length === 0 ? "Hai tướng này không ghép được với nghề và hệ nào của Đinh Bộ Lĩnh để hợp luật tầng. Hãy đổi tướng."
    : !lineupOk ? "Nghề và hệ đang chọn của Đinh Bộ Lĩnh chưa hợp luật tầng. Hãy chọn lại."
    : null;

  const stopConfirm = run && confirmStop && (
    <Alert className="mt-4 p-3 text-sm">
      <p>
        <strong>Dừng lượt leo ở tầng {run.floor}?</strong>{" "}
        {run.phase === "battle" ? "Trận đang dở bị tính thua. " : ""}
        Lượt leo kết thúc và không tiếp tục được; kỷ lục chu kỳ (tầng {best}) và Đá Cường Hóa đã nhận vẫn giữ.
        Bạn có thể khóa đội hình mới để leo lại từ tầng 1.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" disabled={busy} onClick={() => void stop()} className="min-h-11">
          {busy ? "Đang dừng…" : "Dừng lượt leo"}
        </Button>
        <Button disabled={busy} onClick={() => setConfirmStop(false)} className="min-h-11">Leo tiếp</Button>
      </div>
    </Alert>
  );

  return (
    <ModeScreen wide label="Tháp Thiên Mệnh">
      <ModeBanner
        title="Tháp Thiên Mệnh"
        kicker={cycleText}
        art="/art/home/destiny.webp"
        artPosition="center 42%"
        description={`Leo ${floorCount} tầng bằng một đội hình khóa sẵn. Máu, năng lượng và lương giữ nguyên từ tầng này sang tầng sau.`}
        stats={[
          { label: "Kỷ lục chu kỳ", value: `Tầng ${best}/${floorCount}` },
          { label: "Đá Cường Hóa", value: overview.stones },
        ]}
      />

      {message && <Alert className="p-3 text-sm" role="alert">{message}</Alert>}

      <FloorTrack floorCount={floorCount} version={version} cleared={clearedInRun} current={currentFloor} best={best}
        milestones={overview.milestones ?? []} claimed={overview.progress?.claimedMilestones ?? []} />

      {noActiveRun && (
        <OrnateFrame level="raised">
          {run?.completed && (
            <Alert className="mb-4 p-3 text-sm">
              <strong>Đã chinh phục trọn {run.floor} tầng.</strong> Thành tích đã ghi vào bảng xếp hạng chu kỳ.
              Muốn lên hạng, hãy leo lại và vượt tháp với ít lượt đánh hơn.
            </Alert>
          )}
          <SectionTitle description={!run?.completed && run?.phase === "done"
            ? `Lượt leo trước dừng ở tầng ${run.floor}. Khóa đội hình mới để leo lại từ tầng 1.`
            : "Mỗi lượt leo bắt đầu từ tầng 1."}>
            Khóa đội hình
          </SectionTitle>
          <ul className="list-disc space-y-1 pl-5 text-sm text-on-wood">
            <li>Đinh Bộ Lĩnh luôn ra trận; chọn thêm ít nhất {DESTINY_ROSTER_MIN - 1} tướng, nhiều nhất là mọi tướng bạn có.</li>
            <li>Đội hình khóa tới hết lượt leo: không thêm, bớt hay đổi tướng giữa chừng.</li>
            <li>Mỗi tầng ba người ra trận, số còn lại dự bị. Mang nhiều tướng thì có người thay khi đồng đội bị thương và dễ đáp ứng luật từng tầng.</li>
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="ui-title-on-wood text-base">Đã chọn {Math.max(0, roster.length - 1)}/{rosterIds.length} tướng</h3>
            <div className="flex flex-wrap gap-2">
              <ChoiceChip selected={false} disabled={roster.length - 1 >= rosterIds.length} onClick={() => setRoster([MAIN_ID, ...rosterIds])}>Chọn tất cả</ChoiceChip>
              <ChoiceChip selected={false} disabled={roster.length <= 1} onClick={() => setRoster([MAIN_ID])}>Bỏ chọn hết</ChoiceChip>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-3">
            {pagedRoster.pageItems.map((id) => {
              const companion = companionById(id);
              if (!companion) return null;
              const selected = roster.includes(id);
              return (
                <ChoiceChip key={id} size="md" selected={selected}
                  onClick={() => setRoster(selected ? roster.filter((x) => x !== id) : [...roster, id])}
                  className="items-center justify-start gap-2.5 p-2.5 text-left">
                  <Portrait id={id} element={companion.element} profession={companion.profession} className="size-12 shrink-0" />
                  <span className="flex min-w-0 flex-col">
                    <strong>{companion.name}</strong>
                    <span className="text-caption font-normal opacity-80">{ELEMENT_NAME[companion.element]} · {PROFESSION_NAME[companion.profession]}</span>
                  </span>
                </ChoiceChip>
              );
            })}
          </div>
          <PageControls paged={pagedRoster} label="Phân trang tướng" className="mt-2" />
          {roster.length < DESTINY_ROSTER_MIN && (
            <p className="mt-3 text-sm text-danger">Cần chọn thêm {DESTINY_ROSTER_MIN - roster.length} tướng nữa.</p>
          )}
          <Button disabled={busy || roster.length < DESTINY_ROSTER_MIN} onClick={() => void startRun()} className="mt-4 min-h-11">
            {busy ? "Đang khóa đội hình…" : `Khóa đội hình và bắt đầu leo`}
          </Button>
        </OrnateFrame>
      )}

      {run && run.active && (
        <section className="grid gap-4 sm:gap-5 lg:grid-cols-[1fr_1.4fr]">
          <OrnateFrame className="order-2 min-w-0 self-start lg:order-1">
            <SectionTitle description={`Lương ${run.food}/${DESTINY_FOOD_MAX} · Nộ ${run.rage ?? 0}/${RAGE_MAX}`}>Đội hình</SectionTitle>
            <ul className="space-y-2">
              {run.roster.map((id) => {
                const f = run.fighters?.[id];
                if (!f) return null;
                const onField = run.phase === "prepare" && active.includes(id);
                return (
                  <li key={id}>
                    <FrameInset className={cn("flex items-center gap-3", f.downed && "opacity-70")}>
                      <Portrait id={id} element={f.config.element} profession={f.config.profession} className="size-11 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-2 text-sm">
                          <strong className="text-on-wood">{f.config.name}</strong>
                          <span className={f.downed ? "font-semibold text-danger" : "text-on-wood-soft"}>
                            {f.downed ? "Đã gục" : `Máu ${f.hp}/${f.config.maxHp}`}
                          </span>
                        </div>
                        <p className="text-caption text-on-wood-soft">
                          {id === MAIN_ID ? "Thủ lĩnh · đổi nghề và hệ trước mỗi tầng" : `${ELEMENT_NAME[f.config.element]} · ${PROFESSION_NAME[f.config.profession]}`}
                          {!f.downed && ` · Năng lượng ${f.energy}`}
                          {onField && id !== MAIN_ID && " · Ra trận"}
                        </p>
                        <div className="mt-1.5"><HpBar hp={f.hp} maxHp={f.config.maxHp} /></div>
                      </div>
                    </FrameInset>
                  </li>
                );
              })}
            </ul>
            <h3 className="ui-title-on-wood mt-4 text-base">Phúc đang có</h3>
            {run.boons?.length ? (
              <ul className="mt-1.5 space-y-1.5">
                {run.boons.map((b) => (
                  <li key={b.id} className="text-sm text-on-wood">
                    <strong>{DESTINY_BOON_TEXT[b.id].name}</strong>{" "}
                    <span className="text-frame-gold">×{b.stacks}</span>
                    <span className="block text-caption text-on-wood-soft">{DESTINY_BOON_TEXT[b.id].body}</span>
                  </li>
                ))}
                <li className="text-caption text-on-wood-soft">Hiệu ứng ghi cho một lần chọn; ×2, ×3 là đã cộng dồn.</li>
              </ul>
            ) : (
              <p className="text-sm text-on-wood-soft">Chưa có Phúc. Thắng một tầng để chọn Phúc hoặc hồi phục.</p>
            )}
          </OrnateFrame>

          <OrnateFrame level="raised" className="order-1 min-w-0 lg:order-2">
            {run.phase === "battle" && (
              <>
                <SectionTitle>Trận tầng {run.floor} đang dở</SectionTitle>
                <p className="text-sm text-on-wood">Trận được lưu trên máy chủ. Bấm Tiếp tục để vào lại đúng trận này, kể cả khi bạn mở game ở thiết bị khác.</p>
                {!confirmStop && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button disabled={busy || !run.matchId} onClick={resume} className="min-h-11">Tiếp tục trận</Button>
                    <Button variant="secondary" disabled={busy} onClick={() => setConfirmStop(true)} className="min-h-11">Dừng lượt leo</Button>
                  </div>
                )}
                {stopConfirm}
              </>
            )}

            {run.phase === "prepare" && rules && (
              <>
                <SectionTitle description={`Đối thủ: ${overview.floor?.foes.map((f) => f.name).join(", ") ?? ""} · Độ khó ${difficultyName(overview.floor?.difficulty)}`}>
                  Chuẩn bị tầng {run.floor}/{floorCount}
                </SectionTitle>
                <h3 className="ui-title-on-wood mb-1.5 text-base">Luật tầng</h3>
                {describeRules(rules).length > 0 ? (
                  <ul className="flex flex-col gap-1.5 text-sm text-on-wood">
                    {describeRules(rules).map((line) => (
                      <li key={line.text} className="flex items-start gap-2">
                        <span className="ui-rule-tag shrink-0" data-kind={line.kind}>{RULE_TAG[line.kind]}</span>
                        <span>{line.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-on-wood-soft">Tầng này không giới hạn nghề hay hệ.</p>}

                <h3 className="ui-title-on-wood mt-4 mb-1.5 text-base">Chọn 2 tướng ra trận ({pickedCount}/2)</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {companions.map((c) => (
                    <ChoiceChip key={c.id} size="md" selected={c.selected} disabled={c.disabled}
                      onClick={() => { setActive(c.selected ? active.filter((x) => x !== c.id) : [...active, c.id]); setBuild(null); }}
                      className="items-center justify-start gap-2.5 p-2.5 text-left">
                      <Portrait id={c.id} element={c.element} profession={c.profession} className="size-11 shrink-0" />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <strong>{c.name}</strong>
                        <span className="text-caption font-normal opacity-80">
                          {ELEMENT_NAME[c.element]} · {PROFESSION_NAME[c.profession]} · Máu {c.hp}/{c.maxHp}
                        </span>
                        {c.hp > 0 && <HpBar hp={c.hp} maxHp={c.maxHp} />}
                        {c.reason && <span className="text-caption font-normal">{c.reason}</span>}
                      </span>
                    </ChoiceChip>
                  ))}
                </div>

                <h3 className="ui-title-on-wood mt-4 mb-1.5 text-base">Nghề và hệ của Đinh Bộ Lĩnh</h3>
                <p className="mb-2 text-sm text-on-wood-soft">
                  Đổi miễn phí trước mỗi tầng. Lựa chọn bị mờ là không hợp luật tầng với hai tướng đang chọn.
                </p>
                {pickedCount === 2 && chosenBuild && builds.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Hệ của Đinh Bộ Lĩnh">
                      <span className="w-12 shrink-0 text-sm text-on-wood-soft">Hệ</span>
                      {ELEMENTS.map((element) => (
                        <ChoiceChip key={element} selected={chosenBuild.element === element}
                          disabled={!builds.some((b) => b.element === element)} onClick={() => pickBuild({ element })}>
                          {ELEMENT_NAME[element]}
                        </ChoiceChip>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Nghề của Đinh Bộ Lĩnh">
                      <span className="w-12 shrink-0 text-sm text-on-wood-soft">Nghề</span>
                      {PROFESSIONS.map((profession) => (
                        <ChoiceChip key={profession} selected={chosenBuild.profession === profession}
                          disabled={!builds.some((b) => b.profession === profession)} onClick={() => pickBuild({ profession })}>
                          {PROFESSION_NAME[profession]}
                        </ChoiceChip>
                      ))}
                    </div>
                  </div>
                )}
                {lineupHint && <p className="mt-2 text-sm text-danger" role="status">{lineupHint}</p>}
                {!confirmStop && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button disabled={busy || !lineupOk} onClick={() => void startBattle()} className="min-h-11">
                      {busy ? "Đang mở trận…" : `Đánh tầng ${run.floor}`}
                    </Button>
                    <Button variant="secondary" disabled={busy} onClick={() => setConfirmStop(true)} className="min-h-11">Dừng lượt leo</Button>
                  </div>
                )}
                {stopConfirm}
              </>
            )}

            {run.phase === "reward" && run.offer && (
              <>
                <SectionTitle description="Chọn một trong ba. Ba lựa chọn này cố định cho tầng, tải lại trang không đổi.">
                  Phần thưởng tầng {run.floor}
                </SectionTitle>
                {leaderNeedsRescue && (
                  <Alert className="p-3 text-sm">Đinh Bộ Lĩnh đã gục. Phải chọn Cứu viện cho Đinh Bộ Lĩnh thì mới lên được tầng kế.</Alert>
                )}
                <div className="mt-3 grid gap-2">
                  {run.offer.map((offer, index) => {
                    const text = offerText(offer, run);
                    const blocked = leaderNeedsRescue && offer.kind !== "rescue";
                    return (
                      <ChoiceChip key={`${offer.kind}-${index}`} size="md" selected={offerIndex === index} disabled={blocked}
                        onClick={() => { setOfferIndex(index); setTargets([]); }}
                        className="flex-col items-start gap-0.5 p-4 text-left">
                        <span className="text-caption font-semibold uppercase tracking-wide opacity-80">{text.tag}</span>
                        <strong>{text.title}</strong>
                        <span className="text-sm font-normal">{text.body}</span>
                        {text.note && <span className="text-caption font-normal opacity-80">{text.note}</span>}
                      </ChoiceChip>
                    );
                  })}
                </div>
                {chosenOffer && chosenOffer.kind !== "boon" && (
                  <div className="mt-4">
                    <h3 className="ui-title-on-wood mb-1.5 text-base">
                      {rewardTargetLimit(chosenOffer).max > 1 ? `Chọn tướng nhận (tối đa ${rewardTargetLimit(chosenOffer).max})` : "Chọn tướng nhận"}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {candidates.map((id) => {
                        const selected = targets.includes(id);
                        const max = rewardTargetLimit(chosenOffer).max;
                        const f = run.fighters?.[id];
                        return (
                          <ChoiceChip key={id} selected={selected}
                            disabled={(!selected && targets.length >= max) || (leaderNeedsRescue && id !== MAIN_ID)}
                            onClick={() => setTargets(selected ? targets.filter((x) => x !== id) : [...targets, id])}>
                            {fighterName(id)}{f && ` · ${f.downed ? "đã gục" : `máu ${f.hp}/${f.config.maxHp}`}`}
                          </ChoiceChip>
                        );
                      })}
                    </div>
                  </div>
                )}
                <Button disabled={busy || offerIndex === null || (leaderNeedsRescue && (chosenOffer?.kind !== "rescue" || targets[0] !== MAIN_ID))}
                  onClick={() => void claim()} className="mt-5 min-h-11">
                  {busy ? "Đang nhận…" : `Nhận và lên tầng ${run.floor + 1}`}
                </Button>
              </>
            )}
          </OrnateFrame>
        </section>
      )}

      <RankRewardsPanel mode="destiny" />
      <DestinyBoardPanel />
    </ModeScreen>
  );
}
