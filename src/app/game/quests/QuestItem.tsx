"use client";

// Một dòng nhiệm vụ (tiến độ và nút nhận thưởng), dùng chung cho màn Nhiệm vụ và khung Nhiệm vụ ngày ở Nhật Lệnh.

import { Button } from "@/components/ui";
import { FrameInset } from "@/components/game-ui";
import { questProgress, type Profile, type ProfileAction, type QuestDef } from "@/core";

export interface Row {
  readonly id: string;
  readonly title: string;
  readonly gold: number;
  readonly value: number;
  readonly target: number;
  readonly done: boolean;
  readonly claimed: boolean;
  readonly action: ProfileAction;
  /** Phiếu Tầm Tướng Ký kèm thưởng (chỉ khi chế độ bật và người chơi đã vào chế độ). */
  readonly tickets?: number;
}

export function questRow(p: Profile, q: QuestDef, now: number): Row {
  return {
    ...q,
    ...questProgress(p.quests, q, now),
    action: { type: "claimQuest", id: q.id },
  };
}

export const claimable = (r: Row) => r.done && !r.claimed;

export function QuestItem({ r, busy, onClaim }: { r: Row; busy: boolean; onClaim: (r: Row) => void }) {
  return (
    <FrameInset className="flex items-center gap-2 p-2.5">
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{r.title}</p>
        <div className="mt-1 flex items-center gap-2 text-caption text-on-wood-soft">
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-black/50"
            role="meter"
            aria-label={r.title}
            aria-valuenow={r.value}
            aria-valuemin={0}
            aria-valuemax={r.target}
          >
            <div className={`h-full ${r.done ? "bg-jade" : "bg-frame-gold"}`} style={{ width: `${(100 * r.value) / r.target}%` }} />
          </div>
          <span className="tabular-nums">
            {r.value}/{r.target}
          </span>
        </div>
      </div>
      <Button
        size="sm"
        variant={claimable(r) ? "secondary" : "ghost"}
        disabled={busy || !claimable(r)}
        onClick={() => onClaim(r)}
        className={`w-24 shrink-0 text-caption ${claimable(r) ? "border-frame-gold text-title-on-wood" : "text-on-wood-soft"}`}
      >
        {r.claimed ? "Đã nhận" : `${r.gold} vàng${r.tickets ? ` +${r.tickets} phiếu` : ""}`}
      </Button>
    </FrameInset>
  );
}

