// Gọi API trận online (/api/battles). Server có thẩm quyền: client chỉ gửi ý định và hiển thị kết quả.

import type { BattleAction, BattleEvent, BattleState, Difficulty, Element, MatchView, Profession } from "@/core";

export interface OnlineResponse {
  readonly id?: string;
  readonly view?: MatchView;
  readonly events?: readonly BattleEvent[];
  readonly error?: string;
  /** Giờ server lúc trả lời (ms). */
  readonly now: number;
}

/** Trận online đang chơi dở, để tải lại trang vẫn tiếp tục được. */
export const ONLINE_BATTLE_KEY = "coLau.online.battle";

/**
 * View của server không có luồng ngẫu nhiên; gán 0 để dùng chung giao diện với bản offline. Client chỉ
 * dùng trạng thái này để hiển thị và kiểm tra trước nước đi, không bao giờ để sinh ô thật.
 */
export function toBattleState(view: MatchView): BattleState {
  return { ...view.battle, boardRng: 0, aiRng: 0 } as BattleState;
}

async function call(url: string, init?: RequestInit): Promise<OnlineResponse> {
  try {
    const res = await fetch(url, { ...init, headers: { "content-type": "application/json" }, cache: "no-store" });
    return (await res.json()) as OnlineResponse;
  } catch {
    return { error: "network", now: Date.now() };
  }
}

export function createOnline(input: {
  mode: "1v1" | "3v3";
  element: Element;
  profession: Profession;
  companions: readonly string[];
  difficulty: Difficulty;
}): Promise<OnlineResponse> {
  return call("/api/battles", { method: "POST", body: JSON.stringify(input) });
}

export function fetchOnline(id: string): Promise<OnlineResponse> {
  return call(`/api/battles/${encodeURIComponent(id)}`);
}

export function actOnline(id: string, seq: number, action: BattleAction): Promise<OnlineResponse> {
  return call(`/api/battles/${encodeURIComponent(id)}/actions`, { method: "POST", body: JSON.stringify({ seq, action }) });
}

export const ONLINE_ERROR_TEXT: Record<string, string> = {
  network: "Mất kết nối tới server, thử lại",
  notFound: "Không tìm thấy trận",
  conflict: "Trận vừa được cập nhật ở nơi khác, đã tải lại",
  staleSeq: "Bàn cờ đã đổi (hết giờ?), đã tải lại",
  badRequest: "Yêu cầu không hợp lệ",
};
