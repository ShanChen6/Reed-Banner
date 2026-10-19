"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  act,
  createBattle,
  getSkill,
  isAdjacent,
  isAlive,
  mainCharacter,
  needsCell,
  PASSIVES,
  playAiTurn,
  selectableActors,
  STARTER_COMPANIONS,
  tileAt,
  type BattleAction,
  type BattleEvent,
  type BattleState,
  type Difficulty,
  type Fighter,
  type Pos,
  type SideConfig,
  type SkillDef,
} from "@/core";
import {
  DIFFICULTY_NAME,
  EFFECT_NAME,
  ELEMENT_NAME,
  ERROR_TEXT,
  GOOD_EFFECTS,
  PROFESSION_NAME,
  TILE_ICON,
} from "./labels";

const PLAYER = 0;
const AI = 1;
const AI_DELAY_MS = 700;
const DEMO_SEED = 2026;
const DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard", "boss", "nightmare"];

const byId = (id: string) => STARTER_COMPANIONS.find((c) => c.id === id)!;

/** Trận demo cố định: nhân vật chính và 2 nhân vật kèm, đấu đội Tianwu 3 người. */
function demoSides(): [SideConfig, SideConfig] {
  return [
    { fighters: [mainCharacter(), byId("haVan"), byId("maiThanh")], leader: 0 },
    { fighters: [byId("leThach"), byId("toKim"), byId("phungPhong")], leader: 0 },
  ];
}

function newBattle(round: number): BattleState {
  return createBattle({ sides: demoSides(), seed: DEMO_SEED + round, timer: false, firstSide: PLAYER }).state;
}

type Aim = { skill: SkillDef } | null;

interface LogLine {
  readonly id: number;
  readonly text: string;
}

function describe(state: BattleState, e: BattleEvent): string | null {
  const name = (side: number, i: number) => state.sides[side as 0 | 1].fighters[i]?.name ?? "?";
  switch (e.type) {
    case "skill":
      return `${name(e.side, e.fighter)} dùng ${getSkill(e.skill)?.name ?? e.skill}`;
    case "damage":
      return e.amount > 0 ? `${name(e.side, e.fighter)} mất ${e.amount} máu` : null;
    case "heal":
      return `${name(e.side, e.fighter)} hồi ${e.amount} máu`;
    case "ko":
      return `${name(e.side, e.fighter)} bị hạ gục`;
    case "passive":
      return e.side === PLAYER ? "Bị động thủ lĩnh phe bạn kích hoạt" : "Bị động thủ lĩnh đối thủ kích hoạt";
    case "shuffle":
      return "Hết nước đi, bàn cờ được xáo lại";
    case "spirit": {
      const firstAlive = state.sides[e.side].fighters.findIndex((f) => f.hp > 0);
      if (e.spirit !== 90 || e.fighter !== firstAlive) return null;
      return e.side === PLAYER ? "Trận kéo dài, tinh thần phe bạn bắt đầu giảm" : "Trận kéo dài, tinh thần đối thủ bắt đầu giảm";
    }
    case "frozenSkip":
      return e.side === PLAYER ? "Phe bạn bị Đóng băng, mất lượt" : "Đối thủ bị Đóng băng, mất lượt";
    case "end":
      return e.winner === PLAYER ? "Bạn thắng!" : "Tianwu thắng";
    default:
      return null;
  }
}

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-1.5 text-[11px] leading-none" aria-label={`${label} ${Math.round(value)}/${max}`}>
      <span className="w-6 shrink-0 opacity-70">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded bg-black/30">
        <div className={`h-full ${color} transition-[width] duration-300`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-14 shrink-0 text-right tabular-nums">
        {Math.round(value)}/{max}
      </span>
    </div>
  );
}

