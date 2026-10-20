// Chân dung nhân vật dạng huy hiệu tròn, vẽ bằng SVG theo cùng phong cách khắc gỗ với ô cờ.
// Đây là hình tạm cho tới khi có chân dung của họa sĩ (docs/design/13-hinh-anh.md mục 2.4).
// Mỗi người khác nhau ở mũ/tóc, màu áo và đồ cầm tay theo nghề, để nhận ra được ở cỡ 32 px.

import { useId } from "react";
import type { Element, Profession } from "@/core";
import { ELEMENT_COLOR } from "./icons";
import { INK } from "./tiles";

const SKIN = "#e2b07f";
const PAPER = "#f6ecd4";
const BRONZE = "#d4a24c";
const ink = { stroke: INK, strokeWidth: 1.8, strokeLinejoin: "round", strokeLinecap: "round" } as const;

type Head = "topknot" | "bun" | "nonLa" | "scarf" | "scholar" | "wrap";
type Prop = "reedFlag" | "flameOrb" | "spearShield" | "gourd" | "fan" | "slips";

interface Look {
  readonly head: Head;
  readonly robe: string;
  readonly prop: Prop;
  /** Giáp vai cho người cầm quân. */
  readonly armor?: boolean;
}

/** Diện mạo theo mã nhân vật trong src/core/roster. */
const LOOKS: Readonly<Record<string, Look>> = {
  dinhBoLinh: { head: "topknot", robe: "#2f4a6b", prop: "reedFlag", armor: true },
  haVan: { head: "bun", robe: "#7a2c1d", prop: "flameOrb" },
  leThach: { head: "nonLa", robe: "#6b4a2b", prop: "spearShield", armor: true },
  maiThanh: { head: "scarf", robe: "#2f5f6f", prop: "gourd" },
  toKim: { head: "scholar", robe: "#3b3340", prop: "fan" },
  phungPhong: { head: "wrap", robe: "#2e4a40", prop: "slips" },
};

/** Diện mạo mặc định theo nghề, cho nhân vật chưa có hình riêng (ví dụ sứ quân). */
const PROFESSION_LOOK: Readonly<Record<Profession, Look>> = {
  tuongSi: { head: "topknot", robe: "#5a1e14", prop: "reedFlag", armor: true },
  phapSu: LOOKS.haVan!,
  binhLinh: LOOKS.leThach!,
  ySu: LOOKS.maiThanh!,
  muuSi: LOOKS.toKim!,
  quanSu: LOOKS.phungPhong!,
};

function Headwear({ head, accent }: { head: Head; accent: string }) {
  switch (head) {
    case "topknot":
      return (
        <g>
          <path d="M22.5 27 C22 18 26 14.5 32 14.5 C38 14.5 42 18 41.5 27 C39 22.5 35 21.5 32 21.5 C29 21.5 25 22.5 22.5 27 Z" fill={INK} />
          <circle cx={32} cy={12} r={4.2} fill={INK} />
          <path d="M23 22.5 Q32 19 41 22.5" fill="none" stroke="#c0392b" strokeWidth={3} strokeLinecap="round" />
          <path d="M40.5 22 L45 25.5 M40.5 22.5 L44 28" stroke="#c0392b" strokeWidth={2} strokeLinecap="round" />
          <path d="M29.5 12 H34.5" stroke={accent} strokeWidth={1.6} strokeLinecap="round" />
        </g>
      );
    case "bun":
      return (
        <g>
          <path d="M22 30 C20.5 18 25.5 14 32 14 C38.5 14 43.5 18 42 30 C40.5 23 37 21 32 21 C27 21 23.5 23 22 30 Z" fill={INK} />
          <ellipse cx={32} cy={11.5} rx={6} ry={4.2} fill={INK} />
          <path d="M24 10 L41 14" stroke={BRONZE} strokeWidth={1.8} strokeLinecap="round" />
          <circle cx={41.5} cy={14} r={2} fill={accent} stroke={INK} strokeWidth={1} />
        </g>
      );
    case "nonLa":
      return (
        <g>
          <path d="M23 26 C23 20 27 18 32 18 C37 18 41 20 41 26 Z" fill={INK} />
          <path d="M14 23.5 L32 8 L50 23.5 Q32 27 14 23.5 Z" fill="#d9bf86" {...ink} />
          <path d="M20 19.5 L44 19.5 M25.5 14.5 L38.5 14.5" stroke="#a88a4f" strokeWidth={1.2} />
          <path d="M14 23.5 Q32 27 50 23.5" fill="none" stroke={accent} strokeWidth={1.6} />
        </g>
      );
    case "scarf":
      return (
        <g>
          <path d="M21 32 C19.5 17 25 13 32 13 C39 13 44.5 17 43 32 C41.5 26 40.5 22 32 22 C23.5 22 22.5 26 21 32 Z" fill={accent} {...ink} />
          <path d="M23.5 21 Q32 17.5 40.5 21" fill="none" stroke={PAPER} strokeWidth={1.4} strokeDasharray="1.5 2" />
        </g>
      );
    case "scholar":
      return (
        <g>
          <path d="M23 26 C22.5 20 26.5 17.5 32 17.5 C37.5 17.5 41.5 20 41 26 Z" fill={INK} />
          <path d="M24 19 C24 12 27.5 10 32 10 C36.5 10 40 12 40 19 Z" fill={INK} />
          <path d="M24 19 H40" stroke={accent} strokeWidth={2} strokeLinecap="round" />
          <path d="M39.5 17 L46 15.5 M24.5 17 L18 15.5" stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
        </g>
      );
    case "wrap":
      return (
        <g>
          <path d="M23 26 C22.5 20 26.5 17.5 32 17.5 C37.5 17.5 41.5 20 41 26 Z" fill={INK} />
          <path d="M22.5 22 C22 14 26 11.5 32 11.5 C38 11.5 42 14 41.5 22 Q32 18.5 22.5 22 Z" fill={accent} {...ink} />
          <path d="M24.5 17 Q32 14 39.5 17" fill="none" stroke={INK} strokeWidth={1.2} />
          <path d="M41 18 Q46 20 45 26" fill="none" stroke={accent} strokeWidth={2.4} strokeLinecap="round" />
        </g>
      );
  }
}

