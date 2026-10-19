"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  act,
  applyRewards,
  battleRewards,
  canFreeSlide,
  createBattle,
  createRng,
  GEAR_SETS,
  GEAR_SLOTS,
  getGearSet,
  getSkill,
  isAdjacent,
  ELEMENTS,
  fighterSkill,
  isAlive,
  leveledFoe,
  mainCharacter,
  mainSkills,
  needsCell,
  newProfile,
  parseProfile,
  PASSIVE,
  PASSIVES,
  playAiTurn,
  presetLoadout,
  PROFESSIONS,
  profileTeam,
  rollDrop,
  selectableActors,
  slideStep,
  STARTER_COMPANIONS,
  TIER_INFO,
  TIERS,
  tileAt,
  withGear,
  type BattleAction,
  type BattleRewards,
  type BattleEvent,
  type BattleState,
  type Difficulty,
  type Element,
  type Fighter,
  type FighterConfig,
  type GearItem,
  type LevelUp,
  type Pos,
  type Profession,
  type Profile,
  type SideConfig,
  type SkillDef,
  type Slide,
  type Tier,
} from "@/core";
import {
  DIFFICULTY_NAME,
  EFFECT_NAME,
  ELEMENT_NAME,
  ERROR_TEXT,
  GOOD_EFFECTS,
  PROFESSION_NAME,
  TILE_NAME,
  SPECIAL_NAME,
  SLOT_NAME,
  TIER_CLASS,
  TIER_COLOR_NAME,
} from "./labels";
import { bounceFrames, eventFrames, type Frame } from "./animation";
import { CloudCorner, DongSonBand, ELEMENT_COLOR, ElementIcon, FoodIcon, LeaderFlag, ShieldIcon } from "./art/icons";
import { GearIcon } from "./art/gear";
import { Portrait } from "./art/portraits";
import { SkillIcon } from "./art/skills";
import { TileArt } from "./art/tiles";
import ProgressPanel from "./ProgressPanel";

const PLAYER = 0;
const AI = 1;
const AI_DELAY_MS = 700;
const DEMO_SEED = 2026;
const DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard", "boss", "nightmare"];

/** Nguyên tố đã có bộ kỹ năng nhân vật chính. */
const MAIN_ELEMENTS = ELEMENTS.filter((e) => mainSkills(e).length > 0);

const byId = (id: string) => STARTER_COMPANIONS.find((c) => c.id === id)!;

/** Trang bị mẫu của trận demo: bậc 0 là không mặc đồ; `set` null là không bộ nào đạt mốc. */
interface DemoGear {
  readonly tier: 0 | Tier;
  readonly set: string | null;
}

/** Mặc đủ 9 món cùng hệ với nhân vật. Đội Tianwu mặc cùng bậc nhưng không có thưởng bộ. */
function gearUp(f: FighterConfig, gear: DemoGear, set: string | null): FighterConfig {
  return gear.tier === 0 ? f : withGear(f, presetLoadout(f.element, f.profession, gear.tier, set));
}

/**
 * Luyện tập: mọi kỹ năng mở sẵn, cùng một cấp. Tiến trình: đội theo hồ sơ lưu trên trình duyệt, đối thủ
 * cùng cấp với nhân vật chính.
 */
type DemoMode = "practice" | "progress";

interface Setup {
  readonly element: Element;
  readonly profession: Profession;
  readonly gear: DemoGear;
  readonly mode: DemoMode;
  readonly profile: Profile;
}

const COMPANION_IDS = ["haVan", "maiThanh"] as const;
const TEAM_IDS = ["dinhBoLinh", ...COMPANION_IDS] as const;
const FOE_IDS = ["leThach", "toKim", "phungPhong"] as const;

/** Trận demo cố định: nhân vật chính và 2 nhân vật kèm, đấu đội Tianwu 3 người. */
function demoSides({ element, profession, gear, mode, profile }: Setup): [SideConfig, SideConfig] {
  const leveled = { ...profile, element, profession };
  const team = mode === "progress" ? profileTeam(leveled, COMPANION_IDS) : [mainCharacter(element, profession), ...COMPANION_IDS.map(byId)];
  const level = profile.main.level;
  const foes = FOE_IDS.map((id) => (mode === "progress" ? leveledFoe(byId(id), level) : byId(id)));
  return [
    { fighters: team.map((f) => gearUp(f, gear, gear.set)), leader: 0 },
    { fighters: foes.map((f) => gearUp(f, gear, null)), leader: 0 },
  ];
}

