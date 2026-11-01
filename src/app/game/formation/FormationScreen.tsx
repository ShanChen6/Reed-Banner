"use client";

// Trận Đồ (Binh Pháp): bày quân lệnh theo nghề hoặc hệ để khai thông toàn bộ sa bàn. Bản chơi thử offline: không
// thưởng, không lên bảng xếp hạng, ván dở lưu ở trình duyệt. Luật ở src/core/binh-phap, spec ở
// docs/02-game-modes/future/02-binh-phap-gdd.md (mục 11).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RULESETS,
  FUSION_CHARACTERS,
  checkPlacement,
  createPuzzle,
  idx,
  legalPlacements,
  playableCount,
  parsePuzzle,
  rulesetById,
  serializePuzzle,
  transition,
  type BoardPiece,
  type Piece,
  type PlacementCheck,
  type PuzzleEvent,
  type PuzzleState,
  type Ruleset,
} from "@/core/binh-phap";
import { companionById } from "@/core/roster/roster";
import { ElementIcon, ELEMENT_COLOR, ProfessionIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import { SceneLink } from "../SceneContext";
import RankedPanel from "./RankedPanel";
import { claimRanked, fetchOverview, moveRanked, startRanked, toPuzzleState, type FormationView, type Overview } from "./rankedClient";

const SAVE_KEY = "reed-banner:tran-do:save:v1";
const BEST_KEY = "reed-banner:tran-do:best:v1";

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* trình duyệt chặn lưu: vẫn chơi được, chỉ không resume */
  }
}
function readBest(): Record<string, number> {
  try {
    const v = JSON.parse(readStorage(BEST_KEY) ?? "{}") as Record<string, unknown>;
    return Object.fromEntries(Object.entries(v).filter(([, n]) => typeof n === "number" && Number.isFinite(n))) as Record<string, number>;
  } catch {
    return {};
  }
}

const freshSeed = () => (Math.random() * 0x100000000) >>> 0;

const nameOf = (id: string) => FUSION_CHARACTERS.find((f) => f.characterId === id)?.name ?? companionById(id)?.name ?? "Tướng";

function pieceLabel(p: Piece): string {
  if (p.kind === "wild") return "Quân Lệnh";
  if (p.kind === "eraser") return "Thu Hồi";
  if (p.kind === "fusion") return `${nameOf(p.characterId)}, dung hợp mọi nghề và mọi hệ`;
  return `${nameOf(p.characterId)}, ${PROFESSION_NAME[p.profession]}, hệ ${ELEMENT_NAME[p.element]}`;
}

const REASON_TEXT: Record<Extract<PlacementCheck, { ok: false }>["reason"], string> = {
  outOfBounds: "Ngoài sa bàn.",
  blocked: "Ô chướng ngại, không đặt được quân.",
  occupied: "Ô này đã có quân.",
  empty: "Thu Hồi chỉ đặt lên ô đang có quân.",
  notAdjacent: "Quân phải đặt sát một quân khác (trên, dưới, trái hoặc phải).",
  mismatch: "Phải cùng nghề hoặc cùng hệ với từng quân kề.",
};

function describeEvents(events: readonly PuzzleEvent[]): string {
  const phrases: string[] = [];
  for (const e of events) {
    if (e.type === "lineCleared") phrases.push(e.axis === "row" ? `Dọn hàng ${e.index + 1}.` : `Dọn cột ${e.index + 1}.`);
    if (e.type === "erased") phrases.push("Đã thu hồi quân.");
    if (e.type === "discarded") phrases.push("Đã bỏ lệnh.");
    if (e.type === "won") phrases.push("Khai thông toàn bộ sa bàn!");
    if (e.type === "lost") phrases.push("Bỏ lệnh quá nhiều, thua trận.");
  }
  return phrases.join(" ");
}

