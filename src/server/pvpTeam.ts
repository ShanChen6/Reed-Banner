// Ghép trận 3vs3 xếp hạng từ hàng đợi: gom tối đa sáu người thật có điểm gần nhau, mỗi người một tướng của mình (không trùng
// tướng, chỉ một Đinh Bộ Lĩnh). Chờ đủ lâu mà chưa đủ sáu thì máy điền chỗ trống. Cấm chọn công khai là bước sau (PVP-05).

import { MAIN_ID, STARTER_COMPANIONS, createPvpMatch, createRng, leveledFoe, profileTeam, progressOf, pvpFirstSide, type Element, type FighterConfig, type Profession, type SideIndex } from "@/core";
import { loadProfile } from "./profiles";
import type { PvpDeps, PvpMatchRecord, PvpQueueRow } from "./pvp";
import { heroesOf } from "./pvpRooms";

/** Chờ chừng này mà chưa đủ sáu người thì máy điền chỗ trống (cần ít nhất hai người thật). */
export const PVP_TEAM_FILL_MS = 25_000;
export const PVP_TEAM_SIZE = 6;
/** Thứ tự xếp theo điểm giảm dần vào hai phe, đổi chiều để hai phe cân nhau. */
const SNAKE: readonly SideIndex[] = [0, 1, 1, 0, 0, 1];

export interface TeamMatchHooks {
  readonly forgiveLeft: (ownerId: string) => Promise<number>;
  readonly nameOf?: (ownerId: string) => Promise<string>;
}

/** Chọn nhóm cho `me` từ hàng chờ: người cùng khoảng điểm, tướng không trùng. Trả null nếu chưa nên mở trận. */
export function pickTeamGroup(me: PvpQueueRow, others: readonly PvpQueueRow[], now: number, window: (waitedMs: number) => number): PvpQueueRow[] | null {
  const group: PvpQueueRow[] = [me];
  const heroes = new Set<string | null>([me.hero]);
  const mine = window(now - me.enqueuedAt);
  for (const o of others) {
    if (group.length >= PVP_TEAM_SIZE) break;
    if (o.hero === null || heroes.has(o.hero)) continue;
    if (Math.abs(o.rating - me.rating) > Math.max(mine, window(now - o.enqueuedAt))) continue;
    group.push(o);
    heroes.add(o.hero);
  }
  if (group.length === PVP_TEAM_SIZE) return group;
  const oldest = Math.min(...group.map((g) => g.enqueuedAt));
  return group.length >= 2 && now - oldest >= PVP_TEAM_FILL_MS ? group : null;
}

/** Dựng trận 3vs3 xếp hạng từ nhóm đã chọn. Trả null nếu có người không còn dùng được tướng đã chọn. */
export async function buildTeamMatch(group: readonly PvpQueueRow[], deps: PvpDeps, hooks: TeamMatchHooks): Promise<PvpMatchRecord | null> {
  const ranked = [...group].sort((a, b) => b.rating - a.rating || a.enqueuedAt - b.enqueuedAt);
  const picks: { row: PvpQueueRow; side: SideIndex; fighter: FighterConfig; level: number; name: string | null }[] = [];
  for (const [i, row] of ranked.entries()) {
    const { profile } = await loadProfile(deps.profiles, row.ownerId);
    const hero = (await heroesOf(row.ownerId, deps)).find((h) => h.id === row.hero);
    if (!hero) return null;
    const fighter =
      hero.id === MAIN_ID
        ? profileTeam({ ...profile, element: hero.element as Element, profession: hero.profession as Profession })[0]
        : profileTeam(profile, [hero.id])[1];
    if (!fighter) return null;
    picks.push({ row, side: SNAKE[i] as SideIndex, fighter, level: hero.id === MAIN_ID ? profile.main.level : progressOf(profile, hero.id).level, name: (await hooks.nameOf?.(row.ownerId)) ?? null });
  }
  const rng = createRng(deps.seed);
  const level = Math.max(1, Math.round(picks.reduce((a, p) => a + p.level, 0) / picks.length));
  const sides = ([0, 1] as const).map((side) => {
    const mine = picks.filter((p) => p.side === side);
    const used = new Set(mine.map((p) => p.fighter.id));
    const fighters: FighterConfig[] = mine.map((p) => p.fighter);
    const players: (string | null)[] = mine.map((p) => p.row.ownerId);
    const names: (string | null)[] = mine.map((p) => p.name);
    while (fighters.length < 3) {
      const pool = STARTER_COMPANIONS.filter((c) => !used.has(c.id));
      const base = pool[rng.int(0, pool.length - 1)] as FighterConfig;
      used.add(base.id);
      fighters.push(leveledFoe(base, level));
      players.push(null);
      names.push(null);
    }
    return { fighters, players, names, captain: 0 };
  });
  const avg = (side: number) => {
    const ps = picks.filter((p) => p.side === side);
    return ps.length ? ps.reduce((a, p) => a + p.row.rating, 0) / ps.length : 0;
  };
  const forgive: Record<string, number> = {};
  for (const p of picks) forgive[p.row.ownerId] = await hooks.forgiveLeft(p.row.ownerId);
  const { state } = createPvpMatch({
    sides: [
      { fighters: sides[0]!.fighters, players: sides[0]!.players, captain: 0 },
      { fighters: sides[1]!.fighters, players: sides[1]!.players, captain: 0 },
    ],
    seed: deps.seed,
    firstSide: pvpFirstSide([avg(0), avg(1)], rng),
    now: deps.now,
    forgiveLeft: forgive,
    names: [sides[0]!.names, sides[1]!.names],
  });
  return {
    id: deps.newId(),
    format: "team",
    state,
    seq: 1,
    status: "active",
    owners: picks.map((p) => p.row.ownerId),
    results: null,
    createdAt: deps.now,
    updatedAt: deps.now,
    settledAt: null,
  };
}
