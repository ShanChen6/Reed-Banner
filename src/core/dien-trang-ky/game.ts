// Luật Điền Trang Ký: trạng thái ván và các lệnh. Thuần, xác định theo seed (src/core/rng.ts): server làm trọng tài cho
// đấu sứ quân có thưởng và đấu người bằng mã phòng, trình duyệt dùng cùng mã cho ván cùng máy.
// Một lượt: đổ hai xúc xắc → đi → xử ô dừng (mua, xây, nộp tô hoặc mua lại, quẻ, thuế…) → hết lượt. Đổ ra đôi được đổ
// thêm một lần (tối đa một). Thiếu tiền thì bán đất lại cho triều đình nửa giá; bán hết vẫn thiếu thì phá sản, đất về trống.
// Chơi tới khi chỉ còn một người.

import type { Element } from "../battle/elements";
import { createRng } from "../rng";
import {
  BOARD_SIZE,
  BOAT_FARE,
  BUYOUT_RATE,
  FESTIVAL_RATE,
  HOLD3_RATE,
  HOLD_RATE,
  SIDE_LANDS,
  JAIL_BAIL,
  JAIL_TILE,
  JAIL_TRIES,
  MAX_LEVEL,
  MAX_LEVEL_ON_BUY,
  POLL_MIN,
  POLL_RATE,
  REGION_TILES,
  FAIR_COUNT,
  FAIR_RATE,
  RENT_RATE,
  RUIN_MAX,
  RUIN_MIN,
  SALARY,
  SCENIC_RENT,
  SCENIC_TILES,
  SELL_RATE,
  START_CASH,
  TILES,
  TRIBUTE_BASE,
  TRIBUTE_PER_LEVEL,
  buildCost,
  tileValue,
  DTK_COLORS,
  freeColor,
  type DtkColor,
} from "./board";
import { OMENS } from "./omens";

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;
/** Chốt an toàn: quá chừng này lượt (hiếm khi tới) thì ván dừng, xếp hạng theo tài sản. */
export const MAX_TURNS = 1600;
const LOG_KEEP = 60;

export interface Seat {
  readonly name: string;
  /** Hệ của người chơi: kiểu dáng và màu nhà, không đổi luật. */
  readonly element: Element;
  /** Id sứ quân khi máy cầm ghế này; null là người. */
  readonly bot: string | null;
  /** Màu nhà; thiếu hoặc trùng thì tự lấy màu trống. */
  readonly color?: DtkColor;
}

export interface Player extends Seat {
  /** Ván lưu trước khi có màu thì thiếu; dùng `colorOf`. */
  color?: DtkColor;
  cash: number;
  pos: number;
  out: boolean;
  /** Đang ở Lao Ngục: số lần đổ thử còn lại (0 là tự do). */
  jail: number;
  /** Phúc từ quẻ Phúc ấm: lần nộp tô kế tiếp được miễn. */
  blessing: boolean;
}

export interface Plot {
  owner: number | null;
  level: number;
  /** Đang sửa sau thiên tai: còn chừng này lượt của chủ thì không thu tô. */
  ruin?: number;
}

export interface Payee {
  readonly seat: number;
  readonly amount: number;
}

export type Phase =
  | { readonly k: "roll" }
  | { readonly k: "buy"; readonly tile: number }
  | { readonly k: "build"; readonly tile: number }
  | { readonly k: "rent"; readonly tile: number; readonly owner: number; readonly amount: number; readonly buyout: number }
  | { readonly k: "pick"; readonly what: "market" | "boat" | "festival" | "quake" | "storm" }
  | { readonly k: "raise"; readonly amount: number; readonly payees: readonly Payee[] }
  | { readonly k: "ended" };

