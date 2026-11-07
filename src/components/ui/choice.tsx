import type { ComponentProps, KeyboardEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Lựa chọn dùng chung (đồng bộ UI 05/11/2026): tab, chip lọc, độ khó, ô chọn. Chưa chọn là gỗ viền đồng, đang chọn là
// giấy dó chữ mực (lớp .ui-choice trong src/styles/components.css). Không có hook nên dùng được ở server lẫn client.

const sizes = {
  sm: "min-h-8 pointer-coarse:min-h-11 px-3 py-1 text-sm",
  md: "min-h-11 px-4 py-2 text-base",
} as const;

export type ChoiceSize = keyof typeof sizes;

/** Lớp cho phần tử tự dựng (Link, ô lưới) muốn cùng kiểu lựa chọn; đặt aria-pressed/aria-selected để hiện đang chọn. */
export function choiceVariants({ size = "md", className }: { size?: ChoiceSize; className?: string } = {}) {
  return cn("ui-choice inline-flex items-center justify-center gap-2 rounded-control font-semibold leading-snug", sizes[size], className);
}

export type ChoiceChipProps = Omit<ComponentProps<"button">, "type"> & { selected: boolean; size?: ChoiceSize };

/** Nút bật/tắt một lựa chọn (aria-pressed). */
export function ChoiceChip({ selected, size = "sm", className, ...props }: ChoiceChipProps) {
  return <button type="button" aria-pressed={selected} className={choiceVariants({ size, className })} {...props} />;
}

export interface TabItem<T extends string> {
  readonly value: T;
  readonly label: ReactNode;
  readonly disabled?: boolean;
}

export interface TabsProps<T extends string> {
  readonly items: readonly TabItem<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly label: string;
  readonly size?: ChoiceSize;
  readonly fullWidth?: boolean;
  readonly className?: string;
  /** id của panel đang hiện, để nút tab trỏ aria-controls. */
  readonly panelId?: string;
}

/** Mũi tên trái/phải, Home, End chuyển tab như WAI-ARIA tabs. */
function onTabKey(e: KeyboardEvent<HTMLDivElement>) {
  const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
  if (!keys.includes(e.key)) return;
  const tabs = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)')];
  const at = tabs.indexOf(document.activeElement as HTMLButtonElement);
  if (at < 0 || tabs.length === 0) return;
  e.preventDefault();
  const next = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (at + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
  tabs[next]!.focus();
  tabs[next]!.click();
}

export function Tabs<T extends string>({ items, value, onChange, label, size = "md", fullWidth, className, panelId }: TabsProps<T>) {
  return (
    <div role="tablist" aria-label={label} onKeyDown={onTabKey}
      className={cn("flex flex-wrap gap-2", fullWidth && "[&>*]:flex-1", className)}>
      {items.map((t) => {
        const on = t.value === value;
        return (
          <button key={t.value} type="button" role="tab" aria-selected={on} tabIndex={on ? 0 : -1}
            aria-controls={on ? panelId : undefined} disabled={t.disabled}
            className={choiceVariants({ size })} onClick={() => onChange(t.value)}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
