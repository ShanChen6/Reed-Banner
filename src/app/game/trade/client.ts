// Gọi /api/trade và lời báo lỗi của Hành Thương Ký.

import type { TradeServiceError, TradeView } from "@/server/trade";

export type TradeReply<T extends object = object> = ({ ok: true; view: TradeView } & T) | { ok: false; error: string };

export async function fetchTrade(): Promise<TradeReply> {
  try {
    const res = await fetch("/api/trade", { cache: "no-store" });
    const body = (await res.json()) as { view?: TradeView; error?: string };
    return body.view ? { ok: true, view: body.view } : { ok: false, error: body.error ?? "network" };
  } catch {
    return { ok: false, error: "network" };
  }
}

export async function postTrade<T extends object = object>(action: string, payload: Record<string, unknown> = {}): Promise<TradeReply<T>> {
  try {
    const res = await fetch("/api/trade", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, ...payload }) });
    const body = (await res.json()) as { view?: TradeView; error?: string } & T;
    return body.view ? ({ ...body, ok: true, view: body.view } as TradeReply<T>) : { ok: false, error: body.error ?? "network" };
  } catch {
    return { ok: false, error: "network" };
  }
}

const ERROR_TEXT: Partial<Record<TradeServiceError | "network" | "featureDisabled" | "loginRequired", string>> = {
  traveling: "Đoàn hàng đang trên đường, tới nơi mới làm được.",
  encounterPending: "Đang gặp nạn, xử lý xong mới làm việc khác được.",
  noRoute: "Không có đường đi thẳng tới đó.",
  noPasses: "Hôm nay hết lộ phiếu. Mai lại có 5 lộ phiếu mới.",
  overCapacity: "Khoang hàng không đủ chỗ.",
  badAmount: "Số lượng không hợp lệ.",
  noStock: "Chợ không còn đủ hàng.",
  noMoney: "Không đủ kim tiền.",
  noCargo: "Trong khoang không đủ hàng đó.",
  marketFull: "Chợ đã ứ món này, chờ khung giá sau.",
  maxLevel: "Đoàn hàng đã ở cấp cao nhất.",
  noEncounter: "Nạn này đã xong.",
  badActions: "Trận không hợp lệ, xin đánh lại.",
  conflict: "Có người vừa đổi kho cùng lúc. Xin thử lại.",
  noMeeting: "Hai đoàn không còn gặp nhau trên chặng này.",
  alreadyTraded: "Chuyến này đã giao thương một lần rồi.",
  offerGone: "Lời ngỏ không còn hiệu lực.",
  notYours: "Lời ngỏ này không phải của bạn.",
  network: "Mất kết nối. Xin thử lại.",
  featureDisabled: "Hành Thương Ký chưa khai mở.",
  loginRequired: "Cần trình danh để chơi.",
};

export const tradeErrorText = (e: string) => ERROR_TEXT[e as keyof typeof ERROR_TEXT] ?? "Chưa làm được. Xin thử lại.";

export const money = (n: number) => n.toLocaleString("vi-VN");