export type DtkEventBody =
  | { readonly k: "roll"; readonly dice: readonly [number, number] }
  | { readonly k: "move"; readonly from: number; readonly to: number; readonly back?: boolean }
  | { readonly k: "salary"; readonly amount: number }
  | { readonly k: "buy"; readonly tile: number; readonly level: number; readonly cost: number }
  | { readonly k: "build"; readonly tile: number; readonly level: number; readonly cost: number }
  | { readonly k: "rent"; readonly tile: number; readonly owner: number; readonly amount: number }
  | { readonly k: "blessUsed"; readonly tile: number; readonly owner: number }
  | { readonly k: "buyout"; readonly tile: number; readonly from: number; readonly cost: number }
  | { readonly k: "omen"; readonly omen: string }
  | { readonly k: "pay"; readonly amount: number; readonly reason: "poll" | "tribute" | "omen" | "boat" | "each" | "bail" }
  | { readonly k: "gain"; readonly amount: number; readonly reason: "omen" | "each" }
  | { readonly k: "sell"; readonly tile: number; readonly amount: number }
  | { readonly k: "out"; readonly by: number | null; readonly resign?: boolean }
  | { readonly k: "jailed" }
  | { readonly k: "jailStay"; readonly left: number }
  | { readonly k: "freed"; readonly how: "doubles" | "bail" | "served" }
  | { readonly k: "blessing" }
  | { readonly k: "festival"; readonly tile: number }
  | { readonly k: "freeBuild"; readonly tile: number; readonly level: number }
  | { readonly k: "disaster"; readonly how: "quake" | "storm"; readonly tile: number; readonly level: number; readonly ruin: number }
  | { readonly k: "noDisaster" }
  | { readonly k: "monopoly"; readonly how: "side" | "scenic"; readonly side?: number }
  | { readonly k: "extra" }
  | { readonly k: "end"; readonly ranking: readonly number[] };

export type DtkEvent = { readonly n: number; readonly seat: number } & DtkEventBody;

export interface DtkState {
  readonly v: 1;
  players: Player[];
  /** Theo ô; null với ô không phải đất. */
  plots: (Plot | null)[];
  /** Ghế đang đi (cũng là ghế phải ra lệnh). */
  turn: number;
  phase: Phase;
  rng: number;
  /** Thứ tự quẻ đã xếp, rút vòng từ `deckAt`. */
  deck: number[];
  deckAt: number;
  /** Ô đang mở Hội Cờ Lau. */
  festival: number | null;
  /** Ba ô có lễ hội nhỏ suốt ván, chọn ngẫu nhiên đầu ván. Ván lưu trước khi có luật này thì không có. */
  fairs?: number[];
  dice: [number, number] | null;
  /** Lần đổ này ra đôi (được đổ thêm nếu chưa dùng). */
  doubles: boolean;
  extraUsed: boolean;
  /** Số lượt đã qua (mọi người cộng lại). */
  turns: number;
  /** Thứ tự bị loại, sớm trước. */
  outOrder: number[];
  /** Xếp hạng khi xong ván (hạng nhất trước). */
  ranking: number[] | null;
  log: DtkEvent[];
  evSeq: number;
}

export type DtkAction =
  | { readonly t: "roll" }
  | { readonly t: "buy"; readonly level: number }
  | { readonly t: "build"; readonly level: number }
  | { readonly t: "pay" }
  | { readonly t: "buyout" }
  | { readonly t: "pick"; readonly tile: number }
  | { readonly t: "bail" }
  | { readonly t: "sell"; readonly tile: number }
  | { readonly t: "skip" }
  | { readonly t: "bankrupt" };

export type DtkError = "ended" | "notYourTurn" | "illegal";
export type DtkResult = { readonly ok: true; readonly state: DtkState } | { readonly ok: false; readonly error: DtkError };

const clone = (s: DtkState): DtkState => JSON.parse(JSON.stringify(s)) as DtkState;

function emit(d: DtkState, seat: number, e: DtkEventBody): void {
  d.evSeq += 1;
  d.log.push({ ...e, n: d.evSeq, seat } as DtkEvent);
  if (d.log.length > LOG_KEEP) d.log.splice(0, d.log.length - LOG_KEEP);
}

function draw(d: DtkState, max: number): number {
  const rng = createRng(d.rng);
  const v = rng.int(1, max);
  d.rng = rng.state();
  return v;
}

/** Màu cho từng ghế: giữ màu đã chọn nếu chưa ai lấy trước, ghế còn lại lấy màu trống theo thứ tự. */
function seatColors(seats: readonly Seat[]): DtkColor[] {
  const out: DtkColor[] = [];
  for (const s of seats) out.push(s.color && !out.includes(s.color) ? s.color : (undefined as unknown as DtkColor));
  for (let i = 0; i < out.length; i++) if (!out[i]) out[i] = freeColor(out);
  return out;
}

