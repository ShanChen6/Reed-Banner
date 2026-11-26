// Đoàn hàng của một người chơi trong một mùa Hành Thương Ký (GDD mục 5–7): kim tiền, khoang hàng, vị trí, chặng đang đi,
// lộ phiếu trong ngày, cấp đoàn hàng và nạn đang chờ xử lý. Hàm thuần: giờ, hạt giống và số ngẫu nhiên do server đưa vào.

import { vnDay } from "../vnTime";
import { newSkirmish, skAct, type SkAction, type SkState } from "../su-lo/skirmish";
import { cargoWeight, isTradeItem, TRADE_ITEMS, tradeItem, type TradeItemId } from "./goods";
import { isTradeNode, tradeEdge, TRADE_NODE_IDS, type TradeEdge, type TradeNodeId } from "./map";

export const TRADE_START_MONEY = 10_000;
export const TRADE_PASSES_PER_DAY = 5;
/** Phút đi mỗi chặng ở cấp 1 theo độ xa. */
export const TRADE_LEG_MINUTES: Readonly<Record<1 | 2 | 3, number>> = { 1: 20, 2: 45, 3: 90 };
/** Cấp đoàn hàng 1–5: khoang, hệ số thời gian và giá nâng lên cấp đó (kim tiền). */
export const TRADE_LEVELS = [
  { capacity: 100, time: 1, cost: 0 },
  { capacity: 125, time: 0.9, cost: 1_500 },
  { capacity: 150, time: 0.8, cost: 3_000 },
  { capacity: 175, time: 0.7, cost: 6_000 },
  { capacity: 200, time: 0.6, cost: 12_000 },
] as const;
export const TRADE_MAX_LEVEL = TRADE_LEVELS.length;

export type EncounterKind = "pirates" | "storm" | "bandits";

export const ENCOUNTER_NAME: Readonly<Record<EncounterKind, string>> = { pirates: "Giặc sông", storm: "Sóng dữ", bandits: "Thảo khấu" };
/** Cơ hội gặp nạn mỗi chặng; chở kỳ trân cộng thêm. Mỗi ngày gặp nạn tối đa 2 lần. */
export const ENCOUNTER_CHANCE: Readonly<Record<EncounterKind, number>> = { pirates: 0.12, storm: 0.15, bandits: 0.1 };
export const ENCOUNTER_TREASURE_BONUS = 0.1;
export const ENCOUNTERS_PER_DAY = 2;
/** Trận cực dễ (Shan chốt 26/11/2026), mọi người như nhau. Đo 2 000 trận: đi ngẫu nhiên thắng 98,8% trong khoảng 6 nước, đi nước tốt nhất thắng 100% trong khoảng 3 nước. */
export const ENCOUNTER_HP = 120;
export const ENCOUNTER_MOVES = 8;
/** Nộp mãi lộ mất 10% giá trị hàng; thua trận mất 30%, hàng đắt (kỳ trân) mất trước. */
export const TOLL_RATIO = 0.1;
export const DEFEAT_RATIO = 0.3;
/** Giới hạn số thao tác trong một trận gửi lên server. */
export const MAX_FIGHT_ACTIONS = 80;

export type Cargo = Readonly<Partial<Record<TradeItemId, number>>>;

export interface TradeLeg {
  readonly id: string;
  readonly from: TradeNodeId;
  readonly to: TradeNodeId;
  readonly departAt: number;
  readonly arriveAt: number;
  /** Nạn sẽ gặp khi tới nơi (đã bốc lúc xuất hành), null là đi êm. */
  readonly encounter: { readonly kind: EncounterKind; readonly seed: number } | null;
}

export interface PendingEncounter {
  readonly kind: EncounterKind;
  readonly seed: number;
  readonly legId: string;
}