function newBattle(round: number, setup: Setup): BattleState {
  return createBattle({ sides: demoSides(setup), seed: DEMO_SEED + round, timer: false, firstSide: PLAYER }).state;
}

const PROFILE_KEY = "coLau.profile.v1";

function loadProfile(): Profile {
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return parseProfile(raw ? JSON.parse(raw) : null);
  } catch {
    return newProfile();
  }
}

function saveProfile(p: Profile): void {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {
    // Trình duyệt chặn lưu trữ: hồ sơ chỉ sống tới khi tải lại trang.
  }
}

interface Outcome {
  readonly rewards: BattleRewards;
  readonly levelUps: readonly LevelUp[];
}

const fighterName = (id: string) => (id === "dinhBoLinh" ? "Đinh Bộ Lĩnh" : byId(id).name);

const NO_GEAR: DemoGear = { tier: 0, set: null };

function dropText(item: GearItem): string {
  const set = getGearSet(item.set)?.name ?? item.set;
  const prof = item.profession ? ` (${PROFESSION_NAME[item.profession]})` : "";
  return `${SLOT_NAME[item.slot]}${prof} ${TIER_INFO[item.tier].name} hệ ${ELEMENT_NAME[item.element]}, bộ ${set}`;
}

type Aim = { skill: SkillDef } | null;

/** Đang chọn hàng/cột để trượt: cho kỹ năng Phong, hoặc lần trượt miễn phí (skill null). */
type SlideAim = {
  readonly skill: SkillDef | null;
  readonly max: number;
  readonly axis?: "row";
  readonly exact?: boolean;
  readonly from: Pos | null;
} | null;

interface LogLine {
  readonly id: number;
  readonly text: string;
}

/** Số sát thương/hồi máu bay lên trên thẻ nhân vật. */
interface Float {
  readonly id: number;
  readonly side: number;
  readonly fighter: number;
  readonly text: string;
  readonly tone: "damage" | "shield" | "heal";
  /** Thứ tự trong cùng thẻ, để các số nối đuôi nhau thay vì chồng lên nhau. */
  readonly order: number;
}

const FLOAT_STAGGER_MS = 160;
const FLOAT_MS = 1100;
const FLOAT_TONE: Record<Float["tone"], string> = {
  damage: "text-rose-500",
  shield: "text-sky-400",
  heal: "text-emerald-500",
};

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    case "passive": {
      const own = state.sides[e.side];
      const passive = PASSIVES[own.fighters[own.leader]!.element].name;
      return e.side === PLAYER ? `Bị động ${passive} của phe bạn kích hoạt` : `Bị động ${passive} của đối thủ kích hoạt`;
    }
    case "slide":
      return e.free
        ? `${name(e.side, e.fighter)} trượt miễn phí ${e.slide.axis === "row" ? "hàng" : "cột"} ${e.slide.index + 1}`
        : null;
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

