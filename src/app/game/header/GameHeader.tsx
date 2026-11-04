"use client";

// Thanh header chung của màn chơi /game, ba cột: trái là nút về Chiến trường (màn chính), giữa là bảng tên phân
// cảnh (Doanh Trại, Cửa Hàng, chế độ chơi...), phải là vàng hiện có và menu tài khoản (Doanh Trại, cài đặt âm thanh,
// đăng nhập/đăng xuất). Tranh phong cảnh trải hết chiều dài thanh. GameShell dựng một lần cho mọi phân cảnh; tab
// riêng của từng màn vẫn nằm trong màn đó. Màu lấy từ token --hdr-* trong globals.css (lớp .game-header).

import type { ShellAccount } from "../GameShell";
import { SCENE_TITLE, type Scene } from "../scene";
import { SceneLink } from "../SceneContext";
import HeaderAccountMenu from "./HeaderAccountMenu";
import HeaderGold from "./HeaderGold";
import { HeaderCloud, HeaderOrnament } from "./HeaderOrnament";

export default function GameHeader({ scene, account }: { scene: Scene; account: ShellAccount | null }) {
  return (
    <header className="game-header sticky top-0 z-40 h-14 md:h-16 xl:h-[68px]">
      <HeaderBackdrop />
      {/* Ba cột, cột giữa luôn ở đúng giữa thanh. Lề hai bên từ md chừa chỗ cho mặt trống của hai góc hoa văn. */}
      <div className="relative mx-auto grid h-full grid-cols-[1fr_auto_1fr] items-center gap-2 px-2 sm:px-4 md:gap-3 md:px-16 xl:px-[4.5rem]">
        <HomeButton current={scene === "MENU"} />
        <SceneTitle title={SCENE_TITLE[scene]} />
        <div className="flex min-w-0 items-center justify-end gap-1.5 md:gap-3">
          <HeaderGold scene={scene} />
          <span aria-hidden className="hidden h-7 w-px shrink-0 bg-[var(--hdr-bronze)]/60 md:block" />
          <HeaderAccountMenu scene={scene} account={account} />
        </div>
      </div>
    </header>
  );
}

/**
 * Nền gỗ sơn mài, tranh cổng thành trải hết chiều dài thanh (hai đầu tối dần để nút và chữ đọc rõ), hai góc hoa văn
 * đồng và hai đường chỉ đồng trên/dưới. Chỉ để trang trí.
 */
function HeaderBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="game-header-panorama absolute inset-0" />
      <div className="game-header-shade absolute inset-0" />
      <HeaderOrnament kind="corner-left" className="absolute top-[3px] left-[3px] hidden h-[calc(100%-10px)] md:block" />
      <HeaderOrnament kind="corner-right" className="absolute top-[3px] right-[3px] hidden h-[calc(100%-10px)] md:block" />
      <span className="game-header-rule absolute inset-x-0 top-0" />
      <span className="game-header-rule absolute inset-x-0 bottom-0" />
    </div>
  );
}

/** Trái: về Chiến trường (màn chính). Ở màn chính thì nút sáng lên như đang chọn. Dưới md chỉ còn icon. */
function HomeButton({ current }: { current: boolean }) {
  return (
    <nav aria-label="Điều hướng" className="flex min-w-0 justify-self-start">
      <SceneLink
        scene="MENU"
        aria-current={current ? "page" : undefined}
        title="Về Chiến trường"
        className="game-header-btn game-header-chip flex h-10 min-w-11 shrink-0 items-center justify-center gap-2 rounded-md px-2.5 font-serif font-semibold whitespace-nowrap md:px-4"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-5 text-[var(--hdr-gold)]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.5 11.5 12 4l8.5 7.5" />
          <path d="M5.5 10v9.5h4.5v-5.5h4v5.5h4.5V10" />
        </svg>
        <span className="sr-only md:not-sr-only md:text-[15px] xl:text-base">Chiến trường</span>
      </SceneLink>
    </nav>
  );
}

/**
 * Giữa: bảng tên phân cảnh trên khung đồng Shan vẽ (kéo giãn theo độ dài tên, xem .game-header-title), hai cụm mây
 * đè lên hai đầu khung. Tên dài thì cắt bớt, không đẩy hai cột bên.
 */
function SceneTitle({ title }: { title: string }) {
  return (
    <div className="relative flex min-w-0 items-center justify-center">
      <p className="game-header-title max-w-[46vw] truncate px-2 pt-[0.12em] text-center font-serif text-[13px] leading-[1.9] font-bold tracking-[0.06em] uppercase sm:max-w-none sm:px-4 sm:text-sm sm:tracking-[0.14em] md:px-5 lg:px-6 lg:text-lg lg:tracking-[0.2em] xl:text-xl">
        {title}
      </p>
      <HeaderCloud side="left" className="absolute top-1/2 left-0 hidden h-[64%] -translate-x-[62%] -translate-y-1/2 md:block" />
      <HeaderCloud side="right" className="absolute top-1/2 right-0 hidden h-[64%] translate-x-[62%] -translate-y-1/2 md:block" />
    </div>
  );
}
