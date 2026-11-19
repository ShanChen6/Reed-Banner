// Ngôi sao khắc chế trước trận: tướng có hệ khắc ít nhất một đối thủ đã biết thì gắn ★ cạnh tên.
// Dùng chung cho mọi màn chuẩn bị trận 3 đấu 3 (Tháp Thiên Mệnh, Thí Luyện, Viễn Chinh, Trấn Ải, Nhật Lệnh, sảnh Giao
// Tranh). Bình Loạn đánh dấu ★ theo thủ lĩnh địch qua `campaignBattleAdvice`, cùng kiểu chữ.
import { elementRelation, type Element } from "@/core";
import { cn } from "@/lib/cn";
import { ELEMENT_NAME } from "../battle/labels";

export interface CounterFoe {
  readonly name: string;
  readonly element?: Element | null;
}

/** Đối thủ mà hệ `element` khắc (sát thương ×1,18). */
export function counteredFoes(element: Element, foes: readonly CounterFoe[]): readonly CounterFoe[] {
  return foes.filter((foe) => foe.element && elementRelation(element, foe.element) === "counter");
}

/** Lời giải thích cho chú thích và trình đọc màn hình, ví dụ "Khắc Tiết Dạ (Hỏa)". */
export const counterText = (countered: readonly CounterFoe[]): string =>
  `Khắc ${countered.map((foe) => `${foe.name}${foe.element ? ` (${ELEMENT_NAME[foe.element]})` : ""}`).join(", ")}`;

/** ★ cạnh tên tướng khi hệ của tướng khắc ít nhất một đối thủ; không khắc ai thì không vẽ gì. */
export function CounterStar({ element, foes, className }: {
  element: Element;
  foes: readonly CounterFoe[];
  className?: string;
}) {
  const countered = counteredFoes(element, foes);
  if (countered.length === 0) return null;
  const text = counterText(countered);
  return (
    <span title={text} className={cn("shrink-0 font-bold text-jade", className)}>
      <span aria-hidden>★</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
