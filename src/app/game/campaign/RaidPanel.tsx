"use client";

// Đánh trùm (lộ trình 4.5, tách khỏi chiến dịch cũ ở CAMP-08.04): tái đấu 6 sứ quân bị đánh dẹp trong cốt truyện,
// mỗi người mở sau nhiệm vụ mốc của Campaign V2, 3 bậc trên sân nhà. Luật ở @/core/campaign/raids, server kiểm tra lại.

import { useState } from "react";
import { OrnateFrame, SectionTitle } from "@/components/game-ui";
import { Button, choiceVariants } from "@/components/ui";
import {
  RAID_BOSSES,
  RAID_TIER_INFO,
  RAID_TIERS,
  raidBossOpen,
  raidCleared,
  raidDifficulty,
  raidLevel,
  raidRecommended,
  raidSetup,
  raidUnlocked,
  raidUnlockMission,
  storyNodeById,
  TIER_INFO,
  type Profile,
  type RaidTier,
  type WarlordEncounter,
} from "@/core";
import { ElementIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { DIFFICULTY_NAME, ELEMENT_NAME } from "../battle/labels";

function gateText(boss: WarlordEncounter): string {
  const gate = raidUnlockMission(boss.id);
  return gate
    ? `Mở sau nhiệm vụ ${storyNodeById(gate)?.title ?? gate}`
    : "Chưa có mốc mở";
}

function RaidPanel({
  boss,
  profile,
  busy,
  onStart,
}: {
  boss: WarlordEncounter;
  profile: Profile;
  busy: boolean;
  onStart: (tier: RaidTier) => void;
}) {
  const leader = boss.foes[0]!;
  const best = raidCleared(profile.campaign, boss.id);
  const open = raidBossOpen(profile.campaign, boss.id);
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-kicker text-frame-gold">
          Tái đấu · {boss.place}
        </p>
        <h3 className="text-lg font-bold text-frame-gold">
          {leader.name} trên sân nhà
          <span className="ml-2 text-sm font-normal text-on-wood-soft">
            {leader.title}
          </span>
        </h3>
        <p className="ui-frame-inset mt-1 p-2 text-sm text-on-wood">
          Cốt truyện kể {leader.name} bị đánh dẹp theo tổng thuật. Trận này là tái đấu do game sáng tác ở bậc khó
          hơn, không thêm sự kiện lịch sử nào.
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-on-wood">
          <ElementIcon element={leader.element} className="size-4 shrink-0" />
          {raidSetup(boss, 1).rule}
          {boss.mode === "3v3" && " Thủ lĩnh máu ×1,5."}
        </p>
        <p className="mt-1 text-caption text-on-wood-soft">
          Thể thức {boss.mode === "3v3" ? "3vs3, ra trận cùng đội đã chọn ở Doanh Trại" : "1vs1"}. Tái đấu sứ quân
          không dùng lương Bình Loạn và không đổi tiến độ Bình Loạn.
        </p>
      </div>
      {!open && <p className="text-sm text-on-wood-soft">{gateText(boss)}.</p>}
      <ul className="grid gap-2 sm:grid-cols-3">
        {RAID_TIERS.map((tier) => {
          const info = RAID_TIER_INFO[tier];
          const unlocked = raidUnlocked(profile.campaign, boss.id, tier);
          const won = best >= tier;
          const recommended = raidRecommended(boss, tier);
          return (
            <li
              key={tier}
              data-state={won ? "cleared" : unlocked ? "open" : "locked"}
              className={`ui-raid-tier flex flex-col gap-1 p-2 text-xs ${unlocked || won ? "" : "opacity-60"}`}
            >
              <p className="flex items-center justify-between text-sm font-bold text-on-wood">
                {info.name}
                {won && <span className="text-jade">Đã thắng</span>}
              </p>
              <p className="text-on-wood-soft">
                Đối thủ cấp {raidLevel(boss, tier)} ·{" "}
                {DIFFICULTY_NAME[raidDifficulty(boss, tier)]}
              </p>
              <p
                className={
                  profile.main.level < recommended
                    ? "text-danger"
                    : "text-jade"
                }
              >
                Cấp gợi ý {recommended}
              </p>
              <p className="text-frame-gold">
                {won
                  ? "Thưởng lần đầu đã nhận"
                  : `+${info.gold} vàng, 1 món ${TIER_INFO[info.gearTier].name} hệ ${ELEMENT_NAME[leader.element]}`}
              </p>
              <Button
                type="button"
                variant={won ? "secondary" : "primary"}
                disabled={busy || !unlocked}
                onClick={() => onStart(tier)}
                className="mt-1 min-h-11 w-full"
              >
                {unlocked
                  ? won
                    ? "Đánh lại"
                    : "Khiêu chiến"
                  : open
                    ? `Thắng ${RAID_TIER_INFO[(tier - 1) as RaidTier].name} trước`
                    : "Chưa mở"}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Khu Đánh trùm dưới chiến dịch: danh sách 6 sứ quân và bảng bậc của người đang chọn. */
export default function RaidHall({
  profile,
  busy,
  onStart,
}: {
  profile: Profile;
  busy: boolean;
  onStart: (bossId: string, tier: RaidTier) => void;
}) {
  const firstOpen = RAID_BOSSES.find((b) =>
    raidBossOpen(profile.campaign, b.id),
  );
  const [picked, setPicked] = useState<string | null>(null);
  // Sứ quân chưa mở không chọn được và không lộ tên, giống Sứ quân ký.
  const boss =
    RAID_BOSSES.find(
      (b) => b.id === picked && raidBossOpen(profile.campaign, b.id),
    ) ?? firstOpen;
  const openCount = RAID_BOSSES.filter((b) =>
    raidBossOpen(profile.campaign, b.id),
  ).length;
  return (
    <OrnateFrame
      as="section"
      aria-labelledby="raid-hall-title"
      level="raised"
      className="mt-6"
    >
      <SectionTitle
        id="raid-hall-title"
        description="Chế độ lặp lại riêng, không phải nhiệm vụ chiến dịch: tái đấu các sứ quân bị đánh dẹp, mỗi người mở sau nhiệm vụ mốc của họ trong chiến dịch."
        action={<span className="text-sm text-on-wood-soft">{openCount}/{RAID_BOSSES.length} sứ quân đã mở</span>}
      >
        Tái đấu sứ quân
      </SectionTitle>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <ol className="flex flex-col gap-1.5" aria-label="Sứ quân tái đấu">
          {RAID_BOSSES.map((b) => {
            const leader = b.foes[0]!;
            const open = raidBossOpen(profile.campaign, b.id);
            const best = raidCleared(profile.campaign, b.id);
            return (
              <li key={b.id}>
                <button
                  type="button"
                  disabled={!open}
                  aria-pressed={boss?.id === b.id}
                  onClick={() => setPicked(b.id)}
                  className={choiceVariants({ className: "min-h-11 w-full justify-start gap-2 px-2 py-1.5 text-left font-normal" })}
                >
                  {open ? (
                    <Portrait
                      id={leader.id}
                      element={leader.element}
                      profession={leader.profession}
                      className="size-8 shrink-0"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="size-8 shrink-0 rounded-full border border-dashed border-frame-line"
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {open ? leader.name : "Sứ quân chưa gặp"}
                    </span>
                    <span className="block truncate text-xs opacity-75">
                      {open
                        ? `Tái đấu · ${best > 0 ? `đã thắng ${RAID_TIER_INFO[best as RaidTier].name}` : "chưa thắng bậc nào"}`
                        : gateText(b)}
                    </span>
                  </span>
                  {open && (
                    <ElementIcon
                      element={leader.element}
                      className="size-4 shrink-0"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ol>
        {boss ? (
          <RaidPanel
            boss={boss}
            profile={profile}
            busy={busy}
            onStart={(tier) => onStart(boss.id, tier)}
          />
        ) : (
          <p className="ui-frame-inset self-center p-4 text-center text-sm text-on-wood-soft">
            Chưa có sứ quân nào mở. Sứ quân đầu tiên mở sau nhiệm vụ{" "}
            {gateText(RAID_BOSSES[0]!).replace("Mở sau nhiệm vụ ", "")}.
          </p>
        )}
      </div>
    </OrnateFrame>
  );
}
