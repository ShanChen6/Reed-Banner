// Logic thuần của màn Tháp Thí Luyện: mô tả luật, lọc tướng theo luật, phím điều hướng, dịch lỗi server.
// Mọi kiểm tra ở đây chỉ để xem trước; server luôn kiểm tra lại và là nguồn sự thật.

import {
  companionById,
  leaderBuildOptions,
  MAIN_ID,
  validateLineup,
  type Element,
  type FloorRules,
  type LineupError,
  type LineupMember,
  type Profession,
  type Profile,
  type TrialFloorPublic,
  type WinCriteria,
} from "@/core";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";

export type FloorState = "locked" | "open" | "cleared";

/** Dữ liệu GET /api/trial (khớp trialOverview ở server). */
export interface TrialFloorEntry {
  readonly floor: TrialFloorPublic;
  readonly state: FloorState;
  readonly firstClearClaimed: boolean;
  readonly record: { readonly floor: number; readonly clears: number; readonly bestTurns: number } | null;
}

export interface TrialOverview {
  readonly available: boolean;
  readonly supported: boolean;
  readonly cleared: number;
  readonly stones: number;
  readonly active: { readonly matchId: string; readonly floor: number } | null;
  readonly sweep: {
    readonly eligible: boolean;
    readonly tier: number;
    readonly amount: number;
    readonly claimedToday: boolean;
    readonly nextAt: number;
    readonly lastClaim: {
      readonly dateKey: string;
      readonly tier: number;
      readonly amount: number;
      readonly claimedAt: number;
    } | null;
    readonly history: readonly {
      readonly dateKey: string;
      readonly amount: number | null;
      readonly claimedAt: number | null;
    }[];
  };
  readonly floors: readonly TrialFloorEntry[];
}

export const formatSweepTime = (time: number): string =>
  new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(time));

export function sweepButtonState(
  sweep: TrialOverview["sweep"],
  busy: boolean,
): { readonly disabled: boolean; readonly text: string } {
  if (busy) return { disabled: true, text: "Đang quét…" };
  if (!sweep.eligible) return { disabled: true, text: "Cần vượt ít nhất tầng 1" };
  if (sweep.claimedToday) return { disabled: true, text: "Đã nhận hôm nay" };
  return { disabled: false, text: `Quét nhận ${sweep.amount} đá` };
}

const list = (xs: readonly string[]) => xs.join(", ");
const el = (e: Element) => ELEMENT_NAME[e];
const pr = (p: Profession) => PROFESSION_NAME[p];

export interface RuleLine {
  readonly kind: "ban" | "need" | "limit";
  readonly text: string;
}

/** Luật tầng thành các dòng dễ đọc: cấm, bắt buộc, giới hạn. Rỗng nghĩa là tự do chọn. */
export function describeRules(rules: FloorRules): readonly RuleLine[] {
  const out: RuleLine[] = [];
  if (rules.bannedElements?.length)
    out.push({ kind: "ban", text: `Cấm hệ ${list(rules.bannedElements.map(el))}` });
  if (rules.bannedProfessions?.length)
    out.push({ kind: "ban", text: `Cấm nghề ${list(rules.bannedProfessions.map(pr))}` });
  for (const [e, n] of Object.entries(rules.minElements ?? {}))
    if (n) out.push({ kind: "need", text: `Cần ít nhất ${n} hệ ${el(e as Element)}` });
  for (const [p, n] of Object.entries(rules.minProfessions ?? {}))
    if (n) out.push({ kind: "need", text: `Cần ít nhất ${n} ${pr(p as Profession)}` });
  for (const [e, n] of Object.entries(rules.maxElements ?? {}))
    if (n !== undefined) out.push({ kind: "limit", text: `Tối đa ${n} hệ ${el(e as Element)}` });
  for (const [p, n] of Object.entries(rules.maxProfessions ?? {}))
    if (n !== undefined) out.push({ kind: "limit", text: `Tối đa ${n} ${pr(p as Profession)}` });
  if (rules.maxSameElement !== undefined)
    out.push({
      kind: "limit",
      text: rules.maxSameElement === 1 ? "Ba hệ khác nhau" : `Tối đa ${rules.maxSameElement} người cùng hệ`,
    });
  if (rules.maxSameProfession !== undefined)
    out.push({
      kind: "limit",
      text: rules.maxSameProfession === 1 ? "Ba nghề khác nhau" : `Tối đa ${rules.maxSameProfession} người cùng nghề`,
    });
  return out;
}