function slideHint(a: NonNullable<SlideAim>): string {
  const what = a.axis === "row" ? "một hàng" : "một hàng hoặc một cột";
  const how = a.exact ? `đúng ${a.max} ô` : a.max === 1 ? "1 ô" : `1–${a.max} ô`;
  return `${a.skill ? a.skill.name : "Trượt miễn phí"}: kéo ${what} đi ${how} (chọn ô đầu rồi ô đích).`;
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
  floats,
  onClick,
}: {
  fighter: Fighter;
  leader: boolean;
  rage: number | null;
  active: boolean;
  selectable: boolean;
  targetable: boolean;
  floats: readonly Float[];
  onClick?: () => void;
}) {
  const alive = isAlive(fighter);
  const ref = useRef<HTMLButtonElement>(null);
  const lastFloat = floats.at(-1)?.id;

  // Rung thẻ khi trúng đòn, viền xanh khi được hồi máu.
  useEffect(() => {
    const el = ref.current;
    if (lastFloat === undefined || !el || prefersReducedMotion()) return;
    const hit = floats.some((f) => f.tone !== "heal");
    el.animate(
      hit
        ? [
            { transform: "none" },
            { transform: "translateX(-4px)" },
            { transform: "translateX(4px)" },
            { transform: "translateX(-2px)" },
            { transform: "none" },
          ]
        : [{ boxShadow: "none" }, { boxShadow: "0 0 0 3px rgb(52 211 153 / 0.6)" }, { boxShadow: "none" }],
      { duration: hit ? 380 : 600, easing: "ease-in-out" },
    );
    // Chỉ chạy khi có lượt số mới, không chạy lại khi floats đổi vì số cũ hết hạn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastFloat]);

  const ring = targetable
    ? "ring-2 ring-rose-400"
    : active
      ? "ring-2 ring-amber-400"
      : selectable
        ? "ring-1 ring-amber-400/40"
        : "ring-1 ring-white/10";
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={!onClick || !alive}
      className={`relative w-full rounded-lg border-l-4 bg-[var(--panel)] p-2 text-left ${ring} ${alive ? "" : "opacity-40 grayscale"} disabled:cursor-default`}
      style={{ borderLeftColor: ELEMENT_COLOR[fighter.element] }}
      title={`ATK ${fighter.atk} · DEF ${fighter.def} · Máu tối đa ${fighter.maxHp}`}
    >
      <div className="mb-1 flex items-center gap-2">
        <Portrait id={fighter.id} element={fighter.element} profession={fighter.profession} className="size-9 shrink-0 md:size-7 lg:size-11" />
        <div className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-1 text-sm font-semibold">
            {leader && (
              <span title="Thủ lĩnh" className="shrink-0">
                <LeaderFlag className="size-4" />
              </span>
            )}
            <span className="truncate">{fighter.name}</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] opacity-75">
            {PROFESSION_NAME[fighter.profession]}
            <span title={ELEMENT_NAME[fighter.element]} className="shrink-0">
              <ElementIcon element={fighter.element} className="size-3.5" />
            </span>
            <span className="hidden lg:inline">{ELEMENT_NAME[fighter.element]}</span>
          </span>
        </div>
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
      {floats.map((f) => (
        <span
          key={f.id}
          aria-hidden
          className={`float-up pointer-events-none absolute right-2 top-1 flex items-center gap-0.5 text-lg font-extrabold tabular-nums drop-shadow ${FLOAT_TONE[f.tone]}`}
          style={{ animationDelay: `${f.order * FLOAT_STAGGER_MS}ms` }}
        >
          {f.tone === "shield" && <ShieldIcon className="size-4" />}
          {f.text}
        </span>
      ))}
    </button>
  );
}

const SWIPE_PX = 12;

/** Vị trí bốn họa tiết mây ở góc khung bàn cờ (hình gốc đặt ở góc trên trái). */
const CORNERS = [
  "-left-0.5 -top-0.5",
  "-right-0.5 -top-0.5 -scale-x-100",
  "-bottom-0.5 -left-0.5 -scale-y-100",
  "-bottom-0.5 -right-0.5 -scale-100",
] as const;

