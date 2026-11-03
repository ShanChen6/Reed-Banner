// Gọi API Trận Đồ xếp hạng. Server giữ ván và trả bản công khai (không seed, không RNG); client chỉ vẽ và gửi lệnh.
// Chỉ import kiểu từ @/server (không kéo mã server vào bundle).

import type { PuzzleEvent, PuzzleState } from "@/core/binh-phap";
import type { Claimable, FormationView, LevelOverview } from "@/server/formation";

export type { Claimable, FormationView, LevelOverview };

export interface Overview {
  readonly enabled: boolean;
  /** Đã đăng nhập thì chơi và nhận thưởng được; khách chỉ xem bảng. */
  readonly canPlay: boolean;
  readonly levels: readonly LevelOverview[];
  /** Giờ server (ms) lúc trả lời, để đếm ngược kỳ theo giờ server chứ không theo đồng hồ máy. */
  readonly now?: number;
  /**
   * Tải tổng quan lỗi (mạng hoặc server). Vẫn hiện thẻ Xếp hạng kèm nút thử lại thay vì coi như chế độ tắt: trước
   * đây lỗi 500 làm người đã đăng nhập mất hẳn lựa chọn Xếp hạng/Chơi thường mà không biết vì sao.
   */
  readonly failed?: boolean;
}

async function call<T>(url: string, body?: unknown): Promise<{ ok: true; data: T } | { ok: false; status: number; data: { error?: string; reason?: string; view?: FormationView } }> {
  try {
    const res = await fetch(url, {
      method: body === undefined ? "GET" : "POST",
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    const data = (await res.json()) as never;
    return res.ok ? { ok: true, data } : { ok: false, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "network" } };
  }
}

export async function fetchOverview(): Promise<Overview> {
  const r = await call<Overview>("/api/formation");
  return r.ok ? r.data : { enabled: true, canPlay: false, levels: [], failed: true };
}

export const startRanked = (level: string) => call<{ view: FormationView; resumed: boolean }>("/api/formation/start", { level });

export const moveRanked = (level: string, seq: number, command: unknown) =>
  call<{ view: FormationView; events: readonly PuzzleEvent[] }>("/api/formation/move", { level, seq, command });

export const claimRanked = (level: string, period: string) =>
  call<{ gold: number; tier: string; rank: number; winners: number }>("/api/formation/claim", { level, period });

/** Bản công khai của server thành PuzzleState để dùng lại luật hiển thị (chỉ đọc cells, hand, thanh Bỏ Lệnh). */
export function toPuzzleState(view: FormationView): PuzzleState {
  return { ...view.puzzle, seed: 0, rngState: 0 } as PuzzleState;
}
