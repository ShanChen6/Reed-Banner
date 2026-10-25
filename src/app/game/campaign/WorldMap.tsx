"use client";

// Bản đồ Sử ký toàn cảnh (Campaign V2 MAP-02): Hoa Lư và 12 cứ điểm sứ quân trên một tấm bản đồ chung khung
// 1536×1024 (worldAtlas.ts). Cờ đổi màu theo thế cục server đã ghi, chưa ghi thì trung tính. Chọn chương chỉ làm
// nổi các điểm của chương và kéo khung nhìn tới đó; bấm điểm chỉ chọn điểm (panel bên phải), không gọi API.
// Tranh nền của Shan (không chữ, không cờ) nằm dưới cùng khung tọa độ; chữ, cờ và vùng bấm luôn là SVG động.
// Tranh lỗi thì còn nền giấy dó vẽ bằng code và thành trì SVG (MAP-ART-02).

import { useState } from "react";
import {
  CAMPAIGN_CHAPTERS,
  chapterStatus,
  type CampaignMissionId,
  type CampaignProgressV2,
  type ChapterContent,
  type ChapterMissionStatus,
} from "@/core";
import { fitView, useMapView, MAX_ZOOM } from "./useMapView";
import {
  NAME_FONT,
  PLACED_STRONGHOLDS,
  PLACE_FONT,
  UNPLACED_STRONGHOLDS,
  WORLD_H as H,
  WORLD_STRONGHOLDS,
  WORLD_W as W,
  chapterStrongholds,
  strongholdGlyph,
  strongholdLeader,
  strongholdState,
  type StrongholdId,
  type StrongholdState,
  type WorldStronghold,
} from "./worldAtlas";

export const STATE_COLOR: Readonly<Record<StrongholdState, string>> = {
  hq: "#c0392b",
  unresolved: "#6b5a45",
  alliance: "#2e7d4f",
  submission: "#2f5fa8",
  military: "#8f241d",
  uncertain: "#c77b22",
};

export const STATE_TEXT: Readonly<Record<StrongholdState, string>> = {
  hq: "đầu não Hoa Lư",
  unresolved: "chưa có kết cục",
  alliance: "liên minh",
  submission: "quy phục",
  military: "đánh dẹp",
  uncertain: "tan rã / còn tranh luận",
};

/** Trạng thái nhiệm vụ của cả chiến dịch, theo hồ sơ server. */
export function missionStatusMap(
  campaign: CampaignProgressV2,
): ReadonlyMap<CampaignMissionId, ChapterMissionStatus> {
  const m = new Map<CampaignMissionId, ChapterMissionStatus>();
  for (const c of CAMPAIGN_CHAPTERS)
    for (const x of chapterStatus(campaign, c)) m.set(x.id, x.status);
  return m;
}

/** Tranh nền toàn cảnh, cùng khung WORLD_W × WORLD_H. */
const WORLD_ART = "/art/campaign/world-map.webp";

const usable = (s: ChapterMissionStatus | undefined) =>
  s !== undefined && s !== "locked" && s !== "comingSoon";

/** Điểm có nhiệm vụ đang mở mà chưa xong: vòng nhấp nháy. */
export function strongholdHasOpenMission(
  s: WorldStronghold,
  status: ReadonlyMap<CampaignMissionId, ChapterMissionStatus>,
): boolean {
  return s.missions.some((m) => {
    const st = status.get(m);
    return usable(st) && st !== "completed";
  });
}

