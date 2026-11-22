"use client";

// Tam Quân Kỳ: cờ tư lệnh trên sa bàn tập trận của Đinh Bộ Lĩnh. Luật chép nguyên từ Cờ Việt Nam của Shanverse
// (src/core/tam-quan-ky), chỉ tên quân và hình là cổ trang (pieces.ts). Đấu máy (một trong 12 sứ quân) hoặc hai người cùng máy.
// Ván dở lưu ở trình duyệt. Bản đầu chưa có thưởng (Shan chốt 23/11/2026). Tranh quân, sa bàn và thẻ do Shan vẽ (23/11/2026).

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { WARLORD_ENCOUNTERS, MAIN_ID } from "@/core";
import {
  BLUE,
  BRIDGE_FILES,
  FILES,
  RANKS,
  RED,
  endGame,
  fileOf,
  inCheck,
  legalMovesFrom,
  newGame,
  play,
  rankOf,
  sq,
  squareName,
  stackPieces,
  unitPiece,
  type Color,
  type Level,
  type Move,
  type MoveKind,
  type PieceType,
  type Position,
  type Stack,
} from "@/core/tam-quan-ky";
import { Button, ChoiceChip } from "@/components/ui";
import { BottomSheet, ModeBanner, ModeScreen, OrnateFrame, ResultModal, SurrenderButton } from "@/components/game-ui";
import { PHONE_QUERY, useMediaQuery } from "@/lib/useMediaQuery";
import { Portrait } from "../art/portraits";
import { readStorage, writeStorage } from "../formation/storage";
import { ModeGuideTabs } from "../ModeGuide";
import { MODE_TEXT } from "../modeInfo";
import { PlayCard } from "../PlayCard";
import { KIND_NAME, PIECE_MOVE, PIECE_NAME } from "./pieces";
import { useTqkEngine } from "./useEngine";

const SAVE_KEY = "reed-banner:tam-quan-ky:save:v1";
const CLOCKS = [0, 10, 15, 30] as const;
type Clock = (typeof CLOCKS)[number];
type Mode = "ai" | "two";
const LEVELS: readonly Level[] = ["easy", "medium", "hard"];
const LEVEL_NAME: Record<Level, string> = { easy: "Dễ", medium: "Thường", hard: "Khó" };
/** Máy chờ ít nhất chừng này trước khi đi, để kịp nhìn nước đi. */
const MIN_THINK_MS = 500;

const RIVALS = WARLORD_ENCOUNTERS.map((w) => ({ ...w.foes[0]!, place: w.place }));
type Rival = (typeof RIVALS)[number];
const rivalById = (id: string | undefined): Rival => RIVALS.find((r) => r.id === id) ?? RIVALS[0]!;
const BO_LINH = "Đinh Bộ Lĩnh";

