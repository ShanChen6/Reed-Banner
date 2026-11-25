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
  "battle.crit",
  "battle.turn",
  "battle.timer",
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

export const SULO_CUES = [
  "sulo.roll",
  "sulo.move",
  "sulo.nomove",
  "sulo.correct",
  "sulo.wrong",
  "sulo.disarm",
  "sulo.trap",
  "sulo.luck",
  "sulo.gate",
  "sulo.stele",
  "sulo.aid",
  "sulo.boss",
  "sulo.counsel",
  "sulo.bosswon",
  "sulo.bosslost",
  "sulo.won",
] as const;

export const DOTHAM_CUES = ["dotham.open", "dotham.cascade", "dotham.flag", "dotham.shield", "dotham.reject", "dotham.trap", "dotham.win", "dotham.lose"] as const;

export const MODE_CUES = ["atlas.select", "atlas.unlock", "arena.ghost", "dialogue.next", "survival.wave", "survival.warn", "daily.complete", "daily.checkin", "arena.rank", "tower.floor", "tower.firstclear", "destiny.choose", "destiny.fail"] as const;

export const UI_CUES = ["ui.click", "ui.back", "ui.open", "ui.close", "ui.error", "ui.reward", "ui.levelup"] as const;

export const KHAILO_CUES = ["khailo.remove", "khailo.big", "khailo.fall", "khailo.reject", "khailo.charged", "khailo.heart", "khailo.clear", "khailo.leveldone", "khailo.over", "khailo.tick"] as const;

export const TQK_CUES = ["tqk.select", "tqk.move", "tqk.capture", "tqk.carry", "tqk.boat", "tqk.fly"] as const;

export const CUE_IDS = [...UI_CUES, ...FORMATION_CUES, ...BATTLE_CUES, ...SULO_CUES, ...DOTHAM_CUES, ...MODE_CUES, ...KHAILO_CUES, ...TQK_CUES] as const;
export type CueId = (typeof CUE_IDS)[number];

export const MUSIC_IDS = ["formation_menu", "formation_play", "formation_result_win", "formation_result_lose", "battle_normal", "battle_boss", "survival", "atlas", "dialogue", "ending", "tower_trial", "tower_destiny", "arena", "pvp", "sulo_maze", "sulo_boss", "dotham", "prep", "daily", "expedition", "khai_lo", "khai_lo_timed"] as const;
export const AMBIENCE_IDS = ["atlas"] as const;
export type AmbienceId = (typeof AMBIENCE_IDS)[number];
export type MusicId = (typeof MUSIC_IDS)[number];

export const BUSES = ["music", "ambience", "sfx", "voice"] as const;
export type Bus = (typeof BUSES)[number];
