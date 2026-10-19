// Dịch vụ trận online: tạo trận, xem trận (kèm chạy bù), nhận hành động của người chơi.
// Không phụ thuộc Next.js; route handler chỉ đọc cookie/body rồi gọi vào đây, test gọi thẳng.

import {
  applyRewards,
  battleRewards,
  ELEMENTS,
  HUMAN,
  humanAct,
  leveledFoe,
  PROFESSIONS,
  profileTeam,
  settle,
  startMatch,
  STARTER_COMPANIONS,
  viewOf,
  type BattleAction,
  type BattleEvent,
  type Difficulty,
  type Element,
  type BattleRewards,
  type FighterConfig,
  type LevelUp,
  type Match,
  type MatchError,
  type MatchView,
  type Pos,
  type Profession,
  type SideIndex,
  type Slide,
} from "@/core";
import { loadProfile, updateProfile, type ProfileStore } from "./profiles";
import type { MatchRecord, MatchStore } from "./store";

export interface Deps {
  readonly store: MatchStore;
  readonly profiles: ProfileStore;
  readonly now: number;
  /** Seed 32 bit, server bốc bằng crypto; client không bao giờ thấy. */
  readonly seed: number;
  readonly newId: () => string;
}

const DIFFICULTIES: readonly Difficulty[] = ["easy", "normal", "hard", "boss", "nightmare"];

export interface NewBattleInput {
  readonly mode: "1v1" | "3v3";
  readonly element: Element;
  readonly profession: Profession;
  /** 3vs3: đúng 2 id nhân vật kèm khởi đầu. */
  readonly companions: readonly string[];
  readonly difficulty: Difficulty;
}

export type ServiceError = MatchError | "badRequest" | "notFound" | "conflict";

/** Phần thưởng cuối trận đã cộng vào hồ sơ, gửi kèm đúng một lần (response làm trận kết thúc). */
export interface Outcome {
  readonly rewards: BattleRewards;
  readonly levelUps: readonly LevelUp[];
}

export type ServiceResult =
  | {
      readonly ok: true;
      readonly id: string;
      readonly view: MatchView;
      readonly events: readonly BattleEvent[];
      readonly outcome?: Outcome;
    }
  | { readonly ok: false; readonly error: ServiceError; readonly view?: MatchView };

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null;
const oneOf = <T extends string>(list: readonly T[], x: unknown): x is T => typeof x === "string" && (list as readonly string[]).includes(x);

/** Kiểm tra body tạo trận; null khi không hợp lệ. */
export function parseNewBattle(body: unknown): NewBattleInput | null {
  if (!isObj(body)) return null;
  const { mode, element, profession, difficulty } = body;
  const companions = Array.isArray(body.companions) ? body.companions : [];
  if (!oneOf(["1v1", "3v3"] as const, mode) || !oneOf(ELEMENTS, element) || !oneOf(PROFESSIONS, profession)) return null;
  if (!oneOf(DIFFICULTIES, difficulty)) return null;
  const ids = STARTER_COMPANIONS.map((c) => c.id);
  if (mode === "3v3" && (companions.length !== 2 || new Set(companions).size !== 2 || !companions.every((c) => oneOf(ids, c)))) return null;
  return { mode, element, profession, difficulty, companions: mode === "3v3" ? (companions as string[]) : [] };
}

const toPos = (p: unknown): Pos | null =>
  isObj(p) && Number.isInteger(p.row) && Number.isInteger(p.col) ? { row: p.row as number, col: p.col as number } : null;

const toSlide = (s: unknown): Slide | null =>
  isObj(s) && oneOf(["row", "col"] as const, s.axis) && Number.isInteger(s.index) && Number.isInteger(s.offset)
    ? { axis: s.axis, index: s.index as number, offset: s.offset as number }
    : null;

