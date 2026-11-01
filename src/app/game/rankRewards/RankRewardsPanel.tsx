"use client";

// Thưởng vàng theo hạng cuối kỳ của một chế độ (Nhật Lệnh, Tháp Thiên Mệnh). Lấy từ GET /api/rank-rewards, nhận bằng
// POST /api/rank-rewards/claim. Khách chỉ thấy lời nhắc đăng nhập; chỉ tài khoản đã đăng nhập nhận được.

import { useCallback, useEffect, useState } from "react";
import { REWARD_TIERS, type RankRewardMode } from "@/core";
import { SceneLink } from "../SceneContext";

interface Item {
  readonly mode: RankRewardMode;
  readonly period: string;
  readonly rank: number;
  readonly participants: number;
  readonly tier: string;
  readonly gold: number;
}

const TIER_LABEL = Object.fromEntries(REWARD_TIERS.map((t) => [t.tier, t.label])) as Record<string, string>;
const PERIOD_NOUN: Record<RankRewardMode, string> = { daily: "ngày", destiny: "chu kỳ", survival: "mùa", arena: "mùa" };

export default function RankRewardsPanel({ mode, onClaimed }: { mode: RankRewardMode; onClaimed?: () => void }) {
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
      const body = (await res.json()) as { gold?: number; rank?: number; participants?: number };
      setNote(res.ok ? `Đã nhận ${body.gold} vàng (hạng ${body.rank}/${body.participants}).` : "Không nhận được thưởng, thử lại sau nhé.");
      if (res.ok) onClaimed?.();
    } catch {
      setNote("Không nhận được thưởng, thử lại sau nhé.");
    }
    setBusy(false);
    void load();
  };

  if (!state) return null;
  if (!state.canClaim)
    return (
      <p role="note" className="rounded border border-amber-400/20 bg-black/20 px-3 py-2 text-sm text-muted">
        Thưởng vàng theo hạng cuối kỳ chỉ dành cho tài khoản đã đăng nhập.{" "}
        <SceneLink scene="LOGIN" className="text-amber-300 underline">Đăng nhập</SceneLink>
      </p>
    );
  if (state.items.length === 0 && !note) return null;
  return (
    <section aria-label="Thưởng hạng chờ nhận" className="rounded border border-amber-400/30 bg-black/25 p-3">
      <h2 className="mb-1 text-sm font-bold text-amber-200">Thưởng hạng chờ nhận</h2>
      {note && <p role="status" aria-live="polite" className="mb-1 text-sm text-amber-100">{note}</p>}
      <ul className="flex flex-col gap-1.5">
        {state.items.map((i) => (
          <li key={`${i.mode}-${i.period}`} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>
              Kỳ {PERIOD_NOUN[i.mode]} {i.period}: hạng {i.rank}/{i.participants} ({TIER_LABEL[i.tier]}) · <b>{i.gold} vàng</b>
            </span>
            <button type="button" disabled={busy} onClick={() => void claim(i)} className="min-h-10 rounded bg-amber-500 px-4 font-semibold text-stone-950 disabled:opacity-60">
              Nhận
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
