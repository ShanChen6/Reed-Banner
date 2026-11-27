// Hành Thương Ký trên server (Shan duyệt thiết kế 26/11/2026): kho chung, giá theo khung 2 giờ, đoàn hàng của từng người,
// giao thương giữa đường và điểm mùa tuần. Luật ở docs/02-game-modes/hanh-thuong-ky/gdd.md, logic thuần ở @/core/trade.
// Server là nguồn sự thật: mọi lần ghi kèm điều kiện version, đụng nhau thì đọc lại và làm lại (tối đa vài lần).
// Kim tiền của người khác không bao giờ trả về, trừ điểm lãi trên bảng mùa ở Công Trạng (Shan, 26/11/2026).

import {
  advanceRow,
  buyGoods,
  bundleEmpty,
  capacityOf,
  cargoWeight,
  depart,
  edgeKey,
  fitsAfter,
  giveBundle,
  hasBundle,
  initialMarket,
  isTradeItem,
  legsMeet,
  marketKey,
  MARKET_ITEMS,
  MEET_LIMIT,
  MEET_OVERLAP_MS,
  marketSeason,
  nextSlotAt,
  normalSpeed,
  parseBundle,
  parseTradePlayer,
  presenceAt,
  passesLeft,
  quote,
  resolveEncounter,
  sellGoods,
  settle,
  stockCap,
  takeBundle,
  tradeScore,
  tradeSlot,
  traveling,
  TRADE_NODE_IDS,
  upgrade,
  newTradePlayer,
  type Bundle,
  type Cargo,
  type EncounterOutcome,
  type MarketQuote,
  type MarketRow,
  type TradeError,
  type TradeItemId,
  type TradeLeg,
  type TradeNodeId,
  type TradePlayer,
} from "@/core/trade";
import { vnWeek } from "@/core/vnTime";
import { recordSeason, seasonBoardView, type SeasonBoardView, type SeasonStore } from "./seasons";

export interface StoredPlayer {
  readonly player: TradePlayer;
  readonly version: number;
}

export interface StoredRow {
  readonly row: MarketRow;
  readonly version: number;
}

export type OfferStatus = "pending" | "accepted" | "declined" | "cancelled";

export interface TradeOffer {
  readonly id: string;
  readonly season: string;
  readonly fromOwner: string;
  readonly toOwner: string;
  readonly fromLeg: string;
  readonly toLeg: string;
  readonly give: Bundle;
  readonly want: Bundle;
  readonly status: OfferStatus;
  readonly createdAt: number;
  readonly resolvedAt: number | null;
}

export interface LegRecord {
  readonly ownerId: string;
  readonly leg: TradeLeg;
}

export interface TradeStore {
  getPlayer(season: string, ownerId: string): Promise<StoredPlayer | null>;
  /** Tạo đoàn hàng đầu mùa; false khi đã có (hai request cùng lúc). */
  createPlayer(season: string, ownerId: string, player: TradePlayer, now: number): Promise<boolean>;
  /** Ghi khi version đang lưu đúng bằng `expected`. */
  savePlayer(season: string, ownerId: string, player: TradePlayer, expected: number, now: number): Promise<boolean>;
  players(season: string, ownerIds: readonly string[]): Promise<Map<string, TradePlayer>>;
  /** Mọi dòng kho của mùa (khóa `node:item`); rỗng khi mùa chưa mở. */
  market(season: string): Promise<Map<string, StoredRow>>;
  /** Mở kho đầu mùa, bỏ qua dòng đã có. */
  initMarket(season: string, rows: ReadonlyMap<string, MarketRow>): Promise<void>;
  saveRow(season: string, key: string, row: MarketRow, expected: number): Promise<boolean>;
  addLeg(season: string, ownerId: string, leg: TradeLeg): Promise<void>;
  /** Chặng của người khác trên cùng cạnh, chồng lên khoảng giờ [from, to]. */
  legsOn(season: string, edge: string, from: number, to: number, excludeOwner: string): Promise<LegRecord[]>;
  createOffer(o: TradeOffer): Promise<void>;
  getOffer(id: string): Promise<TradeOffer | null>;
  /** Đổi trạng thái khi đang là `from`; false khi đã có request khác xử trước. */
  moveOffer(id: string, from: OfferStatus, to: OfferStatus, now: number): Promise<boolean>;
  /** Lời ngỏ đang chờ có người này ở một trong hai bên. */
  pendingOffers(season: string, ownerId: string): Promise<TradeOffer[]>;
}

