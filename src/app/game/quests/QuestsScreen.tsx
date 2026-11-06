"use client";

import { Alert, Button } from "@/components/ui";
import { FrameInset, ModeScreen, OrnateFrame, SectionTitle } from "@/components/game-ui";

// Nhiệm vụ: điểm danh 7 ngày, nhiệm vụ ngày/tuần, thành tựu. Tiến độ do server cộng khi trận kết thúc; bấm
// Nhận thì server kiểm tra lại rồi cộng vàng.

import { useEffect, useState } from "react";
import {
  ACHIEVEMENTS,
  achievementProgress,
  TTK_TICKETS_CHECKIN7,
  TTK_TICKETS_DAILY_ALL,
  TTK_TICKETS_WEEKLY_WIN15,
  CHECKIN_GOLD,
  DAILY_QUESTS,
  nextStreak,
  questProgress,
  vnDay,
  WEEKLY_QUESTS,
  type Profile,
  type ProfileAction,
  type QuestDef,
} from "@/core";
import { fetchProfile, sendProfileAction } from "../battle/online";
import { PROFILE_ERROR } from "../battle/ProgressPanel";
import PlacesPanel from "./PlacesPanel";
import SpecialQuestsPanel from "./SpecialQuestsPanel";

interface Row {
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

function questRow(p: Profile, q: QuestDef, now: number): Row {
  return {
    ...q,
    ...questProgress(p.quests, q, now),
    action: { type: "claimQuest", id: q.id },
  };
}

/** Thành tựu Tầm Tướng Ký (`ttk.*`) chỉ hiện khi chế độ đã bật, để không lộ chế độ chưa phát hành. */
export const isTamTuongKyAchievement = (id: string) => id.startsWith("ttk.");
/** Thành tựu Gói 2 chỉ hiện khi cờ Gói 2 bật. */
export const isTamTuongKyPack2Achievement = (id: string) => id.startsWith("ttk.pack-2.");
/** Thành tựu Gói 3 chỉ hiện khi cờ Gói 3 bật. */
export const isTamTuongKyPack3Achievement = (id: string) => id.startsWith("ttk.pack-3.");

export default function QuestsScreen({
  tamTuongKy = false,
  tamTuongKyPack2 = false,
  tamTuongKyPack3 = false,
}: {
  tamTuongKy?: boolean;
  tamTuongKyPack2?: boolean;
  tamTuongKyPack3?: boolean;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // Giờ lúc mở trang, chỉ để hiển thị; server dùng giờ của server khi nhận thưởng.
  const [now] = useState(() => Date.now());

  useEffect(() => {
    void fetchProfile().then((r) => {
      if (r.profile) setProfile(r.profile);
      else setLoadError(true);
    });
  }, []);

  if (!profile) {
    return (
      <Shell>
        <p className="py-24 text-center text-on-wood-soft">
          {loadError ? "Không tải được hồ sơ, thử tải lại trang." : "Đang tải…"}
        </p>
      </Shell>
    );
  }

  const act = async (a: ProfileAction) => {
    setBusy(true);
    const r = await sendProfileAction(a);
    setBusy(false);
    if (r.profile) setProfile(r.profile);
    setMessage(
      r.error
        ? (PROFILE_ERROR[r.error as keyof typeof PROFILE_ERROR] ?? r.error)
        : null,
    );
  };

  // Phiếu Tầm Tướng Ký kèm thưởng (Design Freeze P-10): chỉ hiện khi chế độ bật và người chơi đã vào chế độ,
  // vì phiếu chỉ cộng cho người đã vào.
  const ttk = tamTuongKy ? profile.tamTuongKy : undefined;
  const checkedToday = profile.quests.checkIn.last === vnDay(now);
  // Ô đang tới lượt: hôm nay đã điểm danh thì là ô vừa nhận, chưa thì là ô sẽ nhận.
  const streak = checkedToday
    ? profile.quests.checkIn.streak
    : nextStreak(profile.quests, now);

  const sections: { title: string; note: string; rows: Row[] }[] = [
    {
      title: "Nhiệm vụ ngày",
      note: ttk
        ? `Làm lại lúc 0 giờ mỗi ngày. Nhận đủ nhiệm vụ ngày: +${TTK_TICKETS_DAILY_ALL} phiếu Tầm Tướng Ký.`
        : "Làm lại lúc 0 giờ mỗi ngày.",
      rows: DAILY_QUESTS.map((q) => questRow(profile, q, now)),
    },
    {
      title: "Nhiệm vụ tuần",
      note: "Làm lại lúc 0 giờ thứ Hai.",
      rows: WEEKLY_QUESTS.map((q) => ({ ...questRow(profile, q, now), ...(ttk && q.id === "w.win15" ? { tickets: TTK_TICKETS_WEEKLY_WIN15 } : {}) })),
    },
    {
      title: "Thành tựu",
      note: "Mỗi thành tựu nhận một lần.",
      rows: ACHIEVEMENTS.filter(
        (a) =>
          (tamTuongKy || !isTamTuongKyAchievement(a.id)) &&
          (tamTuongKyPack2 || !isTamTuongKyPack2Achievement(a.id)) &&
          (tamTuongKyPack3 || !isTamTuongKyPack3Achievement(a.id)),
      ).map((a) => ({
        id: a.id,
        title: a.title,
        gold: a.gold,
        target: a.target,
        ...achievementProgress(profile, a),
        action: { type: "claimAchievement", id: a.id },
      })),
    },
  ];

  return (
    <Shell>
      {ttk && (
        <p className="text-right text-caption text-on-wood-soft">
          <span className="font-bold text-title-on-wood">{ttk.tickets}</span> phiếu Tầm Tướng Ký
        </p>
      )}
      {message && <Alert>{message}</Alert>}

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

      <SpecialQuestsPanel profile={profile} />

      <div className="grid gap-4 lg:grid-cols-3">
        {sections.map((sec) => (
          <OrnateFrame key={sec.title} className="flex flex-col">
            <SectionTitle description={sec.note}>{sec.title}</SectionTitle>
            <ul className="flex flex-col gap-2">
              {sec.rows.map((r) => (
                <FrameInset key={r.id} className="flex items-center gap-2 p-2.5">
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
                        <div
                          className={`h-full ${r.done ? "bg-jade" : "bg-frame-gold"}`}
                          style={{ width: `${(100 * r.value) / r.target}%` }}
                        />
                      </div>
                      <span className="tabular-nums">
                        {r.value}/{r.target}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={r.done && !r.claimed ? "secondary" : "ghost"}
                    disabled={busy || !r.done || r.claimed}
                    onClick={() => void act(r.action)}
                    className={`w-24 shrink-0 text-caption ${r.done && !r.claimed ? "border-frame-gold text-title-on-wood" : "text-on-wood-soft"}`}
                  >
                    {r.claimed ? "Đã nhận" : `${r.gold} vàng${r.tickets ? ` +${r.tickets} phiếu` : ""}`}
                  </Button>
                </FrameInset>
              ))}
            </ul>
          </OrnateFrame>
        ))}
      </div>

      <PlacesPanel collected={profile.formation?.collection ?? []} />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <ModeScreen label="Nhiệm vụ">{children}</ModeScreen>;
}
