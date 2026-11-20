import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Shared native control styling; ref/validation/events are forwarded unchanged. */
export function controlVariants(className?: string) {
  return cn("ui-control min-h-10 pointer-coarse:min-h-11 min-w-0 max-w-full rounded-control border border-border bg-control px-3 py-2 text-sm leading-normal text-foreground disabled:bg-disabled disabled:text-foreground-disabled aria-invalid:border-danger", className);
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input data-slot="input" className={controlVariants(className)} {...props} />;
}
const selectSizes = {
  sm: "min-h-9 pointer-coarse:min-h-11 text-caption",
  md: "min-h-10 pointer-coarse:min-h-11 text-sm",
} as const;

export type SelectProps = ComponentProps<"select"> & {
  /** sm cho hàng lọc gọn, md (mặc định) cho form. */
  uiSize?: keyof typeof selectSizes;
  /** Đang lọc khác giá trị mặc định: viền vàng, chữ sáng như chip đang chọn. */
  active?: boolean;
};

/**
 * Ô chọn dùng chung (đồng bộ 20/11/2026): gỗ lõm viền đồng, mũi tên vàng; bảng xổ xuống cùng kiểu gỗ, mục đang
 * chọn là giấy dó chữ mực (lớp .ui-select trong src/styles/components.css). Trình duyệt chưa hỗ trợ
 * `appearance: base-select` thì bảng xổ xuống là của hệ điều hành, ô vẫn cùng kiểu.
 */
export function Select({ className, uiSize = "md", active, ...props }: SelectProps) {
  return (
    <select
      data-slot="select"
      data-active={active || undefined}
      className={cn("ui-select min-w-0 max-w-full rounded-control leading-normal", selectSizes[uiSize], className)}
      {...props}
    />
  );
}