export class MemoryTradeStore implements TradeStore {
  private readonly playerRows = new Map<string, StoredPlayer>();
  private readonly marketRows = new Map<string, Map<string, StoredRow>>();
  private readonly legRows: (LegRecord & { season: string; edge: string })[] = [];
  private readonly offerRows = new Map<string, TradeOffer>();
  private readonly pk = (s: string, o: string) => `${s}|${o}`;

  async getPlayer(season: string, ownerId: string) {
    const r = this.playerRows.get(this.pk(season, ownerId));
    return r ? structuredClone(r) : null;
  }

  async createPlayer(season: string, ownerId: string, player: TradePlayer) {
    const k = this.pk(season, ownerId);
    if (this.playerRows.has(k)) return false;
    this.playerRows.set(k, { player: structuredClone(player), version: 0 });
    return true;
  }

  async savePlayer(season: string, ownerId: string, player: TradePlayer, expected: number) {
    const k = this.pk(season, ownerId);
    const cur = this.playerRows.get(k);
    if (!cur || cur.version !== expected) return false;
    this.playerRows.set(k, { player: structuredClone(player), version: expected + 1 });
    return true;
  }

  async players(season: string, ownerIds: readonly string[]) {
    const out = new Map<string, TradePlayer>();
    for (const id of ownerIds) {
      const r = this.playerRows.get(this.pk(season, id));
      if (r) out.set(id, structuredClone(r.player));
    }
    return out;
  }

  async market(season: string) {
    return new Map([...(this.marketRows.get(season) ?? new Map<string, StoredRow>())].map(([k, v]) => [k, { ...v, row: { ...v.row } }]));
  }

  async initMarket(season: string, rows: ReadonlyMap<string, MarketRow>) {
    const m = this.marketRows.get(season) ?? new Map<string, StoredRow>();
    for (const [k, row] of rows) if (!m.has(k)) m.set(k, { row: { ...row }, version: 0 });
    this.marketRows.set(season, m);
  }

  async saveRow(season: string, key: string, row: MarketRow, expected: number) {
    const m = this.marketRows.get(season);
    const cur = m?.get(key);
    if (!m || !cur || cur.version !== expected) return false;
    m.set(key, { row: { ...row }, version: expected + 1 });
    return true;
  }

  async addLeg(season: string, ownerId: string, leg: TradeLeg) {
    this.legRows.push({ season, ownerId, leg: structuredClone(leg), edge: edgeKey(leg.from, leg.to) });
  }

  async legsOn(season: string, edge: string, from: number, to: number, excludeOwner: string) {
    return this.legRows
      .filter((l) => l.season === season && l.edge === edge && l.ownerId !== excludeOwner && l.leg.departAt <= to && l.leg.arriveAt >= from)
      .map((l) => ({ ownerId: l.ownerId, leg: structuredClone(l.leg) }));
  }

  async createOffer(o: TradeOffer) {
    this.offerRows.set(o.id, structuredClone(o));
  }

  async getOffer(id: string) {
    const o = this.offerRows.get(id);
    return o ? structuredClone(o) : null;
  }

  async moveOffer(id: string, from: OfferStatus, to: OfferStatus, now: number) {
    const o = this.offerRows.get(id);
    if (!o || o.status !== from) return false;
    this.offerRows.set(id, { ...o, status: to, resolvedAt: to === "pending" ? null : now });
    return true;
  }

  async pendingOffers(season: string, ownerId: string) {
    return [...this.offerRows.values()]
      .filter((o) => o.season === season && o.status === "pending" && (o.fromOwner === ownerId || o.toOwner === ownerId))
      .map((o) => structuredClone(o));
  }
}

export interface TradeDeps {
  readonly store: TradeStore;
  readonly seasons?: SeasonStore;
  readonly now: number;
  readonly newId: () => string;
  /** Số thực ngẫu nhiên trong [0, 1) (server dùng crypto). */
  readonly random: () => number;
  readonly nameOf: (ownerId: string) => Promise<string>;
  /** Tăng tốc khi thử (TRADE_SPEED): khung giá, đường đi ngắn lại, lộ phiếu nhiều hơn. Bỏ trống là giờ thật. */
  readonly speed?: number;
}

export type TradeServiceError = TradeError | "notSold" | "conflict" | "badRequest" | "notFound" | "noMeeting" | "alreadyTraded" | "offerGone" | "notYours";

