"use client";
// Thanh kỹ năng của người đang hành động: bấm để dùng (hoặc ngắm mục tiêu), phím số 1–6, xoáy ô miễn phí của hệ Phong.

import type { Dispatch, SetStateAction } from "react";
import SkillDetails from "./SkillDetails";
import { skillText } from "./labels";

import {
  canFreeWhirl,
  PASSIVE,
  comboSkillCost,
  type BattleState,
  type Pos,
  type SkillDef,
  type Whirl,
  type Fighter,
} from "@/core";

import {
  ElementIcon,
} from "../art/icons";
import { SkillIcon } from "../art/skills";

import {
  type Aim,
  type WhirlAim,
} from "./BattleHud";

export interface SkillBarProps {
  readonly actor: Fighter;
  readonly aim: Aim;
  readonly castSkill: (def: SkillDef) => void;
  readonly myTurn: boolean;
  readonly setAim: Dispatch<SetStateAction<Aim>>;
  readonly setPendingWhirl: Dispatch<SetStateAction<Whirl | null>>;
  readonly setSelected: Dispatch<SetStateAction<Pos | null>>;
  readonly setWhirlAim: Dispatch<SetStateAction<WhirlAim>>;
  readonly skills: SkillDef[];
  readonly stacked: boolean;
  readonly state: BattleState;
  readonly whirlAim: WhirlAim;
}

export function SkillBar({
  actor,
  aim,
  castSkill,
  myTurn,
  setAim,
  setPendingWhirl,
  setSelected,
  setWhirlAim,
  skills,
  stacked,
  state,
  whirlAim,
}: SkillBarProps) {
  return (
    <div
      className={
        stacked
          ? "hidden grid-cols-3 gap-1.5 lg:grid"
          : "grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:items-stretch lg:hidden"
      }
      aria-label="Kỹ năng"
    >
      <span className="col-span-3 w-full text-caption text-on-wood-soft">
        Kỹ năng của {actor.name}:
      </span>
      {skills.map((def, i) => {
        const disabled =
          !myTurn || state.turn.skillUsed || actor.energy < comboSkillCost(actor,def);
        const aiming =
          aim?.skill.id === def.id || whirlAim?.skill?.id === def.id;
        return (
          <button
            key={def.id}
            type="button"
            onClick={() => {
              if (!aiming) return castSkill(def);
              setAim(null);
              setWhirlAim(null);
              setPendingWhirl(null);
            }}
            className={`relative flex w-full flex-col items-center gap-0.5 rounded-lg p-1 text-caption leading-tight ${stacked ? "" : "sm:w-[4.5rem]"} border ${aiming ? "border-stat-hp bg-stat-hp text-white" : "border-frame-line-soft bg-wood-panel hover:border-frame-gold"} ${
              disabled && !aiming ? "opacity-40 grayscale" : ""
            }`}
            title={`${skillText(def)} · phím ${i + 1}`}
          >
            <SkillIcon def={def} className="size-10" />
            <span className="absolute left-1 top-1 rounded-br bg-black/60 px-1 text-[11px] font-bold text-white">
              {i + 1}
            </span>
            <span className="absolute right-1 top-1 rounded-bl bg-stat-energy/90 px-1 text-[11px] tabular-nums text-white">
              {comboSkillCost(actor,def)}
            </span>
            <span className="text-center">{def.name}</span>
          </button>
        );
      })}
      <SkillDetails skills={skills} passive={actor.comboPassive} fighter={actor} />
      {myTurn && canFreeWhirl(state) && (
        <button
          type="button"
          onClick={() => {
            setAim(null);
            setSelected(null);
            setWhirlAim(
              whirlAim && !whirlAim.skill
                ? null
                : {
                    skill: null,
                    max: PASSIVE.phongFreeWhirlTurns,
                    center: null,
                  },
            );
          }}
          className={`col-span-3 flex items-center justify-center gap-1 rounded px-2 py-2 text-caption ${stacked ? "" : "sm:col-auto"} ${whirlAim && !whirlAim.skill ? "bg-stat-hp text-white" : "bg-info text-white"}`}
        >
          <ElementIcon element="phong" className="size-3.5" /> Xoay
          miễn phí
        </button>
      )}
    </div>
  );
}
