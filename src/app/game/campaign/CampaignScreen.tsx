"use client";

// Màn chiến dịch: Campaign V2 (6 chương, 24 nhiệm vụ) và khu Đánh trùm bên dưới. Chiến dịch 13 màn cũ đã gỡ ở
// CAMP-08.04. Mọi luật ở @/core, server kiểm tra lại.

import { useEffect, useState } from "react";
import {
  raidBossById,
  raidSetup,
  type Profile,
  type ProfileAction,
  type RaidTier,
} from "@/core";
import {
  createOnline,
  fetchProfile,
  ONLINE_BATTLE_KEY,
  ONLINE_ERROR_TEXT,
  sendProfileAction,
} from "../battle/online";
import { PROFILE_ERROR } from "../battle/ProgressPanel";
import ChapterOne from "./ChapterOne";
import RaidHall from "./RaidPanel";
import { useScene } from "../SceneContext";

export default function CampaignScreen() {
  const { go } = useScene();
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

  if (!profile) {
    return (
      <Shell>
        <p className="py-24 text-center text-stone-300">
          {loadError
            ? "Không tải được hồ sơ, thử tải lại trang."
            : "Đang tải chiến dịch…"}
        </p>
      </Shell>
    );
  }

  const act = async (a: ProfileAction) => {
    setBusy(true);
    const r = await sendProfileAction(a);
    setBusy(false);
    if (r.profile) setProfile(r.profile);
    setMessage(
      r.error
        ? (PROFILE_ERROR[r.error as keyof typeof PROFILE_ERROR] ?? r.error)
        : null,
    );
  };

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
        ONLINE_ERROR_TEXT[res.error ?? "network"] ?? "Không tạo được trận",
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
      />
      {message && <p className="mt-2 text-sm text-rose-400">{message}</p>}

      <RaidHall
        profile={profile}
        busy={busy}
        onStart={(bossId, tier) => void startRaid(bossId, tier)}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 bg-[radial-gradient(ellipse_at_top,#4a2418_0%,#17110e_60%)] px-3 py-6 text-stone-100 [--gold:#d4a24c] sm:px-6">
      <div className="mx-auto max-w-[1440px]">{children}</div>
    </main>
  );
}
