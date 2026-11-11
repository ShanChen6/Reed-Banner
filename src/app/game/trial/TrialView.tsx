"use client";

import { FrameInset, ModeBanner, OrnateFrame } from "@/components/game-ui";
import { Alert, Button, Select, choiceVariants } from "@/components/ui";
import { PageControls, usePagedItems } from "@/components/ui/Pagination";

// Giao diện thuần của Tháp Thí Luyện: nhận dữ liệu và callback qua props (không tự gọi mạng, không dùng context
// phân cảnh) nên dựng được ở mọi nơi. Server là nguồn sự thật: số đá, "đã nhận" và kỷ lục chỉ hiện đúng như
// server trả; client không tự cộng.

import { useRef } from "react";
import { MAIN_ID, type Element, type Profession, type Profile } from "@/core";
import { ElementIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { DIFFICULTY_NAME, ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import {
  companionOptions,
  defaultBuild,
  describeRules,
  describeWin,
  firstClearText,
  formatSweepTime,
  FLOOR_STATE_TEXT,
  leaderChoices,
  lockedHint,
  navigateIndex,
  NAV_KEYS,
  previewLineup,
  RULE_TAG,
  sweepButtonState,
  type LeaderBuild,
  type TrialFloorEntry,
  type TrialOverview,
} from "./trial-ui";

/** Số cột của lưới tầng theo breakpoint (khớp class grid-cols bên dưới). Dùng cho phím lên/xuống. */
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

function FloorNavigator({
  floors,
  selected,
  active,
  onSelect,
}: {
  floors: readonly TrialFloorEntry[];
  selected: number | null;
  active: number | null;
  onSelect: (floor: number) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusIndex = Math.max(0, floors.findIndex((f) => f.floor.floor === selected));
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (!NAV_KEYS.includes(e.key)) return;
    e.preventDefault();
    const next = navigateIndex(i, e.key, floors.length, FLOOR_GRID_COLUMNS);
    refs.current[next]?.focus();
  };
  return (
    <ul
      aria-label="Danh sách tầng Thí Luyện"
      className="grid grid-cols-4 gap-2 sm:grid-cols-5"
    >
      {floors.map((f, i) => {
        const isSel = f.floor.floor === selected;
        return (
          <li key={f.floor.id}>
            <button
              type="button"
              ref={(el) => {
                refs.current[i] = el;
              }}
              tabIndex={i === focusIndex ? 0 : -1}
              aria-pressed={isSel}
              aria-label={`Tầng ${f.floor.floor}, ${FLOOR_STATE_TEXT[f.state]}${active === f.floor.floor ? ", đang đánh dở" : ""}`}
              onClick={() => onSelect(f.floor.floor)}
              onKeyDown={(e) => onKey(e, i)}
              data-state={f.state}
              className={choiceVariants({ className: "ui-floor min-h-14 w-full flex-col gap-0 px-1 py-1.5" })}
            >
              <span className="text-lg leading-none">{f.floor.floor}</span>
              <span className="ui-floor__state mt-1 text-caption font-normal" aria-hidden>
                {active === f.floor.floor ? "Đang đánh" : FLOOR_STATE_TEXT[f.state]}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Pick({
  label,
  value,
  options,
  onPick,
}: {
  label: string;
  value: string;
  options: readonly { value: string; text: string }[];
  onPick: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-caption text-on-wood-soft">
      {label}
      <Select
        value={value}
        onChange={(e) => onPick(e.target.value)}
        className="min-h-11 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.text}
          </option>
        ))}
      </Select>
    </label>
  );
}

function FloorDetail(props: TrialViewProps & { entry: TrialFloorEntry }) {
  const { entry, profile, companions, busy, message } = props;
  const f = entry.floor;
  const rules = describeRules(f.rules);
  const win = describeWin(f.win);
  const options = companionOptions(profile, f.rules, companions);
  // Hàng chục tướng kèm: cắt trang 12 để không dài trên điện thoại (lựa chọn giữ nguyên khi sang trang).
  const pagedOptions = usePagedItems(options, 12);
  const build = props.build ?? defaultBuild(profile, f.rules, companions);
  const preview = previewLineup(profile, f.rules, companions, build);
  const choices = leaderChoices(profile, f.rules, companions);
  const hasActiveHere = props.overview.active?.floor === f.floor;
  const activeElsewhere = props.overview.active !== null && !hasActiveHere;
  const locked = entry.state === "locked";
  const canStart =
    !busy && !locked && win.supported && (hasActiveHere || (!activeElsewhere && preview.status === "valid"));

  const elementOptions = Array.from(new Set(choices.map((c) => c.element)));
  const professionOptions = choices.filter((c) => c.element === build.element).map((c) => c.profession);
  const pickElement = (v: string) => {
    const el = v as Element;
    const next = choices.find((c) => c.element === el && c.profession === build.profession) ?? choices.find((c) => c.element === el);
    if (next) props.onBuild(next);
  };

  return (
    <OrnateFrame level="raised" aria-labelledby="trial-floor-title" className="flex min-w-0 flex-col gap-4">
      <header>
        <p className="text-kicker text-frame-gold">
          {FLOOR_STATE_TEXT[entry.state]} · {DIFFICULTY_NAME[f.difficulty]}
        </p>
        <h2 id="trial-floor-title" className="ui-title-on-wood mt-1 text-title">
          Tầng {f.floor}: {f.narrative.title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-on-wood">{f.narrative.intro}</p>
      </header>

      {locked && (
        <FrameInset role="status" className="text-sm text-on-wood-soft">
          {lockedHint(entry)}. Bạn vẫn xem được luật để chuẩn bị đội.
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
          <p className="text-on-wood-soft">Giới hạn {f.turnLimit} lượt · máu đầy, lương 60 mỗi lần thử.</p>
          <p className={entry.firstClearClaimed ? "text-jade" : "font-semibold text-frame-gold"} data-testid="first-clear">
            {firstClearText(entry)}
          </p>
          {entry.record && (
            <p className="text-on-wood-soft">
              Kỷ lục: {entry.record.bestTurns} lượt · đã qua {entry.record.clears} lần
            </p>
          )}
          {entry.state === "cleared" && <p className="text-on-wood-soft">Đánh lại để cải thiện kỷ lục, không có thêm đá.</p>}
        </div>
      </div>

      <div>
        <h3 className="ui-title-on-wood mb-1.5 text-base">Đối thủ</h3>
        <ul className="flex flex-wrap gap-2">
          {f.foeIds.map((id) => (
            <li key={id} className="ui-frame-inset px-3 py-1 text-caption text-on-wood">
              {id}
            </li>
          ))}
        </ul>
      </div>

      {hasActiveHere ? (
        <Alert tone="warning" className="p-3 text-sm">
          Bạn đang có trận dở ở tầng này. Tiếp tục để quay lại trận, hoặc bỏ trận để đổi đội.
        </Alert>
      ) : (
        <>
          <div>
            <h3 className="ui-title-on-wood mb-1.5 text-base">Chọn 2 tướng kèm (đã chọn {companions.length}/2)</h3>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {pagedOptions.pageItems.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    aria-pressed={o.selected}
                    aria-disabled={o.disabled}
                    disabled={o.disabled || busy}
                    onClick={() => props.onToggleCompanion(o.id)}
                    className={choiceVariants({ className: "min-h-14 w-full justify-start p-2 text-left font-normal" })}
                  >
                    <Portrait id={o.id} element={o.element} profession={o.profession} className="size-10 shrink-0" />
                    <span className="min-w-0 text-caption">
                      <span className="block truncate text-sm font-semibold">{o.name}</span>
                      <span className="flex items-center gap-1 opacity-80">
                        <ElementIcon element={o.element} className="size-3.5" />
                        {ELEMENT_NAME[o.element]} · {PROFESSION_NAME[o.profession]}
                      </span>
                      {o.reason && <span className={`block text-caption ${o.selected ? "text-lacquer" : "text-danger"}`}>{o.reason}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <PageControls paged={pagedOptions} label="Phân trang tướng kèm" className="mt-2" />
          </div>

          <FrameInset>
            <div className="flex items-center gap-3">
              <Portrait id={MAIN_ID} element={build.element} profession={build.profession} className="size-12 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">Đinh Bộ Lĩnh (thủ lĩnh, luôn ra trận)</p>
                <p className="flex items-center gap-1 text-on-wood-soft" data-testid="leader-preview">
                  <ElementIcon element={build.element} className="size-3.5" />
                  {ELEMENT_NAME[build.element]} · {PROFESSION_NAME[build.profession]}
                </p>
              </div>
            </div>
            {choices.length > 0 ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Pick
                  label="Hệ của thủ lĩnh"
                  value={build.element}
                  options={elementOptions.map((e) => ({ value: e, text: ELEMENT_NAME[e] }))}
                  onPick={pickElement}
                />
                <Pick
                  label="Nghề của thủ lĩnh"
                  value={build.profession}
                  options={professionOptions.map((p: Profession) => ({ value: p, text: PROFESSION_NAME[p] }))}
                  onPick={(v) => props.onBuild({ element: build.element, profession: v as Profession })}
                />
              </div>
            ) : (
              <p className="mt-2 text-caption text-on-wood-soft">
                {companions.length < 2 ? "Chọn đủ 2 tướng để xem nghề và hệ hợp luật của thủ lĩnh." : "Thủ lĩnh không có nghề và hệ nào hợp luật với 2 tướng này."}
              </p>
            )}
            <p className="mt-2 text-caption text-on-wood-soft">Đổi nghề/hệ chỉ áp dụng cho trận này, không đổi hồ sơ.</p>
          </FrameInset>

          <div aria-live="polite" data-testid="lineup-status" className="text-sm">
            {preview.status === "incomplete" && <p className="text-on-wood-soft">Cần chọn thêm {preview.missing} tướng kèm.</p>}
            {preview.status === "valid" && <p className="text-jade">Đội hình hợp luật (server sẽ kiểm tra lại).</p>}
            {preview.status === "invalid" && (
              <ul className="list-inside list-disc text-danger">
                {preview.errors.map((e, i) => (
                  <li key={i}>{e.message}</li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" disabled={!canStart} onClick={props.onStart} className="min-h-11 px-6">
          {busy ? "Đang vào tầng…" : hasActiveHere ? "Tiếp tục trận" : entry.state === "cleared" ? "Đánh lại" : "Vào tầng"}
        </Button>
        {hasActiveHere && (
          <Button variant="secondary" type="button" disabled={busy} onClick={props.onAbandon} className="min-h-11">
            Bỏ trận này
          </Button>
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
    </OrnateFrame>
  );
}

export default function TrialView(props: TrialViewProps) {
  const { overview, floor } = props;
  const entry = overview.floors.find((f) => f.floor.floor === floor) ?? null;
  const sweepButton = sweepButtonState(overview.sweep, props.sweepBusy);
  return (
    <>
      <ModeBanner
        title="Tháp Thí Luyện"
        kicker="Song Tháp"
        art="/art/home/trial.webp"
        artPosition="center 42%"
        description="Mỗi tầng một luật chọn đội riêng. Chơi lại tùy ý, Đá Cường Hóa lần đầu chỉ nhận một lần."
        stats={[
          { label: "Đã qua", value: `${overview.cleared}/${overview.floors.length}` },
          { label: "Đá Cường Hóa", value: <span data-testid="stones">{overview.stones}</span> },
        ]}
      />

      {!overview.supported && (
        <Alert role="alert" className="p-3 text-sm">
          Dữ liệu Song Tháp của bạn thuộc phiên bản mới hơn bản này. Hãy tải lại trang hoặc chờ cập nhật; tiến trình không bị ghi đè.
        </Alert>
      )}

      <OrnateFrame aria-labelledby="trial-sweep-title" className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <h2 id="trial-sweep-title" className="ui-title-on-wood text-title">Quét Tháp Thí Luyện</h2>
          {overview.sweep.eligible ? (
            <p className="mt-0.5 text-sm text-on-wood">
              Tier {overview.sweep.tier} · dự kiến nhận <strong>{overview.sweep.amount} Đá Cường Hóa</strong>
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-on-wood-soft">Vượt tầng 1 để mở quyền quét hằng ngày.</p>
          )}
          <p className="mt-1 text-caption text-on-wood-soft">
            {overview.sweep.claimedToday ? "Lượt tiếp theo: " : "Có thể quét: "}
            <time dateTime={new Date(overview.sweep.nextAt).toISOString()}>{formatSweepTime(overview.sweep.nextAt)}</time> (giờ Việt Nam)
          </p>
          {overview.sweep.lastClaim && (
            <p className="mt-1 text-caption text-jade" data-testid="last-sweep">
              Lần quét cuối: {overview.sweep.lastClaim.dateKey} · +{overview.sweep.lastClaim.amount} đá · tier {overview.sweep.lastClaim.tier}
            </p>
          )}
        </div>
        <Button
          type="button"
          disabled={sweepButton.disabled || !overview.supported}
          onClick={props.onSweep}
          aria-describedby="trial-sweep-history"
          className="min-h-12 w-full px-5 sm:w-auto"
        >
          {sweepButton.text}
        </Button>
        <div id="trial-sweep-history" className="sm:col-span-2">
          <h3 className="text-kicker text-on-wood-soft">Lịch sử nhận gần đây</h3>
          {overview.sweep.history.length ? (
            <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-caption text-on-wood-soft">
              {overview.sweep.history.map((item) => (
                <li key={item.dateKey}>
                  {item.dateKey}{item.amount === null ? " · đã nhận" : ` · +${item.amount} đá`}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-caption text-on-wood-soft">Chưa có lượt quét nào được server xác nhận.</p>
          )}
        </div>
      </OrnateFrame>

      {!overview.available ? (
        <OrnateFrame as="div" role="status" className="p-6 text-center text-on-wood-soft">
          Tháp Thí Luyện chưa mở: các tầng thử thách chưa được phát hành. Tiến trình của bạn được giữ nguyên.
        </OrnateFrame>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <OrnateFrame aria-labelledby="trial-floors-title" className="flex min-w-0 flex-col gap-2 self-start">
            <h2 id="trial-floors-title" className="ui-title-on-wood mb-1 text-title">
              Các tầng
            </h2>
            <FloorNavigator floors={overview.floors} selected={floor} active={overview.active?.floor ?? null} onSelect={props.onSelectFloor} />
            <p className="text-caption text-on-wood-soft">Dùng phím mũi tên để chuyển tầng, Enter để chọn.</p>
          </OrnateFrame>
          {entry ? (
            <FloorDetail {...props} entry={entry} />
          ) : (
            <OrnateFrame as="div" role="status" className="p-6 text-center text-on-wood-soft">
              Chọn một tầng để xem luật và chuẩn bị đội.
            </OrnateFrame>
          )}
        </div>
      )}
    </>
  );
}