export type TradeServiceResult<T = object> = ({ readonly ok: true } & T & { readonly view: TradeView }) | { readonly ok: false; readonly error: TradeServiceError };

const RETRIES = 4;
export const tradeSeason = (now: number) => vnWeek(now);
/** Khóa kho của mùa (chạy thử có kho riêng) và khung giá hiện tại theo tốc độ. */
const mSeason = (deps: TradeDeps) => marketSeason(tradeSeason(deps.now), deps.speed);
const slotNow = (deps: TradeDeps) => tradeSlot(deps.now, deps.speed);

// ── Đọc và ghi đoàn hàng ──

async function loadPlayer(ownerId: string, deps: TradeDeps): Promise<StoredPlayer> {
  const season = tradeSeason(deps.now);
  for (let i = 0; i < RETRIES; i++) {
    const got = await deps.store.getPlayer(season, ownerId);
    const parsed = got ? parseTradePlayer(got.player, season) : null;
    if (got && parsed) return { player: parsed, version: got.version };
    if (!got) {
      // Đầu mùa: điểm xuất phát ngẫu nhiên cho mỗi người (Shan chốt 26/11/2026).
      const p = newTradePlayer(season, Math.floor(deps.random() * TRADE_NODE_IDS.length), deps.now);
      await deps.store.createPlayer(season, ownerId, p, deps.now);
    }
  }
  throw new Error("Không mở được đoàn hàng");
}

/** Sửa đoàn hàng của một người có thử lại khi đụng; ghi điểm mùa theo phần kim tiền đổi. */
async function mutatePlayer<E extends string>(
  ownerId: string,
  deps: TradeDeps,
  fn: (p: TradePlayer) => { ok: true; player: TradePlayer } | { ok: false; error: E },
): Promise<{ ok: true; player: TradePlayer; before: TradePlayer } | { ok: false; error: E | "conflict" }> {
  const season = tradeSeason(deps.now);
  for (let i = 0; i < RETRIES; i++) {
    const cur = await loadPlayer(ownerId, deps);
    const r = fn(cur.player);
    if (!r.ok) return r;
    if (await deps.store.savePlayer(season, ownerId, r.player, cur.version, deps.now)) {
      await scoreChange(ownerId, cur.player, r.player, deps);
      return { ok: true, player: r.player, before: cur.player };
    }
  }
  return { ok: false, error: "conflict" };
}

async function scoreChange(ownerId: string, before: TradePlayer, after: TradePlayer, deps: TradeDeps): Promise<void> {
  const delta = tradeScore(after) - tradeScore(before);
  if (delta !== 0) await recordSeason(deps.seasons, { mode: "trade", ownerId, now: deps.now, add: delta });
}

// ── Kho chung ──

async function loadMarket(deps: TradeDeps): Promise<Map<string, StoredRow>> {
  const season = mSeason(deps);
  let m = await deps.store.market(season);
  const want = initialMarket(slotNow(deps), season);
  // Kho mùa đang chạy thiếu dòng (món mới hay món đổi mã) thì bổ sung; dòng đã có giữ nguyên.
  if ([...want.keys()].some((k) => !m.has(k))) {
    await deps.store.initMarket(season, want);
    m = await deps.store.market(season);
  }
  // Dòng của mã cũ còn trong kho thì bỏ qua.
  for (const k of m.keys()) if (!want.has(k)) m.delete(k);
  return m;
}

const rowNow = (deps: TradeDeps, node: TradeNodeId, item: TradeItemId, r: StoredRow) => advanceRow(mSeason(deps), node, item, r.row, slotNow(deps));

/** Đổi tồn một dòng kho (dương là thêm), có thử lại; `check` từ chối khi không đủ hàng hay chợ đã ứ. */
async function changeStock(deps: TradeDeps, node: TradeNodeId, item: TradeItemId, delta: number): Promise<boolean> {
  const season = mSeason(deps);
  const key = marketKey(node, item);
  for (let i = 0; i < RETRIES; i++) {
    const r = (await loadMarket(deps)).get(key);
    if (!r) return false;
    const row = rowNow(deps, node, item, r);
    const stock = row.stock + delta;
    if (stock < 0) return false;
    if (await deps.store.saveRow(season, key, { ...row, stock }, r.version)) return true;
  }
  return false;
}

// ── Bản xem gửi về trình duyệt ──

