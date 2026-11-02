// Mã cue âm thanh dùng trong UI. Mỗi chế độ một nhóm; chưa có tệp thì cue im lặng (xem manifest.ts).
// Bảng cue và ý nghĩa: docs/05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md mục 5.

export const FORMATION_CUES = [
  "formation.place",
  "formation.reject",
  "formation.fogclear",
  "formation.line",
  "formation.wild",
  "formation.eraser",
  "formation.fusion",
  "formation.discard",
  "formation.flame1",
  "formation.flame2",
  "formation.flame3",
  "formation.flamedown",
  "formation.win",
  "formation.lose",
] as const;

export const UI_CUES = ["ui.click", "ui.back", "ui.error", "ui.reward"] as const;

export const CUE_IDS = [...UI_CUES, ...FORMATION_CUES] as const;
export type CueId = (typeof CUE_IDS)[number];

export const MUSIC_IDS = ["formation_menu", "formation_play", "formation_result_win", "formation_result_lose"] as const;
export type MusicId = (typeof MUSIC_IDS)[number];

export const BUSES = ["music", "ambience", "sfx", "voice"] as const;
export type Bus = (typeof BUSES)[number];