function toAction(a: Record<string, unknown>): BattleAction | null {
  switch (a.type) {
    case "swap": {
      const from = toPos(a.from);
      const to = toPos(a.to);
      return from && to ? { type: "swap", from, to } : null;
    }
    case "selectActor":
      return Number.isInteger(a.fighter) ? { type: "selectActor", fighter: a.fighter as number } : null;
    case "timeout":
      return { type: "timeout" };
    case "slide": {
      const slide = toSlide(a.slide);
      return slide ? { type: "slide", slide } : null;
    }
    case "skill": {
      const cell = a.cell === undefined ? undefined : toPos(a.cell);
      const slide = a.slide === undefined ? undefined : toSlide(a.slide);
      if (typeof a.skill !== "string" || cell === null || slide === null) return null;
      if (a.target !== undefined && !Number.isInteger(a.target)) return null;
      return {
        type: "skill",
        skill: a.skill,
        ...(a.target === undefined ? {} : { target: a.target as number }),
        ...(cell ? { cell } : {}),
        ...(slide ? { slide } : {}),
      };
    }
    default:
      return null;
  }
}

/** Kiểm tra hình dạng hành động `{ seq, action }`; luật chi tiết do core xét. */
export function parseAction(body: unknown): { action: BattleAction; seq: number } | null {
  if (!isObj(body) || !Number.isInteger(body.seq) || !isObj(body.action)) return null;
  const action = toAction(body.action);
  return action ? { action, seq: body.seq as number } : null;
}

/** Đối thủ: các nhân vật kèm khởi đầu không có trong đội người chơi, chọn theo seed. */
function pickFoes(input: NewBattleInput, seed: number): FighterConfig[] {
  const pool = STARTER_COMPANIONS.filter((c) => !input.companions.includes(c.id));
  const count = input.mode === "3v3" ? 3 : 1;
  const start = seed % pool.length;
  return Array.from({ length: count }, (_, i) => pool[(start + i) % pool.length]!);
}

/**
 * Tạo trận theo hồ sơ trên server: đội người chơi mang cấp, kỹ năng và chiêu nhánh đã nâng; đối thủ cùng
 * cấp với nhân vật chính. Nguyên tố và nghề vừa chọn được lưu lại vào hồ sơ.
 */
export async function createBattleFor(ownerId: string, input: NewBattleInput, deps: Deps): Promise<ServiceResult> {
  const { profile } = await loadProfile(deps.profiles, ownerId);
  const chosen = { ...profile, element: input.element, profession: input.profession };
  if (chosen.element !== profile.element || chosen.profession !== profile.profession) {
    // Chỉ để lần sau mở trang chọn sẵn; ghi không được (hai tab cùng ghi) cũng không sao.
    await updateProfile(deps.profiles, ownerId, (p) => ({ ok: true, profile: { ...p, element: input.element, profession: input.profession } }), deps.now);
  }
  const team = profileTeam(chosen, input.companions);
  const foes = pickFoes(input, deps.seed).map((f) => leveledFoe(f, profile.main.level));
  const { match, events } = startMatch({
    sides: [
      { fighters: team, leader: 0 },
      { fighters: foes, leader: 0 },
    ],
    difficulty: input.difficulty,
    seed: deps.seed,
    firstSide: (deps.seed & 1) as SideIndex,
    now: deps.now,
  });
  const record: MatchRecord = { id: deps.newId(), ownerId, match, createdAt: deps.now, updatedAt: deps.now };
  await deps.store.create(record);
  return { ok: true, id: record.id, view: viewOf(match), events };
}

async function load(id: string, ownerId: string, store: MatchStore): Promise<MatchRecord | null> {
  const r = await store.get(id);
  // Trận của người khác trả về như không tồn tại, để không lộ id.
  return r && r.ownerId === ownerId ? r : null;
}

/**
 * Trận đã kết thúc mà chưa cộng thưởng: đánh dấu đã cộng (chỉ một request thắng) rồi cộng vào hồ sơ.
 * Thua vẫn nhận kinh nghiệm cơ bản và giữ vàng, sách đã nhặt.
 */
