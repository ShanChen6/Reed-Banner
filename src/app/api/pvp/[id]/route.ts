// GET /api/pvp/:id: trạng thái trận PvP sau khi chạy bù tới hiện tại (hết giờ, AI tiếp quản), kèm tín hiệu còn sống của người hỏi.
// POST /api/pvp/:id `{ action: { type: "swap" | "skill" | "whirl" | "selectActor", ... } }`: ra tay. Chỉ chủ của tướng đang
// hành động đi được; chỉ đội trưởng đổi người hành động. Hết giờ không gửi qua đây, server tự xử.

import { randomInt, randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { parseAction } from "@/server/battles";
import { pvpEnabled } from "@/server/featureFlags";
import { guestOf, isSignedInAccount, loginRequiredResponse, readJson, sameOrigin } from "@/server/http";
import { pvpGetMatch, pvpPlay, type PvpDeps, type PvpMatchResult } from "@/server/pvp";
import { profileStore, pvpStore } from "@/server/store";

const noStore = { "cache-control": "no-store" };

function deps(): PvpDeps {
  return { pvp: pvpStore(), profiles: profileStore(), now: Date.now(), seed: randomInt(0, 2 ** 31), newId: () => randomUUID() };
}

function reply(r: PvpMatchResult) {
  if (r.ok) return NextResponse.json({ view: r.view, events: r.events }, { headers: noStore });
  const status = r.error === "notFound" ? 404 : r.error === "conflict" ? 409 : 422;
  return NextResponse.json({ error: r.error, ...(r.detail ? { detail: r.detail } : {}) }, { status, headers: noStore });
}

async function owner(request: NextRequest): Promise<string | NextResponse> {
  if (!pvpEnabled()) return NextResponse.json({ error: "featureDisabled" }, { status: 503, headers: noStore });
  const id = guestOf(request);
  if (!id || !(await isSignedInAccount(id))) return loginRequiredResponse();
  return id;
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const who = await owner(request);
  if (typeof who !== "string") return who;
  const { id } = await ctx.params;
  return reply(await pvpGetMatch(id, who, deps()));
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 403, headers: noStore });
  const who = await owner(request);
  if (typeof who !== "string") return who;
  const { id } = await ctx.params;
  const parsed = parseAction({ seq: 0, ...((await readJson(request)) as object | null) });
  const t = parsed?.action.type;
  if (!parsed || (t !== "swap" && t !== "skill" && t !== "whirl" && t !== "selectActor"))
    return NextResponse.json({ error: "badAction" }, { status: 400, headers: noStore });
  return reply(await pvpPlay(id, who, parsed.action as Parameters<typeof pvpPlay>[2], deps()));
}
