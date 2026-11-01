// Trận Đồ xếp hạng trên server. Server giữ trạng thái ván (kể cả seed và RNG, không bao giờ gửi cho client) và áp
// từng lệnh, nên người chơi không luyện trước được, không giả được điểm, và hai người cùng kỳ gặp cùng bàn cờ.
// Luật ván ở @/core/binh-phap; kỳ, hạng và bậc thưởng ở @/core/binh-phap/ranked. Thiết kế: docs/02-game-modes/future/
// 02-binh-phap-gdd.md mục 12.

import { createHmac } from "node:crypto";
import {
  MAX_RANKED_TURNS,
  RANKED_LEVELS,
  compareResults,
  createPuzzle,
  periodClosed,
  periodKey,
  publicPuzzle,
  rankedLevel,
  rewardGold,
  rulesetById,
  transition,
  type Command,
  type PublicPuzzle,
  type PuzzleEvent,
  type PuzzleState,
  type RewardTier,
} from "@/core/binh-phap";
import { updateProfile, type ProfileStore } from "./profiles";

export type FormationStatus = "playing" | "won" | "lost";

export interface FormationEntry {
  readonly id: string;
  readonly level: string;
  readonly period: string;
  readonly ownerId: string;
  /** Tên hiển thị (tài khoản đã đăng nhập); khách là null. */
  readonly name: string | null;
  readonly state: PuzzleState;
  readonly seq: number;
  readonly status: FormationStatus;
  readonly score: number | null;
  readonly turns: number | null;
  readonly startedAt: number;
  readonly finishedAt: number | null;
  readonly claimedAt: number | null;
  readonly rewardGold: number | null;
}

export interface FormationStore {
  /** Ghi ván mới; false khi người này đã có ván trong kỳ và bậc này. */
  create(entry: FormationEntry): Promise<boolean>;
  get(level: string, period: string, ownerId: string): Promise<FormationEntry | null>;
  /** Ghi đè khi seq đang lưu đúng `expectedSeq`; false nếu request khác đã ghi trước. */
  save(entry: FormationEntry, expectedSeq: number): Promise<boolean>;
  /** Ván thắng của kỳ, theo thứ tự hạng. */
  top(level: string, period: string, limit: number): Promise<FormationEntry[]>;
  countWinners(level: string, period: string): Promise<number>;
  /** 1 + số ván thắng xếp trên; null nếu ván chưa thắng. */
  rankOf(entry: FormationEntry): Promise<number | null>;
  /** Đánh dấu đã nhận thưởng đúng một lần; true chỉ cho lần gọi đầu tiên. */
  claim(id: string, gold: number, now: number): Promise<boolean>;
  /** Hoàn tác `claim` khi cộng vàng vào hồ sơ thất bại. */
  release(id: string): Promise<void>;
  /** Ván thắng chưa nhận thưởng của người chơi ở các kỳ trước `beforePeriod`. */
  unclaimed(ownerId: string, level: string, beforePeriod: string, limit: number): Promise<FormationEntry[]>;
}

const resultOf = (e: FormationEntry) => ({ score: e.score ?? 0, turns: e.turns ?? 0, finishedAt: e.finishedAt ?? 0 });

export class MemoryFormationStore implements FormationStore {
  private readonly rows = new Map<string, FormationEntry>();
  private readonly key = (level: string, period: string, ownerId: string) => `${level}|${period}|${ownerId}`;

  async create(entry: FormationEntry): Promise<boolean> {
    const k = this.key(entry.level, entry.period, entry.ownerId);
    if (this.rows.has(k)) return false;
    this.rows.set(k, structuredClone(entry));
    return true;
  }

  async get(level: string, period: string, ownerId: string): Promise<FormationEntry | null> {
    const r = this.rows.get(this.key(level, period, ownerId));
    return r ? structuredClone(r) : null;
  }

  async save(entry: FormationEntry, expectedSeq: number): Promise<boolean> {
    const k = this.key(entry.level, entry.period, entry.ownerId);
    if (this.rows.get(k)?.seq !== expectedSeq) return false;
    this.rows.set(k, structuredClone(entry));
    return true;
  }

  private winnersOf(level: string, period: string): FormationEntry[] {
    return [...this.rows.values()].filter((r) => r.level === level && r.period === period && r.status === "won");
  }

  async top(level: string, period: string, limit: number): Promise<FormationEntry[]> {
    return this.winnersOf(level, period).sort((a, b) => compareResults(resultOf(a), resultOf(b))).slice(0, limit).map((r) => structuredClone(r));
  }

