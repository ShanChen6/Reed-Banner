// Cấm chọn công khai của 3vs3 xếp hạng ở phía máy chủ: đọc phiên, chạy bù các lượt quá hạn, áp một lượt cấm hoặc chọn, ghi lại
// kèm điều kiện `seq`, và dựng trận khi lượt cuối xong. Không có tiến trình nền: mọi lần hỏi đều chạy bù.

import {
  PVP_FORGIVE_PER_DAY,
  companionById,
  draftBan,
  draftCatchUp,
  draftBeginPrep,
  draftChoices,
  draftOver,
  draftPrepDone,
  draftPrepReady,
  draftPrepSwap,
  draftPick,
  draftStep,
  vnDay,
  type DraftBan,
  type DraftError,
  type DraftHero,
  type LineupSlot,
  type Element,
  type Profession,
  type PvpDraft,
  type SideIndex,
} from "@/core";
import type { PvpDeps, PvpDraftRecord, PvpDraftStatus } from "./pvp";
import { buildTeamMatch, draftFillers } from "./pvpTeam";

export type PvpDraftAction =
  | { readonly type: "ban"; readonly ban: DraftBan }
  | { readonly type: "pick"; readonly hero: string; readonly element?: Element; readonly profession?: Profession }
  | { readonly type: "swap"; readonly a: number; readonly b: number }
  | { readonly type: "ready" };

export interface PvpDraftView {
  readonly id: string;
  readonly status: PvpDraftStatus;
  /** Trận đã dựng khi cấm chọn xong. */
  readonly matchId: string | null;
  readonly banFirst: SideIndex;
  /** Phe của người xem; phe này luôn hiện bên "đội bạn". */
  readonly mySide: SideIndex;
  readonly humans: readonly { readonly side: SideIndex; readonly name: string; readonly mine: boolean }[];
  /** Các bước theo thứ tự; `current` là bước đang chờ. */
  readonly steps: readonly { readonly kind: "ban" | "pick"; readonly side: SideIndex; readonly name: string; readonly current: boolean; readonly done: boolean }[];
  readonly turn: { readonly kind: "ban" | "pick"; readonly side: SideIndex; readonly name: string; readonly mine: boolean; readonly deadline: number; readonly remainingMs: number } | null;
  readonly bans: readonly { readonly side: SideIndex; readonly kind: DraftBan["kind"]; readonly value: string; readonly name: string; readonly auto: boolean }[];
  readonly picks: readonly { readonly side: SideIndex; readonly owner: string; readonly name: string; readonly hero: DraftHero }[];
  /** Tướng còn cấm được (chưa bị cấm). */
  readonly roster: readonly { readonly id: string; readonly name: string }[];
  /** Màn chuẩn bị (status "prep"): đội hình của phe người xem theo vị trí 1, 2, 3, tướng phe kia, ai đã sẵn sàng. */
  readonly prep: {
    readonly deadline: number;
    readonly remainingMs: number;
    readonly captain: boolean;
    readonly captainName: string;
    readonly youReady: boolean;
    readonly readyNames: readonly string[];
    readonly lineup: readonly { readonly name: string | null; readonly mine: boolean; readonly hero: DraftHero }[];
    readonly foes: readonly { readonly name: string | null; readonly hero: DraftHero }[];
  } | null;
  /** Tướng của người xem và lý do chưa chọn được. */
  readonly choices: readonly { readonly hero: DraftHero; readonly error: DraftError | null }[];
  readonly serverNow: number;
}

export type PvpDraftError = "notFound" | "conflict" | DraftError;

export type PvpDraftResult = { readonly ok: true; readonly view: PvpDraftView } | { readonly ok: false; readonly error: PvpDraftError };

const heroName = (id: string) => companionById(id)?.name ?? id;

