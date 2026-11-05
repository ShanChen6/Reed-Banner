"use client";

// Trận Đồ (Binh Pháp): bày quân lệnh theo nghề hoặc hệ để khai thông toàn bộ sa bàn, mỗi ô khai thông lộ một mảnh bản đồ.
// Chơi thường chạy offline (không thưởng, không xếp hạng, ván dở lưu ở trình duyệt); xếp hạng chạy trên server (ván nằm ở
// server, client chỉ giữ bản công khai). Luật ở src/core/binh-phap, spec ở docs/02-game-modes/future/02-binh-phap-gdd.md,
// giao diện ở docs/05-ui-ux/screens/tran-do.md.

import { ModeScreen as GameModeScreen } from "@/components/game-ui";
import { buttonVariants } from "@/components/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CUSTOM_RULESET_ID,
  checkPlacement,
  createPuzzle,
  idx,
  legalPlacements,
  parsePuzzle,
  playableCount,
  RULESETS,
  rulesetById,
  serializePuzzle,
  themeOfState,
  transition,
  type PlacementCheck,
  type PuzzleEvent,
  type PuzzleState,
  type Ruleset,
} from "@/core/binh-phap";
import { useAudio } from "../audio/AudioProvider";
import BoardView, { type Sweep } from "./BoardView";
import { CommandCard, HeatFlames, HintToggle, MobileBar, ProgressMeter, TutorialTip, tutorialText } from "./Hud";
import { mapFor, type FormationMap } from "./maps";
import ModeScreen from "./ModeScreen";
import { preloadPortraits } from "./preload";
import { cuesForEvents, FORMATION_PRELOAD, isPerfectPlacement, musicFor, REJECT, tensionLayer } from "./sounds";
import { obstacleKind, obstacleLabel } from "./pieces";
import { claimRanked, fetchOverview, moveRanked, startRanked, toPuzzleState, type FormationView, type Overview } from "./rankedClient";
import Rules from "./Rules";
import {
  BEST_KEY,
  SAVE_KEY,
  addToCollection,
  markTutorialDone,
  readBest,
  readCollection,
  readHints,
  readStorage,
  tutorialDone,
  writeHints,
  writeStorage,
} from "./storage";

const freshSeed = () => (Math.random() * 0x100000000) >>> 0;

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

let sweepId = 0;
const sweepsOf = (events: readonly PuzzleEvent[]): Sweep[] =>
  events.flatMap((e) => (e.type === "lineCleared" ? [{ id: ++sweepId, axis: e.axis, index: e.index }] : []));

