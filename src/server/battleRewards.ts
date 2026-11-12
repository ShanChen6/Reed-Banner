// Phát thưởng khi trận online kết thúc: thưởng trận thường, Bình Loạn, Đấu trường, Nhật Lệnh, Song Tháp;
// cập nhật tiến độ nhiệm vụ, bảng xếp hạng và mùa. Tách từ battles.ts ngày 12/11/2026, không đổi logic.

import {
  ARENA_WIN_GOLD,
  arenaDelta,
  applyCampaignFirstClear,
  campaignPhaseCount,
  campaignScenarioByNode,
  clampCampaignFood,
  applyRaidResult,
  applySurvivalResult,
  recordMatch,
  DAILY_GOLD,
  dailyScore,
  applyRewards,
  battleRewards,
  createRng,
  HUMAN,
  isSpecialCompanionId,
  joinSpecialCompanion,
  recordSpecialMatch,
  matchOver,
  survivalCleared,
  receiveDrop,
  rollDrop,
  type SurvivalResult,
  type MatchMode,
  type Profile,
  type Element,
  type CampaignFirstClearReward,
  type CampaignScenarioSettlement,
  type RaidResult,
  type GearItem,
  type LevelUp,
  type Match,
} from "@/core";
import { updateProfile } from "./profiles";
import type { MatchRecord } from "./store";

import { submitProfile } from "./leaderboard";
import { recordSeason } from "./seasons";

import { settleTrial } from "./trialSettle";
import { settleDestinyMatch } from "./destinySettle";
import { settleExpeditionMatch } from "./expeditionSettle";
import {
  settleCampaignScenarioMatch,
  type ArenaResult,
  type Deps,
  type Outcome,
} from "./battles";

/** Ghi điểm đấu trường cho hai bên sau trận. Lỗi chỉ ghi log, không làm hỏng cộng thưởng. */
export async function settleArena(
  ownerId: string,
  match: Match,
  won: boolean,
  deps: Omit<Deps, "seed" | "newId">,
): Promise<ArenaResult | undefined> {
  const opp = match.arena;
  if (!opp) return undefined;
  const gold = won ? ARENA_WIN_GOLD : 0;
  const arena = deps.arena;
  if (!arena) return { won, opponent: opp.name, delta: 0, rating: null, gold };
  try {
    const mine = await arena.ensure(ownerId, deps.now);
    const d = arenaDelta(mine.rating, opp.rating, won);
    const rating = await arena.record(
      ownerId,
      d.attacker,
      won ? "win" : "loss",
      deps.now,
    );
    // Điểm mùa Quần Hùng: chỉ tính điểm nhận được từ trận mình đi đánh, không tính phòng thủ.
    await recordSeason(deps.seasons, { mode: "arena", ownerId, now: deps.now, add: d.attacker });
    const scores: [string, number | null][] = [[ownerId, rating]];
    if (opp.owner !== null)
      scores.push([
        opp.owner,
        await arena.record(
          opp.owner,
          d.defender,
          won ? "defenseLoss" : "defenseWin",
          deps.now,
        ),
      ]);
    for (const [owner, score] of scores)
      if (score !== null)
        await deps.leaderboard?.submit(
          owner,
          [{ board: "arena", score }],
          deps.now,
        );
    return { won, opponent: opp.name, delta: d.attacker, rating, gold };
  } catch (e) {
    console.error("Không ghi được điểm đấu trường", ownerId, e);
    return { won, opponent: opp.name, delta: 0, rating: null, gold };
  }
}

/** Hệ của các nhân vật phe người chơi lúc vào trận (nhiệm vụ nhân vật đặc biệt đếm số hệ khác nhau). */
export function humanElements(m: Match): Element[] {
  return m.battle.sides[HUMAN].fighters.map((f) => f.element);
}

export function matchMode(m: Match): MatchMode {
  if (m.arena) return "arena";
  if (m.survival) return "survival";
  if (m.campaignScenario) return "campaign";
  if (m.raidBoss && m.raid) return "raid";
  return m.daily ? "daily" : "normal";
}

