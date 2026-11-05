"use client";

import { useState, type ReactNode } from "react";
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

/** Danh sách cắt trang ở phía client. */
export interface PagedItems<T> {
  /** Trang hiện tại, đếm từ 0. */
  page: number;
  pages: number;
  pageItems: readonly T[];
  setPage: (page: number) => void;
}

/**
 * Cắt `items` thành trang `pageSize` phần tử. Khi danh sách ngắn lại (mua xong, đổi bộ lọc) trang tự lùi về
 * trang cuối còn hợp lệ; muốn về trang đầu khi đổi bộ lọc thì đặt `key` theo bộ lọc cho component chứa hook.
 */
export function usePagedItems<T>(items: readonly T[], pageSize: number): PagedItems<T> {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pages - 1);
  return {
    page: current,
    pages,
    pageItems: items.slice(current * pageSize, (current + 1) * pageSize),
    setPage: (p) => setPage(Math.max(0, Math.min(p, pages - 1))),
  };
}

/** Nút Trang trước/sau kèm "Trang x/y" cho `usePagedItems`; ẩn khi chỉ có một trang. */
export function PageControls({ paged, label, className }: { paged: PagedItems<unknown>; label?: string; className?: string }) {
  if (paged.pages <= 1) return null;
  return (
    <Pagination
      label={label}
      className={className}
      hasPrevious={paged.page > 0}
      hasNext={paged.page < paged.pages - 1}
      onPrevious={() => paged.setPage(paged.page - 1)}
      onNext={() => paged.setPage(paged.page + 1)}
    >
      <span className="text-caption text-on-wood-soft tabular-nums">Trang {paged.page + 1}/{paged.pages}</span>
    </Pagination>
  );
}