export default function FormationScreen() {
  const [state, setState] = useState<PuzzleState | null>(null);
  const [ready, setReady] = useState(false);
  const [best, setBest] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");
  const [last, setLast] = useState<number | null>(null);
  const [focus, setFocus] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  // Chế độ xếp hạng: ván nằm ở server, client chỉ giữ bản công khai.
  const [ranked, setRanked] = useState<FormationView | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [busy, setBusy] = useState(false);
  const [claimNote, setClaimNote] = useState("");

  // Nạp ván dở sau khi hiển thị lần đầu: server không có localStorage nên tránh lệch hydration.
  useEffect(() => {
    const saved = parsePuzzle(readStorage(SAVE_KEY));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đọc kho trình duyệt chỉ có ở client
    if (saved && saved.phase === "playing") setState(saved);
    setBest(readBest());
    setReady(true);
    void fetchOverview().then(setOverview);
  }, []);

  const refreshOverview = useCallback(() => void fetchOverview().then(setOverview), []);

  const playRanked = useCallback(
    async (level: string) => {
      if (busy) return;
      setBusy(true);
      setMessage("");
      const r = await startRanked(level);
      setBusy(false);
      if (!r.ok) {
        setMessage(r.status === 403 ? "Chế độ xếp hạng chưa mở." : "Không mở được ván xếp hạng, thử lại nhé.");
        return;
      }
      setRanked(r.data.view);
      setLast(null);
      setFocus(0);
    },
    [busy],
  );

  const leaveRanked = useCallback(() => {
    setRanked(null);
    setMessage("");
    refreshOverview();
  }, [refreshOverview]);

  const applyRanked = useCallback(
    async (command: Parameters<typeof transition>[1]) => {
      if (!ranked || busy || ranked.status !== "playing") return;
      const local = toPuzzleState(ranked);
      // Báo lỗi luật ngay trên máy cho đỡ tốn một lượt gọi server; server vẫn kiểm lại mọi lệnh.
      if (command.kind === "place") {
        const c = checkPlacement(local, local.hand, command.row, command.col);
        if (!c.ok) return setMessage(REASON_TEXT[c.reason]);
      }
      setBusy(true);
      const r = await moveRanked(ranked.level, ranked.seq, command);
      setBusy(false);
      if (!r.ok) {
        if (r.data.view) setRanked(r.data.view);
        setMessage(r.data.reason ? "Lệnh không hợp lệ." : r.data.error === "conflict" ? "Ván vừa được cập nhật, đã tải lại." : "Không gửi được lệnh, thử lại nhé.");
        return;
      }
      setRanked(r.data.view);
      setLast(command.kind === "place" ? idx(local.width, command.row, command.col) : null);
      setMessage(describeEvents(r.data.events));
    },
    [ranked, busy],
  );

  const claim = useCallback(
    async (level: string, period: string) => {
      const r = await claimRanked(level, period);
      setClaimNote(r.ok ? `Đã nhận ${r.data.gold} vàng (hạng ${r.data.rank}/${r.data.winners}).` : "Không nhận được thưởng, thử lại sau nhé.");
      refreshOverview();
    },
    [refreshOverview],
  );

  const start = useCallback((rules: Ruleset) => {
    const s = createPuzzle(rules, freshSeed());
    writeStorage(SAVE_KEY, serializePuzzle(s));
    setState(s);
    setMessage("");
    setLast(null);
    setFocus(0);
  }, []);

  const leave = useCallback(() => {
    writeStorage(SAVE_KEY, null);
    setState(null);
    setMessage("");
  }, []);

  const apply = useCallback(
    (command: Parameters<typeof transition>[1]) => {
      if (!state) return;
      const t = transition(state, command);
      if (!t.ok) {
        const c = command.kind === "place" ? checkPlacement(state, state.hand, command.row, command.col) : null;
        setMessage(c && !c.ok ? REASON_TEXT[c.reason] : "Lệnh không hợp lệ.");
        return;
      }
      setState(t.state);
      setLast(command.kind === "place" ? idx(state.width, command.row, command.col) : null);
      setMessage(describeEvents(t.events));
      if (t.state.phase === "playing") writeStorage(SAVE_KEY, serializePuzzle(t.state));
      else {
        writeStorage(SAVE_KEY, null);
        if (t.state.phase === "won") {
          setBest((prev) => {
            const next = { ...prev, [t.state.rulesetId]: Math.max(prev[t.state.rulesetId] ?? 0, t.state.score) };
            writeStorage(BEST_KEY, JSON.stringify(next));
            return next;
          });
        }
      }
    },
    [state],
  );

  if (!ready) return <Shell><p className="py-20 text-center text-[var(--atlas-muted)]">Đang bày sa bàn…</p></Shell>;
  if (ranked) {
    const rules = rulesetById(ranked.level)!;
    return (
      <Shell>
        <Board
          state={toPuzzleState(ranked)}
          rules={rules}
          message={message}
          last={last}
          focus={focus}
          setFocus={setFocus}
          boardRef={boardRef}
          apply={(c) => void applyRanked(c)}
          onRestart={leaveRanked}
          onLeave={leaveRanked}
          best={0}
          ranked={{ period: ranked.period, rank: ranked.rank, busy, score: ranked.score }}
        />
      </Shell>
    );
  }
  if (!state)
    return (
      <Shell>
        {overview?.enabled && <RankedPanel overview={overview} busy={busy} note={claimNote || message} onPlay={(l) => void playRanked(l)} onClaim={(l, p) => void claim(l, p)} />}
        <LevelPicker best={best} onStart={start} ranked={overview?.enabled === true} />
      </Shell>
    );

  const rules = rulesetById(state.rulesetId)!;
  return (
    <Shell>
      <Board
        state={state}
        rules={rules}
        message={message}
        last={last}
        focus={focus}
        setFocus={setFocus}
        boardRef={boardRef}
        apply={apply}
        onRestart={() => start(rules)}
        onLeave={leave}
        best={best[rules.id] ?? 0}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="campaign-atlas demo-bg flex flex-1 flex-col bg-[#17110e] pb-10 text-[var(--atlas-ink-on-wood)]">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-4 pt-4 sm:px-6 lg:pt-6">{children}</div>
    </main>
  );
}

