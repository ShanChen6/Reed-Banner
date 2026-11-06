// Thành tựu (lộ trình 5.4): mốc trọn đời, nhận thưởng vàng một lần. Tiến độ đọc thẳng từ hồ sơ.
// Số liệu là điểm xuất phát do Claude đặt, chờ Shan duyệt.

import { STORY_NODES } from "../campaign/storyNodes";
import { campaignCompleted } from "./campaignState";
import type { Profile } from "./profile";
import { PUBLISHED_PACKS } from "../tam-tuong-ky/catalog";
import type { Pack } from "../tam-tuong-ky/types";

const CHAPTER1_NODES: readonly string[] = STORY_NODES.filter(
  (node) => node.chapter === 1,
).map((node) => node.id);

/** Campaign V2 has four nodes in Chapter I. */
export const CHAPTER1_STAGES = CHAPTER1_NODES.length;

export interface AchievementDef {
  readonly id: string;
  readonly title: string;
  readonly target: number;
  readonly gold: number;
  readonly value: (p: Profile) => number;
}

const wins = (p: Profile) => p.quests.totals.win ?? 0;
const places = (p: Profile) => p.formation?.collection.length ?? 0;

/**
 * Thành tựu Tầm Tướng Ký theo bộ tướng của một gói (Design Freeze A-13, P-20, P-21): mở đủ mọi tướng trong bộ thì
 * nhận vàng một lần; tên thành tựu là huy hiệu. Tiến độ đọc từ sổ khám phá trong hồ sơ.
 */
export function ttkAchievements(pack: Pack): readonly AchievementDef[] {
  return (pack.achievementSets ?? []).map((set) => ({
    id: set.id,
    title: set.title,
    target: set.heroIds.length,
    gold: set.gold,
    value: (p: Profile) => {
      const found = p.tamTuongKy?.discovery.discoveredNodeIds ?? [];
      return set.heroIds.filter((id) => found.includes(id)).length;
    },
  }));
}

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
    // Chỉ đếm nhiệm vụ của Chương I (sự kiện hay trận đều là hoàn thành nhiệm vụ), không đếm nhiệm vụ chương sau.
    value: (p) =>
      p.campaign.completed.filter((id) => CHAPTER1_NODES.includes(id)).length,
  },
  {
    // Chiến dịch V2 khép ở M24 (Đại lễ đăng quang 968), không đếm số trận thắng.
    id: "a.campaign",
    title: "Đại Cồ Việt: hoàn thành chiến dịch",
    target: 1,
    gold: 500,
    value: (p) => (campaignCompleted(p.campaign) ? 1 : 0),
  },
  {
    id: "a.survival10",
    title: "Trấn Ải qua 10 đợt",
    target: 10,
    gold: 300,
    value: (p) => p.survival.best,
  },
  {
    id: "a.survival20",
    title: "Trấn Ải qua 20 đợt",
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
  // Bộ sưu tập địa danh Trận Đồ (V2-05, mốc do Claude đặt, chờ Shan duyệt).
  { id: "a.places5", title: "Du khảo sơn hà", target: 5, gold: 200, value: places },
  { id: "a.places15", title: "Thông tỏ địa đồ", target: 15, gold: 500, value: places },
  { id: "a.places30", title: "Thu trọn giang sơn", target: 30, gold: 1000, value: places },
  ...PUBLISHED_PACKS.flatMap(ttkAchievements),
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
