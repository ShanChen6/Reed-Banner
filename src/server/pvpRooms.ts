// Phòng mời bằng mã của Đấu người 3vs3 (giao hữu): chủ phòng tạo phòng, bạn bè vào bằng mã, mỗi người chọn một tướng của mình,
// chủ phòng bắt đầu (chỗ trống có thể để AI điền). Giao hữu không tính điểm hạng, không có vàng, không vào bảng mùa. Cấm và
// chọn tướng lần lượt, Nộ riêng từng người là bước sau (PVP-06). Luật ở docs/02-game-modes/future/quan-hung-pvp-truc-tiep.md.

import {
  ELEMENTS,
  MAIN_ID,
  PROFESSIONS,
  STARTER_COMPANIONS,
  companionById,
  createPvpMatch,
  createRng,
  isReleasedCompanion,
  leveledFoe,
  ownsCompanion,
  profileTeam,
  progressOf,
  pvpFirstSide,
  type Element,
  type FighterConfig,
  type Profession,
  type SideIndex,
} from "@/core";
import { loadProfile } from "./profiles";
import type { PvpDeps, PvpMatchRecord } from "./pvp";

export type PvpRoomStatus = "open" | "started" | "closed";

export interface PvpRoomSlot {
  readonly owner: string | null;
  readonly name: string | null;
  readonly hero: string | null;
  readonly heroName: string | null;
  readonly element: Element | null;
  readonly profession: Profession | null;
  readonly level: number | null;
}

export interface PvpRoomRecord {
  readonly code: string;
  readonly host: string;
  readonly status: PvpRoomStatus;
  /** Sáu chỗ: 0–2 phe thứ nhất, 3–5 phe thứ hai (theo vị trí 1, 2, 3). */
  readonly slots: readonly PvpRoomSlot[];
  /** Bắt đầu khi còn chỗ trống thì AI điền. */
  readonly fillAi: boolean;
  readonly matchId: string | null;
  readonly seq: number;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface PvpRoomDeps extends PvpDeps {
  /** Sinh mã phòng ngắn (người chơi gõ tay), do chỗ gọi truyền vào để test chạy xác định. */
  readonly newCode: () => string;
  /** Tên hiển thị của tài khoản. */
  readonly nameOf: (ownerId: string) => Promise<string>;
}

export type PvpRoomError =
  | "notFound"
  | "inRoom"
  | "inMatch"
  | "full"
  | "closed"
  | "started"
  | "notHost"
  | "notMember"
  | "badHero"
  | "badBuild"
  | "heroTaken"
  | "dblTaken"
  | "badSlot"
  | "slotTaken"
  | "needHero"
  | "needHumans"
  | "needFull"
  | "conflict";

export interface PvpRoomView {
  readonly code: string;
  readonly status: PvpRoomStatus;
  readonly seq: number;
  readonly fillAi: boolean;
  readonly matchId: string | null;
  readonly you: { readonly slot: number | null; readonly host: boolean };
  readonly slots: readonly {
    readonly slot: number;
    readonly mine: boolean;
    readonly host: boolean;
    readonly occupied: boolean;
    readonly name: string | null;
    readonly hero: { readonly id: string; readonly name: string; readonly element: Element; readonly profession: Profession; readonly level: number } | null;
  }[];
  /** Lý do chưa bắt đầu được (chỉ có khi `you.host`); null là bắt đầu được. */
  readonly startBlock: PvpRoomError | null;
  /** Tướng người xem chọn được: Đinh Bộ Lĩnh và các tướng đã có. */
  readonly heroes: readonly { readonly id: string; readonly name: string; readonly element: Element; readonly profession: Profession; readonly level: number }[];
  readonly serverNow: number;
}

export type PvpRoomResult = { readonly ok: true; readonly room: PvpRoomView } | { readonly ok: false; readonly error: PvpRoomError };

const EMPTY: PvpRoomSlot = { owner: null, name: null, hero: null, heroName: null, element: null, profession: null, level: null };
const MAX_TRIES = 5;

export const PVP_ROOM_SIZE = 6;

/** Mã phòng: chữ in hoa và số, bỏ các ký tự dễ nhầm (0, O, 1, I). */
export const normalizeRoomCode = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const code = v.trim().toUpperCase();
  return /^[A-HJ-NP-Z2-9]{6}$/.test(code) ? code : null;
};

