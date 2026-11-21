"use client";
// Thanh đầu màn trận: tên chế độ, trạng thái lượt, nút đổi đội hình và chọn độ khó ở Thao Luyện (trận offline).

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

import { buttonVariants, Select } from "@/components/ui";
import { SurrenderButton } from "@/components/game-ui";

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
  /** Có khi ván đang đánh dở: nút Đầu hàng kèm câu hậu quả theo chế độ. */
  readonly surrender: {
    readonly consequence: string;
    readonly onConfirm: () => void;
    readonly disabled: boolean;
  } | null;
}

/** Loại trận đang đánh, để nói đúng hậu quả của việc đầu hàng. */
export interface SurrenderContext {
  readonly online: boolean;
  /** Trấn Ải: số đợt đã vượt qua; null khi không phải Trấn Ải. */
  readonly survivalCleared: number | null;
  readonly scenario: boolean;
  readonly raid: boolean;
  readonly trial: boolean;
  readonly destiny: boolean;
  readonly daily: boolean;
  readonly arena: boolean;
  readonly expedition: boolean;
}

/** Câu hậu quả trong hộp thoại Đầu hàng, theo luật từng chế độ. */
export function surrenderConsequence(c: SurrenderContext): string {
  if (!c.online) return "Ván Thao Luyện này tính là thua. Không mất gì, bạn có thể vào ván mới ngay.";
  if (c.survivalCleared !== null)
    return c.survivalCleared > 0
      ? `Lượt Trấn Ải dừng ở đợt ${c.survivalCleared} đã vượt qua và vẫn ghi điểm theo số đợt đó.`
      : "Lượt Trấn Ải dừng khi chưa vượt đợt nào.";
  if (c.scenario) return "Nhiệm vụ Bình Loạn tính là thất bại. Bạn có thể đánh lại nhiệm vụ này sau.";
  if (c.raid) return "Trận Tái đấu sứ quân tính là thua; bậc này chưa được vượt.";
  if (c.trial) return "Trận tính là thua, tầng này chưa được vượt. Bạn về lại tầng vừa đánh để đổi đội.";
  if (c.destiny) return "Trận tầng này tính là thua như khi bị hạ, theo luật Tháp Thiên Mệnh.";
  if (c.daily) return "Trận Nhật Lệnh hôm nay tính là thua (vẫn nhận vàng của trận thua) và không đánh lại được.";
  if (c.arena) return "Trận Quần Hùng tính là thua và bị trừ điểm hạng như khi thua.";
  if (c.expedition) return "Trận trên sa bàn Viễn Chinh tính là thua: đạo quân này rút về và gục.";
  return "Trận này tính là thua.";
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
  surrender,
}: BattleHeaderProps) {
  // Sảnh chờ trước trận đã có banner, độ khó và nút riêng: thanh này chỉ còn tiêu đề cho trình đọc màn hình.
  if (!started) return <h1 className="sr-only">{online ? "Cờ Lau – Giao Tranh" : "Cờ Lau – Thao Luyện"}</h1>;
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-frame-line-soft pb-2 max-sm:flex-nowrap max-sm:pb-1.5">
      {/* Tên chế độ đã ở header chung; giữ h1 cho trình đọc màn hình. */}
      <h1 className="sr-only">
        {online ? "Cờ Lau – Giao Tranh" : "Cờ Lau – Thao Luyện"}
      </h1>
      {/* Chiếm phần trống còn lại: chữ trạng thái dài ngắn theo lượt không làm nút bên cạnh nhích qua lại. */}
      {/* Điện thoại: lúc đang đánh, thanh giờ ngay trên bàn cờ đã nói lượt của ai; chữ ở đây chỉ còn cho trình đọc màn hình. */}
      <div className={`min-w-0 flex-1 text-sm font-semibold text-title-on-wood ${state.winner === null && !atBreak && !scenarioOver ? "max-sm:sr-only" : ""}`} aria-live="polite">
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
      {surrender && (
        <SurrenderButton
          consequence={surrender.consequence}
          onConfirm={surrender.onConfirm}
          disabled={surrender.disabled}
          className="min-h-9 pointer-coarse:min-h-11 whitespace-nowrap text-caption max-sm:px-2.5"
        />
      )}
      {!online && started && (
        <button
          type="button"
          onClick={() => { setProfile(loadProfile()); setStarted(false); }}
          className={buttonVariants({ variant: "secondary", size: "sm", className: "min-h-9 pointer-coarse:min-h-11 gap-1.5 whitespace-nowrap text-caption max-sm:px-2.5" })}
        >
          <ProfessionIcon profession={profession} className="size-4" />
          Đổi đội hình
        </button>
      )}
      {/* Trận online: máy chủ đã chốt độ khó lúc dựng trận nên đổi ở đây không có tác dụng; chỉ trận offline đổi được. */}
      {!online && (
        <label className="flex items-center gap-2 text-caption text-on-wood-soft max-sm:ml-auto">
          <span className="max-sm:sr-only">Độ khó</span>
          <Select uiSize="sm" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {DIFFICULTY_NAME[d]}
              </option>
            ))}
          </Select>
        </label>
      )}
    </header>
  );
}
