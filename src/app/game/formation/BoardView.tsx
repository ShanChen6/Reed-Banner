"use client";

// Sa bàn Trận Đồ: lưới ô trên nền bản đồ. Ô chưa mở là ô che đặc kín, ô mở lộ bản đồ, ô chướng ngại có nền riêng. Có vệt sáng
// quét qua hàng/cột vừa dọn. Bàn phím: mũi tên đi giữa các ô, Enter hoặc Space đặt quân.

import type { RefObject } from "react";
import { idx, type PuzzleState } from "@/core/binh-phap";
import type { FormationMap } from "./maps";
import { Obstacle, obstacleKind, obstacleLabel, PieceFace, pieceLabel } from "./pieces";

export interface Sweep {
  readonly id: number;
  readonly axis: "row" | "col";
  readonly index: number;
}

export default function BoardView({
  state,
  map,
  legal,
  showHints,
  playing,
  last,
  focus,
  setFocus,
  setPeek,
  boardRef,
  sweeps,
  onPlace,
}: {
  state: PuzzleState;
  map: FormationMap;
  legal: ReadonlySet<number>;
  showHints: boolean;
  playing: boolean;
  last: number | null;
  focus: number;
  setFocus: (i: number) => void;
  /** Ô đang rê chuột hoặc có tiêu điểm bàn phím, để hiện lý do đặt được hay không. */
  setPeek: (i: number | null) => void;
  boardRef: RefObject<HTMLDivElement | null>;
  sweeps: readonly Sweep[];
  onPlace: (row: number, col: number) => void;
}) {
  const { width, height } = state;

  const moveFocus = (to: number) => {
    setFocus(to);
    boardRef.current?.querySelectorAll<HTMLButtonElement>("button[data-cell]")[to]?.focus();
  };
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const r = Math.floor(i / width);
    const c = i % width;
    const next =
      e.key === "ArrowUp" ? idx(width, Math.max(0, r - 1), c)
      : e.key === "ArrowDown" ? idx(width, Math.min(height - 1, r + 1), c)
      : e.key === "ArrowLeft" ? idx(width, r, Math.max(0, c - 1))
      : e.key === "ArrowRight" ? idx(width, r, Math.min(width - 1, c + 1))
      : e.key === "Home" ? idx(width, r, 0)
      : e.key === "End" ? idx(width, r, width - 1)
      : null;
    if (next !== null) {
      e.preventDefault();
      moveFocus(next);
    }
  };

  // Cỡ ô: tối đa theo số cột, và co lại để cả hàng luôn vừa chiều ngang màn (trừ lề trang, khung).
  const maxCell = width <= 3 ? 112 : width <= 5 ? 88 : width <= 7 ? 72 : 60;
  const cell = `min(${maxCell}px, calc((100vw - 3rem - 20px) / ${width}))`;

  return (
    <div ref={boardRef} role="grid" aria-label={`Sa bàn ${height} hàng ${width} cột`} data-won={state.phase === "won"} className="atlas-frame atlas-frame-wood w-fit p-2">
      <div
        className="fm-board relative grid overflow-hidden rounded-sm"
        style={{ gridTemplateColumns: `repeat(${width}, ${cell})`, gridAutoRows: cell, backgroundImage: `url(${map.src})` }}
        onMouseLeave={() => setPeek(null)}
      >
        {state.cells.map((c, i) => {
          const r = Math.floor(i / width);
          const col = i % width;
          const ok = playing && legal.has(i);
          return (
            <div role="gridcell" key={i} className="contents">
              <button
                type="button"
                data-cell
                tabIndex={i === focus ? 0 : -1}
                disabled={!playing}
                onFocus={() => {
                  setFocus(i);
                  setPeek(i);
                }}
                onBlur={() => setPeek(null)}
                onMouseEnter={() => setPeek(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                onClick={() => onPlace(r, col)}
                aria-disabled={c.blocked || undefined}
                aria-label={`Hàng ${r + 1}, cột ${col + 1}: ${c.blocked ? `${obstacleLabel(obstacleKind(i))} (chướng ngại), không đặt được` : c.piece ? pieceLabel(c.piece) : c.covered ? "trống, đã khai thông" : "trống, chưa khai thông"}${ok ? ", đặt được" : ""}`}
                data-state={c.blocked ? "rock" : c.covered ? "lit" : "fog"}
                className={[
                  "fm-cell flex items-center justify-center focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--atlas-gold)]",
                  ok && showHints ? "ring-2 ring-[#E8C477] ring-inset" : "",
                  last === i && state.phase !== "won" ? "z-10 outline-2 outline-offset-[-2px] outline-[#E8C477]" : "",
                ].join(" ")}
              >
                {c.blocked ? (
                  <Obstacle kind={obstacleKind(i)} />
                ) : c.piece ? (
                  <PieceFace piece={c.piece} />
                ) : ok && showHints ? (
                  <span aria-hidden className="size-2 rounded-full bg-[#E8C477] shadow-[0_0_6px_#E8C477]" />
                ) : null}
              </button>
            </div>
          );
        })}
        {sweeps.map((s) => (
          <span
            key={s.id}
            aria-hidden
            className={`fm-sweep ${s.axis === "row" ? "fm-sweep-row" : "fm-sweep-col"}`}
            style={
              s.axis === "row"
                ? { top: `${(100 * s.index) / height}%`, height: `${100 / height}%`, left: 0, right: 0 }
                : { left: `${(100 * s.index) / width}%`, width: `${100 / width}%`, top: 0, bottom: 0 }
            }
          />
        ))}
      </div>
    </div>
  );
}
