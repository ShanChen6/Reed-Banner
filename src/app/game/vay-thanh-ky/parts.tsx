"use client";

// Phần dùng chung của Vây Thành Kỳ cho ván ở trình duyệt (VayThanhKyScreen) và ván đấu người (OnlinePlay):
// chọn nguyên tố, khung người chơi theo hệ, dòng đếm điểm.

import type { ReactNode } from "react";
import { ELEMENTS, type Element } from "@/core";
import { BLACK, KOMI, WHITE, type Color, type Mode, type Score } from "@/core/co-vay";
import { ChoiceChip } from "@/components/ui";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { usePlayCardExpanded } from "../PlayCard";
import { ELEMENT_NAME } from "../battle/labels";
import { formatClock } from "../tam-quan-ky/parts";
import { OrbIcon } from "./Board";
import { THEME, panelArt } from "./theme";

export const RULE_NAME: Record<Mode, string> = { full: "Vây đất", capture: "Bắt quân trước" };
export const RULE_HINT: Record<Mode, string> = {
  full: `Hai bên cùng bỏ lượt thì đếm quân và đất mình vây. Bên đi sau được cộng ${KOMI} điểm.`,
  capture: "Ván nhập môn: bắt được quân đầu tiên là thắng.",
};
export const SIZES = [9, 13, 19] as const;
/** Từ chừng này trở lên thì hai khung người chơi đứng hai bên bàn. */
const WIDE_QUERY = "(min-width: 64rem)";
export const sideOrder = (c: Color) => (c === BLACK ? "đi trước" : "đi sau");

/** Bảy quả cầu nguyên tố để chọn hệ. `taken` là hệ bên kia đã chọn (không chọn trùng). */
export function ElementPicker({ label, value, taken, onChange }: { label: string; value: Element; taken?: Element; onChange: (e: Element) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="ui-title-on-wood font-bold">{label}</h2>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {ELEMENTS.map((e) => (
          <ChoiceChip key={e} selected={e === value} disabled={e === taken} size="md" onClick={() => onChange(e)} title={e === taken ? "Bên kia đã chọn hệ này" : undefined}>
            <OrbIcon element={e} className="size-7" />
            {ELEMENT_NAME[e]}
          </ChoiceChip>
        ))}
      </div>
    </div>
  );
}

/** Tranh nền của hệ (Shan vẽ) phủ kín khung. */
function ElementBackdrop({ element }: { element: Element }) {
  // eslint-disable-next-line @next/next/no-img-element -- ảnh trang trí nhỏ trong public/art
  return <img src={panelArt(element)} alt="" aria-hidden className="absolute inset-0 size-full object-cover" />;
}

/**
 * Khung một bên người chơi, nền theo hệ: quả cầu lớn có quầng sáng, tên, số quân bắt, đồng hồ. `tall` là cột cạnh bàn
 * (màn rộng), còn lại là dải ngang gọn (điện thoại).
 */
