"use client";

import type { ReactNode } from "react";
import { Button } from "./button";
import { cn } from "@/lib/cn";

/** Supports cursor APIs without assuming the total number of pages. */
export function Pagination({ hasPrevious, hasNext, onPrevious, onNext, busy = false, label = "Phân trang", previousLabel = "Trang trước", nextLabel = "Trang sau", className, children }: {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  busy?: boolean;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
  children?: ReactNode;
}) {
  return <nav data-slot="pagination" aria-label={label} aria-busy={busy || undefined}
    className={cn("flex flex-wrap items-center justify-end gap-2", className)}>
    <Button variant="secondary" size="sm" disabled={busy || !hasPrevious} onClick={onPrevious}>{previousLabel}</Button>
    {children && <span aria-live="polite" aria-atomic="true">{children}</span>}
    <Button variant="secondary" size="sm" disabled={busy || !hasNext} onClick={onNext}>{nextLabel}</Button>
  </nav>;
}
