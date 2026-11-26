"use client";

// Vây Thành Kỳ do server làm trọng tài (kiểm luật, đồng hồ, tự đếm điểm khi hai bên cùng bỏ lượt), hai cách chơi:
// - "reward": đấu sứ quân có thưởng (Shan chọn 23/11/2026). Máy đáp ngay trong request, không đồng hồ, không đi lại; thắng được
//   vàng theo độ khó, tối đa REWARDS_PER_DAY ván có vàng mỗi ngày.
// - "online": đấu người bằng mã phòng: người mở phòng đi trước, người vào bằng mã đi sau, mỗi người tự chọn nguyên tố. Giao hữu.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Element } from "@/core";
import { BLACK, GO_ONLINE_CLOCKS, PASS, WHITE, isLegal, newGame, opponent, play, playInPlace, type BoardSize, type Color, type Level, type Mode, type Position } from "@/core/co-vay";
import { Button } from "@/components/ui";
import { BottomSheet, OrnateFrame, ResultModal, SurrenderButton } from "@/components/game-ui";
import { Portrait } from "../art/portraits";
import { PlayCard } from "../PlayCard";
import { LEVEL_NAME, LEVELS, Options, RivalPicker, rivalById } from "../tam-quan-ky/parts";
import { Board } from "./Board";
import { Arena, ElementPicker, PlayerCard, RULE_HINT, RULE_NAME, SIZES, ScoreLines } from "./parts";
import { SERVER_ERROR, useOnlineMatch, type ServerKind } from "./useOnlineMatch";
import { useAudio } from "../audio/AudioProvider";
import { clockTickDue } from "../tam-quan-ky/sounds";
import { goMoveSounds, playInTurn } from "./sounds";

/** Vàng thắng sứ quân theo độ khó và số ván có vàng mỗi ngày; khớp GO_GOLD, GO_REWARDS_PER_DAY ở src/server/coVay.ts. */
const GOLD: Record<Level, number> = { easy: 20, medium: 40, hard: 80 };
const REWARDS_PER_DAY = 3;

interface Props {
  readonly kind: ServerKind;
  readonly modePicker: ReactNode;
  readonly phone: boolean;
  readonly onMoves: (n: number) => void;
}

function positionOf(size: BoardSize, mode: Mode, moves: readonly number[]): Position {
  const pos = newGame(size, mode);
  for (const m of moves) if (playInPlace(pos, m) < 0) break;
  return pos;
}

