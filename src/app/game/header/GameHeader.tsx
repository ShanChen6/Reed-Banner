"use client";

// Thanh header chung của màn chơi /game: trái là điều hướng (về màn chính, tên phân cảnh), giữa là tranh phong
// cảnh làm nền trang trí, phải là lối tắt Hồ sơ/Trận thường và menu tài khoản. GameShell dựng một lần cho mọi
// phân cảnh; tab riêng của từng màn (vd. thanh Sử ký) vẫn nằm trong màn đó. Màu lấy từ token --hdr-* trong
// globals.css (lớp .game-header), không đổi màu của phần còn lại.

import Link from "next/link";
import { LogoMark } from "../art/logo";
import type { ShellAccount } from "../GameShell";
import { SCENE_TITLE, type Scene } from "../scene";
import { SceneLink } from "../SceneContext";
import HeaderAccountMenu from "./HeaderAccountMenu";
import { HEADER_SHORTCUTS, ShortcutGlyph } from "./shortcuts";
import { HeaderOrnament } from "./HeaderOrnament";

export default function GameHeader({ scene, account }: { scene: Scene; account: ShellAccount | null }) {
  return (
    <header className="game-header sticky top-0 z-40 h-14 md:h-16 xl:h-[68px]">
      <HeaderBackdrop />
      {/* Lề hai bên từ md chừa chỗ cho mặt trống của hai góc hoa văn. */}
      <div className="relative mx-auto flex h-full items-center gap-2 px-2 sm:px-4 md:gap-3 md:px-11 xl:px-14">
        <HeaderNavigation scene={scene} />
        <span className="flex-1" />
        <HeaderActions scene={scene} />
        <HeaderAccountMenu scene={scene} account={account} />
      </div>
    </header>
  );
}

/**
 * Nền gỗ sơn mài, tranh cổng thành chìm vào gỗ (luôn căn giữa màn hình, tan dần cả bốn phía nên không thấy mép
 * chữ nhật), hai góc hoa văn đồng và hai đường chỉ đồng trên/dưới. Chỉ để trang trí.
 */
function HeaderBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="game-header-panorama absolute inset-y-0 left-1/2 -translate-x-1/2" />
      <HeaderOrnament kind="corner-left" className="absolute top-[3px] left-[3px] hidden h-[calc(100%-10px)] md:block" />
      <HeaderOrnament kind="corner-right" className="absolute top-[3px] right-[3px] hidden h-[calc(100%-10px)] md:block" />
      <span className="game-header-rule absolute inset-x-0 top-0" />
      <span className="game-header-rule absolute inset-x-0 bottom-0" />
    </div>
  );
}

/** Trái: về màn chính và tên phân cảnh hiện tại. Ở màn chính thì là logo, bấm về trang giới thiệu. */
function HeaderNavigation({ scene }: { scene: Scene }) {
  if (scene === "MENU")
    return (
      <Link href="/" className="game-header-btn flex min-h-11 shrink-0 items-center gap-2 rounded-md px-2 font-serif text-lg font-bold">
        <LogoMark className="size-8" /> Cờ Lau
      </Link>
    );
  return (
    <nav aria-label="Điều hướng" className="flex min-w-0 items-center gap-1 md:gap-2">
      <SceneLink
        scene="MENU"
        title="Về màn chính"
        className="game-header-btn flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-md px-2 font-serif font-semibold whitespace-nowrap md:px-3"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        <span className="sr-only md:not-sr-only md:text-[15px] xl:text-base">Màn chính</span>
      </SceneLink>
      <span aria-hidden className="hidden h-6 w-px shrink-0 bg-[var(--hdr-bronze)]/60 md:block" />
      <span aria-current="page" className="truncate font-serif text-[15px] text-[var(--hdr-text-soft)] [text-shadow:0_1px_3px_#000] md:px-1 xl:text-base">
        {SCENE_TITLE[scene]}
      </span>
    </nav>
  );
}

/** Phải: Hồ sơ, Trận thường (từ md; dưới md nằm trong menu tài khoản). Chưa có chuông vì game chưa có thông báo. */
function HeaderActions({ scene }: { scene: Scene }) {
  return (
    <div className="hidden shrink-0 items-center gap-1.5 md:flex xl:gap-2">
      {HEADER_SHORTCUTS.map((s) => (
        <SceneLink
          key={s.scene}
          scene={s.scene}
          aria-current={scene === s.scene ? "page" : undefined}
          title={s.label}
          className="game-header-btn game-header-chip flex h-10 items-center gap-2 rounded-md px-2.5 font-serif text-sm whitespace-nowrap xl:px-3"
        >
          <ShortcutGlyph kind={s.icon} />
          <span className="sr-only xl:not-sr-only">{s.label}</span>
        </SceneLink>
      ))}
    </div>
  );
}
