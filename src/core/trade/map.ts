// Bản đồ Hành Thương Ký: 13 điểm giao dịch trên tranh nền Bình Loạn (public/art/campaign/world-map.webp, khung 1536×1024).
// 12 điểm lấy lại tọa độ cứ điểm của Bình Loạn (src/app/game/campaign/worldAtlas.ts), Cửa Đại Ác chỉ khai báo ở đây nên
// Bình Loạn không đổi gì (Shan chốt 26/11/2026). Luật ở docs/02-game-modes/hanh-thuong-ky/gdd.md mục 2.

export type TradeNodeKind = "sea" | "river" | "plain" | "mountain";

export type TradeNodeId =
  | "hoaLu"
  | "boHai"
  | "cuaDaiAc"
  | "dangChau"
  | "teGiang"
  | "tamDai"
  | "doDong"
  | "tayPhuLiet"
  | "sieuLoai"
  | "tienDu"
  | "phongChau"
  | "hoiHo"
  | "duongLam";

export interface TradeNode {
  readonly id: TradeNodeId;
  readonly name: string;
  readonly kind: TradeNodeKind;
  /** Người giữ đất (tên hiển thị); Cửa Đại Ác không thuộc sứ quân nào. */
  readonly holder: string | null;
  /** Tâm điểm trên khung 1536×1024. */
  readonly at: readonly [number, number];
}

export const TRADE_NODE_KIND_NAME: Readonly<Record<TradeNodeKind, string>> = {
  sea: "Cửa biển",
  river: "Bến sông",
  plain: "Chợ đồng bằng",
  mountain: "Núi, trung du",
};

export const TRADE_NODES: readonly TradeNode[] = [
  { id: "hoaLu", name: "Hoa Lư", kind: "mountain", holder: "Đinh Bộ Lĩnh", at: [845, 825] },
  { id: "boHai", name: "Bố Hải Khẩu", kind: "sea", holder: "Trần Lãm", at: [1200, 718] },
  { id: "cuaDaiAc", name: "Cửa Đại Ác", kind: "sea", holder: null, at: [1150, 905] },
  { id: "dangChau", name: "Đằng Châu", kind: "river", holder: "Phạm Bạch Hổ", at: [942, 600] },
  { id: "teGiang", name: "Tế Giang", kind: "river", holder: "Lữ Đường", at: [1012, 468] },
  { id: "tamDai", name: "Tam Đái", kind: "river", holder: "Nguyễn Khoan", at: [598, 170] },
  { id: "doDong", name: "Đỗ Động Giang", kind: "river", holder: "Đỗ Cảnh Thạc", at: [528, 550] },
  { id: "tayPhuLiet", name: "Tây Phù Liệt", kind: "plain", holder: "Nguyễn Siêu", at: [760, 410] },
  { id: "sieuLoai", name: "Siêu Loại", kind: "plain", holder: "Lý Khuê", at: [1265, 315] },
  { id: "tienDu", name: "Tiên Du", kind: "plain", holder: "Nguyễn Thủ Tiệp", at: [985, 235] },
  { id: "phongChau", name: "Phong Châu", kind: "mountain", holder: "Kiều Công Hãn", at: [388, 215] },
  { id: "hoiHo", name: "Hồi Hồ", kind: "mountain", holder: "Kiều Thuận", at: [157, 162] },
  { id: "duongLam", name: "Đường Lâm", kind: "mountain", holder: "Ngô Nhật Khánh", at: [407, 358] },
];

export const TRADE_NODE_IDS: readonly TradeNodeId[] = TRADE_NODES.map((n) => n.id);

/** Đường thủy (thuyền), đường bộ (xe ngựa) hoặc đoạn có cả hai (hiện thuyền). Phương tiện chỉ là hoạt ảnh. */
export type TradeRoute = "water" | "land" | "both";

/** Gần, vừa, xa: 20, 45, 90 phút ở cấp đoàn hàng 1. */
export type TradeDistance = 1 | 2 | 3;

export interface TradeEdge {
  readonly a: TradeNodeId;
  readonly b: TradeNodeId;
  readonly route: TradeRoute;
  readonly dist: TradeDistance;
  /** Chặng vượt biển: nạn trên đường là sóng dữ thay vì giặc sông. */
  readonly sea?: boolean;
}

export const TRADE_EDGES: readonly TradeEdge[] = [
  { a: "hoaLu", b: "dangChau", route: "both", dist: 2 },
  { a: "hoaLu", b: "cuaDaiAc", route: "water", dist: 2, sea: true },
  { a: "hoaLu", b: "doDong", route: "land", dist: 3 },
  { a: "dangChau", b: "boHai", route: "water", dist: 2 },
  { a: "dangChau", b: "teGiang", route: "both", dist: 1 },
  { a: "boHai", b: "cuaDaiAc", route: "water", dist: 2, sea: true },
  { a: "boHai", b: "sieuLoai", route: "water", dist: 3, sea: true },
  { a: "teGiang", b: "tayPhuLiet", route: "both", dist: 2 },
  { a: "teGiang", b: "sieuLoai", route: "water", dist: 2 },
  { a: "teGiang", b: "tienDu", route: "land", dist: 2 },
  { a: "tayPhuLiet", b: "tienDu", route: "land", dist: 2 },
  { a: "tayPhuLiet", b: "doDong", route: "both", dist: 2 },
  { a: "tayPhuLiet", b: "duongLam", route: "land", dist: 2 },
  { a: "tayPhuLiet", b: "tamDai", route: "water", dist: 2 },
  { a: "tienDu", b: "sieuLoai", route: "land", dist: 2 },
  { a: "tienDu", b: "tamDai", route: "land", dist: 3 },
  { a: "tamDai", b: "phongChau", route: "both", dist: 1 },
  { a: "phongChau", b: "hoiHo", route: "land", dist: 2 },
  { a: "phongChau", b: "duongLam", route: "land", dist: 1 },
  { a: "duongLam", b: "doDong", route: "land", dist: 2 },
];

export const isTradeNode = (v: unknown): v is TradeNodeId => typeof v === "string" && (TRADE_NODE_IDS as readonly string[]).includes(v);

export function tradeNode(id: TradeNodeId): TradeNode {
  return TRADE_NODES.find((n) => n.id === id)!;
}

/** Khóa cạnh không phân chiều, để hai đoàn đi ngược chiều cùng chặng vẫn gặp nhau. */
export function edgeKey(a: TradeNodeId, b: TradeNodeId): string {
  return a < b ? `${a}~${b}` : `${b}~${a}`;
}

export function tradeEdge(a: TradeNodeId, b: TradeNodeId): TradeEdge | null {
  return TRADE_EDGES.find((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a)) ?? null;
}

export function neighbors(id: TradeNodeId): TradeNodeId[] {
  return TRADE_EDGES.flatMap((e) => (e.a === id ? [e.b] : e.b === id ? [e.a] : []));
}

/** Số chặng ngắn nhất giữa hai điểm (0 khi trùng). */
export function hops(from: TradeNodeId, to: TradeNodeId): number {
  if (from === to) return 0;
  const seen = new Set<TradeNodeId>([from]);
  let frontier: TradeNodeId[] = [from];
  for (let d = 1; frontier.length > 0; d++) {
    const next: TradeNodeId[] = [];
    for (const n of frontier)
      for (const m of neighbors(n)) {
        if (m === to) return d;
        if (!seen.has(m)) {
          seen.add(m);
          next.push(m);
        }
      }
    frontier = next;
  }
  return Infinity;
}
