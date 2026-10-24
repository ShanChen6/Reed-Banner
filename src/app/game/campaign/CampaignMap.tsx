"use client";

// Bản đồ cổ của chương 1: châu thổ sông Hồng vẽ cách điệu kiểu khắc gỗ trên giấy dó, 13 màn đặt theo vị trí
// tương đối của vùng đất ngày nay (không đo đạc chính xác). Đường hành quân nối các màn theo thứ tự; màn đã
// qua cắm cờ lau, màn đang mở nhấp nháy, màn khóa mờ. Bấm một màn đã mở để xem chi tiết.

import { CAMPAIGN, stageUnlocked, type CampaignState } from "@/core";

/** Kinh độ, vĩ độ gần đúng của từng màn (theo vùng đất ngày nay), dãn các màn quá sát nhau cho dễ bấm. */
const STAGE_POS: Readonly<Record<string, readonly [number, number]>> = {
  coLau: [105.88, 20.25],
  boHai: [106.35, 20.4],
  dangChau: [106.08, 20.62],
  binhKieu: [105.55, 19.85],
  duongLam: [105.38, 21.12],
  tamDai: [105.6, 21.38],
  phongChau: [105.38, 21.36],
  hoiHo: [105.12, 21.45],
  sieuLoai: [106.25, 21.12],
  tienDu: [106.05, 21.3],
  teGiang: [105.98, 20.86],
  tayPhuLiet: [105.86, 21.0],
  doDong: [105.62, 20.88],
};

const W = 600;
const H = 640;
const LON0 = 104.95;
const LON1 = 106.6;
const LAT0 = 19.7;
const LAT1 = 21.55;

const px = (lon: number, lat: number): [number, number] => [
  ((lon - LON0) / (LON1 - LON0)) * W,
  ((LAT1 - lat) / (LAT1 - LAT0)) * H,
];

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
  { at: [105.7, 20.3], peaks: 3, size: 13, label: "Hoa Lư" },
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

/** Lá cờ lau trắng cắm trên màn đã qua. */
function Flag({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`} aria-hidden>
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={-26}
        stroke="var(--map-ink)"
        strokeWidth={1.6}
      />
      <path
        d="M0,-26 C6,-28 10,-22 16,-24 C13,-19 9,-15 14,-12 C8,-13 4,-17 0,-15 Z"
        fill="#f5f0e1"
        stroke="var(--map-ink)"
        strokeWidth={1}
      />
    </g>
  );
}

export default function CampaignMap({
  campaign,
  selected,
  onSelect,
}: {
  campaign: CampaignState;
  selected: string;
  onSelect: (id: string) => void;
}) {
  const points = CAMPAIGN.map((s) => ({
    stage: s,
    at: px(...(STAGE_POS[s.id] ?? [105.8, 20.9])),
  }));
  const lastCleared = CAMPAIGN.reduce(
    (n, s, i) => (campaign.legacy.cleared.includes(s.id) ? i : n),
    -1,
  );
  const route = (from: number, to: number) =>
    points
      .slice(from, to + 1)
      .map(
        ({ at: [x, y] }, i) =>
          `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`,
      )
      .join(" ");

  return (
    <figure className="campaign-map overflow-hidden rounded-xl border-2 border-[#8a6a3b] shadow-[inset_0_0_24px_#0009]">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full"
        role="group"
        aria-label="Bản đồ chiến dịch chương 1"
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
          x={px(106.32, 19.84)[0]}
          y={px(106.32, 19.84)[1]}
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

        {/* Đường hành quân: đoạn đã đi nét liền đỏ son, đoạn còn lại nét đứt mực. */}
        <path
          d={route(0, CAMPAIGN.length - 1)}
          fill="none"
          stroke="var(--map-ink)"
          strokeWidth={1.6}
          strokeDasharray="5 6"
          opacity={0.6}
        />
        {lastCleared >= 0 && (
          <path
            d={route(0, Math.min(lastCleared + 1, CAMPAIGN.length - 1))}
            fill="none"
            stroke="var(--map-route)"
            strokeWidth={3}
            strokeLinejoin="round"
          />
        )}

        {points.map(({ stage, at: [x, y] }, i) => {
          const cleared = campaign.legacy.cleared.includes(stage.id);
          const open = stageUnlocked(campaign, stage.id);
          const current = open && !cleared;
          const isSelected = stage.id === selected;
          const leader = stage.foes[0]!;
          const label = `${i + 1}. ${stage.title}, ${leader.hero ? leader.name : stage.place}${cleared ? ", đã qua" : open ? ", đang mở" : ", chưa mở"}`;
          return (
            <g
              key={stage.id}
              className={`map-stage ${open ? "cursor-pointer" : "opacity-75"}`}
              role="button"
              tabIndex={open ? 0 : -1}
              aria-label={label}
              aria-pressed={isSelected}
              aria-disabled={!open}
              onClick={() => open && onSelect(stage.id)}
              onKeyDown={(e) => {
                if (open && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onSelect(stage.id);
                }
              }}
            >
              <title>{label}</title>
              {current && (
                <circle
                  cx={x}
                  cy={y}
                  r={15}
                  className="map-pulse"
                  fill="none"
                  stroke="var(--map-route)"
                  strokeWidth={2.5}
                />
              )}
              {isSelected && (
                <circle
                  cx={x}
                  cy={y}
                  r={19}
                  fill="none"
                  stroke="var(--map-ink)"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={11}
                fill={
                  cleared
                    ? "var(--map-route)"
                    : open
                      ? "#f2c14e"
                      : "var(--map-paper-dark)"
                }
                stroke="var(--map-ink)"
                strokeWidth={2}
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                className={`map-num ${cleared ? "map-num-light" : ""}`}
              >
                {i + 1}
              </text>
              {cleared && <Flag x={x + 6} y={y - 8} />}
              <text x={x} y={y + 25} textAnchor="middle" className="map-label">
                {stage.place}
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
    </figure>
  );
}
