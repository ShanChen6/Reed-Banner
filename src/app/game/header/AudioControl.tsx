"use client";

// Nút âm thanh ở thanh trên: bấm để tắt/mở tiếng, nút mũi tên mở bảng chỉnh âm lượng bốn nhóm (nhạc nền, môi trường, hiệu ứng, giọng).

import { useEffect, useRef, useState } from "react";
import { useAudio } from "../audio/AudioProvider";
import type { Bus } from "../audio/cues";

const LABEL: Record<Bus, string> = { music: "Nhạc nền", ambience: "Âm thanh nền", sfx: "Hiệu ứng", voice: "Giọng đọc" };

export default function AudioControl() {
  const audio = useAudio();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={box} className="relative flex shrink-0 items-center">
      <button
        type="button"
        onClick={() => audio.setMuted(!audio.muted)}
        aria-pressed={audio.muted}
        title={audio.muted ? "Bật âm thanh" : "Tắt âm thanh"}
        className="game-header-btn flex size-11 items-center justify-center rounded-md md:size-10"
      >
        <span className="sr-only">{audio.muted ? "Bật âm thanh" : "Tắt âm thanh"}</span>
        <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" />
          {audio.muted ? <path d="M16 9.5l5 5M21 9.5l-5 5" /> : <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />}
        </svg>
      </button>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        title="Chỉnh âm lượng"
        className="game-header-btn -ml-1 hidden size-8 items-center justify-center rounded-md sm:flex"
      >
        <span className="sr-only">Chỉnh âm lượng</span>
        <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div role="group" aria-label="Âm lượng" className="absolute top-full right-0 z-50 mt-2 w-64 rounded-lg border border-[var(--hdr-bronze)]/70 bg-[#1d1510] p-3 shadow-xl">
          {(Object.keys(LABEL) as Bus[]).map((b) => (
            <label key={b} className="mb-2 flex items-center gap-3 text-sm text-[var(--hdr-text-soft)] last:mb-0">
              <span className="w-24 shrink-0">{LABEL[b]}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(audio.volume[b] * 100)}
                onChange={(e) => audio.setVolume(b, Number(e.target.value) / 100)}
                className="h-2 w-full accent-[var(--hdr-bronze)]"
                aria-label={`Âm lượng ${LABEL[b].toLowerCase()}`}
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