export interface OtherCaravan {
  readonly ownerId: string;
  readonly name: string;
  readonly legId: string;
  readonly cargo: Cargo;
  readonly weight: number;
  readonly capacity: number;
  /** Người đó đã dùng chặng này cho một giao dịch khác. */
  readonly busy: boolean;
}

export interface OfferView {
  readonly id: string;
  readonly fromName: string;
  readonly toName: string;
  readonly mine: boolean;
  readonly give: Bundle;
  readonly want: Bundle;
  /** Khoang của bên kia (người nhận xem được khoang bên ngỏ và ngược lại), không có kim tiền. */
  readonly otherCargo: Cargo;
  readonly createdAt: number;
}

export interface TradeView {
  readonly season: string;
  readonly now: number;
  readonly slot: number;
  readonly nextSlotAt: number;
  /** 1 là giờ thật; lớn hơn là đang chạy thử nhanh. */
  readonly speed: number;
  readonly player: {
    readonly money: number;
    readonly cargo: Cargo;
    readonly weight: number;
    readonly capacity: number;
    readonly level: number;
    readonly node: TradeNodeId;
    readonly leg: TradeLeg | null;
    readonly traveling: boolean;
    readonly passesLeft: number;
    readonly encounter: { readonly kind: string; readonly seed: number } | null;
    readonly legs: number;
    readonly canOffer: boolean;
    readonly score: number;
  };
  /** Giá và tồn các món đang bày ở mọi điểm trong khung hiện tại (Shan, 26/11/2026: xem được giá các vùng, không xem khung sau). */
  readonly markets: Readonly<Record<TradeNodeId, readonly MarketQuote[]>>;
  readonly met: readonly OtherCaravan[];
  readonly offers: readonly OfferView[];
}

async function buildView(ownerId: string, deps: TradeDeps, preset?: TradePlayer): Promise<TradeView> {
  const season = tradeSeason(deps.now);
  const player = settle(preset ?? (await loadPlayer(ownerId, deps)).player, deps.now);
  const market = await loadMarket(deps);
  const markets = {} as Record<TradeNodeId, MarketQuote[]>;
  const ms = mSeason(deps);
  for (const node of TRADE_NODE_IDS) {
    const shown = presenceAt(ms, node, slotNow(deps));
    markets[node] = MARKET_ITEMS.flatMap((item) => {
      const r = shown.has(item) ? market.get(marketKey(node, item)) : undefined;
      return r ? [quote(ms, node, item, rowNow(deps, node, item, r))] : [];
    });
  }
  const met = await meetings(ownerId, player, deps);
  const pending = await deps.store.pendingOffers(season, ownerId);
  const others = await deps.store.players(season, [...new Set(pending.flatMap((o) => [o.fromOwner, o.toOwner]))].filter((id) => id !== ownerId));
  const offers: OfferView[] = [];
  for (const o of pending) {
    const mine = o.fromOwner === ownerId;
    const other = mine ? o.toOwner : o.fromOwner;
    offers.push({
      id: o.id,
      fromName: mine ? await deps.nameOf(ownerId) : await deps.nameOf(other),
      toName: mine ? await deps.nameOf(other) : await deps.nameOf(ownerId),
      mine,
      give: o.give,
      want: o.want,
      otherCargo: others.get(other)?.cargo ?? {},
      createdAt: o.createdAt,
    });
  }
  return {
    season,
    now: deps.now,
    slot: slotNow(deps),
    nextSlotAt: nextSlotAt(deps.now, deps.speed),
    speed: normalSpeed(deps.speed),
    player: {
      money: player.money,
      cargo: player.cargo,
      weight: cargoWeight(player.cargo),
      capacity: capacityOf(player),
      level: player.level,
      node: player.node,
      leg: player.leg,
      traveling: traveling(player, deps.now),
      passesLeft: passesLeft(player, deps.now, deps.speed),
      encounter: player.encounter ? { kind: player.encounter.kind, seed: player.encounter.seed } : null,
      legs: player.legs,
      canOffer: canOfferNow(player, deps.now),
      score: tradeScore(player),
    },
    markets,
    met,
    offers,
  };
}

const canOfferNow = (p: TradePlayer, now: number) => p.leg !== null && !traveling(p, now) && !p.encounter && p.tradeLegId === null && p.node === p.leg.to;

