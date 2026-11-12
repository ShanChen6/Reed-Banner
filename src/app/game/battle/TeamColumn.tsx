"use client";
// Cột một phe trong trận: tên phe, lương, thẻ từng nhân vật (đang hành động, chọn được, ngắm được),
// và thanh kỹ năng xếp dọc trên màn rộng.

import type { ReactNode } from "react";
import {
  isAlive,
  type BattleAction,
  type BattleState,
  type Pos,
  type Side,
} from "@/core";

import {
  FoodIcon,
} from "../art/icons";

import {
  PLAYER,
  AI,
} from "./demoSetup";

import {
  type Aim,
} from "./BattleHud";
import { FighterCard, type Float } from "./FighterCard";

export interface TeamColumnProps {
  readonly aim: Aim;
  readonly aimMark: number;
  readonly aimingAlly: boolean | undefined;
  readonly aimingFoe: boolean | undefined;
  readonly apply: (action: BattleAction) => boolean;
  readonly arenaFoe: { readonly name: string; readonly rating: number } | null;
  readonly fireAim: (picked?: number | undefined, cell?: Pos | undefined) => void;
  readonly floats: Float[];
  readonly inline: boolean;
  readonly own: Side;
  readonly s: 0 | 1;
  readonly selectable: number[];
  /** Thanh kỹ năng dựng sẵn ở DemoGame; cột phe người chơi hiện bản xếp dọc trên màn rộng. */
  readonly skillBar: (stacked: boolean) => ReactNode;
  readonly started: boolean;
  readonly state: BattleState;
}

export function TeamColumn({
  aim,
  aimMark,
  aimingAlly,
  aimingFoe,
  apply,
  arenaFoe,
  fireAim,
  floats,
  inline,
  own,
  s,
  selectable,
  skillBar,
  started,
  state,
}: TeamColumnProps) {
  return (
    <div
      className={`w-full grid-cols-3 gap-1.5 md:w-40 md:shrink-0 md:flex-col md:gap-2 lg:w-56 3xl:w-72 ${
        s === AI ? "order-1 grid md:order-none md:flex" : inline ? "grid md:hidden" : "hidden md:flex"
      }`}
    >
      <div className="col-span-3 flex items-center justify-between text-caption opacity-80">
        <span className="font-semibold">
          {s === PLAYER
            ? "Phe bạn"
            : arenaFoe
              ? `Bóng ma · ${arenaFoe.rating} điểm`
              : "Tianwu"}
        </span>
        <span
          title="Lương thực"
          className="flex items-center gap-1 tabular-nums"
        >
          <FoodIcon className="size-3.5" /> {own.food}/100
        </span>
      </div>
      {own.fighters.map((f, i) => {
        const isActor =
          state.winner === null &&
          state.turn.side === s &&
          state.turn.actor === i;
        const canPick =
          s === PLAYER && selectable.includes(i) && !state.turn.skillUsed;
        const target =
          (s === AI && aimingFoe) || (s === PLAYER && aimingAlly);
        return (
          <FighterCard
            key={f.id}
            fighter={f}
            experimentalSpirit={state.experimentalSpirit}
            comboTurns={f.comboReady ? Math.max(0,f.comboReady.expiresAt-(state.comboState?.sideTurns[s]??0)-1) : undefined}
            comboSource={f.comboReady ? state.sides[f.comboReady.source.side].fighters[f.comboReady.source.fighter]?.name : undefined}
            comboTarget={f.comboReady?.target ? state.sides[f.comboReady.target.side].fighters[f.comboReady.target.fighter]?.name : undefined}
            leader={own.leader === i}
            rage={own.leader === i ? own.rage : null}
            rageTurns={own.leader === i ? own.passiveTurns : 0}
            active={isActor}
            selectable={canPick && !aim}
            targetable={!!target && aimMark === i && isAlive(f)}
            floats={floats.filter((x) => x.side === s && x.fighter === i)}
            onClick={
              target && isAlive(f)
                ? () => fireAim(i)
                : canPick && !aim && !isActor
                  ? () => apply({ type: "selectActor", fighter: i })
                  : undefined
            }
          />
        );
      })}
      {s === PLAYER && !inline && started && skillBar(true)}
    </div>
  );
}
