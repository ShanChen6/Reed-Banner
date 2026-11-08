"use client";

// Thư cuộn liên hệ ở footer (Shan chọn phương án thư cuộn 07/11/2026). Khung thư cuộn (đinh, dây, trục, tờ giấy, tua rua, ấn) dùng chung
// ở scroll/ParchmentScroll.tsx; ở đây chỉ có nội dung: mỗi nền tảng một dòng thư tín.
// Liên kết ngoài đang khóa (footerLinks.ts): vẫn hiện, bấm không chuyển trang; nền tảng chờ (chưa có địa chỉ) mờ hơn.
// Biểu tượng Simple Icons (CC0). Chuyển động nhẹ (dòng thư sáng lên) tắt khi bật giảm chuyển động.
// Khi có tranh thư cuộn vẽ tay (docs/06-art/prompts/thu-cuon-lien-he.md), thay các lớp CSS bằng ảnh làm khung, giữ nguyên chữ và liên kết.

import type { ReactNode } from "react";
import { CONTACT_PENDING_LABEL, CONTACT_SUB, CONTACT_TITLE, SOCIAL_BLURB, type SocialLink } from "./footerLinks";
import styles from "./ContactBlock.module.css";
import { ParchmentScroll, ScrollSeal } from "./scroll/ParchmentScroll";
import { SOCIAL_ICON_PATHS } from "./socialIcons";

function Glyph({ label }: { label: string }) {
  const d = SOCIAL_ICON_PATHS[label];
  return d ? (
    <svg viewBox="0 0 24 24" aria-hidden className={styles.glyph}>
      <path d={d} />
    </svg>
  ) : (
    <span aria-hidden className={styles.glyph}>
      {label.slice(0, 1)}
    </span>
  );
}

const blurbOf = (l: SocialLink) => SOCIAL_BLURB[l.label];
/** Liên kết đang khóa đọc là tên nền tảng; liên kết thật nói thêm "mở ở thẻ mới". */
const ariaLabel = (l: SocialLink) => (l.href ? `${l.label} (mở ở thẻ mới)` : l.label);

/** Một nền tảng: liên kết thật (mở thẻ mới) hoặc nút không làm gì khi đang khóa. */
function Control({ link, children, className }: { link: SocialLink; children: ReactNode; className?: string }) {
  const common = {
    className: className ?? styles.row ?? "",
    "aria-label": ariaLabel(link),
    "data-pending": link.configured ? undefined : "",
  };
  return link.href ? (
    <a {...common} href={link.href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <button {...common} type="button" aria-disabled="true">
      {children}
    </button>
  );
}

export default function ContactBlock({ links }: { links: readonly SocialLink[] }) {
  if (links.length === 0) return null;
  // Nền tảng đã có địa chỉ hiện từng dòng thư; nền tảng chờ gộp thành một dòng biểu tượng ở cuối thư (gọn hơn).
  const ready = links.filter((l) => l.configured);
  const waiting = links.filter((l) => !l.configured);
  return (
    <ParchmentScroll label="Liên hệ">
      <h2 className={styles.paperTitle}>{CONTACT_TITLE}</h2>
      <p className={styles.paperSub}>{CONTACT_SUB}</p>
      <ul className={styles.letters} aria-label="Mạng xã hội">
        {ready.map((l) => (
          <li key={l.label}>
            <Control link={l}>
              <Glyph label={l.label} />
              <span className={styles.rowText}>
                <span className={styles.rowName}>{l.label}</span>
                <span className={styles.rowBlurb}>{blurbOf(l)}</span>
              </span>
              <span aria-hidden className={styles.chev}>
                ›
              </span>
            </Control>
          </li>
        ))}
      </ul>
      {waiting.length > 0 && (
        <div className={styles.waiting}>
          <span className={styles.waitingLabel}>{CONTACT_PENDING_LABEL}</span>
          <ul className={styles.waitingList} aria-label="Mạng xã hội sắp mở">
            {waiting.map((l) => (
              <li key={l.label}>
                <Control link={l} className={styles.waitBtn ?? ""}>
                  <Glyph label={l.label} />
                </Control>
              </li>
            ))}
          </ul>
        </div>
      )}
      <ScrollSeal className={styles.seal} />
    </ParchmentScroll>
  );
}
