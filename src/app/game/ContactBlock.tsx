"use client";

// Khối liên hệ ở footer, ba phương án theo chủ đề phong kiến (xem contactVariant.ts):
//   flags   — A. giá cờ lau: sào tre có đốt, hai đầu cắm bông lau, bảy lá cờ lụa đuôi nheo buộc dây vào sào; rê vào thì cờ tung bay.
//   scroll  — B. thư cuộn: giấy dó sợi giữa hai trục gỗ tiện đầu, dây lụa treo, mỗi nền tảng một dòng thư tín, ấn "Cờ Lau" đóng ở góc.
//   tablets — C. lệnh bài đồng treo tua son, rê vào thì đung đưa.
// Liên kết ngoài đang khóa (footerLinks.ts): vẫn hiện, bấm không chuyển trang. Mục nền tảng chờ (chưa có địa chỉ) mờ hơn.
// Biểu tượng Simple Icons (CC0). Chuyển động tắt khi người dùng bật giảm chuyển động.

import { useId, useState, type ReactNode } from "react";
import type { ContactVariant } from "./contactVariant";
import { SOCIAL_BLURB, type SocialLink } from "./footerLinks";
import styles from "./ContactBlock.module.css";
import { SOCIAL_ICON_PATHS } from "./socialIcons";

function Glyph({ label }: { label: string }) {
  const d = SOCIAL_ICON_PATHS[label];
  return d ? (
    <svg viewBox="0 0 24 24" aria-hidden className={styles.glyph}>
      <path d={d} />
    </svg>
  ) : (
    <span aria-hidden>{label.slice(0, 1)}</span>
  );
}

/** Nền tảng chờ ghi "Sắp ra mắt"; còn lại là lời giới thiệu. */
const blurbOf = (l: SocialLink) => (l.configured ? SOCIAL_BLURB[l.label] : "Sắp ra mắt");
/** Liên kết đang khóa đọc là tên nền tảng; liên kết thật nói thêm "mở ở thẻ mới". */
const ariaLabel = (l: SocialLink) => (l.href ? `${l.label} (mở ở thẻ mới)` : l.label);

