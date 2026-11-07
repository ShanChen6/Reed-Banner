"use client";

// Thư cuộn liên hệ ở footer (Shan chọn phương án thư cuộn 07/11/2026): đinh đồng và hai dây thừng xoắn treo, hai cuộn giấy quấn quanh trục gỗ tiện đầu,
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

/**
 * Hai dây thừng son xoắn từ đinh đồng xuống hai đầu trục trên; dây luồn ra sau trục (không vắt phía trước) như bản đầu. Vẽ trong khung 640×86 và co giãn đều theo bề rộng khối nên dây luôn
 * dày đúng tỉ lệ: lõi dây, dải xoắn chéo (nét đứt vuông góc với dây), vệt sáng, bóng đổ, nút thắt ở đinh và vòng buộc quanh trục.
 */
function Cords({ uid }: { uid: string }) {
  const NAIL = { x: 320, y: 13 };
  const ties = [44, 596].map((x) => ({ x, y: 84 }));
  // Hai dây hơi võng, mỗi dây một độ võng khác nhau để không trông như vẽ bằng thước.
  const sag = [4.5, 3];
  return (
    <svg className={styles.cords} viewBox="0 0 640 86" aria-hidden>
      <defs>
        <filter id={`${uid}rs`} x="-5%" y="-5%" width="110%" height="125%">
          <feDropShadow dx="0" dy="3.5" stdDeviation="2.4" floodColor="#000" floodOpacity="0.55" />
        </filter>
        <radialGradient id={`${uid}ng`} cx="35%" cy="30%" r="75%">
          <stop offset="0" style={{ stopColor: "var(--paper-hi)" }} />
          <stop offset="0.3" style={{ stopColor: "var(--frame-gold-hi)" }} />
          <stop offset="0.75" style={{ stopColor: "var(--frame-bronze)" }} />
          <stop offset="1" style={{ stopColor: "var(--wood-lo)" }} />
        </radialGradient>
      </defs>
      {/* bóng của đinh trên tường */}
      <ellipse cx={NAIL.x + 3} cy={NAIL.y + 5} rx="13" ry="5" fill="#000" opacity="0.4" />
      <g filter={`url(#${uid}rs)`}>
        {ties.map((t, i) => {
          const mx = (NAIL.x + t.x) / 2 + (i === 0 ? -1 : 1) * 2;
          const my = (NAIL.y + t.y) / 2 + sag[i]!;
          const d = `M${NAIL.x} ${NAIL.y + 4} Q${mx} ${my} ${t.x} ${t.y - 2}`;
          return (
            <g key={t.x} fill="none">
              <path d={d} style={{ stroke: "var(--lacquer)" }} strokeWidth="6.5" strokeLinecap="round" />
              <path d={d} style={{ stroke: "var(--lacquer-lo)" }} strokeWidth="6.5" strokeDasharray="1.7 3.1" opacity="0.8" />
              <path d={d} style={{ stroke: "var(--lacquer-hi)" }} strokeWidth="1.5" strokeDasharray="2.4 3.4" opacity="0.8" transform="translate(-1.2 -1.4)" />
            </g>
          );
        })}
        {/* nút thắt hai dây ở đầu đinh */}
        <circle cx={NAIL.x} cy={NAIL.y + 6.5} r="6" style={{ fill: "var(--lacquer)" }} />
        <circle cx={NAIL.x - 1.8} cy={NAIL.y + 4.8} r="1.9" style={{ fill: "var(--lacquer-hi)" }} />
        <path d={`M${NAIL.x - 3} ${NAIL.y + 11} q-3 7 -1.5 13`} fill="none" style={{ stroke: "var(--lacquer)" }} strokeWidth="2.8" strokeLinecap="round" />
        <path d={`M${NAIL.x + 3} ${NAIL.y + 11} q3 6 1.5 12`} fill="none" style={{ stroke: "var(--lacquer-lo)" }} strokeWidth="2.6" strokeLinecap="round" />
      </g>
      {/* đinh đồng: mũ tròn, viền, điểm sáng */}
      <circle cx={NAIL.x} cy={NAIL.y - 1} r="8.5" fill={`url(#${uid}ng)`} style={{ stroke: "var(--wood-lo)" }} strokeWidth="1.4" />
      <circle cx={NAIL.x - 2.6} cy={NAIL.y - 3.8} r="2.2" style={{ fill: "var(--paper-hi)" }} opacity="0.85" />
    </svg>
  );
}

/** Bộ lọc SVG của một thư cuộn: mép giấy rách thật (hai tầng nhiễu, thô rồi mịn) và xơ giấy. Id riêng từng khối. */
function PaperFilters({ uid }: { uid: string }) {
  return (
    <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
      <defs>
        <filter id={`${uid}tear`} x="-4%" y="-7%" width="108%" height="114%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035 0.05" numOctaves="4" seed="11" result="coarse" />
          <feDisplacementMap in="SourceGraphic" in2="coarse" scale="11" xChannelSelector="R" yChannelSelector="G" result="a" />
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="5" result="fine" />
          <feDisplacementMap in="a" in2="fine" scale="3.4" xChannelSelector="G" yChannelSelector="R" />
        </filter>
      </defs>
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
      {/* Đinh đồng trên tường và hai dây thừng buộc vào hai đầu trục trên. */}
      <Cords uid={uid} />
      <PaperFilters uid={uid} />
      <Roll />
      <div className={styles.sheet}>
        <div className={styles.sheetBg} style={{ filter: `url(#${uid}tear)` }} aria-hidden />
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
