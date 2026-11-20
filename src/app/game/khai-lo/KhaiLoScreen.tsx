"use client";

// Khai Lộ: chạm một ô để xóa cả khối quân nguyên tố cùng hệ liền cạnh; ô rơi xuống, cột trống dồn sang trái. Chơi offline,
// ván dở và điểm cao nhất lưu ở trình duyệt, riêng từng chế độ (Thường, Cấp tốc). Luật ở src/core/khai-lo, spec ở
// docs/02-game-modes/khai-lo/gdd.md.
//
// Điều khiển: rê chuột để xem trước khối (máy tính), chạm lần đầu để xem trước rồi chạm lại để xóa (điện thoại),
// bàn phím: mũi tên di chuyển, Enter/Space chọn, Z hoàn tác, 1 Lốc, 2 Sấm, Esc bỏ chọn đạo cụ.
// Cấp tốc: mỗi bậc một mốc điểm, đạt mốc thì lên bậc và cộng thêm giờ vào giờ còn lại; đồng hồ chỉ chạy khi tab đang mở,
// giờ còn lại lưu cùng ván dở. Đạo cụ nạp theo điểm gom khối (thanh nạp dưới mỗi nút).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ELEMENTS, type Element } from "@/core/battle/elements";
import {
  KL_MIN_GROUP,
  createGame,
  groupAt,
  KL_TIMED_LEVEL_SECONDS,
  KL_TIMED_START_SECONDS,
  KL_TOOL_CHARGE,
  parseGame,
  serializeGame,
  toolTargets,
  tilesLeft,
  transition,
  type KlAction,
  type KlCell,
  type KlEvent,
  type KlMode,
  type KlReason,
  type KlState,
  type KlTool,
  timedGoal,
} from "@/core/khai-lo";
import { ELEMENT_COLOR } from "../art/icons";
import { ELEMENT_NAME } from "../battle/labels";
import { readStorage, writeStorage } from "../formation/storage";
import { Button, buttonVariants, choiceVariants } from "@/components/ui";
import { ModeScreen, OrnateFrame } from "@/components/game-ui";
import { ModeGuideTabs } from "../ModeGuide";
import { PlayCard } from "../PlayCard";
import { ColumnFill } from "../ColumnFill";

/** Khóa lưu theo chế độ; khóa của Thường giữ như bản đầu để không mất ván dở cũ. */
const KEYS: Record<KlMode, { save: string; best: string; clock?: string }> = {
  classic: { save: "reed-banner:khai-lo:save:v1", best: "reed-banner:khai-lo:best:v1" },
  // v2 (20/11/2026): Cấp tốc đổi sang mốc điểm theo bậc, ván dở và điểm cao nhất của luật cũ không dùng lại.
  timed: { save: "reed-banner:khai-lo:timed:save:v2", best: "reed-banner:khai-lo:timed:best:v2", clock: "reed-banner:khai-lo:timed:clock:v2" },
};
const MODE_KEY = "reed-banner:khai-lo:mode:v1";

const MODE_NAME: Record<KlMode, string> = { classic: "Thường", timed: "Cấp tốc" };
const MODE_HINT: Record<KlMode, string> = {
  classic: "Không giới hạn thời gian, tính kỹ từng nước.",
  timed: "Đạt mốc điểm trước khi hết giờ để lên bậc; giờ dư cộng dồn.",
};

const freshSeed = () => (Math.random() * 0x100000000) >>> 0;
/** Giờ đơn điệu của trình duyệt (chỉ dùng ở client để đếm ngược). */
const nowMs = () => performance.now();

const REASON_TEXT: Record<KlReason, string> = {
  notPlaying: "Màn đã kết thúc.",
  outOfBounds: "Ngoài bàn.",
  empty: "Ô trống.",
  single: "Quân lẻ: cần ít nhất 2 quân cùng hệ liền cạnh.",
  noTool: "Hết đạo cụ này.",
  edge: "Lốc Phong cần tâm không nằm sát mép bàn.",
  noUndo: "Không còn lượt hoàn tác.",
  notStuck: "Chỉ đổi bàn được khi bàn đã hết khối để xóa.",
  noTarget: "Mộc Linh cần một quân khác hệ nằm kề bên.",
};