function Heading({ title, sub }: { title: string; sub: string }) {
  return (
    <header>
      <p className="text-xs font-semibold tracking-[0.25em] text-[var(--atlas-gold)] uppercase">{sub}</p>
      <h1 className="atlas-title font-serif text-3xl font-bold">{title}</h1>
    </header>
  );
}

function Rules() {
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-[15px] leading-snug text-[var(--atlas-ink-on-wood)]/90">
      <li>Mỗi lượt bạn cầm một quân tướng. Chạm ô trống để đặt; ô đó phải sát (trên, dưới, trái, phải) một quân đã có, trừ khi sa bàn đang trống.</li>
      <li>Quân mới phải <b>cùng nghề hoặc cùng hệ</b> với <b>từng</b> quân kề. Có thể cùng nghề với quân này và cùng hệ với quân kia.</li>
      <li>Hàng hoặc cột kín quân (từ 3 ô chơi được trở lên) thì được dọn sạch, nhưng ô vẫn giữ vệt <b>khai thông</b>. Khai thông hết mọi ô chơi được là thắng.</li>
      <li><b>Chướng ngại</b> (tảng đá) mọc ngẫu nhiên trên sa bàn: không đặt quân được, không cần khai thông và không nối được hai quân.</li>
      <li><b>Quân Lệnh</b> đặt ở ô trống bất kỳ và khớp mọi quân kề. <b>Thu Hồi</b> xóa một quân trên bàn.</li>
      <li><b>Bỏ Lệnh</b> đổi sang quân khác nhưng làm thanh nóng lên; bỏ khi thanh đã đầy là thua. Đặt quân thành công hạ thanh 1, dọn được hàng hoặc cột thì thanh về 0.</li>
    </ul>
  );
}

function LevelPicker({ best, onStart, ranked }: { best: Record<string, number>; onStart: (r: Ruleset) => void; ranked: boolean }) {
  return (
    <>
      <Heading title={ranked ? "Chơi thường" : "Trận Đồ"} sub={ranked ? "Không thưởng, không xếp hạng, chơi bao nhiêu ván tùy thích" : "Bày quân lệnh"} />
      <p className="max-w-2xl font-serif text-lg text-[var(--atlas-title)]">
        Bày quân tướng theo nghề và hệ để khai thông toàn bộ sa bàn.{ranked ? " Chơi thoải mái, bàn cờ ngẫu nhiên mỗi ván." : " Bản chơi thử: không thưởng, không xếp hạng."}
      </p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {RULESETS.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onStart(r)}
              className="home-mode atlas-frame atlas-frame-wood flex min-h-32 w-full flex-col items-start gap-1.5 p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--atlas-gold)]"
            >
              <span className="font-serif text-xl font-bold text-[var(--atlas-title)]">{r.name}</span>
              <span className="text-[15px] leading-snug text-[var(--atlas-ink-on-wood)]/90">{r.blurb}</span>
              <span className="mt-auto text-sm text-[var(--atlas-muted)]">
                {r.randomSize ? `cỡ ngẫu nhiên ${r.randomSize.min}–${r.randomSize.max}` : `${r.width}×${r.height}`} · {r.professions.length} nghề × {r.elements.length} hệ{r.obstaclePercent > 0 ? " · có chướng ngại" : ""}
                {best[r.id] ? ` · Điểm cao nhất ${best[r.id]}` : ""}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <section aria-labelledby="tran-do-rules" className="atlas-frame atlas-frame-wood p-4">
        <h2 id="tran-do-rules" className="mb-2 font-serif text-xl font-bold text-[var(--atlas-title)]">Luật chơi</h2>
        <Rules />
      </section>
      <SceneLink scene="MENU" className="home-secondary flex min-h-12 w-fit items-center rounded-lg px-6 font-serif font-semibold">Về màn chính</SceneLink>
    </>
  );
}

