"use client";
// Các mảnh giao diện phụ của màn trận: đồng hồ lượt, báo đợt Trấn Ải và đối thủ đợt sau,
// gợi ý xoáy ô, và hook bật sân khấu nhân vật khi màn đủ rộng.

import { useSyncExternalStore } from "react";
import {
  TURN_MS,
  type Pos,
  type SkillDef,
  type SurvivalView,
  type WavePreview,
} from "@/core";

import {
  ElementIcon,
} from "../art/icons";

/**
 * Đang ngắm kỹ năng. `choose`: có nhiều mục tiêu để chọn (bấm thẻ, mũi tên trái/phải); `target`: mục tiêu đã chọn.
 * Kỹ năng phá vùng còn chọn tâm trên bàn cờ sau khi có mục tiêu.
 */
export type Aim = { skill: SkillDef; choose: boolean; target?: number } | null;

/** Đang chọn tâm lốc xoáy: cho kỹ năng Phong, hoặc lần xoay miễn phí (skill null). */
export type WhirlAim = {
  readonly skill: SkillDef | null;
  readonly max: number;
  readonly center: Pos | null;
} | null;

export function WaveFoes({ preview }: { preview: WavePreview }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
      {preview.foes.map((f, i) => (
        <span key={`${f.id}-${i}`} className="inline-flex items-center gap-1">
          <ElementIcon element={f.element} className="size-3.5" />
          {f.name}
        </span>
      ))}
    </span>
  );
}

/** Đồng hồ lượt trên bàn cờ: số giây còn lại và vạch cạn dần; đỏ khi còn dưới 10 giây. */
export function TurnClock({
  seconds,
  mine,
  extra,
  waiting,
}: {
  seconds: number | null;
  mine: boolean;
  extra: boolean;
  waiting: boolean;
}) {
  const total = TURN_MS / 1000;
  const left = seconds ?? total;
  const urgent = mine && seconds !== null && left <= 10;
  const label = waiting
    ? "Đang chờ máy chủ…"
    : mine
      ? extra
        ? "Lượt thêm của bạn"
        : "Lượt của bạn"
      : "Đối thủ đang đi";
  return (
    <div
      className={`mx-auto flex w-full max-w-md items-center gap-2 ui-frame-inset rounded-full px-3 py-0.5 ${
        urgent ? "!border-stat-hp" : ""
      }`}
      role="timer"
      aria-label={seconds === null ? label : `${label}, còn ${seconds} giây`}
    >
      {/* Mọi nhãn chồng cùng một ô lưới, chỉ hiện nhãn đang dùng: ô rộng bằng nhãn dài nhất nên thanh thời gian không
          co giãn khi đổi lượt. */}
      <span className="grid shrink-0 text-caption font-semibold">
        {TIMER_LABELS.map((l) => (
          <span key={l} aria-hidden={l !== label} className={`[grid-area:1/1] ${l === label ? "" : "invisible"}`}>
            {l}
          </span>
        ))}
      </span>
      <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-black/30">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-linear ${
            !mine ? "bg-on-wood-soft/60" : urgent ? "bg-stat-hp" : "bg-frame-gold-hi"
          }`}
          style={{ width: `${(left / total) * 100}%` }}
        />
      </div>
      <span
        className={`w-8 shrink-0 text-right font-mono text-caption font-bold tabular-nums ${
          urgent ? "animate-pulse text-stat-hp" : ""
        }`}
      >
        {seconds === null ? "--" : `${seconds}s`}
      </span>
    </div>
  );
}

/** Dải trên bàn cờ của sinh tồn: đợt đang đánh và báo trước đợt kế. */
const TIMER_LABELS = ["Đang chờ máy chủ…", "Lượt thêm của bạn", "Lượt của bạn", "Đối thủ đang đi"] as const;

export function WaveBanner({
  survival,
  resting,
}: {
  survival: SurvivalView;
  resting: boolean;
}) {
  const { current, next } = survival;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 ui-frame-inset rounded-lg px-3 py-1.5 text-sm">
      <span className="font-bold">
        Đợt {survival.wave}
        {current.boss && <span className="text-stat-hp"> · trùm</span>}
      </span>
      <span className="text-caption opacity-80">
        Đã vượt qua {survival.cleared} đợt
      </span>
      {next && !resting && (
        <span className="flex flex-wrap items-center gap-1 text-caption">
          <span className="font-semibold">
            Đợt kế ({next.foes.length} đối thủ cấp {next.level}
            {next.boss ? ", có sứ quân" : ""}):
          </span>
          <WaveFoes preview={next} />
        </span>
      )}
    </div>
  );
}

export function whirlHint(a: NonNullable<WhirlAim>): string {
  const name = a.skill ? a.skill.name : "Xoay miễn phí";
  return a.center
    ? `${name}: chạm lại tâm hoặc bấm ↻ để xoay theo chiều kim đồng hồ${a.max > 1 ? ", ↻ ×2 để xoay 2 nấc" : ""} (phím E${a.max > 1 ? ", Shift+E 2 nấc" : ""}).`
    : `${name}: rê chuột lên bàn để thấy vòng xoay, bấm để xoay 8 ô quanh ô đó theo chiều kim đồng hồ (trên điện thoại chạm để xem trước).`;
}

/** Ô nằm trong vòng 8 ô quanh tâm lốc xoáy. */
export const inRing = (c: Pos, p: Pos) =>
  Math.max(Math.abs(c.row - p.row), Math.abs(c.col - p.col)) === 1;

/**
 * Sân khấu hình tướng chỉ hiện từ 640px (sm) trở lên: trên điện thoại nhỏ nó chiếm cả màn hình đầu mà thẻ tướng bên dưới
 * đã đủ thông tin, nên bỏ hẳn (không dựng) để bàn cờ lên trước. Không dùng CSS ẩn để khỏi tải tranh vô ích.
 */
export const STAGE_QUERY = "(min-width: 640px)";

export function useStageVisible(): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(STAGE_QUERY);
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () => window.matchMedia(STAGE_QUERY).matches,
    () => true,
  );
}
