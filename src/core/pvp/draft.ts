// Cấm chọn công khai của Đấu người 3vs3 xếp hạng. Mỗi phe cấm 3 lần rồi mỗi người thật chọn một tướng của mình.
// Phe điểm cao hơn cấm trước, phe điểm thấp hơn chọn trước. Đinh Bộ Lĩnh không bị cấm thẳng mà bị cấm theo nghề hoặc hệ, và
// cả trận chỉ một người được chọn. Hết giờ thì máy cấm ngẫu nhiên hoặc chọn thay. Thuần: `now` và hạt giống do chỗ gọi truyền vào.
// Luật ở docs/02-game-modes/future/quan-hung-pvp-truc-tiep.md.

import { ELEMENTS, PROFESSIONS, type Element, type Profession, type SideIndex } from "../battle";
import { MAIN_ID } from "../progress/profile";
import { createRng } from "../rng";
import { pvpSideRating } from "./elo";

export const PVP_DRAFT_BANS_PER_SIDE = 3;
/** Số tướng tối thiểu để xếp hàng 3vs3 xếp hạng: sáu lượt cấm không thể lấy hết tướng của một người. */
export const PVP_TEAM_MIN_HEROES = 7;
/** Thời gian cho mỗi lượt cấm hoặc chọn. */
export const PVP_DRAFT_TURN_MS = 20_000;
/** Thời gian chuẩn bị sau cấm chọn: đổi trang bị, đội trưởng xếp vị trí, mọi người bấm sẵn sàng. */
export const PVP_PREP_MS = 45_000;
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

/** Một vị trí trong đội hình: người thật cầm tướng, hoặc máy (owner null). */
export interface LineupSlot {
  readonly owner: string | null;
  readonly hero: DraftHero;
}

/** Màn chuẩn bị sau cấm chọn: đội hình hai phe (vị trí 1, 2, 3), ai đã sẵn sàng, hạn chuẩn bị. */
export interface DraftPrep {
  readonly lineup: readonly [readonly LineupSlot[], readonly LineupSlot[]];
  readonly ready: readonly string[];
  readonly deadline: number;
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
  /** Có khi cấm chọn xong và đang chuẩn bị. */
  readonly prep?: DraftPrep | null;
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

export type DraftError = "notPrep" | "notCaptain" | "badSlot" | "notYourTurn" | "draftOver" | "badBan" | "banned" | "badHero" | "heroTaken" | "dblTaken" | "badBuild";

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
  const base = (d.owned[owner] ?? []).map((hero) => {
    if (hero.id === MAIN_ID && dblTaken) return { hero, error: "dblTaken" as const };
    if (isBanned(d, hero)) return { hero, error: "banned" as const };
    if (d.picks.some((p) => p.side === side && p.hero.id === hero.id)) return { hero, error: "heroTaken" as const };
    return { hero, error: null };
  });
  // Không còn tướng nào khác thì được chọn tướng trùng với đồng đội trong phe (trận có người đánh thật đòi từ 7 tướng,
  // sáu lượt cấm vẫn chừa ít nhất một tướng cho mỗi người).
  if (base.some((c) => c.error === null)) return base;
  return base.map((c) => (c.error === "heroTaken" ? { hero: c.hero, error: null } : c));
}

/** Người này còn tướng nào chọn được không. */
function hasAnyChoice(d: PvpDraft, owner: string): boolean {
  return draftChoices(d, owner).some((c) => c.error === null);
}

function advance(d: PvpDraft, now: number): PvpDraft {
  let at = d.at + 1;
  // Người không còn tướng nào chọn được (ví dụ chỉ có Đinh Bộ Lĩnh mà phe kia đã lấy) thì bỏ lượt ngay, khỏi chờ hết giờ.
  while (at < d.steps.length && d.steps[at]!.kind === "pick" && !hasAnyChoice({ ...d, at }, d.steps[at]!.owner)) at++;
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
  // Hết tướng hợp lệ (bị cấm hết hoặc trùng): người này không vào đội, chỗ đó do máy điền.
  return advance(d, now);
}

/** Chạy bù các lượt quá hạn tới `now`; mỗi lượt quá hạn được xử lý tại đúng thời điểm hết hạn. */
export function draftCatchUp(start: PvpDraft, now: number): PvpDraft {
  let d = start;
  for (let guard = 0; guard < MAX_CATCH_UP && !draftOver(d) && d.deadline !== null && d.deadline <= now; guard++) d = autoStep(d, d.deadline);
  return d;
}

/** Đội trưởng của phe: người thật đầu tiên, được xếp vị trí cho cả phe. */
export const draftCaptain = (d: PvpDraft, side: SideIndex): string => d.humans[side][0] as string;

/**
 * Vào màn chuẩn bị: đội hình mỗi phe là các tướng đã chọn (theo thứ tự chỗ ngồi) rồi tới tướng máy điền (`fillers`).
 * Đội trưởng sau đó xếp lại vị trí.
 */
export function draftBeginPrep(d: PvpDraft, fillers: readonly [readonly DraftHero[], readonly DraftHero[]], now: number): PvpDraft {
  const lineup = ([0, 1] as const).map((side) => [
    ...d.picks
      .filter((p) => p.side === side)
      .sort((a, b) => d.humans[side].indexOf(a.owner) - d.humans[side].indexOf(b.owner))
      .map((p): LineupSlot => ({ owner: p.owner, hero: p.hero })),
    ...fillers[side].map((hero): LineupSlot => ({ owner: null, hero })),
  ]) as unknown as DraftPrep["lineup"];
  return { ...d, prep: { lineup, ready: [], deadline: now + PVP_PREP_MS } };
}

/** Đội trưởng đổi chỗ hai vị trí trong phe mình. Chỉ trước khi hết giờ chuẩn bị; ai đã sẵn sàng vẫn giữ trạng thái. */
export function draftPrepSwap(d: PvpDraft, owner: string, a: number, b: number): DraftResult {
  if (!d.prep) return { ok: false, error: "notPrep" };
  const side: SideIndex = d.humans[1].includes(owner) ? 1 : 0;
  if (draftCaptain(d, side) !== owner) return { ok: false, error: "notCaptain" };
  const row = d.prep.lineup[side];
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a >= row.length || b >= row.length) return { ok: false, error: "badSlot" };
  const next = [...row];
  [next[a], next[b]] = [row[b] as LineupSlot, row[a] as LineupSlot];
  const lineup = (side === 0 ? [next, d.prep.lineup[1]] : [d.prep.lineup[0], next]) as unknown as DraftPrep["lineup"];
  return { ok: true, draft: { ...d, prep: { ...d.prep, lineup } } };
}

export function draftPrepReady(d: PvpDraft, owner: string): DraftResult {
  if (!d.prep) return { ok: false, error: "notPrep" };
  if (d.prep.ready.includes(owner)) return { ok: true, draft: d };
  return { ok: true, draft: { ...d, prep: { ...d.prep, ready: [...d.prep.ready, owner] } } };
}

/** Chuẩn bị xong: hết giờ hoặc mọi người thật đều sẵn sàng. */
export function draftPrepDone(d: PvpDraft, now: number): boolean {
  const p = d.prep;
  if (!p) return false;
  const seated = p.lineup.flat().flatMap((s) => (s.owner === null ? [] : [s.owner]));
  return now >= p.deadline || seated.every((o) => p.ready.includes(o));
}