  async countWinners(level: string, period: string): Promise<number> {
    return this.winnersOf(level, period).length;
  }

  async rankOf(entry: FormationEntry): Promise<number | null> {
    if (entry.status !== "won") return null;
    return 1 + this.winnersOf(entry.level, entry.period).filter((r) => compareResults(resultOf(r), resultOf(entry)) < 0).length;
  }

  async claim(id: string, gold: number, now: number): Promise<boolean> {
    for (const [k, r] of this.rows) {
      if (r.id !== id) continue;
      if (r.claimedAt !== null || r.status !== "won") return false;
      this.rows.set(k, { ...r, claimedAt: now, rewardGold: gold });
      return true;
    }
    return false;
  }

  async release(id: string): Promise<void> {
    for (const [k, r] of this.rows) if (r.id === id) this.rows.set(k, { ...r, claimedAt: null, rewardGold: null });
  }

  async unclaimed(ownerId: string, level: string, beforePeriod: string, limit: number): Promise<FormationEntry[]> {
    return [...this.rows.values()]
      .filter((r) => r.ownerId === ownerId && r.level === level && r.status === "won" && r.claimedAt === null && r.period < beforePeriod)
      .sort((a, b) => (a.period < b.period ? 1 : -1))
      .slice(0, limit)
      .map((r) => structuredClone(r));
  }
}

/** Seed của một bậc trong một kỳ: HMAC theo khóa bí mật, như nhau với mọi người chơi, không đoán trước được. */
export function formationSeed(secret: string, level: string, period: string): number {
  return createHmac("sha256", secret).update(`formation:${level}:${period}`).digest().readUInt32BE(0);
}

export interface FormationDeps {
  readonly store: FormationStore;
  readonly profiles: ProfileStore;
  readonly now: number;
  readonly secret?: string;
  readonly enabled: boolean;
  readonly newId: () => string;
  /**
   * Người này đã đăng nhập (có tài khoản) chưa. Khách không chơi, không nhận thưởng xếp hạng (Shan chốt 01/11/2026);
   * vẫn xem được bảng.
   */
  readonly isSignedIn: (ownerId: string) => Promise<boolean>;
}

export type FormationError =
  | "featureDisabled"
  | "unavailable"
  | "loginRequired"
  | "badRequest"
  | "unknownLevel"
  | "noAttempt"
  | "finished"
  | "conflict"
  | "rejected"
  | "notClaimable"
  | "alreadyClaimed";

/** Bản ván gửi cho client: không seed, không RNG. */
export interface FormationView {
  readonly level: string;
  readonly period: string;
  readonly status: FormationStatus;
  /** Client gửi lại số này kèm lệnh kế tiếp. */
  readonly seq: number;
  readonly puzzle: PublicPuzzle;
  readonly score: number | null;
  readonly turns: number | null;
  /** Hạng tạm thời trong kỳ khi đã thắng; thay đổi cho tới khi kỳ khép lại. */
  readonly rank: number | null;
}

async function viewOf(deps: FormationDeps, e: FormationEntry): Promise<FormationView> {
  return {
    level: e.level,
    period: e.period,
    status: e.status,
    seq: e.seq,
    puzzle: publicPuzzle(e.state),
    score: e.score,
    turns: e.turns,
    rank: e.status === "won" ? await deps.store.rankOf(e) : null,
  };
}

type Gate = { ok: true; level: string; period: string } | { ok: false; error: FormationError };

function gate(deps: FormationDeps, level: unknown): Gate {
  if (!deps.enabled) return { ok: false, error: "featureDisabled" };
  if (!deps.secret) return { ok: false, error: "unavailable" };
  if (typeof level !== "string" || !rankedLevel(level)) return { ok: false, error: "unknownLevel" };
  return { ok: true, level, period: periodKey(level, deps.now)! };
}

export type StartResult = { readonly ok: true; readonly view: FormationView; readonly resumed: boolean } | { readonly ok: false; readonly error: FormationError };

