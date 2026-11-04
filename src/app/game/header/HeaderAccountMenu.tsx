"use client";

// Menu tài khoản ở góc phải thanh header: avatar + tên thật lấy từ phiên (GameShell nhận từ currentUser() ở
// server, không gọi lại API), bấm mở danh sách: Doanh Trại, Tài khoản, Cài đặt (âm thanh), Đăng xuất; khách thì
// Đăng nhập/Đăng ký thay cho Tài khoản/Đăng xuất.

import { useEffect, useId, useRef, useState } from "react";
import type { ShellAccount } from "../GameShell";
import { scenePath, type Scene } from "../scene";
import { SceneLink } from "../SceneContext";
import AudioSettings from "./AudioSettings";

export default function HeaderAccountMenu({ scene, account }: { scene: Scene; account: ShellAccount | null }) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [openedAt, setOpenedAt] = useState(scene);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const name = account?.name ?? "Khách";

  // Đổi phân cảnh thì đóng menu (bấm một mục trong menu cũng đổi phân cảnh).
  if (openedAt !== scene) {
    setOpenedAt(scene);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item = "game-header-menu-item flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left";

  return (
    <div ref={root} className="relative shrink-0">
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        title={name}
        onClick={() => setOpen((v) => !v)}
        className="game-header-btn game-header-account flex h-11 items-center gap-2 rounded-lg py-1 pr-1.5 pl-1 sm:pr-2"
      >
        <AccountAvatar account={account} />
        <span className="hidden max-w-[6.5rem] truncate font-serif text-sm font-semibold lg:block xl:max-w-[8rem] xl:text-[15px]">{name}</span>
        <span className="sr-only lg:hidden">{`Tài khoản: ${name}`}</span>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className={`hidden size-4 shrink-0 text-[var(--hdr-bronze-hi)] transition-transform motion-reduce:transition-none sm:block ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>
      <div
        id={panelId}
        onClickCapture={(e) => {
          if ((e.target as Element).closest("a")) setOpen(false);
        }}
        className={`game-header-menu absolute top-full right-0 mt-2 w-72 origin-top-right rounded-lg p-1.5 transition duration-150 motion-reduce:transition-none ${
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
        }`}
      >
        <div className="border-b border-[var(--hdr-bronze)]/40 px-3 pt-2 pb-2.5">
          <p className="font-serif font-semibold break-words text-[var(--hdr-text)]">{name}</p>
          <p className="text-xs text-[var(--hdr-text-soft)]">
            {account ? "Đã đăng nhập" : "Tiến độ đang lưu trên trình duyệt này. Đăng nhập để giữ trên tài khoản."}
          </p>
        </div>
        <ul className="mt-1 flex flex-col">
          <li>
            <SceneLink scene="PROFILE" aria-current={scene === "PROFILE" ? "page" : undefined} className={item}>
              <svg aria-hidden viewBox="0 0 24 24" className="size-[18px] shrink-0 text-[var(--hdr-bronze-hi)]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.5 20.5h17M5 20.5V12l7-6 7 6v8.5M10 20.5v-5h4v5M12 6V2.5l3.5 1.2L12 5" />
              </svg>
              Doanh Trại
            </SceneLink>
          </li>
          {account && (
            <li>
              <SceneLink scene="ACCOUNT" aria-current={scene === "ACCOUNT" ? "page" : undefined} className={item}>
                <PersonGlyph />
                Tài khoản
              </SceneLink>
            </li>
          )}
          <li>
            <button type="button" aria-expanded={settings} onClick={() => setSettings((v) => !v)} className={item}>
              <svg aria-hidden viewBox="0 0 24 24" className="size-[18px] shrink-0 text-[var(--hdr-bronze-hi)]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
              </svg>
              <span className="flex-1">Cài đặt</span>
              <svg aria-hidden viewBox="0 0 20 20" className={`size-4 shrink-0 text-[var(--hdr-bronze-hi)] ${settings ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 8l5 5 5-5" />
              </svg>
            </button>
            {settings && <AudioSettings />}
          </li>
          {account ? (
            <>
              <li className="mt-1 border-t border-[var(--hdr-bronze)]/40 pt-1">
                <form action={`/api/auth/logout?returnTo=${encodeURIComponent(scenePath("LOGIN"))}`} method="post">
                  <button type="submit" className={item}>
                    <svg aria-hidden viewBox="0 0 24 24" className="size-[18px] shrink-0 text-[var(--hdr-bronze-hi)]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14M10 16l-4-4 4-4M6 12h10" />
                    </svg>
                    Đăng xuất
                  </button>
                </form>
              </li>
            </>
          ) : (
            <>
              <li className="mt-1 border-t border-[var(--hdr-bronze)]/40 pt-1">
                <SceneLink
                  scene="LOGIN"
                  params={{ returnTo: scene === "MENU" || scene === "LOGIN" || scene === "REGISTER" ? undefined : scenePath(scene) }}
                  aria-current={scene === "LOGIN" ? "page" : undefined}
                  className={item}
                >
                  <PersonGlyph />
                  Đăng nhập
                </SceneLink>
              </li>
              <li>
                <SceneLink scene="REGISTER" aria-current={scene === "REGISTER" ? "page" : undefined} className={item}>
                  <svg aria-hidden viewBox="0 0 24 24" className="size-[18px] shrink-0 text-[var(--hdr-bronze-hi)]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Đăng ký
                </SceneLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

/** Ảnh đại diện Google/GitHub; tài khoản mật khẩu không có ảnh thì hiện chữ cái đầu; khách hiện hình người chung. */
export function AccountAvatar({ account }: { account: ShellAccount | null }) {
  const ring = "game-header-avatar size-8 shrink-0 rounded-full md:size-9";
  if (account?.avatarUrl)
    return (
      // Ảnh đại diện từ Google/GitHub, nhỏ nên không cần tối ưu qua next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={account.avatarUrl} alt="" className={`${ring} object-cover`} referrerPolicy="no-referrer" />
    );
  if (account) {
    const initial = [...account.name.trim()][0]?.toUpperCase() ?? "?";
    return (
      <span aria-hidden className={`${ring} grid place-items-center bg-[var(--hdr-active)] font-serif text-sm font-bold text-[var(--hdr-text)]`}>
        {initial}
      </span>
    );
  }
  return (
    <span aria-hidden className={`${ring} grid place-items-center bg-[var(--hdr-wood-hi)] text-[var(--hdr-text-soft)]`}>
      <PersonGlyph />
    </span>
  );
}

function PersonGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-[18px] shrink-0 text-[var(--hdr-bronze-hi)]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </svg>
  );
}
