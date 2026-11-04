// Gọi API Tầm Tướng Ký từ trình duyệt. Mỗi thao tác kèm `requestId` mới; bấm lại khi mạng chập chờn thì gửi lại
// cùng `requestId` để server không trừ hai lần (src/server/tamTuongKy.ts).

import type { HintLevel, NodeId, TtkResponse } from "@/core/tam-tuong-ky";
import type { TtkView } from "@/server/tamTuongKy";

export type { TtkView };

export type ApiResult =
  | { readonly ok: true; readonly view: TtkView; readonly response: TtkResponse | null }
  | { readonly ok: false; readonly error: string; readonly view: TtkView | null };

export const newRequestId = () => crypto.randomUUID();

async function call(path: string, body?: unknown): Promise<ApiResult> {
  try {
    const res = await fetch(`/api/tam-tuong-ky${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    const json = (await res.json()) as { view?: TtkView | null; response?: TtkResponse | null; error?: string };
    if (res.ok && json.view) return { ok: true, view: json.view, response: json.response ?? null };
    return { ok: false, error: json.error ?? "network", view: json.view ?? null };
  } catch {
    return { ok: false, error: "network", view: null };
  }
}

export const fetchState = () => call("");
export const openSessionApi = (requestId: string) => call("/session", { requestId });
export const combineApi = (requestId: string, first: NodeId, second: NodeId) => call("/combine", { requestId, first, second });
export const hintApi = (requestId: string, level: HintLevel) => call("/hint", { requestId, level });

export const ERROR_TEXT: Readonly<Record<string, string>> = {
  noTicket: "Hết phiếu. Nhận thêm phiếu từ nhiệm vụ ngày, nhiệm vụ tuần “Thắng 15 trận” và điểm danh ngày thứ 7.",
  noSession: "Lượt đã hết hoặc hết hạn. Mở lượt mới để ghép tiếp.",
  noHint: "Hôm nay đã dùng hết gợi ý.",
  loginRequired: "Cần đăng nhập để chơi.",
  featureDisabled: "Chế độ này chưa mở.",
  conflict: "Có thao tác khác cùng lúc, thử lại nhé.",
  badRequest: "Yêu cầu không hợp lệ.",
  network: "Mất kết nối, thử lại nhé.",
};