/** Một nền tảng: liên kết thật (mở thẻ mới) hoặc nút không làm gì khi đang khóa. */
function Control({
  link,
  className,
  children,
  onActive,
}: {
  link: SocialLink;
  className: string;
  children: ReactNode;
  onActive?: (l: SocialLink | null) => void;
}) {
  const common = {
    className,
    "aria-label": ariaLabel(link),
    "data-pending": link.configured ? undefined : "",
    onPointerEnter: () => onActive?.(link),
    onPointerLeave: () => onActive?.(null),
    onFocus: () => onActive?.(link),
    onBlur: () => onActive?.(null),
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

export default function ContactBlock({ links, variant }: { links: readonly SocialLink[]; variant: ContactVariant }) {
  if (links.length === 0) return null;
  if (variant === "scroll") return <Scroll links={links} />;
  // Giá cờ và lệnh bài chỉ vừa một hàng từ 640px; điện thoại hiện thư cuộn dạng danh sách (ẩn bằng CSS, không dựng lại khi đổi cỡ).
  return (
    <div>
      <div className={styles.wide}>{variant === "flags" ? <Flags links={links} /> : <Tablets links={links} />}</div>
      <div className={styles.narrow}>
        <Scroll links={links} />
      </div>
    </div>
  );
}

/* ——— A. Giá cờ lau ——— */

/** Bông lau: các sợi lông mịn tỏa ra từ đầu cuống (xác định, không ngẫu nhiên để máy chủ và trình duyệt giống nhau). */
function plume(cx: number, cy: number, base: number, size: number): string[] {
  const out: string[] = [];
  for (let k = -9; k <= 9; k++) {
    const t = k / 9;
    const a = ((base + t * 40 + Math.sin(k * 2.3) * 4) * Math.PI) / 180;
    const len = size * (1 - Math.abs(t) * 0.28) + Math.cos(k * 1.7) * 2;
    const ex = cx + Math.sin(a) * len;
    const ey = cy - Math.cos(a) * len;
    const bend = a + t * 0.5;
    const qx = cx + Math.sin(bend) * len * 0.55;
    const qy = cy - Math.cos(bend) * len * 0.55 + len * 0.12;
    out.push(`M${cx + t * 2} ${cy + 7} Q${qx.toFixed(1)} ${qy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`);
  }
  return out;
}

function Reeds({ className }: { className: string }) {
  const tops: [number, number, number][] = [
    [18, 34, -22],
    [44, 14, 0],
    [70, 30, 20],
  ];
  return (
    <svg className={className} viewBox="0 0 88 110" aria-hidden>
      {tops.map(([x, y], i) => (
        <path key={`s${i}`} d={`M44 108 Q${(44 + x) / 2} ${(108 + y) / 2 + 6} ${x} ${y + 7}`} style={{ stroke: "var(--on-wood-soft)" }} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      ))}
      {tops.map(([x, y, a]) => {
        const d = plume(x, y, a, 28);
        return (
          <g key={`${x}-${y}`} fill="none" strokeLinecap="round">
            {d.map((p, i) => (
              <path key={`g${i}`} d={p} style={{ stroke: "var(--title-on-wood)" }} strokeWidth="3" opacity="0.2" />
            ))}
            {d.map((p, i) => (
              <path key={`f${i}`} d={p} style={{ stroke: "var(--title-on-wood)" }} strokeWidth="0.9" opacity="0.92" />
            ))}
          </g>
        );
      })}
      <rect x="40" y="84" width="8" height="7" rx="1.5" style={{ fill: "var(--lacquer)" }} />
    </svg>
  );
}

/** Lá cờ lụa đuôi nheo: nếp gấp dọc, viền thêu vàng, đường may ở gấu trên, dây buộc vào sào. */
function Flag({ label, uid }: { label: string; uid: string }) {
  const d = SOCIAL_ICON_PATHS[label];
  const body = "M3 5 C10 3 16 6 24 4.6 C32 3.2 40 6 45 4.5 L45 60 C45 62.5 44.4 64 43.6 65.6 C41 69.5 38.5 73 36 75.5 L24 63 L12 75.5 C9.5 73 7 69.5 4.4 65.6 C3.6 64 3 62.5 3 60 Z";
  return (
    <svg className={styles.flag} viewBox="0 0 48 78" aria-hidden>
      <defs>
        <linearGradient id={`${uid}c`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--lacquer-hi)" }} />
          <stop offset="1" style={{ stopColor: "var(--lacquer)" }} />
        </linearGradient>
        <linearGradient id={`${uid}p`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.3" />
          <stop offset="0.12" stopColor="#000" stopOpacity="0" />
          <stop offset="0.26" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.42" stopColor="#000" stopOpacity="0.24" />
          <stop offset="0.58" stopColor="#000" stopOpacity="0" />
          <stop offset="0.72" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="0.88" stopColor="#000" stopOpacity="0.22" />
          <stop offset="1" stopColor="#000" stopOpacity="0.32" />
        </linearGradient>
        <clipPath id={`${uid}k`}>
          <path d={body} />
        </clipPath>
      </defs>
      <path d={body} fill={`url(#${uid}c)`} />
      <rect x="0" y="0" width="48" height="78" fill={`url(#${uid}p)`} clipPath={`url(#${uid}k)`} />
      <g clipPath={`url(#${uid}k)`}>
        <rect x="0" y="0" width="48" height="13" fill="#000" opacity="0.2" />
        <path d="M3 11.5 H45" fill="none" style={{ stroke: "var(--frame-gold-hi)" }} strokeWidth="0.9" strokeDasharray="2 1.6" opacity="0.9" />
      </g>
      <path d={body} fill="none" style={{ stroke: "var(--frame-gold-hi)" }} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M7 15.5 H41" fill="none" style={{ stroke: "var(--frame-gold-hi)" }} strokeWidth="0.7" opacity="0.7" />
      {d && (
        <g transform="translate(13 22) scale(0.92)">
          <path d={d} fill="#000" opacity="0.4" transform="translate(0 1)" />
          <path d={d} style={{ fill: "var(--title-on-wood)" }} />
        </g>
      )}
      {/* dây buộc quanh sào */}
      <path d="M11 6 C10 -3 19 -3 18 6" fill="none" style={{ stroke: "var(--frame-gold)" }} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M30 6 C29 -3 38 -3 37 6" fill="none" style={{ stroke: "var(--frame-gold)" }} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function Flags({ links }: { links: readonly SocialLink[] }) {
  const [active, setActive] = useState<SocialLink | null>(null);
  const uid = useId().replace(/:/g, "");
  return (
    <section aria-label="Liên hệ" className={styles.block}>
      <h2 className={`${styles.title} text-kicker`}>Cờ hiệu liên lạc</h2>
      <div className={styles.rack}>
        <Reeds className={`${styles.reeds} ${styles.reedsLeft}`} />
        <Reeds className={`${styles.reeds} ${styles.reedsRight}`} />
        <div className={styles.pole} aria-hidden />
        <ul className={styles.hang} aria-label="Mạng xã hội">
          {links.map((l) => (
            <li key={l.label}>
              <Control link={l} className={`${styles.ctl} ${styles.flagCtl}`} onActive={setActive}>
                <Flag label={l.label} uid={`${uid}${l.label}`} />
                <span className={styles.name}>{l.label}</span>
              </Control>
            </li>
          ))}
        </ul>
      </div>
      <p className={styles.caption} aria-live="polite">
        {active ? (
          <>
            <b>{active.label}</b> · {blurbOf(active)}
          </>
        ) : (
          "Rê vào một lá cờ để truyền tin cho tác giả"
        )}
      </p>
    </section>
  );
}

/* ——— C. Lệnh bài ——— */

function Tablets({ links }: { links: readonly SocialLink[] }) {
  const [active, setActive] = useState<SocialLink | null>(null);
  return (
    <section aria-label="Liên hệ" className={styles.block}>
      <h2 className={`${styles.title} text-kicker`}>Lệnh bài liên lạc</h2>
      <div className={styles.rack2}>
        <div className={styles.rail} aria-hidden />
        <ul className={styles.hang} aria-label="Mạng xã hội">
          {links.map((l) => (
            <li key={l.label}>
              <Control link={l} className={`${styles.ctl} ${styles.tabletCtl}`} onActive={setActive}>
                <span aria-hidden className={styles.cord} />
                <span className={styles.tablet}>
                  <Glyph label={l.label} />
                </span>
                <span aria-hidden className={styles.tassel} />
                <span className={styles.name}>{l.label}</span>
              </Control>
            </li>
          ))}
        </ul>
      </div>
      <p className={styles.caption} aria-live="polite">
        {active ? (
          <>
            <b>{active.label}</b> · {blurbOf(active)}
          </>
        ) : (
          "Chọn một lệnh bài để truyền tin cho tác giả"
        )}
      </p>
    </section>
  );
}

/* ——— B. Thư cuộn ——— */

/** Bộ lọc SVG của một thư cuộn: mép giấy rách nhẹ và nét mực của ấn. Id riêng từng khối để nhiều khối trên một trang không đè nhau. */
function ScrollFilters({ uid }: { uid: string }) {
  return (
    <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
      <defs>
        <filter id={`${uid}deckle`} x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035 0.05" numOctaves="3" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`${uid}stamp`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="g" />
          <feDisplacementMap in="SourceGraphic" in2="g" scale="1.6" result="d" />
          <feComponentTransfer in="g" result="holes">
            <feFuncA type="discrete" tableValues="0 1 1 1 1 1" />
          </feComponentTransfer>
          <feComposite in="d" in2="holes" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

/** Ấn đỏ "CỜ LAU ẤN TÍN": viền kép, bốn chữ xếp 2×2 như ấn triện, nét mực không đều. */
function Seal({ className, uid }: { className: string; uid: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" aria-hidden>
      <g filter={`url(#${uid}stamp)`} style={{ fill: "var(--lacquer)", stroke: "var(--lacquer)" }}>
        <rect x="2" y="2" width="56" height="56" rx="4" fill="none" strokeWidth="3" />
        <rect x="7" y="7" width="46" height="46" rx="2" fill="none" strokeWidth="1" />
        <g stroke="none" fontFamily="serif" fontWeight="800" fontSize="14" lengthAdjust="spacingAndGlyphs">
          <text x="9" y="27" textLength="18">CỜ</text>
          <text x="31" y="27" textLength="21">LAU</text>
          <text x="9" y="47" textLength="18">ẤN</text>
          <text x="31" y="47" textLength="21">TÍN</text>
        </g>
      </g>
    </svg>
  );
}

function Scroll({ links }: { links: readonly SocialLink[] }) {
  const uid = `colau${useId().replace(/:/g, "")}`;
  return (
    <section aria-label="Liên hệ" className={styles.scroll}>
      <ScrollFilters uid={uid} />
      <svg className={styles.hangCord} viewBox="0 0 100 44" preserveAspectRatio="none" aria-hidden>
        <path d="M3 44 L50 6 L97 44" fill="none" style={{ stroke: "var(--lacquer-hi)" }} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        <circle cx="50" cy="5" r="3.4" fill="none" style={{ stroke: "var(--frame-gold-hi)" }} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className={styles.rod} aria-hidden>
        <span className={`${styles.finial} ${styles.finialL}`} />
        <span className={`${styles.finial} ${styles.finialR}`} />
      </div>
      <div className={styles.sheet}>
        <div className={styles.sheetBg} style={{ filter: `url(#${uid}deckle)` }} aria-hidden />
        <div className={`${styles.curl} ${styles.curlTop}`} aria-hidden />
        <div className={`${styles.curl} ${styles.curlBottom}`} aria-hidden />
        <div className={styles.sheetBody}>
          <h2 className={styles.paperTitle}>Thư tín bốn phương</h2>
          <p className={styles.paperSub}>Gửi thư về doanh trại tác giả</p>
          <ul className={styles.letters} aria-label="Mạng xã hội">
            {links.map((l) => (
              <li key={l.label}>
                <Control link={l} className={styles.row ?? ""}>
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
          <Seal className={styles.seal ?? ""} uid={uid} />
        </div>
      </div>
      <div className={styles.rod} aria-hidden>
        <span className={`${styles.finial} ${styles.finialL}`} />
        <span className={`${styles.finial} ${styles.finialR}`} />
      </div>
    </section>
  );
}
