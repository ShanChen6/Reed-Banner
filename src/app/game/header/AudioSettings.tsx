"use client";

// Cài đặt âm thanh trong menu tài khoản: công tắc tắt/mở tiếng và âm lượng bốn nhóm (nhạc nền, môi trường,
// hiệu ứng, giọng). Lưu qua AudioProvider như trước, chỉ đổi chỗ đặt (trước là nút riêng trên thanh header).

import { useAudio } from "../audio/AudioProvider";
import type { Bus } from "../audio/cues";

const LABEL: Record<Bus, string> = { music: "Nhạc nền", ambience: "Âm thanh nền", sfx: "Hiệu ứng", voice: "Giọng đọc" };

export default function AudioSettings() {
  const audio = useAudio();
  const on = !audio.muted;
  return (
    <div role="group" aria-label="Âm thanh" className="mx-1 mt-1 mb-1.5 rounded-md border border-[var(--frame-bronze)]/40 bg-wood-inset/70 p-3">
      <label className="mb-3 flex cursor-pointer items-center justify-between gap-3 text-sm text-[var(--on-wood)]">
        Âm thanh
        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={() => audio.setMuted(on)}
          className={`relative h-6 w-11 shrink-0 rounded-full border border-[var(--frame-bronze)] transition-colors motion-reduce:transition-none ${on ? "bg-[var(--lacquer)]" : "bg-wood"}`}
        >
          <span className={`absolute top-0.5 left-0.5 size-[18px] rounded-full bg-[var(--frame-gold)] transition-transform motion-reduce:transition-none ${on ? "translate-x-5" : ""}`} />
        </button>
      </label>
      {(Object.keys(LABEL) as Bus[]).map((b) => (
        <label key={b} className={`mb-2 flex items-center gap-3 text-caption text-[var(--on-wood-soft)] last:mb-0 ${on ? "" : "opacity-50"}`}>
          <span className="w-24 shrink-0">{LABEL[b]}</span>
          <input
            type="range"
            min={0}
            max={100}
            disabled={!on}
            value={Math.round(audio.volume[b] * 100)}
            onChange={(e) => audio.setVolume(b, Number(e.target.value) / 100)}
            className="h-2 w-full accent-[var(--frame-bronze-hi)]"
            aria-label={`Âm lượng ${LABEL[b].toLowerCase()}`}
          />
        </label>
      ))}
    </div>
  );
}
