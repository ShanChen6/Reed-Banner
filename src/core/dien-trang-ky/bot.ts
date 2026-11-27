// Máy chơi Điền Trang Ký: mười hai sứ quân, mỗi người một lối làm giàu theo tính cách (cùng bộ tên tính cách với bot nhân
// vật, Shan chốt 27/11/2026). Máy chỉ nhìn những gì người chơi thấy trên bàn, không biết trước xúc xắc hay quẻ.
// Người chơi để hết giờ thì máy đi thay theo lối Lão luyện.

import { createRng } from "../rng";
import { BOAT_FARE, JAIL_BAIL, MAX_LEVEL_ON_BUY, REGION_TILES, SCENIC_TILES, SIDE_LANDS, TILES } from "./board";
import {
  aliveSeats,
  assetsOf,
  buildCostBetween,
  disasterTargets,
  freeLands,
  holdsRegion,
  isScenic,
  levelCap,
  monopolyOf,
  ownedTiles,
  priceOf,
  rentOf,
  scenicCount,
  sellOf,
  type DtkAction,
  type DtkState,
} from "./game";

export type BotStyle = "manhCong" | "thuThanh" | "muuPha" | "tichLuc" | "lieuLinh" | "laoLuyen" | "tuyCo";

export interface StyleParams {
  readonly name: string;
  readonly summary: string;
  /** Tiền mặt muốn giữ lại sau mỗi khoản chi. */
  readonly reserve: number;
  /** Phần bậc nhà dám xây so với mức tiền cho phép (0..1). */
  readonly build: number;
  /** Mức ham mua lại đất người khác (0..1). */
  readonly buyout: number;
  /** Độ ngẫu hứng. */
  readonly whim: number;
}

export const STYLES: Readonly<Record<BotStyle, StyleParams>> = {
  manhCong: { name: "Mãnh công", summary: "Thấy đất là mua, xây cao ngay, giữ ít tiền.", reserve: 150, build: 1, buyout: 0.7, whim: 0.1 },
  thuThanh: { name: "Thủ thành", summary: "Giữ tiền chắc tay, mua kỹ, ít khi mua lại đất người.", reserve: 500, build: 0.5, buyout: 0.15, whim: 0.05 },
  muuPha: { name: "Mưu phá", summary: "Chuyên mua lại đất để phá thế hùng cứ của người khác.", reserve: 300, build: 0.6, buyout: 1, whim: 0.1 },
  tichLuc: { name: "Tích lực", summary: "Gom đất trước, đủ tiền mới xây một mạch lên cao.", reserve: 350, build: 0.8, buyout: 0.35, whim: 0.05 },
  lieuLinh: { name: "Liều lĩnh", summary: "Tiêu gần hết tiền, lúc phất to lúc trắng tay.", reserve: 40, build: 1, buyout: 0.6, whim: 0.4 },
  laoLuyen: { name: "Lão luyện", summary: "Cân nhắc từng vùng, ưu tiên gom đủ hai ô để hùng cứ.", reserve: 280, build: 0.75, buyout: 0.5, whim: 0 },
  tuyCo: { name: "Tùy cơ", summary: "Giàu thì giữ chắc, nghèo thì đánh liều.", reserve: 250, build: 0.75, buyout: 0.5, whim: 0.15 },
};

/** Tính cách của mười hai sứ quân (khớp bảng bot nhân vật). */
export const LORD_STYLE: Readonly<Record<string, BotStyle>> = {
  tranLam: "laoLuyen",
  phamBachHo: "manhCong",
  ngoXuongXi: "muuPha",
  ngoNhatKhanh: "muuPha",
  nguyenKhoan: "thuThanh",
  kieuCongHan: "tichLuc",
  kieuThuan: "thuThanh",
  lyKhue: "manhCong",
  nguyenThuTiep: "tuyCo",
  luDuong: "tichLuc",
  nguyenSieu: "manhCong",
  doCanhThac: "lieuLinh",
};

export const styleOf = (bot: string | null): BotStyle => (bot ? (LORD_STYLE[bot] ?? "laoLuyen") : "laoLuyen");

