"use client";

// Bản đồ Chiến dịch V2 (CAMP-08.01): giấy dó khắc gỗ vùng châu thổ sông Hồng, 24 nhiệm vụ đặt theo vùng đại diện
// (mapLayout.ts). Hình điểm theo loại nhiệm vụ (trận, sự kiện, ngoại giao), huy hiệu chương, quầng màu ở vùng đã
// có kết cục, nét nối theo điều kiện mở khóa (DAG) chứ không phải đường hành quân. Phóng to, kéo, và điều khiển
// bằng bàn phím; tên vùng ngày nay chỉ hiện trong ô thông tin riêng.

import { useRef, useState, type PointerEvent } from "react";
import {
  CAMPAIGN_CHAPTERS,
  campaignWorldLedger,
  chapterFocus,
  chapterStatus,
  chapterUnlocked,
  chapterCompleted,
  storyNodeById,
  type CampaignChapter,
  type CampaignLedgerGroup,
  type CampaignMissionId,
  type CampaignProgressV2,
  type ChapterMissionStatus,
} from "@/core";
import {
  MAP_H as H,
  MAP_LAYOUT,
  MAP_W as W,
  MARKER_R,
  MIN_GAP,
  UNPLACED_BOX,
  lonLatToMap as px,
  markerKind,
} from "./mapLayout";

/** Đường cong mượt qua các điểm (kinh độ, vĩ độ). */
function path(points: readonly (readonly [number, number])[]): string {
  const p = points.map(([lon, lat]) => px(lon, lat));
  let d = `M${p[0]![0].toFixed(1)},${p[0]![1].toFixed(1)}`;
  for (let i = 1; i < p.length; i++) {
    const [x0, y0] = p[i - 1]!;
    const [x1, y1] = p[i]!;
    d += ` Q${x0.toFixed(1)},${y0.toFixed(1)} ${((x0 + x1) / 2).toFixed(1)},${((y0 + y1) / 2).toFixed(1)}`;
  }
  const [xl, yl] = p[p.length - 1]!;
  return `${d} T${xl.toFixed(1)},${yl.toFixed(1)}`;
}

const RED_RIVER = path([
  [104.85, 21.75],
  [105.15, 21.5],
  [105.43, 21.3],
  [105.62, 21.2],
  [105.85, 21.03],
  [105.95, 20.85],
  [106.05, 20.65],
  [106.25, 20.42],
  [106.6, 20.22],
]);
const DA_RIVER = path([
  [104.85, 21.0],
  [105.15, 21.05],
  [105.32, 21.2],
  [105.43, 21.3],
]);
const LO_RIVER = path([
  [105.3, 21.75],
  [105.38, 21.5],
  [105.43, 21.3],
]);
const DAY_RIVER = path([
  [105.6, 21.15],
  [105.7, 20.9],
  [105.8, 20.6],
  [105.92, 20.35],
  [106.05, 20.1],
  [106.15, 19.95],
]);
const DUONG_RIVER = path([
  [105.88, 21.05],
  [106.05, 21.08],
  [106.25, 21.05],
  [106.45, 20.95],
]);
const MA_RIVER = path([
  [104.95, 20.15],
  [105.3, 19.95],
  [105.6, 19.85],
  [105.85, 19.78],
]);

/** Bờ biển rồi vòng ra mép bản đồ để tô biển. */
const SEA = (() => {
  const coast = [
    [106.75, 21.0],
    [106.6, 20.75],
    [106.55, 20.45],
    [106.35, 20.2],
    [106.15, 19.98],
    [105.95, 19.8],
    [105.85, 19.65],
  ].map(([lon, lat]) => px(lon!, lat!));
  return `M${coast.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L")} L${W},${H} L${W},${px(0, 21.0)[1]} Z`;
})();

