// Bố cục bản đồ Chiến dịch V2 (CAMP-08.01): 24 nhiệm vụ đặt theo vùng đại diện, không phải tọa độ chiến trường.
// Nhiệm vụ cùng một vùng xếp vòng quanh điểm vùng; nhiệm vụ không gắn được một địa điểm (Bình Kiều "nay không rõ
// chỗ nào", M22 tổng kết các vùng) nằm trong ô riêng. Sau đó đẩy các điểm ra cho không điểm nào đè điểm khác.
// Hàm thuần, không đọc DOM, để test được khoảng cách.

import {
  CAMPAIGN_CHAPTERS,
  STORY_NODES,
  type CampaignChapter,
  type CampaignMissionId,
  type StoryNode,
} from "@/core";

export const MAP_W = 600;
export const MAP_H = 640;
const LON0 = 104.95;
const LON1 = 106.6;
const LAT0 = 19.7;
const LAT1 = 21.55;

export const lonLatToMap = (lon: number, lat: number): [number, number] => [
  ((lon - LON0) / (LON1 - LON0)) * MAP_W,
  ((LAT1 - lat) / (LAT1 - LAT0)) * MAP_H,
];

/**
 * Điểm đại diện của từng vùng (kinh độ, vĩ độ gần đúng theo vùng đất ngày nay, đã dãn cho dễ bấm). Chỉ để định
 * hướng; không suy ra nơi giao chiến.
 */
const REGION_AT: Readonly<Record<string, readonly [number, number]>> = {
  "Hoa Lư": [105.88, 20.25],
  "Bố Hải": [106.35, 20.4],
  "Đằng Châu": [106.08, 20.62],
  "Đường Lâm": [105.38, 21.12],
  "Tam Đái": [105.6, 21.38],
  "Phong Châu": [105.36, 21.36],
  "Hồi Hồ": [105.12, 21.45],
  "Siêu Loại": [106.25, 21.12],
  "Tiên Du": [106.05, 21.3],
  "Tế Giang": [105.98, 20.86],
  "Tây Phù Liệt": [105.84, 21.02],
  "Đỗ Động": [105.62, 20.86],
};

/** Tên vùng trên bản đồ: gộp các tên gọi của cùng một vùng (Bố Hải Khẩu, Vùng Bố Hải). */
const REGION_OF: Readonly<Record<string, string>> = {
  "Bố Hải Khẩu": "Bố Hải",
  "Vùng Bố Hải": "Bố Hải",
  "Đỗ Động Giang": "Đỗ Động",
};

/** Ô "không gắn một địa điểm": góc dưới phải (vùng biển, không có vùng đất nào). */
export const UNPLACED_BOX = { x: 408, y: 556, w: 180, h: 72 } as const;

export const MARKER_R = 11;
/** Khoảng cách tối thiểu giữa tâm hai điểm: vùng bấm của mỗi điểm (bán kính MIN_GAP/2) không chồng lên điểm khác. */
export const MIN_GAP = 28;
const HUB_R = 13;

export type MapMarkerKind = "combat" | "story" | "diplomacy";

export function markerKind(node: StoryNode): MapMarkerKind {
  if (node.type === "diplomacy") return "diplomacy";
  if (["battle", "defense", "siege", "boss"].includes(node.type))
    return "combat";
  return "story";
}

export interface MapRegion {
  readonly name: string;
  readonly at: readonly [number, number];
  readonly missions: readonly CampaignMissionId[];
  /** Tên vùng ngày nay để hiện trong chú thích riêng (không phải tên gọi thế kỷ X). */
  readonly modernRegion?: string;
}

export interface MapLayout {
  readonly markers: Readonly<
    Record<CampaignMissionId, readonly [number, number]>
  >;
  readonly hubs: Readonly<Record<CampaignChapter, readonly [number, number]>>;
  readonly regions: readonly MapRegion[];
  readonly unplaced: readonly CampaignMissionId[];
}

const regionName = (node: StoryNode) =>
  REGION_OF[node.location.name] ?? node.location.name;

/** Nhiệm vụ đặt được lên một vùng đại diện; còn lại vào ô riêng. */
export function placeable(node: StoryNode): boolean {
  return !!REGION_AT[regionName(node)];
}

interface Body {
  x: number;
  y: number;
  readonly ax: number;
  readonly ay: number;
  readonly r: number;
  readonly fixed: boolean;
}

