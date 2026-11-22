"use client";

// Ván Tam Quân Kỳ do server làm trọng tài (src/server/tamQuanKy.ts), phía trình duyệt: gọi /api/tam-quan-ky, nhớ ván đang chơi
// để tải lại trang vẫn về đúng ván, hỏi lại server mỗi POLL_MS suốt ván online, và đếm lùi đồng hồ giữa hai lần hỏi.

import { useCallback, useEffect, useRef, useState } from "react";
import type { Color, Level, Move } from "@/core/tam-quan-ky";
import type { TqkView } from "@/server/tamQuanKy";
import { PROFILE_GOLD_EVENT } from "../battle/online";
import { readStorage, writeStorage } from "../formation/storage";

export type { TqkView };
export type ServerKind = "reward" | "online";

const SERVER_KEY = "reed-banner:tam-quan-ky:server:v1";
const POLL_MS = 1500;

export const SERVER_ERROR: Readonly<Record<string, string>> = {
  loginRequired: "Cần trình danh để chơi ván có thưởng và đấu người.",
  featureDisabled: "Chế độ này đang tạm đóng.",
  notFound: "Không thấy phòng với mã này, hoặc mã đã hết hạn.",
  ownRoom: "Đây là phòng của bạn. Gửi mã cho người khác để họ vào.",
  started: "Phòng này đã có người vào.",
  notMember: "Bạn không ở trong ván này.",
  conflict: "Có lệnh khác chạy cùng lúc. Xin thử lại.",
  ended: "Ván đã kết thúc.",
  notYourTurn: "Chưa tới lượt bạn.",
  illegal: "Nước đi không hợp lệ. Sa bàn đã cập nhật lại.",
  waiting: "Đang chờ người vào phòng.",
  badRequest: "Lệnh không hợp lệ. Xin tải lại trang rồi thử lại.",
  network: "Chưa liên lạc được máy chủ. Xin thử lại.",
};

type ApiResult = { readonly ok: true; readonly view: TqkView } | { readonly ok: false; readonly error: string };

async function api(body?: Record<string, unknown>, id?: string): Promise<ApiResult> {
  try {
    const res = await fetch(body ? "/api/tam-quan-ky" : `/api/tam-quan-ky?id=${encodeURIComponent(id ?? "")}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    const json = (await res.json()) as { view?: TqkView; error?: string };
    return res.ok && json.view ? { ok: true, view: json.view } : { ok: false, error: json.error ?? "network" };
  } catch {
    return { ok: false, error: "network" };
  }
}

function readSavedId(): { id: string; kind: ServerKind } | null {
  try {
    const v = JSON.parse(readStorage(SERVER_KEY) ?? "null") as { id?: unknown; kind?: unknown } | null;
    return v && typeof v.id === "string" && (v.kind === "reward" || v.kind === "online") ? { id: v.id, kind: v.kind } : null;
  } catch {
    return null;
  }
}

/** Loại ván server đang dở (để màn mở đúng chế độ khi tải lại trang). */
export const savedServerKind = (): ServerKind | null => readSavedId()?.kind ?? null;

export function useServerMatch() {
  const [view, setView] = useState<TqkView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** Lúc nhận `view` (giờ máy), để đếm lùi đồng hồ. */
  const [receivedAt, setReceivedAt] = useState(0);
  /** Giờ máy, cập nhật mỗi 250ms khi đồng hồ chạy. */
  const [clockNow, setClockNow] = useState(0);
  const latest = useRef<TqkView | null>(null);

  const accept = useCallback((r: ApiResult) => {
    if (!r.ok) {
      setError(r.error);
      return false;
    }
    const v = r.view;
    // Bỏ bản cũ về muộn (hai request chồng nhau).
    if (latest.current && latest.current.id === v.id && v.seq < latest.current.seq) return true;
    latest.current = v;
    setView(v);
    setReceivedAt(Date.now());
    setError(null);
    writeStorage(SERVER_KEY, JSON.stringify({ id: v.id, kind: v.mode === "ai" ? "reward" : "online" }));
    if (v.gold !== undefined) window.dispatchEvent(new CustomEvent(PROFILE_GOLD_EVENT, { detail: v.gold }));
    return true;
  }, []);

  // Ván dở từ lần trước.
  useEffect(() => {
    const saved = readSavedId();
    if (!saved) return;
    void api(undefined, saved.id).then((r) => {
      if (r.ok) accept(r);
      else if (r.error === "notFound" || r.error === "notMember") writeStorage(SERVER_KEY, null);
    });
  }, [accept]);

  const live = !!view && view.status !== "ended";
  const myTurn = !!view && view.status === "playing" && !view.result && (view.moves.length % 2 === 0 ? "r" : "b") === view.you;
  // Online: hỏi cả khi tới lượt mình, vì bên kia có thể đầu hàng hay hết giờ bất cứ lúc nào.
  const polling = live && view.mode === "online";

  const viewId = view?.id ?? null;
  useEffect(() => {
    if (!polling || !viewId) return;
    const timer = window.setInterval(() => void api(undefined, viewId).then((r) => r.ok && accept(r)), POLL_MS);
    return () => window.clearInterval(timer);
  }, [polling, viewId, accept]);

  // Đồng hồ chạy giữa hai lần hỏi server; tới 0 thì hỏi lại để server xử hết giờ.
  const ticking = !!view && view.status === "playing" && !view.result && view.clockMs > 0;
  useEffect(() => {
    if (!ticking) return;
    const timer = window.setInterval(() => setClockNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [ticking]);

  const toMove: Color = view && view.moves.length % 2 ? "b" : "r";
  const timeLeft = (c: Color) => {
    if (!view) return 0;
    const base = view.timeLeft[c];
    return ticking && c === toMove ? Math.max(0, base - Math.max(0, clockNow - receivedAt)) : base;
  };
  const expired = ticking && timeLeft(toMove) <= 0;
  useEffect(() => {
    if (!expired || !viewId) return;
    void api(undefined, viewId).then((r) => r.ok && accept(r));
  }, [expired, viewId, accept]);

  const run = useCallback(
    async (body: Record<string, unknown>) => {
      setBusy(true);
      const r = await api(body);
      setBusy(false);
      return accept(r);
    },
    [accept],
  );

  return {
    view,
    error,
    busy,
    myTurn,
    timeLeft,
    clearError: () => setError(null),
    startAi: (level: Level, rival: string, human: Color) => run({ action: "ai", level, rival, human }),
    host: (clock: number, rival: string) => run({ action: "host", clock, rival }),
    join: (code: string) => run({ action: "join", code }),
    move: async (move: Move) => {
      if (!view) return false;
      const ok = await run({ action: "move", id: view.id, move });
      // Lệnh hỏng thì lấy lại ván từ server để sa bàn khớp.
      if (!ok) void api(undefined, view.id).then((r) => r.ok && accept(r));
      return ok;
    },
    resign: () => (view ? run({ action: "resign", id: view.id }) : Promise.resolve(false)),
    leave: () => {
      latest.current = null;
      setView(null);
      setError(null);
      writeStorage(SERVER_KEY, null);
    },
  };
}