/** Đoàn đã gặp trên chặng gần nhất (chặng đó còn là chặng hiện tại của họ thì mới giao dịch được). */
async function meetings(ownerId: string, p: TradePlayer, deps: TradeDeps): Promise<OtherCaravan[]> {
  if (!p.leg) return [];
  const season = tradeSeason(deps.now);
  const legs = await deps.store.legsOn(season, edgeKey(p.leg.from, p.leg.to), p.leg.departAt + MEET_OVERLAP_MS, p.leg.arriveAt - MEET_OVERLAP_MS, ownerId);
  const hits = legs.filter((l) => legsMeet(p.leg!, l.leg));
  const players = await deps.store.players(season, [...new Set(hits.map((h) => h.ownerId))]);
  const out: OtherCaravan[] = [];
  for (const h of hits) {
    const other = players.get(h.ownerId);
    // Chỉ còn giao dịch được khi chặng gặp nhau vẫn là chặng gần nhất của họ.
    if (!other || other.leg?.id !== h.leg.id || out.some((o) => o.ownerId === h.ownerId)) continue;
    out.push({
      ownerId: h.ownerId,
      name: await deps.nameOf(h.ownerId),
      legId: h.leg.id,
      cargo: other.cargo,
      weight: cargoWeight(other.cargo),
      capacity: capacityOf(other),
      busy: other.tradeLegId === h.leg.id,
    });
    if (out.length >= MEET_LIMIT) break;
  }
  return out;
}

export async function tradeGet(ownerId: string, deps: TradeDeps): Promise<TradeServiceResult> {
  // Ghi lại khi vừa tới nơi hay sang ngày, để trạng thái lưu khớp với bản xem.
  const r = await mutatePlayer<never>(ownerId, deps, (p) => ({ ok: true, player: settle(p, deps.now) }));
  if (!r.ok) return r;
  return { ok: true, view: await buildView(ownerId, deps, r.player) };
}

// ── Mua, bán, nâng cấp ──

/** Chợ không bày món này trong phiên thì không mua, không bán. */
const offered = (deps: TradeDeps, node: TradeNodeId, item: TradeItemId) => presenceAt(mSeason(deps), node, slotNow(deps)).has(item);

export async function tradeBuy(ownerId: string, item: unknown, amount: unknown, deps: TradeDeps): Promise<TradeServiceResult> {
  if (!isTradeItem(item) || !Number.isInteger(amount)) return { ok: false, error: "badRequest" };
  const n = amount as number;
  for (let i = 0; i < RETRIES; i++) {
    const cur = await loadPlayer(ownerId, deps);
    const p = settle(cur.player, deps.now);
    if (!traveling(p, deps.now) && !offered(deps, p.node, item)) return { ok: false, error: "notSold" };
    const r = (await loadMarket(deps)).get(marketKey(p.node, item));
    if (!r) return { ok: false, error: "notFound" };
    const row = rowNow(deps, p.node, item, r);
    const q = quote(mSeason(deps), p.node, item, row);
    const next = buyGoods(p, item, n, q.buy, row.stock, deps.now);
    if (!next.ok) return next;
    if (!(await deps.store.saveRow(mSeason(deps), marketKey(p.node, item), { ...row, stock: row.stock - n }, r.version))) continue;
    if (await deps.store.savePlayer(tradeSeason(deps.now), ownerId, next.player, cur.version, deps.now)) {
      await scoreChange(ownerId, cur.player, next.player, deps);
      return { ok: true, view: await buildView(ownerId, deps, next.player) };
    }
    await changeStock(deps, p.node, item, n);
  }
  return { ok: false, error: "conflict" };
}

export async function tradeSell(ownerId: string, item: unknown, amount: unknown, deps: TradeDeps): Promise<TradeServiceResult> {
  if (!isTradeItem(item) || !Number.isInteger(amount)) return { ok: false, error: "badRequest" };
  const n = amount as number;
  for (let i = 0; i < RETRIES; i++) {
    const cur = await loadPlayer(ownerId, deps);
    const p = settle(cur.player, deps.now);
    if (!traveling(p, deps.now) && !offered(deps, p.node, item)) return { ok: false, error: "notSold" };
    const r = (await loadMarket(deps)).get(marketKey(p.node, item));
    if (!r) return { ok: false, error: "notFound" };
    const row = rowNow(deps, p.node, item, r);
    const q = quote(mSeason(deps), p.node, item, row);
    const next = sellGoods(p, item, n, q.sell, Math.max(0, stockCap(item, p.node) - row.stock), deps.now);
    if (!next.ok) return next;
    if (!(await deps.store.saveRow(mSeason(deps), marketKey(p.node, item), { ...row, stock: row.stock + n }, r.version))) continue;
    if (await deps.store.savePlayer(tradeSeason(deps.now), ownerId, next.player, cur.version, deps.now)) {
      await scoreChange(ownerId, cur.player, next.player, deps);
      return { ok: true, view: await buildView(ownerId, deps, next.player) };
    }
    await changeStock(deps, p.node, item, -n);
  }
  return { ok: false, error: "conflict" };
}

