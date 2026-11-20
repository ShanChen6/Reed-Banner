"use client";

// Bậc Trận Đồ ở thẻ Chiến tích: bậc theo số ván xếp hạng đã thắng (server đếm), mỗi bậc nhận vàng và một món một lần.

import { useEffect, useState } from "react";
import { FORMATION_TIERS, type GearItem, type Profile } from "@/core";
import { fetchProfile } from "../battle/online";
import { TierLadder } from "../leaderboard/RankBoard";
import { FORMATION_LADDER, tierClaimNote, tierErrorNote, tierRewards } from "../arena/tiers";

export default function FormationTierPanel() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    void fetchProfile().then((r) => live && r.profile && setProfile(r.profile));
    return () => {
      live = false;
    };
  }, []);

  if (!profile) return null;
  const wins = profile.formationWins ?? 0;

  const claim = async (tier: string) => {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/formation/tier", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tier }) });
      const body = (await res.json()) as { claimed?: { tier: string; gold: number; item: GearItem | null; soldFor: number }; error?: string; profile?: Profile };
      if (body.profile) setProfile(body.profile);
      setNote(body.claimed ? tierClaimNote(body.claimed) : tierErrorNote(body.error, "số ván thắng"));
      // Cập nhật số vàng trên thanh đầu trang.
      if (body.claimed) void fetchProfile();
    } catch {
      setNote("Tin báo đứt quãng, chưa liên lạc được máy chủ. Xin thử lại.");
    }
    setBusy(false);
  };

  return (
    <section aria-labelledby="formation-tier-title" className="ui-frame flex flex-col gap-2 p-4">
      <h2 id="formation-tier-title" className="font-serif text-xl font-bold text-title-on-wood">
        Bậc Trận Đồ – đã thắng {wins} ván xếp hạng
      </h2>
      <TierLadder
        tiers={FORMATION_LADDER}
        score={wins}
        unit="ván"
        label="Bậc Trận Đồ"
        rewards={tierRewards((id) => (profile.formationTiers ?? []).includes(id), FORMATION_TIERS)}
        onClaim={(i) => void claim(FORMATION_TIERS[i]!.id)}
        busy={busy}
      />
      {note && <p role="status" className="text-sm text-jade">{note}</p>}
      <p className="text-caption text-on-wood-soft">
        Bậc theo số ván xếp hạng đã thắng, cộng cả ba bậc Thường, Khó, Đại trận. Lần đầu đạt mỗi bậc nhận vàng và một món
        trang bị hệ của Đinh Bộ Lĩnh, mỗi bậc một lần.
      </p>
    </section>
  );
}