/** Điều kiện thắng; chỉ "Hạ hết" engine đã thực thi. */
export function describeWin(win: WinCriteria): { text: string; supported: boolean } {
  switch (win.kind) {
    case "defeatAll":
      return { text: "Hạ toàn bộ đối thủ", supported: true };
    case "defeatLeader":
      return { text: "Hạ thủ lĩnh đối thủ", supported: false };
    case "surviveTurns":
      return { text: `Trụ vững ${win.turns} lượt`, supported: false };
  }
}

export interface CompanionOption {
  readonly id: string;
  readonly name: string;
  readonly element: Element;
  readonly profession: Profession;
  readonly selected: boolean;
  readonly disabled: boolean;
  /** Lý do bị khóa, hiện cho người chơi. */
  readonly reason: string | null;
}

/** Tướng kèm đã sở hữu, theo thứ tự id. */
export function ownedCompanions(profile: Profile): readonly LineupMember[] {
  return Object.keys(profile.companions)
    .sort()
    .flatMap((id) => {
      const c = companionById(id);
      return c ? [{ id, element: c.element, profession: c.profession }] : [];
    });
}

const COMPANION_COUNT = 2;

/**
 * Tướng kèm xem được ở tầng này. Tướng bị luật cấm không bao giờ hợp lệ nên bị khóa kèm lý do; khi đã chọn đủ
 * 2 người, các tướng còn lại khóa tạm (bỏ chọn một người để đổi).
 */
export function companionOptions(
  profile: Profile,
  rules: FloorRules,
  selected: readonly string[],
): readonly CompanionOption[] {
  const banE = new Set<Element>(rules.bannedElements ?? []);
  const banP = new Set<Profession>(rules.bannedProfessions ?? []);
  return ownedCompanions(profile).map((m) => {
    const isSel = selected.includes(m.id);
    let reason: string | null = null;
    if (banE.has(m.element)) reason = `Hệ ${el(m.element)} bị cấm ở tầng này`;
    else if (banP.has(m.profession)) reason = `Nghề ${pr(m.profession)} bị cấm ở tầng này`;
    else if (!isSel && selected.length >= COMPANION_COUNT) reason = "Đã chọn đủ 2 tướng";
    return {
      id: m.id,
      name: companionById(m.id)?.name ?? m.id,
      element: m.element,
      profession: m.profession,
      selected: isSel,
      // Tướng đã chọn mà bị cấm vẫn bấm được để bỏ chọn.
      disabled: reason !== null && !isSel,
      reason,
    };
  });
}

/** Bật/tắt một tướng; không thêm tướng bị khóa, không vượt 2. */
export function toggleCompanion(
  selected: readonly string[],
  option: Pick<CompanionOption, "id" | "disabled">,
): readonly string[] {
  if (selected.includes(option.id)) return selected.filter((id) => id !== option.id);
  if (option.disabled || selected.length >= COMPANION_COUNT) return selected;
  return [...selected, option.id];
}

export interface LeaderBuild {
  readonly element: Element;
  readonly profession: Profession;
}

export type LineupPreview =
  | { readonly status: "incomplete"; readonly missing: number }
  | { readonly status: "valid" }
  | { readonly status: "invalid"; readonly errors: readonly LineupError[] };

function selectedMembers(profile: Profile, selected: readonly string[]): LineupMember[] {
  const owned = ownedCompanions(profile);
  return selected.flatMap((id) => owned.filter((m) => m.id === id));
}

