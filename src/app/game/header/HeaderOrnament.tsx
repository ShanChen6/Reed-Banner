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
