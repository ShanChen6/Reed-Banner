"use client";

// Khung Sử ký (Campaign V2 MAP-01): cột trái sáu chương, bản đồ ở giữa, cột phải thông tin chương đang chọn.
// Chỉ là trình bày: chọn chương chỉ đổi chương đang xem, không mở hay hoàn thành nhiệm vụ nào. Tiến độ lấy từ
// hồ sơ server qua chapterStatus.

import {
  CAMPAIGN_CHAPTERS,
  WARLORD_RECORDS,
  factionResolutionOf,
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
import { backdropUrl, missionBackdrop } from "./dialogue";
import { METHOD_TEXT } from "./RouteSummary";
import { STATE_COLOR, STATE_TEXT, missionStatusMap } from "./WorldMap";
import {
  chapterThumbUrl,
  strongholdLeader,
  strongholdState,
  type WorldStronghold,
} from "./worldAtlas";

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

function MissionList({
  label,
  missions,
  current,
  onPick,
}: {
  label: string;
  missions: readonly {
    readonly id: CampaignMissionId;
    readonly status: ChapterMissionStatus;
  }[];
  current: CampaignMissionId;
  onPick: (id: CampaignMissionId) => void;
}) {
  return (
    <ol className="flex flex-col gap-1.5" aria-label={label}>
      {missions.map(({ id, status: s }) => {
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
                  {STATUS_TEXT[s]} · Chương {ROMAN[n.chapter]} ·{" "}
                  {n.rewards.firstClearGold} vàng lần đầu
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
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
        <MissionList
          label={`Nhiệm vụ Chương ${roman}`}
          missions={statuses}
          current={current}
          onPick={onPick}
        />
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

const CERTAINTY_TEXT = {
  recorded: "địa danh có sử chép",
  traditional: "định vị theo truyền thống",
  disputed: "vị trí còn tranh luận",
  fictional: "địa điểm do game dựng",
} as const;

/** Nhiệm vụ nút chính của panel: việc đang dở hoặc đang mở trước, rồi tới việc đã xong để xem lại. */
function focusMission(
  missions: readonly {
    readonly id: CampaignMissionId;
    readonly status: ChapterMissionStatus;
  }[],
) {
  return (
    missions.find((m) => m.status === "inProgress") ??
    missions.find((m) => m.status === "open") ??
    missions.find((m) => m.status === "completed")
  );
}

export function StrongholdPanel({
  campaign,
  stronghold: s,
  current,
  onPick,
  onClose,
}: {
  campaign: CampaignProgressV2;
  stronghold: WorldStronghold;
  current: CampaignMissionId;
  onPick: (id: CampaignMissionId) => void;
  onClose: () => void;
}) {
  const status = missionStatusMap(campaign);
  const missions = s.missions.map((id) => ({
    id,
    status: status.get(id) ?? ("locked" as const),
  }));
  const state = strongholdState(s, campaign.factions);
  const record = s.faction
    ? WARLORD_RECORDS.find((w) => w.faction === s.faction)
    : undefined;
  const resolution = s.faction ? factionResolutionOf(s.faction) : undefined;
  const focus = focusMission(missions);
  const backdrop = backdropUrl(missionBackdrop(s.missions[0] ?? "M01"));
  return (
    <aside
      aria-labelledby="atlas-panel-title"
      className="atlas-panel flex flex-col gap-3 rounded-xl border-2 border-[#8a6a3b] p-3"
    >
      <header className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-1 h-12 w-8 shrink-0 rounded-sm border-2 border-[#d4a24c] [clip-path:polygon(0_0,100%_0,100%_100%,50%_85%,0_100%)]"
          style={{ background: STATE_COLOR[state] }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-widest uppercase opacity-75">
            {s.faction ? "Cứ điểm sứ quân" : "Đầu não"} · {STATE_TEXT[state]}
          </p>
          <h2
            id="atlas-panel-title"
            className="text-2xl leading-tight font-black"
          >
            {s.place}
          </h2>
          <p className="text-[15px] italic">
            {strongholdLeader(s)}
            {record ? ` · ${record.title}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thông tin cứ điểm, về thông tin chương"
          className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-[#8a6a3b80] bg-[#f6ead0] text-xl font-bold hover:bg-[#fff4dc]"
        >
          ×
        </button>
      </header>

      {/* Ảnh minh họa lấy từ ảnh nền thoại của vùng; ảnh lỗi thì chỉ còn màu nền. */}
      <div
        aria-hidden
        className="aspect-[16/8] rounded-lg border border-[#8a6a3b80] bg-[#cdb68a] bg-cover bg-center"
        style={{ backgroundImage: `url(${backdrop})` }}
      />

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm leading-relaxed">
        <dt className="opacity-70">Địa danh</dt>
        <dd>
          {CERTAINTY_TEXT[s.certainty]}
          {s.modernRegion ? ` · ngày nay: ${s.modernRegion}` : ""}
        </dd>
        {record && record.aliases.length > 0 && (
          <>
            <dt className="opacity-70">Còn chép</dt>
            <dd>{record.aliases.join(", ")}</dd>
          </>
        )}
        {resolution && (
          <>
            <dt className="opacity-70">Kết cục</dt>
            <dd>
              {state === "unresolved" ? (
                <>Hiện khi bạn đi qua {resolution.mission}.</>
              ) : (
                <>
                  {record?.outcome}{" "}
                  <span className="opacity-70">
                    (game kể: {METHOD_TEXT[resolution.settlement]})
                  </span>
                </>
              )}
            </dd>
          </>
        )}
      </dl>

      {!s.faction && (
        <p className="text-sm leading-relaxed">
          Căn cứ của Đinh Bộ Lĩnh, không tính là một trong 12 sứ quân. Các nhiệm
          vụ ở đây mở đầu và khép lại chiến dịch.
        </p>
      )}
      {!s.at && (
        <p className="text-sm leading-relaxed">
          Sử chép “nay không rõ chỗ nào”, các bản tổng thuật đặt ở hai vùng khác
          nhau, nên bản đồ không cắm cờ cho Bình Kiều.
        </p>
      )}

      <div>
        <h3 className="atlas-panel-heading">Nhiệm vụ ở {s.place}</h3>
        <MissionList
          label={`Nhiệm vụ ở ${s.place}`}
          missions={missions}
          current={current}
          onPick={onPick}
        />
      </div>

      {focus ? (
        <button
          type="button"
          onClick={() => onPick(focus.id)}
          className="min-h-12 rounded-lg border-2 border-[#d4a24c] bg-gradient-to-b from-[#b4382c] to-[#7a2c1d] px-4 text-base font-bold tracking-wide text-amber-50 uppercase shadow"
        >
          {focus.status === "completed"
            ? `Xem lại ${focus.id}`
            : focus.status === "inProgress"
              ? `Tiếp tục ${focus.id}`
              : `Bắt đầu ${focus.id}`}
        </button>
      ) : (
        <p className="rounded-lg border border-[#8a6a3b66] p-2 text-center text-sm opacity-80">
          🔒 Chưa mở nhiệm vụ nào ở đây.
        </p>
      )}
    </aside>
  );
}
