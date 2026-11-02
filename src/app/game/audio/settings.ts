// Cài đặt âm thanh lưu ở máy (localStorage, bọc try/catch: có thể bị chặn ở cửa sổ riêng tư).

import { BUSES, type Bus } from "./cues";

export interface AudioSettings {
  readonly muted: boolean;
  readonly volume: Readonly<Record<Bus, number>>;
}

export const SETTINGS_KEY = "colau.audio.v1";

/** Mặc định: bật, nhạc nền nhỏ hơn hiệu ứng. */
export const DEFAULT_SETTINGS: AudioSettings = { muted: false, volume: { music: 0.5, ambience: 0.5, sfx: 0.8, voice: 1 } };

const clamp01 = (n: unknown, fallback: number) => (typeof n === "number" && Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : fallback);

export function parseSettings(raw: unknown): AudioSettings {
  try {
    const v = typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;
    if (typeof v !== "object" || v === null) return DEFAULT_SETTINGS;
    const o = v as { muted?: unknown; volume?: Record<string, unknown> };
    const volume = {} as Record<Bus, number>;
    for (const b of BUSES) volume[b] = clamp01(o.volume?.[b], DEFAULT_SETTINGS.volume[b]);
    return { muted: o.muted === true, volume };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function loadSettings(): AudioSettings {
  try {
    return parseSettings(window.localStorage.getItem(SETTINGS_KEY));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: AudioSettings): void {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* không lưu được thì thôi */
  }
}
