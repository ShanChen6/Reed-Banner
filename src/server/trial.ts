// Bắt đầu / thử lại / bỏ trận Tháp Thí Luyện (Trial). Server dựng toàn bộ: đội, đối thủ, máu đầy, lương cố định,
// seed theo tầng. Không đọc máu/lương/Phúc của chế độ khác, không ghi trang bị hay Profile ngoài dấu trận đang mở.

import {
  FLOOR_RNG_VERSION,
  HUMAN,
  hashString,
  isDualTowerV1,
  makeTowerMatchTag,
  matchOver,
  prepareTowerLineup,
  resolveFloor,
  startMatch,
  toFloorDefinition,
  TOWER_FOOD_START,
  trialEnemyBuilder,
  viewOf,
  type BattleEvent,
  type MatchView,
  type PreparedLineupError,
  type SideIndex,
  type TowerLeaderBuild,
  type TrialFloorSpec,
  type TrialRegistry,
} from "@/core";
import { getBattle, type Deps } from "./battles";
import { FEATURE_DISABLED_ERROR, trialEnabled } from "./featureFlags";
import { loadProfile, updateProfile } from "./profiles";
import type { MatchRecord } from "./store";

export interface TrialStartInput {
  readonly floor: number;
  /** Đúng 2 tướng kèm đã sở hữu. */
  readonly companions: readonly string[];
  readonly leaderBuild?: Partial<TowerLeaderBuild>;
}

export type TrialStartError =
  | "bad_request"
  | "floor_not_found"
  | "floor_locked"
  /** Tiêu chí thắng mà engine chưa thực thi (chỉ defeatAll chạy được). */
  | "win_unsupported"
  | "lineup_invalid"
  | "unsupported_schema"
  /** Đang có trận Trial khác chưa xong. */
  | "active_elsewhere"
  | typeof FEATURE_DISABLED_ERROR
  | "conflict";

export type TrialStartResult =
  | {
      readonly ok: true;
      readonly id: string;
      readonly view: MatchView;
      readonly events: readonly BattleEvent[];
      /** true khi trả lại trận đang mở thay vì tạo trận mới. */
      readonly resumed: boolean;
    }
  | {
      readonly ok: false;
      readonly error: TrialStartError;
      readonly lineup?: PreparedLineupError;
    };

export type TrialDeps = Deps & { readonly floors: TrialRegistry };

/** Lương vào mỗi lần thử Trial, không phụ thuộc lương mang từ chế độ khác. */
export const TRIAL_FOOD = TOWER_FOOD_START;

/**
 * Seed của tầng: cùng tầng/nội dung luôn ra cùng bàn cờ và AI, qua mọi lần thử lại. Muối server-only được
 * băm vào nên client chỉ biết `publicSeed` cũng không dựng lại được seed trận.
 */
export function trialBattleSeed(spec: TrialFloorSpec): number {
  return hashString(
    `${FLOOR_RNG_VERSION}|trial|${spec.id}|${spec.contentVersion}|${spec.board.publicSeed}|${spec.serverSalt}`,
  );
}

const isStr = (x: unknown): x is string => typeof x === "string" && x.length > 0;

function parseStart(input: unknown): TrialStartInput | null {
  if (!input || typeof input !== "object") return null;
  const i = input as Record<string, unknown>;
  if (!Number.isInteger(i.floor) || !Array.isArray(i.companions) || !i.companions.every(isStr))
    return null;
  if (i.leaderBuild !== undefined && (!i.leaderBuild || typeof i.leaderBuild !== "object"))
    return null;
  return i as unknown as TrialStartInput;
}

/** Trận đang mở của người chơi; chạy bù/chốt luôn nếu đã kết thúc để dấu không bị treo. */
async function openMatch(ownerId: string, deps: TrialDeps) {
  const { profile } = await loadProfile(deps.profiles, ownerId);
  if (!isDualTowerV1(profile.dualTower)) return { schema: false as const };
  const active = profile.dualTower.trial.active;
  if (!active) return { schema: true as const, active: undefined };
  const res = await getBattle(active.matchId, ownerId, deps);
  const live = res.ok && !res.view.forfeited && res.view.battle.winner === null;
  return { schema: true as const, active, res: live ? res : undefined };
}

/**
 * Mở trận Trial ở tầng `floor`. Chưa có trận mở → tạo mới (máu đầy, lương `TRIAL_FOOD`). Đang có trận mở
 * cùng tầng → trả lại trận đó (gọi lặp/tải lại không tạo thêm). Đang mở tầng khác → từ chối.
 */
