"use client";

// Tam Quân Kỳ: cờ tư lệnh trên sa bàn tập trận của Đinh Bộ Lĩnh. Luật chép nguyên từ Cờ Việt Nam của Shanverse
// (src/core/tam-quan-ky), chỉ tên quân và hình là cổ trang (pieces.ts). Đấu máy (một trong 12 sứ quân) hoặc hai người cùng máy.
// Ván dở lưu ở trình duyệt. Ván có thưởng và ván online do server làm trọng tài nằm ở ServerPlay.tsx. Tranh quân, sa bàn và thẻ do Shan vẽ (23/11/2026).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MAIN_ID } from "@/core";
import { BLUE, RED, endGame, inCheck, legalMovesFrom, play, type Color, type Level, type Move, type Position } from "@/core/tam-quan-ky";
import { Button } from "@/components/ui";
import { BottomSheet, ModeBanner, ModeScreen, OrnateFrame, ResultModal, SurrenderButton } from "@/components/game-ui";
import { PHONE_QUERY, useMediaQuery } from "@/lib/useMediaQuery";
import { Portrait } from "../art/portraits";
import { readStorage, writeStorage } from "../formation/storage";
import { ModeGuideTabs } from "../ModeGuide";
import { MODE_TEXT } from "../modeInfo";
import { PlayCard } from "../PlayCard";
import { lineAfterMove, type LineKind } from "./lines";
import { KIND_NAME } from "./pieces";
import {
  BO_LINH,
  Board,
  LEVEL_NAME,
  LEVELS,
  MAPS,
  MoveList,
  Options,
  RIVALS,
  RivalPicker,
  SelectedPanel,
  Speech,
  formatClock,
  freshSeed,
  mapById,
  moveText,
  pieceLabel,
  positionsFor,
  rivalById,
} from "./parts";
import { ServerPlay } from "./ServerPlay";
import { useTqkEngine } from "./useEngine";
import { savedServerKind, type ServerKind } from "./useServerMatch";

const SAVE_KEY = "reed-banner:tam-quan-ky:save:v1";
const MAP_KEY = "reed-banner:tam-quan-ky:map:v1";

const CLOCKS = [0, 10, 15, 30] as const;
type Clock = (typeof CLOCKS)[number];
/** Ở trình duyệt: "ai" (luyện với máy), "two" (hai người cùng máy). Server làm trọng tài: "reward", "online" (ServerPlay). */
type Mode = "ai" | "two" | ServerKind;
/** Máy chờ ít nhất chừng này trước khi đi, để kịp nhìn nước đi. */
const MIN_THINK_MS = 500;

interface Saved {
  readonly v: 1;
  readonly mode: "ai" | "two";
  readonly human: Color;
  readonly level: Level;
  readonly rival: string;
  readonly clock: Clock;
  readonly moves: Move[];
  readonly timeLeft: Record<Color, number>;
  readonly ended?: { loser: Color; reason: "resign" | "timeout" };
}

function readSaved(): Saved | null {
  try {
    const v = JSON.parse(readStorage(SAVE_KEY) ?? "null") as Saved | null;
    return v && v.v === 1 && Array.isArray(v.moves) ? v : null;
  } catch {
    return null;
  }
}