/** Ô to nhất (px) trên màn rộng: bàn 10×8 khi đó khoảng 880×704. */
const KL_MAX_CELL = 88;

/** 7 đạo cụ theo 7 hệ (Shan duyệt 20/11/2026), xếp theo thứ tự ELEMENTS (phím 1–7). */
const TOOL_NAME: Record<KlTool, string> = {
  kim: "Kim Đao",
  moc: "Mộc Linh",
  thuy: "Thủy Triều",
  hoa: "Hỏa Cầu",
  tho: "Địa Chấn",
  loi: "Lôi Phạt",
  phong: "Lốc Phong",
};
const TOOL_HINT: Record<KlTool, string> = {
  kim: "Chọn ô: chém sạch cả hàng ngang.",
  moc: "Chọn quân: đổi sang hệ của khối lớn nhất kề nó.",
  thuy: "Chọn ô: cuốn sạch cả cột dọc.",
  hoa: "Chọn ô: nổ vùng 3×3 quanh ô đó.",
  tho: "Chọn ô bất kỳ: phá hàng dưới cùng, cả bàn sụt xuống.",
  loi: "Chọn quân: xóa mọi quân cùng hệ trên bàn.",
  phong: "Chọn tâm: 8 ô quanh xoay theo chiều kim đồng hồ.",
};

interface Ghost {
  readonly key: string;
  readonly cell: KlCell;
  readonly index: number;
}