export default function DemoGame({ theme }: { theme: "light" | "dark" }) {
  const [round, setRound] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [started, setStarted] = useState(false);
  const [element, setElement] = useState<Element>("moc");
  const [gear, setGear] = useState<DemoGear>(NO_GEAR);
  const [profession, setProfession] = useState<Profession>("tuongSi");
  const [mode, setMode] = useState<DemoMode>("practice");
  const [profile, setProfile] = useState<Profile>(newProfile);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const setup = useMemo<Setup>(() => ({ element, profession, gear, mode, profile }), [element, profession, gear, mode, profile]);
  /** Bàn cờ xem trước khi chưa bắt đầu; dựng lại mỗi khi đổi lựa chọn trước trận. */
  const preview = useMemo(() => newBattle(round, setup), [round, setup]);
  const [live, setState] = useState<BattleState | null>(null);
  const state = live ?? preview;
  const [selected, setSelected] = useState<Pos | null>(null);
  const [cursor, setCursor] = useState<Pos>({ row: 3, col: 5 });
  const [showCursor, setShowCursor] = useState(false);
  const [aim, setAim] = useState<Aim>(null);
  const [aimIndex, setAimIndex] = useState(0);
  const [slideAim, setSlideAim] = useState<SlideAim>(null);
  const [pendingSlide, setPendingSlide] = useState<Slide | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [log, setLog] = useState<LogLine[]>([]);
  const logId = useRef(0);
  const [anim, setAnim] = useState<{ readonly frames: readonly Frame[]; readonly i: number; readonly id: number } | null>(null);
  const animId = useRef(0);
  const afterAnim = useRef<(() => void) | null>(null);
  const [floats, setFloats] = useState<Float[]>([]);
  const floatId = useRef(0);
  const drag = useRef<{ pos: Pos; x: number; y: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const playerTurn = started && state.winner === null && state.turn.side === PLAYER;
  /** Đang chạy hoạt ảnh thì chưa nhận thao tác mới. */
  const myTurn = playerTurn && anim === null;
  const actor = state.sides[PLAYER].fighters[state.turn.actor]!;
  const selectable = useMemo(() => (myTurn ? selectableActors(state) : []), [myTurn, state]);
  const skills = useMemo(() => (actor.skills ?? []).map((id) => fighterSkill(actor, id)).filter((d): d is SkillDef => !!d), [actor]);

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

  const showNumbers = useCallback((events: readonly BattleEvent[]) => {
    const order = new Map<string, number>();
    const next = events.flatMap((e): Float[] => {
      if (e.type !== "damage" && e.type !== "heal") return [];
      const items: [string, Float["tone"]][] =
        e.type === "heal"
          ? e.amount > 0
            ? [[`+${e.amount}`, "heal"]]
            : []
          : [
              ...(e.absorbed > 0 ? [[`${e.absorbed}`, "shield"] as [string, Float["tone"]]] : []),
              ...(e.amount > 0 ? [[`-${e.amount}`, "damage"] as [string, Float["tone"]]] : []),
            ];
      return items.map(([text, tone]) => {
        const key = `${e.side}:${e.fighter}`;
        const n = order.get(key) ?? 0;
        order.set(key, n + 1);
        return { id: floatId.current++, side: e.side, fighter: e.fighter, text, tone, order: n };
      });
    });
    if (next.length === 0) return;
    const ids = new Set(next.map((f) => f.id));
    setFloats((f) => [...f, ...next]);
    const last = Math.max(...next.map((f) => f.order));
    window.setTimeout(() => setFloats((f) => f.filter((x) => !ids.has(x.id))), FLOAT_MS + last * FLOAT_STAGGER_MS + 100);
  }, []);

  /** Chạy các khung hoạt ảnh rồi mới cập nhật trạng thái trận (máu, nhật ký, lượt). */
  const play = useCallback((frames: readonly Frame[], done: () => void) => {
    if (frames.length === 0 || prefersReducedMotion()) return done();
    afterAnim.current = done;
    setAnim({ frames, i: 0, id: animId.current++ });
  }, []);

  useEffect(() => {
    if (!anim) return;
    const t = window.setTimeout(() => {
      if (anim.i + 1 < anim.frames.length) return setAnim({ ...anim, i: anim.i + 1 });
      setAnim(null);
      const done = afterAnim.current;
      afterAnim.current = null;
      done?.();
    }, anim.frames[anim.i]!.ms);
    return () => window.clearTimeout(t);
  }, [anim]);

  const commit = useCallback(
    (before: BattleState, next: BattleState, events: readonly BattleEvent[]) => {
      play(eventFrames(before.board, events), () => {
        pushLog(next, events);
        setState(next);
        showNumbers(events);
        if (mode === "progress" && before.winner === null && next.winner !== null) {
          const rewards = battleRewards(next, PLAYER);
          const r = applyRewards(profile, next.sides[PLAYER].fighters.map((f) => f.id), rewards);
          setProfile(r.profile);
          saveProfile(r.profile);
          setOutcome({ rewards, levelUps: r.levelUps });
        }
      });
    },
    [play, pushLog, showNumbers, mode, profile],
  );

  const apply = useCallback(
    (action: BattleAction): boolean => {
      const r = act(state, action);
      if (!r.ok) {
        let text = ERROR_TEXT[r.error];
        if (r.error === "notEnoughEnergy" && action.type === "skill") {
          text += ` (${actor.energy}/${fighterSkill(actor, action.skill)?.cost ?? 0})`;
        }
        if (r.error === "invalidMove" && action.type === "swap") play(bounceFrames(state.board, action.from, action.to), () => {});
        flash(text);
        return false;
      }
      commit(state, r.state, r.events);
      return true;
    },
    [state, actor, flash, play, commit],
  );

  // Lượt của Tianwu: chạy trọn lượt sau một nhịp nghỉ ngắn để người chơi kịp nhìn.
  useEffect(() => {
    if (!started || state.winner !== null || state.turn.side !== AI) return;
    const t = window.setTimeout(() => {
      const r = playAiTurn(state, difficulty);
      commit(state, r.state, r.events);
    }, AI_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [started, state, difficulty, commit]);

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

  /** Bắt đầu chọn mục tiêu (đối thủ, đồng đội hoặc ô) cho kỹ năng; không cần thì dùng luôn. */
  const aimOrCast = useCallback(
    (def: SkillDef, slide?: Slide) => {
      if (def.target === "enemy" || def.target === "ally" || needsCell(def)) {
        setPendingSlide(slide ?? null);
        setAim({ skill: def });
        setSelected(null);
        const side = def.target === "ally" ? PLAYER : AI;
        const first = state.sides[side].fighters.findIndex(isAlive);
        setAimIndex(def.target === "ally" ? state.turn.actor : Math.max(0, first));
        return;
      }
      apply({ type: "skill", skill: def.id, ...(slide ? { slide } : {}) });
    },
    [state, apply],
  );

  const castSkill = useCallback(
    (def: SkillDef) => {
      if (!myTurn) return;
      if (state.turn.skillUsed) return flash(ERROR_TEXT.skillUsed);
      if (actor.energy < def.cost) return flash(`${ERROR_TEXT.notEnoughEnergy} (${actor.energy}/${def.cost})`);
      const slide = slideStep(def);
      if (slide) {
        setAim(null);
        setSelected(null);
        setSlideAim({ skill: def, max: slide.distance, axis: slide.axis, exact: slide.exact, from: null });
        return;
      }
      aimOrCast(def);
    },
    [myTurn, state, actor.energy, aimOrCast, flash],
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
        ...(pendingSlide ? { slide: pendingSlide } : {}),
      });
      if (ok) {
        setAim(null);
        setPendingSlide(null);
      }
    },
    [aim, pendingSlide, apply, flash],
  );

  /** Kéo từ ô `from` tới ô `to` cùng hàng hoặc cùng cột thành một lần trượt. */
  const pickSlide = useCallback(
    (from: Pos, to: Pos) => {
      if (!slideAim) return;
      const slide: Slide | null =
        from.row === to.row && from.col !== to.col
          ? { axis: "row", index: from.row, offset: to.col - from.col }
          : from.col === to.col && from.row !== to.row
            ? { axis: "col", index: from.col, offset: to.row - from.row }
            : null;
      const distance = slide ? Math.abs(slide.offset) : 0;
      if (
        !slide ||
        distance > slideAim.max ||
        (slideAim.axis && slide.axis !== slideAim.axis) ||
        (slideAim.exact && distance !== slideAim.max)
      ) {
        setSlideAim({ ...slideAim, from: to });
        return flash(slideHint(slideAim));
      }
      setSlideAim(null);
      if (!slideAim.skill) apply({ type: "slide", slide });
      else aimOrCast(slideAim.skill, slide);
    },
    [slideAim, apply, aimOrCast, flash],
  );

  const onCell = useCallback(
    (pos: Pos) => {
      if (!myTurn) return;
      if (slideAim) {
        if (!slideAim.from || (slideAim.from.row === pos.row && slideAim.from.col === pos.col)) {
          setSlideAim({ ...slideAim, from: slideAim.from ? null : pos });
        } else pickSlide(slideAim.from, pos);
        return;
      }
      if (aim) {
        if (needsCell(aim.skill)) fireAim(undefined, pos);
        return;
      }
      if (!selected) return setSelected(pos);
      if (selected.row === pos.row && selected.col === pos.col) return setSelected(null);
      if (isAdjacent(selected, pos)) return trySwap(selected, pos);
      setSelected(pos);
    },
    [myTurn, slideAim, aim, selected, pickSlide, fireAim, trySwap],
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
    if (slideAim && Math.max(Math.abs(dx), Math.abs(dy)) >= SWIPE_PX) {
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-row]");
      if (el) return pickSlide(d.pos, { row: Number(el.dataset.row), col: Number(el.dataset.col) });
    }
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_PX || aim || slideAim) return onCell(d.pos);
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
        setSlideAim(null);
        setPendingSlide(null);
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

  // Món rơi sau trận theo bảng rơi đồ của core; demo chỉ hiển thị, không lưu túi đồ.
  const drop = useMemo(
    () =>
      state.winner === null ? null : rollDrop(createRng(DEMO_SEED * 31 + round), difficulty, state.winner === PLAYER, `drop-${round}`),
    [state.winner, round, difficulty],
  );

  /** Về màn chọn trước trận để đổi nguyên tố, nghề, trang bị hoặc nâng kỹ năng. */
  const restart = () => {
    setRound(round + 1);
    setAnim(null);
    afterAnim.current = null;
    setFloats([]);
    setState(null);
    setOutcome(null);
    setSelected(null);
    setAim(null);
    setSlideAim(null);
    setPendingSlide(null);
    setLog([]);
    setStarted(false);
  };

  const start = () => {
    setState(preview);
    setStarted(true);
  };

  const changeProfile = (p: Profile) => {
    setProfile(p);
    saveProfile(p);
  };

  const palette =
    theme === "light"
      ? "[--bg:#f3ebdc] [--panel:#fffaf0] [--cell:#e2d3b6] [--frame:#7a2c1d] [--gold:#b8862f] text-stone-900"
      : "[--bg:#17110e] [--panel:#271d18] [--cell:#3a2c24] [--frame:#5a1e14] [--gold:#d4a24c] text-stone-100";

  const frame = anim ? anim.frames[anim.i] : undefined;
  const board = frame?.board ?? state.board;

  const aimingFoe = aim && !needsCell(aim.skill) && aim.skill.target === "enemy";
  const aimingAlly = aim && !needsCell(aim.skill) && aim.skill.target === "ally";

  const side = (s: 0 | 1) => {
    const own = state.sides[s];
    return (
      <div className="flex w-full flex-col gap-2 md:w-40 md:shrink-0 lg:w-56">
        <div className="flex items-center justify-between text-xs opacity-80">
          <span className="font-semibold">{s === PLAYER ? "Phe bạn" : "Tianwu"}</span>
          <span title="Lương thực" className="flex items-center gap-1 tabular-nums">
            <FoodIcon className="size-3.5" /> {own.food}/100
          </span>
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
              rage={own.leader === i ? own.rage : null}
              active={isActor}
              selectable={canPick && !aim}
              targetable={!!target && aimIndex === i && isAlive(f)}
              floats={floats.filter((x) => x.side === s && x.fighter === i)}
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
    <div ref={rootRef} className={`${palette} demo-bg min-h-dvh bg-[var(--bg)] p-3 sm:p-4`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-3">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="flex items-center gap-1.5 text-lg font-bold">
            <LeaderFlag className="size-6" />
            Cờ Lau · Chơi thử
          </h1>
          <div className="text-sm font-semibold" aria-live="polite">
            {!started
              ? "Chọn độ khó để bắt đầu"
              : state.winner !== null
                ? state.winner === PLAYER
                  ? "Bạn thắng!"
                  : "Tianwu thắng"
                : playerTurn
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
        <DongSonBand className="-mt-1 w-full opacity-70" />

        <div className="flex flex-col gap-3 md:flex-row md:items-start">
          {side(PLAYER)}

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="relative rounded-xl border-2 border-[var(--gold)] bg-[var(--frame)] p-1.5 shadow-lg">
            {CORNERS.map((c) => (
              <CloudCorner key={c} className={`pointer-events-none absolute z-10 size-5 ${c}`} />
            ))}
            <div
              className="relative grid touch-none select-none gap-0.5 overflow-hidden rounded-md bg-black/25 p-0.5"
              style={{ gridTemplateColumns: `repeat(${board.cols}, minmax(0, 1fr))` }}
              onPointerUp={onPointerUp}
              onPointerLeave={() => (drag.current = null)}
              role="grid"
              aria-label="Bàn cờ"
            >
              {board.cells.map((tile, i) => {
                const pos = { row: Math.floor(i / board.cols), col: i % board.cols };
                const cellAnim = frame?.anims[i];
                const from = slideAim?.from;
                const isSel =
                  (selected?.row === pos.row && selected.col === pos.col) || (from?.row === pos.row && from.col === pos.col);
                const isCur = showCursor && cursor.row === pos.row && cursor.col === pos.col;
                return (
                  <div
                    key={cellAnim ? `${anim!.id}-${anim!.i}-${i}` : i}
                    role="gridcell"
                    data-row={pos.row}
                    data-col={pos.col}
                    aria-label={tile ? (tile.special ? SPECIAL_NAME[tile.special][tile.kind] : TILE_NAME[tile.kind]) : "Ô trống"}
                    onPointerDown={(e) => onPointerDown(pos, e)}
                    className={`relative aspect-square rounded-md bg-[var(--cell)] ${
                      isSel ? "z-10 scale-110 ring-2 ring-amber-300" : ""
                    } ${isCur ? "outline-2 outline-sky-400" : ""} ${(aim && needsCell(aim.skill)) || slideAim ? "cursor-crosshair" : "cursor-pointer"}`}
                  >
                    {tile && (
                      <span
                        className={`absolute inset-0 flex items-center justify-center ${cellAnim ? `tile-anim tile-anim-${cellAnim.kind}` : ""}`}
                        style={
                          cellAnim
                            ? ({
                                "--dx": cellAnim.dx,
                                "--dy": cellAnim.dy,
                                animationDuration: `${frame!.ms}ms`,
                              } as React.CSSProperties)
                            : undefined
                        }
                      >
                        <TileArt
                          kind={tile.kind}
                          special={tile.special}
                          className={`size-full ${tile.special === "strong" ? "tile-strong" : ""}`}
                        />
                      </span>
                    )}
                  </div>
                );
              })}
              {frame?.chain && (
                <div
                  key={`${anim!.id}-${anim!.i}`}
                  className="chain-pop pointer-events-none absolute left-1/2 top-2 rounded bg-amber-500 px-3 py-1 text-sm font-bold text-stone-950 shadow"
                >
                  Chuỗi ×{frame.chain}
                </div>
              )}
              {toast && (
                <div className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto w-fit -translate-y-1/2 rounded bg-black/80 px-3 py-1.5 text-sm text-white">
                  {toast}
                </div>
              )}
              {!started && (
                <div className="absolute inset-0 flex flex-col items-center justify-center-safe gap-2 overflow-y-auto rounded-lg bg-black/60 p-2 text-white sm:gap-3">
                  <p className="text-sm">Đinh Bộ Lĩnh, Hà Vân và Mai Thanh đấu đội Tianwu.</p>
                  <div className="flex flex-wrap justify-center gap-1.5" role="radiogroup" aria-label="Chế độ">
                    {(["practice", "progress"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        role="radio"
                        aria-checked={mode === m}
                        onClick={() => {
                          if (m === "progress" && mode !== "progress") setProfile(loadProfile());
                          setMode(m);
                        }}
                        className={`rounded px-2.5 py-1 text-sm ${mode === m ? "bg-amber-500 font-semibold text-stone-950" : "bg-white/15"}`}
                      >
                        {m === "practice" ? "Luyện tập (mở hết kỹ năng)" : `Tiến trình (cấp ${profile.main.level})`}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1.5" role="radiogroup" aria-label="Nghề nhân vật chính">
                    <span className="text-xs opacity-80">Nghề:</span>
                    {PROFESSIONS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        role="radio"
                        aria-checked={profession === p}
                        onClick={() => setProfession(p)}
                        className={`rounded px-2 py-0.5 text-xs ${profession === p ? "bg-amber-500 font-semibold text-stone-950" : "bg-white/15"}`}
                      >
                        {PROFESSION_NAME[p]}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap justify-center gap-1.5" role="radiogroup" aria-label="Nguyên tố nhân vật chính">
                    {MAIN_ELEMENTS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        role="radio"
                        aria-checked={element === e}
                        onClick={() => {
                          setElement(e);
                        }}
                        className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-sm ${element === e ? "bg-amber-500 font-semibold text-stone-950" : "bg-white/15"}`}
                      >
                        <ElementIcon element={e} className="size-4" />
                        {ELEMENT_NAME[e]}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1.5" role="radiogroup" aria-label="Trang bị">
                    <span className="text-xs opacity-80">Trang bị:</span>
                    {([0, ...TIERS] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        role="radio"
                        aria-checked={gear.tier === t}
                        onClick={() => {
                          setGear({ ...gear, tier: t });
                        }}
                        className={`rounded px-2.5 py-1 text-sm ${gear.tier === t ? "bg-amber-500 font-semibold text-stone-950" : `bg-white/15 ${t === 0 ? "" : TIER_CLASS[t]}`}`}
                      >
                        {t === 0 ? "Không" : TIER_COLOR_NAME[t]}
                      </button>
                    ))}
                  </div>
                  {gear.tier !== 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-1.5" role="radiogroup" aria-label="Bộ trang bị">
                      <span className="text-xs opacity-80">Bộ:</span>
                      {[null, ...GEAR_SETS.map((g) => g.id)].map((id) => (
                        <button
                          key={id ?? "none"}
                          type="button"
                          role="radio"
                          aria-checked={gear.set === id}
                          onClick={() => {
                            setGear({ ...gear, set: id });
                          }}
                          className={`rounded px-2.5 py-1 text-sm ${gear.set === id ? "bg-amber-500 font-semibold text-stone-950" : "bg-white/15"}`}
                        >
                          {id ? getGearSet(id)!.name : "Không bộ"}
                        </button>
                      ))}
                    </div>
                  )}
                  {gear.tier !== 0 && (
                    <div className="flex flex-wrap justify-center gap-1" aria-hidden>
                      {GEAR_SLOTS.map((slot) => (
                        <GearIcon key={slot} slot={slot} element={element} tier={gear.tier as Tier} profession="tuongSi" className="size-8" />
                      ))}
                    </div>
                  )}
                  {gear.tier !== 0 && (
                    <p className="max-w-md text-center text-xs opacity-80">
                      Cả hai đội mặc đủ 9 món {TIER_COLOR_NAME[gear.tier]} cùng hệ với từng người; đội Tianwu không có thưởng bộ.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={start}
                    className="rounded bg-amber-500 px-4 py-2 font-semibold text-stone-950"
                  >
                    Bắt đầu ({DIFFICULTY_NAME[difficulty]})
                  </button>
                </div>
              )}
              {state.winner !== null && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-black/70 text-white">
                  <p className="text-xl font-bold">{state.winner === PLAYER ? "Bạn thắng!" : "Tianwu thắng"}</p>
                  <p className="text-sm">
                    {drop ? (
                      <>
                        <span className="flex items-center gap-2">
                          <GearIcon slot={drop.slot} element={drop.element} tier={drop.tier} profession={drop.profession} className="size-12 shrink-0" />
                          <span>
                            Chiến lợi phẩm: <span className={`font-semibold ${TIER_CLASS[drop.tier]}`}>{dropText(drop)}</span>
                          </span>
                        </span>
                      </>
                    ) : (
                      "Không rơi trang bị."
                    )}
                  </p>
                  {outcome && (
                    <div className="text-center text-sm">
                      <p>
                        +{outcome.rewards.xp[0]} kinh nghiệm mỗi người · +{outcome.rewards.gold} vàng
                      </p>
                      {outcome.levelUps.map((u) => (
                        <p key={u.id} className="font-semibold text-amber-300">
                          {fighterName(u.id)} lên cấp {u.level}!
                        </p>
                      ))}
                    </div>
                  )}
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
                      {mode === "progress" ? "Nâng kỹ năng & đánh tiếp" : "Chơi lại"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            </div>

            <div className="flex flex-wrap items-stretch gap-1.5" aria-label="Kỹ năng">
              <span className="w-full text-xs opacity-70">Kỹ năng của {actor.name}:</span>
              {skills.map((def, i) => {
                const disabled = !myTurn || state.turn.skillUsed || actor.energy < def.cost;
                const aiming = aim?.skill.id === def.id || slideAim?.skill?.id === def.id;
                return (
                  <button
                    key={def.id}
                    type="button"
                    onClick={() => {
                      if (!aiming) return castSkill(def);
                      setAim(null);
                      setSlideAim(null);
                      setPendingSlide(null);
                    }}
                    className={`relative flex w-[4.25rem] flex-col items-center gap-0.5 rounded p-1 text-[10px] leading-tight ${aiming ? "bg-rose-500 text-white" : "bg-[var(--panel)]"} ${
                      disabled && !aiming ? "opacity-40 grayscale" : ""
                    }`}
                    title={`${def.name} · ${def.cost} năng lượng · phím ${i + 1}`}
                  >
                    <SkillIcon def={def} className="size-10" />
                    <span className="absolute left-1 top-1 rounded-br bg-black/60 px-1 font-bold text-white">{i + 1}</span>
                    <span className="absolute right-1 top-1 rounded-bl bg-sky-700/90 px-1 tabular-nums text-white">{def.cost}</span>
                    <span className="text-center">{def.name}</span>
                  </button>
                );
              })}
              {myTurn && canFreeSlide(state) && (
                <button
                  type="button"
                  onClick={() => {
                    setAim(null);
                    setSelected(null);
                    setSlideAim(slideAim && !slideAim.skill ? null : { skill: null, max: PASSIVE.phongFreeSlide, from: null });
                  }}
                  className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${slideAim && !slideAim.skill ? "bg-rose-500 text-white" : "bg-teal-600 text-white"}`}
                >
                  <ElementIcon element="phong" className="size-3.5" /> Trượt miễn phí
                </button>
              )}
            </div>
            {slideAim && <p className="text-xs opacity-80">{slideHint(slideAim)} Esc để hủy.</p>}
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

        {mode === "progress" && (
          <ProgressPanel
            profile={{ ...profile, element }}
            teamIds={TEAM_IDS}
            locked={started && state.winner === null}
            onChange={(p) => changeProfile({ ...p, element: profile.element })}
            onReset={() => changeProfile(newProfile())}
          />
        )}

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
