// Hồ sơ người chơi: tiến trình nhân vật chính và các nhân vật kèm, vàng, lựa chọn trước trận.
// Dữ liệu thuần; client lưu tạm ở trình duyệt, server sẽ lưu DB (giai đoạn 2).

import type { Element, FighterConfig, Profession } from "../battle";
import { STARTER_COMPANIONS } from "../roster";
import { addXp, autoProgress, buildCompanion, buildMain, NEW_PROGRESS, type BattleRewards, type CharacterProgress } from "./progress";

export const MAIN_ID = "dinhBoLinh";

export interface Profile {
  readonly version: 1;
  readonly element: Element;
  readonly profession: Profession;
  readonly main: CharacterProgress;
  /** Theo id nhân vật kèm. */
  readonly companions: Readonly<Record<string, CharacterProgress>>;
  /** Chiêu nhánh nấc 2 mang vào trận, theo id nhân vật kèm. */
  readonly branchChoice: Readonly<Record<string, string>>;
  readonly gold: number;
}

export function newProfile(): Profile {
  return {
    version: 1,
    element: "moc",
    profession: "tuongSi",
    main: NEW_PROGRESS,
    companions: Object.fromEntries(STARTER_COMPANIONS.map((c) => [c.id, NEW_PROGRESS])),
    branchChoice: {},
    gold: 0,
  };
}

export function progressOf(profile: Profile, id: string): CharacterProgress {
  return id === MAIN_ID ? profile.main : (profile.companions[id] ?? NEW_PROGRESS);
}

export function withProgress(profile: Profile, id: string, p: CharacterProgress): Profile {
  return id === MAIN_ID ? { ...profile, main: p } : { ...profile, companions: { ...profile.companions, [id]: p } };
}

/** Đội của người chơi theo hồ sơ: nhân vật chính rồi các nhân vật kèm theo `companionIds`. */
export function profileTeam(profile: Profile, companionIds: readonly string[] = []): FighterConfig[] {
  const main = buildMain(profile.main, profile.element, profile.profession);
  const companions = companionIds.flatMap((id) => {
    const base = STARTER_COMPANIONS.find((c) => c.id === id);
    return base ? [buildCompanion(base, progressOf(profile, id), profile.branchChoice[id])] : [];
  });
  return [main, ...companions];
}

/** Đối thủ AI ở một cấp: tiến trình tự dựng (tiêu đều điểm kỹ năng, mua cả hai nhánh). */
export function leveledFoe(base: FighterConfig, level: number): FighterConfig {
  const p = autoProgress(level, base.profession);
  // Đối thủ AI luân phiên chiêu nhánh theo id để hai nhánh đều xuất hiện.
  const branch = p.branches.length > 1 ? p.branches[(level + base.id.length) % p.branches.length] : undefined;
  return buildCompanion(base, p, branch);
}

export interface LevelUp {
  readonly id: string;
  readonly level: number;
}

/**
 * Cộng phần thưởng cuối trận vào hồ sơ. `ids` là id nhân vật của phe người chơi theo vị trí, cùng thứ tự
 * với `rewards.xp`.
 */
export function applyRewards(profile: Profile, ids: readonly string[], rewards: BattleRewards): { profile: Profile; levelUps: LevelUp[] } {
  let next: Profile = { ...profile, gold: profile.gold + rewards.gold };
  const levelUps: LevelUp[] = [];
  ids.forEach((id, i) => {
    const gain = addXp(progressOf(next, id), rewards.xp[i] ?? 0);
    next = withProgress(next, id, gain.progress);
    if (gain.levelsGained > 0) levelUps.push({ id, level: gain.progress.level });
  });
  return { profile: next, levelUps };
}

function isProgress(x: unknown): x is CharacterProgress {
  const p = x as CharacterProgress | null;
  return (
    !!p &&
    typeof p.xp === "number" &&
    typeof p.level === "number" &&
    typeof p.skillPoints === "number" &&
    typeof p.skillLevels === "object" &&
    Array.isArray(p.branches)
  );
}

/** Đọc hồ sơ đã lưu; dữ liệu hỏng hoặc khác phiên bản thì trả về hồ sơ mới. */
export function parseProfile(raw: unknown): Profile {
  const p = raw as Profile | null;
  const fresh = newProfile();
  if (!p || p.version !== 1 || !isProgress(p.main) || typeof p.gold !== "number") return fresh;
  const companions = Object.fromEntries(
    Object.keys(fresh.companions).map((id) => [id, isProgress(p.companions?.[id]) ? p.companions[id]! : NEW_PROGRESS]),
  );
  return { ...fresh, ...p, companions, branchChoice: p.branchChoice ?? {} };
}
