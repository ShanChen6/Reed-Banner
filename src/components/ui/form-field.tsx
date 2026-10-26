import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Wrapping label avoids generated IDs and works in both server and client forms. */
export function FormField({ label, hint, children, className, ...props }: ComponentProps<"label"> & {
  label: string;
  hint?: ReactNode;
}) {
  return <label data-slot="form-field" className={cn("flex flex-col gap-1.5 text-sm", className)} {...props}>
    <span className="text-foreground-secondary">{label}</span>
    {children}
    {hint && <span className="text-caption text-muted">{hint}</span>}
  </label>;
}