export default function FormationScreen() {
  const [state, setState] = useState<PuzzleState | null>(null);
  const [ready, setReady] = useState(false);
  const [best, setBest] = useState<Record<string, number>>({});
  const [collection, setCollection] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [last, setLast] = useState<number | null>(null);
  const [focus, setFocus] = useState(0);
  const [peek, setPeek] = useState<number | null>(null);
  const [sweeps, setSweeps] = useState<Sweep[]>([]);
  const [hintPref, setHintPref] = useState<boolean | null>(null);
  const [tipDone, setTipDone] = useState(true);
  const boardRef = useRef<HTMLDivElement>(null);
  // Chế độ xếp hạng: ván nằm ở server, client chỉ giữ bản công khai.
  const [ranked, setRanked] = useState<FormationView | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [busy, setBusy] = useState(false);
  const [claimNote, setClaimNote] = useState("");
  const audio = useAudio();

  // Nạp ván dở và lựa chọn đã lưu sau khi hiển thị lần đầu: server không có localStorage nên tránh lệch hydration.
  useEffect(() => {
    const saved = parsePuzzle(readStorage(SAVE_KEY));
    /* eslint-disable react-hooks/set-state-in-effect -- đọc kho trình duyệt chỉ có ở client */
    if (saved && saved.phase === "playing") setState(saved);
    setBest(readBest());
    setCollection(readCollection());
    setHintPref(readHints());
    setTipDone(tutorialDone());
    /* eslint-enable react-hooks/set-state-in-effect */
    setReady(true);
    void fetchOverview().then(setOverview);
  }, []);

  // Vệt sáng dọn hàng tự tắt sau khi chạy xong.
  useEffect(() => {
    if (sweeps.length === 0) return;
    const t = window.setTimeout(() => setSweeps([]), 800);
    return () => window.clearTimeout(t);
  }, [sweeps]);

  const refreshOverview = useCallback(() => void fetchOverview().then(setOverview), []);

  const collect = useCallback((id: string) => setCollection(addToCollection(id)), []);

  const start = useCallback((rules: Ruleset) => {
    const s = createPuzzle(rules, freshSeed());
    writeStorage(SAVE_KEY, serializePuzzle(s));
    setState(s);
    setMessage("");
    setLast(null);
    setFocus(0);
    setSweeps([]);
  }, []);

  const leave = useCallback(() => {
    writeStorage(SAVE_KEY, null);
    setState(null);
    setMessage("");
    setSweeps([]);
  }, []);

  const apply = useCallback(
    (command: Parameters<typeof transition>[1]) => {
      if (!state) return;
      const t = transition(state, command);
      if (!t.ok) {
        const c = command.kind === "place" ? checkPlacement(state, state.hand, command.row, command.col) : null;
        setMessage(c && !c.ok ? REASON_TEXT[c.reason] : "Lệnh không hợp lệ.");
        audio.play(REJECT.id);
        return;
      }
      for (const c of cuesForEvents(t.events, state.discardHeat)) audio.play(c.id, { rate: c.rate });
      if (command.kind === "place" && isPerfectPlacement(state, command.row, command.col)) audio.play("formation.match");
      setState(t.state);
      setLast(command.kind === "place" ? idx(state.width, command.row, command.col) : null);
      setSweeps(sweepsOf(t.events));
      setMessage(describeEvents(t.events));
      if (t.state.phase === "playing") writeStorage(SAVE_KEY, serializePuzzle(t.state));
      else {
        writeStorage(SAVE_KEY, null);
        if (t.state.phase === "won") {
          const rules = t.state.custom ?? rulesetById(t.state.rulesetId);
          if (rules) collect(mapFor(rules.id, themeOfState(t.state)).id);
          if (t.state.rulesetId !== CUSTOM_RULESET_ID) {
            setBest((prev) => {
              const next = { ...prev, [t.state.rulesetId]: Math.max(prev[t.state.rulesetId] ?? 0, t.state.score) };
              writeStorage(BEST_KEY, JSON.stringify(next));
              return next;
            });
          }
        }
      }
    },
    [state, collect, audio],
  );

  const playRanked = useCallback(
    async (level: string) => {
      if (busy) return;
      setBusy(true);
      setMessage("");
      const r = await startRanked(level);
      setBusy(false);
      if (!r.ok) {
        setClaimNote(r.status === 403 ? "Chế độ xếp hạng chưa mở." : r.status === 401 ? "Cần đăng nhập để chơi xếp hạng." : "Không mở được ván xếp hạng, thử lại nhé.");
        return;
      }
      setClaimNote("");
      setRanked(r.data.view);
      setLast(null);
      setFocus(0);
      setSweeps([]);
    },
    [busy],
  );

  const leaveRanked = useCallback(() => {
    setRanked(null);
    setMessage("");
    setSweeps([]);
    refreshOverview();
  }, [refreshOverview]);

  const applyRanked = useCallback(
    async (command: Parameters<typeof transition>[1]) => {
      if (!ranked || busy || ranked.status !== "playing") return;
      const local = toPuzzleState(ranked);
      // Báo lỗi luật ngay trên máy cho đỡ tốn một lượt gọi server; server vẫn kiểm lại mọi lệnh.
      if (command.kind === "place") {
        const c = checkPlacement(local, local.hand, command.row, command.col);
        if (!c.ok) {
          audio.play(REJECT.id);
          return setMessage(REASON_TEXT[c.reason]);
        }
      }
      setBusy(true);
      const r = await moveRanked(ranked.level, ranked.seq, command);
      setBusy(false);
      if (!r.ok) {
        if (r.data.view) setRanked(r.data.view);
        setMessage(r.data.reason ? "Lệnh không hợp lệ." : r.data.error === "conflict" ? "Ván vừa được cập nhật, đã tải lại." : "Không gửi được lệnh, thử lại nhé.");
        return;
      }
      for (const c of cuesForEvents(r.data.events, local.discardHeat)) audio.play(c.id, { rate: c.rate });
      if (command.kind === "place" && isPerfectPlacement(local, command.row, command.col)) audio.play("formation.match");
      setRanked(r.data.view);
      setLast(command.kind === "place" ? idx(local.width, command.row, command.col) : null);
      setSweeps(sweepsOf(r.data.events));
      setMessage(describeEvents(r.data.events));
      if (r.data.view.status === "won") collect(mapFor(r.data.view.level, r.data.view.puzzle.theme).id);
    },
    [ranked, busy, collect, audio],
  );

  const claim = useCallback(
    async (level: string, period: string) => {
      const r = await claimRanked(level, period);
      if (r.ok) audio.play("formation.rank");
      setClaimNote(r.ok ? `Đã nhận ${r.data.gold} vàng (hạng ${r.data.rank}/${r.data.winners}).` : "Không nhận được thưởng, thử lại sau nhé.");
      refreshOverview();
    },
    [refreshOverview, audio],
  );

  // Ván đang chơi: ván xếp hạng (bản công khai từ server) hoặc ván chơi thường (ở máy).
  const playState: PuzzleState | null = ranked ? toPuzzleState(ranked) : state;
  const playRules: Ruleset | null = ranked ? (rulesetById(ranked.level) ?? null) : state ? (state.custom ?? rulesetById(state.rulesetId) ?? null) : null;
  // Tải sẵn chân dung để quân hiện đủ gương mặt ngay, không trễ 1–2 giây: ngay khi vào màn chọn bậc (mọi bậc, Thường trước), và bộ luật đang chơi.
  useEffect(() => {
    [...RULESETS].sort((x, y) => Number(y.id === "thuong") - Number(x.id === "thuong")).forEach((r) => preloadPortraits(r));
  }, []);
  useEffect(() => {
    if (playRules) preloadPortraits(playRules);
  }, [playRules]);
  // Âm thanh: tải sẵn cue, nhạc theo màn (chọn bậc, đang chơi, kết quả), lớp căng thẳng theo thanh Bỏ Lệnh; rời Trận Đồ thì tắt nhạc.
  const { preload, playMusic, stopMusic, setLayer } = audio;
  useEffect(() => preload(FORMATION_PRELOAD), [preload]);
  const music = ready ? musicFor(playState) : null;
  useEffect(() => {
    if (music) playMusic(music);
  }, [music, playMusic]);
  useEffect(() => () => stopMusic(600), [stopMusic]);
  const heatLayer = playState && playRules && playState.phase === "playing" ? tensionLayer(playState.discardHeat, playRules.maxHeat) : 0;
  useEffect(() => setLayer(heatLayer), [heatLayer, setLayer]);
  const theme = ranked ? ranked.puzzle.theme : state ? themeOfState(state) : 0;
  const rankedBusy = ranked ? busy : false;

  const onCommand = useCallback(
    (c: Parameters<typeof transition>[1]) => {
      if (ranked) void applyRanked(c);
      else apply(c);
    },
    [ranked, applyRanked, apply],
  );

  if (!ready) return <Shell><p className="py-20 text-center text-on-wood-soft">Đang bày sa bàn…</p></Shell>;

  if (!playState || !playRules)
    return (
      <Shell>
        <ModeScreen
          overview={overview}
          best={best}
          busy={busy}
          note={claimNote || message}
          collection={collection}
          onPlayRanked={(l) => void playRanked(l)}
          onClaim={(l, p) => void claim(l, p)}
          onStart={start}
          onExpire={refreshOverview}
        />
      </Shell>
    );

  const hintsOn = hintPref ?? playRules.id === "huong-dan";
  return (
    <Shell>
      <PlayView
        state={playState}
        rules={playRules}
        theme={theme}
        message={message}
        last={last}
        focus={focus}
        setFocus={setFocus}
        peek={peek}
        setPeek={setPeek}
        boardRef={boardRef}
        sweeps={sweeps}
        hintsOn={hintsOn}
        onToggleHints={() => {
          writeHints(!hintsOn);
          setHintPref(!hintsOn);
        }}
        tipVisible={!tipDone && playRules.id === "huong-dan" && !ranked}
        onDismissTip={() => {
          markTutorialDone();
          setTipDone(true);
        }}
        onCommand={onCommand}
        busy={rankedBusy}
        onRestart={() => (ranked ? leaveRanked() : start(playRules))}
        onLeave={ranked ? leaveRanked : leave}
        best={best[playRules.id] ?? 0}
        ranked={ranked ? { period: ranked.period, rank: ranked.rank, score: ranked.score } : undefined}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <GameModeScreen label="Trận Đồ" className="campaign-atlas pb-10">
      {children}
    </GameModeScreen>
  );
}

