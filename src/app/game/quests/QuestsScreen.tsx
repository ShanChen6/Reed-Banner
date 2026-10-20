"use client";

// Nhiệm vụ: điểm danh 7 ngày, nhiệm vụ ngày/tuần, thành tựu. Tiến độ do server cộng khi trận kết thúc; bấm
// Nhận thì server kiểm tra lại rồi cộng vàng.

import { useEffect, useState } from "react";
import {
  ACHIEVEMENTS,
  achievementProgress,
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
import { SceneLink } from "../SceneContext";

interface Row {
  readonly id: string;
  readonly title: string;
  readonly gold: number;
  readonly value: number;
  readonly target: number;
  readonly done: boolean;
  readonly claimed: boolean;
  readonly action: ProfileAction;
}

function questRow(p: Profile, q: QuestDef, now: number): Row {
  return {
    ...q,
    ...questProgress(p.quests, q, now),
    action: { type: "claimQuest", id: q.id },
  };
}

export default function QuestsScreen() {
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
        <p className="py-24 text-center text-stone-300">
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

  const checkedToday = profile.quests.checkIn.last === vnDay(now);
  // Ô đang tới lượt: hôm nay đã điểm danh thì là ô vừa nhận, chưa thì là ô sẽ nhận.
  const streak = checkedToday
    ? profile.quests.checkIn.streak
    : nextStreak(profile.quests, now);

  const sections: { title: string; note: string; rows: Row[] }[] = [
    {
      title: "Nhiệm vụ ngày",
      note: "Làm lại lúc 0 giờ mỗi ngày.",
      rows: DAILY_QUESTS.map((q) => questRow(profile, q, now)),
    },
    {
      title: "Nhiệm vụ tuần",
      note: "Làm lại lúc 0 giờ thứ Hai.",
      rows: WEEKLY_QUESTS.map((q) => questRow(profile, q, now)),
    },
    {
      title: "Thành tựu",
      note: "Mỗi thành tựu nhận một lần.",
      rows: ACHIEVEMENTS.map((a) => ({
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
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-amber-100">Nhiệm vụ</h1>
          <p className="text-sm text-stone-400">{profile.gold} vàng</p>
        </div>
        <div className="flex gap-2 text-sm">
          <SceneLink
            scene="PLAYING"
            className="rounded bg-white/10 px-3 py-1.5 hover:bg-white/15"
          >
            Chơi
          </SceneLink>
          <SceneLink
            scene="PROFILE"
            className="rounded bg-white/10 px-3 py-1.5 hover:bg-white/15"
          >
            Hồ sơ
          </SceneLink>
        </div>
      </div>
      {message && <p className="mb-3 text-sm text-rose-400">{message}</p>}

      <section className="mb-4 flex flex-col gap-3 rounded-xl border-2 border-[#8a6a3b] bg-[#2a1f19]/90 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold text-amber-200">Điểm danh</h2>
          <button
            type="button"
            disabled={busy || checkedToday}
            onClick={() => void act({ type: "checkIn" })}
            className="rounded-lg border-2 border-[var(--gold)] bg-gradient-to-b from-[#c0392b] to-[#7a2c1d] px-5 py-1.5 font-bold text-amber-50 disabled:opacity-50"
          >
            {checkedToday ? "Hôm nay đã điểm danh" : "Điểm danh"}
          </button>
        </div>
        <ol className="grid grid-cols-7 gap-1.5 text-center text-xs">
          {CHECKIN_GOLD.map((g, i) => {
            const n = i + 1;
            const got = n < streak || (checkedToday && n === streak);
            const today = n === streak;
            return (
              <li
                key={n}
                className={`flex flex-col items-center gap-0.5 rounded-lg border px-1 py-2 ${got ? "border-emerald-500/60 bg-emerald-500/15" : today ? "border-amber-400 bg-amber-500/15" : "border-white/10 bg-black/30"}`}
              >
                <span className="text-stone-400">Ngày {n}</span>
                <span className="font-bold text-amber-200">{g}</span>
                <span className="text-[10px] text-stone-400">
                  {got ? "Đã nhận" : "vàng"}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="text-xs text-stone-400">
          Điểm danh liền ngày để nhận nhiều hơn; bỏ một ngày thì chuỗi về ngày
          1. Đủ 7 ngày thì bắt đầu chuỗi mới.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {sections.map((sec) => (
          <section
            key={sec.title}
            className="flex flex-col gap-2 rounded-xl border-2 border-[#8a6a3b] bg-[#2a1f19]/90 p-4"
          >
            <h2 className="font-bold text-amber-200">{sec.title}</h2>
            <p className="text-xs text-stone-400">{sec.note}</p>
            <ul className="flex flex-col gap-2">
              {sec.rows.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-2 rounded-lg bg-black/30 p-2 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{r.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-stone-300">
                      <div
                        className="h-2 flex-1 overflow-hidden rounded-full bg-black/50"
                        role="meter"
                        aria-label={r.title}
                        aria-valuenow={r.value}
                        aria-valuemin={0}
                        aria-valuemax={r.target}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-amber-300 to-amber-600"
                          style={{ width: `${(100 * r.value) / r.target}%` }}
                        />
                      </div>
                      <span className="tabular-nums">
                        {r.value}/{r.target}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={busy || !r.done || r.claimed}
                    onClick={() => void act(r.action)}
                    className={`w-20 shrink-0 rounded px-2 py-1.5 text-xs font-semibold ${r.claimed ? "bg-white/5 text-stone-500" : r.done ? "bg-amber-500 text-stone-950" : "bg-white/10 text-stone-400"}`}
                  >
                    {r.claimed ? "Đã nhận" : `${r.gold} vàng`}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 bg-[radial-gradient(ellipse_at_top,#2b2440_0%,#17110e_60%)] px-3 py-6 text-stone-100 [--gold:#d4a24c] sm:px-6">
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  );
}