export function PlayerCard({ element, color, name, portrait, captures, active, status, clock, tall = false }: {
  element: Element;
  color: Color;
  name: string;
  portrait?: ReactNode;
  captures: number;
  active: boolean;
  status?: string;
  clock?: number;
  tall?: boolean;
}) {
  const t = THEME[element];
  return (
    <div
      className={`relative isolate overflow-hidden rounded-control border-2 text-white shadow-lg transition-[border-color,box-shadow] ${active ? "border-frame-gold" : "border-[color:var(--frame-line)]"} ${tall ? "flex h-full min-h-80 flex-col items-center justify-start gap-3 px-3 py-5 text-center" : "flex items-center gap-3 p-2.5"}`}
      style={active ? { boxShadow: `0 0 18px -2px ${t.glow}` } : undefined}
      data-element={element}
      data-active={active || undefined}
    >
      <ElementBackdrop element={element} />
      <div aria-hidden className={`absolute inset-0 -z-0 ${tall ? "bg-[linear-gradient(180deg,rgb(0_0_0/0.15)_0%,rgb(0_0_0/0.35)_55%,rgb(0_0_0/0.7)_100%)]" : "bg-[linear-gradient(90deg,rgb(0_0_0/0.55),rgb(0_0_0/0.25))]"}`} />
      <div className={`relative shrink-0 ${tall ? "mt-1" : ""}`}>
        <div aria-hidden className="absolute inset-[-18%] rounded-full blur-xl" style={{ background: t.glow, opacity: active ? 0.75 : 0.4 }} />
        <OrbIcon element={element} className={`relative ${tall ? "size-28 xl:size-32" : "size-12"}`} />
      </div>
      <div className={`relative min-w-0 [text-shadow:0_1px_3px_rgb(0_0_0/0.9)] ${tall ? "flex w-full flex-col items-center gap-1" : "flex-1"}`}>
        <p className={`flex items-center gap-2 font-semibold ${tall ? "justify-center text-lg" : ""}`}>
          {portrait}
          <span className="truncate">{name}</span>
        </p>
        <p className="text-caption opacity-90">
          Hệ {ELEMENT_NAME[element]}, {sideOrder(color)}
        </p>
        {tall && (
          <p className="mt-2 rounded-full border border-white/25 bg-black/35 px-3 py-1 text-sm">
            Bắt được <b className="tabular-nums">{captures}</b> quân
          </p>
        )}
        {!tall && <p className="text-caption opacity-90">Bắt {captures} quân</p>}
        {status && <p className={`w-fit rounded-full bg-black/60 px-2.5 py-0.5 font-semibold text-frame-gold ${tall ? "mt-1" : "mt-0.5 text-caption"}`}>{status}</p>}
      </div>
      {clock !== undefined && (
        <span className={`relative rounded-control bg-black/45 px-2 py-0.5 font-mono tabular-nums [text-shadow:0_1px_2px_rgb(0_0_0/0.7)] ${tall ? "mt-auto text-2xl" : "text-lg"}`}>{formatClock(clock)}</span>
      )}
    </div>
  );
}

/** Điểm hai bên khi đếm: quân trên bàn + đất vây, bên đi sau cộng komi. */
export function ScoreLines({ score, names }: { score: Pick<Score, "black" | "white"> & Partial<Score>; names: Record<Color, string> }) {
  return (
    <div className="flex flex-col gap-1 tabular-nums text-on-wood">
      <p>
        {names[BLACK]}: <b>{score.black}</b>
        {score.blackStones !== undefined && <span className="text-caption text-on-wood-soft"> ({score.blackStones} quân + {score.blackArea} đất)</span>}
      </p>
      <p>
        {names[WHITE]}: <b>{score.white}</b>
        {score.whiteStones !== undefined && <span className="text-caption text-on-wood-soft"> ({score.whiteStones} quân + {score.whiteArea} đất + {KOMI})</span>}
      </p>
    </div>
  );
}

/**
 * Bố cục trận kiểu hai bên kẹp bàn: màn rộng ba cột (bên đi trước trái, bàn giữa, bên đi sau phải), bàn vuông co theo
 * chiều cao màn để vừa một màn hình, cả khi phóng to. Hẹp hơn thì xếp dọc: hai khung gọn trên, bàn, phần dưới.
 * `side(tall)` vẽ khung một bên theo kiểu cột (tall) hoặc dải gọn.
 */
export function Arena({ left, right, board, below }: {
  left: (tall: boolean) => ReactNode;
  right: (tall: boolean) => ReactNode;
  board: ReactNode;
  below: ReactNode;
}) {
  const wide = useMediaQuery(WIDE_QUERY);
  const expanded = usePlayCardExpanded();
  const boardWidth = wide ? `min(100%, calc(100dvh - ${expanded ? 14 : 15}rem))` : "100%";
  return (
    <div className={`grid min-w-0 gap-3 ${wide ? "grid-cols-[minmax(11rem,16rem)_minmax(0,1fr)_minmax(11rem,16rem)] items-stretch gap-4" : ""}`}>
      {wide ? left(true) : (
        <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2">
          {left(false)}
          {right(false)}
        </div>
      )}
      <div className="flex min-w-0 flex-col items-center gap-3">
        <div className="w-full" style={{ maxWidth: boardWidth }}>{board}</div>
        <div className="flex w-full flex-col items-center gap-3" style={{ maxWidth: wide ? boardWidth : undefined }}>{below}</div>
      </div>
      {wide && right(true)}
    </div>
  );
}
