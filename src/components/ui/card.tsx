import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const variants = {
  default: "bg-surface",
  elevated: "bg-surface-elevated shadow-card",
  inset: "bg-surface shadow-card-inset",
} as const;

export type CardProps = Omit<ComponentProps<"section">, "ref"> & {
  as?: "section" | "article" | "div";
  variant?: keyof typeof variants;
  /** Use none when composing CardHeader/CardBody/CardFooter. */
  padding?: "default" | "none";
};

export function Card({ as: Tag = "section", variant = "default", padding = "default", className, ...props }: CardProps) {
  return <Tag data-slot="card" className={cn(
    "rounded-card border-2 border-border text-foreground", variants[variant],
    padding === "default" && "p-4", className,
  )} {...props} />;
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("border-b border-border p-4", className)} {...props} />;
}
export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="card-body" className={cn("p-4", className)} {...props} />;
}
export const CardContent = CardBody;
export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex flex-wrap items-center gap-2 border-t border-border p-4", className)} {...props} />;
}
export function CardTitle({ className, ...props }: ComponentProps<"h2">) {
  return <h2 data-slot="card-title" className={cn("font-heading text-lg font-bold text-primary", className)} {...props} />;
}
export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return <p data-slot="card-description" className={cn("text-sm text-muted", className)} {...props} />;
}
