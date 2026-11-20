"use client";

import { ModeBanner, ModeScreen, ModeSkeleton, OrnateFrame, SectionTitle } from "@/components/game-ui";
import { Alert, Button, ChoiceChip, buttonVariants } from "@/components/ui";
import { PageControls, usePagedItems } from "@/components/ui/Pagination";
import { cn } from "@/lib/cn";

// Trấn Ải: chọn đội phòng thủ và doanh trại trước khi bắt đầu lượt chơi mới; có lượt chơi đang dở (hồ sơ trỏ tới
// trận còn mở) thì hiện tiến độ để vào lại hoặc dừng ghi điểm.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MAIN_ID,
  newSurvivalRun,
  ownsCompanion,
  profileTeam,
  progressOf,
  SURVIVAL_BOSS_EVERY,
  SURVIVAL_FOOD,
  SURVIVAL_HEAL,
  SURVIVAL_RESERVE_HEAL,
  SURVIVAL_REVIVE_FOOD,
  SURVIVAL_REVIVE_HP,
  SURVIVAL_REVIVE_WAVES,
  SURVIVAL_WAVE_GOLD,
  survivalWave,
  ELEMENTS,
  type Element,
  type FighterConfig,
  type MatchView,
  type GearItem,
  SURVIVAL_TIERS,
  type SurvivalAction,
  type Profile,
} from "@/core";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { DIFFICULTY_NAME, ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import {
  actOnline,
  createOnline,
  fetchOnline,
  fetchProfile,
  ONLINE_BATTLE_KEY,
  ONLINE_ERROR_TEXT,
} from "../battle/online";
import RankRewardsPanel from "../rankRewards/RankRewardsPanel";
import { SeasonBoardPanel } from "../leaderboard/boards";
import { SceneLink, useScene } from "../SceneContext";
import {
  EMPTY_SURVIVAL_SLOTS,
  SURVIVAL_SLOT_LABEL,
  cleanSurvivalSlots,
  suggestSurvivalSlots,
  survivalRosterPayload,
  survivalTargetSlot,
  toggleSurvivalSlot,
  validateSurvivalRosterSelection,
  type SurvivalSlots,
} from "./roster-selection";
import { ModeGuideTabs } from "../ModeGuide";
import SurvivalBreakScreen from "./SurvivalBreakScreen";
import { TierLadder } from "../leaderboard/RankBoard";
import { SURVIVAL_LADDER, tierClaimNote, tierErrorNote, tierRewards } from "../arena/tiers";
import { ColumnFill } from "../ColumnFill";

const pct = (x: number) => `${Math.round(x * 100)}%`;

const SELECTION_ERROR: Record<
  NonNullable<ReturnType<typeof validateSurvivalRosterSelection>>,
  string
> = {
  activeCount: "Chọn đủ hai phó tướng cho đội phòng thủ.",
  duplicateFighter: "Mỗi tướng chỉ được chọn vào một vị trí.",
  unownedFighter: "Có tướng chưa chiêu mộ.",
  tooManyReserves: "Doanh Trại chỉ nhận tối đa hai tướng dự bị.",
};

const SLOTS_KEY = "coLau.survival.slots";

type ElementFilter = Element | "all";

/** Lượt chơi đang dở theo hồ sơ: id trận và view server; null là không có. */
interface OpenRun {
  readonly id: string;
  readonly view: MatchView;
}

function readSavedSlots(ownedIds: readonly string[]): SurvivalSlots | null {
  try {
    const raw = window.localStorage.getItem(SLOTS_KEY);
    return raw ? cleanSurvivalSlots(JSON.parse(raw), ownedIds) : null;
  } catch {
    return null;
  }
}

function saveSlots(slots: SurvivalSlots) {
  try {
    window.localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
  } catch {
    // Không nhớ được bản chọn thì lần sau chọn lại; không ảnh hưởng lượt chơi.
  }
}

export default function SurvivalScreen() {
  const { go } = useScene();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tierNote, setTierNote] = useState<string | null>(null);
  const [slots, setSlots] = useState<SurvivalSlots>(EMPTY_SURVIVAL_SLOTS);
  const [focus, setFocus] = useState<number | null>(null);
  const [filter, setFilter] = useState<ElementFilter>("all");
  const [openRun, setOpenRun] = useState<OpenRun | null>(null);
  /** Không đọc được trận đang dở (mạng): không cho mở lượt mới để khỏi chồng lượt. */
  const [runError, setRunError] = useState(false);

  const load = useCallback(async () => {
    const result = await fetchProfile();
    if (!result.profile) {
      setLoadError(true);
      return;
    }
    const loaded = result.profile;
    let run: OpenRun | null = null;
    let failed = false;
    if (loaded.survival.run) {
      const res = await fetchOnline(loaded.survival.run);
      if (res.view?.survival && !res.view.survival.done) run = { id: loaded.survival.run, view: res.view };
      else if (res.error === "network" || res.error === "conflict") failed = true;
      if (res.outcome?.survival)
        setNotice(`Lượt chơi trước đã khép lại: ghi ${res.outcome.survival.cleared} đợt, nhận ${res.outcome.survival.gold} vàng.`);
    }
    const owned = Object.keys(loaded.companions).filter((id) => ownsCompanion(loaded, id));
    setProfile(loaded);
    setLoadError(false);
    setOpenRun(run);
    setRunError(failed);
    setSlots(
      readSavedSlots(owned) ??
        cleanSurvivalSlots([loaded.team[0] ?? "", loaded.team[1] ?? "", "", ""], owned) ??
        EMPTY_SURVIVAL_SLOTS,
    );
    setFocus(null);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const ownedIds = useMemo(
    () => (profile ? Object.keys(profile.companions).filter((id) => ownsCompanion(profile, id)) : []),
    [profile],
  );
  const ownedFighters = useMemo(() => {
    if (!profile) return [];
    return profileTeam(profile, ownedIds)
      .slice(1)
      .map((fighter) => ({
        fighter,
        id: fighter.id,
        level: progressOf(profile, fighter.id).level,
        power: fighter.maxHp + 4 * fighter.atk + 4 * fighter.def,
      }))
      .sort((a, b) => b.level - a.level || b.power - a.power || a.fighter.name.localeCompare(b.fighter.name, "vi"));
  }, [ownedIds, profile]);
  const fighterById = useMemo(() => new Map(ownedFighters.map((entry) => [entry.id, entry])), [ownedFighters]);
  const shown = useMemo(
    () => (filter === "all" ? ownedFighters : ownedFighters.filter(({ fighter }) => fighter.element === filter)),
    [filter, ownedFighters],
  );
  const paged = usePagedItems(shown, 12);

  if (!profile) {
    return (
      <ModeScreen card label="Trấn Ải">
        {loadError ? (
          <div className="py-24 text-center text-on-wood-soft">
            <p>Chưa mở được hồ sơ. Xin kiểm tra mạng rồi thử lại.</p>
            <Button variant="secondary" type="button" onClick={() => { setLoadError(false); void load(); }} className="mt-4">
              Tải lại hồ sơ
            </Button>
          </div>
        ) : (
          <ModeSkeleton label="Đang tải Trấn Ải…" />
        )}
      </ModeScreen>
    );
  }

  const leader = profileTeam(profile, [])[0]!;
  const activeIds = slots.slice(0, 2);
  const reserveIds = slots.slice(2);
  const selectionError = validateSurvivalRosterSelection(ownedIds, activeIds, reserveIds);
  const target = survivalTargetSlot(slots, focus);
  // Xem trước đợt 1 với seed tạm; đối thủ thật do server bốc theo seed riêng của lượt chơi.
  const first = survivalWave(newSurvivalRun(profile, 0), 1);

  const changeSlots = (next: SurvivalSlots, nextFocus: number | null) => {
    setMessage(null);
    setSlots(next);
    setFocus(nextFocus);
    saveSlots(next);
  };

  const enterBattle = (id: string) => {
    try {
      window.localStorage.setItem(ONLINE_BATTLE_KEY, id);
    } catch {
      // Không lưu được thì phân cảnh trận không tự tiếp tục; người chơi vẫn bấm Tiếp tục ở đó được.
    }
    go("PLAYING", { resume: "1" });
  };

  const start = async () => {
    if (selectionError) {
      setMessage(SELECTION_ERROR[selectionError]);
      return;
    }
    setBusy(true);
    setMessage(null);
    const chosen = survivalRosterPayload(activeIds, reserveIds);
    const res = await createOnline({
      mode: "3v3",
      element: profile.element,
      profession: profile.profession,
      companions: chosen.companions,
      reserveCompanions: chosen.reserveCompanions,
      difficulty: "easy",
      survival: true,
    });
    if (!res.id) {
      setBusy(false);
      setMessage(ONLINE_ERROR_TEXT[res.error ?? "network"] ?? "Chưa bày được trận. Xin thử lại.");
      if (res.error === "survivalActive") void load();
      return;
    }
    enterBattle(res.id);
  };

  const claimTier = async (tier: string) => {
    setBusy(true);
    setTierNote(null);
    try {
      const res = await fetch("/api/survival/tier", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tier }) });
      const body = (await res.json()) as { claimed?: { tier: string; gold: number; item: GearItem | null; soldFor: number }; error?: string; profile?: Profile };
      if (body.profile) setProfile(body.profile);
      setTierNote(body.claimed ? tierClaimNote(body.claimed) : tierErrorNote(body.error, "kỷ lục số đợt"));
      // Cập nhật số vàng trên thanh đầu trang.
      if (body.claimed) void fetchProfile();
    } catch {
      setTierNote(ONLINE_ERROR_TEXT.network ?? "Mất kết nối, xin thử lại.");
    }
    setBusy(false);
  };

  const endRun = async (run: OpenRun) => {
    setBusy(true);
    setMessage(null);
    const res = await actOnline(run.id, run.view.seq, { type: "endRun" });
    if (res.outcome?.survival)
      setNotice(`Đã dừng Trấn Ải: ghi ${res.outcome.survival.cleared} đợt, nhận ${res.outcome.survival.gold} vàng${res.outcome.survival.newBest ? ", kỷ lục mới" : ""}.`);
    else if (res.error) setMessage(ONLINE_ERROR_TEXT[res.error] ?? "Chưa dừng được lượt chơi. Xin thử lại.");
    await load();
    setBusy(false);
  };

  const nextWave = async (run: OpenRun, action: SurvivalAction) => {
    setBusy(true);
    setMessage(null);
    const res = await actOnline(run.id, run.view.seq, action);
    if (res.view && !res.error) {
      enterBattle(run.id);
      return;
    }
    setMessage(ONLINE_ERROR_TEXT[res.error ?? "network"] ?? "Máy chủ chưa nhận đội hình này. Xin xem lại rồi thử lại.");
    await load();
    setBusy(false);
  };

  const slotCard = (index: number) => {
    const id = slots[index] ?? "";
    const entry = fighterById.get(id);
    const isTarget = target === index;
    return (
      <div
        key={index}
        className={cn(
          "relative min-w-0 rounded-lg border bg-wood-inset p-2 transition-colors",
          isTarget ? "border-frame-gold ring-1 ring-frame-gold/60" : "border-frame-line-soft",
        )}
      >
        <button
          type="button"
          aria-pressed={focus === index}
          aria-label={`${SURVIVAL_SLOT_LABEL[index]}: ${entry ? entry.fighter.name : "trống"}. Bấm để chọn ô này rồi chọn tướng bên dưới.`}
          disabled={busy}
          onClick={() => setFocus(focus === index ? null : index)}
          className="block w-full text-left"
        >
          <span className={cn("mb-1 block text-kicker", index < 2 ? "text-frame-gold" : "text-on-wood-soft")}>
            {SURVIVAL_SLOT_LABEL[index]}
            {isTarget && <span className="ml-1 normal-case text-jade">– đang chọn</span>}
          </span>
          {entry ? (
            <FighterSummary fighter={entry.fighter} level={entry.level} />
          ) : (
            <span className="flex h-11 items-center gap-2 text-caption text-on-wood-soft">
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-dashed border-frame-gold/40">+</span>
              {index < 2 ? "Chọn tướng ra trận" : "Không bắt buộc"}
            </span>
          )}
        </button>
        {entry && (
          <button
            type="button"
            aria-label={`Bỏ ${entry.fighter.name} khỏi ${SURVIVAL_SLOT_LABEL[index]}`}
            disabled={busy}
            onClick={() => {
              const next = [...slots] as [string, string, string, string];
              next[index] = "";
              changeSlots(next, index);
            }}
            className="absolute right-1 top-1 grid size-8 place-items-center rounded text-on-wood-soft hover:bg-black/30 hover:text-on-wood pointer-coarse:size-11"
          >
            ×
          </button>
        )}
      </div>
    );
  };

  // Đang nghỉ giữa đợt: màn chuẩn bị đợt kế ngay tại đây (không còn khung nổi trên bàn cờ).
  const runPanel = openRun && (openRun.view.battle.winner === 0 && openRun.view.survival ? (
    <SurvivalBreakScreen
      key={openRun.view.seq}
      survival={openRun.view.survival}
      pending={busy}
      error={null}
      onRefresh={() => void load()}
      onNext={(action) => void nextWave(openRun, action)}
      onEnd={() => void endRun(openRun)}
    />
  ) : (
    <OpenRunPanel run={openRun} busy={busy} onResume={() => enterBattle(openRun.id)} />
  ));

  const newRunPanel = !openRun && (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <OrnateFrame className="flex min-w-0 flex-col gap-4">
        <SectionTitle description="Đinh Bộ Lĩnh luôn là thủ lĩnh. Chọn hai phó tướng ra trận và tối đa hai dự bị ở Doanh Trại.">
          Đội phòng thủ
        </SectionTitle>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="min-w-0 rounded-lg border border-frame-gold/50 bg-wood-inset p-2">
            <span className="mb-1 block text-kicker text-frame-gold">Thủ lĩnh, cố định</span>
            <FighterSummary fighter={leader} level={profile.main.level} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {slotCard(0)}
            {slotCard(1)}
          </div>
        </div>
        <div>
          <h3 className="font-bold text-title">Doanh Trại – Dự bị</h3>
          <p className="mb-2 text-caption text-on-wood-soft">
            Dự bị không đánh trong đợt nhưng hồi {pct(SURVIVAL_RESERVE_HEAL)} máu mỗi lần nghỉ và thay người khi đồng đội gục.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {slotCard(2)}
            {slotCard(3)}
          </div>
        </div>

        <section aria-labelledby="survival-roster-title" className="flex flex-col gap-2 border-t border-frame-gold/25 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 id="survival-roster-title" className="font-bold text-title">
              Tướng quân đã có ({ownedFighters.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              <ChoiceChip
                selected={false}
                disabled={busy || ownedFighters.length < 2}
                onClick={() => changeSlots(suggestSurvivalSlots(ownedFighters), null)}
              >
                Tự chọn đội mạnh
              </ChoiceChip>
              <ChoiceChip
                selected={false}
                disabled={busy || slots.every((id) => !id)}
                onClick={() => changeSlots(EMPTY_SURVIVAL_SLOTS, 0)}
              >
                Bỏ chọn hết
              </ChoiceChip>
            </div>
          </div>
          <p className="text-caption text-on-wood-soft" role="status">
            {target !== null
              ? `Bấm một tướng để đặt vào ô ${SURVIVAL_SLOT_LABEL[target]}. Bấm tướng đã chọn để rút ra.`
              : "Đội đã đủ. Bấm một ô ở trên để thay người, hoặc bấm tướng đã chọn để rút ra."}
          </p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo hệ">
            <ChoiceChip selected={filter === "all"} onClick={() => setFilter("all")}>Tất cả</ChoiceChip>
            {ELEMENTS.map((element) => (
              <ChoiceChip key={element} selected={filter === element} onClick={() => setFilter(element)} className="gap-1">
                <ElementIcon element={element} className="size-4" />
                {ELEMENT_NAME[element]}
              </ChoiceChip>
            ))}
          </div>
          {shown.length === 0 ? (
            <p className="py-4 text-center text-sm text-on-wood-soft">Chưa có tướng hệ này.</p>
          ) : (
            <div {...paged.listProps} className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {paged.pageItems.map(({ fighter, level }) => {
                const at = slots.indexOf(fighter.id);
                return (
                  <ChoiceChip
                    key={fighter.id}
                    size="md"
                    selected={at >= 0}
                    disabled={busy || (at < 0 && target === null)}
                    onClick={() => {
                      const r = toggleSurvivalSlot(slots, fighter.id, focus);
                      changeSlots(r.slots, r.focus);
                    }}
                    className="items-center justify-start gap-2.5 p-2 text-left"
                  >
                    <Portrait id={fighter.id} element={fighter.element} profession={fighter.profession} className="size-11 shrink-0" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-baseline justify-between gap-1">
                        <strong className="truncate">{fighter.name}</strong>
                        <span className="shrink-0 text-caption font-normal opacity-80">cấp {level}</span>
                      </span>
                      <span className="text-caption font-normal opacity-80">
                        {ELEMENT_NAME[fighter.element]}, {PROFESSION_NAME[fighter.profession]}
                      </span>
                      <span className="text-caption font-normal opacity-80">
                        {at >= 0 ? SURVIVAL_SLOT_LABEL[at] : `${fighter.maxHp} máu, ${fighter.atk} công`}
                      </span>
                    </span>
                  </ChoiceChip>
                );
              })}
            </div>
          )}
          <PageControls paged={paged} label="Phân trang tướng" />
          <p className="text-caption text-on-wood-soft">
            Cấp, nghề, hệ và chỉ số được chụp vào lượt chơi khi bắt đầu. Bản chọn được nhớ cho lần sau.
          </p>
        </section>
      </OrnateFrame>

      <div className="flex min-w-0 flex-col gap-4">
        <OrnateFrame className="flex min-w-0 flex-col gap-3">
          <SectionTitle>Lượt chơi mới</SectionTitle>
          <ul className="list-disc space-y-1 pl-5 text-sm text-on-wood">
            <li>
              Đối thủ kéo đến theo đợt, mạnh dần trên cùng bàn cờ; cứ {SURVIVAL_BOSS_EVERY} đợt có một sứ quân dẫn quân.
            </li>
            <li>
              Hạ hết một đợt thì nghỉ: ra trận còn sống hồi {pct(SURVIVAL_HEAL)} máu, dự bị hồi {pct(SURVIVAL_RESERVE_HEAL)}, thêm {SURVIVAL_FOOD} lương.
              Người gục tự đứng dậy sau {SURVIVAL_REVIVE_WAVES} đợt, hoặc trả {SURVIVAL_REVIVE_FOOD} lương để đứng dậy ngay với {pct(SURVIVAL_REVIVE_HP)} máu.
            </li>
            <li>
              Lúc nghỉ có thể tạm nghỉ để quay lại sau: tiến độ giữ tới hết mùa tuần. Đang đánh dở một đợt mà bỏ quá 24 giờ thì dừng ở đợt cuối đã vượt.
            </li>
            <li>Mỗi đợt vượt qua thưởng {SURVIVAL_WAVE_GOLD} vàng; điểm mùa là số đợt cao nhất trong một lượt chơi.</li>
          </ul>
          <p className="text-sm text-on-wood-soft">
            Đợt 1: {first.foes.length} đối thủ cấp {first.level}, {DIFFICULTY_NAME[first.difficulty]}. Đối thủ mỗi lượt chơi một khác.
          </p>
          {selectionError && (
            <Alert tone="warning" className="p-3 text-sm">
              {SELECTION_ERROR[selectionError]}
            </Alert>
          )}
          {runError && (
            <Alert tone="warning" className="p-3 text-sm">
              Chưa đọc được lượt chơi đang dở. Xin tải lại trước khi mở lượt mới.{" "}
              <Button variant="link" size="sm" onClick={() => void load()}>Tải lại</Button>
            </Alert>
          )}
          <Button
            size="lg"
            type="button"
            disabled={busy || selectionError !== null || runError}
            onClick={() => void start()}
            className="min-h-11"
          >
            {busy ? "Đang vào trận…" : "Bắt đầu Trấn Ải"}
          </Button>
        </OrnateFrame>
        <ColumnFill mode="survival" />
      </div>
    </div>
  );

  return (
    <ModeScreen card label="Trấn Ải">
      <ModeBanner
        title="Trấn Ải"
        kicker="Giữ ải, vô hạn"
        art="/art/home/survival.webp"
        description="Đối thủ kéo đến theo đợt trên cùng một bàn cờ, mạnh dần qua từng đợt."
        stats={[
          { label: "Kỷ lục", value: `${profile.survival.best} đợt` },
          openRun
            ? { label: "Lượt đang dở", value: `Đã vượt ${openRun.view.survival!.cleared} đợt` }
            : { label: "Đinh Bộ Lĩnh", value: `Cấp ${profile.main.level}` },
        ]}
        actions={
          <SceneLink scene="PROFILE" className={buttonVariants({ variant: "secondary", className: "min-h-11" })}>
            Doanh Trại
          </SceneLink>
        }
      />
      <ModeGuideTabs
        scene="SURVIVAL"
        extraTabs={[
          {
            value: "board",
            label: "Công trạng",
            content: (
              <>
                <OrnateFrame className="flex flex-col gap-2">
                  <h3 className="font-bold text-frame-gold">Bậc Trấn Ải – kỷ lục {profile.survival.best} đợt</h3>
                  <TierLadder
                    tiers={SURVIVAL_LADDER}
                    score={profile.survival.best}
                    unit="đợt"
                    label="Bậc Trấn Ải"
                    rewards={tierRewards((id) => (profile.survivalTiers ?? []).includes(id), SURVIVAL_TIERS)}
                    onClaim={(i) => void claimTier(SURVIVAL_TIERS[i]!.id)}
                    busy={busy}
                  />
                  {tierNote && <p role="status" className="text-sm text-jade">{tierNote}</p>}
                  <p className="text-caption text-on-wood-soft">
                    Bậc theo kỷ lục số đợt vượt trong một lượt chơi. Lần đầu đạt mỗi bậc nhận vàng và một món trang bị hệ của Đinh Bộ
                    Lĩnh, mỗi bậc một lần.
                  </p>
                </OrnateFrame>
                <RankRewardsPanel mode="survival" />
                <SeasonBoardPanel board="survival" />
              </>
            ),
          },
        ]}
      >
        {notice && (
          <Alert tone="success" className="p-3 text-sm" role="status">
            {notice}
          </Alert>
        )}
        {message && (
          <Alert tone="error" className="p-3 text-sm" role="alert">
            {message}
          </Alert>
        )}
        {runPanel}
        {newRunPanel}
      </ModeGuideTabs>
    </ModeScreen>
  );
}

/** Lượt chơi đang đánh dở một đợt: máu ba tướng ra trận và nút vào lại trận. */
function OpenRunPanel({ run, busy, onResume }: { run: OpenRun; busy: boolean; onResume: () => void }) {
  const survival = run.view.survival!;
  const fighters = run.view.battle.sides[0].fighters;
  return (
    <OrnateFrame className="flex flex-col gap-4">
      <SectionTitle
        description={`Đồng hồ lượt vẫn chạy khi bạn rời trận; bỏ quá 24 giờ thì lượt chơi dừng ở đợt ${survival.cleared}.`}
      >
        Đang đánh dở đợt {survival.wave}, đã vượt {survival.cleared} đợt
      </SectionTitle>
      <ul className="grid gap-2 sm:grid-cols-3">
        {fighters.map((f) => {
          const ratio = f.maxHp > 0 ? Math.max(0, Math.min(100, (100 * f.hp) / f.maxHp)) : 0;
          return (
            <li key={f.id} className={cn("min-w-0 rounded-lg border border-frame-line-soft bg-wood-inset p-2", f.hp <= 0 && "opacity-70")}>
              <div className="flex items-center gap-2">
                <Portrait id={f.id} element={f.element} profession={f.profession} className={cn("size-10 shrink-0", f.hp <= 0 && "grayscale")} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-on-wood">{f.name}</p>
                  <p className={cn("text-caption", f.hp <= 0 ? "text-danger" : "text-on-wood-soft")}>
                    {f.hp <= 0 ? "Đã gục" : `Máu ${f.hp}/${f.maxHp}`}
                  </p>
                </div>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded bg-black/40" aria-hidden>
                <div className={cn("h-full", ratio < 30 ? "bg-danger" : "bg-jade")} style={{ width: `${ratio}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
      <Button size="lg" disabled={busy} onClick={onResume} className="min-h-11 self-start">
        Vào lại đợt {survival.wave}
      </Button>
    </OrnateFrame>
  );
}

function FighterSummary({
  fighter,
  level,
}: {
  fighter: FighterConfig;
  level: number;
}) {
  return (
    <div className="mb-2 flex min-w-0 items-center gap-2">
      <Portrait
        id={fighter.id}
        element={fighter.element}
        profession={fighter.profession}
        className="size-11 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-on-wood">
          {fighter.id === MAIN_ID ? "Đinh Bộ Lĩnh" : fighter.name}
          <span className="ml-1 text-caption font-normal text-on-wood-soft">
            cấp {level}
          </span>
        </p>
        <p className="flex flex-wrap items-center gap-x-1 text-caption text-on-wood-soft">
          <ElementIcon element={fighter.element} className="size-3.5" />
          {ELEMENT_NAME[fighter.element]}
          <span aria-hidden>–</span>
          <ProfessionIcon profession={fighter.profession} className="size-3.5" />
          {PROFESSION_NAME[fighter.profession]}
        </p>
        <p className="text-caption text-on-wood-soft">
          {fighter.maxHp} máu, {fighter.atk} công, {fighter.def} thủ
        </p>
      </div>
    </div>
  );
}
