// Chốt trận Tháp Thí Luyện trong MỘT lần ghi hồ sơ: nâng cleared, kỷ lục tầng, và (lần thắng đầu của tầng)
// cộng Đá Cường Hóa cùng khóa idempotent. Không vàng, EXP, món rơi, nhiệm vụ, bảng xếp hạng, không đụng
// tower.best/tower.run, không có đường tiêu đá, và không quét ngày (task khác).

import {
  applyStoneAward,
  HUMAN,
  isDualTowerV1,
  planTrialSettle,
  TRIAL_FLOORS,
  type Match,
  type TrialFloorRecord,
  type TrialProgress,
} from "@/core";
import { updateProfile, type ProfileStore } from "./profiles";
import { trialEnabled } from "./featureFlags";

export interface TrialResult {
  readonly floor: number;
  readonly won: boolean;
  /** Tầng cao nhất đã qua sau khi chốt. */
  readonly cleared: number;
  /** Thắng và lần này mới mở thêm tầng. */
  readonly newlyCleared: boolean;
  /** Đá Cường Hóa thực cộng lần này (0 khi đánh lại hoặc đã nhận). */
  readonly stonesGranted: number;
  /** Lần thắng này lập kỷ lục số lượt mới của tầng. */
  readonly newBest: boolean;
}

/** Cập nhật kỷ lục tầng: thêm một lần thắng, bestTurns chỉ giảm. */
function withRecord(trial: TrialProgress, floor: number, turns: number): {
  trial: TrialProgress;
  newBest: boolean;
} {
  const list = trial.records ?? [];
  const prev = list.find((r) => r.floor === floor);
  const bestTurns = Math.min(prev?.bestTurns ?? Infinity, turns);
  const rec: TrialFloorRecord = { floor, clears: (prev?.clears ?? 0) + 1, bestTurns };
  const records = [...list.filter((r) => r.floor !== floor), rec].sort((a, b) => a.floor - b.floor);
  return { trial: { ...trial, records }, newBest: !prev || bestTurns < prev.bestTurns };
}

/**
 * Gọi đúng một lần cho mỗi trận (đã qua `claimReward`), và vẫn an toàn khi hai trận cùng tầng chốt đồng thời:
 * mọi quyết định đọc lại hồ sơ mới nhất trong lần ghi có version, nên chỉ một bên nhận đá lần đầu.
 * Nếu cộng đá lỗi (tràn ví...), vẫn ghi tiến trình/kỷ lục nhưng chưa chốt quyền nhận, để nhận được ở lần sau.
 */
export async function settleTrial(
  ownerId: string,
  matchId: string,
  match: Match,
  deps: { readonly profiles: ProfileStore; readonly now: number; readonly trialEnabled?: boolean },
): Promise<TrialResult | undefined> {
  if (!trialEnabled(deps)) return undefined;
  const tm = match.trial;
  if (!tm) return undefined;
  const floor = tm.tag.floor;
  const won = match.battle.winner === HUMAN;
  const turns = Math.max(1, Math.floor(match.battle.turn.number));
  let result: TrialResult = {
    floor, won, cleared: 0, newlyCleared: false, stonesGranted: 0, newBest: false,
  };
  const u = await updateProfile(
    deps.profiles,
    ownerId,
    (p) => {
      if (!isDualTowerV1(p.dualTower))
        return { ok: false as const, error: "unsupported_schema" as const };
      const tower = p.dualTower;
      const cur = tower.trial;
      const { active, ...base } = cur;
      const keepActive = active && active.matchId !== matchId ? { active } : {};
      const finish = (profile: typeof p, trial: TrialProgress, granted: number, newBest: boolean) => {
        result = {
          floor, won, cleared: trial.cleared,
          newlyCleared: trial.cleared > cur.cleared, stonesGranted: granted, newBest,
        };
        const dt = profile.dualTower;
        if (!isDualTowerV1(dt)) return { ok: false as const, error: "unsupported_schema" as const };
        return {
          ok: true as const,
          profile: { ...profile, dualTower: { ...dt, trial: { ...trial, ...keepActive } } },
        };
      };
      if (!won || floor < 1 || floor > TRIAL_FLOORS || floor > cur.cleared + 1)
        return finish(p, base, 0, false);

      const rec = withRecord(base, floor, turns);
      const stones = tm.firstClearStones;
      if (stones === undefined) {
        const next = { ...rec.trial, cleared: Math.max(cur.cleared, floor) };
        return finish(p, next, 0, rec.newBest);
      }
      const plan = planTrialSettle(rec.trial, { floor, won: true, firstClearStones: stones });
      if (plan.ok) {
        const awarded = applyStoneAward(p, plan.events, { trial: plan.next });
        if (awarded.ok) {
          const dt = awarded.profile.dualTower;
          const trial = isDualTowerV1(dt) ? dt.trial : plan.next;
          return finish(awarded.profile, trial, awarded.granted, rec.newBest);
        }
        console.error("Không cộng được đá Trial", matchId, awarded.error);
      } else {
        console.error("Kế hoạch thưởng Trial bị từ chối", matchId, plan.error);
      }
      // Giữ quyền nhận: chỉ nâng tiến trình, không ghi claimedFloors.
      return finish(p, { ...rec.trial, cleared: Math.max(cur.cleared, floor) }, 0, rec.newBest);
    },
    deps.now,
  );
  if (!u.ok) {
    console.error("Không chốt được trận Trial", matchId, u.error);
    return { floor, won, cleared: 0, newlyCleared: false, stonesGranted: 0, newBest: false };
  }
  return result;
}
