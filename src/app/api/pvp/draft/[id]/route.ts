// GET /api/pvp/draft/:id: phiên cấm chọn 3vs3 xếp hạng sau khi chạy bù các lượt quá hạn; xong thì có `matchId` của trận.
// POST /api/pvp/draft/:id `{ type: "ban", ban: { kind, id | value } } | { type: "pick", hero, element?, profession? }`;
// khi chuẩn bị: `{ type: "swap", a, b }` (đội trưởng đổi chỗ hai vị trí) và `{ type: "ready" }`.
// Chỉ người đang tới lượt làm được; hết giờ máy tự cấm ngẫu nhiên hoặc chọn thay.

import { randomInt, randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { ELEMENTS, PROFESSIONS, type DraftBan, type Element, type Profession } from "@/core";
import { pvpEnabled } from "@/server/featureFlags";
import { guestOf, isSignedInAccount, loginRequiredResponse, readJson, sameOrigin } from "@/server/http";
import type { PvpDeps } from "@/server/pvp";
import { pvpDraftGet, pvpDraftPlay, type PvpDraftAction, type PvpDraftResult } from "@/server/pvpDraft";
import { profileStore, pvpStore, seasonStore } from "@/server/store";

const noStore = { "cache-control": "no-store" };

function deps(): PvpDeps {
  return { pvp: pvpStore(), profiles: profileStore(), seasons: seasonStore(), now: Date.now(), seed: randomInt(0, 2 ** 31), newId: () => randomUUID() };
}

function reply(r: PvpDraftResult) {
  if (r.ok) return NextResponse.json({ view: r.view }, { headers: noStore });
  const status = r.error === "notFound" ? 404 : r.error === "conflict" ? 409 : 422;
  return NextResponse.json({ error: r.error }, { status, headers: noStore });
}

async function owner(request: NextRequest): Promise<string | NextResponse> {
  if (!pvpEnabled()) return NextResponse.json({ error: "featureDisabled" }, { status: 503, headers: noStore });
  const id = guestOf(request);
  if (!id || !(await isSignedInAccount(id))) return loginRequiredResponse();
  return id;
}

function parse(body: unknown): PvpDraftAction | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  if (b.type === "pick" && typeof b.hero === "string") {
    return {
      type: "pick",
      hero: b.hero,
      ...(ELEMENTS.includes(b.element as Element) ? { element: b.element as Element } : {}),
      ...(PROFESSIONS.includes(b.profession as Profession) ? { profession: b.profession as Profession } : {}),
    };
  }
  if (b.type === "ready") return { type: "ready" };
  if (b.type === "swap" && Number.isInteger(b.a) && Number.isInteger(b.b)) return { type: "swap", a: b.a as number, b: b.b as number };
  if (b.type === "ban" && typeof b.ban === "object" && b.ban !== null) {
    const ban = b.ban as Record<string, unknown>;
    if (ban.kind === "hero" && typeof ban.id === "string") return { type: "ban", ban: { kind: "hero", id: ban.id } satisfies DraftBan };
    if (ban.kind === "element" && ELEMENTS.includes(ban.value as Element)) return { type: "ban", ban: { kind: "element", value: ban.value as Element } };
    if (ban.kind === "profession" && PROFESSIONS.includes(ban.value as Profession)) return { type: "ban", ban: { kind: "profession", value: ban.value as Profession } };
  }
  return null;
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const who = await owner(request);
  if (typeof who !== "string") return who;
  const { id } = await ctx.params;
  return reply(await pvpDraftGet(id, who, deps()));
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 403, headers: noStore });
  const who = await owner(request);
  if (typeof who !== "string") return who;
  const { id } = await ctx.params;
  const action = parse(await readJson(request));
  if (!action) return NextResponse.json({ error: "badAction" }, { status: 400, headers: noStore });
  return reply(await pvpDraftPlay(id, who, action, deps()));
}
