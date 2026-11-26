"use client";

// Thưởng vàng theo hạng cuối kỳ của một chế độ (Nhật Lệnh, Tháp Thiên Mệnh, Tầm Tướng Ký…); chế độ theo tuần kèm bó
// nguyên tố Tầm Tướng Ký, và các bậc có phiếu kèm phiếu Tầm Tướng Ký. Lấy từ GET /api/rank-rewards, nhận bằng
// POST /api/rank-rewards/claim. Khách chỉ thấy lời nhắc đăng nhập; chỉ tài khoản đã đăng nhập nhận được.

import { useCallback, useEffect, useState } from "react";
import { REWARD_TIERS, type RankRewardMode } from "@/core";
import { OrnateFrame, SectionTitle } from "@/components/game-ui";
import { buttonVariants } from "@/components/ui";
import { SceneLink } from "../SceneContext";
import { useAudio } from "../audio/AudioProvider";

interface Item {
  readonly mode: RankRewardMode;
  readonly period: string;
  readonly rank: number;
  readonly participants: number;
  readonly tier: string;
  readonly gold: number;
  /** Bó nguyên tố Tầm Tướng Ký kèm thưởng (chế độ theo tuần). */
  readonly bundles?: number;
  /** Phiếu Tầm Tướng Ký kèm thưởng. */
  readonly tickets?: number;
  /** Đá Cường Hóa kèm thưởng (Hành Thương Ký). */
  readonly stones?: number;
}

const TIER_LABEL = Object.fromEntries(REWARD_TIERS.map((t) => [t.tier, t.label])) as Record<string, string>;
/** Phần thưởng kèm vàng, nối sau “N vàng”: Đá Cường Hóa, phiếu và bó Tầm Tướng Ký. */
const extras = (i: { readonly tickets?: number; readonly bundles?: number; readonly stones?: number }) =>
  [i.stones ? `${i.stones} Đá Cường Hóa` : "", i.tickets ? `${i.tickets} phiếu Tầm Tướng Ký` : "", i.bundles ? `${i.bundles} bó nguyên tố Tầm Tướng Ký` : ""].filter(Boolean).map((t) => `, ${t}`).join("");

const PERIOD_NOUN: Record<RankRewardMode, string> = { daily: "ngày", destiny: "chu kỳ", survival: "mùa", arena: "mùa", tamTuongKy: "tuần", pvp: "mùa", trade: "mùa" };

export default function RankRewardsPanel({ mode, onClaimed }: { mode: RankRewardMode; onClaimed?: () => void }) {
  const { play: playSound } = useAudio();
  const [state, setState] = useState<{ canClaim: boolean; items: Item[] } | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/rank-rewards", { cache: "no-store" });
      const body = (await res.json()) as { canClaim: boolean; items: Item[] };
      setState({ canClaim: body.canClaim, items: body.items.filter((i) => i.mode === mode) });
    } catch {
      setState(null);
    }
  }, [mode]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- tải dữ liệu từ server khi vào màn
  useEffect(() => void load(), [load]);

  const claim = async (item: Item) => {
    setBusy(true);
    try {
      const res = await fetch("/api/rank-rewards/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: item.mode, period: item.period }),
      });
      const body = (await res.json()) as { gold?: number; rank?: number; participants?: number; tickets?: number; bundles?: number; stones?: number };
      setNote(res.ok ? `Đã nhận ${body.gold} vàng${extras(body)} (hạng ${body.rank}/${body.participants}).` : "Chưa nhận được thưởng. Xin thử lại sau.");
      if (res.ok) {
        playSound("ui.reward");
        onClaimed?.();
      }
    } catch {
      setNote("Chưa nhận được thưởng. Xin thử lại sau.");
    }
    setBusy(false);
    void load();
  };

  if (!state) return null;
  if (!state.canClaim)
    return (
      <p role="note" className="rounded border border-frame-gold-hi/20 bg-black/20 px-3 py-2 text-sm text-muted">
        Thưởng vàng theo hạng cuối kỳ chỉ dành cho tài khoản đã ghi danh.{" "}
        <SceneLink scene="LOGIN" className="text-frame-gold underline">Trình danh</SceneLink>
      </p>
    );
  if (state.items.length === 0 && !note) return null;
  // Card lớn như các khung khác trong màn (góc hoa văn tự có trong ModeScreen card, 21/11/2026); mỗi kỳ chờ nhận là một ô lõm.
  return (
    <OrnateFrame aria-label="Thưởng hạng chờ nhận" className="flex min-w-0 flex-col gap-2">
      <SectionTitle description="Thưởng theo hạng cuối kỳ đã khép. Mỗi kỳ nhận một lần.">Thưởng hạng chờ nhận</SectionTitle>
      {note && <p role="status" aria-live="polite" className="text-sm text-title-on-wood">{note}</p>}
      {state.items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {state.items.map((i) => (
            <li key={`${i.mode}-${i.period}`} className="ui-frame-inset flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm text-on-wood">
              <span>
                Kỳ {PERIOD_NOUN[i.mode]} {i.period}: hạng {i.rank}/{i.participants} ({TIER_LABEL[i.tier]}), <b className="text-frame-gold">{i.gold} vàng</b>{extras(i)}
              </span>
              <button type="button" disabled={busy} onClick={() => void claim(i)} className={buttonVariants({ size: "sm", className: "min-h-10 px-4 pointer-coarse:min-h-11" })}>
                Nhận
              </button>
            </li>
          ))}
        </ul>
      )}
    </OrnateFrame>
  );
}
