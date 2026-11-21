"use client";

// Thanh tab dưới trên điện thoại (Shan chọn 3C, 21/11/2026): 5 mục Chiến trường, Nhiệm vụ, Doanh Trại, Cửa Hàng, Thêm.
// Chỉ hiện ở các màn trung tâm (TAB_BAR_SCENES), ẩn trong màn chế độ, màn trận và màn giải đố. Từ 640px không hiện.
// "Thêm" mở bảng trượt đáy với các tiện ích còn lại của mục Quân vụ ở Chiến trường.

import { useState } from "react";
import { BottomSheet } from "@/components/game-ui";
import { UtilityGlyph, type UtilityIcon } from "./MenuScene";
import type { Scene } from "./scene";
import { SceneLink } from "./SceneContext";

/** Các màn có thanh tab dưới. */
export const TAB_BAR_SCENES: ReadonlySet<Scene> = new Set<Scene>(["MENU", "QUESTS", "PROFILE", "SHOP", "LEADERBOARD", "TIERS", "COMBOS", "ACCOUNT"]);

const TABS: readonly { scene: Scene; title: string; icon: UtilityIcon }[] = [
  { scene: "MENU", title: "Chiến trường", icon: "home" },
  { scene: "QUESTS", title: "Nhiệm vụ", icon: "scroll" },
  { scene: "PROFILE", title: "Doanh Trại", icon: "camp" },
  { scene: "SHOP", title: "Cửa Hàng", icon: "shop" },
];

const MORE: readonly { scene: Scene; title: string; icon: UtilityIcon }[] = [
  { scene: "LEADERBOARD", title: "Công Trạng", icon: "rank" },
  { scene: "TIERS", title: "Ban Thưởng", icon: "tier" },
  { scene: "COMBOS", title: "Hợp Kích", icon: "link" },
  { scene: "PRACTICE", title: "Thao Luyện", icon: "swords" },
];

const ITEM = "flex min-h-14 flex-auto flex-col items-center justify-center gap-0.5 px-1 text-center whitespace-nowrap text-caption font-semibold leading-tight tracking-tight";

export default function MobileTabBar({ scene }: { scene: Scene }) {
  const [more, setMore] = useState(false);
  if (!TAB_BAR_SCENES.has(scene)) return null;
  const inMore = MORE.some((m) => m.scene === scene);
  return (
    <>
      {/* Giữ chỗ để nội dung cuối trang không nằm dưới thanh. */}
      <div aria-hidden className="h-[calc(3.5rem+env(safe-area-inset-bottom))] sm:hidden" />
      <nav aria-label="Điều hướng chính" className="ui-tab-bar fixed inset-x-0 bottom-0 z-40 flex pb-[env(safe-area-inset-bottom)] sm:hidden">
        {TABS.map((t) => (
          <SceneLink key={t.scene} scene={t.scene} aria-current={scene === t.scene ? "page" : undefined} className={ITEM}>
            <UtilityGlyph kind={t.icon} />
            <span>{t.title}</span>
          </SceneLink>
        ))}
        <button type="button" aria-haspopup="dialog" aria-current={inMore ? "page" : undefined} onClick={() => setMore(true)} className={ITEM}>
          <UtilityGlyph kind="more" />
          Thêm
        </button>
      </nav>
      <BottomSheet open={more} onClose={() => setMore(false)} title="Quân vụ">
        <ul className="grid grid-cols-2 gap-2" onClickCapture={() => setMore(false)}>
          {MORE.map((m) => (
            <li key={m.scene}>
              <SceneLink scene={m.scene} aria-current={scene === m.scene ? "page" : undefined}
                className="ui-frame-inset flex min-h-12 items-center gap-2 px-3 font-serif font-semibold">
                <UtilityGlyph kind={m.icon} />
                {m.title}
              </SceneLink>
            </li>
          ))}
        </ul>
      </BottomSheet>
    </>
  );
}
