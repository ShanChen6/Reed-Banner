"use client";

// Phân cảnh PROFILE, hiển thị là "Doanh Trại": tải hồ sơ từ server, gửi thao tác (applyProfileAction ở @/core,
// server kiểm tra lại) và dựng Barracks. Giữ tên file và đường dẫn /game/profile để link cũ không hỏng.

import { MODE_CONTENT_WIDTH, ModeSkeleton } from "@/components/game-ui";
import Barracks from "./Barracks";
import { useProfile } from "./useProfile";

export default function ProfileScreen({ playerName }: { playerName: string | null }) {
  const { profile, loadError, busy, message, act } = useProfile();

  if (!profile) {
    return (
      <main className="barracks ui-mode-screen">
        <div className={`mx-auto w-full ${MODE_CONTENT_WIDTH}`}>
          {loadError ? (
            <p role="alert" className="py-24 text-center text-[var(--on-wood-soft)]">Chưa mở được Doanh Trại. Xin tải lại trang.</p>
          ) : (
            <ModeSkeleton label="Đang mở Doanh Trại…" tabs={4} />
          )}
        </div>
      </main>
    );
  }
  return <Barracks profile={profile} busy={busy} message={message} onAction={act} playerName={playerName} />;
}