function PlayView({
  state,
  rules,
  theme,
  message,
  last,
  focus,
  setFocus,
  peek,
  setPeek,
  boardRef,
  sweeps,
  hintsOn,
  onToggleHints,
  tipVisible,
  onDismissTip,
  onCommand,
  busy,
  onRestart,
  onLeave,
  best,
  ranked,
}: {
  state: PuzzleState;
  rules: Ruleset;
  theme: number;
  message: string;
  last: number | null;
  focus: number;
  setFocus: (i: number) => void;
  peek: number | null;
  setPeek: (i: number | null) => void;
  boardRef: React.RefObject<HTMLDivElement | null>;
  sweeps: readonly Sweep[];
  hintsOn: boolean;
  onToggleHints: () => void;
  tipVisible: boolean;
  onDismissTip: () => void;
  onCommand: (c: Parameters<typeof transition>[1]) => void;
  busy: boolean;
  onRestart: () => void;
  onLeave: () => void;
  best: number;
  /** Có khi đang chơi xếp hạng: không có Ván mới, kết quả chờ kỳ khép lại mới nhận thưởng. */
  ranked?: { period: string; rank: number | null; score: number | null };
}) {
  const { width, height } = state;
  const finished = state.phase !== "playing";
  const playing = !finished && !busy;
  const legal = useMemo(() => new Set(legalPlacements(state)), [state]);
  const total = useMemo(() => playableCount(state.cells), [state.cells]);
  const map = mapFor(rules.id, theme);
  const noMove = legal.size === 0;
  const tip = tipVisible ? tutorialText(state, noMove) : null;

  // Lý do ô đang rê chuột hoặc có tiêu điểm đặt được hay không (không đọc lên cho trình đọc màn hình: nhãn ô đã có).
  const peekText = (() => {
    if (peek === null || !playing) return "";
    const r = Math.floor(peek / width);
    const c = peek % width;
    const check = checkPlacement(state, state.hand, r, c);
    if (check.ok) return `Hàng ${r + 1}, cột ${c + 1}: đặt được.`;
    if (check.reason === "blocked") return `Hàng ${r + 1}, cột ${c + 1}: ${obstacleLabel(obstacleKind(peek))}, không đặt được quân.`;
    return `Hàng ${r + 1}, cột ${c + 1}: ${REASON_TEXT[check.reason]}`;
  })();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <header>
          <p className="text-xs font-semibold tracking-[0.25em] text-frame-gold uppercase">
            {ranked ? `Kỳ ${ranked.period} · ` : ""}Sa bàn {width}×{height}
          </p>
          <h1 className="ui-title-on-wood font-serif text-3xl font-bold">Trận Đồ · {rules.name}{ranked ? " · Xếp hạng" : ""}</h1>
        </header>
        <div className="flex gap-2">
          {ranked ? (
            <button type="button" onClick={onLeave} className={buttonVariants({ variant: "secondary", className: "min-h-11 px-4" })}>Về danh sách</button>
          ) : (
            <>
              <button type="button" onClick={onRestart} className={buttonVariants({ variant: "secondary", className: "min-h-11 px-4" })}>Ván mới</button>
              <button type="button" onClick={onLeave} className={buttonVariants({ variant: "secondary", className: "min-h-11 px-4" })}>Đổi bậc</button>
            </>
          )}
        </div>
      </div>

      <div className={`grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] ${finished ? "" : "pb-28 lg:pb-0"}`}>
        <div className="flex flex-col items-center gap-3">
          <BoardView state={state} map={map} legal={legal} showHints={hintsOn} playing={playing} last={last} focus={focus} setFocus={setFocus} setPeek={setPeek} boardRef={boardRef} sweeps={sweeps} onPlace={(row, col) => onCommand({ kind: "place", row, col })} />
          <p role="status" aria-live="polite" className="min-h-6 text-center text-[15px] text-title-on-wood">{message}</p>
          <p aria-hidden className="-mt-2 min-h-5 text-center text-sm text-on-wood-soft">{peekText}</p>
          {tip && <div className="w-full max-w-xl"><TutorialTip text={tip} onDismiss={onDismissTip} /></div>}
          {!finished && <HintToggle on={hintsOn} onToggle={onToggleHints} />}
        </div>

        <aside className="flex flex-col gap-4" aria-label="Bảng điều khiển">
          {finished ? (
            ranked ? <RankedResult state={state} rank={ranked.rank} score={ranked.score} period={ranked.period} map={map} onLeave={onLeave} /> : <Result state={state} best={best} map={map} custom={rules.id === CUSTOM_RULESET_ID} onRestart={onRestart} onLeave={onLeave} />
          ) : (
            <div className="hidden flex-col gap-4 lg:flex">
              <CommandCard state={state} />
              <div className="ui-frame flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-on-wood-soft">Bỏ Lệnh {state.discardHeat}/{rules.maxHeat}{state.discardHeat >= rules.maxHeat ? " · bỏ nữa là thua" : ""}</p>
                    <HeatFlames heat={state.discardHeat} max={rules.maxHeat} />
                  </div>
                  <button type="button" disabled={busy} onClick={() => onCommand({ kind: "discard" })} className={buttonVariants({ variant: "secondary", className: "min-h-12 px-4" })}>
                    Bỏ Lệnh{noMove ? " (hết nước đặt)" : ""}
                  </button>
                </div>
                <ProgressMeter covered={state.coveredCount} total={total} />
              </div>
            </div>
          )}
          {finished && <div className="ui-frame p-4"><ProgressMeter covered={state.coveredCount} total={total} /></div>}
          <details className="ui-frame p-4">
            <summary className="cursor-pointer font-serif font-bold text-title-on-wood">Thống kê ván</summary>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[15px]">
              <dt className="text-on-wood-soft">Điểm</dt>
              <dd className="text-right font-semibold">{state.score}</dd>
              <dt className="text-on-wood-soft">Quân đã đặt</dt>
              <dd className="text-right font-semibold">{state.placed}</dd>
              <dt className="text-on-wood-soft">Hàng/cột đã dọn</dt>
              <dd className="text-right font-semibold">{state.linesCleared}</dd>
              {best > 0 && !ranked && (<><dt className="text-on-wood-soft">Điểm cao nhất</dt><dd className="text-right font-semibold">{best}</dd></>)}
            </dl>
          </details>
          <details className="ui-frame p-4">
            <summary className="cursor-pointer font-serif font-bold text-title-on-wood">Luật chơi</summary>
            <div className="mt-2"><Rules /></div>
          </details>
        </aside>
      </div>

      {!finished && (
        <MobileBar state={state} rules={rules} noMove={noMove} disabled={busy} covered={state.coveredCount} total={total} onDiscard={() => onCommand({ kind: "discard" })} />
      )}
    </>
  );
}

