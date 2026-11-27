import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

// Bộ icon tiện ích dùng chung (mũi tên, chuyển trang, thẻ trong màn). Hình lấy theo bộ Lucide (giấy phép ISC, lucide.dev): khung
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

/** Lucide `arrow-right`: đi tiếp, dẫn tới. */
export function ArrowRightIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></Icon>;
}

/** Lucide `flag`: đầu hàng (cờ trắng). */
export function FlagIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528" />
    </Icon>
  );
}

/** Lucide `chevron-left`: trang trước. */
export function ChevronLeftIcon(props: IconProps) {
  return <Icon {...props}><path d="m15 18-6-6 6-6" /></Icon>;
}

/** Lucide `chevron-right`: trang sau. */
export function ChevronRightIcon(props: IconProps) {
  return <Icon {...props}><path d="m9 18 6-6-6-6" /></Icon>;
}

/** Lucide `map`: thẻ Bản đồ. */
export function MapIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
      <path d="M15 5.764v15" />
      <path d="M9 3.236v15" />
    </Icon>
  );
}

/** Lucide `scroll-text`: thẻ Nhiệm vụ. */
export function ScrollTextIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M15 12h-5" />
      <path d="M15 8h-5" />
      <path d="M19 17V5a2 2 0 0 0-2-2H4" />
      <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" />
    </Icon>
  );
}

/** Lucide `book-open`: thẻ Sử ký. */
export function BookOpenIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </Icon>
  );
}

/** Lucide `swords`: thẻ Tái đấu. */
export function SwordsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
      <path d="m13 19 6-6" />
      <path d="m16 16 4 4" />
      <path d="m19 21 2-2" />
      <path d="M14.5 6.5 18 3h3v3l-3.5 3.5" />
      <path d="m5 14 4 4" />
      <path d="m7 17-3 3" />
      <path d="m3 19 2 2" />
    </Icon>
  );
}

/** Lucide `circle-help`: thẻ Hướng dẫn. */
export function CircleHelpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </Icon>
  );
}
