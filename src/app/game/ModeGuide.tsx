"use client";

import { useState, type ReactNode } from "react";
import { FrameInset, OrnateFrame } from "@/components/game-ui";
import { Button, Tabs } from "@/components/ui";
import { MODE_GUIDES, type GuideScene, type ModeGuide as ModeGuideData } from "./modeGuides";

const SECTIONS: readonly { readonly key: Exclude<keyof ModeGuideData, "goal">; readonly title: string }[] = [
  { key: "steps", title: "Cách chơi" },
  { key: "rules", title: "Luật cần nhớ" },
  { key: "rewards", title: "Ban thưởng" },
  { key: "tips", title: "Mẹo nhỏ" },
];

/**
 * Chế độ đã qua màn hướng dẫn trong lần vào này. Vào một chế độ từ Chiến Trường thì gặp Hướng dẫn trước (Shan chốt
 * 19/11/2026); đã bấm "Vào chơi" thì quay lại màn sau một trận vẫn ở thẻ Chơi. Về Chiến Trường thì xóa để lần vào sau
 * lại gặp Hướng dẫn. Tải lại trang cũng xóa (bộ nhớ trong phiên chạy).
 */
const entered = new Set<GuideScene>();

/** Gọi khi về Chiến Trường: lần vào chế độ tiếp theo mở Hướng dẫn trước. */
export function resetModeGuides(): void {
  entered.clear();
}

/** Chế độ còn phải mở Hướng dẫn trước không. */
export function guideFirst(scene: GuideScene): boolean {
  return !entered.has(scene);
}

/** Đánh dấu đã qua Hướng dẫn của chế độ. */
export function markGuideSeen(scene: GuideScene): void {
  entered.add(scene);
}

/** Nội dung Hướng dẫn của một chế độ: mục tiêu, các bước, luật, thưởng, mẹo. Dùng cả ở màn có thẻ riêng (Bình Loạn, Trận Đồ). */
export function ModeGuidePanel({ scene, headingId, onPlay }: { scene: GuideScene; headingId?: string; onPlay?: () => void }) {
  const guide = MODE_GUIDES[scene];
  return (
    <OrnateFrame className="flex flex-col gap-4" aria-labelledby={headingId}>
      <section className="flex flex-col gap-1">
        <h2 id={headingId} className="text-lg font-bold text-title-on-wood">
          Mục tiêu
        </h2>
        <p className="text-on-wood">{guide.goal}</p>
      </section>
      {SECTIONS.map(({ key, title }) => {
        const items = guide[key];
        if (items.length === 0) return null;
        const List = key === "steps" ? "ol" : "ul";
        return (
          <FrameInset key={key} className="flex flex-col gap-2 p-3">
            <h3 className="text-base font-bold text-frame-gold">{title}</h3>
            <List className={`flex flex-col gap-1.5 pl-5 text-on-wood ${key === "steps" ? "list-decimal" : "list-disc"}`}>
              {items.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </List>
          </FrameInset>
        );
      })}
      {onPlay && (
        <Button className="min-h-11 self-center px-8" onClick={onPlay}>
          Vào chơi
        </Button>
      )}
    </OrnateFrame>
  );
}

/** Thẻ riêng của một màn, nằm giữa "Chơi" và "Hướng dẫn" (ví dụ bảng xếp hạng tuần của Tháp Thiên Mệnh). */
export interface ModeExtraTab {
  readonly value: string;
  readonly label: string;
  readonly content: ReactNode;
}

/**
 * Thêm thẻ Hướng dẫn cho màn chế độ: hai thẻ "Chơi" và "Hướng dẫn" nằm dưới banner. Vào chế độ thì mở Hướng dẫn
 * trước (nút "Vào chơi" ở cuối), xem `guideFirst`. Thẻ Chơi giữ nguyên nội dung màn; chọn Hướng dẫn thì thay bằng
 * luật và thưởng của chế độ. Không gọi API, chuyển thẻ không mất tiến độ ván.
 * `extraTabs` chèn thẻ riêng của màn vào giữa hai thẻ đó; nội dung thẻ chỉ dựng khi được chọn.
 */
export function ModeGuideTabs({ scene, extraTabs = [], children }: {
  scene: GuideScene;
  extraTabs?: readonly ModeExtraTab[];
  children: ReactNode;
}) {
  const [view, setViewState] = useState<string>(() => (guideFirst(scene) ? "guide" : "play"));
  const setView = (next: string) => {
    if (next !== "guide") markGuideSeen(scene);
    setViewState(next);
  };
  const extra = extraTabs.find((tab) => tab.value === view);
  return (
    <>
      <Tabs<string>
        label="Màn chế độ"
        value={view}
        onChange={setView}
        items={[
          { value: "play", label: "Chơi" },
          ...extraTabs.map(({ value, label }) => ({ value, label })),
          { value: "guide", label: "Hướng dẫn" },
        ]}
      />
      {view === "guide" ? <ModeGuidePanel scene={scene} onPlay={() => setView("play")} /> : extra ? extra.content : children}
    </>
  );
}
