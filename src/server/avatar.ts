// Ảnh đại diện tự chọn (Shan 18–19/11/2026): chân dung một tướng quân người chơi đã có (Đinh Bộ Lĩnh hoặc tướng kèm
// trong hồ sơ), ảnh tải lên từ máy, hoặc bỏ để về chữ cái đầu. Server kiểm tra quyền sở hữu và định dạng ảnh.

import { MAIN_ID, ownsCompanion } from "@/core";
import { portraitUrl } from "@/app/game/art/portrait-data";
import type { AccountStore } from "./accounts";
import { loadProfile, type ProfileStore } from "./profiles";

export type AvatarError = "notOwned" | "noPortrait" | "noAccount" | "badImage" | "tooLarge";

/**
 * Ảnh tải lên từ máy: trình duyệt đã cắt vuông và thu về 256px (AvatarPicker) rồi gửi dạng `data:` URL; lưu thẳng vào
 * cột ảnh đại diện nên giữ nhỏ. Chỉ nhận WebP, PNG, JPEG (không SVG), kiểm tra cả byte đầu tệp.
 */
export const AVATAR_UPLOAD_MAX = 120_000;
const DATA_URL = /^data:image\/(webp|png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/;
const MAGIC: Readonly<Record<string, (b: Buffer) => boolean>> = {
  webp: (b) => b.toString("latin1", 0, 4) === "RIFF" && b.toString("latin1", 8, 12) === "WEBP",
  png: (b) => b[0] === 0x89 && b.toString("latin1", 1, 4) === "PNG",
  jpeg: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
};

export function checkAvatarImage(dataUrl: string): { readonly ok: true } | { readonly ok: false; readonly error: "badImage" | "tooLarge" } {
  if (dataUrl.length > AVATAR_UPLOAD_MAX) return { ok: false, error: "tooLarge" };
  const m = DATA_URL.exec(dataUrl);
  if (!m) return { ok: false, error: "badImage" };
  const head = Buffer.from(m[2]!.slice(0, 24), "base64");
  return MAGIC[m[1]!]!(head) ? { ok: true } : { ok: false, error: "badImage" };
}

/** Đặt ảnh tải lên làm ảnh đại diện. */
export async function uploadAvatar(
  ownerId: string,
  dataUrl: string,
  deps: { readonly accounts: AccountStore },
): Promise<{ readonly ok: true; readonly avatarUrl: string } | { readonly ok: false; readonly error: AvatarError }> {
  const c = checkAvatarImage(dataUrl);
  if (!c.ok) return c;
  return (await deps.accounts.setAvatar(ownerId, dataUrl)) ? { ok: true, avatarUrl: dataUrl } : { ok: false, error: "noAccount" };
}

export async function chooseAvatar(
  ownerId: string,
  hero: string | null,
  deps: { readonly accounts: AccountStore; readonly profiles: ProfileStore },
): Promise<{ readonly ok: true; readonly avatarUrl: string | null } | { readonly ok: false; readonly error: AvatarError }> {
  let url: string | null = null;
  if (hero !== null) {
    const { profile } = await loadProfile(deps.profiles, ownerId);
    if (hero !== MAIN_ID && !ownsCompanion(profile, hero)) return { ok: false, error: "notOwned" };
    url = portraitUrl(hero);
    if (!url) return { ok: false, error: "noPortrait" };
  }
  return (await deps.accounts.setAvatar(ownerId, url)) ? { ok: true, avatarUrl: url } : { ok: false, error: "noAccount" };
}
