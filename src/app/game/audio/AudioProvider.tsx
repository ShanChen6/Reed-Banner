"use client";

// Nhà cung cấp âm thanh cho toàn màn chơi: dựng engine một lần, mở khóa ở cử chỉ đầu tiên của người dùng, giữ cài đặt (tắt tiếng, âm lượng)
// và tạm dừng khi tab ẩn. Ngoài nhà cung cấp, `useAudio()` trả bản im lặng nên component dùng được ở mọi nơi (test, trang khác).

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AmbienceId, Bus, CueId, MusicId } from "./cues";
import { AudioEngine, browserEnv, type PlayOptions } from "./engine";
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type AudioSettings } from "./settings";

export interface AudioApi {
  readonly muted: boolean;
  readonly volume: Readonly<Record<Bus, number>>;
  setMuted(muted: boolean): void;
  setVolume(bus: Bus, value: number): void;
  play(id: CueId, opts?: PlayOptions): void;
  preload(ids: readonly CueId[]): void;
  playMusic(id: MusicId, fadeMs?: number): void;
  stopMusic(fadeMs?: number): void;
  setLayer(value: number): void;
  playAmbience(id: AmbienceId, fadeMs?: number): void;
  stopAmbience(fadeMs?: number): void;
}

const SILENT: AudioApi = {
  muted: false,
  volume: DEFAULT_SETTINGS.volume,
  setMuted: () => undefined,
  setVolume: () => undefined,
  play: () => undefined,
  preload: () => undefined,
  playMusic: () => undefined,
  stopMusic: () => undefined,
  setLayer: () => undefined,
  playAmbience: () => undefined,
  stopAmbience: () => undefined,
};

const AudioContextApi = createContext<AudioApi>(SILENT);

// Engine dùng chung cả phiên, dựng lười ở lần dùng đầu (effect của màn con chạy trước effect của nhà cung cấp, nên không thể dựng trong effect của nhà cung cấp).
let shared: AudioEngine | null = null;
function getEngine(): AudioEngine | null {
  if (typeof window === "undefined") return null;
  shared ??= new AudioEngine(browserEnv(), loadSettings());
  return shared;
}

export const useAudio = (): AudioApi => useContext(AudioContextApi);

export default function AudioProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_SETTINGS);

  // Cài đặt chỉ đọc được sau khi mount (HTML server và client phải khớp nhau); cử chỉ đầu tiên mở khóa engine, tab ẩn thì tạm dừng.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đọc localStorage chỉ làm được sau khi mount
    setSettings(loadSettings());
    const engine = getEngine();
    if (!engine) return;
    const unlock = () => void engine.unlock();
    const opts = { passive: true } as const;
    window.addEventListener("pointerdown", unlock, opts);
    window.addEventListener("keydown", unlock, opts);
    const onVisibility = () => engine.setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, muted };
      saveSettings(next);
      return next;
    });
    getEngine()?.setMuted(muted);
  }, []);

  const setVolume = useCallback((bus: Bus, value: number) => {
    setSettings((prev) => {
      const next = { ...prev, volume: { ...prev.volume, [bus]: value } };
      saveSettings(next);
      return next;
    });
    getEngine()?.setVolume(bus, value);
  }, []);

  // Các hàm phát giữ nguyên danh tính suốt đời nhà cung cấp (đổi âm lượng không làm các effect của màn chơi chạy lại và tắt nhạc).
  const actions = useMemo(
    () => ({
      play: (id: CueId, opts?: PlayOptions) => void getEngine()?.play(id, opts),
      preload: (ids: readonly CueId[]) => void getEngine()?.preload(ids),
      playMusic: (id: MusicId, fadeMs?: number) => void getEngine()?.playMusic(id, fadeMs),
      stopMusic: (fadeMs?: number) => getEngine()?.stopMusic(fadeMs),
      setLayer: (v: number) => getEngine()?.setLayer(v),
      playAmbience: (id: AmbienceId, fadeMs?: number) => void getEngine()?.playAmbience(id, fadeMs),
      stopAmbience: (fadeMs?: number) => getEngine()?.stopAmbience(fadeMs),
    }),
    [],
  );
  const api = useMemo<AudioApi>(
    () => ({ muted: settings.muted, volume: settings.volume, setMuted, setVolume, ...actions }),
    [settings, setMuted, setVolume, actions],
  );

  return <AudioContextApi.Provider value={api}>{children}</AudioContextApi.Provider>;
}
