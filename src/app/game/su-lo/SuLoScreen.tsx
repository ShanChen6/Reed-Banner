"use client";

// Sử Lộ: đổ xúc xắc dẫn tướng qua mê cung lịch sử, dừng ở ô nào trả lời câu hỏi ở ô đó; sai thì quay về ô bắt đầu lượt.
// Boss trấn cổng đánh bằng match-3 một chiều. Chơi ngay trên máy, ván dở lưu ở trình duyệt.
// Luật ở src/core/su-lo, thiết kế ở docs/02-game-modes/su-lo/gdd.md.

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Pos } from "@/core/board";
import {
  SL_ADVISORS,
  SL_AIDS,
  SL_AID_NAME,
  SL_AID_USE_MAX,
  SL_BOSSES,
  SL_ERAS,
  SL_ERA_NAME,
  SL_LEVELS,
  SL_LEVEL_ORDER,
  SL_LUCK_NAME,
  SL_TRAP_NAME,
  SK_COUNSEL_NEED,
  SK_ENERGY_MAX,
  SK_MORALE_NEED,
  edgeKey,
  eraPlayable,
  newRun,
  questionById,
  reachable,
  skPhaseIndex,
  slAct,
  starsOf,
  trapShown,
  visibleCells,
  type SlAction,
  type SlAid,
  type SlCell,
  type SlEra,
  type SlLevel,
  type SlQuestion,
  type SlReason,
  type SlState,
} from "@/core/su-lo";
import { Button, ChoiceChip } from "@/components/ui";
import { ModeBanner, ModeScreen, OrnateFrame } from "@/components/game-ui";
import { TileArt } from "../art/tiles";
import { readStorage, writeStorage } from "../formation/storage";
import { ModeGuideTabs } from "../ModeGuide";

const SAVE_KEY = "reed-banner:su-lo:save:v1";
const SETUP_KEY = "reed-banner:su-lo:setup:v1";
const BEST_KEY = "reed-banner:su-lo:best:v1";

const LEVEL_NAME: Record<SlLevel, string> = { de: "Dễ", thuong: "Thường", kho: "Khó" };
const COLOR_NAME = ["", "Lục", "Vàng", "Đỏ"] as const;
const COLOR_FILL = ["", "var(--jade)", "var(--tone-c8923a)", "var(--lacquer)"] as const;

const REASON_TEXT: Record<SlReason, string> = {
  wrongPhase: "Chưa tới bước này.",
  notReachable: "Ô này không tới được với số đã đổ.",
  noAid: "Hết lượt trợ giúp này.",
  aidLimit: `Mỗi mê cung dùng tối đa ${SL_AID_USE_MAX} lần trợ giúp.`,
  aidNotHere: "Trợ giúp này không dùng được lúc này.",
  badValue: "Chọn một số từ 1 tới 6.",
  badAdvisor: "Tướng này không đi cùng bạn.",
  skirmish: "Nước đi không hợp lệ.",
  over: "Ván đã kết thúc.",
};

const freshSeed = () => (Math.random() * 0x100000000) >>> 0;

interface Setup {
  readonly level: SlLevel;
  readonly era: SlEra;
  readonly advisors: readonly string[];
}

const DEFAULT_SETUP: Setup = { level: "de", era: "ngo", advisors: ["dinhBoLinh", "nguyenBac"] };

function readSetup(): Setup {
  try {
    const v = JSON.parse(readStorage(SETUP_KEY) ?? "null") as Partial<Setup> | null;
    if (!v) return DEFAULT_SETUP;
    const level = SL_LEVEL_ORDER.includes(v.level as SlLevel) ? (v.level as SlLevel) : DEFAULT_SETUP.level;
    const era = SL_ERAS.includes(v.era as SlEra) && eraPlayable(v.era as SlEra) ? (v.era as SlEra) : DEFAULT_SETUP.era;
    const advisors = Array.isArray(v.advisors) ? v.advisors.filter((a) => SL_ADVISORS.some((x) => x.id === a)).slice(0, 2) : [];
    return { level, era, advisors: advisors.length === 2 ? advisors : DEFAULT_SETUP.advisors };
  } catch {
    return DEFAULT_SETUP;
  }
}