/** Đội hợp luật không (đủ 2 tướng kèm + build thủ lĩnh đã đổi). Chỉ xem trước. */
export function previewLineup(
  profile: Profile,
  rules: FloorRules,
  selected: readonly string[],
  build: LeaderBuild,
): LineupPreview {
  const members = selectedMembers(profile, selected);
  if (members.length < COMPANION_COUNT) return { status: "incomplete", missing: COMPANION_COUNT - members.length };
  const r = validateLineup(rules, [{ id: MAIN_ID, ...build }, ...members], MAIN_ID);
  return r.ok ? { status: "valid" } : { status: "invalid", errors: r.errors };
}

/** Các build thủ lĩnh làm đội hợp luật với 2 tướng đã chọn; chưa chọn đủ thì rỗng. */
export function leaderChoices(
  profile: Profile,
  rules: FloorRules,
  selected: readonly string[],
): readonly LeaderBuild[] {
  const members = selectedMembers(profile, selected);
  if (members.length < COMPANION_COUNT) return [];
  return leaderBuildOptions(rules, MAIN_ID, members);
}

/** Build mặc định: giữ build hiện tại nếu hợp luật, không thì build hợp luật đầu tiên. */
export function defaultBuild(
  profile: Profile,
  rules: FloorRules,
  selected: readonly string[],
): LeaderBuild {
  const cur: LeaderBuild = { element: profile.element, profession: profile.profession };
  const options = leaderChoices(profile, rules, selected);
  if (options.length === 0 || options.some((o) => o.element === cur.element && o.profession === cur.profession))
    return cur;
  return options[0]!;
}

export const NAV_KEYS: readonly string[] = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"];

/** Ô kế tiếp trong lưới `columns` cột khi bấm phím mũi tên/Home/End. Không cuộn vòng; đứng yên ở mép. */
export function navigateIndex(index: number, key: string, count: number, columns: number): number {
  if (count <= 0) return 0;
  const last = count - 1;
  const cols = Math.max(1, columns);
  switch (key) {
    case "ArrowLeft":
      return Math.max(0, index - 1);
    case "ArrowRight":
      return Math.min(last, index + 1);
    case "ArrowUp":
      return index - cols >= 0 ? index - cols : index;
    case "ArrowDown":
      return index + cols <= last ? index + cols : index;
    case "Home":
      return 0;
    case "End":
      return last;
    default:
      return index;
  }
}

/** Mã lỗi từ API mở trận. */
export const TRIAL_ERROR_TEXT: Record<string, string> = {
  network: "Mất kết nối tới server, thử lại",
  bad_request: "Yêu cầu không hợp lệ",
  floor_not_found: "Tầng này chưa có",
  floor_locked: "Tầng này chưa mở khóa",
  win_unsupported: "Tầng này dùng điều kiện thắng chưa hỗ trợ",
  lineup_invalid: "Đội hình không hợp luật tầng",
  unsupported_schema: "Dữ liệu Song Tháp của bạn thuộc phiên bản mới hơn, chưa chơi được ở bản này",
  active_elsewhere: "Bạn đang có một trận Thí Luyện ở tầng khác, hãy tiếp tục hoặc bỏ trận đó",
  conflict: "Dữ liệu vừa đổi ở nơi khác, thử lại",
  no_cleared_floors: "Cần vượt ít nhất tầng 1 để quét",
  overflow: "Ví đá đã đạt giới hạn an toàn",
};

export const FLOOR_STATE_TEXT: Record<FloorState, string> = {
  locked: "Chưa mở",
  open: "Đang mở",
  cleared: "Đã qua",
};

/** Khi tầng chưa mở: cần qua tầng nào trước. */
export function lockedHint(entry: TrialFloorEntry): string {
  const need = Math.max(entry.floor.unlock.requiresFloor ?? 0, entry.floor.floor - 1);
  return `Cần qua tầng ${need} trước`;
}

/** Dòng thưởng đá lần đầu: chỉ khẳng định "đã nhận" khi server xác nhận qua hồ sơ. */
export function firstClearText(entry: TrialFloorEntry): string {
  const n = entry.floor.firstClearStones;
  if (n <= 0) return "Không có thưởng đá lần đầu";
  return entry.firstClearClaimed
    ? `Đã nhận ${n} Đá Cường Hóa lần đầu`
    : `Lần đầu qua: +${n} Đá Cường Hóa (chỉ một lần)`;
}
