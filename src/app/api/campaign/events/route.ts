import { NextResponse, type NextRequest } from "next/server";
import {
  campaignEventHttpStatus,
  completeCampaignEvent,
  parseCampaignEventInput,
} from "@/server/campaignEvents";
import { guestOf, readJson } from "@/server/http";
import { profileStore } from "@/server/store";

export async function POST(request: NextRequest) {
  const ownerId = guestOf(request);
  if (!ownerId)
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  const input = parseCampaignEventInput(await readJson(request));
  if (!input)
    return NextResponse.json(
      { error: "badRequest" },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  const result = await completeCampaignEvent(
    profileStore(),
    ownerId,
    input,
    Date.now(),
  );
  return result.ok
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
}
