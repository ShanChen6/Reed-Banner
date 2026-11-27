"use client";

// Bàn cờ ở phần mở đầu trang giới thiệu tự chơi vài nước ghép bằng đúng luật bàn cờ của game (findValidMoves,
// findMatches, rơi và sinh ô mới), để người xem hiểu "game ghép ô" trong vài giây. Dừng khi cuộn khuất hoặc khi
// bật giảm chuyển động; bàn đầu sinh cố định theo seed nên server và client vẽ giống nhau.

import { useEffect, useRef, useState } from "react";
import {
  applyGravity,
  BOARD_COLS,
  BOARD_ROWS,
  createBoard,
  createRng,
  findMatches,
  findValidMoves,
  indexOf,
  refill,
  STANDARD_WEIGHTS,
  swapCells,
  type Board,
  type Tile,
} from "@/core";
import { TileArt } from "../game/art/tiles";

const SWAP_MS = 650;
const CLEAR_MS = 520;
const REST_MS = 1300;

export default function HeroBoard({ cells }: { cells: readonly (Tile | null)[] }) {
  const [board, setBoard] = useState<Board>(() => createBoard(BOARD_COLS, BOARD_ROWS, cells));
  const [focus, setFocus] = useState<readonly number[]>([]);
  const [clearing, setClearing] = useState<ReadonlySet<number>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = false;
    let timer = 0;
    let step = 0;
    let current = createBoard(BOARD_COLS, BOARD_ROWS, cells);
    const rng = createRng(2026);
    const wait = (ms: number, next: () => void) => {
      timer = window.setTimeout(() => (visible ? next() : (timer = window.setTimeout(() => wait(0, next), 400))), ms);
    };
    const cascade = (b: Board, depth: number) => {
      const groups = findMatches(b);
      if (groups.length === 0 || depth > 3) {
        setClearing(new Set());
        current = b;
        wait(REST_MS, move);
        return;
      }
      const gone = new Set(groups.flatMap((g) => g.cells.map((p) => indexOf(b, p))));
      setClearing(gone);
      wait(CLEAR_MS, () => {
        const emptied = { ...b, cells: b.cells.map((t, i) => (gone.has(i) ? null : t)) };
        const next = refill(applyGravity(emptied), rng, STANDARD_WEIGHTS).board;
        setClearing(new Set());
        setBoard(next);
        wait(CLEAR_MS, () => cascade(next, depth + 1));
      });
    };
    const move = () => {
      const moves = findValidMoves(current);
      if (moves.length === 0) {
        current = createBoard(BOARD_COLS, BOARD_ROWS, cells);
        setBoard(current);
        wait(REST_MS, move);
        return;
      }
      const m = moves[(step++ * 7) % moves.length]!;
      setFocus([indexOf(current, m.from), indexOf(current, m.to)]);
      wait(SWAP_MS, () => {
        const swapped = swapCells(current, m.from, m.to);
        setFocus([]);
        setBoard(swapped);
        wait(SWAP_MS / 2, () => cascade(swapped, 0));
      });
    };
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
    });
    if (ref.current) io.observe(ref.current);
    wait(REST_MS, move);
    return () => {
      window.clearTimeout(timer);
      io.disconnect();
    };
  }, [cells]);

  return (
    <div
      ref={ref}
      className="fx-board-well relative grid gap-0.5 overflow-hidden rounded-lg p-0.5"
      style={{ gridTemplateColumns: `repeat(${BOARD_COLS}, minmax(0, 1fr))` }}
    >
      {board.cells.map((t, i) => (
        <div
          key={i}
          className={`aspect-square rounded-lg transition duration-300 ${focus.includes(i) ? "z-10 scale-110 ring-2 ring-frame-gold-hi" : ""} ${clearing.has(i) ? "scale-50 opacity-0" : ""}`}
        >
          {t && <TileArt kind={t.kind} special={t.special} className={`size-full ${t.special === "strong" ? "tile-strong" : ""}`} />}
        </div>
      ))}
      <div
        aria-hidden
        className="board-knots pointer-events-none absolute inset-px"
        style={{ backgroundSize: `calc(100% / ${BOARD_COLS}) calc(100% / ${BOARD_ROWS})` }}
      />
    </div>
  );
}
