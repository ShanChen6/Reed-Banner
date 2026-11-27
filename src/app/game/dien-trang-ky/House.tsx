// Nhà năm bậc của Điền Trang Ký, tranh Shan vẽ (28/11/2026). Bậc quyết định dáng nhà (nhà tranh → trang ấp), hệ của chủ đất
// quyết định kiểu nhà. Mái và cờ vẽ màu #ff00ff được tách thành lớp mặt nạ `-mask.webp`, game tô lại bằng màu ghế để hai nhà cùng
// hệ vẫn khác màu; ảnh chính giữ bóng đổ của mái. Hệ và màu không đổi tô.

import type { Element } from "@/core";
import { cn } from "@/lib/cn";

export function House({ level, element, color, className = "size-6" }: { level: number; element: Element; color: string; className?: string }) {
  if (level <= 0) return null;
  const src = `/art/dien-trang-ky/house/${Math.min(5, level)}-${element}`;
  const mask = `url(${src}-mask.webp)`;
  return (
    <span aria-hidden className={cn("relative inline-block aspect-square shrink-0", className)}>
      <span
        className="absolute inset-0"
        style={{
          backgroundColor: color,
          maskImage: mask,
          WebkitMaskImage: mask,
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh 256px, vẽ chồng lên lớp màu ghế */}
      <img src={`${src}.webp`} alt="" className="absolute inset-0 size-full object-contain" draggable={false} loading="lazy" />
    </span>
  );
}