/** Bản đồ đầy đủ của màn vừa hoàn thành, kèm địa danh. Ảnh tái dựng/minh họa, không phải tư liệu địa lý. */
function CompletedMap({ map }: { map: FormationMap }) {
  return (
    <figure className="m-0 flex flex-col gap-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh bản đồ tĩnh, kích thước theo khung */}
      <img src={map.src} alt={`Bản đồ hoàn chỉnh: ${map.place}`} className="aspect-[16/10] w-full rounded border border-frame-bronze object-cover" />
      <figcaption className="text-sm leading-snug">
        <b className="font-serif text-base text-title-on-wood">{map.place}</b>
        <span className="block text-on-wood-soft">{map.blurb}</span>
        <span className="block text-xs text-on-wood-soft">
          {map.kind === "lich-su" ? "Tranh minh họa tái dựng, không phải bản đồ lịch sử chính xác." : "Cảnh quan minh họa, không phải địa danh cụ thể."}
        </span>
      </figcaption>
    </figure>
  );
}

function RankedResult({ state, rank, score, period, map, onLeave }: { state: PuzzleState; rank: number | null; score: number | null; period: string; map: FormationMap; onLeave: () => void }) {
  const won = state.phase === "won";
  return (
    <section role="status" aria-label="Kết quả xếp hạng" className="ui-frame flex flex-col gap-3 p-4">
      <h2 className="font-serif text-2xl font-bold text-title-on-wood">{won ? "Khai thông sa bàn!" : "Trận đồ vỡ"}</h2>
      {won ? (
        <p className="text-[15px]">
          Bạn đạt <b>{score ?? state.score} điểm</b>{rank ? `, hạng tạm thời ${rank}` : ""}. Hạng chốt và thưởng nhận được sau khi kỳ {period} khép lại.
        </p>
      ) : (
        <p className="text-[15px]">Ván thua không vào bảng xếp hạng và không có thưởng. Mỗi kỳ chỉ có một ván tính hạng; hãy thử lại ở kỳ sau, hoặc luyện ở mục Chơi thường.</p>
      )}
      {won && <CompletedMap map={map} />}
      <button type="button" onClick={onLeave} className={buttonVariants({ className: "min-h-12 w-fit px-6" })}>Về danh sách</button>
    </section>
  );
}

function Result({ state, best, map, custom, onRestart, onLeave }: { state: PuzzleState; best: number; map: FormationMap; custom: boolean; onRestart: () => void; onLeave: () => void }) {
  const won = state.phase === "won";
  return (
    <section role="status" aria-label="Kết quả" className="ui-frame flex flex-col gap-3 p-4">
      <h2 className="font-serif text-2xl font-bold text-title-on-wood">{won ? "Khai thông sa bàn!" : "Trận đồ vỡ"}</h2>
      <p className="text-[15px]">
        {won ? `Bạn đạt ${state.score} điểm${!custom && state.score >= best ? " (cao nhất từ trước tới nay)" : ""}.` : "Bỏ lệnh quá nhiều lần liên tiếp. Thử lại với seed mới nhé."}
      </p>
      <p className="text-sm text-on-wood-soft">Chế độ chơi thường: không có thưởng và không lên bảng xếp hạng.</p>
      {won && <CompletedMap map={map} />}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onRestart} className={buttonVariants({ className: "min-h-12 px-6" })}>Chơi lại</button>
        <button type="button" onClick={onLeave} className={buttonVariants({ variant: "secondary", className: "min-h-12 px-4" })}>Đổi bậc</button>
      </div>
    </section>
  );
}
