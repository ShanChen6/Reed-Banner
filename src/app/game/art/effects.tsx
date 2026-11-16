import { EFFECT_KINDS, type EffectKind } from "@/core";
import { EFFECT_NAME } from "../battle/labels";

/**
 * Icon hiệu ứng trạng thái trong trận: ảnh tròn Shan vẽ (17/11/2026) ở public/art/effects/<loại>.webp, đã cắt bỏ vòng vẽ tay
 * và vẽ lại một vòng đều. Viền vàng là có lợi, đỏ thẫm là bất lợi, bạc là Miễn băng. Prompt: art/prompts/prompt-icon-hieu-ung.md.
 */
export function effectArt(kind: string): string | undefined {
  return (EFFECT_KINDS as readonly string[]).includes(kind) ? `/art/effects/${kind}.webp` : undefined;
}

/**
 * Huy hiệu một hiệu ứng: icon tròn kèm số nhỏ ở góc (lượng Khiên hoặc số lượt còn lại). Tên đầy đủ đọc qua alt/title.
 * Loại chưa có ảnh thì hiện chữ như trước.
 */
export function EffectBadge({
  kind,
  value,
  turns,
  className = "size-7",
}: {
  kind: string;
  value?: number;
  turns: number | null;
  className?: string;
}) {
  const name = EFFECT_NAME[kind as EffectKind] ?? kind;
  const count = kind === "shield" && value !== undefined ? Math.round(value) : turns;
  const label = count === null ? name : kind === "shield" ? `${name} ${count}` : `${name}, còn ${count} lượt`;
  const src = effectArt(kind);
  if (!src)
    return (
      <span title={label} className="rounded bg-wood-inset px-1 py-0.5 text-caption">
        {name}
        {count === null ? "" : ` ${count}`}
      </span>
    );
  return (
    <span title={label} className={`relative inline-flex shrink-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label} className="size-full rounded-full" loading="lazy" />
      {count !== null && (
        <span
          aria-hidden
          className="absolute -right-1 -bottom-1 min-w-3.5 rounded-full bg-black/80 px-0.5 text-center text-[11px] leading-3.5 font-bold text-on-wood tabular-nums"
        >
          {count}
        </span>
      )}
    </span>
  );
}
