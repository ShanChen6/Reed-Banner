"use client";

// Phân cảnh PROFILE, hiển thị là "Doanh Trại": tải hồ sơ từ server, gửi thao tác (applyProfileAction ở @/core,
// server kiểm tra lại) và dựng Barracks. Giữ tên file và đường dẫn /game/profile để link cũ không hỏng.

import Barracks from "./Barracks";
import { useProfile } from "./useProfile";

export default function ProfileScreen({ playerName }: { playerName: string | null }) {
  const { profile, loadError, busy, message, act } = useProfile();

  if (!profile) {
    return (
      <main className="barracks ui-mode-screen flex items-center justify-center">
        <p role="status" className="py-24 text-center text-[var(--on-wood-soft)]">
          {loadError ? "Không tải được Doanh Trại, thử tải lại trang." : "Đang mở Doanh Trại…"}
        </p>
      </main>
    );
  }
  return <Barracks profile={profile} busy={busy} message={message} onAction={act} playerName={playerName} />;
}
