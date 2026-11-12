import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

// Đồng bộ UI 05/11/2026: nút chính là sơn mài đỏ viền vàng, nút phụ gỗ viền đồng (src/styles/components.css).
// Màu viền/nền của primary/secondary nằm trong lớp CSS nên không đặt lớp border-* ở đây (utility thắng component).
const variants = {
  primary: "ui-button--primary",
  secondary: "ui-button--secondary",
  outline: "border-frame-line bg-transparent text-on-wood hover:border-frame-gold hover:bg-wood-hi",
  ghost: "border-transparent bg-transparent text-primary hover:bg-wood-hi",
  danger: "border-transparent bg-destructive text-destructive-foreground hover:brightness-110",
  /** Tên cũ của nút chính. */
  ornate: "ui-button--primary",
  link: "border-transparent bg-transparent text-primary underline-offset-4 hover:underline",
} as const;

const sizes = {
  sm: "min-h-8 pointer-coarse:min-h-11 px-3 py-1.5 text-sm",
  md: "min-h-11 px-4 py-2.5 text-base",
  lg: "min-h-12 px-6 py-3 text-base",
  icon: "size-11 p-2",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;
export interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

/** Also use for Link/SceneLink; navigation remains a native link. */
export function buttonVariants({ variant = "primary", size = "md", fullWidth, className }: ButtonStyleProps = {}) {
  return cn(
    "ui-button inline-flex items-center justify-center gap-2 rounded-control border font-semibold leading-snug text-center transition-colors [&_svg]:shrink-0",
    variants[variant], sizes[size], fullWidth && "w-full", className,
  );
}

export type ButtonProps = ComponentProps<"button"> & ButtonStyleProps;

export function Button({ variant = "primary", size = "md", fullWidth, className, type = "button", ...props }: ButtonProps) {
  return <button data-slot="button" data-variant={variant} data-size={size} type={type}
    className={buttonVariants({ variant, size, fullWidth, className })} {...props} />;
}
