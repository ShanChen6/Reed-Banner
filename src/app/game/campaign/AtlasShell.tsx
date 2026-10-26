"use client";

// Khung Sử ký (Campaign V2 MAP-01): cột trái sáu chương, bản đồ ở giữa, cột phải thông tin chương đang chọn.
// Chỉ là trình bày: chọn chương chỉ đổi chương đang xem, không mở hay hoàn thành nhiệm vụ nào. Tiến độ lấy từ
// hồ sơ server qua chapterStatus.

import {
  CAMPAIGN_CHAPTERS,
  chapterCompleted,
  chapterStatus,
  chapterUnlocked,
  storyNodeById,
  type CampaignMissionId,
  type CampaignProgressV2,
  type ChapterContent,
  type ChapterMissionStatus,
} from "@/core";
import { BasisBadge } from "./StoryBeats";
import { chapterThumbUrl } from "./worldAtlas";

export const ROMAN = ["", "I", "II", "III", "IV", "V", "VI"] as const;

const STATUS_TEXT: Record<ChapterMissionStatus, string> = {
  completed: "Đã hoàn thành",
  inProgress: "Đang xuất quân",
  open: "Đang mở",
  locked: "Chưa mở",
  comingSoon: "Sắp có",
};

export function ChapterRail({
  campaign,
  current,
  onPick,
}: {
  campaign: CampaignProgressV2;
  current: ChapterContent;
  onPick: (c: ChapterContent) => void;
}) {
  return (
    <nav
      aria-label="Sử ký sáu chương"
      className="atlas-rail rounded-xl border-2 border-[#8a6a3b] p-2"
    >
      <h2 className="mb-2 hidden px-1 text-center text-sm font-bold tracking-widest text-[#3b2a1a] uppercase xl:block">
        Chương chiến dịch
      </h2>
      <div
        role="tablist"
        aria-label="Chương Chiến dịch"
        aria-orientation="vertical"
        className="flex snap-x gap-2 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible xl:pb-0"
      >
        {CAMPAIGN_CHAPTERS.map((c) => {
          const open = chapterUnlocked(campaign, c.chapter);
          const done = chapterCompleted(campaign, c.chapter);
          const finished = chapterStatus(campaign, c).filter(
            (m) => m.status === "completed",
          ).length;
          const active = c === current;
          return (
            <button
              key={c.chapter}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={!open}
              onClick={() => onPick(c)}
              className={`atlas-chapter flex min-h-11 w-56 shrink-0 snap-start items-center gap-2 rounded-lg border p-1.5 text-left xl:w-full ${
                active ? "atlas-chapter-active" : ""
              } disabled:cursor-not-allowed`}
            >
              <span className="w-6 shrink-0 text-center text-lg font-black">
                {ROMAN[c.chapter]}
              </span>
              {/* Hình nhỏ chỉ trang trí, cắt từ ảnh nền thoại; ảnh lỗi thì ô vẫn đọc được nhờ màu nền. */}
              <span
                aria-hidden
                className="hidden h-10 w-14 shrink-0 rounded bg-[#cdb68a] bg-cover bg-center sm:block"
                style={{
                  backgroundImage: `url(${chapterThumbUrl(c.chapter)})`,
                }}
              />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 block text-sm leading-tight font-bold">
                  {c.title}
                </span>
                <span className="block truncate text-xs opacity-80">
                  {c.region.name} ·{" "}
                  {!open
                    ? "🔒 chưa mở"
                    : done
                      ? `✓ ${finished}/${c.missions.length}`
                      : `${finished}/${c.missions.length}`}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function ChapterPanel({
  campaign,
  chapter,
  current,
  onPick,
}: {
  campaign: CampaignProgressV2;
  chapter: ChapterContent;
  /** Nhiệm vụ đang xem ở khung chi tiết. */
  current: CampaignMissionId;
  onPick: (id: CampaignMissionId) => void;
}) {
  const statuses = chapterStatus(campaign, chapter);
  const finished = statuses.filter((m) => m.status === "completed").length;
  const roman = ROMAN[chapter.chapter];
  return (
    <aside
      aria-labelledby="atlas-panel-title"
      className="atlas-panel flex flex-col gap-3 rounded-xl border-2 border-[#8a6a3b] p-3"
    >
      <header>
        <p className="text-xs font-semibold tracking-widest uppercase opacity-75">
          Chương {roman} · {finished}/{chapter.missions.length} nhiệm vụ
        </p>
        <h2 id="atlas-panel-title" className="text-2xl font-black">
          {chapter.title}
        </h2>
        <p className="mt-1 text-[15px] leading-relaxed">{chapter.question}</p>
      </header>

      {chapterCompleted(campaign, chapter.chapter) && (
        <p className="rounded-lg border border-emerald-800/40 bg-emerald-800/10 p-2 text-sm leading-relaxed">
          <span className="font-bold">Hoàn thành Chương {roman}.</span>{" "}
          {chapter.completeLine}
        </p>
      )}

      <div>
        <h3 className="atlas-panel-heading">Nhiệm vụ chương</h3>
        <ol
          className="flex flex-col gap-1.5"
          aria-label={`Nhiệm vụ Chương ${roman}`}
        >
          {statuses.map(({ id, status: s }) => {
            const n = storyNodeById(id)!;
            const usable = s !== "locked" && s !== "comingSoon";
            return (
              <li key={id}>
                <button
                  type="button"
                  disabled={!usable}
                  aria-current={current === id}
                  onClick={() => onPick(id)}
                  className={`atlas-mission flex min-h-11 w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-sm ${
                    current === id ? "atlas-mission-active" : ""
                  } disabled:cursor-not-allowed`}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      s === "completed"
                        ? "bg-emerald-700 text-white"
                        : usable
                          ? "bg-[#a8322b] text-amber-50"
                          : "bg-[#cdb68a] text-[#3b2a1a]"
                    }`}
                  >
                    {s === "completed"
                      ? "✓"
                      : usable
                        ? id.slice(1)
                        : s === "comingSoon"
                          ? "…"
                          : "🔒"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {id} · {n.title}
                    </span>
                    <span className="block truncate text-xs opacity-75">
                      {STATUS_TEXT[s]} · {n.rewards.firstClearGold} vàng lần đầu
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <p className="text-sm leading-relaxed opacity-85">
        {chapter.region.note}
      </p>

      <div className="grid gap-2 text-sm leading-relaxed">
        <div>
          <BasisBadge basis="legend" />
          <p className="mt-1">{chapter.legendVsRecord.legend}</p>
        </div>
        <div>
          <BasisBadge basis="recorded" />
          <p className="mt-1">{chapter.legendVsRecord.record}</p>
        </div>
      </div>
    </aside>
  );
}
