// Hoa văn đồng cổ của thanh header chung (ảnh nền trong suốt Shan vẽ, public/art/ui/header/ornaments/): hai góc
// đặt ở hai đầu thanh và cụm mây ở hai đầu bảng tên, giữ nguyên màu đồng gốc. Chỉ để trang trí:
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
 * Cụm mây đồng Shan vẽ (header-cloud.webp, 251×160), đặt đè lên hai đầu bảng tên phân cảnh. Hình gần đối xứng
 * nên bên phải lật ngang cho hai bên soi gương nhau. Chỉ để trang trí.
 */
export function HeaderCloud({ side, className = "" }: { side: "left" | "right"; className?: string }) {
  return (
    <Image
      src={`${DIR}/header-cloud.webp`}
      alt=""
      aria-hidden
      width={251}
      height={160}
      unoptimized
      draggable={false}
      className={`game-header-cloud pointer-events-none w-auto max-w-none select-none ${side === "right" ? "-scale-x-100" : ""} ${className}`}
    />
  );
}