function Board({
  state,
  rules,
  message,
  last,
  focus,
  setFocus,
  boardRef,
  apply,
  onRestart,
  onLeave,
  best,
  ranked,
}: {
  state: PuzzleState;
  rules: Ruleset;
  message: string;
  last: number | null;
  focus: number;
  setFocus: (i: number) => void;
  boardRef: React.RefObject<HTMLDivElement | null>;
  apply: (c: Parameters<typeof transition>[1]) => void;
  onRestart: () => void;
  onLeave: () => void;
  best: number;
  /** Có khi đang chơi xếp hạng: không có Ván mới, kết quả chờ kỳ khép lại mới nhận thưởng. */
  ranked?: { period: string; rank: number | null; busy: boolean; score: number | null };
}) {
  const { width, height } = state;
  const playing = state.phase === "playing" && !ranked?.busy;
  const finished = state.phase !== "playing";
  const legal = useMemo(() => new Set(legalPlacements(state)), [state]);
  const total = useMemo(() => playableCount(state.cells), [state.cells]);

  const moveFocus = (to: number) => {
    setFocus(to);
    boardRef.current?.querySelectorAll<HTMLButtonElement>("button[data-cell]")[to]?.focus();
  };
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const r = Math.floor(i / width);
    const c = i % width;
    const next =
      e.key === "ArrowUp" ? idx(width, Math.max(0, r - 1), c)
      : e.key === "ArrowDown" ? idx(width, Math.min(height - 1, r + 1), c)
      : e.key === "ArrowLeft" ? idx(width, r, Math.max(0, c - 1))
      : e.key === "ArrowRight" ? idx(width, r, Math.min(width - 1, c + 1))
      : e.key === "Home" ? idx(width, r, 0)
      : e.key === "End" ? idx(width, r, width - 1)
      : null;
    if (next !== null) {
      e.preventDefault();
      moveFocus(next);
    }
  };

  // Cỡ ô: tối đa theo số cột, và co lại để cả hàng luôn vừa chiều ngang màn (trừ lề trang, khung và khoảng cách ô).
  const maxCell = width <= 3 ? 112 : width <= 5 ? 88 : width <= 7 ? 72 : 60;
  const cell = `min(${maxCell}px, calc((100vw - 3rem - ${(width - 1) * 4 + 20}px) / ${width}))`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Heading title={`Trận Đồ · ${rules.name}${ranked ? " · Xếp hạng" : ""}`} sub={ranked ? `Kỳ ${ranked.period} · Sa bàn ${width}×${height}` : `Sa bàn ${width}×${height}`} />
        <div className="flex gap-2">
          {ranked ? (
            <button type="button" onClick={onLeave} className="home-secondary min-h-11 rounded-lg px-4 font-serif font-semibold">Về danh sách</button>
          ) : (
            <>
              <button type="button" onClick={onRestart} className="home-secondary min-h-11 rounded-lg px-4 font-serif font-semibold">Ván mới</button>
              <button type="button" onClick={onLeave} className="home-secondary min-h-11 rounded-lg px-4 font-serif font-semibold">Đổi bậc</button>
            </>
          )}
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col items-center gap-3">
          <div
            ref={boardRef}
            role="grid"
            aria-label={`Sa bàn ${height} hàng ${width} cột`}
            className="atlas-frame atlas-frame-wood grid w-fit gap-1 p-2"
            style={{ gridTemplateColumns: `repeat(${width}, ${cell})`, gridAutoRows: cell }}
          >
            {state.cells.map((c, i) => {
              const r = Math.floor(i / width);
              const col = i % width;
              const ok = playing && legal.has(i);
              return (
                <div role="gridcell" key={i} className="contents">
                  <button
                    type="button"
                    data-cell
                    tabIndex={i === focus ? 0 : -1}
                    disabled={!playing}
                    onFocus={() => setFocus(i)}
                    onKeyDown={(e) => onKeyDown(e, i)}
                    onClick={() => apply({ kind: "place", row: r, col })}
                    aria-disabled={c.blocked || undefined}
                    aria-label={`Hàng ${r + 1}, cột ${col + 1}: ${c.blocked ? "chướng ngại, không đặt được" : c.piece ? pieceLabel(c.piece) : c.covered ? "trống, đã khai thông" : "trống, chưa khai thông"}${ok ? ", đặt được" : ""}`}
                    className={[
                      "relative flex items-center justify-center rounded-md border transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--atlas-gold)]",
                      c.blocked ? "border-[#1b130d] bg-[repeating-linear-gradient(45deg,#3a3026_0_6px,#2a2119_6px_12px)]" : c.covered ? "border-[#8F6A32] bg-[#E4CC99]" : "border-[#3D2C1D] bg-[#2B1F15]",
                      ok ? "ring-2 ring-[#C9A25A]/90 ring-inset" : "",
                      last === i ? "outline-2 outline-[#8F241D]" : "",
                    ].join(" ")}
                  >
                    {c.blocked ? <Rock /> : c.piece ? <PieceFace piece={c.piece} /> : ok ? <span aria-hidden className="size-2 rounded-full bg-[#C9A25A]" /> : null}
                  </button>
                </div>
              );
            })}
          </div>
          <p role="status" aria-live="polite" className="min-h-6 text-center text-[15px] text-[var(--atlas-title)]">{message}</p>
        </div>

        <aside className="flex flex-col gap-4" aria-label="Bảng điều khiển">
          {!finished ? <Hand state={state} rules={rules} apply={apply} noMove={legal.size === 0} disabled={ranked?.busy === true} /> : ranked ? <RankedResult state={state} rank={ranked.rank} score={ranked.score} period={ranked.period} onLeave={onLeave} /> : <Result state={state} best={best} onRestart={onRestart} onLeave={onLeave} />}
          <dl className="atlas-frame atlas-frame-wood grid grid-cols-2 gap-x-3 gap-y-1 p-4 text-[15px]">
            <dt className="text-[var(--atlas-muted)]">Khai thông</dt>
            <dd className="text-right font-semibold">{state.coveredCount}/{total}</dd>
            <dt className="text-[var(--atlas-muted)]">Điểm</dt>
            <dd className="text-right font-semibold">{state.score}</dd>
            <dt className="text-[var(--atlas-muted)]">Quân đã đặt</dt>
            <dd className="text-right font-semibold">{state.placed}</dd>
            <dt className="text-[var(--atlas-muted)]">Hàng/cột đã dọn</dt>
            <dd className="text-right font-semibold">{state.linesCleared}</dd>
            {best > 0 && (<><dt className="text-[var(--atlas-muted)]">Điểm cao nhất</dt><dd className="text-right font-semibold">{best}</dd></>)}
          </dl>
          <details className="atlas-frame atlas-frame-wood p-4">
            <summary className="cursor-pointer font-serif font-bold text-[var(--atlas-title)]">Luật chơi</summary>
            <div className="mt-2"><Rules /></div>
          </details>
        </aside>
      </div>
    </>
  );
}

