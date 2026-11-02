// Mã cue âm thanh dùng trong UI. Mỗi chế độ một nhóm; chưa có tệp thì cue im lặng (xem manifest.ts).
// Bảng cue và ý nghĩa: docs/05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md mục 5.

export const FORMATION_CUES = [
  "formation.place",
  "formation.reject",
  "formation.match",
  "formation.rank",
  "formation.tick",
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

export const BATTLE_CUES = [
  "battle.swap",
  "battle.invalid",
  "battle.match3",
  "battle.match4",
  "battle.match5",
  "battle.combo1",
  "battle.combo2",
  "battle.combo3",
  "battle.combo4",
  "battle.hit.tuongSi",
  "battle.hit.binhLinh",
  "battle.hit.phapSu",
  "battle.hit.ySu",
  "battle.hit.muuSi",
  "battle.hit.quanSu",
  "battle.hit.xaThu",
  "battle.hit.satThu",
  "battle.skill.kim",
  "battle.skill.moc",
  "battle.skill.thuy",
  "battle.skill.hoa",
  "battle.skill.tho",
  "battle.skill.loi",
  "battle.skill.phong",
  "battle.ultimate",
  "battle.damage",
  "battle.heal",
  "battle.shield",
  "battle.buff",
  "battle.debuff",
  "battle.burn",
  "battle.freeze",
  "battle.poison",
  "battle.ko",
  "battle.win",
  "battle.lose",
] as const;

export const MODE_CUES = ["atlas.select", "dialogue.next", "survival.wave", "survival.warn", "daily.complete", "arena.rank"] as const;

export const UI_CUES = ["ui.click", "ui.back", "ui.error", "ui.reward"] as const;

export const CUE_IDS = [...UI_CUES, ...FORMATION_CUES, ...BATTLE_CUES, ...MODE_CUES] as const;
export type CueId = (typeof CUE_IDS)[number];

export const MUSIC_IDS = ["formation_menu", "formation_play", "formation_result_win", "formation_result_lose", "battle_normal", "battle_boss", "survival", "atlas", "dialogue", "ending", "tower_trial", "tower_destiny", "arena"] as const;
export const AMBIENCE_IDS = ["atlas"] as const;
export type AmbienceId = (typeof AMBIENCE_IDS)[number];
export type MusicId = (typeof MUSIC_IDS)[number];

export const BUSES = ["music", "ambience", "sfx", "voice"] as const;
export type Bus = (typeof BUSES)[number];
