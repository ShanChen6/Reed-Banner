"use client";

// Khung Sử ký (Campaign V2 MAP-01): cột trái sáu chương, bản đồ ở giữa, cột phải thông tin chương đang chọn.
// Chỉ là trình bày: chọn chương chỉ đổi chương đang xem, không mở hay hoàn thành nhiệm vụ nào. Tiến độ lấy từ
// hồ sơ server qua chapterStatus.

import Image from "next/image";
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
import { SceneLink } from "../SceneContext";
import { AtlasCorners } from "./AtlasFrame";
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
      className="atlas-frame atlas-frame-paper flex flex-col p-2 xl:h-full"
    >
      <AtlasCorners />
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
              aria-label={`Chương ${ROMAN[c.chapter]}: ${c.title}, ${c.region.name}, ${
                !open ? "chưa mở" : `${finished}/${c.missions.length} nhiệm vụ`
              }`}
              disabled={!open}
              onClick={() => onPick(c)}
              className={`atlas-chapter relative flex h-[4.5rem] w-60 shrink-0 snap-start items-center gap-2 rounded-lg border py-1.5 pr-2.5 pl-2 text-left xl:w-full ${
                active ? "atlas-chapter-active" : ""
              } disabled:cursor-not-allowed`}
            >
              <AtlasCorners size="size-3" />
              <span className="w-6 shrink-0 text-center text-lg font-black">
                {ROMAN[c.chapter]}
              </span>
              {/* Hình nhỏ giữ đúng tỉ lệ 16:9 của ảnh gốc; ảnh lỗi thì ô vẫn đọc được nhờ màu nền. Góc dưới là tiến độ. */}
              <span
                aria-hidden
                className={`atlas-chapter-thumb relative aspect-video w-16 shrink-0 overflow-hidden rounded border bg-cover bg-center ${
                  open ? "" : "grayscale"
                }`}
                style={{
                  backgroundImage: `url(${chapterThumbUrl(c.chapter)})`,
                }}
              >
                <span className="atlas-chapter-progress absolute right-0 bottom-0 rounded-tl px-1 text-[10px] leading-4 font-bold">
                  {!open ? (
                    <LockGlyph />
                  ) : done ? (
                    `✓ ${finished}/${c.missions.length}`
                  ) : (
                    `${finished}/${c.missions.length}`
                  )}
                </span>
              </span>
              <span aria-hidden className="min-w-0 flex-1">
                <span className="line-clamp-2 block text-sm leading-tight font-bold">
                  {c.title}
                </span>
                <span className="mt-0.5 block truncate text-xs opacity-80">
                  {c.region.name}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {/* Tranh trang trí cuối cột (Shan vẽ), chỉ hiện khi cột đứng dọc. */}
      <figure className="mt-auto hidden pt-3 xl:block">
        <Image
          src="/art/campaign/rail-ink.webp"
          alt=""
          width={640}
          height={213}
          className="atlas-rail-art w-full"
        />
        <figcaption className="atlas-poem mt-1 px-1 text-center text-sm leading-snug italic">
          Non sông này vốn một dải,
          <br />
          chí anh hùng đời đời còn đó.
        </figcaption>
      </figure>
    </nav>
  );
}

/** Ổ khóa nhỏ cho chương chưa mở, vẽ bằng SVG thay emoji để cùng màu chữ. */
function LockGlyph() {
  return (
    <svg
      viewBox="0 0 12 12"
      className="inline size-2.5 align-[-1px]"
      fill="currentColor"
    >
      <path d="M3.5 5V3.75a2.5 2.5 0 0 1 5 0V5h.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1.25 0h2.5V3.75a1.25 1.25 0 0 0-2.5 0z" />
    </svg>
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
      className="atlas-frame atlas-frame-paper flex flex-col p-3 xl:h-full"
    >
      <AtlasCorners />
      <div className="atlas-scroll flex min-h-0 flex-1 flex-col gap-3 xl:overflow-y-auto xl:pr-1">
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
      className="atlas-frame atlas-frame-paper flex flex-col p-3 xl:h-full"
    >
      <AtlasCorners />
      <div className="atlas-scroll flex min-h-0 flex-1 flex-col gap-3 xl:overflow-y-auto xl:pr-1">
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
            Căn cứ của Đinh Bộ Lĩnh, không tính là một trong 12 sứ quân. Các
            nhiệm vụ ở đây mở đầu và khép lại chiến dịch.
          </p>
        )}
        {!s.at && (
          <p className="text-sm leading-relaxed">
            Sử chép “nay không rõ chỗ nào”, các bản tổng thuật đặt ở hai vùng
            khác nhau, nên bản đồ không cắm cờ cho Bình Kiều.
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
      </div>
    </aside>
  );
}

export type AtlasView = "atlas" | "mission" | "codex";

