"use client";

// Do Thám: dò bẫy trên sa bàn. Mở ô để biết số bẫy quanh nó, cắm cờ lau lên ô nghi có bẫy, mở hết ô an toàn là thắng. Chơi
// ngay trên máy, ván dở và thời gian tốt nhất lưu ở trình duyệt. Luật ở src/core/do-tham, spec ở docs/02-game-modes/do-tham/gdd.md.
//
// Điều khiển: chuột trái mở ô (bấm vào ô số đã đủ cờ thì mở nhanh), chuột phải cắm cờ; điện thoại chạm mở, chạm giữ cắm cờ
// hoặc bật nút Cắm cờ; bàn phím: mũi tên di chuyển, Enter hoặc Space mở, F cắm cờ.

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Element } from "@/core/battle/elements";
import { ELEMENTS } from "@/core/battle/elements";
import {
  DT_ITEM_PICKS,
  DT_ITEM_TARGET,
  DT_LEVELS,
  DT_LEVEL_ORDER,
  dtAct,
  flagsOf,
  isOver,
  neighbors,
  newGame,
  type DtAction,
  type DtInfo,
  type DtLevel,
  type DtReason,
  type DtState,
} from "@/core/do-tham";
import { Button, ChoiceChip } from "@/components/ui";
import { BottomSheet, ModeBanner, ModeScreen, OrnateFrame, ResultModal, SurrenderButton } from "@/components/game-ui";
import { PHONE_QUERY, useMediaQuery } from "@/lib/useMediaQuery";
import { ElementIcon } from "../art/icons";
import { ELEMENT_NAME } from "../battle/labels";
import { readStorage, writeStorage } from "../formation/storage";
import { ModeGuideTabs } from "../ModeGuide";
import { DT_ITEM_INFO as ITEM_INFO } from "./items";
import { PlayCard } from "../PlayCard";
import { useAudio } from "../audio/AudioProvider";
import { cuesForAction, cueTimes, DOTHAM_MUSIC, DOTHAM_PRELOAD, REJECT } from "./sounds";

const SAVE_KEY = "reed-banner:do-tham:save:v1";
const BEST_KEY = "reed-banner:do-tham:best:v1";
const PICKS_KEY = "reed-banner:do-tham:picks:v1";
const LEVEL_KEY = "reed-banner:do-tham:level:v1";

const LEVEL_NAME: Record<DtLevel, string> = { nhapMon: "Nhập môn", thuong: "Thường", kho: "Khó" };

const REASON_TEXT: Record<DtReason, string> = {
  notPlaying: "Ván đã kết thúc.",
  outOfBounds: "Ngoài bàn.",
  flagged: "Ô có cờ lau. Gỡ cờ trước khi mở.",
  alreadyOpen: "Ô này đã mở.",
  notOpen: "Chỉ mở nhanh được ở ô số đã mở.",
  chordMismatch: "Số cờ quanh ô chưa khớp với số trên ô.",
  noItem: "Bạn không mang đạo cụ này.",
  used: "Đạo cụ này đã dùng rồi.",
  needTarget: "Chọn một ô trên bàn trước.",
  notStarted: "Mở một ô trước, rồi mới dùng được đạo cụ này.",
  noHint: "Chưa suy ra được ô nào chắc chắn. Hãy mở thêm ô.",
  noTarget: "Không còn bẫy nào để dò.",
};

const NUMBER_CLASS = ["", "text-info", "text-jade", "text-lacquer-hi", "text-stat-spirit", "text-stat-rage", "text-stat-energy", "text-ink", "text-ash"];

const freshSeed = () => (Math.random() * 0x100000000) >>> 0;

interface Saved {
  readonly game: DtState;
  readonly secs: number;
}

function isLevel(v: unknown): v is DtLevel {
  return typeof v === "string" && (DT_LEVEL_ORDER as readonly string[]).includes(v);
}

function readPicks(): Element[] {
  try {
    const v = JSON.parse(readStorage(PICKS_KEY) ?? "[]") as unknown;
    return Array.isArray(v) ? v.filter((x): x is Element => ELEMENTS.includes(x as Element)).slice(0, DT_ITEM_PICKS) : [];
  } catch {
    return [];
  }
}

