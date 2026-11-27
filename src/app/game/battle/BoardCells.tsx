"use client";
// Các ô của bàn cờ trong trận: loại ô, ô đặc biệt, ô đang chọn, con trỏ bàn phím, vùng xoáy và ô sẽ ăn khi xoay,
// cùng hoạt ảnh rơi theo khung hình hiện tại.

import {
  needsCell,
  type Board,
  type Pos,
} from "@/core";
import {
  TILE_NAME,
  SPECIAL_NAME,
} from "./labels";

import { type Frame } from "./animation";

import { TileArt } from "../art/tiles";

import {
  type Aim,
  type WhirlAim,
  inRing,
} from "./BattleHud";

export interface BoardCellsProps {
  readonly aim: Aim;
  /** Hoạt ảnh đang chạy (khung hình hiện tại là `frames[i]`). */
  readonly anim: { readonly frames: readonly Frame[]; readonly i: number; readonly id: number } | null;
  readonly board: Board;
  readonly cursor: Pos;
  readonly frame: Frame | undefined;
  readonly onPointerDown: (pos: Pos, e: React.PointerEvent) => void;
  readonly selected: Pos | null;
  readonly showCursor: boolean;
  /** Xem trước khi xoay xoáy ô: bàn sau khi xoay và các ô sẽ ăn. */
  readonly spinView: { readonly after: Board; readonly matched: ReadonlySet<number>; readonly turns: number } | undefined;
  readonly whirlAim: WhirlAim;
  readonly whirlCenter: Pos | null;
  /** Con trỏ rê vào ô (chuột, bút); dùng để chọn tâm lốc xoáy khi đang xoay. */
  readonly onHoverCell?: (pos: Pos | null, pointerType: string) => void;
}

export function BoardCells({
  aim,
  anim,
  board,
  cursor,
  frame,
  onPointerDown,
  selected,
  showCursor,
  spinView,
  whirlAim,
  whirlCenter,
  onHoverCell,
}: BoardCellsProps) {
  return (
    <>
      {board.cells.map((tile, i) => {
        const pos = {
          row: Math.floor(i / board.cols),
          col: i % board.cols,
        };
        const cellAnim = frame?.anims[i];
        const center = whirlCenter;
        const isSel =
          (selected?.row === pos.row && selected.col === pos.col) ||
          (center?.row === pos.row && center.col === pos.col);
        const isRing = !!center && inRing(center, pos);
        const isWhirlHub = !!whirlAim && !!center && center.row === pos.row && center.col === pos.col;
        // Xem trước: ô trong vòng hiện quân sau khi xoay; ô sẽ ghép được viền vàng.
        const shown = spinView && isRing ? spinView.after.cells[i] : tile;
        const willMatch = !!spinView?.matched.has(i);
        const isCur =
          showCursor &&
          cursor.row === pos.row &&
          cursor.col === pos.col;
        return (
          <div
            key={cellAnim ? `${anim!.id}-${anim!.i}-${i}` : i}
            role="gridcell"
            data-row={pos.row}
            data-col={pos.col}
            aria-label={
              tile
                ? tile.special
                  ? SPECIAL_NAME[tile.special][tile.kind]
                  : TILE_NAME[tile.kind]
                : "Ô trống"
            }
            onPointerDown={(e) => onPointerDown(pos, e)}
            onPointerEnter={onHoverCell ? (e) => onHoverCell(pos, e.pointerType) : undefined}
            className={`relative aspect-square rounded-lg bg-[var(--battle-cell)] ${
              isWhirlHub ? "z-30" : isSel ? "z-10 scale-110 ring-2 ring-frame-gold-hi" : ""
            } ${isRing ? "ring-2 ring-info" : ""} ${willMatch ? "z-10 ring-2 ring-frame-gold-hi brightness-125" : ""} ${isCur ? "outline-2 outline-stat-shield" : ""} ${(aim && needsCell(aim.skill)) || whirlAim ? "cursor-crosshair" : "cursor-pointer"}`}
          >
            {shown && (
              <span
                className={`absolute inset-0 flex items-center justify-center ${spinView && isRing ? "opacity-80" : ""} ${cellAnim ? `tile-anim tile-anim-${cellAnim.kind}` : ""}`}
                style={
                  cellAnim
                    ? ({
                        "--dx": cellAnim.dx,
                        "--dy": cellAnim.dy,
                        animationDuration: `${frame!.ms}ms`,
                      } as React.CSSProperties)
                    : undefined
                }
              >
                <TileArt
                  kind={shown.kind}
                  special={shown.special}
                  className={`size-full ${shown.special === "strong" ? "tile-strong" : ""}`}
                />
              </span>
            )}
            {isWhirlHub && <WhirlRing />}
          </div>
        );
      })}
    </>
  );
}

/**
 * Vòng tròn lốc xoáy phủ 8 ô quanh tâm (kiểu xoay vòng của các game ghép ô), mũi tên chỉ chiều kim đồng hồ, xoay chậm
 * để báo bấm là xoay. Nằm trong ô tâm, rộng gấp ba ô.
 */
function WhirlRing() {
  return (
    <span aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 size-[300%] -translate-x-1/2 -translate-y-1/2">
      <svg viewBox="0 0 100 100" className="whirl-spin size-full drop-shadow-[0_0_6px_rgba(0,0,0,0.6)]">
        <circle cx={50} cy={50} r={45} fill="none" stroke="var(--color-info, #5aa9e6)" strokeOpacity={0.9} strokeWidth={3} strokeDasharray="22 6" />
        <path d="M50 5 l9 -4 -2 9 z M95 50 l4 9 -9 -2 z M50 95 l-9 4 2 -9 z M5 50 l-4 -9 9 2 z" fill="var(--color-info, #5aa9e6)" />
      </svg>
    </span>
  );
}