function HeldProp({ prop, accent }: { prop: Prop; accent: string }) {
  switch (prop) {
    case "reedFlag":
      return (
        <g>
          <path d="M50 18 V62" stroke="#8a5a2b" strokeWidth={2.2} strokeLinecap="round" />
          <path d="M50 19 L61 23 L50 28 Z" fill="#c0392b" {...ink} strokeWidth={1.3} />
          <path d="M50 18.5 C48 15 46 14.5 44.5 15 M50 18.5 C49.5 15 50.5 13 52.5 12.5 M50 18.5 C51.5 16 54 15.5 55.5 16.5" stroke="#c9b37e" strokeWidth={1.4} strokeLinecap="round" fill="none" />
        </g>
      );
    case "flameOrb":
      return (
        <g>
          <circle cx={50} cy={47} r={6.5} fill={accent} {...ink} />
          <path d="M50 40 C52.5 43 54 44.5 54 47 A4 4 0 0 1 46 47 C46 45 47.5 43.5 48.5 42.5 C48.8 44 49.3 44.6 50 44.8 C49.6 43 49.4 41.5 50 40 Z" fill="#ffd27a" />
        </g>
      );
    case "spearShield":
      return (
        <g>
          <path d="M53 8 V62" stroke="#8a5a2b" strokeWidth={2} strokeLinecap="round" />
          <path d="M53 4 L56 11 L53 13.5 L50 11 Z" fill="#cfd3d8" {...ink} strokeWidth={1.3} />
          <circle cx={13} cy={50} r={9} fill="#8a5a2b" {...ink} />
          <circle cx={13} cy={50} r={5.5} fill="none" stroke={accent} strokeWidth={1.6} />
          <circle cx={13} cy={50} r={1.8} fill={BRONZE} />
        </g>
      );
    case "gourd":
      return (
        <g>
          <path d="M50 37 V40" stroke={INK} strokeWidth={1.6} />
          <circle cx={50} cy={43} r={3.6} fill="#d9a441" {...ink} strokeWidth={1.5} />
          <circle cx={50} cy={51.5} r={5.8} fill="#d9a441" {...ink} strokeWidth={1.5} />
          <path d="M46.5 46.5 H53.5" stroke={accent} strokeWidth={1.8} />
        </g>
      );
    case "fan":
      return (
        <g>
          <path d="M44 56 L36 44 A14 14 0 0 1 56 44 Z" fill={PAPER} {...ink} strokeWidth={1.5} />
          <path d="M44 56 L40.5 42 M44 56 L46 41 M44 56 L51.5 42.5" stroke="#a88a4f" strokeWidth={1} />
          <path d="M37.5 45.5 A12 12 0 0 1 54.5 45.5" fill="none" stroke={accent} strokeWidth={1.8} />
        </g>
      );
    case "slips":
      return (
        <g transform="rotate(-12 49 48)">
          <rect x={43} y={39} width={12} height={17} rx={1} fill="#d9bf86" {...ink} strokeWidth={1.4} />
          <path d="M46 39 V56 M49 39 V56 M52 39 V56" stroke="#a88a4f" strokeWidth={1} />
          <path d="M43 44 H55" stroke={accent} strokeWidth={1.8} />
        </g>
      );
  }
}