/** Màu nhà của một ghế (ván cũ chưa lưu màu thì theo thứ tự ghế). */
export const colorOf = (s: DtkState, seat: number): DtkColor => s.players[seat]?.color ?? DTK_COLORS[seat % DTK_COLORS.length]!.id;

export function newDtk(opts: { seats: readonly Seat[]; seed: number }): DtkState {
  if (opts.seats.length < MIN_PLAYERS || opts.seats.length > MAX_PLAYERS) throw new RangeError("Điền Trang Ký cần 2 đến 4 người.");
  const rng = createRng(opts.seed >>> 0 || 1);
  const deck = OMENS.map((_, i) => i);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  const lands = TILES.flatMap((t, i) => (t.kind === "land" ? [i] : []));
  const fairs: number[] = [];
  while (fairs.length < FAIR_COUNT) {
    const i = lands[rng.int(0, lands.length - 1)]!;
    if (!fairs.includes(i)) fairs.push(i);
  }
  fairs.sort((a, b) => a - b);
  return {
    v: 1,
    players: seatColors(opts.seats).map((color, i) => {
      const s = opts.seats[i]!;
      return { name: s.name, element: s.element, bot: s.bot, color, cash: START_CASH, pos: 0, out: false, jail: 0, blessing: false };
    }),
    plots: TILES.map((t) => (t.kind === "land" || t.kind === "scenic" ? { owner: null, level: 0 } : null)),
    turn: 0,
    phase: { k: "roll" },
    rng: rng.state(),
    deck,
    deckAt: 0,
    festival: null,
    fairs,
    dice: null,
    doubles: false,
    extraUsed: false,
    turns: 0,
    outOrder: [],
    ranking: null,
    log: [],
    evSeq: 0,
  };
}

// ---------- tra cứu ----------

export const priceOf = (tile: number): number => {
  const t = TILES[tile];
  return t?.kind === "land" || t?.kind === "scenic" ? t.price : 0;
};

export const isScenic = (tile: number): boolean => TILES[tile]?.kind === "scenic";

/** Số danh thắng của một chủ. */
export const scenicCount = (s: DtkState, owner: number): number => SCENIC_TILES.filter((i) => s.plots[i]?.owner === owner).length;

/** Giữ đủ mọi ô của vùng chứa ô này. */
export function holdsRegion(s: DtkState, tile: number, owner: number): boolean {
  const t = TILES[tile];
  if (t?.kind !== "land") return false;
  return REGION_TILES[t.region]!.every((i) => s.plots[i]?.owner === owner);
}

/** Hệ số tô theo dãy: chỉ khi giữ đủ dãy; dãy đôi nhân 1,5, dãy ba nhân 2. */
export function groupRate(s: DtkState, tile: number, owner: number): number {
  const t = TILES[tile];
  if (t?.kind !== "land") return 1;
  const group = REGION_TILES[t.region]!;
  if (!group.every((i) => s.plots[i]?.owner === owner)) return 1;
  return group.length >= 3 ? HOLD3_RATE : HOLD_RATE;
}

export function rentOf(s: DtkState, tile: number): number {
  const plot = s.plots[tile];
  if (!plot || plot.owner === null) return 0;
  if ((plot.ruin ?? 0) > 0) return 0;
  let r = isScenic(tile) ? SCENIC_RENT[scenicCount(s, plot.owner)]! : tileValue(priceOf(tile), plot.level) * RENT_RATE[plot.level]!;
  r *= groupRate(s, tile, plot.owner);
  if (s.fairs?.includes(tile)) r *= FAIR_RATE;
  if (s.festival === tile) r *= FESTIVAL_RATE;
  return Math.round(r);
}

export const valueOf = (s: DtkState, tile: number): number => {
  const plot = s.plots[tile];
  return plot && plot.owner !== null ? tileValue(priceOf(tile), plot.level) : 0;
};

export const buyoutOf = (s: DtkState, tile: number): number => Math.round(valueOf(s, tile) * BUYOUT_RATE);
export const sellOf = (s: DtkState, tile: number): number => Math.floor(valueOf(s, tile) * SELL_RATE);

