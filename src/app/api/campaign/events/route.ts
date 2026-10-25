// POST /api/campaign/events: hoàn thành nhiệm vụ Campaign V2 không có trận (tạo khách nếu chưa có, như
// /api/profile và /api/battles, để hồ sơ mới vào thẳng M01 được).

import { NextResponse, type NextRequest } from "next/server";
import {
  campaignEventHttpStatus,
  completeCampaignEvent,
  parseCampaignEventInput,
} from "@/server/campaignEvents";
import { guestOf, newGuestId, readJson, setAccountCookie } from "@/server/http";
import { profileStore } from "@/server/store";

export async function POST(request: NextRequest) {
  const input = parseCampaignEventInput(await readJson(request));
  if (!input)
    return NextResponse.json(
      { error: "badRequest" },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  const existing = guestOf(request);
  const ownerId = existing ?? newGuestId();
  const result = await completeCampaignEvent(
    profileStore(),
    ownerId,
    input,
    Date.now(),
  );
  const res = result.ok
    ? NextResponse.json(result, {
        headers: { "cache-control": "no-store" },
      })
    : NextResponse.json(
        { error: result.error },
        {
          status: campaignEventHttpStatus(result.error),
          headers: { "cache-control": "no-store" },
        },
      );
  if (!existing) setAccountCookie(res, ownerId);
  return res;
}
