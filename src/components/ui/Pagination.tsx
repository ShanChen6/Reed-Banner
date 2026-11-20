"use client";

import { useCallback, useState, type CSSProperties, type ReactNode, type RefCallback } from "react";
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
  /**
   * Trải lên phần tử bọc danh sách (`{...paged.listProps}`) để trang ít mục hơn (trang cuối) giữ chiều cao của
   * trang đầy, khối bên dưới và nút phân trang không nhảy lên.
   */
  listProps: PagedListProps;
}

export interface PagedListProps {
  ref: RefCallback<HTMLElement>;
  style: CSSProperties | undefined;
  /** Trang đang đầy mục: chỉ đo chiều cao những trang này. */
  "data-page-full": boolean;
}

/** Chiều cao trang đầy đo được, theo bề ngang lúc đo (đổi bề ngang thì đo lại). */
interface HeightLock {
  width: number;
  height: number;
}

/**
 * Chiều cao giữ cho trang thiếu mục: chỉ khi có nhiều trang và trang hiện tại thiếu mục, đã đo được trang đầy.
 * `alignContent: start` để lưới không giãn các hàng còn lại cho đầy khoảng trống.
 */
export function pagedListStyle(lock: HeightLock | null, pages: number, full: boolean): CSSProperties | undefined {
  if (!lock || pages <= 1 || full) return undefined;
  return { minHeight: lock.height, alignContent: "start" };
}

/**
 * Cắt `items` thành trang `pageSize` phần tử. Khi danh sách ngắn lại (mua xong, đổi bộ lọc) trang tự lùi về
 * trang cuối còn hợp lệ; muốn về trang đầu khi đổi bộ lọc thì đặt `key` theo bộ lọc cho component chứa hook.
 * `initialPage` chỉ dùng lúc component dựng (ví dụ mở thẳng trang có mục vừa tìm thấy, kèm `key` mới).
 */
export function usePagedItems<T>(items: readonly T[], pageSize: number, initialPage = 0): PagedItems<T> {
  const [page, setPage] = useState(initialPage);
  const [lock, setLock] = useState<HeightLock | null>(null);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pages - 1);
  const pageItems = items.slice(current * pageSize, (current + 1) * pageSize);
  const full = pageItems.length >= pageSize;
  // ResizeObserver đọc trang đầy hay thiếu qua data-page-full, khỏi gắn lại observer mỗi lần đổi trang.
  const observe = useCallback<RefCallback<HTMLElement>>((el) => {
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const width = Math.round(el.clientWidth);
      const height = el.offsetHeight;
      const isFull = el.dataset.pageFull === "true";
      setLock((prev) => {
        if (prev && prev.width !== width) return isFull ? { width, height } : null;
        if (!isFull) return prev;
        return prev && prev.height >= height ? prev : { width, height };
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return {
    page: current,
    pages,
    pageItems,
    setPage: (p) => setPage(Math.max(0, Math.min(p, pages - 1))),
    listProps: { ref: observe, style: pagedListStyle(lock, pages, full), "data-page-full": full },
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
