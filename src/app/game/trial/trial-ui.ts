// Logic thuần của màn Tháp Thí Luyện: mô tả luật, lọc tướng theo luật, phím điều hướng, dịch lỗi server.
// Mọi kiểm tra ở đây chỉ để xem trước; server luôn kiểm tra lại và là nguồn sự thật.

import {
  companionById,
  leaderBuildOptions,
  MAIN_ID,
  trialSweepStoneAmount,
  trialSweepTier,
  validateLineup,
  type Element,
  type FloorRules,
  type LineupError,
  type LineupMember,
  type Profession,
  type Profile,
  type WinCriteria,
} from "@/core";
import type { FloorState, TrialFloorEntry, TrialOverview } from "@/server/trialApi";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";

/** Dữ liệu GET /api/trial: dùng chung kiểu với server để hai bên không lệch nhau. */
export type { FloorState, TrialFloorEntry, TrialOverview };

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

/** "2026-11-10" thành "10/11/2026" để người chơi đọc. Chuỗi lạ giữ nguyên. */
export function formatDateKey(dateKey: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : dateKey;
}

/** Mỗi chặng 10 tầng; tên theo nội dung luật của chặng. Tháp dài hơn thì chặng dư lấy tên theo số. */
export const STAGE_SIZE = 10;
const STAGE_NAMES = ["Nhập Môn", "Luyện Trận", "Lệnh Mới", "Song Lệnh", "Tam Lệnh"] as const;
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"] as const;

export interface TrialStage {
  readonly index: number;
  readonly roman: string;
  readonly name: string;
  readonly from: number;
  readonly to: number;
  readonly floors: readonly TrialFloorEntry[];
  readonly cleared: number;
  readonly state: FloorState;
}

export const stageIndexOf = (floor: number): number => Math.max(0, Math.floor((floor - 1) / STAGE_SIZE));

/** Chia danh sách tầng thành các chặng; chặng "đang mở" là chặng có tầng đang mở, "đã qua" khi qua hết. */
export function trialStages(floors: readonly TrialFloorEntry[]): readonly TrialStage[] {
  const out: TrialStage[] = [];
  for (let start = 0; start < floors.length; start += STAGE_SIZE) {
    const part = floors.slice(start, start + STAGE_SIZE);
    const index = out.length;
    const cleared = part.filter((f) => f.state === "cleared").length;
    out.push({
      index,
      roman: ROMAN[index] ?? String(index + 1),
      name: STAGE_NAMES[index] ?? `Chặng ${index + 1}`,
      from: part[0]!.floor.floor,
      to: part.at(-1)!.floor.floor,
      floors: part,
      cleared,
      state: cleared === part.length ? "cleared" : part.some((f) => f.state !== "locked") ? "open" : "locked",
    });
  }
  return out;
}

/** Tầng ải trùm (độ khó Trùm/Ác mộng) được đánh dấu riêng trên lưới tầng. */
export const isBossFloor = (entry: TrialFloorEntry): boolean =>
  entry.floor.difficulty === "boss" || entry.floor.difficulty === "nightmare";

/** Tổng đá lần đầu chưa nhận trong một nhóm tầng. */
export const unclaimedStones = (floors: readonly TrialFloorEntry[]): number =>
  floors.reduce((sum, f) => sum + (f.firstClearClaimed ? 0 : f.floor.firstClearStones), 0);

/** Gợi ý mốc tầng nâng bậc quét kế tiếp; null khi đã ở bậc cao nhất hoặc tháp đã qua hết. */
export function nextSweepTierHint(cleared: number, totalFloors: number): string | null {
  const current = trialSweepTier(cleared);
  for (let floor = Math.max(1, cleared + 1); floor <= totalFloors; floor++) {
    const tier = trialSweepTier(floor);
    if (tier > current) return `Qua tầng ${floor} để quét được ${trialSweepStoneAmount(tier)} đá mỗi ngày`;
  }
  return null;
}

export interface FoeInfo {
  readonly id: string;
  readonly name: string;
  readonly element: Element | null;
  readonly profession: Profession | null;
}