export async function rewardCampaignV2(
  r: MatchRecord,
  match: Match,
  settlement: Extract<CampaignScenarioSettlement, { readonly ok: true }>,
  deps: Omit<Deps, "seed" | "newId">,
): Promise<Outcome | undefined> {
  const completed =
    settlement.verdict.status === "advance" ||
    settlement.verdict.status === "succeeded";
  const rewards = battleRewards(match.battle, HUMAN, completed);
  const ids = match.battle.sides[HUMAN].fighters.map((fighter) => fighter.id);
  const rolled = rollDrop(
    createRng(dropSeed(r.id)),
    match.difficulty,
    rewards.won,
    "",
  );
  let levelUps: readonly LevelUp[] = [];
  let drop: GearItem | null = null;
  let soldFor = 0;
  let campaignV2: CampaignFirstClearReward | undefined;
  const updated = await updateProfile(
    deps.profiles,
    r.ownerId,
    (profile) => {
      const applied = applyRewards(profile, ids, rewards);
      levelUps = applied.levelUps;
      const verdictNode = settlement.verdict.nodeId;
      // Trận công thành của phase đã qua (trận trùng, trận cũ) không được nạp lại lương cho hồ sơ.
      const stalePhase =
        campaignPhaseCount(verdictNode) > 1 &&
        (applied.profile.campaign.siegePhases[verdictNode] ?? 0) !==
          settlement.verdict.phaseIndex;
      // Lương: cộng phần chênh của chính trận này vào lương hiện có (trận cũ chưa ghi lương lúc vào thì lấy lương
      // cuối trận). Hai trận mở song song không hoàn lương cho nhau; lương mua giữa chừng không bị ghi đè.
      const current = applied.profile.campaign.supply;
      const startFood = match.campaignScenario?.startFood;
      const ended = settlement.verdict.playerFood;
      const after = clampCampaignFood(
        startFood === undefined ? ended : current + (ended - startFood),
      );
      const supply = stalePhase ? Math.min(current, after) : after;
      let next: Profile = {
        ...applied.profile,
        campaign: {
          ...applied.profile.campaign,
          supply,
        },
        quests: recordMatch(
          applied.profile.quests,
          {
            mode: "campaign",
            won: completed,
            coins: match.battle.sides[HUMAN].gold,
            waves: 0,
          },
          deps.now,
        ),
      };
      next = recordSpecialMatch(next, { won: completed, elements: humanElements(match) });
      const nodeId = verdictNode;
      const stored = next.campaign.siegePhases[nodeId] ?? 0;
      if (settlement.verdict.status === "advance") {
        // Qua một phase công thành: chỉ tiến khi đúng phase hồ sơ đang chờ, để trận cũ hay trận trùng không
        // nhảy phase. Không hoàn thành nhiệm vụ, không thưởng lần đầu.
        if (stored === settlement.verdict.phaseIndex) {
          // Trùm nhiều phase: ghi máu trùm còn lại để phase sau vào trận đúng mức đó, không hồi máu.
          const objective = campaignScenarioByNode(nodeId)?.phases[stored]
            ?.objective;
          const boss =
            objective?.type === "bossPhases"
              ? match.battle.sides[1].fighters.find(
                  (f) => f.id === objective.bossTarget,
                )
              : undefined;
          const phaseBossHp = Object.fromEntries(
            Object.entries(next.campaign.phaseBossHp).filter(
              ([id]) => id !== nodeId,
            ),
          );
          if (boss && boss.hp > 0)
            phaseBossHp[nodeId] = Math.max(
              0.01,
              Math.ceil((boss.hp / boss.maxHp) * 100) / 100,
            );
          next = {
            ...next,
            campaign: {
              ...next.campaign,
              siegePhases: {
                ...next.campaign.siegePhases,
                [nodeId]: stored + 1,
              },
              phaseBossHp,
            },
          };
        }
      }
      if (
        settlement.verdict.status === "succeeded" &&
        settlement.verdict.phaseIndex > 0 &&
        stored !== settlement.verdict.phaseIndex
      ) {
        // Phase cuối của một lượt đã chốt rồi: chỉ còn thưởng trận thường.
      } else if (settlement.verdict.status === "succeeded") {
        if (settlement.verdict.phaseIndex > 0) {
          const siegePhases = Object.fromEntries(
            Object.entries(next.campaign.siegePhases).filter(
              ([id]) => id !== nodeId,
            ),
          );
          const phaseBossHp = Object.fromEntries(
            Object.entries(next.campaign.phaseBossHp).filter(
              ([id]) => id !== nodeId,
            ),
          );
          next = {
            ...next,
            campaign: { ...next.campaign, siegePhases, phaseBossHp },
          };
        }
        const campaign = applyCampaignFirstClear(next, {
          nodeId: settlement.verdict.nodeId,
          source: "battle",
          // A first-action victory has zero fully completed player turns in
          // the adapter counter, but persisted best-turn records are positive.
          turns: Math.max(1, settlement.verdict.playerTurns),
          supply,
        });
        if (!campaign.ok) return campaign;
        next = campaign.profile;
        campaignV2 = campaign.reward;
      }
      if (rolled) {
        const received = receiveDrop(next, rolled);
        next = received.profile;
        drop = received.item;
        soldFor = received.soldFor;
      }
      return { ok: true as const, profile: next };
    },
    deps.now,
  );
  if (!updated.ok) {
    console.error("Không cộng được thưởng Campaign V2", r.id, updated.error);
    return undefined;
  }
  await submitProfile(
    deps.leaderboard,
    r.ownerId,
    updated.stored.profile,
    deps.now,
  );
  return {
    rewards,
    levelUps,
    drop,
    soldFor,
    ...(campaignV2 ? { campaignV2 } : {}),
  };
}