/** Nhân vật đã có tranh vẽ: mặt cắt từ tranh, vẽ trong khung tròn thay cho mặt dựng bằng SVG. */
const PHOTOS: Readonly<Record<string, string>> = {
  dinhBoLinh: "/art/characters/dinh-bo-linh/portrait.webp",
};

/**
 * Chân dung bán thân trong khung tròn hoa văn trống đồng. Nền khung theo nguyên tố, viền đai áo cũng theo
 * nguyên tố để nhân vật chính đổi hệ thì hình đổi theo.
 */
export function Portrait({
  id,
  element,
  profession,
  className = "size-10",
}: {
  id: string;
  element: Element;
  profession: Profession;
  className?: string;
}) {
  const clip = `portrait-${useId().replace(/[^\w-]/g, "")}`;
  const look = LOOKS[id] ?? PROFESSION_LOOK[profession];
  const accent = ELEMENT_COLOR[element];
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden focusable="false">
      <defs>
        <clipPath id={clip}>
          <circle cx={32} cy={32} r={27} />
        </clipPath>
      </defs>
      <circle cx={32} cy={32} r={31} fill={BRONZE} stroke={INK} strokeWidth={1.5} />
      <circle cx={32} cy={32} r={29} fill="none" stroke={INK} strokeWidth={1.2} strokeDasharray="2 2.2" />
      <circle cx={32} cy={32} r={27} fill={accent} />
      {PHOTOS[id] ? (
        <g clipPath={`url(#${clip})`}>
          <circle cx={32} cy={26} r={15} fill="#fff" opacity={0.14} />
          <image href={PHOTOS[id]} x={5} y={5} width={54} height={54} preserveAspectRatio="xMidYMid slice" />
        </g>
      ) : (
        <g clipPath={`url(#${clip})`}>
          {/* Tia mặt trời mờ sau đầu như tâm mặt trống đồng. */}
          <circle cx={32} cy={26} r={15} fill="#fff" opacity={0.14} />
          {/* Vai và áo giao lĩnh (cổ chéo). */}
          <path d="M8 66 C8 50 17 42 32 42 C47 42 56 50 56 66 Z" fill={look.robe} {...ink} />
          <path d="M26 42.5 L37 56 M38 42.5 L31.5 50" stroke={PAPER} strokeWidth={2.4} strokeLinecap="round" />
          <path d="M10 60 Q32 55 54 60" fill="none" stroke={accent} strokeWidth={3} />
          {look.armor && (
            <g fill="#8c6a3a" {...ink} strokeWidth={1.3}>
              <path d="M11 54 C12 47 17 44 22 43.5 L24 50 C19 51 15 53 11 54 Z" />
              <path d="M53 54 C52 47 47 44 42 43.5 L40 50 C45 51 49 53 53 54 Z" />
            </g>
        )}
        {/* Cổ và mặt. */}
        <path d="M28 36 V43 H36 V36" fill={SKIN} {...ink} strokeWidth={1.5} />
        <ellipse cx={32} cy={29} rx={9.5} ry={11} fill={SKIN} {...ink} />
        <path d="M27 27 Q28.5 26 30 27 M34 27 Q35.5 26 37 27" stroke={INK} strokeWidth={1.4} strokeLinecap="round" fill="none" />
        <circle cx={28.5} cy={29.5} r={1.1} fill={INK} />
        <circle cx={35.5} cy={29.5} r={1.1} fill={INK} />
        <path d="M30 35 Q32 36 34 35" stroke={INK} strokeWidth={1.2} strokeLinecap="round" fill="none" />
        <Headwear head={look.head} accent={accent} />
        <HeldProp prop={look.prop} accent={accent} />
      </g>
      )}
      <circle cx={32} cy={32} r={27} fill="none" stroke={INK} strokeWidth={1.5} />
    </svg>
  );
}
