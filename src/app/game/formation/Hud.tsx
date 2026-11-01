"use client";

// Các mảnh giao diện quanh sa bàn Trận Đồ: lệnh bài (quân đang cầm), ngọn lửa Bỏ Lệnh, thanh tiến độ, thanh dưới màn hình
// cho điện thoại, nút gợi ý và hướng dẫn từng bước.

import type { PuzzleState, Ruleset } from "@/core/binh-phap";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import { nameOf, PieceFace } from "./pieces";

/** Ba ngọn lửa của thanh Bỏ Lệnh: sáng bao nhiêu thì đã bỏ lệnh bấy nhiêu lần liên tiếp; ngọn cuối sáng là bỏ nữa sẽ thua. */
export function HeatFlames({ heat, max }: { heat: number; max: number }) {
  const full = heat >= max;
  return (
    <div role="meter" aria-label="Thanh Bỏ Lệnh" aria-valuemin={0} aria-valuemax={max} aria-valuenow={heat} aria-valuetext={`${heat} trên ${max}${full ? ", bỏ nữa là thua" : ""}`} className="flex items-end gap-1.5">
      {Array.from({ length: max }, (_, i) => {
        const on = i < heat;
        return (
          <svg key={i} viewBox="0 0 24 32" className={`h-7 w-5 ${on ? "fm-flame-on" : ""}`} aria-hidden focusable="false">
            <path
              d="M12 2 C14 8 20 11 20 19 a8 8 0 0 1 -16 0 C4 14 8 12 9 7 C10 9 11 9 12 2 Z"
              fill={on ? (full ? "#e5484d" : "#f59e0b") : "#2b2118"}
              stroke={on ? "#ffd07a" : "#5a4229"}
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
            {on && <path d="M12 15 C14 18 16 19 16 22 a4 4 0 0 1 -8 0 C8 19 11 18 12 15 Z" fill={full ? "#ffb4b4" : "#fff1a8"} />}
          </svg>
        );
      })}
    </div>
  );
}

/** Tiến độ khai thông: thanh đầy dần như bản đồ sáng dần. */
export function ProgressMeter({ covered, total }: { covered: number; total: number }) {
  const pct = total > 0 ? Math.round((100 * covered) / total) : 0;
  return (
    <div>
      <p className="mb-1 flex items-center justify-between text-sm">
        <span className="text-[var(--atlas-muted)]">Khai thông</span>
        <b className="tabular-nums">{covered}/{total} ({pct}%)</b>
      </p>
      <div role="progressbar" aria-label="Tiến độ khai thông" aria-valuemin={0} aria-valuemax={total} aria-valuenow={covered} className="h-2.5 overflow-hidden rounded-full bg-[#2b2118]">
        <div className="h-full rounded-full bg-gradient-to-r from-[#8F6A32] to-[#E8C477] transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Nội dung mô tả quân đang cầm (tên, nghề, hệ hoặc công dụng quân đặc biệt). */
function PieceText({ hand }: { hand: PuzzleState["hand"] }) {
  if (hand.kind === "normal")
    return (
      <>
        <p className="font-serif text-lg leading-tight font-bold">{nameOf(hand.characterId)}</p>
        <p className="flex items-center gap-1.5"><ProfessionIcon profession={hand.profession} className="size-5" /> {PROFESSION_NAME[hand.profession]}</p>
        <p className="flex items-center gap-1.5"><ElementIcon element={hand.element} className="size-5" /> Hệ {ELEMENT_NAME[hand.element]}</p>
      </>
    );
  if (hand.kind === "fusion")
    return (
      <>
        <p className="font-serif text-lg leading-tight font-bold">{nameOf(hand.characterId)}</p>
        <p>Dung hợp mọi nghề và mọi hệ: khớp mọi quân kề.</p>
        <p className="text-sm opacity-75">Vẫn phải đặt sát một quân.</p>
      </>
    );
  if (hand.kind === "wild")
    return (
      <>
        <p className="font-serif text-lg leading-tight font-bold">Quân Lệnh</p>
        <p>Đặt ở ô trống bất kỳ; khớp mọi quân kề.</p>
      </>
    );
  return (
    <>
      <p className="font-serif text-lg leading-tight font-bold">Thu Hồi</p>
      <p>Chạm vào một quân trên bàn để xóa; ô vẫn giữ vệt khai thông.</p>
    </>
  );
}

/** "Lệnh bài": tấm bài giấy dó có dấu son, hiện quân đang cầm. */
export function CommandCard({ state }: { state: PuzzleState }) {
  return (
    <section aria-label="Quân đang cầm" className="relative overflow-hidden rounded-lg border-2 border-[#8F6A32] bg-gradient-to-br from-[#EBD6A4] to-[#D3B77F] p-3 text-[#2B1F15] shadow-[0_4px_14px_rgb(0_0_0/0.55)]">
      <span aria-hidden className="absolute top-0 right-3 rounded-b bg-[#8F241D] px-2 pt-0.5 pb-1 font-serif text-[11px] font-bold tracking-[0.2em] text-[#FFE9B0]">LỆNH BÀI</span>
      <div className="flex items-center gap-3 pt-3">
        <div className="size-24 shrink-0 rounded-md bg-[#2B1F15]/10 p-1"><PieceFace piece={state.hand} large /></div>
        <div className="min-w-0 text-[15px] leading-snug"><PieceText hand={state.hand} /></div>
      </div>
    </section>
  );
}

/** Nút gợi ý ô đặt được (bật tắt, nhớ lựa chọn). */
export function HintToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button type="button" aria-pressed={on} onClick={onToggle} className={`flex min-h-11 items-center gap-2 rounded-full border px-4 text-[15px] ${on ? "border-[#C9A25A] bg-[#C9A25A]/25 font-semibold" : "border-[#8F6A32]/50 bg-black/20 text-[var(--atlas-muted)]"}`}>
      <span aria-hidden className={`size-2.5 rounded-full ${on ? "bg-[#E8C477] shadow-[0_0_6px_#E8C477]" : "bg-[#5a4229]"}`} />
      Gợi ý ô đặt được: {on ? "Bật" : "Tắt"}
    </button>
  );
}

