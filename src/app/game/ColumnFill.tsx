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

/**
 * Lấp phần trống ở cột ngắn để hai cột cao bằng nhau, chỉ trên máy tính (lg). Đặt làm phần tử cuối của cột
 * `flex flex-col` (cột không `self-start`): khối giãn hết chỗ còn lại; chỗ trống thấp hơn ~8rem thì tự ẩn.
 */
export function ColumnFill({ mode, className }: { mode: ColumnFillMode; className?: string }) {
  const { art, poem, tips } = COLUMN_FILL[mode];
  return (
    <div className={cn("ui-column-fill hidden lg:block", className)}>
      {art ? (
        <figure className="ui-column-fill__card ui-column-fill__card--art ui-frame relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- tranh trang trí co giãn theo chỗ trống */}
          <img src={art} alt="" className="absolute inset-0 size-full object-cover" />
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