function Hand({ state, rules, apply, noMove, disabled = false }: { state: PuzzleState; rules: Ruleset; apply: (c: Parameters<typeof transition>[1]) => void; noMove: boolean; disabled?: boolean }) {
  const h = state.hand;
  const full = state.discardHeat >= rules.maxHeat;
  return (
    <section aria-label="Quân đang cầm" className="atlas-frame atlas-frame-wood flex flex-col gap-3 p-4">
      <h2 className="font-serif text-xl font-bold text-[var(--atlas-title)]">Quân đang cầm</h2>
      <div className="flex items-center gap-3">
        <div className="size-24 shrink-0 rounded-lg border border-[#8F6A32] bg-[#E4CC99] p-1"><PieceFace piece={h} large /></div>
        <div className="text-[15px] leading-snug">
          {h.kind === "normal" ? (
            <>
              <p className="font-serif text-lg font-bold">{nameOf(h.characterId)}</p>
              <p className="flex items-center gap-1"><ProfessionIcon profession={h.profession} className="size-5" /> {PROFESSION_NAME[h.profession]}</p>
              <p className="flex items-center gap-1"><ElementIcon element={h.element} className="size-5" /> Hệ {ELEMENT_NAME[h.element]}</p>
            </>
          ) : h.kind === "fusion" ? (
            <>
              <p className="font-serif text-lg font-bold">{nameOf(h.characterId)}</p>
              <p>Dung hợp mọi nghề và mọi hệ: khớp mọi quân kề.</p>
              <p className="text-sm text-[var(--atlas-muted)]">Vẫn phải đặt sát một quân.</p>
            </>
          ) : h.kind === "wild" ? (
            <><p className="font-serif text-lg font-bold">Quân Lệnh</p><p>Đặt ở ô trống bất kỳ; khớp mọi quân kề.</p></>
          ) : (
            <><p className="font-serif text-lg font-bold">Thu Hồi</p><p>Chạm vào một quân trên bàn để xóa; ô vẫn giữ vệt khai thông.</p></>
          )}
        </div>
      </div>
      <div>
        <p className="mb-1 flex items-center justify-between text-sm">
          <span>Bỏ Lệnh</span>
          <span aria-live="polite" className={full ? "font-semibold text-rose-300" : "text-[var(--atlas-muted)]"}>{state.discardHeat}/{rules.maxHeat}{full ? " · bỏ nữa là thua" : ""}</span>
        </p>
        <div role="meter" aria-label="Thanh Bỏ Lệnh" aria-valuemin={0} aria-valuemax={rules.maxHeat} aria-valuenow={state.discardHeat} className="flex gap-1">
          {Array.from({ length: rules.maxHeat }, (_, i) => (
            <span key={i} className={`h-2.5 flex-1 rounded-full ${i < state.discardHeat ? (full ? "bg-rose-500" : "bg-amber-500") : "bg-[#3D2C1D]"}`} />
          ))}
        </div>
      </div>
      <button type="button" disabled={disabled} onClick={() => apply({ kind: "discard" })} className="home-secondary min-h-12 rounded-lg px-4 font-serif font-semibold disabled:opacity-60">
        Bỏ Lệnh{noMove ? " (hết nước đặt)" : ""}
      </button>
    </section>
  );
}

