"use client";

// Nghe mọi cú bấm trong màn chơi và phát `ui.click` hoặc `ui.back` (luật chọn ở uiClick.ts). Không vẽ gì ra màn hình.

import { useEffect } from "react";
import { useAudio } from "./AudioProvider";
import { clickCue } from "./uiClick";

const CLICKABLE = 'button, a[href], summary, [role="button"], [role="tab"], [role="menuitem"]';

export default function UiClickSounds() {
  const { play } = useAudio();
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target.closest<HTMLElement>(CLICKABLE) : null;
      if (!el || el.matches(":disabled, [aria-disabled='true']")) return;
      const cue = clickCue({
        sfx: el.closest<HTMLElement>("[data-sfx]")?.dataset.sfx ?? null,
        inBoard: el.closest('[role="grid"], [role="application"]') !== null,
        label: el.getAttribute("aria-label") ?? el.getAttribute("title") ?? el.textContent ?? "",
      });
      if (cue) play(cue);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [play]);
  return null;
}