/** Núi: tâm, số đỉnh, cỡ. */
const MOUNTAINS: readonly {
  at: readonly [number, number];
  peaks: number;
  size: number;
  label?: string;
}[] = [
  { at: [105.22, 20.98], peaks: 3, size: 26, label: "Tản Viên" },
  { at: [105.8, 21.5], peaks: 3, size: 20, label: "Tam Đảo" },
  { at: [105.05, 21.2], peaks: 3, size: 18 },
  { at: [105.1, 20.7], peaks: 3, size: 18 },
  { at: [105.3, 20.4], peaks: 3, size: 16 },
  { at: [105.7, 20.3], peaks: 3, size: 13 },
  { at: [105.3, 20.05], peaks: 2, size: 14 },
];

function Mountain({ at, peaks, size, label }: (typeof MOUNTAINS)[number]) {
  const [cx, cy] = px(at[0], at[1]);
  const left = cx - ((peaks - 1) * size * 0.6) / 2;
  return (
    <g>
      {Array.from({ length: peaks }, (_, i) => {
        const x = left + i * size * 0.6;
        const h = size * (i % 2 === 0 ? 1 : 0.8);
        return (
          <g key={i}>
            <path
              d={`M${x - size / 2},${cy} L${x},${cy - h} L${x + size / 2},${cy} Z`}
              fill="var(--map-paper-dark)"
              stroke="var(--map-ink)"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
            {/* nét khắc bóng bên phải */}
            <path
              d={`M${x + size * 0.08},${cy - h * 0.7} L${x + size * 0.3},${cy} M${x + size * 0.2},${cy - h * 0.45} L${x + size * 0.38},${cy}`}
              stroke="var(--map-ink)"
              strokeWidth={0.8}
            />
          </g>
        );
      })}
      {label && (
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          className="map-label-small"
        >
          {label}
        </text>
      )}
    </g>
  );
}

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI"] as const;

const TYPE_TEXT: Readonly<Record<string, string>> = {
  story: "Sự kiện",
  preparation: "Chuẩn bị",
  diplomacy: "Ngoại giao",
  battle: "Trận",
  defense: "Phòng thủ",
  siege: "Công thành",
  boss: "Trận trùm",
};

const STATUS_TEXT: Readonly<Record<ChapterMissionStatus, string>> = {
  completed: "đã hoàn thành",
  inProgress: "đang làm dở",
  open: "đang mở",
  locked: "chưa mở",
  comingSoon: "sắp có",
};

const CERTAINTY_TEXT = {
  recorded: "địa danh có sử chép",
  traditional: "định vị theo truyền thống",
  disputed: "vị trí còn tranh luận",
  fictional: "địa điểm do game dựng",
} as const;

const GROUP_COLOR: Readonly<Record<CampaignLedgerGroup, string>> = {
  alliance: "#2f6fb5",
  submission: "#2e8b5f",
  military: "#a8322b",
  uncertain: "#7d6b4a",
};

const GROUP_TEXT: Readonly<Record<CampaignLedgerGroup, string>> = {
  alliance: "liên minh",
  submission: "theo về",
  military: "đánh dẹp",
  uncertain: "tan rã / còn tranh luận",
};

const MAX_ZOOM = 3;

interface View {
  readonly x: number;
  readonly y: number;
  readonly s: number;
}

function clampView(v: View): View {
  const s = Math.min(MAX_ZOOM, Math.max(1, v.s));
  const w = W / s;
  const h = H / s;
  return {
    s,
    x: Math.min(W - w, Math.max(0, v.x)),
    y: Math.min(H - h, Math.max(0, v.y)),
  };
}

/** Phóng quanh một điểm của bản đồ (giữ điểm đó đứng yên trên màn). */
function zoomAt(v: View, factor: number, cx: number, cy: number): View {
  const s = Math.min(MAX_ZOOM, Math.max(1, v.s * factor));
  const k = v.s / s;
  return clampView({ s, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k });
}

