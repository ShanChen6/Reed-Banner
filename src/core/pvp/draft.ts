// Cấm chọn công khai của Đấu người 3vs3 xếp hạng. Mỗi phe cấm 3 lần rồi mỗi người thật chọn một tướng của mình.
// Phe điểm cao hơn cấm trước, phe điểm thấp hơn chọn trước. Đinh Bộ Lĩnh không bị cấm thẳng mà bị cấm theo nghề hoặc hệ, và
// cả trận chỉ một người được chọn. Hết giờ thì máy cấm ngẫu nhiên hoặc chọn thay. Thuần: `now` và hạt giống do chỗ gọi truyền vào.
// Luật ở docs/02-game-modes/future/quan-hung-pvp-truc-tiep.md.

import { ELEMENTS, PROFESSIONS, type Element, type Profession, type SideIndex } from "../battle";
import { MAIN_ID } from "../progress/profile";
import { createRng } from "../rng";
import { pvpSideRating } from "./elo";

export const PVP_DRAFT_BANS_PER_SIDE = 3;
/** Thời gian cho mỗi lượt cấm hoặc chọn. */
export const PVP_DRAFT_TURN_MS = 20_000;
const MAX_CATCH_UP = 64;

export type DraftBan =
  | { readonly kind: "hero"; readonly id: string }
  | { readonly kind: "element"; readonly value: Element }
  | { readonly kind: "profession"; readonly value: Profession };

/** Tướng một người có thể chọn (chụp lúc ghép trận). Đinh Bộ Lĩnh mang nghề, hệ trong hồ sơ làm mặc định. */
export interface DraftHero {
  readonly id: string;
  readonly name: string;
  readonly level: number;
  readonly element: Element;
  readonly profession: Profession;
}

export interface DraftStep {
  readonly kind: "ban" | "pick";
  readonly side: SideIndex;
  readonly owner: string;
}

export interface DraftPick {
  readonly owner: string;
  readonly side: SideIndex;
  readonly hero: DraftHero;
}

export interface PvpDraft {
  readonly seed: number;
  /** Người thật của từng phe, theo thứ tự chỗ ngồi. */
  readonly humans: readonly [readonly string[], readonly string[]];
  readonly names: Readonly<Record<string, string>>;
  readonly ratings: Readonly<Record<string, number>>;
  readonly owned: Readonly<Record<string, readonly DraftHero[]>>;
  /** Mã các tướng có thể bị cấm thẳng (không gồm Đinh Bộ Lĩnh). */
  readonly roster: readonly string[];
  readonly banFirst: SideIndex;
  readonly steps: readonly DraftStep[];
  readonly at: number;
  /** Hạn của lượt hiện tại; null khi đã xong. */
  readonly deadline: number | null;
  readonly bans: readonly { readonly side: SideIndex; readonly ban: DraftBan; readonly auto: boolean }[];
  readonly picks: readonly DraftPick[];
}

export interface DraftConfig {
  readonly humans: readonly [readonly string[], readonly string[]];
  readonly names: Readonly<Record<string, string>>;
  readonly ratings: Readonly<Record<string, number>>;
  readonly owned: Readonly<Record<string, readonly DraftHero[]>>;
  readonly roster: readonly string[];
  readonly seed: number;
  readonly now: number;
}

export type DraftError = "notYourTurn" | "draftOver" | "badBan" | "banned" | "badHero" | "heroTaken" | "dblTaken" | "badBuild";

export type DraftResult = { readonly ok: true; readonly draft: PvpDraft } | { readonly ok: false; readonly error: DraftError };

export type DraftPickInput = { readonly hero: string; readonly element?: Element; readonly profession?: Profession };