function readSaved(): SlState | null {
  try {
    const v = JSON.parse(readStorage(SAVE_KEY) ?? "null") as SlState | null;
    if (!v || v.version !== 1 || !SL_LEVEL_ORDER.includes(v.level) || !eraPlayable(v.era)) return null;
    if (!Array.isArray(v.maze?.cells) || v.maze.cells.length !== SL_LEVELS[v.level].cols * SL_LEVELS[v.level].rows) return null;
    if (v.question && !questionById(v.question.id)) return null;
    return v;
  } catch {
    return null;
  }
}

type Best = Partial<Record<string, { stars: number; turns: number }>>;

function readBest(): Best {
  try {
    const v = JSON.parse(readStorage(BEST_KEY) ?? "{}") as Best;
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

// ── Sa bàn ──

const CELL = 64;

function cellLook(s: SlState, i: number, seen: boolean): { label: string; fill: string; name: string } {
  const c: SlCell = s.maze.cells[i]!;
  if (!seen) return { label: "?", fill: "var(--tone-233042)", name: "chưa thấy (sương)" };
  switch (c.kind) {
    case "start":
      return { label: "Khởi", fill: "var(--wood-hi)", name: "điểm xuất phát" };
    case "exit":
      return { label: "Cổng", fill: "var(--frame-gold)", name: "cổng thành, lối ra" };
    case "boss":
      return { label: "Trấn", fill: "var(--lacquer-lo)", name: `trấn cổng: ${SL_BOSSES[s.era].name}` };
    case "gate":
      return { label: "Ải", fill: "var(--wood-panel)", name: "cửa ải, hai câu liền" };
    case "stele":
      return { label: "Bia", fill: "var(--tone-5e7468)", name: "bia đá, câu đọc hiểu" };
    case "luck":
      return { label: "Lộc", fill: "var(--tone-2e7d4f)", name: `ô may mắn: ${SL_LUCK_NAME[c.luck]}` };
    case "trap":
      if (trapShown(s, i)) return { label: "Bẫy", fill: "var(--tone-8f3324)", name: `bẫy ${SL_TRAP_NAME[c.trap]}` };
      return { label: "", fill: COLOR_FILL[2], name: "câu hỏi Vàng" };
    case "question":
      return { label: "", fill: COLOR_FILL[c.difficulty], name: `câu hỏi ${COLOR_NAME[c.difficulty]}` };
  }
}

function MazeBoard({ s, onMove }: { s: SlState; onMove: (to: number) => void }) {
  const { cols, rows, edges } = s.maze;
  const seen = useMemo(() => visibleCells(s), [s]);
  const targets = useMemo(() => (s.phase === "move" ? reachable(s) : new Map<number, number[]>()), [s]);
  const [hover, setHover] = useState<number | null>(null);
  const path = hover !== null ? targets.get(hover) ?? [] : [];
  const center = (i: number) => [(i % cols) * CELL + CELL / 2, Math.floor(i / cols) * CELL + CELL / 2] as const;
  const pathKeys = new Set(path.map((v, k) => edgeKey(k === 0 ? s.pos : path[k - 1]!, v)));

  return (
    <svg
      viewBox={`0 0 ${cols * CELL} ${rows * CELL}`}
      className="h-auto w-full max-w-[720px] select-none"
      role="group"
      aria-label={`Sa bàn mê cung ${rows} hàng ${cols} cột`}
    >
      <rect width={cols * CELL} height={rows * CELL} rx={10} fill="var(--wood-inset)" />
      {edges.map((e) => {
        const key = edgeKey(e.a, e.b);
        const [x1, y1] = center(e.a);
        const [x2, y2] = center(e.b);
        const locked = e.locked && !s.unlocked.includes(key);
        const blocked = s.blocked.some((b) => b.key === key && b.until > s.turns);
        const hidden = !seen[e.a] && !seen[e.b];
        return (
          <line
            key={key}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={pathKeys.has(key) ? "var(--frame-gold-hi)" : blocked ? "var(--danger)" : hidden ? "var(--tone-5b3a22)" : "var(--tone-a77c38)"}
            strokeWidth={pathKeys.has(key) ? 9 : 7}
            strokeDasharray={locked ? "6 7" : blocked ? "3 5" : undefined}
            strokeLinecap="round"
            opacity={locked ? 0.75 : 1}
          />
        );
      })}
      {s.maze.cells.map((_, i) => {
        const [cx, cy] = center(i);
        const look = cellLook(s, i, seen[i]!);
        const target = targets.has(i);
        const here = s.pos === i;
        const cleared = s.cleared[i] && s.maze.cells[i]!.kind !== "start";
        const where = `Hàng ${Math.floor(i / cols) + 1}, cột ${(i % cols) + 1}`;
        return (
          <g
            key={i}
            role={target ? "button" : "img"}
            tabIndex={target ? 0 : -1}
            aria-label={`${where}: ${look.name}${cleared ? ", đã thông" : ""}${here ? ", tướng đang ở đây" : ""}${target ? `, đi ${targets.get(i)!.length} bước` : ""}`}
            onClick={target ? () => onMove(i) : undefined}
            onKeyDown={target ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onMove(i)) : undefined}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover((h) => (h === i ? null : h))}
            onFocus={() => setHover(i)}
            onBlur={() => setHover((h) => (h === i ? null : h))}
            className={target ? "cursor-pointer outline-none" : ""}
          >
            <rect
              x={cx - 22}
              y={cy - 22}
              width={44}
              height={44}
              rx={9}
              fill={look.fill}
              opacity={seen[i] ? (cleared ? 0.55 : 1) : 0.8}
              stroke={target ? "var(--frame-gold-hi)" : "var(--tone-2a1b12)"}
              strokeWidth={target ? (hover === i ? 5 : 3.5) : 1.5}
            />
            {look.label && !here && (
              <text x={cx} y={cy + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill="var(--paper-hi)" style={{ pointerEvents: "none" }}>
                {look.label}
              </text>
            )}
            {cleared && !here && (
              <path d={`M${cx + 8} ${cy - 18}v16M${cx + 8} ${cy - 18}l10 4-10 4`} stroke="var(--paper-hi)" strokeWidth={2} fill="var(--lacquer)" style={{ pointerEvents: "none" }} />
            )}
            {here && (
              <g style={{ pointerEvents: "none" }}>
                <circle cx={cx} cy={cy} r={16} fill="var(--lacquer)" stroke="var(--frame-gold-hi)" strokeWidth={3} />
                <path d={`M${cx - 4} ${cy + 9}V${cy - 10}M${cx - 4} ${cy - 10}l12 4-12 5`} stroke="var(--frame-gold-hi)" strokeWidth={2.4} strokeLinejoin="round" fill="var(--frame-gold-hi)" />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Câu hỏi ──

function QuestionCard({
  q,
  hidden,
  hint,
  title,
  seconds,
  onAnswer,
}: {
  q: SlQuestion;
  hidden: readonly number[];
  hint: string | null;
  title: string;
  seconds: number | null;
  onAnswer: (a: number | readonly number[] | null) => void;
}) {
  const [left, setLeft] = useState(seconds);
  const [order, setOrder] = useState<number[]>([]);
  const [match, setMatch] = useState<(number | null)[]>(() => q.options.map(() => null));

  useEffect(() => {
    if (seconds === null) return;
    const id = window.setInterval(() => {
      setLeft((v) => {
        if (v === null || document.hidden) return v;
        if (v <= 1) {
          window.clearInterval(id);
          onAnswer(null);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [seconds, onAnswer]);

  const single = typeof q.answer === "number";
  return (
    <section className="ui-frame flex w-full flex-col gap-3 p-4" aria-label="Câu hỏi" aria-live="polite">
      <div className="flex items-center justify-between gap-2">
        <h2 className="ui-title-on-wood font-bold">{title}</h2>
        {left !== null && (
          <span className={`tabular-nums font-bold ${left <= 5 ? "text-lacquer-hi" : "text-title-on-wood"}`} aria-label={`Còn ${left} giây`}>
            {left}s
          </span>
        )}
      </div>
      {q.passage && <blockquote className="ui-frame-inset border-l-4 border-frame-gold p-3 text-[15px] italic">{q.passage}</blockquote>}
      <p className="text-[17px] font-semibold">{q.prompt}</p>
      {single && (
        <div className="grid gap-2 sm:grid-cols-2">
          {q.options.map((o, i) =>
            hidden.includes(i) ? null : (
              <Button key={i} variant="secondary" className="justify-start text-left" onClick={() => onAnswer(i)}>
                {o}
              </Button>
            ),
          )}
        </div>
      )}
      {q.kind === "order" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-on-wood-soft">Chạm lần lượt từ sớm tới muộn. Chạm lại để bỏ.</p>
          <div className="flex flex-wrap gap-2">
            {q.options.map((o, i) => {
              const at = order.indexOf(i);
              return (
                <ChoiceChip key={i} size="md" selected={at >= 0} onClick={() => setOrder(at >= 0 ? order.slice(0, at) : [...order, i])}>
                  {at >= 0 ? `${at + 1}. ` : ""}
                  {o}
                </ChoiceChip>
              );
            })}
          </div>
          <Button disabled={order.length !== q.options.length} onClick={() => onAnswer(order)}>
            Chốt thứ tự
          </Button>
        </div>
      )}
      {q.kind === "match" && (
        <div className="flex flex-col gap-2">
          {q.options.map((o, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <span className="min-w-36 font-semibold">{o}</span>
              {(q.matchWith ?? []).map((m, j) => (
                <ChoiceChip key={j} size="sm" selected={match[i] === j} onClick={() => setMatch(match.map((x, k) => (k === i ? j : x === j ? null : x)))}>
                  {m}
                </ChoiceChip>
              ))}
            </div>
          ))}
          <Button disabled={match.some((x) => x === null)} onClick={() => onAnswer(match as number[])}>
            Chốt cách nối
          </Button>
        </div>
      )}
      {hint && <p className="text-sm text-title-on-wood">{hint}</p>}
    </section>
  );
}

// ── Giao tranh ──

function Skirmish({ s, act }: { s: SlState; act: (a: SlAction) => boolean }) {
  const sk = s.skirmish!;
  const boss = SL_BOSSES[s.era];
  const [sel, setSel] = useState<Pos | null>(null);
  const [stratagem, setStratagem] = useState(false);
  const phase = skPhaseIndex(sk);
  const locked = s.phase !== "skirmish";

  const press = (p: Pos) => {
    if (locked) return;
    if (stratagem) {
      if (act({ type: "skirmish", action: { type: "stratagem", row: p.row } })) setStratagem(false);
      return;
    }
    if (!sel) return setSel(p);
    if (sel.row === p.row && sel.col === p.col) return setSel(null);
    if (Math.abs(sel.row - p.row) + Math.abs(sel.col - p.col) !== 1) return setSel(p);
    act({ type: "skirmish", action: { type: "swap", from: sel, to: p } });
    setSel(null);
  };

  const meter = (label: string, v: number, max: number, color: string) => (
    <div className="flex min-w-24 flex-1 flex-col gap-1">
      <span className="text-caption text-on-wood-soft">
        {label} {v}/{max}
      </span>
      <div className="h-2 overflow-hidden rounded bg-wood-inset">
        <div className="h-full" style={{ width: `${Math.min(100, (v / max) * 100)}%`, background: color }} />
      </div>
    </div>
  );

  return (
    <section className="flex w-full flex-col items-center gap-3" aria-label="Giao tranh">
      <div className="ui-frame flex w-full flex-col gap-2 p-3">
        <h2 className="ui-title-on-wood font-bold">{boss.name}</h2>
        <p className="text-sm">{boss.phases[phase]}</p>
        <p className="text-sm italic text-on-wood-soft">“{boss.lines[phase]}” (lời game)</p>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">
            Thành lực {sk.hp}/{sk.maxHp} · còn {sk.movesLeft} nước{sk.lastDamage > 0 ? ` · vừa gây ${sk.lastDamage}` : ""}
          </span>
          <div className="h-3 overflow-hidden rounded bg-wood-inset">
            <div className="h-full bg-lacquer transition-[width]" style={{ width: `${(sk.hp / sk.maxHp) * 100}%` }} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {meter(sk.moraleArmed ? "Sĩ khí (nước kế ×1.5)" : "Sĩ khí", sk.morale, SK_MORALE_NEED, "var(--stat-rage)")}
          {meter("Mưu", sk.counsel, SK_COUNSEL_NEED, "var(--info)")}
          {meter("Kế sách", sk.energy, SK_ENERGY_MAX, "var(--stat-energy)")}
        </div>
      </div>
      <div className="ui-frame-inset w-fit p-1 sm:p-2">
        <div
          role="grid"
          aria-label="Bàn giao tranh"
          className="grid"
          style={{ gridTemplateColumns: `repeat(${sk.board.cols}, max(28px, min(52px, calc((100vw - 3.5rem) / ${sk.board.cols}))))` }}
        >
          {sk.board.cells.map((t, i) => {
            const p = { row: Math.floor(i / sk.board.cols), col: i % sk.board.cols };
            const picked = sel?.row === p.row && sel.col === p.col;
            return (
              <div role="gridcell" key={i} className="contents">
                <button
                  type="button"
                  aria-label={`Hàng ${p.row + 1}, cột ${p.col + 1}${t ? `: ${t.kind}` : ""}`}
                  aria-pressed={picked}
                  disabled={locked}
                  onClick={() => press(p)}
                  className={`aspect-square p-0.5 ${picked ? "rounded ring-2 ring-frame-gold-hi" : ""} ${stratagem && sel === null ? "hover:bg-lacquer/40" : ""}`}
                >
                  {t && <TileArt kind={t.kind} special={t.special} className="size-full" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant={stratagem ? "primary" : "secondary"} disabled={locked || sk.energy < SK_ENERGY_MAX} aria-pressed={stratagem} onClick={() => setStratagem((v) => !v)}>
          {stratagem ? "Chọn hàng để phá" : "Kế sách: phá một hàng"}
        </Button>
        <Button variant="secondary" disabled={locked} onClick={() => act({ type: "retreat" })}>
          Rút quân
        </Button>
      </div>
      <p className="max-w-xl text-center text-sm text-on-wood-soft">
        Đổi hai ô kề nhau để ghép ba. Kiếm đánh mạnh nhất; trống và tim nạp Sĩ khí; sách nạp Mưu để Quân sư hiến kế; âm dương nạp Kế sách; bánh chưng
        cho thêm nước. Quân giặc không đánh lại.
      </p>
    </section>
  );
}

// ── Màn chính ──

export default function SuLoScreen() {
  const [setup, setSetup] = useState<Setup>(DEFAULT_SETUP);
  const [game, setGame] = useState<SlState | null>(null);
  const [best, setBest] = useState<Best>({});
  const [message, setMessage] = useState("");
  const [fastPick, setFastPick] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- đọc kho trình duyệt chỉ có ở client */
  useEffect(() => {
    setSetup(readSetup());
    setBest(readBest());
    setGame(readSaved());
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (game) writeStorage(SAVE_KEY, JSON.stringify(game));
  }, [game]);

  const changeSetup = (next: Setup) => {
    setSetup(next);
    writeStorage(SETUP_KEY, JSON.stringify(next));
  };

  const start = () => {
    setGame(newRun(setup.level, setup.era, freshSeed(), setup.advisors));
    setMessage("");
    setFastPick(false);
  };

  const act = useCallback(
    (a: SlAction): boolean => {
      if (!game) return false;
      const r = slAct(game, a);
      if (!r.ok) {
        setMessage(REASON_TEXT[r.reason]);
        return false;
      }
      setMessage("");
      setGame(r.state);
      if (r.state.phase === "won" && game.phase !== "won") {
        const key = `${r.state.era}:${r.state.level}`;
        const stars = starsOf(r.state);
        const prev = best[key];
        if (!prev || stars > prev.stars || (stars === prev.stars && r.state.turns < prev.turns)) {
          const next = { ...best, [key]: { stars, turns: r.state.turns } };
          setBest(next);
          writeStorage(BEST_KEY, JSON.stringify(next));
        }
      }
      return true;
    },
    [game, best],
  );

  const onAnswer = useCallback((answer: number | readonly number[] | null) => act({ type: "answer", answer }), [act]);
  const askAid = (aid: SlAid, extra?: { value?: number; advisor?: string }) => act({ type: "aid", aid, ...extra });

  const q = game?.question ? questionById(game.question.id) : undefined;
  const lastQ = game?.event.questionId ? questionById(game.event.questionId) : undefined;
  const cfg = game ? SL_LEVELS[game.level] : SL_LEVELS[setup.level];
  const questionTitle = (() => {
    if (!game?.question) return "";
    if (game.question.forCounsel) return "Quân sư hiến kế";
    const c = game.maze.cells[game.question.cell]!;
    if (c.kind === "gate") return game.question.chainLeft > 0 ? "Cửa ải · câu 1/2" : "Cửa ải · câu 2/2";
    if (c.kind === "stele") return "Bia đá";
    if (c.kind === "trap") return trapShown(game, game.question.cell) ? `Gỡ bẫy ${SL_TRAP_NAME[c.trap]}` : "Câu hỏi Vàng";
    if (c.kind === "luck") return SL_LUCK_NAME[c.luck];
    if (c.kind === "question") return `Câu hỏi ${COLOR_NAME[c.difficulty]}`;
    return "Câu hỏi";
  })();

  const setupPanel = (
    <section className="ui-frame flex flex-col gap-3 p-4" aria-label="Chuẩn bị">
      <h2 className="ui-title-on-wood font-bold">Chọn mê cung</h2>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Giai đoạn">
        {SL_ERAS.map((era) => (
          <ChoiceChip key={era} size="md" selected={setup.era === era} disabled={!eraPlayable(era)} onClick={() => changeSetup({ ...setup, era })}>
            {SL_ERA_NAME[era]}
            {!eraPlayable(era) && " · chờ nguồn"}
          </ChoiceChip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Độ khó">
        {SL_LEVEL_ORDER.map((lv) => (
          <ChoiceChip key={lv} size="md" selected={setup.level === lv} onClick={() => changeSetup({ ...setup, level: lv })}>
            {LEVEL_NAME[lv]} · {SL_LEVELS[lv].cols}×{SL_LEVELS[lv].rows}
            {SL_LEVELS[lv].questionSeconds ? ` · ${SL_LEVELS[lv].questionSeconds}s/câu` : ""}
          </ChoiceChip>
        ))}
      </div>
      <h3 className="font-semibold">Hai tướng đi cùng (trợ giúp Hỏi tướng)</h3>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Tướng đi cùng">
        {SL_ADVISORS.map((a) => {
          const on = setup.advisors.includes(a.id);
          return (
            <ChoiceChip
              key={a.id}
              size="sm"
              selected={on}
              onClick={() => changeSetup({ ...setup, advisors: on ? setup.advisors.filter((x) => x !== a.id) : [...setup.advisors, a.id].slice(-2) })}
            >
              {a.name}
            </ChoiceChip>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="lg" disabled={setup.advisors.length !== 2} onClick={start}>
          {game && game.phase !== "won" ? "Bỏ ván này, lên đường mới" : "Lên đường"}
        </Button>
        {best[`${setup.era}:${setup.level}`] && (
          <span className="text-sm text-on-wood-soft">
            Tốt nhất: {"★".repeat(best[`${setup.era}:${setup.level}`]!.stars)} · {best[`${setup.era}:${setup.level}`]!.turns} lượt
          </span>
        )}
      </div>
    </section>
  );

  return (
    <ModeScreen label="Sử Lộ">
      <ModeBanner
        title="Sử Lộ"
        kicker={`Giải đố lịch sử · ${game ? `${SL_ERA_NAME[game.era]} · ${LEVEL_NAME[game.level]}` : "Chuẩn bị"}`}
        description="Đổ xúc xắc dẫn tướng qua mê cung, trả lời đúng mới đứng vững ở ô vừa tới. Sai thì quay về chỗ cũ, đọc sử chép rồi thử lại."
        stats={[
          { label: "Lượt", value: game ? `${game.turns}/${cfg.starTurns}` : "–" },
          { label: "Đúng · sai", value: game ? `${game.correct} · ${game.wrong}` : "–" },
          { label: "Ấn sử", value: game?.seals ?? "–" },
        ]}
      />
      <ModeGuideTabs scene="SU_LO">
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <OrnateFrame aria-label="Vùng chơi" flush className="flex min-w-0 flex-col items-center gap-4 p-2 sm:p-5">
            {!game && setupPanel}
            {game && game.phase !== "won" && (game.skirmish ? <Skirmish s={game} act={act} /> : <MazeBoard s={game} onMove={(to) => act({ type: "move", to })} />)}
            {game && q && game.question && (
              <QuestionCard
                key={`${game.question.id}:${game.question.chainLeft}:${game.asked.length}`}
                q={q}
                hidden={game.question.hidden}
                hint={game.question.hint}
                title={questionTitle}
                seconds={cfg.questionSeconds}
                onAnswer={onAnswer}
              />
            )}
            {game?.phase === "won" && (
              <div role="status" className="ui-frame flex w-full max-w-xl flex-col items-center gap-3 p-4 text-center">
                <h2 className="ui-title-on-wood text-2xl font-bold">Thoát khỏi mê cung!</h2>
                <p className="text-3xl text-frame-gold" aria-label={`${starsOf(game)} sao`}>
                  {"★".repeat(starsOf(game))}
                  <span className="opacity-30">{"★".repeat(3 - starsOf(game))}</span>
                </p>
                <p className="text-[15px]">
                  {game.turns} lượt (mốc ★★: {cfg.starTurns}) · đúng {game.correct}, sai {game.wrong} · {game.seals} Ấn sử
                </p>
                {game.review.length > 0 && (
                  <div className="w-full text-left">
                    <h3 className="font-semibold">Ôn lại các câu trả lời sai</h3>
                    <ul className="mt-2 flex flex-col gap-2">
                      {[...new Set(game.review)].map((id) => {
                        const rq = questionById(id);
                        return rq ? (
                          <li key={id} className="ui-frame-inset p-2 text-sm">
                            <p className="font-semibold">{rq.prompt}</p>
                            <p>{rq.explanation}</p>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                )}
                <Button size="lg" autoFocus onClick={() => setGame(null)}>
                  Chọn mê cung khác
                </Button>
              </div>
            )}
          </OrnateFrame>

          <aside className="flex flex-col gap-4" aria-label="Bảng điều khiển">
            {game && game.phase !== "won" && (
              <section className="ui-frame flex flex-col gap-3 p-4" aria-label="Lượt đi">
                <h2 className="ui-title-on-wood font-bold">Lượt {game.turns + (game.phase === "roll" ? 1 : 0)}</h2>
                <p role="status" aria-live="polite" className="text-[15px]">
                  {message || game.event.text}
                </p>
                {lastQ && game.event.explanation && (
                  <div className="ui-frame-inset p-2 text-sm">
                    <p className="font-semibold">Sử chép</p>
                    <p>{game.event.explanation}</p>
                    <p className="text-caption text-on-wood-soft">Nguồn: {lastQ.sources.map((x) => `${x.id}, ${x.locator}`).join("; ")}</p>
                  </div>
                )}
                {game.phase === "roll" && (
                  <div className="flex flex-wrap gap-2">
                    <Button size="lg" onClick={() => act({ type: "roll" })}>
                      {game.doubleRoll ? "Đổ hai xúc xắc" : "Đổ xúc xắc"}
                    </Button>
                    <Button variant="secondary" disabled={game.aids.hoaToc <= 0} aria-pressed={fastPick} onClick={() => setFastPick((v) => !v)}>
                      Hỏa tốc ({game.aids.hoaToc})
                    </Button>
                  </div>
                )}
                {game.phase === "roll" && fastPick && (
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Chọn số bước">
                    {[1, 2, 3, 4, 5, 6].map((v) => (
                      <ChoiceChip key={v} size="md" selected={false} onClick={() => askAid("hoaToc", { value: v }) && setFastPick(false)}>
                        {v}
                      </ChoiceChip>
                    ))}
                  </div>
                )}
                {game.phase === "move" && <p className="text-sm text-on-wood-soft">Ô viền vàng là nơi tới được. Rê vào để xem đường đi.</p>}
              </section>
            )}

            {game && game.phase !== "won" && (
              <section className="ui-frame flex flex-col gap-2 p-4" aria-label="Trợ giúp">
                <h2 className="ui-title-on-wood font-bold">
                  Trợ giúp <span className="text-caption font-normal text-on-wood-soft">· đã dùng {game.aidsUsed}/{SL_AID_USE_MAX}</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {SL_AIDS.filter((a) => a !== "hoaToc" && a !== "hoiTuong").map((a) => (
                    <Button key={a} size="sm" variant="secondary" disabled={game.phase !== "question" || game.aids[a] <= 0} onClick={() => askAid(a)}>
                      {SL_AID_NAME[a]} ({game.aids[a]})
                    </Button>
                  ))}
                  {game.advisors.map((id) => (
                    <Button
                      key={id}
                      size="sm"
                      variant="secondary"
                      disabled={game.phase !== "question" || game.aids.hoiTuong <= 0}
                      onClick={() => askAid("hoiTuong", { advisor: id })}
                    >
                      Hỏi {SL_ADVISORS.find((x) => x.id === id)?.name} ({game.aids.hoiTuong})
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-on-wood-soft">
                  Lọc lời bỏ hai đáp án sai, Đổi câu thay câu khác, Hỏi tướng nhờ tướng đi cùng gợi ý, Hỏa tốc tự chọn số bước. Ô Sử quan cho thêm lượt trợ giúp.
                </p>
              </section>
            )}

            {game && game.phase !== "won" && !game.skirmish && (
              <section className="ui-frame flex flex-col gap-2 p-4 text-sm" aria-label="Chú giải">
                <h2 className="ui-title-on-wood font-bold">Chú giải</h2>
                <p>
                  Ô Lục, Vàng, Đỏ là câu hỏi dễ tới khó (đúng ô Vàng +1, ô Đỏ +2 Ấn sử, ô Đỏ còn mở lối tắt kề bên). Bẫy: trả lời đúng thì gỡ được, sai thì
                  dính bẫy.{cfg.fog !== null ? " Có bẫy ẩn trông như ô Vàng, và sương che ô ở xa." : ""} Lộc là ô may mắn, Bia là câu đọc đoạn trích, Ải
                  phải đúng hai câu liền, Trấn là quân giặc giữ cổng. Lối nét đứt là lối tắt còn khóa.
                </p>
              </section>
            )}

            {game && (
              <details className="ui-frame p-0" open={game.phase === "won"}>
                <summary className="cursor-pointer p-4 font-bold text-title-on-wood">Đổi mê cung, độ khó, tướng đi cùng</summary>
                <div className="px-1 pb-1">{setupPanel}</div>
              </details>
            )}
            <p className="text-sm text-on-wood-soft">
              Bản chơi thử, không cần mạng: chưa có thưởng và bảng xếp hạng. Câu hỏi đã qua lần duyệt thứ nhất, đang chờ duyệt lần hai. Ván dở lưu trên
              trình duyệt này.
            </p>
          </aside>
        </div>
      </ModeGuideTabs>
    </ModeScreen>
  );
}
