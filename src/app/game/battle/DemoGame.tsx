"use client";

import SkillDetails from "./SkillDetails";
import { skillText } from "./labels";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  act,
  applyProfileAction,
  applyRewards,
  battleRewards,
  canFreeWhirl,
  createBattle,
  createRng,
  getSkill,
  isAdjacent,
  isWhirlCenter,
  buildCompanion,
  buildMain,
  maxProgress,
  MAX_TIER,
  ELEMENTS,
  companionById,
  fighterSkill,
  isAlive,
  leveledFoe,
  MAIN_ID,
  needsCell,
  newProfile,
  parseProfile,
  PASSIVE,
  PASSIVES,
  playAiTurn,
  presetLoadout,
  RAID_TIER_INFO,
  profileTeam,
  receiveDrop,
  rollDrop,
  selectableActors,
  SPIRIT_EXPERIMENTS,
  type SpiritExperiment,
  spiritStatMultiplier,
  spiritHealMultiplier,
  whirlStep,
  stageById,
  STARTER_COMPANIONS,
  tileAt,
  withGear,
  GRACE_MS,
  TURN_MS,
  type BattleAction,
  type BattleRewards,
  type CampaignResult,
  type RaidResult,
  type TowerResult,
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
  type ProfileAction,
  type SideConfig,
  type SkillDef,
  type Whirl,
  type Tier,
  autoRevive,
  downedAfterWave,
  FOOD_MAX,
  SURVIVAL_FOOD,
  SURVIVAL_HEAL,
  SURVIVAL_REVIVE_FOOD,
  SURVIVAL_REVIVE_HP,
  type MatchAction,
  type SurvivalResult,
  type DailyScore,
  type SurvivalView,
  type WavePreview,
} from "@/core";
import {
  DIFFICULTY_NAME,
  EFFECT_NAME,
  ELEMENT_NAME,
  ERROR_TEXT,
  gearText,
  GOOD_EFFECTS,
  PROFESSION_NAME,
  TILE_NAME,
  SPECIAL_NAME,
  TIER_CLASS,
} from "./labels";
import { bounceFrames, eventFrames, type Frame } from "./animation";
import {
  CloudCorner,
  DongSonBand,
  ELEMENT_COLOR,
  ElementIcon,
  FoodIcon,
  LeaderFlag,
  ProfessionIcon,
  ShieldIcon,
} from "../art/icons";
import { GearIcon } from "../art/gear";
import { Portrait } from "../art/portraits";
import { SkillIcon } from "../art/skills";
import { INK, starPoints, TileArt } from "../art/tiles";
import ProgressPanel from "./ProgressPanel";
import GearPanel from "./GearPanel";
import ShopPanel from "./ShopPanel";
import SetupLobby from "./SetupLobby";
import {
  actOnline,
  createOnline,
  fetchOnline,
  fetchProfile,
  ONLINE_BATTLE_KEY,
  ONLINE_ERROR_TEXT,
  sendProfileAction,
  toBattleState,
  type ArenaResult,
  type OnlineResponse,
} from "./online";
import { SceneLink } from "../SceneContext";
import BattleStage from "../stage/BattleStage";
import { createCueBus, stageCues } from "../stage/director";

const PLAYER = 0;
const AI = 1;
const AI_DELAY_MS = 700;
/** Seed của bàn xem trước lúc mới vào (cố định để server và trình duyệt dựng cùng một bàn). */
const DEMO_SEED = 2026;
/** Seed mới cho mỗi trận chơi offline. */
const randomSeed = () => crypto.getRandomValues(new Uint32Array(1))[0]!;
const DIFFICULTIES: Difficulty[] = [
  "easy",
  "normal",
  "hard",
  "boss",
  "nightmare",
];

/** Nguyên tố đã có bộ kỹ năng nhân vật chính. */
const MAIN_ELEMENTS = ELEMENTS;

const byId = (id: string) => companionById(id)!;

/** Trang bị mẫu của trận demo: bậc 0 là không mặc đồ; `set` null là không bộ nào đạt mốc. */
interface DemoGear {
  readonly tier: 0 | Tier;
  readonly set: string | null;
}

const NO_GEAR: DemoGear = { tier: 0, set: null };
/** Chơi thử mặc định: đủ 9 món phẩm cao nhất, bộ Cờ Lau. */
const MAX_GEAR: DemoGear = { tier: MAX_TIER, set: "coLau" };

/** Mặc đủ 9 món cùng hệ với nhân vật. Đội Tianwu mặc cùng bậc nhưng không có thưởng bộ. */
function gearUp(
  f: FighterConfig,
  gear: DemoGear,
  set: string | null,
): FighterConfig {
  return gear.tier === 0
    ? f
    : withGear(f, presetLoadout(f.element, f.profession, gear.tier, set));
}

/** Nhân vật ở tiến trình tối đa: cấp 30, mọi kỹ năng cấp tối đa. */
function maxed(base: FighterConfig): FighterConfig {
  return buildCompanion(base, maxProgress(null));
}

/**
 * Luyện tập: cả hai đội ở tiến trình tối đa. Tiến trình: đội theo hồ sơ lưu trên trình duyệt, đối thủ
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

/** Đội Tianwu: 3 nhân vật kèm khởi đầu đầu tiên không có trong đội người chơi. */
const foeIds = (team: readonly string[]) =>
  STARTER_COMPANIONS.filter((c) => !team.includes(c.id))
    .slice(0, 3)
    .map((c) => c.id);

/** Nhân vật đã có hình động (src/app/game/stage/rigs.ts), cho đứng đầu đội Tianwu ở Luyện tập để xem thử. */
const SHOWCASE_FOES = ["ngoXuongXi", "phamBachHo", "tranLam", "dinhLien", "leHoan", "trinhTu", "luuCo", "dinhDien", "nguyenBac", "tranCuong", "daoLam"];
const practiceFoeIds = (team: readonly string[]) => {
  const shown = SHOWCASE_FOES.filter((id) => !team.includes(id));
  return [...shown, ...foeIds(team)].slice(0, 3);
};

/** Trận demo: nhân vật chính và 2 nhân vật kèm của hồ sơ, đấu đội Tianwu 3 người. */
function demoSides({
  element,
  profession,
  gear,
  mode,
  profile,
}: Setup): [SideConfig, SideConfig] {
  const leveled = { ...profile, element, profession };
  const team =
    mode === "progress"
      ? profileTeam(leveled, profile.team)
      : [
          buildMain(maxProgress(null), element, profession),
          ...profile.team.map((id) => maxed(byId(id))),
        ];
  const level = profile.main.level;
  const foes =
    mode === "progress"
      ? foeIds(profile.team).map((id) => leveledFoe(byId(id), level))
      : practiceFoeIds(profile.team).map((id) => maxed(byId(id)));
  // Tiến trình mặc đồ trong túi đồ của hồ sơ (profileTeam); đồ mẫu chỉ dùng ở Luyện tập.
  const preset = mode === "progress" ? NO_GEAR : gear;
  return [
    { fighters: team.map((f) => gearUp(f, preset, preset.set)), leader: 0 },
    { fighters: foes.map((f) => gearUp(f, preset, null)), leader: 0 },
  ];
}

function newBattle(seed: number, setup: Setup): BattleState {
  return createBattle({
    sides: demoSides(setup),
    seed,
    firstSide: PLAYER,
  }).state;
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
  /** Món rơi đã vào túi đồ; null khi không rơi hoặc túi đầy (bán ngay được `soldFor` vàng). */
  readonly drop: GearItem | null;
  readonly soldFor: number;
  /** Chỉ có ở trận chiến dịch online. */
  readonly campaign?: CampaignResult;
  /** Chỉ có ở trận đánh trùm online. */
  readonly raid?: RaidResult;
  /** Chỉ có ở trận leo tháp online. */
  readonly tower?: TowerResult;
  readonly survival?: SurvivalResult;
  readonly daily?: { readonly score: DailyScore; readonly rank: number | null };
  readonly arena?: ArenaResult;
}

