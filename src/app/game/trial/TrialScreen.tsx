"use client";
import { requestJson } from "../api";
import { ModeScreen } from "@/components/game-ui";
import { Button } from "@/components/ui";


import { useCallback, useEffect, useState } from "react";
import type { Profile } from "@/core";
import { ONLINE_BATTLE_KEY } from "../battle/online";
import { useScene } from "../SceneContext";
import {
  companionOptions,
  suggestCompanions,
  toggleCompanion,
  TRIAL_ERROR_TEXT,
  type LeaderBuild,
  type TrialOverview,
} from "./trial-ui";
import TrialView from "./TrialView";

interface ProfileResponse {
  readonly profile?: Profile;
}

interface StartResponse {
  readonly id?: string;
  readonly error?: string;
}

interface SweepResponse {
  readonly ok?: boolean;
  readonly granted?: number;
  readonly stones?: number;
  readonly error?: string;
}


function Shell({ children }: { children: React.ReactNode }) {
  return (
    <ModeScreen wide label="Tháp Thí Luyện">
      {children}
    </ModeScreen>
  );
}

export default function TrialScreen() {
  const { go } = useScene();
  const [overview, setOverview] = useState<TrialOverview | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [floor, setFloor] = useState<number | null>(null);
  const [companions, setCompanions] = useState<readonly string[]>([]);
  const [build, setBuild] = useState<LeaderBuild | null>(null);
  const [busy, setBusy] = useState(false);
  const [sweepBusy, setSweepBusy] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const apply = useCallback((tower: TrialOverview | null, stored: ProfileResponse | null) => {
    if (!tower || !stored?.profile) {
      setLoadError(true);
      return;
    }
    const preferred = tower.active?.floor ?? tower.floors.find((entry) => entry.state === "open")?.floor.floor ?? tower.floors.at(-1)?.floor.floor ?? null;
    const rules = tower.floors.find((entry) => entry.floor.floor === preferred)?.floor.rules ?? {};
    setOverview(tower);
    setProfile(stored.profile);
    // Đội mặc định của hồ sơ có thể phạm luật tầng (ví dụ tầng 1 cấm Hỏa): gợi ý sẵn một đội hợp luật.
    setCompanions(suggestCompanions(stored.profile, rules, stored.profile.team.slice(0, 2)));
    setBuild(null);
    setFloor(preferred);
  }, []);

  const load = useCallback(async () => {
    setLoadError(false);
    const [tower, stored] = await Promise.all([
      requestJson<TrialOverview>("/api/trial"),
      requestJson<ProfileResponse>("/api/profile"),
    ]);
    apply(tower, stored);
  }, [apply]);

  useEffect(() => {
    let mounted = true;
    void Promise.all([
      requestJson<TrialOverview>("/api/trial"),
      requestJson<ProfileResponse>("/api/profile"),
    ]).then(([tower, stored]) => {
      if (mounted) apply(tower, stored);
    });
    return () => {
      mounted = false;
    };
  }, [apply]);

  if (!overview || !profile) {
    return (
      <Shell>
        <div className="py-24 text-center text-on-wood-soft">
          {loadError ? (
            <>
              <p role="alert">Không tải được Tháp Thí Luyện. Hãy kiểm tra kết nối rồi thử lại.</p>
              <Button variant="secondary" type="button" onClick={() => void load()} className="mt-4 min-h-11">
                Tải lại
              </Button>
            </>
          ) : (
            <p role="status">Đang tải Tháp Thí Luyện…</p>
          )}
        </div>
      </Shell>
    );
  }

  const selectedEntry = overview.floors.find((entry) => entry.floor.floor === floor);

  const start = async () => {
    if (!floor || !selectedEntry) return;
    setBusy(true);
    setMessage(null);
    const body = { floor, companions, ...(build ? { leaderBuild: build } : {}) };
    const result = await requestJson<StartResponse>("/api/trial/battles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!result?.id) {
      setBusy(false);
      setMessage(TRIAL_ERROR_TEXT[result?.error ?? "network"] ?? "Không vào được tầng, hãy thử lại");
      return;
    }
    try {
      window.localStorage.setItem(ONLINE_BATTLE_KEY, result.id);
    } catch {
      // ID vẫn ở server; chuyển thẳng sang trận hiện tại dù trình duyệt không cho lưu localStorage.
    }
    go("PLAYING", { resume: "1" });
  };

  const abandon = async () => {
    setBusy(true);
    setMessage(null);
    const result = await requestJson<{ abandoned?: boolean; error?: string }>("/api/trial/battles", { method: "DELETE" });
    if (!result || result.error) {
      setBusy(false);
      setMessage(TRIAL_ERROR_TEXT[result?.error ?? "network"] ?? "Không bỏ được trận, hãy thử lại");
      return;
    }
    await load();
    setBusy(false);
  };

  const sweep = async () => {
    setSweepBusy(true);
    setMessage(null);
    const result = await requestJson<SweepResponse>("/api/trial/sweep", { method: "POST" });
    if (!result?.ok) {
      setSweepBusy(false);
      setMessage(TRIAL_ERROR_TEXT[result?.error ?? "network"] ?? "Không quét được tháp, hãy thử lại");
      return;
    }
    await load();
    setSweepBusy(false);
    setMessage(result.granted
      ? `Đã nhận ${result.granted} Đá Cường Hóa. Số dư: ${result.stones}.`
      : "Lượt quét hôm nay đã được nhận trước đó; không cộng thêm đá.");
  };

  return (
    <Shell>
      <TrialView
        overview={overview}
        profile={profile}
        floor={floor}
        companions={companions}
        build={build}
        busy={busy}
        sweepBusy={sweepBusy}
        message={message}
        onSelectFloor={(next) => {
          setFloor(next);
          const rules = overview.floors.find((entry) => entry.floor.floor === next)?.floor.rules ?? {};
          setCompanions(suggestCompanions(profile, rules, companions));
          setBuild(null);
          setMessage(null);
        }}
        onToggleCompanion={(id) => {
          if (!selectedEntry) return;
          const option = companionOptions(profile, selectedEntry.floor.rules, companions).find((candidate) => candidate.id === id);
          if (option) {
            setCompanions(toggleCompanion(companions, option));
            setBuild(null);
            setMessage(null);
          }
        }}
        onBuild={setBuild}
        onStart={() => void start()}
        onAbandon={() => void abandon()}
        onSweep={() => void sweep()}
      />
    </Shell>
  );
}
