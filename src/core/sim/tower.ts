// Mô phỏng leo tháp: AI Thường leo thay người chơi, máu và lương mang sang, tự chọn phần thưởng giữa các tầng.
// Dùng để cân độ khó tầng, xem docs/design/09-che-do-choi.md mục 3.

import type { SideIndex } from "../battle";
import {
  applyTowerReward,
  autoProgress,
  DEFAULT_TEAM,
  newProfile,
  type Profile,
  type TowerReward,
  type TowerRun,
} from "../progress";
import { newTowerRun, towerFloor, towerOffer, towerTeam } from "../tower";
import { runBattle } from "./sim";

/** Hồ sơ mô phỏng: nhân vật chính và đội khởi đầu cùng ở một cấp, điểm kỹ năng tiêu đều. */
export function simProfile(level: number): Profile {
  const p = newProfile();
  return {
    ...p,
    main: autoProgress(level, null),
    companions: Object.fromEntries(
      DEFAULT_TEAM.map((id) => [
        id,
        autoProgress(level, null),
      ]),
    ),
  };
}

/** Cách AI chọn thưởng: có người ngã hoặc máu trung bình dưới nửa thì hồi máu, thiếu lương thì thêm lương, còn lại lấy phúc. */
export function pickReward(
  run: TowerRun,
  offer: readonly TowerReward[],
): number {
  const avg = run.hp.reduce((a, b) => a + b, 0) / run.hp.length;
  const want =
    run.hp.some((h) => h === 0) || avg < 0.5
      ? "heal"
      : run.food < 40
        ? "food"
        : "boon";
  return Math.max(
    0,
    offer.findIndex((o) => o.kind === want),
  );
}

export interface TowerSimResult {
  /** Số tầng đã qua trước khi thua (hoặc chạm `maxFloors`). */
  readonly cleared: number;
}

/** Một lượt leo từ tầng 1 tới khi thua. */
export function simulateTower(
  level: number,
  seed: number,
  maxFloors = 40,
): TowerSimResult {
  const profile = simProfile(level);
  let run = newTowerRun(profile, seed);
  for (let floor = 1; floor <= maxFloors; floor++) {
    const f = towerFloor(run, floor);
    const r = runBattle(
      {
        sides: [
          {
            fighters: towerTeam(profile, run),
            leader: 0,
            food: run.food,
            hpRatio: run.hp,
          },
          { fighters: f.foes, leader: 0 },
        ],
        seed: (seed + floor * 7919) >>> 0,
        firstSide: (floor % 2) as SideIndex,
        weights: f.weights,
      },
      { difficulty: ["normal", f.difficulty] },
    );
    if (r.winner !== 0) return { cleared: floor - 1 };
    run = {
      ...run,
      floor: floor + 1,
      hp: r.side0Hp,
      food: Math.max(20, Math.min(100, r.side0Food)),
    };
    const offer = towerOffer(run, floor);
    run = applyTowerReward(run, offer[pickReward(run, offer)]!);
  }
  return { cleared: maxFloors };
}
