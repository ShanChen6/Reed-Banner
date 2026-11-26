// Hàng hóa Hành Thương Ký: phổ thông, đặc sản (quê nhà bán rẻ, nơi khác là hàng hiếm) và kỳ trân dị bảo.
// Đặc sản và nơi có kỳ trân là game dựng (nhãn `fictional`), không phải sử chép. Luật ở GDD mục 3.

import type { TradeNodeId, TradeNodeKind } from "./map";

export type TradeGroup = "common" | "specialty" | "treasure";

export type TradeItemId =
  | "rice"
  | "salt"
  | "hemp"
  | "driedFish"
  | "charcoal"
  | "ironwood"
  | "fishSauce"
  | "longan"
  | "silk"
  | "riverFish"
  | "sedgeMat"
  | "doPaper"
  | "pottery"
  | "tea"
  | "cinnamon"
  | "honey"
  | "laterite"
  | "ivory"
  | "agarwood"
  | "pearl"
  | "tortoiseshell"
  | "coral";

export interface TradeItem {
  readonly id: TradeItemId;
  readonly name: string;
  readonly group: TradeGroup;
  /** Giá gốc (kim tiền mỗi đơn vị). */
  readonly base: number;
  /** Đặc sản: quê nhà. */
  readonly home?: TradeNodeId;
  /** Kỳ trân: những nơi thỉnh thoảng có hàng về. */
  readonly sources?: readonly TradeNodeId[];
  /** Hàng phổ thông: hệ số giá theo loại địa điểm (thiếu là 1). */
  readonly byKind?: Partial<Record<TradeNodeKind, number>>;
}

export const TRADE_ITEMS: readonly TradeItem[] = [
  { id: "rice", name: "Lúa gạo", group: "common", base: 20, byKind: { plain: 0.85, river: 0.95, mountain: 1.15, sea: 1.05 } },
  { id: "salt", name: "Muối hạt", group: "common", base: 25, byKind: { sea: 0.8, river: 0.95, plain: 1.05, mountain: 1.2 } },
  { id: "hemp", name: "Vải gai", group: "common", base: 45, byKind: { plain: 0.9, river: 1, mountain: 1.05, sea: 1.1 } },
  { id: "driedFish", name: "Cá khô", group: "common", base: 35, byKind: { sea: 0.85, river: 0.9, plain: 1.05, mountain: 1.15 } },
  { id: "charcoal", name: "Củi than", group: "common", base: 20, byKind: { mountain: 0.8, plain: 1, river: 1.05, sea: 1.1 } },
  { id: "ironwood", name: "Gỗ lim", group: "specialty", base: 150, home: "hoaLu" },
  { id: "fishSauce", name: "Nước mắm", group: "specialty", base: 80, home: "boHai" },
  { id: "longan", name: "Nhãn khô", group: "specialty", base: 110, home: "dangChau" },
  { id: "silk", name: "Tơ tằm", group: "specialty", base: 180, home: "teGiang" },
  { id: "riverFish", name: "Cá sông khô", group: "specialty", base: 90, home: "tamDai" },
  { id: "sedgeMat", name: "Chiếu cói", group: "specialty", base: 100, home: "doDong" },
  { id: "doPaper", name: "Giấy dó", group: "specialty", base: 120, home: "tayPhuLiet" },
  { id: "pottery", name: "Gốm đất nung", group: "specialty", base: 130, home: "sieuLoai" },
  { id: "tea", name: "Chè búp", group: "specialty", base: 140, home: "tienDu" },
  { id: "cinnamon", name: "Quế", group: "specialty", base: 160, home: "phongChau" },
  { id: "honey", name: "Mật ong rừng", group: "specialty", base: 150, home: "hoiHo" },
  { id: "laterite", name: "Đá ong", group: "specialty", base: 80, home: "duongLam" },
  { id: "ivory", name: "Ngà voi", group: "treasure", base: 800, sources: ["hoiHo", "phongChau"] },
  { id: "agarwood", name: "Trầm hương", group: "treasure", base: 900, sources: ["hoiHo", "duongLam"] },
  { id: "pearl", name: "Ngọc trai", group: "treasure", base: 700, sources: ["cuaDaiAc", "boHai"] },
  { id: "tortoiseshell", name: "Đồi mồi", group: "treasure", base: 600, sources: ["cuaDaiAc"] },
  { id: "coral", name: "San hô", group: "treasure", base: 500, sources: ["cuaDaiAc", "boHai"] },
];

export const TRADE_ITEM_IDS: readonly TradeItemId[] = TRADE_ITEMS.map((i) => i.id);

export const TRADE_GROUP_NAME: Readonly<Record<TradeGroup, string>> = { common: "Phổ thông", specialty: "Đặc sản", treasure: "Kỳ trân" };

export const isTradeItem = (v: unknown): v is TradeItemId => typeof v === "string" && (TRADE_ITEM_IDS as readonly string[]).includes(v);

export function tradeItem(id: TradeItemId): TradeItem {
  return TRADE_ITEMS.find((i) => i.id === id)!;
}

/** Kỳ trân nhẹ: 5 đơn vị chiếm một ô khoang. */
export const TREASURE_PER_SLOT = 5;

/** Số ô khoang một lượng hàng chiếm (kỳ trân làm tròn lên theo từng món). */
export function cargoWeight(cargo: Readonly<Partial<Record<TradeItemId, number>>>): number {
  let w = 0;
  for (const [id, n] of Object.entries(cargo)) {
    if (!n || n <= 0 || !isTradeItem(id)) continue;
    w += tradeItem(id).group === "treasure" ? Math.ceil(n / TREASURE_PER_SLOT) : n;
  }
  return w;
}