/** Đường cong mượt qua các điểm của khung bản đồ. */
function smooth(points: readonly (readonly [number, number])[]): string {
  let d = `M${points[0]![0]},${points[0]![1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]!;
    const [x1, y1] = points[i]!;
    d += ` Q${x0},${y0} ${(x0 + x1) / 2},${(y0 + y1) / 2}`;
  }
  const [xl, yl] = points[points.length - 1]!;
  return `${d} T${xl},${yl}`;
}

// Nền giấy dó: chỉ để định hướng (núi phía tây bắc, sông chảy về biển phía đông nam), không phải bản đồ đo đạc.
const SEA = `M1536,90 L1490,230 L1450,430 L1478,620 L1446,800 L1330,925 L1220,1024 L1536,1024 Z`;
const RIVERS = [
  smooth([
    [40, 40],
    [250, 260],
    [540, 300],
    [760, 400],
    [930, 520],
    [1180, 760],
    [1300, 900],
    [1360, 990],
  ]),
  smooth([
    [600, 600],
    [760, 720],
    [800, 860],
    [960, 1024],
  ]),
  smooth([
    [930, 470],
    [1150, 470],
    [1320, 520],
    [1460, 560],
  ]),
];
const MOUNTAINS: readonly (readonly [number, number, number])[] = [
  [90, 380, 46],
  [170, 470, 40],
  [80, 620, 52],
  [210, 720, 44],
  [120, 860, 50],
  [330, 900, 40],
  [300, 560, 36],
  [520, 70, 34],
  [860, 90, 38],
  [1250, 120, 32],
  [700, 960, 30],
  [1040, 960, 28],
];

function Peaks({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g stroke="var(--map-ink)" strokeWidth={2} strokeLinejoin="round">
      {[-0.9, 0, 0.9].map((dx, i) => {
        const h = r * (i === 1 ? 1.25 : 0.9);
        const cx = x + dx * r;
        return (
          <path
            key={i}
            d={`M${cx - r * 0.8},${y} L${cx},${y - h} L${cx + r * 0.8},${y} Z`}
            fill="var(--map-paper-dark)"
          />
        );
      })}
    </g>
  );
}

function PaperBackground() {
  return (
    <g aria-hidden>
      <rect width={W} height={H} fill="var(--map-paper)" />
      <rect width={W} height={H} fill="url(#world-grain)" />
      <path
        d={SEA}
        fill="var(--map-sea)"
        stroke="var(--map-ink)"
        strokeWidth={2.4}
      />
      <path d={SEA} fill="url(#world-waves)" />
      <g fill="none" stroke="var(--map-river)" strokeLinecap="round">
        <path d={RIVERS[0]} strokeWidth={12} />
        <path d={RIVERS[1]} strokeWidth={7} />
        <path d={RIVERS[2]} strokeWidth={7} />
      </g>
      {MOUNTAINS.map(([x, y, r], i) => (
        <Peaks key={i} x={x} y={y} r={r} />
      ))}
    </g>
  );
}

/** Thành trì nhỏ: tường, cổng và mái lầu, tâm ở (0, 0). */
function City({ k }: { k: number }) {
  return (
    <g transform={`scale(${k})`} stroke="var(--map-ink)" strokeWidth={2}>
      <path d="M-40,22 L-40,-2 L40,-2 L40,22 Z" fill="#d9c497" />
      {[-34, -18, 2, 18].map((x) => (
        <rect key={x} x={x} y={-8} width={10} height={6} fill="#d9c497" />
      ))}
      <path d="M-8,22 L-8,10 Q0,2 8,10 L8,22 Z" fill="var(--map-ink)" />
      <rect x={-20} y={-20} width={40} height={18} fill="#efe2c2" />
      <path d="M-30,-18 Q0,-34 30,-18 L24,-14 L-24,-14 Z" fill="#8f2a20" />
    </g>
  );
}

function Banner({ k, color, hq }: { k: number; color: string; hq: boolean }) {
  return (
    <g transform={`scale(${k})`}>
      <line
        x1={0}
        y1={-120}
        x2={0}
        y2={-18}
        stroke="var(--map-ink)"
        strokeWidth={3}
      />
      <line
        x1={-25}
        y1={-112}
        x2={25}
        y2={-112}
        stroke="var(--map-ink)"
        strokeWidth={3}
      />
      <path
        d="M-20,-112 L20,-112 L20,-48 L0,-58 L-20,-48 Z"
        fill={color}
        stroke="#d4a24c"
        strokeWidth={hq ? 4 : 2.5}
      />
      <circle
        cx={0}
        cy={-86}
        r={9}
        fill="none"
        stroke="#f2d27c"
        strokeWidth={2.5}
      />
      <path
        d="M0,-100 L0,-72 M-9,-86 L9,-86"
        stroke="#f2d27c"
        strokeWidth={2}
      />
    </g>
  );
}

export default function WorldMap({
  campaign,
  chapter,
  selected,
  onSelect,
}: {
  campaign: CampaignProgressV2;
  /** Chương đang xem: các điểm của chương sáng, điểm khác giảm sáng. */
  chapter: ChapterContent;
  selected: StrongholdId | null;
  onSelect: (id: StrongholdId) => void;
}) {
  const { view, setView, zoomBy, reset, reveal, svgProps } = useMapView(W, H);
  const [artFailed, setArtFailed] = useState(false);
  const status = missionStatusMap(campaign);
  const inChapter = new Set(chapterStrongholds(chapter.missions));

  // Đổi chương thì kéo khung nhìn tới các điểm của chương (đặt trạng thái ngay lúc dựng, không cần effect).
  const [focused, setFocused] = useState(chapter.chapter);
  if (focused !== chapter.chapter) {
    setFocused(chapter.chapter);
    setView(
      fitView(
        PLACED_STRONGHOLDS.filter((s) => inChapter.has(s.id)).map((s) => s.at!),
        W,
        H,
        260,
        1.8,
      ),
    );
  }

  const label = (s: WorldStronghold) => {
    const st = strongholdState(s, campaign.factions);
    const open = strongholdHasOpenMission(s, status);
    return `${s.place}, ${strongholdLeader(s)}, ${STATE_TEXT[st]}, ${s.missions.length} nhiệm vụ${open ? ", có nhiệm vụ đang mở" : ""}`;
  };

  return (
    <figure className="campaign-map flex flex-col self-start overflow-hidden rounded-xl border-2 border-[#6b4a22] shadow-[0_0_0_2px_#c9a25a66]">
      <div className="relative">
        <svg
          {...svgProps}
          className="block h-auto w-full select-none"
          role="group"
          tabIndex={0}
          aria-label="Bản đồ Sử ký: Hoa Lư và 12 cứ điểm sứ quân. Phím mũi tên để kéo, cộng và trừ để phóng, 0 để xem toàn cảnh, Tab để đi qua từng cứ điểm."
          aria-describedby="world-map-legend"
        >
          <defs>
            <pattern
              id="world-waves"
              width="44"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0,16 Q11,4 22,16 T44,16"
                fill="none"
                stroke="var(--map-sea-ink)"
                strokeWidth="2"
              />
            </pattern>
            <pattern
              id="world-grain"
              width="14"
              height="14"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(30)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="14"
                stroke="var(--map-ink)"
                strokeWidth="0.7"
                opacity="0.16"
              />
            </pattern>
            <radialGradient id="world-vignette" cx="50%" cy="50%" r="72%">
              <stop offset="62%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#3b2410" stopOpacity="0.5" />
            </radialGradient>
            <filter
              id="world-glow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>

          <PaperBackground />
          {!artFailed && (
            <image
              href={WORLD_ART}
              width={W}
              height={H}
              preserveAspectRatio="xMidYMid slice"
              onError={() => setArtFailed(true)}
            />
          )}
          <text
            x={1510}
            y={520}
            textAnchor="end"
            className="map-label-sea"
            aria-hidden
          >
            Biển Đông
          </text>

          {PLACED_STRONGHOLDS.map((s) => {
            const [x, y] = s.at!;
            const st = strongholdState(s, campaign.factions);
            const g = strongholdGlyph(s, strongholdLeader(s));
            const lit = inChapter.has(s.id);
            const open = strongholdHasOpenMission(s, status);
            const isSelected = s.id === selected;
            const text = label(s);
            return (
              <g
                key={s.id}
                role="button"
                tabIndex={0}
                aria-label={text}
                aria-pressed={isSelected}
                className="map-stage cursor-pointer"
                opacity={lit || isSelected ? 1 : 0.72}
                onClick={() => onSelect(s.id)}
                onFocus={() => reveal(x, y)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelect(s.id);
                  }
                }}
              >
                <title>{text}</title>
                {/* Vùng bấm phủ cả cờ, thành và tên đất. */}
                <rect
                  x={Math.min(g.flag[0], g.label[0], g.city[0]) - 6}
                  y={g.flag[1] - 10}
                  width={
                    Math.max(g.flag[2], g.label[2], g.city[2]) -
                    Math.min(g.flag[0], g.label[0], g.city[0]) +
                    12
                  }
                  height={g.city[3] - g.flag[1] + 16}
                  fill="transparent"
                />
                {isSelected && (
                  <ellipse
                    cx={x}
                    cy={y - 40 * g.scale}
                    rx={80 * g.scale}
                    ry={95 * g.scale}
                    fill="#f2c14e"
                    opacity={0.55}
                    filter="url(#world-glow)"
                  />
                )}
                {open && (
                  <circle
                    cx={x}
                    cy={y}
                    r={52 * g.scale}
                    className="map-pulse"
                    fill="none"
                    stroke="#a8322b"
                    strokeWidth={4}
                  />
                )}
                {artFailed && (
                  <g transform={`translate(${x},${y})`}>
                    <City k={g.scale} />
                  </g>
                )}
                <g transform={`translate(${g.pole[0]},${g.pole[1]})`}>
                  <Banner
                    k={g.scale}
                    color={STATE_COLOR[st]}
                    hq={st === "hq"}
                  />
                </g>
                <rect
                  x={g.label[0]}
                  y={g.label[1]}
                  width={g.label[2] - g.label[0]}
                  height={g.label[3] - g.label[1]}
                  rx={8}
                  fill="var(--map-paper)"
                  fillOpacity={0.9}
                  stroke={isSelected ? "#b8862f" : "var(--map-ink)"}
                  strokeOpacity={isSelected ? 1 : 0.35}
                  strokeWidth={isSelected ? 3 : 1.5}
                />
                <text
                  x={g.labelX}
                  y={g.label[1] + PLACE_FONT + 2}
                  textAnchor={g.anchor}
                  fontSize={PLACE_FONT}
                  fontWeight={800}
                >
                  {s.place}
                </text>
                <text
                  x={g.labelX}
                  y={g.label[1] + PLACE_FONT + NAME_FONT + 8}
                  textAnchor={g.anchor}
                  fontSize={NAME_FONT}
                  fontStyle="italic"
                >
                  {strongholdLeader(s)}
                </text>
              </g>
            );
          })}

          <rect
            width={W}
            height={H}
            fill="url(#world-vignette)"
            pointerEvents="none"
          />
          <g transform={`translate(96,${H - 96})`} aria-hidden>
            <circle
              r={50}
              fill="var(--map-paper)"
              stroke="var(--map-ink)"
              strokeWidth={2.4}
            />
            <path d="M0,-42 L11,0 L0,42 L-11,0 Z" fill="var(--map-ink)" />
            <path d="M0,-42 L11,0 L0,0 Z" fill="#a8322b" />
            <text y={-58} textAnchor="middle" fontSize={22} fontWeight={700}>
              B
            </text>
          </g>
        </svg>

        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {[
            {
              t: "+",
              a: "Phóng to bản đồ",
              f: () => zoomBy(1.5),
              off: view.s >= MAX_ZOOM,
            },
            {
              t: "−",
              a: "Thu nhỏ bản đồ",
              f: () => zoomBy(1 / 1.5),
              off: view.s <= 1,
            },
            {
              t: "⤢",
              a: "Xem toàn cảnh",
              f: reset,
              off: view.s <= 1,
            },
          ].map((b) => (
            <button
              key={b.a}
              type="button"
              aria-label={b.a}
              title={b.a}
              disabled={b.off}
              onClick={b.f}
              className="flex size-11 items-center justify-center rounded-lg border border-[#8a6a3b] bg-[#f5f0e1]/90 text-lg font-bold text-[#3b2a1a] shadow disabled:opacity-40"
            >
              {b.t}
            </button>
          ))}
        </div>
      </div>

      {/* Bình Kiều: sử chép "nay không rõ chỗ nào", nên ở ô riêng chứ không cắm cờ lên bản đồ. */}
      <div className="flex flex-wrap gap-1.5 world-strip border-t-2 border-[#6b4a22] px-3 pt-2">
        {UNPLACED_STRONGHOLDS.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={s.id === selected}
            aria-label={`${label(s)}, vị trí còn tranh luận`}
            onClick={() => onSelect(s.id)}
            className={`flex min-h-11 items-center gap-2 rounded-lg border-2 border-dashed px-2.5 py-1 text-left text-[#3b2a1a] shadow ${
              s.id === selected
                ? "border-[#b8862f] bg-[#fff0c9]"
                : "border-[#8a6a3b] bg-[#f5f0e1]/90"
            } ${inChapter.has(s.id) ? "" : "opacity-70"}`}
          >
            <span
              aria-hidden
              className="flex size-7 items-center justify-center rounded text-sm font-black text-amber-50"
              style={{
                background: STATE_COLOR[strongholdState(s, campaign.factions)],
              }}
            >
              ?
            </span>
            <span className="text-xs leading-tight">
              <span className="block font-bold">
                {s.place} · {strongholdLeader(s)}
              </span>
              <span className="block italic opacity-80">
                vị trí còn tranh luận
              </span>
            </span>
          </button>
        ))}
      </div>
      {/* Bản đồ nhỏ trên điện thoại: chọn cứ điểm từ danh sách, không cần chạm trúng lá cờ. */}
      <details className="world-strip border-t-2 border-[#6b4a22] px-3 py-2 text-sm md:hidden">
        <summary className="flex min-h-11 cursor-pointer items-center font-semibold">
          Danh sách cứ điểm ({WORLD_STRONGHOLDS.length})
        </summary>
        <ul className="grid grid-cols-2 gap-1.5 pb-1">
          {WORLD_STRONGHOLDS.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                aria-pressed={s.id === selected}
                onClick={() => onSelect(s.id)}
                className={`flex min-h-11 w-full items-center gap-2 rounded-lg border px-2 py-1 text-left ${
                  s.id === selected
                    ? "border-[#b8862f] bg-[#fff0c9]"
                    : "border-[#9c784580] bg-[#f3e3bc]"
                }`}
              >
                <span
                  aria-hidden
                  className="size-3 shrink-0 rounded-sm"
                  style={{
                    background:
                      STATE_COLOR[strongholdState(s, campaign.factions)],
                  }}
                />
                <span className="min-w-0 leading-tight">
                  <span className="block truncate font-semibold">
                    {s.place}
                  </span>
                  <span className="block truncate text-xs opacity-75">
                    {strongholdLeader(s)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </details>

      <figcaption
        id="world-map-legend"
        className="world-strip flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-xs"
      >
        {(Object.keys(STATE_COLOR) as StrongholdState[]).map((st) => (
          <span key={st} className="flex items-center gap-1">
            <span
              aria-hidden
              className="inline-block h-3 w-2.5 rounded-sm"
              style={{ background: STATE_COLOR[st] }}
            />
            {STATE_TEXT[st]}
          </span>
        ))}
        <span className="basis-full opacity-75">
          Màu cờ theo thế cục đã ghi trong hồ sơ của bạn. Vị trí là bố cục minh
          họa để định hướng, không phải tọa độ chiến trường.
        </span>
      </figcaption>
    </figure>
  );
}