export default function TamQuanKyScreen() {
  const [mode, setMode] = useState<Mode>("ai");
  const [human, setHuman] = useState<Color>(RED);
  const [level, setLevel] = useState<Level>("medium");
  const [rivalId, setRivalId] = useState<string>(RIVALS[0]!.id);
  const [clock, setClock] = useState<Clock>(15);
  const [moves, setMoves] = useState<Move[]>([]);
  const [timeLeft, setTimeLeft] = useState<Record<Color, number>>({ r: 15 * 60_000, b: 15 * 60_000 });
  const [ended, setEnded] = useState<Saved["ended"]>();
  const [begun, setBegun] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [unit, setUnit] = useState<Move["unit"]>("stack");
  const [choice, setChoice] = useState<Move[] | null>(null);
  const [announce, setAnnounce] = useState("");
  /** Câu thoại đang hiện của Bộ Lĩnh. */
  const [speech, setSpeechState] = useState<{ kind: LineKind; n: number } | null>(null);
  const speechCount = useRef(0);
  const setSpeech = useCallback((kind: LineKind | null) => setSpeechState(kind ? { kind, n: speechCount.current++ } : null), []);
  const [mapId, setMapId] = useState<string>(MAPS[0].id);
  const [dismissed, setDismissed] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const phone = useMediaQuery(PHONE_QUERY);
  const loaded = useRef(false);
  const gameToken = useRef(0);
  const callEngine = useTqkEngine();

  const rival = rivalById(rivalId);
  const positions = useMemo(() => positionsFor(moves), [moves]);
  const current = positions[positions.length - 1]!;
  const position = useMemo(() => (ended ? endGame(current, ended.loser, ended.reason) : current), [current, ended]);
  const result = position.result;
  const started = moves.length > 0 || begun;
  const server = mode === "reward" || mode === "online";
  const [serverMoves, setServerMoves] = useState(0);
  const machine: Color | null = mode === "ai" ? (human === RED ? BLUE : RED) : null;
  const machineTurn = !!machine && position.toMove === machine && !result;

  /** Đỏ luôn là quân Bộ Lĩnh, Xanh là sứ quân; đấu máy thì bạn chọn cầm phe nào. */
  const sideName = useCallback((c: Color) => (c === RED ? BO_LINH : rival.name), [rival.name]);
  const playerName = useCallback(
    (c: Color) => (machine === null || c === machine ? sideName(c) : "Bạn"),
    [machine, sideName],
  );

  // ---- lưu ván ----
  useEffect(() => {
    const s = readSaved();
    if (s) {
      /* eslint-disable react-hooks/set-state-in-effect -- nạp ván dở từ trình duyệt một lần khi mở màn */
      setMode(s.mode === "two" ? "two" : "ai");
      setHuman(s.human === BLUE ? BLUE : RED);
      setFlipped(s.mode !== "two" && s.human === BLUE);
      setLevel(LEVELS.includes(s.level) ? s.level : "medium");
      setRivalId(rivalById(s.rival).id);
      setClock(CLOCKS.includes(s.clock) ? s.clock : 15);
      setMoves(s.moves);
      setTimeLeft(s.timeLeft);
      setEnded(s.ended);
      setBegun(true);
      /* eslint-enable react-hooks/set-state-in-effect */
    } else {
      // Ván có thưởng hay ván online còn dở thì mở lại đúng chế độ đó.
      const kind = savedServerKind();
      if (kind) setMode(kind);
    }
    // Bản đồ đã chọn lần trước, đọc một lần khi mở màn.
    setMapId(mapById(readStorage(MAP_KEY)).id);
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    if (server) return;
    const value: Saved | null = moves.length || ended ? { v: 1, mode: mode === "two" ? "two" : "ai", human, level, rival: rivalId, clock, moves, timeLeft, ended } : null;
    writeStorage(SAVE_KEY, value ? JSON.stringify(value) : null);
  }, [server, mode, human, level, rivalId, clock, moves, timeLeft, ended]);

  // ---- đồng hồ ----
  const ticking = clock > 0 && started && !result;
  useEffect(() => {
    if (!ticking) return;
    const side = position.toMove;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const spent = now - last;
      last = now;
      setTimeLeft((t) => {
        const left = t[side] - spent;
        if (left <= 0) {
          setEnded({ loser: side, reason: "timeout" });
          setSpeech(side === RED ? "lose" : "win");
        }
        return { ...t, [side]: Math.max(0, left) };
      });
    }, 200);
    return () => window.clearInterval(id);
  }, [ticking, position.toMove, setSpeech]);

  const clearSelection = () => {
    setSelected(null);
    setUnit("stack");
    setChoice(null);
  };

  const commit = useCallback(
    (move: Move, from: Position) => {
      const next = play(from, move);
      setMoves((list) => [...list, move]);
      setBegun(true);
      setSelected(null);
      setUnit("stack");
      setChoice(null);
      const check = !next.result && inCheck(next, next.toMove) ? " Chiếu tướng!" : "";
      setAnnounce(`${playerName(from.toMove)}: ${moveText(from, move)}.${check}`);
      const line = lineAfterMove(from, next) ?? (from.moveNumber === 1 ? "start" : null);
      if (line) setSpeech(line);
    },
    [playerName, setSpeech],
  );

  // ---- lượt máy ----
  useEffect(() => {
    if (!machineTurn || !started || thinking) return;
    const token = gameToken.current;
    const from = current;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- bật chữ "đang tính" khi tới lượt máy
    setThinking(true);
    const startedAt = performance.now();
    void callEngine({ moves, level, seed: freshSeed() }).then((res) => {
      const wait = Math.max(0, MIN_THINK_MS - (performance.now() - startedAt));
      window.setTimeout(() => {
        if (token !== gameToken.current) return;
        setThinking(false);
        if ("move" in res && res.move) commit(res.move, from);
      }, wait);
    });
  }, [machineTurn, started, thinking, moves, current, level, callEngine, commit]);

  const targets = useMemo(
    () => (selected === null || result ? [] : legalMovesFrom(position, selected).filter((m) => m.unit === unit)),
    [position, selected, unit, result],
  );

  const onSquare = (s: number) => {
    if (result || machineTurn) return;
    setChoice(null);
    const stack = position.board[s];
    if (selected !== null) {
      const options = targets.filter((m) => m.to === s);
      if (options.length === 1) return commit(options[0]!, current);
      if (options.length > 1) return setChoice(options);
    }
    if (stack && stack.carrier.color === position.toMove && s !== selected) {
      setSelected(s);
      setUnit(stack.carrier.type === "h" && stack.riders.length ? 0 : "stack");
      return;
    }
    clearSelection();
  };

  const undo = () => {
    if (!moves.length) return;
    gameToken.current++;
    setThinking(false);
    setEnded(undefined);
    setDismissed(false);
    // Đấu máy: lùi về thế gần nhất tới lượt bạn.
    let back = 1;
    if (machine) {
      while (back < moves.length && positions[moves.length - back]!.toMove !== human) back++;
      if (positions[moves.length - back]!.toMove !== human) back = moves.length;
    }
    setMoves((list) => list.slice(0, list.length - back));
    if (back >= moves.length) setBegun(false);
    clearSelection();
    setAnnounce("Đã đi lại.");
  };

  const restart = () => {
    gameToken.current++;
    setThinking(false);
    setBegun(false);
    setMoves([]);
    setEnded(undefined);
    setDismissed(false);
    setTimeLeft({ r: clock * 60_000, b: clock * 60_000 });
    clearSelection();
    setAnnounce("");
    setSpeech(null);
  };

  const resign = () => {
    gameToken.current++;
    setThinking(false);
    const loser = machine ? human : position.toMove;
    setEnded({ loser, reason: "resign" });
    setSpeech(loser === RED ? "lose" : "win");
    clearSelection();
  };

  const pickClock = (m: Clock) => {
    setClock(m);
    setTimeLeft({ r: m * 60_000, b: m * 60_000 });
  };

  const selectedStack = selected !== null ? position.board[selected] : null;
  const checkNow = !result && inCheck(position, position.toMove);

  const outcome = (() => {
    if (!result) return null;
    if (result.winner === null) return { tone: "neutral" as const, title: "Hòa", text: "Bên tới lượt không còn nước đi mà cũng không bị chiếu." };
    const reason = {
      checkmate: "Chủ tướng bị vây, không còn đường thoát.",
      headquarters: "Soái trướng bị chiếm giữ đủ ba lượt.",
      resign: "Bên kia đã đầu hàng.",
      timeout: "Bên kia hết giờ.",
    }[result.reason];
    if (!machine) return { tone: "win" as const, title: `${sideName(result.winner)} thắng`, text: reason };
    const won = result.winner === human;
    return { tone: won ? ("win" as const) : ("lose" as const), title: won ? "Thắng trận!" : `${rival.name} thắng`, text: reason };
  })();

  const modePicker = (
    <Options label="Cách chơi" value={mode} onChange={(v) => { setMode(v); setFlipped(v === "ai" && human === BLUE); }}
      options={[
        { value: "ai", label: "Luyện với sứ quân" },
        { value: "reward", label: "Đấu sứ quân có thưởng" },
        { value: "two", label: "Hai người cùng máy" },
        { value: "online", label: "Đấu người 1vs1" },
      ]} />
  );
  const mapPicker = (
    <Options label="Bản đồ" value={mapId} onChange={(id) => { setMapId(id); writeStorage(MAP_KEY, id); }}
      options={MAPS.map((m) => ({ value: m.id, label: m.name }))} />
  );

  const setup = (
    <div className="flex flex-col gap-4">
      {modePicker}
      <RivalPicker value={rivalId} onChange={setRivalId} />
      {mode === "ai" && (
        <>
          <Options label="Bạn cầm quân" value={human} onChange={(v) => { setHuman(v); setFlipped(v === BLUE); }}
            options={[{ value: RED, label: `Đỏ, quân ${BO_LINH} (đi trước)` }, { value: BLUE, label: `Xanh, quân ${rival.name}` }]} />
          <Options label="Độ khó" value={level} onChange={setLevel} options={LEVELS.map((v) => ({ value: v, label: LEVEL_NAME[v] }))} />
        </>
      )}
      {mapPicker}
      <Options label="Đồng hồ mỗi bên" value={clock} onChange={pickClock}
        options={CLOCKS.map((m) => ({ value: m, label: m ? `${m} phút` : "Không giới hạn" }))} />
      {mode === "ai" && human === BLUE ? (
        <Button onClick={() => setBegun(true)}>Vào trận, để {rival.name} đi trước</Button>
      ) : (
        <p className="text-caption text-on-wood-soft">Đi nước đầu là vào trận. Đã vào trận thì muốn đổi lựa chọn phải bấm Ván mới.</p>
      )}
    </div>
  );

  return (
    <ModeScreen card label="Tam Quân Kỳ">
      <ModeBanner
        title="Tam Quân Kỳ"
        art="/art/tam-quan-ky/banner.webp"
        artPosition="center 30%"
        kicker="Binh pháp, bản thử"
        description={MODE_TEXT.TAM_QUAN_KY}
        stats={[
          { label: "Đối thủ", value: mode === "online" ? "Người khác" : mode === "two" ? "Hai người" : rival.name },
          { label: "Lượt", value: Math.ceil((server ? serverMoves : moves.length) / 2) || "–" },
        ]}
      />
      <ModeGuideTabs scene="TAM_QUAN_KY">
        {/* Điện thoại: phần chuẩn bị nằm trong bảng trượt mở từ nút trên hàng thao tác, để sa bàn lên đầu màn (như Do Thám). */}
        {server ? (
          <ServerPlay
            kind={mode}
            modePicker={modePicker}
            mapPicker={mapPicker}
            map={mapById(mapId)}
            rivalId={rivalId}
            onRival={setRivalId}
            phone={phone}
            onMoves={setServerMoves}
          />
        ) : (
          <>
        {!started && (
          <section className="ui-frame p-4 max-sm:hidden" aria-label="Chuẩn bị ván">
            {setup}
          </section>
        )}
        {phone && (
          <BottomSheet open={setupOpen && !started} onClose={() => setSetupOpen(false)} title="Chuẩn bị ván">
            {setup}
          </BottomSheet>
        )}
        <PlayCard className="sm:mt-5">
          <OrnateFrame aria-label="Vùng chơi" flush className="grid min-w-0 items-start gap-4 p-2 sm:p-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="flex min-w-0 flex-col gap-3">
              {!started && (
                <Button variant="secondary" aria-haspopup="dialog" onClick={() => setSetupOpen(true)} className="sm:hidden">
                  Chuẩn bị ván: {machine ? `đấu ${rival.name}, ${LEVEL_NAME[level]}` : "hai người"}
                </Button>
              )}
              <Board
                map={mapById(mapId)}
                position={position}
                flipped={flipped}
                selected={selected}
                targets={targets}
                lastMove={moves.length ? moves[moves.length - 1]! : null}
                onSquare={onSquare}
                pieceLabel={pieceLabel}
              />
              {choice && (
                <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Chọn cách đánh">
                  <span className="text-on-wood">Chọn cách đánh:</span>
                  {choice.map((m) => (
                    <Button key={m.kind} size="sm" variant={m.kind === "capture" ? "primary" : "secondary"} onClick={() => commit(m, current)}>
                      {KIND_NAME[m.kind]}
                    </Button>
                  ))}
                </div>
              )}
              {/* Nước vừa đi đã có ở Nhật ký trận (Shan 23/11/2026); dòng này chỉ để trình đọc màn hình đọc nước mới. */}
              <p role="status" aria-live="polite" className="sr-only">
                {announce}
              </p>
            </div>

            <aside className="flex flex-col gap-3">
              <Speech speech={speech} />
              <div className="ui-frame-inset flex flex-col gap-2 p-3">
                {([RED, BLUE] as const).map((c) => (
                  <div key={c} className={`flex items-center justify-between gap-2 rounded-control border px-2 py-1.5 ${position.toMove === c && !result ? "border-frame-gold" : "border-transparent"}`}>
                    <span className="flex min-w-0 items-center gap-2 font-semibold text-on-wood">
                      <span aria-hidden className={`size-3 shrink-0 rounded-full ${c === RED ? "bg-[var(--tqk-red)]" : "bg-[var(--tqk-blue)]"}`} />
                      {c === RED ? (
                        <Portrait id={MAIN_ID} element="hoa" profession="tuongSi" className="size-8 shrink-0" />
                      ) : (
                        <Portrait id={rival.id} element={rival.element} profession={rival.profession} className="size-8 shrink-0" />
                      )}
                      <span className="truncate">{playerName(c)}</span>
                      {position.toMove === c && !result && (
                        <span className="text-caption font-normal text-on-wood-soft">{machine === c && thinking ? "đang tính" : "tới lượt"}</span>
                      )}
                    </span>
                    {clock > 0 && <span className="font-mono text-lg tabular-nums text-on-wood">{formatClock(timeLeft[c])}</span>}
                  </div>
                ))}
                {machine && <p className="text-caption text-on-wood-soft">Độ khó: {LEVEL_NAME[level]}</p>}
                {checkNow && <p className="font-semibold text-[var(--lacquer-hi)]">{playerName(position.toMove)} đang bị chiếu tướng.</p>}
                {(position.hqHold.r > 0 || position.hqHold.b > 0) && (
                  <p className="text-caption text-on-wood-soft">
                    {playerName(position.hqHold.r ? RED : BLUE)} đang giữ Soái trướng bên kia: {position.hqHold.r || position.hqHold.b}/3 lượt.
                  </p>
                )}
              </div>

              {selectedStack && <SelectedPanel stack={selectedStack} unit={unit} onUnit={(u) => { setUnit(u); setChoice(null); }} />}

              <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Thao tác">
                <Button variant="secondary" size="sm" onClick={undo} disabled={!moves.length}>Đi lại</Button>
                <Button variant="secondary" size="sm" onClick={() => setFlipped((f) => !f)} aria-pressed={flipped}>Xoay sa bàn</Button>
                <Button variant="secondary" size="sm" onClick={restart}>Ván mới</Button>
                {started && !result && (
                  <SurrenderButton consequence={machine ? `Ván này tính là thua, ${rival.name} thắng.` : `${sideName(position.toMove)} đầu hàng, bên kia thắng.`} onConfirm={resign} />
                )}
              </div>

              <MoveList positions={positions} moves={moves} />
            </aside>

            {outcome && (
              <ResultModal
                open={!dismissed}
                tone={outcome.tone}
                kicker="Tam Quân Kỳ"
                title={outcome.title}
                onDismiss={() => setDismissed(true)}
                actions={
                  <>
                    <Button size="lg" autoFocus onClick={restart}>Ván mới</Button>
                    {ended?.reason !== "timeout" && <Button size="lg" variant="secondary" onClick={undo}>Đi lại</Button>}
                  </>
                }
              >
                <p>{outcome.text}</p>
              </ResultModal>
            )}
          </OrnateFrame>
        </PlayCard>
          </>
        )}
      </ModeGuideTabs>
    </ModeScreen>
  );
}