/** Tên và hệ/nghề của đối thủ để hiện thẻ; id lạ (dữ liệu mới hơn client) vẫn hiện được bằng id. */
export function foeInfo(id: string): FoeInfo {
  const c = companionById(id);
  return c
    ? { id, name: c.name, element: c.element, profession: c.profession }
    : { id, name: id, element: null, profession: null };
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
    const full = !isSel && selected.length >= COMPANION_COUNT;
    return {
      id: m.id,
      name: companionById(m.id)?.name ?? m.id,
      element: m.element,
      profession: m.profession,
      selected: isSel,
      // Tướng đã chọn mà bị cấm vẫn bấm được để bỏ chọn.
      // Đủ 2 người thì các tướng còn lại khóa tạm, không lặp lý do trên từng thẻ (tiêu đề đã ghi "đã chọn 2/2").
      disabled: (reason !== null || full) && !isSel,
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

/**
 * Hai tướng kèm gợi ý cho tầng: giữ đội đang chọn nếu hợp luật; không thì tìm cặp hợp luật giữ lại nhiều tướng đang
 * chọn nhất (ưu tiên theo thứ tự `preferred`, rồi thứ tự id). Không có cặp nào hợp luật thì trả lại `preferred`.
 */
export function suggestCompanions(
  profile: Profile,
  rules: FloorRules,
  preferred: readonly string[],
): readonly string[] {
  const legal = (pair: readonly string[]) => leaderChoices(profile, rules, pair).length > 0;
  const current = preferred.slice(0, COMPANION_COUNT);
  if (current.length === COMPANION_COUNT && legal(current)) return current;
  const owned = ownedCompanions(profile).map((m) => m.id);
  const order = [...current.filter((id) => owned.includes(id)), ...owned.filter((id) => !current.includes(id))];
  let best: readonly string[] | null = null;
  let bestKept = -1;
  for (let a = 0; a < order.length; a++)
    for (let b = a + 1; b < order.length; b++) {
      const pair = [order[a]!, order[b]!];
      const kept = pair.filter((id) => current.includes(id)).length;
      if (kept > bestKept && legal(pair)) {
        best = pair;
        bestKept = kept;
      }
    }
  return best ?? preferred;
}

/** Lỗi đội hình bằng tên hệ/nghề tiếng Việt (thông báo gốc của core dùng mã như "hoa", "phapSu"). */
export function lineupErrorText(e: LineupError): string {
  const subject = e.subject ?? "";
  const element = ELEMENT_NAME[subject as Element] ?? subject;
  const profession = PROFESSION_NAME[subject as Profession] ?? subject;
  switch (e.code) {
    case "banned_element":
      return `Hệ ${element} bị cấm ở tầng này`;
    case "banned_profession":
      return `Nghề ${profession} bị cấm ở tầng này`;
    case "min_element":
      return `Đội cần có tướng hệ ${element}`;
    case "min_profession":
      return `Đội cần có ${profession}`;
    case "max_element":
      return `Quá nhiều tướng hệ ${element}`;
    case "max_profession":
      return `Quá nhiều ${profession}`;
    case "max_same_element":
      return `Quá nhiều tướng cùng hệ ${element}`;
    case "max_same_profession":
      return `Quá nhiều tướng cùng nghề ${profession}`;
    case "size":
      return "Cần đúng 3 tướng ra trận";
    case "leader_missing":
      return "Đinh Bộ Lĩnh phải ra trận";
    case "duplicate_member":
      return "Một tướng bị chọn hai lần";
    case "invalid_member":
      return "Có tướng không hợp lệ";
  }
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
  featureDisabled: "Tháp Thí Luyện đang tạm đóng cửa. Tiến trình và trận dở được giữ nguyên.",
  network: "Tin báo đứt quãng, chưa liên lạc được máy chủ. Xin thử lại.",
  bad_request: "Lệnh không hợp lệ. Xin tải lại trang rồi thử lại.",
  floor_not_found: "Tầng này chưa dựng xong.",
  floor_locked: "Tầng này chưa mở. Xin vượt tầng trước.",
  win_unsupported: "Tầng này dùng điều kiện thắng mà bản này chưa có. Xin chờ cập nhật.",
  lineup_invalid: "Đội hình chưa hợp luật tầng. Xin đổi tướng.",
  unsupported_schema: "Dữ liệu Tháp Thí Luyện thuộc phiên bản mới hơn, bản này chưa đọc được. Xin tải lại trang.",
  active_elsewhere: "Đang có một trận Thí Luyện ở tầng khác. Xin đánh tiếp hoặc bỏ trận đó.",
  conflict: "Quân tình vừa đổi ở nơi khác. Xin thử lại.",
  no_cleared_floors: "Phải vượt ít nhất tầng 1 mới quét tháp được.",
  overflow: "Túi đá đã đầy tới giới hạn. Xin dùng bớt rồi quét tiếp.",
};

/** Nhãn chữ cho từng loại luật (thay emoji ⛔ ✔ ⚖). */
export const RULE_TAG = { ban: "Cấm", need: "Bắt buộc", limit: "Giới hạn" } as const;

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
