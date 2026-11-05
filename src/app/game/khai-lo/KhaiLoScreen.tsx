"use client";

// Khai Lộ: chạm một ô để xóa cả nhóm ô ngọc cùng loại liền cạnh; ô rơi xuống, cột trống dồn sang trái. Chơi offline,
// ván dở và điểm cao nhất lưu ở trình duyệt. Luật ở src/core/khai-lo, spec ở docs/02-game-modes/future/24-khai-lo-gdd.md.
//
// Điều khiển: rê chuột để xem trước nhóm (máy tính), chạm lần đầu để xem trước rồi chạm lại để xóa (điện thoại),
// bàn phím: mũi tên di chuyển, Enter/Space chọn, Z hoàn tác, 1 Lốc, 2 Sấm, Esc bỏ chọn đạo cụ.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  KL_MIN_GROUP,
  createGame,
  groupAt,
  groupScore,
  isWhirlCenter,
  parseGame,
  ringOf,
  serializeGame,
  thunderArea,
  tilesLeft,
  transition,
  type KlCell,
  type KlEvent,
  type KlReason,
  type KlState,
  type KlTool,
} from "@/core/khai-lo";
import type { TileKind } from "@/core/board/tiles";
import { TileArt } from "../art/tiles";
import { readStorage, writeStorage } from "../formation/storage";
import { SceneLink } from "../SceneContext";

const SAVE_KEY = "reed-banner:khai-lo:save:v1";
const BEST_KEY = "reed-banner:khai-lo:best:v1";

const freshSeed = () => (Math.random() * 0x100000000) >>> 0;

const KIND_LABEL: Record<TileKind, string> = {
  kiem: "Kiếm",
  amDuong: "Âm dương",
  banhChung: "Bánh chưng",
  tim: "Tim",
  vang: "Vàng",
  sach: "Sách",
  trong: "Trống",
};

const REASON_TEXT: Record<KlReason, string> = {
  notPlaying: "Màn đã kết thúc.",
  outOfBounds: "Ngoài bàn.",
  empty: "Ô trống.",
  single: "Ô lẻ: cần ít nhất 2 ô cùng loại liền cạnh.",
  noTool: "Hết đạo cụ này.",
  edge: "Lốc cần tâm không nằm sát mép bàn.",
  noUndo: "Không còn lượt hoàn tác.",
};

const TOOL_NAME: Record<KlTool, string> = { whirl: "Lốc Phong", thunder: "Sấm Sét" };

interface Ghost {
  readonly key: string;
  readonly cell: KlCell;
  readonly index: number;
}

