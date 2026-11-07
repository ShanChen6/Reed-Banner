"use client";

// Lucian UX/UI Prompt #306 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#306
//
// Phần "Liên hệ" ở Chiến trường. Từ 768px: các nền tảng mạng xã hội quay quanh huy hiệu Cờ Lau trên một hoặc hai quỹ đạo
// (hai vòng quay ngược chiều, biểu tượng luôn thẳng); rê chuột hoặc focus một biểu tượng thì dừng quay, vẽ đường dữ liệu chảy
// tới huy hiệu và đổi chú thích. Dưới 768px (điện thoại): không dựng quỹ đạo, hiện danh sách liên hệ (Shan chốt 07/11/2026).
// Mục chưa có địa chỉ vẫn hiện, bấm chỉ báo "đang chuẩn bị". Dòng chữ liên hệ ở footer là lối đi phụ cho người không dùng được
// vật đang chuyển động.

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { LogoMark } from "./art/logo";
import { socialPendingNotice, type SocialLink } from "./footerLinks";
import styles from "./OrbitingSocials.module.css";
import { SOCIAL_ICON_PATHS } from "./socialIcons";
import { linkPath, ORBIT_HEIGHT, ORBIT_WIDTH, slotAngles, SOCIAL_BLURB, splitRings } from "./socialOrbit";

const ORBIT_QUERY = "(min-width: 768px)";
const DEFAULT_CAPTION = "Chọn một nền tảng để kết giao cùng tác giả";

/** Quỹ đạo chỉ dựng từ 768px; máy chủ trả false (danh sách) nên điện thoại không bao giờ dựng quỹ đạo. */
function useOrbitVisible(): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(ORBIT_QUERY);
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () => window.matchMedia(ORBIT_QUERY).matches,
    () => false,
  );
}

function Glyph({ label, className }: { label: string; className?: string }) {
  const d = SOCIAL_ICON_PATHS[label];
  return d ? (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d={d} />
    </svg>
  ) : (
    <span aria-hidden className={className}>
      {label.slice(0, 1)}
    </span>
  );
}

/** Thông báo "đang chuẩn bị" tự ẩn sau 4 giây. */
function useNotice() {
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(t);
  }, [notice]);
  return [notice, setNotice] as const;
}

const ariaLabel = (l: SocialLink) => (l.href ? `${l.label} (mở ở thẻ mới)` : `${l.label}, sắp ra mắt`);

export default function OrbitingSocials({ links }: { links: readonly SocialLink[] }) {
  return useOrbitVisible() ? <Orbit links={links} /> : <SocialList links={links} />;
}

/* ——— Laptop: quỹ đạo ——— */

