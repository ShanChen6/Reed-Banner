"use client";

// Các mảnh giao diện quanh sa bàn Trận Đồ: lệnh bài (quân đang cầm), ngọn lửa Bỏ Lệnh, thanh tiến độ, thanh dưới màn hình
// cho điện thoại, nút gợi ý và hướng dẫn từng bước.

import { FrameCorners } from "@/components/game-ui/FrameCorners";
import { buttonVariants } from "@/components/ui";
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
        <span className="text-on-wood-soft">Khai thông</span>
        <b className="tabular-nums">{covered}/{total} ({pct}%)</b>
      </p>
      <div role="progressbar" aria-label="Tiến độ khai thông" aria-valuemin={0} aria-valuemax={total} aria-valuenow={covered} className="h-2.5 overflow-hidden rounded-full bg-wood-inset">
        <div className="h-full rounded-full bg-gradient-to-r from-frame-bronze to-frame-gold-hi transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const PIECE_NAME = "font-serif text-xl leading-tight font-bold 2xl:text-2xl";
const PIECE_PILL = "inline-flex items-center gap-1 rounded-full border border-frame-bronze/60 bg-wood/10 px-2 py-0.5 text-sm font-semibold";
const PIECE_RULE = "mt-1 border-t border-frame-bronze/40 pt-2 text-sm text-wood/80";

/** Nội dung mô tả quân đang cầm: tên, nghề và hệ (nhãn tròn), rồi một dòng luật đặt quân ngăn bằng vạch đồng. */
function PieceText({ hand }: { hand: PuzzleState["hand"] }) {
  if (hand.kind === "normal")
    return (
      <>
        <p className={PIECE_NAME}>{nameOf(hand.characterId)}</p>
        <p className="flex flex-wrap gap-1.5">
          <span className={PIECE_PILL}><ProfessionIcon profession={hand.profession} className="size-4" /> {PROFESSION_NAME[hand.profession]}</span>
          <span className={PIECE_PILL}><ElementIcon element={hand.element} className="size-4" /> Hệ {ELEMENT_NAME[hand.element]}</span>
        </p>
        <p className={PIECE_RULE}>Đặt sát quân đã có; khớp từng quân kề: cùng nghề {PROFESSION_NAME[hand.profession]} hoặc cùng hệ {ELEMENT_NAME[hand.element]}.</p>
      </>
    );
  if (hand.kind === "fusion")
    return (
      <>
        <p className={PIECE_NAME}>{nameOf(hand.characterId)}</p>
        <p><span className={PIECE_PILL}>Dung hợp mọi nghề, mọi hệ</span></p>
        <p className={PIECE_RULE}>Khớp mọi quân kề, nhưng vẫn phải đặt sát một quân.</p>
      </>
    );
  if (hand.kind === "wild")
    return (
      <>
        <p className={PIECE_NAME}>Quân Lệnh</p>
        <p><span className={PIECE_PILL}>Quân đặc biệt</span></p>
        <p className={PIECE_RULE}>Đặt ở ô trống bất kỳ; khớp mọi quân kề.</p>
      </>
    );
  return (
    <>
      <p className={PIECE_NAME}>Thu Hồi</p>
      <p><span className={PIECE_PILL}>Quân đặc biệt</span></p>
      <p className={PIECE_RULE}>Chạm vào một quân trên bàn để xóa; ô vẫn giữ vệt khai thông.</p>
    </>
  );
}

/**
 * "Lệnh bài": thẻ giấy dó viền card, bên trái là tấm lệnh bài gỗ sơn son chữ 令 Shan vẽ (21/11/2026,
 * `public/art/formation/lenh-bai.webp`), chân dung quân đang cầm lồng vào ô tròn giữa tấm; bên phải là tên, nghề, hệ.
 * Ô tròn trong ảnh: tâm 50,4% bề ngang và 57,8% bề cao, đường kính 50,2% bề ngang (ảnh 660 × 1480 đã cắt sát).
 */
export function CommandCard({ state }: { state: PuzzleState }) {
  return (
    <section aria-label="Quân đang cầm" className="relative overflow-hidden rounded-lg border-2 border-frame-bronze bg-gradient-to-br from-paper-hi to-paper-deep px-4 py-3 text-wood shadow-[0_4px_14px_rgb(0_0_0/0.55)]">
      {/* Viền card như các card lớn khác (Shan 21/11/2026): vạch đồng bên trong và bốn góc hoa văn, màu gỗ sẫm trên giấy. */}
      <span aria-hidden className="pointer-events-none absolute inset-1 rounded-lg border border-frame-bronze/70" />
      <FrameCorners size="size-6" cornerClass="text-wood/70" />
      <div className="relative flex items-center gap-4">
        <div className="relative w-[6.5rem] shrink-0 2xl:w-28">
          {/* eslint-disable-next-line @next/next/no-img-element -- ảnh lệnh bài tĩnh làm khung chân dung */}
          <img src="/art/formation/lenh-bai.webp" alt="" aria-hidden draggable={false} className="block h-auto w-full drop-shadow-[0_4px_6px_rgb(0_0_0/0.45)]" />
          <div className="absolute top-[46.6%] left-[25.3%] aspect-square w-[50.2%]">
            <PieceFace piece={state.hand} large />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 text-[15px] leading-snug">
          <p className="flex items-center gap-1.5 font-serif text-caption font-bold tracking-[0.2em] text-lacquer uppercase">
            {/* eslint-disable-next-line @next/next/no-img-element -- biểu tượng tĩnh */}
            <img src="/art/formation/lenh-bai-icon.webp" alt="" aria-hidden className="size-6" draggable={false} />
            Lệnh bài
          </p>
          <PieceText hand={state.hand} />
        </div>
      </div>
    </section>
  );
}