function readBest(): number {
  const n = Number(readStorage(BEST_KEY));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export default function KhaiLoScreen() {
  const [state, setState] = useState<KlState | null>(null);
  const [best, setBest] = useState(0);
  const [peek, setPeek] = useState<number | null>(null);
  const [armed, setArmed] = useState<number | null>(null);
  const [focus, setFocus] = useState(0);
  const [tool, setTool] = useState<KlTool | null>(null);
  const [message, setMessage] = useState("");
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const touchRef = useRef(false);
  const boardRef = useRef<HTMLDivElement>(null);

  // Ván dở chỉ đọc ở client để không lệch hydration.
  useEffect(() => {
    const saved = parseGame(readStorage(SAVE_KEY));
    /* eslint-disable react-hooks/set-state-in-effect -- đọc kho trình duyệt chỉ có ở client */
    setState(saved && saved.phase !== "over" ? saved : createGame(freshSeed()));
    setBest(readBest());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!ghosts.length) return;
    const t = window.setTimeout(() => setGhosts([]), 320);
    return () => window.clearTimeout(t);
  }, [ghosts]);

  const commit = useCallback(
    (next: KlState, events: readonly KlEvent[], before: KlState) => {
      setState(next);
      writeStorage(SAVE_KEY, next.phase === "over" ? null : serializeGame(next));
      if (next.score > best) {
        setBest(next.score);
        writeStorage(BEST_KEY, String(next.score));
      }
      const gone: Ghost[] = [];
      const parts: string[] = [];
      for (const e of events) {
        if (e.type === "removed" || e.type === "thundered") {
          for (const i of e.cells) {
            const cell = before.cells[i];
            if (cell) gone.push({ key: `${cell.id}-${next.moves}`, cell, index: i });
          }
        }
        if (e.type === "removed") parts.push(`Xóa ${e.cells.length} ô, +${e.gained} điểm.`);
        if (e.type === "thundered") parts.push(`Sấm Sét phá ${e.cells.length} ô.`);
        if (e.type === "whirled") parts.push("Lốc Phong xoay một vòng.");
        if (e.type === "undone") parts.push("Đã hoàn tác.");
        if (e.type === "newLevel") parts.push(`Màn ${e.level}.`);
        if (e.type === "levelDone") parts.push(e.summary.cleared ? "Dọn sạch bàn!" : `Hết đường, còn ${e.summary.left} ô.`);
      }
      if (next.phase === "stuck") parts.push("Hết nhóm để xóa: dùng đạo cụ hoặc kết thúc màn.");
      setGhosts(gone);
      setMessage(parts.join(" "));
      setArmed(null);
    },
    [best],
  );

  const act = useCallback(
    (action: Parameters<typeof transition>[1]) => {
      if (!state) return;
      const r = transition(state, action);
      if (!r.ok) {
        setMessage(REASON_TEXT[r.reason]);
        return;
      }
      if (action.type === "whirl" || action.type === "thunder") setTool(null);
      commit(r.state, r.events, state);
    },
    [state, commit],
  );

  const newGame = useCallback(() => {
    const s = createGame(freshSeed());
    writeStorage(SAVE_KEY, serializeGame(s));
    setState(s);
    setMessage("");
    setTool(null);
    setArmed(null);
    setGhosts([]);
  }, []);

  // Ô sẽ bị tác động nếu chọn ô đang rê/chạm: nhóm, vòng lốc, hoặc vùng sấm.
  const preview = useMemo(() => {
    if (!state || peek === null) return { cells: new Set<number>(), text: "" };
    const { width, height, cells } = state;
    if (tool === "whirl") {
      if (!isWhirlCenter(peek, width, height)) return { cells: new Set<number>(), text: REASON_TEXT.edge };
      return { cells: new Set([...ringOf(peek, width), peek]), text: "Xoay 8 ô quanh tâm theo chiều kim đồng hồ." };
    }
    if (tool === "thunder") {
      const area = thunderArea(peek, width, height).filter((i) => cells[i]);
      return { cells: new Set(area), text: area.length ? `Phá ${area.length} ô (không cộng điểm).` : REASON_TEXT.empty };
    }
    const cell = cells[peek];
    if (!cell) return { cells: new Set<number>(), text: "" };
    const g = groupAt(cells, width, height, peek);
    if (g.length < KL_MIN_GROUP) return { cells: new Set<number>(), text: `${KIND_LABEL[cell.kind]}: ô lẻ, không xóa được.` };
    const banners = g.reduce((n, i) => n + (cells[i]?.banner ? 1 : 0), 0);
    return {
      cells: new Set(g),
      text: `${g.length} ô ${KIND_LABEL[cell.kind]}${banners ? `, ${banners} ô hào quang` : ""}: +${groupScore(g.length, banners)} điểm.`,
    };
  }, [state, peek, tool]);

  const choose = useCallback(
    (i: number) => {
      if (!state) return;
      // Điện thoại: chạm lần đầu chỉ xem trước, chạm lại cùng nhóm/ô mới thực hiện.
      if (touchRef.current) {
        const same = armed !== null && (tool ? armed === i : groupAt(state.cells, state.width, state.height, armed).includes(i));
        if (!same) {
          setArmed(i);
          setPeek(i);
          return;
        }
      }
      act(tool ? { type: tool, index: i } : { type: "pick", index: i });
    },
    [state, armed, tool, act],
  );

  // Phím tắt toàn màn (khi tiêu điểm ở bàn hoặc ở trang).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "z") act({ type: "undo" });
      else if (k === "1") setTool((t) => (t === "whirl" ? null : "whirl"));
      else if (k === "2") setTool((t) => (t === "thunder" ? null : "thunder"));
      else if (k === "escape") setTool(null);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [act]);

  if (!state) {
    return (
      <Shell>
        <p role="status" className="text-[var(--atlas-muted)]">Đang bày bàn…</p>
      </Shell>
    );
  }

  const { width, height } = state;
  const active = state.phase === "playing" || state.phase === "stuck";
  const left = tilesLeft(state.cells);

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
      act(tool ? { type: tool, index: i } : { type: "pick", index: i });
    }
  };

  const cell = `min(56px, calc((100vw - 3rem - 20px) / ${width}))`;

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <header>
          <p className="text-xs font-semibold tracking-[0.25em] text-[var(--atlas-gold)] uppercase">Giải đố · Màn {state.level}</p>
          <h1 className="atlas-title font-serif text-3xl font-bold">Khai Lộ</h1>
        </header>
        <div className="flex gap-2">
          <button type="button" onClick={newGame} className="home-secondary min-h-11 rounded-lg px-4 font-serif font-semibold">Ván mới</button>
          <SceneLink scene="MENU" className="home-secondary flex min-h-11 items-center rounded-lg px-4 font-serif font-semibold">Về màn chính</SceneLink>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col items-center gap-3">
          <Stats state={state} best={best} left={left} />
          <div className="atlas-frame atlas-frame-wood w-fit p-2">
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
                    data-tool={preview.cells.has(i) ? (tool ?? undefined) : undefined}
                    style={{ transform: `translate(calc(var(--kl-cell) * ${i % width}), calc(var(--kl-cell) * ${Math.floor(i / width)}))` }}
                  >
                    <TileArt kind={c.kind} special={c.banner ? "weak" : undefined} className="size-full" />
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
                  <TileArt kind={g.cell.kind} special={g.cell.banner ? "weak" : undefined} className="size-full" />
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
                      aria-label={`Hàng ${Math.floor(i / width) + 1}, cột ${(i % width) + 1}: ${c ? `${KIND_LABEL[c.kind]}${c.banner ? ", hào quang" : ""}` : "trống"}`}
                      className="kl-hit focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--atlas-gold)]"
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
          </div>
          <p role="status" aria-live="polite" className="min-h-6 text-center text-[15px] text-[var(--atlas-title)]">{message}</p>
          <p aria-hidden className="-mt-2 min-h-5 text-center text-sm text-[var(--atlas-muted)]">
            {active ? preview.text || "Rê chuột (hoặc chạm một lần) để xem trước nhóm sẽ xóa." : ""}
          </p>
        </div>

        <aside className="flex flex-col gap-4" aria-label="Bảng điều khiển">
          {state.phase === "levelDone" && state.summary && (
            <section role="status" className="atlas-frame atlas-frame-wood flex flex-col gap-3 p-4">
              <h2 className="font-serif text-2xl font-bold text-[var(--atlas-title)]">{state.summary.cleared ? "Khai thông!" : `Hết màn ${state.summary.level}`}</h2>
              <p className="text-[15px]">
                {state.summary.cleared
                  ? `Dọn sạch bàn: +${state.summary.bonus} điểm, +${state.summary.troopsDelta} quân lực, +1 mỗi đạo cụ.`
                  : `Còn ${state.summary.left} ô chưa dọn: mất ${-state.summary.troopsDelta} quân lực.`}
              </p>
              <button type="button" autoFocus onClick={() => act({ type: "nextLevel" })} className="home-cta min-h-12 w-fit rounded-lg px-6 font-serif font-bold">Sang màn {state.level + 1}</button>
            </section>
          )}
          {state.phase === "over" && (
            <section role="status" className="atlas-frame atlas-frame-wood flex flex-col gap-3 p-4">
              <h2 className="font-serif text-2xl font-bold text-[var(--atlas-title)]">Hết quân lực</h2>
              <p className="text-[15px]">
                Bạn đi tới màn {state.level}, đạt <b>{state.score} điểm</b>
                {state.score >= best && state.score > 0 ? " (cao nhất từ trước tới nay)" : ""}.
              </p>
              <button type="button" autoFocus onClick={newGame} className="home-cta min-h-12 w-fit rounded-lg px-6 font-serif font-bold">Chơi lại</button>
            </section>
          )}
          {active && (
            <div className="atlas-frame atlas-frame-wood flex flex-col gap-3 p-4">
              <p className="font-serif font-bold text-[var(--atlas-title)]">Đạo cụ</p>
              <div className="grid grid-cols-2 gap-2">
                {(["whirl", "thunder"] as const).map((t, k) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={tool === t}
                    disabled={state.tools[t] <= 0}
                    onClick={() => setTool((cur) => (cur === t ? null : t))}
                    className={`min-h-12 rounded-lg border px-2 font-serif font-semibold disabled:opacity-50 ${tool === t ? "border-[var(--atlas-gold)] bg-[#4a3518] text-[var(--atlas-title)]" : "home-secondary"}`}
                  >
                    {TOOL_NAME[t]} ×{state.tools[t]}
                    <span className="block text-xs font-normal text-[var(--atlas-muted)]">phím {k + 1}</span>
                  </button>
                ))}
              </div>
              {tool && <p className="text-sm text-[var(--atlas-muted)]">{tool === "whirl" ? "Chọn tâm: 8 ô quanh xoay theo chiều kim đồng hồ." : "Chọn ô: phá vùng 3×3 quanh ô đó."} Esc để bỏ chọn.</p>}
              <div className="grid grid-cols-2 gap-2">
                <button type="button" disabled={!state.prev || state.undo <= 0} onClick={() => act({ type: "undo" })} className="home-secondary min-h-11 rounded-lg px-2 font-serif font-semibold disabled:opacity-50">
                  Hoàn tác ({state.undo})
                </button>
                <button type="button" onClick={() => act({ type: "endLevel" })} className={`min-h-11 rounded-lg px-2 font-serif font-semibold ${state.phase === "stuck" ? "home-cta" : "home-secondary"}`}>
                  Kết thúc màn
                </button>
              </div>
            </div>
          )}
          <details className="atlas-frame atlas-frame-wood p-4" open={state.level === 1 && state.moves === 0}>
            <summary className="cursor-pointer font-serif font-bold text-[var(--atlas-title)]">Luật chơi</summary>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px] leading-snug">
              <li>Chạm một ô có ít nhất 1 ô cùng loại liền cạnh (trên, dưới, trái, phải): <b>cả nhóm</b> biến mất. Nhóm n ô được n² điểm, nên gom nhóm to rồi mới xóa.</li>
              <li>Ô phía trên rơi xuống; cột trống hẳn thì các cột bên phải dồn sang trái. Không có ô mới rơi vào.</li>
              <li>Ô có <b>hào quang</b> nhân điểm cả nhóm chứa nó (mỗi ô hào quang ×1 thêm).</li>
              <li>Hết nhóm để xóa là hết màn: mỗi ô còn sót trừ 1 quân lực. Dọn sạch bàn được thưởng điểm theo màn, +5 quân lực và +1 mỗi đạo cụ. Quân lực về 0 là hết ván.</li>
              <li>Màn càng sau càng nhiều loại ô (3 lên 6). Mỗi màn được hoàn tác 1 lần.</li>
              <li><b>Lốc Phong</b> xoay 8 ô quanh một tâm; <b>Sấm Sét</b> phá vùng 3×3 (không cộng điểm).</li>
            </ul>
          </details>
          <p className="text-sm text-[var(--atlas-muted)]">Bản chơi thử offline: chưa có thưởng và bảng xếp hạng. Ván dở và điểm cao nhất lưu trên trình duyệt này.</p>
        </aside>
      </div>
    </Shell>
  );
}

function Stats({ state, best, left }: { state: KlState; best: number; left: number }) {
  const items: [string, string][] = [
    ["Điểm", String(state.score)],
    ["Quân lực", String(state.troops)],
    ["Ô còn", String(left)],
    ["Cao nhất", String(Math.max(best, state.score))],
  ];
  return (
    <dl className="grid w-full max-w-[560px] grid-cols-4 gap-2 text-center">
      {items.map(([k, v]) => (
        <div key={k} className="atlas-frame atlas-frame-wood px-1 py-1.5">
          <dt className="text-xs text-[var(--atlas-muted)]">{k}</dt>
          <dd className="font-serif text-lg font-bold text-[var(--atlas-title)]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="campaign-atlas demo-bg flex flex-1 flex-col bg-[#17110e] pb-10 text-[var(--atlas-ink-on-wood)]">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-4 pt-4 sm:px-6 lg:pt-6">{children}</div>
    </main>
  );
}
