"use client";

// Ván Vây Thành Kỳ do server làm trọng tài (src/server/coVay.ts): đấu sứ quân có thưởng và đấu người. Phía trình duyệt: gọi /api/go, nhớ ván đang chơi để
// tải lại trang vẫn về đúng ván, hỏi lại server mỗi POLL_MS và đếm lùi đồng hồ giữa hai lần hỏi. Chép khung từ Tam Quân Kỳ.

import { useCallback, useEffect, useRef, useState } from "react";
import type { Element } from "@/core";
import { BLACK, WHITE, type BoardSize, type Color, type Level, type Mode } from "@/core/co-vay";
import type { GoView } from "@/server/coVay";
import { PROFILE_GOLD_EVENT } from "../battle/online";
import { readStorage, writeStorage } from "../formation/storage";

export type { GoView };
/** Ván do server làm trọng tài: đấu sứ quân có thưởng hoặc đấu người bằng mã phòng. */
export type ServerKind = "reward" | "online";

const ONLINE_KEY = "reed-banner:vay-thanh-ky:online:v1";
const POLL_MS = 1500;

export const SERVER_ERROR: Readonly<Record<string, string>> = {
  loginRequired: "Cần trình danh để chơi ván có thưởng hoặc đấu người.",
  featureDisabled: "Ván trên máy chủ đang tạm đóng.",
  notFound: "Không thấy phòng với mã này, hoặc mã đã hết hạn.",
  ownRoom: "Đây là phòng của bạn. Gửi mã cho người khác để họ vào.",
  started: "Phòng này đã có người vào.",
  notMember: "Bạn không ở trong ván này.",
  conflict: "Có lệnh khác chạy cùng lúc. Xin thử lại.",
  ended: "Ván đã kết thúc.",
  notYourTurn: "Chưa tới lượt bạn.",
  illegal: "Nước đi không hợp lệ. Bàn cờ đã cập nhật lại.",
  waiting: "Đang chờ người vào phòng.",
  badRequest: "Lệnh không hợp lệ. Xin tải lại trang rồi thử lại.",
  network: "Chưa liên lạc được máy chủ. Xin thử lại.",
};

type ApiResult = { readonly ok: true; readonly view: GoView } | { readonly ok: false; readonly error: string };

async function api(body?: Record<string, unknown>, id?: string): Promise<ApiResult> {
  try {
    const res = await fetch(body ? "/api/go" : `/api/go?id=${encodeURIComponent(id ?? "")}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    const json = (await res.json()) as { view?: GoView; error?: string };
    return res.ok && json.view ? { ok: true, view: json.view } : { ok: false, error: json.error ?? "network" };
  } catch {
    return { ok: false, error: "network" };
  }
}

function readSaved(): { id: string; kind: ServerKind } | null {
  try {
    const v = JSON.parse(readStorage(ONLINE_KEY) ?? "null") as { id?: unknown; kind?: unknown } | null;
    return v && typeof v.id === "string" ? { id: v.id, kind: v.kind === "reward" ? "reward" : "online" } : null;
  } catch {
    return null;
  }
}
const readSavedId = (): string | null => readSaved()?.id ?? null;

/** Ván dở trên máy chủ (để màn mở đúng chế độ khi tải lại trang); null khi không có. */
export const savedOnline = (): ServerKind | null => readSaved()?.kind ?? null;

export function useOnlineMatch() {
  const [view, setView] = useState<GoView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [receivedAt, setReceivedAt] = useState(0);
  const [clockNow, setClockNow] = useState(0);
  const latest = useRef<GoView | null>(null);

  const accept = useCallback((r: ApiResult) => {
    if (!r.ok) {
      setError(r.error);
      return false;
    }
    const v = r.view;
    if (latest.current && latest.current.id === v.id && v.seq < latest.current.seq) return true;
    latest.current = v;
    setView(v);
    setReceivedAt(Date.now());
    setError(null);
    writeStorage(ONLINE_KEY, JSON.stringify({ id: v.id, kind: v.ai ? "reward" : "online" }));
    if (v.gold !== undefined) window.dispatchEvent(new CustomEvent(PROFILE_GOLD_EVENT, { detail: v.gold }));
    return true;
  }, []);

  useEffect(() => {
    const id = readSavedId();
    if (!id) return;
    void api(undefined, id).then((r) => {
      if (r.ok) accept(r);
      else if (r.error === "notFound" || r.error === "notMember") writeStorage(ONLINE_KEY, null);
    });
  }, [accept]);

  const live = !!view && view.status !== "ended";
  const toMove: Color = view && view.moves.length % 2 ? WHITE : BLACK;
  const myTurn = !!view && view.status === "playing" && !view.result && toMove === view.you;

  const viewId = view?.id ?? null;
  // Đấu sứ quân: máy đáp ngay trong request, không có đồng hồ nên không cần hỏi lại server.
  const polled = live && !view?.ai;
  useEffect(() => {
    if (!polled || !viewId) return;
    const timer = window.setInterval(() => void api(undefined, viewId).then((r) => r.ok && accept(r)), POLL_MS);
    return () => window.clearInterval(timer);
  }, [polled, viewId, accept]);

  const ticking = !!view && view.status === "playing" && !view.result && view.clockMs > 0;
  useEffect(() => {
    if (!ticking) return;
    const timer = window.setInterval(() => setClockNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [ticking]);

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
    startAi: (opts: { level: Level; rival: string; human: Color; size: BoardSize; mode: Mode; element: Element; rivalElement: Element }) => run({ action: "ai", ...opts }),
    host: (opts: { size: BoardSize; mode: Mode; clock: number; element: Element }) => run({ action: "host", ...opts }),
    join: (code: string, element: Element) => run({ action: "join", code, element }),
    move: async (point: number) => {
      if (!view) return false;
      const ok = await run({ action: "move", id: view.id, point });
      if (!ok) void api(undefined, view.id).then((r) => r.ok && accept(r));
      return ok;
    },
    resign: () => (view ? run({ action: "resign", id: view.id }) : Promise.resolve(false)),
    leave: () => {
      latest.current = null;
      setView(null);
      setError(null);
      writeStorage(ONLINE_KEY, null);
    },
  };
}
