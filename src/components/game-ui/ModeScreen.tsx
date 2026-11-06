import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { OrnateFrame } from "./OrnateFrame";

// Khung màn chế độ dùng chung (đồng bộ UI 05/11/2026, docs/05-ui-ux/design-system/theme.md).
// Header chung đã hiện tên màn, nên banner chỉ giữ tranh, nhãn nhỏ, một câu mô tả và vài số liệu của chế độ.

/** Mọi màn chế độ dùng một bề rộng nội dung duy nhất (MODE_CONTENT_WIDTH) để lề trái/phải thẳng hàng khi chuyển màn. */
export const MODE_CONTENT_WIDTH = "max-w-7xl";

export function ModeScreen({ children, className, label }: { children: ReactNode; className?: string; /** @deprecated Bỏ từ 06/11/2026: mọi màn cùng một bề rộng; giữ để màn cũ không lỗi biên dịch. */ wide?: boolean; label?: string }) {
  return (
    <main aria-label={label} className={cn("ui-mode-screen", className)}>
      <div className={cn("mx-auto flex w-full flex-col gap-4 sm:gap-5", MODE_CONTENT_WIDTH)}>{children}</div>
    </main>
  );
}

export interface ModeStat {
  readonly label: string;
  readonly value: ReactNode;
}

export interface ModeBannerProps {
  /** Tên chế độ: luôn có cho trình đọc màn hình; chỉ hiện chữ to khi `showTitle`. */
  readonly title: string;
  readonly showTitle?: boolean;
  readonly kicker?: string;
  readonly description?: ReactNode;
  /** Đường dẫn tranh trong public/ (thường /art/home/<chế độ>.webp). */
  readonly art?: string;
  /** Vị trí tranh (object-position), mặc định giữa. */
  readonly artPosition?: string;
  readonly stats?: readonly ModeStat[];
  /** Nút/điều khiển bên phải banner. */
  readonly actions?: ReactNode;
  readonly children?: ReactNode;
  readonly className?: string;
}

export function ModeBanner({ title, showTitle, kicker, description, art, artPosition, stats, actions, children, className }: ModeBannerProps) {
  return (
    <OrnateFrame level="hero" flush className={cn("min-h-36 sm:min-h-44", className)}>
      {art && (
        <>
          <Image src={art} alt="" fill priority sizes="(min-width: 1280px) 1280px, 100vw" className="-z-10 object-cover"
            style={artPosition ? { objectPosition: artPosition } : undefined} />
          <div aria-hidden className="ui-mode-banner-shade absolute inset-0 -z-10" />
        </>
      )}
      <div className="relative flex h-full min-h-36 flex-col justify-end gap-3 p-5 sm:min-h-44 sm:flex-row sm:items-end sm:justify-between sm:p-7">
        <div className="max-w-2xl">
          {kicker && <p className="text-kicker text-frame-gold">{kicker}</p>}
          <h1 className={showTitle ? "ui-title-on-wood mt-1 text-2xl font-bold sm:text-3xl" : "sr-only"}>{title}</h1>
          {description && <p className="mt-1 text-[0.95rem] leading-relaxed text-on-wood sm:text-base">{description}</p>}
          {children}
        </div>
        {(stats?.length || actions) && (
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {stats?.map((s) => (
              <div key={s.label} className="ui-frame-inset min-w-20 px-3 py-1.5 text-center backdrop-blur-sm">
                <div className="text-caption text-on-wood-soft">{s.label}</div>
                <div className="font-bold text-title-on-wood">{s.value}</div>
              </div>
            ))}
            {actions}
          </div>
        )}
      </div>
    </OrnateFrame>
  );
}

/** Tiêu đề khối bên trong khung: chữ 20px màu vàng nhạt, mô tả tùy chọn. */
export function SectionTitle({ children, description, action, id, as: Tag = "h2" }: { children: ReactNode; description?: ReactNode; action?: ReactNode; id?: string; as?: "h2" | "h3" }) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div>
        <Tag id={id} className="ui-title-on-wood text-title">{children}</Tag>
        {description && <p className="mt-0.5 text-caption text-on-wood-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}