/** Trial: không vàng/EXP/món rơi; chỉ ghi tiến trình Trial. Đá do bước thưởng riêng cấp. */
export async function rewardTrial(
  r: MatchRecord,
  match: Match,
  deps: Omit<Deps, "seed" | "newId">,
): Promise<Outcome> {
  const trial = await settleTrial(r.ownerId, r.id, match, deps);
  return {
    rewards: {
      won: match.battle.winner === HUMAN,
      xp: match.battle.sides[HUMAN].fighters.map(() => 0),
      gold: 0,
    },
    levelUps: [],
    drop: null,
    soldFor: 0,
    ...(trial ? { trial } : {}),
  };
}

export async function rewardDestiny(
  r: MatchRecord,
  match: Match,
  deps: Omit<Deps, "seed" | "newId">,
): Promise<Outcome> {
  const destiny = await settleDestinyMatch(r.ownerId, r.id, match, deps);
  return {
    rewards: {
      won: match.battle.winner === HUMAN,
      xp: match.battle.sides[HUMAN].fighters.map(() => 0),
      gold: 0,
    },
    levelUps: [],
    drop: null,
    soldFor: 0,
    ...(destiny ? { destiny } : {}),
  };
}

/** Thử thách ngày xong: ghi điểm lên bảng xếp hạng, chỉ cộng vàng (đội là đội của đề, không nhận kinh nghiệm). */
export async function rewardDaily(
  r: MatchRecord,
  match: Match,
  day: string,
  deps: Omit<Deps, "seed" | "newId">,
): Promise<Outcome> {
  const score = dailyScore(match.battle);
  const gold = score.won ? DAILY_GOLD.win : DAILY_GOLD.loss;
  const u = await updateProfile(
    deps.profiles,
    r.ownerId,
    (p) => ({
      ok: true,
      profile: {
        ...p,
        gold: p.gold + gold,
        quests: recordMatch(
          p.quests,
          {
            mode: "daily",
            won: score.won,
            coins: match.battle.sides[HUMAN].gold,
            waves: 0,
          },
          deps.now,
        ),
      },
    }),
    deps.now,
  );
  if (!u.ok) console.error("Không cộng được thưởng thử thách ngày", r.id);
  let rank: number | null = null;
  if (deps.daily) {
    await deps.daily.finish(day, r.ownerId, score, deps.now);
    rank = await deps.daily.rankOf(day, r.ownerId);
  }
  return {
    rewards: {
      won: score.won,
      xp: match.battle.sides[HUMAN].fighters.map(() => 0),
      gold,
    },
    levelUps: [],
    drop: null,
    soldFor: 0,
    daily: { score, rank },
  };
}

/**
 * Trận đã kết thúc mà chưa cộng thưởng: đánh dấu đã cộng (chỉ một request thắng) rồi cộng vào hồ sơ.
 * Thua vẫn nhận kinh nghiệm cơ bản và giữ vàng, sách đã nhặt.
 */
/** Seed món rơi theo id trận: cộng thưởng chạy lại (lỗi ghi) vẫn ra cùng món. */
export function dropSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++)
    h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}

