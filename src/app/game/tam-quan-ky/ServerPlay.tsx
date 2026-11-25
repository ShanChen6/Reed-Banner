"use client";

// Ván Tam Quân Kỳ do server làm trọng tài (Shan chốt 23/11/2026): đấu sứ quân có thưởng và đấu người 1vs1 bằng mã phòng.
// Sa bàn, quân và nhật ký dùng chung với ván ở trình duyệt (parts.tsx); nước đi gửi lên server, server kiểm luật rồi trả ván mới.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BLUE, RED, inCheck, legalMovesFrom, play, type Color, type Level, type Move, type Position } from "@/core/tam-quan-ky";
import { Button } from "@/components/ui";
import { BottomSheet, ResultModal, SurrenderButton } from "@/components/game-ui";
import { DuelLayout } from "../DuelLayout";
import { PlayCard } from "../PlayCard";
import { lineAfterMove, type LineKind } from "./lines";
import { KIND_NAME } from "./pieces";
import { BOARD_ASPECT, BO_LINH, Board, LEVEL_NAME, LEVELS, MoveList, Options, RivalPicker, SelectedPanel, Speech, TqkSide, formatClock, pieceLabel, positionsFor, rivalById, type BoardMap } from "./parts";
import { SERVER_ERROR, useServerMatch, type ServerKind } from "./useServerMatch";
import { useAudio } from "../audio/AudioProvider";
import { moveCue } from "./sounds";

/** Vàng thắng sứ quân theo độ khó và số ván có vàng mỗi ngày; khớp TQK_GOLD, TQK_REWARDS_PER_DAY ở src/server/tamQuanKy.ts. */
const GOLD: Record<Level, number> = { easy: 20, medium: 40, hard: 80 };
const REWARDS_PER_DAY = 3;
const ONLINE_CLOCKS = [10, 15, 30] as const;

interface Props {
  readonly kind: ServerKind;
  /** Ô "Cách chơi" của màn (đổi về ván ở trình duyệt). */
  readonly modePicker: ReactNode;
  readonly mapPicker: ReactNode;
  readonly map: BoardMap;
  readonly rivalId: string;
  readonly onRival: (id: string) => void;
  readonly phone: boolean;
  /** Báo số nước đã đi cho banner. */
  readonly onMoves: (n: number) => void;
}

