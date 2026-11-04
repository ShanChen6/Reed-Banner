// Viễn Chinh: chốt một trận vào lượt viễn chinh của hồ sơ (gọi từ bước cộng thưởng trận, sau thưởng trận thường).
// Tách khỏi expedition.ts để battles.ts không import vòng.

import {
  NEW_EXPEDITION,
  applyExpeditionEnd,
  createRng,
  hashString,
  settleExpeditionBattle,
  type ExpeditionResult,
  type Match,
} from "@/core";
import { submitProfile, type LeaderboardStore } from "./leaderboard";
import { updateProfile, type ProfileStore } from "./profiles";

export interface ExpeditionMatchResult {
  readonly won: boolean;
  readonly node: string;
  readonly phase: "march" | "won" | "lost";
  /** Có khi trận này kết thúc lượt viễn chinh. */
  readonly end?: ExpeditionResult;
}

export async function settleExpeditionMatch(
  ownerId: string,
  matchId: string,
  match: Match,
  deps: { readonly profiles: ProfileStore; readonly leaderboard?: LeaderboardStore; readonly now: number },
): Promise<ExpeditionMatchResult | undefined> {
  const tag = match.expedition;
  if (!tag) return undefined;
  let result: ExpeditionMatchResult | undefined;
  const updated = await updateProfile(
    deps.profiles,
    ownerId,
    (profile) => {
      const state = profile.expedition ?? NEW_EXPEDITION;
      const run = state.run;
      // Đã chốt rồi (gửi lại, chạy lại) thì không làm gì.
      if (!run || run.battle?.matchId !== matchId) return { ok: false as const, error: "stale" as const };
      const settled = settleExpeditionBattle(run, tag, match.battle);
      if (!settled.ok) return { ok: false as const, error: settled.error };
      const ended = applyExpeditionEnd(profile, { ...state, run: settled.run }, createRng(hashString(`${matchId}:expedition`)));
      const next = ended.state.run!;
      result = {
        won: settled.won,
        node: tag.node,
        phase: next.phase === "won" || next.phase === "lost" ? next.phase : "march",
        ...(next.result ? { end: next.result } : {}),
      };
      return { ok: true as const, profile: { ...ended.profile, expedition: ended.state } };
    },
    deps.now,
  );
  if (!updated.ok) {
    if (updated.error !== "stale") console.error("Không chốt được trận Viễn Chinh", matchId, updated.error);
    return undefined;
  }
  // Thắng thành đích đổi sao và ngày: ghi lại bảng xếp hạng Viễn Chinh.
  if (result?.end?.won) await submitProfile(deps.leaderboard, ownerId, updated.stored.profile, deps.now);
  return result;
}