export interface TradePlayer {
  readonly v: 1;
  readonly season: string;
  readonly money: number;
  readonly cargo: Cargo;
  /** Điểm đang đứng (hoặc điểm vừa rời khi đang đi). */
  readonly node: TradeNodeId;
  /** Chặng gần nhất; đang đi khi giờ hiện tại trước `arriveAt`. */
  readonly leg: TradeLeg | null;
  readonly level: number;
  /** Ngày (giờ VN) của bộ đếm lộ phiếu và nạn. */
  readonly day: string;
  readonly passesUsed: number;
  readonly encountersToday: number;
  readonly encounter: PendingEncounter | null;
  /** Số chặng đã đi trong mùa. */
  readonly legs: number;
  /** Chặng đã dùng cho giao thương giữa đường (mỗi chuyến một lần). */
  readonly tradeLegId: string | null;
}

export function newTradePlayer(season: string, startIndex: number, now: number): TradePlayer {
  const node = TRADE_NODE_IDS[((startIndex % TRADE_NODE_IDS.length) + TRADE_NODE_IDS.length) % TRADE_NODE_IDS.length]!;
  return {
    v: 1,
    season,
    money: TRADE_START_MONEY,
    cargo: {},
    node,
    leg: null,
    level: 1,
    day: vnDay(now),
    passesUsed: 0,
    encountersToday: 0,
    encounter: null,
    legs: 0,
    tradeLegId: null,
  };
}

export const capacityOf = (p: Pick<TradePlayer, "level">) => TRADE_LEVELS[Math.min(TRADE_MAX_LEVEL, Math.max(1, p.level)) - 1]!.capacity;

export const traveling = (p: Pick<TradePlayer, "leg">, now: number) => p.leg !== null && now < p.leg.arriveAt;

export const passesLeft = (p: TradePlayer, now: number) => (p.day === vnDay(now) ? TRADE_PASSES_PER_DAY - p.passesUsed : TRADE_PASSES_PER_DAY);

/** Điểm xếp hạng: lãi so với vốn ban đầu. Hàng trong khoang và tiền đã nâng cấp không tính. */
export const tradeScore = (p: Pick<TradePlayer, "money">) => p.money - TRADE_START_MONEY;

/** Phút đi một chặng theo cấp đoàn hàng. */
export function legMinutes(edge: TradeEdge, level: number): number {
  return Math.round(TRADE_LEG_MINUTES[edge.dist] * TRADE_LEVELS[Math.min(TRADE_MAX_LEVEL, Math.max(1, level)) - 1]!.time);
}

/** Chuyển ngày: lộ phiếu về 5, không tích (Shan chốt 26/11/2026); tới nơi thì đặt nạn chờ xử lý. */
export function settle(p: TradePlayer, now: number): TradePlayer {
  let out = p;
  const today = vnDay(now);
  if (out.day !== today) out = { ...out, day: today, passesUsed: 0, encountersToday: 0 };
  if (out.leg && now >= out.leg.arriveAt && out.node !== out.leg.to) {
    const enc = out.leg.encounter;
    out = { ...out, node: out.leg.to, encounter: enc ? { kind: enc.kind, seed: enc.seed, legId: out.leg.id } : out.encounter };
  }
  return out;
}

export type TradeError =
  | "traveling"
  | "encounterPending"
  | "noRoute"
  | "noPasses"
  | "overCapacity"
  | "badAmount"
  | "noStock"
  | "noMoney"
  | "noCargo"
  | "marketFull"
  | "maxLevel"
  | "noEncounter"
  | "badActions";

export type TradeResult<T = TradePlayer> = { readonly ok: true; readonly player: T } | { readonly ok: false; readonly error: TradeError };

const fail = (error: TradeError) => ({ ok: false as const, error });

function encounterKindOf(edge: TradeEdge): EncounterKind {
  if (edge.route === "land") return "bandits";
  return edge.sea ? "storm" : "pirates";
}

const hasTreasure = (c: Cargo) => Object.entries(c).some(([id, n]) => (n ?? 0) > 0 && isTradeItem(id) && tradeItem(id).group === "treasure");

/**
 * Xuất hành sang điểm kề: tốn một lộ phiếu, khoang phải vừa sức chở. `roll` trong [0, 1) quyết định có gặp nạn,
 * `seed` là hạt giống của trận nếu gặp; cả hai do server bốc.
 */