export function OnlinePlay({ kind, modePicker, phone, onMoves }: Props) {
  const s = useOnlineMatch();
  const { play: playSound } = useAudio();
  const view = s.view;
  const [rule, setRule] = useState<Mode>("full");
  const [size, setSize] = useState<BoardSize>(9);
  const [clock, setClock] = useState<number>(20);
  const [element, setElement] = useState<Element>("hoa");
  const [rivalId, setRivalId] = useState<string>(rivalById(undefined).id);
  const [rivalElement, setRivalElement] = useState<Element>(rivalById(undefined).element);
  const [human, setHuman] = useState<Color>(BLACK);
  const [level, setLevel] = useState<Level>("medium");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);

  const moves = useMemo(() => (view ? [...view.moves] : []), [view]);
  const last = useMemo(() => (view ? positionOf(view.size, view.mode, moves) : null), [view, moves]);
  const shown = useMemo(() => (last && pending !== null && isLegal(last, pending) ? play(last, pending).position : last), [last, pending]);
  const result = view?.result ?? null;
  const waiting = view?.status === "waiting";
  const canMove = !!view && s.myTurn && pending === null && !s.busy && !result;

  useEffect(() => onMoves(moves.length), [moves.length, onMoves]);
  const viewId = view?.id ?? null;
  // Server ghi thêm nước (của mình hay đối thủ): tiếng của nước cuối; hết ván bằng đếm điểm thì `go.score`. Lần đầu nạp ván chỉ ghi nhớ.
  const heard = useRef<{ id: string | null; n: number; over: boolean } | null>(null);
  useEffect(() => {
    if (!view) return;
    const prev = heard.current;
    const over = !!view.result;
    if (prev && prev.id === view.id) {
      if (moves.length > prev.n) playInTurn(goMoveSounds(positionOf(view.size, view.mode, moves.slice(0, -1)), moves[moves.length - 1]!), playSound);
      if (over && !prev.over && view.result?.reason === "score") playSound("go.score");
    }
    heard.current = { id: view.id, n: moves.length, over };
  }, [view, moves, playSound]);
  // Còn 10 giây cuối trong lượt của bạn thì mỗi giây gõ một tiếng.
  const myClockMs = view && view.clockMs > 0 && s.myTurn && !view.result ? s.timeLeft(view.you) : null;
  const lastClock = useRef<number | null>(null);
  useEffect(() => {
    if (myClockMs !== null && lastClock.current !== null && clockTickDue(lastClock.current, myClockMs)) playSound("go.clock");
    lastClock.current = myClockMs;
  }, [myClockMs, playSound]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mở lại hộp kết quả cho mỗi ván mới
    setDismissed(false);
  }, [viewId]);

  const send = async (point: number) => {
    if (!canMove || !last) return;
    if (point !== PASS && !isLegal(last, point)) {
      playSound("go.illegal");
      setNotice(last.board[point] !== 0 ? "Chỗ này đã có quân." : point === last.ko ? "Luật cướp (ko): chưa được bắt lại ngay." : "Không được tự đặt quân vào chỗ hết khí.");
      return;
    }
    setNotice(null);
    setPending(point);
    await s.move(point);
    setPending(null);
  };

  const aiRival = view?.ai ? rivalById(view.ai.rival) : null;
  const names = (c: Color): string => {
    if (!view) return "";
    if (c === view.you) return "Bạn";
    if (aiRival) return aiRival.name;
    return view.names[c] || "Đang chờ người vào";
  };

  const outcome = (() => {
    if (!result || !view) return null;
    const how = {
      score: result.score ? `Hai bên dừng tay, đếm điểm: ${result.score.black} so với ${result.score.white}.` : "Đếm điểm.",
      capture: "Bắt được quân trước.",
      resign: result.winner === view.you ? (aiRival ? `${aiRival.name} xin thua.` : "Bên kia đã đầu hàng.") : "Bạn đã đầu hàng.",
      timeout: "Bên kia hết giờ.",
    }[result.reason];
    const won = result.winner === view.you;
    return { tone: won ? ("win" as const) : ("lose" as const), title: won ? "Thắng trận!" : `${names(result.winner)} thắng`, text: how };
  })();

  const errorLine = s.error && <p role="alert" className="font-semibold text-[var(--lacquer-hi)]">{SERVER_ERROR[s.error] ?? SERVER_ERROR.network}</p>;
  const ruleAndSize = (
    <>
      <Options label="Luật" value={rule} onChange={setRule} options={(["full", "capture"] as const).map((v) => ({ value: v, label: RULE_NAME[v] }))} />
      <p className="-mt-2 text-caption text-on-wood-soft">{RULE_HINT[rule]}</p>
      <Options label="Cỡ bàn" value={size} onChange={setSize} options={SIZES.map((v) => ({ value: v, label: `${v}×${v}` }))} />
    </>
  );
  const rival = rivalById(rivalId);

  const setup =
    kind === "reward" ? (
      <div className="flex flex-col gap-4">
        {modePicker}
        {ruleAndSize}
        <RivalPicker value={rivalId} onChange={(id) => { setRivalId(id); setRivalElement(rivalById(id).element); }} />
        <ElementPicker label="Nguyên tố của bạn" value={element} taken={rivalElement} onChange={setElement} />
        <ElementPicker label={`Nguyên tố của ${rival.name}`} value={rivalElement} taken={element} onChange={setRivalElement} />
        <Options label="Bạn đi" value={human} onChange={setHuman} options={[{ value: BLACK, label: "Đi trước" }, { value: WHITE, label: "Đi sau, được cộng điểm" }]} />
        <Options label="Độ khó" value={level} onChange={setLevel} options={LEVELS.map((v) => ({ value: v, label: `${LEVEL_NAME[v]}, ${GOLD[v]} vàng` }))} />
        <p className="text-caption text-on-wood-soft">
          Ván chạy trên máy chủ: không đi lại, không giới hạn giờ. Thắng được vàng theo độ khó, tối đa {REWARDS_PER_DAY} ván có vàng mỗi ngày.
        </p>
        <Button disabled={s.busy} onClick={() => void s.startAi({ level, rival: rivalId, human, size, mode: rule, element, rivalElement }).then((ok) => ok && setSetupOpen(false))}>
          Vào trận đấu {rival.name}
        </Button>
        {errorLine}
      </div>
    ) : (
      <div className="flex flex-col gap-4">
        {modePicker}
        <ElementPicker label="Nguyên tố của bạn" value={element} onChange={setElement} />
        <h2 className="ui-title-on-wood font-bold">Mở phòng mới</h2>
        {ruleAndSize}
        <Options label="Đồng hồ mỗi bên" value={clock} onChange={setClock} options={GO_ONLINE_CLOCKS.map((m) => ({ value: m, label: `${m} phút` }))} />
        <p className="text-caption text-on-wood-soft">
          Người mở phòng đi trước, người vào bằng mã đi sau và được cộng điểm bù. Hai người chọn trùng hệ thì người vào sau được đổi sang hệ khác. Đấu giao hữu, không có vàng.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <Button disabled={s.busy} onClick={() => void s.host({ size, mode: rule, clock, element })}>Mở phòng</Button>
          <label className="flex flex-col gap-1 text-caption text-on-wood-soft">
            Mã phòng của bạn bè
            <input
              className="min-h-11 w-40 rounded-control border border-frame-line bg-wood-inset px-3 uppercase tracking-widest text-on-wood"
              value={code}
              maxLength={6}
              autoComplete="off"
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            />
          </label>
          <Button variant="secondary" disabled={s.busy || code.length < 6} onClick={() => void s.join(code, element)}>Vào phòng</Button>
        </div>
        {errorLine}
      </div>
    );

  if (!view || !shown) {
    return (
      <>
        <section className="ui-frame p-4 max-sm:hidden" aria-label="Chuẩn bị ván">{setup}</section>
        {phone && (
          <>
            <Button variant="secondary" aria-haspopup="dialog" onClick={() => setSetupOpen(true)} className="w-full sm:hidden">
              Chuẩn bị ván: {kind === "reward" ? `đấu ${rival.name}, ${LEVEL_NAME[level]}` : "đấu người"}
            </Button>
            <BottomSheet open={setupOpen} onClose={() => setSetupOpen(false)} title="Chuẩn bị ván">{setup}</BottomSheet>
          </>
        )}
      </>
    );
  }

  const side = (c: Color, tall: boolean) => (
    <PlayerCard
      key={c}
      tall={tall}
      element={view.elements[c]}
      color={c}
      name={names(c)}
      captures={shown.captures[c]}
      active={!result && !waiting && shown.toPlay === c}
      status={!result && !waiting && shown.toPlay === c ? (aiRival && c !== view.you && s.busy ? "đang nghĩ" : "tới lượt") : undefined}
      portrait={aiRival && c === opponent(view.you) ? <Portrait id={aiRival.id} element={aiRival.element} profession={aiRival.profession} className="size-7 shrink-0" /> : undefined}
      clock={view.clockMs > 0 ? s.timeLeft(c) : undefined}
    />
  );

  const nameMap = { [BLACK]: names(BLACK), [WHITE]: names(WHITE) } as Record<Color, string>;

  return (
    <PlayCard className="sm:mt-5">
      <OrnateFrame aria-label="Vùng chơi" flush className="p-2 sm:p-4">
        <Arena
          left={(tall) => side(BLACK, tall)}
          right={(tall) => side(WHITE, tall)}
          board={
            <Board
              size={view.size}
              board={shown.board}
              elements={view.elements}
              toPlay={view.you}
              lastMove={shown.lastMove}
              interactive={canMove}
              onPlay={(p) => void send(p)}
              onPass={view.mode === "full" ? () => void send(PASS) : undefined}
              dead={result?.score?.dead ?? []}
              label={`Bàn cờ vây ${view.size} nhân ${view.size}, ${aiRival ? `đấu ${aiRival.name}` : "đấu người"}.`}
            />
          }
          below={
            <>
              <p role="status" aria-live="polite" className="min-h-5 text-center text-caption text-on-wood-soft">{notice ?? ""}</p>
              {waiting && (
                <div className="ui-frame-inset flex w-full flex-col items-center gap-2 p-3 text-center" role="status">
                  <p className="font-semibold text-on-wood">Mã phòng</p>
                  <p className="font-mono text-3xl font-bold tracking-[0.3em] text-frame-gold" data-testid="vtk-room-code">{view.code}</p>
                  <p className="text-caption text-on-wood-soft">Gửi mã này cho bạn bè. Khi họ vào phòng, đồng hồ của bạn bắt đầu chạy. Mã hết hạn sau 30 phút.</p>
                </div>
              )}
              {result?.score && <ScoreLines score={result.score} names={nameMap} />}
              {s.error && <p role="alert" className="text-caption font-semibold text-[var(--lacquer-hi)]">{SERVER_ERROR[s.error] ?? SERVER_ERROR.network}</p>}
              <div className="flex flex-wrap justify-center gap-2" role="toolbar" aria-label="Thao tác">
                {!waiting && !result && view.mode === "full" && (
                  <Button variant="secondary" size="sm" disabled={!canMove} onClick={() => void send(PASS)}>Bỏ lượt</Button>
                )}
                {waiting && <Button variant="secondary" size="sm" disabled={s.busy} onClick={() => void s.resign().then((ok) => ok && s.leave())}>Hủy phòng</Button>}
                {!waiting && !result && <SurrenderButton consequence="Ván này tính là thua, người kia thắng." onConfirm={() => void s.resign()} />}
                {result && <Button variant="secondary" size="sm" onClick={s.leave}>Ván mới</Button>}
              </div>
              <p className="text-center text-caption text-on-wood-soft">
                {view.ai ? `Có thưởng, độ khó ${LEVEL_NAME[view.ai.level]}: thắng được ${GOLD[view.ai.level]} vàng.` : "Đấu người, giao hữu."} {RULE_NAME[view.mode]}, bàn {view.size}×{view.size}.
              </p>
            </>
          }
        />

        {outcome && (
          <ResultModal open={!dismissed} tone={outcome.tone} kicker={aiRival ? `Vây Thành Kỳ, đấu ${aiRival.name}` : "Vây Thành Kỳ, đấu người"} title={outcome.title} onDismiss={() => setDismissed(true)}
            actions={<Button size="lg" autoFocus onClick={s.leave}>Ván mới</Button>}>
            <p>{outcome.text}</p>
            {view.reward !== null && <p className="font-semibold">Nhận {view.reward} vàng.</p>}
            {view.rewardCapped && <p>Hôm nay đã nhận đủ {REWARDS_PER_DAY} ván có vàng. Mai thắng tiếp sẽ có vàng.</p>}
          </ResultModal>
        )}
      </OrnateFrame>
    </PlayCard>
  );
}
