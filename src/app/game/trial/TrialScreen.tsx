"use client";

import { useCallback, useEffect, useState } from "react";
import type { Profile } from "@/core";
import { ONLINE_BATTLE_KEY } from "../battle/online";
import { useScene } from "../SceneContext";
import {
  companionOptions,
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

async function json<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, { ...init, cache: "no-store" });
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 bg-[radial-gradient(ellipse_at_top,#34251d_0%,#17110e_62%)] px-3 py-6 text-stone-100 [--gold:#d4a24c] sm:px-6">
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
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

  const load = useCallback(async () => {
    setLoadError(false);
    const [tower, stored] = await Promise.all([
      json<TrialOverview>("/api/trial"),
      json<ProfileResponse>("/api/profile"),
    ]);
    if (!tower || !stored?.profile) {
      setLoadError(true);
      return;
    }
    setOverview(tower);
    setProfile(stored.profile);
    setCompanions(stored.profile.team.slice(0, 2));
    setBuild(null);
    const preferred = tower.active?.floor ?? tower.floors.find((entry) => entry.state === "open")?.floor.floor ?? tower.floors.at(-1)?.floor.floor ?? null;
    setFloor(preferred);
  }, []);

  useEffect(() => {
    let mounted = true;
    void Promise.all([
      json<TrialOverview>("/api/trial"),
      json<ProfileResponse>("/api/profile"),
    ]).then(([tower, stored]) => {
      if (!mounted) return;
      if (!tower || !stored?.profile) {
        setLoadError(true);
        return;
      }
      setOverview(tower);
      setProfile(stored.profile);
      setCompanions(stored.profile.team.slice(0, 2));
      setBuild(null);
      setFloor(tower.active?.floor ?? tower.floors.find((entry) => entry.state === "open")?.floor.floor ?? tower.floors.at(-1)?.floor.floor ?? null);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!overview || !profile) {
    return (
      <Shell>
        <div className="py-24 text-center text-stone-300">
          {loadError ? (
            <>
              <p role="alert">Không tải được Tháp Thí Luyện. Hãy kiểm tra kết nối rồi thử lại.</p>
              <button type="button" onClick={() => void load()} className="mt-4 min-h-11 rounded-lg bg-white/10 px-4 py-2 font-semibold hover:bg-white/15">
                Tải lại
              </button>
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
    const result = await json<StartResponse>("/api/trial/battles", {
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
    const result = await json<{ abandoned?: boolean; error?: string }>("/api/trial/battles", { method: "DELETE" });
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
    const result = await json<SweepResponse>("/api/trial/sweep", { method: "POST" });
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
