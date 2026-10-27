"use client";

import { Select, Card, Alert } from "@/components/ui";

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

const btn =
  "rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 disabled:cursor-not-allowed disabled:opacity-50";

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
        const tone =
          f.state === "cleared"
            ? "border-emerald-400/60 bg-emerald-900/30"
            : f.state === "open"
              ? "border-amber-400/70 bg-amber-900/25"
              : "border-stone-600 bg-black/30 text-muted";
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
              className={`tower-screen__floor flex min-h-12 w-full flex-col items-center justify-center border-2 px-1 py-1.5 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 ${tone} ${isSel ? "ring-2 ring-amber-200" : ""}`}
            >
              <span>{f.floor.floor}</span>
              <span className="text-[10px] font-normal" aria-hidden>
                {f.state === "locked" ? "🔒" : f.state === "cleared" ? "✔" : "●"}
                {active === f.floor.floor && " ⚔"}
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
    <label className="flex flex-col gap-1 text-xs text-foreground-secondary">
      {label}
      <Select
        value={value}
        onChange={(e) => onPick(e.target.value)}
        className="min-h-11 text-sm focus-visible:outline-2 focus-visible:outline-amber-300"
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
    <Card
      aria-labelledby="trial-floor-title"
      className="tower-screen__panel flex flex-col gap-4"
    >
      <header>
        <p className="text-xs tracking-widest text-amber-300/80 uppercase">
          {FLOOR_STATE_TEXT[entry.state]} · {DIFFICULTY_NAME[f.difficulty]}
        </p>
        <h2 id="trial-floor-title" className="text-xl font-black text-amber-100">
          Tầng {f.floor}: {f.narrative.title}
        </h2>
        <p className="mt-1 text-sm text-foreground-secondary">{f.narrative.intro}</p>
      </header>

      {locked && (
        <p role="status" className="rounded-lg bg-black/40 p-3 text-sm text-foreground-secondary">
          🔒 {lockedHint(entry)}. Bạn vẫn xem được luật để chuẩn bị đội.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <h3 className="mb-1 text-sm font-bold text-amber-200">Luật tầng</h3>
          {rules.length === 0 ? (
            <p className="text-sm text-foreground-secondary">Tự do chọn đội.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {rules.map((r) => (
                <li
                  key={r.text}
                  className={r.kind === "ban" ? "text-rose-300" : r.kind === "need" ? "text-sky-300" : "text-amber-100"}
                >
                  <span className="sr-only">{r.kind === "ban" ? "Cấm: " : r.kind === "need" ? "Bắt buộc: " : "Giới hạn: "}</span>
                  <span aria-hidden>{r.kind === "ban" ? "⛔ " : r.kind === "need" ? "✔ " : "⚖ "}</span>
                  {r.text}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <h3 className="mb-1 text-sm font-bold text-amber-200">Điều kiện thắng</h3>
          <p className={win.supported ? "text-foreground" : "text-rose-300"}>
            {win.text}
            {!win.supported && " (chưa hỗ trợ, chưa vào được)"}
          </p>
          <p className="text-foreground-secondary">Giới hạn {f.turnLimit} lượt · máu đầy, lương 60 mỗi lần thử.</p>
          <p className={entry.firstClearClaimed ? "text-emerald-300" : "text-amber-200"} data-testid="first-clear">
            💎 {firstClearText(entry)}
          </p>
          {entry.record && (
            <p className="text-foreground-secondary">
              Kỷ lục: {entry.record.bestTurns} lượt · đã qua {entry.record.clears} lần
            </p>
          )}
          {entry.state === "cleared" && <p className="text-muted">Đánh lại để cải thiện kỷ lục, không có thêm đá.</p>}
        </div>
      </div>

      <div>
        <h3 className="mb-1 text-sm font-bold text-amber-200">Đối thủ</h3>
        <ul className="flex flex-wrap gap-2">
          {f.foeIds.map((id) => (
            <li key={id} className="rounded-full bg-black/40 px-3 py-1 text-xs text-stone-200">
              {id}
            </li>
          ))}
        </ul>
      </div>

      {hasActiveHere ? (
        <p role="status" className="rounded-lg bg-amber-900/30 p-3 text-sm text-amber-100">
          Bạn đang có trận dở ở tầng này. Tiếp tục để quay lại trận, hoặc bỏ trận để đổi đội.
        </p>
      ) : (
        <>
          <div>
            <h3 className="mb-1 text-sm font-bold text-amber-200">Chọn 2 tướng kèm (đã chọn {companions.length}/2)</h3>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {options.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    aria-pressed={o.selected}
                    aria-disabled={o.disabled}
                    disabled={o.disabled || busy}
                    onClick={() => props.onToggleCompanion(o.id)}
                    className={`flex min-h-14 w-full items-center gap-2 rounded-lg border p-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 disabled:cursor-not-allowed disabled:opacity-45 ${
                      o.selected ? "border-amber-300 bg-amber-500/20" : "border-stone-600 bg-black/30"
                    }`}
                  >
                    <Portrait id={o.id} element={o.element} profession={o.profession} className="size-10 shrink-0" />
                    <span className="min-w-0 text-xs">
                      <span className="block truncate text-sm font-semibold">{o.name}</span>
                      <span className="flex items-center gap-1 text-foreground-secondary">
                        <ElementIcon element={o.element} className="size-3.5" />
                        {ELEMENT_NAME[o.element]} · {PROFESSION_NAME[o.profession]}
                      </span>
                      {o.reason && <span className="block text-[11px] text-rose-300">{o.reason}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-black/30 p-3">
            <div className="flex items-center gap-3">
              <Portrait id={MAIN_ID} element={build.element} profession={build.profession} className="size-12 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">Đinh Bộ Lĩnh (thủ lĩnh, luôn ra trận)</p>
                <p className="flex items-center gap-1 text-foreground-secondary" data-testid="leader-preview">
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
              <p className="mt-2 text-xs text-muted">
                {companions.length < 2 ? "Chọn đủ 2 tướng để xem các build hợp luật của thủ lĩnh." : "Không có build thủ lĩnh nào hợp luật với 2 tướng này."}
              </p>
            )}
            <p className="mt-2 text-xs text-muted">Đổi nghề/hệ chỉ áp dụng cho trận này, không đổi hồ sơ.</p>
          </div>

          <div aria-live="polite" data-testid="lineup-status" className="text-sm">
            {preview.status === "incomplete" && <p className="text-foreground-secondary">Cần chọn thêm {preview.missing} tướng kèm.</p>}
            {preview.status === "valid" && <p className="text-emerald-300">✔ Đội hình hợp luật (server sẽ kiểm tra lại).</p>}
            {preview.status === "invalid" && (
              <ul className="text-rose-300">
                {preview.errors.map((e, i) => (
                  <li key={i}>⛔ {e.message}</li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!canStart}
          onClick={props.onStart}
          className={`${btn} tower-screen__action px-6 tracking-wider uppercase`}
        >
          {busy ? "Đang vào tầng…" : hasActiveHere ? "Tiếp tục trận" : entry.state === "cleared" ? "Đánh lại" : "Vào tầng"}
        </button>
        {hasActiveHere && (
          <button type="button" disabled={busy} onClick={props.onAbandon} className={`${btn} bg-white/10 hover:bg-white/15`}>
            Bỏ trận này
          </button>
        )}
        {activeElsewhere && (
          <span role="status" className="text-sm text-amber-200">
            Đang có trận dở ở tầng {props.overview.active!.floor}; chọn tầng đó để tiếp tục hoặc bỏ.
          </span>
        )}
        {message && (
          <span role="alert" className="text-sm text-rose-400">
            {message}
          </span>
        )}
      </div>
    </Card>
  );
}

export default function TrialView(props: TrialViewProps) {
  const { overview, floor } = props;
  const entry = overview.floors.find((f) => f.floor.floor === floor) ?? null;
  const sweepButton = sweepButtonState(overview.sweep, props.sweepBusy);
  return (
    <div className="flex flex-col gap-4">
      <div className="tower-screen__banner">
        <div>
          <p className="text-xs tracking-widest text-amber-300/80 uppercase">Song Tháp</p>
          <h1 className="text-2xl font-black text-amber-100">Tháp Thí Luyện</h1>
          <p className="text-sm text-muted">
            Đã qua tầng {overview.cleared}/{overview.floors.length} · chơi lại tùy ý, đá lần đầu chỉ nhận một lần
          </p>
        </div>
        <p
          className="tower-screen__metric text-sm"
          aria-label={`Đá Cường Hóa: ${overview.stones}`}
          data-testid="stones"
        >
          💎 Đá Cường Hóa: <strong>{overview.stones}</strong>
        </p>
      </div>

      {!overview.supported && (
        <Alert role="alert" className="p-3 text-sm text-rose-100">
          Dữ liệu Song Tháp của bạn thuộc phiên bản mới hơn bản này. Hãy tải lại trang hoặc chờ cập nhật; tiến trình không bị ghi đè.
        </Alert>
      )}

      <section
        aria-labelledby="trial-sweep-title"
        className="tower-screen__panel grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
      >
        <div className="min-w-0">
          <h2 id="trial-sweep-title" className="font-bold text-amber-200">Quét Tháp Thí Luyện</h2>
          {overview.sweep.eligible ? (
            <p className="text-sm text-stone-200">
              Tier {overview.sweep.tier} · dự kiến nhận <strong>{overview.sweep.amount} Đá Cường Hóa</strong>
            </p>
          ) : (
            <p className="text-sm text-foreground-secondary">Vượt tầng 1 để mở quyền quét hằng ngày.</p>
          )}
          <p className="mt-1 text-xs text-muted">
            {overview.sweep.claimedToday ? "Lượt tiếp theo: " : "Có thể quét: "}
            <time dateTime={new Date(overview.sweep.nextAt).toISOString()}>{formatSweepTime(overview.sweep.nextAt)}</time> (giờ Việt Nam)
          </p>
          {overview.sweep.lastClaim && (
            <p className="mt-1 text-xs text-emerald-300" data-testid="last-sweep">
              Lần quét cuối: {overview.sweep.lastClaim.dateKey} · +{overview.sweep.lastClaim.amount} đá · tier {overview.sweep.lastClaim.tier}
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={sweepButton.disabled || !overview.supported}
          onClick={props.onSweep}
          aria-describedby="trial-sweep-history"
          className={`${btn} tower-screen__action min-h-12 w-full px-5 sm:w-auto`}
        >
          {sweepButton.text}
        </button>
        <div id="trial-sweep-history" className="sm:col-span-2">
          <h3 className="text-xs font-semibold tracking-wide text-foreground-secondary uppercase">Lịch sử nhận gần đây</h3>
          {overview.sweep.history.length ? (
            <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
              {overview.sweep.history.map((item) => (
                <li key={item.dateKey}>
                  {item.dateKey}{item.amount === null ? " · đã nhận" : ` · +${item.amount} đá`}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-stone-500">Chưa có lượt quét nào được server xác nhận.</p>
          )}
        </div>
      </section>

      {!overview.available ? (
        <p role="status" className="rounded-xl border border-stone-600 bg-black/30 p-6 text-center text-foreground-secondary">
          Tháp Thí Luyện chưa mở: các tầng thử thách chưa được phát hành. Tiến trình của bạn được giữ nguyên.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Card aria-labelledby="trial-floors-title" className="tower-screen__panel flex flex-col gap-2">
            <h2 id="trial-floors-title" className="font-bold text-amber-200">
              Các tầng
            </h2>
            <FloorNavigator floors={overview.floors} selected={floor} active={overview.active?.floor ?? null} onSelect={props.onSelectFloor} />
            <p className="text-xs text-muted">Dùng phím mũi tên để chuyển tầng, Enter để chọn.</p>
          </Card>
          {entry ? (
            <FloorDetail {...props} entry={entry} />
          ) : (
            <p role="status" className="rounded-xl border border-stone-600 bg-black/30 p-6 text-center text-foreground-secondary">
              Chọn một tầng để xem luật và chuẩn bị đội.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