export async function tradeUpgrade(ownerId: string, deps: TradeDeps): Promise<TradeServiceResult> {
  const r = await mutatePlayer(ownerId, deps, (p) => upgrade(p, deps.now));
  return r.ok ? { ok: true, view: await buildView(ownerId, deps, r.player) } : r;
}

// ── Đi đường và nạn ──

export async function tradeDepart(ownerId: string, to: unknown, deps: TradeDeps): Promise<TradeServiceResult> {
  // Xuất hành chặng mới thì mọi lời ngỏ đang chờ có mình ở một bên đều tự hủy (Shan, 26/11/2026).
  const pre = settle((await loadPlayer(ownerId, deps)).player, deps.now);
  if (traveling(pre, deps.now)) return { ok: false, error: "traveling" };
  if (pre.encounter) return { ok: false, error: "encounterPending" };
  await cancelPendingOffers(ownerId, deps);
  const legId = deps.newId();
  const roll = deps.random();
  const seed = 1 + Math.floor(deps.random() * 0x7ffffffe);
  const r = await mutatePlayer(ownerId, deps, (p) => depart(p, to, deps.now, legId, roll, seed, deps.speed));
  if (!r.ok) return r;
  await deps.store.addLeg(tradeSeason(deps.now), ownerId, r.player.leg!);
  return { ok: true, view: await buildView(ownerId, deps, r.player) };
}

export async function tradeEncounter(ownerId: string, choice: unknown, actions: unknown, deps: TradeDeps): Promise<TradeServiceResult<{ outcome: EncounterOutcome; lost: Cargo }>> {
  if (choice !== "toll" && choice !== "fight") return { ok: false, error: "badRequest" };
  let outcome: EncounterOutcome = "toll";
  let lost: Cargo = {};
  const r = await mutatePlayer(ownerId, deps, (p) => {
    const res = resolveEncounter(p, choice, actions, deps.now);
    if (!res.ok) return res;
    outcome = res.outcome;
    lost = res.lost;
    return { ok: true, player: res.player };
  });
  return r.ok ? { ok: true, outcome, lost, view: await buildView(ownerId, deps, r.player) } : r;
}

// ── Giao thương giữa đường ──

async function returnEscrow(o: TradeOffer, deps: TradeDeps): Promise<void> {
  const r = await mutatePlayer(o.fromOwner, deps, (p) => ({
    ok: true,
    player: { ...giveBundle(p, o.give), tradeLegId: p.tradeLegId === o.fromLeg ? null : p.tradeLegId },
  }));
  if (!r.ok) console.error("Không trả được hàng khóa của lời ngỏ", o.id);
}

async function cancelPendingOffers(ownerId: string, deps: TradeDeps): Promise<void> {
  for (const o of await deps.store.pendingOffers(tradeSeason(deps.now), ownerId))
    if (await deps.store.moveOffer(o.id, "pending", "cancelled", deps.now)) await returnEscrow(o, deps);
}

