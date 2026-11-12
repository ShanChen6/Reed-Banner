"use client";

import { Alert, Button } from "@/components/ui";
import { FrameInset, ModeScreen, OrnateFrame, SectionTitle } from "@/components/game-ui";

// Nhiệm vụ: điểm danh 7 ngày, nhiệm vụ ngày/tuần, thành tựu. Tiến độ do server cộng khi trận kết thúc; bấm
// Nhận thì server kiểm tra lại rồi cộng vàng.

import { useState } from "react";
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
import PlacesPanel from "./PlacesPanel";
import SpecialQuestsPanel from "./SpecialQuestsPanel";
import { useProfile } from "../profile/useProfile";

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
  const { profile, loadError, busy, message, act } = useProfile();
  // Giờ lúc mở trang, chỉ để hiển thị; server dùng giờ của server khi nhận thưởng.
  const [now] = useState(() => Date.now());

  if (!profile) {
    return (
      <Shell>
        <p className="py-24 text-center text-on-wood-soft">
          {loadError ? "Không tải được hồ sơ, thử tải lại trang." : "Đang tải…"}
        </p>
      </Shell>
    );
  }

  // Phiếu Tầm Tướng Ký kèm thưởng (Design Freeze P-10): chỉ hiện khi chế độ bật và người chơi đã vào chế độ,
  // vì phiếu chỉ cộng cho người đã vào.
  const ttk = tamTuongKy ? profile.tamTuongKy : undefined;
  const checkedToday = profile.quests.checkIn.last === vnDay(now);
  // Ô đang tới lượt: hôm nay đã điểm danh thì là ô vừa nhận, chưa thì là ô sẽ nhận.
  const streak = checkedToday
    ? profile.quests.checkIn.streak
    : nextStreak(profile.quests, now);

  const sections: { title: string; note: string; rows: Row[]; grouped?: boolean }[] = [
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
      note: "Mỗi thành tựu nhận một lần. Nhóm có thể nhận thưởng tự mở.",
      grouped: true,
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
            {sec.grouped ? (
              <div className="flex flex-col gap-2">
                {groupRows(sec.rows).map((g) => (
                  <QuestGroup key={g.id} title={g.title} rows={g.rows} busy={busy} onClaim={(r) => void act(r.action)} />
                ))}
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {sec.rows.map((r) => (
                  <QuestItem key={r.id} r={r} busy={busy} onClaim={(row) => void act(row.action)} />
                ))}
              </ul>
            )}
          </OrnateFrame>
        ))}
      </div>

      <PlacesPanel collected={profile.formation?.collection ?? []} />
    </Shell>
  );
}

/** Nhóm thành tựu theo chủ đề để danh sách dài gập được (trang Nhiệm vụ trên điện thoại từng cao ~6600px). */
const ACHIEVEMENT_GROUPS: readonly { id: string; title: string; match: (id: string) => boolean }[] = [
  { id: "battle", title: "Chiến trận", match: (id) => /^a\.(win|survival)/.test(id) },
  { id: "campaign", title: "Bình Loạn", match: (id) => id === "a.chapter1" || id === "a.campaign" },
  { id: "habit", title: "Chuyên cần", match: (id) => id === "a.daily7" || id === "a.streak7" },
  { id: "level", title: "Cấp độ", match: (id) => id.startsWith("a.level") },
  { id: "places", title: "Địa danh", match: (id) => id.startsWith("a.places") },
  { id: "ttk", title: "Tầm Tướng Ký", match: isTamTuongKyAchievement },
];

const claimable = (r: Row) => r.done && !r.claimed;

/** Chia thành tựu vào nhóm (giữ thứ tự khai báo); mỗi nhóm đưa món nhận được lên đầu, món đã nhận xuống cuối. */
function groupRows(rows: readonly Row[]): { id: string; title: string; rows: Row[] }[] {
  const groups = [...ACHIEVEMENT_GROUPS, { id: "other", title: "Khác", match: () => true }].map((g) => ({ id: g.id, title: g.title, rows: [] as Row[] }));
  for (const r of rows) {
    const i = [...ACHIEVEMENT_GROUPS].findIndex((g) => g.match(r.id));
    groups[i === -1 ? groups.length - 1 : i]!.rows.push(r);
  }
  const rank = (r: Row) => (claimable(r) ? 0 : r.claimed ? 2 : 1);
  return groups.filter((g) => g.rows.length > 0).map((g) => ({ ...g, rows: [...g.rows].sort((x, y) => rank(x) - rank(y)) }));
}

function QuestItem({ r, busy, onClaim }: { r: Row; busy: boolean; onClaim: (r: Row) => void }) {
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

/** Nhóm gập được: mở sẵn khi có thưởng chờ nhận; tiêu đề cho biết đã nhận bao nhiêu và còn bao nhiêu nhận được. */
function QuestGroup({ title, rows, busy, onClaim }: { title: string; rows: Row[]; busy: boolean; onClaim: (r: Row) => void }) {
  const ready = rows.filter(claimable).length;
  const got = rows.filter((r) => r.claimed).length;
  const [open, setOpen] = useState(ready > 0);
  return (
    <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)} className="ui-frame-inset group">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-3 py-2 font-semibold text-title-on-wood">
        <span aria-hidden className="text-frame-gold transition group-open:rotate-90">›</span>
        <span className="min-w-0 flex-1 truncate">{title}</span>
        {ready > 0 && <span className="rounded-full bg-jade/20 px-2 text-caption font-bold text-jade">{ready} nhận được</span>}
        <span className="text-caption tabular-nums text-on-wood-soft">{got}/{rows.length}</span>
      </summary>
      <ul className="flex flex-col gap-2 p-2 pt-0">
        {rows.map((r) => (
          <QuestItem key={r.id} r={r} busy={busy} onClaim={onClaim} />
        ))}
      </ul>
    </details>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <ModeScreen label="Nhiệm vụ">{children}</ModeScreen>;
}