function buildSteps(humans: readonly [readonly string[], readonly string[]], banFirst: SideIndex): DraftStep[] {
  const steps: DraftStep[] = [];
  const bansDone = [0, 0];
  for (let i = 0; i < PVP_DRAFT_BANS_PER_SIDE * 2; i++) {
    const side = (i % 2 === 0 ? banFirst : 1 - banFirst) as SideIndex;
    const list = humans[side];
    steps.push({ kind: "ban", side, owner: list[bansDone[side]! % list.length] as string });
    bansDone[side]!++;
  }
  const pickFirst = (1 - banFirst) as SideIndex;
  for (let r = 0; r < 3; r++) {
    for (const side of [pickFirst, banFirst]) {
      const owner = humans[side][r];
      if (owner !== undefined) steps.push({ kind: "pick", side, owner });
    }
  }
  return steps;
}

export function createDraft(config: DraftConfig): PvpDraft {
  if (config.humans[0].length === 0 || config.humans[1].length === 0) throw new RangeError("Mỗi phe cần ít nhất một người thật");
  const avg = config.humans.map((side) => pvpSideRating(side.map((p) => config.ratings[p] ?? 0)));
  const banFirst: SideIndex = avg[0]! === avg[1]! ? ((createRng(config.seed).int(0, 1) as 0 | 1)) : avg[0]! > avg[1]! ? 0 : 1;
  return {
    seed: config.seed,
    humans: config.humans,
    names: config.names,
    ratings: config.ratings,
    owned: config.owned,
    roster: config.roster,
    banFirst,
    steps: buildSteps(config.humans, banFirst),
    at: 0,
    deadline: config.now + PVP_DRAFT_TURN_MS,
    bans: [],
    picks: [],
  };
}

export const draftOver = (d: PvpDraft): boolean => d.at >= d.steps.length;
export const draftStep = (d: PvpDraft): DraftStep | null => d.steps[d.at] ?? null;

const sameBan = (a: DraftBan, b: DraftBan) => a.kind === b.kind && (a.kind === "hero" ? a.id === (b as typeof a).id : a.value === (b as { value: unknown }).value);

export function draftBanOk(d: PvpDraft, ban: DraftBan): boolean {
  if (ban.kind === "hero") return ban.id !== MAIN_ID && d.roster.includes(ban.id) && !d.bans.some((b) => sameBan(b.ban, ban));
  if (ban.kind === "element") return ELEMENTS.includes(ban.value) && !d.bans.some((b) => sameBan(b.ban, ban));
  if (ban.kind === "profession") return PROFESSIONS.includes(ban.value) && !d.bans.some((b) => sameBan(b.ban, ban));
  return false;
}

const isBanned = (d: PvpDraft, h: { id: string; element: Element; profession: Profession }) => d.bans.some((b) => b.ban.kind === "hero" && b.ban.id === h.id);
const elementBanned = (d: PvpDraft, e: Element) => d.bans.some((b) => b.ban.kind === "element" && b.ban.value === e);
const professionBanned = (d: PvpDraft, p: Profession) => d.bans.some((b) => b.ban.kind === "profession" && b.ban.value === p);

/** Tướng người này chọn được ở lượt này kèm lý do nếu chưa chọn được. */
export function draftChoices(d: PvpDraft, owner: string): { readonly hero: DraftHero; readonly error: DraftError | null }[] {
  const side = d.humans[0].includes(owner) ? 0 : 1;
  const dblTaken = d.picks.some((p) => p.hero.id === MAIN_ID);
  return (d.owned[owner] ?? []).map((hero) => {
    if (d.picks.some((p) => p.side === side && p.hero.id === hero.id)) return { hero, error: "heroTaken" as const };
    if (hero.id === MAIN_ID && dblTaken) return { hero, error: "dblTaken" as const };
    if (isBanned(d, hero)) return { hero, error: "banned" as const };
    return { hero, error: null };
  });
}

function advance(d: PvpDraft, now: number): PvpDraft {
  const at = d.at + 1;
  return { ...d, at, deadline: at >= d.steps.length ? null : now + PVP_DRAFT_TURN_MS };
}

