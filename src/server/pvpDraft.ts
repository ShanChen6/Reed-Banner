// Cấm chọn công khai của 3vs3 xếp hạng ở phía máy chủ: đọc phiên, chạy bù các lượt quá hạn, áp một lượt cấm hoặc chọn, ghi lại
// kèm điều kiện `seq`, và dựng trận khi lượt cuối xong. Không có tiến trình nền: mọi lần hỏi đều chạy bù.

import {
  PVP_FORGIVE_PER_DAY,
  companionById,
  draftBan,
  draftCatchUp,
  draftChoices,
  draftOver,
  draftPick,
  draftStep,
  vnDay,
  type DraftBan,
  type DraftError,
  type DraftHero,
  type Element,
  type Profession,
  type PvpDraft,
  type SideIndex,
} from "@/core";
import type { PvpDeps, PvpDraftRecord, PvpDraftStatus } from "./pvp";
import { buildTeamMatch } from "./pvpTeam";

export type PvpDraftAction =
  | { readonly type: "ban"; readonly ban: DraftBan }
  | { readonly type: "pick"; readonly hero: string; readonly element?: Element; readonly profession?: Profession };

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
    if (rec.status !== "active") return { ok: true, view: viewOf(rec, owner, deps.now) };
    let state = draftCatchUp(rec.state, deps.now);
    let error: DraftError | null = null;
    if (apply && !draftOver(state)) {
      const r = apply(state);
      if (r.ok) state = r.draft;
      else error = r.error;
    }
    if (draftOver(state)) {
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
    if (state !== rec.state) {
      const next: PvpDraftRecord = { ...rec, state, seq: rec.seq + 1, updatedAt: deps.now };
      if (!(await deps.pvp.saveDraft(next, rec.seq))) continue;
      cur = next;
    }
    return error ? { ok: false, error } : { ok: true, view: viewOf(cur, owner, deps.now) };
  }
  return { ok: false, error: "conflict" };
}

export const pvpDraftGet = (id: string, owner: string, deps: PvpDeps) => withDraft(id, owner, deps, null);

export function pvpDraftPlay(id: string, owner: string, action: PvpDraftAction, deps: PvpDeps): Promise<PvpDraftResult> {
  return withDraft(id, owner, deps, (d) =>
    action.type === "ban"
      ? draftBan(d, owner, action.ban, deps.now)
      : draftPick(d, owner, { hero: action.hero, ...(action.element ? { element: action.element } : {}), ...(action.profession ? { profession: action.profession } : {}) }, deps.now),
  );
}