/** Tiền để đưa ô từ bậc `from` lên bậc `to` (không tính giá đất). */
export function buildCostBetween(tile: number, from: number, to: number): number {
  let c = 0;
  for (let l = from + 1; l <= to; l++) c += buildCost(priceOf(tile), l);
  return c;
}

/** Bậc cao nhất được xây tới trên ô của mình: 4, hoặc 5 khi hùng cứ. */
export const levelCap = (s: DtkState, tile: number, owner: number): number => (isScenic(tile) ? 0 : holdsRegion(s, tile, owner) ? MAX_LEVEL : MAX_LEVEL - 1);

export const ownedTiles = (s: DtkState, seat: number): number[] => s.plots.flatMap((p, i) => (p?.owner === seat ? [i] : []));

export const totalLevels = (s: DtkState, seat: number): number => ownedTiles(s, seat).reduce((n, i) => n + s.plots[i]!.level, 0);

export const assetsOf = (s: DtkState, seat: number): number => s.players[seat]!.cash + ownedTiles(s, seat).reduce((n, i) => n + valueOf(s, i), 0);

const sellableOf = (s: DtkState, seat: number): number => ownedTiles(s, seat).reduce((n, i) => n + sellOf(s, i), 0);

export const aliveSeats = (s: DtkState): number[] => s.players.flatMap((p, i) => (p.out ? [] : [i]));

export const freeLands = (s: DtkState): number[] => s.plots.flatMap((p, i) => (p && p.owner === null ? [i] : []));

// ---------- diễn biến ----------

/** Thắng ngay: giữ hết đất một cạnh bàn, hoặc đủ bốn danh thắng. */
export function monopolyOf(s: DtkState, seat: number): { how: "side" | "scenic"; side?: number } | null {
  if (SCENIC_TILES.every((i) => s.plots[i]?.owner === seat)) return { how: "scenic" };
  const side = SIDE_LANDS.findIndex((g) => g.every((i) => s.plots[i]?.owner === seat));
  return side >= 0 ? { how: "side", side } : null;
}

/** Nhà người khác bị thiên tai được: có nhà (bậc 1..4), không phải Trang ấp; bão lũ bỏ qua nhà đang sửa. */
export function disasterTargets(s: DtkState, seat: number, kind: "quake" | "storm"): number[] {
  return s.plots.flatMap((pl, i) =>
    pl && pl.owner !== null && pl.owner !== seat && !isScenic(i) && pl.level > 0 && pl.level < MAX_LEVEL && (kind === "quake" || (pl.ruin ?? 0) === 0) ? [i] : [],
  );
}

/** Sau khi ghế `seat` có thêm đất: thắng ngay thì xong ván, trả true. */
function checkMonopoly(d: DtkState, seat: number): boolean {
  const m = monopolyOf(d, seat);
  if (!m) return false;
  emit(d, seat, { k: "monopoly", ...m });
  finish(d, seat);
  return true;
}

function finish(d: DtkState, winner: number | null = null): void {
  const alive = aliveSeats(d).sort((a, b) => (b === winner ? 1 : 0) - (a === winner ? 1 : 0) || assetsOf(d, b) - assetsOf(d, a) || a - b);
  d.ranking = [...alive, ...[...d.outOrder].reverse()];
  d.phase = { k: "ended" };
  emit(d, alive[0] ?? 0, { k: "end", ranking: d.ranking });
}

function advance(d: DtkState): void {
  d.doubles = false;
  d.extraUsed = false;
  for (let guard = 0; guard < MAX_PLAYERS * 2; guard++) {
    d.turn = (d.turn + 1) % d.players.length;
    const p = d.players[d.turn]!;
    if (p.out) continue;
    d.turns += 1;
    // Nhà đang sửa của người vừa tới lượt bớt một lượt.
    for (const plot of d.plots) if (plot && plot.owner === d.turn && (plot.ruin ?? 0) > 0) plot.ruin = plot.ruin! - 1;
    break;
  }
  d.phase = { k: "roll" };
  if (d.turns >= MAX_TURNS) finish(d);
}

function endTurn(d: DtkState): void {
  if (d.phase.k === "ended") return;
  const p = d.players[d.turn]!;
  if (aliveSeats(d).length <= 1) return finish(d);
  if (!p.out && d.doubles && !d.extraUsed && p.jail === 0) {
    d.extraUsed = true;
    d.doubles = false;
    d.phase = { k: "roll" };
    emit(d, d.turn, { k: "extra" });
    return;
  }
  advance(d);
}

