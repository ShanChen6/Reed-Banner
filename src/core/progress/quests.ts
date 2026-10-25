// Nhiệm vụ ngày/tuần, thành tựu, điểm danh (lộ trình 5.4). Server cộng tiến độ khi trận kết thúc, người chơi
// bấm nhận thưởng. Ngày và tuần tính theo giờ Việt Nam. Số liệu là điểm xuất phát do Claude đặt, chờ Shan duyệt.
// Xem docs/design/09-che-do-choi.md mục 5.2.

/** Ngày và tuần đổi lúc 0 giờ giờ Việt Nam (UTC+7). */
export const VN_UTC_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Khóa ngày dạng YYYY-MM-DD theo giờ Việt Nam. */
export function vnDay(now: number): string {
  return new Date(now + VN_UTC_OFFSET_MS).toISOString().slice(0, 10);
}

/** Khóa tuần: ngày thứ Hai đầu tuần (giờ Việt Nam). */
export function vnWeek(now: number): string {
  const local = now + VN_UTC_OFFSET_MS;
  // getUTCDay: 0 là Chủ nhật; lùi về thứ Hai.
  const back = (new Date(local).getUTCDay() + 6) % 7;
  return new Date(local - back * DAY_MS).toISOString().slice(0, 10);
}

/** Loại trận, để nhiệm vụ đếm đúng chế độ. */
export type MatchMode =
  | "normal"
  | "campaign"
  | "raid"
  | "survival"
  | "daily"
  | "arena";

/** Tóm tắt một trận vừa kết thúc, đủ để cộng tiến độ nhiệm vụ. */
export interface MatchSummary {
  readonly mode: MatchMode;
  readonly won: boolean;
  /** Ô vàng nhặt trên bàn cờ. */
  readonly coins: number;
  /** Sinh tồn: số đợt vượt qua. */
  readonly waves: number;
}

export type QuestStat =
  | "play"
  | "win"
  | "coins"
  /** Thắng trận chiến dịch hoặc đánh trùm. */
  | "campaign"
  | "waves"
  | "daily";

export interface QuestDef {
  readonly id: string;
  readonly title: string;
  readonly stat: QuestStat;
  readonly target: number;
  readonly gold: number;
}

export const DAILY_QUESTS: readonly QuestDef[] = [
  { id: "d.play3", title: "Đánh 3 trận", stat: "play", target: 3, gold: 60 },
  { id: "d.win2", title: "Thắng 2 trận", stat: "win", target: 2, gold: 80 },
  {
    id: "d.coins30",
    title: "Nhặt 30 ô vàng trên bàn cờ",
    stat: "coins",
    target: 30,
    gold: 60,
  },
  {
    id: "d.daily",
    title: "Đánh thử thách ngày",
    stat: "daily",
    target: 1,
    gold: 50,
  },
];

export const WEEKLY_QUESTS: readonly QuestDef[] = [
  { id: "w.win15", title: "Thắng 15 trận", stat: "win", target: 15, gold: 400 },
  {
    id: "w.campaign5",
    title: "Thắng 5 trận chiến dịch hoặc đánh trùm",
    stat: "campaign",
    target: 5,
    gold: 300,
  },
  {
    id: "w.waves20",
    title: "Vượt 20 đợt sinh tồn",
    stat: "waves",
    target: 20,
    gold: 300,
  },
  {
    id: "w.daily5",
    title: "Đánh thử thách ngày 5 hôm",
    stat: "daily",
    target: 5,
    gold: 300,
  },
];

const QUESTS = [...DAILY_QUESTS, ...WEEKLY_QUESTS];
export const questById = (id: string) => QUESTS.find((q) => q.id === id);
const isWeekly = (id: string) => id.startsWith("w.");

/** Vàng điểm danh theo ngày thứ mấy của chuỗi 7 ngày; ngày 7 xong thì chuỗi bắt đầu lại. */
export const CHECKIN_GOLD = [50, 60, 80, 100, 120, 150, 300] as const;

/** Số đếm trọn đời cho thành tựu. */
export type TotalStat = "play" | "win" | "daily" | "bestStreak";

export interface QuestState {
  readonly day: string;
  readonly week: string;
  readonly dayStats: Readonly<Partial<Record<QuestStat, number>>>;
  readonly weekStats: Readonly<Partial<Record<QuestStat, number>>>;
  /** Nhiệm vụ đã nhận thưởng trong ngày/tuần hiện tại. */
  readonly claimed: readonly string[];
  readonly totals: Readonly<Partial<Record<TotalStat, number>>>;
  /** Thành tựu đã nhận thưởng. */
  readonly achievements: readonly string[];
  /** Điểm danh: ngày gần nhất và số ngày liền trong chuỗi hiện tại (1..7). */
  readonly checkIn: { readonly last: string | null; readonly streak: number };
}

export const NEW_QUESTS: QuestState = {
  day: "",
  week: "",
  dayStats: {},
  weekStats: {},
  claimed: [],
  totals: {},
  achievements: [],
  checkIn: { last: null, streak: 0 },
};