/** Hình điểm theo loại: tròn = trận, vuông = sự kiện/chuẩn bị, thoi = ngoại giao. */
function MarkerShape({
  kind,
  fill,
  boss,
}: {
  kind: ReturnType<typeof markerKind>;
  fill: string;
  boss: boolean;
}) {
  const stroke = { stroke: "var(--map-ink)", strokeWidth: 2 };
  const r = MARKER_R;
  return (
    <>
      {boss && (
        <circle
          r={r + 3.5}
          fill="none"
          stroke="var(--map-ink)"
          strokeWidth={1.4}
        />
      )}
      {kind === "combat" ? (
        <circle r={r} fill={fill} {...stroke} />
      ) : kind === "diplomacy" ? (
        <path
          d={`M0,${-r - 2} L${r + 2},0 L0,${r + 2} L${-r - 2},0 Z`}
          fill={fill}
          {...stroke}
        />
      ) : (
        <rect
          x={-r + 1}
          y={-r + 1}
          width={2 * r - 2}
          height={2 * r - 2}
          rx={4}
          fill={fill}
          {...stroke}
        />
      )}
    </>
  );
}

/** Nét nối cong nhẹ giữa hai điểm (điều kiện mở khóa, không phải đường đi). */
function edgePath(a: readonly [number, number], b: readonly [number, number]) {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const bend = 0.12;
  return `M${a[0]},${a[1]} Q${(mx - dy * bend).toFixed(1)},${(my + dx * bend).toFixed(1)} ${b[0]},${b[1]}`;
}

