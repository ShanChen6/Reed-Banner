import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Shared native control styling; ref/validation/events are forwarded unchanged. */
export function controlVariants(className?: string) {
  return cn("ui-control min-h-10 min-w-0 max-w-full rounded-control border border-border bg-control px-3 py-2 text-sm leading-normal text-foreground disabled:bg-disabled disabled:text-foreground-disabled aria-invalid:border-danger", className);
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input data-slot="input" className={controlVariants(className)} {...props} />;
}
export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select data-slot="select" className={controlVariants(className)} {...props} />;
}
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={controlVariants(cn("min-h-28 resize-y", className))} {...props} />;
}
