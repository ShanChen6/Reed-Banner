"use client";

// Phần dùng chung của Tam Quân Kỳ: bản đồ, sứ quân, sa bàn SVG, quân, nhật ký trận, ô chọn. Dùng cho ván ở trình duyệt
// (TamQuanKyScreen) và ván do server làm trọng tài (ServerPlay).

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { WARLORD_ENCOUNTERS, MAIN_ID } from "@/core";
import {
  BRIDGE_FILES,
  FILES,
  RANKS,
  RED,
  fileOf,
  newGame,
  play,
  rankOf,
  sq,
  squareName,
  stackPieces,
  unitPiece,
  type Level,
  type Move,
  type MoveKind,
  type PieceType,
  type Position,
  type Stack,
} from "@/core/tam-quan-ky";
import { ChoiceChip } from "@/components/ui";
import { Portrait } from "../art/portraits";
import { pickLine, type LineKind } from "./lines";
import { KIND_NAME, PIECE_MOVE, PIECE_NAME } from "./pieces";

/**
 * Bản đồ sa bàn: cùng bố cục địa hình (luật không đổi), khác cảnh. Thu muộn và Đêm trăng là bản chỉnh màu tạm từ tranh Đầm Hoa Lư,
 * chờ tranh vẽ (prompt ở art/prompts/tam-quan-ky.md mục 5). `light` là kẻ lưới màu sáng cho tranh tối.
 */
export const MAPS = [
  { id: "hoa-lu", name: "Đầm Hoa Lư", art: "/art/tam-quan-ky/sa-ban.webp", light: false },
  { id: "thu", name: "Hoa Lư thu muộn", art: "/art/tam-quan-ky/sa-ban-thu.webp", light: false },
  { id: "dem", name: "Đêm trăng tập trận", art: "/art/tam-quan-ky/sa-ban-dem.webp", light: true },
] as const;
export type BoardMap = (typeof MAPS)[number];
export const mapById = (id: string | null | undefined): BoardMap => MAPS.find((m) => m.id === id) ?? MAPS[0];

export const LEVELS: readonly Level[] = ["easy", "medium", "hard"];
export const LEVEL_NAME: Record<Level, string> = { easy: "Dễ", medium: "Thường", hard: "Khó" };


export const RIVALS = WARLORD_ENCOUNTERS.map((w) => ({ ...w.foes[0]!, place: w.place }));
export type Rival = (typeof RIVALS)[number];
export const rivalById = (id: string | undefined): Rival => RIVALS.find((r) => r.id === id) ?? RIVALS[0]!;
export const BO_LINH = "Đinh Bộ Lĩnh";

/** Đi lại các nước đã lưu, giữ từng thế cờ cho nhật ký và đi lại. */
export function positionsFor(moves: readonly Move[]): Position[] {
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

export const formatClock = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

export const freshSeed = () => (Math.random() * 2 ** 31) | 0;

/** Tên nước đi đọc được: "Voi chiến c4 → c6, tiến vào ăn". */
export function moveText(pos: Position, move: Move): string {
  const stack = pos.board[move.from];
  const piece = stack ? unitPiece(stack, move.unit) : null;
  const kind = move.kind === "move" ? "" : `, ${KIND_NAME[move.kind].toLowerCase()}`;
  return `${piece ? PIECE_NAME[piece.type] : "?"} ${squareName(move.from)} → ${squareName(move.to)}${kind}`;
}


/** Ô chọn một trong 12 sứ quân làm đối thủ (bên Xanh). */
export function RivalPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="ui-title-on-wood font-bold">Sứ quân đối địch</h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3" role="group" aria-label="Chọn sứ quân">
        {RIVALS.map((r) => (
          <ChoiceChip key={r.id} selected={r.id === value} size="md" onClick={() => onChange(r.id)} className="justify-start text-left">
            <Portrait id={r.id} element={r.element} profession={r.profession} className="size-9 shrink-0" />
            <span className="flex flex-col">
              <span>{r.name}</span>
              <span className="text-caption font-normal opacity-80">{r.title}, {r.place}</span>
            </span>
          </ChoiceChip>
        ))}
      </div>
    </div>
  );
}

/** Khung thoại của Đinh Bộ Lĩnh cạnh sa bàn. */
export function Speech({ speech }: { speech: { kind: LineKind; n: number } | null }) {
  if (!speech) return null;
  return (
    <figure className="ui-frame-inset flex items-start gap-3 p-3" aria-live="polite">
      <Portrait id={MAIN_ID} element="hoa" profession="tuongSi" className="size-11 shrink-0" />
      <div className="min-w-0">
        <figcaption className="text-caption font-semibold text-frame-gold">{BO_LINH}</figcaption>
        <blockquote className="font-serif text-[15px] leading-snug text-on-wood italic">{pickLine(speech.kind, speech.n)}</blockquote>
      </div>
    </figure>
  );
}

/** Mô tả chồng quân cho trình đọc màn hình. */
export const pieceLabel = (stack: Stack) =>
  stackPieces(stack)
    .map((p) => `${p.color === RED ? "Đỏ" : "Xanh"} ${PIECE_NAME[p.type]}${p.hero ? " (anh hùng)" : ""}`)
    .join(", ");

export function Options<T extends string | number>({ label, value, options, onChange }: {
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

export function SelectedPanel({ stack, unit, onUnit }: { stack: Stack; unit: Move["unit"]; onUnit: (u: Move["unit"]) => void }) {
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

export function MoveList({ positions, moves }: { positions: readonly Position[]; moves: readonly Move[] }) {
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

export interface BoardProps {
  readonly map: BoardMap;
  readonly position: Position;
  readonly flipped: boolean;
  readonly selected: number | null;
  readonly targets: readonly Move[];
  readonly lastMove: Move | null;
  readonly onSquare: (s: number) => void;
  readonly pieceLabel: (stack: Stack) => string;
}

export const ATTACKS: readonly MoveKind[] = ["capture", "fire", "strike"];

export function Board({ map, position, flipped, selected, targets, lastMove, onSquare, pieceLabel }: BoardProps) {
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
          {/* Tranh sa bàn (bản đồ đang chọn) vẽ đúng tỉ lệ bàn (art/prompts/tam-quan-ky.md): đầm cột a, b; bãi lau cột c; sông giữa hàng 6 và 7; cầu tre cột f, h. Xoay sa bàn thì xoay tranh nửa vòng. */}
          <image href={map.art} x={0} y={0} width={W} height={H} preserveAspectRatio="none" transform={flipped ? `rotate(180 ${W / 2} ${H / 2})` : undefined} />
          <g stroke={map.light ? "var(--tqk-token)" : "var(--tqk-line)"} strokeWidth={0.03} opacity={map.light ? 0.6 : 1}>
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

export const pieceArt = (type: PieceType) => `/art/tam-quan-ky/quan/${type}.webp`;

/** Quân: tranh tròn (một hình cho cả hai phe) trong viền màu phe. Chồng quân hiện các quân được chở ở thẻ nhỏ phía dưới. */
export function Token({ stack, cx, cy, selected }: { stack: Stack; cx: number; cy: number; selected: boolean }) {
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
