// Chuẩn bị đội 3 active cho Song Tháp (Trial/Destiny) trước mỗi tầng.
// Hàm thuần: dựng từ Profile (không sửa Profile), server là nguồn sự thật, client chỉ gửi ý định.
// Dùng lại buildMain/withGear/profileTeam như Survival V1.1; không đổi logic Survival.
import {
  ELEMENTS,
  PROFESSIONS,
  type Element,
  type FighterConfig,
  type Profession,
  type SideConfig,
} from "../battle";
import { withGear } from "../gear";
import {
  buildMain,
  loadoutOf,
  MAIN_ID,
  ownsCompanion,
  profileTeam,
  type Profile,
} from "../progress";
import {
  validateLineup,
  type FloorRules,
  type LineupError,
  type LineupMember,
} from "./floorRules";

export interface TowerLeaderBuild {
  readonly profession: Profession;
  readonly element: Element;
}

export type PreparedLineupInput =
  | {
      readonly mode: "trial";
      /** 2 tướng kèm sở hữu, slot 1 và 2. */
      readonly companions: readonly string[];
      /** Thiếu trường nào thì giữ nghề/hệ hiện tại của hồ sơ. */
      readonly leaderBuild?: Partial<TowerLeaderBuild>;
    }
  | {
      readonly mode: "destiny";
      readonly companions: readonly string[];
      readonly leaderBuild?: Partial<TowerLeaderBuild>;
      /** Roster đã khóa của run (thủ lĩnh đầu) và tỉ lệ máu theo id. */
      readonly roster: readonly string[];
      readonly hp: Readonly<Record<string, number>>;
    };

export type PreparedLineupError =
  | { readonly code: "invalid_input" }
  | { readonly code: "invalid_leader_build"; readonly field: "profession" | "element" }
  | { readonly code: "companion_count" }
  | { readonly code: "duplicate_member"; readonly id: string }
  | { readonly code: "not_owned"; readonly id: string }
  | { readonly code: "not_in_roster"; readonly id: string }
  | { readonly code: "invalid_roster" }
  | { readonly code: "invalid_hp"; readonly id: string }
  | { readonly code: "fighter_downed"; readonly id: string }
  | { readonly code: "rule_violation"; readonly errors: readonly LineupError[] };

export interface PreparedLineup {
  readonly mode: "trial" | "destiny";
  readonly leaderBuild: TowerLeaderBuild;
  readonly ids: readonly [string, string, string];
  readonly members: readonly [LineupMember, LineupMember, LineupMember];
  /** Config đầy đủ chiêu/trang bị, sẵn sàng đưa vào trận 3v3. */
  readonly side: SideConfig;
  /** Tỉ lệ máu theo slot: Trial luôn 1; Destiny lấy từ run. */
  readonly hpRatios: readonly [number, number, number];
}

export type PreparedLineupResult =
  | { readonly ok: true; readonly lineup: PreparedLineup }
  | { readonly ok: false; readonly error: PreparedLineupError };

const fail = (error: PreparedLineupError): PreparedLineupResult => ({ ok: false, error });
const isRecord = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === "object" && !Array.isArray(x);
const isRatio = (x: unknown): x is number =>
  typeof x === "number" && Number.isFinite(x) && x >= 0 && x <= 1;

/** Máu thực của một người theo tỉ lệ: 0 là ngã, còn sống thì tối thiểu 1. */
export function towerHpFromRatio(maxHp: number, ratio: number): number {
  if (ratio <= 0) return 0;
  return Math.max(1, Math.min(maxHp, Math.round(ratio * maxHp)));
}

export const towerHpToRatio = (hp: number, maxHp: number): number =>
  maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0;

/** Dựng thủ lĩnh với nghề/hệ đã chọn cho tầng; không ghi vào Profile. */
export function towerLeaderConfig(
  profile: Profile,
  build: TowerLeaderBuild,
): FighterConfig {
  return withGear(
    buildMain(profile.main, build.element, build.profession),
    loadoutOf(profile, MAIN_ID),
  );
}

function resolveLeaderBuild(
  profile: Profile,
  raw: unknown,
):
  | { ok: true; build: TowerLeaderBuild }
  | { ok: false; field: "profession" | "element" } {
  const r = raw === undefined ? {} : raw;
  if (!isRecord(r)) return { ok: false, field: "profession" };
  const profession = r.profession ?? profile.profession;
  const element = r.element ?? profile.element;
  if (!(PROFESSIONS as readonly unknown[]).includes(profession))
    return { ok: false, field: "profession" };
  if (!(ELEMENTS as readonly unknown[]).includes(element))
    return { ok: false, field: "element" };
  return {
    ok: true,
    build: { profession: profession as Profession, element: element as Element },
  };
}

/** Kiểm tra và dựng đội active cho một tầng. Không đổi Profile, kết quả xác định. */
export function prepareTowerLineup(
  profile: Profile,
  input: PreparedLineupInput,
  rules: FloorRules,
): PreparedLineupResult {
  if (!isRecord(input) || (input.mode !== "trial" && input.mode !== "destiny"))
    return fail({ code: "invalid_input" });
  const { companions } = input;
  if (!Array.isArray(companions) || !companions.every((id) => typeof id === "string" && id))
    return fail({ code: "invalid_input" });
  if (companions.length !== 2) return fail({ code: "companion_count" });

  const ids = [MAIN_ID, ...companions] as [string, string, string];
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) return fail({ code: "duplicate_member", id });
    seen.add(id);
  }
  for (const id of companions)
    if (!ownsCompanion(profile, id)) return fail({ code: "not_owned", id });

  const leaderBuild = resolveLeaderBuild(profile, input.leaderBuild);
  if (!leaderBuild.ok)
    return fail({ code: "invalid_leader_build", field: leaderBuild.field });

  let hpRatios: [number, number, number] = [1, 1, 1];
  if (input.mode === "destiny") {
    const { roster, hp } = input;
    if (
      !Array.isArray(roster) ||
      roster[0] !== MAIN_ID ||
      new Set(roster).size !== roster.length ||
      !isRecord(hp)
    )
      return fail({ code: "invalid_roster" });
    for (const id of companions)
      if (!roster.includes(id)) return fail({ code: "not_in_roster", id });
    const ratios: number[] = [];
    for (const id of ids) {
      const ratio = hp[id];
      if (!isRatio(ratio)) return fail({ code: "invalid_hp", id });
      if (ratio === 0) return fail({ code: "fighter_downed", id });
      ratios.push(ratio);
    }
    hpRatios = [ratios[0]!, ratios[1]!, ratios[2]!];
  }

  const leader = towerLeaderConfig(profile, leaderBuild.build);
  const rest = profileTeam(profile, companions);
  const fighters = [leader, ...rest.slice(1)];
  if (fighters.length !== 3) return fail({ code: "not_owned", id: companions[0]! });
  // profileTeam bỏ qua id không dựng được; đối chiếu để thứ tự và id đúng.
  if (fighters.some((f, i) => f.id !== ids[i]))
    return fail({ code: "not_owned", id: companions[0]! });

  const members = fighters.map((f) => ({
    id: f.id,
    element: f.element,
    profession: f.profession,
  })) as unknown as PreparedLineup["members"];
  const checked = validateLineup(rules, members, MAIN_ID);
  if (!checked.ok) return fail({ code: "rule_violation", errors: checked.errors });

  return {
    ok: true,
    lineup: {
      mode: input.mode,
      leaderBuild: leaderBuild.build,
      ids,
      members,
      side: { fighters: structuredClone(fighters), leader: 0 },
      hpRatios,
    },
  };
}
