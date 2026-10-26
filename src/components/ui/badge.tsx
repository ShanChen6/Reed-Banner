import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const tones = {
  default: "border-border text-primary",
  muted: "border-border text-muted",
  success: "border-success/40 bg-success-surface text-success",
  warning: "border-warning/40 bg-warning-surface text-warning",
  danger: "border-danger/40 bg-danger-surface text-danger",
} as const;

export function Badge({ tone = "default", className, ...props }: ComponentProps<"span"> & { tone?: keyof typeof tones }) {
  return <span data-slot="badge" className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs leading-normal", tones[tone], className)} {...props} />;
}
