// Danh sách tướng sĩ của Doanh Trại: dựng mục từ hồ sơ, tìm theo tên (bỏ dấu), lọc theo hệ/nghề/đội hình và sắp
// xếp. Hàm thuần, không đọc trình duyệt, để test được và dùng chung cho màn Doanh Trại lẫn trang xem thử.
// Chỉ dùng thuộc tính có thật trong game (tên, cấp, hệ, nghề, đang ra trận); không tự đặt lực chiến hay phẩm chất.

import {
  PLAYABLE_COMPANIONS,
  companionById,
  MAIN_ID,
  ownsCompanion,
  progressOf,
  type Element,
  type Profession,
  type Profile,
} from "@/core";

export interface RosterEntry {
  /** Khóa duy nhất trong danh sách. Màn thật dùng đúng id nhân vật; trang xem thử có thể nhân bản. */
  readonly key: string;
  /** Id nhân vật trong hồ sơ, dùng cho chi tiết, trang bị, đội hình. */
  readonly id: string;
  readonly name: string;
  readonly element: Element;
  readonly profession: Profession;
  readonly level: number;
  /** Vị trí trong đội ra trận: 0 là chủ tướng, 1–2 là hai nhân vật kèm; null khi không ra trận. */
  readonly team: number | null;
}

export const MAIN_NAME = "Đinh Bộ Lĩnh";

export const nameOf = (id: string) => (id === MAIN_ID ? MAIN_NAME : (companionById(id)?.name ?? id));

/** Id các nhân vật đã có: chủ tướng trước, rồi nhân vật kèm theo thứ tự roster. */
export function ownedIds(profile: Profile): string[] {
  return [MAIN_ID, ...PLAYABLE_COMPANIONS.filter((c) => ownsCompanion(profile, c.id)).map((c) => c.id)];
}

export function rosterEntry(profile: Profile, id: string, key = id): RosterEntry {
  const base = id === MAIN_ID ? null : companionById(id);
  const slot = id === MAIN_ID ? 0 : profile.team.indexOf(id);
  return {
    key,
    id,
    name: base?.name ?? MAIN_NAME,
    element: base?.element ?? profile.element,
    profession: base?.profession ?? profile.profession,
    level: progressOf(profile, id).level,
    team: slot < 0 ? null : id === MAIN_ID ? 0 : slot + 1,
  };
}

export function rosterOf(profile: Profile): RosterEntry[] {
  return ownedIds(profile).map((id) => rosterEntry(profile, id));
}

/** Bỏ dấu tiếng Việt, không phân biệt hoa thường: "dinh" khớp "Đinh", "le hoan" khớp "Lê Hoàn". */
export function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export type TeamFilter = "all" | "in" | "out";

export interface RosterFilter {
  readonly query: string;
  readonly elements: readonly Element[];
  readonly professions: readonly Profession[];
  readonly team: TeamFilter;
}

export const NO_FILTER: RosterFilter = { query: "", elements: [], professions: [], team: "all" };

export function isFiltered(f: RosterFilter): boolean {
  return fold(f.query) !== "" || f.elements.length > 0 || f.professions.length > 0 || f.team !== "all";
}

export function matches(e: RosterEntry, f: RosterFilter): boolean {
  const q = fold(f.query);
  return (
    (!q || fold(e.name).includes(q)) &&
    (f.elements.length === 0 || f.elements.includes(e.element)) &&
    (f.professions.length === 0 || f.professions.includes(e.profession)) &&
    (f.team === "all" || (f.team === "in") === (e.team !== null))
  );
}

export type RosterSort = "team" | "levelDesc" | "levelAsc" | "name";

export const SORT_NAME: Readonly<Record<RosterSort, string>> = {
  team: "Đội hình trước",
  levelDesc: "Cấp giảm dần",
  levelAsc: "Cấp tăng dần",
  name: "Tên A–Z",
};

const byName = (a: RosterEntry, b: RosterEntry) => a.name.localeCompare(b.name, "vi") || a.key.localeCompare(b.key);
const teamRank = (e: RosterEntry) => e.team ?? Infinity;

/** Sắp xếp ổn định: cùng cấp thì theo tên rồi theo khóa, nên đổi lựa chọn không làm thẻ nhảy chỗ. */
export function sortRoster(entries: readonly RosterEntry[], sort: RosterSort): RosterEntry[] {
  return [...entries].sort((a, b) => {
    if (sort === "name") return byName(a, b);
    if (sort === "levelDesc") return b.level - a.level || byName(a, b);
    if (sort === "levelAsc") return a.level - b.level || byName(a, b);
    return teamRank(a) - teamRank(b) || b.level - a.level || byName(a, b);
  });
}

export function visibleRoster(entries: readonly RosterEntry[], f: RosterFilter, sort: RosterSort): RosterEntry[] {
  return sortRoster(
    entries.filter((e) => matches(e, f)),
    sort,
  );
}