function params(s: DtkState, seat: number, style: BotStyle): StyleParams {
  const base = STYLES[style];
  if (style !== "tuyCo") return base;
  const alive = aliveSeats(s);
  const mine = assetsOf(s, seat);
  const avg = alive.reduce((n, i) => n + assetsOf(s, i), 0) / Math.max(1, alive.length);
  return mine >= avg ? { ...base, reserve: 450, build: 0.6, buyout: 0.3 } : { ...base, reserve: 80, build: 1, buyout: 0.8 };
}

/** Ô này giúp mình gom đủ vùng (vùng chỉ còn thiếu đúng ô này). */
function completes(s: DtkState, tile: number, seat: number): boolean {
  if (isScenic(tile)) return scenicCount(s, seat) > 0;
  const t = TILES[tile];
  if (t?.kind !== "land") return false;
  return REGION_TILES[t.region]!.every((i) => i === tile || s.plots[i]?.owner === seat);
}

/** Có ô này thì thắng ngay (đủ một cạnh hoặc đủ bốn danh thắng). */
function winsWith(s: DtkState, tile: number, seat: number): boolean {
  const t = structuredClone(s);
  t.plots[tile] = { owner: seat, level: t.plots[tile]?.level ?? 0 };
  return monopolyOf(t, seat) !== null;
}

/** Số nhà khác nhau đang giữ ít nhất một danh thắng. */
const scenicHolders = (s: DtkState): number => new Set(SCENIC_TILES.flatMap((i) => (s.plots[i]?.owner != null ? [s.plots[i]!.owner!] : []))).size;

/** Người `o` chỉ còn thiếu đúng một ô để thắng ngay. */
function nearWin(s: DtkState, o: number): boolean {
  const groups = [SCENIC_TILES, ...SIDE_LANDS];
  return groups.some((g) => g.filter((i) => s.plots[i]?.owner === o).length >= g.length - 1 && g.some((i) => s.plots[i]?.owner === o));
}

/** Ô này mà về tay người khác thì người đó thắng ngay: nên giành trước để chặn. */
function blocks(s: DtkState, tile: number, seat: number): boolean {
  return aliveSeats(s).some((o) => o !== seat && winsWith(s, tile, o));
}

/** Bậc cao nhất xây tới được mà vẫn giữ `reserve`, rồi nhân theo độ dám xây. */
function targetLevel(cash: number, reserve: number, tile: number, from: number, cap: number, build: number, base = 0): number {
  let best = from;
  for (let l = from + 1; l <= cap; l++) if (cash - base - buildCostBetween(tile, from, l) >= reserve) best = l;
  if (best <= from) return from;
  return Math.max(from + 1, from + Math.round((best - from) * build));
}

