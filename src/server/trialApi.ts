// Lớp API của Tháp Thí Luyện: trả {status, body} thuần để route mỏng và dễ test. Client chỉ nhận bản công khai
// của tầng (không có serverSalt/bàn cờ thật) và tiến trình đã được server xác nhận.

import {
  createTrialRegistry,
  isDualTowerV1,
  type TrialFloorPublic,
  type TrialFloorRecord,
  type TrialRegistry,
} from "@/core";
import { loadProfile, type ProfileStore } from "./profiles";
import { TRIAL_FLOOR_DATA } from "./trialContent";
import {
  abandonTrialBattle,
  startTrialBattle,
  type TrialDeps,
  type TrialStartError,
} from "./trial";

export type FloorState = "locked" | "open" | "cleared";

export interface TrialFloorEntry {
  readonly floor: TrialFloorPublic;
  readonly state: FloorState;
  /** Đã nhận đá lần đầu (theo server). */
  readonly firstClearClaimed: boolean;
  readonly record: TrialFloorRecord | null;
}

export interface TrialOverview {
  /** false khi chưa có nội dung tầng. */
  readonly available: boolean;
  /** false khi hồ sơ dùng schema Song Tháp mới hơn bản server này hiểu. */
  readonly supported: boolean;
  readonly cleared: number;
  readonly stones: number;
  readonly active: { readonly matchId: string; readonly floor: number } | null;
  readonly floors: readonly TrialFloorEntry[];
}

export interface ApiReply {
  readonly status: number;
  readonly body: Record<string, unknown>;
}

let cached: TrialRegistry | undefined;

/** Registry của server, dựng một lần. Dữ liệu hỏng thì ghi log và coi như chưa có nội dung (không crash). */
export function trialRegistry(): TrialRegistry {
  if (cached) return cached;
  const r = createTrialRegistry(TRIAL_FLOOR_DATA, { requireComplete: true });
  if (!r.ok) {
    console.error("Dữ liệu tầng Trial không hợp lệ", r.error);
    const empty = createTrialRegistry([]);
    cached = empty.ok ? empty.registry : (undefined as never);
  } else {
    cached = r.registry;
  }
  return cached;
}

export async function trialOverview(
  profiles: ProfileStore,
  ownerId: string | null,
  floors: TrialRegistry,
): Promise<TrialOverview> {
  const profile = ownerId ? (await loadProfile(profiles, ownerId)).profile : null;
  const tower = profile && isDualTowerV1(profile.dualTower) ? profile.dualTower : null;
  const trial = tower?.trial;
  const cleared = trial?.cleared ?? 0;
  const entries: TrialFloorEntry[] = floors.all().map((spec) => {
    const open =
      spec.floor <= cleared + 1 &&
      (spec.unlock.requiresFloor === null || spec.unlock.requiresFloor <= cleared);
    return {
      floor: floors.publicView(spec.floor)!,
      state: spec.floor <= cleared ? "cleared" : open ? "open" : "locked",
      firstClearClaimed: trial?.claimedFloors.includes(spec.floor) ?? false,
      record: trial?.records?.find((r) => r.floor === spec.floor) ?? null,
    };
  });
  return {
    available: floors.size > 0,
    supported: profile === null || tower !== null,
    cleared,
    stones: profile?.stones ?? 0,
    active: trial?.active ? { ...trial.active } : null,
    floors: entries,
  };
}

const START_STATUS: Record<TrialStartError, number> = {
  bad_request: 400,
  floor_not_found: 404,
  floor_locked: 403,
  win_unsupported: 422,
  lineup_invalid: 422,
  unsupported_schema: 409,
  active_elsewhere: 409,
  conflict: 409,
};

export async function startTrialRequest(
  ownerId: string,
  body: unknown,
  deps: TrialDeps,
): Promise<ApiReply> {
  const r = await startTrialBattle(ownerId, body, deps);
  if (!r.ok)
    return {
      status: START_STATUS[r.error],
      body: { error: r.error, ...(r.lineup ? { lineup: r.lineup } : {}), now: deps.now },
    };
  return {
    status: 200,
    body: { id: r.id, view: r.view, events: r.events, resumed: r.resumed, now: deps.now },
  };
}

export async function abandonTrialRequest(ownerId: string, deps: TrialDeps): Promise<ApiReply> {
  const r = await abandonTrialBattle(ownerId, deps);
  return r.ok
    ? { status: 200, body: { abandoned: r.abandoned } }
    : { status: START_STATUS[r.error], body: { error: r.error } };
}