interface Saved {
  readonly v: 1;
  readonly mode: Mode;
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

/** Đi lại các nước đã lưu, giữ từng thế cờ cho nhật ký và đi lại. */
function positionsFor(moves: readonly Move[]): Position[] {
  const list = [newGame()];
  for (const m of moves) {
    try {
      list.push(play(list[list.length - 1]!, m));
    } catch {
      break;
    }
  }
  return list;
}

const formatClock = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

const freshSeed = () => (Math.random() * 2 ** 31) | 0;

/** Tên nước đi đọc được: "Voi chiến c4 → c6, tiến vào ăn". */
function moveText(pos: Position, move: Move): string {
  const stack = pos.board[move.from];
  const piece = stack ? unitPiece(stack, move.unit) : null;
  const kind = move.kind === "move" ? "" : `, ${KIND_NAME[move.kind].toLowerCase()}`;
  return `${piece ? PIECE_NAME[piece.type] : "?"} ${squareName(move.from)} → ${squareName(move.to)}${kind}`;
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
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    const value: Saved | null = moves.length || ended ? { v: 1, mode, human, level, rival: rivalId, clock, moves, timeLeft, ended } : null;
    writeStorage(SAVE_KEY, value ? JSON.stringify(value) : null);
  }, [mode, human, level, rivalId, clock, moves, timeLeft, ended]);

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
        if (left <= 0) setEnded({ loser: side, reason: "timeout" });
        return { ...t, [side]: Math.max(0, left) };
      });
    }, 200);
    return () => window.clearInterval(id);
  }, [ticking, position.toMove]);

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
    },
    [playerName],
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
  };

  const resign = () => {
    gameToken.current++;
    setThinking(false);
    setEnded({ loser: machine ? human : position.toMove, reason: "resign" });
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

  const setup = (
    <div className="flex flex-col gap-4">
      <Options label="Cách chơi" value={mode} onChange={(v) => { setMode(v); setFlipped(v === "ai" && human === BLUE); }}
        options={[{ value: "ai", label: "Đấu sứ quân (máy)" }, { value: "two", label: "Hai người cùng máy" }]} />
      <div className="flex flex-col gap-2">
        <h2 className="ui-title-on-wood font-bold">Sứ quân đối địch</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3" role="group" aria-label="Chọn sứ quân">
          {RIVALS.map((r) => (
            <ChoiceChip key={r.id} selected={r.id === rivalId} size="md" onClick={() => setRivalId(r.id)} className="justify-start text-left">
              <Portrait id={r.id} element={r.element} profession={r.profession} className="size-9 shrink-0" />
              <span className="flex flex-col">
                <span>{r.name}</span>
                <span className="text-caption font-normal opacity-80">{r.title}, {r.place}</span>
              </span>
            </ChoiceChip>
          ))}
        </div>
      </div>
      {mode === "ai" && (
        <>
          <Options label="Bạn cầm quân" value={human} onChange={(v) => { setHuman(v); setFlipped(v === BLUE); }}
            options={[{ value: RED, label: `Đỏ, quân ${BO_LINH} (đi trước)` }, { value: BLUE, label: `Xanh, quân ${rival.name}` }]} />
          <Options label="Độ khó" value={level} onChange={setLevel} options={LEVELS.map((v) => ({ value: v, label: LEVEL_NAME[v] }))} />
        </>
      )}
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
          { label: "Đối thủ", value: machine ? rival.name : "Hai người" },
          { label: "Lượt", value: Math.ceil(moves.length / 2) || "–" },
        ]}
      />
      <ModeGuideTabs scene="TAM_QUAN_KY">
        {/* Điện thoại: phần chuẩn bị nằm trong bảng trượt mở từ nút trên hàng thao tác, để sa bàn lên đầu màn (như Do Thám). */}
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
                position={position}
                flipped={flipped}
                selected={selected}
                targets={targets}
                lastMove={moves.length ? moves[moves.length - 1]! : null}
                onSquare={onSquare}
                pieceLabel={(stack) =>
                  stackPieces(stack)
                    .map((p) => `${p.color === RED ? "Đỏ" : "Xanh"} ${PIECE_NAME[p.type]}${p.hero ? " (anh hùng)" : ""}`)
                    .join(", ")
                }
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
              <p role="status" aria-live="polite" className="min-h-6 text-center text-[15px] text-title-on-wood">
                {announce}
              </p>
            </div>

            <aside className="flex flex-col gap-3">
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
      </ModeGuideTabs>
    </ModeScreen>
  );
}

function Options<T extends string | number>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="ui-title-on-wood font-bold">{label}</h2>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((o) => (
          <ChoiceChip key={String(o.value)} selected={o.value === value} size="md" onClick={() => onChange(o.value)}>
            {o.label}
          </ChoiceChip>
        ))}
      </div>
    </div>
  );
}

function SelectedPanel({ stack, unit, onUnit }: { stack: Stack; unit: Move["unit"]; onUnit: (u: Move["unit"]) => void }) {
  const piece = unitPiece(stack, unit);
  const units: Move["unit"][] = stack.carrier.type === "h" ? stack.riders.map((_, i) => i) : ["stack", ...stack.riders.map((_, i) => i)];
  return (
    <div className="ui-frame-inset flex flex-col gap-2 p-3">
      {units.length > 1 && (
        <div className="flex flex-col gap-1.5">
          <p className="font-semibold text-on-wood">Đi quân nào trong chồng?</p>
          <div className="flex flex-wrap gap-2">
            {units.map((u) => {
              const p = unitPiece(stack, u);
              return (
                <ChoiceChip key={String(u)} selected={unit === u} onClick={() => onUnit(u)}>
                  {u === "stack" ? `Cả chồng (${PIECE_NAME[p.type]} chở)` : PIECE_NAME[p.type]}
                </ChoiceChip>
              );
            })}
          </div>
        </div>
      )}
      <p className="font-semibold text-on-wood">
        {PIECE_NAME[piece.type]}
        {piece.hero && <span className="ml-2 text-caption text-frame-gold">Anh hùng</span>}
      </p>
      <p className="text-caption text-on-wood-soft">{PIECE_MOVE[piece.type]}</p>
    </div>
  );
}