async function reward(r: MatchRecord, match: Match, deps: Omit<Deps, "seed" | "newId">): Promise<Outcome | undefined> {
  if (match.battle.winner === null || !(await deps.store.claimReward(r.id, deps.now))) return undefined;
  const rewards = battleRewards(match.battle, HUMAN);
  const ids = match.battle.sides[HUMAN].fighters.map((f) => f.id);
  let levelUps: readonly LevelUp[] = [];
  const u = await updateProfile(
    deps.profiles,
    r.ownerId,
    (p) => {
      const applied = applyRewards(p, ids, rewards);
      levelUps = applied.levelUps;
      return { ok: true, profile: applied.profile };
    },
    deps.now,
  );
  if (!u.ok) console.error("Không cộng được thưởng cuối trận", r.id, u.error);
  return { rewards, levelUps };
}

/** Chạy bù tới `now`, lưu nếu có thay đổi, cộng thưởng nếu trận vừa kết thúc. */
async function settleRecord(r: MatchRecord, deps: Omit<Deps, "seed" | "newId">): Promise<ServiceResult> {
  const { match, events } = settle(r.match, deps.now);
  if (match.seq !== r.match.seq && !(await deps.store.save({ ...r, match, updatedAt: deps.now }, r.match.seq))) {
    return { ok: false, error: "conflict" };
  }
  const outcome = await reward(r, match, deps);
  return { ok: true, id: r.id, view: viewOf(match), events, ...(outcome ? { outcome } : {}) };
}

/** Xem trận: chạy bù tới `now` (hết giờ, AI, xử thua 24 giờ) rồi lưu nếu có thay đổi. */
export async function getBattle(id: string, ownerId: string, deps: Omit<Deps, "seed" | "newId">): Promise<ServiceResult> {
  const r = await load(id, ownerId, deps.store);
  return r ? settleRecord(r, deps) : { ok: false, error: "notFound" };
}

/**
 * Việc định kỳ: chốt các trận bỏ dở (xử thua sau 24 giờ không ra tay) và cộng thưởng còn treo, để hồ sơ
 * nhận thưởng kể cả khi người chơi không bao giờ mở lại trận.
 */
export async function settleAbandoned(ids: readonly string[], deps: Omit<Deps, "seed" | "newId">): Promise<number> {
  let settled = 0;
  for (const id of ids) {
    const r = await deps.store.get(id);
    if (!r) continue;
    const res = await settleRecord(r, deps);
    if (res.ok && res.view.battle.winner !== null) settled++;
  }
  return settled;
}

/** Nhận một hành động. Lỗi luật vẫn lưu phần chạy bù và trả view mới để client đồng bộ lại. */
export async function actBattle(
  id: string,
  ownerId: string,
  body: unknown,
  deps: Omit<Deps, "seed" | "newId">,
): Promise<ServiceResult> {
  const parsed = parseAction(body);
  if (!parsed) return { ok: false, error: "badRequest" };
  const r = await load(id, ownerId, deps.store);
  if (!r) return { ok: false, error: "notFound" };
  const result = humanAct(r.match, parsed.action, parsed.seq, deps.now);
  const changed = result.match.seq !== r.match.seq;
  if (changed && !(await deps.store.save({ ...r, match: result.match, updatedAt: deps.now }, r.match.seq))) {
    return { ok: false, error: "conflict" };
  }
  if (!result.ok) return { ok: false, error: result.error, view: viewOf(result.match) };
  const outcome = await reward(r, result.match, deps);
  return { ok: true, id, view: viewOf(result.match), events: result.events, ...(outcome ? { outcome } : {}) };
}

/** Mã HTTP cho từng lỗi. */
export function httpStatus(error: ServiceError): number {
  if (error === "notFound") return 404;
  if (error === "conflict" || error === "staleSeq") return 409;
  return error === "badRequest" ? 400 : 422;
}