function RankedResult({ state, rank, score, period, onLeave }: { state: PuzzleState; rank: number | null; score: number | null; period: string; onLeave: () => void }) {
  const won = state.phase === "won";
  return (
    <section role="status" aria-label="Kết quả xếp hạng" className="atlas-frame atlas-frame-wood flex flex-col gap-3 p-4">
      <h2 className="font-serif text-2xl font-bold text-[var(--atlas-title)]">{won ? "Khai thông sa bàn!" : "Trận đồ vỡ"}</h2>
      {won ? (
        <p className="text-[15px]">
          Bạn đạt <b>{score ?? state.score} điểm</b>{rank ? `, hạng tạm thời ${rank}` : ""}. Hạng chốt và thưởng nhận được sau khi kỳ {period} khép lại.
        </p>
      ) : (
        <p className="text-[15px]">Ván thua không vào bảng xếp hạng và không có thưởng. Mỗi kỳ chỉ có một ván tính hạng; hãy thử lại ở kỳ sau, hoặc luyện ở mục Chơi thường.</p>
      )}
      <button type="button" onClick={onLeave} className="home-cta min-h-12 w-fit rounded-lg px-6 font-serif font-bold">Về danh sách</button>
    </section>
  );
}

function Result({ state, best, onRestart, onLeave }: { state: PuzzleState; best: number; onRestart: () => void; onLeave: () => void }) {
  const won = state.phase === "won";
  return (
    <section role="status" aria-label="Kết quả" className="atlas-frame atlas-frame-wood flex flex-col gap-3 p-4">
      <h2 className="font-serif text-2xl font-bold text-[var(--atlas-title)]">{won ? "Khai thông sa bàn!" : "Trận đồ vỡ"}</h2>
      <p className="text-[15px]">
        {won ? `Bạn đạt ${state.score} điểm${state.score >= best ? " (cao nhất từ trước tới nay)" : ""}.` : "Bỏ lệnh quá nhiều lần liên tiếp. Thử lại với seed mới nhé."}
      </p>
      <p className="text-sm text-[var(--atlas-muted)]">Chế độ chơi thường: không có thưởng và không lên bảng xếp hạng.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onRestart} className="home-cta min-h-12 rounded-lg px-6 font-serif font-bold">Chơi lại</button>
        <button type="button" onClick={onLeave} className="home-secondary min-h-12 rounded-lg px-4 font-serif font-semibold">Đổi bậc</button>
        <SceneLink scene="MENU" className="home-secondary flex min-h-12 items-center rounded-lg px-4 font-serif font-semibold">Về màn chính</SceneLink>
      </div>
    </section>
  );
}