function viewOf(rec: PvpDraftRecord, owner: string, now: number): PvpDraftView {
  const d = rec.state;
  const mySide: SideIndex = d.humans[1].includes(owner) ? 1 : 0;
  const step = draftStep(d);
  const nameOf = (o: string) => d.names[o] ?? "Người chơi";
  return {
    id: rec.id,
    status: rec.status,
    matchId: rec.matchId,
    banFirst: d.banFirst,
    mySide,
    humans: d.humans.flatMap((list, side) => list.map((o) => ({ side: side as SideIndex, name: nameOf(o), mine: o === owner }))),
    steps: d.steps.map((s, i) => ({ kind: s.kind, side: s.side, name: nameOf(s.owner), current: i === d.at, done: i < d.at })),
    turn:
      step && d.deadline !== null
        ? { kind: step.kind, side: step.side, name: nameOf(step.owner), mine: step.owner === owner, deadline: d.deadline, remainingMs: Math.max(0, d.deadline - now) }
        : null,
    bans: d.bans.map((b) => ({
      side: b.side,
      kind: b.ban.kind,
      value: b.ban.kind === "hero" ? b.ban.id : b.ban.value,
      name: b.ban.kind === "hero" ? heroName(b.ban.id) : b.ban.value,
      auto: b.auto,
    })),
    picks: d.picks.map((p) => ({ side: p.side, owner: p.owner, name: nameOf(p.owner), hero: p.hero })),
    roster: d.roster.filter((id) => !d.bans.some((b) => b.ban.kind === "hero" && b.ban.id === id)).map((id) => ({ id, name: heroName(id) })),
    prep: d.prep
      ? {
          deadline: d.prep.deadline,
          remainingMs: Math.max(0, d.prep.deadline - now),
          captain: d.humans[mySide][0] === owner,
          captainName: nameOf(d.humans[mySide][0] as string),
          youReady: d.prep.ready.includes(owner),
          readyNames: d.prep.ready.map(nameOf),
          lineup: d.prep.lineup[mySide].map((s: LineupSlot) => ({ name: s.owner === null ? null : nameOf(s.owner), mine: s.owner === owner, hero: s.hero })),
          foes: d.prep.lineup[(1 - mySide) as SideIndex].map((s: LineupSlot) => ({ name: s.owner === null ? null : nameOf(s.owner), hero: s.hero })),
        }
      : null,
    choices: draftChoices(d, owner),
    serverNow: now,
  };
}

const MAX_TRIES = 4;

async function withDraft(
  id: string,
  owner: string,
  deps: PvpDeps,
  apply: ((d: PvpDraft) => ReturnType<typeof draftBan>) | null,
): Promise<PvpDraftResult> {
  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const rec = await deps.pvp.getDraft(id);
    if (!rec || !rec.owners.includes(owner)) return { ok: false, error: "notFound" };
    if (rec.status === "done" || rec.status === "abandoned") return { ok: true, view: viewOf(rec, owner, deps.now) };
    let state = draftCatchUp(rec.state, deps.now);
    let error: DraftError | null = null;
    if (apply) {
      const r = apply(state);
      if (r.ok) state = r.draft;
      else error = r.error;
    }
    // Cấm chọn xong thì sang màn chuẩn bị: máy điền chỗ trống, đội hình theo thứ tự ghế, đội trưởng xếp lại.
    if (draftOver(state) && !state.prep) state = draftBeginPrep(state, draftFillers(state), state.deadline ?? deps.now);
    const status: PvpDraftRecord["status"] = state.prep ? "prep" : "active";
    if (draftPrepDone(state, deps.now)) {
      const day = vnDay(deps.now);
      const match = await buildTeamMatch({ ...rec, state }, deps, async (o) => {
        const r = await deps.pvp.rating(o, "team");
        return r.forgiveDay === day ? Math.max(0, PVP_FORGIVE_PER_DAY - r.forgiveUsed) : PVP_FORGIVE_PER_DAY;
      });
      await deps.pvp.createMatch(match);
      const next: PvpDraftRecord = { ...rec, state, seq: rec.seq + 1, status: "done", matchId: match.id, updatedAt: deps.now };
      if (!(await deps.pvp.saveDraft(next, rec.seq))) {
        // Request khác đã chốt trước: bỏ trận dư rồi đọc lại.
        await deps.pvp.saveMatch({ ...match, status: "abandoned", seq: 2 }, 1);
        continue;
      }
      for (const o of match.owners) await deps.pvp.attachMatch(o, "team", match.id, deps.now);
      return error ? { ok: false, error } : { ok: true, view: viewOf(next, owner, deps.now) };
    }
    let cur = rec;
    if (state !== rec.state || status !== rec.status) {
      const next: PvpDraftRecord = { ...rec, state, status, seq: rec.seq + 1, updatedAt: deps.now };
      if (!(await deps.pvp.saveDraft(next, rec.seq))) continue;
      cur = next;
    }
    return error ? { ok: false, error } : { ok: true, view: viewOf(cur, owner, deps.now) };
  }
  return { ok: false, error: "conflict" };
}

export const pvpDraftGet = (id: string, owner: string, deps: PvpDeps) => withDraft(id, owner, deps, null);

export function pvpDraftPlay(id: string, owner: string, action: PvpDraftAction, deps: PvpDeps): Promise<PvpDraftResult> {
  return withDraft(id, owner, deps, (d) => {
    switch (action.type) {
      case "ban":
        return draftBan(d, owner, action.ban, deps.now);
      case "pick":
        return draftPick(d, owner, { hero: action.hero, ...(action.element ? { element: action.element } : {}), ...(action.profession ? { profession: action.profession } : {}) }, deps.now);
      case "swap":
        return draftPrepSwap(d, owner, action.a, action.b);
      case "ready":
        return draftPrepReady(d, owner);
    }
  });
}