export function depart(p0: TradePlayer, to: unknown, now: number, legId: string, roll: number, seed: number): TradeResult {
  const p = settle(p0, now);
  if (traveling(p, now)) return fail("traveling");
  if (p.encounter) return fail("encounterPending");
  if (!isTradeNode(to)) return fail("noRoute");
  const edge = tradeEdge(p.node, to);
  if (!edge) return fail("noRoute");
  if (passesLeft(p, now) <= 0) return fail("noPasses");
  if (cargoWeight(p.cargo) > capacityOf(p)) return fail("overCapacity");
  const kind = encounterKindOf(edge);
  const chance = ENCOUNTER_CHANCE[kind] + (hasTreasure(p.cargo) ? ENCOUNTER_TREASURE_BONUS : 0);
  const hit = p.encountersToday < ENCOUNTERS_PER_DAY && roll < chance;
  const leg: TradeLeg = {
    id: legId,
    from: p.node,
    to,
    departAt: now,
    arriveAt: now + legMinutes(edge, p.level) * 60_000,
    encounter: hit ? { kind, seed } : null,
  };
  return {
    ok: true,
    player: { ...p, leg, passesUsed: p.passesUsed + 1, encountersToday: p.encountersToday + (hit ? 1 : 0), legs: p.legs + 1, tradeLegId: null },
  };
}

/** Thêm hàng vào khoang (số âm là bớt); bỏ món về 0. */
export function addCargo(c: Cargo, item: TradeItemId, n: number): Cargo {
  const next = { ...c, [item]: (c[item] ?? 0) + n };
  if ((next[item] ?? 0) <= 0) delete next[item];
  return next;
}

function canTrade(p: TradePlayer, now: number): TradeError | null {
  if (traveling(p, now)) return "traveling";
  if (p.encounter) return "encounterPending";
  return null;
}

/** Mua `amount` đơn vị với giá `price` mỗi đơn vị; server kiểm tồn kho chung trước. */
export function buyGoods(p0: TradePlayer, item: TradeItemId, amount: number, price: number, stock: number, now: number): TradeResult {
  const p = settle(p0, now);
  const blocked = canTrade(p, now);
  if (blocked) return fail(blocked);
  if (!Number.isInteger(amount) || amount <= 0 || amount > 10_000) return fail("badAmount");
  if (amount > stock) return fail("noStock");
  const cost = amount * price;
  if (cost > p.money) return fail("noMoney");
  const cargo = addCargo(p.cargo, item, amount);
  if (cargoWeight(cargo) > capacityOf(p)) return fail("overCapacity");
  return { ok: true, player: { ...p, money: p.money - cost, cargo } };
}

/** Bán `amount` đơn vị với giá thu mua `price`; `room` là số chợ còn nhận trước khi ứ. */
export function sellGoods(p0: TradePlayer, item: TradeItemId, amount: number, price: number, room: number, now: number): TradeResult {
  const p = settle(p0, now);
  const blocked = canTrade(p, now);
  if (blocked) return fail(blocked);
  if (!Number.isInteger(amount) || amount <= 0) return fail("badAmount");
  if ((p.cargo[item] ?? 0) < amount) return fail("noCargo");
  if (amount > room) return fail("marketFull");
  return { ok: true, player: { ...p, money: p.money + amount * price, cargo: addCargo(p.cargo, item, -amount) } };
}

/** Nâng đoàn hàng lên cấp kế (Shan chọn giữ nâng cấp chung, 26/11/2026). Làm lại từ đầu mỗi mùa. */
export function upgrade(p0: TradePlayer, now: number): TradeResult {
  const p = settle(p0, now);
  if (p.level >= TRADE_MAX_LEVEL) return fail("maxLevel");
  const cost = TRADE_LEVELS[p.level]!.cost;
  if (cost > p.money) return fail("noMoney");
  return { ok: true, player: { ...p, level: p.level + 1, money: p.money - cost } };
}

/** Giá trị khoang theo giá gốc, để tính phần mất khi nộp mãi lộ hay thua trận. */
export function cargoValue(c: Cargo): number {
  return Object.entries(c).reduce((s, [id, n]) => s + (isTradeItem(id) ? tradeItem(id).base * (n ?? 0) : 0), 0);
}

