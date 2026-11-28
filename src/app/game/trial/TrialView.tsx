"use client";

import { FrameDialog, FrameInset, ModeBanner, OrnateFrame, SurrenderButton } from "@/components/game-ui";
import { Alert, Button, ChoiceChip, Input, Tabs, choiceVariants } from "@/components/ui";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, CrownIcon, LockIcon, LockOpenIcon, SlidersIcon, SwordsIcon } from "@/components/ui/icons";
import { DESKTOP_FIT_QUERY, SHORT_FIT_QUERY, useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/cn";
import { PageControls, usePagedItems } from "@/components/ui/Pagination";

// Giao diện thuần của Tháp Thí Luyện: nhận dữ liệu và callback qua props (không tự gọi mạng, không dùng context
// phân cảnh) nên dựng được ở mọi nơi. Server là nguồn sự thật: số đá, "đã nhận" và kỷ lục chỉ hiện đúng như
// server trả; client không tự cộng.

import { useRef, useState } from "react";
import { MAIN_ID, type Element, type Profession, type Profile } from "@/core";
import { CounterStar, type CounterFoe } from "../art/CounterStar";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { DIFFICULTY_NAME, ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import {
  companionOptions,
  defaultBuild,
  describeRules,
  describeWin,
  firstClearText,
  foeInfo,
  formatDateKey,
  formatSweepTime,
  isBossFloor,
  nextSweepTierHint,
  stageIndexOf,
  trialStages,
  unclaimedStones,
  FLOOR_STATE_TEXT,
  leaderPicker,
  lineupErrorText,
  lockedHint,
  navigateIndex,
  NAV_KEYS,
  previewLineup,
  RULE_TAG,
  sweepButtonState,
  type CompanionOption,
  type LeaderBuild,
  type LeaderPick,
  type TrialFloorEntry,
  type TrialOverview,
} from "./trial-ui";
import { ModeGuideTabs } from "../ModeGuide";
import { HeroFilterBar, filterHeroes, useHeroFilter } from "../arena/HeroFilterBar";
import { ColumnFill } from "../ColumnFill";

/** Số cột của lưới tầng ở mọi bề rộng (khớp class grid-cols-5 bên dưới). Dùng cho phím lên/xuống. */
export const FLOOR_GRID_COLUMNS = 5;

export interface TrialViewProps {
  readonly overview: TrialOverview;
  readonly profile: Profile;
  readonly floor: number | null;
  readonly companions: readonly string[];
  /** null = giữ build hiện tại của hồ sơ. */
  readonly build: LeaderBuild | null;
  readonly busy: boolean;
  readonly sweepBusy: boolean;
  readonly message: string | null;
  readonly onSelectFloor: (floor: number) => void;
  readonly onToggleCompanion: (id: string) => void;
  readonly onBuild: (build: LeaderBuild) => void;
  readonly onStart: () => void;
  readonly onAbandon: () => void;
  readonly onSweep: () => void;
}

/** Icon trạng thái ô tầng (Shan 28/11/2026: icon thay chữ "Đang mở", "Khóa"); chữ đầy đủ nằm ở aria-label. */
function FloorStateIcon({ entry, active }: { entry: TrialFloorEntry; active: boolean }) {
  const cls = "ui-floor__state mt-1 size-4";
  if (active) return <SwordsIcon className={cls} />;
  if (entry.state === "cleared") return <CheckIcon className={cls} />;
  if (entry.state === "locked") return <LockIcon className={cls} />;
  return isBossFloor(entry) ? <CrownIcon className={cls} /> : <LockOpenIcon className={cls} />;
}

function FloorNavigator({
  floors,
  selected,
  active,
  onSelect,
  short,
}: {
  floors: readonly TrialFloorEntry[];
  selected: number | null;
  active: number | null;
  onSelect: (floor: number) => void;
  /** Máy tính thấp: hàng 10 chặng thành một dòng lật trái phải để lưới tầng còn chỗ. */
  short?: boolean;
}) {
  const stages = trialStages(floors);
  // Chặng đang xem đi theo tầng đang chọn; người chơi vẫn lật sang chặng khác để xem trước mà không đổi tầng.
  const selectedStage = selected === null ? 0 : stageIndexOf(selected);
  const [view, setView] = useState({ stage: selectedStage, forFloor: selected });
  const stageIndex = Math.min(view.forFloor === selected ? view.stage : selectedStage, Math.max(0, stages.length - 1));
  const stage = stages[stageIndex];
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  if (!stage) return null;
  const shown = stage.floors;
  const focusIndex = Math.max(0, shown.findIndex((f) => f.floor.floor === selected));
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (!NAV_KEYS.includes(e.key)) return;
    e.preventDefault();
    const next = navigateIndex(i, e.key, shown.length, FLOOR_GRID_COLUMNS);
    refs.current[next]?.focus();
  };
  const left = unclaimedStones(shown);
  const goStage = (index: number) => setView({ stage: index, forFloor: selected });
  const pager = short && stages.length > 1;
  return (
    <>
      {pager ? (
        <div className="flex items-center justify-between gap-2">
          <Button variant="secondary" size="sm" type="button" aria-label="Chặng trước" className="size-9 p-0"
            disabled={stageIndex === 0} onClick={() => goStage(stageIndex - 1)}>
            <ChevronLeftIcon />
          </Button>
          <p className="min-w-0 text-center text-sm leading-tight" aria-live="polite">
            <strong className="text-title-on-wood">Chặng {stage.roman}: {stage.name}</strong>
            <span className="block text-caption text-on-wood-soft">
              tầng {stage.from} đến {stage.to}, đã qua {stage.cleared}/{stage.floors.length}
            </span>
          </p>
          <Button variant="secondary" size="sm" type="button" aria-label="Chặng sau" className="size-9 p-0"
            disabled={stageIndex === stages.length - 1} onClick={() => goStage(stageIndex + 1)}>
            <ChevronRightIcon />
          </Button>
        </div>
      ) : stages.length > 1 && (
        <Tabs
          label="Chặng của tháp"
          size="sm"
          fullWidth
          panelId="trial-stage-panel"
          value={String(stageIndex)}
          onChange={(value) => goStage(Number(value))}
          items={stages.map((st) => ({
            value: String(st.index),
            label: (
              <span className="flex flex-col items-center leading-tight" data-state={st.state}>
                <span>{st.roman}</span>
                <span className="text-caption font-normal opacity-80">
                  <span className="sr-only">{st.name}, đã qua </span>
                  {st.cleared}/{st.floors.length}
                </span>
              </span>
            ),
          }))}
        />
      )}
      <div id="trial-stage-panel" role={stages.length > 1 && !pager ? "tabpanel" : undefined} className="flex flex-col gap-2">
        <p className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm text-on-wood">
          {!pager && (
            <span>
              <strong className="text-title-on-wood">Chặng {stage.roman}: {stage.name}</strong>
              <span className="text-on-wood-soft">, tầng {stage.from} đến {stage.to}</span>
            </span>
          )}
          <span className={left > 0 ? "text-caption text-frame-gold" : "text-caption text-jade"}>
            {left > 0 ? `Còn ${left} đá lần đầu` : "Đã nhận hết đá lần đầu"}
          </span>
        </p>
        <ul aria-label={`Tầng ${stage.from} đến ${stage.to}`} className="grid grid-cols-5 gap-2">
          {shown.map((f, i) => {
            const isSel = f.floor.floor === selected;
            const boss = isBossFloor(f);
            // Tầng chưa mở không chọn được (Shan 28/11/2026): ô mờ, có khóa, bấm không đổi tầng.
            const locked = f.state === "locked";
            return (
              <li key={f.floor.id}>
                <button
                  type="button"
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  tabIndex={i === focusIndex ? 0 : -1}
                  aria-pressed={isSel}
                  aria-label={`Tầng ${f.floor.floor}${boss ? ", ải trùm" : ""}, ${FLOOR_STATE_TEXT[f.state]}${active === f.floor.floor ? ", đang đánh dở" : ""}`}
                  title={locked ? lockedHint(f) : undefined}
                  disabled={locked && !isSel}
                  onClick={() => onSelect(f.floor.floor)}
                  onKeyDown={(e) => onKey(e, i)}
                  data-state={f.state}
                  data-boss={boss || undefined}
                  className={choiceVariants({ className: "ui-floor min-h-14 w-full flex-col gap-0 px-0.5 py-1.5 [@media(max-height:860px)]:xl:min-h-12" })}
                >
                  <span className="text-lg leading-none">{f.floor.floor}</span>
                  <FloorStateIcon entry={f} active={active === f.floor.floor} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

/** Một hàng chip chọn hệ hoặc nghề của thủ lĩnh: icon + tên, chấm ngọc là chọn vào thì đội hợp luật. */
function LeaderPickRow<T extends string>({
  label,
  picks,
  value,
  names,
  icon,
  busy,
  onPick,
  badge,
}: {
  label: string;
  picks: readonly LeaderPick<T>[];
  value: T;
  names: Readonly<Record<T, string>>;
  icon: (value: T) => React.ReactNode;
  busy: boolean;
  onPick: (value: T) => void;
  /** Dấu nhỏ ở góc trái trên (ví dụ ★ khắc địch cho hàng Hệ). */
  badge?: (value: T) => React.ReactNode;
}) {
  return (
    <div role="group" aria-label={`${label} của Đinh Bộ Lĩnh`} className="flex flex-col gap-1.5">
      <span className="text-caption text-on-wood-soft">{label}</span>
      <div className={cn("grid grid-cols-4 gap-1.5", picks.length === 7 ? "sm:grid-cols-7" : "sm:grid-cols-8")}>
        {picks.map((p) => {
          const note = p.banned ? ", bị cấm ở tầng này" : p.fits ? ", hợp luật" : "";
          return (
            <ChoiceChip
              key={p.value}
              selected={p.value === value}
              disabled={busy}
              aria-label={`${names[p.value]}${note}`}
              title={p.banned ? `${names[p.value]} bị cấm ở tầng này` : names[p.value]}
              onClick={() => onPick(p.value)}
              data-banned={p.banned || undefined}
              className={cn(
                "relative min-h-14 flex-col gap-0.5 px-1 py-1.5 pointer-coarse:min-h-14",
                p.banned && p.value !== value && "opacity-60",
              )}
            >
              {icon(p.value)}
              <span className={cn("whitespace-nowrap text-caption font-normal", p.banned && "line-through")}>{names[p.value]}</span>
              {p.fits && <span aria-hidden className="absolute right-1 top-1 size-1.5 rounded-full bg-jade" />}
              {badge && <span className="absolute left-1 top-0.5 text-caption leading-none">{badge(p.value)}</span>}
            </ChoiceChip>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Hệ và nghề bằng icon thay chữ (Shan 28/11/2026); tên đầy đủ đọc qua chữ ẩn cho trình đọc màn hình và hiện khi rê chuột.
 */
function BuildIcons({ element, profession, className }: { element: Element; profession: Profession; className?: string }) {
  const text = `${ELEMENT_NAME[element]}, ${PROFESSION_NAME[profession]}`;
  return (
    <span className={cn("mt-0.5 flex items-center gap-1.5", className)} title={text}>
      <ElementIcon element={element} className="size-4 shrink-0" />
      <ProfessionIcon profession={profession} className="size-4 shrink-0" />
      <span className="sr-only">{text}</span>
    </span>
  );
}

/** Chân dung, tên, hệ/nghề của một tướng kèm. Lý do bị cấm không ghi dưới tên (luật tầng đã ghi), chỉ ở tooltip. */
function CompanionCardBody({ option: o, foes }: { option: CompanionOption; foes: readonly CounterFoe[] }) {
  return (
    <>
      <Portrait id={o.id} element={o.element} profession={o.profession} className="size-9 shrink-0 sm:size-10" />
      <span className="min-w-0 text-caption">
        <span className="flex items-center gap-1 text-sm font-semibold">
          <span className="truncate">{o.name}</span>
          <CounterStar element={o.element} foes={foes} />
        </span>
        <BuildIcons element={o.element} profession={o.profession} />
      </span>
    </>
  );
}

/**
 * Chi tiết tầng thành hai khung: "Tầng" (luật, đối thủ) và "Đội hình" (tướng kèm, thủ lĩnh). Màn vừa một màn hình
 * (Shan chốt 28/11/2026): hai khung là cột giữa và cột phải, nút Vào tầng ở đáy cột giữa, chọn hệ nghề thủ lĩnh và lọc
 * tướng kèm mở bằng hộp, danh sách tướng kèm chia trang vừa chỗ. Màn hẹp hai khung xếp chồng, nút ở cuối khung Đội hình.
 */
function FloorDetail(props: TrialViewProps & { entry: TrialFloorEntry; fit: boolean; short: boolean }) {
  const { entry, profile, companions, busy, message, fit, short } = props;
  const f = entry.floor;
  const rules = describeRules(f.rules);
  const win = describeWin(f.win);
  const options = companionOptions(profile, f.rules, companions);
  const foes = f.foeIds.map(foeInfo);
  // Tướng đã chọn nằm ở hai ô riêng phía trên; danh sách dưới chỉ còn tướng chưa chọn, tướng bị luật cấm xếp cuối.
  // Màn hẹp cắt trang 12; màn vừa một màn hình cắt theo chỗ trong cột (6 thẻ, máy tính thấp 2 thẻ).
  const picked = companions.flatMap((id) => options.filter((o) => o.id === id));
  const candidates = options.filter((o) => !o.selected).sort((a, b) => Number(a.reason !== null) - Number(b.reason !== null));
  // Lọc tên, hệ, nghề như Viễn Chinh; đổi bộ lọc thì về trang đầu.
  const [filter, updateFilter] = useHeroFilter();
  const shown = filterHeroes(candidates, filter.query, filter.element, filter.profession);
  const pagedOptions = usePagedItems(shown, fit ? (short ? 2 : 6) : 12);
  const setFilter = (patch: Parameters<typeof updateFilter>[0]) => { updateFilter(patch); pagedOptions.setPage(0); };
  const [dialog, setDialog] = useState<"filter" | "leader" | null>(null);
  const build = props.build ?? defaultBuild(profile);
  const preview = previewLineup(profile, f.rules, companions, build);
  const picker = leaderPicker(profile, f.rules, companions, build);
  const hasActiveHere = props.overview.active?.floor === f.floor;
  const activeElsewhere = props.overview.active !== null && !hasActiveHere;
  const locked = entry.state === "locked";
  const canStart =
    !busy && !locked && win.supported && (hasActiveHere || (!activeElsewhere && preview.status === "valid"));
  const noLegalBuild = companions.length >= 2 && preview.status === "invalid" && picker.suggestion === null;
  const filterCount = Number(filter.element !== "all") + Number(filter.profession !== "all");

  const actions = (
    <div className={cn("flex flex-wrap items-center gap-3", fit && "mt-auto")}>
      <Button type="button" disabled={!canStart} onClick={props.onStart} className={cn("min-h-11 px-6", fit && "flex-1")}>
        {busy ? "Đang vào tầng…" : hasActiveHere ? "Tiếp tục trận" : entry.state === "cleared" ? "Đánh lại" : "Vào tầng"}
      </Button>
      {hasActiveHere && (
        <SurrenderButton
          size="md"
          disabled={busy}
          consequence={`Trận dở ở tầng ${f.floor} tính là thua, tầng chưa được vượt. Bạn có thể đổi đội rồi vào lại tầng này.`}
          onConfirm={props.onAbandon}
        />
      )}
      {activeElsewhere && (
        <span role="status" className="text-sm text-frame-gold">
          Đang có trận dở ở tầng {props.overview.active!.floor}; chọn tầng đó để tiếp tục hoặc bỏ.
        </span>
      )}
      {message && (
        <span role="alert" className="text-sm text-danger">
          {message}
        </span>
      )}
    </div>
  );

  const leaderRows = (
    <>
      <LeaderPickRow
        label="Hệ"
        picks={picker.elements}
        value={build.element}
        names={ELEMENT_NAME}
        icon={(e) => <ElementIcon element={e} className="size-5" />}
        badge={(e) => <CounterStar element={e} foes={foes} />}
        busy={busy}
        onPick={(element) => props.onBuild({ element, profession: build.profession })}
      />
      <LeaderPickRow
        label="Nghề"
        picks={picker.professions}
        value={build.profession}
        names={PROFESSION_NAME}
        icon={(p) => <ProfessionIcon profession={p} className="size-5" />}
        busy={busy}
        onPick={(profession) => props.onBuild({ element: build.element, profession })}
      />
      <p className="flex items-center gap-1.5 text-caption text-on-wood-soft">
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-jade" />
        {companions.length < 2
          ? "Hợp luật tầng (xét riêng thủ lĩnh). Chọn đủ 2 tướng kèm để xét cả đội."
          : noLegalBuild
            ? "Hai tướng kèm này chưa ghép được với nghề và hệ nào để hợp luật tầng. Hãy đổi tướng kèm."
            : "Chọn vào thì đội hợp luật với 2 tướng kèm đang chọn."}{" "}
        Đổi nghề/hệ chỉ áp dụng cho trận này.
      </p>
    </>
  );

  const frameClass = "flex min-w-0 flex-col gap-4 xl:min-h-0 xl:overflow-y-auto [@media(max-height:860px)]:xl:gap-3";

  return (
    <>
      <OrnateFrame aria-labelledby="trial-floor-title" className={frameClass}>
        <header>
          <p className="text-kicker text-frame-gold">
            {FLOOR_STATE_TEXT[entry.state]}, độ khó {DIFFICULTY_NAME[f.difficulty]}
            {isBossFloor(entry) && ", ải trùm"}
          </p>
          <h2 id="trial-floor-title" className="ui-title-on-wood mt-1 text-title">
            Tầng {f.floor}: {f.narrative.title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-on-wood">{f.narrative.intro}</p>
        </header>

        {locked && (
          <FrameInset role="status" className="text-sm text-on-wood-soft">
            {lockedHint(entry)}.
          </FrameInset>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <h3 className="ui-title-on-wood mb-1.5 text-base">Luật tầng</h3>
            {rules.length === 0 ? (
              <p className="text-sm text-on-wood-soft">Tự do chọn đội.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-sm text-on-wood">
                {rules.map((r) => (
                  <li key={r.text} className="flex items-start gap-2">
                    <span className="ui-rule-tag shrink-0" data-kind={r.kind}>
                      {RULE_TAG[r.kind]}
                    </span>
                    <span>{r.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <h3 className="ui-title-on-wood mb-1.5 text-base">Điều kiện thắng</h3>
            <p className={win.supported ? "text-on-wood" : "text-danger"}>
              {win.text}
              {!win.supported && " (chưa hỗ trợ, chưa vào được)"}
            </p>
            <p className="text-on-wood-soft">Giới hạn {f.turnLimit} lượt, máu đầy, lương 60 mỗi lần thử.</p>
            <p className={entry.firstClearClaimed ? "text-jade" : "font-semibold text-frame-gold"} data-testid="first-clear">
              {firstClearText(entry)}
            </p>
            {entry.record && (
              <p className="text-on-wood-soft">
                Kỷ lục: {entry.record.bestTurns} lượt, đã qua {entry.record.clears} lần
              </p>
            )}
            {entry.state === "cleared" && <p className="text-on-wood-soft">Đánh lại để cải thiện kỷ lục, không có thêm đá.</p>}
          </div>
        </div>

        <div>
          <h3 className="ui-title-on-wood mb-1.5 text-base">Đối thủ</h3>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-1 [@media(max-height:860px)]:xl:grid-cols-3">
            {foes.map((foe) => (
              <li key={foe.id} className="ui-frame-inset flex min-w-0 items-center gap-2 p-2 [@media(max-height:860px)]:xl:flex-col [@media(max-height:860px)]:xl:text-center">
                {foe.element && foe.profession && (
                  <Portrait id={foe.id} element={foe.element} profession={foe.profession} className="size-10 shrink-0" />
                )}
                <span className="min-w-0 text-caption text-on-wood-soft">
                  <span className="block truncate text-sm font-semibold text-on-wood">{foe.name}</span>
                  {foe.element && foe.profession && (
                    <BuildIcons element={foe.element} profession={foe.profession} className="[@media(max-height:860px)]:xl:justify-center" />
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {(fit || hasActiveHere) && actions}
      </OrnateFrame>

      <OrnateFrame aria-labelledby="trial-team-title" className={frameClass}>
        <h2 id="trial-team-title" className="ui-title-on-wood text-title">Đội hình</h2>
        {hasActiveHere ? (
          <Alert tone="warning" className="p-3 text-sm">
            Bạn đang có trận dở ở tầng này. Tiếp tục để quay lại trận, hoặc bỏ trận để đổi đội.
          </Alert>
        ) : (
          <>
            <div>
              <h3 className="ui-title-on-wood mb-1.5 text-base">Chọn 2 tướng kèm <span className="text-sm font-normal text-on-wood-soft">(đã chọn {companions.length}/2)</span></h3>
              <p className="mb-2 text-caption text-on-wood-soft [@media(max-height:860px)]:xl:hidden"><span className="font-bold text-jade">★</span> tướng có hệ khắc ít nhất một đối thủ tầng này.</p>
              <ul aria-label="Tướng kèm đã chọn" className="mb-3 grid grid-cols-2 gap-2">
                {[0, 1].map((slot) => {
                  const o = picked[slot];
                  return (
                    <li key={o?.id ?? `empty-${slot}`}>
                      {o ? (
                        <button
                          type="button"
                          aria-pressed
                          aria-label={`Bỏ chọn ${o.name}`}
                          disabled={busy}
                          onClick={() => props.onToggleCompanion(o.id)}
                          className={choiceVariants({ className: "min-h-14 w-full justify-start p-2 text-left font-normal" })}
                        >
                          <CompanionCardBody option={o} foes={foes} />
                          <span aria-hidden className="ml-auto shrink-0 self-start text-caption opacity-70">Bỏ</span>
                        </button>
                      ) : (
                        <div className="ui-frame-inset flex min-h-14 items-center justify-center p-2 text-caption text-on-wood-soft">
                          Chưa chọn tướng kèm {slot + 1}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              {fit ? (
                <div className="flex gap-2">
                  <Input
                    type="search"
                    aria-label="Tìm tướng theo tên"
                    placeholder="Tìm tên tướng…"
                    value={filter.query}
                    onChange={(e) => setFilter({ query: e.currentTarget.value })}
                    className="min-h-11 flex-1"
                  />
                  <Button variant="secondary" type="button" className="min-h-11 gap-1.5 px-3" aria-haspopup="dialog" onClick={() => setDialog("filter")}>
                    <SlidersIcon />
                    Lọc hệ, nghề{filterCount > 0 && ` (${filterCount})`}
                  </Button>
                </div>
              ) : (
                <HeroFilterBar filter={filter} onChange={setFilter} />
              )}
              <p className="mb-2 mt-2 text-caption text-on-wood-soft" role="status">
                {shown.length === candidates.length ? `${candidates.length} tướng` : `${shown.length}/${candidates.length} tướng khớp bộ lọc`}
              </p>
              {shown.length === 0 && <p className="py-4 text-center text-sm text-on-wood-soft">Không có tướng khớp bộ lọc.</p>}
              <ul aria-label="Tướng kèm có thể chọn" {...pagedOptions.listProps} className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2">
                {pagedOptions.pageItems.map((o) => (
                  <li key={o.id}>
                    <button
                      type="button"
                      aria-pressed={false}
                      aria-disabled={o.disabled}
                      aria-label={o.reason ? `${o.name}, ${o.reason.toLowerCase()}` : undefined}
                      title={o.reason ?? undefined}
                      disabled={o.disabled || busy}
                      onClick={() => props.onToggleCompanion(o.id)}
                      className={choiceVariants({ className: "min-h-14 w-full justify-start p-2 text-left font-normal" })}
                    >
                      <CompanionCardBody option={o} foes={foes} />
                    </button>
                  </li>
                ))}
              </ul>
              <PageControls paged={pagedOptions} label="Phân trang tướng kèm" className="mt-2" />
            </div>

            <FrameInset className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <Portrait id={MAIN_ID} element={build.element} profession={build.profession} className="size-12 shrink-0" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="flex flex-wrap items-center gap-x-1 font-semibold">
                    Đinh Bộ Lĩnh <CounterStar element={build.element} foes={foes} />
                    <span className="font-normal text-on-wood-soft">(thủ lĩnh, luôn ra trận)</span>
                  </p>
                  <span data-testid="leader-preview" className="text-on-wood-soft">
                    <BuildIcons element={build.element} profession={build.profession} />
                  </span>
                </div>
                {picker.suggestion && (
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    disabled={busy}
                    onClick={() => props.onBuild(picker.suggestion!)}
                  >
                    Đổi sang {ELEMENT_NAME[picker.suggestion.element]}, {PROFESSION_NAME[picker.suggestion.profession]}
                  </Button>
                )}
                {fit && (
                  <Button variant="secondary" size="sm" type="button" disabled={busy} aria-haspopup="dialog" onClick={() => setDialog("leader")}>
                    Đổi hệ, nghề
                  </Button>
                )}
              </div>
              {!fit && leaderRows}
            </FrameInset>

            <div aria-live="polite" data-testid="lineup-status" className="text-sm">
              {preview.status === "incomplete" && <p className="text-on-wood-soft">Cần chọn thêm {preview.missing} tướng kèm.</p>}
              {preview.status === "valid" && <p className="text-jade">Đội hình hợp luật, sẵn sàng vào tầng.</p>}
              {preview.status === "invalid" && (
                <ul className="list-inside list-disc text-danger" aria-label="Đội hình chưa đạt yêu cầu tầng">
                  {preview.errors.map((e, i) => (
                    <li key={i}>{lineupErrorText(e)}</li>
                  ))}
                </ul>
              )}
            </div>
            {!fit && actions}
          </>
        )}
      </OrnateFrame>

      {fit && (
        <>
          <FrameDialog open={dialog === "filter"} title="Lọc tướng kèm" onClose={() => setDialog(null)}>
            <HeroFilterBar filter={filter} onChange={setFilter} search={false} />
          </FrameDialog>
          <FrameDialog open={dialog === "leader"} title="Hệ, nghề của Đinh Bộ Lĩnh" onClose={() => setDialog(null)}>
            {leaderRows}
          </FrameDialog>
        </>
      )}
    </>
  );
}

function SweepPanel({ overview, sweepBusy, onSweep, className }: Pick<TrialViewProps, "overview" | "sweepBusy" | "onSweep"> & { className?: string }) {
  const { sweep } = overview;
  const button = sweepButtonState(sweep, sweepBusy);
  const hint = nextSweepTierHint(overview.cleared, overview.floors.length);
  return (
    <OrnateFrame aria-labelledby="trial-sweep-title" className={cn("flex min-w-0 flex-col gap-3 [@media(max-height:860px)]:xl:gap-2", className)}>
      <div className="min-w-0">
        <h2 id="trial-sweep-title" className="ui-title-on-wood text-title">Quét tháp hằng ngày</h2>
        {sweep.eligible ? (
          <p className="mt-0.5 text-sm text-on-wood [@media(max-height:860px)]:xl:hidden">
            Bậc {sweep.tier}: mỗi ngày nhận <strong>{sweep.amount} Đá Cường Hóa</strong> mà không cần đánh lại.
          </p>
        ) : (
          <p className="mt-0.5 text-sm text-on-wood-soft [@media(max-height:860px)]:xl:hidden">Vượt tầng 1 để mở quyền quét: mỗi ngày nhận đá một lần mà không cần đánh lại.</p>
        )}
        {sweep.eligible && hint && <p className="mt-1 text-caption text-on-wood-soft [@media(max-height:860px)]:xl:hidden">{hint}.</p>}
        {sweep.claimedToday && (
          <p className="mt-1 text-caption text-jade">
            Hôm nay đã nhận. Lượt tiếp theo:{" "}
            <time dateTime={new Date(sweep.nextAt).toISOString()}>{formatSweepTime(sweep.nextAt)}</time> (giờ Việt Nam).
          </p>
        )}
      </div>
      <Button
        type="button"
        disabled={button.disabled || !overview.supported}
        onClick={onSweep}
        className="min-h-11 w-full px-5"
      >
        {button.text}
      </Button>
      {sweep.history.length > 0 && (
        <details className="text-caption text-on-wood-soft [@media(max-height:860px)]:xl:hidden">
          <summary className="cursor-pointer py-1 text-on-wood-soft hover:text-on-wood">Lịch sử nhận gần đây</summary>
          <ul className="mt-1 flex flex-col gap-0.5">
            {sweep.history.map((item) => (
              <li key={item.dateKey} data-testid={item.dateKey === sweep.lastClaim?.dateKey ? "last-sweep" : undefined}>
                {formatDateKey(item.dateKey)}
                {item.amount === null ? ": đã nhận" : `: +${item.amount} đá`}
              </li>
            ))}
          </ul>
        </details>
      )}
    </OrnateFrame>
  );
}

export default function TrialView(props: TrialViewProps) {
  const { overview, floor } = props;
  const entry = overview.floors.find((f) => f.floor.floor === floor) ?? null;
  const detailRef = useRef<HTMLDivElement>(null);
  const total = overview.floors.length;
  // Vừa một màn hình (Shan chốt 28/11/2026): từ 1280px ba cột cao bằng khung, xem FloorDetail.
  const fit = useMediaQuery(DESKTOP_FIT_QUERY);
  const short = useMediaQuery(SHORT_FIT_QUERY);
  // Bố cục một cột (dưới lg): chọn tầng xong cuộn tới khung chi tiết, khỏi phải tự kéo qua lưới tầng.
  const selectFloor = (next: number) => {
    props.onSelectFloor(next);
    if (typeof window === "undefined" || window.matchMedia("(min-width: 1024px)").matches) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" }));
  };
  const stats = [
    { label: "Đã qua", value: `${overview.cleared}/${total}` },
    { label: "Đá Cường Hóa", value: <span data-testid="stones">{overview.stones}</span> },
  ];
  return (
    <>
      {fit ? (
        <ModeBanner compact title="Tháp Thí Luyện" tagline={`${total} tầng, mỗi tầng một luật chọn đội riêng`} stats={stats} />
      ) : (
        <ModeBanner
          title="Tháp Thí Luyện"
          kicker="Leo tháp"
          art="/art/home/trial.webp"
          artPosition="center 42%"
          description={`${total} tầng, mỗi tầng một luật chọn đội riêng. Đánh lại tùy ý; Đá Cường Hóa lần đầu của mỗi tầng chỉ nhận một lần.`}
          stats={stats}
        />
      )}
      <ModeGuideTabs scene="TRIAL" fit={fit} playLabel="Chinh phạt" playIcon={SwordsIcon}>

      {!overview.supported && (
        <Alert role="alert" className="p-3 text-sm">
          Dữ liệu Tháp Thí Luyện thuộc phiên bản mới hơn bản này. Xin tải lại trang hoặc chờ cập nhật; tiến trình không bị ghi đè.
        </Alert>
      )}

      {!overview.available ? (
        <>
          <OrnateFrame as="div" role="status" className="p-6 text-center text-on-wood-soft">
            Tháp Thí Luyện chưa mở: các tầng thử thách chưa được phát hành. Tiến trình của bạn được giữ nguyên.
          </OrnateFrame>
          <SweepPanel overview={overview} sweepBusy={props.sweepBusy} onSweep={props.onSweep} />
        </>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(300px,0.27fr)_minmax(0,1fr)_minmax(0,1.15fr)] xl:grid-rows-[minmax(0,1fr)] xl:gap-3.5">
          <div className="flex min-w-0 flex-col gap-4 xl:min-h-0 xl:gap-3">
            <OrnateFrame aria-labelledby="trial-floors-title" className="flex min-w-0 flex-col gap-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="trial-floors-title" className="ui-title-on-wood text-title">
                  Các tầng
                </h2>
                <p className="text-caption text-on-wood-soft">
                  {overview.cleared >= total ? "Đã chinh phục cả tháp" : `Đang ở tầng ${overview.cleared + 1}`}
                </p>
              </div>
              <div
                role="progressbar"
                aria-label="Tiến độ leo tháp"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={overview.cleared}
                className="h-1.5 overflow-hidden rounded-full bg-wood-inset"
              >
                <div className="h-full rounded-full bg-jade" style={{ width: `${total ? (overview.cleared / total) * 100 : 0}%` }} />
              </div>
              <FloorNavigator floors={overview.floors} selected={floor} active={overview.active?.floor ?? null} onSelect={selectFloor} short={short} />
              <p className="hidden text-caption text-on-wood-soft pointer-fine:block [@media(max-height:860px)]:xl:hidden">Dùng phím mũi tên để chuyển tầng, Enter để chọn.</p>
            </OrnateFrame>
            <SweepPanel overview={overview} sweepBusy={props.sweepBusy} onSweep={props.onSweep} />
            <ColumnFill mode="trial" className="xl:min-h-0" />
          </div>
          {/* Màn hẹp: hai khung chi tiết xếp chồng ở cột phải; từ 1280px mỗi khung là một cột (contents). */}
          <div ref={detailRef} className="flex min-w-0 scroll-mt-20 flex-col gap-4 xl:contents">
            {entry ? (
              <FloorDetail {...props} entry={entry} fit={fit} short={short} />
            ) : (
              <OrnateFrame as="div" role="status" className="p-6 text-center text-on-wood-soft xl:col-span-2">
                Chọn một tầng để xem luật và chuẩn bị đội.
              </OrnateFrame>
            )}
          </div>
        </div>
      )}
      </ModeGuideTabs>
    </>
  );
}
