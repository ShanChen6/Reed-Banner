"use client";

// Đánh trùm (lộ trình 4.5): sứ quân đã hạ thách đấu lại ở 3 bậc, trên sân nhà của mình. Luật ở @/core/campaign/raids.

import {
  RAID_TIER_INFO,
  RAID_TIERS,
  raidCleared,
  raidDifficulty,
  raidLevel,
  raidRecommended,
  raidSetup,
  raidUnlocked,
  TIER_INFO,
  type CampaignStage,
  type Profile,
  type RaidTier,
} from "@/core";
import { ElementIcon } from "../demo/art/icons";
import { DIFFICULTY_NAME, ELEMENT_NAME } from "../demo/labels";

export default function RaidPanel({
  stage,
  profile,
  busy,
  onStart,
}: {
  stage: CampaignStage;
  profile: Profile;
  busy: boolean;
  onStart: (tier: RaidTier) => void;
}) {
  const leader = stage.foes[0]!;
  const best = raidCleared(profile.campaign, stage.id);
  const stageCleared = profile.campaign.cleared.includes(stage.id);
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-xs tracking-widest text-rose-300/80 uppercase">
          Đánh trùm
        </p>
        <h2 className="text-lg font-bold text-amber-100">
          {leader.name} trên sân nhà
        </h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-300">
          <ElementIcon element={leader.element} className="size-4 shrink-0" />
          {raidSetup(stage, 1).rule}
          {stage.mode === "3v3" && " Thủ lĩnh máu ×1,5."}
        </p>
      </div>
      {!stageCleared && (
        <p className="text-sm text-stone-400">
          Qua màn này để {leader.name} thách đấu lại.
        </p>
      )}
      <ul className="grid gap-2 sm:grid-cols-3">
        {RAID_TIERS.map((tier) => {
          const info = RAID_TIER_INFO[tier];
          const open = raidUnlocked(profile.campaign, stage.id, tier);
          const won = best >= tier;
          const recommended = raidRecommended(stage, tier);
          return (
            <li
              key={tier}
              className={`flex flex-col gap-1 rounded-lg border p-2 text-xs ${
                won
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : open
                    ? "border-rose-400/50 bg-rose-500/10"
                    : "border-white/10 bg-black/25 opacity-60"
              }`}
            >
              <p className="flex items-center justify-between text-sm font-bold text-amber-100">
                {info.name}
                {won && <span className="text-emerald-300">✓ Đã thắng</span>}
              </p>
              <p className="text-stone-300">
                Đối thủ cấp {raidLevel(stage, tier)} ·{" "}
                {DIFFICULTY_NAME[raidDifficulty(stage, tier)]}
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
                disabled={busy || !open}
                onClick={() => onStart(tier)}
                className="mt-1 rounded border border-[var(--gold)] bg-gradient-to-b from-[#9b2c2c] to-[#5c1a1a] px-3 py-1 font-bold text-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {open
                  ? won
                    ? "Đánh lại"
                    : "Khiêu chiến"
                  : stageCleared
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