/** Bớt hàng tới khi đủ `ratio` giá trị khoang: món đắt (kỳ trân) mất trước. Có hàng thì mất ít nhất một đơn vị. */
export function loseCargo(c: Cargo, ratio: number): { cargo: Cargo; lost: Cargo } {
  let budget = cargoValue(c) * ratio;
  let cargo = c;
  const lost: Partial<Record<TradeItemId, number>> = {};
  const order = TRADE_ITEMS.filter((i) => (c[i.id] ?? 0) > 0).sort((a, b) => b.base - a.base);
  for (const it of order) {
    if (budget <= 0) break;
    const have = cargo[it.id] ?? 0;
    const n = Math.min(have, Math.ceil(budget / it.base));
    if (n <= 0) continue;
    cargo = addCargo(cargo, it.id, -n);
    lost[it.id] = n;
    budget -= n * it.base;
  }
  return { cargo, lost };
}

/** Bàn trận của một nạn: cùng hạt giống thì cùng bàn, server dựng lại để kiểm kết quả. */
export function encounterBoard(enc: Pick<PendingEncounter, "seed">): SkState {
  return newSkirmish(enc.seed, ENCOUNTER_HP, ENCOUNTER_HP, ENCOUNTER_MOVES);
}

/** Chạy lại các nước người chơi gửi lên; Quân sư hiến kế luôn tính là đáp đúng (trận ở đây không hỏi sử). */
export function replayFight(enc: Pick<PendingEncounter, "seed">, actions: unknown): SkState | null {
  if (!Array.isArray(actions) || actions.length > MAX_FIGHT_ACTIONS) return null;
  let s = encounterBoard(enc);
  for (const raw of actions) {
    const a = parseFightAction(raw);
    if (!a) return null;
    const r = skAct(s, a);
    if (!r.ok) return null;
    s = r.state;
    if (s.phase !== "play") break;
  }
  return s;
}

function parseFightAction(v: unknown): SkAction | null {
  if (!v || typeof v !== "object") return null;
  const a = v as Record<string, unknown>;
  const pos = (x: unknown) => {
    const p = x as { row?: unknown; col?: unknown } | null;
    return p && Number.isInteger(p.row) && Number.isInteger(p.col) ? { row: p.row as number, col: p.col as number } : null;
  };
  if (a.type === "swap") {
    const from = pos(a.from);
    const to = pos(a.to);
    return from && to ? { type: "swap", from, to } : null;
  }
  if (a.type === "stratagem" && Number.isInteger(a.row)) return { type: "stratagem", row: a.row as number };
  if (a.type === "counsel") return { type: "counsel", correct: true };
  return null;
}

export type EncounterOutcome = "toll" | "won" | "lost";

/** Xử lý nạn đang chờ: nộp mãi lộ (mất 10%), hoặc đánh (thắng giữ trọn hàng, thua hay bỏ dở mất 30%). */
export function resolveEncounter(p0: TradePlayer, choice: "toll" | "fight", actions: unknown, now: number): { ok: true; player: TradePlayer; outcome: EncounterOutcome; lost: Cargo } | { ok: false; error: TradeError } {
  const p = settle(p0, now);
  if (!p.encounter) return fail("noEncounter");
  if (choice === "toll") {
    const r = loseCargo(p.cargo, TOLL_RATIO);
    return { ok: true, player: { ...p, cargo: r.cargo, encounter: null }, outcome: "toll", lost: r.lost };
  }
  const end = replayFight(p.encounter, actions);
  if (!end) return fail("badActions");
  if (end.phase === "won") return { ok: true, player: { ...p, encounter: null }, outcome: "won", lost: {} };
  const r = loseCargo(p.cargo, DEFEAT_RATIO);
  return { ok: true, player: { ...p, cargo: r.cargo, encounter: null }, outcome: "lost", lost: r.lost };
}

/** Kiểm dữ liệu đọc từ kho: hồ sơ hỏng thì coi như chưa vào mùa. */
export function parseTradePlayer(v: unknown, season: string): TradePlayer | null {
  if (!v || typeof v !== "object") return null;
  const p = v as TradePlayer;
  if (p.v !== 1 || p.season !== season || !isTradeNode(p.node) || typeof p.money !== "number") return null;
  return p;
}
