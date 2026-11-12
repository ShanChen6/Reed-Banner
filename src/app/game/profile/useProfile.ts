"use client";
// Tải hồ sơ người chơi và gửi hành động hồ sơ (mua, nâng, trang bị, nhận thưởng…) cho các màn ngoài trận.
// Lỗi từ server được dịch sang chữ cho người chơi; `act` trả mã lỗi (hoặc null) để màn xử lý thêm nếu cần.

import { useCallback, useEffect, useState } from "react";
import type { Profile, ProfileAction } from "@/core";
import { fetchProfile, sendProfileAction } from "../battle/online";
import { PROFILE_ERROR } from "../battle/ProgressPanel";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetchProfile().then((r) => {
      if (r.profile) setProfile(r.profile);
      else setLoadError(true);
    });
  }, []);

  const act = useCallback(async (a: ProfileAction): Promise<string | null> => {
    setBusy(true);
    const r = await sendProfileAction(a);
    setBusy(false);
    if (r.profile) setProfile(r.profile);
    const error = r.error ?? null;
    setMessage(error ? (PROFILE_ERROR[error as keyof typeof PROFILE_ERROR] ?? error) : null);
    return error;
  }, []);

  return { profile, setProfile, loadError, busy, setBusy, message, setMessage, act };
}
