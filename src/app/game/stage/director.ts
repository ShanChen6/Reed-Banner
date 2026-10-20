import { SKILLS, type BattleEvent, type BattleState } from "@/core";

/** Động tác một nhân vật trên sân khấu. */
export type CueKind = "attack" | "cast" | "ultimate" | "hit" | "heal";

/** Tuyệt chiêu hoặc chiêu riêng (ô 5): động tác lớn hơn kỹ năng thường. */
export function isUltimate(skill: string): boolean {
  const def = SKILLS[skill];
  return def !== undefined && (def.character !== undefined || def.slot === 5);
}

export interface Cue {
  readonly side: 0 | 1;
  readonly fighter: number;
  readonly kind: CueKind;
  /** Chờ bao lâu (ms) kể từ khi lô động tác được phát, để đòn đánh đi trước cú trúng. */
  readonly delay: number;
}

/**
 * Lô động tác của một lần cập nhật trận. `start` phát ngay khi bàn cờ bắt đầu chạy hoạt ảnh (thi triển kỹ
 * năng), `end` phát cùng lúc số sát thương bay lên (chém, trúng đòn, được hồi).
 */
export interface StageCues {
  readonly start: readonly Cue[];
  readonly end: readonly Cue[];
}

/** Độ trễ từ lúc vung đòn tới lúc bên kia rung người. */
export const HIT_DELAY_MS = 180;

/**
 * Đạo diễn trận: đọc chuỗi sự kiện của core rồi dựng động tác cho từng nhân vật. Người ra đòn kiếm là người
 * hành động của lượt đang chạy (lấy từ `before.turn`, đổi theo turnStart và sự kiện kỹ năng).
 */
export function stageCues(
  before: BattleState,
  events: readonly BattleEvent[],
): StageCues {
  const start: Cue[] = [];
  const end: Cue[] = [];
  let side = before.turn.side;
  let actor = before.turn.actor;
  const seen = new Set<string>();
  /** Thêm mỗi động tác một lần cho mỗi nhân vật trong cả lô, để chuỗi combo không làm nhân vật giật liên tục. */
  const add = (list: Cue[], cue: Cue) => {
    const key = `${cue.side}:${cue.fighter}:${cue.kind}`;
    if (seen.has(key)) return;
    seen.add(key);
    list.push(cue);
  };

  for (const e of events) {
    switch (e.type) {
      case "turnStart":
        side = e.side;
        actor = e.actor;
        break;
      case "skill":
        side = e.side;
        actor = e.fighter;
        add(start, {
          side: e.side,
          fighter: e.fighter,
          kind: isUltimate(e.skill) ? "ultimate" : "cast",
          delay: 0,
        });
        break;
      case "damage":
        if (e.source === "sword" && e.side !== side)
          add(end, { side, fighter: actor, kind: "attack", delay: 0 });
        add(end, {
          side: e.side,
          fighter: e.fighter,
          kind: "hit",
          delay: e.source === "sword" ? HIT_DELAY_MS : 0,
        });
        break;
      case "heal":
        if (e.amount > 0)
          add(end, { side: e.side, fighter: e.fighter, kind: "heal", delay: 0 });
        break;
      default:
        break;
    }
  }
  return { start, end };
}

export type CueListener = (cues: readonly Cue[]) => void;

/** Kênh phát động tác từ màn trận sang sân khấu, không đi qua state React để khỏi vẽ lại cả màn. */
export interface CueBus {
  emit(cues: readonly Cue[]): void;
  on(listener: CueListener): () => void;
}

export function createCueBus(): CueBus {
  const listeners = new Set<CueListener>();
  return {
    emit(cues) {
      if (cues.length === 0) return;
      for (const l of listeners) l(cues);
    },
    on(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