function FighterCard({
  fighter,
  leader,
  rage,
  active,
  selectable,
  targetable,
  onClick,
}: {
  fighter: Fighter;
  leader: boolean;
  rage: number | null;
  active: boolean;
  selectable: boolean;
  targetable: boolean;
  onClick?: () => void;
}) {
  const alive = isAlive(fighter);
  const ring = targetable
    ? "ring-2 ring-rose-400"
    : active
      ? "ring-2 ring-amber-400"
      : selectable
        ? "ring-1 ring-amber-400/40"
        : "ring-1 ring-white/10";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick || !alive}
      className={`w-full rounded-lg bg-[var(--panel)] p-2 text-left ${ring} ${alive ? "" : "opacity-40 grayscale"} disabled:cursor-default`}
    >
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="truncate text-sm font-semibold">
          {leader && <span title="Thủ lĩnh">👑 </span>}
          {fighter.name}
        </span>
        <span className="shrink-0 text-[10px] opacity-60">
          {PROFESSION_NAME[fighter.profession]} · {ELEMENT_NAME[fighter.element]}
        </span>
      </div>
      <div className="space-y-1">
        <Bar label="Máu" value={fighter.hp} max={fighter.maxHp} color="bg-rose-500" />
        <Bar label="NL" value={fighter.energy} max={100} color="bg-sky-500" />
        <Bar label="TT" value={fighter.spirit} max={100} color="bg-emerald-500" />
        {rage !== null && <Bar label="Nộ" value={rage} max={100} color="bg-orange-500" />}
      </div>
      {fighter.effects.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {fighter.effects.map((e) => (
            <span
              key={e.kind}
              className={`rounded px-1 py-0.5 text-[10px] ${GOOD_EFFECTS.includes(e.kind) ? "bg-emerald-600/40" : "bg-rose-600/40"}`}
            >
              {EFFECT_NAME[e.kind]}
              {e.kind === "shield" ? ` ${Math.round(e.value)}` : e.turns !== null ? ` ${e.turns}` : ""}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

const SWIPE_PX = 12;

export default function DemoGame({ theme }: { theme: "light" | "dark" }) {
  const [round, setRound] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [started, setStarted] = useState(false);
  const [state, setState] = useState<BattleState>(() => newBattle(0));
  const [selected, setSelected] = useState<Pos | null>(null);
  const [cursor, setCursor] = useState<Pos>({ row: 3, col: 5 });
  const [showCursor, setShowCursor] = useState(false);
  const [aim, setAim] = useState<Aim>(null);
  const [aimIndex, setAimIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [log, setLog] = useState<LogLine[]>([]);
  const logId = useRef(0);
  const drag = useRef<{ pos: Pos; x: number; y: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const myTurn = started && state.winner === null && state.turn.side === PLAYER;
  const actor = state.sides[PLAYER].fighters[state.turn.actor]!;
  const selectable = useMemo(() => (myTurn ? selectableActors(state) : []), [myTurn, state]);
  const skills = useMemo(() => (actor.skills ?? []).map((id) => getSkill(id)).filter((d): d is SkillDef => !!d), [actor]);

  const flash = useCallback((text: string) => {
    setToast(text);
    window.setTimeout(() => setToast((t) => (t === text ? null : t)), 1600);
  }, []);

  const pushLog = useCallback((s: BattleState, events: readonly BattleEvent[]) => {
    const lines = events.flatMap((e) => {
      const text = describe(s, e);
      return text ? [{ id: logId.current++, text }] : [];
    });
    if (lines.length > 0) setLog((l) => [...lines.reverse(), ...l].slice(0, 30));
  }, []);

  const apply = useCallback(
    (action: BattleAction): boolean => {
      const r = act(state, action);
      if (!r.ok) {
        let text = ERROR_TEXT[r.error];
        if (r.error === "notEnoughEnergy" && action.type === "skill") {
          text += ` (${actor.energy}/${getSkill(action.skill)?.cost ?? 0})`;
        }
        flash(text);
        return false;
      }
      pushLog(r.state, r.events);
      setState(r.state);
      return true;
    },
    [state, actor.energy, flash, pushLog],
  );

  // Lượt của Tianwu: chạy trọn lượt sau một nhịp nghỉ ngắn để người chơi kịp nhìn.
  useEffect(() => {
    if (!started || state.winner !== null || state.turn.side !== AI) return;
    const t = window.setTimeout(() => {
      const r = playAiTurn(state, difficulty);
      pushLog(r.state, r.events);
      setState(r.state);
    }, AI_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [started, state, difficulty, pushLog]);

  // Báo chiều cao cho trang cha khi được nhúng bằng iframe (ShanVerse).
  useEffect(() => {
    const el = rootRef.current;
    if (!el || window.parent === window) return;
    const post = () => window.parent.postMessage({ type: "colau:height", height: el.scrollHeight }, "*");
    const ro = new ResizeObserver(post);
    ro.observe(el);
    post();
    return () => ro.disconnect();
  }, []);

  const trySwap = useCallback(
    (from: Pos, to: Pos) => {
      setSelected(null);
      apply({ type: "swap", from, to });
    },
    [apply],
  );

  const castSkill = useCallback(
    (def: SkillDef) => {
      if (!myTurn) return;
      if (state.turn.skillUsed) return flash(ERROR_TEXT.skillUsed);
      if (actor.energy < def.cost) return flash(`${ERROR_TEXT.notEnoughEnergy} (${actor.energy}/${def.cost})`);
      if (def.target === "enemy" || def.target === "ally" || needsCell(def)) {
        setAim({ skill: def });
        setSelected(null);
        const side = def.target === "ally" ? PLAYER : AI;
        const first = state.sides[side].fighters.findIndex(isAlive);
        setAimIndex(def.target === "ally" ? state.turn.actor : Math.max(0, first));
        return;
      }
      apply({ type: "skill", skill: def.id });
    },
    [myTurn, state, actor.energy, apply, flash],
  );

  const fireAim = useCallback(
    (target?: number, cell?: Pos) => {
      if (!aim) return;
      const def = aim.skill;
      if (needsCell(def) && !cell) return flash("Chọn một ô trên bàn cờ làm tâm");
      const ok = apply({
        type: "skill",
        skill: def.id,
        ...(target !== undefined ? { target } : {}),
        ...(cell ? { cell } : {}),
      });
      if (ok) setAim(null);
    },
    [aim, apply, flash],
  );

  const onCell = useCallback(
    (pos: Pos) => {
      if (!myTurn) return;
      if (aim) {
        if (needsCell(aim.skill)) fireAim(undefined, pos);
        return;
      }
      if (!selected) return setSelected(pos);
      if (selected.row === pos.row && selected.col === pos.col) return setSelected(null);
      if (isAdjacent(selected, pos)) return trySwap(selected, pos);
      setSelected(pos);
    },
    [myTurn, aim, selected, fireAim, trySwap],
  );

  const onPointerDown = (pos: Pos, e: React.PointerEvent) => {
    setShowCursor(false);
    drag.current = { pos, x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_PX || aim) return onCell(d.pos);
    if (!myTurn) return;
    const to =
      Math.abs(dx) > Math.abs(dy)
        ? { row: d.pos.row, col: d.pos.col + Math.sign(dx) }
        : { row: d.pos.row + Math.sign(dy), col: d.pos.col };
    if (tileAt(state.board, to)) trySwap(d.pos, to);
  };

  const switchActor = useCallback(
    (step: 1 | -1) => {
      if (selectable.length <= 1) return;
      const i = selectable.indexOf(state.turn.actor);
      const next = selectable[(i + step + selectable.length) % selectable.length]!;
      apply({ type: "selectActor", fighter: next });
    },
    [selectable, state.turn.actor, apply],
  );

  // Điều khiển bàn phím, docs/design/11-giao-dien.md mục 2.3.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!myTurn) return;
      const dirs: Record<string, [number, number]> = {
        ArrowUp: [-1, 0], w: [-1, 0], W: [-1, 0],
        ArrowDown: [1, 0], s: [1, 0], S: [1, 0],
        ArrowLeft: [0, -1], a: [0, -1], A: [0, -1],
        ArrowRight: [0, 1], d: [0, 1], D: [0, 1],
      };
      const dir = dirs[e.key];
      if (aim && !needsCell(aim.skill)) {
        const side = aim.skill.target === "ally" ? PLAYER : AI;
        const n = state.sides[side].fighters.length;
        if (dir && dir[1] !== 0) {
          e.preventDefault();
          setAimIndex((i) => (i + dir[1] + n) % n);
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          fireAim(aimIndex);
        } else if (e.key === "Escape") setAim(null);
        return;
      }
      if (dir) {
        e.preventDefault();
        setShowCursor(true);
        const next = {
          row: Math.max(0, Math.min(state.board.rows - 1, cursor.row + dir[0])),
          col: Math.max(0, Math.min(state.board.cols - 1, cursor.col + dir[1])),
        };
        if (selected && !aim) {
          trySwap(selected, next);
          setCursor(next);
        } else setCursor(next);
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setShowCursor(true);
        onCell(cursor);
      } else if (e.key === "Escape") {
        setSelected(null);
        setAim(null);
      } else if (e.key === "Tab") {
        e.preventDefault();
        switchActor(e.shiftKey ? -1 : 1);
      } else if (/^[1-6]$/.test(e.key)) {
        const def = skills[Number(e.key) - 1];
        if (def) castSkill(def);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [myTurn, aim, aimIndex, cursor, selected, state, skills, fireAim, onCell, trySwap, switchActor, castSkill]);

  const restart = () => {
    const next = round + 1;
    setRound(next);
    setState(newBattle(next));
    setSelected(null);
    setAim(null);
    setLog([]);
    setStarted(true);
  };

  const palette =
    theme === "light"
      ? "[--bg:#f5f1e8] [--panel:#ffffff] [--cell:#ece4d3] text-stone-900"
      : "[--bg:#1c1917] [--panel:#292524] [--cell:#3a3330] text-stone-100";

  const aimingFoe = aim && !needsCell(aim.skill) && aim.skill.target === "enemy";
  const aimingAlly = aim && !needsCell(aim.skill) && aim.skill.target === "ally";

  const side = (s: 0 | 1) => {
    const own = state.sides[s];
    return (
      <div className="flex w-full flex-col gap-2 md:w-40 md:shrink-0 lg:w-56">
        <div className="flex items-center justify-between text-xs opacity-80">
          <span className="font-semibold">{s === PLAYER ? "Phe bạn" : "Tianwu"}</span>
          <span title="Lương thực">🍙 {own.food}/100</span>
        </div>
        {own.fighters.map((f, i) => {
          const isActor = state.winner === null && state.turn.side === s && state.turn.actor === i;
          const canPick = s === PLAYER && selectable.includes(i) && !state.turn.skillUsed;
          const target = (s === AI && aimingFoe) || (s === PLAYER && aimingAlly);
          return (
            <FighterCard
              key={f.id}
              fighter={f}
              leader={own.leader === i}
              rage={own.leader === i && PASSIVES[f.element] ? own.rage : null}
              active={isActor}
              selectable={canPick && !aim}
              targetable={!!target && aimIndex === i && isAlive(f)}
              onClick={
                target
                  ? () => fireAim(i)
                  : canPick && !aim && !isActor
                    ? () => apply({ type: "selectActor", fighter: i })
                    : undefined
              }
            />
          );
        })}
      </div>
    );
  };

  return (
    <div ref={rootRef} className={`${palette} min-h-dvh bg-[var(--bg)] p-3 sm:p-4`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-3">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-bold">Cờ Lau · Chơi thử</h1>
          <div className="text-sm font-semibold" aria-live="polite">
            {!started
              ? "Chọn độ khó để bắt đầu"
              : state.winner !== null
                ? state.winner === PLAYER
                  ? "Bạn thắng!"
                  : "Tianwu thắng"
                : myTurn
                  ? state.turn.extra
                    ? "Lượt thêm của bạn"
                    : "Lượt của bạn"
                  : "Lượt đối thủ…"}
          </div>
          <label className="flex items-center gap-2 text-xs">
            Độ khó
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="rounded bg-[var(--panel)] px-2 py-1"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {DIFFICULTY_NAME[d]}
                </option>
              ))}
            </select>
          </label>
        </header>

        <div className="flex flex-col gap-3 md:flex-row md:items-start">
          {side(PLAYER)}

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div
              className="relative grid touch-none select-none gap-0.5 rounded-lg bg-black/20 p-1"
              style={{ gridTemplateColumns: `repeat(${state.board.cols}, minmax(0, 1fr))` }}
              onPointerUp={onPointerUp}
              onPointerLeave={() => (drag.current = null)}
              role="grid"
              aria-label="Bàn cờ"
            >
              {state.board.cells.map((tile, i) => {
                const pos = { row: Math.floor(i / state.board.cols), col: i % state.board.cols };
                const isSel = selected?.row === pos.row && selected.col === pos.col;
                const isCur = showCursor && cursor.row === pos.row && cursor.col === pos.col;
                const special =
                  tile?.special === "strong"
                    ? "ring-2 ring-yellow-300"
                    : tile?.special === "weak"
                      ? "ring-2 ring-slate-300"
                      : "";
                return (
                  <div
                    key={i}
                    role="gridcell"
                    onPointerDown={(e) => onPointerDown(pos, e)}
                    className={`flex aspect-square items-center justify-center rounded bg-[var(--cell)] text-[clamp(12px,3.2vw,28px)] ${special} ${
                      isSel ? "scale-110 bg-amber-400/60" : ""
                    } ${isCur ? "outline-2 outline-sky-400" : ""} ${aim && needsCell(aim.skill) ? "cursor-crosshair" : "cursor-pointer"}`}
                  >
                    {tile ? TILE_ICON[tile.kind] : ""}
                  </div>
                );
              })}
              {toast && (
                <div className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto w-fit -translate-y-1/2 rounded bg-black/80 px-3 py-1.5 text-sm text-white">
                  {toast}
                </div>
              )}
              {!started && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-black/60 text-white">
                  <p className="text-sm">Đinh Bộ Lĩnh, Hà Vân và Mai Thanh đấu đội Tianwu.</p>
                  <button
                    type="button"
                    onClick={() => setStarted(true)}
                    className="rounded bg-amber-500 px-4 py-2 font-semibold text-stone-950"
                  >
                    Bắt đầu ({DIFFICULTY_NAME[difficulty]})
                  </button>
                </div>
              )}
              {state.winner !== null && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-black/70 text-white">
                  <p className="text-xl font-bold">{state.winner === PLAYER ? "Bạn thắng!" : "Tianwu thắng"}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <a
                      href="/"
                      target="_blank"
                      rel="noopener"
                      className="rounded bg-amber-500 px-4 py-2 font-semibold text-stone-950"
                    >
                      Lưu tiến độ &amp; chơi chiến dịch
                    </a>
                    <button type="button" onClick={restart} className="rounded bg-white/20 px-4 py-2">
                      Chơi lại
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5" aria-label="Kỹ năng">
              <span className="mr-1 text-xs opacity-70">Kỹ năng của {actor.name}:</span>
              {skills.map((def, i) => {
                const disabled = !myTurn || state.turn.skillUsed || actor.energy < def.cost;
                const aiming = aim?.skill.id === def.id;
                return (
                  <button
                    key={def.id}
                    type="button"
                    onClick={() => (aiming ? setAim(null) : castSkill(def))}
                    className={`rounded px-2 py-1 text-xs ${aiming ? "bg-rose-500 text-white" : "bg-[var(--panel)]"} ${
                      disabled && !aiming ? "opacity-40" : ""
                    }`}
                    title={`Phím ${i + 1}`}
                  >
                    {i + 1}. {def.name} <span className="opacity-60">({def.cost})</span>
                  </button>
                );
              })}
            </div>
            {aim && (
              <p className="text-xs opacity-80">
                {needsCell(aim.skill)
                  ? `Chọn ô trên bàn cờ làm tâm cho ${aim.skill.name}. Esc để hủy.`
                  : aim.skill.target === "ally"
                    ? `Chọn đồng đội cho ${aim.skill.name}. Esc để hủy.`
                    : `Chọn đối thủ cho ${aim.skill.name}. Esc để hủy.`}
              </p>
            )}
            <p className="text-[11px] opacity-60">
              Vuốt, kéo hoặc click hai ô kề nhau để đổi chỗ. Bàn phím: mũi tên hoặc WASD, Enter chọn ô, 1–6 dùng kỹ năng, Tab
              đổi người hành động, Esc hủy.
            </p>
          </div>

          {side(AI)}
        </div>

        <section aria-label="Nhật ký trận" className="max-h-32 overflow-y-auto rounded-lg bg-[var(--panel)] p-2 text-xs">
          {log.length === 0 ? (
            <p className="opacity-60">Nhật ký trận sẽ hiện ở đây.</p>
          ) : (
            <ul className="space-y-0.5">
              {log.map((l) => (
                <li key={l.id}>{l.text}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
