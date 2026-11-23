"use client";

// Vây Thành Kỳ: cờ vây nguyên tố. Luật chép nguyên từ cờ vây của Shanverse (src/core/co-vay), mỗi bên chọn một trong 7 hệ:
// quân thành quả cầu nguyên tố, đất quanh quân đổi nền theo hệ (theme.tsx). Đấu máy (một trong 12 sứ quân) hoặc hai người cùng
// máy; ván dở lưu ở trình duyệt. Đấu sứ quân có thưởng và đấu người bằng mã phòng do server làm trọng tài nằm ở OnlinePlay.tsx.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Element } from "@/core";
import { BLACK, KOMI, PASS, WHITE, groupAt, isLegal, opponent, play, replay, scoreArea, type BoardSize, type Color, type Level, type Mode, type Position } from "@/core/co-vay";
import { Button } from "@/components/ui";
import { BottomSheet, ModeBanner, ModeScreen, OrnateFrame, ResultModal, SurrenderButton } from "@/components/game-ui";
import { PHONE_QUERY, useMediaQuery } from "@/lib/useMediaQuery";
import { Portrait } from "../art/portraits";
import { ELEMENT_NAME } from "../battle/labels";
import { readStorage, writeStorage } from "../formation/storage";
import { ModeGuideTabs } from "../ModeGuide";
import { MODE_TEXT } from "../modeInfo";
import { PlayCard } from "../PlayCard";
import { LEVEL_NAME, LEVELS, Options, RivalPicker, freshSeed, rivalById, RIVALS } from "../tam-quan-ky/parts";
import { Board } from "./Board";
import { OnlinePlay } from "./OnlinePlay";
import { Arena, ElementPicker, PlayerCard, RULE_HINT, RULE_NAME, SIZES, ScoreLines, sideOrder } from "./parts";
import { useVtkEngine } from "./useEngine";
import { savedOnline } from "./useOnlineMatch";

const SAVE_KEY = "reed-banner:vay-thanh-ky:save:v1";
const MIN_THINK_MS = 450;

type PlayMode = "ai" | "two" | "reward" | "online";
type Phase = "setup" | "playing" | "scoring" | "over";
type Result = { winner: Color; reason: "score" | "capture" | "resign"; black?: number; white?: number };

interface Saved {
  readonly v: 1;
  readonly mode: "ai" | "two";
  readonly rule: Mode;
  readonly size: BoardSize;
  readonly human: Color;
  readonly level: Level;
  readonly rival: string;
  readonly elements: Record<Color, Element>;
  readonly moves: number[];
  readonly phase: Exclude<Phase, "setup">;
  readonly dead: number[];
  readonly result?: Result;
}

function readSaved(): Saved | null {
  try {
    const v = JSON.parse(readStorage(SAVE_KEY) ?? "null") as Saved | null;
    return v && v.v === 1 && Array.isArray(v.moves) && replay(v.size, v.rule, v.moves) ? v : null;
  } catch {
    return null;
  }
}

