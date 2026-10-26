import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Divider({ children, className, ...props }: ComponentProps<"div">) {
  return <div data-slot="divider" className={cn("my-1 flex items-center gap-3 text-xs text-muted", className)} {...props}>
    <span className="h-px flex-1 bg-border" aria-hidden="true" />{children}<span className="h-px flex-1 bg-border" aria-hidden="true" />
  </div>;
}
