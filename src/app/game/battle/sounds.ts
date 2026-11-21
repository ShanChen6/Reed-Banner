// Âm thanh của trận đánh: ánh xạ thuần từ sự kiện core (`BattleEvent`) và khung hoạt ảnh sang cue, để test không cần AudioContext.
// Bảng cue: docs/05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md mục 5.3.
//
// Hai thời điểm khớp với đạo diễn trận (`stage/director.ts`): `start` phát khi bàn cờ bắt đầu chạy (thi triển kỹ năng), `end` phát cùng lúc
// số sát thương bay lên (đòn trúng, hồi, hiệu ứng, gục, kết thúc). Tiếng ghép ô theo từng khung hoạt ảnh (`frameCue`).

import { isUltimate, HIT_DELAY_MS, AFTER_HIT_MS } from "../stage/director";
import { elementRelation, NEGATIVE_EFFECTS, POSITIVE_EFFECTS, type BattleEvent, type BattleState } from "@/core";
import { BATTLE_CUES, type CueId } from "../audio/cues";
import type { FrameSound } from "./animation";

export interface CuePlay {
  readonly id: CueId;
  /** Chờ bao lâu (ms) sau khi lô bắt đầu. */
  readonly delay?: number;
  readonly rate?: number;
}

/** Mõ đổi lượt đi sau tiếng gục (HIT_DELAY_MS + 200) để không đè lên tiếng trúng đòn. */
export const TURN_DELAY_MS = HIT_DELAY_MS + 450;

/** Đồng hồ 30 giây: còn 5 giây trở xuống thì mỗi giây gõ một tiếng, hai giây cuối gõ cao hơn. */
export function timerCue(seconds: number | null): CuePlay | null {
  if (seconds === null || seconds < 1 || seconds > 5) return null;
  return seconds <= 2 ? { id: "battle.timer", rate: 1.12 } : { id: "battle.timer" };
}

export interface BattleSounds {
  readonly start: readonly CuePlay[];
  readonly end: readonly CuePlay[];
}

/** Tiếng cho một khung hoạt ảnh bàn cờ: đổi ô, đổi sai, xóa 3/4/5 ô (mỗi loại một tệp) và chuỗi combo tầng 1–4. */
export function frameCue(sound: FrameSound | undefined): CuePlay | null {
  if (!sound) return null;
  if (sound.kind === "swap") return { id: "battle.swap" };
  if (sound.kind === "bounce") return { id: "battle.invalid" };
  if (sound.chain >= 2) {
    const tier = Math.min(4, sound.chain - 1) as 1 | 2 | 3 | 4;
    return { id: `battle.combo${tier}` };
  }
  if (sound.size >= 5) return { id: "battle.match5" };
  if (sound.size === 4) return { id: "battle.match4" };
  return { id: "battle.match3" };
}

/**
 * Cue cho một lô sự kiện. `before` là trạng thái trước lô (để biết nghề và hệ của người hành động), `playerSide` để chọn thắng hay thua.
 * Mỗi cue chỉ phát một lần trong mỗi lô (chuỗi combo nhiều đòn không thành nhiều tiếng chồng nhau).
 */
export function soundsForEvents(before: BattleState, events: readonly BattleEvent[], playerSide: 0 | 1 = 0): BattleSounds {
  const start: CuePlay[] = [];
  const end: CuePlay[] = [];
  const seen = new Set<string>();
  const add = (list: CuePlay[], c: CuePlay) => {
    const key = `${c.id}`;
    if (seen.has(key)) return;
    seen.add(key);
    list.push(c);
  };
  let side = before.turn.side;
  let actor = before.turn.actor;
  const fighterAt = (s: 0 | 1, i: number) => before.sides[s]?.fighters[i];
  // Game không có chí mạng: tiếng "crit" dành cho đòn khắc hệ (kiếm hoặc kỹ năng của người đang hành động đánh vào hệ mình khắc, sát thương x1,25).
  const isCounterHit = (e: Extract<BattleEvent, { type: "damage" }>) => {
    if (e.side === side || (e.source !== "sword" && e.source !== "skill")) return false;
    const atk = fighterAt(side, actor);
    const def = fighterAt(e.side, e.fighter);
    return !!atk && !!def && elementRelation(atk.element, def.element) === "counter";
  };

  for (const e of events) {
    switch (e.type) {
      case "turnStart":
        // Đổi phe thì gõ mõ sau khi các đòn của lượt trước đã nổ xong; thêm lượt cùng phe thì không.
        if (e.side !== side) add(end, { id: "battle.turn", delay: TURN_DELAY_MS });
        side = e.side;
        actor = e.actor;
        break;
      case "skill": {
        side = e.side;
        actor = e.fighter;
        if (isUltimate(e.skill)) add(start, { id: "battle.ultimate" });
        else {
          const f = fighterAt(e.side, e.fighter);
          if (f) add(start, { id: `battle.skill.${f.element}` });
        }
        break;
      }
      case "damage": {
        if (e.source === "sword" && e.side !== side) {
          const f = fighterAt(side, actor);
          if (f) add(end, { id: `battle.hit.${f.profession}`, delay: 0 });
        }
        const delay = e.source === "sword" ? HIT_DELAY_MS : 0;
        if (e.amount === 0 && e.absorbed > 0) add(end, { id: "battle.shield", delay: delay + 60 });
        else if (e.amount > 0) add(end, { id: isCounterHit(e) ? "battle.crit" : "battle.damage", delay });
        break;
      }
      case "heal":
        if (e.amount > 0) add(end, { id: "battle.heal", delay: AFTER_HIT_MS });
        break;
      case "effect": {
        const id: CueId | null =
          e.effect === "shield"
            ? "battle.shield"
            : e.effect === "burn"
              ? "battle.burn"
              : e.effect === "freeze"
                ? "battle.freeze"
                : e.effect === "poison"
                  ? "battle.poison"
                  : POSITIVE_EFFECTS.includes(e.effect) || e.effect === "taunt"
                    ? "battle.buff"
                    : NEGATIVE_EFFECTS.includes(e.effect)
                      ? "battle.debuff"
                      : null;
        if (id) add(end, { id, delay: AFTER_HIT_MS });
        break;
      }
      case "wave":
        add(start, { id: "survival.wave" });
        break;
      case "ko":
        add(end, { id: "battle.ko", delay: HIT_DELAY_MS + 200 });
        break;
      case "end":
        add(end, { id: e.winner === playerSide ? "battle.win" : "battle.lose", delay: 900 });
        break;
      default:
        break;
    }
  }
  return { start, end };
}

/** Cue cần tải sẵn khi vào trận. */
export const BATTLE_PRELOAD: readonly CueId[] = BATTLE_CUES;
