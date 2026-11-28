"use client";

// Phát lại từng bước của Điền Trang Ký (Shan 27/11: thiếu hoạt ảnh, vừa đổ đã sang lượt sau). Luật chạy xong ngay trong lõi,
// màn này chỉ diễn lại nhật ký mới: xúc xắc lăn rồi dừng, quân nhảy từng ô, dừng một nhịp ở các việc đáng đọc (mua, nộp tô,
// rút quẻ...). Trong lúc diễn, bàn giữ hình trước nước đi (chỉ quân và xúc xắc đổi), nút bấm khóa, máy chờ diễn xong mới đi.

import { useEffect, useRef, useState } from "react";
import { BOARD_SIZE, type DtkEvent, type DtkState } from "@/core/dien-trang-ky";
import { useAudio } from "../audio/AudioProvider";
import type { CueId } from "../audio/cues";
import { eventCue } from "./sounds";

const ROLL_FRAMES = 7;
const ROLL_FRAME_MS = 70;
const AFTER_ROLL_MS = 260;
const HOP_MS = 150;
/** Đi xa (đò, quẻ về Hoa Lư) thì nhảy nhanh hơn để cả quãng không quá chừng này. */
const MOVE_MAX_MS = 1500;
const PAUSE_MS = 520;
/** Lùi xa (bị giải vào ngục) thì đặt thẳng, không đi lùi cả vòng. */
const BACK_JUMP = 6;

/** Việc đáng dừng một nhịp cho người xem đọc. */
const PAUSE_ON = new Set<DtkEvent["k"]>(["buy", "build", "rent", "buyout", "omen", "pay", "gain", "sell", "out", "jailed", "freed", "disaster", "festival", "freeBuild", "salary", "blessUsed", "monopoly"]);

export interface Playback {
  /** Trạng thái để vẽ bàn: trước nước đi, quân và xúc xắc theo khung đang diễn. */
  readonly view: DtkState;
  /** Đang diễn: khóa nút, máy chờ. */
  readonly playing: boolean;
  /** Xúc xắc đang lăn (vẽ nghiêng, đổi mặt liên tục). */
  readonly rolling: boolean;
  /** Sự kiện cuối đã diễn tới (nhật ký chỉ hiện tới đây). */
  readonly shownN: number;
}

/** `cue`: tiếng phát đúng lúc bước này hiện lên (xúc xắc bắt đầu lăn, quân chạm ô, việc mua bán...). */
type Step = { readonly wait: number; readonly apply: (f: Frame) => Frame; readonly cue?: CueId };
interface Frame {
  pos: number[];
  dice: [number, number] | null;
  rolling: boolean;
  shownN: number;
}

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Các bước diễn cho một sự kiện. `face` cho mặt xúc xắc giả lúc lăn (không ảnh hưởng luật). */
function stepsFor(e: DtkEvent, face: () => number, fast: boolean): Step[] {
  const mark = (f: Frame): Frame => ({ ...f, shownN: e.n });
  const cue = eventCue(e) ?? undefined;
  switch (e.k) {
    case "roll": {
      const out: Step[] = [];
      if (!fast) for (let i = 0; i < ROLL_FRAMES; i++) out.push({ wait: ROLL_FRAME_MS, apply: (f) => ({ ...f, dice: [face(), face()], rolling: true }), cue: i === 0 ? cue : undefined });
      out.push({ wait: fast ? 120 : AFTER_ROLL_MS, apply: (f) => mark({ ...f, dice: [e.dice[0], e.dice[1]], rolling: false }), cue: fast ? cue : undefined });
      return out;
    }
    case "move": {
      const seat = e.seat;
      const dist = e.back ? (e.from - e.to + BOARD_SIZE) % BOARD_SIZE : (e.to - e.from + BOARD_SIZE) % BOARD_SIZE;
      if (fast || dist === 0 || (e.back && dist > BACK_JUMP)) {
        return [{ wait: fast ? 80 : 300, apply: (f) => mark({ ...f, pos: f.pos.map((p, i) => (i === seat ? e.to : p)) }), cue: dist === 0 ? undefined : cue }];
      }
      const hop = Math.min(HOP_MS, Math.floor(MOVE_MAX_MS / dist));
      return Array.from({ length: dist }, (_, k) => {
        const at = (e.from + (e.back ? -(k + 1) : k + 1) + BOARD_SIZE) % BOARD_SIZE;
        return { wait: hop, apply: (f: Frame) => (k === dist - 1 ? mark : (x: Frame) => x)({ ...f, pos: f.pos.map((p, i) => (i === seat ? at : p)) }), cue };
      });
    }
    default:
      return [{ wait: PAUSE_ON.has(e.k) && !fast ? PAUSE_MS : 0, apply: mark, cue }];
  }
}

export function usePlayback(state: DtkState): Playback {
  const [base, setBase] = useState(state);
  const [frame, setFrame] = useState<Frame | null>(null);
  /** Sự kiện cuối đã xếp vào hàng diễn. */
  const queuedN = useRef(state.evSeq);
  const queue = useRef<Step[]>([]);
  const cur = useRef<Frame | null>(null);
  const timer = useRef<number | null>(null);
  const target = useRef(state);
  const seed = useRef((state.rng | 1) >>> 0);
  const { play } = useAudio();
  const playRef = useRef(play);
  useEffect(() => {
    playRef.current = play;
  }, [play]);

  useEffect(() => {
    const prev = target.current;
    target.current = state;
    const sameGame = state.evSeq >= queuedN.current && state.players.length === prev.players.length && state.players.every((p, i) => p.name === prev.players[i]?.name);
    const events = sameGame ? state.log.filter((e) => e.n > queuedN.current) : [];
    queuedN.current = state.evSeq;
    if (!events.length) {
      if (!sameGame || timer.current === null) {
        // Ván mới, tải lại, hoặc không có gì để diễn: dừng diễn và vẽ thẳng.
        if (timer.current !== null) window.clearTimeout(timer.current);
        timer.current = null;
        queue.current = [];
        cur.current = null;
        setBase(state);
        setFrame(null);
      }
      return;
    }
    const fast = reducedMotion();
    const face = () => {
      seed.current = (Math.imul(seed.current, 1103515245) + 12345) >>> 0;
      return 1 + ((seed.current >>> 16) % 6);
    };
    for (const e of events) queue.current.push(...stepsFor(e, face, fast));
    if (!cur.current) {
      cur.current = { pos: prev.players.map((p) => p.pos), dice: prev.dice, rolling: false, shownN: prev.evSeq };
      setBase(prev);
      setFrame(cur.current);
    }
    const tick = () => {
      const step = queue.current.shift();
      if (!step) {
        timer.current = null;
        cur.current = null;
        setBase(target.current);
        setFrame(null);
        return;
      }
      cur.current = step.apply(cur.current!);
      if (step.cue) playRef.current(step.cue);
      setFrame(cur.current);
      timer.current = window.setTimeout(tick, step.wait);
    };
    if (timer.current === null) timer.current = window.setTimeout(tick, 0);
  }, [state]);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  if (!frame) return { view: base, playing: false, rolling: false, shownN: base.evSeq };
  return {
    view: { ...base, players: base.players.map((p, i) => ({ ...p, pos: frame.pos[i] ?? p.pos })), dice: frame.dice },
    playing: true,
    rolling: frame.rolling,
    shownN: frame.shownN,
  };
}
