// Luật tầng Song Tháp: dữ liệu thuần + kiểm tra đội hình, không phụ thuộc UI hay battle engine.
// Nội dung luật cụ thể của từng tầng thuộc task sau. Xem docs/dual-tower/00-02-rules.md §3.2.
import { ELEMENTS, PROFESSIONS, type Element, type Profession } from "../battle";
import { MAIN_ID } from "../progress/profile";

export const LINEUP_SIZE = 3;

export interface FloorRules {
  readonly bannedElements?: readonly Element[];
  readonly bannedProfessions?: readonly Profession[];
  /** Cần ít nhất n active thuộc hệ/nghề này. */
  readonly minElements?: Readonly<Partial<Record<Element, number>>>;
  readonly minProfessions?: Readonly<Partial<Record<Profession, number>>>;
  /** Tối đa n active thuộc hệ/nghề này. */
  readonly maxElements?: Readonly<Partial<Record<Element, number>>>;
  readonly maxProfessions?: Readonly<Partial<Record<Profession, number>>>;
  /** Tối đa n active cùng một hệ/nghề (1 = đôi một khác nhau). */
  readonly maxSameElement?: number;
  readonly maxSameProfession?: number;
}

/** Build của một active sau khi đã chọn nghề/hệ (với thủ lĩnh: sau khi đổi build). */
export interface LineupMember {
  readonly id: string;
  readonly element: Element;
  readonly profession: Profession;
}

export type RuleIssueCode =
  | "unknown_key"
  | "invalid_number"
  | "banned_and_required"
  | "min_exceeds_max"
  | "min_exceeds_size"
  | "min_total_exceeds_size"
  | "unsatisfiable";

export interface RuleIssue {
  readonly code: RuleIssueCode;
  readonly path: string;
  readonly message: string;
}

export type LineupErrorCode =
  | "size"
  | "leader_missing"
  | "duplicate_member"
  | "invalid_member"
  | "banned_element"
  | "banned_profession"
  | "min_element"
  | "min_profession"
  | "max_element"
  | "max_profession"
  | "max_same_element"
  | "max_same_profession";

export interface LineupError {
  readonly code: LineupErrorCode;
  /** Hệ/nghề/id liên quan, nếu có. */
  readonly subject?: string;
  /** Id các active vi phạm (để UI/server báo đúng người, gồm thủ lĩnh). */
  readonly members: readonly string[];
  readonly message: string;
}

export type LineupResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly errors: readonly LineupError[] };

const isElement = (x: unknown): x is Element =>
  (ELEMENTS as readonly unknown[]).includes(x);
const isProfession = (x: unknown): x is Profession =>
  (PROFESSIONS as readonly unknown[]).includes(x);
const isCount = (n: unknown): n is number =>
  Number.isInteger(n) && (n as number) >= 0 && (n as number) <= LINEUP_SIZE;