function readBest(mode: KlMode): number {
  const n = Number(readStorage(KEYS[mode].best));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function readClock(state: KlState): number {
  const full = KL_TIMED_START_SECONDS * 1000;
  const key = KEYS.timed.clock;
  if (!key) return full;
  try {
    const v = JSON.parse(readStorage(key) ?? "null") as { seed?: number; ms?: number } | null;
    if (v && v.seed === state.seed && typeof v.ms === "number" && v.ms >= 0) return v.ms;
  } catch {
    /* bản lưu hỏng: tính lại từ đầu ván */
  }
  return full;
}

function writeClock(state: KlState, ms: number) {
  const key = KEYS.timed.clock;
  if (key) writeStorage(key, JSON.stringify({ seed: state.seed, ms: Math.max(0, Math.round(ms)) }));
}

function loadGame(mode: KlMode): KlState {
  const saved = parseGame(readStorage(KEYS[mode].save));
  return saved && saved.phase !== "over" && saved.mode === mode ? saved : createGame(freshSeed(), mode);
}

/** Quân nguyên tố: nền ngọc nhuộm màu của hệ, biểu tượng hệ vẽ tay ở giữa; ô số có viền vàng, quầng sáng và nhãn ×2/×3. */
function ElementGem({ element, mult }: { element: Element; mult?: 2 | 3 }) {
  return (
    <div className="kl-gem" data-el={element} data-mult={mult} style={{ ["--el" as string]: ELEMENT_COLOR[element] }}>
      {/* Ô số (Shan 20/11/2026, như ô 2, 3 của Block'D): khối chứa nó nhân ×2 hoặc ×3 điểm. */}
      {mult && <span className="kl-mult" aria-hidden>×{mult}</span>}
      {/* eslint-disable-next-line @next/next/no-img-element -- biểu tượng tĩnh 128px, dùng lại cho mọi ô */}
      <img src={`/art/elements/${element}.webp`} alt="" draggable={false} />
    </div>
  );
}

export default function KhaiLoScreen() {
  const [mode, setMode] = useState<KlMode>("classic");
  const [state, setState] = useState<KlState | null>(null);
  const [best, setBest] = useState(0);
  const [peek, setPeek] = useState<number | null>(null);
  const [armed, setArmed] = useState<number | null>(null);
  const [focus, setFocus] = useState(0);
  const [tool, setTool] = useState<KlTool | null>(null);
  const [message, setMessage] = useState("");
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  /** Cấp tốc: số mili giây còn lại của màn hiện tại. */
  const [msLeft, setMsLeft] = useState(0);
  const [hidden, setHidden] = useState(false);
  const touchRef = useRef(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const msRef = useRef(0);
  /** Khung chứa bàn (gắn qua ref callback: bàn chỉ dựng khi mở thẻ Chơi, có thể sau lần vẽ đầu). */
  const [fitEl, setFitEl] = useState<HTMLDivElement | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  /** Cỡ ô (px) đo theo chỗ trống thật: bề ngang khung bàn, và trên máy tính thêm chiều cao cửa sổ để cả bàn lọt màn hình. */
  const [fit, setFit] = useState<number | null>(null);

  const setClock = useCallback((ms: number) => {
    msRef.current = ms;
    setMsLeft(ms);
  }, []);

  const enter = useCallback(
    (m: KlMode, s: KlState) => {
      setMode(m);
      setState(s);
      setBest(readBest(m));
      setClock(m === "timed" ? readClock(s) : 0);
      setMessage("");
      setTool(null);
      setArmed(null);
      setPeek(null);
      setGhosts([]);
    },
    [setClock],
  );

  useEffect(() => {
    const el = fitEl;
    if (!el) return;
    const measure = () => {
      // Trừ đệm và viền của ô lõm bao quanh bàn (10px điện thoại, 14px từ 640px).
      const inset = window.matchMedia("(min-width: 640px)").matches ? 14 : 10;
      const byWidth = (el.clientWidth - inset) / (state?.width ?? 10);
      const wide = window.matchMedia("(min-width: 1024px)").matches;
      // Máy tính: bàn cao gần bằng cửa sổ, chỉ chừa header dính (~4,5rem) và dòng thông báo dưới bàn.
      const byHeight = wide ? Math.max(40, (window.innerHeight - 160) / (state?.height ?? 8)) : Infinity;
      setFit(Math.floor(Math.min(KL_MAX_CELL, byWidth, byHeight)));
    };
    measure();
    // Máy tính: lần đầu vào thẻ Chơi mà đáy bàn khuất thì cuộn để khung chơi nằm ngay dưới header.
    const layout = el.closest(".kl-layout");
    if (layout && window.matchMedia("(min-width: 1024px)").matches && layout.getBoundingClientRect().bottom > window.innerHeight) {
      layout.scrollIntoView({ block: "start", behavior: "smooth" });
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [fitEl, state?.width, state?.height]);

  // Ván dở chỉ đọc ở client để không lệch hydration.
  useEffect(() => {
    const m: KlMode = readStorage(MODE_KEY) === "timed" ? "timed" : "classic";
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- đọc kho trình duyệt chỉ có ở client */
    enter(m, loadGame(m));
  }, [enter]);

  useEffect(() => {
    if (!ghosts.length) return;
    const t = window.setTimeout(() => setGhosts([]), 320);
    return () => window.clearTimeout(t);
  }, [ghosts]);

  useEffect(() => {
    const onVis = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const commit = useCallback(
    (next: KlState, events: readonly KlEvent[], before: KlState) => {
      setState(next);
      writeStorage(KEYS[next.mode].save, next.phase === "over" ? null : serializeGame(next));
      if (next.score > best) {
        setBest(next.score);
        writeStorage(KEYS[next.mode].best, String(next.score));
      }
      const gone: Ghost[] = [];
      const parts: string[] = [];
      for (const e of events) {
        if (e.type === "removed" || e.type === "toolUsed") {
          for (const i of e.type === "removed" ? e.cells : e.removed) {
            const cell = before.cells[i];
            if (cell) gone.push({ key: `${cell.id}-${next.moves}`, cell, index: i });
          }
        }
        if (e.type === "removed") parts.push(`Xóa ${e.cells.length} quân, +${e.gained} điểm.`);
        if (e.type === "toolUsed")
          parts.push(e.removed.length ? `${TOOL_NAME[e.tool]} phá ${e.removed.length} quân.` : e.tool === "moc" ? "Mộc Linh đổi hệ một quân." : "Lốc Phong xoay một vòng.");
        if (e.type === "undone") parts.push("Đã hoàn tác.");
        if (e.type === "newLevel") parts.push(`Màn ${e.level}.`);
        if (e.type === "levelDone")
          parts.push(e.summary.cleared ? `Dọn sạch bàn! +${-e.summary.hearts} tim.` : `Còn ${e.summary.left} quân, mất ${e.summary.hearts} tim.`);
        if (e.type === "toolCharged") parts.push(`Nạp đầy: +1 ${TOOL_NAME[e.tool]}.`);
        if (e.type === "redeal")
          parts.push(e.cleared ? `Dọn sạch bàn, +${e.bonus} điểm. Bàn mới.` : `Bàn mới${e.bonus ? ` (gần sạch +${e.bonus} điểm)` : ""}.`);
        if (e.type === "goalReached") parts.push(`Đạt mốc! Lên bậc ${e.level}, +${KL_TIMED_LEVEL_SECONDS} giây.`);
        if (e.type === "timeUp") parts.push("Hết giờ!");
      }
      if (next.phase === "stuck") parts.push(`Hết khối để xóa: dùng đạo cụ hoặc ${next.mode === "timed" ? "đổi bàn" : "kết thúc màn"}.`);
      if (next.mode === "timed") {
        // Lên bậc: giờ còn lại cộng dồn thêm giờ của bậc mới.
        const ups = events.filter((e) => e.type === "goalReached").length;
        if (ups) setClock(msRef.current + ups * KL_TIMED_LEVEL_SECONDS * 1000);
        writeClock(next, msRef.current);
      }
      setGhosts(gone);
      setMessage(parts.join(" "));
      setArmed(null);
    },
    [best, setClock],
  );

  const act = useCallback(
    (action: KlAction) => {
      if (!state) return;
      const r = transition(state, action);
      setConfirmEnd(false);
      if (!r.ok) {
        setMessage(REASON_TEXT[r.reason]);
        return;
      }
      if (action.type === "tool") setTool(null);
      commit(r.state, r.events, state);
    },
    [state, commit, setConfirmEnd],
  );

  const active = state !== null && (state.phase === "playing" || state.phase === "stuck");
  const running = active && state.mode === "timed" && !hidden;

  // Đồng hồ Cấp tốc: đếm theo giờ đơn điệu, hết giờ thì kết thúc màn (quân còn lại trừ quân lực như thường).
  useEffect(() => {
    if (!running || !state) return;
    const start = nowMs();
    const from = msRef.current;
    let saved = from;
    const id = window.setInterval(() => {
      const left = Math.max(0, from - (nowMs() - start));
      setClock(left);
      if (Math.abs(saved - left) >= 1000) {
        saved = left;
        writeClock(state, left);
      }
      if (left <= 0) {
        window.clearInterval(id);
        const r = transition(state, { type: "timeUp" });
        if (r.ok) commit(r.state, r.events, state);
      }
    }, 100);
    return () => {
      window.clearInterval(id);
      writeClock(state, msRef.current);
    };
  }, [running, state, commit, setClock]);

  const newGame = useCallback(() => {
    const s = createGame(freshSeed(), mode);
    writeStorage(KEYS[mode].save, serializeGame(s));
    if (mode === "timed") writeClock(s, KL_TIMED_START_SECONDS * 1000);
    enter(mode, s);
  }, [mode, enter]);

  const switchMode = useCallback(
    (m: KlMode) => {
      if (m === mode) return;
      writeStorage(MODE_KEY, m);
      enter(m, loadGame(m));
    },
    [mode, enter],
  );

  // Ô sẽ bị tác động nếu chọn ô đang rê/chạm: khối, hoặc vùng của đạo cụ đang cầm.
  const preview = useMemo(() => {
    const none = { cells: new Set<number>() };
    if (!state || peek === null) return none;
    const { width, height, cells } = state;
    if (tool) {
      const t = toolTargets(cells, width, height, tool, peek);
      if (typeof t === "string") return none;
      return { cells: new Set(t.remove.length ? t.remove : tool === "phong" ? [...t.change, peek] : t.change) };
    }
    const g = groupAt(cells, width, height, peek);
    return g.length < KL_MIN_GROUP ? none : { cells: new Set(g) };
  }, [state, peek, tool]);

  const choose = useCallback(
    (i: number) => {
      if (!state) return;
      // Điện thoại: chạm lần đầu chỉ xem trước, chạm lại cùng khối/ô mới thực hiện.
      if (touchRef.current) {
        const same = armed !== null && (tool ? armed === i : groupAt(state.cells, state.width, state.height, armed).includes(i));
        if (!same) {
          setArmed(i);
          setPeek(i);
          return;
        }
      }
      act(tool ? { type: "tool", tool, index: i } : { type: "pick", index: i });
    },
    [state, armed, tool, act],
  );

  // Phím tắt toàn màn (khi tiêu điểm ở bàn hoặc ở trang).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "z") act({ type: "undo" });
      else if (/^[1-7]$/.test(k)) {
        const el = ELEMENTS[Number(k) - 1] as KlTool;
        setTool((t) => (t === el ? null : el));
      } else if (k === "escape") setTool(null);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [act]);

  if (!state) {
    return (
      <Shell>
        <p role="status" className="text-on-wood-soft">Đang bày bàn…</p>
      </Shell>
    );
  }

  const { width, height } = state;
  const left = tilesLeft(state.cells);
  const timed = state.mode === "timed";
  // Trước khi đo xong (lần vẽ đầu) dùng ước lượng theo bề rộng màn hình.
  const cell = fit ? `${fit}px` : `min(${KL_MAX_CELL}px, calc((100vw - 4.5rem) / ${width}))`;

  const moveFocus = (to: number) => {
    setFocus(to);
    setPeek(to);
    boardRef.current?.querySelectorAll<HTMLButtonElement>("button[data-cell]")[to]?.focus();
  };
  const onCellKey = (e: React.KeyboardEvent, i: number) => {
    const r = Math.floor(i / width);
    const c = i % width;
    const next =
      e.key === "ArrowUp" ? Math.max(0, r - 1) * width + c
      : e.key === "ArrowDown" ? Math.min(height - 1, r + 1) * width + c
      : e.key === "ArrowLeft" ? r * width + Math.max(0, c - 1)
      : e.key === "ArrowRight" ? r * width + Math.min(width - 1, c + 1)
      : null;
    if (next !== null) {
      e.preventDefault();
      moveFocus(next);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      touchRef.current = false;
      act(tool ? { type: "tool", tool, index: i } : { type: "pick", index: i });
    }
  };

  const summary = state.phase === "levelDone" ? state.summary : null;
  // Đạo cụ hiện theo hệ có trên bàn (và hệ đã có sẵn đạo cụ/thanh nạp dở dù bàn này không còn).
  const onBoard = new Set(state.cells.map((c) => c?.kind));
  const shownTools = ELEMENTS.filter((e) => onBoard.has(e) || state.tools[e] > 0);
  const endLevel = () => {
    // Thường: kết thúc màn khi còn khối thì quân sót trừ tim, nên hỏi lại một lần; bế tắc thì vẫn còn đạo cụ để thử nên cũng hỏi.
    if (state.mode === "classic" && !confirmEnd) {
      setConfirmEnd(true);
      return;
    }
    act({ type: "endLevel" });
  };

  return (
    <Shell>
      {/* Thanh đầu gọn (Shan 20/11/2026: bàn còn nhỏ) thay banner lớn, để bàn chiếm gần hết màn hình. */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="sr-only">Khai Lộ</h1>
          <p className="text-kicker text-frame-gold">Giải đố – {MODE_NAME[state.mode]}, {timed ? "Bậc" : "Màn"} {state.level}</p>
          <p className="hidden text-caption text-on-wood-soft sm:block">Chạm để xóa cả khối quân cùng hệ. Dọn sạch bàn để qua màn.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={newGame}>Ván mới</Button>
      </div>
      <ModeGuideTabs scene="KHAI_LO">

      <PlayCard>
      {/* Điện thoại: thanh số liệu → bàn → đạo cụ ngay dưới bàn. Máy tính: bàn bên trái, số liệu và đạo cụ ở cột phải. */}
      <div className="kl-layout grid items-start gap-3 sm:gap-4 lg:gap-6">
        <div className="flex flex-col gap-2 [grid-area:head] lg:gap-3 xl:self-stretch">
          <div role="tablist" aria-label="Chế độ chơi" className="grid grid-cols-2 gap-2 xl:grid-cols-1">
            {(["classic", "timed"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                title={MODE_HINT[m]}
                onClick={() => switchMode(m)}
                className={choiceVariants({ size: "sm", className: "flex-col px-3 lg:min-h-14 lg:items-start lg:text-left" })}
              >
                <span className="block font-bold">{MODE_NAME[m]}</span>
                <span className="hidden text-caption font-normal opacity-80 lg:block">{MODE_HINT[m]}</span>
              </button>
            ))}
          </div>
          <Stats state={state} best={best} left={left} msLeft={timed ? msLeft : null} />
          {timed && <GoalBar state={state} paused={active && hidden} />}
          {/* Ba cột (từ 1280px): tranh kèm thơ lấp phần trống dưới số liệu. */}
          <ColumnFill mode="clearPath" className="lg:hidden xl:block" />
        </div>

        <OrnateFrame aria-label="Vùng chơi" flush className="relative isolate -mx-2 flex flex-col items-center gap-2 overflow-hidden p-1 [grid-area:board] sm:mx-0 sm:p-4">
          {/* Tranh nền Shan vẽ (20/11/2026) sau bàn: cây đa bên trái, rừng tre bên phải, giữa trống để đặt bàn; điện thoại khung sát bàn nên ẩn. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- tranh nền trang trí co giãn theo khung */}
          <img src="/art/khai-lo/bg.webp" alt="" aria-hidden className="kl-backdrop pointer-events-none absolute inset-0 -z-10 hidden size-full object-cover sm:block" draggable={false} />
          <div ref={setFitEl} className="w-full">
            <div className="ui-frame-inset relative mx-auto w-fit p-1 sm:p-1.5">
              <div
                ref={boardRef}
                role="grid"
                aria-label={`Bàn Khai Lộ ${height} hàng ${width} cột`}
                className="kl-board relative overflow-hidden rounded-sm"
                data-peek={preview.cells.size > 0 || undefined}
                style={{ width: `calc(${cell} * ${width})`, height: `calc(${cell} * ${height})`, ["--kl-cell" as string]: cell }}
                onMouseLeave={() => setPeek(null)}
              >
                {state.cells.map((c, i) =>
                  c ? (
                    <div
                      key={c.id}
                      aria-hidden
                      className="kl-tile"
                      data-hl={preview.cells.has(i) || undefined}
                      data-tool={preview.cells.has(i) && tool ? (tool === "phong" || tool === "moc" ? "change" : "remove") : undefined}
                      style={{ transform: `translate(calc(var(--kl-cell) * ${i % width}), calc(var(--kl-cell) * ${Math.floor(i / width)}))` }}
                    >
                      <ElementGem element={c.kind} mult={c.mult} />
                    </div>
                  ) : null,
                )}
                {ghosts.map((g) => (
                  <div
                    key={g.key}
                    aria-hidden
                    className="kl-tile kl-ghost"
                    style={{ transform: `translate(calc(var(--kl-cell) * ${g.index % width}), calc(var(--kl-cell) * ${Math.floor(g.index / width)}))` }}
                  >
                    <ElementGem element={g.cell.kind} mult={g.cell.mult} />
                  </div>
                ))}
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${width}, 1fr)`, gridTemplateRows: `repeat(${height}, 1fr)` }}>
                  {state.cells.map((c, i) => (
                    <div role="gridcell" key={i} className="contents">
                      <button
                        type="button"
                        data-cell
                        tabIndex={i === focus ? 0 : -1}
                        disabled={!active}
                        aria-label={`Hàng ${Math.floor(i / width) + 1}, cột ${(i % width) + 1}: ${c ? `hệ ${ELEMENT_NAME[c.kind]}${c.mult ? `, nhân ${c.mult}` : ""}` : "trống"}`}
                        className="kl-hit focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-frame-gold"
                        onPointerDown={(e) => (touchRef.current = e.pointerType === "touch")}
                        onMouseEnter={() => !touchRef.current && setPeek(i)}
                        onFocus={() => {
                          setFocus(i);
                          setPeek(i);
                        }}
                        onKeyDown={(e) => onCellKey(e, i)}
                        onClick={() => choose(i)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {/* Kết màn và hết ván hiện ngay trên bàn: điện thoại không phải cuộn xuống tìm nút sang màn. */}
              {summary && (
                <div className="kl-overlay absolute inset-0 flex items-center justify-center p-3">
                  <section role="status" className="ui-frame flex w-full max-w-sm flex-col items-center gap-2 p-4 text-center sm:gap-3 sm:p-5">
                    <h2 className="ui-title-on-wood text-xl font-bold sm:text-2xl">
                      {summary.cleared ? "Khai thông!" : `Hết màn ${summary.level}`}
                    </h2>
                    <p className="text-[15px] text-on-wood">
                      {summary.cleared
                        ? `Dọn sạch bàn: +${summary.bonus} điểm, +${-summary.hearts} tim.`
                        : `Còn ${summary.left} quân chưa dọn: mất ${summary.hearts} tim, còn ${state.hearts} tim.`}
                    </p>
                    <button type="button" autoFocus onClick={() => act({ type: "nextLevel" })} className={buttonVariants({ size: "lg" })}>
                      Sang màn {state.level + 1}
                    </button>
                  </section>
                </div>
              )}
              {state.phase === "over" && (
                <div className="kl-overlay absolute inset-0 flex items-center justify-center p-3">
                  <section role="status" className="ui-frame flex w-full max-w-sm flex-col items-center gap-2 p-4 text-center sm:gap-3 sm:p-5">
                    <h2 className="ui-title-on-wood text-xl font-bold sm:text-2xl">{timed ? "Hết giờ" : "Thất thủ"}</h2>
                    <p className="text-[15px] text-on-wood">
                      {!timed && state.summary ? `Còn ${state.summary.left} quân mà chỉ còn ${state.hearts} tim. ` : ""}
                      {MODE_NAME[state.mode]}: tướng quân đi tới {timed ? "bậc" : "màn"} {state.level}, đạt <b>{state.score} điểm</b>
                      {state.score >= best && state.score > 0 ? " (cao nhất từ trước tới nay)" : ""}.
                    </p>
                    <button type="button" autoFocus onClick={newGame} className={buttonVariants({ size: "lg" })}>Chơi lại</button>
                  </section>
                </div>
              )}
            </div>
          </div>
          {/* Shan 20/11/2026: bỏ dòng thông báo dưới bàn để bố cục không nhảy; chỉ giữ cho trình đọc màn hình. */}
          <p role="status" aria-live="polite" className="sr-only">
            {message}
          </p>
        </OrnateFrame>

        <aside className="flex flex-col gap-3 [grid-area:tools] lg:gap-4" aria-label="Bảng điều khiển">
          {active && (
            <div className="ui-frame flex flex-col gap-2 p-2 sm:gap-3 sm:p-4">
              <p className="ui-title-on-wood hidden font-bold lg:block">Đạo cụ</p>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 lg:grid-cols-3">
                {shownTools.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={tool === t}
                    aria-label={`${TOOL_NAME[t]} (hệ ${ELEMENT_NAME[t]}), còn ${state.tools[t]}, nạp ${state.charge[t]}/${KL_TOOL_CHARGE} quân`}
                    disabled={state.tools[t] <= 0}
                    title={`${TOOL_NAME[t]}: ${TOOL_HINT[t]} Xóa ${KL_TOOL_CHARGE} quân hệ ${ELEMENT_NAME[t]} để được thêm 1 (đang ${state.charge[t]}). Phím ${ELEMENTS.indexOf(t) + 1}.`}
                    onClick={() => setTool((cur) => (cur === t ? null : t))}
                    className={choiceVariants({ size: "sm", className: "kl-tool flex-col gap-0.5 px-1 py-1 leading-tight disabled:opacity-60" })}
                    style={{ ["--el" as string]: ELEMENT_COLOR[t] }}
                  >
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      {/* eslint-disable-next-line @next/next/no-img-element -- biểu tượng hệ tĩnh dùng lại */}
                      <img src={`/art/elements/${t}.webp`} alt="" className="size-5 sm:size-6" draggable={false} />
                      <span className="tabular-nums">×{state.tools[t]}</span>
                    </span>
                    <span className="hidden text-caption sm:block">{TOOL_NAME[t]}</span>
                    <ChargeBar value={state.charge[t]} max={KL_TOOL_CHARGE} />
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                <button type="button" disabled={!state.prev || state.undo <= 0} onClick={() => act({ type: "undo" })} className={buttonVariants({ variant: "secondary", size: "sm", className: "px-1" })}>
                  Hoàn tác ({state.undo})
                </button>
                <button
                  type="button"
                  onClick={endLevel}
                  disabled={timed && state.phase !== "stuck"}
                  onBlur={() => setConfirmEnd(false)}
                  className={buttonVariants({ variant: state.phase === "stuck" || confirmEnd ? "primary" : "secondary", size: "sm", className: "px-1" })}
                >
                  {confirmEnd ? "Bấm lần nữa" : timed ? "Đổi bàn" : "Kết thúc màn"}
                </button>
              </div>
              {/* Cách nạp đạo cụ và phím tắt nằm ở thẻ Hướng dẫn; chỉ còn mô tả đạo cụ đang chọn. */}
              {tool && (
                <p className="text-sm text-on-wood-soft"><b className="text-title-on-wood">{TOOL_NAME[tool]}</b>: {TOOL_HINT[tool]}</p>
              )}
              {state.phase === "stuck" && !confirmEnd && (
                <p className="text-sm text-warning">Hết khối để xóa: dùng đạo cụ hoặc {timed ? "đổi bàn" : "kết thúc màn"}.</p>
              )}
              {confirmEnd && (
                <p className="text-sm text-warning">
                  Còn {left} quân: mỗi quân trừ 1 tim{left > state.hearts ? ", không đủ tim nên sẽ hết ván" : ""}. Bấm lần nữa nếu chắc chắn.
                </p>
              )}
            </div>
          )}
        </aside>
      </div>
      </PlayCard>
      </ModeGuideTabs>
    </Shell>
  );
}

function formatClock(ms: number): string {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Cấp tốc: thanh tiến tới mốc điểm của bậc hiện tại. */
function GoalBar({ state, paused }: { state: KlState; paused: boolean }) {
  const from = state.level > 1 ? timedGoal(state.level - 1) : 0;
  const to = timedGoal(state.level);
  const pct = Math.max(0, Math.min(100, (100 * (state.score - from)) / (to - from)));
  return (
    <div className="w-full">
      <div className="flex justify-between text-caption text-on-wood-soft">
        <span>Mốc bậc {state.level}</span>
        <span className="tabular-nums">còn {Math.max(0, to - state.score)} điểm</span>
      </div>
      <div className="kl-timebar mt-1 h-2.5 overflow-hidden rounded-full" aria-hidden>
        <div className="h-full rounded-full" style={{ width: `${pct}%` }} />
      </div>
      {paused && <p className="mt-1 text-center text-caption text-on-wood-soft">Tạm dừng</p>}
    </div>
  );
}

/** Thanh nạp đạo cụ dưới nút: đầy thì được thêm 1. */
function ChargeBar({ value, max }: { value: number; max: number }) {
  return (
    <span className="kl-charge mt-0.5 block h-1 w-full max-w-16 overflow-hidden rounded-full" aria-hidden>
      <span className="block h-full rounded-full" style={{ width: `${Math.min(100, (100 * value) / max)}%` }} />
    </span>
  );
}

function Stats({ state, best, left, msLeft }: { state: KlState; best: number; left: number; msLeft: number | null }) {
  const items: [string, string, boolean?][] = [
    ["Điểm", String(state.score)],
    msLeft === null ? ["Màn", String(state.level)] : ["Mốc", String(timedGoal(state.level))],
    msLeft === null ? ["Quân còn", String(left)] : ["Thời gian", formatClock(msLeft), msLeft <= 10_000],
    // Thường: tim đỡ quân sót cuối màn; Cấp tốc không dùng tim.
    msLeft === null ? ["Tim", `♥ ${state.hearts}`] : ["Cao nhất", String(Math.max(best, state.score))],
  ];
  return (
    <dl className="grid w-full grid-cols-4 gap-1.5 text-center sm:gap-2 lg:grid-cols-2">
      {items.map(([k, v, warn]) => (
        <div key={k} className="ui-frame-inset px-1 py-1 sm:py-1.5">
          <dt className="text-caption text-on-wood-soft">{k}</dt>
          <dd className={`text-base font-bold tabular-nums sm:text-lg ${warn ? "text-warning" : "text-title-on-wood"}`}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <ModeScreen card label="Khai Lộ">{children}</ModeScreen>
  );
}
