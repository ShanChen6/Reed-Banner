"use client";

import { useState, type ReactNode } from "react";
import { FrameInset, OrnateFrame } from "@/components/game-ui";
import { Button, Tabs } from "@/components/ui";
import { ElementIcon, SuLoAidIcon } from "./art/icons";
import { Glyph } from "./formation/pieces";
import { MODE_GUIDES, type GuideIcon, type GuideItems, type GuideScene, type ModeGuide as ModeGuideData } from "./modeGuides";

const SECTIONS: readonly { readonly key: Exclude<keyof ModeGuideData, "goal" | "items">; readonly title: string }[] = [
  { key: "steps", title: "Cách chơi" },
  { key: "rules", title: "Luật cần nhớ" },
  { key: "rewards", title: "Ban thưởng" },
  { key: "tips", title: "Mẹo nhỏ" },
];

/** Icon đạo cụ trong Hướng dẫn, cùng hình với nút đạo cụ ở màn chơi. */
function GuideItemIcon({ icon }: { icon: GuideIcon }) {
  const box = "size-10 shrink-0";
  if (icon.kind === "element") return <ElementIcon element={icon.element} className={box} />;
  if (icon.kind === "suLoAid") return <SuLoAidIcon aid={icon.aid} className={box} />;
  return (
    <span className={`${box} block`}>
      <Glyph kind={icon.piece} />
    </span>
  );
}

/** Mục đạo cụ: luật chung rồi từng món kèm icon, tên và cách dùng. */
function GuideItemsSection({ items }: { items: GuideItems }) {
  return (
    <FrameInset className="flex flex-col gap-3 p-3">
      <h3 className="text-base font-bold text-frame-gold">{items.title}</h3>
      {items.notes.length > 0 && (
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-on-wood">
          {items.notes.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}
      <ul className="grid gap-2 sm:grid-cols-2" aria-label={items.title}>
        {items.list.map((item) => (
          <li key={item.name} className="flex items-start gap-3 rounded-md border border-frame-bronze/40 bg-black/15 p-2">
            <GuideItemIcon icon={item.icon} />
            <div className="min-w-0">
              <p className="font-bold text-title-on-wood">{item.name}</p>
              <p className="text-sm text-on-wood">{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </FrameInset>
  );
}

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
      {SECTIONS.flatMap(({ key, title }) => {
        const items = guide[key];
        // Mục đạo cụ đứng ngay sau Luật cần nhớ, trước Ban thưởng.
        const after = key === "rules" && guide.items ? [<GuideItemsSection key="items" items={guide.items} />] : [];
        if (items.length === 0) return after;
        const List = key === "steps" ? "ol" : "ul";
        return [
          <FrameInset key={key} className="flex flex-col gap-2 p-3">
            <h3 className="text-base font-bold text-frame-gold">{title}</h3>
            <List className={`flex flex-col gap-1.5 pl-5 text-on-wood ${key === "steps" ? "list-decimal" : "list-disc"}`}>
              {items.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </List>
          </FrameInset>,
          ...after,
        ];
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
 * Thay thẻ "Chơi" bằng nhiều thẻ chơi (ví dụ Thường / Hạng tuần của Tầm Tướng Ký, Shan 20/11/2026): chọn một thẻ thì
 * về nội dung chơi và báo `onChange`; màn tự đổi nội dung theo `value`.
 */
export interface ModePlayTabs {
  readonly items: readonly { readonly value: string; readonly label: string }[];
  readonly value: string;
  readonly onChange: (value: string) => void;
}

/**
 * Thêm thẻ Hướng dẫn cho màn chế độ: hai thẻ "Chơi" và "Hướng dẫn" nằm dưới banner. Vào chế độ thì mở Hướng dẫn
 * trước (nút "Vào chơi" ở cuối), xem `guideFirst`. Thẻ Chơi giữ nguyên nội dung màn; chọn Hướng dẫn thì thay bằng
 * luật và thưởng của chế độ. Không gọi API, chuyển thẻ không mất tiến độ ván.
 * `extraTabs` chèn thẻ riêng của màn vào giữa hai thẻ đó; nội dung thẻ chỉ dựng khi được chọn.
 */
export function ModeGuideTabs({ scene, extraTabs = [], playTabs, children }: {
  scene: GuideScene;
  extraTabs?: readonly ModeExtraTab[];
  /** Nhiều thẻ chơi thay cho một thẻ "Chơi". */
  playTabs?: ModePlayTabs;
  children: ReactNode;
}) {
  const [view, setViewState] = useState<string>(() => (guideFirst(scene) ? "guide" : "play"));
  const setView = (next: string) => {
    if (next !== "guide") markGuideSeen(scene);
    setViewState(next);
  };
  const extra = extraTabs.find((tab) => tab.value === view);
  const plays = playTabs?.items ?? [{ value: "play", label: "Chơi" }];
  const pick = (next: string) => {
    if (playTabs?.items.some((tab) => tab.value === next)) {
      setView("play");
      playTabs.onChange(next);
    } else setView(next);
  };
  return (
    <>
      <Tabs<string>
        label="Màn chế độ"
        value={view === "play" ? (playTabs?.value ?? "play") : view}
        onChange={pick}
        items={[
          ...plays,
          ...extraTabs.map(({ value, label }) => ({ value, label })),
          { value: "guide", label: "Hướng dẫn" },
        ]}
      />
      {view === "guide" ? <ModeGuidePanel scene={scene} onPlay={() => setView("play")} /> : extra ? extra.content : children}
    </>
  );
}
