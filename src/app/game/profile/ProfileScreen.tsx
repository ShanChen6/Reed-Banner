"use client";

// Phân cảnh PROFILE, hiển thị là "Doanh Trại": tải hồ sơ từ server, gửi thao tác (applyProfileAction ở @/core,
// server kiểm tra lại) và dựng Barracks. Giữ tên file và đường dẫn /game/profile để link cũ không hỏng.

import { useEffect, useState } from "react";
import type { Profile, ProfileAction } from "@/core";
import { fetchProfile, sendProfileAction } from "../battle/online";
import { PROFILE_ERROR } from "../battle/ProgressPanel";
import Barracks from "./Barracks";

export default function ProfileScreen({ playerName }: { playerName: string | null }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetchProfile().then((r) => {
      if (r.profile) setProfile(r.profile);
      else setLoadError(true);
    });
  }, []);

  const act = async (a: ProfileAction): Promise<string | null> => {
    setBusy(true);
    const r = await sendProfileAction(a);
    setBusy(false);
    if (r.profile) setProfile(r.profile);
    const error = r.error ?? null;
    setMessage(error ? (PROFILE_ERROR[error as keyof typeof PROFILE_ERROR] ?? error) : null);
    return error;
  };

  if (!profile) {
    return (
      <main className="barracks ui-mode-screen flex items-center justify-center">
        <p role="status" className="py-24 text-center text-[var(--bk-soft)]">
          {loadError ? "Không tải được Doanh Trại, thử tải lại trang." : "Đang mở Doanh Trại…"}
        </p>
      </main>
    );
  }
  return <Barracks profile={profile} busy={busy} message={message} onAction={act} playerName={playerName} />;
}
