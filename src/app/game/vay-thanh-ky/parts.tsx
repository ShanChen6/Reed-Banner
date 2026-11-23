"use client";

// Phần dùng chung của Vây Thành Kỳ cho ván ở trình duyệt (VayThanhKyScreen) và ván đấu người (OnlinePlay):
// chọn nguyên tố, khung người chơi theo hệ, dòng đếm điểm.

import type { ReactNode } from "react";
import { ELEMENTS, type Element } from "@/core";
import { BLACK, KOMI, WHITE, type Color, type Mode, type Score } from "@/core/co-vay";
import { ChoiceChip } from "@/components/ui";
import { ELEMENT_NAME } from "../battle/labels";
import { formatClock } from "../tam-quan-ky/parts";
import { OrbIcon } from "./Board";
import { THEME } from "./theme";

export const RULE_NAME: Record<Mode, string> = { full: "Vây đất", capture: "Bắt quân trước" };
export const RULE_HINT: Record<Mode, string> = {
  full: `Hai bên cùng bỏ lượt thì đếm quân và đất mình vây. Bên đi sau được cộng ${KOMI} điểm.`,
  capture: "Ván nhập môn: bắt được quân đầu tiên là thắng.",
};
export const SIZES = [9, 13, 19] as const;
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

/** Khung một bên: nền theo hệ, quả cầu, tên, số quân bắt được, đồng hồ. */
export function PlayerCard({ element, color, name, portrait, captures, active, status, clock }: {
  element: Element;
  color: Color;
  name: string;
  portrait?: ReactNode;
  captures: number;
  active: boolean;
  status?: string;
  clock?: number;
}) {
  return (
    <div
      className={`relative flex items-center gap-3 overflow-hidden rounded-control border-2 p-2.5 text-white shadow ${active ? "border-frame-gold" : "border-transparent"}`}
      style={{ background: THEME[element].panel }}
      data-element={element}
    >
      <OrbIcon element={element} className="size-11 shrink-0" />
      <div className="min-w-0 flex-1 [text-shadow:0_1px_2px_rgb(0_0_0/0.7)]">
        <p className="flex items-center gap-2 font-semibold">
          {portrait}
          <span className="truncate">{name}</span>
        </p>
        <p className="text-caption opacity-90">
          Hệ {ELEMENT_NAME[element]}, {sideOrder(color)}, bắt {captures} quân
        </p>
        {status && <p className="text-caption font-semibold text-frame-gold">{status}</p>}
      </div>
      {clock !== undefined && <span className="font-mono text-lg tabular-nums [text-shadow:0_1px_2px_rgb(0_0_0/0.7)]">{formatClock(clock)}</span>}
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
