// POST /api/auth/avatar: đổi ảnh đại diện của tài khoản đã ghi danh. Thân là một trong:
// `{ hero }` chân dung một tướng quân đã có (id), `{ hero: null }` về chữ cái đầu, `{ image }` ảnh tải lên từ máy
// (`data:image/webp|png|jpeg;base64,...`, đã thu nhỏ ở trình duyệt, tối đa AVATAR_UPLOAD_MAX ký tự).
// Trả `{ avatarUrl }` hoặc `{ error }`.

import { NextResponse, type NextRequest } from "next/server";
import { AVATAR_UPLOAD_MAX, chooseAvatar, uploadAvatar } from "@/server/avatar";
import { guestOf, isSignedInAccount, loginRequiredResponse, sameOrigin } from "@/server/http";
import { accountStore, profileStore } from "@/server/store";

const noStore = { "cache-control": "no-store" };
const bad = (error: string, status: number) => NextResponse.json({ error }, { status, headers: noStore });

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return bad("badRequest", 403);
  const owner = guestOf(request);
  if (!owner || !(await isSignedInAccount(owner))) return loginRequiredResponse();
  // Đọc thân dạng chữ để chặn thân quá lớn trước khi phân tích JSON.
  const text = await request.text();
  if (text.length > AVATAR_UPLOAD_MAX + 200) return bad("tooLarge", 413);
  let body: { hero?: unknown; image?: unknown } | null;
  try {
    body = JSON.parse(text) as typeof body;
  } catch {
    return bad("badRequest", 400);
  }
  const accounts = accountStore();
  let r;
  if (typeof body?.image === "string") r = await uploadAvatar(owner, body.image, { accounts });
  else {
    const hero = body?.hero;
    if (hero !== null && (typeof hero !== "string" || hero.length > 40)) return bad("badRequest", 400);
    r = await chooseAvatar(owner, hero, { accounts, profiles: profileStore() });
  }
  return r.ok ? NextResponse.json({ avatarUrl: r.avatarUrl }, { headers: noStore }) : bad(r.error, 422);
}
