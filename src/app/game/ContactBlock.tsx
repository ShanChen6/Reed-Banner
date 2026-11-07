"use client";

// Thư cuộn liên hệ ở footer (Shan chọn phương án thư cuộn 07/11/2026): đinh và dây lụa treo, hai cuộn giấy quấn quanh trục gỗ tiện đầu,
// tờ thư giấy dó có sợi và mép rách, ấn đỏ "Cờ Lau", tua rua son rủ ở hai đầu trục dưới. Mỗi nền tảng một dòng thư tín.
// Liên kết ngoài đang khóa (footerLinks.ts): vẫn hiện, bấm không chuyển trang; nền tảng chờ (chưa có địa chỉ) mờ hơn.
// Biểu tượng Simple Icons (CC0). Chuyển động nhẹ (tua rua đung đưa, dòng thư sáng lên) tắt khi bật giảm chuyển động.
// Khi có tranh thư cuộn vẽ tay (docs/06-art/prompts/thu-cuon-lien-he.md), thay các lớp CSS bằng ảnh làm khung, giữ nguyên chữ và liên kết.

import { useId, type ReactNode } from "react";
import { CONTACT_PENDING, CONTACT_SUB, CONTACT_TITLE, SOCIAL_BLURB, type SocialLink } from "./footerLinks";
import styles from "./ContactBlock.module.css";
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

/** Nền tảng chờ ghi dòng "Trạm thư sắp mở"; còn lại là lời giới thiệu. */
const blurbOf = (l: SocialLink) => (l.configured ? SOCIAL_BLURB[l.label] : CONTACT_PENDING);
/** Liên kết đang khóa đọc là tên nền tảng; liên kết thật nói thêm "mở ở thẻ mới". */
const ariaLabel = (l: SocialLink) => (l.href ? `${l.label} (mở ở thẻ mới)` : l.label);

/** Một nền tảng: liên kết thật (mở thẻ mới) hoặc nút không làm gì khi đang khóa. */
function Control({ link, children }: { link: SocialLink; children: ReactNode }) {
  const common = {
    className: styles.row ?? "",
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

/** Ấn đỏ hai chữ "Cờ Lau": viền kép, chữ xếp dọc như ấn triện, nét mực không đều (bộ lọc có id riêng từng khối). */
function Seal({ uid }: { uid: string }) {
  return (
    <svg className={styles.seal} viewBox="0 0 60 60" aria-hidden>
      <defs>
        <filter id={`${uid}stamp`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="g" />
          <feDisplacementMap in="SourceGraphic" in2="g" scale="1.6" result="d" />
          <feComponentTransfer in="g" result="holes">
            <feFuncA type="discrete" tableValues="0 1 1 1 1 1" />
          </feComponentTransfer>
          <feComposite in="d" in2="holes" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${uid}stamp)`} style={{ fill: "var(--lacquer)", stroke: "var(--lacquer)" }}>
        <rect x="2" y="2" width="56" height="56" rx="4" fill="none" strokeWidth="3" />
        <rect x="7" y="7" width="46" height="46" rx="2" fill="none" strokeWidth="1" />
        <g stroke="none" fontFamily="serif" fontWeight="800" fontSize="21" textAnchor="middle">
          <text x="30" y="29" textLength="30" lengthAdjust="spacingAndGlyphs">
            Cờ
          </text>
          <text x="30" y="50" textLength="34" lengthAdjust="spacingAndGlyphs">
            Lau
          </text>
        </g>
      </g>
    </svg>
  );
}

/** Cuộn giấy quanh một trục gỗ: trục nhô ra hai đầu, đầu tiện tròn. */
function Roll() {
  return (
    <div className={styles.rollWrap} aria-hidden>
      <span className={styles.dowel}>
        <span className={`${styles.finial} ${styles.finialL}`} />
        <span className={`${styles.finial} ${styles.finialR}`} />
      </span>
      <span className={styles.roll} />
    </div>
  );
}

export default function ContactBlock({ links }: { links: readonly SocialLink[] }) {
  const uid = `colau${useId().replace(/:/g, "")}`;
  if (links.length === 0) return null;
  return (
    <section aria-label="Liên hệ" className={styles.scroll}>
      {/* Đinh trên tường và hai dây lụa buộc vào hai đầu trục trên. */}
      <svg className={styles.hangCord} viewBox="0 0 100 68" preserveAspectRatio="none" aria-hidden>
        <path d="M2 68 L50 9 L98 68" fill="none" style={{ stroke: "var(--lacquer)" }} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d="M2 68 L50 9 L98 68" fill="none" style={{ stroke: "var(--lacquer-hi)" }} strokeWidth="1.2" strokeDasharray="3 3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <circle cx="50" cy="7" r="4" style={{ fill: "var(--frame-gold-hi)", stroke: "var(--wood-lo)" }} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        <circle cx="50" cy="7" r="1.5" style={{ fill: "var(--wood-lo)" }} />
      </svg>
      <Roll />
      <div className={styles.sheet}>
        <div className={styles.sheetBg} aria-hidden />
        <div className={`${styles.curl} ${styles.curlTop}`} aria-hidden />
        <div className={`${styles.curl} ${styles.curlBottom}`} aria-hidden />
        <div className={styles.sheetBody}>
          <h2 className={styles.paperTitle}>{CONTACT_TITLE}</h2>
          <p className={styles.paperSub}>{CONTACT_SUB}</p>
          <ul className={styles.letters} aria-label="Mạng xã hội">
            {links.map((l) => (
              <li key={l.label}>
                <Control link={l}>
                  <Glyph label={l.label} />
                  <span className={styles.rowText}>
                    <span className={styles.rowName}>{l.label}</span>
                    <span className={styles.rowBlurb}>{blurbOf(l)}</span>
                  </span>
                  {l.configured && (
                    <span aria-hidden className={styles.chev}>
                      ›
                    </span>
                  )}
                </Control>
              </li>
            ))}
          </ul>
          <Seal uid={uid} />
        </div>
      </div>
      <Roll />
      <div className={styles.tassels} aria-hidden>
        <span className={`${styles.tassel} ${styles.tasselL}`}>
          <i />
          <b />
          <span />
        </span>
        <span className={`${styles.tassel} ${styles.tasselR}`}>
          <i />
          <b />
          <span />
        </span>
      </div>
    </section>
  );
}