/** Lệnh máy chọn cho ghế đang đi. Không đổi trạng thái. */
export function chooseAction(s: DtkState, style: BotStyle = styleOf(s.players[s.turn]?.bot ?? null)): DtkAction {
  const seat = s.turn;
  const me = s.players[seat]!;
  const prm = params(s, seat, style);
  const rng = createRng((s.rng ^ Math.imul(s.evSeq + 1, 0x9e3779b1)) >>> 0);
  const whim = () => rng.next() < prm.whim;
  const ph = s.phase;
  switch (ph.k) {
    case "ended":
      return { t: "roll" };
    case "roll":
      // Ở Lao Ngục: còn nhiều đất trống và dư tiền thì chuộc ra để kịp mua đất, không thì đổ thử.
      if (me.jail > 0 && me.cash - JAIL_BAIL >= prm.reserve * 2 && freeLands(s).length > 8 && !whim()) return { t: "bail" };
      return { t: "roll" };
    case "buy": {
      const price = priceOf(ph.tile);
      if (me.cash >= price && (winsWith(s, ph.tile, seat) || blocks(s, ph.tile, seat))) return { t: "buy", level: 0 };
      // Danh thắng: khi chưa tới hai nhà giữ danh thắng thì gặp là mua để chặn cửa thắng bốn danh thắng. Đã có hai nhà
      // khác nhau giữ (cửa thắng đã bị chặn) thì cân theo tiền còn lại như đất thường (Shan dặn 27/11).
      if (isScenic(ph.tile) && me.cash >= price && scenicHolders(s) < 2) return { t: "buy", level: 0 };
      const reserve = completes(s, ph.tile, seat) ? prm.reserve / 2 : prm.reserve;
      if (me.cash - price < reserve && !whim()) return { t: "skip" };
      if (me.cash < price) return { t: "skip" };
      const build = style === "tichLuc" ? 0 : prm.build;
      return { t: "buy", level: isScenic(ph.tile) ? 0 : targetLevel(me.cash, prm.reserve, ph.tile, 0, MAX_LEVEL_ON_BUY, build, price) };
    }
    case "build": {
      const plot = s.plots[ph.tile]!;
      const reserve = style === "tichLuc" && ownedTiles(s, seat).length < 4 ? prm.reserve * 2 : prm.reserve;
      const level = targetLevel(me.cash, reserve, ph.tile, plot.level, levelCap(s, ph.tile, seat), prm.build);
      return level > plot.level ? { t: "build", level } : { t: "skip" };
    }
    case "rent": {
      // Mua lại khi thắng ngay được, hoặc khi chủ ô đang giữ thế sắp thắng (cướp một ô của cạnh hay danh thắng của họ).
      if (winsWith(s, ph.tile, seat)) return { t: "buyout" };
      if (nearWin(s, ph.owner) && me.cash - ph.buyout >= ph.amount) return { t: "buyout" };
      const left = me.cash - ph.buyout;
      if (left < Math.max(prm.reserve, ph.amount)) return { t: "pay" };
      let want = prm.buyout * 0.5;
      if (completes(s, ph.tile, seat)) want += 0.4;
      if (holdsRegion(s, ph.tile, ph.owner)) want += style === "muuPha" ? 0.5 : 0.25;
      if (s.plots[ph.tile]!.level >= 2) want += 0.15;
      return rng.next() < want ? { t: "buyout" } : { t: "pay" };
    }
    case "pick": {
      if (ph.what === "quake" || ph.what === "storm") {
        // Nhắm nhà tô cao nhất của người giàu nhất.
        const targets = disasterTargets(s, seat, ph.what);
        if (!targets.length) return { t: "skip" };
        const score = (i: number) => assetsOf(s, s.plots[i]!.owner!) * 10 + rentOf(s, i);
        return { t: "pick", tile: targets.reduce((a, b) => (score(b) > score(a) ? b : a)) };
      }
      if (ph.what === "festival") {
        const mine = ownedTiles(s, seat);
        return mine.length ? { t: "pick", tile: mine.reduce((a, b) => (rentOf(s, b) > rentOf(s, a) ? b : a)) } : { t: "skip" };
      }
      const free = freeLands(s);
      const budget = me.cash - (ph.what === "boat" ? BOAT_FARE : 0) - prm.reserve;
      const affordable = free.filter((i) => priceOf(i) <= budget);
      if (!affordable.length) return { t: "skip" };
      const best = affordable.reduce((a, b) => {
        const rival = aliveSeats(s).some((o) => o !== seat && scenicCount(s, o) > 0);
        const score = (i: number) => (winsWith(s, i, seat) ? 5000 : 0) + (blocks(s, i, seat) ? 3000 : 0) + (rival && isScenic(i) ? 2000 : 0) + (completes(s, i, seat) ? 1000 : 0) + priceOf(i);
        const sa = score(a);
        const sb = score(b);
        return sb > sa ? b : a;
      });
      if (ph.what === "boat" && !completes(s, best, seat) && rng.next() < 0.3) return { t: "skip" };
      return { t: "pick", tile: best };
    }
    case "raise": {
      const mine = ownedTiles(s, seat);
      if (!mine.length) return { t: "bankrupt" };
      const loose = mine.filter((i) => !holdsRegion(s, i, seat));
      const pool = loose.length ? loose : mine;
      return { t: "sell", tile: pool.reduce((a, b) => (sellOf(s, b) < sellOf(s, a) ? b : a)) };
    }
  }
}
