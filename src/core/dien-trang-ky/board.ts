// Điền Trang Ký (Shan chốt 27/11/2026): bàn vòng 40 ô, chín dãy đất mang tên vùng các sứ quân. Lối chơi chung của thể loại cờ tỷ phú
// (đổ xúc xắc, đi vòng, mua đất, xây nhà, thu tô) nhưng bàn, ô, quẻ và luật riêng của Cờ Lau, không chép trò nào.
// Luật chính thức: docs/02-game-modes/dien-trang-ky/gdd.md.

/** Chín dãy đất (Shan chốt 27/11: 3 dãy đôi, 6 dãy ba), xếp từ rẻ tới đắt theo chiều đi. `lord` là id sứ quân giữ vùng. */
export interface Region {
  readonly id: string;
  readonly name: string;
  readonly lord: string;
  /** Giá mỗi ô đất của dãy (quan tiền). */
  readonly price: number;
}

export const REGIONS: readonly Region[] = [
  { id: "doDong", name: "Đỗ Động", lord: "doCanhThac", price: 60 },
  { id: "hoiHo", name: "Hồi Hồ", lord: "kieuThuan", price: 80 },
  { id: "duongLam", name: "Đường Lâm", lord: "ngoNhatKhanh", price: 100 },
  { id: "phongChau", name: "Phong Châu", lord: "kieuCongHan", price: 140 },
  { id: "tayPhuLiet", name: "Tây Phù Liệt", lord: "nguyenSieu", price: 180 },
  { id: "tienDu", name: "Tiên Du", lord: "nguyenThuTiep", price: 220 },
  { id: "sieuLoai", name: "Siêu Loại", lord: "lyKhue", price: 260 },
  { id: "dangChau", name: "Đằng Châu", lord: "phamBachHo", price: 300 },
  { id: "boHai", name: "Bố Hải Khẩu", lord: "tranLam", price: 350 },
];

/** Giá mỗi danh thắng và tô theo số danh thắng cùng chủ (1..4). */
export const SCENIC_PRICE = 200;
export const SCENIC_RENT = [0, 50, 100, 200, 400] as const;

export type SpecialKind =
  /** Kinh thành Hoa Lư: ô xuất phát, đi qua nhận lương vòng. */
  | "start"
  /** Lao Ngục: bị giam, đổ ra đôi hoặc nộp tiền chuộc mới ra; giam tối đa ba lượt. */
  | "jail"
  /** Bến Sông Đáy: trả tiền đò để tới một ô bất kỳ. */
  | "boat"
  /** Hội Cờ Lau: mở hội trên một ô đất của mình, tô ô đó gấp đôi. */
  | "festival"
  /** Quẻ bói: rút một quẻ thời loạn. */
  | "omen"
  /** Thuế đinh: nộp một phần mười tiền mặt. */
  | "poll"
  /** Cống nạp: nộp theo số bậc nhà đang có. */
  | "tribute"
  /** Chợ phiên: được mua một ô đất trống bất kỳ theo giá gốc. */
  | "market";

export type Tile =
  | { readonly kind: "land"; readonly name: string; readonly region: number; readonly price: number }
  /** Danh thắng: mua được, không xây nhà; tô theo số danh thắng cùng chủ. */
  | { readonly kind: "scenic"; readonly name: string; readonly price: number }
  | { readonly kind: SpecialKind; readonly name: string };

const land = (region: number, name: string): Tile => ({ kind: "land", name, region, price: REGIONS[region]!.price });
const sp = (kind: SpecialKind, name: string): Tile => ({ kind, name });
const scenic = (name: string): Tile => ({ kind: "scenic", name, price: SCENIC_PRICE });