/** Kiểm tra bản thân bộ luật: schema, mâu thuẫn cơ bản và tính khả thi. */
export function validateFloorRules(rules: unknown): readonly RuleIssue[] {
  const issues: RuleIssue[] = [];
  const add = (code: RuleIssueCode, path: string, message: string) =>
    issues.push({ code, path, message });
  if (!rules || typeof rules !== "object" || Array.isArray(rules))
    return [{ code: "invalid_number", path: "", message: "Luật phải là object" }];
  const r = rules as Record<string, unknown>;
  const known = new Set([
    "bannedElements", "bannedProfessions", "minElements", "minProfessions",
    "maxElements", "maxProfessions", "maxSameElement", "maxSameProfession",
  ]);
  for (const k of Object.keys(r))
    if (!known.has(k)) add("unknown_key", k, `Khóa luật lạ: ${k}`);

  const list = (key: string, valid: (x: unknown) => boolean) => {
    const v = r[key];
    if (v === undefined) return [] as string[];
    if (!Array.isArray(v) || !v.every(valid)) {
      add("unknown_key", key, `${key} chứa giá trị không hợp lệ`);
      return [];
    }
    return v as string[];
  };
  const counts = (key: string, valid: (x: unknown) => boolean) => {
    const v = r[key];
    if (v === undefined) return {} as Record<string, number>;
    if (!v || typeof v !== "object" || Array.isArray(v)) {
      add("invalid_number", key, `${key} phải là object`);
      return {};
    }
    const out: Record<string, number> = {};
    for (const [k, n] of Object.entries(v)) {
      if (!valid(k)) add("unknown_key", `${key}.${k}`, `Khóa lạ: ${k}`);
      else if (!isCount(n))
        add("invalid_number", `${key}.${k}`, `Cần số nguyên 0..${LINEUP_SIZE}`);
      else out[k] = n;
    }
    return out;
  };
  const same = (key: string) => {
    const v = r[key];
    if (v === undefined) return undefined;
    if (!Number.isInteger(v) || (v as number) < 1 || (v as number) > LINEUP_SIZE) {
      add("invalid_number", key, `Cần số nguyên 1..${LINEUP_SIZE}`);
      return undefined;
    }
    return v as number;
  };

  const banE = list("bannedElements", isElement);
  const banP = list("bannedProfessions", isProfession);
  const minE = counts("minElements", isElement);
  const minP = counts("minProfessions", isProfession);
  const maxE = counts("maxElements", isElement);
  const maxP = counts("maxProfessions", isProfession);
  const sameE = same("maxSameElement");
  const sameP = same("maxSameProfession");

  for (const [group, ban, min, max, sameMax] of [
    ["Elements", banE, minE, maxE, sameE],
    ["Professions", banP, minP, maxP, sameP],
  ] as const) {
    for (const [k, n] of Object.entries(min)) {
      if (n > 0 && ban.includes(k))
        add("banned_and_required", `min${group}.${k}`, `${k} vừa bị cấm vừa bắt buộc`);
      const cap = Math.min(max[k] ?? LINEUP_SIZE, sameMax ?? LINEUP_SIZE);
      if (n > cap)
        add("min_exceeds_max", `min${group}.${k}`, `${k}: tối thiểu ${n} > tối đa ${cap}`);
    }
    const total = Object.values(min).reduce((a, b) => a + b, 0);
    if (total > LINEUP_SIZE)
      add("min_total_exceeds_size", `min${group}`, `Tổng yêu cầu ${total} > ${LINEUP_SIZE} active`);
  }

  // Có sai schema thì bỏ qua kiểm tra khả thi (kết quả không đáng tin).
  if (issues.length === 0 && !hasFeasibleLineup(rules as FloorRules))
    add("unsatisfiable", "", "Không tồn tại đội 3 active nào hợp luật");
  return issues;
}

/** Duyệt mọi tổ hợp (hệ, nghề) cho 3 active; 42^3 trường hợp, rẻ. */
function hasFeasibleLineup(rules: FloorRules): boolean {
  const builds: LineupMember[] = ELEMENTS.flatMap((element) =>
    PROFESSIONS.map((profession) => ({ id: "", element, profession })),
  );
  const allowed = builds.filter((b) => buildAllowed(rules, b));
  for (const a of allowed)
    for (const b of allowed)
      for (const c of allowed)
        if (checkBuilds(rules, [a, b, c]).length === 0) return true;
  return false;
}

const buildAllowed = (rules: FloorRules, m: LineupMember) =>
  !rules.bannedElements?.includes(m.element) &&
  !rules.bannedProfessions?.includes(m.profession);

function tally<K extends string>(keys: readonly K[]) {
  const t = new Map<K, number>();
  for (const k of keys) t.set(k, (t.get(k) ?? 0) + 1);
  return t;
}

