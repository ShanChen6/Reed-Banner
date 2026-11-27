"use client";

// Ván Điền Trang Ký trên máy chủ (src/server/dienTrangKy.ts): gọi /api/tycoon, nhớ ván đang chơi để tải lại trang vẫn về
// đúng ván, phòng mã thì hỏi lại server mỗi POLL_MS và đếm lùi giờ quyết định giữa hai lần hỏi.

import { useCallback, useEffect, useRef, useState } from "react";
import type { Element } from "@/core";
import type { DtkAction } from "@/core/dien-trang-ky";
import type { DtkView } from "@/server/dienTrangKy";
import { PROFILE_GOLD_EVENT } from "../battle/online";
import { readStorage, writeStorage } from "../formation/storage";

export type { DtkView };

const SAVE_KEY = "reed-banner:dien-trang-ky:server:v1";
const POLL_MS = 1500;

export const SERVER_ERROR: Readonly<Record<string, string>> = {
  loginRequired: "Cần trình danh để đấu sứ quân có thưởng hoặc vào phòng mã.",
  featureDisabled: "Ván trên máy chủ đang tạm đóng.",
  notFound: "Không thấy phòng với mã này, hoặc mã đã hết hạn.",
  notMember: "Bạn không ở trong ván này.",
  notHost: "Chỉ chủ phòng làm được việc này.",
  full: "Phòng đã đủ bốn ghế.",
  started: "Phòng đã khai cuộc.",
  conflict: "Có lệnh khác chạy cùng lúc. Xin thử lại.",
  ended: "Ván đã kết thúc.",
  notYourTurn: "Chưa tới lượt bạn.",
  illegal: "Lệnh không hợp lệ. Bàn đã cập nhật lại.",
  waiting: "Phòng cần ít nhất hai ghế mới khai cuộc được.",
  badRequest: "Lệnh không hợp lệ. Xin tải lại trang rồi thử lại.",
  network: "Chưa liên lạc được máy chủ. Xin thử lại.",
};

type ApiResult = { readonly ok: true; readonly view: DtkView } | { readonly ok: false; readonly error: string };

async function api(body?: Record<string, unknown>, id?: string): Promise<ApiResult> {
  try {
    const res = await fetch(body ? "/api/tycoon" : `/api/tycoon?id=${encodeURIComponent(id ?? "")}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    const json = (await res.json()) as { view?: DtkView; error?: string };
    return res.ok && json.view ? { ok: true, view: json.view } : { ok: false, error: json.error ?? "network" };
  } catch {
    return { ok: false, error: "network" };
  }
}

function readSaved(): { id: string; kind: "ai" | "room" } | null {
  try {
    const v = JSON.parse(readStorage(SAVE_KEY) ?? "null") as { id?: unknown; kind?: unknown } | null;
    return v && typeof v.id === "string" ? { id: v.id, kind: v.kind === "room" ? "room" : "ai" } : null;
  } catch {
    return null;
  }
}

/** Ván dở trên máy chủ (để màn mở đúng cách chơi khi tải lại trang). */
export const savedServerKind = (): "ai" | "room" | null => readSaved()?.kind ?? null;

export function useServerMatch() {
  const [view, setView] = useState<DtkView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [receivedAt, setReceivedAt] = useState(0);
  const [clockNow, setClockNow] = useState(0);
  const latest = useRef<DtkView | null>(null);

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
    writeStorage(SAVE_KEY, v.you < 0 ? null : JSON.stringify({ id: v.id, kind: v.kind }));
    if (v.gold !== undefined) window.dispatchEvent(new CustomEvent(PROFILE_GOLD_EVENT, { detail: v.gold }));
    return true;
  }, []);

  useEffect(() => {
    const saved = readSaved();
    if (!saved) return;
    void api(undefined, saved.id).then((r) => {
      if (r.ok) accept(r);
      else if (r.error === "notFound" || r.error === "notMember") writeStorage(SAVE_KEY, null);
    });
  }, [accept]);

  const viewId = view?.id ?? null;
  const polled = !!view && view.kind === "room" && view.status !== "ended" && view.you >= 0;
  useEffect(() => {
    if (!polled || !viewId) return;
    const timer = window.setInterval(() => void api(undefined, viewId).then((r) => r.ok && accept(r)), POLL_MS);
    return () => window.clearInterval(timer);
  }, [polled, viewId, accept]);

  const ticking = view?.turnLeftMs !== null && view?.turnLeftMs !== undefined;
  useEffect(() => {
    if (!ticking) return;
    const timer = window.setInterval(() => setClockNow(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [ticking]);
  const turnLeft = view?.turnLeftMs == null ? null : Math.max(0, view.turnLeftMs - Math.max(0, clockNow - receivedAt));

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
    turnLeft,
    startAi: (element: Element, rivals: readonly string[]) => run({ action: "ai", element, rivals }),
    host: (element: Element) => run({ action: "host", element }),
    join: (code: string, element: Element) => run({ action: "join", code, element }),
    addBot: (rival: string) => (view ? run({ action: "addBot", id: view.id, rival }) : Promise.resolve(false)),
    removeSeat: (index: number) => (view ? run({ action: "removeSeat", id: view.id, index }) : Promise.resolve(false)),
    start: () => (view ? run({ action: "start", id: view.id }) : Promise.resolve(false)),
    act: async (move: DtkAction) => {
      if (!view) return false;
      const ok = await run({ action: "act", id: view.id, move });
      if (!ok) void api(undefined, view.id).then((r) => r.ok && accept(r));
      return ok;
    },
    resign: () => (view ? run({ action: "resign", id: view.id }) : Promise.resolve(false)),
    leave: () => {
      latest.current = null;
      setView(null);
      setError(null);
      writeStorage(SAVE_KEY, null);
    },
  };
}