export const makeRoomCode = (rand: () => number): string => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => alphabet[Math.floor(rand() * alphabet.length)]).join("");
};

const sideOfSlot = (slot: number): SideIndex => (slot < 3 ? 0 : 1);
const slotOf = (r: PvpRoomRecord, owner: string) => r.slots.findIndex((s) => s.owner === owner);
const replaceSlot = (r: PvpRoomRecord, i: number, s: PvpRoomSlot): PvpRoomSlot[] => r.slots.map((x, k) => (k === i ? s : x));

export interface HeroInfo {
  readonly id: string;
  readonly name: string;
  readonly element: Element;
  readonly profession: Profession;
  readonly level: number;
}

/** Tướng người này chọn được: Đinh Bộ Lĩnh theo nghề, hệ trong hồ sơ, và các tướng đã có. */
export async function heroesOf(owner: string, deps: PvpDeps): Promise<HeroInfo[]> {
  const { profile } = await loadProfile(deps.profiles, owner);
  const out: HeroInfo[] = [{ id: MAIN_ID, name: "Đinh Bộ Lĩnh", element: profile.element, profession: profile.profession, level: profile.main.level }];
  for (const id of Object.keys(profile.companions)) {
    const c = companionById(id);
    if (!c || !isReleasedCompanion(id) || !ownsCompanion(profile, id)) continue;
    out.push({ id, name: c.name, element: c.element, profession: c.profession, level: progressOf(profile, id).level });
  }
  return out;
}

/** Vì sao chưa bắt đầu được; null là được. */
function startBlock(r: PvpRoomRecord): PvpRoomError | null {
  if (r.status === "started") return "started";
  if (r.status === "closed") return "closed";
  const sideHumans = [0, 1].map((s) => r.slots.filter((x, i) => sideOfSlot(i) === s && x.owner !== null).length);
  if (sideHumans[0] === 0 || sideHumans[1] === 0) return "needHumans";
  if (r.slots.some((s) => s.owner !== null && s.hero === null)) return "needHero";
  if (!r.fillAi && r.slots.some((s) => s.owner === null)) return "needFull";
  return null;
}

async function viewOf(r: PvpRoomRecord, owner: string, deps: PvpDeps): Promise<PvpRoomView> {
  const mine = slotOf(r, owner);
  return {
    code: r.code,
    status: r.status,
    seq: r.seq,
    fillAi: r.fillAi,
    matchId: r.matchId,
    you: { slot: mine < 0 ? null : mine, host: r.host === owner },
    slots: r.slots.map((s, i) => ({
      slot: i,
      mine: s.owner === owner,
      host: s.owner !== null && s.owner === r.host,
      occupied: s.owner !== null,
      name: s.name,
      hero: s.hero && s.heroName && s.element && s.profession ? { id: s.hero, name: s.heroName, element: s.element, profession: s.profession, level: s.level ?? 1 } : null,
    })),
    startBlock: r.host === owner ? startBlock(r) : null,
    heroes: mine >= 0 ? await heroesOf(owner, deps) : [],
    serverNow: deps.now,
  };
}

/** Đọc, đổi, ghi kèm điều kiện seq; trùng thì đọc lại thử tiếp. `change` trả phòng mới hoặc lỗi. */
async function mutate(
  code: string,
  deps: PvpRoomDeps,
  change: (r: PvpRoomRecord) => Promise<PvpRoomRecord | PvpRoomError> | PvpRoomRecord | PvpRoomError,
): Promise<{ ok: true; room: PvpRoomRecord } | { ok: false; error: PvpRoomError }> {
  for (let i = 0; i < MAX_TRIES; i++) {
    const cur = await deps.pvp.getRoom(code);
    if (!cur) return { ok: false, error: "notFound" };
    const next = await change(cur);
    if (typeof next === "string") return { ok: false, error: next };
    const saved: PvpRoomRecord = { ...next, seq: cur.seq + 1, updatedAt: deps.now };
    if (await deps.pvp.saveRoom(saved, cur.seq)) return { ok: true, room: saved };
  }
  return { ok: false, error: "conflict" };
}