/**
 * Thanh dưới màn hình cho điện thoại (ngón cái chạm tới): quân đang cầm thu nhỏ, ngọn lửa Bỏ Lệnh, nút Bỏ Lệnh và tiến độ.
 * Ẩn ở màn rộng (đã có bảng điều khiển bên phải).
 */
export function MobileBar({ state, rules, noMove, disabled, covered, total, onDiscard }: { state: PuzzleState; rules: Ruleset; noMove: boolean; disabled: boolean; covered: number; total: number; onDiscard: () => void }) {
  const h = state.hand;
  const pct = total > 0 ? Math.round((100 * covered) / total) : 0;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-[#8F6A32] bg-[#1d140d]/95 px-3 pt-2 pb-3 shadow-[0_-6px_18px_rgb(0_0_0/0.6)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <div className="size-14 shrink-0 rounded-md border border-[#8F6A32] bg-[#E4CC99] p-0.5"><PieceFace piece={h} large /></div>
        <div className="min-w-0 flex-1 text-sm leading-tight">
          <p className="truncate font-serif font-bold text-[var(--atlas-title)]">{h.kind === "normal" || h.kind === "fusion" ? nameOf(h.characterId) : h.kind === "wild" ? "Quân Lệnh" : "Thu Hồi"}</p>
          <p className="truncate text-[var(--atlas-muted)]">
            {h.kind === "normal" ? `${PROFESSION_NAME[h.profession]} · ${ELEMENT_NAME[h.element]}` : h.kind === "fusion" ? "Dung hợp: khớp mọi quân" : h.kind === "wild" ? "Đặt ở ô trống bất kỳ" : "Chạm vào quân để xóa"}
          </p>
          <p className="text-xs text-[var(--atlas-muted)]">Khai thông {pct}%</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <HeatFlames heat={state.discardHeat} max={rules.maxHeat} />
          <button type="button" disabled={disabled} onClick={onDiscard} className="home-secondary min-h-11 rounded-lg px-3 font-serif text-sm font-semibold disabled:opacity-60">
            Bỏ Lệnh{noMove ? " !" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Lời nhắc từng bước ở bậc Hướng dẫn; null khi không còn gì để nhắc. */
export function tutorialText(state: PuzzleState, noMove: boolean): string | null {
  if (state.phase !== "playing") return null;
  if (state.placed === 0 && state.discarded === 0) return "Bước 1: chạm vào bất kỳ ô nào để đặt quân đầu tiên. Sa bàn đang trống nên đặt ở đâu cũng được.";
  if (noMove) return "Không còn ô nào hợp? Bấm Bỏ Lệnh để đổi quân. Mỗi lần bỏ, một ngọn lửa bùng lên; lửa đầy mà còn bỏ nữa là thua. Đặt được quân thì lửa dịu đi.";
  if (state.linesCleared === 0 && state.placed < 6) return "Bước 2: quân mới phải đặt sát một quân (trên, dưới, trái, phải) và trùng nghề hoặc trùng hệ với quân đó. Ô viền vàng là ô đặt được.";
  if (state.linesCleared > 0 && state.linesCleared <= 2) return "Hàng hoặc cột kín quân được dọn sạch, nhưng ô vẫn sáng. Khai thông hết mọi ô để lộ cả bản đồ!";
  return null;
}

export function TutorialTip({ text, onDismiss }: { text: string; onDismiss: () => void }) {
  return (
    <div role="note" className="flex items-start gap-3 rounded-lg border border-[#C9A25A]/60 bg-[#C9A25A]/15 p-3 text-[15px] leading-snug">
      <span aria-hidden className="mt-0.5 rounded-full bg-[#8F241D] px-2 py-0.5 text-xs font-bold text-[#FFE9B0]">Mẹo</span>
      <p className="flex-1">{text}</p>
      <button type="button" onClick={onDismiss} className="min-h-9 shrink-0 rounded border border-[#8F6A32]/60 px-3 text-sm font-semibold">Đã hiểu</button>
    </div>
  );
}