export default function CampaignMap({
  campaign,
  selected,
  chapter,
  onOpen,
}: {
  campaign: CampaignProgressV2;
  /** Nhiệm vụ đang xem ở khung chi tiết. */
  selected?: CampaignMissionId;
  /** Chương đang xem: huy hiệu được làm nổi. */
  chapter?: CampaignChapter;
  /** Mở một nhiệm vụ đã mở khóa ở khung chi tiết. */
  onOpen: (id: CampaignMissionId) => void;
}) {
  const [view, setView] = useState<View>({ x: 0, y: 0, s: 1 });
  const [info, setInfo] = useState<CampaignMissionId | undefined>(undefined);
  const svgRef = useRef<SVGSVGElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<{ moved: boolean; pinch?: number }>({ moved: false });

  const status = new Map<CampaignMissionId, ChapterMissionStatus>();
  for (const c of CAMPAIGN_CHAPTERS)
    for (const m of chapterStatus(campaign, c)) status.set(m.id, m.status);
  const ledger = campaignWorldLedger(campaign.factions);
  const resolvedAt = new Map<CampaignMissionId, CampaignLedgerGroup>();
  for (const { resolution, view: v } of ledger.rows)
    if (v.resolved) resolvedAt.set(resolution.mission, resolution.group);

  const usable = (id: CampaignMissionId) => {
    const s = status.get(id);
    return s !== "locked" && s !== "comingSoon";
  };
  const shown = info ?? selected;
  const pos = MAP_LAYOUT.markers;

  /** Đổi tọa độ màn hình sang tọa độ bản đồ đang hiển thị. */
  const toMap = (clientX: number, clientY: number): [number, number] => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return [W / 2, H / 2];
    return [
      view.x + ((clientX - rect.left) / rect.width) * (W / view.s),
      view.y + ((clientY - rect.top) / rect.height) * (H / view.s),
    ];
  };

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) drag.current = { moved: false };
  };
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const list = [...pointers.current.values()];
    if (list.length === 2) {
      // Hai ngón: phóng theo tỉ lệ khoảng cách hai ngón, quanh trung điểm.
      const d = Math.hypot(list[0]!.x - list[1]!.x, list[0]!.y - list[1]!.y);
      const last = drag.current.pinch;
      drag.current = { moved: true, pinch: d };
      if (last && d > 0) {
        const [cx, cy] = toMap(
          (list[0]!.x + list[1]!.x) / 2,
          (list[0]!.y + list[1]!.y) / 2,
        );
        setView((v) => zoomAt(v, d / last, cx, cy));
      }
      return;
    }
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    if (!drag.current.moved && Math.hypot(dx, dy) < 2) return;
    if (view.s === 1) return;
    drag.current = { moved: true };
    setView((v) =>
      clampView({
        ...v,
        x: v.x - (dx / rect.width) * (W / v.s),
        y: v.y - (dy / rect.height) * (H / v.s),
      }),
    );
  };
  const onPointerUp = (e: PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2 && drag.current.pinch !== undefined)
      drag.current = { moved: true };
  };

  const zoomBy = (factor: number) =>
    setView((v) => zoomAt(v, factor, v.x + W / v.s / 2, v.y + H / v.s / 2));
  const panBy = (dx: number, dy: number) =>
    setView((v) => clampView({ ...v, x: v.x + dx / v.s, y: v.y + dy / v.s }));

  /** Điểm được chọn bằng bàn phím mà đang nằm ngoài khung nhìn thì kéo khung tới đó. */
  const reveal = (id: CampaignMissionId) => {
    const [x, y] = pos[id];
    setView((v) => {
      const w = W / v.s;
      const h = H / v.s;
      if (x > v.x + 20 && x < v.x + w - 20 && y > v.y + 20 && y < v.y + h - 20)
        return v;
      return clampView({ ...v, x: x - w / 2, y: y - h / 2 });
    });
  };

  const pick = (id: CampaignMissionId) => {
    setInfo(id);
    if (usable(id)) onOpen(id);
  };

  const shownNode = shown ? storyNodeById(shown) : undefined;
  const shownStatus = shown ? status.get(shown) : undefined;
  const shownGroup = shown ? resolvedAt.get(shown) : undefined;
  const unplaced = shown ? MAP_LAYOUT.unplaced.includes(shown) : false;

  return (
    <figure className="campaign-map overflow-hidden rounded-xl border-2 border-[#8a6a3b] shadow-[inset_0_0_24px_#0009]">
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`${view.x.toFixed(1)} ${view.y.toFixed(1)} ${(W / view.s).toFixed(1)} ${(H / view.s).toFixed(1)}`}
          className="block h-auto w-full select-none"
          style={{ touchAction: view.s > 1 ? "none" : "pan-y" }}
          role="group"
          tabIndex={0}
          aria-label="Bản đồ chiến dịch 24 nhiệm vụ. Phím mũi tên để kéo, phím cộng và trừ để phóng, phím 0 để xem toàn cảnh, Tab để đi qua từng nhiệm vụ."
          aria-describedby="campaign-map-legend"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClickCapture={(e) => {
            // Vừa kéo hoặc phóng bằng hai ngón thì không tính là bấm điểm.
            if (drag.current.moved) {
              e.stopPropagation();
              drag.current = { moved: false };
            }
          }}
          onKeyDown={(e) => {
            const step = 40;
            const keys: Record<string, () => void> = {
              ArrowLeft: () => panBy(-step, 0),
              ArrowRight: () => panBy(step, 0),
              ArrowUp: () => panBy(0, -step),
              ArrowDown: () => panBy(0, step),
              "+": () => zoomBy(1.5),
              "=": () => zoomBy(1.5),
              "-": () => zoomBy(1 / 1.5),
              "0": () => setView({ x: 0, y: 0, s: 1 }),
            };
            const run = keys[e.key];
            if (run) {
              e.preventDefault();
              run();
            }
          }}
        >
          <defs>
            <pattern
              id="map-waves"
              width="22"
              height="12"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0,8 Q5.5,2 11,8 T22,8"
                fill="none"
                stroke="var(--map-sea-ink)"
                strokeWidth="1"
              />
            </pattern>
            <pattern
              id="map-grain"
              width="7"
              height="7"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(30)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="7"
                stroke="var(--map-ink)"
                strokeWidth="0.35"
                opacity="0.18"
              />
            </pattern>
            <radialGradient id="map-vignette" cx="50%" cy="50%" r="70%">
              <stop offset="60%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#3b2410" stopOpacity="0.55" />
            </radialGradient>
          </defs>

          <rect width={W} height={H} fill="var(--map-paper)" />
          <rect width={W} height={H} fill="url(#map-grain)" />
          <path
            d={SEA}
            fill="var(--map-sea)"
            stroke="var(--map-ink)"
            strokeWidth={1.6}
          />
          <path d={SEA} fill="url(#map-waves)" />
          <text
            x={px(106.45, 20.05)[0]}
            y={px(106.45, 20.05)[1]}
            textAnchor="middle"
            className="map-label-sea"
          >
            Biển Đông
          </text>
          {MOUNTAINS.map((m, i) => (
            <Mountain key={i} {...m} />
          ))}
          <g fill="none" stroke="var(--map-river)" strokeLinecap="round">
            <path d={RED_RIVER} strokeWidth={5} />
            <path d={DA_RIVER} strokeWidth={3.5} />
            <path d={LO_RIVER} strokeWidth={3} />
            <path d={DAY_RIVER} strokeWidth={3} />
            <path d={DUONG_RIVER} strokeWidth={3} />
            <path d={MA_RIVER} strokeWidth={3} />
          </g>
          <text
            className="map-label-river"
            transform={`translate(${px(105.7, 21.19)[0]},${px(105.7, 21.19)[1]}) rotate(36)`}
          >
            Sông Hồng
          </text>
          <text
            className="map-label-river"
            transform={`translate(${px(105.73, 20.66)[0]},${px(105.73, 20.66)[1]}) rotate(65)`}
          >
            Sông Đáy
          </text>
          <text
            className="map-label-river"
            transform={`translate(${px(105.25, 19.92)[0]},${px(105.25, 19.92)[1]}) rotate(-12)`}
          >
            Sông Mã
          </text>

          {/* Vùng đã có kết cục: quầng màu theo nhóm kết cục của sổ thế cục. */}
          {[...resolvedAt].map(([id, group]) => (
            <circle
              key={`halo-${id}`}
              cx={pos[id][0]}
              cy={pos[id][1]}
              r={MIN_GAP / 2 + 4}
              fill={GROUP_COLOR[group]}
              fillOpacity={0.3}
              stroke={GROUP_COLOR[group]}
              strokeWidth={1.5}
              strokeDasharray={group === "uncertain" ? "4 3" : undefined}
              pointerEvents="none"
            />
          ))}

          {/* Nét nối điều kiện mở khóa: liền = đã đi qua, đứt đỏ = đang mở, chấm mờ = còn khóa. */}
          <g fill="none" pointerEvents="none">
            {(Object.keys(pos) as CampaignMissionId[]).flatMap((id) =>
              storyNodeById(id)!.prereqs.map((from) => {
                const st = status.get(id);
                const done = st === "completed";
                const open = !done && usable(id);
                return (
                  <path
                    key={`${from}-${id}`}
                    d={edgePath(pos[from], pos[id])}
                    stroke={
                      done || open ? "var(--map-route)" : "var(--map-ink)"
                    }
                    strokeWidth={done ? 2.4 : 1.6}
                    strokeDasharray={done ? undefined : open ? "6 4" : "2 4"}
                    opacity={done || open ? 0.85 : 0.4}
                  />
                );
              }),
            )}
          </g>

          {MAP_LAYOUT.regions.map((r) => {
            const ys = r.missions.map((id) => pos[id][1]);
            const xs = r.missions.map((id) => pos[id][0]);
            const x = xs.reduce((a, b) => a + b, 0) / xs.length;
            return (
              <text
                key={r.name}
                x={x}
                y={Math.max(...ys) + MARKER_R + 13}
                textAnchor="middle"
                className="map-label"
                pointerEvents="none"
              >
                {r.name}
              </text>
            );
          })}

          <g pointerEvents="all">
            <rect
              x={UNPLACED_BOX.x}
              y={UNPLACED_BOX.y}
              width={UNPLACED_BOX.w}
              height={UNPLACED_BOX.h}
              rx={6}
              fill="var(--map-paper)"
              fillOpacity={0.85}
              stroke="var(--map-ink)"
              strokeDasharray="5 4"
            />
            <text
              x={UNPLACED_BOX.x + 10}
              y={UNPLACED_BOX.y + 18}
              className="map-label-small"
            >
              Không gắn một địa điểm
            </text>
          </g>

          {CAMPAIGN_CHAPTERS.map((c) => {
            const [x, y] = MAP_LAYOUT.hubs[c.chapter];
            const open = chapterUnlocked(campaign, c.chapter);
            const done = chapterCompleted(campaign, c.chapter);
            const current = c.chapter === chapter;
            const label = `Chương ${ROMAN[c.chapter]}: ${c.title}, ${done ? "đã khép" : open ? "đang mở" : "chưa mở"}`;
            return (
              <g
                key={`hub-${c.chapter}`}
                transform={`translate(${x},${y})`}
                role="button"
                tabIndex={open ? 0 : -1}
                aria-label={label}
                aria-disabled={!open}
                aria-pressed={current}
                className={open ? "map-stage cursor-pointer" : "map-stage"}
                onClick={() => open && onOpen(chapterFocus(campaign, c))}
                onKeyDown={(e) => {
                  if (open && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpen(chapterFocus(campaign, c));
                  }
                }}
              >
                <title>{label}</title>
                {current && (
                  <circle
                    r={17}
                    fill="none"
                    stroke="var(--gold, #d4a640)"
                    strokeWidth={2.5}
                  />
                )}
                <circle
                  r={13}
                  fill={
                    done
                      ? "var(--map-ink)"
                      : open
                        ? "#f5f0e1"
                        : "var(--map-paper-dark)"
                  }
                  stroke="var(--map-ink)"
                  strokeWidth={1.6}
                  opacity={open ? 1 : 0.6}
                />
                <text
                  y={4}
                  textAnchor="middle"
                  className={`map-num ${done ? "map-num-light" : ""}`}
                >
                  {ROMAN[c.chapter]}
                </text>
              </g>
            );
          })}

          {(Object.keys(pos) as CampaignMissionId[]).map((id) => {
            const node = storyNodeById(id)!;
            const st = status.get(id) ?? "locked";
            const [x, y] = pos[id];
            const canOpen = usable(id);
            const isSelected = id === selected;
            const fill =
              st === "completed"
                ? "var(--map-route)"
                : canOpen
                  ? "#f2c14e"
                  : "var(--map-paper-dark)";
            const label = `${id} ${node.title}, ${TYPE_TEXT[node.type] ?? node.type}, ${STATUS_TEXT[st]}`;
            return (
              <g
                key={id}
                transform={`translate(${x},${y})`}
                className="map-stage cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={label}
                aria-pressed={isSelected}
                aria-disabled={!canOpen}
                onClick={() => pick(id)}
                onFocus={() => {
                  setInfo(id);
                  reveal(id);
                }}
                onMouseEnter={() => setInfo(id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    pick(id);
                  }
                }}
              >
                <title>{label}</title>
                {/* Vùng bấm: bán kính bằng nửa khoảng cách tối thiểu nên không chồng lên điểm bên cạnh. */}
                <circle r={MIN_GAP / 2} fill="transparent" />
                {canOpen && st !== "completed" && (
                  <circle
                    r={MARKER_R + 5}
                    className="map-pulse"
                    fill="none"
                    stroke="var(--map-route)"
                    strokeWidth={2}
                  />
                )}
                {isSelected && (
                  <circle
                    r={MARKER_R + 6}
                    fill="none"
                    stroke="var(--map-ink)"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                  />
                )}
                <g opacity={canOpen ? 1 : 0.7}>
                  <MarkerShape
                    kind={markerKind(node)}
                    fill={fill}
                    boss={node.type === "boss"}
                  />
                </g>
                <text
                  y={4}
                  textAnchor="middle"
                  className={`map-num ${st === "completed" ? "map-num-light" : ""}`}
                >
                  {Number(id.slice(1))}
                </text>
              </g>
            );
          })}

          <rect
            width={W}
            height={H}
            fill="url(#map-vignette)"
            pointerEvents="none"
          />
          <g transform={`translate(52,${H - 52})`} aria-hidden>
            <circle
              r={26}
              fill="var(--map-paper)"
              stroke="var(--map-ink)"
              strokeWidth={1.4}
            />
            <path d="M0,-22 L6,0 L0,22 L-6,0 Z" fill="var(--map-ink)" />
            <path d="M0,-22 L6,0 L0,0 Z" fill="var(--map-route)" />
            <text y={-28} textAnchor="middle" className="map-label-small">
              Bắc
            </text>
          </g>
          <text x={W - 24} y={36} textAnchor="end" className="map-title">
            Giao Châu
          </text>
          <text x={W - 24} y={54} textAnchor="end" className="map-label-small">
            thế kỷ X · loạn 12 sứ quân
          </text>
        </svg>
      </div>

      <div className="flex items-center gap-2 border-t-2 border-[#8a6a3b] bg-[#2a1f19] px-3 pt-2">
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
            f: () => setView({ x: 0, y: 0, s: 1 }),
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
        <span className="text-xs text-stone-400">
          Phóng to rồi kéo để xem kỹ; phím mũi tên, + và − cũng dùng được.
        </span>
      </div>

      {/* Ô thông tin: tên vùng ngày nay và độ chắc của địa danh nằm ở đây, không ghi lên bản đồ. */}
      <div
        className="bg-[#2a1f19] p-3 text-sm text-stone-200"
        aria-live="polite"
      >
        {shownNode ? (
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-amber-100">
              {shownNode.id} · {shownNode.title}
              <span className="ml-1.5 text-xs font-normal text-stone-400">
                {TYPE_TEXT[shownNode.type] ?? shownNode.type} · Chương{" "}
                {ROMAN[shownNode.chapter]} ·{" "}
                {shownStatus ? STATUS_TEXT[shownStatus] : ""}
              </span>
            </p>
            <p className="text-xs text-stone-300">
              {unplaced ? (
                <>
                  Không gắn một địa điểm trên bản đồ ({shownNode.location.name};{" "}
                  {CERTAINTY_TEXT[shownNode.location.certainty]}).
                </>
              ) : (
                <>
                  Vùng: {shownNode.location.name} (
                  {CERTAINTY_TEXT[shownNode.location.certainty]})
                  {shownNode.location.modernRegion
                    ? ` · ngày nay: ${shownNode.location.modernRegion}`
                    : ""}
                </>
              )}
            </p>
            {shownNode.prereqs.length > 0 && (
              <p className="text-xs text-stone-400">
                Mở sau:{" "}
                {shownNode.prereqs
                  .map((p) => `${p} ${storyNodeById(p)?.title ?? ""}`)
                  .join(" và ")}
              </p>
            )}
            {shownGroup && (
              <p className="text-xs text-stone-300">
                Kết cục vùng: {GROUP_TEXT[shownGroup]}
              </p>
            )}
            {shown && usable(shown) && shown !== selected && (
              <button
                type="button"
                onClick={() => onOpen(shown)}
                className="mt-1 self-start rounded bg-amber-500 px-3 py-1.5 font-semibold text-stone-950"
              >
                Xem nhiệm vụ
              </button>
            )}
          </div>
        ) : (
          <p className="text-xs text-stone-400">
            Chạm hoặc chọn một điểm để xem nhiệm vụ.
          </p>
        )}
      </div>

      <figcaption
        id="campaign-map-legend"
        className="flex flex-col gap-1 bg-[#2a1f19] px-3 pb-3 text-xs text-stone-400"
      >
        <span>
          ● trận · ■ sự kiện, chuẩn bị · ◆ ngoại giao · vòng kép: trận trùm ·
          I–VI: chương. Quầng màu: vùng đã có kết cục (
          <span style={{ color: GROUP_COLOR.alliance }}>liên minh</span>,{" "}
          <span style={{ color: GROUP_COLOR.submission }}>theo về</span>,{" "}
          <span style={{ color: "#d0574f" }}>đánh dẹp</span>,{" "}
          <span style={{ color: "#b8a47c" }}>tan rã / còn tranh luận</span>).
        </span>
        <span>
          Nét nối là điều kiện mở khóa trong game, không phải đường hành quân.
          Sau M12, tuyến tây (Chương IV) và tuyến đông (Chương V) mở cùng lúc;
          đi tuyến nào trước cũng được.
        </span>
        <span>
          Mỗi điểm đặt ở vùng đại diện để định hướng, không phải tọa độ chiến
          trường.
        </span>
      </figcaption>
    </figure>
  );
}
