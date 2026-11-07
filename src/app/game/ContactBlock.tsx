"use client";

// Khối liên hệ ở footer, ba phương án theo chủ đề phong kiến (xem contactVariant.ts):
//   flags   — A. giá cờ lau: sào tre treo bảy lá cờ hiệu, mỗi lá một nền tảng, rê vào thì cờ tung bay và hiện chú thích.
//   scroll  — B. cuộn thư giấy dó: mỗi nền tảng một dòng thư tín kèm ấn triện đỏ; cũng là dạng danh sách cho điện thoại.
//   tablets — C. lệnh bài đồng treo tua son, rê vào thì đung đưa.
// Liên kết ngoài đang khóa (footerLinks.ts): vẫn hiện, bấm không chuyển trang. Mục nền tảng chờ (chưa có địa chỉ) mờ hơn.
// Biểu tượng Simple Icons (CC0). Chuyển động tắt khi người dùng bật giảm chuyển động.

import { useState, type ReactNode } from "react";
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
  swing,
}: {
  link: SocialLink;
  className: string;
  children: ReactNode;
  onActive?: (l: SocialLink | null) => void;
  swing?: boolean;
}) {
  const common = {
    className,
    "aria-label": ariaLabel(link),
    "data-pending": link.configured ? undefined : "",
    "data-swing": swing ? "" : undefined,
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
  return variant === "scroll" ? <Scroll links={links} /> : <Hanging links={links} variant={variant} />;
}

/* ——— A và C: sào tre treo cờ hoặc lệnh bài ——— */

function Hanging({ links, variant }: { links: readonly SocialLink[]; variant: "flags" | "tablets" }) {
  const [active, setActive] = useState<SocialLink | null>(null);
  const flags = variant === "flags";
  return (
    <section aria-label="Liên hệ" className={styles.block}>
      <h2 className={`${styles.title} text-kicker`}>{flags ? "Cờ hiệu liên lạc" : "Lệnh bài liên lạc"}</h2>
      <div className={styles.rack}>
        <div className={styles.rail} aria-hidden />
        <ul className={styles.hang} aria-label="Mạng xã hội">
          {links.map((l) => (
            <li key={l.label}>
              <Control link={l} className={`${styles.ctl} ${flags ? styles.flagShadow : ""}`} onActive={setActive} swing={!flags}>
                <span aria-hidden className={styles.cord} />
                {flags ? (
                  <span className={styles.cloth}>
                    <Glyph label={l.label} />
                  </span>
                ) : (
                  <>
                    <span className={styles.tablet}>
                      <Glyph label={l.label} />
                    </span>
                    <span aria-hidden className={styles.tassel} />
                  </>
                )}
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
        ) : flags ? (
          "Rê vào một lá cờ để truyền tin cho tác giả"
        ) : (
          "Chọn một lệnh bài để truyền tin cho tác giả"
        )}
      </p>
    </section>
  );
}

/* ——— B: cuộn thư giấy dó ——— */

function Scroll({ links }: { links: readonly SocialLink[] }) {
  return (
    <section aria-label="Liên hệ" className={styles.scroll}>
      <div className={styles.rod} aria-hidden />
      <div className={styles.paper}>
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
                <span aria-hidden className={styles.seal}>
                  {l.configured ? "Gửi" : "Chờ"}
                </span>
              </Control>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.rod} aria-hidden />
    </section>
  );
}
