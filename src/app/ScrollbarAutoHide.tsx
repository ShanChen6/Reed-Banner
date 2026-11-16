"use client";

// Thanh cuộn tự ẩn: phần tử nào đang cuộn (kể cả trang) được gắn data-scroll="on" để hiện thanh cuộn đồng, ngừng cuộn
// một lúc thì đổi sang "off" và thanh mờ dần (kiểu trong globals.css, mục "Thanh cuộn"). Kéo thanh cuộn cũng sinh sự
// kiện cuộn nên vẫn hiện khi đang kéo. Chỉ một trình nghe ở document (pha capture vì sự kiện cuộn không nổi bọt).

import { useEffect } from "react";

const HIDE_AFTER_MS = 900;

export default function ScrollbarAutoHide() {
  useEffect(() => {
    const timers = new Map<Element, number>();
    const onScroll = (e: Event) => {
      const el = e.target instanceof Element ? e.target : document.documentElement;
      el.setAttribute("data-scroll", "on");
      window.clearTimeout(timers.get(el));
      timers.set(
        el,
        window.setTimeout(() => {
          el.setAttribute("data-scroll", "off");
          timers.delete(el);
        }, HIDE_AFTER_MS),
      );
    };
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      for (const t of timers.values()) window.clearTimeout(t);
    };
  }, []);
  return null;
}