export async function reward(
  r: MatchRecord,
  match: Match,
  deps: Omit<Deps, "seed" | "newId">,
): Promise<Outcome | undefined> {
  let campaignScenario: Extract<CampaignScenarioSettlement, { readonly ok: true }> | undefined;
  if (match.campaignScenario) {
    const scenario = settleCampaignScenarioMatch(match);
    if (!scenario.ok || scenario.verdict.status === "pending") return undefined;
    campaignScenario = scenario;
  }
  if ((!campaignScenario && !matchOver(match)) || !(await deps.store.claimReward(r.id, deps.now)))
    return undefined;
  if (campaignScenario)
    return rewardCampaignV2(r, match, campaignScenario, deps);
  if (match.destiny) return rewardDestiny(r, match, deps);
  if (match.trial) return rewardTrial(r, match, deps);
  if (match.daily) return rewardDaily(r, match, match.daily, deps);
  // Sinh tồn: vượt qua ít nhất một đợt tính là thắng (kinh nghiệm, món rơi).
  const cleared = match.survival
    ? survivalCleared(match.survival, match.battle)
    : 0;
  const rewards = battleRewards(
    match.battle,
    HUMAN,
    match.survival ? cleared > 0 : undefined,
  );
  const ids = match.battle.sides[HUMAN].fighters.map((f) => f.id);
  const rolled = rollDrop(
    createRng(dropSeed(r.id)),
    match.difficulty,
    rewards.won,
    "",
  );
  let levelUps: readonly LevelUp[] = [];
  let drop: GearItem | null = null;
  let soldFor = 0;
  let raid: RaidResult | undefined;
  let survival: SurvivalResult | undefined;
  let specialQuest: Outcome["specialQuest"];
  const raidBoss = match.raidBoss;
  const u = await updateProfile(
    deps.profiles,
    r.ownerId,
    (p) => {
      const applied = applyRewards(p, ids, rewards);
      levelUps = applied.levelUps;
      let next: Profile = {
        ...applied.profile,
        // Đấu trường: vàng thưởng thêm khi thắng.
        gold:
          applied.profile.gold +
          (match.arena && rewards.won ? ARENA_WIN_GOLD : 0),
        quests: recordMatch(
          applied.profile.quests,
          {
            mode: matchMode(match),
            won: rewards.won,
            coins: match.battle.sides[HUMAN].gold,
            waves: cleared,
          },
          deps.now,
        ),
      };
      next = recordSpecialMatch(next, { won: rewards.won, elements: humanElements(match) });
      const specialId = match.specialQuest;
      if (specialId && isSpecialCompanionId(specialId)) {
        const joined = rewards.won ? joinSpecialCompanion(next, specialId) : { profile: next, joined: false };
        next = joined.profile;
        specialQuest = { id: specialId, joined: joined.joined };
      }
      if (match.survival) {
        const c = applySurvivalResult(next, cleared);
        next = c.profile;
        survival = c.result;
      } else if (raidBoss && match.raid) {
        // Rng riêng cho món thưởng, khác luồng món rơi thường.
        const c = applyRaidResult(
          next,
          raidBoss,
          match.raid,
          rewards.won,
          createRng(dropSeed(`${r.id}:raid`)),
        );
        next = c.profile;
        raid = c.result;
      }
      if (!rolled) return { ok: true, profile: next };
      const received = receiveDrop(next, rolled);
      drop = received.item;
      soldFor = received.soldFor;
      return { ok: true, profile: received.profile };
    },
    deps.now,
  );
  if (!u.ok) console.error("Không cộng được thưởng cuối trận", r.id, u.error);
  else
    await submitProfile(
      deps.leaderboard,
      r.ownerId,
      u.stored.profile,
      deps.now,
    );
  // Điểm mùa Trấn Ải: số đợt đã vượt của lượt chơi này; giữ điểm cao nhất trong tuần.
  if (match.survival && cleared > 0)
    await recordSeason(deps.seasons, { mode: "survival", ownerId: r.ownerId, now: deps.now, best: cleared });
  const arena = await settleArena(r.ownerId, match, rewards.won, deps);
  // Viễn Chinh: thưởng trận như trận thường ở trên, rồi chốt kết quả vào sa bàn.
  const expedition = match.expedition
    ? await settleExpeditionMatch(r.ownerId, r.id, match, deps)
    : undefined;
  return {
    rewards,
    levelUps,
    drop,
    soldFor,
    ...(raid ? { raid } : {}),
    ...(survival ? { survival } : {}),
    ...(arena ? { arena } : {}),
    ...(expedition ? { expedition } : {}),
    ...(specialQuest ? { specialQuest } : {}),
  };
}
