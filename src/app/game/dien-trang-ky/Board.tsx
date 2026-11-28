"use client";

// Bàn 40 ô của Điền Trang Ký trên lưới 11×11: Hoa Lư ở góc dưới phải, đi ngược chiều kim đồng hồ. Mỗi ô đất có dải màu
// vùng, viền và nền theo hệ chủ đất, nhà năm bậc theo tranh (House.tsx). Giữa bàn là xúc xắc và dòng nhật ký mới nhất.
// Hình vẽ bằng code, chờ tranh Shan vẽ (prompt ở /mnt/project-files/art/prompts/dien-trang-ky.md).

import type { ReactNode } from "react";
import { REGIONS, TILES, colorHex, colorOf, type DtkState, type SpecialKind } from "@/core/dien-trang-ky";
import { cn } from "@/lib/cn";
import { House } from "./House";
import { money } from "./text";

/** Màu dải vùng, theo thứ tự vùng từ rẻ tới đắt (tông đất, lúa, sông núi). */
export const REGION_COLOR = ["#8c6239", "#a0522d", "#b8860b", "#6b8e23", "#2e8b57", "#3d7d8c", "#4169a8", "#6a5acd", "#8b4f9e", "#b03a6a", "#c0392b", "#d4a017"] as const;

/** Màu giấy và gỗ của bàn (vẽ tạm tới khi có tranh). */
const BOARD = { frame: "#3b2a1a", rim: "#7a5a35", ink: "#2b1d10", tile: "#f1e4c6", corner: "#e7d3a6", center: "#2b1f14" } as const;

const SPECIAL_MARK: Record<SpecialKind, string> = {
  start: "Khởi hành",
  boat: "Đi đò",
  festival: "Mở hội",
  jail: "Bị giam",
  omen: "Rút quẻ",
  poll: "Nộp thuế",
  tribute: "Nộp cống",
  market: "Mua đất",
};

/** Dải màu của bốn danh thắng. */
const SCENIC_COLOR = "#1f9e89";
/** Màu đèn lồng lễ hội nhỏ. */
const FAIR_COLOR = "#d9432b";

/** Núi và mái chùa nhỏ cho ô danh thắng. */
function ScenicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[34%] max-h-6" aria-hidden focusable="false">
      <path d="M2 20 L8 9 L12 15 L16 7 L22 20 Z" fill={SCENIC_COLOR} opacity={0.75} />
      <path d="M12 6 L9 9 H15 Z M10 9 V12 H14 V9" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" />
    </svg>
  );
}

/** Đèn lồng nhỏ đánh dấu ô có lễ hội nhỏ suốt ván. */
function FairMark() {
  return (
    <svg viewBox="0 0 12 16" className="pointer-events-none absolute right-0.5 top-[17%] h-[30%] w-auto drop-shadow" aria-hidden focusable="false">
      <path d="M6 0 V3" stroke={FAIR_COLOR} strokeWidth={1} />
      <ellipse cx={6} cy={8.5} rx={5} ry={5.5} fill={FAIR_COLOR} />
      <path d="M3 8.5 H9 M6 14 V16" stroke="#f5c542" strokeWidth={1} />
    </svg>
  );
}

/** Vết nứt và số lượt còn sửa trên nhà bị thiên tai. */
function RuinMark({ left }: { left: number }) {
  return (
    <span className="pointer-events-none absolute inset-0 grid place-items-center" style={{ background: "rgba(60,45,30,0.35)" }} aria-hidden>
      <svg viewBox="0 0 24 24" className="absolute inset-0 size-full" preserveAspectRatio="none" focusable="false">
        <path d="M14 0 L10 7 L15 11 L8 17 L12 24" fill="none" stroke="#2b1d10" strokeWidth={1.2} opacity={0.7} />
      </svg>
      <span className="relative rounded-lg px-0.5 text-[clamp(5px,0.9vw,9px)] font-bold text-white" style={{ background: "#5a4632" }}>
        Sửa {left}
      </span>
    </span>
  );
}

/** Hàng, cột (0..10) của ô `i`. */
export function cellOf(i: number): [number, number] {
  if (i <= 10) return [10, 10 - i];
  if (i <= 20) return [10 - (i - 10), 0];
  if (i <= 30) return [0, i - 20];
  return [i - 30, 10];
}

function SpecialIcon({ kind }: { kind: SpecialKind }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<SpecialKind, ReactNode> = {
    start: <path {...common} d="M4 20 V4 M4 5 C8 3 11 7 16 5 V12 C11 14 8 10 4 12" />,
    boat: <path {...common} d="M3 15 H21 L18 19 H6 Z M12 15 V5 L17 13 H12" />,
    festival: <path {...common} d="M6 21 V3 M6 4 Q11 6 9 9 Q13 8 18 10 Q12 12 6 12 M14 21 V8" />,
    jail: <path {...common} d="M4 4 H20 V20 H4 Z M8 4 V20 M12 4 V20 M16 4 V20 M4 12 H20" />,
    omen: <path {...common} d="M7 3 H17 V21 H7 Z M10 7 H14 M10 11 H14 M10 15 H14" />,
    poll: <path {...common} d="M12 4 A8 8 0 1 0 12.01 4 M9 12 H15 M12 9 V15" />,
    tribute: <path {...common} d="M4 18 H20 L18 10 H6 Z M8 10 V7 H16 V10" />,
    market: <path {...common} d="M3 9 L5 4 H19 L21 9 Z M5 9 V20 H19 V9 M10 20 V14 H14 V20" />,
  };
  return (
    <svg viewBox="0 0 24 24" className="size-[42%] max-h-7" aria-hidden focusable="false">
      {paths[kind]}
    </svg>
  );
}

