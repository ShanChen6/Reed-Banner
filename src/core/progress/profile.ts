// Hồ sơ người chơi: tiến trình nhân vật chính và các nhân vật kèm, vàng, lựa chọn trước trận.
// Dữ liệu thuần: /demo lưu ở trình duyệt, /play lưu trên server (bảng `profiles`).

import type { Element, FighterConfig, Profession } from "../battle";
import { STARTER_COMPANIONS } from "../roster";
import {
  addXp,
  autoProgress,
  buildCompanion,
  buildMain,
  buyBranch,
  NEW_PROGRESS,
  upgradeSkill,
  type BattleRewards,
  type CharacterProgress,
  type ProgressError,
} from "./progress";

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

// ——— Thao tác trên hồ sơ (client gửi ý định, server áp bằng chính các hàm này) ———

export type ProfileAction =
  /** Nâng kỹ năng: nhân vật chính theo ô ("o1".."o6"), nhân vật kèm theo id chiêu. */
  | { readonly type: "upgrade"; readonly character: string; readonly key: string }
  | { readonly type: "buyBranch"; readonly character: string; readonly skill: string }
  /** Chọn chiêu nhánh nấc 2 đã mua để mang vào trận. */
  | { readonly type: "chooseBranch"; readonly character: string; readonly skill: string };

export type ProfileActionResult = { readonly ok: true; readonly profile: Profile } | { readonly ok: false; readonly error: ProgressError };

function companionProfession(id: string): Profession | null {
  return STARTER_COMPANIONS.find((c) => c.id === id)?.profession ?? null;
}

export function applyProfileAction(profile: Profile, action: ProfileAction): ProfileActionResult {
  const isMain = action.character === MAIN_ID;
  const profession = isMain ? null : companionProfession(action.character);
  if (!isMain && profession === null) return { ok: false, error: "invalidSkill" };
  const p = progressOf(profile, action.character);
  switch (action.type) {
    case "upgrade": {
      const r = upgradeSkill(p, action.key, profession);
      return r.ok ? { ok: true, profile: withProgress(profile, action.character, r.progress) } : r;
    }
    case "buyBranch": {
      if (profession === null) return { ok: false, error: "invalidSkill" };
      const r = buyBranch(p, action.skill, profession);
      return r.ok ? { ok: true, profile: withProgress(profile, action.character, r.progress) } : r;
    }
    case "chooseBranch":
      if (!p.branches.includes(action.skill)) return { ok: false, error: "locked" };
      return { ok: true, profile: { ...profile, branchChoice: { ...profile.branchChoice, [action.character]: action.skill } } };
  }
}

/** Kiểm tra hình dạng thao tác gửi lên; null khi không hợp lệ. */
export function parseProfileAction(x: unknown): ProfileAction | null {
  const a = x as Record<string, unknown> | null;
  if (!a || typeof a !== "object" || typeof a.character !== "string") return null;
  if (a.type === "upgrade" && typeof a.key === "string") return { type: "upgrade", character: a.character, key: a.key };
  if ((a.type === "buyBranch" || a.type === "chooseBranch") && typeof a.skill === "string") {
    return { type: a.type, character: a.character, skill: a.skill };
  }
  return null;
}
