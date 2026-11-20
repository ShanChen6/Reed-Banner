"use client";

// Nhiệm vụ ngày đặt ngay trong Nhật Lệnh: tiến độ hôm nay và nút nhận vàng, không phải sang màn Nhiệm vụ.
// Tiến độ do server cộng khi trận kết thúc; bấm Nhận thì server kiểm tra lại rồi cộng vàng.

import { OrnateFrame, SectionTitle } from "@/components/game-ui";
import { DAILY_QUESTS, TTK_TICKETS_DAILY_ALL, type Profile, type ProfileAction } from "@/core";
import { SceneLink } from "../SceneContext";
import { QuestItem, claimable, questRow } from "./QuestItem";

export default function DailyQuestsPanel({ profile, now, busy, act }: {
  profile: Profile;
  /** Giờ lúc mở trang, chỉ để hiển thị; server dùng giờ của server khi nhận thưởng. */
  now: number;
  busy: boolean;
  act: (action: ProfileAction) => Promise<unknown>;
}) {
  const rows = DAILY_QUESTS.map((q) => questRow(profile, q, now));
  const ready = rows.filter(claimable).length;
  const done = rows.filter((r) => r.claimed).length;
  return (
    <OrnateFrame className="flex min-w-0 flex-col gap-2" aria-labelledby="daily-quests-title">
      <SectionTitle
        id="daily-quests-title"
        description={`Làm lại lúc 0 giờ mỗi ngày, đã nhận ${done}/${DAILY_QUESTS.length}${ready > 0 ? `, ${ready} chờ nhận` : ""}.${
          // Phiếu Tầm Tướng Ký chỉ cộng cho người đã vào chế độ đó.
          profile.tamTuongKy ? ` Nhận đủ: +${TTK_TICKETS_DAILY_ALL} phiếu Tầm Tướng Ký.` : ""
        }`}
        action={
          <SceneLink scene="QUESTS" className="inline-flex min-h-11 items-center text-sm text-frame-gold underline underline-offset-2">
            Nhiệm vụ tuần
          </SceneLink>
        }
      >
        Nhiệm vụ ngày
      </SectionTitle>
      <ul className="flex flex-col gap-2">
        {rows.map((r) => (
          <QuestItem key={r.id} r={r} busy={busy} onClaim={(row) => void act(row.action)} />
        ))}
      </ul>
    </OrnateFrame>
  );
}