export const TILES: readonly Tile[] = [
  sp("start", "Kinh thành Hoa Lư"),
  land(0, "Làng Đỗ Động"),
  sp("omen", "Quẻ bói"),
  land(0, "Bến Thanh Oai"),
  sp("poll", "Thuế đinh"),
  scenic("Đền Hùng"),
  land(1, "Núi Hồi Hồ"),
  land(1, "Bến Cẩm Khê"),
  sp("market", "Chợ phiên"),
  land(1, "Chợ Hạ Hòa"),
  sp("jail", "Lao Ngục"),
  land(2, "Làng Đường Lâm"),
  sp("omen", "Quẻ bói"),
  land(2, "Giếng Mông Phụ"),
  land(2, "Đền Phùng Hưng"),
  scenic("Núi Tản Viên"),
  land(3, "Ngã ba Bạch Hạc"),
  sp("omen", "Quẻ bói"),
  land(3, "Đồi Phong Châu"),
  land(3, "Đầm Vĩnh Tường"),
  sp("festival", "Hội Cờ Lau"),
  land(4, "Ấp Phù Liệt"),
  sp("omen", "Quẻ bói"),
  land(4, "Bến Thanh Trì"),
  land(4, "Bãi Văn Giang"),
  scenic("Chùa Dâu"),
  land(5, "Núi Tiên Du"),
  sp("market", "Chợ phiên"),
  land(5, "Làng Nội Duệ"),
  land(5, "Đồi Lim"),
  sp("boat", "Bến Sông Đáy"),
  land(6, "Thành Siêu Loại"),
  land(6, "Bến Thuận Thành"),
  land(6, "Làng Luy Lâu"),
  land(7, "Thành Đằng Châu"),
  scenic("Tràng An"),
  land(7, "Bãi Kim Động"),
  sp("tribute", "Cống nạp"),
  land(8, "Thành Bố Hải"),
  land(8, "Cửa Kỳ Bố"),
];

export const BOARD_SIZE = TILES.length;

/** Năm bậc nhà; bậc 0 là đất trống đã có chủ. Kiểu dáng và màu nhà theo hệ của chủ đất, không đổi tô. */
export const LEVEL_NAME = ["Đất", "Nhà tranh", "Nhà gỗ", "Nhà ngói", "Dinh thự", "Trang ấp"] as const;
export const MAX_LEVEL = 5;
/** Lúc mua đất được xây luôn tới bậc này. */
export const MAX_LEVEL_ON_BUY = 3;
/** Giá xây mỗi bậc (1..5) tính theo phần trăm giá đất của khu. */
export const BUILD_RATE = [0, 0.5, 0.5, 0.5, 0.5, 1] as const;
/** Tô theo phần trăm giá trị ô (đất cộng nhà đã xây), Shan chốt 27/11: một lần thu không vượt tổng vốn. */
export const RENT_RATE = [0.15, 0.3, 0.45, 0.6, 0.7, 0.75] as const;
/** Ba ô có lễ hội nhỏ suốt ván (chọn ngẫu nhiên đầu ván): tô nhân thêm. */
export const FAIR_COUNT = 3;
export const FAIR_RATE = 1.5;
/** Thiên tai (người rút chọn nhà của người khác): Động đất làm sập một bậc; Bão lũ bắt sửa 1..3 lượt của chủ, không thu tô. Hai hiệu ứng không cùng lúc; Trang ấp không bị ảnh hưởng. */
export const RUIN_MIN = 1;
export const RUIN_MAX = 3;
/** Giữ đủ cả dãy đôi (hùng cứ): tô nhân thêm. Bậc 5 chỉ xây được khi giữ đủ dãy. */
export const HOLD_RATE = 1.5;
/** Giữ đủ dãy ba (hùng cứ) thì tô nhân chừng này. Chưa đủ dãy thì không nhân (Shan chốt 27/11). */
export const HOLD3_RATE = 2;
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

/** Lao Ngục: số lần đổ thử tối đa và tiền chuộc. */
export const JAIL_TRIES = 3;
export const JAIL_BAIL = 100;

export const START_CASH = 2000;
export const SALARY = 200;
export const BOAT_FARE = 50;
export const TRIBUTE_BASE = 50;
export const TRIBUTE_PER_LEVEL = 15;
export const POLL_RATE = 0.1;
export const POLL_MIN = 20;

/** Giá xây một bậc nhà (bậc 1..5) trên ô có giá `price`. */
export const buildCost = (price: number, level: number): number => Math.round(price * BUILD_RATE[Math.min(level, MAX_LEVEL)]!);

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

/** Ô đất (không tính danh thắng) trên từng cạnh bàn. Giữ hết một cạnh là thắng ngay (Shan chốt 27/11). */
export const SIDE_LANDS: readonly (readonly number[])[] = [0, 1, 2, 3].map((k) =>
  TILES.flatMap((t, i) => (t.kind === "land" && i > k * 10 && i < k * 10 + 10 ? [i] : [])),
);

export const SCENIC_TILES = TILES.flatMap((t, i) => (t.kind === "scenic" ? [i] : []));
export const JAIL_TILE = TILES.findIndex((t) => t.kind === "jail");
