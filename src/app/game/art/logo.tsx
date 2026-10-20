// Logo Cờ Lau theo phong cách tranh nhân vật: chữ mạ vàng, mặt trống đồng, cờ lau đỏ, đao và bông lau.
// Ảnh dựng từ SVG, lưu ở public/art/logo/; favicon rút gọn ở src/app/icon.svg.

import Image from "next/image";

/** Logo đầy đủ (chữ + trống + cờ), khung 1200×870 nền trong. */
export function Logo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/art/logo/logo.webp"
      alt="Cờ Lau"
      width={1200}
      height={870}
      sizes="(min-width: 768px) 520px, 90vw"
      priority={priority}
      className={className}
    />
  );
}

/** Huy hiệu trống đồng cắm cờ lau, dùng cạnh chữ "Cờ Lau" ở thanh đầu trang. */
export function LogoMark({ className = "size-8" }: { className?: string }) {
  return <Image src="/art/logo/emblem.webp" alt="" width={256} height={256} className={className} />;
}
