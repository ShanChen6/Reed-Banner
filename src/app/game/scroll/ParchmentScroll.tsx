// Khung thư cuộn giấy dó dùng chung: đinh đồng và hai dây thừng son xoắn treo, hai cuộn giấy quấn quanh trục gỗ tiện đầu,
// tờ thư giấy dó có sợi và mép rách, tua rua son rủ ở hai đầu trục dưới, ấn đỏ "Cờ Lau" (ScrollSeal).
// Tách từ thư cuộn liên hệ ở footer (ContactBlock, Shan chọn 07/11/2026); form đăng nhập, đăng ký dùng lại (08/11/2026).
// Chuyển động nhẹ (tua rua đung đưa khi rê chuột hoặc focus) tắt khi bật giảm chuyển động. Dùng được ở server lẫn client.

import { useId, type ReactNode } from "react";
import styles from "./ParchmentScroll.module.css";

/** Id riêng cho bộ lọc SVG của từng thư cuộn (nhiều thư trên một trang không giẫm bộ lọc của nhau). */
function useScrollId() {
  return `colau${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

/** Ấn đỏ hai chữ "Cờ Lau": viền kép, chữ xếp dọc như ấn triện, nét mực không đều. Vị trí do nơi dùng đặt qua `className`. */
export function ScrollSeal({ className }: { className?: string }) {
  const uid = useScrollId();
  return (
    <svg className={`${styles.seal} ${className ?? ""}`} viewBox="0 0 60 60" aria-hidden>
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
 * Hai dây thừng son xoắn từ đinh đồng xuống hai đầu trục trên; dây luồn ra sau trục. Vẽ trong khung 640×62 và co giãn đều theo
 * bề rộng khối nên dây luôn dày đúng tỉ lệ: lõi dây, dải xoắn chéo, vệt sáng, bóng đổ, nút thắt ở đinh.
 */
function Cords({ uid }: { uid: string }) {
  const NAIL = { x: 320, y: 11 };
  const ties = [44, 596].map((x) => ({ x, y: 54 }));
  // Hai dây hơi võng, mỗi dây một độ võng khác nhau để không trông như vẽ bằng thước.
  const sag = [3, 2];
  return (
    <svg className={styles.cords} viewBox="0 0 640 62" aria-hidden>
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

/** Bộ lọc mép giấy rách thật (hai tầng nhiễu, thô rồi mịn). */
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

function Tassels() {
  return (
    <div className={styles.tassels} aria-hidden>
      {[styles.tasselL, styles.tasselR].map((side) => (
        <span key={side} className={`${styles.tassel} ${side}`}>
          <i />
          <b />
          <span />
        </span>
      ))}
    </div>
  );
}

/**
 * Thư cuộn treo: `children` là nội dung trên tờ giấy (chữ mực, tự lo kiểu). `className` cho khối ngoài (bề rộng tối đa,
 * mặc định 40rem), `bodyClassName` cho lề trong tờ giấy. Khối ngoài là `<section>` có `aria-label` khi truyền `label`.
 */
export function ParchmentScroll({
  label,
  className,
  bodyClassName,
  children,
}: {
  label?: string;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  const uid = useScrollId();
  const Tag = label ? "section" : "div";
  return (
    <Tag aria-label={label} className={`${styles.scroll} ${className ?? ""}`}>
      <Cords uid={uid} />
      <PaperFilters uid={uid} />
      <Roll />
      <div className={styles.sheet}>
        <div className={styles.sheetBg} style={{ filter: `url(#${uid}tear)` }} aria-hidden />
        <div className={`${styles.curl} ${styles.curlTop}`} aria-hidden />
        <div className={`${styles.curl} ${styles.curlBottom}`} aria-hidden />
        <div className={`${styles.sheetBody} ${bodyClassName ?? ""}`}>{children}</div>
      </div>
      <Roll />
      <Tassels />
    </Tag>
  );
}