export interface BoardProps {
  readonly state: DtkState;
  /** Ô đang chọn được (chợ phiên, đi đò, mở hội, bán đất). */
  readonly pickable?: ReadonlySet<number>;
  readonly selected?: number | null;
  readonly onTile?: (i: number) => void;
  readonly center?: ReactNode;
}

export function Board({ state, pickable, selected, onTile, center }: BoardProps) {
  return (
    <div className="dtk-board relative grid aspect-square w-full grid-cols-11 grid-rows-11 gap-px rounded-lg p-px" style={{ background: BOARD.frame, color: BOARD.ink, boxShadow: `inset 0 0 0 2px ${BOARD.rim}` }}>
      {TILES.map((t, i) => {
        const [row, col] = cellOf(i);
        const corner = i % 10 === 0;
        const plot = state.plots[i];
        const owner = plot && plot.owner !== null ? state.players[plot.owner]! : null;
        const here = state.players.flatMap((p, seat) => (!p.out && p.pos === i ? [seat] : []));
        const can = pickable?.has(i) ?? false;
        const tint = plot && plot.owner !== null ? colorHex(colorOf(state, plot.owner)) : null;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onTile?.(i)}
            aria-label={`${t.name}${t.kind === "land" || t.kind === "scenic" ? `, giá ${money(t.price)}${owner ? `, của ${owner.name}` : ", còn trống"}${state.fairs?.includes(i) ? ", có lễ hội nhỏ" : ""}` : ""}`}
            aria-pressed={selected === i}
            className={cn(
              "relative flex min-w-0 flex-col items-center justify-between overflow-hidden text-center leading-none transition-[box-shadow,filter]",
              can && "z-10 animate-pulse shadow-[0_0_0_2px_#f5c542] brightness-110",
              selected === i && "z-10 shadow-[0_0_0_2px_#fff]",
              state.festival === i && "shadow-[inset_0_0_0_2px_#e0482f]",
            )}
            style={{
              gridRow: row + 1,
              gridColumn: col + 1,
              backgroundColor: corner ? BOARD.corner : BOARD.tile,
              ...(tint ? { backgroundImage: `linear-gradient(${tint}40, ${tint}26)`, boxShadow: `inset 0 0 0 2px ${tint}` } : {}),
            }}
          >
            {t.kind === "land" ? (
              <>
                <span aria-hidden className="h-[14%] w-full shrink-0" style={{ background: REGION_COLOR[t.region] }} />
                <span className="line-clamp-2 px-px text-[clamp(5px,1.05vw,10px)] font-semibold">{t.name}</span>
                {plot && plot.level > 0 && owner ? <House level={plot.level} element={owner.element} color={tint!} className="h-[46%] w-auto" /> : <span className="text-[clamp(5px,0.95vw,9px)] opacity-75">{t.price}</span>}
              </>
            ) : t.kind === "scenic" ? (
              <>
                <span aria-hidden className="h-[14%] w-full shrink-0" style={{ background: SCENIC_COLOR }} />
                <span className="line-clamp-2 px-px text-[clamp(5px,1.05vw,10px)] font-semibold">{t.name}</span>
                <ScenicIcon />
                <span className="text-[clamp(5px,0.95vw,9px)] opacity-75">{owner ? "Danh thắng" : t.price}</span>
              </>
            ) : (
              <>
                <span className={cn("px-px pt-0.5 font-semibold", corner ? "text-[clamp(6px,1.15vw,11px)]" : "text-[clamp(5px,1vw,9px)]")}>{t.name}</span>
                <SpecialIcon kind={t.kind} />
                <span className="pb-0.5 text-[clamp(5px,0.85vw,8px)] opacity-75">{SPECIAL_MARK[t.kind]}</span>
              </>
            )}
            {state.fairs?.includes(i) && <FairMark />}
            {(plot?.ruin ?? 0) > 0 && <RuinMark left={plot!.ruin!} />}
            {here.length > 0 && (
              <span className="pointer-events-none absolute inset-x-0 bottom-[18%] flex justify-center gap-px">
                {here.map((seat) => (
                  <Token key={seat} seat={seat} state={state} />
                ))}
              </span>
            )}
          </button>
        );
      })}
      <div className="pointer-events-auto relative col-start-2 col-end-11 row-start-2 row-end-11 flex min-h-0 flex-col items-center justify-center gap-2 overflow-hidden p-2" style={{ background: BOARD.center, color: BOARD.tile }}>
        {center}
      </div>
    </div>
  );
}

export function Token({ seat, state, className }: { seat: number; state: DtkState; className?: string }) {
  const active = state.turn === seat && state.phase.k !== "ended";
  return (
    <span
      aria-hidden
      className={cn("grid size-[clamp(8px,2.1vw,18px)] place-items-center rounded-full border text-[clamp(5px,1vw,9px)] font-bold text-white shadow", active ? "border-white ring-1 ring-frame-gold" : "border-black/40", className)}
      style={{ background: colorHex(colorOf(state, seat)) }}
    >
      {seat + 1}
    </span>
  );
}

export const regionName = (r: number) => REGIONS[r]?.name ?? "";