export async function startTrialBattle(
  ownerId: string,
  rawInput: unknown,
  deps: TrialDeps,
): Promise<TrialStartResult> {
  if (!trialEnabled(deps)) return { ok: false, error: FEATURE_DISABLED_ERROR };
  const input = parseStart(rawInput);
  if (!input) return { ok: false, error: "bad_request" };
  const spec = deps.floors.get(input.floor);
  if (!spec) return { ok: false, error: "floor_not_found" };
  if (spec.win.kind !== "defeatAll") return { ok: false, error: "win_unsupported" };

  const open = await openMatch(ownerId, deps);
  if (!open.schema) return { ok: false, error: "unsupported_schema" };
  if (open.active && open.res) {
    if (open.active.floor !== input.floor)
      return { ok: false, error: "active_elsewhere" };
    return {
      ok: true,
      id: open.active.matchId,
      view: open.res.view,
      events: [],
      resumed: true,
    };
  }
  const staleId = open.active?.matchId;

  const resolved = resolveFloor(toFloorDefinition(spec), "trial", trialEnemyBuilder(spec));
  if (!resolved.ok) return { ok: false, error: "bad_request" };
  const floor = resolved.floor;
  const matchId = deps.newId();

  let failure: TrialStartError | undefined;
  let lineupError: PreparedLineupError | undefined;
  let prepared: ReturnType<typeof prepareTowerLineup> | undefined;
  const u = await updateProfile(
    deps.profiles,
    ownerId,
    (p) => {
      if (!isDualTowerV1(p.dualTower))
        return { ok: false as const, error: "unsupported_schema" as const };
      const trial = p.dualTower.trial;
      if (
        spec.unlock.requiresFloor !== null && trial.cleared < spec.unlock.requiresFloor
      )
        return { ok: false as const, error: "floor_locked" as const };
      if (input.floor > trial.cleared + 1)
        return { ok: false as const, error: "floor_locked" as const };
      if (trial.active && trial.active.matchId !== staleId)
        return { ok: false as const, error: "active_elsewhere" as const };
      const r = prepareTowerLineup(
        p,
        {
          mode: "trial",
          companions: input.companions,
          ...(input.leaderBuild ? { leaderBuild: input.leaderBuild } : {}),
        },
        spec.rules,
      );
      if (!r.ok) {
        lineupError = r.error;
        return { ok: false as const, error: "lineup_invalid" as const };
      }
      prepared = r;
      return {
        ok: true as const,
        profile: {
          ...p,
          dualTower: {
            ...p.dualTower,
            trial: { ...trial, active: { matchId, floor: input.floor } },
          },
        },
      };
    },
    deps.now,
  );
  if (!u.ok) {
    failure = u.error as TrialStartError;
    return { ok: false, error: failure, ...(lineupError ? { lineup: lineupError } : {}) };
  }
  if (!prepared || !prepared.ok) return { ok: false, error: "conflict" };
  const lineup = prepared.lineup;

  const { match, events } = startMatch({
    sides: [
      { ...lineup.side, food: TRIAL_FOOD },
      { fighters: floor.foes, leader: 0 },
    ],
    difficulty: floor.difficulty,
    seed: trialBattleSeed(spec),
    // Người chơi luôn đi trước: bàn cờ và AI cố định nên mỗi lần thử cùng điều kiện.
    firstSide: HUMAN as SideIndex,
    now: deps.now,
    weights: floor.weights,
    trial: {
      tag: makeTowerMatchTag(floor, lineup.ids),
      turnLimit: spec.turnLimit,
      firstClearStones: spec.firstClearStones,
    },
  });
  const record: MatchRecord = {
    id: matchId,
    ownerId,
    match,
    createdAt: deps.now,
    updatedAt: deps.now,
  };
  await deps.store.create(record);
  return { ok: true, id: matchId, view: viewOf(match), events, resumed: false };
}

/**
 * Bỏ trận Trial đang mở để đổi đội/tầng: xử thua (không thưởng, không phạt) rồi gỡ dấu qua đường chốt chung.
 * Không có trận mở thì không làm gì.
 */
export async function abandonTrialBattle(
  ownerId: string,
  deps: TrialDeps,
): Promise<{ readonly ok: true; readonly abandoned: boolean } | { readonly ok: false; readonly error: TrialStartError }> {
  if (!trialEnabled(deps)) return { ok: false, error: FEATURE_DISABLED_ERROR };
  const { profile } = await loadProfile(deps.profiles, ownerId);
  if (!isDualTowerV1(profile.dualTower)) return { ok: false, error: "unsupported_schema" };
  const active = profile.dualTower.trial.active;
  if (!active) return { ok: true, abandoned: false };
  const rec = await deps.store.get(active.matchId);
  if (rec && rec.ownerId === ownerId && !matchOver(rec.match)) {
    const battle = structuredClone(rec.match.battle);
    battle.winner = 1;
    battle.turn.deadline = null;
    const next = { ...rec.match, battle, seq: rec.match.seq + 1, forfeited: true };
    if (!(await deps.store.save({ ...rec, match: next, updatedAt: deps.now }, rec.match.seq)))
      return { ok: false, error: "conflict" };
  }
  // Chạy qua đường chung: chốt thua một lần và gỡ dấu (kể cả khi trận đã mất).
  const res = await getBattle(active.matchId, ownerId, deps);
  if (!res.ok) await clearStale(ownerId, active.matchId, deps);
  return { ok: true, abandoned: true };
}

async function clearStale(ownerId: string, matchId: string, deps: TrialDeps) {
  await updateProfile(
    deps.profiles,
    ownerId,
    (p) => {
      if (!isDualTowerV1(p.dualTower) || p.dualTower.trial.active?.matchId !== matchId)
        return { ok: false as const, error: "noop" as const };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { active, ...rest } = p.dualTower.trial;
      return { ok: true as const, profile: { ...p, dualTower: { ...p.dualTower, trial: rest } } };
    },
    deps.now,
  );
}
