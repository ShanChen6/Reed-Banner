"use client";

// Màn chiến dịch: Campaign V2 (6 chương, 24 nhiệm vụ) và khu Đánh trùm bên dưới. Chiến dịch 13 màn cũ đã gỡ ở
// CAMP-08.04. Mọi luật ở @/core, server kiểm tra lại.

import { Alert } from "@/components/ui";
import {
  raidBossById,
  raidSetup,
  type RaidTier,
} from "@/core";
import {
  createOnline,
  ONLINE_BATTLE_KEY,
  ONLINE_ERROR_TEXT,
} from "../battle/online";
import { ModeScreen } from "@/components/game-ui";
import ChapterOne from "./ChapterOne";
import RaidHall from "./RaidPanel";
import { useScene } from "../SceneContext";
import { useProfile } from "../profile/useProfile";

export default function CampaignScreen() {
  const { go } = useScene();
  const { profile, setProfile, loadError, busy, setBusy, message, setMessage, act } = useProfile();

  if (!profile) {
    return (
      <Shell>
        <p className="py-24 text-center text-on-wood-soft">
          {loadError
            ? "Chưa mở được hồ sơ. Xin tải lại trang."
            : "Đang mở Bình Loạn…"}
        </p>
      </Shell>
    );
  }

  const startRaid = async (bossId: string, raid: RaidTier) => {
    const boss = raidBossById(bossId);
    if (!boss) return;
    setBusy(true);
    setMessage(null);
    const res = await createOnline({
      mode: boss.mode,
      element: profile.element,
      profession: profile.profession,
      companions: boss.mode === "3v3" ? profile.team : [],
      difficulty: raidSetup(boss, raid).difficulty,
      raidBoss: boss.id,
      raid,
    });
    if (!res.id) {
      setBusy(false);
      setMessage(
        ONLINE_ERROR_TEXT[res.error ?? "network"] ?? "Chưa bày được trận. Xin thử lại.",
      );
      return;
    }
    try {
      window.localStorage.setItem(ONLINE_BATTLE_KEY, res.id);
    } catch {
      // Không lưu được thì phân cảnh trận không tự tiếp tục; người chơi vẫn bấm Tiếp tục ở đó được.
    }
    go("PLAYING", { resume: "1" });
  };

  return (
    <Shell>
      <ChapterOne
        profile={profile}
        onProfile={setProfile}
        onAction={(a) => void act(a)}
        busy={busy}
        footer={
          <RaidHall
            profile={profile}
            busy={busy}
            onStart={(bossId, tier) => void startRaid(bossId, tier)}
          />
        }
      />
      {message && (
        <Alert tone="error" className="mt-2 p-3 text-sm">
          {message}
        </Alert>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <ModeScreen label="Bình Loạn">{children}</ModeScreen>
  );
}
