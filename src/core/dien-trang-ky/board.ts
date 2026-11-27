// Điền Trang Ký (Shan chốt 27/11/2026): bàn vòng 40 ô quanh đất mười hai sứ quân. Lối chơi chung của thể loại cờ tỷ phú
// (đổ xúc xắc, đi vòng, mua đất, xây nhà, thu tô) nhưng bàn, ô, quẻ và luật riêng của Cờ Lau, không chép trò nào.
// Luật chính thức: docs/02-game-modes/dien-trang-ky/gdd.md.

/** Mười hai vùng đất, mỗi vùng hai ô, xếp từ rẻ tới đắt theo chiều đi. `lord` là id sứ quân trong roster. */
export interface Region {
  readonly id: string;
  readonly name: string;
  readonly lord: string;
  /** Giá mỗi ô đất (quan tiền). */
  readonly price: number;
}

export const REGIONS: readonly Region[] = [
  { id: "doDong", name: "Đỗ Động", lord: "doCanhThac", price: 60 },
  { id: "hoiHo", name: "Hồi Hồ", lord: "kieuThuan", price: 80 },
  { id: "duongLam", name: "Đường Lâm", lord: "ngoNhatKhanh", price: 100 },
  { id: "phongChau", name: "Phong Châu", lord: "kieuCongHan", price: 120 },
  { id: "tamDai", name: "Tam Đái", lord: "nguyenKhoan", price: 140 },
  { id: "binhKieu", name: "Bình Kiều", lord: "ngoXuongXi", price: 160 },
  { id: "teGiang", name: "Tế Giang", lord: "luDuong", price: 180 },
  { id: "tayPhuLiet", name: "Tây Phù Liệt", lord: "nguyenSieu", price: 200 },
  { id: "tienDu", name: "Tiên Du", lord: "nguyenThuTiep", price: 220 },
  { id: "sieuLoai", name: "Siêu Loại", lord: "lyKhue", price: 260 },
  { id: "dangChau", name: "Đằng Châu", lord: "phamBachHo", price: 300 },
  { id: "boHai", name: "Bố Hải Khẩu", lord: "tranLam", price: 350 },
];

export type SpecialKind =
  /** Kinh thành Hoa Lư: ô xuất phát, đi qua nhận lương vòng. */
  | "start"
  /** Bến Sông Đáy: trả tiền đò để tới một ô bất kỳ. */
  | "boat"
  /** Hội Cờ Lau: mở hội trên một ô đất của mình, tô ô đó gấp đôi. */
  | "festival"
  /** Miếu Thổ Thần: được phúc, lần nộp tô kế tiếp được miễn. */
  | "shrine"
  /** Quẻ bói: rút một quẻ thời loạn. */
  | "omen"
  /** Thuế đinh: nộp một phần mười tiền mặt. */
  | "poll"
  /** Cống nạp: nộp theo số bậc nhà đang có. */
  | "tribute"
  /** Trạm dịch: được phi ngựa trạm sang trạm bên kia bàn. */
  | "relay"
  /** Chợ phiên: được mua một ô đất trống bất kỳ theo giá gốc. */
  | "market"
  /** Đường lầy: mất lượt kế tiếp. */
  | "mire";

export type Tile =
  | { readonly kind: "land"; readonly name: string; readonly region: number; readonly price: number }
  | { readonly kind: SpecialKind; readonly name: string };

const land = (region: number, name: string): Tile => ({ kind: "land", name, region, price: REGIONS[region]!.price });
const sp = (kind: SpecialKind, name: string): Tile => ({ kind, name });

