// Ảnh đại diện chọn trong game (Shan 18/11/2026): chân dung một tướng quân người chơi đã có (Đinh Bộ Lĩnh hoặc tướng
// kèm trong hồ sơ), hoặc bỏ để về chữ cái đầu. Server kiểm tra quyền sở hữu, client chỉ gửi id tướng.

import { MAIN_ID, ownsCompanion } from "@/core";
import { portraitUrl } from "@/app/game/art/portrait-data";
import type { AccountStore } from "./accounts";
import { loadProfile, type ProfileStore } from "./profiles";

export type AvatarError = "notOwned" | "noPortrait" | "noAccount";

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
