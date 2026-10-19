// Hồ sơ tiến trình trên server: đọc, áp thao tác của người chơi, cộng thưởng cuối trận. Ghi kèm điều kiện
// version (Neon HTTP không có transaction tương tác): hai request cùng lúc thì một bên đọc lại rồi thử lại.

import { newProfile, parseProfile, type Profile } from "@/core";

export interface StoredProfile {
  readonly profile: Profile;
  /** 0 khi chưa lưu lần nào. */
  readonly version: number;
}

export interface ProfileStore {
  get(ownerId: string): Promise<StoredProfile | null>;
  /** Ghi khi version đang lưu đúng `expected` (0: chưa có dòng nào); trả về false nếu đã có request khác ghi trước. */
  put(ownerId: string, profile: Profile, expected: number, now: number): Promise<boolean>;
}

export class MemoryProfileStore implements ProfileStore {
  private readonly rows = new Map<string, StoredProfile>();

  async get(ownerId: string): Promise<StoredProfile | null> {
    const r = this.rows.get(ownerId);
    return r ? structuredClone(r) : null;
  }

  async put(ownerId: string, profile: Profile, expected: number): Promise<boolean> {
    if ((this.rows.get(ownerId)?.version ?? 0) !== expected) return false;
    this.rows.set(ownerId, { profile: structuredClone(profile), version: expected + 1 });
    return true;
  }
}

/** Hồ sơ của người chơi; chưa có thì là hồ sơ mới (chưa lưu). Dữ liệu hỏng thì đọc như hồ sơ mới. */
export async function loadProfile(store: ProfileStore, ownerId: string): Promise<StoredProfile> {
  const r = await store.get(ownerId);
  return r ? { profile: parseProfile(r.profile), version: r.version } : { profile: newProfile(), version: 0 };
}

const MAX_TRIES = 3;

export type UpdateResult<E> = { readonly ok: true; readonly stored: StoredProfile } | { readonly ok: false; readonly error: E | "conflict" };

/**
 * Đọc, đổi, ghi kèm điều kiện version; bị request khác ghi trước thì đọc lại và thử tối đa 3 lần.
 * `change` trả về lỗi thì không ghi gì.
 */
export async function updateProfile<E>(
  store: ProfileStore,
  ownerId: string,
  change: (p: Profile) => { ok: true; profile: Profile } | { ok: false; error: E },
  now: number,
): Promise<UpdateResult<E>> {
  for (let i = 0; i < MAX_TRIES; i++) {
    const cur = await loadProfile(store, ownerId);
    const r = change(cur.profile);
    if (!r.ok) return r;
    if (await store.put(ownerId, r.profile, cur.version, now)) return { ok: true, stored: { profile: r.profile, version: cur.version + 1 } };
  }
  return { ok: false, error: "conflict" };
}