function MoveList({ positions, moves }: { positions: readonly Position[]; moves: readonly Move[] }) {
  const ref = useRef<HTMLOListElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [moves.length]);
  return (
    <div className="ui-frame-inset p-3">
      <p className="mb-1.5 font-semibold text-on-wood">Nhật ký trận</p>
      {moves.length ? (
        <ol ref={ref} className="flex max-h-56 flex-col gap-0.5 overflow-y-auto text-caption text-on-wood-soft">
          {moves.map((m, i) => (
            <li key={i} className="flex gap-2">
              <span className="w-8 shrink-0 tabular-nums">{Math.floor(i / 2) + 1}{i % 2 ? "b" : "a"}.</span>
              <span aria-hidden className={`mt-1.5 size-2 shrink-0 rounded-full ${i % 2 ? "bg-[var(--tqk-blue)]" : "bg-[var(--tqk-red)]"}`} />
              <span>{moveText(positions[i]!, m)}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-caption text-on-wood-soft">Chưa có nước nào.</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sa bàn vẽ bằng SVG trên tranh nền: mỗi khoảng giữa hai giao điểm là một đơn vị, chừa lề một đơn vị quanh bàn.

interface BoardProps {
  readonly position: Position;
  readonly flipped: boolean;
  readonly selected: number | null;
  readonly targets: readonly Move[];
  readonly lastMove: Move | null;
  readonly onSquare: (s: number) => void;
  readonly pieceLabel: (stack: Stack) => string;
}

const BOARD_ART = "/art/tam-quan-ky/sa-ban.webp";
const ATTACKS: readonly MoveKind[] = ["capture", "fire", "strike"];

function Board({ position, flipped, selected, targets, lastMove, onSquare, pieceLabel }: BoardProps) {
  const [cursor, setCursor] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const W = FILES + 1;
  const H = RANKS + 1;
  const x = (f: number) => (flipped ? FILES - f : f + 1);
  const y = (r: number) => (flipped ? r + 1 : RANKS - r);
  const at = (s: number) => ({ cx: x(fileOf(s)), cy: y(rankOf(s)) });

  const squareAt = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const col = Math.round(((clientX - rect.left) / rect.width) * W);
    const row = Math.round(((clientY - rect.top) / rect.height) * H);
    if (col < 1 || col > FILES || row < 1 || row > RANKS) return null;
    return sq(flipped ? FILES - col : col - 1, flipped ? row - 1 : RANKS - row);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const step = (df: number, dr: number) => {
      e.preventDefault();
      const s = cursor ?? sq(5, flipped ? 6 : 5);
      const sign = flipped ? -1 : 1;
      setCursor(sq(Math.min(FILES - 1, Math.max(0, fileOf(s) + df * sign)), Math.min(RANKS - 1, Math.max(0, rankOf(s) + dr * sign))));
    };
    if (e.key === "ArrowLeft") step(-1, 0);
    else if (e.key === "ArrowRight") step(1, 0);
    else if (e.key === "ArrowUp") step(0, 1);
    else if (e.key === "ArrowDown") step(0, -1);
    else if ((e.key === "Enter" || e.key === " ") && cursor !== null) {
      e.preventDefault();
      onSquare(cursor);
    }
  };

  const byTarget = new Map<number, Move[]>();
  for (const m of targets) byTarget.set(m.to, [...(byTarget.get(m.to) ?? []), m]);
  const cursorStack = cursor !== null ? position.board[cursor] : null;
  const cursorText = cursor !== null ? `${squareName(cursor)}${cursorStack ? `: ${pieceLabel(cursorStack)}` : ""}` : "";

  return (
    <div className="ui-frame-inset mx-auto w-full max-w-[40rem] p-1">
      <div
        role="application"
        tabIndex={0}
        aria-label="Sa bàn Tam Quân Kỳ. Dùng phím mũi tên để dò, Enter để chọn."
        aria-describedby="tqk-cursor"
        onKeyDown={onKeyDown}
        onBlur={() => setCursor(null)}
        className="rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-frame-gold"
      >
        <span id="tqk-cursor" className="sr-only" aria-live="polite">{cursorText}</span>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full cursor-pointer touch-manipulation select-none"
          onPointerUp={(e) => {
            const s = squareAt(e.clientX, e.clientY);
            if (s !== null) onSquare(s);
          }}
          aria-hidden
        >
          {/* Tranh sa bàn vẽ đúng tỉ lệ bàn (art/prompts/tam-quan-ky.md): đầm cột a, b; bãi lau cột c; sông giữa hàng 6 và 7; cầu tre cột f, h. Xoay sa bàn thì xoay tranh nửa vòng. */}
          <image href={BOARD_ART} x={0} y={0} width={W} height={H} preserveAspectRatio="none" transform={flipped ? `rotate(180 ${W / 2} ${H / 2})` : undefined} />
          <g stroke="var(--tqk-line)" strokeWidth={0.03}>
            {Array.from({ length: RANKS }, (_, r) => <line key={`r${r}`} x1={1} y1={y(r)} x2={FILES} y2={y(r)} />)}
            {Array.from({ length: FILES }, (_, f) =>
              f <= 2 || BRIDGE_FILES.includes(f) ? (
                <line key={`f${f}`} x1={x(f)} y1={1} x2={x(f)} y2={RANKS} />
              ) : (
                <g key={`f${f}`}>
                  <line x1={x(f)} y1={y(0)} x2={x(f)} y2={y(5)} />
                  <line x1={x(f)} y1={y(6)} x2={x(f)} y2={y(11)} />
                </g>
              ),
            )}
          </g>
          <g fill="var(--tqk-token)" stroke="var(--tqk-line)" strokeWidth={0.06} paintOrder="stroke" fontSize={0.32} fontWeight={700} textAnchor="middle" dominantBaseline="central">
            {Array.from({ length: FILES }, (_, f) => <text key={`lf${f}`} x={x(f)} y={H - 0.35}>{String.fromCharCode(97 + f)}</text>)}
            {Array.from({ length: RANKS }, (_, r) => <text key={`lr${r}`} x={0.38} y={y(r)}>{r + 1}</text>)}
          </g>

          {lastMove && (
            <g fill="none" stroke="var(--frame-gold)" strokeWidth={0.06}>
              <circle {...at(lastMove.from)} r={0.2} strokeDasharray="0.08 0.08" />
              <circle {...at(lastMove.to)} r={0.5} />
            </g>
          )}

          {position.board.map((stack, s) => (stack ? <Token key={s} stack={stack} {...at(s)} selected={selected === s} /> : null))}

          {[...byTarget.entries()].map(([s, list]) => {
            const { cx, cy } = at(s);
            if (list.some((m) => ATTACKS.includes(m.kind))) {
              const strike = list.every((m) => m.kind === "strike");
              return <circle key={`t${s}`} cx={cx} cy={cy} r={0.48} fill="none" stroke={strike ? "var(--frame-gold)" : "var(--lacquer-hi)"} strokeWidth={0.08} strokeDasharray={strike ? "0.12 0.08" : undefined} />;
            }
            if (list.some((m) => m.kind === "join")) return <circle key={`t${s}`} cx={cx} cy={cy} r={0.48} fill="none" stroke="var(--jade)" strokeWidth={0.07} />;
            return <circle key={`t${s}`} cx={cx} cy={cy} r={0.14} fill="var(--jade)" stroke="var(--tqk-line)" strokeWidth={0.02} />;
          })}

          {cursor !== null && (
            <rect x={at(cursor).cx - 0.5} y={at(cursor).cy - 0.5} width={1} height={1} rx={0.12} fill="none" stroke="var(--frame-gold)" strokeWidth={0.07} />
          )}
        </svg>
      </div>
    </div>
  );
}

const pieceArt = (type: PieceType) => `/art/tam-quan-ky/quan/${type}.webp`;

/** Quân: tranh tròn (một hình cho cả hai phe) trong viền màu phe. Chồng quân hiện các quân được chở ở thẻ nhỏ phía dưới. */
function Token({ stack, cx, cy, selected }: { stack: Stack; cx: number; cy: number; selected: boolean }) {
  const piece = stack.carrier;
  const side = piece.color === RED ? "var(--tqk-red)" : "var(--tqk-blue)";
  const r = 0.36;
  return (
    <g>
      <circle cx={cx + 0.03} cy={cy + 0.05} r={0.44} fill="var(--black)" opacity={0.25} />
      <circle cx={cx} cy={cy} r={0.44} fill={side} />
      <image href={pieceArt(piece.type)} x={cx - r} y={cy - r} width={r * 2} height={r * 2} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--tqk-token)" strokeWidth={0.02} opacity={0.6} />
      {selected && <circle cx={cx} cy={cy} r={0.5} fill="none" stroke="var(--frame-gold)" strokeWidth={0.06} />}
      {piece.hero && <circle cx={cx + 0.31} cy={cy - 0.31} r={0.11} fill="var(--frame-gold)" stroke="var(--tqk-line)" strokeWidth={0.03} />}
      {stack.riders.map((rider, i) => {
        const rx = cx + 0.3 - i * 0.34;
        const ry = cy + 0.34;
        return (
          <g key={i}>
            <circle cx={rx} cy={ry} r={0.19} fill={side} />
            <image href={pieceArt(rider.type)} x={rx - 0.15} y={ry - 0.15} width={0.3} height={0.3} />
            {rider.hero && <circle cx={rx + 0.13} cy={ry - 0.13} r={0.06} fill="var(--frame-gold)" />}
          </g>
        );
      })}
    </g>
  );
}
