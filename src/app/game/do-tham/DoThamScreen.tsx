"use client";

// Do Thám: dò bẫy trên sa bàn. Mở ô để biết số bẫy quanh nó, cắm cờ lau lên ô nghi có bẫy, mở hết ô an toàn là thắng. Chơi
// ngay trên máy, ván dở và thời gian tốt nhất lưu ở trình duyệt. Luật ở src/core/do-tham, spec ở docs/02-game-modes/do-tham/gdd.md.
//
// Điều khiển: chuột trái mở ô (bấm vào ô số đã đủ cờ thì mở nhanh), chuột phải cắm cờ; điện thoại chạm mở, chạm giữ cắm cờ
// hoặc bật nút Cắm cờ; bàn phím: mũi tên di chuyển, Enter hoặc Space mở, F cắm cờ.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { ModeBanner, ModeScreen, OrnateFrame } from "@/components/game-ui";
import { ElementIcon } from "../art/icons";
import { ELEMENT_NAME } from "../battle/labels";
import { readStorage, writeStorage } from "../formation/storage";
import { ModeGuideTabs } from "../ModeGuide";

const SAVE_KEY = "reed-banner:do-tham:save:v1";
const BEST_KEY = "reed-banner:do-tham:best:v1";
const PICKS_KEY = "reed-banner:do-tham:picks:v1";
const LEVEL_KEY = "reed-banner:do-tham:level:v1";

const LEVEL_NAME: Record<DtLevel, string> = { nhapMon: "Nhập môn", thuong: "Thường", kho: "Khó" };

interface ItemInfo {
  readonly name: string;
  readonly text: string;
}

const ITEM_INFO: Record<Element, ItemInfo> = {
  kim: { name: "Dò chông", text: "Lộ một bẫy rồi cắm cờ lên đó." },
  moc: { name: "Mầm xanh", text: "Chọn một ô: an toàn thì mở, có bẫy thì tự cắm cờ mà không thua." },
  thuy: { name: "Soi nước", text: "Chọn một ô: biết trong vùng 3×3 quanh nó có bao nhiêu bẫy." },
  hoa: { name: "Đốt lau", text: "Chọn một ô: mở hết ô an toàn trong vùng 3×3 và cắm cờ lên các bẫy." },
  tho: { name: "Khiên đất", text: "Đỡ cho bạn một lần sa bẫy." },
  loi: { name: "Sấm báo", text: "Chọn hàng hoặc cột rồi chọn một ô: biết trên đó có bao nhiêu bẫy." },
  phong: { name: "Gió mách", text: "Chỉ ra một ô chắc chắn an toàn, hoặc chắc chắn có bẫy." },
};

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

