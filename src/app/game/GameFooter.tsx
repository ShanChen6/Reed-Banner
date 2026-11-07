"use client";

// Footer của màn game: chỉ ở Chiến trường và các màn thông tin (xem FOOTER_SCENES), không bao giờ trong lúc đang chơi.
// Hai cột căn giữa trong khung 72rem (cùng khổ với footer trang giới thiệu để không dạt ra hai mép màn rộng): trái là nhận diện,
// liên kết và lưu ý; phải là thư cuộn liên hệ (ContactBlock), chỉ có MỘT khối liên hệ trong cả dự án (Shan chốt 07/11/2026: để ở
// footer màn game). Liên kết ngoài đang khóa: vẫn hiện, bấm không chuyển trang (xem footerLinks.ts).

import Link from "next/link";
import { LogoMark } from "./art/logo";
import ContactBlock from "./ContactBlock";
import { buildLabel, footerLinks, socialLinks, type FooterLink } from "./footerLinks";
import type { Scene } from "./scene";

/** Các phân cảnh có footer. */
export const FOOTER_SCENES: ReadonlySet<Scene> = new Set<Scene>(["MENU", "QUESTS", "LEADERBOARD", "SHOP", "ACCOUNT"]);

const LINK =
  "inline-flex min-h-11 items-center rounded px-1 hover:text-title-on-wood focus-visible:outline-2 focus-visible:outline-frame-gold-hi";

function item(l: FooterLink) {
  // Đang khóa hoặc chưa có địa chỉ: nút không làm gì (không chuyển trang, không thông báo).
  if (l.href === null)
    return (
      <button type="button" aria-disabled="true" className={`${LINK} cursor-pointer`}>
        {l.label}
      </button>
    );
  if (l.external)
    return (
      <a href={l.href} target="_blank" rel="noopener noreferrer" className={LINK}>
        {l.label}
      </a>
    );
  return (
    <Link href={l.href} className={LINK}>
      {l.label}
    </Link>
  );
}

export default function GameFooter() {
  const links = footerLinks();
  const build = buildLabel();
  return (
    <footer className="border-t border-frame-line-soft bg-wood-lo px-4 py-10 text-caption text-on-wood-soft sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,40rem)] lg:items-center lg:gap-14">
        <div className="flex flex-col gap-5 lg:pr-4">
          <div className="flex items-center gap-4">
            <LogoMark className="size-14" />
            <div>
              <p className="font-serif text-2xl font-bold text-on-wood">Cờ Lau</p>
              <p className="mt-0.5 text-base">Mini game thuộc ShanVerse</p>
            </div>
          </div>
          <nav aria-label="Liên kết" className="border-y border-frame-line-soft py-3">
            <ul className="-mx-1 grid grid-cols-2 gap-x-4 text-base sm:grid-cols-3">
              {links.map((l) => (
                <li key={l.label}>{item(l)}</li>
              ))}
            </ul>
          </nav>
          <p className="max-w-md leading-relaxed">
            Bối cảnh và tên nhân vật lịch sử là lịch sử chung; tính cách, kỹ năng và lời thoại trong game là hư cấu.
            {build && <span className="whitespace-nowrap"> · Bản {build}</span>}
          </p>
        </div>
        <div className="flex justify-center lg:justify-end">
          <ContactBlock links={socialLinks()} />
        </div>
      </div>
    </footer>
  );
}
