"use client";

// Đánh trùm (lộ trình 4.5, tách khỏi chiến dịch cũ ở CAMP-08.04): tái đấu 6 sứ quân bị đánh dẹp trong cốt truyện,
// mỗi người mở sau nhiệm vụ mốc của Campaign V2, 3 bậc trên sân nhà. Luật ở @/core/campaign/raids, server kiểm tra lại.

import { useState } from "react";
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
        <p className="text-xs tracking-widest text-rose-300/80 uppercase">
          Tái đấu · {boss.place}
        </p>
        <h3 className="text-lg font-bold text-amber-100">
          {leader.name} trên sân nhà
          <span className="ml-2 text-sm font-normal text-amber-200/80">
            {leader.title}
          </span>
        </h3>
        <p className="mt-1 rounded border border-stone-400/40 bg-stone-500/15 p-2 text-sm text-stone-200">
          Cốt truyện kể {leader.name} bị đánh dẹp theo tổng thuật. Trận này là tái đấu do game sáng tác ở bậc khó
          hơn, không thêm sự kiện lịch sử nào.
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-foreground-secondary">
          <ElementIcon element={leader.element} className="size-4 shrink-0" />
          {raidSetup(boss, 1).rule}
          {boss.mode === "3v3" && " Thủ lĩnh máu ×1,5."}
        </p>
        <p className="mt-1 text-xs text-muted">
          Thể thức {boss.mode === "3v3" ? "3vs3, ra trận cùng đội đã chọn ở trang Hồ sơ" : "1vs1"}. Đánh trùm
          không dùng lương chiến dịch và không đổi tiến độ chiến dịch.
        </p>
      </div>
      {!open && <p className="text-sm text-muted">{gateText(boss)}.</p>}
      <ul className="grid gap-2 sm:grid-cols-3">
        {RAID_TIERS.map((tier) => {
          const info = RAID_TIER_INFO[tier];
          const unlocked = raidUnlocked(profile.campaign, boss.id, tier);
          const won = best >= tier;
          const recommended = raidRecommended(boss, tier);
          return (
            <li
              key={tier}
              className={`flex flex-col gap-1 rounded-lg border p-2 text-xs ${
                won
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : unlocked
                    ? "border-rose-400/50 bg-rose-500/10"
                    : "border-white/10 bg-black/25 opacity-60"
              }`}
            >
              <p className="flex items-center justify-between text-sm font-bold text-amber-100">
                {info.name}
                {won && <span className="text-emerald-300">✓ Đã thắng</span>}
              </p>
              <p className="text-foreground-secondary">
                Đối thủ cấp {raidLevel(boss, tier)} ·{" "}
                {DIFFICULTY_NAME[raidDifficulty(boss, tier)]}
              </p>
              <p
                className={
                  profile.main.level < recommended
                    ? "text-rose-300"
                    : "text-emerald-300"
                }
              >
                Cấp gợi ý {recommended}
              </p>
              <p className="text-amber-200">
                {won
                  ? "Thưởng lần đầu đã nhận"
                  : `+${info.gold} vàng, 1 món ${TIER_INFO[info.gearTier].name} hệ ${ELEMENT_NAME[leader.element]}`}
              </p>
              <button
                type="button"
                disabled={busy || !unlocked}
                onClick={() => onStart(tier)}
                className="mt-1 min-h-11 rounded border border-[var(--gold)] bg-gradient-to-b from-[#9b2c2c] to-[#5c1a1a] px-3 py-1 font-bold text-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {unlocked
                  ? won
                    ? "Đánh lại"
                    : "Khiêu chiến"
                  : open
                    ? `Thắng ${RAID_TIER_INFO[(tier - 1) as RaidTier].name} trước`
                    : "Chưa mở"}
              </button>
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
    <section
      aria-labelledby="raid-hall-title"
      className="mt-6 rounded-xl border-2 border-[#7a2c1d] bg-[#2a1719]/90 p-4 shadow-card-inset"
    >
      <h2 id="raid-hall-title" className="text-xl font-black text-amber-100">
        Đánh trùm · {openCount}/{RAID_BOSSES.length} sứ quân đã mở
      </h2>
      <p className="mb-3 text-sm text-muted">
        Chế độ lặp lại riêng, không phải nhiệm vụ chiến dịch: tái đấu các sứ
        quân bị đánh dẹp, mỗi người mở sau nhiệm vụ mốc của họ trong chiến dịch.
      </p>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <ol className="flex flex-col gap-1.5" aria-label="Sứ quân đánh trùm">
          {RAID_BOSSES.map((b) => {
            const leader = b.foes[0]!;
            const open = raidBossOpen(profile.campaign, b.id);
            const best = raidCleared(profile.campaign, b.id);
            return (
              <li key={b.id}>
                <button
                  type="button"
                  disabled={!open}
                  aria-current={boss?.id === b.id}
                  onClick={() => setPicked(b.id)}
                  className={`flex min-h-11 w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-sm transition ${
                    boss?.id === b.id
                      ? "border-amber-300 bg-amber-500/20"
                      : "border-white/10 bg-black/25 hover:bg-black/40"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
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
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-stone-700"
                    >
                      🔒
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {open ? leader.name : "Sứ quân chưa gặp"}
                    </span>
                    <span className="block truncate text-xs text-muted">
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
          <p className="self-center text-sm text-muted">
            Chưa có sứ quân nào mở. Sứ quân đầu tiên mở sau nhiệm vụ{" "}
            {gateText(RAID_BOSSES[0]!).replace("Mở sau nhiệm vụ ", "")}.
          </p>
        )}
      </div>
    </section>
  );
}