async function finish(res: { ok: true; room: PvpRoomRecord } | { ok: false; error: PvpRoomError }, owner: string, deps: PvpDeps): Promise<PvpRoomResult> {
  return res.ok ? { ok: true, room: await viewOf(res.room, owner, deps) } : res;
}

/** Phòng của người này (nếu có). */
export async function pvpRoomGet(owner: string, code: string | null, deps: PvpRoomDeps): Promise<PvpRoomResult> {
  const mine = await deps.pvp.roomCodeOf(owner);
  const target = code ?? mine;
  if (!target) return { ok: false, error: "notFound" };
  const room = await deps.pvp.getRoom(target);
  if (!room) return { ok: false, error: "notFound" };
  return { ok: true, room: await viewOf(room, owner, deps) };
}

export async function pvpRoomCreate(owner: string, deps: PvpRoomDeps): Promise<PvpRoomResult> {
  if (await deps.pvp.roomCodeOf(owner)) return { ok: false, error: "inRoom" };
  const q = await deps.pvp.queueOf(owner);
  if (q?.matchId && (await deps.pvp.getMatch(q.matchId))?.status === "active") return { ok: false, error: "inMatch" };
  const name = await deps.nameOf(owner);
  for (let i = 0; i < MAX_TRIES; i++) {
    const code = deps.newCode();
    const room: PvpRoomRecord = {
      code,
      host: owner,
      status: "open",
      slots: [{ ...EMPTY, owner, name }, ...Array.from({ length: PVP_ROOM_SIZE - 1 }, () => EMPTY)],
      fillAi: false,
      matchId: null,
      seq: 1,
      createdAt: deps.now,
      updatedAt: deps.now,
    };
    if (!(await deps.pvp.createRoom(room))) continue;
    if (!(await deps.pvp.setMember(owner, code))) return { ok: false, error: "inRoom" };
    return { ok: true, room: await viewOf(room, owner, deps) };
  }
  return { ok: false, error: "conflict" };
}

export async function pvpRoomJoin(owner: string, rawCode: unknown, deps: PvpRoomDeps): Promise<PvpRoomResult> {
  const code = normalizeRoomCode(rawCode);
  if (!code) return { ok: false, error: "notFound" };
  const room = await deps.pvp.getRoom(code);
  if (!room) return { ok: false, error: "notFound" };
  if (slotOf(room, owner) >= 0) return { ok: true, room: await viewOf(room, owner, deps) };
  if (room.status === "closed") return { ok: false, error: "closed" };
  if (room.status === "started") return { ok: false, error: "started" };
  const q = await deps.pvp.queueOf(owner);
  if (q?.matchId && (await deps.pvp.getMatch(q.matchId))?.status === "active") return { ok: false, error: "inMatch" };
  if (!(await deps.pvp.setMember(owner, code))) return { ok: false, error: "inRoom" };
  const name = await deps.nameOf(owner);
  const res = await mutate(code, deps, (r) => {
    if (r.status !== "open") return r.status === "closed" ? "closed" : "started";
    if (slotOf(r, owner) >= 0) return r;
    // Vào phe đang ít người hơn (hòa thì phe thứ nhất; người đầu tiên vào sau chủ phòng thì sang phe thứ hai).
    const count = (side: number) => r.slots.filter((s, i) => sideOfSlot(i) === side && s.owner !== null).length;
    const order: SideIndex[] = count(0) <= count(1) ? [0, 1] : [1, 0];
    for (const side of order) {
      const at = r.slots.findIndex((s, i) => sideOfSlot(i) === side && s.owner === null);
      if (at >= 0) return { ...r, slots: replaceSlot(r, at, { ...EMPTY, owner, name }) };
    }
    return "full";
  });
  if (!res.ok) await deps.pvp.clearMember(owner, code);
  return finish(res, owner, deps);
}

