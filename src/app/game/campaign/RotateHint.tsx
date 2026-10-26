"use client";

// Gợi ý xoay ngang cho điện thoại nhỏ cầm dọc (lớp .rotate-hint chỉ hiện ở màn dọc < 640px). Web không ép xoay
// được ở mọi nơi: Android cho khóa ngang khi toàn màn hình (Screen Orientation API), iPhone thì không, nên ở đó
// chỉ còn lời nhắc. Ẩn được, chỉ nhớ trong lần mở trang.

import { useState, useSyncExternalStore } from "react";

type OrientationLock = { lock?: (o: "landscape") => Promise<void> };

const noop = () => () => {};

function lockSupported() {
  const o = screen.orientation as unknown as OrientationLock | undefined;
  return (
    typeof o?.lock === "function" &&
    typeof document.documentElement.requestFullscreen === "function"
  );
}

export default function RotateHint() {
  const [closed, setClosed] = useState(false);
  // Chỉ biết sau khi chạy ở trình duyệt; server render coi như không khóa được.
  const canLock = useSyncExternalStore(noop, lockSupported, () => false);
  const [failed, setFailed] = useState(false);

  if (closed) return null;

  const rotate = async () => {
    try {
      if (!document.fullscreenElement)
        await document.documentElement.requestFullscreen();
      await (screen.orientation as unknown as OrientationLock).lock!(
        "landscape",
      );
      setClosed(true);
    } catch {
      setFailed(true);
    }
  };

  return (
    <div
      role="note"
      className="rotate-hint world-strip items-center gap-2 border-b px-3 py-1.5 text-sm"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-6 shrink-0"
        aria-hidden
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="7" y="3" width="10" height="18" rx="2" />
        <path d="M3 14a9 9 0 0 0 7 7M21 10a9 9 0 0 0-7-7" />
        <path d="M14 1l0 2.5L11.5 3M10 23l0-2.5 2.5.5" />
      </svg>
      <span className="min-w-0 flex-1 leading-snug">
        {failed || !canLock
          ? "Xoay điện thoại ngang để xem bản đồ rõ hơn."
          : "Bản đồ rõ hơn khi xoay ngang."}
      </span>
      {canLock && !failed && (
        <button
          type="button"
          onClick={rotate}
          className="map-chip min-h-11 shrink-0 rounded-lg border px-3 font-semibold"
        >
          Xoay ngang
        </button>
      )}
      <button
        type="button"
        onClick={() => setClosed(true)}
        aria-label="Ẩn gợi ý xoay ngang"
        className="flex size-11 shrink-0 items-center justify-center rounded-lg text-lg"
      >
        ×
      </button>
    </div>
  );
}
