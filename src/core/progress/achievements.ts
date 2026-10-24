// Thành tựu (lộ trình 5.4): mốc trọn đời, nhận thưởng vàng một lần. Tiến độ đọc thẳng từ hồ sơ.
// Số liệu là điểm xuất phát do Claude đặt, chờ Shan duyệt.

import type { Profile } from "./profile";

/** Campaign V2 has four nodes in Chapter I. */
export const CHAPTER1_STAGES = 4;

export interface AchievementDef {
  readonly id: string;
  readonly title: string;
  readonly target: number;
  readonly gold: number;
  readonly value: (p: Profile) => number;
}

const wins = (p: Profile) => p.quests.totals.win ?? 0;

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  {
    id: "a.win1",
    title: "Trận thắng đầu tiên",
    target: 1,
    gold: 50,
    value: wins,
  },
  { id: "a.win50", title: "Thắng 50 trận", target: 50, gold: 300, value: wins },
  {
    id: "a.win200",
    title: "Thắng 200 trận",
    target: 200,
    gold: 1000,
    value: wins,
  },
  {
    id: "a.chapter1",
    title: "Qua hết chương 1 chiến dịch",
    target: CHAPTER1_STAGES,
    gold: 500,
    value: (p) => p.campaign.completed.length,
  },
  {
    id: "a.tower10",
    title: "Leo tới tầng 10",
    target: 10,
    gold: 300,
    value: (p) => p.tower.best,
  },
  {
    id: "a.tower25",
    title: "Leo tới tầng 25",
    target: 25,
    gold: 800,
    value: (p) => p.tower.best,
  },
  {
    id: "a.survival10",
    title: "Sinh tồn qua 10 đợt",
    target: 10,
    gold: 300,
    value: (p) => p.survival.best,
  },
  {
    id: "a.survival20",
    title: "Sinh tồn qua 20 đợt",
    target: 20,
    gold: 800,
    value: (p) => p.survival.best,
  },
  {
    id: "a.daily7",
    title: "Đánh thử thách ngày 7 hôm",
    target: 7,
    gold: 300,
    value: (p) => p.quests.totals.daily ?? 0,
  },
  {
    id: "a.streak7",
    title: "Điểm danh đủ 7 ngày liền",
    target: 7,
    gold: 300,
    value: (p) => p.quests.totals.bestStreak ?? 0,
  },
  {
    id: "a.level10",
    title: "Đinh Bộ Lĩnh cấp 10",
    target: 10,
    gold: 200,
    value: (p) => p.main.level,
  },
  {
    id: "a.level30",
    title: "Đinh Bộ Lĩnh cấp 30",
    target: 30,
    gold: 1000,
    value: (p) => p.main.level,
  },
];

export const achievementById = (id: string) =>
  ACHIEVEMENTS.find((a) => a.id === id);

export function achievementProgress(p: Profile, def: AchievementDef) {
  const v = def.value(p);
  return {
    value: Math.min(def.target, v),
    done: v >= def.target,
    claimed: p.quests.achievements.includes(def.id),
  };
}