/**
 * Nút gợi ý ô đặt được (bật tắt, nhớ lựa chọn): một biểu tượng tròn nhỏ (sa bàn có chấm sáng) đặt cạnh lệnh bài, thay
 * cho nút chữ "Gợi ý ô đặt được: Bật" dưới bàn (Shan 20/11/2026: nút chữ chiếm nhiều chỗ).
 */
export function HintToggle({ on, onToggle, className = "" }: { on: boolean; onToggle: () => void; className?: string }) {
  const label = `Gợi ý ô đặt được: ${on ? "đang bật" : "đang tắt"}`;
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label="Gợi ý ô đặt được"
      title={label}
      onClick={onToggle}
      className={`flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors ${on ? "border-frame-gold bg-frame-gold/25 text-frame-gold-hi shadow-[0_0_10px_color-mix(in_srgb,var(--frame-gold)_45%,transparent)]" : "border-frame-bronze/50 bg-black/20 text-on-wood-soft"} ${className}`}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
        <path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17" opacity={0.55} />
        <circle cx="12" cy="12" r={on ? 2.2 : 1.6} fill="currentColor" stroke="none" />
        {on && <circle cx="12" cy="12" r="4" opacity={0.5} />}
      </svg>
    </button>
  );
}

/**
 * Thanh dưới màn hình cho điện thoại (ngón cái chạm tới): quân đang cầm thu nhỏ, ngọn lửa Bỏ Lệnh, nút Bỏ Lệnh và tiến độ.
 * Ẩn ở màn rộng (đã có bảng điều khiển bên phải).
 */
export function MobileBar({ state, rules, noMove, disabled, covered, total, onDiscard, hintsOn, onToggleHints }: { state: PuzzleState; rules: Ruleset; noMove: boolean; disabled: boolean; covered: number; total: number; onDiscard: () => void; hintsOn: boolean; onToggleHints: () => void }) {
  const h = state.hand;
  const pct = total > 0 ? Math.round((100 * covered) / total) : 0;
  return (
    <div className="mobile-dock fixed inset-x-0 bottom-0 z-30 border-t-2 border-frame-bronze bg-wood-lo/95 px-3 pt-2 pb-3 shadow-[0_-6px_18px_rgb(0_0_0/0.6)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <div className="size-14 shrink-0 rounded-lg border border-frame-bronze bg-paper p-0.5"><PieceFace piece={h} large /></div>
        <div className="min-w-0 flex-1 text-sm leading-tight">
          <p className="truncate font-serif font-bold text-title-on-wood">{h.kind === "normal" || h.kind === "fusion" ? nameOf(h.characterId) : h.kind === "wild" ? "Quân Lệnh" : "Thu Hồi"}</p>
          <p className="truncate text-on-wood-soft">
            {h.kind === "normal" ? `${PROFESSION_NAME[h.profession]}, ${ELEMENT_NAME[h.element]}` : h.kind === "fusion" ? "Dung hợp: khớp mọi quân" : h.kind === "wild" ? "Đặt ở ô trống bất kỳ" : "Chạm vào quân để xóa"}
          </p>
          <p className="text-caption text-on-wood-soft">Khai thông {pct}%</p>
        </div>
        <HintToggle on={hintsOn} onToggle={onToggleHints} />
        <div className="flex flex-col items-center gap-1">
          <HeatFlames heat={state.discardHeat} max={rules.maxHeat} />
          <button type="button" disabled={disabled} onClick={onDiscard} className={buttonVariants({ variant: "secondary", className: "min-h-11 px-3 text-sm" })}>
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
    <div role="note" className="flex items-start gap-3 rounded-lg border border-frame-gold/60 bg-frame-gold/15 p-3 text-[15px] leading-snug">
      <span aria-hidden className="mt-0.5 rounded-full bg-lacquer px-2 py-0.5 text-caption font-bold text-title-on-wood">Mẹo</span>
      <p className="flex-1">{text}</p>
      <button type="button" onClick={onDismiss} className="min-h-9 pointer-coarse:min-h-11 shrink-0 rounded-lg border border-frame-bronze/60 px-3 text-sm font-semibold">Đã hiểu</button>
    </div>
  );
}

