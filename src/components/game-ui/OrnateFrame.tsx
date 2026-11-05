import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { FrameCorners } from "./FrameCorners";

// Khung 3 mức (đồng bộ UI 05/11/2026). 1 "panel": gỗ viền mảnh, cho khối nội dung thường. 2 "raised": thêm vạch vàng
// trong và góc hoa văn, cho khối chính của màn. 3 "hero": banner có tranh. Không lồng mức 2/3 trong mức 2/3.

export type FrameLevel = "panel" | "raised" | "hero";

const LEVEL = {
  panel: "ui-frame",
  raised: "ui-frame ui-frame--raised",
  hero: "ui-frame ui-frame--hero",
} as const;

export type OrnateFrameProps = Omit<ComponentProps<"section">, "ref"> & {
  as?: "section" | "article" | "div" | "aside";
  level?: FrameLevel;
  /** Nền giấy dó chữ mực (nội dung đọc dài). */
  paper?: boolean;
  /** Bỏ đệm mặc định (p-4 sm:p-5). */
  flush?: boolean;
};

export function OrnateFrame({ as: Tag = "section", level = "panel", paper, flush, className, children, ...props }: OrnateFrameProps) {
  return (
    <Tag data-slot="frame" data-level={level}
      className={cn(LEVEL[level], paper && "ui-frame--paper", !flush && "p-4 sm:p-5", className)} {...props}>
      {level !== "panel" && <FrameCorners size={level === "hero" ? "size-7" : "size-5"} />}
      {children}
    </Tag>
  );
}

/** Ô lõm bên trong khung (danh sách, ô số liệu). */
export function FrameInset({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("ui-frame-inset p-3", className)} {...props} />;
}
