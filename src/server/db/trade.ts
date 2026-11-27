// Hành Thương Ký trên Postgres (Neon trên Vercel, PGlite trong test). Ghi đoàn hàng và dòng kho kèm điều kiện version.

import { and, count, eq, gte, inArray, lte, ne, notLike, or } from "drizzle-orm";
import { edgeKey, parseTradePlayer, TRADE_BOT_PREFIX, type Bundle, type MarketRow, type TradeLeg, type TradePlayer } from "@/core/trade";
import type { LegRecord, OfferStatus, StoredPlayer, StoredRow, TradeOffer, TradeStore } from "../trade";
import { tradeLegs, tradeMarkets, tradeOffers, tradePlayers } from "./schema";
import type { Db } from "./store";

type OfferRow = typeof tradeOffers.$inferSelect;

const toOffer = (r: OfferRow): TradeOffer => ({ ...r, give: r.give as Bundle, want: r.want as Bundle, status: r.status as OfferStatus });

/** Đọc state đã lưu; dòng hỏng (không parse được) coi như chưa có, để người chơi không kẹt. */
const toPlayer = (state: unknown, season: string): TradePlayer | null => parseTradePlayer(state, season);

export class DrizzleTradeStore implements TradeStore {
  constructor(private readonly db: Db) {}

  async getPlayer(season: string, ownerId: string): Promise<StoredPlayer | null> {
    const [row] = await this.db
      .select()
      .from(tradePlayers)
      .where(and(eq(tradePlayers.season, season), eq(tradePlayers.ownerId, ownerId)))
      .limit(1);
    const player = row ? toPlayer(row.state, season) : null;
    return row && player ? { player, version: row.version } : null;
  }

  async createPlayer(season: string, ownerId: string, player: TradePlayer, now: number): Promise<boolean> {
    const rows = await this.db
      .insert(tradePlayers)
      .values({ season, ownerId, state: player, version: 0, updatedAt: now })
      .onConflictDoNothing()
      .returning({ ownerId: tradePlayers.ownerId });
    return rows.length > 0;
  }

  async savePlayer(season: string, ownerId: string, player: TradePlayer, expected: number, now: number): Promise<boolean> {
    const rows = await this.db
      .update(tradePlayers)
      .set({ state: player, version: expected + 1, updatedAt: now })
      .where(and(eq(tradePlayers.season, season), eq(tradePlayers.ownerId, ownerId), eq(tradePlayers.version, expected)))
      .returning({ ownerId: tradePlayers.ownerId });
    return rows.length > 0;
  }

  async activeHumans(season: string, since: number): Promise<number> {
    const [row] = await this.db
      .select({ n: count() })
      .from(tradePlayers)
      .where(and(eq(tradePlayers.season, season), gte(tradePlayers.updatedAt, since), notLike(tradePlayers.ownerId, `${TRADE_BOT_PREFIX}%`)));
    return Number(row?.n ?? 0);
  }

  async players(season: string, ownerIds: readonly string[]): Promise<Map<string, TradePlayer>> {
    const out = new Map<string, TradePlayer>();
    if (ownerIds.length === 0) return out;
    const rows = await this.db
      .select({ ownerId: tradePlayers.ownerId, state: tradePlayers.state })
      .from(tradePlayers)
      .where(and(eq(tradePlayers.season, season), inArray(tradePlayers.ownerId, [...ownerIds])));
    for (const r of rows) {
      const p = toPlayer(r.state, season);
      if (p) out.set(r.ownerId, p);
    }
    return out;
  }

  async market(season: string): Promise<Map<string, StoredRow>> {
    const rows = await this.db.select().from(tradeMarkets).where(eq(tradeMarkets.season, season));
    return new Map(rows.map((r) => [r.key, { row: { stock: r.stock, slot: r.slot, slotStock: r.slotStock, prevSlotStock: r.prevSlotStock }, version: r.version }]));
  }

  async initMarket(season: string, rows: ReadonlyMap<string, MarketRow>): Promise<void> {
    const values = [...rows].map(([key, r]) => ({ season, key, ...r, version: 0 }));
    if (values.length > 0) await this.db.insert(tradeMarkets).values(values).onConflictDoNothing();
  }

  async saveRow(season: string, key: string, row: MarketRow, expected: number): Promise<boolean> {
    const rows = await this.db
      .update(tradeMarkets)
      .set({ ...row, version: expected + 1 })
      .where(and(eq(tradeMarkets.season, season), eq(tradeMarkets.key, key), eq(tradeMarkets.version, expected)))
      .returning({ key: tradeMarkets.key });
    return rows.length > 0;
  }

  async addLeg(season: string, ownerId: string, leg: TradeLeg): Promise<void> {
    const edge = edgeKey(leg.from, leg.to);
    await this.db.insert(tradeLegs).values({ id: leg.id, season, ownerId, edge, leg, departAt: leg.departAt, arriveAt: leg.arriveAt }).onConflictDoNothing();
  }

  async legsOn(season: string, edge: string, from: number, to: number, excludeOwner: string): Promise<LegRecord[]> {
    const rows = await this.db
      .select({ ownerId: tradeLegs.ownerId, leg: tradeLegs.leg })
      .from(tradeLegs)
      .where(and(eq(tradeLegs.season, season), eq(tradeLegs.edge, edge), ne(tradeLegs.ownerId, excludeOwner), lte(tradeLegs.departAt, to), gte(tradeLegs.arriveAt, from)))
      .limit(200);
    return rows.map((r) => ({ ownerId: r.ownerId, leg: r.leg as TradeLeg }));
  }

  async createOffer(o: TradeOffer): Promise<void> {
    await this.db.insert(tradeOffers).values(o);
  }

  async getOffer(id: string): Promise<TradeOffer | null> {
    const [row] = await this.db.select().from(tradeOffers).where(eq(tradeOffers.id, id)).limit(1);
    return row ? toOffer(row) : null;
  }

  async moveOffer(id: string, from: OfferStatus, to: OfferStatus, now: number): Promise<boolean> {
    const rows = await this.db
      .update(tradeOffers)
      .set({ status: to, resolvedAt: to === "pending" ? null : now })
      .where(and(eq(tradeOffers.id, id), eq(tradeOffers.status, from)))
      .returning({ id: tradeOffers.id });
    return rows.length > 0;
  }

  async pendingOffers(season: string, ownerId: string): Promise<TradeOffer[]> {
    const rows = await this.db
      .select()
      .from(tradeOffers)
      .where(and(eq(tradeOffers.season, season), eq(tradeOffers.status, "pending"), or(eq(tradeOffers.fromOwner, ownerId), eq(tradeOffers.toOwner, ownerId))));
    return rows.map(toOffer);
  }
}
