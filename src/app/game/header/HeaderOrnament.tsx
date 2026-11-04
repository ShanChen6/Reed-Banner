// Hoa văn đồng cổ của thanh header chung: hai ảnh góc nền trong suốt Shan vẽ (public/art/ui/header/ornaments/),
// đặt ở hai đầu thanh, giữ nguyên màu đồng gốc. Chỉ để trang trí:
// aria-hidden, không nhận chuột, giữ đúng tỉ lệ ảnh (đặt chiều cao, chiều rộng tự theo).

import Image from "next/image";

const DIR = "/art/ui/header/ornaments";

/** Kích thước thật của ảnh đã cắt, để next/image giữ tỉ lệ. */
const ORNAMENTS = {
  "corner-left": { w: 257, h: 256 },
  "corner-right": { w: 276, h: 256 },
} as const;

export type HeaderOrnamentKind = keyof typeof ORNAMENTS;

export function HeaderOrnament({ kind, className = "" }: { kind: HeaderOrnamentKind; className?: string }) {
  const { w, h } = ORNAMENTS[kind];
  return (
    <Image
      src={`${DIR}/header-${kind}.png`}
      alt=""
      aria-hidden
      width={w}
      height={h}
      unoptimized
      draggable={false}
      className={`pointer-events-none w-auto max-w-none select-none ${className}`}
    />
  );
}

/**
 * Họa tiết mây cuộn hai bên bảng tên phân cảnh. Bản SVG tạm, nét đồng; khi có ảnh mây vẽ tay
 * (public/art/ui/header/ornaments/header-cloud-left.png, -right.png) thì thay bằng ảnh, giữ chiều cao.
 */
export function HeaderCloud({ side, className = "" }: { side: "left" | "right"; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 48 24"
      className={`game-header-cloud pointer-events-none w-auto shrink-0 ${side === "right" ? "-scale-x-100" : ""} ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    >
      <path d="M47 12H30" />
      <path d="M30 12c0-4-3-6.5-6.5-6.5S17 8 17 11.5s2.6 5 5 5 4-1.6 4-3.6-1.4-3-3-3-2.5 1-2.5 2.3" />
      <path d="M17 11.5c-1-3-3.5-4.5-6-4.5C7.5 7 5 9.5 5 12.5S7.4 17.5 10 17.5c2 0 3.4-1.3 3.4-3s-1.2-2.6-2.6-2.6" />
      <path d="M5 12.5C3 12.5 1.5 14 1.5 15.8" />
      <circle cx="40" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}
