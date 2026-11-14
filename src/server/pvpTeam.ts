// Ghép trận 3vs3 xếp hạng từ hàng đợi: gom tối đa sáu người thật có điểm gần nhau, rồi mở cấm chọn công khai (xem
// `src/server/pvpDraft.ts`). Chờ đủ lâu mà chưa đủ sáu thì chỗ trống do máy điều khiển. Cấm chọn xong mới dựng trận.

import {
  PLAYABLE_COMPANIONS,
  STARTER_COMPANIONS,
  createDraft,
  createPvpMatch,
  createRng,
  isReleasedCompanion,
  leveledFoe,
  MAIN_ID,
  profileTeam,
  pvpFirstSide,
  pvpSideRating,
  type DraftHero,
  type PvpDraft,
  type FighterConfig,
  type SideIndex,
} from "@/core";
import { loadProfile } from "./profiles";
import type { PvpDeps, PvpDraftRecord, PvpMatchRecord, PvpQueueRow } from "./pvp";
import { heroesOf } from "./pvpRooms";

/** Chờ chừng này mà chưa đủ sáu người thì máy điền chỗ trống (cần ít nhất hai người thật). */
export const PVP_TEAM_FILL_MS = 25_000;
export const PVP_TEAM_SIZE = 6;
/** Thứ tự xếp theo điểm giảm dần vào hai phe, đổi chiều để hai phe cân nhau. */
const SNAKE: readonly SideIndex[] = [0, 1, 1, 0, 0, 1];

/** Tướng có thể bị cấm thẳng: mọi tướng chơi được đã phát hành, trừ Đinh Bộ Lĩnh (chỉ cấm theo nghề, hệ). */
export const DRAFT_ROSTER: readonly string[] = PLAYABLE_COMPANIONS.filter((c) => c.id !== MAIN_ID && isReleasedCompanion(c.id)).map((c) => c.id);

/** Chọn nhóm cho `me` từ hàng chờ: người cùng khoảng điểm. Trả null nếu chưa nên mở trận. */
export function pickTeamGroup(me: PvpQueueRow, others: readonly PvpQueueRow[], now: number, window: (waitedMs: number) => number): PvpQueueRow[] | null {
  const group: PvpQueueRow[] = [me];
  const mine = window(now - me.enqueuedAt);
  for (const o of others) {
    if (group.length >= PVP_TEAM_SIZE) break;
    if (Math.abs(o.rating - me.rating) > Math.max(mine, window(now - o.enqueuedAt))) continue;
    group.push(o);
  }
  if (group.length === PVP_TEAM_SIZE) return group;
  const oldest = Math.min(...group.map((g) => g.enqueuedAt));
  return group.length >= 2 && now - oldest >= PVP_TEAM_FILL_MS ? group : null;
}

/** Mở phiên cấm chọn cho nhóm đã ghép: chia hai phe cân điểm, chụp danh sách tướng mỗi người đang có. */
export async function buildDraft(group: readonly PvpQueueRow[], deps: PvpDeps): Promise<PvpDraftRecord> {
  const ranked = [...group].sort((a, b) => b.rating - a.rating || a.enqueuedAt - b.enqueuedAt || a.ownerId.localeCompare(b.ownerId));
  const humans: [string[], string[]] = [[], []];
  for (const [i, row] of ranked.entries()) humans[SNAKE[i] as SideIndex].push(row.ownerId);
  const names: Record<string, string> = {};
  const owned: Record<string, DraftHero[]> = {};
  const ratings: Record<string, number> = {};
  for (const row of ranked) {
    ratings[row.ownerId] = row.rating;
    names[row.ownerId] = (await deps.nameOf?.(row.ownerId)) ?? "Người chơi";
    owned[row.ownerId] = (await heroesOf(row.ownerId, deps)).map((h) => ({ id: h.id, name: h.name, level: h.level, element: h.element, profession: h.profession }));
  }
  const state = createDraft({ humans, names, ratings, owned, roster: DRAFT_ROSTER, seed: deps.seed, now: deps.now });
  return { id: deps.newId(), state, seq: 1, status: "active", matchId: null, owners: ranked.map((r) => r.ownerId), createdAt: deps.now, updatedAt: deps.now };
}

