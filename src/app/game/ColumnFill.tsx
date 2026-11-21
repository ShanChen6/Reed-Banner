"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { COLUMN_FILL, type ColumnFillMode, type ColumnPoem } from "./columnFill";

function Poem({ poem, className }: { poem: ColumnPoem; className?: string }) {
  return (
    <blockquote className={cn("italic leading-relaxed", className)}>
      {poem.lines.map((line) => (
        <span key={line} className="block">{line}</span>
      ))}
      <footer className="mt-1.5 text-caption not-italic opacity-75">{poem.source}</footer>
    </blockquote>
  );
}

/** Chỗ trống thấp hơn mức này thì không đặt khung lấp; khung ngay trên giãn xuống cho hai cột bằng đáy. */
const MIN_FILL_PX = 80;

/**
 * Lấp phần trống ở cột ngắn để hai cột cao bằng nhau, chỉ trên máy tính (lg). Đặt làm phần tử cuối của cột
 * `flex flex-col` (cột không `self-start`): khối giãn hết chỗ còn lại. Chỗ trống quá thấp (dưới 5rem) thì khối ẩn
 * (`data-collapsed`) và khung đứng ngay trên giãn tới đáy cột, để đáy hai cột vẫn thẳng hàng.
 */
export function ColumnFill({ mode, className }: { mode: ColumnFillMode; className?: string }) {
  const { art, artPosition, poem, tips } = COLUMN_FILL[mode];
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const column = el?.parentElement;
    if (!el || !column) return;
    // Bỏ ẩn, đo chỗ trống thật (đọc kích thước ép trình duyệt tính lại bố cục ngay), rồi ẩn lại nếu quá thấp. Làm
    // trọn trong một lần gọi nên trạng thái cuối giống lúc đầu khi chỗ trống không đổi, không gây vòng đo lặp.
    const measure = () => {
      el.removeAttribute("data-collapsed");
      if (el.getBoundingClientRect().height < MIN_FILL_PX) el.setAttribute("data-collapsed", "");
    };
    const observer = new ResizeObserver(measure);
    observer.observe(column);
    for (const child of column.children) if (child !== el && child !== el.previousElementSibling) observer.observe(child);
    measure();
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn("ui-column-fill hidden lg:block lg:data-collapsed:hidden", className)}>
      {art ? (
        <figure className="ui-column-fill__card ui-column-fill__card--art ui-frame relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- tranh trang trí co giãn theo chỗ trống */}
          <img src={art} alt="" className="absolute inset-0 size-full object-cover object-[50%_30%]" style={artPosition ? { objectPosition: artPosition } : undefined} />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent from-30% to-[var(--wood-inset)]" />
          <figcaption className="relative mt-auto p-5 text-title-on-wood">
            <Poem poem={poem} className="text-base" />
          </figcaption>
        </figure>
      ) : (
        <div className="ui-column-fill__card ui-frame justify-center gap-4 p-4 sm:p-5">
          <ul className="space-y-2 text-sm text-on-wood-soft">
            {tips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span aria-hidden className="text-frame-gold">◆</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          <Poem poem={poem} className="ui-column-fill__poem mt-auto border-t border-frame-line-soft pt-3 text-sm text-on-wood" />
        </div>
      )}
    </div>
  );
}
