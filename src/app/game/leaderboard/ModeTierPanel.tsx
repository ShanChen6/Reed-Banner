"use client";

// Bậc của một chế độ xếp hạng (Nhật Lệnh, Tháp Thiên Mệnh, Tầm Tướng Ký): dải sáu bậc theo thước đo trong hồ sơ, đạt mốc
// thì nhận vàng và một món, mỗi bậc một lần. Thước đo và mốc ở `MODE_TIERS` (@/core); nhận qua POST /api/tiers.

import { useEffect, useState } from "react";
import { MODE_TIERS, modeTierClaims, type GearItem, type ModeTierId, type Profile } from "@/core";
import { OrnateFrame } from "@/components/game-ui";
import { fetchProfile } from "../battle/online";
import { TierLadder } from "./RankBoard";
import { ladderOf, tierClaimNote, tierErrorNote, tierRewards } from "../arena/tiers";
import { useAudio } from "../audio/AudioProvider";

export default function ModeTierPanel({ mode }: { mode: ModeTierId }) {
  const { play: playSound } = useAudio();
  const ladder = MODE_TIERS[mode];
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
  const score = ladder.score(profile);
  const claimed = modeTierClaims(profile, mode);

  const claim = async (tier: string) => {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/tiers", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode, tier }) });
      const body = (await res.json()) as { claimed?: { tier: string; gold: number; item: GearItem | null; soldFor: number }; error?: string; profile?: Profile };
      if (body.profile) setProfile(body.profile);
      setNote(
        body.claimed
          ? tierClaimNote(body.claimed)
          : body.error === "loginRequired"
            ? "Cần trình danh để nhận thưởng bậc."
            : tierErrorNote(body.error, ladder.unit === "tầng" ? "số tầng" : `số ${ladder.unit}`),
      );
      // Cập nhật số vàng trên thanh đầu trang.
      if (body.claimed) {
        playSound("ui.reward");
        void fetchProfile();
      }
    } catch {
      setNote("Tin báo đứt quãng, chưa liên lạc được máy chủ. Xin thử lại.");
    }
    setBusy(false);
  };

  return (
    <OrnateFrame className="flex flex-col gap-2">
      <h3 className="font-bold text-frame-gold">
        {ladder.title}, {score} {ladder.unit}
      </h3>
      <TierLadder
        tiers={ladderOf(ladder.tiers)}
        score={score}
        unit={ladder.unit}
        label={ladder.title}
        rewards={tierRewards((id) => claimed.includes(id), ladder.tiers)}
        onClaim={(i) => void claim(ladder.tiers[i]!.id)}
        busy={busy}
      />
      {note && <p role="status" className="text-sm text-jade">{note}</p>}
      <p className="text-caption text-on-wood-soft">
        {ladder.measure} Lần đầu đạt mỗi bậc nhận vàng và một món trang bị hệ của Đinh Bộ Lĩnh, mỗi bậc một lần.
      </p>
    </OrnateFrame>
  );
}
