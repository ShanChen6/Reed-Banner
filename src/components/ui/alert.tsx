import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const tones = {
  error: "bg-danger-surface text-danger",
  warning: "bg-warning-surface text-warning",
  success: "bg-success-surface text-success",
  info: "bg-info-surface text-info",
} as const;

export function Alert({ tone = "error", className, ...props }: ComponentProps<"p"> & { tone?: keyof typeof tones }) {
  return <p data-slot="alert" role={tone === "error" ? "alert" : "status"}
    className={cn("rounded-control p-3 text-sm", tones[tone], className)} {...props} />;
}