function demoDrop(
  seed: number,
  round: number,
  difficulty: Difficulty,
  won: boolean,
): GearItem | null {
  return rollDrop(
    createRng(Math.imul(seed, 31) ^ 0x5bd1e995),
    difficulty,
    won,
    `drop-${round}`,
  );
}

const fighterName = (id: string) =>
  id === MAIN_ID ? "Đinh Bộ Lĩnh" : (companionById(id)?.name ?? id);

type Aim = { skill: SkillDef } | null;

/** Đang chọn tâm lốc xoáy: cho kỹ năng Phong, hoặc lần xoay miễn phí (skill null). */
type WhirlAim = {
  readonly skill: SkillDef | null;
  readonly max: number;
  readonly center: Pos | null;
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

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function describe(state: BattleState, e: BattleEvent): string | null {
  const name = (side: number, i: number) =>
    state.sides[side as 0 | 1].fighters[i]?.name ?? "?";
  switch (e.type) {
    case "skill":
      return `${name(e.side, e.fighter)} dùng ${getSkill(e.skill)?.name ?? e.skill}`;
    case "damage":
      return e.amount > 0
        ? `${name(e.side, e.fighter)} mất ${e.amount} máu`
        : null;
    case "heal":
      return `${name(e.side, e.fighter)} hồi ${e.amount} máu`;
    case "ko":
      return `${name(e.side, e.fighter)} bị hạ gục`;
    case "wave":
      return `Đợt ${e.wave} kéo đến`;
    case "revive":
      return `${name(e.side, e.fighter)} đứng dậy với ${e.hp} máu`;
    case "timeout":
      return e.side === PLAYER ? "Hết giờ, bạn mất lượt" : "Đối thủ hết giờ";
    case "passive": {
      const own = state.sides[e.side];
      const passive = PASSIVES[own.fighters[own.leader]!.element].name;
      return e.side === PLAYER
        ? `Bị động ${passive} của phe bạn kích hoạt`
        : `Bị động ${passive} của đối thủ kích hoạt`;
    }
    case "whirl":
      return e.free
        ? `${name(e.side, e.fighter)} xoay lốc xoáy miễn phí quanh ô hàng ${e.whirl.center.row + 1}, cột ${e.whirl.center.col + 1}`
        : null;
    case "shuffle":
      return "Hết nước đi, bàn cờ được xáo lại";
    case "spirit": {
      const firstAlive = state.sides[e.side].fighters.findIndex(
        (f) => f.hp > 0,
      );
      if (e.spirit !== 100 - SPIRIT_EXPERIMENTS[state.experimentalSpirit ?? "A"].decay || e.fighter !== firstAlive) return null;
      return e.side === PLAYER
        ? "Trận kéo dài, tinh thần phe bạn bắt đầu giảm"
        : "Trận kéo dài, tinh thần đối thủ bắt đầu giảm";
    }
    case "frozenSkip":
      return e.side === PLAYER
        ? "Phe bạn bị Đóng băng, mất lượt"
        : "Đối thủ bị Đóng băng, mất lượt";
    case "end":
      return e.winner === PLAYER ? "Bạn thắng!" : "Tianwu thắng";
    default:
      return null;
  }
}

function WaveFoes({ preview }: { preview: WavePreview }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
      {preview.foes.map((f, i) => (
        <span key={`${f.id}-${i}`} className="inline-flex items-center gap-1">
          <ElementIcon element={f.element} className="size-3.5" />
          {f.name}
        </span>
      ))}
    </span>
  );
}

/** Đồng hồ lượt trên bàn cờ: số giây còn lại và vạch cạn dần; đỏ khi còn dưới 10 giây. */
function TurnClock({
  seconds,
  mine,
  extra,
  waiting,
}: {
  seconds: number | null;
  mine: boolean;
  extra: boolean;
  waiting: boolean;
}) {
  const total = TURN_MS / 1000;
  const left = seconds ?? total;
  const urgent = mine && seconds !== null && left <= 10;
  const label = waiting
    ? "Đang chờ server…"
    : mine
      ? extra
        ? "Lượt thêm của bạn"
        : "Lượt của bạn"
      : "Đối thủ đang đi";
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border bg-[var(--panel)] px-3 py-1.5 ${
        urgent ? "border-rose-500" : "border-[var(--gold)]/60"
      }`}
      role="timer"
      aria-label={seconds === null ? label : `${label}, còn ${seconds} giây`}
    >
      <span className="w-32 shrink-0 text-sm font-semibold">{label}</span>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-black/30">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-linear ${
            !mine ? "bg-stone-400/60" : urgent ? "bg-rose-500" : "bg-amber-400"
          }`}
          style={{ width: `${(left / total) * 100}%` }}
        />
      </div>
      <span
        className={`w-12 shrink-0 text-right font-mono text-lg font-bold tabular-nums ${
          urgent ? "animate-pulse text-rose-400" : ""
        }`}
      >
        {seconds === null ? "--" : `${seconds}s`}
      </span>
    </div>
  );
}

/** Dải trên bàn cờ của sinh tồn: đợt đang đánh và báo trước đợt kế. */
function WaveBanner({
  survival,
  resting,
}: {
  survival: SurvivalView;
  resting: boolean;
}) {
  const { current, next } = survival;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-[var(--gold)]/60 bg-[var(--panel)] px-3 py-1.5 text-sm">
      <span className="font-bold">
        Đợt {survival.wave}
        {current.boss && <span className="text-rose-400"> · trùm</span>}
      </span>
      <span className="text-xs opacity-80">
        Đã vượt qua {survival.cleared} đợt
      </span>
      {next && !resting && (
        <span className="flex flex-wrap items-center gap-1 text-xs">
          <span className="font-semibold">
            Đợt kế ({next.foes.length} đối thủ cấp {next.level}
            {next.boss ? ", có sứ quân" : ""}):
          </span>
          <WaveFoes preview={next} />
        </span>
      )}
    </div>
  );
}