export async function pvpRoomLeave(owner: string, deps: PvpRoomDeps): Promise<{ ok: true } | { ok: false; error: PvpRoomError }> {
  const code = await deps.pvp.roomCodeOf(owner);
  if (!code) return { ok: false, error: "notMember" };
  const room = await deps.pvp.getRoom(code);
  if (room && room.status === "open") {
    await mutate(code, deps, (r) => {
      const at = slotOf(r, owner);
      if (at < 0) return r;
      const slots = replaceSlot(r, at, EMPTY);
      const remaining = slots.filter((s) => s.owner !== null);
      if (remaining.length === 0) return { ...r, slots, status: "closed" as const };
      return { ...r, slots, host: r.host === owner ? (remaining[0]!.owner as string) : r.host };
    });
  }
  await deps.pvp.clearMember(owner, code);
  return { ok: true };
}

/** Đổi sang một chỗ trống (đổi phe hoặc vị trí). */
export async function pvpRoomMove(owner: string, to: unknown, deps: PvpRoomDeps): Promise<PvpRoomResult> {
  const code = await deps.pvp.roomCodeOf(owner);
  if (!code) return { ok: false, error: "notMember" };
  if (!Number.isInteger(to) || (to as number) < 0 || (to as number) >= PVP_ROOM_SIZE) return { ok: false, error: "badSlot" };
  const target = to as number;
  const res = await mutate(code, deps, (r) => {
    if (r.status !== "open") return r.status === "closed" ? "closed" : "started";
    const at = slotOf(r, owner);
    if (at < 0) return "notMember";
    if (at === target) return r;
    if (r.slots[target]!.owner !== null) return "slotTaken";
    const moved = r.slots[at]!;
    // Đổi phe thì tướng đã chọn phải còn hợp lệ ở phe mới (không trùng tướng cùng phe).
    const clash = moved.hero !== null && sideOfSlot(at) !== sideOfSlot(target) && r.slots.some((s, i) => sideOfSlot(i) === sideOfSlot(target) && s.owner !== null && s.hero === moved.hero);
    const slots = r.slots.map((s, i) => (i === at ? EMPTY : i === target ? (clash ? { ...moved, hero: null, heroName: null, element: null, profession: null, level: null } : moved) : s));
    return { ...r, slots };
  });
  return finish(res, owner, deps);
}

/** Chọn tướng. `hero` null là bỏ chọn. Đinh Bộ Lĩnh chọn nghề, hệ qua `build` (mặc định theo hồ sơ). */
export async function pvpRoomHero(
  owner: string,
  hero: unknown,
  build: { readonly element?: unknown; readonly profession?: unknown } | undefined,
  deps: PvpRoomDeps,
): Promise<PvpRoomResult> {
  const code = await deps.pvp.roomCodeOf(owner);
  if (!code) return { ok: false, error: "notMember" };
  let info: HeroInfo | null = null;
  if (hero !== null) {
    if (typeof hero !== "string") return { ok: false, error: "badHero" };
    const mine = (await heroesOf(owner, deps)).find((h) => h.id === hero);
    if (!mine) return { ok: false, error: "badHero" };
    info = mine;
    if (hero === MAIN_ID && build && (build.element !== undefined || build.profession !== undefined)) {
      const el = build.element;
      const pr = build.profession;
      if (!ELEMENTS.includes(el as Element) || !PROFESSIONS.includes(pr as Profession)) return { ok: false, error: "badBuild" };
      info = { ...info, element: el as Element, profession: pr as Profession };
    }
  }
  const res = await mutate(code, deps, (r) => {
    if (r.status !== "open") return r.status === "closed" ? "closed" : "started";
    const at = slotOf(r, owner);
    if (at < 0) return "notMember";
    if (info) {
      if (info.id === MAIN_ID && r.slots.some((s, i) => i !== at && s.hero === MAIN_ID)) return "dblTaken";
      if (r.slots.some((s, i) => i !== at && sideOfSlot(i) === sideOfSlot(at) && s.hero === info.id)) return "heroTaken";
    }
    const cur = r.slots[at]!;
    return {
      ...r,
      slots: replaceSlot(r, at, info ? { ...cur, hero: info.id, heroName: info.name, element: info.element, profession: info.profession, level: info.level } : { ...cur, hero: null, heroName: null, element: null, profession: null, level: null }),
    };
  });
  return finish(res, owner, deps);
}