function bankrupt(d: DtkState, seat: number, creditor: number | null, resign = false): void {
  const p = d.players[seat]!;
  if (p.out) return;
  if (creditor !== null && p.cash > 0) d.players[creditor]!.cash += p.cash;
  p.cash = 0;
  for (const i of ownedTiles(d, seat)) {
    d.plots[i] = { owner: null, level: 0 };
    if (d.festival === i) d.festival = null;
  }
  p.out = true;
  p.jail = 0;
  p.blessing = false;
  d.outOrder.push(seat);
  emit(d, seat, { k: "out", by: creditor, ...(resign ? { resign: true } : {}) });
  if (aliveSeats(d).length <= 1) return finish(d);
  if (d.turn === seat) return advance(d);
  // Người rời ván lúc người khác đang đi: bỏ khoản phải trả cho người đó.
  const ph = d.phase;
  if (ph.k === "rent" && ph.owner === seat) return endTurn(d);
  if (ph.k === "raise" && ph.payees.some((x) => x.seat === seat)) {
    const payees = ph.payees.filter((x) => x.seat !== seat);
    const amount = payees.reduce((n, x) => n + x.amount, 0);
    if (amount <= 0) return endTurn(d);
    charge(d, d.turn, amount, payees);
  }
}

function settle(d: DtkState, seat: number, payees: readonly Payee[]): void {
  for (const pay of payees) d.players[pay.seat]!.cash += pay.amount;
  const total = payees.reduce((n, x) => n + x.amount, 0);
  d.players[seat]!.cash -= total;
}

/** Thu một khoản của người đang đi; đủ tiền thì trả rồi hết lượt, thiếu thì vào bước bán đất hoặc phá sản. */
function charge(d: DtkState, seat: number, amount: number, payees: readonly Payee[]): void {
  const p = d.players[seat]!;
  if (amount <= 0) return endTurn(d);
  if (p.cash >= amount) {
    if (payees.length) settle(d, seat, payees);
    else p.cash -= amount;
    return endTurn(d);
  }
  if (p.cash + sellableOf(d, seat) < amount) return bankrupt(d, seat, payees[0]?.seat ?? null);
  d.phase = { k: "raise", amount, payees };
}

function moveTo(d: DtkState, seat: number, to: number, forward: boolean): void {
  const p = d.players[seat]!;
  const from = p.pos;
  if (forward && (to < from || (to === 0 && from !== 0))) {
    p.cash += SALARY;
    emit(d, seat, { k: "salary", amount: SALARY });
  }
  p.pos = to;
  emit(d, seat, { k: "move", from, to, ...(forward ? {} : { back: true }) });
}

function land(d: DtkState, seat: number): void {
  const p = d.players[seat]!;
  const tile = TILES[p.pos]!;
  switch (tile.kind) {
    case "scenic":
    case "land": {
      const plot = d.plots[p.pos]!;
      if (plot.owner === null) {
        if (p.cash >= tile.price) d.phase = { k: "buy", tile: p.pos };
        else endTurn(d);
        return;
      }
      if (plot.owner === seat) {
        const cap = levelCap(d, p.pos, seat);
        if (plot.level < cap && p.cash >= buildCostBetween(p.pos, plot.level, plot.level + 1)) d.phase = { k: "build", tile: p.pos };
        else endTurn(d);
        return;
      }
      const amount = rentOf(d, p.pos);
      // Nhà đang sửa sau thiên tai không thu tô: không tốn phúc, chỉ còn quyền mua lại.
      if (p.blessing && amount > 0) {
        p.blessing = false;
        emit(d, seat, { k: "blessUsed", tile: p.pos, owner: plot.owner });
        return endTurn(d);
      }
      const buyout = buyoutOf(d, p.pos);
      // Trang ấp và danh thắng đã có chủ không mua lại được (Shan chốt 27/11).
      if (plot.level < MAX_LEVEL && !isScenic(p.pos) && p.cash >= buyout) {
        d.phase = { k: "rent", tile: p.pos, owner: plot.owner, amount, buyout };
        return;
      }
      if (amount === 0) return endTurn(d);
      emit(d, seat, { k: "rent", tile: p.pos, owner: plot.owner, amount });
      return charge(d, seat, amount, [{ seat: plot.owner, amount }]);
    }
    case "start":
      return endTurn(d);
    case "boat":
      if (p.cash >= BOAT_FARE) d.phase = { k: "pick", what: "boat" };
      else endTurn(d);
      return;
    case "festival":
      if (ownedTiles(d, seat).length) d.phase = { k: "pick", what: "festival" };
      else endTurn(d);
      return;
    case "jail":
      return jail(d, seat);
    case "omen":
      return drawOmen(d, seat);
    case "poll": {
      const amount = Math.max(POLL_MIN, Math.round(p.cash * POLL_RATE));
      emit(d, seat, { k: "pay", amount, reason: "poll" });
      return charge(d, seat, amount, []);
    }
    case "tribute": {
      const amount = TRIBUTE_BASE + TRIBUTE_PER_LEVEL * totalLevels(d, seat);
      emit(d, seat, { k: "pay", amount, reason: "tribute" });
      return charge(d, seat, amount, []);
    }
    case "market": {
      const free = freeLands(d);
      if (free.some((i) => priceOf(i) <= p.cash)) d.phase = { k: "pick", what: "market" };
      else endTurn(d);
      return;
    }
  }
}