export function ServerPlay({ kind, modePicker, mapPicker, map, rivalId, onRival, phone, onMoves }: Props) {
  const s = useServerMatch();
  const { play: playSound } = useAudio();
  const view = s.view;
  const [human, setHuman] = useState<Color>(RED);
  const [level, setLevel] = useState<Level>("medium");
  const [clock, setClock] = useState<number>(15);
  const [code, setCode] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [unit, setUnit] = useState<Move["unit"]>("stack");
  const [choice, setChoice] = useState<Move[] | null>(null);
  /** Nước vừa gửi, hiện trước trong lúc chờ server. */
  const [pending, setPending] = useState<Move | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [speech, setSpeech] = useState<{ kind: LineKind; n: number } | null>(null);
  const speechCount = useRef(0);

  const moves = useMemo(() => (view ? [...view.moves] : []), [view]);
  const positions = useMemo(() => positionsFor(moves), [moves]);
  const last = positions[positions.length - 1]!;
  const result = view?.result ?? null;
  const shown: Position = useMemo(() => {
    if (pending && !last.result) {
      try {
        return play(last, pending);
      } catch {
        return last;
      }
    }
    return result ? { ...last, result } : last;
  }, [last, pending, result]);
  const rival = rivalById(view?.rival ?? rivalId);
  const you = view?.you ?? RED;
  const online = (view?.mode ?? (kind === "online" ? "online" : "ai")) === "online";
  const waiting = view?.status === "waiting";
  const canMove = !!view && s.myTurn && !pending && !s.busy && !result;

  useEffect(() => onMoves(moves.length), [moves.length, onMoves]);
  // Server ghi thêm nước (của mình hay đối thủ): tiếng theo nước cuối (moveCue). Lần đầu nạp ván chỉ ghi nhớ số nước.
  const heardMoves = useRef<number | null>(null);
  useEffect(() => {
    if (!view) return;
    if (heardMoves.current !== null && moves.length > heardMoves.current) {
      const n = moves.length;
      const before = positions[n - 1];
      playSound(before ? moveCue(before, moves[n - 1]!) : "tqk.move");
    }
    heardMoves.current = moves.length;
  }, [view, moves, positions, playSound]);

  // Xoay sa bàn về phía mình khi vào ván.
  const viewId = view?.id ?? null;
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đặt hướng sa bàn một lần cho mỗi ván mới
    setFlipped(you === BLUE);
    setDismissed(false);
  }, [viewId, you]);

  // Thoại của Bộ Lĩnh theo các nước mới về từ server (nước của bạn, nước đáp của máy hoặc của người kia).
  const seen = useRef<{ id: string | null; n: number; ended: boolean }>({ id: null, n: 0, ended: false });
  useEffect(() => {
    const prev = seen.current;
    const n = positions.length - 1;
    const ended = !!result;
    if (prev.id !== viewId) {
      seen.current = { id: viewId, n, ended };
      setSpeech(null);
      return;
    }
    let line: LineKind | null = null;
    for (let i = prev.n + 1; i <= n; i++) line = lineAfterMove(positions[i - 1]!, positions[i]!) ?? (i === 1 ? "start" : line);
    if (ended && !prev.ended && result) line = result.winner === null ? "draw" : result.winner === RED ? "win" : "lose";
    seen.current = { id: viewId, n, ended };
    if (line) setSpeech({ kind: line, n: speechCount.current++ });
  }, [positions, result, viewId]);

  const targets = useMemo(
    () => (selected === null || !canMove ? [] : legalMovesFrom(shown, selected).filter((m) => m.unit === unit)),
    [shown, selected, unit, canMove],
  );

  const clearSelection = () => {
    setSelected(null);
    setUnit("stack");
    setChoice(null);
  };

  const send = async (move: Move) => {
    clearSelection();
    setPending(move);
    await s.move(move);
    setPending(null);
  };

  const onSquare = (sq: number) => {
    if (!canMove) return;
    setChoice(null);
    const stack = shown.board[sq];
    if (selected !== null) {
      const options = targets.filter((m) => m.to === sq);
      if (options.length === 1) return void send(options[0]!);
      if (options.length > 1) return setChoice(options);
    }
    if (stack && stack.carrier.color === shown.toMove && sq !== selected) {
      playSound("tqk.select");
      setSelected(sq);
      setUnit(stack.carrier.type === "h" && stack.riders.length ? 0 : "stack");
      return;
    }
    clearSelection();
  };

  const playerName = (c: Color) => {
    if (c === you) return "Bạn";
    if (online) return view?.names[c] || "Đang chờ người vào";
    return c === RED ? BO_LINH : rival.name;
  };

  const outcome = (() => {
    if (!result) return null;
    if (result.winner === null) return { tone: "neutral" as const, title: "Hòa", text: "Bên tới lượt không còn nước đi mà cũng không bị chiếu." };
    const reason = {
      checkmate: "Chủ tướng bị vây, không còn đường thoát.",
      headquarters: "Soái trướng bị chiếm giữ đủ ba lượt.",
      resign: "Bên kia đã đầu hàng.",
      timeout: "Bên kia hết giờ.",
    }[result.reason];
    const won = result.winner === you;
    return { tone: won ? ("win" as const) : ("lose" as const), title: won ? "Thắng trận!" : `${playerName(result.winner)} thắng`, text: reason };
  })();

  const setup = (
    <div className="flex flex-col gap-4">
      {modePicker}
      <RivalPicker value={rivalId} onChange={onRival} />
      {kind === "reward" ? (
        <>
          <Options label="Bạn cầm quân" value={human} onChange={setHuman}
            options={[{ value: RED, label: `Đỏ, quân ${BO_LINH} (đi trước)` }, { value: BLUE, label: `Xanh, quân ${rivalById(rivalId).name}` }]} />
          <Options label="Độ khó" value={level} onChange={setLevel} options={LEVELS.map((v) => ({ value: v, label: `${LEVEL_NAME[v]}, ${GOLD[v]} vàng` }))} />
          {mapPicker}
          <p className="text-caption text-on-wood-soft">
            Ván chạy trên máy chủ, không giới hạn giờ. Thắng được vàng theo độ khó, tối đa {REWARDS_PER_DAY} ván có vàng mỗi ngày.
          </p>
          <Button disabled={s.busy} onClick={() => void s.startAi(level, rivalId, human)}>Vào trận đấu {rivalById(rivalId).name}</Button>
        </>
      ) : (
        <>
          <Options label="Đồng hồ mỗi bên" value={clock} onChange={setClock} options={ONLINE_CLOCKS.map((m) => ({ value: m, label: `${m} phút` }))} />
          {mapPicker}
          <p className="text-caption text-on-wood-soft">
            Người mở phòng cầm Đỏ (quân {BO_LINH}), người vào bằng mã cầm Xanh. Đấu giao hữu, không có vàng.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <Button disabled={s.busy} onClick={() => void s.host(clock, rivalId)}>Mở phòng</Button>
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
            <Button variant="secondary" disabled={s.busy || code.length < 6} onClick={() => void s.join(code)}>Vào phòng</Button>
          </div>
        </>
      )}
      {s.error && <p role="alert" className="font-semibold text-[var(--lacquer-hi)]">{SERVER_ERROR[s.error] ?? SERVER_ERROR.network}</p>}
    </div>
  );

  if (!view) {
    return (
      <>
        <section className="ui-frame p-4 max-sm:hidden" aria-label="Chuẩn bị ván">{setup}</section>
        {phone && (
          <>
            <Button variant="secondary" aria-haspopup="dialog" onClick={() => setSetupOpen(true)} className="w-full sm:hidden">
              Chuẩn bị ván: {kind === "reward" ? `đấu ${rivalById(rivalId).name}, ${LEVEL_NAME[level]}` : "đấu người"}
            </Button>
            <BottomSheet open={setupOpen} onClose={() => setSetupOpen(false)} title="Chuẩn bị ván">{setup}</BottomSheet>
          </>
        )}
      </>
    );
  }

  const checkNow = !result && !waiting && inCheck(shown, shown.toMove);
  const selectedStack = selected !== null ? shown.board[selected] : null;

  const bottom: Color = flipped ? BLUE : RED;
  const top: Color = bottom === RED ? BLUE : RED;
  const side = (c: Color) => (
    <TqkSide
      color={c}
      name={playerName(c)}
      sub={!online && c !== you ? `${c === RED ? "Quân Đỏ" : "Quân Xanh"}, độ khó ${LEVEL_NAME[view.level ?? "medium"]}` : undefined}
      rival={rival}
      clock={view.clockMs > 0 ? formatClock(s.timeLeft(c)) : null}
      active={shown.toMove === c && !result && !waiting}
      status={c !== you && (s.busy || pending) ? "Đang tính nước…" : "Tới lượt"}
      check={checkNow && shown.toMove === c}
      hqHold={shown.hqHold[c]}
    />
  );

  return (
    <PlayCard className="sm:mt-5">
      <DuelLayout
        aspect={BOARD_ASPECT}
        leftCard={side(bottom)}
        rightCard={side(top)}
        leftExtra={
          <>
            {waiting && (
              <div className="ui-frame-inset flex flex-col gap-2 p-3" role="status">
                <p className="font-semibold text-on-wood">Mã phòng</p>
                <p data-testid="tqk-room-code" className="font-mono text-3xl font-bold tracking-[0.3em] text-frame-gold">{view.code}</p>
                <p className="text-caption text-on-wood-soft">Gửi mã này cho bạn bè. Khi họ vào phòng, đồng hồ quân Đỏ bắt đầu chạy. Mã hết hạn sau 30 phút.</p>
              </div>
            )}
            {bottom === RED && <Speech speech={speech} />}
            {selectedStack && <SelectedPanel stack={selectedStack} unit={unit} onUnit={(u) => { setUnit(u); setChoice(null); }} />}
            {s.error && <p role="alert" className="text-caption font-semibold text-[var(--lacquer-hi)]">{SERVER_ERROR[s.error] ?? SERVER_ERROR.network}</p>}
            <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Thao tác">
              <Button variant="secondary" size="sm" onClick={() => setFlipped((f) => !f)} aria-pressed={flipped}>Xoay sa bàn</Button>
              {waiting && <Button variant="secondary" size="sm" disabled={s.busy} onClick={() => void s.resign().then((ok) => ok && s.leave())}>Hủy phòng</Button>}
              {!waiting && !result && (
                <SurrenderButton consequence={online ? "Ván này tính là thua, người kia thắng." : `Ván này tính là thua, ${rival.name} thắng, không có vàng.`} onConfirm={() => void s.resign()} />
              )}
              {result && <Button variant="secondary" size="sm" onClick={s.leave}>Ván mới</Button>}
            </div>
          </>
        }
        rightExtra={
          <>
            {top === RED && <Speech speech={speech} />}
            <p className="text-caption text-on-wood-soft">
              {online ? "Đấu người, giao hữu." : `Có thưởng, độ khó ${LEVEL_NAME[view.level ?? "medium"]}: thắng được ${GOLD[view.level ?? "medium"]} vàng.`}
            </p>
            <MoveList positions={positions} moves={moves} />
          </>
        }
        below={
          choice && (
            <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Chọn cách đánh">
              <span className="text-on-wood">Chọn cách đánh:</span>
              {choice.map((m) => (
                <Button key={m.kind} size="sm" variant={m.kind === "capture" ? "primary" : "secondary"} onClick={() => void send(m)}>
                  {KIND_NAME[m.kind]}
                </Button>
              ))}
            </div>
          )
        }
      >
        <Board
          map={map}
          position={shown}
          flipped={flipped}
          selected={selected}
          targets={targets}
          lastMove={pending ?? (moves.length ? moves[moves.length - 1]! : null)}
          onSquare={onSquare}
          pieceLabel={pieceLabel}
        />
      </DuelLayout>

        {outcome && (
          <ResultModal
            open={!dismissed}
            tone={outcome.tone}
            kicker={online ? "Tam Quân Kỳ, đấu người" : "Tam Quân Kỳ, có thưởng"}
            title={outcome.title}
            onDismiss={() => setDismissed(true)}
            actions={<Button size="lg" autoFocus onClick={s.leave}>Ván mới</Button>}
          >
            <p>{outcome.text}</p>
            {view.reward !== null && <p className="font-semibold">Nhận {view.reward} vàng.</p>}
            {view.rewardCapped && <p>Hôm nay đã nhận đủ {REWARDS_PER_DAY} ván có vàng. Mai thắng tiếp sẽ có vàng.</p>}
          </ResultModal>
        )}
    </PlayCard>
  );
}
