"use client";
// Phím tắt trong trận: mũi tên hoặc WASD di chuyển con trỏ, Enter/Space chọn ô, phím số dùng kỹ năng, Tab đổi người hành động,
// Q/E xoay xoáy ô, Esc hủy ngắm. Tách từ DemoGame.tsx ngày 12/11/2026, không đổi logic.

import { useEffect, type Dispatch, type SetStateAction } from "react";
import { skillTargetOptions, type BattleState, type Pos, type SkillDef, type Whirl } from "@/core";
import type { Aim, WhirlAim } from "./BattleHud";

export interface BattleKeyboard {
  readonly aim: Aim;
  readonly aimIndex: number;
  readonly castSkill: (def: SkillDef) => void;
  readonly cursor: Pos;
  readonly fireAim: (picked?: number, cell?: Pos) => void;
  readonly myTurn: boolean;
  readonly onCell: (pos: Pos) => void;
  readonly selected: Pos | null;
  readonly setAim: Dispatch<SetStateAction<Aim>>;
  readonly setAimIndex: Dispatch<SetStateAction<number>>;
  readonly setCursor: Dispatch<SetStateAction<Pos>>;
  readonly setPendingWhirl: Dispatch<SetStateAction<Whirl | null>>;
  readonly setSelected: Dispatch<SetStateAction<Pos | null>>;
  readonly setShowCursor: Dispatch<SetStateAction<boolean>>;
  readonly setWhirlAim: Dispatch<SetStateAction<WhirlAim>>;
  readonly skills: readonly SkillDef[];
  readonly spinWhirl: (turns: number) => void;
  readonly state: BattleState;
  readonly switchActor: (step: 1 | -1) => void;
  readonly trySwap: (from: Pos, to: Pos) => void;
  readonly whirlAim: WhirlAim;
}

export function useBattleKeyboard({
  aim,
  aimIndex,
  castSkill,
  cursor,
  fireAim,
  myTurn,
  onCell,
  selected,
  setAim,
  setAimIndex,
  setCursor,
  setPendingWhirl,
  setSelected,
  setShowCursor,
  setWhirlAim,
  skills,
  spinWhirl,
  state,
  switchActor,
  trySwap,
  whirlAim,
}: BattleKeyboard): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!myTurn) return;
      const dirs: Record<string, [number, number]> = {
        ArrowUp: [-1, 0],
        w: [-1, 0],
        W: [-1, 0],
        ArrowDown: [1, 0],
        s: [1, 0],
        S: [1, 0],
        ArrowLeft: [0, -1],
        a: [0, -1],
        A: [0, -1],
        ArrowRight: [0, 1],
        d: [0, 1],
        D: [0, 1],
      };
      const dir = dirs[e.key];
      if (whirlAim?.center && /^[qe]$/i.test(e.key)) {
        e.preventDefault();
        const turns = (e.key.toLowerCase() === "e" ? 1 : -1) * (e.shiftKey ? 2 : 1);
        if (Math.abs(turns) <= whirlAim.max) spinWhirl(turns);
        return;
      }
      if (aim?.choose && aim.target === undefined) {
        const options = skillTargetOptions(state, aim.skill);
        const n = options.length;
        if (dir && dir[1] !== 0) {
          e.preventDefault();
          setAimIndex((i) => options[(options.indexOf(i) + dir[1] + n) % n] ?? options[0]!);
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          fireAim(aimIndex);
        } else if (e.key === "Escape") setAim(null);
        return;
      }
      if (dir) {
        e.preventDefault();
        setShowCursor(true);
        const next = {
          row: Math.max(0, Math.min(state.board.rows - 1, cursor.row + dir[0])),
          col: Math.max(0, Math.min(state.board.cols - 1, cursor.col + dir[1])),
        };
        if (selected && !aim) {
          trySwap(selected, next);
          setCursor(next);
        } else setCursor(next);
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setShowCursor(true);
        onCell(cursor);
      } else if (e.key === "Escape") {
        setSelected(null);
        setAim(null);
        setWhirlAim(null);
        setPendingWhirl(null);
      } else if (e.key === "Tab") {
        e.preventDefault();
        switchActor(e.shiftKey ? -1 : 1);
      } else if (/^[1-6]$/.test(e.key)) {
        const def = skills[Number(e.key) - 1];
        if (def) castSkill(def);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    myTurn,
    aim,
    aimIndex,
    whirlAim,
    spinWhirl,
    cursor,
    selected,
    state,
    skills,
    fireAim,
    onCell,
    trySwap,
    switchActor,
    castSkill,
    setAim,
    setAimIndex,
    setCursor,
    setPendingWhirl,
    setSelected,
    setShowCursor,
    setWhirlAim,
  ]);
}