function infoText(info: DtInfo | null, width: number): string {
  if (!info) return "";
  if (info.kind === "area") return `Vùng 3×3 quanh hàng ${Math.floor(info.index / width) + 1}, cột ${(info.index % width) + 1} có ${info.count} bẫy.`;
  if (info.kind === "line") return `${info.axis === "row" ? "Hàng" : "Cột"} ${info.at + 1} có ${info.count} bẫy.`;
  return `Gió mách: hàng ${Math.floor(info.index / width) + 1}, cột ${(info.index % width) + 1} ${info.certain === "safe" ? "chắc chắn an toàn" : "chắc chắn có bẫy"}.`;
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
  const [message, setMessage] = useState("");
  const [focus, setFocus] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const pressRef = useRef<{ timer: number; fired: boolean } | null>(null);

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
        return false;
      }
      setGame(r.state);
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
    [game, best, level, secs],
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
      const ok = act(armed === "loi" ? { type: "item", element: armed, index: i, axis } : { type: "item", element: armed, index: i });
      if (ok) setArmed(null);
      return;
    }
    if (game.cells[i] === "open") act({ type: "chord", index: i });
    else if (flagMode) act({ type: "flag", index: i });
    else act({ type: "open", index: i });
  };

  const moveFocus = (i: number, dx: number, dy: number) => {
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
  const flags = flagsOf(game);
  const left = game.mines - flags;
  const cell = `max(26px, min(38px, calc((100vw - 3.5rem) / ${game.width})))`;

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
    const where = `Hàng ${Math.floor(i / game.width) + 1}, cột ${(i % game.width) + 1}`;
    const c = game.cells[i];
    if (c === "flag") return `${where}: cờ lau`;
    if (c === "open") return `${where}: ${(game.counts?.[i] ?? 0) === 0 ? "trống" : `${game.counts?.[i]} bẫy kề`}`;
    if (game.phase === "lost" && game.trap?.[i]) return `${where}: bẫy`;
    return `${where}: chưa mở`;
  };

  return (
    <ModeScreen label="Do Thám">
      <ModeBanner
        title="Do Thám"
        kicker={`Giải đố · ${LEVEL_NAME[level]}`}
        description="Mở từng ô, suy ra chỗ giấu bẫy từ các con số rồi cắm cờ lau. Bàn nào cũng suy luận được, không cần đoán."
        stats={[
          { label: "Bẫy còn lại", value: left },
          { label: "Thời gian", value: clock(secs) },
          { label: "Kỷ lục bậc này", value: best[level] === undefined ? "–" : clock(best[level] as number) },
        ]}
      />
      <ModeGuideTabs scene="DO_THAM">
        <div className={`grid grid-cols-[minmax(0,1fr)] items-start gap-6 ${game.width > 16 ? "" : "lg:grid-cols-[minmax(0,1fr)_320px]"}`}>
          <OrnateFrame aria-label="Vùng chơi" flush className="flex min-w-0 flex-col items-center gap-3 p-2 sm:p-5">
            <div className="flex w-full flex-wrap items-center justify-center gap-2" role="group" aria-label="Bậc độ khó">
              {DT_LEVEL_ORDER.map((lv) => (
                <ChoiceChip key={lv} selected={lv === level} size="md" onClick={() => chooseLevel(lv)}>
                  {LEVEL_NAME[lv]} · {DT_LEVELS[lv].width}×{DT_LEVELS[lv].height} · {DT_LEVELS[lv].mines} bẫy
                </ChoiceChip>
              ))}
            </div>
            <div className="w-full overflow-x-auto pb-1">
              <div className="ui-frame-inset mx-auto w-fit p-1 sm:p-2">
                <div
                  ref={boardRef}
                  role="grid"
                  aria-label={`Sa bàn Do Thám ${game.height} hàng ${game.width} cột`}
                  className="grid"
                  style={{ gridTemplateColumns: `repeat(${game.width}, ${cell})`, gridAutoRows: cell }}
                >
                  {game.cells.map((c, i) => {
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
              {message || infoText(game.info, game.width)}
            </p>
            {over && (
              <div role="status" className="ui-frame flex w-full max-w-md flex-col items-center gap-2 p-4 text-center">
                <h2 className="ui-title-on-wood text-2xl font-bold">{game.phase === "won" ? "Gỡ xong mọi bẫy!" : "Sa bẫy"}</h2>
                <p className="text-[15px]">
                  {game.phase === "won"
                    ? `Bạn xong bậc ${LEVEL_NAME[level]} trong ${clock(secs)}.${best[level] === secs ? " Đây là thời gian tốt nhất của bạn." : ""}`
                    : "Ô đỏ là bẫy bạn chạm phải. Các bẫy còn lại đã lộ ra."}
                </p>
                <Button size="lg" autoFocus onClick={() => startGame(level, picks)}>
                  Ván mới
                </Button>
              </div>
            )}
          </OrnateFrame>

          <aside className="flex flex-col gap-4" aria-label="Bảng điều khiển">
            <section className="ui-frame flex flex-col gap-3 p-4">
              <h2 className="ui-title-on-wood font-bold">Thao tác</h2>
              <div className="flex flex-wrap gap-2">
                <ChoiceChip selected={flagMode} onClick={() => setFlagMode((v) => !v)} size="md">
                  Cắm cờ lau
                </ChoiceChip>
                <Button variant="secondary" onClick={() => startGame(level, picks)}>
                  Ván mới
                </Button>
              </div>
              <p className="text-sm text-on-wood-soft">
                Chuột phải hoặc chạm giữ để cắm cờ. Bấm vào ô số đã đủ cờ để mở nhanh các ô quanh nó.
              </p>
            </section>

            <section className="ui-frame flex flex-col gap-3 p-4" aria-label="Đạo cụ nguyên tố">
              <h2 className="ui-title-on-wood font-bold">Đạo cụ nguyên tố</h2>
              <p className="text-sm text-on-wood-soft">
                Mang tối đa {DT_ITEM_PICKS} đạo cụ vào ván, mỗi đạo cụ dùng một lần.
              </p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Chọn đạo cụ">
                {ELEMENTS.map((e) => (
                  <ChoiceChip key={e} selected={picks.includes(e)} size="sm" onClick={() => togglePick(e)}>
                    <ElementIcon element={e} className="size-4" />
                    {ELEMENT_NAME[e]}
                  </ChoiceChip>
                ))}
              </div>
              {game.items.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {game.items.map((it) => (
                    <li key={it.element} className="ui-frame-inset flex items-start gap-2 p-2">
                      <ElementIcon element={it.element} className="mt-0.5 size-5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">
                          {ITEM_INFO[it.element].name} <span className="text-caption font-normal text-on-wood-soft">· {ELEMENT_NAME[it.element]}</span>
                        </p>
                        <p className="text-sm text-on-wood-soft">{ITEM_INFO[it.element].text}</p>
                        {it.element === "loi" && !it.used && (
                          <div className="mt-1 flex gap-2" role="group" aria-label="Hàng hay cột">
                            <ChoiceChip selected={axis === "row"} size="sm" onClick={() => setAxis("row")}>Hàng</ChoiceChip>
                            <ChoiceChip selected={axis === "col"} size="sm" onClick={() => setAxis("col")}>Cột</ChoiceChip>
                          </div>
                        )}
                      </div>
                      <Button
                        variant={armed === it.element ? "primary" : "secondary"}
                        size="sm"
                        disabled={it.used || over}
                        aria-pressed={armed === it.element}
                        onClick={() => onItem(it.element)}
                      >
                        {it.used ? "Đã dùng" : armed === it.element ? "Bỏ chọn" : "Dùng"}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              {game.shield === "active" && <p className="text-sm text-title-on-wood">Khiên đất đang giữ: lần sa bẫy kế tiếp được đỡ.</p>}
            </section>

            <p className="text-sm text-on-wood-soft">
              Bản chơi thử, không cần mạng: chưa có thưởng và bảng xếp hạng. Ván dở và thời gian tốt nhất mỗi bậc lưu trên trình duyệt này.
            </p>
          </aside>
        </div>
      </ModeGuideTabs>
    </ModeScreen>
  );
}
