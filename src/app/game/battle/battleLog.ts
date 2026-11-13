// Nhật ký trận: dịch sự kiện của lõi trận đấu thành một dòng chữ cho người chơi.

import {
  getSkill,
  companionById,
  MAIN_ID,
  PASSIVES,
  COMBO_PASSIVES,
  CHASE_PASSIVES,
  DEFAULT_SPIRIT_EXPERIMENT,
  SPIRIT_EXPERIMENTS,
  type BattleEvent,
  type BattleState,
} from "@/core";

import {
  PLAYER,
} from "./demoSetup";

export const fighterName = (id: string) =>
  id === MAIN_ID ? "Đinh Bộ Lĩnh" : (companionById(id)?.name ?? id);

export interface LogLine {
  readonly id: number;
  readonly text: string;
}

export function describe(state: BattleState, e: BattleEvent): string | null {
  const name = (side: number, i: number) =>
    state.sides[side as 0 | 1].fighters[i]?.name ?? "?";
  switch (e.type) {
    case "skill":
      return `${name(e.side, e.fighter)} dùng ${getSkill(e.skill)?.name ?? e.skill}`;
    case "damage":
      return e.amount > 0
        ? `${name(e.side, e.fighter)} mất ${e.amount} máu`
        : null;
    case "heal":
      return `${name(e.side, e.fighter)} hồi ${e.amount} máu`;
    case "ko":
      return `${name(e.side, e.fighter)} bị hạ gục`;
    case "wave":
      return `Đợt ${e.wave} kéo đến`;
    case "revive":
      return `${name(e.side, e.fighter)} đứng dậy với ${e.hp} máu`;
    case "timeout":
      return e.side === PLAYER ? "Hết giờ, bạn mất lượt" : "Đối thủ hết giờ";
    case "passive": {
      const own = state.sides[e.side];
      const passive = PASSIVES[own.fighters[own.leader]!.element].name;
      return e.side === PLAYER
        ? `Bị động ${passive} của phe bạn kích hoạt`
        : `Bị động ${passive} của đối thủ kích hoạt`;
    }
    case "whirl":
      return e.free
        ? `${name(e.side, e.fighter)} xoay lốc xoáy miễn phí quanh ô hàng ${e.whirl.center.row + 1}, cột ${e.whirl.center.col + 1}`
        : null;
    case "shuffle":
      return "Hết nước đi, bàn cờ được xáo lại";
    case "chase": return `${name(e.side,e.fighter)} · ${CHASE_PASSIVES[e.passive].name}: truy kích → ${name(e.target.side,e.target.fighter)} (nhịp ${e.depth})`;
    case "combo": {
      const passive=COMBO_PASSIVES[e.passive].name;
      return `${name(e.side,e.fighter)} · ${passive}: ${e.outcome==='opened'?'sẵn sàng phối hợp':e.outcome==='used'?'đã tận dụng':e.outcome==='expired'?'cơ hội hết hạn':'cơ hội bị phá'}`;
    }
    case "spirit": {
      const firstAlive = state.sides[e.side].fighters.findIndex(
        (f) => f.hp > 0,
      );
      if (e.spirit !== 100 - SPIRIT_EXPERIMENTS[state.experimentalSpirit ?? DEFAULT_SPIRIT_EXPERIMENT].decay || e.fighter !== firstAlive) return null;
      return e.side === PLAYER
        ? "Trận kéo dài, tinh thần phe bạn bắt đầu giảm"
        : "Trận kéo dài, tinh thần đối thủ bắt đầu giảm";
    }
    case "frozenSkip":
      return e.side === PLAYER
        ? "Phe bạn bị Đóng băng, mất lượt"
        : "Đối thủ bị Đóng băng, mất lượt";
    case "end":
      return e.winner === PLAYER ? "Chúa công thắng!" : "Chúa công thua";
    default:
      return null;
  }
}
