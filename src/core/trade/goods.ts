// Hàng hóa Hành Thương Ký: 40 món chia năm nhóm, ba phẩm cấp (Shan chốt 27/11/2026). "Đặc sản" là nhãn cố định gắn món
// với quê nhà (món bậc nào cũng làm đặc sản được, mỗi nơi hai món); "Hiếm" là nhãn đổi theo phiên của chợ (market.ts).
// Quê nhà là game dựng (nhãn `fictional`), không phải sử chép; món chọn cho hợp thế kỷ 10 trên đất Bắc. Luật ở GDD mục 3.

import type { TradeNodeId, TradeNodeKind } from "./map";

/** Phẩm cấp: thường dụng rẻ, nhiều hàng; thượng phẩm vừa; kỳ trân đắt, rất ít hàng. */
export type TradeTier = "common" | "fine" | "treasure";

/** Năm nhóm hàng theo danh sách Shan gửi 27/11/2026. */
export type TradeCategory = "farm" | "sea" | "forest" | "craft" | "mineral";

export type TradeItemId =
  | "rice"
  | "stickyRice"
  | "taro"
  | "beans"
  | "sesame"
  | "molasses"
  | "tea"
  | "areca"
  | "longan"
  | "riceWine"
  | "salt"
  | "driedFish"
  | "fishSauce"
  | "squid"
  | "seaCucumber"
  | "pearl"
  | "tortoiseshell"
  | "coral"
  | "ironwood"
  | "rosewood"
  | "bamboo"
  | "charcoal"
  | "cinnamon"
  | "anise"
  | "herbs"
  | "honey"
  | "agarwood"
  | "ginseng"
  | "pottery"
  | "silk"
  | "brocade"
  | "indigoCloth"
  | "sedgeMat"
  | "doPaper"
  | "lacquer"
  | "conicalHat"
  | "laterite"
  | "ironBar"
  | "bronze"
  | "ivory";

export interface TradeItem {
  readonly id: TradeItemId;
  readonly name: string;
  readonly category: TradeCategory;
  readonly tier: TradeTier;
  /** Giá gốc (kim tiền mỗi đơn vị). */
  readonly base: number;
  /** Quê nhà: món là đặc sản ở đây, luôn bày, nhiều hàng và rẻ. */
  readonly homes: readonly TradeNodeId[];
  /** Loại địa điểm có sẵn món này (bày nhiều, giá mềm hơn). */
  readonly kinds: readonly TradeNodeKind[];
}

const item = (id: TradeItemId, name: string, category: TradeCategory, tier: TradeTier, base: number, homes: readonly TradeNodeId[], kinds: readonly TradeNodeKind[]): TradeItem => ({
  id,
  name,
  category,
  tier,
  base,
  homes,
  kinds,
});

