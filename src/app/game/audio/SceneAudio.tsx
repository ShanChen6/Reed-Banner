"use client";

// Áp nhạc nền và âm thanh nền theo phân cảnh hiện tại. Đặt trong AudioProvider; không vẽ gì ra màn hình.

import { useEffect } from "react";
import type { Scene } from "../scene";
import { useAudio } from "./AudioProvider";
import { SELF, soundOfScene } from "./sceneMusic";

export default function SceneAudio({ scene }: { scene: Scene }) {
  const { playMusic, stopMusic, playAmbience, stopAmbience } = useAudio();
  useEffect(() => {
    const s = soundOfScene(scene);
    // Phân cảnh tự lo nhạc (Trận Đồ, trận đánh) đã gọi playMusic ở effect của màn con, chạy trước effect này.
    if (s.music !== SELF) {
      if (s.music) playMusic(s.music);
      else stopMusic(600);
    }
    if (s.ambience) playAmbience(s.ambience);
    else stopAmbience(800);
  }, [scene, playMusic, stopMusic, playAmbience, stopAmbience]);
  return null;
}
