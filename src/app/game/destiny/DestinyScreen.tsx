"use client";
import { requestJson, postJson } from "../api";
import RankRewardsPanel from "../rankRewards/RankRewardsPanel";
import { FrameInset, ModeBanner, ModeScreen, ModeSkeleton, OrnateFrame, SectionTitle } from "@/components/game-ui";
import { Alert, Button, ChoiceChip, choiceVariants } from "@/components/ui";
import { PageControls, usePagedItems } from "@/components/ui/Pagination";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DESTINY_BOON_CATALOG,
  DESTINY_FOOD_MAX,
  DESTINY_ROSTER_MAX,
  DESTINY_ROSTER_MIN,
  ELEMENTS,
  MAIN_ID,
  PROFESSIONS,
  RAGE_MAX,
  companionById,
  destinyFloorFoeLevel,
  destinyRageOf,
  progressOf,
  type DestinyLeaderBuild,
  type DestinyProgress,
  type DestinyRewardOffer,
  type DestinyRulesVersion,
  type DestinyRun,
  type Element,
  type FloorRules,
  type Profession,
  type Profile,
} from "@/core";
import { cn } from "@/lib/cn";
import { ONLINE_BATTLE_KEY } from "../battle/online";
import { DIFFICULTY_NAME, ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import { CounterStar, type CounterFoe } from "../art/CounterStar";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { fold } from "../profile/roster";
import { Portrait } from "../art/portraits";
import { DestinyBoardPanel } from "../leaderboard/boards";
import { useScene } from "../SceneContext";
import { describeRules, RULE_TAG } from "../trial/trial-ui";
import {
  DESTINY_BOON_TEXT,
  DESTINY_ERROR_TEXT,
  DESTINY_RARITY_NAME,
  NO_ROSTER_FILTER,
  aliveIds,
  companionsByLevel,
  filterRosterIds,
  rosterFilterActive,
  type RosterFilter,
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
import { ModeGuideTabs } from "../ModeGuide";
import ModeTierPanel from "../leaderboard/ModeTierPanel";

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
    /** Cấp của cả ba đối thủ; thiếu khi máy chủ còn bản cũ. */
    readonly foeLevel?: number;
    readonly foes: readonly {
      readonly id: string;
      readonly name: string;
      readonly element?: Element;
      readonly profession?: Profession;
      readonly maxHp?: number;
    }[];
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

/** Hệ, nghề (biểu tượng kèm chữ) và cấp của một tướng, dùng chung cho mọi thẻ tướng của màn. */
function FighterMeta({ element, profession, level, children }: {
  element: Element;
  profession: Profession;
  level?: number;
  children?: ReactNode;
}) {
  return (
    <span className="flex min-w-0 items-center gap-x-1 text-caption font-normal opacity-80">
      <ElementIcon element={element} className="size-3.5 shrink-0" />
      <ProfessionIcon profession={profession} className="size-3.5 shrink-0" />
      <span className="truncate">{ELEMENT_NAME[element]} · {PROFESSION_NAME[profession]}{level === undefined ? "" : ` · Cấp ${level}`}</span>
      {children}
    </span>
  );
}

/** Một hàng nút chọn hệ hoặc nghề của Đinh Bộ Lĩnh: biểu tượng lớn, tên nhỏ bên dưới; lựa chọn không hợp luật thì mờ. */
function BuildRow<T extends string>({ label, values, value, names, icon, allowed, onPick, badge }: {
  label: string;
  values: readonly T[];
  value: T;
  names: Readonly<Record<T, string>>;
  icon: (value: T) => ReactNode;
  allowed: (value: T) => boolean;
  onPick: (value: T) => void;
  /** Dấu nhỏ ở góc trái trên (★ khắc địch cho hàng Hệ). */
  badge?: (value: T) => ReactNode;
}) {
  return (
    <div role="group" aria-label={`${label} của Đinh Bộ Lĩnh`} className="flex flex-col gap-1.5">
      <span className="text-caption text-on-wood-soft">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => {
          const ok = allowed(v);
          return (
            <ChoiceChip key={v} selected={v === value} disabled={!ok} onClick={() => onPick(v)}
              aria-label={ok ? names[v] : `${names[v]}, không hợp luật tầng`}
              title={ok ? names[v] : `${names[v]}: không hợp luật tầng với hai tướng đang chọn`}
              className="relative min-h-14 w-[4.25rem] flex-col gap-0.5 px-1 py-1.5 pointer-coarse:min-h-14">
              {badge && <span className="absolute left-1 top-0.5 text-caption leading-none">{badge(v)}</span>}
              {icon(v)}
              <span className="whitespace-nowrap text-caption font-normal">{names[v]}</span>
            </ChoiceChip>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Hành trình các tầng: dòng tóm tắt (đang ở đâu, kỷ lục, mốc đá kế) và một đường đi gồm các chặng độ khó.
 * Mỗi tầng là một nút tròn nối nhau: xanh là đã vượt trong lượt leo này, vàng là tầng sắp đánh,
 * viền vàng đứt là tầng đã vượt ở lượt leo trước của chu kỳ. Tầng có mốc Đá Cường Hóa mang dấu ◆ nhỏ ở góc nút
 * (vàng là chưa nhận, xanh là đã nhận). Bấm một tầng (mặc định là tầng sắp đánh) thì dòng dưới hành trình ghi độ khó,
 * cấp đối thủ, trạng thái và mốc đá của tầng đó; cách này dùng được cả trên điện thoại, nơi không rê chuột được.
 */
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
  const nextMilestone = milestones.find((m) => !claimed.includes(m.id)) ?? null;
  const percent = Math.round(100 * Math.min(cleared, floorCount) / Math.max(1, floorCount));
  const here = current ?? (cleared > 0 ? cleared : null);
  const [picked, setPicked] = useState<number | null>(null);
  const shown = Math.max(1, Math.min(floorCount, picked ?? here ?? 1));
  const floorInfo = (floor: number) => {
    const milestone = milestones.find((m) => m.floor === floor) ?? null;
    const got = milestone ? claimed.includes(milestone.id) : false;
    const state = floor <= cleared ? "cleared" : floor === current ? "current" : floor <= best ? "record" : "ahead";
    const status = state === "cleared" ? "đã vượt" : state === "current" ? "sắp đánh" : state === "record" ? "đã vượt ở lượt leo trước" : "chưa tới";
    return { milestone, got, state, status, level: destinyFloorFoeLevel(floor, floorCount) } as const;
  };
  const shownInfo = floorInfo(shown);
  const shownSpan = spans.find((span) => shown >= span.from && shown <= span.to);
  return (
    <OrnateFrame className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h2 className="ui-title-on-wood text-lg">Hành trình {floorCount} tầng</h2>
          <p className="text-sm text-on-wood-soft">
            {current !== null ? `Sắp đánh tầng ${current}.`
              : cleared >= floorCount ? "Đã chinh phục trọn tháp."
              : cleared > 0 ? `Vừa vượt tầng ${cleared}, chờ nhận thưởng.`
              : "Chưa có lượt leo. Khóa đội hình để bắt đầu từ tầng 1."}
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-2 text-center max-sm:w-full">
          {[
            { label: "Lượt leo này", value: `${cleared}/${floorCount}` },
            { label: "Kỷ lục", value: `${best}/${floorCount}` },
            {
              label: "Mốc đá kế",
              value: nextMilestone ? `Tầng ${nextMilestone.floor} · +${nextMilestone.stones}` : milestones.length > 0 ? "Đã nhận đủ" : "—",
            },
          ].map((item) => (
            <div key={item.label} className="ui-frame-inset min-w-24 px-3 py-1.5">
              <dt className="text-caption text-on-wood-soft">{item.label}</dt>
              <dd className="text-sm font-bold text-title-on-wood tabular-nums">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="h-1.5 overflow-hidden rounded bg-black/40" role="progressbar" aria-label="Tiến độ lượt leo"
        aria-valuemin={0} aria-valuemax={floorCount} aria-valuenow={Math.min(cleared, floorCount)}>
        <div className="h-full bg-jade" style={{ width: `${percent}%` }} />
      </div>
      {milestones.length > 0 && (
        <p className="-mb-1 text-caption text-on-wood-soft">
          <span className="text-frame-gold">◆</span> là mốc Đá Cường Hóa
        </p>
      )}

      <ol className="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-4" aria-label="Các chặng của tháp">
        {spans.map((span) => {
          const floors = Array.from({ length: span.to - span.from + 1 }, (_, i) => span.from + i);
          const active = here !== null && here >= span.from && here <= span.to;
          return (
            <li key={span.tier} className={cn("ui-frame-inset min-w-0 px-1 pb-2 pt-2.5 sm:px-2", active && "border-frame-gold/60")}>
              <p className={cn("mb-2 px-1 text-sm font-bold", active ? "text-frame-gold" : "text-on-wood")}>
                {difficultyName(span.difficulty)}
              </p>
              <ol className="flex" aria-label={`Chặng ${difficultyName(span.difficulty)}`}>
                {floors.map((floor, index) => {
                  const { milestone, got, state, status, level } = floorInfo(floor);
                  const label = `Tầng ${floor}, đối thủ cấp ${level}, ${status}` +
                    (milestone ? `, mốc ${milestone.stones} Đá Cường Hóa${got ? " (đã nhận)" : ""}` : "");
                  return (
                    <li key={floor} aria-current={state === "current" ? "step" : undefined}
                      className="relative flex min-w-0 flex-1 flex-col items-center">
                      {index > 0 && (
                        <span aria-hidden className={cn(
                          "absolute right-1/2 top-3.5 h-0.5 w-full -translate-y-1/2 sm:top-4",
                          floor <= cleared || floor === current ? "bg-jade/60" : "bg-white/10",
                        )} />
                      )}
                      <button type="button" title={label} aria-label={label} aria-pressed={floor === shown}
                        aria-controls="destiny-floor-detail" onClick={() => setPicked(floor)}
                        className="relative flex min-h-9 w-full items-start justify-center rounded focus-visible:outline-2 focus-visible:outline-frame-gold pointer-coarse:min-h-11">
                      <span aria-hidden className={cn(
                        "relative flex size-7 items-center justify-center rounded-full border-2 text-caption leading-none tabular-nums sm:size-8 sm:text-sm",
                        floor === shown && "ring-2 ring-on-wood/70 ring-offset-1 ring-offset-wood-inset",
                        state === "cleared" && "border-jade bg-jade/20 font-semibold text-jade",
                        state === "current" && "border-frame-gold bg-frame-gold font-bold text-brand-ink shadow-[0_0_0_3px_rgb(212_162_76/0.25)]",
                        state === "record" && "border-dashed border-frame-gold/70 bg-wood-inset text-frame-gold",
                        state === "ahead" && "border-white/15 bg-wood-inset text-on-wood-soft",
                      )}>
                        {floor}
                        {milestone && (
                          <span className={cn(
                            "absolute -right-1 -top-1 text-[11px] leading-none drop-shadow",
                            got ? "text-jade" : "text-frame-gold",
                          )}>◆</span>
                        )}
                      </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </li>
          );
        })}
      </ol>

      <p id="destiny-floor-detail" aria-live="polite"
        className="ui-frame-inset flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm text-on-wood">
        <strong className="text-title-on-wood">Tầng {shown}</strong>
        {shownSpan && <span>{difficultyName(shownSpan.difficulty)}</span>}
        <span>Đối thủ <strong className="text-frame-gold">cấp {shownInfo.level}</strong></span>
        <span className="text-on-wood-soft">{shownInfo.status.charAt(0).toUpperCase() + shownInfo.status.slice(1)}</span>
        {shownInfo.milestone && (
          <span className={shownInfo.got ? "text-jade" : "text-frame-gold"}>
            ◆ Mốc {shownInfo.milestone.stones} Đá Cường Hóa{shownInfo.got ? " (đã nhận)" : ""}
          </span>
        )}
        <span className="ml-auto text-caption text-on-wood-soft">Bấm tầng khác để xem</span>
      </p>
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
  // Danh sách tướng chọn vào đội, cấp cao trước, qua bộ lọc: cắt trang 12 (chọn giữ nguyên khi sang trang).
  // Hook đặt trước các return sớm.
  const rosterIds = useMemo(() => (profile ? companionsByLevel(profile) : []), [profile]);
  const [rosterFilter, setRosterFilter] = useState<RosterFilter>(NO_ROSTER_FILTER);
  const shownRosterIds = useMemo(
    () => filterRosterIds(rosterIds, roster, rosterFilter, companionById, fold),
    [rosterIds, roster, rosterFilter],
  );
  const pagedRoster = usePagedItems(shownRosterIds, 12);
  const ownedProfessions = useMemo(
    () => PROFESSIONS.filter((p) => rosterIds.some((id) => companionById(id)?.profession === p)),
    [rosterIds],
  );
  const changeFilter = (next: Partial<RosterFilter>) => {
    setRosterFilter((current) => ({ ...current, ...next }));
    pagedRoster.setPage(0);
  };

  const load = useCallback(async () => {
    const [destiny, stored] = await Promise.all([
      requestJson<DestinyOverview>("/api/destiny"),
      requestJson<{ profile?: Profile }>("/api/profile"),
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
      // Gợi ý sẵn các tướng cấp cao nhất, vừa đủ giới hạn đội hình.
      setRoster([MAIN_ID, ...companionsByLevel(stored.profile).slice(0, DESTINY_ROSTER_MAX - 1)]);
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
  // Bước chuẩn bị: hai tướng đang chọn nằm ở hàng "Ra trận", phần còn lại cắt trang 6; tướng chọn được xếp trước.
  const companions = useMemo(() => (run && rules ? destinyCompanionOptions(run, rules, active) : []), [run, rules, active]);
  const picked = companions.filter((c) => c.selected);
  const bench = useMemo(() => {
    const rank = (c: (typeof companions)[number]) => (c.hp <= 0 ? 2 : c.reason && !c.reason.startsWith("Đã đủ") ? 1 : 0);
    return companions.filter((c) => !c.selected).sort((x, y) => rank(x) - rank(y));
  }, [companions]);
  const pagedBench = usePagedItems(bench, 6);
  // Đội hình đã khóa: cắt trang 6 để hai cột Đội hình và Chuẩn bị cao gần bằng nhau.
  const pagedSquad = usePagedItems(run?.roster ?? [], 6);
  const builds = useMemo(() => run && rules ? legalLeaderBuilds(run, rules, active) : [], [run, rules, active]);
  const chosenBuild = build ?? (run && rules ? defaultDestinyBuild(run, rules, active) : null);
  const chosenOffer = run?.offer && offerIndex !== null ? run.offer[offerIndex] : null;
  const candidates = chosenOffer && run ? rewardCandidates(run, chosenOffer) : [];
  const leaderNeedsRescue = !!run?.fighters?.[MAIN_ID] &&
    (run.fighters[MAIN_ID]!.downed || run.fighters[MAIN_ID]!.hp <= 0);

  const fail = (error?: string) => setMessage(DESTINY_ERROR_TEXT[error ?? "network"] ?? "Lệnh chưa thành. Xin tải lại trang.");
  const refreshAfter = async () => { await load(); setBusy(false); };

  const startRun = async () => {
    setBusy(true); setMessage(null);
    const result = await postJson<ApiResult>("/api/destiny/run", { rosterIds: roster });
    if (!result?.ok) { setBusy(false); fail(result?.error); return; }
    await refreshAfter();
  };

  const startBattle = async () => {
    if (!chosenBuild) return;
    setBusy(true); setMessage(null);
    const result = await postJson<ApiResult>("/api/destiny/battles", { activeIds: active, leaderBuild: chosenBuild });
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
    const result = await postJson<ApiResult>("/api/destiny/reward", { floor: run.floor, index: offerIndex, targetIds: targets });
    if (!result?.ok) { setBusy(false); fail(result?.error); return; }
    await refreshAfter();
  };

  const stop = async () => {
    setBusy(true); setMessage(null);
    const result = await postJson<ApiResult>("/api/destiny/stop");
    if (!result?.ok) { setBusy(false); fail(result?.error); return; }
    await refreshAfter();
  };

  if (!overview || !profile) return (
    <ModeScreen card label="Tháp Thiên Mệnh">
      {failed ? (
        <div className="py-24 text-center text-on-wood-soft">
          <p role="alert">Chưa mở được cửa Tháp Thiên Mệnh. Xin tải lại trang.</p>
          <Button variant="secondary" className="mt-3 min-h-11" onClick={() => void load()}>Tải lại</Button>
        </div>
      ) : <ModeSkeleton label="Đang tải Tháp Thiên Mệnh…" />}
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
  const foeLevel = overview.floor?.foeLevel;
  /** Đối thủ tầng sắp đánh, để gắn ★ cho tướng khắc hệ. */
  const floorFoes: readonly CounterFoe[] = overview.floor?.foes ?? [];
  const companionMax = Math.min(DESTINY_ROSTER_MAX - 1, rosterIds.length);
  const rosterFull = roster.length >= DESTINY_ROSTER_MAX;
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
    <ModeScreen card label="Tháp Thiên Mệnh">
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
      <ModeGuideTabs scene="DESTINY" extraTabs={[{ value: "board", label: "Công trạng tuần", content: <><ModeTierPanel mode="destiny" /><DestinyBoardPanel /></> }]}>

      {message && <Alert className="p-3 text-sm" role="alert">{message}</Alert>}

      <FloorTrack floorCount={floorCount} version={version} cleared={clearedInRun} current={currentFloor} best={best}
        milestones={overview.milestones ?? []} claimed={overview.progress?.claimedMilestones ?? []} />

      {noActiveRun && (
        <OrnateFrame level="raised">
          {run?.completed && (
            <Alert className="mb-4 p-3 text-sm">
              <strong>Đã chinh phục trọn {run.floor} tầng.</strong> Thành tích đã ghi vào bảng công trạng chu kỳ.
              Muốn lên hạng, hãy leo lại và vượt tháp với ít lượt đánh hơn.
            </Alert>
          )}
          <SectionTitle description={!run?.completed && run?.phase === "done"
            ? `Lượt leo trước dừng ở tầng ${run.floor}. Khóa đội hình mới để leo lại từ tầng 1.`
            : "Mỗi lượt leo bắt đầu từ tầng 1."}>
            Khóa đội hình
          </SectionTitle>
          <ul className="list-disc space-y-1 pl-5 text-sm text-on-wood">
            <li>Đinh Bộ Lĩnh luôn ra trận; chọn thêm ít nhất {DESTINY_ROSTER_MIN - 1} và nhiều nhất {DESTINY_ROSTER_MAX - 1} tướng.</li>
            <li>Đội hình khóa tới hết lượt leo: không thêm, bớt hay đổi tướng giữa chừng.</li>
            <li>Mỗi tầng ba người ra trận, số còn lại dự bị. Mang nhiều tướng thì có người thay khi đồng đội bị thương và dễ đáp ứng luật từng tầng.</li>
            <li>Đối thủ mạnh dần theo tầng, không phụ thuộc đội hình: tầng 1 cấp 1, tăng đều tới tầng {floorCount} cấp {destinyFloorFoeLevel(floorCount, floorCount)}.</li>
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="ui-title-on-wood text-base">
              Đã chọn {Math.max(0, roster.length - 1)}/{companionMax} tướng{" "}
              <span className="text-sm font-normal text-on-wood-soft">· bạn có {rosterIds.length} tướng</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              <ChoiceChip selected={false} onClick={() => setRoster([MAIN_ID, ...rosterIds.slice(0, DESTINY_ROSTER_MAX - 1)])}>
                {rosterIds.length > companionMax ? `Chọn ${companionMax} tướng cấp cao nhất` : "Chọn tất cả"}
              </ChoiceChip>
              <ChoiceChip selected={false} disabled={roster.length <= 1} onClick={() => setRoster([MAIN_ID])}>Bỏ chọn hết</ChoiceChip>
            </div>
          </div>
          {roster.length > 1 && (
            <ul aria-label="Đội hình đang chọn" className="mt-3 flex flex-wrap gap-1.5">
              {roster.filter((id) => id !== MAIN_ID).map((id) => {
                const c = companionById(id);
                if (!c) return null;
                return (
                  <li key={id}>
                    <button type="button" onClick={() => setRoster(roster.filter((x) => x !== id))}
                      aria-label={`Bỏ ${c.name} khỏi đội hình`} title={`Bỏ ${c.name} khỏi đội hình`}
                      className={choiceVariants({ size: "sm", className: "gap-1.5 py-1 pl-1 pr-2 font-normal" })}>
                      <Portrait id={id} element={c.element} profession={c.profession} className="size-7 shrink-0" />
                      <span className="max-w-24 truncate text-caption">{c.name}</span>
                      <span aria-hidden className="text-caption opacity-60">✕</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div role="group" aria-label="Lọc tướng" className="mt-3 flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <input type="search" value={rosterFilter.query} onChange={(e) => changeFilter({ query: e.target.value })}
                placeholder="Tìm tên…" aria-label="Tìm tướng theo tên"
                className="min-h-9 w-40 rounded-control border border-frame-line bg-wood-inset px-2 text-sm text-on-wood placeholder:text-on-wood-soft pointer-coarse:min-h-11" />
              <ChoiceChip selected={rosterFilter.pickedOnly} onClick={() => changeFilter({ pickedOnly: !rosterFilter.pickedOnly })}>
                Chỉ đã chọn
              </ChoiceChip>
              {rosterFilterActive(rosterFilter) && (
                <ChoiceChip selected={false} onClick={() => changeFilter(NO_ROSTER_FILTER)}>
                  Bỏ lọc
                </ChoiceChip>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Lọc theo hệ">
              <span className="w-10 shrink-0 text-caption text-on-wood-soft">Hệ</span>
              {ELEMENTS.map((element) => (
                <ChoiceChip key={element} selected={rosterFilter.element === element} title={ELEMENT_NAME[element]}
                  aria-label={`Hệ ${ELEMENT_NAME[element]}`} className="px-2"
                  onClick={() => changeFilter({ element: rosterFilter.element === element ? null : element })}>
                  <ElementIcon element={element} className="size-4" />
                </ChoiceChip>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Lọc theo nghề">
              <span className="w-10 shrink-0 text-caption text-on-wood-soft">Nghề</span>
              {ownedProfessions.map((profession) => (
                <ChoiceChip key={profession} selected={rosterFilter.profession === profession} title={PROFESSION_NAME[profession]}
                  aria-label={`Nghề ${PROFESSION_NAME[profession]}`} className="px-2"
                  onClick={() => changeFilter({ profession: rosterFilter.profession === profession ? null : profession })}>
                  <ProfessionIcon profession={profession} className="size-4" />
                </ChoiceChip>
              ))}
            </div>
            {rosterFilterActive(rosterFilter) && (
              <p className="text-caption text-on-wood-soft" role="status">
                {shownRosterIds.length === 0 ? "Không có tướng nào khớp bộ lọc." : `${shownRosterIds.length} tướng khớp bộ lọc.`}
              </p>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-3">
            {pagedRoster.pageItems.map((id) => {
              const companion = companionById(id);
              if (!companion) return null;
              const selected = roster.includes(id);
              return (
                <ChoiceChip key={id} size="md" selected={selected} disabled={!selected && rosterFull}
                  title={!selected && rosterFull ? `Đã đủ ${DESTINY_ROSTER_MAX - 1} tướng, bỏ chọn một người để đổi` : undefined}
                  onClick={() => setRoster(selected ? roster.filter((x) => x !== id) : [...roster, id])}
                  className="items-center justify-start gap-2.5 p-2.5 text-left">
                  <Portrait id={id} element={companion.element} profession={companion.profession} className="size-12 shrink-0" />
                  <span className="flex min-w-0 flex-col">
                    <strong>{companion.name}</strong>
                    <FighterMeta element={companion.element} profession={companion.profession} level={progressOf(profile, id).level} />
                  </span>
                </ChoiceChip>
              );
            })}
          </div>
          <PageControls paged={pagedRoster} label="Phân trang tướng" className="mt-2" />
          {rosterFull && rosterIds.length > companionMax && (
            <p className="mt-3 text-sm text-on-wood-soft">Đã đủ {companionMax} tướng. Muốn đổi thì bỏ chọn một người trước.</p>
          )}
          {roster.length < DESTINY_ROSTER_MIN && (
            <p className="mt-3 text-sm text-danger">Cần chọn thêm {DESTINY_ROSTER_MIN - roster.length} tướng nữa.</p>
          )}
          <Button disabled={busy || roster.length < DESTINY_ROSTER_MIN || roster.length > DESTINY_ROSTER_MAX} onClick={() => void startRun()} className="mt-4 min-h-11">
            {busy ? "Đang khóa đội hình…" : `Khóa đội hình và bắt đầu leo`}
          </Button>
        </OrnateFrame>
      )}

      {run && run.active && (
        <section className="grid gap-4 sm:gap-5 lg:grid-cols-[1fr_1.4fr]">
          <OrnateFrame className="order-2 min-w-0 self-start lg:order-1">
            <SectionTitle description={`${run.roster.length} tướng · Lương ${run.food}/${DESTINY_FOOD_MAX} · Mỗi tướng có thanh Nộ riêng, giữ qua các tầng`}>Đội hình</SectionTitle>
            <ul className="space-y-2">
              {pagedSquad.pageItems.map((id) => {
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
                        <div className="text-on-wood-soft">
                          {id === MAIN_ID
                            ? <p className="text-caption">Thủ lĩnh · Cấp {f.level} · đổi nghề và hệ trước mỗi tầng</p>
                            : <FighterMeta element={f.config.element} profession={f.config.profession} level={f.level} />}
                          <p className="text-caption">
                            {f.downed ? "Cần Cứu viện để ra trận lại" : `Năng lượng ${f.energy} · Nộ ${destinyRageOf(run, id)}/${RAGE_MAX}`}
                            {onField && id !== MAIN_ID && <strong className="text-frame-gold"> · Ra trận</strong>}
                          </p>
                        </div>
                        <div className="mt-1.5"><HpBar hp={f.hp} maxHp={f.config.maxHp} /></div>
                      </div>
                    </FrameInset>
                  </li>
                );
              })}
            </ul>
            <PageControls paged={pagedSquad} label="Phân trang đội hình" className="mt-2" />
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
                <SectionTitle description={`Độ khó ${difficultyName(overview.floor?.difficulty)}${foeLevel ? ` · Đối thủ cấp ${foeLevel}` : ""}`}>
                  Chuẩn bị tầng {run.floor}/{floorCount}
                </SectionTitle>

                <h3 className="ui-title-on-wood mb-1.5 text-base">Đối thủ</h3>
                <ul className="grid gap-2 sm:grid-cols-3">
                  {(overview.floor?.foes ?? []).map((foe) => (
                    <li key={foe.id} className="ui-frame-inset flex min-w-0 items-center gap-2 p-2">
                      {foe.element && foe.profession && (
                        <Portrait id={foe.id} element={foe.element} profession={foe.profession} className="size-10 shrink-0" />
                      )}
                      <span className="flex min-w-0 flex-col text-on-wood-soft">
                        <strong className="truncate text-sm text-on-wood">{foe.name}</strong>
                        {foe.element && foe.profession && (
                          <FighterMeta element={foe.element} profession={foe.profession} level={foeLevel} />
                        )}
                        {foe.maxHp !== undefined && <span className="text-caption">Máu {foe.maxHp}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
                {foeLevel !== undefined && (
                  <p className="mt-1.5 text-caption text-on-wood-soft">
                    Cấp đối thủ tăng đều theo tầng: tầng 1 cấp 1, tầng {floorCount} cấp {destinyFloorFoeLevel(floorCount, floorCount)}.
                  </p>
                )}

                <h3 className="ui-title-on-wood mt-4 mb-1.5 text-base">Luật tầng</h3>
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

                <h3 className="ui-title-on-wood mt-4 mb-1.5 text-base">
                  Chọn 2 tướng ra trận <span className="text-sm font-normal text-on-wood-soft">(đã chọn {pickedCount}/2)</span>
                </h3>
                <p className="mb-2 text-caption text-on-wood-soft"><span className="font-bold text-jade">★</span> tướng có hệ khắc ít nhất một đối thủ tầng này.</p>
                <ul aria-label="Tướng ra trận đã chọn" className="mb-3 grid gap-2 sm:grid-cols-2">
                  {[0, 1].map((slot) => {
                    const c = picked[slot];
                    return (
                      <li key={c?.id ?? `empty-${slot}`}>
                        {c ? (
                          <button type="button" aria-pressed aria-label={`Bỏ chọn ${c.name}`}
                            onClick={() => { setActive(active.filter((x) => x !== c.id)); setBuild(null); }}
                            className={choiceVariants({ className: "w-full items-center justify-start gap-2.5 p-2.5 text-left" })}>
                            <Portrait id={c.id} element={c.element} profession={c.profession} className="size-11 shrink-0" />
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                              <span className="flex min-w-0 items-center gap-1"><strong className="truncate">{c.name}</strong><CounterStar element={c.element} foes={floorFoes} /></span>
                              <FighterMeta element={c.element} profession={c.profession} level={run.fighters?.[c.id]?.level} />
                              <span className="text-caption font-normal opacity-80">Máu {c.hp}/{c.maxHp}</span>
                              <HpBar hp={c.hp} maxHp={c.maxHp} />
                            </span>
                            <span aria-hidden className="shrink-0 self-start text-caption font-normal opacity-70">Bỏ</span>
                          </button>
                        ) : (
                          <div className="ui-frame-inset flex h-full min-h-14 items-center justify-center p-2 text-center text-caption text-on-wood-soft">
                            Chưa chọn tướng thứ {slot + 1}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <ul aria-label="Tướng có thể chọn" className="grid gap-2 sm:grid-cols-2">
                  {pagedBench.pageItems.map((c) => (
                    <li key={c.id}>
                      <ChoiceChip size="md" selected={false} disabled={c.disabled} title={c.reason ?? undefined}
                        aria-label={c.reason ? `${c.name}, ${c.reason.toLowerCase()}` : undefined}
                        onClick={() => { setActive([...active, c.id]); setBuild(null); }}
                        className="w-full items-center justify-start gap-2.5 p-2.5 text-left">
                        <Portrait id={c.id} element={c.element} profession={c.profession} className="size-11 shrink-0" />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="flex min-w-0 items-center gap-1"><strong className="truncate">{c.name}</strong><CounterStar element={c.element} foes={floorFoes} /></span>
                          <FighterMeta element={c.element} profession={c.profession} level={run.fighters?.[c.id]?.level} />
                          <span className="text-caption font-normal opacity-80">{c.hp > 0 ? `Máu ${c.hp}/${c.maxHp}` : "Đã gục, cần Cứu viện"}</span>
                          {c.hp > 0 && <HpBar hp={c.hp} maxHp={c.maxHp} />}
                        </span>
                      </ChoiceChip>
                    </li>
                  ))}
                </ul>
                <PageControls paged={pagedBench} label="Phân trang tướng ra trận" className="mt-2" />

                <h3 className="ui-title-on-wood mt-4 mb-1.5 text-base">Nghề và hệ của Đinh Bộ Lĩnh</h3>
                <p className="mb-2 text-sm text-on-wood-soft">
                  Đổi miễn phí trước mỗi tầng. Lựa chọn bị mờ là không hợp luật tầng với hai tướng đang chọn.
                </p>
                {pickedCount === 2 && chosenBuild && builds.length > 0 && (
                  <FrameInset className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Portrait id={MAIN_ID} element={chosenBuild.element} profession={chosenBuild.profession} className="size-12 shrink-0" />
                      <div className="min-w-0 text-sm text-on-wood">
                        <p className="flex flex-wrap items-center gap-x-1 font-semibold">
                          Đinh Bộ Lĩnh <CounterStar element={chosenBuild.element} foes={floorFoes} />
                          <span className="font-normal text-on-wood-soft">(thủ lĩnh, luôn ra trận)</span>
                        </p>
                        <FighterMeta element={chosenBuild.element} profession={chosenBuild.profession} level={run.fighters?.[MAIN_ID]?.level} />
                      </div>
                    </div>
                    <BuildRow label="Hệ" values={ELEMENTS} value={chosenBuild.element} names={ELEMENT_NAME}
                      icon={(element) => <ElementIcon element={element} className="size-5" />}
                      badge={(element) => <CounterStar element={element} foes={floorFoes} />}
                      allowed={(element) => builds.some((b) => b.element === element)}
                      onPick={(element) => pickBuild({ element })} />
                    <BuildRow label="Nghề" values={PROFESSIONS} value={chosenBuild.profession} names={PROFESSION_NAME}
                      icon={(profession) => <ProfessionIcon profession={profession} className="size-5" />}
                      allowed={(profession) => builds.some((b) => b.profession === profession)}
                      onPick={(profession) => pickBuild({ profession })} />
                  </FrameInset>
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
                  Ban thưởng tầng {run.floor}
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
      </ModeGuideTabs>
    </ModeScreen>
  );
}
