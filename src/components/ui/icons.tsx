import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

// Bộ icon tiện ích dùng chung (mũi tên, chuyển trang). Hình lấy theo bộ Lucide (giấy phép ISC, lucide.dev): khung
// 24×24, nét 2px bo tròn, màu theo chữ. Icon nội dung game (hệ, nghề, kỹ năng) vẫn là tranh vẽ tay ở src/app/game/art/.
// Cần icon tiện ích mới thì thêm vào đây, không vẽ lại trong từng màn.

type IconProps = Omit<SVGProps<SVGSVGElement>, "children">;

function Icon({ className, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"
      strokeLinejoin="round" className={cn("size-4 shrink-0", className)} {...props}>
      {children}
    </svg>
  );
}

/** Lucide `arrow-left`: quay về màn trước. */
export function ArrowLeftIcon(props: IconProps) {
  return <Icon {...props}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></Icon>;
}

/** Lucide `chevron-left`: trang trước. */
export function ChevronLeftIcon(props: IconProps) {
  return <Icon {...props}><path d="m15 18-6-6 6-6" /></Icon>;
}

/** Lucide `chevron-right`: trang sau. */
export function ChevronRightIcon(props: IconProps) {
  return <Icon {...props}><path d="m9 18 6-6-6-6" /></Icon>;
}
