// Nhạc và âm thanh nền theo phân cảnh /game (docs/05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md mục 5.4, 5.5).
//
// `SELF`: phân cảnh tự lo nhạc của mình (Trận Đồ theo màn, trận đánh theo loại trận) nên khung chung không đụng tới.
// Phân cảnh không có nhạc thì nhạc cũ tắt dần.

import type { Scene } from "../scene";
import type { AmbienceId, MusicId } from "./cues";

export const SELF = "self" as const;

export interface SceneSound {
  readonly music: MusicId | typeof SELF | null;
  readonly ambience: AmbienceId | null;
}

const SILENT: SceneSound = { music: null, ambience: null };

/** Âm thanh của một phân cảnh. Màn chính, cửa hàng, hồ sơ... im lặng. */
export function soundOfScene(scene: Scene): SceneSound {
  switch (scene) {
    case "CAMPAIGN":
      return { music: "atlas", ambience: "atlas" };
    case "TRIAL":
      return { music: "tower_trial", ambience: null };
    case "DESTINY":
      return { music: "tower_destiny", ambience: null };
    case "ARENA":
      return { music: "arena", ambience: null };
    case "SURVIVAL":
      return { music: "survival", ambience: null };
    case "FORMATION":
    case "PLAYING":
    case "PRACTICE":
      return { music: SELF, ambience: null };
    default:
      return SILENT;
  }
}
