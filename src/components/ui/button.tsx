import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
  outline: "border-border bg-transparent text-foreground hover:bg-surface-hover",
  ghost: "bg-transparent text-primary hover:bg-surface-hover",
  danger: "bg-destructive text-destructive-foreground hover:brightness-110",
  ornate: "ui-button--ornate border-2 border-primary",
  link: "bg-transparent text-primary underline-offset-4 hover:underline",
} as const;

const sizes = {
  sm: "min-h-8 px-3 py-1.5 text-sm",
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
    "ui-button inline-flex items-center justify-center gap-2 rounded-control border border-transparent font-semibold leading-snug text-center transition-colors [&_svg]:shrink-0",
    variants[variant], sizes[size], fullWidth && "w-full", className,
  );
}

/** Compatibility with existing callers. */
export const buttonClassName = buttonVariants;
export type ButtonProps = ComponentProps<"button"> & ButtonStyleProps;

export function Button({ variant = "primary", size = "md", fullWidth, className, type = "button", ...props }: ButtonProps) {
  return <button data-slot="button" data-variant={variant} data-size={size} type={type}
    className={buttonVariants({ variant, size, fullWidth, className })} {...props} />;
}