export const TRADE_ITEMS: readonly TradeItem[] = [
  // Nông sản
  item("rice", "Gạo tẻ", "farm", "common", 20, ["dangChau"], ["plain", "river"]),
  item("stickyRice", "Gạo nếp", "farm", "common", 28, ["doDong"], ["plain", "river"]),
  item("taro", "Khoai môn", "farm", "common", 15, [], ["mountain", "plain"]),
  item("beans", "Đậu đỗ", "farm", "common", 25, [], ["plain", "river"]),
  item("sesame", "Vừng", "farm", "common", 35, [], ["plain"]),
  item("molasses", "Mật mía", "farm", "common", 30, ["teGiang"], ["river"]),
  item("tea", "Chè xanh", "farm", "fine", 120, ["tienDu"], ["mountain"]),
  item("areca", "Cau khô", "farm", "common", 30, [], ["plain", "river"]),
  item("longan", "Long nhãn", "farm", "fine", 110, ["dangChau"], ["river"]),
  item("riceWine", "Rượu nếp", "farm", "fine", 90, ["tayPhuLiet"], ["plain"]),
  // Thủy hải sản
  item("salt", "Muối hạt", "sea", "common", 22, ["cuaDaiAc"], ["sea"]),
  item("driedFish", "Cá khô", "sea", "common", 40, ["tamDai"], ["sea", "river"]),
  item("fishSauce", "Nước mắm", "sea", "fine", 70, ["boHai"], ["sea"]),
  item("squid", "Mực khô", "sea", "fine", 100, [], ["sea"]),
  item("seaCucumber", "Hải sâm", "sea", "fine", 220, [], ["sea"]),
  item("pearl", "Ngọc trai", "sea", "treasure", 700, ["boHai"], ["sea"]),
  item("tortoiseshell", "Đồi mồi", "sea", "treasure", 600, ["cuaDaiAc"], ["sea"]),
  item("coral", "San hô đỏ", "sea", "treasure", 650, [], ["sea"]),
  // Lâm sản, dược liệu
  item("ironwood", "Gỗ lim", "forest", "fine", 150, ["hoaLu"], ["mountain"]),
  item("rosewood", "Gỗ trắc", "forest", "fine", 260, [], ["mountain"]),
  item("bamboo", "Tre nứa", "forest", "common", 25, ["hoaLu"], ["mountain", "river"]),
  item("charcoal", "Than củi", "forest", "common", 18, [], ["mountain"]),
  item("cinnamon", "Quế", "forest", "fine", 160, ["phongChau"], ["mountain"]),
  item("anise", "Hoa hồi", "forest", "fine", 130, [], ["mountain"]),
  item("herbs", "Dược liệu", "forest", "fine", 120, [], ["mountain", "plain"]),
  item("honey", "Mật ong", "forest", "fine", 140, ["hoiHo"], ["mountain"]),
  item("agarwood", "Trầm hương", "forest", "treasure", 900, ["duongLam"], ["mountain"]),
  item("ginseng", "Nhân sâm", "forest", "treasure", 750, [], ["mountain"]),
  // Thủ công
  item("pottery", "Gốm men", "craft", "fine", 160, ["sieuLoai"], ["plain"]),
  item("silk", "Lụa tơ tằm", "craft", "fine", 180, ["teGiang"], ["river"]),
  item("brocade", "Gấm vóc", "craft", "fine", 300, ["tienDu"], ["plain"]),
  item("indigoCloth", "Vải chàm", "craft", "common", 45, ["tamDai"], ["river", "mountain"]),
  item("sedgeMat", "Chiếu cói", "craft", "fine", 90, ["doDong"], ["river"]),
  item("doPaper", "Giấy dó", "craft", "fine", 110, ["tayPhuLiet"], ["plain"]),
  item("lacquer", "Sơn mài", "craft", "fine", 240, ["sieuLoai"], ["plain"]),
  item("conicalHat", "Nón lá", "craft", "common", 40, [], ["river", "plain"]),
  // Khoáng sản, lễ khí
  item("laterite", "Đá ong", "mineral", "common", 35, ["duongLam"], ["mountain"]),
  item("ironBar", "Sắt thỏi", "mineral", "fine", 120, [], ["mountain"]),
  item("bronze", "Đồ đồng", "mineral", "fine", 280, ["phongChau"], ["mountain"]),
  item("ivory", "Ngà voi", "mineral", "treasure", 850, ["hoiHo"], ["mountain"]),
];

export const TRADE_ITEM_IDS: readonly TradeItemId[] = TRADE_ITEMS.map((i) => i.id);

export const TRADE_TIER_NAME: Readonly<Record<TradeTier, string>> = { common: "Thường dụng", fine: "Thượng phẩm", treasure: "Kỳ trân" };

export const TRADE_CATEGORY_NAME: Readonly<Record<TradeCategory, string>> = {
  farm: "Nông sản",
  sea: "Thủy hải sản",
  forest: "Lâm sản, dược liệu",
  craft: "Thủ công",
  mineral: "Khoáng sản, lễ khí",
};

/** Mã cũ đã đổi cho khớp tên rút gọn (27/11/2026): hồ sơ và kho lưu mã cũ được đọc sang mã mới. */
export const LEGACY_TRADE_ITEM_IDS: Readonly<Record<string, TradeItemId>> = { hemp: "indigoCloth", basketry: "conicalHat" };

/** Mã món sau khi đổi mã cũ (giữ nguyên mã lạ để bộ kiểm phía sau từ chối). */
export const currentTradeItemId = (id: string): string => LEGACY_TRADE_ITEM_IDS[id] ?? id;

/** Khoang hàng đọc từ kho: gộp mã cũ vào mã mới, bỏ món không còn trong danh mục. */
export function migrateCargo(c: Readonly<Record<string, number | undefined>>): Partial<Record<TradeItemId, number>> {
  const out: Partial<Record<TradeItemId, number>> = {};
  for (const [raw, n] of Object.entries(c)) {
    const id = currentTradeItemId(raw);
    if (n && n > 0 && isTradeItem(id)) out[id] = (out[id] ?? 0) + n;
  }
  return out;
}

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
    w += tradeItem(id).tier === "treasure" ? Math.ceil(n / TREASURE_PER_SLOT) : n;
  }
  return w;
}
