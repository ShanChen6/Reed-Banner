"use client";

// Điểm danh 7 ngày, đặt ở Nhật Lệnh: điểm danh liền ngày nhận nhiều vàng hơn, bỏ một ngày thì chuỗi về ngày 1.

import { Button } from "@/components/ui";
import { OrnateFrame, SectionTitle } from "@/components/game-ui";
import { CHECKIN_GOLD, TTK_TICKETS_CHECKIN7, nextStreak, vnDay, type Profile, type ProfileAction } from "@/core";

export default function CheckInPanel({ profile, now, busy, act }: {
  profile: Profile;
  /** Giờ lúc mở trang, chỉ để hiển thị; server dùng giờ của server khi điểm danh. */
  now: number;
  busy: boolean;
  act: (action: ProfileAction) => Promise<unknown>;
}) {
  // Phiếu Tầm Tướng Ký ở ngày 7 chỉ cộng cho người đã vào chế độ đó.
  const ttk = profile.tamTuongKy;
  const checkedToday = profile.quests.checkIn.last === vnDay(now);
  // Ô đang tới lượt: hôm nay đã điểm danh thì là ô vừa nhận, chưa thì là ô sẽ nhận.
  const streak = checkedToday ? profile.quests.checkIn.streak : nextStreak(profile.quests, now);
  return (
      <OrnateFrame level="raised" className="flex flex-col gap-3">
        <SectionTitle
          description="Điểm danh liền ngày để nhận nhiều hơn; bỏ một ngày thì chuỗi về ngày 1. Đủ 7 ngày thì bắt đầu chuỗi mới."
          action={
            <Button disabled={busy || checkedToday} onClick={() => void act({ type: "checkIn" })}>
              {checkedToday ? "Hôm nay đã điểm danh" : "Điểm danh"}
            </Button>
          }
        >
          Điểm danh
        </SectionTitle>
        <ol className="grid grid-cols-4 gap-1.5 text-center sm:grid-cols-7">
          {CHECKIN_GOLD.map((g, i) => {
            const n = i + 1;
            const got = n < streak || (checkedToday && n === streak);
            const today = n === streak && !got;
            return (
              <li
                key={n}
                aria-current={today ? "step" : undefined}
                className={`flex flex-col items-center gap-0.5 rounded-control border px-1 py-2 ${got ? "border-jade/60 bg-jade/10" : today ? "ui-choice is-selected" : "border-frame-line-soft bg-wood-inset"}`}
              >
                <span className={`text-caption ${today ? "" : "text-on-wood-soft"}`}>Ngày {n}</span>
                <span className={`font-bold ${today ? "" : "text-title-on-wood"}`}>{g}</span>
                <span className={`text-caption ${got ? "text-jade" : today ? "" : "text-on-wood-soft"}`}>
                  {got ? "Đã nhận" : "vàng"}
                </span>
                {ttk && n === CHECKIN_GOLD.length && <span className="text-caption text-frame-gold">+{TTK_TICKETS_CHECKIN7} phiếu</span>}
              </li>
            );
          })}
        </ol>
      </OrnateFrame>
  );
}
