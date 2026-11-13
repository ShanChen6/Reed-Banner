"use client";

import { useState, type ReactNode } from "react";
import { FrameInset, OrnateFrame } from "@/components/game-ui";
import { Tabs } from "@/components/ui";
import { MODE_GUIDES, type GuideScene, type ModeGuide as ModeGuideData } from "./modeGuides";

type View = "play" | "guide";

const SECTIONS: readonly { readonly key: Exclude<keyof ModeGuideData, "goal">; readonly title: string }[] = [
  { key: "steps", title: "Cách chơi" },
  { key: "rules", title: "Luật cần nhớ" },
  { key: "rewards", title: "Phần thưởng" },
  { key: "tips", title: "Mẹo nhỏ" },
];

/** Nội dung Hướng dẫn của một chế độ: mục tiêu, các bước, luật, thưởng, mẹo. Dùng cả ở màn có thẻ riêng (Bình Loạn, Trận Đồ). */
export function ModeGuidePanel({ scene, headingId }: { scene: GuideScene; headingId?: string }) {
  const guide = MODE_GUIDES[scene];
  return (
    <OrnateFrame level="raised" className="flex flex-col gap-4" aria-labelledby={headingId}>
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
    </OrnateFrame>
  );
}

/**
 * Thêm thẻ Hướng dẫn cho màn chế độ: hai thẻ "Chơi" và "Hướng dẫn" nằm dưới banner. Thẻ Chơi giữ nguyên nội dung
 * màn; chọn Hướng dẫn thì thay bằng luật và thưởng của chế độ. Không gọi API, chuyển thẻ không mất tiến độ ván.
 */
export function ModeGuideTabs({ scene, children }: { scene: GuideScene; children: ReactNode }) {
  const [view, setView] = useState<View>("play");
  return (
    <>
      <Tabs<View>
        label="Màn chế độ"
        value={view}
        onChange={setView}
        items={[
          { value: "play", label: "Chơi" },
          { value: "guide", label: "Hướng dẫn" },
        ]}
      />
      {view === "guide" ? <ModeGuidePanel scene={scene} /> : children}
    </>
  );
}