/** Vào Lao Ngục: giam tại chỗ, hết lượt, không được đổ thêm dù vừa ra đôi. */
function jail(d: DtkState, seat: number): void {
  const p = d.players[seat]!;
  if (p.pos !== JAIL_TILE) moveTo(d, seat, JAIL_TILE, false);
  p.jail = JAIL_TRIES;
  d.doubles = false;
  emit(d, seat, { k: "jailed" });
  endTurn(d);
}

function drawOmen(d: DtkState, seat: number): void {
  const omen = OMENS[d.deck[d.deckAt % d.deck.length]!]!;
  d.deckAt = (d.deckAt + 1) % d.deck.length;
  emit(d, seat, { k: "omen", omen: omen.id });
  const p = d.players[seat]!;
  const e = omen.effect;
  switch (e.k) {
    case "gain":
      p.cash += e.amount;
      emit(d, seat, { k: "gain", amount: e.amount, reason: "omen" });
      return endTurn(d);
    case "lose":
      emit(d, seat, { k: "pay", amount: e.amount, reason: "omen" });
      return charge(d, seat, e.amount, []);
    case "loseRate": {
      const amount = Math.round(p.cash * e.rate);
      emit(d, seat, { k: "pay", amount, reason: "omen" });
      return charge(d, seat, amount, []);
    }
    case "repair": {
      const amount = e.perLevel * totalLevels(d, seat);
      if (amount > 0) emit(d, seat, { k: "pay", amount, reason: "omen" });
      return charge(d, seat, amount, []);
    }
    case "payEach": {
      const payees = aliveSeats(d).filter((i) => i !== seat).map((i) => ({ seat: i, amount: e.amount }));
      const amount = payees.reduce((n, x) => n + x.amount, 0);
      emit(d, seat, { k: "pay", amount, reason: "each" });
      return charge(d, seat, amount, payees);
    }
    case "collectEach": {
      let got = 0;
      for (const i of aliveSeats(d)) {
        if (i === seat) continue;
        const take = Math.min(e.amount, d.players[i]!.cash);
        d.players[i]!.cash -= take;
        got += take;
      }
      p.cash += got;
      emit(d, seat, { k: "gain", amount: got, reason: "each" });
      return endTurn(d);
    }
    case "goto":
      moveTo(d, seat, e.tile, true);
      return land(d, seat);
    case "step": {
      const to = (p.pos + e.by + BOARD_SIZE) % BOARD_SIZE;
      moveTo(d, seat, to, e.by > 0);
      return land(d, seat);
    }
    case "nearestFree": {
      for (let k = 1; k < BOARD_SIZE; k++) {
        const i = (p.pos + k) % BOARD_SIZE;
        if (d.plots[i] && d.plots[i]!.owner === null) {
          moveTo(d, seat, i, true);
          return land(d, seat);
        }
      }
      return endTurn(d);
    }
    case "blessing":
      p.blessing = true;
      emit(d, seat, { k: "blessing" });
      return endTurn(d);
    case "jail":
      return jail(d, seat);
    case "disaster":
      if (!disasterTargets(d, seat, e.kind).length) {
        emit(d, seat, { k: "noDisaster" });
        return endTurn(d);
      }
      d.phase = { k: "pick", what: e.kind };
      return;
    case "freeBuild": {
      const mine = ownedTiles(d, seat).filter((i) => !isScenic(i) && d.plots[i]!.level < MAX_LEVEL - 1);
      if (mine.length) {
        const i = mine.reduce((a, b) => (d.plots[b]!.level < d.plots[a]!.level ? b : a));
        d.plots[i]!.level += 1;
        emit(d, seat, { k: "freeBuild", tile: i, level: d.plots[i]!.level });
      }
      return endTurn(d);
    }
  }
}

