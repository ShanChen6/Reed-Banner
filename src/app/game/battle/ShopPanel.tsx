"use client";

import { Select, Button, ChoiceChip, buttonVariants } from "@/components/ui";
import { PageControls, usePagedItems } from "@/components/ui/Pagination";
import { cn } from "@/lib/cn";

// Cửa hàng nhân vật kèm và chọn đội 3vs3 của Chơi thử và Chơi online. Luật nằm trong @/core (applyProfileAction);
// ở đây chỉ hiển thị và gửi thao tác, giống ProgressPanel.

import { useState } from "react";
import {
  ALL_COMPANIONS,
  ELEMENTS,
  PROFESSIONS,
  HERO_COMPANIONS,
  isHero,
  isWarlord,
  ownsCompanion,
  personalSkillOf,
  shopPrice,
  shopUnlocked,
  recruitMilestone,
  storyNodeById,
  warlordUnlockMission,
  WARLORD_COMPANIONS,
  type Element,
  type FighterConfig,
  type Profession,
  type Profile,
  type ProfileAction,
} from "@/core";
import { ElementIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { ELEMENT_NAME, PROFESSION_NAME } from "./labels";
import { PROFILE_ERROR } from "./ProgressPanel";
import { SceneLink } from "../SceneContext";

function CompanionCard({
  c,
  profile,
  selected,
  disabled,
  onPick,
  onBuy,
}: {
  c: FighterConfig;
  profile: Profile;
  selected: boolean;
  disabled: boolean;
  onPick: () => void;
  onBuy: () => void;
}) {
  const owned = ownsCompanion(profile, c.id);
  const price = shopPrice(c.id);
  const ultimate = personalSkillOf(c.id);
  const hero = isHero(c.id);
  const warlord = isWarlord(c.id);
  // Tướng lịch sử chưa mở: không bán, chỉ báo mốc chương Campaign V2. Sứ quân: mở bán sau nhiệm vụ của họ.
  const lockMission = owned
    ? undefined
    : hero
      ? recruitMilestone(c.id)
      : !shopUnlocked(profile, c.id)
        ? warlordUnlockMission(c.id)
        : undefined;
  const lockNode = lockMission && storyNodeById(lockMission);
  return (
    <li
      data-selected={selected || undefined}
      className={cn("ui-hero-card flex min-w-0 items-center gap-2.5 p-2", !owned && "ui-hero-card--unowned")}
    >
      <Portrait id={c.id} element={c.element} profession={c.profession} className="size-10 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-sm font-semibold text-on-wood">
          <span className="truncate">{c.name}</span>
          <ElementIcon element={c.element} className="size-3.5 shrink-0" />
        </div>
        <div className="truncate text-caption text-on-wood-soft" title={ultimate ? `${hero || warlord ? "Chiêu riêng" : "Tuyệt chiêu"}: ${ultimate.name}` : undefined}>
          {PROFESSION_NAME[c.profession]} · {ELEMENT_NAME[c.element]}
          {ultimate && <> · {ultimate.name}</>}
          {hero && <> · Tướng lịch sử</>}
          {warlord && <> · Sứ quân</>}
        </div>
      </div>
      {owned ? (
        <ChoiceChip selected={selected} disabled={disabled} onClick={onPick} className="shrink-0 px-2.5 text-caption">
          {selected ? "Ra trận" : "Chọn"}
        </ChoiceChip>
      ) : lockNode ? (
        <span className="min-w-0 max-w-[45%] text-right text-caption leading-snug text-on-wood-soft">
          {hero ? "Gia nhập sau" : "Mở bán sau"} {lockNode.id} “{lockNode.title}”
        </span>
      ) : (
        <Button variant="primary"
          type="button"
          disabled={disabled || price === undefined || profile.gold < price}
          onClick={onBuy}
          className="min-h-8 pointer-coarse:min-h-11 shrink-0 px-2.5 text-caption tabular-nums"
          title={price !== undefined && profile.gold < price ? `Cần ${price} vàng` : undefined}
        >
          Mua {price}
        </Button>
      )}
    </li>
  );
}

/** Số thẻ mỗi trang của danh sách bán: 4 hàng ở màn rộng (3 cột), tránh phải cuộn dài. */
export const SHOP_PAGE_SIZE = 12;

type ShopGroup = "regular" | "warlord" | "hero";
const GROUP_NAME: Record<ShopGroup, string> = { regular: "Tướng thường", warlord: "Sứ quân", hero: "Tướng lịch sử" };

/** Lưới thẻ có phân trang. */
function PagedGrid({ items, label, className }: { items: readonly React.ReactNode[]; label: string; className?: string }) {
  const paged = usePagedItems(items, SHOP_PAGE_SIZE);
  return (
    <>
      <ul className={cn("grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3", className)}>{paged.pageItems}</ul>
      <PageControls paged={paged} label={`Phân trang ${label}`} className="mt-2" />
    </>
  );
}

/**
 * `locked` khi đang đánh: chỉ xem. Chọn đội: bấm một nhân vật chưa ra trận thì người đó thay người được
 * chọn sớm nhất. `onAction` trả về mã lỗi, hoặc null khi thành công.
 */
export default function ShopPanel({
  profile,
  locked,
  onAction,
  compact,
  sellOnly,
}: {
  profile: Profile;
  locked: boolean;
  onAction: (a: ProfileAction) => Promise<string | null>;
  /** Chỉ chọn đội (sảnh Giao Tranh): ẩn phần bán tướng, thay bằng lối sang Cửa Hàng. */
  compact?: boolean;
  /** Chỉ bán tướng (màn Cửa Hàng): ẩn khối chọn đội, việc chọn đội ở Doanh Trại và sảnh Giao Tranh. */
  sellOnly?: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [profFilter, setProfFilter] = useState<Profession | "all">("all");
  const [elemFilter, setElemFilter] = useState<Element | "all">("all");
  const [shownGroup, setShownGroup] = useState<ShopGroup>("regular");
  const shown = (c: FighterConfig) =>
    (profFilter === "all" || c.profession === profFilter) && (elemFilter === "all" || c.element === elemFilter);

  const commit = (a: ProfileAction) => {
    setBusy(true);
    void onAction(a).then((error) => {
      setBusy(false);
      setMessage(error ? (PROFILE_ERROR[error as keyof typeof PROFILE_ERROR] ?? error) : null);
    });
  };
  const pick = (id: string) => {
    if (profile.team.includes(id)) return;
    commit({ type: "chooseTeam", companions: [profile.team[1]!, id] });
  };

  const owned = ALL_COMPANIONS.filter((c) => ownsCompanion(profile, c.id));
  const forSale = ALL_COMPANIONS.filter(
    (c) => !ownsCompanion(profile, c.id) && shopPrice(c.id) !== undefined && !isWarlord(c.id) && shown(c),
  );
  const warlordsLeft = WARLORD_COMPANIONS.map((w) => w.fighter).filter((c) => !ownsCompanion(profile, c.id) && shown(c));
  const heroesLeft = HERO_COMPANIONS.filter((c) => !ownsCompanion(profile, c.id) && shown(c));
  const groups: { id: ShopGroup; title: string; label: string; note?: string; items: FighterConfig[] }[] = [
    { id: "regular", title: "Cửa hàng tướng thường", label: "tướng thường", items: forSale },
    {
      id: "warlord",
      title: "Sứ quân (mở bán khi đánh bại ở Bình Loạn)",
      label: "sứ quân",
      note: "Mở bán khi đánh bại ở Bình Loạn. Khi tuyển về, sứ quân dùng 3 chiêu nghề + 2 chiêu hệ + chiêu riêng ô 4 mở cấp 10. Khi làm đối thủ ở Bình Loạn, họ giữ bộ hệ của màn và luôn có chiêu riêng; bộ chiêu có thể khác.",
      items: warlordsLeft,
    },
    { id: "hero", title: "Tướng lịch sử (gia nhập qua Bình Loạn)", label: "tướng lịch sử", note: sellOnly ? "Không bán: gia nhập đội khi qua mốc Bình Loạn." : undefined, items: heroesLeft },
  ];
  const card = (c: FighterConfig) => (
    <CompanionCard
      key={c.id}
      c={c}
      profile={profile}
      selected={profile.team.includes(c.id)}
      disabled={locked || busy}
      onPick={() => pick(c.id)}
      onBuy={() => commit({ type: "buyCompanion", character: c.id })}
    />
  );

  return (
    <section aria-label={sellOnly ? "Tuyển tướng" : "Đội hình và cửa hàng"} className="text-caption text-on-wood">
      {sellOnly ? (
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <p className="text-caption text-on-wood-soft">
            Đã có {owned.length} tướng kèm. Chọn đội ra trận ở{" "}
            <SceneLink scene="PROFILE" className="ui-link text-frame-gold underline underline-offset-2">Doanh Trại</SceneLink>.
          </p>
          {message && <span role="alert" className="text-danger">{message}</span>}
        </div>
      ) : (<>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="ui-title-on-wood text-base">Đội hình 3vs3</h2>
        {message && <span role="alert" className="text-danger">{message}</span>}
      </div>
      {locked && <p className="mb-2 text-on-wood-soft">Đang trong trận: đổi đội và chiêu mộ tướng quân sau khi trận kết thúc.</p>}
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{owned.map(card)}</ul>
      </>)}
      {compact ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-caption text-on-wood-soft">Tuyển thêm tướng hoặc đổi đội chi tiết:</span>
          <SceneLink scene="SHOP" className={buttonVariants({ variant: "secondary", size: "sm" })}>Cửa Hàng</SceneLink>
          <SceneLink scene="PROFILE" className={buttonVariants({ variant: "secondary", size: "sm" })}>Doanh Trại</SceneLink>
        </div>
      ) : (<>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {sellOnly && (
          <div role="group" aria-label="Nhóm tướng" className="flex flex-wrap gap-2 sm:mr-auto">
            {groups.map((g) => (
              <ChoiceChip key={g.id} selected={shownGroup === g.id} onClick={() => setShownGroup(g.id)} className="text-sm">
                {GROUP_NAME[g.id]} <span className="tabular-nums opacity-70">({g.items.length})</span>
              </ChoiceChip>
            ))}
          </div>
        )}
        <span className="font-semibold text-on-wood-soft">{sellOnly ? "Lọc:" : "Lọc tướng quân chưa có:"}</span>
        <Select
          aria-label="Lọc theo nghề"
          value={profFilter}
          onChange={(e) => setProfFilter(e.target.value as Profession | "all")}

        >
          <option value="all">Mọi nghề</option>
          {PROFESSIONS.map((p) => (
            <option key={p} value={p}>
              {PROFESSION_NAME[p]}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Lọc theo hệ"
          value={elemFilter}
          onChange={(e) => setElemFilter(e.target.value as Element | "all")}

        >
          <option value="all">Mọi hệ</option>
          {ELEMENTS.map((el) => (
            <option key={el} value={el}>
              {ELEMENT_NAME[el]}
            </option>
          ))}
        </Select>
      </div>
      {(sellOnly ? groups.filter((g) => g.id === shownGroup) : groups.filter((g) => g.items.length > 0)).map((g) => (
        <div key={g.id}>
          {!sellOnly && <h3 className="ui-title-on-wood mt-4 mb-1 text-base">{g.title}</h3>}
          {g.note && <p className={cn("mb-2 text-caption text-on-wood-soft", sellOnly && "mt-3")}>{g.note}</p>}
          {g.items.length > 0 ? (
            <PagedGrid key={`${g.id}-${profFilter}-${elemFilter}`} label={g.label} items={g.items.map(card)} className={sellOnly && !g.note ? "mt-3" : undefined} />
          ) : (
            <p className="mt-4 text-caption text-on-wood-soft">Không còn tướng nào để tuyển theo bộ lọc này.</p>
          )}
        </div>
      ))}
      <p className="mt-3 text-caption text-on-wood-soft">
        Mọi phó tướng có 3 chiêu nghề, 2 chiêu hệ và 1 tuyệt chiêu như Đinh Bộ Lĩnh, nâng theo ô; ô 4 là tuyệt chiêu (tướng thường) hoặc chiêu riêng (tướng lịch sử, sứ quân).{!sellOnly && " Chọn 2 phó tướng ra trận cùng Đinh Bộ Lĩnh."} Tướng quân chiêu mộ về bắt đầu ở cấp 1.
      </p>
      </>)}
    </section>
  );
}