/** Mở ván của kỳ hiện tại. Đã có ván (đang chơi hoặc đã xong) thì trả lại đúng ván đó, không bày bàn mới. */
export async function startFormation(deps: FormationDeps, ownerId: string, levelId: unknown, name: string | null = null): Promise<StartResult> {
  const g = gate(deps, levelId);
  if (!g.ok) return g;
  if (!(await deps.isSignedIn(ownerId))) return { ok: false, error: "loginRequired" };
  const existing = await deps.store.get(g.level, g.period, ownerId);
  if (existing) return { ok: true, view: await viewOf(deps, existing), resumed: true };
  const rules = rulesetById(g.level);
  if (!rules) return { ok: false, error: "unknownLevel" };
  const state = createPuzzle(rules, formationSeed(deps.secret!, g.level, g.period));
  const entry: FormationEntry = {
    id: deps.newId(),
    level: g.level,
    period: g.period,
    ownerId,
    name,
    state,
    seq: 0,
    status: "playing",
    score: null,
    turns: null,
    startedAt: deps.now,
    finishedAt: null,
    claimedAt: null,
    rewardGold: null,
  };
  if (!(await deps.store.create(entry))) {
    // Hai request mở ván cùng lúc: chỉ một bên ghi được, bên kia nhận lại ván đó.
    const winner = await deps.store.get(g.level, g.period, ownerId);
    return winner ? { ok: true, view: await viewOf(deps, winner), resumed: true } : { ok: false, error: "conflict" };
  }
  return { ok: true, view: await viewOf(deps, entry), resumed: false };
}

export function parseCommand(v: unknown): Command | null {
  if (typeof v !== "object" || v === null) return null;
  const c = v as Record<string, unknown>;
  if (c.kind === "discard") return { kind: "discard" };
  if (c.kind === "place" && Number.isInteger(c.row) && Number.isInteger(c.col)) return { kind: "place", row: c.row as number, col: c.col as number };
  return null;
}

export type MoveResult =
  | { readonly ok: true; readonly view: FormationView; readonly events: readonly PuzzleEvent[] }
  | { readonly ok: false; readonly error: FormationError; readonly reason?: string; readonly view?: FormationView };

/**
 * Áp một lệnh vào ván đang chơi. Lệnh sai không đổi gì. `seq` là số client đang thấy: lệch thì trả `conflict` kèm
 * ván hiện tại (chặn gửi trùng và hai tab cùng chơi).
 */
export async function moveFormation(deps: FormationDeps, ownerId: string, levelId: unknown, seq: unknown, command: unknown): Promise<MoveResult> {
  const g = gate(deps, levelId);
  if (!g.ok) return g;
  if (!(await deps.isSignedIn(ownerId))) return { ok: false, error: "loginRequired" };
  const cmd = parseCommand(command);
  if (!cmd || !Number.isInteger(seq)) return { ok: false, error: "badRequest" };
  const entry = await deps.store.get(g.level, g.period, ownerId);
  if (!entry) return { ok: false, error: "noAttempt" };
  if (entry.status !== "playing") return { ok: false, error: "finished", view: await viewOf(deps, entry) };
  if (entry.seq !== seq) return { ok: false, error: "conflict", view: await viewOf(deps, entry) };
  const t = transition(entry.state, cmd);
  if (!t.ok) return { ok: false, error: "rejected", reason: t.reason };
  let state = t.state;
  // Quá số lệnh cho phép thì xử thua, chặn ván kéo dài vô hạn.
  if (state.phase === "playing" && state.turn >= MAX_RANKED_TURNS) state = { ...state, phase: "lost" };
  const done = state.phase !== "playing";
  const next: FormationEntry = {
    ...entry,
    state,
    seq: entry.seq + 1,
    status: state.phase === "won" ? "won" : state.phase === "lost" ? "lost" : "playing",
    score: done ? state.score : null,
    turns: done ? state.turn : null,
    finishedAt: done ? deps.now : null,
  };
  if (!(await deps.store.save(next, entry.seq))) {
    const cur = await deps.store.get(g.level, g.period, ownerId);
    return { ok: false, error: "conflict", view: cur ? await viewOf(deps, cur) : undefined };
  }
  return { ok: true, view: await viewOf(deps, next), events: t.events };
}

export interface BoardRow {
  readonly rank: number;
  readonly name: string;
  readonly mine: boolean;
  readonly score: number;
  readonly turns: number;
}

export interface Claimable {
  readonly level: string;
  readonly period: string;
  readonly rank: number;
  readonly winners: number;
  readonly tier: RewardTier;
  readonly gold: number;
}

export interface LevelOverview {
  readonly level: string;
  readonly cadence: "day" | "week";
  readonly period: string;
  readonly winners: number;
  readonly mine: FormationView | null;
  readonly top: readonly BoardRow[];
  readonly claimable: readonly Claimable[];
}

export const BOARD_SIZE = 20;
const CLAIM_LIST = 10;