export function draftBan(d: PvpDraft, owner: string, ban: DraftBan, now: number, auto = false): DraftResult {
  const step = draftStep(d);
  if (!step) return { ok: false, error: "draftOver" };
  if (step.kind !== "ban" || step.owner !== owner) return { ok: false, error: "notYourTurn" };
  if (!draftBanOk(d, ban)) return { ok: false, error: "badBan" };
  return { ok: true, draft: advance({ ...d, bans: [...d.bans, { side: step.side, ban, auto }] }, now) };
}

export function draftPick(d: PvpDraft, owner: string, input: DraftPickInput, now: number, force = false): DraftResult {
  const step = draftStep(d);
  if (!step) return { ok: false, error: "draftOver" };
  if (step.kind !== "pick" || step.owner !== owner) return { ok: false, error: "notYourTurn" };
  const choice = draftChoices(d, owner).find((c) => c.hero.id === input.hero);
  if (!choice) return { ok: false, error: "badHero" };
  if (choice.error && !force) return { ok: false, error: choice.error };
  let hero = choice.hero;
  if (hero.id === MAIN_ID) {
    const element = input.element ?? hero.element;
    const profession = input.profession ?? hero.profession;
    if (!ELEMENTS.includes(element) || !PROFESSIONS.includes(profession)) return { ok: false, error: "badBuild" };
    if (!force && (elementBanned(d, element) || professionBanned(d, profession))) return { ok: false, error: "banned" };
    hero = { ...hero, element, profession };
  }
  return { ok: true, draft: advance({ ...d, picks: [...d.picks, { owner, side: step.side, hero }] }, now) };
}

/** Một lượt hết giờ: máy cấm ngẫu nhiên, hoặc chọn tướng cấp cao nhất còn chọn được cho người đó. */
function autoStep(d: PvpDraft, now: number): PvpDraft {
  const step = draftStep(d)!;
  if (step.kind === "ban") {
    const rng = createRng(d.seed + d.at * 7919);
    const pool: DraftBan[] = [
      ...d.roster.map((id) => ({ kind: "hero", id }) as const),
      ...ELEMENTS.map((value) => ({ kind: "element", value }) as const),
      ...PROFESSIONS.map((value) => ({ kind: "profession", value }) as const),
    ].filter((b) => draftBanOk(d, b));
    const ban = pool[rng.int(0, pool.length - 1)] as DraftBan;
    const r = draftBan(d, step.owner, ban, now, true);
    return r.ok ? r.draft : advance(d, now);
  }
  const choices = draftChoices(d, step.owner);
  const byLevel = (a: { hero: DraftHero }, b: { hero: DraftHero }) => b.hero.level - a.hero.level;
  const free = choices.filter((c) => c.error === null).sort(byLevel);
  for (const c of free) {
    // Đinh Bộ Lĩnh bị cấm hệ hoặc nghề mặc định thì lấy hệ, nghề còn lại.
    const element = ELEMENTS.find((e) => !elementBanned(d, e) && (e === c.hero.element || elementBanned(d, c.hero.element)));
    const profession = PROFESSIONS.find((p) => !professionBanned(d, p) && (p === c.hero.profession || professionBanned(d, c.hero.profession)));
    const r = draftPick(d, step.owner, { hero: c.hero.id, ...(element ? { element } : {}), ...(profession ? { profession } : {}) }, now);
    if (r.ok) return r.draft;
  }
  // Hết tướng hợp lệ: chọn tướng chưa trùng trong phe, bất chấp cấm, để phe không bị thiếu người.
  const loose = choices.filter((c) => c.error !== "heroTaken" && c.error !== "dblTaken").sort(byLevel)[0];
  if (loose) {
    const r = draftPick(d, step.owner, { hero: loose.hero.id }, now, true);
    if (r.ok) return r.draft;
  }
  return advance(d, now);
}

/** Chạy bù các lượt quá hạn tới `now`; mỗi lượt quá hạn được xử lý tại đúng thời điểm hết hạn. */
export function draftCatchUp(start: PvpDraft, now: number): PvpDraft {
  let d = start;
  for (let guard = 0; guard < MAX_CATCH_UP && !draftOver(d) && d.deadline !== null && d.deadline <= now; guard++) d = autoStep(d, d.deadline);
  return d;
}