function roll(d: DtkState, seat: number): void {
  const a = draw(d, 6);
  const b = draw(d, 6);
  d.dice = [a, b];
  d.doubles = a === b && !d.extraUsed;
  emit(d, seat, { k: "roll", dice: [a, b] });
  const p = d.players[seat]!;
  if (p.jail > 0) {
    // Ở Lao Ngục: ra đôi thì ra và đi theo số vừa đổ (không đổ thêm); hết lần thử thì cũng ra và đi.
    d.doubles = false;
    if (a !== b) {
      p.jail -= 1;
      if (p.jail > 0) {
        emit(d, seat, { k: "jailStay", left: p.jail });
        return endTurn(d);
      }
      emit(d, seat, { k: "freed", how: "served" });
    } else {
      p.jail = 0;
      emit(d, seat, { k: "freed", how: "doubles" });
    }
  }
  moveTo(d, seat, (p.pos + a + b) % BOARD_SIZE, true);
  land(d, seat);
}

/** Một lệnh của ghế `seat`. Trả trạng thái mới; trạng thái cũ không đổi. */
export function act(s: DtkState, seat: number, a: DtkAction): DtkResult {
  if (s.phase.k === "ended") return { ok: false, error: "ended" };
  if (seat !== s.turn) return { ok: false, error: "notYourTurn" };
  const d = clone(s);
  const p = d.players[seat]!;
  const ph = d.phase;
  const bad: DtkResult = { ok: false, error: "illegal" };
  if (a.t === "bankrupt") {
    if (ph.k !== "raise") return bad;
    bankrupt(d, seat, ph.payees[0]?.seat ?? null);
    return { ok: true, state: d };
  }
  switch (ph.k) {
    case "roll":
      if (a.t === "bail") {
        if (p.jail === 0 || p.cash < JAIL_BAIL) return bad;
        p.cash -= JAIL_BAIL;
        p.jail = 0;
        emit(d, seat, { k: "pay", amount: JAIL_BAIL, reason: "bail" });
        emit(d, seat, { k: "freed", how: "bail" });
        break;
      }
      if (a.t !== "roll") return bad;
      roll(d, seat);
      break;
    case "buy": {
      if (a.t === "skip") {
        endTurn(d);
        break;
      }
      if (a.t !== "buy" || !Number.isInteger(a.level) || a.level < 0 || a.level > (isScenic(ph.tile) ? 0 : MAX_LEVEL_ON_BUY)) return bad;
      const cost = priceOf(ph.tile) + buildCostBetween(ph.tile, 0, a.level);
      if (p.cash < cost) return bad;
      p.cash -= cost;
      d.plots[ph.tile] = { owner: seat, level: a.level };
      emit(d, seat, { k: "buy", tile: ph.tile, level: a.level, cost });
      if (!checkMonopoly(d, seat)) endTurn(d);
      break;
    }
    case "build": {
      if (a.t === "skip") {
        endTurn(d);
        break;
      }
      const plot = d.plots[ph.tile]!;
      if (a.t !== "build" || !Number.isInteger(a.level) || a.level <= plot.level || a.level > levelCap(d, ph.tile, seat)) return bad;
      const cost = buildCostBetween(ph.tile, plot.level, a.level);
      if (p.cash < cost) return bad;
      p.cash -= cost;
      plot.level = a.level;
      emit(d, seat, { k: "build", tile: ph.tile, level: a.level, cost });
      endTurn(d);
      break;
    }
    case "rent": {
      if (a.t === "pay") {
        if (ph.amount === 0) {
          endTurn(d);
          break;
        }
        emit(d, seat, { k: "rent", tile: ph.tile, owner: ph.owner, amount: ph.amount });
        charge(d, seat, ph.amount, [{ seat: ph.owner, amount: ph.amount }]);
        break;
      }
      if (a.t !== "buyout" || p.cash < ph.buyout) return bad;
      settle(d, seat, [{ seat: ph.owner, amount: ph.buyout }]);
      d.plots[ph.tile]!.owner = seat;
      if (d.festival === ph.tile) d.festival = null;
      emit(d, seat, { k: "buyout", tile: ph.tile, from: ph.owner, cost: ph.buyout });
      if (checkMonopoly(d, seat)) break;
      const plot = d.plots[ph.tile]!;
      if (plot.level < levelCap(d, ph.tile, seat) && p.cash >= buildCostBetween(ph.tile, plot.level, plot.level + 1)) d.phase = { k: "build", tile: ph.tile };
      else endTurn(d);
      break;
    }
    case "pick": {
      if (a.t === "skip") {
        endTurn(d);
        break;
      }
      if (a.t !== "pick" || !Number.isInteger(a.tile) || a.tile < 0 || a.tile >= BOARD_SIZE) return bad;
      if (ph.what === "market") {
        const plot = d.plots[a.tile];
        if (!plot || plot.owner !== null || p.cash < priceOf(a.tile)) return bad;
        p.cash -= priceOf(a.tile);
        d.plots[a.tile] = { owner: seat, level: 0 };
        emit(d, seat, { k: "buy", tile: a.tile, level: 0, cost: priceOf(a.tile) });
        if (!checkMonopoly(d, seat)) endTurn(d);
      } else if (ph.what === "quake" || ph.what === "storm") {
        if (!disasterTargets(d, seat, ph.what).includes(a.tile)) return bad;
        const plot = d.plots[a.tile]!;
        if (ph.what === "quake") plot.level -= 1;
        else plot.ruin = RUIN_MIN + draw(d, RUIN_MAX - RUIN_MIN + 1) - 1;
        emit(d, seat, { k: "disaster", how: ph.what, tile: a.tile, level: plot.level, ruin: plot.ruin ?? 0 });
        endTurn(d);
      } else if (ph.what === "festival") {
        if (d.plots[a.tile]?.owner !== seat) return bad;
        d.festival = a.tile;
        emit(d, seat, { k: "festival", tile: a.tile });
        endTurn(d);
      } else {
        if (a.tile === p.pos || p.cash < BOAT_FARE || TILES[a.tile]!.kind === "boat") return bad;
        p.cash -= BOAT_FARE;
        emit(d, seat, { k: "pay", amount: BOAT_FARE, reason: "boat" });
        moveTo(d, seat, a.tile, true);
        land(d, seat);
      }
      break;
    }
    case "raise": {
      if (a.t !== "sell" || d.plots[a.tile]?.owner !== seat) return bad;
      const got = sellOf(d, a.tile);
      p.cash += got;
      d.plots[a.tile] = { owner: null, level: 0 };
      if (d.festival === a.tile) d.festival = null;
      emit(d, seat, { k: "sell", tile: a.tile, amount: got });
      if (p.cash >= ph.amount) charge(d, seat, ph.amount, ph.payees);
      break;
    }
  }
  return { ok: true, state: d };
}

/** Xin thua (rời ván) bất cứ lúc nào: như phá sản, đất về trống. */
export function resign(s: DtkState, seat: number): DtkResult {
  if (s.phase.k === "ended") return { ok: false, error: "ended" };
  if (!s.players[seat] || s.players[seat]!.out) return { ok: false, error: "illegal" };
  const d = clone(s);
  bankrupt(d, seat, null, true);
  return { ok: true, state: d };
}

/** Dừng ván ngay, xếp hạng người còn lại theo tài sản (khi không còn người thật nào trong ván). */
export function concludeByAssets(s: DtkState): DtkState {
  if (s.phase.k === "ended") return s;
  const d = clone(s);
  finish(d);
  return d;
}