/** Tổng quan các bậc xếp hạng; `ownerId` null khi chưa có cookie (chỉ xem bảng). */
export async function formationOverview(deps: FormationDeps, ownerId: string | null): Promise<{ enabled: boolean; canPlay: boolean; levels: LevelOverview[] }> {
  if (!deps.enabled || !deps.secret) return { enabled: false, canPlay: false, levels: [] };
  const canPlay = ownerId !== null && (await deps.isSignedIn(ownerId));
  // Khách không xem bảng (Shan, 01/11/2026): chỉ biết chế độ đang mở và cần đăng nhập.
  if (!canPlay) return { enabled: true, canPlay: false, levels: [] };
  const levels = await Promise.all(
    RANKED_LEVELS.map(async (l): Promise<LevelOverview> => {
      const period = periodKey(l.id, deps.now)!;
      const [top, winners, mine, pending] = await Promise.all([
        deps.store.top(l.id, period, BOARD_SIZE),
        deps.store.countWinners(l.id, period),
        ownerId ? deps.store.get(l.id, period, ownerId) : null,
        ownerId ? deps.store.unclaimed(ownerId, l.id, period, CLAIM_LIST) : [],
      ]);
      const claimable: Claimable[] = [];
      for (const e of pending) {
        const [rank, n] = await Promise.all([deps.store.rankOf(e), deps.store.countWinners(e.level, e.period)]);
        const r = rank === null ? null : rewardGold(e.level, rank, n);
        if (r && rank !== null) claimable.push({ level: e.level, period: e.period, rank, winners: n, tier: r.tier, gold: r.gold });
      }
      return {
        level: l.id,
        cadence: l.cadence,
        period,
        winners,
        mine: mine ? await viewOf(deps, mine) : null,
        top: top.map((e, i) => ({
          rank: i + 1,
          // Khách chưa đăng nhập không có tên: hiện 4 ký tự cuối của id để phân biệt (như Nhật Lệnh).
          name: e.name ?? `Khách ${e.ownerId.slice(-4)}`,
          mine: e.ownerId === ownerId,
          score: e.score ?? 0,
          turns: e.turns ?? 0,
        })),
        claimable,
      };
    }),
  );
  return { enabled: true, canPlay, levels };
}

export type ClaimResult =
  | { readonly ok: true; readonly gold: number; readonly tier: RewardTier; readonly rank: number; readonly winners: number }
  | { readonly ok: false; readonly error: FormationError };

/** Nhận thưởng của một kỳ đã khép lại. Đúng một lần mỗi ván: cờ nhận đặt trước khi cộng vàng, hỏng thì hoàn lại. */
export async function claimFormation(deps: FormationDeps, ownerId: string, levelId: unknown, period: unknown): Promise<ClaimResult> {
  if (!deps.enabled) return { ok: false, error: "featureDisabled" };
  if (typeof levelId !== "string" || !rankedLevel(levelId)) return { ok: false, error: "unknownLevel" };
  if (!(await deps.isSignedIn(ownerId))) return { ok: false, error: "loginRequired" };
  if (typeof period !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(period)) return { ok: false, error: "badRequest" };
  if (!periodClosed(levelId, period, deps.now)) return { ok: false, error: "notClaimable" };
  const entry = await deps.store.get(levelId, period, ownerId);
  if (!entry || entry.status !== "won") return { ok: false, error: "notClaimable" };
  if (entry.claimedAt !== null) return { ok: false, error: "alreadyClaimed" };
  const [rank, winners] = await Promise.all([deps.store.rankOf(entry), deps.store.countWinners(levelId, period)]);
  const reward = rank === null ? null : rewardGold(levelId, rank, winners);
  if (!reward || rank === null) return { ok: false, error: "notClaimable" };
  if (!(await deps.store.claim(entry.id, reward.gold, deps.now))) return { ok: false, error: "alreadyClaimed" };
  const updated = await updateProfile(deps.profiles, ownerId, (p) => ({ ok: true as const, profile: { ...p, gold: p.gold + reward.gold } }), deps.now);
  if (!updated.ok) {
    await deps.store.release(entry.id);
    console.error("Không cộng được thưởng Trận Đồ", entry.id);
    return { ok: false, error: "conflict" };
  }
  return { ok: true, gold: reward.gold, tier: reward.tier, rank, winners };
}

/** Mã HTTP của từng lỗi, dùng chung cho các route. */
export function formationHttpStatus(error: FormationError): number {
  switch (error) {
    case "badRequest":
      return 400;
    case "loginRequired":
      return 401;
    case "featureDisabled":
      return 403;
    case "unknownLevel":
    case "noAttempt":
      return 404;
    case "rejected":
      return 422;
    case "unavailable":
      return 503;
    default:
      return 409;
  }
}
