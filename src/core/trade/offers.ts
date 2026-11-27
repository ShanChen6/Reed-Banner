// Giao thương giữa đường (GDD mục 6): hai đoàn đi cùng một chặng, trùng giờ ít nhất 5 phút thì gặp nhau. Một bên ngỏ lời
// (hàng và kim tiền đưa ra bị khóa), bên kia đồng ý hay từ chối khi mở game, không cần cùng online. Mỗi chuyến chỉ giao
// dịch một lần; lời ngỏ tự hủy khi một bên đã tới điểm kế tiếp và xuất hành chặng mới, hoặc khi mùa khép (Shan, 26/11/2026).

import { cargoWeight, currentTradeItemId, isTradeItem, type TradeItemId } from "./goods";
import { edgeKey } from "./map";
import { addCargo, capacityOf, type Cargo, type TradeLeg, type TradePlayer } from "./player";

/** Hai chặng phải trùng giờ ít nhất chừng này mới tính là gặp nhau. */
export const MEET_OVERLAP_MS = 5 * 60_000;
/** Mỗi chặng hiện tối đa chừng này đoàn đã gặp. */
export const MEET_LIMIT = 5;

export interface Bundle {
  readonly items: Cargo;
  readonly money: number;
}

/** Hai chặng có gặp nhau không: cùng cạnh (chiều nào cũng được), trùng giờ đủ lâu. */
export function legsMeet(a: Pick<TradeLeg, "from" | "to" | "departAt" | "arriveAt">, b: Pick<TradeLeg, "from" | "to" | "departAt" | "arriveAt">): boolean {
  if (edgeKey(a.from, a.to) !== edgeKey(b.from, b.to)) return false;
  return Math.min(a.arriveAt, b.arriveAt) - Math.max(a.departAt, b.departAt) >= MEET_OVERLAP_MS;
}

/** Đọc một gói hàng + kim tiền gửi lên; null khi sai dạng. */
export function parseBundle(v: unknown): Bundle | null {
  if (!v || typeof v !== "object") return null;
  const raw = v as { items?: unknown; money?: unknown };
  const money = raw.money ?? 0;
  if (!Number.isInteger(money) || (money as number) < 0 || (money as number) > 10_000_000) return null;
  const items: Partial<Record<TradeItemId, number>> = {};
  if (raw.items !== undefined) {
    if (!raw.items || typeof raw.items !== "object") return null;
    for (const [rawId, n] of Object.entries(raw.items as Record<string, unknown>)) {
      const id = currentTradeItemId(rawId);
      if (!isTradeItem(id) || !Number.isInteger(n) || (n as number) < 0 || (n as number) > 10_000) return null;
      if ((n as number) > 0) items[id] = n as number;
    }
  }
  return { items, money: money as number };
}

export const bundleEmpty = (b: Bundle) => b.money === 0 && Object.keys(b.items).length === 0;

export function hasBundle(p: Pick<TradePlayer, "money" | "cargo">, b: Bundle): boolean {
  if (p.money < b.money) return false;
  return Object.entries(b.items).every(([id, n]) => (p.cargo[id as TradeItemId] ?? 0) >= (n ?? 0));
}

export function takeBundle<P extends Pick<TradePlayer, "money" | "cargo">>(p: P, b: Bundle): P {
  let cargo = p.cargo;
  for (const [id, n] of Object.entries(b.items)) cargo = addCargo(cargo, id as TradeItemId, -(n ?? 0));
  return { ...p, money: p.money - b.money, cargo };
}

export function giveBundle<P extends Pick<TradePlayer, "money" | "cargo">>(p: P, b: Bundle): P {
  let cargo = p.cargo;
  for (const [id, n] of Object.entries(b.items)) cargo = addCargo(cargo, id as TradeItemId, n ?? 0);
  return { ...p, money: p.money + b.money, cargo };
}

/** Sau khi đổi, khoang có vừa không (người nhận đồng ý thì phải vừa; bên ngỏ đã tính lúc ngỏ). */
export function fitsAfter(p: TradePlayer, give: Bundle, get: Bundle): boolean {
  return cargoWeight(giveBundle(takeBundle(p, give), get).cargo) <= capacityOf(p);
}