/** Sang ngày/tuần mới thì xóa tiến độ và lượt nhận của kỳ cũ. */
export function rollQuests(q: QuestState, now: number): QuestState {
  const day = vnDay(now);
  const week = vnWeek(now);
  if (q.day === day && q.week === week) return q;
  const newDay = q.day !== day;
  const newWeek = q.week !== week;
  return {
    ...q,
    day,
    week,
    dayStats: newDay ? {} : q.dayStats,
    weekStats: newWeek ? {} : q.weekStats,
    claimed: q.claimed.filter((id) => (isWeekly(id) ? !newWeek : !newDay)),
  };
}

function bump(
  stats: Readonly<Partial<Record<QuestStat, number>>>,
  add: Partial<Record<QuestStat, number>>,
): Partial<Record<QuestStat, number>> {
  const next = { ...stats };
  for (const [k, v] of Object.entries(add) as [QuestStat, number][])
    if (v > 0) next[k] = (next[k] ?? 0) + v;
  return next;
}

/** Cộng một trận vừa kết thúc vào tiến độ nhiệm vụ và số đếm trọn đời. */
export function recordMatch(
  q: QuestState,
  m: MatchSummary,
  now: number,
): QuestState {
  const r = rollQuests(q, now);
  const add: Partial<Record<QuestStat, number>> = {
    play: 1,
    win: m.won ? 1 : 0,
    coins: m.coins,
    campaign: m.won && (m.mode === "campaign" || m.mode === "raid") ? 1 : 0,
    waves: m.mode === "survival" ? m.waves : 0,
    daily: m.mode === "daily" ? 1 : 0,
  };
  const t = r.totals;
  return {
    ...r,
    dayStats: bump(r.dayStats, add),
    weekStats: bump(r.weekStats, add),
    totals: {
      ...t,
      play: (t.play ?? 0) + 1,
      win: (t.win ?? 0) + (m.won ? 1 : 0),
      daily: (t.daily ?? 0) + (m.mode === "daily" ? 1 : 0),
    },
  };
}

/** Tiến độ hiện tại của một nhiệm vụ (đã tính sang ngày/tuần mới). */
export function questProgress(q: QuestState, def: QuestDef, now: number) {
  const r = rollQuests(q, now);
  const stats = isWeekly(def.id) ? r.weekStats : r.dayStats;
  return {
    value: Math.min(def.target, stats[def.stat] ?? 0),
    done: (stats[def.stat] ?? 0) >= def.target,
    claimed: r.claimed.includes(def.id),
  };
}

export type QuestError =
  | "alreadyCheckedIn"
  | "questNotDone"
  | "questClaimed"
  | "noQuest";

export type QuestResult =
  | { readonly ok: true; readonly quests: QuestState; readonly gold: number }
  | { readonly ok: false; readonly error: QuestError };

export function claimQuest(
  q: QuestState,
  id: string,
  now: number,
): QuestResult {
  const def = questById(id);
  if (!def) return { ok: false, error: "noQuest" };
  const p = questProgress(q, def, now);
  if (p.claimed) return { ok: false, error: "questClaimed" };
  if (!p.done) return { ok: false, error: "questNotDone" };
  const r = rollQuests(q, now);
  return {
    ok: true,
    quests: { ...r, claimed: [...r.claimed, id] },
    gold: def.gold,
  };
}

/** Ngày thứ mấy trong chuỗi nếu điểm danh hôm nay (1..7). */
export function nextStreak(q: QuestState, now: number): number {
  const yesterday = vnDay(now - DAY_MS);
  const { last, streak } = q.checkIn;
  return last === yesterday && streak < CHECKIN_GOLD.length ? streak + 1 : 1;
}

export function checkIn(q: QuestState, now: number): QuestResult {
  const today = vnDay(now);
  if (q.checkIn.last === today) return { ok: false, error: "alreadyCheckedIn" };
  const streak = nextStreak(q, now);
  return {
    ok: true,
    quests: {
      ...rollQuests(q, now),
      checkIn: { last: today, streak },
      totals: {
        ...q.totals,
        bestStreak: Math.max(q.totals.bestStreak ?? 0, streak),
      },
    },
    gold: CHECKIN_GOLD[streak - 1]!,
  };
}

function parseStats(x: unknown): Partial<Record<string, number>> {
  if (!x || typeof x !== "object") return {};
  return Object.fromEntries(
    Object.entries(x as Record<string, unknown>).filter(
      ([, v]) => Number.isInteger(v) && (v as number) >= 0,
    ),
  ) as Partial<Record<string, number>>;
}

const strings = (x: unknown) =>
  Array.isArray(x) ? x.filter((s): s is string => typeof s === "string") : [];

export function parseQuests(raw: unknown): QuestState {
  const q = raw as Partial<QuestState> | null;
  if (!q || typeof q !== "object") return NEW_QUESTS;
  const c = q.checkIn as QuestState["checkIn"] | undefined;
  return {
    day: typeof q.day === "string" ? q.day : "",
    week: typeof q.week === "string" ? q.week : "",
    dayStats: parseStats(q.dayStats),
    weekStats: parseStats(q.weekStats),
    claimed: strings(q.claimed),
    totals: parseStats(q.totals),
    achievements: strings(q.achievements),
    checkIn: {
      last: typeof c?.last === "string" ? c.last : null,
      streak:
        Number.isInteger(c?.streak) &&
        c!.streak >= 0 &&
        c!.streak <= CHECKIN_GOLD.length
          ? c!.streak
          : 0,
    },
  };
}