/** Nghỉ giữa hai đợt: hồi phục, chọn trả lương hồi sinh, vào đợt kế hoặc dừng ghi điểm. */
function BreakPanel({
  survival,
  state,
  pending,
  onNext,
  onEnd,
}: {
  survival: SurvivalView;
  state: BattleState;
  pending: boolean;
  onNext: (revive?: number) => void;
  onEnd: () => void;
}) {
  const own = state.sides[PLAYER];
  const downed = downedAfterWave(survival, state);
  const auto = autoRevive(survival.wave, downed);
  const food = Math.min(FOOD_MAX, own.food + SURVIVAL_FOOD);
  const canPay = food >= SURVIVAL_REVIVE_FOOD;
  const fallen = downed.flatMap((d, i) => (d === null ? [] : [i]));
  const next = survival.next!;
  return (
    // Điện thoại: bàn cờ thấp, nên hiện thành tấm dưới đáy màn hình thay vì phủ lên bàn cờ.
    <div className="fixed inset-x-2 bottom-2 z-30 flex max-h-[85dvh] flex-col items-center gap-3 overflow-y-auto rounded-xl border border-[var(--gold)] bg-black/90 p-3 text-center text-white shadow-2xl sm:absolute sm:inset-0 sm:max-h-none sm:justify-center sm:rounded-lg sm:border-0 sm:bg-black/75 sm:shadow-none">
      <p className="text-xl font-bold">Hạ hết đợt {survival.wave}!</p>
      <p className="max-w-md text-sm">
        Người còn đứng hồi {Math.round(SURVIVAL_HEAL * 100)}% máu, cả đội thêm{" "}
        {SURVIVAL_FOOD} lương (vào đợt với {food} lương), năng lượng giữ nguyên.
      </p>
      {fallen.length > 0 && (
        <div className="flex flex-col items-center gap-1.5 text-sm">
          {auto !== null && (
            <p className="text-emerald-300">
              {own.fighters[auto]!.name} tự đứng dậy với{" "}
              {Math.round(SURVIVAL_REVIVE_HP * 100)}% máu.
            </p>
          )}
          {auto === null && (
            <>
              <p>
                Trả {SURVIVAL_REVIVE_FOOD} lương để một người đứng dậy ngay
                {canPay ? "" : " (chưa đủ lương)"}:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {fallen.map((i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={pending || !canPay}
                    onClick={() => onNext(i)}
                    className="rounded bg-emerald-600 px-3 py-1.5 font-semibold disabled:opacity-40"
                  >
                    Hồi sinh {own.fighters[i]!.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      <div className="flex flex-col items-center gap-1 text-sm">
        <p className="font-semibold">
          Đợt {next.wave}: {next.foes.length} đối thủ cấp {next.level}
          {next.boss ? ", có sứ quân dẫn quân" : ""}
        </p>
        <WaveFoes preview={next} />
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => onNext()}
          className="rounded bg-amber-500 px-4 py-2 font-semibold text-stone-950 disabled:opacity-50"
        >
          Vào đợt {next.wave}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onEnd}
          className="rounded bg-white/20 px-4 py-2 disabled:opacity-50"
        >
          Dừng, ghi {survival.cleared} đợt
        </button>
      </div>
    </div>
  );
}

function whirlHint(a: NonNullable<WhirlAim>): string {
  const name = a.skill ? a.skill.name : "Xoay miễn phí";
  return a.center
    ? `${name}: chọn chiều xoay${a.max > 1 ? " và số nấc" : ""} (phím Q ↺, E ↻${a.max > 1 ? ", Shift để xoay 2 nấc" : ""}).`
    : `${name}: chạm một ô không sát mép làm tâm, 8 ô quanh nó sẽ xoay vòng.`;
}

/** Ô nằm trong vòng 8 ô quanh tâm lốc xoáy. */
const inRing = (c: Pos, p: Pos) =>
  Math.max(Math.abs(c.row - p.row), Math.abs(c.col - p.col)) === 1;

function Bar({
  value,
  max,
  color,
  label,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div
      className="flex items-center gap-1.5 text-[11px] leading-none"
      aria-label={`${label} ${Math.round(value)}/${max}`}
    >
      <span className="w-6 shrink-0 opacity-70">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded bg-black/30">
        <div
          className={`h-full ${color} transition-[width] duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-14 shrink-0 text-right tabular-nums">
        {Math.round(value)}/{max}
      </span>
    </div>
  );
}

function FighterCard({
  fighter,
  experimentalSpirit = "A",
  leader,
  rage,
  active,
  selectable,
  targetable,
  floats,
  onClick,
}: {
  fighter: Fighter;
  experimentalSpirit?: SpiritExperiment;
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
        : [
            { boxShadow: "none" },
            { boxShadow: "0 0 0 3px rgb(52 211 153 / 0.6)" },
            { boxShadow: "none" },
          ],
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
        <Portrait
          id={fighter.id}
          element={fighter.element}
          profession={fighter.profession}
          className="size-9 shrink-0 md:size-7 lg:size-11"
        />
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
            <span
              title={PROFESSION_NAME[fighter.profession]}
              className="shrink-0"
            >
              <ProfessionIcon
                profession={fighter.profession}
                className="size-3.5"
              />
              <span className="sr-only">
                {PROFESSION_NAME[fighter.profession]}
              </span>
            </span>
            <span title={ELEMENT_NAME[fighter.element]} className="shrink-0">
              <ElementIcon element={fighter.element} className="size-3.5" />
            </span>
            <span className="hidden lg:inline">
              {ELEMENT_NAME[fighter.element]}
            </span>
          </span>
        </div>
      </div>
      <div className="space-y-1">
        <Bar
          label="Máu"
          value={fighter.hp}
          max={fighter.maxHp}
          color="bg-rose-500"
        />
        <Bar label="NL" value={fighter.energy} max={100} color="bg-sky-500" />
        <Bar
          label="TT"
          value={fighter.spirit}
          max={100}
          color="bg-emerald-500"
        />
        {rage !== null && (
          <Bar label="Nộ" value={rage} max={100} color="bg-orange-500" />
        )}
      </div>
      <p className="mt-1 text-[10px] opacity-75" title={`Từ lượt 25 của phe, Tinh thần giảm ${SPIRIT_EXPERIMENTS[experimentalSpirit].decay} mỗi lượt; không giảm thêm ở lượt thêm. Khiên đã có giữ nguyên.`}>
        Tinh thần: Công/Thủ {Math.round(spiritStatMultiplier(fighter.spirit, experimentalSpirit)*100)}% · Hồi/Khiên mới {Math.round(spiritHealMultiplier(fighter.spirit, experimentalSpirit)*100)}%
      </p>
      {fighter.effects.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {fighter.effects.map((e) => (
            <span
              key={e.kind}
              className={`rounded px-1 py-0.5 text-[10px] ${GOOD_EFFECTS.includes(e.kind) ? "bg-emerald-600/40" : "bg-rose-600/40"}`}
            >
              {EFFECT_NAME[e.kind]}
              {e.kind === "shield"
                ? ` ${Math.round(e.value)}`
                : e.turns !== null
                  ? ` ${e.turns}`
                  : ""}
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
/** Huy hiệu giữa mép trên khung bàn cờ: mặt trống đồng mạ vàng, hai bên là dải mây cuộn. */
function BoardCrest({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 32" className={className} aria-hidden focusable="false">
      <g fill="none" stroke="url(#tile-gilt)" strokeWidth={3} strokeLinecap="round">
        <path d="M62 18 C50 18 44 10 34 12 C26 14 26 24 34 24 C40 24 40 17 35 17" />
        <path d="M98 18 C110 18 116 10 126 12 C134 14 134 24 126 24 C120 24 120 17 125 17" />
        <path d="M30 21 C20 23 12 22 4 26 M130 21 C140 23 148 22 156 26" strokeWidth={2} />
      </g>
      <circle cx={80} cy={16} r={15} fill="url(#tile-gilt)" stroke={INK} strokeWidth={1.2} />
      <circle cx={80} cy={16} r={11.5} fill="#5e3b1f" stroke={INK} strokeWidth={0.8} />
      <polygon points={starPoints(80, 16, 10, 3.8, 14)} fill="url(#tile-gold)" />
      <circle cx={80} cy={16} r={2.4} fill="#c2410c" />
    </svg>
  );
}

const CORNERS = [
  "-left-0.5 -top-0.5",
  "-right-0.5 -top-0.5 -scale-x-100",
  "-bottom-0.5 -left-0.5 -scale-y-100",
  "-bottom-0.5 -right-0.5 -scale-100",
] as const;

/**
 * Phân cảnh trận đấu. `online`: trận do server xử lý qua /api/battles (PLAYING), đồng hồ 30 giây bật; ngược
 * lại chạy hoàn toàn trong trình duyệt (PRACTICE).
 */
export default function DemoGame({
  theme,
  online = false,
  autoResume = false,
}: {
  theme: "light" | "dark";
  online?: boolean;
  /** Vào phân cảnh là tiếp tục ngay trận online đã lưu (Chiến dịch, Leo tháp, … vừa tạo trận rồi chuyển sang). */
  autoResume?: boolean;
}) {
  const [round, setRound] = useState(0);
  const [seed, setSeed] = useState(DEMO_SEED);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  // Chơi thử vào trận ngay khi mở màn (xem replay); Chơi online chờ người chơi chọn rồi tạo trận trên server.
  const [started, setStarted] = useState(false);
  /** Chơi thử chưa vào trận đầu: chưa hiện màn chờ. */
  const [booting, setBooting] = useState(!online);
  const [element, setElement] = useState<Element>("moc");
  const [gear, setGear] = useState<DemoGear>(MAX_GEAR);
  const [profession, setProfession] = useState<Profession>("tuongSi");
  // Chơi online luôn chơi theo hồ sơ trên server.
  const [mode, setMode] = useState<DemoMode>(online ? "progress" : "practice");
  const [profile, setProfile] = useState<Profile>(newProfile);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  /** Màn chiến dịch của trận online đang chơi. */
  const [stage, setStage] = useState<string | null>(null);
  const [towerFloorNo, setTowerFloorNo] = useState<number | null>(null);
  /** Sinh tồn: đợt, người gục, báo trước đợt kế. */
  const [survival, setSurvival] = useState<SurvivalView | null>(null);
  /** Thử thách hằng ngày: khóa ngày của trận đang chơi. */
  const [dailyDay, setDailyDay] = useState<string | null>(null);
  /** Đấu trường: tên và điểm đối thủ. */
  const [arenaFoe, setArenaFoe] = useState<{
    name: string;
    rating: number;
  } | null>(null);
  const setup = useMemo<Setup>(
    () => ({ element, profession, gear, mode, profile }),
    [element, profession, gear, mode, profile],
  );
  /** Bàn cờ xem trước khi chưa bắt đầu; dựng lại mỗi khi đổi lựa chọn trước trận. */
  const preview = useMemo(() => newBattle(seed, setup), [seed, setup]);
  const [live, setState] = useState<BattleState | null>(null);
  const state = live ?? preview;
  const [selected, setSelected] = useState<Pos | null>(null);
  const [cursor, setCursor] = useState<Pos>({ row: 3, col: 5 });
  const [showCursor, setShowCursor] = useState(false);
  const [aim, setAim] = useState<Aim>(null);
  const [aimIndex, setAimIndex] = useState(0);
  const [whirlAim, setWhirlAim] = useState<WhirlAim>(null);
  const [pendingWhirl, setPendingWhirl] = useState<Whirl | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [log, setLog] = useState<LogLine[]>([]);
  const logId = useRef(0);
  const [anim, setAnim] = useState<{
    readonly frames: readonly Frame[];
    readonly i: number;
    readonly id: number;
  } | null>(null);
  const animId = useRef(0);
  const afterAnim = useRef<(() => void) | null>(null);
  const [floats, setFloats] = useState<Float[]>([]);
  /** Kênh động tác cho sân khấu trận. */
  const [cueBus] = useState(createCueBus);
  const floatId = useRef(0);
  const drag = useRef<{ pos: Pos; x: number; y: number } | null>(null);
  /** Trận online: id, seq server đang có, đang chờ server trả lời, lệch giờ so với server. */
  const [battleId, setBattleId] = useState<string | null>(null);
  const seq = useRef(0);
  const [pending, setPending] = useState(false);
  const clockOffset = useRef(0);
  const [clock, setClock] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const playerTurn =
    started && state.winner === null && state.turn.side === PLAYER;
  /** Sinh tồn: vừa hạ hết một đợt, chờ người chơi vào đợt kế (hoặc dừng). */
  const atBreak =
    survival !== null && !survival.done && state.winner === PLAYER;
  /** Đang chạy hoạt ảnh thì chưa nhận thao tác mới. */
  const myTurn = playerTurn && anim === null && !pending;
  const actor = state.sides[PLAYER].fighters[state.turn.actor]!;
  const selectable = useMemo(
    () => (myTurn ? selectableActors(state) : []),
    [myTurn, state],
  );
  const skills = useMemo(
    () =>
      (actor.skills ?? [])
        .map((id) => fighterSkill(actor, id))
        .filter((d): d is SkillDef => !!d),
    [actor],
  );

  const flash = useCallback((text: string) => {
    setToast(text);
    window.setTimeout(() => setToast((t) => (t === text ? null : t)), 1600);
  }, []);

  const pushLog = useCallback(
    (s: BattleState, events: readonly BattleEvent[]) => {
      const lines = events.flatMap((e) => {
        const text = describe(s, e);
        return text ? [{ id: logId.current++, text }] : [];
      });
      if (lines.length > 0)
        setLog((l) => [...lines.reverse(), ...l].slice(0, 30));
    },
    [],
  );

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
              ...(e.absorbed > 0
                ? [[`${e.absorbed}`, "shield"] as [string, Float["tone"]]]
                : []),
              ...(e.amount > 0
                ? [[`-${e.amount}`, "damage"] as [string, Float["tone"]]]
                : []),
            ];
      return items.map(([text, tone]) => {
        const key = `${e.side}:${e.fighter}`;
        const n = order.get(key) ?? 0;
        order.set(key, n + 1);
        return {
          id: floatId.current++,
          side: e.side,
          fighter: e.fighter,
          text,
          tone,
          order: n,
        };
      });
    });
    if (next.length === 0) return;
    const ids = new Set(next.map((f) => f.id));
    setFloats((f) => [...f, ...next]);
    const last = Math.max(...next.map((f) => f.order));
    window.setTimeout(
      () => setFloats((f) => f.filter((x) => !ids.has(x.id))),
      FLOAT_MS + last * FLOAT_STAGGER_MS + 100,
    );
  }, []);

  /** Chạy các khung hoạt ảnh rồi mới cập nhật trạng thái trận (máu, nhật ký, lượt). */
  const play = useCallback((frames: readonly Frame[], done: () => void) => {
    if (frames.length === 0 || prefersReducedMotion()) return done();
    afterAnim.current = done;
    setAnim({ frames, i: 0, id: animId.current++ });
  }, []);

  // Chơi online: tải hồ sơ trên server, chọn sẵn nguyên tố và nghề đã dùng lần trước.
  useEffect(() => {
    if (!online) return;
    void fetchProfile().then((r) => {
      if (!r.profile) return;
      setProfile(r.profile);
      setElement(r.profile.element);
      setProfession(r.profile.profession);
    });
  }, [online]);

  useEffect(() => {
    if (!anim) return;
    const t = window.setTimeout(() => {
      if (anim.i + 1 < anim.frames.length)
        return setAnim({ ...anim, i: anim.i + 1 });
      setAnim(null);
      const done = afterAnim.current;
      afterAnim.current = null;
      done?.();
    }, anim.frames[anim.i]!.ms);
    return () => window.clearTimeout(t);
  }, [anim]);

  const commit = useCallback(
    (
      before: BattleState,
      after: BattleState,
      events: readonly BattleEvent[],
    ) => {
      const cues = stageCues(before, events);
      cueBus.emit(cues.start);
      play(eventFrames(before.board, events), () => {
        // Chơi offline: đồng hồ lượt mới tính từ lúc hoạt ảnh xong, thời gian xem hoạt ảnh không bị trừ.
        const shown =
          !online &&
          after.turn.deadline !== null &&
          after.turn.deadline !== before.turn.deadline
            ? {
                ...after,
                turn: { ...after.turn, deadline: Date.now() + TURN_MS },
              }
            : after;
        pushLog(shown, events);
        setState(shown);
        showNumbers(events);
        cueBus.emit(cues.end);
        // Trận online: server cộng thưởng và gửi `outcome` (xem receive).
        if (
          !online &&
          mode === "progress" &&
          before.winner === null &&
          after.winner !== null
        ) {
          const rewards = battleRewards(after, PLAYER);
          const r = applyRewards(
            profile,
            after.sides[PLAYER].fighters.map((f) => f.id),
            rewards,
          );
          const rolled = demoDrop(
            seed,
            round,
            difficulty,
            after.winner === PLAYER,
          );
          const received = rolled
            ? receiveDrop(r.profile, rolled)
            : { profile: r.profile, item: null, soldFor: 0 };
          setProfile(received.profile);
          saveProfile(received.profile);
          setOutcome({
            rewards,
            levelUps: r.levelUps,
            drop: received.item,
            soldFor: received.soldFor,
          });
        }
      });
    },
    [
      play,
      pushLog,
      showNumbers,
      cueBus,
      online,
      mode,
      profile,
      seed,
      round,
      difficulty,
    ],
  );

  /** Nhận trả lời của server: chạy hoạt ảnh các sự kiện rồi đồng bộ trạng thái và seq. */
  const receive = useCallback(
    (before: BattleState, res: OnlineResponse) => {
      clockOffset.current = res.now - Date.now();
      if (res.error)
        flash(
          ONLINE_ERROR_TEXT[res.error] ??
            ERROR_TEXT[res.error as keyof typeof ERROR_TEXT] ??
            res.error,
        );
      if (!res.view) return;
      seq.current = res.view.seq;
      setSurvival(res.view.survival ?? null);
      const next = toBattleState(res.view);
      if (res.events && res.events.length > 0) commit(before, next, res.events);
      else setState(next);
      if (res.outcome) {
        setOutcome(res.outcome);
        void fetchProfile().then((r) => r.profile && setProfile(r.profile));
      }
      const resting =
        res.view.survival && !res.view.survival.done && next.winner === PLAYER;
      if (next.winner !== null && !resting) {
        try {
          window.localStorage.removeItem(ONLINE_BATTLE_KEY);
        } catch {
          // Không lưu được thì thôi, trận đã xong.
        }
      }
    },
    [commit, flash],
  );

  const sendOnline = useCallback(
    (action: MatchAction) => {
      if (!battleId) return;
      const before = state;
      setPending(true);
      void actOnline(battleId, seq.current, action).then((res) => {
        setPending(false);
        receive(before, res);
      });
    },
    [battleId, state, receive],
  );

  const apply = useCallback(
    (action: BattleAction): boolean => {
      // Online: kiểm tra trước bằng core cho phản hồi tức thì; bàn cờ thật chỉ lấy từ server.
      const r = act(state, action, Date.now() + clockOffset.current);
      if (!r.ok) {
        let text = ERROR_TEXT[r.error];
        if (r.error === "notEnoughEnergy" && action.type === "skill") {
          text += ` (${actor.energy}/${fighterSkill(actor, action.skill)?.cost ?? 0})`;
        }
        if (r.error === "invalidMove" && action.type === "swap")
          play(bounceFrames(state.board, action.from, action.to), () => {});
        flash(text);
        return false;
      }
      if (online) sendOnline(action);
      else commit(state, r.state, r.events);
      return true;
    },
    [state, actor, flash, play, commit, online, sendOnline],
  );

  // Lượt của Tianwu: chạy trọn lượt sau một nhịp nghỉ ngắn để người chơi kịp nhìn.
  useEffect(() => {
    if (online || !started || state.winner !== null || state.turn.side !== AI)
      return;
    const t = window.setTimeout(() => {
      const r = playAiTurn(state, difficulty, Date.now());
      commit(state, r.state, r.events);
    }, AI_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [online, started, state, difficulty, commit]);

  // Đồng hồ 30 giây mỗi lượt (online lẫn offline).
  const deadline =
    started && state.winner === null ? state.turn.deadline : null;
  useEffect(() => {
    if (deadline === null) return;
    const tick = window.setInterval(
      () => setClock(Date.now() + clockOffset.current),
      250,
    );
    return () => window.clearInterval(tick);
  }, [deadline]);
  // Online: quá hạn (cộng ân hạn) thì hỏi server để chạy bù lượt mất và lượt AI.
  useEffect(() => {
    if (!online || deadline === null || !battleId) return;
    const wait = deadline + GRACE_MS + 200 - (Date.now() + clockOffset.current);
    const before = state;
    const t = window.setTimeout(
      () => {
        setPending(true);
        void fetchOnline(battleId).then((res) => {
          setPending(false);
          receive(before, res);
        });
      },
      Math.max(0, wait),
    );
    return () => window.clearTimeout(t);
  }, [online, deadline, battleId, state, receive]);
  // Offline: quá hạn (cộng ân hạn) thì mất lượt ngay trên máy; chờ hoạt ảnh đang chạy xong.
  useEffect(() => {
    if (online || deadline === null || anim !== null) return;
    if (state.turn.side !== PLAYER) return;
    const wait = deadline + GRACE_MS + 50 - Date.now();
    const t = window.setTimeout(
      () => {
        const r = act(state, { type: "timeout" }, Date.now());
        if (r.ok) commit(state, r.state, r.events);
      },
      Math.max(0, wait),
    );
    return () => window.clearTimeout(t);
  }, [online, deadline, anim, state, commit]);
  const secondsLeft =
    deadline === null
      ? null
      : Math.min(
          TURN_MS / 1000,
          Math.max(0, Math.ceil((deadline - clock) / 1000)),
        );

  // Báo chiều cao cho trang cha khi được nhúng bằng iframe (ShanVerse).
  useEffect(() => {
    const el = rootRef.current;
    if (!el || window.parent === window) return;
    const post = () =>
      window.parent.postMessage(
        { type: "colau:height", height: el.scrollHeight },
        "*",
      );
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
    (def: SkillDef, whirl?: Whirl) => {
      if (def.target === "enemy" || def.target === "ally" || needsCell(def)) {
        setPendingWhirl(whirl ?? null);
        setAim({ skill: def });
        setSelected(null);
        const side = def.target === "ally" ? PLAYER : AI;
        const first = state.sides[side].fighters.findIndex(isAlive);
        setAimIndex(
          def.target === "ally" ? state.turn.actor : Math.max(0, first),
        );
        return;
      }
      apply({ type: "skill", skill: def.id, ...(whirl ? { whirl } : {}) });
    },
    [state, apply],
  );

  const castSkill = useCallback(
    (def: SkillDef) => {
      if (!myTurn) return;
      if (state.turn.skillUsed) return flash(ERROR_TEXT.skillUsed);
      if (actor.energy < def.cost)
        return flash(
          `${ERROR_TEXT.notEnoughEnergy} (${actor.energy}/${def.cost})`,
        );
      const whirl = whirlStep(def);
      if (whirl) {
        setAim(null);
        setSelected(null);
        setWhirlAim({ skill: def, max: whirl.turns, center: null });
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
      if (needsCell(def) && !cell)
        return flash("Chọn một ô trên bàn cờ làm tâm");
      const ok = apply({
        type: "skill",
        skill: def.id,
        ...(target !== undefined ? { target } : {}),
        ...(cell ? { cell } : {}),
        ...(pendingWhirl ? { whirl: pendingWhirl } : {}),
      });
      if (ok) {
        setAim(null);
        setPendingWhirl(null);
      }
    },
    [aim, pendingWhirl, apply, flash],
  );

  /** Xoay quanh tâm đã chọn: dương theo chiều kim đồng hồ. */
  const spinWhirl = useCallback(
    (turns: number) => {
      if (!whirlAim?.center || Math.abs(turns) > whirlAim.max) return;
      const whirl = { center: whirlAim.center, turns };
      setWhirlAim(null);
      if (!whirlAim.skill) apply({ type: "whirl", whirl });
      else aimOrCast(whirlAim.skill, whirl);
    },
    [whirlAim, apply, aimOrCast],
  );

  const onCell = useCallback(
    (pos: Pos) => {
      if (!myTurn) return;
      if (whirlAim) {
        const c = whirlAim.center;
        if (c && c.row === pos.row && c.col === pos.col)
          return setWhirlAim({ ...whirlAim, center: null });
        if (!isWhirlCenter(state.board, pos)) return flash(whirlHint({ ...whirlAim, center: null }));
        return setWhirlAim({ ...whirlAim, center: pos });
      }
      if (aim) {
        if (needsCell(aim.skill)) fireAim(undefined, pos);
        return;
      }
      if (!selected) return setSelected(pos);
      if (selected.row === pos.row && selected.col === pos.col)
        return setSelected(null);
      if (isAdjacent(selected, pos)) return trySwap(selected, pos);
      setSelected(pos);
    },
    [myTurn, whirlAim, aim, selected, state.board, flash, fireAim, trySwap],
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
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_PX || aim || whirlAim)
      return onCell(d.pos);
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
      const next =
        selectable[(i + step + selectable.length) % selectable.length]!;
      apply({ type: "selectActor", fighter: next });
    },
    [selectable, state.turn.actor, apply],
  );

  // Điều khiển bàn phím, docs/design/11-giao-dien.md mục 2.3.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!myTurn) return;
      const dirs: Record<string, [number, number]> = {
        ArrowUp: [-1, 0],
        w: [-1, 0],
        W: [-1, 0],
        ArrowDown: [1, 0],
        s: [1, 0],
        S: [1, 0],
        ArrowLeft: [0, -1],
        a: [0, -1],
        A: [0, -1],
        ArrowRight: [0, 1],
        d: [0, 1],
        D: [0, 1],
      };
      const dir = dirs[e.key];
      if (whirlAim?.center && /^[qe]$/i.test(e.key)) {
        e.preventDefault();
        const turns = (e.key.toLowerCase() === "e" ? 1 : -1) * (e.shiftKey ? 2 : 1);
        if (Math.abs(turns) <= whirlAim.max) spinWhirl(turns);
        return;
      }
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
        setWhirlAim(null);
        setPendingWhirl(null);
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
  }, [
    myTurn,
    aim,
    aimIndex,
    whirlAim,
    spinWhirl,
    cursor,
    selected,
    state,
    skills,
    fireAim,
    onCell,
    trySwap,
    switchActor,
    castSkill,
  ]);

  // Món rơi sau trận theo bảng rơi đồ của core. Tiến trình (và Chơi online) lấy món đã vào túi từ `outcome`;
  // Luyện tập chỉ hiển thị.
  const drop = useMemo(
    () =>
      mode === "progress"
        ? (outcome?.drop ?? null)
        : state.winner === null
          ? null
          : demoDrop(seed, round, difficulty, state.winner === PLAYER),
    [mode, outcome, state.winner, seed, round, difficulty],
  );

  /** Dọn trận cũ; trận mới dùng bàn cờ xem trước của vòng kế. */
  const reset = () => {
    setRound(round + 1);
    setSeed(randomSeed());
    setAnim(null);
    afterAnim.current = null;
    setFloats([]);
    setState(null);
    setOutcome(null);
    setSelected(null);
    setAim(null);
    setWhirlAim(null);
    setPendingWhirl(null);
    setLog([]);
    setBattleId(null);
    setSurvival(null);
    setDailyDay(null);
    setArenaFoe(null);
  };

  /** Về màn chờ trước trận để đổi nguyên tố, nghề, trang bị hoặc nâng kỹ năng. */
  const restart = () => {
    if (!online) setProfile(loadProfile());
    reset();
    setStarted(false);
  };

  /**
   * Chơi thử: vào trận mới ngay với lựa chọn hiện tại. Mỗi trận một bàn cờ mới; đồng hồ lượt đầu tính từ
   * lúc vào trận.
   */
  const replay = () => {
    reset();
    const fresh = randomSeed();
    const battle = newBattle(fresh, setup);
    setSeed(fresh);
    setState({
      ...battle,
      turn: { ...battle.turn, deadline: Date.now() + TURN_MS },
    });
    setStarted(true);
    setBooting(false);
  };

  /** Chơi thử: quay lại trận đang đánh từ màn chờ; lượt đang đi được tính lại đủ 30 giây. */
  const backToBattle = () => {
    if (live && live.turn.deadline !== null)
      setState({
        ...live,
        turn: { ...live.turn, deadline: Date.now() + TURN_MS },
      });
    setStarted(true);
  };

  // Chơi thử vào trận ngay khi mở màn (bàn cờ ngẫu nhiên nên dựng sau khi vào trình duyệt).
  useEffect(() => {
    if (!booting) return;
    const t = window.setTimeout(replay, 0);
    return () => window.clearTimeout(t);
    // Chỉ chạy một lần khi vào màn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booting]);

  const beginOnline = (res: OnlineResponse) => {
    clockOffset.current = res.now - Date.now();
    if (!res.view || !res.id)
      return flash(
        ONLINE_ERROR_TEXT[res.error ?? "network"] ?? "Không tạo được trận",
      );
    seq.current = res.view.seq;
    setStage(res.view.stage ?? null);
    setTowerFloorNo(res.view.tower ?? null);
    setSurvival(res.view.survival ?? null);
    setDailyDay(res.view.daily ?? null);
    setArenaFoe(res.view.arena ?? null);
    setBattleId(res.id);
    setClock(res.now);
    setState(toBattleState(res.view));
    setStarted(true);
    try {
      window.localStorage.setItem(ONLINE_BATTLE_KEY, res.id);
    } catch {
      // Không lưu được: tải lại trang sẽ không tiếp tục được trận này.
    }
  };

  const start = () => {
    if (!online) return replay();
    setPending(true);
    void createOnline({
      mode: "3v3",
      element,
      profession,
      companions: profile.team,
      difficulty,
    }).then((res) => {
      setPending(false);
      beginOnline(res);
    });
  };

  /** Tiếp tục trận online dở (sau khi tải lại trang). */
  const resume = () => {
    let id: string | null = null;
    try {
      id = window.localStorage.getItem(ONLINE_BATTLE_KEY);
    } catch {
      id = null;
    }
    if (!id) return flash("Không có trận dở");
    setPending(true);
    void fetchOnline(id).then((res) => {
      setPending(false);
      if (res.error === "notFound") {
        try {
          window.localStorage.removeItem(ONLINE_BATTLE_KEY);
        } catch {
          // Bỏ qua.
        }
      }
      beginOnline(res);
    });
  };

  const resumed = useRef(false);
  useEffect(() => {
    if (!autoResume || resumed.current) return;
    resumed.current = true;
    resume();
    // Chỉ chạy một lần khi vào trang.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoResume]);

  const changeProfile = (p: Profile) => {
    setProfile(p);
    saveProfile(p);
  };

  /** Thao tác hồ sơ (nâng kỹ năng, mua nhân vật…): Chơi thử áp tại chỗ rồi lưu trình duyệt, Chơi online gửi server. */
  const profileAction = async (a: ProfileAction): Promise<string | null> => {
    if (!online) {
      const r = applyProfileAction({ ...profile, element }, a);
      if (!r.ok) return r.error;
      changeProfile({ ...r.profile, element: profile.element });
      return null;
    }
    const r = await sendProfileAction(a);
    if (r.profile) setProfile(r.profile);
    return r.error ?? null;
  };

  const palette =
    theme === "light"
      ? "[--bg:#f3ebdc] [--panel:#fffaf0] [--cell:#e2d3b6] [--frame:#7a2c1d] [--gold:#b8862f] text-stone-900"
      : "[--bg:#17110e] [--panel:#271d18] [--cell:#14251c] [--frame:#1b2a21] [--gold:#d4a24c] text-stone-100";

  const frame = anim ? anim.frames[anim.i] : undefined;
  const board = frame?.board ?? state.board;

  const aimingFoe =
    aim && !needsCell(aim.skill) && aim.skill.target === "enemy";
  const aimingAlly =
    aim && !needsCell(aim.skill) && aim.skill.target === "ally";

  const side = (s: 0 | 1) => {
    const own = state.sides[s];
    return (
      <div className="flex w-full flex-col gap-2 md:w-40 md:shrink-0 lg:w-56">
        <div className="flex items-center justify-between text-xs opacity-80">
          <span className="font-semibold">
            {s === PLAYER
              ? "Phe bạn"
              : arenaFoe
                ? `Bóng ma · ${arenaFoe.rating} điểm`
                : "Tianwu"}
          </span>
          <span
            title="Lương thực"
            className="flex items-center gap-1 tabular-nums"
          >
            <FoodIcon className="size-3.5" /> {own.food}/100
          </span>
        </div>
        {own.fighters.map((f, i) => {
          const isActor =
            state.winner === null &&
            state.turn.side === s &&
            state.turn.actor === i;
          const canPick =
            s === PLAYER && selectable.includes(i) && !state.turn.skillUsed;
          const target =
            (s === AI && aimingFoe) || (s === PLAYER && aimingAlly);
          return (
            <FighterCard
              key={f.id}
              fighter={f}
              experimentalSpirit={state.experimentalSpirit}
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
    <div
      ref={rootRef}
      className={`${palette} demo-bg flex-1 bg-[var(--bg)] p-3 sm:p-4`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="flex items-center gap-1.5 text-lg font-bold">
            <LeaderFlag className="size-6" />
            {online ? "Cờ Lau · Chơi online" : "Cờ Lau · Chơi thử"}
          </h1>
          <div className="text-sm font-semibold" aria-live="polite">
            {!started
              ? "Chuẩn bị xuất trận"
              : atBreak
                ? `Hạ hết đợt ${survival!.wave}, nghỉ giữa đợt`
                : survival && state.winner !== null
                  ? "Lượt sinh tồn kết thúc"
                  : state.winner !== null
                    ? state.winner === PLAYER
                      ? "Bạn thắng!"
                      : "Tianwu thắng"
                    : pending
                      ? "Đang chờ server…"
                      : playerTurn
                        ? state.turn.extra
                          ? "Lượt thêm của bạn"
                          : "Lượt của bạn"
                        : "Lượt đối thủ…"}
          </div>
          {!online && started && (
            <button
              type="button"
              onClick={() => { setProfile(loadProfile()); setStarted(false); }}
              className="flex items-center gap-1.5 rounded bg-[var(--panel)] px-2.5 py-1 text-xs font-semibold"
            >
              <ProfessionIcon profession={profession} className="size-4" />
              Đổi đội hình
            </button>
          )}
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
        {survival && started && (
          <WaveBanner survival={survival} resting={atBreak} />
        )}

        {!started && !booting && (
          <SetupLobby
            online={online}
            mode={mode}
            onMode={(m) => {
              if (m === "progress" && mode !== "progress")
                setProfile(loadProfile());
              setMode(m);
            }}
            level={profile.main.level}
            elements={MAIN_ELEMENTS}
            element={element}
            onElement={setElement}
            profession={profession}
            onProfession={setProfession}
            gear={gear}
            onGear={setGear}
            difficulties={DIFFICULTIES}
            difficulty={difficulty}
            onDifficulty={setDifficulty}
            teams={[preview.sides[PLAYER].fighters, preview.sides[AI].fighters]}
            pending={pending}
            canReturn={!online && live !== null && live.winner === null}
            onStart={start}
            onResume={online ? resume : undefined}
            onReturn={backToBattle}
          />
        )}

        {started && (
          <BattleStage
            sides={[state.sides[PLAYER].fighters, state.sides[AI].fighters]}
            actor={
              state.winner === null
                ? { side: state.turn.side, fighter: state.turn.actor }
                : null
            }
            bus={cueBus}
          />
        )}

        <div
          className={`flex flex-col gap-3 md:flex-row md:items-start ${started ? "" : "hidden"}`}
        >
          {side(PLAYER)}

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {started && state.winner === null && !atBreak && (
              <TurnClock
                seconds={playerTurn ? secondsLeft : null}
                mine={playerTurn}
                extra={state.turn.extra}
                waiting={pending}
              />
            )}
            <div className="relative mt-3 rounded-xl border-2 border-[var(--gold)] bg-[var(--frame)] p-1.5 shadow-lg">
              <BoardCrest className="pointer-events-none absolute -top-4 left-1/2 z-10 h-8 w-40 -translate-x-1/2 md:-top-5 md:h-10 md:w-52" />
              {CORNERS.map((c) => (
                <CloudCorner
                  key={c}
                  className={`pointer-events-none absolute z-10 size-5 ${c}`}
                />
              ))}
              <div
                className="relative grid touch-none select-none gap-0.5 overflow-hidden rounded-md bg-black/25 p-0.5"
                style={{
                  gridTemplateColumns: `repeat(${board.cols}, minmax(0, 1fr))`,
                }}
                onPointerUp={onPointerUp}
                onPointerLeave={() => (drag.current = null)}
                role="grid"
                aria-label="Bàn cờ"
              >
                {board.cells.map((tile, i) => {
                  const pos = {
                    row: Math.floor(i / board.cols),
                    col: i % board.cols,
                  };
                  const cellAnim = frame?.anims[i];
                  const center = whirlAim?.center;
                  const isSel =
                    (selected?.row === pos.row && selected.col === pos.col) ||
                    (center?.row === pos.row && center.col === pos.col);
                  const isRing = !!center && inRing(center, pos);
                  const isCur =
                    showCursor &&
                    cursor.row === pos.row &&
                    cursor.col === pos.col;
                  return (
                    <div
                      key={cellAnim ? `${anim!.id}-${anim!.i}-${i}` : i}
                      role="gridcell"
                      data-row={pos.row}
                      data-col={pos.col}
                      aria-label={
                        tile
                          ? tile.special
                            ? SPECIAL_NAME[tile.special][tile.kind]
                            : TILE_NAME[tile.kind]
                          : "Ô trống"
                      }
                      onPointerDown={(e) => onPointerDown(pos, e)}
                      className={`relative aspect-square rounded-md bg-[var(--cell)] ${
                        isSel ? "z-10 scale-110 ring-2 ring-amber-300" : ""
                      } ${isRing ? "ring-2 ring-teal-400" : ""} ${isCur ? "outline-2 outline-sky-400" : ""} ${(aim && needsCell(aim.skill)) || whirlAim ? "cursor-crosshair" : "cursor-pointer"}`}
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
                {/* Nút hoa đồng ở giao điểm các ô, như đinh tán trên bàn ngọc. */}
                <div
                  aria-hidden
                  className="board-knots pointer-events-none absolute inset-px"
                  style={{ backgroundSize: `calc(100% / ${board.cols}) calc(100% / ${board.rows})` }}
                />
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
                {atBreak && (
                  <BreakPanel
                    survival={survival!}
                    state={state}
                    pending={pending}
                    onNext={(revive) =>
                      sendOnline(
                        revive === undefined
                          ? { type: "nextWave" }
                          : { type: "nextWave", revive },
                      )
                    }
                    onEnd={() => sendOnline({ type: "endRun" })}
                  />
                )}
                {state.winner !== null && !atBreak && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-black/70 text-white">
                    <p className="text-xl font-bold">
                      {survival
                        ? state.winner === PLAYER
                          ? "Dừng lại, ghi điểm"
                          : "Cả đội đã gục"
                        : state.winner === PLAYER
                          ? "Bạn thắng!"
                          : "Tianwu thắng"}
                    </p>
                    {stage && stageById(stage) && (
                      <p className="max-w-sm text-center text-sm text-amber-100 italic">
                        {stageById(stage)!.foes[0]!.name}: “
                        {state.winner === PLAYER
                          ? stageById(stage)!.lines.win
                          : stageById(stage)!.lines.lose}
                        ”
                      </p>
                    )}
                    {(!online || outcome) && (
                      <p className="text-sm">
                        {drop ? (
                          <>
                            <span className="flex items-center gap-2">
                              <GearIcon
                                slot={drop.slot}
                                element={drop.element}
                                tier={drop.tier}
                                profession={drop.profession}
                                className="size-12 shrink-0"
                              />
                              <span>
                                Chiến lợi phẩm:{" "}
                                <span
                                  className={`font-semibold ${TIER_CLASS[drop.tier]}`}
                                >
                                  {gearText(drop)}
                                </span>
                              </span>
                            </span>
                          </>
                        ) : outcome && outcome.soldFor > 0 ? (
                          `Túi đồ đầy: món rơi được bán ngay, +${outcome.soldFor} vàng.`
                        ) : (
                          "Không rơi trang bị."
                        )}
                      </p>
                    )}
                    {outcome && (
                      <div className="text-center text-sm">
                        <p>
                          +{outcome.rewards.xp[0]} kinh nghiệm mỗi người · +
                          {outcome.rewards.gold} vàng
                        </p>
                        {outcome.campaign && (
                          <p>
                            {outcome.campaign.firstClear && (
                              <span className="font-semibold text-amber-300">
                                Qua màn lần đầu: +{outcome.campaign.bonusGold}{" "}
                                vàng ·{" "}
                              </span>
                            )}
                            Lương mang sang: {outcome.campaign.food}
                          </p>
                        )}
                        {outcome.tower && (
                          <p
                            className={`font-semibold ${outcome.tower.won ? "text-amber-300" : "text-rose-300"}`}
                          >
                            {outcome.tower.won
                              ? `Qua tầng ${outcome.tower.floor}!`
                              : `Dừng ở tầng ${outcome.tower.floor}. Lượt leo kết thúc.`}
                            {outcome.tower.newBest && " Kỷ lục mới!"}
                            {outcome.tower.bonusGold > 0 &&
                              ` +${outcome.tower.bonusGold} vàng tầng trùm.`}
                          </p>
                        )}
                        {outcome.daily && (
                          <p className="font-semibold text-amber-300">
                            Thử thách ngày:{" "}
                            {outcome.daily.score.won
                              ? `thắng sau ${outcome.daily.score.turns} lượt`
                              : "thua"}
                            {outcome.daily.rank !== null &&
                              `, hạng ${outcome.daily.rank} hôm nay`}
                            .
                          </p>
                        )}
                        {outcome.arena && (
                          <p
                            className={`font-semibold ${outcome.arena.won ? "text-amber-300" : "text-rose-300"}`}
                          >
                            Đấu trường: {outcome.arena.won ? "thắng" : "thua"}{" "}
                            {outcome.arena.opponent},{" "}
                            {outcome.arena.delta >= 0 ? "+" : "−"}
                            {Math.abs(outcome.arena.delta)} điểm
                            {outcome.arena.rating !== null &&
                              ` (còn ${outcome.arena.rating})`}
                            {outcome.arena.gold > 0 &&
                              `, +${outcome.arena.gold} vàng thắng trận`}
                            .
                          </p>
                        )}
                        {outcome.survival && (
                          <p className="font-semibold text-amber-300">
                            Vượt qua {outcome.survival.cleared} đợt
                            {outcome.survival.gold > 0 &&
                              `, +${outcome.survival.gold} vàng theo đợt`}
                            .{outcome.survival.newBest && " Kỷ lục mới!"}
                          </p>
                        )}
                        {outcome.raid?.firstClear && (
                          <p className="font-semibold text-amber-300">
                            Thắng {RAID_TIER_INFO[outcome.raid.tier].name} lần
                            đầu: +{outcome.raid.bonusGold} vàng
                            {outcome.raid.item
                              ? ` · ${gearText(outcome.raid.item)}`
                              : outcome.raid.soldFor > 0
                                ? ` · túi đầy, món thưởng bán được ${outcome.raid.soldFor} vàng`
                                : ""}
                          </p>
                        )}
                        {outcome.campaign?.joined && (
                          <p className="font-semibold text-emerald-300">
                            {fighterName(outcome.campaign.joined)} gia nhập đội!
                            Chọn vào đội ở mục Đội hình.
                          </p>
                        )}
                        {outcome.levelUps.map((u) => (
                          <p
                            key={u.id}
                            className="font-semibold text-amber-300"
                          >
                            {fighterName(u.id)} lên cấp {u.level}!
                          </p>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap justify-center gap-2">
                      {!online && (
                        <a
                          href="/game"
                          target="_blank"
                          rel="noopener"
                          className="rounded bg-amber-500 px-4 py-2 font-semibold text-stone-950"
                        >
                          Lưu tiến độ &amp; chơi chiến dịch
                        </a>
                      )}
                      {towerFloorNo !== null && (
                        <SceneLink
                          scene="TOWER"
                          className="rounded bg-amber-500 px-4 py-2 font-semibold text-stone-950"
                        >
                          {outcome?.tower?.won
                            ? "Chọn thưởng, lên tầng"
                            : "Về tháp"}
                        </SceneLink>
                      )}
                      {dailyDay && (
                        <SceneLink
                          scene="DAILY"
                          className="rounded bg-amber-500 px-4 py-2 font-semibold text-stone-950"
                        >
                          Xem bảng xếp hạng
                        </SceneLink>
                      )}
                      {arenaFoe && (
                        <SceneLink
                          scene="ARENA"
                          className="rounded bg-amber-500 px-4 py-2 font-semibold text-stone-950"
                        >
                          Về đấu trường
                        </SceneLink>
                      )}
                      {survival && (
                        <SceneLink
                          scene="SURVIVAL"
                          className="rounded bg-amber-500 px-4 py-2 font-semibold text-stone-950"
                        >
                          Về sinh tồn
                        </SceneLink>
                      )}
                      {stage && (
                        <SceneLink
                          scene="CAMPAIGN"
                          className="rounded bg-amber-500 px-4 py-2 font-semibold text-stone-950"
                        >
                          Về chiến dịch
                        </SceneLink>
                      )}
                      {!online && mode === "practice" && (
                        <button
                          type="button"
                          onClick={replay}
                          className="rounded bg-white/20 px-4 py-2"
                        >
                          Chơi lại
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={restart}
                        className="rounded bg-white/20 px-4 py-2"
                      >
                        {mode === "progress"
                          ? "Nâng kỹ năng & đánh tiếp"
                          : "Đổi đội hình"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className="flex flex-wrap items-stretch gap-1.5"
              aria-label="Kỹ năng"
            >
              <span className="w-full text-xs opacity-70">
                Kỹ năng của {actor.name}:
              </span>
              {skills.map((def, i) => {
                const disabled =
                  !myTurn || state.turn.skillUsed || actor.energy < def.cost;
                const aiming =
                  aim?.skill.id === def.id || whirlAim?.skill?.id === def.id;
                return (
                  <button
                    key={def.id}
                    type="button"
                    onClick={() => {
                      if (!aiming) return castSkill(def);
                      setAim(null);
                      setWhirlAim(null);
                      setPendingWhirl(null);
                    }}
                    className={`relative flex w-[4.25rem] flex-col items-center gap-0.5 rounded p-1 text-[10px] leading-tight ${aiming ? "bg-rose-500 text-white" : "bg-[var(--panel)]"} ${
                      disabled && !aiming ? "opacity-40 grayscale" : ""
                    }`}
                    title={`${skillText(def)} · phím ${i + 1}`}
                  >
                    <SkillIcon def={def} className="size-10" />
                    <span className="absolute left-1 top-1 rounded-br bg-black/60 px-1 font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="absolute right-1 top-1 rounded-bl bg-sky-700/90 px-1 tabular-nums text-white">
                      {def.cost}
                    </span>
                    <span className="text-center">{def.name}</span>
                  </button>
                );
              })}
              <SkillDetails skills={skills} />
              {myTurn && canFreeWhirl(state) && (
                <button
                  type="button"
                  onClick={() => {
                    setAim(null);
                    setSelected(null);
                    setWhirlAim(
                      whirlAim && !whirlAim.skill
                        ? null
                        : {
                            skill: null,
                            max: PASSIVE.phongFreeWhirlTurns,
                            center: null,
                          },
                    );
                  }}
                  className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${whirlAim && !whirlAim.skill ? "bg-rose-500 text-white" : "bg-teal-600 text-white"}`}
                >
                  <ElementIcon element="phong" className="size-3.5" /> Xoay
                  miễn phí
                </button>
              )}
            </div>
            {whirlAim && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {whirlAim.center &&
                  [-whirlAim.max, ...(whirlAim.max > 1 ? [-1, 1] : []), whirlAim.max]
                    .filter((t, i, list) => list.indexOf(t) === i)
                    .sort((x, y) => x - y)
                    .map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => spinWhirl(t)}
                        className="rounded bg-teal-600 px-2 py-1 font-bold text-white"
                        aria-label={`Xoay ${Math.abs(t)} nấc ${t > 0 ? "theo" : "ngược"} chiều kim đồng hồ`}
                      >
                        {t > 0 ? "↻" : "↺"}
                        {Math.abs(t) > 1 ? ` ×${Math.abs(t)}` : ""}
                      </button>
                    ))}
                <span className="opacity-80">{whirlHint(whirlAim)} Esc để hủy.</span>
              </div>
            )}
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
              Vuốt, kéo hoặc click hai ô kề nhau để đổi chỗ. Bàn phím: mũi tên
              hoặc WASD, Enter chọn ô, 1–6 dùng kỹ năng, Tab đổi người hành
              động, Esc hủy.
            </p>
          </div>

          {side(AI)}
        </div>

        {mode === "progress" && (
          <ShopPanel
            profile={profile}
            locked={started && state.winner === null}
            onAction={profileAction}
          />
        )}

        {mode === "progress" && (
          <GearPanel
            profile={{ ...profile, element, profession }}
            teamIds={[MAIN_ID, ...profile.team]}
            locked={started && state.winner === null}
            onAction={profileAction}
          />
        )}

        {mode === "progress" && (
          <ProgressPanel
            profile={{ ...profile, element }}
            teamIds={[MAIN_ID, ...profile.team]}
            locked={started && state.winner === null}
            storage={online ? "lưu trên server" : "lưu trên trình duyệt này"}
            onAction={profileAction}
            onReset={online ? undefined : () => changeProfile(newProfile())}
          />
        )}

        <section
          aria-label="Nhật ký trận"
          className="max-h-32 overflow-y-auto rounded-lg bg-[var(--panel)] p-2 text-xs"
        >
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