/** Tướng máy điền chỗ trống của từng phe: không trùng tướng trong phe, không bị cấm, cấp bằng cấp trung bình của người thật. */
export function draftFillers(d: PvpDraft): [DraftHero[], DraftHero[]] {
  const rng = createRng(d.seed + 17);
  const banned = new Set(d.bans.flatMap((b) => (b.ban.kind === "hero" ? [b.ban.id] : [])));
  const level = Math.max(1, Math.round(d.picks.reduce((a, p) => a + p.hero.level, 0) / Math.max(1, d.picks.length)));
  return ([0, 1] as const).map((side) => {
    const used = new Set(d.picks.filter((p) => p.side === side).map((p) => p.hero.id));
    const out: DraftHero[] = [];
    while (used.size < 3) {
      const free = STARTER_COMPANIONS.filter((c) => !used.has(c.id));
      const pool = free.filter((c) => !banned.has(c.id));
      const choices = pool.length ? pool : free;
      const pick = choices[rng.int(0, choices.length - 1)] as FighterConfig;
      used.add(pick.id);
      out.push({ id: pick.id, name: pick.name, level, element: pick.element, profession: pick.profession });
    }
    return out;
  }) as [DraftHero[], DraftHero[]];
}

/** Dựng trận từ đội hình đã chuẩn bị: người thật dựng tướng từ hồ sơ hiện tại của họ (trang bị mới nhất), máy dựng theo cấp đã định. */
export async function buildTeamMatch(draft: PvpDraftRecord, deps: PvpDeps, forgiveLeft: (ownerId: string) => Promise<number>): Promise<PvpMatchRecord> {
  const d = draft.state;
  const lineup = d.prep!.lineup;
  const sideSpecs: { fighters: FighterConfig[]; players: (string | null)[]; names: (string | null)[]; captain: number }[] = [];
  for (const side of [0, 1] as const) {
    const fighters: FighterConfig[] = [];
    const players: (string | null)[] = [];
    const names: (string | null)[] = [];
    for (const slot of lineup[side]) {
      let cfg: FighterConfig | undefined;
      if (slot.owner !== null) {
        const { profile } = await loadProfile(deps.profiles, slot.owner);
        cfg =
          slot.hero.id === MAIN_ID
            ? profileTeam({ ...profile, element: slot.hero.element, profession: slot.hero.profession })[0]
            : profileTeam(profile, [slot.hero.id])[1];
      } else {
        const base = STARTER_COMPANIONS.find((c) => c.id === slot.hero.id);
        cfg = base ? leveledFoe(base, slot.hero.level) : undefined;
      }
      if (!cfg) continue;
      fighters.push(cfg);
      players.push(slot.owner);
      names.push(slot.owner === null ? null : (d.names[slot.owner] ?? null));
    }
    sideSpecs.push({ fighters, players, names, captain: Math.max(0, players.indexOf(d.humans[side][0] ?? null)) });
  }
  const rng = createRng(d.seed + 31);
  const forgive: Record<string, number> = {};
  for (const o of draft.owners) forgive[o] = await forgiveLeft(o);
  const avg = (side: number) => pvpSideRating(d.humans[side]!.map((p) => d.ratings[p] ?? 0));
  const { state } = createPvpMatch({
    sides: sideSpecs.map((s) => ({ fighters: s.fighters, players: s.players, captain: s.captain })) as never,
    seed: deps.seed,
    firstSide: pvpFirstSide([avg(0), avg(1)], rng),
    now: deps.now,
    forgiveLeft: forgive,
    names: [sideSpecs[0]!.names, sideSpecs[1]!.names],
  });
  return {
    id: deps.newId(),
    format: "team",
    state,
    seq: 1,
    status: "active",
    owners: draft.owners.filter((o) => sideSpecs.some((s) => s.players.includes(o))),
    results: null,
    createdAt: deps.now,
    updatedAt: deps.now,
    settledAt: null,
  };
}