function computeLayout(): MapLayout {
  const groups = new Map<string, StoryNode[]>();
  const unplaced: CampaignMissionId[] = [];
  for (const node of STORY_NODES) {
    if (!placeable(node)) {
      unplaced.push(node.id);
      continue;
    }
    const key = regionName(node);
    groups.set(key, [...(groups.get(key) ?? []), node]);
  }

  const bodies = new Map<string, Body>();
  const regions: MapRegion[] = [];
  for (const [name, nodes] of groups) {
    const [cx, cy] = lonLatToMap(...REGION_AT[name]!);
    const n = nodes.length;
    // Vòng đủ rộng cho n điểm cách nhau MIN_GAP; một điểm thì đặt đúng tâm vùng.
    const radius =
      n === 1 ? 0 : Math.max(MIN_GAP, (MIN_GAP * n) / (2 * Math.PI) + 4);
    nodes.forEach((node, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      const x = cx + radius * Math.cos(a);
      const y = cy + radius * Math.sin(a);
      bodies.set(node.id, { x, y, ax: x, ay: y, r: MIN_GAP / 2, fixed: false });
    });
    regions.push({
      name,
      at: [cx, cy],
      missions: nodes.map((x) => x.id),
      ...(nodes[0]!.location.modernRegion
        ? { modernRegion: nodes[0]!.location.modernRegion }
        : {}),
    });
  }

  // Ô riêng: xếp hàng ngang, cố định.
  unplaced.forEach((id, i) => {
    const x = UNPLACED_BOX.x + 30 + i * (MIN_GAP + 16);
    const y = UNPLACED_BOX.y + 44;
    bodies.set(id, { x, y, ax: x, ay: y, r: MIN_GAP / 2, fixed: true });
  });

  // Huy hiệu chương đặt cạnh vùng của chương, cũng tham gia đẩy để không đè điểm nhiệm vụ.
  for (const c of CAMPAIGN_CHAPTERS) {
    const [rx, ry] = lonLatToMap(...c.region.at);
    const x = rx - 44;
    const y = ry - 30;
    bodies.set(`hub:${c.chapter}`, {
      x,
      y,
      ax: x,
      ay: y,
      r: HUB_R + 4,
      fixed: false,
    });
  }

  const list = [...bodies.values()];
  const margin = 18;
  for (let iter = 0; iter < 400; iter++) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]!;
        const b = list[j]!;
        const need = a.r + b.r;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        if (d >= need) continue;
        if (d < 1e-6) {
          // Trùng hẳn: tách theo thứ tự cố định để kết quả không phụ thuộc số ngẫu nhiên.
          dx = 1;
          dy = 0.5;
          d = Math.hypot(dx, dy);
        }
        const push = (need - d) / d;
        if (a.fixed && b.fixed) continue;
        if (a.fixed) {
          b.x += dx * push;
          b.y += dy * push;
        } else if (b.fixed) {
          a.x -= dx * push;
          a.y -= dy * push;
        } else {
          a.x -= (dx * push) / 2;
          a.y -= (dy * push) / 2;
          b.x += (dx * push) / 2;
          b.y += (dy * push) / 2;
        }
      }
    }
    for (const b of list) {
      if (b.fixed) continue;
      // Kéo nhẹ về chỗ ban đầu để cụm không trôi khỏi vùng.
      b.x += (b.ax - b.x) * 0.02;
      b.y += (b.ay - b.y) * 0.02;
      b.x = Math.min(MAP_W - margin, Math.max(margin, b.x));
      b.y = Math.min(MAP_H - margin, Math.max(margin, b.y));
    }
  }

  const round = (b: Body): [number, number] => [
    Math.round(b.x * 10) / 10,
    Math.round(b.y * 10) / 10,
  ];
  const markers = Object.fromEntries(
    STORY_NODES.map((n) => [n.id, round(bodies.get(n.id)!)]),
  ) as Record<CampaignMissionId, [number, number]>;
  const hubs = Object.fromEntries(
    CAMPAIGN_CHAPTERS.map((c) => [
      c.chapter,
      round(bodies.get(`hub:${c.chapter}`)!),
    ]),
  ) as Record<CampaignChapter, [number, number]>;
  return { markers, hubs, regions, unplaced };
}

/** Bố cục cố định cho mọi người chơi (chỉ phụ thuộc dữ liệu nhiệm vụ), tính một lần. */
export const MAP_LAYOUT: MapLayout = computeLayout();
