"use client";

// Footer mỏng của màn game: chỉ ở Chiến trường và các màn thông tin (xem FOOTER_SCENES), không bao giờ trong lúc đang chơi.
// Gồm nhận diện, liên kết (mục chưa có địa chỉ vẫn hiện, bấm chỉ báo "đang chuẩn bị"), mạng xã hội liên hệ, lưu ý nội dung
// và mã bản dựng.

import Link from "next/link";
import { useEffect, useState } from "react";
import { MODE_CONTENT_WIDTH } from "@/components/game-ui";
import { LogoMark } from "./art/logo";
import { buildLabel, footerLinks, pendingNotice, socialLinks, socialPendingNotice, type FooterLink } from "./footerLinks";
import type { Scene } from "./scene";

/** Các phân cảnh có footer. */
export const FOOTER_SCENES: ReadonlySet<Scene> = new Set<Scene>(["MENU", "QUESTS", "LEADERBOARD", "SHOP", "ACCOUNT"]);

const LINK =
  "inline-flex min-h-11 items-center rounded px-1 hover:text-title-on-wood focus-visible:outline-2 focus-visible:outline-frame-gold-hi";

export default function GameFooter() {
  const links = footerLinks();
  const socials = socialLinks();
  const build = buildLabel();
  const [notice, setNotice] = useState<string | null>(null);

  // Thông báo tự ẩn sau vài giây.
  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(t);
  }, [notice]);

  const item = (l: FooterLink, notice = pendingNotice) => {
    if (l.href === null)
      return (
        <button type="button" onClick={() => setNotice(notice(l.label))} className={`${LINK} cursor-pointer`}>
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
  };

  return (
    <footer className="border-t border-frame-line-soft bg-wood-lo px-4 py-4 text-caption text-on-wood-soft sm:px-6">
      <div className={`mx-auto flex w-full flex-col gap-2 ${MODE_CONTENT_WIDTH}`}>
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-2 font-serif font-bold text-on-wood">
            <LogoMark className="size-6" /> Cờ Lau
            <span className="font-sans font-normal text-on-wood-soft">· Mini game thuộc ShanVerse</span>
          </p>
          <ul className="flex flex-wrap items-center gap-x-4" aria-label="Liên kết">
            {links.map((l) => (
              <li key={l.label}>{item(l)}</li>
            ))}
          </ul>
        </div>

        {socials.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-4">
            <span className="text-on-wood">Liên hệ:</span>
            <ul className="flex flex-wrap items-center gap-x-4" aria-label="Mạng xã hội">
              {socials.map((s) => (
                <li key={s.label}>{item(s, socialPendingNotice)}</li>
              ))}
            </ul>
          </div>
        )}

        <p role="status" aria-live="polite" className={notice ? "rounded border border-frame-gold/40 bg-black/30 px-3 py-2 text-title-on-wood" : "sr-only"}>
          {notice}
        </p>

        <p>
          Bối cảnh và tên nhân vật lịch sử là lịch sử chung; tính cách, kỹ năng và lời thoại trong game là hư cấu.
          {build && <span className="whitespace-nowrap"> · Bản {build}</span>}
        </p>
      </div>
    </footer>
  );
}