function Orbit({ links }: { links: readonly SocialLink[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [path, setPath] = useState("");
  const [paused, setPaused] = useState(false);
  const [notice, setNotice] = useNotice();

  // Đường dữ liệu: đo tâm biểu tượng đang chọn so với khung (khung 340px có thể bị co, nên chia cho tỉ lệ k).
  useLayoutEffect(() => {
    const root = rootRef.current;
    const btn = active === null ? null : btnRefs.current[active];
    if (!root || !btn) {
      setPath("");
      return;
    }
    const rr = root.getBoundingClientRect();
    const k = ORBIT_WIDTH / (rr.width || ORBIT_WIDTH);
    const br = btn.getBoundingClientRect();
    setPath(linkPath((br.left + br.width / 2 - rr.left) * k, (br.top + br.height / 2 - rr.top) * k));
  }, [active]);

  // Ngoài màn hình thì dừng quay cho nhẹ máy.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setPaused(!e?.isIntersecting));
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const rings = splitRings(links.length);
  // Chỉ số đầu của từng vòng trong danh sách (tính trước để không gán lại biến khi dựng giao diện).
  const starts = rings.map((_, i) => rings.slice(0, i).reduce((sum, r) => sum + r.count, 0));
  const current = active === null ? null : links[active];

  return (
    <div
      ref={rootRef}
      data-hold={active !== null || undefined}
      data-paused={paused || undefined}
      className={`ui-frame ${styles.root}`}
    >
      <div className={styles.hd}>
        <small className={`text-kicker ${styles.kick}`}>Liên hệ</small>
        <h2 className={`font-serif ${styles.title}`}>Kết giao bốn phương</h2>
        <span className={styles.cap} aria-live="polite">
          {notice ?? (current ? (
            <>
              <b>{current.label}</b> · {current.href ? SOCIAL_BLURB[current.label] : "Sắp ra mắt"}
            </>
          ) : (
            DEFAULT_CAPTION
          ))}
        </span>
      </div>

      <svg className={styles.ln} viewBox={`0 0 ${ORBIT_WIDTH} ${ORBIT_HEIGHT}`} aria-hidden>
        <path d={path} data-on={path ? "" : undefined} />
      </svg>

      <div className={styles.st}>
        {rings.map((ring, ri) => {
          const base = starts[ri]!;
          const items = links.slice(base, base + ring.count);
          return (
            <div
              key={ring.r}
              className={styles.rg}
              style={{ "--r": `${ring.r}px`, "--t": `${ring.t}s`, "--dir": ring.reverse ? "reverse" : "normal", "--rdir": ring.reverse ? "normal" : "reverse" } as React.CSSProperties}
            >
              {slotAngles(items.length, ring.a0).map((a, k) => {
                const idx = base + k;
                const l = items[k]!;
                const common = {
                  ref: (el: HTMLElement | null) => {
                    btnRefs.current[idx] = el;
                  },
                  className: styles.ic,
                  "aria-label": ariaLabel(l),
                  "data-on": active === idx ? "" : undefined,
                  "data-pending": l.href ? undefined : "",
                  onPointerEnter: () => setActive(idx),
                  onPointerLeave: () => setActive((cur) => (cur === idx ? null : cur)),
                  onFocus: () => setActive(idx),
                  onBlur: () => setActive((cur) => (cur === idx ? null : cur)),
                };
                return (
                  <div key={l.label} className={styles.sl} style={{ transform: `rotate(${a}deg) translateX(${ring.r}px) rotate(${-a}deg)` }}>
                    <div className={styles.up}>
                      {l.href ? (
                        <a {...common} href={l.href} target="_blank" rel="noopener noreferrer">
                          <Glyph label={l.label} />
                        </a>
                      ) : (
                        <button {...common} type="button" onClick={() => setNotice(socialPendingNotice(l.label))}>
                          <Glyph label={l.label} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
        <div className={styles.hb} aria-hidden>
          <LogoMark className="size-11" />
        </div>
      </div>
    </div>
  );
}

/* ——— Điện thoại: danh sách ——— */

function SocialList({ links }: { links: readonly SocialLink[] }) {
  const [notice, setNotice] = useNotice();
  const row = "flex min-h-14 w-full items-center gap-3 rounded-lg border border-frame-line-soft bg-wood-inset px-3 py-2 text-left";
  const body = (l: SocialLink): ReactNode => (
    <>
      <Glyph label={l.label} className="size-6 shrink-0 fill-current text-frame-gold-hi" />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-title-on-wood">{l.label}</span>
        <span className="block text-caption text-on-wood-soft">{l.href ? SOCIAL_BLURB[l.label] : "Sắp ra mắt"}</span>
      </span>
      {l.href && <span aria-hidden className="text-frame-gold-hi">›</span>}
    </>
  );
  return (
    <div className="ui-frame w-full max-w-md p-4">
      <p className="text-kicker text-frame-gold-hi">Liên hệ</p>
      <h2 className="mt-1 font-serif text-xl font-black text-title-on-wood">Kết giao bốn phương</h2>
      <ul className="mt-3 flex flex-col gap-2" aria-label="Mạng xã hội">
        {links.map((l) => (
          <li key={l.label}>
            {l.href ? (
              <a href={l.href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel(l)} className={`${row} hover:border-frame-gold`}>
                {body(l)}
              </a>
            ) : (
              <button type="button" aria-label={ariaLabel(l)} onClick={() => setNotice(socialPendingNotice(l.label))} className={`${row} cursor-pointer opacity-80`}>
                {body(l)}
              </button>
            )}
          </li>
        ))}
      </ul>
      <p role="status" aria-live="polite" className={notice ? "mt-3 rounded border border-frame-gold/40 bg-black/30 px-3 py-2 text-caption text-title-on-wood" : "sr-only"}>
        {notice}
      </p>
    </div>
  );
}
