"use client";
// Thanh đầu màn trận: tên chế độ, trạng thái lượt, nút đổi đội hình ở Thao Luyện, chọn độ khó.

import type { Dispatch, SetStateAction } from "react";
import {
  type BattleState,
  type Difficulty,
  type Profile,
  type SurvivalView,
  type Profession,
} from "@/core";
import {
  DIFFICULTY_NAME,
} from "./labels";

import {
  ProfessionIcon,
} from "../art/icons";

import { buttonVariants } from "@/components/ui";

import {
  PLAYER,
  DIFFICULTIES,
  loadProfile,
} from "./demoSetup";

export interface BattleHeaderProps {
  readonly atBreak: boolean;
  readonly difficulty: Difficulty;
  readonly online: boolean;
  readonly pending: boolean;
  readonly playerTurn: boolean;
  readonly profession: Profession;
  readonly scenarioFailed: boolean;
  readonly scenarioOver: boolean;
  readonly setDifficulty: Dispatch<SetStateAction<Difficulty>>;
  readonly setProfile: Dispatch<SetStateAction<Profile>>;
  readonly setStarted: Dispatch<SetStateAction<boolean>>;
  readonly started: boolean;
  readonly state: BattleState;
  readonly survival: SurvivalView | null;
}

export function BattleHeader({
  atBreak,
  difficulty,
  online,
  pending,
  playerTurn,
  profession,
  scenarioFailed,
  scenarioOver,
  setDifficulty,
  setProfile,
  setStarted,
  started,
  state,
  survival,
}: BattleHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-frame-line-soft pb-2">
      {/* Tên chế độ đã ở header chung; giữ h1 cho trình đọc màn hình. */}
      <h1 className="sr-only">
        {online ? "Cờ Lau · Giao Tranh" : "Cờ Lau · Thao Luyện"}
      </h1>
      <div className="text-sm font-semibold text-title-on-wood" aria-live="polite">
        {!started
          ? ""
          : atBreak
            ? `Hạ hết đợt ${survival!.wave}, nghỉ giữa đợt`
            : scenarioOver && state.winner === null
              ? scenarioFailed
                ? "Phòng tuyến chưa giữ được"
                : "Hoàn thành mục tiêu"
              : survival && state.winner !== null
              ? "Trấn Ải kết thúc"
              : state.winner !== null
                ? state.winner === PLAYER
                  ? "Chúa công thắng!"
                  : "Chúa công thua"
                : pending
                  ? "Đang chờ máy chủ…"
                  : playerTurn
                    ? state.turn.extra
                      ? "Lượt thêm của bạn"
                      : "Lượt của bạn"
                    : "Lượt đối thủ…"}
      </div>
      {!online && started && (
        <button
          type="button"
          onClick={() => { setProfile(loadProfile()); setStarted(false); }}
          className={buttonVariants({ variant: "secondary", size: "sm", className: "min-h-9 pointer-coarse:min-h-11 gap-1.5 text-caption" })}
        >
          <ProfessionIcon profession={profession} className="size-4" />
          Đổi đội hình
        </button>
      )}
      <label className="flex items-center gap-2 text-caption text-on-wood-soft">
        Độ khó
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          className="min-h-9 pointer-coarse:min-h-11 rounded-control border border-frame-line-soft bg-wood-inset px-2 py-1 text-on-wood"
        >
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {DIFFICULTY_NAME[d]}
            </option>
          ))}
        </select>
      </label>
    </header>
  );
}
