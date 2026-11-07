"use client";

// Footer của màn game: chỉ ở Chiến trường và các màn thông tin (xem FOOTER_SCENES), không bao giờ trong lúc đang chơi.
// Ba cột cân đối trên laptop (nhận diện và lưu ý · khối liên hệ · liên kết), xếp dọc trên điện thoại. Chỉ có MỘT khối liên hệ
// (ContactBlock, ba phương án phong kiến để Shan chọn: ?contact=a|b|c). Liên kết ngoài đang khóa: vẫn hiện, bấm không chuyển
// trang (xem footerLinks.ts).

import Link from "next/link";
import { MODE_CONTENT_WIDTH } from "@/components/game-ui";
import { LogoMark } from "./art/logo";
import ContactBlock from "./ContactBlock";
import { parseContactVariant, type ContactVariant } from "./contactVariant";
import { buildLabel, footerLinks, socialLinks, type FooterLink } from "./footerLinks";
import type { Scene } from "./scene";
import { useScene } from "./SceneContext";

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

export default function GameFooter({ variant }: { variant?: ContactVariant }) {
  const { params } = useScene();
  const chosen = variant ?? parseContactVariant(params.get("contact"));
  const links = footerLinks();
  const build = buildLabel();
  return (
    <footer className="border-t border-frame-line-soft bg-wood-lo px-4 py-6 text-caption text-on-wood-soft sm:px-6">
      <div className={`mx-auto grid w-full gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-start lg:gap-10 ${MODE_CONTENT_WIDTH}`}>
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 font-serif text-base font-bold text-on-wood">
            <LogoMark className="size-7" /> Cờ Lau
          </p>
          <p>Mini game thuộc ShanVerse.</p>
          <p className="max-w-sm">
            Bối cảnh và tên nhân vật lịch sử là lịch sử chung; tính cách, kỹ năng và lời thoại trong game là hư cấu.
            {build && <span className="whitespace-nowrap"> · Bản {build}</span>}
          </p>
        </div>

        <ContactBlock links={socialLinks()} variant={chosen} />

        <nav aria-label="Liên kết" className="lg:justify-self-end">
          <ul className="flex flex-wrap gap-x-4 lg:max-w-xs lg:justify-end">
            {links.map((l) => (
              <li key={l.label}>{item(l)}</li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
