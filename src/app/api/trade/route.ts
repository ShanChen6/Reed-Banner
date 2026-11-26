// Hành Thương Ký (src/server/trade.ts, docs/02-game-modes/hanh-thuong-ky/gdd.md).
// GET /api/trade: đoàn hàng của mình, giá và tồn mọi chợ trong khung hiện tại, đoàn đã gặp, lời ngỏ đang chờ.
// GET /api/trade?board=1: bảng công trạng mùa này (lãi kim tiền; nơi duy nhất thấy kim tiền của người khác).
// POST /api/trade `{ action: "buy" | "sell" | "upgrade" | "depart" | "encounter" | "offer" | "withdraw" | "respond", ... }`.
// Chỉ tài khoản đăng nhập; mặc định tắt, bật bằng TRADE_ENABLED=true.

import { randomInt, randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { tradeFlag, tradeSpeed } from "@/server/featureFlags";
import { guestOf, isSignedInAccount, loginRequiredResponse, readJson, sameOrigin } from "@/server/http";
import { accountStore, seasonStore, tradeStore } from "@/server/store";
import {
  tradeBoard,
  tradeBuy,
  tradeDepart,
  tradeEncounter,
  tradeGet,
  tradeOffer,
  tradeRespond,
  tradeSell,
  tradeUpgrade,
  tradeWithdraw,
  type TradeDeps,
  type TradeServiceResult,
} from "@/server/trade";

const noStore = { "cache-control": "no-store" };

function deps(): TradeDeps {
  return {
    store: tradeStore(),
    seasons: seasonStore(),
    now: Date.now(),
    newId: () => randomUUID(),
    random: () => randomInt(0, 2 ** 30) / 2 ** 30,
    nameOf: async (id) => (await accountStore().get(id))?.name ?? `Lữ khách ${id.slice(-4)}`,
    speed: tradeSpeed(),
  };
}

async function owner(request: NextRequest): Promise<string | NextResponse> {
  if (!tradeFlag()) return NextResponse.json({ error: "featureDisabled" }, { status: 503, headers: noStore });
  const id = guestOf(request);
  if (!id || !(await isSignedInAccount(id))) return loginRequiredResponse();
  return id;
}

function reply<T extends object>(r: TradeServiceResult<T>) {
  if (r.ok) return NextResponse.json(r, { headers: noStore });
  const status = r.error === "notFound" ? 404 : r.error === "conflict" ? 409 : r.error === "notYours" ? 403 : r.error === "badRequest" ? 400 : 422;
  return NextResponse.json({ error: r.error }, { status, headers: noStore });
}

export async function GET(request: NextRequest) {
  const who = await owner(request);
  if (typeof who !== "string") return who;
  if (request.nextUrl.searchParams.has("board")) return NextResponse.json(await tradeBoard(who, seasonStore(), Date.now()), { headers: noStore });
  return reply(await tradeGet(who, deps()));
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 403, headers: noStore });
  const who = await owner(request);
  if (typeof who !== "string") return who;
  const body = (await readJson(request)) as Record<string, unknown> | null;
  const d = deps();
  switch (body?.action) {
    case "buy":
      return reply(await tradeBuy(who, body.item, body.amount, d));
    case "sell":
      return reply(await tradeSell(who, body.item, body.amount, d));
    case "upgrade":
      return reply(await tradeUpgrade(who, d));
    case "depart":
      return reply(await tradeDepart(who, body.to, d));
    case "encounter":
      return reply(await tradeEncounter(who, body.choice, body.actions, d));
    case "offer":
      return reply(await tradeOffer(who, { to: body.to, legId: body.legId, give: body.give, want: body.want }, d));
    case "withdraw":
      return reply(await tradeWithdraw(who, body.offerId, d));
    case "respond":
      return reply(await tradeRespond(who, body.offerId, body.accept, d));
    default:
      return NextResponse.json({ error: "badRequest" }, { status: 400, headers: noStore });
  }
}