export default function VayThanhKyScreen() {
  const [mode, setMode] = useState<PlayMode>("ai");
  const [rule, setRule] = useState<Mode>("full");
  const [size, setSize] = useState<BoardSize>(9);
  const [human, setHuman] = useState<Color>(BLACK);
  const [level, setLevel] = useState<Level>("medium");
  const [rivalId, setRivalId] = useState<string>(RIVALS[0]!.id);
  const [elements, setElements] = useState<Record<Color, Element>>({ [BLACK]: "hoa", [WHITE]: rivalById(RIVALS[0]!.id).element } as Record<Color, Element>);
  const [moves, setMoves] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("setup");
  const [dead, setDead] = useState<number[]>([]);
  const [deadReady, setDeadReady] = useState(true);
  const [result, setResult] = useState<Result | undefined>();
  const [thinking, setThinking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [onlineMoves, setOnlineMoves] = useState(0);
  const phone = useMediaQuery(PHONE_QUERY);
  const loaded = useRef(false);
  const gameToken = useRef(0);
  const callEngine = useVtkEngine();

  const rival = rivalById(rivalId);
  const position = useMemo<Position>(() => replay(size, rule, moves) ?? replay(size, rule, [])!, [size, rule, moves]);
  const machine: Color | null = mode === "ai" ? opponent(human) : null;
  const myTurn = phase === "playing" && !thinking && position.toPlay !== machine;

  const names: Record<Color, string> = useMemo(() => {
    if (machine) return { [human]: "Bạn", [machine]: rival.name } as Record<Color, string>;
    return { [BLACK]: `Hệ ${ELEMENT_NAME[elements[BLACK]]}`, [WHITE]: `Hệ ${ELEMENT_NAME[elements[WHITE]]}` } as Record<Color, string>;
  }, [machine, human, rival.name, elements]);

  // ---- lưu ván ----
  useEffect(() => {
    const s = readSaved();
    if (s) {
      /* eslint-disable react-hooks/set-state-in-effect -- nạp ván dở từ trình duyệt một lần khi mở màn */
      setMode(s.mode);
      setRule(s.rule);
      setSize(s.size);
      setHuman(s.human === WHITE ? WHITE : BLACK);
      setLevel(LEVELS.includes(s.level) ? s.level : "medium");
      setRivalId(rivalById(s.rival).id);
      setElements(s.elements);
      setMoves(s.moves);
      setPhase(s.phase);
      setDead(s.dead);
      setDeadReady(s.phase !== "scoring");
      setResult(s.result);
      /* eslint-enable react-hooks/set-state-in-effect */
    } else {
      const server = savedOnline();
      if (server) setMode(server);
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current || mode === "online" || mode === "reward") return;
    const value: Saved | null = phase === "setup" ? null : { v: 1, mode, rule, size, human, level, rival: rivalId, elements, moves, phase, dead, result };
    writeStorage(SAVE_KEY, value ? JSON.stringify(value) : null);
  }, [mode, rule, size, human, level, rivalId, elements, moves, phase, dead, result]);

  const finish = useCallback((r: Result) => {
    setResult(r);
    setPhase("over");
    setDismissed(false);
  }, []);

  const apply = useCallback(
    (move: number, current: number[]) => {
      const before = replay(size, rule, current);
      if (!before) return;
      const by = before.toPlay;
      const { position: after, legal, captured } = play(before, move);
      if (!legal) return;
      setMoves([...current, move]);
      setAnnounce(move === PASS ? `${names[by]} bỏ lượt.` : `${names[by]} đặt quân${captured ? `, bắt ${captured} quân` : ""}.`);
      if (move === PASS && by === machine && after.passes < 2) setNotice(`${rival.name} bỏ lượt. Bạn cũng bỏ lượt thì ván dừng để đếm điểm.`);
      if (after.winner) finish({ winner: after.winner, reason: "capture" });
      else if (after.passes >= 2) {
        setDead([]);
        setDeadReady(false);
        setPhase("scoring");
      }
    },
    [size, rule, names, machine, rival.name, finish],
  );

  // ---- lượt máy ----
  useEffect(() => {
    if (phase !== "playing" || thinking || !machine || position.toPlay !== machine) return;
    const token = gameToken.current;
    const snapshot = moves;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- bật chữ "đang tính" khi tới lượt máy
    setThinking(true);
    const started = performance.now();
    void callEngine({ kind: "move", size, mode: rule, moves: snapshot, level, seed: freshSeed() }).then((res) => {
      const wait = Math.max(0, MIN_THINK_MS - (performance.now() - started));
      window.setTimeout(() => {
        if (token !== gameToken.current) return;
        setThinking(false);
        if (res.kind !== "move") return;
        if (res.resign) finish({ winner: human, reason: "resign" });
        else apply(res.move, snapshot);
      }, wait);
    });
  }, [phase, thinking, machine, position.toPlay, moves, callEngine, size, rule, level, apply, finish, human]);

  // ---- đếm điểm: máy đoán quân chết, người chơi bấm để sửa ----
  useEffect(() => {
    if (phase !== "scoring" || deadReady) return;
    const token = gameToken.current;
    void callEngine({ kind: "dead", size, mode: rule, moves, seed: 7 }).then((res) => {
      if (token !== gameToken.current) return;
      if (res.kind === "dead") setDead(res.dead);
      setDeadReady(true);
    });
  }, [phase, deadReady, callEngine, size, rule, moves]);

  const scoring = phase === "scoring" || (phase === "over" && result?.reason === "score");
  const score = useMemo(() => (scoring ? scoreArea(position.board, size, dead) : null), [scoring, position.board, size, dead]);

  const toggleDead = (point: number) => {
    const group = groupAt(position.board, size, point);
    if (!group.length) return;
    setDead((cur) => (cur.includes(point) ? cur.filter((p) => !group.includes(p)) : [...cur, ...group].sort((a, b) => a - b)));
  };

  const confirmScore = () => {
    if (!score) return;
    finish({ winner: score.black > score.white ? BLACK : WHITE, reason: "score", black: score.black, white: score.white });
  };

  const resume = () => {
    const trimmed = [...moves];
    while (trimmed.length && trimmed[trimmed.length - 1] === PASS) trimmed.pop();
    setMoves(trimmed);
    setDead([]);
    setNotice(null);
    setPhase("playing");
  };

  const playHere = (point: number) => {
    if (!myTurn) return;
    if (point !== PASS && !isLegal(position, point)) {
      setNotice(position.board[point] !== 0 ? "Chỗ này đã có quân." : point === position.ko ? "Luật cướp (ko): chưa được bắt lại ngay, hãy đi chỗ khác một nước." : "Không được tự đặt quân vào chỗ hết khí.");
      return;
    }
    setNotice(null);
    apply(point, moves);
  };

  const reset = () => {
    gameToken.current++;
    setThinking(false);
    setMoves([]);
    setDead([]);
    setDeadReady(true);
    setResult(undefined);
    setNotice(null);
    setAnnounce("");
  };
  const start = () => {
    reset();
    setPhase("playing");
  };
  const newGame = () => {
    reset();
    setPhase("setup");
  };
  const undo = () => {
    if (!moves.length || phase === "scoring") return;
    gameToken.current++;
    setThinking(false);
    let back = 1;
    if (machine) {
      // Lùi về thế gần nhất tới lượt bạn.
      while (back < moves.length && (moves.length - back) % 2 !== (human === BLACK ? 0 : 1)) back++;
    }
    setMoves((list) => list.slice(0, Math.max(0, list.length - back)));
    setResult(undefined);
    setNotice(null);
    setPhase("playing");
  };
  const resign = () => {
    gameToken.current++;
    setThinking(false);
    finish({ winner: machine ?? opponent(position.toPlay), reason: "resign" });
  };

  const pickElement = (side: Color, e: Element) => setElements((cur) => ({ ...cur, [side]: e }));
  const pickRival = (id: string) => {
    setRivalId(id);
    const e = rivalById(id).element;
    if (mode === "ai" && e !== elements[human]) pickElement(opponent(human), e);
  };

  const outcome = (() => {
    if (!result) return null;
    const how = { score: "Hai bên dừng tay, đếm quân và đất vây được.", capture: "Bắt được quân trước.", resign: "Bên kia đã đầu hàng." }[result.reason];
    const text = result.black !== undefined ? `${how} ${result.black} so với ${result.white} điểm.` : how;
    if (!machine) return { tone: "win" as const, title: `${names[result.winner]} thắng`, text };
    const won = result.winner === human;
    return { tone: won ? ("win" as const) : ("lose" as const), title: won ? "Thắng trận!" : `${rival.name} thắng`, text };
  })();

  const modePicker = (
    <Options label="Cách chơi" value={mode} onChange={(v) => { if (phase === "setup") setMode(v); }}
      options={[
        { value: "ai", label: "Luyện với sứ quân" },
        { value: "reward", label: "Đấu sứ quân có thưởng" },
        { value: "two", label: "Hai người cùng máy" },
        { value: "online", label: "Đấu người bằng mã phòng" },
      ]} />
  );

  const setup = (
    <div className="flex flex-col gap-4">
      {modePicker}
      <Options label="Luật" value={rule} onChange={setRule} options={(["full", "capture"] as const).map((v) => ({ value: v, label: RULE_NAME[v] }))} />
      <p className="-mt-2 text-caption text-on-wood-soft">{RULE_HINT[rule]}</p>
      <Options label="Cỡ bàn" value={size} onChange={setSize} options={SIZES.map((s) => ({ value: s, label: `${s}×${s}` }))} />
      {mode === "ai" ? (
        <>
          <RivalPicker value={rivalId} onChange={pickRival} />
          <ElementPicker label="Nguyên tố của bạn" value={elements[human]} taken={elements[opponent(human)]} onChange={(e) => pickElement(human, e)} />
          <ElementPicker label={`Nguyên tố của ${rival.name}`} value={elements[opponent(human)]} taken={elements[human]} onChange={(e) => pickElement(opponent(human), e)} />
          <Options label="Bạn đi" value={human} onChange={(v) => { setElements((cur) => ({ [v]: cur[human], [opponent(v)]: cur[opponent(human)] }) as Record<Color, Element>); setHuman(v); }}
            options={[{ value: BLACK, label: "Đi trước" }, { value: WHITE, label: `Đi sau, được cộng điểm` }]} />
          <Options label="Độ khó" value={level} onChange={setLevel} options={LEVELS.map((v) => ({ value: v, label: LEVEL_NAME[v] }))} />
        </>
      ) : (
        <>
          <ElementPicker label="Nguyên tố bên đi trước" value={elements[BLACK]} taken={elements[WHITE]} onChange={(e) => pickElement(BLACK, e)} />
          <ElementPicker label="Nguyên tố bên đi sau" value={elements[WHITE]} taken={elements[BLACK]} onChange={(e) => pickElement(WHITE, e)} />
        </>
      )}
      <Button onClick={() => { start(); setSetupOpen(false); }}>{mode === "ai" ? `Vào trận đấu ${rival.name}` : "Vào trận"}</Button>
    </div>
  );

  const side = (c: Color, tall: boolean) => (
    <PlayerCard
      key={c}
      tall={tall}
      element={elements[c]}
      color={c}
      name={names[c]}
      portrait={portrait(c)}
      captures={position.captures[c]}
      active={phase === "playing" && position.toPlay === c}
      status={phase === "playing" && position.toPlay === c ? (machine === c && thinking ? "đang tính" : "tới lượt") : undefined}
    />
  );

  const portrait = (c: Color) =>
    machine === c ? <Portrait id={rival.id} element={rival.element} profession={rival.profession} className="size-7 shrink-0" /> : undefined;

  return (
    <ModeScreen card label="Vây Thành Kỳ">
      <ModeBanner
        title="Vây Thành Kỳ"
        kicker="Binh pháp, bản thử"
        description={MODE_TEXT.VAY_THANH_KY}
        stats={[
          { label: "Đối thủ", value: mode === "online" ? "Người khác" : mode === "two" ? "Hai người" : mode === "reward" ? "Sứ quân" : rival.name },
          { label: "Nước", value: (mode === "online" || mode === "reward" ? onlineMoves : moves.length) || "–" },
        ]}
      />
      <ModeGuideTabs scene="VAY_THANH_KY">
        {mode === "online" || mode === "reward" ? (
          <OnlinePlay key={mode} kind={mode} modePicker={modePicker} phone={phone} onMoves={setOnlineMoves} />
        ) : phase === "setup" ? (
          <>
            <section className="ui-frame p-4 max-sm:hidden" aria-label="Chuẩn bị ván">{setup}</section>
            {phone && (
              <>
                <Button variant="secondary" aria-haspopup="dialog" onClick={() => setSetupOpen(true)} className="w-full sm:hidden">
                  Chuẩn bị ván: {mode === "ai" ? `đấu ${rival.name}, ${LEVEL_NAME[level]}` : "hai người"}, {size}×{size}
                </Button>
                <BottomSheet open={setupOpen} onClose={() => setSetupOpen(false)} title="Chuẩn bị ván">{setup}</BottomSheet>
              </>
            )}
          </>
        ) : (
          <PlayCard className="sm:mt-5">
            <OrnateFrame aria-label="Vùng chơi" flush className="p-2 sm:p-4">
              <Arena
                left={(tall) => side(BLACK, tall)}
                right={(tall) => side(WHITE, tall)}
                board={
                  <Board
                    size={size}
                    board={position.board}
                    elements={elements}
                    toPlay={position.toPlay}
                    lastMove={position.lastMove}
                    interactive={myTurn}
                    onPlay={playHere}
                    onPass={rule === "full" ? () => playHere(PASS) : undefined}
                    dead={scoring ? dead : []}
                    owner={score?.owner ?? null}
                    onToggleDead={phase === "scoring" && deadReady ? toggleDead : undefined}
                    label={`Bàn cờ vây ${size} nhân ${size}. Mũi tên để di chuyển, Enter đặt quân${rule === "full" ? ", P bỏ lượt" : ""}.`}
                  />
                }
                below={
                  <>
                    <p role="status" aria-live="polite" className="min-h-5 text-center text-caption text-on-wood-soft">{notice ?? announce}</p>
                    {phase === "scoring" && (
                      <div className="ui-frame-inset flex w-full flex-col gap-2 p-3">
                        <p className="font-semibold text-on-wood">Đếm điểm</p>
                        <p className="text-caption text-on-wood-soft">
                          {deadReady ? "Quân gạch chéo là quân chết, tính cho bên kia. Bấm vào một nhóm quân để đổi sống hay chết." : "Đang xem quân nào đã chết…"}
                        </p>
                        {score && <ScoreLines score={score} names={names} />}
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" disabled={!deadReady} onClick={confirmScore}>Chốt điểm</Button>
                          <Button size="sm" variant="secondary" onClick={resume}>Đánh tiếp</Button>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap justify-center gap-2" role="toolbar" aria-label="Thao tác">
                      {phase === "playing" && rule === "full" && (
                        <Button variant="secondary" size="sm" disabled={!myTurn} onClick={() => playHere(PASS)} aria-keyshortcuts="P">Bỏ lượt</Button>
                      )}
                      <Button variant="secondary" size="sm" onClick={undo} disabled={!moves.length || phase === "scoring"}>Đi lại</Button>
                      <Button variant="secondary" size="sm" onClick={newGame}>Ván mới</Button>
                      {phase === "playing" && (
                        <SurrenderButton consequence={machine ? `Ván này tính là thua, ${rival.name} thắng.` : `${names[position.toPlay]} đầu hàng, bên kia thắng.`} onConfirm={resign} />
                      )}
                    </div>
                    <p className="text-center text-caption text-on-wood-soft">
                      {RULE_NAME[rule]}, bàn {size}×{size}{machine ? `, độ khó ${LEVEL_NAME[level]}` : ""}. Bên {sideOrder(WHITE)} được cộng {KOMI} điểm bù.
                    </p>
                  </>
                }
              />

              {outcome && (
                <ResultModal
                  open={!dismissed}
                  tone={outcome.tone}
                  kicker="Vây Thành Kỳ"
                  title={outcome.title}
                  onDismiss={() => setDismissed(true)}
                  actions={
                    <>
                      <Button size="lg" autoFocus onClick={newGame}>Ván mới</Button>
                      <Button size="lg" variant="secondary" onClick={() => setDismissed(true)}>Xem lại bàn</Button>
                    </>
                  }
                >
                  <p>{outcome.text}</p>
                </ResultModal>
              )}
            </OrnateFrame>
          </PlayCard>
        )}
      </ModeGuideTabs>
    </ModeScreen>
  );
}
