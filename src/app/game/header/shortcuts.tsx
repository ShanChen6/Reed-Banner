// Lối tắt của thanh header chung: hiện thành nút từ md, dưới md nằm trong menu tài khoản.

import type { Scene } from "../scene";

export const HEADER_SHORTCUTS = [
  { scene: "PROFILE", label: "Hồ sơ", icon: "book" },
  { scene: "PLAYING", label: "Giao Tranh", icon: "flag" },
] as const satisfies readonly { scene: Scene; label: string; icon: ShortcutIcon }[];

type ShortcutIcon = "book" | "flag";

export function ShortcutGlyph({ kind, className = "size-[18px]" }: { kind: ShortcutIcon; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`shrink-0 text-[var(--hdr-bronze-hi)] ${className}`} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {kind === "book" ? (
        <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5M12 6.5c2-1.5 5-2 8.5-1.5v13c-3.5-.5-6.5 0-8.5 1.5M12 6.5v13" />
      ) : (
        <path d="M5.5 21V3.5M5.5 4.5h11l-2.5 4 2.5 4h-11" />
      )}
    </svg>
  );
}