function readBest(): Partial<Record<DtLevel, number>> {
  try {
    const v = JSON.parse(readStorage(BEST_KEY) ?? "{}") as Record<string, unknown>;
    const out: Partial<Record<DtLevel, number>> = {};
    for (const l of DT_LEVEL_ORDER) if (typeof v[l] === "number" && Number.isFinite(v[l])) out[l] = v[l] as number;
    return out;
  } catch {
    return {};
  }
}

function readSaved(level: DtLevel): Saved | null {
  try {
    const v = JSON.parse(readStorage(SAVE_KEY) ?? "null") as Saved | null;
    const g = v?.game;
    if (!g || g.version !== 1 || g.level !== level) return null;
    const cfg = DT_LEVELS[level];
    if (g.width !== cfg.width || g.height !== cfg.height || g.mines !== cfg.mines || g.cells.length !== cfg.width * cfg.height) return null;
    return { game: g, secs: typeof v?.secs === "number" && v.secs >= 0 ? Math.floor(v.secs) : 0 };
  } catch {
    return null;
  }
}

const clock = (secs: number) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;

/** Ô thứ `i` của ván nằm ở hàng, cột nào trên bàn đang hiện (tính từ 0). Bàn xoay thì hàng của ván thành cột và ngược lại. */
function displayPos(i: number, width: number, turned: boolean): [row: number, col: number] {
  const x = i % width;
  const y = Math.floor(i / width);
  return turned ? [x, y] : [y, x];
}

function infoText(info: DtInfo | null, width: number, turned: boolean): string {
  if (!info) return "";
  const where = (i: number) => {
    const [r, c] = displayPos(i, width, turned);
    return `hàng ${r + 1}, cột ${c + 1}`;
  };
  if (info.kind === "area") return `Vùng 3×3 quanh ${where(info.index)} có ${info.count} bẫy.`;
  if (info.kind === "line") return `${(info.axis === "row") !== turned ? "Hàng" : "Cột"} ${info.at + 1} có ${info.count} bẫy.`;
  return `Gió mách: ${where(info.index)} ${info.certain === "safe" ? "chắc chắn an toàn" : "chắc chắn có bẫy"}.`;
}

/** Ô nhỏ hơn mức này (px) thì điện thoại cho phóng to bàn bằng hai ngón hoặc nút +/− (Shan chọn 4A, 21/11/2026). */
const ZOOM_BELOW = 24;
const ZOOM_MAX = 2.5;
/** Phần bề ngang màn không dành cho bàn trên điện thoại: lề màn, khung vùng chơi, viền sa bàn (khớp .dt-board trong globals.css). */
const PHONE_GUTTER = 56;

function touchDist(t: React.TouchList): number {
  const a = t[0];
  const b = t[1];
  return a && b ? Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) : 0;
}

function subscribeResize(notify: () => void) {
  window.addEventListener("resize", notify);
  return () => window.removeEventListener("resize", notify);
}

function useViewportWidth(): number {
  return useSyncExternalStore(subscribeResize, () => window.innerWidth, () => 1024);
}

function FlagGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-[62%]" aria-hidden>
      <path d="M8 21V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 4c3-1 6 1 9 0v8c-3 1-6-1-9 0z" fill="var(--lacquer)" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M11 6.5c2 .4 3 .4 4 0M11 9.5c2 .4 3 .4 4 0" stroke="var(--frame-bronze)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function TrapGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-[66%]" aria-hidden>
      <path d="M12 3l3 15H9zM5 8l4 11H3zM19 8l2 11h-6z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <path d="M3 21h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function DoThamScreen() {
  const [level, setLevel] = useState<DtLevel>("nhapMon");
  const [picks, setPicks] = useState<Element[]>([]);
  const [game, setGame] = useState<DtState>(() => newGame("nhapMon", 1));
  const [secs, setSecs] = useState(0);
  const [best, setBest] = useState<Partial<Record<DtLevel, number>>>({});
  const [loaded, setLoaded] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  const [armed, setArmed] = useState<Element | null>(null);
  const [axis, setAxis] = useState<"row" | "col">("row");
  /** Ván đã kết thúc mà người chơi đóng hộp kết quả để xem bàn (ván mới là đối tượng khác nên hộp tự mở lại). */
  const [dismissed, setDismissed] = useState<DtState | null>(null);
  const [message, setMessage] = useState("");
  const [focus, setFocus] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const pressRef = useRef<{ timer: number; fired: boolean } | null>(null);
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [setupOpen, setSetupOpen] = useState(false);
  const phone = useMediaQuery(PHONE_QUERY);
  const portrait = useMediaQuery("(orientation: portrait)");
  const viewportWidth = useViewportWidth();
  const { play: playSound, preload, playMusic, stopMusic } = useAudio();

  useEffect(() => preload(DOTHAM_PRELOAD), [preload]);
  useEffect(() => {
    playMusic(DOTHAM_MUSIC);
    return () => stopMusic(600);
  }, [playMusic, stopMusic]);

  // Nạp ván dở sau khi trang đã dựng (tránh lệch giữa server và trình duyệt vì seed ngẫu nhiên).
  /* eslint-disable react-hooks/set-state-in-effect -- đọc kho trình duyệt chỉ có ở client */
  useEffect(() => {
    const savedLevel = readStorage(LEVEL_KEY);
    const lv = isLevel(savedLevel) ? savedLevel : "nhapMon";
    const p = readPicks();
    const saved = readSaved(lv);
    setLevel(lv);
    setPicks(p);
    setBest(readBest());
    setGame(saved?.game ?? newGame(lv, freshSeed(), p));
    setSecs(saved?.secs ?? 0);
    setLoaded(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!loaded) return;
    writeStorage(SAVE_KEY, JSON.stringify({ game, secs } satisfies Saved));
  }, [game, secs, loaded]);

  // Đồng hồ chạy khi đã mở nước đầu và ván chưa kết thúc; dừng khi rời trang.
  useEffect(() => {
    if (game.phase !== "playing") return;
    const id = window.setInterval(() => {
      if (!document.hidden) setSecs((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [game.phase]);

  const startGame = useCallback((lv: DtLevel, p: readonly Element[]) => {
    setGame(newGame(lv, freshSeed(), p));
    setSecs(0);
    setArmed(null);
    setFlagMode(false);
    setMessage("");
    setFocus(0);
  }, []);

  const chooseLevel = (lv: DtLevel) => {
    if (lv === level) return;
    setLevel(lv);
    writeStorage(LEVEL_KEY, lv);
    const saved = readSaved(lv);
    if (saved && !isOver(saved.game)) {
      setGame(saved.game);
      setSecs(saved.secs);
      setArmed(null);
      setMessage("Ván dở của bậc này đã được nạp lại.");
    } else startGame(lv, picks);
  };

  const togglePick = (e: Element) => {
    if (game.phase === "playing") {
      setMessage("Đạo cụ chỉ đổi được trước nước đầu hoặc ở ván mới.");
      return;
    }
    const next = picks.includes(e) ? picks.filter((x) => x !== e) : picks.length < DT_ITEM_PICKS ? [...picks, e] : [...picks.slice(1), e];
    setPicks(next);
    writeStorage(PICKS_KEY, JSON.stringify(next));
    if (game.phase === "ready") setGame(newGame(level, game.seed, next));
  };

  const act = useCallback(
    (action: DtAction) => {
      const r = dtAct(game, action);
      if (!r.ok) {
        setMessage(REASON_TEXT[r.reason]);
        playSound(REJECT.id);
        return false;
      }
      setGame(r.state);
      // Tiếng của nước đi trước, tiếng kết quả theo sau một nhịp để không chồng lên nhau.
      const cues = cuesForAction(game, r.state, action);
      const times = cueTimes(cues);
      cues.forEach((c, i) => {
        const go = () => playSound(c.id, { rate: c.rate });
        if (times[i] === 0) go();
        else window.setTimeout(go, times[i]);
      });
      setMessage("");
      if (r.state.phase === "won" && game.phase !== "won") {
        const prev = best[level];
        if (prev === undefined || secs < prev) {
          const next = { ...best, [level]: secs };
          setBest(next);
          writeStorage(BEST_KEY, JSON.stringify(next));
        }
      }
      return true;
    },
    [game, best, level, secs, playSound],
  );

  const onItem = (e: Element) => {
    const target = DT_ITEM_TARGET[e];
    if (target === "none") {
      act({ type: "item", element: e });
      return;
    }
    setArmed(armed === e ? null : e);
    setMessage(armed === e ? "" : target === "line" ? "Chọn hàng hoặc cột ở trên, rồi chọn một ô trên bàn." : "Chọn một ô trên bàn.");
  };

  const press = (i: number) => {
    if (armed) {
      const ok = act(armed === "loi" ? { type: "item", element: armed, index: i, axis: engineAxis } : { type: "item", element: armed, index: i });
      if (ok) setArmed(null);
      return;
    }
    if (game.cells[i] === "open") act({ type: "chord", index: i });
    else if (flagMode) act({ type: "flag", index: i });
    else act({ type: "open", index: i });
  };

  const moveFocus = (i: number, sx: number, sy: number) => {
    // Bàn xoay: mũi tên đi theo bàn đang hiện, nên trái/phải trên màn là lên/xuống của ván.
    const [dx, dy] = turned ? [sy, sx] : [sx, sy];
    const x = Math.min(game.width - 1, Math.max(0, (i % game.width) + dx));
    const y = Math.min(game.height - 1, Math.max(0, Math.floor(i / game.width) + dy));
    const next = y * game.width + x;
    setFocus(next);
    boardRef.current?.querySelector<HTMLButtonElement>(`[data-i="${next}"]`)?.focus();
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const step = d[e.key];
    if (step) {
      e.preventDefault();
      moveFocus(i, step[0], step[1]);
    } else if (e.key === "f" || e.key === "F") {
      e.preventDefault();
      act({ type: "flag", index: i });
    }
  };

  const over = isOver(game);
  /** Thua mà không chạm bẫy nào: người chơi đã đầu hàng. */
  const gaveUp = game.phase === "lost" && game.hit === null;
  const flags = flagsOf(game);
  const left = game.mines - flags;
  // Cỡ ô tính trong globals.css (.dt-board) theo số hàng, cột; phóng to màn chơi thì ô giãn lấp màn.
  const cell = "var(--dt-cell)";
  // Điện thoại dọc: bàn ngang dài (Khó 30×16) xoay thành 16×30 để ô không quá nhỏ. Xoay bằng cách đổi hàng thành cột: ô kề
  // vẫn là ô kề nên số bẫy quanh ô giữ nguyên nghĩa.
  const turned = phone && portrait && game.width > game.height;
  const cols = turned ? game.height : game.width;
  const rows = turned ? game.width : game.height;
  const zoomable = phone && (viewportWidth - PHONE_GUTTER) / cols < ZOOM_BELOW;
  const scale = zoomable ? zoom : 1;
  const setScale = (z: number) => setZoom(Math.min(ZOOM_MAX, Math.max(1, Math.round(z * 100) / 100)));
  // Lôi chọn hàng hay cột theo bàn đang hiện; bàn xoay thì hàng trên màn là cột của ván.
  const engineAxis = turned ? (axis === "row" ? "col" : "row") : axis;

  const onPinchStart = (e: React.TouchEvent) => {
    if (!zoomable || e.touches.length !== 2) return;
    pinchRef.current = { dist: touchDist(e.touches), zoom: scale };
    // Ngón thứ hai chạm xuống: bỏ lần chạm giữ cắm cờ và lần mở ô của ngón đầu.
    if (pressRef.current) {
      window.clearTimeout(pressRef.current.timer);
      pressRef.current.fired = true;
    }
  };
  const onPinchMove = (e: React.TouchEvent) => {
    const start = pinchRef.current;
    if (!start || e.touches.length !== 2) return;
    setScale((start.zoom * touchDist(e.touches)) / Math.max(1, start.dist));
  };
  const onPinchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) pinchRef.current = null;
  };

  const lit = useMemo(() => {
    const set = new Set<number>();
    const info = game.info;
    if (!info) return set;
    if (info.kind === "area") [info.index, ...neighbors(info.index, game.width, game.height)].forEach((i) => set.add(i));
    else if (info.kind === "line") {
      for (let k = 0; k < (info.axis === "row" ? game.width : game.height); k++) set.add(info.axis === "row" ? info.at * game.width + k : k * game.width + info.at);
    } else set.add(info.index);
    return set;
  }, [game.info, game.width, game.height]);

  const cellLabel = (i: number) => {
    const [row, col] = displayPos(i, game.width, turned);
    const where = `Hàng ${row + 1}, cột ${col + 1}`;
    const c = game.cells[i];
    if (c === "flag") return `${where}: cờ lau`;
    if (c === "open") return `${where}: ${(game.counts?.[i] ?? 0) === 0 ? "trống" : `${game.counts?.[i]} bẫy kề`}`;
    if (game.phase === "lost" && game.trap?.[i]) return `${where}: bẫy`;
    return `${where}: chưa mở`;
  };

  const setup = (
    <>
          <div className="flex flex-col gap-2">
            <h2 className="ui-title-on-wood font-bold">Bậc độ khó</h2>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Bậc độ khó">
              {DT_LEVEL_ORDER.map((lv) => (
                <ChoiceChip key={lv} selected={lv === level} size="md" onClick={() => chooseLevel(lv)}>
                  {LEVEL_NAME[lv]}, {DT_LEVELS[lv].width}×{DT_LEVELS[lv].height}, {DT_LEVELS[lv].mines} bẫy
                </ChoiceChip>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="ui-title-on-wood font-bold">
              Đạo cụ mang theo <span className="text-sm font-normal text-on-wood-soft">(tối đa {DT_ITEM_PICKS}, đổi trước nước đầu)</span>
            </h2>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Chọn đạo cụ">
              {ELEMENTS.map((e) => (
                <ChoiceChip key={e} selected={picks.includes(e)} size="md" title={`${ITEM_INFO[e].name}: ${ITEM_INFO[e].text}`} onClick={() => togglePick(e)}>
                  <ElementIcon element={e} className="size-4" />
                  {ITEM_INFO[e].name}
                </ChoiceChip>
              ))}
            </div>
          </div>
    </>
  );

  return (
    <ModeScreen card label="Do Thám">
      <ModeBanner
        title="Do Thám"
        art="/art/home/do-tham.webp"
        kicker={`Giải đố – ${LEVEL_NAME[level]}`}
        description="Mở từng ô, suy ra chỗ giấu bẫy từ các con số rồi cắm cờ lau. Bàn nào cũng suy luận được, không cần đoán."
        stats={[
          { label: "Bẫy còn lại", value: left },
          { label: "Thời gian", value: clock(secs) },
          { label: "Kỷ lục bậc này", value: best[level] === undefined ? "–" : clock(best[level] as number) },
        ]}
      />
      <ModeGuideTabs scene="DO_THAM">
        {/* Điện thoại: phần chuẩn bị nằm trong bảng trượt mở từ nút trên hàng thao tác, để sa bàn lên đầu màn (21/11/2026). */}
        <section className="ui-frame flex flex-col gap-4 p-4 max-sm:hidden lg:flex-row lg:items-start lg:gap-10" aria-label="Chuẩn bị ván">
          {setup}
        </section>
        {phone && (
          <BottomSheet open={setupOpen} onClose={() => setSetupOpen(false)} title="Chuẩn bị ván">
            <div className="flex flex-col gap-4">{setup}</div>
          </BottomSheet>
        )}
        <PlayCard className="sm:mt-5">
          <OrnateFrame aria-label="Vùng chơi" flush className="flex min-w-0 flex-col items-center gap-3 p-2 sm:p-5">
            <div className="flex w-full flex-wrap items-center justify-center gap-2" role="toolbar" aria-label="Thao tác và đạo cụ">
              <Button variant="secondary" aria-haspopup="dialog" onClick={() => setSetupOpen(true)} className="sm:hidden">
                {LEVEL_NAME[level]}, {picks.length} đạo cụ
              </Button>
              <ChoiceChip selected={flagMode} onClick={() => setFlagMode((v) => !v)} size="md">
                <span aria-hidden className="grid size-6 place-items-center text-on-wood [&>svg]:size-full">
                  <FlagGlyph />
                </span>
                Cắm cờ lau
              </ChoiceChip>
              <Button variant="secondary" onClick={() => startGame(level, picks)}>
                Ván mới
              </Button>
              {game.phase === "playing" && (
                <SurrenderButton
                  size="md"
                  consequence="Ván này tính là thua và không ghi thời gian. Mọi bẫy sẽ lộ ra."
                  onConfirm={() => void act({ type: "surrender" })}
                />
              )}
              <span aria-hidden className="mx-1 hidden h-8 w-px bg-frame-line-soft sm:block" />
              {game.items.length === 0 ? (
                <span className="text-caption text-on-wood-soft max-sm:hidden">Chưa mang đạo cụ nào</span>
              ) : (
                game.items.map((it) => (
                  <Button
                    key={it.element}
                    variant={armed === it.element ? "primary" : "secondary"}
                    disabled={it.used || over}
                    aria-pressed={armed === it.element}
                    title={`${ITEM_INFO[it.element].name} (${ELEMENT_NAME[it.element]}): ${ITEM_INFO[it.element].text}`}
                    onClick={() => onItem(it.element)}
                    className="gap-1.5"
                  >
                    <ElementIcon element={it.element} className="size-5" />
                    {ITEM_INFO[it.element].name}
                    {it.used && <span className="text-caption font-normal">(đã dùng)</span>}
                  </Button>
                ))
              )}
            </div>
            {armed === "loi" && (
              <div className="flex items-center gap-2" role="group" aria-label="Hàng hay cột">
                <ChoiceChip selected={axis === "row"} size="sm" onClick={() => setAxis("row")}>Hàng</ChoiceChip>
                <ChoiceChip selected={axis === "col"} size="sm" onClick={() => setAxis("col")}>Cột</ChoiceChip>
              </div>
            )}
            {(armed || game.shield === "active") && (
              <p className="text-center text-sm text-on-wood-soft">
                {armed ? `${ITEM_INFO[armed].name}: ${ITEM_INFO[armed].text}` : "Khiên đất đang giữ: lần sa bẫy kế tiếp được đỡ."}
              </p>
            )}
            {zoomable && (
              <div className="flex items-center gap-2" role="group" aria-label="Cỡ sa bàn">
                <Button variant="secondary" size="sm" aria-label="Thu nhỏ sa bàn" disabled={scale <= 1} onClick={() => setScale(scale - 0.5)} className="min-w-11">
                  −
                </Button>
                <span className="min-w-24 text-center text-caption text-on-wood-soft" aria-live="polite">
                  {scale <= 1 ? "Chụm hai ngón để phóng" : `Phóng ${Math.round(scale * 100)}%`}
                </span>
                <Button variant="secondary" size="sm" aria-label="Phóng to sa bàn" disabled={scale >= ZOOM_MAX} onClick={() => setScale(scale + 0.5)} className="min-w-11">
                  +
                </Button>
              </div>
            )}
            <div
              className={`w-full overflow-x-auto pb-1 ${scale > 1 ? "max-h-[70dvh] overflow-y-auto overscroll-contain" : ""} ${zoomable ? "touch-pan-x touch-pan-y" : ""}`}
              onTouchStart={onPinchStart}
              onTouchMove={onPinchMove}
              onTouchEnd={onPinchEnd}
              onTouchCancel={onPinchEnd}
            >
              <div className="ui-frame-inset mx-auto w-fit p-1 sm:p-2">
                <div
                  ref={boardRef}
                  role="grid"
                  aria-label={`Sa bàn Do Thám ${rows} hàng ${cols} cột${turned ? ", đã xoay dọc" : ""}`}
                  className="dt-board grid"
                  style={{ gridTemplateColumns: `repeat(${cols}, ${cell})`, gridAutoRows: cell, ["--dt-cols" as string]: cols, ["--dt-rows" as string]: rows, ["--dt-zoom" as string]: scale }}
                >
                  {game.cells.map((_, d) => {
                    // d: thứ tự ô trên bàn đang hiện; i: ô của ván. Bàn xoay thì hàng hiện là cột của ván.
                    const i = turned ? (d % cols) * game.width + Math.floor(d / cols) : d;
                    const c = game.cells[i];
                    const trap = game.trap?.[i] === true;
                    const hit = game.hit === i;
                    const open = c === "open";
                    const showTrap = game.phase === "lost" && trap && c !== "flag";
                    const wrongFlag = game.phase === "lost" && c === "flag" && !trap;
                    const n = game.counts?.[i] ?? 0;
                    return (
                      <div role="gridcell" key={i} className="contents">
                        <button
                          type="button"
                          data-i={i}
                          tabIndex={i === focus ? 0 : -1}
                          aria-label={cellLabel(i)}
                          onFocus={() => setFocus(i)}
                          onKeyDown={(e) => onKey(e, i)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            if (!over) act({ type: "flag", index: i });
                          }}
                          onPointerDown={(e) => {
                            if (e.pointerType !== "touch" || over) return;
                            const timer = window.setTimeout(() => {
                              if (pressRef.current) pressRef.current.fired = true;
                              act({ type: "flag", index: i });
                            }, 420);
                            pressRef.current = { timer, fired: false };
                          }}
                          onPointerUp={() => pressRef.current && window.clearTimeout(pressRef.current.timer)}
                          onPointerLeave={() => pressRef.current && window.clearTimeout(pressRef.current.timer)}
                          onClick={() => {
                            if (pressRef.current?.fired) {
                              pressRef.current = null;
                              return;
                            }
                            if (!over) press(i);
                          }}
                          style={{ fontSize: `calc(${cell} * 0.55)` }}
                          className={[
                            "flex items-center justify-center border font-bold leading-none tabular-nums select-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-frame-gold",
                            open ? `border-frame-line-soft bg-wood-inset ${NUMBER_CLASS[n]}` : "border-frame-bronze bg-paper-deep text-ink hover:bg-paper",
                            hit ? "!bg-lacquer text-on-lacquer" : "",
                            showTrap ? "!bg-wood-panel text-on-wood" : "",
                            wrongFlag ? "bg-warning-surface" : "",
                            lit.has(i) ? "ring-2 ring-inset ring-frame-gold-hi" : "",
                          ].join(" ")}
                        >
                          {open ? (n > 0 ? n : "") : c === "flag" ? <FlagGlyph /> : showTrap ? <TrapGlyph /> : null}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <p role="status" aria-live="polite" className="min-h-6 text-center text-[15px] text-title-on-wood">
              {message || infoText(game.info, game.width, turned)}
            </p>
            <ResultModal
              open={over && dismissed !== game}
              tone={game.phase === "won" ? "win" : "lose"}
              kicker={game.phase === "won" ? "Do thám thành công" : undefined}
              title={game.phase === "won" ? "Gỡ xong mọi bẫy!" : gaveUp ? "Đã đầu hàng" : "Sa bẫy"}
              onDismiss={() => setDismissed(game)}
              actions={
                <Button size="lg" autoFocus onClick={() => startGame(level, picks)}>
                  Ván mới
                </Button>
              }
            >
              <p>
                {game.phase === "won"
                  ? `Bạn xong bậc ${LEVEL_NAME[level]} trong ${clock(secs)}.${best[level] === secs ? " Đây là thời gian tốt nhất của bạn." : ""}`
                  : gaveUp
                    ? "Các bẫy đã lộ ra. Vào ván mới để thử lại."
                    : "Ô đỏ là bẫy bạn chạm phải. Các bẫy còn lại đã lộ ra."}
              </p>
            </ResultModal>
          </OrnateFrame>
        </PlayCard>
      </ModeGuideTabs>
    </ModeScreen>
  );
}
