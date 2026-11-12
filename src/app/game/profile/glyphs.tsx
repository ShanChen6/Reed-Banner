// Biểu tượng nét mảnh của Doanh Trại, cùng kiểu nét 1.6 của thanh header. Luôn đi kèm chữ hoặc aria-label ở
// nút chứa nó nên ẩn khỏi trình đọc màn hình.

type P = { className?: string };

function Svg({ className = "size-4", children }: P & { children: React.ReactNode }) {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 24 24" className={`shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export const SearchGlyph = (p: P) => (
  <Svg {...p}>
    <circle cx={11} cy={11} r={6.5} />
    <path d="M16 16l4.5 4.5" />
  </Svg>
);
export const FilterGlyph = (p: P) => (
  <Svg {...p}>
    <path d="M4 5h16l-6 7.5V19l-4-2v-4.5z" />
  </Svg>
);
export const SortGlyph = (p: P) => (
  <Svg {...p}>
    <path d="M7 4v16M3.5 16.5L7 20l3.5-3.5M17 20V4M13.5 7.5L17 4l3.5 3.5" />
  </Svg>
);
/** Cờ hiệu: dấu đang trong đội hình. */
export const TeamGlyph = (p: P) => (
  <Svg {...p}>
    <path d="M6 21V3.5M6 4.5h11l-2.5 4 2.5 4H6" />
  </Svg>
);
export const XGlyph = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);
export const BackGlyph = (p: P) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);
export const ShopGlyph = (p: P) => (
  <Svg {...p}>
    <path d="M4 9.5L5.5 4h13L20 9.5M4 9.5h16M4 9.5c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3M5.5 12.5V20h13v-7.5M10 20v-4.5h4V20" />
  </Svg>
);
export const PlusGlyph = (p: P) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const InfoGlyph = (p: P) => (
  <Svg {...p}>
    <circle cx={12} cy={12} r={8.5} />
    <path d="M12 11v5M12 8v.01" />
  </Svg>
);
export const CoinGlyph = (p: P) => (
  <Svg {...p}>
    <circle cx={12} cy={12} r={8.5} />
    <rect x={9.5} y={9.5} width={5} height={5} />
  </Svg>
);