export const TILES: readonly Tile[] = [
  sp("start", "Kinh thành Hoa Lư"),
  land(0, "Làng Đỗ Động"),
  sp("omen", "Quẻ bói"),
  land(0, "Bến Thanh Oai"),
  sp("poll", "Thuế đinh"),
  sp("relay", "Trạm dịch Nam"),
  land(1, "Núi Hồi Hồ"),
  land(1, "Bến Cẩm Khê"),
  land(2, "Làng Đường Lâm"),
  land(2, "Giếng Mông Phụ"),
  sp("boat", "Bến Sông Đáy"),
  land(3, "Ngã ba Bạch Hạc"),
  sp("market", "Chợ phiên"),
  land(3, "Đồi Phong Châu"),
  land(4, "Phủ Tam Đái"),
  sp("mire", "Đường lầy"),
  land(4, "Đầm Vĩnh Tường"),
  sp("omen", "Quẻ bói"),
  land(5, "Thành Bình Kiều"),
  land(5, "Bến Triệu Sơn"),
  sp("festival", "Hội Cờ Lau"),
  land(6, "Bãi Tế Giang"),
  sp("omen", "Quẻ bói"),
  land(6, "Chợ Văn Giang"),
  land(7, "Ấp Phù Liệt"),
  sp("relay", "Trạm dịch Bắc"),
  land(7, "Bến Thanh Trì"),
  land(8, "Núi Tiên Du"),
  sp("mire", "Đường lầy"),
  land(8, "Làng Nội Duệ"),
  sp("shrine", "Miếu Thổ Thần"),
  land(9, "Thành Siêu Loại"),
  land(9, "Bến Thuận Thành"),
  sp("market", "Chợ phiên"),
  land(10, "Thành Đằng Châu"),
  sp("omen", "Quẻ bói"),
  land(10, "Bãi Kim Động"),
  sp("tribute", "Cống nạp"),
  land(11, "Thành Bố Hải"),
  land(11, "Cửa Kỳ Bố"),
];

export const BOARD_SIZE = TILES.length;

/** Năm bậc nhà; bậc 0 là đất trống đã có chủ. Kiểu dáng và màu nhà theo hệ của chủ đất, không đổi tô. */
export const LEVEL_NAME = ["Đất", "Nhà tranh", "Nhà gỗ", "Nhà ngói", "Dinh thự", "Trang ấp"] as const;
export const MAX_LEVEL = 5;
/** Lúc mua đất được xây luôn tới bậc này. */
export const MAX_LEVEL_ON_BUY = 3;
/** Tô theo bậc, nhân với giá đất. */
export const RENT_RATE = [0.15, 0.5, 1.2, 2.2, 3.2, 4.5] as const;
/** Giữ đủ hai ô một vùng (hùng cứ): tô nhân thêm. Bậc 5 chỉ xây được khi hùng cứ. */
export const HOLD_RATE = 1.5;
/** Ô đang mở Hội Cờ Lau: tô nhân thêm. */
export const FESTIVAL_RATE = 2;
/** Mua lại đất người khác: trả chủ đất gấp chừng này giá trị (đất và nhà). Trang ấp không mua lại được. */
export const BUYOUT_RATE = 2;
/** Bán đất lại cho triều đình được chừng này giá trị. */
export const SELL_RATE = 0.5;

/** Vàng theo thứ hạng (hạng nhất trước), theo số người trong ván. Mức Claude đặt 27/11/2026, chờ Shan duyệt. */
export const DTK_GOLD: Readonly<Record<number, readonly number[]>> = {
  2: [40, 0],
  3: [60, 25, 0],
  4: [80, 40, 15, 0],
};
/** Số ván có vàng mỗi ngày của một tài khoản. */
export const DTK_REWARDS_PER_DAY = 3;

export const START_CASH = 2000;
export const SALARY = 200;
export const BOAT_FARE = 50;
export const TRIBUTE_BASE = 50;
export const TRIBUTE_PER_LEVEL = 15;
export const POLL_RATE = 0.1;
export const POLL_MIN = 20;

/** Giá xây một bậc nhà (bậc 1..5) trên ô có giá `price`. */
export const buildCost = (price: number, level: number): number => (level >= MAX_LEVEL ? price : Math.round(price / 2));

/** Tổng tiền đã bỏ vào ô: giá đất và các bậc nhà. */
export function tileValue(price: number, level: number): number {
  let v = price;
  for (let l = 1; l <= level; l++) v += buildCost(price, l);
  return v;
}

/** Ô đất của từng vùng. */
export const REGION_TILES: readonly (readonly number[])[] = REGIONS.map((_, r) =>
  TILES.flatMap((t, i) => (t.kind === "land" && t.region === r ? [i] : [])),
);

export const RELAY_TILES = TILES.flatMap((t, i) => (t.kind === "relay" ? [i] : []));