/** Biểu tượng nét mảnh cho thanh header (bản đồ, cuộn nhiệm vụ, sách sử, binh lính). */
function TabIcon({ kind }: { kind: AtlasView | "army" }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden>
      {kind === "atlas" && (
        <>
          <path {...p} d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" />
          <path {...p} d="M9 4v14M15 6v14" />
        </>
      )}
      {kind === "mission" && (
        <>
          <path {...p} d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8l-3-3V5" />
          <path {...p} d="M9 8h7M9 12h7M9 16h4" />
        </>
      )}
      {kind === "codex" && (
        <>
          <path
            {...p}
            d="M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5C17 4 14 4.5 12 6z"
          />
          <path {...p} d="M12 6v14.5" />
        </>
      )}
      {kind === "army" && (
        <>
          <circle {...p} cx="8" cy="7" r="2.5" />
          <circle {...p} cx="16" cy="7" r="2.5" />
          <path
            {...p}
            d="M3 20v-3a5 5 0 0 1 10 0v3M11 20v-3a5 5 0 0 1 10 0v3"
          />
        </>
      )}
    </svg>
  );
}

/**
 * Thanh header của màn Sử ký: Bản đồ, Nhiệm vụ (nhiệm vụ đang xem), Sử ký (sổ thế cục và hồ sơ sứ quân), Binh lực
 * (đội hình ở trang Hồ sơ). Đổi thẻ chỉ đổi màn đang xem, không gọi API.
 */
type StatKind = "level" | "gold" | "supply";

/** Biểu tượng nhỏ trước Cấp, Vàng, Lương: thoi đồng, đồng xu, bó lúa. Chỉ trang trí, chữ bên cạnh mới là nhãn. */
function StatIcon({ kind }: { kind: StatKind }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className="atlas-stat-icon size-4 shrink-0"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinejoin="round"
    >
      {kind === "level" && (
        <>
          <path d="M8 1.5 14.5 8 8 14.5 1.5 8z" />
          <path d="M8 5 11 8 8 11 5 8z" fill="currentColor" stroke="none" />
        </>
      )}
      {kind === "gold" && (
        <>
          <circle cx={8} cy={8} r={6.2} />
          <rect x={6.2} y={6.2} width={3.6} height={3.6} />
        </>
      )}
      {kind === "supply" && (
        <>
          <path d="M8 15V5M8 15c0-3-3-4-4.5-6M8 15c0-3 3-4 4.5-6" />
          <path d="M8 5c-1.2-1-1.2-2.6 0-3.5C9.2 2.4 9.2 4 8 5zM5 9c-1.5-.3-2.3-1.6-2-3 1.4.2 2.3 1.5 2 3zM11 9c1.5-.3 2.3-1.6 2-3-1.4.2-2.3 1.5-2 3z" />
        </>
      )}
    </svg>
  );
}

export function AtlasHeader({
  view,
  mission,
  level,
  gold,
  supply,
  onView,
}: {
  view: AtlasView;
  mission: CampaignMissionId;
  level: number;
  gold: number;
  supply: number;
  onView: (v: AtlasView) => void;
}) {
  const tabs: readonly { v: AtlasView; label: string; hint?: string }[] = [
    { v: "atlas", label: "Bản đồ" },
    { v: "mission", label: "Nhiệm vụ", hint: mission },
    { v: "codex", label: "Sử ký" },
  ];
  const tabClass = (active: boolean) =>
    `atlas-tab flex h-[52px] min-w-0 flex-col items-center justify-center gap-0.5 rounded-md border px-1 text-xs leading-none font-bold tracking-wide whitespace-nowrap uppercase sm:h-12 sm:flex-row sm:gap-1.5 sm:px-2 sm:text-sm ${
      active ? "atlas-tab-active" : ""
    }`;
  return (
    <header className="atlas-header flex flex-col gap-2 px-1 pt-1 pb-3 lg:flex-row lg:items-center">
      <div className="px-3 lg:w-60 lg:shrink-0">
        <h1
          id="chapter-one-title"
          className="atlas-title text-xl leading-tight font-black tracking-wide uppercase sm:text-2xl"
        >
          Sử ký Đại Việt
        </h1>
        <p className="text-xs text-amber-100/70">Loạn 12 sứ quân · thế kỷ X</p>
      </div>
      <nav
        aria-label="Màn Sử ký"
        className="grid flex-1 grid-cols-4 gap-1.5 lg:mx-auto lg:max-w-[44rem]"
      >
        {tabs.map((t) => (
          <button
            key={t.v}
            type="button"
            aria-current={view === t.v ? "page" : undefined}
            onClick={() => onView(t.v)}
            className={tabClass(view === t.v)}
          >
            <TabIcon kind={t.v} />
            {t.label}
            {t.hint && (
              <span className="hidden text-xs font-normal normal-case opacity-75 xl:inline">
                {t.hint}
              </span>
            )}
          </button>
        ))}
        <SceneLink scene="PROFILE" className={tabClass(false)}>
          <TabIcon kind="army" />
          Binh lực
        </SceneLink>
      </nav>
      <dl className="flex flex-wrap items-center justify-end gap-1.5 px-1 text-sm">
        {[
          { k: "Cấp", v: level, icon: "level" },
          { k: "Vàng", v: gold, icon: "gold" },
          { k: "Lương", v: supply, icon: "supply" },
        ].map((x) => (
          <div
            key={x.k}
            className="atlas-stat flex h-9 items-center gap-1.5 rounded-md border px-2.5"
          >
            <StatIcon kind={x.icon as StatKind} />
            <dt className="text-xs opacity-75">{x.k}</dt>
            <dd className="font-bold">{x.v.toLocaleString("vi-VN")}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