export async function tradeOffer(ownerId: string, body: { to?: unknown; legId?: unknown; give?: unknown; want?: unknown }, deps: TradeDeps): Promise<TradeServiceResult> {
  const give = parseBundle(body.give);
  const want = parseBundle(body.want);
  if (typeof body.to !== "string" || typeof body.legId !== "string" || !give || !want || body.to === ownerId) return { ok: false, error: "badRequest" };
  if (bundleEmpty(give) && bundleEmpty(want)) return { ok: false, error: "badAmount" };
  const season = tradeSeason(deps.now);
  const me = settle((await loadPlayer(ownerId, deps)).player, deps.now);
  const met = await meetings(ownerId, me, deps);
  const other = met.find((m) => m.ownerId === body.to && m.legId === body.legId);
  if (!other || !canOfferNow(me, deps.now)) return { ok: false, error: "noMeeting" };
  if (other.busy) return { ok: false, error: "alreadyTraded" };
  const fromLeg = me.leg!.id;
  const r = await mutatePlayer<TradeServiceError>(ownerId, deps, (p0) => {
    const p = settle(p0, deps.now);
    if (!canOfferNow(p, deps.now) || p.leg?.id !== fromLeg) return { ok: false, error: "alreadyTraded" };
    if (!hasBundle(p, give)) return { ok: false, error: "noCargo" };
    if (!fitsAfter(p, give, want)) return { ok: false, error: "overCapacity" };
    return { ok: true, player: { ...takeBundle(p, give), tradeLegId: fromLeg } };
  });
  if (!r.ok) return r;
  await deps.store.createOffer({ id: deps.newId(), season, fromOwner: ownerId, toOwner: other.ownerId, fromLeg, toLeg: other.legId, give, want, status: "pending", createdAt: deps.now, resolvedAt: null });
  return { ok: true, view: await buildView(ownerId, deps, r.player) };
}

/** Rút lời ngỏ của mình (trả hàng khóa, được ngỏ lại trên chặng này). */
export async function tradeWithdraw(ownerId: string, offerId: unknown, deps: TradeDeps): Promise<TradeServiceResult> {
  const o = typeof offerId === "string" ? await deps.store.getOffer(offerId) : null;
  if (!o || o.status !== "pending") return { ok: false, error: "offerGone" };
  if (o.fromOwner !== ownerId) return { ok: false, error: "notYours" };
  if (await deps.store.moveOffer(o.id, "pending", "cancelled", deps.now)) await returnEscrow(o, deps);
  return { ok: true, view: await buildView(ownerId, deps) };
}

export async function tradeRespond(ownerId: string, offerId: unknown, accept: unknown, deps: TradeDeps): Promise<TradeServiceResult> {
  const o = typeof offerId === "string" ? await deps.store.getOffer(offerId) : null;
  if (!o || o.status !== "pending" || o.season !== tradeSeason(deps.now)) return { ok: false, error: "offerGone" };
  if (o.toOwner !== ownerId) return { ok: false, error: "notYours" };
  if (accept !== true) {
    if (await deps.store.moveOffer(o.id, "pending", "declined", deps.now)) await returnEscrow(o, deps);
    return { ok: true, view: await buildView(ownerId, deps) };
  }
  const me = settle((await loadPlayer(ownerId, deps)).player, deps.now);
  if (me.leg?.id !== o.toLeg) {
    // Mình đã xuất hành chặng khác: lời ngỏ hết hiệu lực.
    if (await deps.store.moveOffer(o.id, "pending", "cancelled", deps.now)) await returnEscrow(o, deps);
    return { ok: false, error: "offerGone" };
  }
  if (me.tradeLegId !== null) return { ok: false, error: "alreadyTraded" };
  if (me.encounter) return { ok: false, error: "encounterPending" };
  if (!hasBundle(me, o.want)) return { ok: false, error: "noCargo" };
  if (!fitsAfter(me, o.want, o.give)) return { ok: false, error: "overCapacity" };
  if (!(await deps.store.moveOffer(o.id, "pending", "accepted", deps.now))) return { ok: false, error: "offerGone" };
  const mine = await mutatePlayer<TradeServiceError>(ownerId, deps, (p0) => {
    const p = settle(p0, deps.now);
    if (p.leg?.id !== o.toLeg || p.tradeLegId !== null) return { ok: false, error: "alreadyTraded" };
    if (!hasBundle(p, o.want)) return { ok: false, error: "noCargo" };
    return { ok: true, player: { ...giveBundle(takeBundle(p, o.want), o.give), tradeLegId: o.toLeg } };
  });
  if (!mine.ok) {
    // Không đổi được (vừa bán mất hàng, đụng request khác): trả lời ngỏ về chờ như cũ.
    await deps.store.moveOffer(o.id, "accepted", "pending", deps.now);
    return mine;
  }
  const theirs = await mutatePlayer(o.fromOwner, deps, (p) => ({ ok: true, player: giveBundle(p, o.want) }));
  if (!theirs.ok) console.error("Không giao được hàng cho bên ngỏ", o.id);
  return { ok: true, view: await buildView(ownerId, deps, mine.player) };
}

export async function tradeBoard(ownerId: string | null, seasons: SeasonStore, now: number): Promise<SeasonBoardView> {
  return seasonBoardView(seasons, "trade", tradeSeason(now), ownerId);
}
