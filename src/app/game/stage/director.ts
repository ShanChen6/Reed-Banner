import {
  isAlive,
  NEGATIVE_EFFECTS,
  POSITIVE_EFFECTS,
  SKILLS,
  type BattleEvent,
  type BattleState,
} from "@/core";

/**
 * Động tác một nhân vật trên sân khấu, thời lượng theo bảng hoạt ảnh ở docs/design/15-ke-hoach-do-hoa.md:
 * ready 0,3 s (đến lượt), attack 0,5–0,7 s, cast 0,6–0,9 s, ultimate 1,2–1,8 s kèm cận cảnh, hit 0,3 s,
 * guard 0,4 s (khiên đỡ), buff/debuff/heal 0,4 s, victory 1,2 s rồi lặp đoạn cuối. Gục (ko) đi qua
 * `setDown` vì theo máu chứ không theo sự kiện.
 */
export type CueKind =
  | "ready"
  | "attack"
  | "cast"
  | "ultimate"
  | "hit"
  | "guard"
  | "buff"
  | "debuff"
  | "heal"
  | "victory";

/** Tuyệt chiêu hoặc chiêu riêng (ô 4): động tác lớn hơn kỹ năng thường. */
export function isUltimate(skill: string): boolean {
  const def = SKILLS[skill];
  return def !== undefined && (def.character !== undefined || def.ultimate === true);
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
/** Hiệu ứng (khiên, tăng, giảm) trên người vừa trúng đòn hiện sau cú trúng, để hai động tác không đè nhau. */
export const AFTER_HIT_MS = HIT_DELAY_MS + 320;
/** Phe thắng ăn mừng sau khi người cuối cùng bên kia gục xong. */
export const VICTORY_DELAY_MS = 900;

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
  /** Người gục trong lô này, không ăn mừng dù phe thắng. */
  const fallen = new Set<string>();
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
      case "chase":
        add(start,{side:e.side,fighter:e.fighter,kind:"cast",delay:e.depth*100});
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
          // Khiên hút trọn đòn thì đỡ, không rung người.
          kind: e.amount === 0 && e.absorbed > 0 ? "guard" : "hit",
          delay: e.source === "sword" ? HIT_DELAY_MS : 0,
        });
        break;
      case "heal":
        if (e.amount > 0)
          add(end, { side: e.side, fighter: e.fighter, kind: "heal", delay: 0 });
        break;
      case "effect": {
        const kind =
          e.effect === "shield"
            ? "guard"
            : POSITIVE_EFFECTS.includes(e.effect) || e.effect === "taunt"
              ? "buff"
              : NEGATIVE_EFFECTS.includes(e.effect)
                ? "debuff"
                : null;
        if (kind) add(end, { side: e.side, fighter: e.fighter, kind, delay: 0 });
        break;
      }
      case "ko":
        fallen.add(`${e.side}:${e.fighter}`);
        break;
      case "wave":
        // Sinh tồn: đợt mới vào sân, phe mình thôi ăn mừng và vào thế.
        before.sides[0].fighters.forEach((_, i) =>
          add(end, { side: 0, fighter: i, kind: "ready", delay: 0 }),
        );
        break;
      case "end":
        before.sides[e.winner].fighters.forEach((f, i) => {
          if (isAlive(f) && !fallen.has(`${e.winner}:${i}`))
            add(end, { side: e.winner, fighter: i, kind: "victory", delay: VICTORY_DELAY_MS });
        });
        break;
      default:
        break;
    }
  }
  // Ai vừa trúng đòn thì khiên, tăng, giảm, hồi phát sau cú trúng.
  const struck = new Set(
    end.filter((c) => c.kind === "hit").map((c) => `${c.side}:${c.fighter}`),
  );
  const after = end.map((c) =>
    AFTER_HIT.has(c.kind) && struck.has(`${c.side}:${c.fighter}`)
      ? { ...c, delay: Math.max(c.delay, AFTER_HIT_MS) }
      : c,
  );
  return { start, end: after };
}

const AFTER_HIT = new Set<CueKind>(["guard", "buff", "debuff", "heal"]);

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
