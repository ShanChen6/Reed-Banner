"use client";

// Điểm danh 7 ngày, đặt ở Nhật Lệnh: điểm danh liền ngày nhận nhiều vàng hơn, bỏ một ngày thì chuỗi về ngày 1.
// Đã điểm danh trong ngày thì khung thu thành một dòng, bấm mới mở chuỗi 7 ngày.

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
  const days = (
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
  );
  if (checkedToday) {
    // Đã điểm danh: thu thành một dòng để đề hôm nay lên sát đầu màn; mở ra mới thấy chuỗi 7 ngày.
    const nextGold = CHECKIN_GOLD[streak % CHECKIN_GOLD.length]!;
    return (
      <OrnateFrame flush className="px-4 py-1 sm:px-5" aria-label="Điểm danh">
        <details className="group">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm [&::-webkit-details-marker]:hidden">
            <span aria-hidden className="text-jade">✓</span>
            <span className="min-w-0 flex-1">
              <strong className="text-title-on-wood">Đã điểm danh hôm nay</strong>
              <span className="text-on-wood-soft">, ngày {streak}/{CHECKIN_GOLD.length}, mai nhận {nextGold} vàng{streak >= CHECKIN_GOLD.length ? " (chuỗi mới)" : ""}</span>
            </span>
            <span className="shrink-0 text-caption text-frame-gold underline underline-offset-2">
              <span className="group-open:hidden">Xem chuỗi</span>
              <span className="hidden group-open:inline">Thu gọn</span>
            </span>
          </summary>
          <div className="pb-3 pt-1">{days}</div>
        </details>
      </OrnateFrame>
    );
  }
  return (
      <OrnateFrame className="flex flex-col gap-3">
        <SectionTitle
          description="Điểm danh liền ngày để nhận nhiều hơn; bỏ một ngày thì chuỗi về ngày 1. Đủ 7 ngày thì bắt đầu chuỗi mới."
          action={
            <Button disabled={busy} onClick={() => void act({ type: "checkIn" })}>
              Điểm danh
            </Button>
          }
        >
          Điểm danh
        </SectionTitle>
        {days}
      </OrnateFrame>
  );
}
