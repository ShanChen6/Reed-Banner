"use client";

// Tiếng chung của giao diện trong màn chơi (luật chọn ở uiSounds.ts). Không vẽ gì ra màn hình.
// - Bấm nút, liên kết, thẻ tab: `ui.click` hoặc `ui.back`.
// - Mở/đóng hộp thoại: `ui.open`/`ui.close`; khi đó bỏ tiếng bấm của chính cú bấm mở/đóng để khỏi chồng tiếng.
// - Thông báo lỗi mới hiện (`role="alert"`): `ui.error`.

import { useEffect } from "react";
import { useAudio } from "./AudioProvider";
import { DIALOG_SELECTOR, clickCue, overlayCue } from "./uiSounds";

const CLICKABLE = 'button, a[href], summary, [role="button"], [role="tab"], [role="menuitem"]';
/** Tiếng bấm chờ một nhịp: nếu cú bấm làm mở/đóng hộp thoại hay hiện lỗi thì chỉ phát tiếng đó. */
const CLICK_DEFER_MS = 30;

const hasAlert = (n: Node) =>
  n instanceof Element && (n.matches('[role="alert"]:not([data-sfx="none"] *)') || n.querySelector('[role="alert"]:not([data-sfx="none"] *)') !== null);

export default function UiSounds() {
  const { play } = useAudio();
  useEffect(() => {
    let overlayAt = -Infinity;
    let dialogs = document.querySelectorAll(DIALOG_SELECTOR).length;

    const observer = new MutationObserver((records) => {
      const next = document.querySelectorAll(DIALOG_SELECTOR).length;
      const newAlert = records.some((r) => Array.from(r.addedNodes).some(hasAlert));
      const cue = overlayCue(dialogs, next, newAlert);
      dialogs = next;
      if (cue) {
        overlayAt = performance.now();
        play(cue);
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["open", "role", "aria-modal"] });

    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target.closest<HTMLElement>(CLICKABLE) : null;
      if (!el || el.matches(":disabled, [aria-disabled='true']")) return;
      const cue = clickCue({
        sfx: el.closest<HTMLElement>("[data-sfx]")?.dataset.sfx ?? null,
        inBoard: el.closest('[role="grid"], [role="application"]') !== null,
        label: el.getAttribute("aria-label") ?? el.getAttribute("title") ?? el.textContent ?? "",
      });
      if (!cue) return;
      const at = performance.now();
      window.setTimeout(() => {
        if (overlayAt < at) play(cue);
      }, CLICK_DEFER_MS);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      observer.disconnect();
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, [play]);
  return null;
}
