"use client";

import { cloneElement, isValidElement, useEffect, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { buttonVariants, ChevronLeftIcon, ChevronRightIcon } from "@/components/ui";
import { planPages, type FitBox } from "./fitPagesPlan";

// Chia nội dung dài thành trang vừa khung cao cố định (Shan chốt 28/11/2026: màn chế độ cao bằng màn hình, nội dung
// dài thì phân trang chứ không cuộn). Khung cha phải cho FitPages một chiều cao (flex-1 min-h-0 hoặc h-full).
// Cách đo: một lớp ẩn xếp toàn bộ khối liền mạch, đọc vị trí từng khối rồi chia trang (planPages); đổi cỡ khung hay
// nội dung thì đo lại. Trang hiện tại chỉ dựng những khối của nó.

export interface FitUnit {
  readonly key: string;
  /** Khối cùng nhóm liền nhau được bọc chung một khung (groupWrap), sang trang mới thì khung lặp lại. */
  readonly group?: string;
  /**
   * Phần tử DOM (div, li, section…) hoặc component chuyển thuộc tính `data-fit-unit` xuống phần tử gốc của nó, để lớp
   * đo tìm được khối.
   */
  readonly node: ReactElement;
}

/** Chỗ dành cho hàng chuyển trang ở đáy khung: nút 44px và khoảng cách phía trên. */
const CONTROLS_SPACE = 52;

export function FitPages({
  units,
  enabled = true,
  groupWrap,
  footer,
  label = "Chuyển trang",
  className,
  gap = "gap-3",
  tone = "wood",
}: {
  units: readonly FitUnit[];
  /** Tắt (điện thoại, màn hẹp): hiện hết, trang cuộn như thường. */
  enabled?: boolean;
  /** Bọc khối cùng nhóm; `from` là chỉ số khối đầu tiên được bọc (để đánh số tiếp, ví dụ danh sách bước). */
  groupWrap?: (group: string, items: ReactNode, continued: boolean, from: number) => ReactNode;
  /** Luôn hiện dưới trang (ví dụ nút chính), không bị chia trang. */
  footer?: ReactNode;
  label?: string;
  className?: string;
  gap?: string;
  /** Màu chữ của "Trang x/y": trên nền gỗ hay giấy dó. */
  tone?: "wood" | "paper";
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [starts, setStarts] = useState<number[]>([0]);
  const [page, setPage] = useState(0);
  // Lớp đo chỉ dựng trong một lượt (trước khi vẽ lên màn) rồi gỡ, để trang không có hai bản nội dung cùng lúc.
  const [measuring, setMeasuring] = useState(true);

  // Nội dung hay chế độ đổi thì đo lại (đặt trạng thái ngay lúc dựng, không cần effect).
  const [seen, setSeen] = useState({ units, enabled });
  if (seen.units !== units || seen.enabled !== enabled) {
    setSeen({ units, enabled });
    if (enabled) setMeasuring(true);
  }

  useLayoutEffect(() => {
    if (!measuring) return;
    const body = bodyRef.current;
    const layer = layerRef.current;
    if (body && layer) {
      const height = body.clientHeight;
      const origin = layer.getBoundingClientRect().top;
      const next =
        layer.scrollHeight <= height + 1
          ? [0]
          : planPages(measureBoxes(layer, origin), height - CONTROLS_SPACE);
      setStarts((prev) => (prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next));
    }
    setMeasuring(false);
  }, [measuring]);

  // Khung đổi cỡ (đổi cửa sổ) hay nội dung trang đổi cao (mở một mục gập) thì đo lại.
  useEffect(() => {
    if (!enabled || typeof ResizeObserver === "undefined") return;
    const seen = new Map<Element, number>();
    const observer = new ResizeObserver((entries) => {
      let changed = false;
      for (const e of entries) {
        const size = Math.round(e.contentRect.height * 10 + e.contentRect.width);
        if (seen.get(e.target) !== size) changed = seen.has(e.target) || changed;
        seen.set(e.target, size);
      }
      if (changed) setMeasuring(true);
    });
    if (bodyRef.current) observer.observe(bodyRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [enabled]);

  const pages = enabled ? starts.length : 1;
  const current = Math.min(page, pages - 1);
  const from = enabled ? (starts[current] ?? 0) : 0;
  const to = enabled ? (starts[current + 1] ?? units.length) : units.length;

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div ref={bodyRef} className={cn("relative flex min-h-0 flex-col", enabled && "flex-1 overflow-hidden")}>
        <div ref={contentRef} className={cn("flex flex-col", gap)}>{renderRange(units, from, to, groupWrap, false)}</div>
        {enabled && measuring && (
          <div ref={layerRef} aria-hidden inert className={cn("pointer-events-none invisible absolute inset-x-0 top-0 flex flex-col", gap)}>
            {renderRange(units, 0, units.length, groupWrap, true)}
          </div>
        )}
        {pages > 1 && (
          <nav aria-label={label} className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3">
            <button type="button" aria-label="Trang trước" disabled={current === 0} onClick={() => setPage(current - 1)}
              className={buttonVariants({ variant: "secondary", size: "icon", className: "disabled:opacity-40" })}>
              <ChevronLeftIcon className="size-5" />
            </button>
            <span aria-live="polite" className={cn("min-w-16 text-center text-sm font-semibold tabular-nums",
              tone === "paper" ? "text-ink" : "text-on-wood")}>
              Trang {current + 1}/{pages}
            </span>
            <button type="button" aria-label="Trang sau" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}
              className={buttonVariants({ variant: "secondary", size: "icon", className: "disabled:opacity-40" })}>
              <ChevronRightIcon className="size-5" />
            </button>
          </nav>
        )}
      </div>
      {footer}
    </div>
  );
}

/** Dựng các khối [from, to): khối cùng nhóm liền nhau bọc chung, khối đầu trang giữa nhóm thì nhóm ghi "tiếp". */
function renderRange(
  units: readonly FitUnit[],
  from: number,
  to: number,
  groupWrap: ((group: string, items: ReactNode, continued: boolean, from: number) => ReactNode) | undefined,
  marked: boolean,
): ReactNode[] {
  const out: ReactNode[] = [];
  let i = from;
  while (i < to) {
    const unit = units[i]!;
    const mark = (u: FitUnit, index: number) =>
      isValidElement(u.node)
        ? cloneElement(u.node as ReactElement<Record<string, unknown>>, marked ? { key: u.key, "data-fit-unit": index } : { key: u.key })
        : u.node;
    if (!unit.group || !groupWrap) {
      out.push(mark(unit, i));
      i++;
      continue;
    }
    const group = unit.group;
    const continued = i > 0 && units[i - 1]!.group === group;
    let j = i;
    const items: ReactNode[] = [];
    while (j < to && units[j]!.group === group) {
      items.push(mark(units[j]!, j));
      j++;
    }
    out.push(
      <div key={`${group}:${i}`} data-fit-group={marked ? group : undefined} className="min-w-0">
        {groupWrap(group, items, continued, i)}
      </div>,
    );
    i = j;
  }
  return out;
}

/** Đọc vị trí từng khối và nhóm của nó trong lớp đo. */
function measureBoxes(layer: HTMLElement, origin: number): FitBox[] {
  const nodes = Array.from(layer.querySelectorAll<HTMLElement>("[data-fit-unit]"));
  const rects = nodes.map((n) => n.getBoundingClientRect());
  const boxes: FitBox[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const rect = rects[i]!;
    const group = nodes[i]!.closest<HTMLElement>("[data-fit-group]");
    const top = rect.top - origin;
    const bottom = rect.bottom - origin;
    if (!group || !layer.contains(group)) {
      boxes.push({ top, bottom, groupTop: top, headPad: 0, tailPad: 0, first: true });
      continue;
    }
    const groupRect = group.getBoundingClientRect();
    const members = nodes.filter((n) => n.closest("[data-fit-group]") === group);
    const firstRect = members[0]!.getBoundingClientRect();
    const lastRect = members[members.length - 1]!.getBoundingClientRect();
    boxes.push({
      top,
      bottom,
      groupTop: groupRect.top - origin,
      headPad: firstRect.top - groupRect.top,
      tailPad: groupRect.bottom - lastRect.bottom,
      first: members[0] === nodes[i],
    });
  }
  return boxes;
}