function checkBuilds(
  rules: FloorRules,
  team: readonly LineupMember[],
): LineupError[] {
  const errors: LineupError[] = [];
  const err = (
    code: LineupErrorCode,
    subject: string,
    members: readonly string[],
    message: string,
  ) => errors.push({ code, subject, members, message });

  for (const m of team) {
    if (rules.bannedElements?.includes(m.element))
      err("banned_element", m.element, [m.id], `Hệ ${m.element} bị cấm`);
    if (rules.bannedProfessions?.includes(m.profession))
      err("banned_profession", m.profession, [m.id], `Nghề ${m.profession} bị cấm`);
  }
  const byE = tally(team.map((m) => m.element));
  const byP = tally(team.map((m) => m.profession));
  const idsOf = (pick: (m: LineupMember) => string, v: string) =>
    team.filter((m) => pick(m) === v).map((m) => m.id);

  for (const [e, n] of Object.entries(rules.minElements ?? {}) as [Element, number][])
    if ((byE.get(e) ?? 0) < n)
      err("min_element", e, [], `Cần ít nhất ${n} tướng hệ ${e}`);
  for (const [p, n] of Object.entries(rules.minProfessions ?? {}) as [Profession, number][])
    if ((byP.get(p) ?? 0) < n)
      err("min_profession", p, [], `Cần ít nhất ${n} tướng nghề ${p}`);
  for (const [e, n] of Object.entries(rules.maxElements ?? {}) as [Element, number][])
    if ((byE.get(e) ?? 0) > n)
      err("max_element", e, idsOf((m) => m.element, e), `Tối đa ${n} tướng hệ ${e}`);
  for (const [p, n] of Object.entries(rules.maxProfessions ?? {}) as [Profession, number][])
    if ((byP.get(p) ?? 0) > n)
      err("max_profession", p, idsOf((m) => m.profession, p), `Tối đa ${n} tướng nghề ${p}`);
  if (rules.maxSameElement !== undefined)
    for (const [e, c] of byE)
      if (c > rules.maxSameElement)
        err("max_same_element", e, idsOf((m) => m.element, e), `Tối đa ${rules.maxSameElement} tướng cùng hệ`);
  if (rules.maxSameProfession !== undefined)
    for (const [p, c] of byP)
      if (c > rules.maxSameProfession)
        err("max_same_profession", p, idsOf((m) => m.profession, p), `Tối đa ${rules.maxSameProfession} tướng cùng nghề`);
  return errors;
}

/**
 * Kiểm tra đội active theo luật tầng. `team[0]` phải là thủ lĩnh (Đinh Bộ Lĩnh) với build
 * đã chọn cho tầng này; đúng 3 active, không trùng id.
 */
export function validateLineup(
  rules: FloorRules,
  team: readonly LineupMember[],
  leaderId: string = MAIN_ID,
): LineupResult {
  const errors: LineupError[] = [];
  if (team.length !== LINEUP_SIZE)
    errors.push({ code: "size", members: [], message: `Cần đúng ${LINEUP_SIZE} active, có ${team.length}` });
  if (team[0]?.id !== leaderId)
    errors.push({ code: "leader_missing", subject: leaderId, members: [], message: "Thủ lĩnh phải ở slot đầu" });
  const ids = new Set<string>();
  for (const m of team) {
    if (!isElement(m.element) || !isProfession(m.profession) || !m.id)
      errors.push({ code: "invalid_member", subject: m.id, members: [m.id], message: "Active không hợp lệ" });
    else if (ids.has(m.id))
      errors.push({ code: "duplicate_member", subject: m.id, members: [m.id], message: "Active bị trùng" });
    ids.add(m.id);
  }
  if (errors.length === 0) errors.push(...checkBuilds(rules, team));
  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

/** Các build (hệ, nghề) của thủ lĩnh làm đội hợp luật khi giữ nguyên 2 tướng kèm. */
export function leaderBuildOptions(
  rules: FloorRules,
  leaderId: string,
  companions: readonly LineupMember[],
): readonly { element: Element; profession: Profession }[] {
  return ELEMENTS.flatMap((element) =>
    PROFESSIONS.flatMap((profession) =>
      validateLineup(rules, [{ id: leaderId, element, profession }, ...companions], leaderId).ok
        ? [{ element, profession }]
        : [],
    ),
  );
}