/** Mặt quân: chân dung ở giữa, nghề ở góc trên trái, hệ ở góc dưới phải (kèm chữ cho trình đọc màn hình ở aria-label của ô). */
function PieceFace({ piece, large = false }: { piece: Piece | BoardPiece; large?: boolean }) {
  if (piece.kind === "wild") return <Glyph kind="wild" />;
  if (piece.kind === "eraser") return <Glyph kind="eraser" />;
  const icon = large ? "size-6" : "size-[32%]";
  if (piece.kind === "fusion") {
    // Dung hợp: số 8 (nghề) ở góc trên-trái, số 7 (hệ) ở góc dưới-phải thay cho biểu tượng đơn lẻ.
    const badge = large ? "min-w-6 text-[13px]" : "min-w-[32%] text-[10px]";
    return (
      <span className="relative block size-full">
        <Portrait id={piece.characterId} element="kim" profession="tuongSi" className="size-full" />
        <span className={`absolute top-0 left-0 rounded-full bg-[#2B1F15]/85 p-[2px] text-center font-bold leading-none text-[#E4CC99] ${badge}`}>8</span>
        <span className={`absolute right-0 bottom-0 rounded-full bg-[#2B1F15]/85 p-[2px] text-center font-bold leading-none text-[#E4CC99] ${badge}`}>7</span>
      </span>
    );
  }
  return (
    <span className="relative block size-full">
      <Portrait id={piece.characterId} element={piece.element} profession={piece.profession} className="size-full" />
      <span className="absolute top-0 left-0 rounded-full bg-[#2B1F15]/85 p-[2px] text-[#E4CC99]"><ProfessionIcon profession={piece.profession} className={icon} /></span>
      <span className="absolute right-0 bottom-0 rounded-full p-[2px]" style={{ background: ELEMENT_COLOR[piece.element] }}><ElementIcon element={piece.element} className={icon} /></span>
    </span>
  );
}

/** Chướng ngại: tảng đá xám, không phải ô để chơi. */
function Rock() {
  return (
    <svg viewBox="0 0 48 48" className="size-full p-1.5" aria-hidden focusable="false">
      <path d="M8 36 L14 18 L24 10 L35 16 L41 34 L32 40 L16 40 Z" fill="#6b6256" stroke="#14100c" strokeWidth={2} strokeLinejoin="round" />
      <path d="M14 18 L24 26 L35 16 M24 26 L24 40" fill="none" stroke="#14100c" strokeWidth={1.4} opacity={0.6} />
    </svg>
  );
}

function Glyph({ kind }: { kind: "wild" | "eraser" }) {
  return (
    <svg viewBox="0 0 48 48" className="size-full p-1" aria-hidden focusable="false" fill="none" stroke="#8F241D" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      {kind === "wild" ? (
        <>
          <circle cx={24} cy={24} r={16} fill="#C9A25A" stroke="#2B1F15" />
          <circle cx={24} cy={24} r={10} stroke="#2B1F15" />
          <path d="M24 12 V36 M12 24 H36" />
        </>
      ) : (
        <>
          <path d="M14 30 L28 12 L38 20 L26 36 H16 Z" fill="#E4CC99" stroke="#2B1F15" />
          <path d="M20 30 L32 16" />
          <path d="M10 40 H38" stroke="#2B1F15" />
        </>
      )}
    </svg>
  );
}