export async function pvpRoomFillAi(owner: string, on: unknown, deps: PvpRoomDeps): Promise<PvpRoomResult> {
  const code = await deps.pvp.roomCodeOf(owner);
  if (!code) return { ok: false, error: "notMember" };
  const res = await mutate(code, deps, (r) => {
    if (r.host !== owner) return "notHost";
    if (r.status !== "open") return r.status === "closed" ? "closed" : "started";
    return { ...r, fillAi: on === true };
  });
  return finish(res, owner, deps);
}

/** Chủ phòng bắt đầu: dựng đội từ hồ sơ từng người, AI điền chỗ trống, tạo trận giao hữu và gắn vào mọi người. */
export async function pvpRoomStart(owner: string, deps: PvpRoomDeps): Promise<PvpRoomResult> {
  const code = await deps.pvp.roomCodeOf(owner);
  if (!code) return { ok: false, error: "notMember" };
  const room = await deps.pvp.getRoom(code);
  if (!room) return { ok: false, error: "notFound" };
  if (room.host !== owner) return { ok: false, error: "notHost" };
  const block = startBlock(room);
  if (block) return { ok: false, error: block };

  // Đội của từng người từ hồ sơ của chính họ: cấp, kỹ năng và trang bị hiện có.
  const fighters: (FighterConfig | null)[] = [];
  const levels: number[] = [];
  for (const slot of room.slots) {
    if (slot.owner === null) {
      fighters.push(null);
      continue;
    }
    const { profile } = await loadProfile(deps.profiles, slot.owner);
    const cfg =
      slot.hero === MAIN_ID
        ? profileTeam({ ...profile, element: slot.element as Element, profession: slot.profession as Profession })[0]
        : profileTeam(profile, [slot.hero as string])[1];
    if (!cfg) return { ok: false, error: "badHero" };
    fighters.push(cfg);
    levels.push(slot.hero === MAIN_ID ? profile.main.level : progressOf(profile, slot.hero as string).level);
  }
  const rng = createRng(deps.seed);
  const level = Math.max(1, Math.round(levels.reduce((a, b) => a + b, 0) / Math.max(1, levels.length)));
  for (let i = 0; i < PVP_ROOM_SIZE; i++) {
    if (fighters[i]) continue;
    const used = new Set(fighters.filter((f, k) => f && sideOfSlot(k) === sideOfSlot(i)).map((f) => (f as FighterConfig).id));
    const pool = STARTER_COMPANIONS.filter((c) => !used.has(c.id));
    const base = pool[rng.int(0, pool.length - 1)] as FighterConfig;
    fighters[i] = leveledFoe(base, level);
  }
  const sideSpec = (side: SideIndex) => {
    const idx = [0, 1, 2].map((k) => side * 3 + k);
    const players = idx.map((i) => room.slots[i]!.owner);
    return {
      fighters: idx.map((i) => fighters[i] as FighterConfig),
      players,
      captain: players.findIndex((p) => p !== null),
      names: idx.map((i) => room.slots[i]!.name),
    };
  };
  const a = sideSpec(0);
  const b = sideSpec(1);
  const { state } = createPvpMatch({
    sides: [
      { fighters: a.fighters, players: a.players, captain: a.captain },
      { fighters: b.fighters, players: b.players, captain: b.captain },
    ],
    seed: deps.seed,
    firstSide: pvpFirstSide([0, 0], rng),
    now: deps.now,
    friendly: true,
    names: [a.names, b.names],
  });
  const owners = room.slots.flatMap((s) => (s.owner ? [s.owner] : []));
  const record: PvpMatchRecord = {
    id: deps.newId(),
    format: "team",
    state,
    seq: 1,
    status: "active",
    owners,
    results: null,
    createdAt: deps.now,
    updatedAt: deps.now,
    settledAt: null,
  };
  await deps.pvp.createMatch(record);
  const res = await mutate(code, deps, (r) => {
    if (r.host !== owner) return "notHost";
    if (r.status !== "open") return r.status === "closed" ? "closed" : "started";
    return { ...r, status: "started" as const, matchId: record.id };
  });
  if (!res.ok) {
    await deps.pvp.saveMatch({ ...record, status: "abandoned", seq: 2 }, 1);
    return res;
  }
  for (const o of owners) await deps.pvp.attachMatch(o, "team", record.id, deps.now);
  return { ok: true, room: await viewOf(res.room, owner, deps) };
}
