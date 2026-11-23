"use client";

// Gọi máy nghĩ nước đi trong web worker; trình duyệt không chạy được worker thì nghĩ ngay trên luồng chính.
import { useCallback, useEffect, useRef } from "react";
import type { EngineRequest, EngineResponse } from "./engine";

function onMainThread(request: EngineRequest): Promise<EngineResponse> {
  return import("./engine").then(
    ({ handle }) =>
      new Promise((resolve) => {
        // Để chữ "đang nghĩ" kịp hiện trước khi luồng chính bận.
        window.setTimeout(() => resolve(handle(request)), 30);
      }),
  );
}

export function useVtkEngine() {
  const worker = useRef<Worker | null>(null);
  const pending = useRef(new Map<number, { request: EngineRequest; resolve: (r: EngineResponse) => void }>());
  const nextId = useRef(1);

  useEffect(() => {
    let created: Worker | null = null;
    const waiting = pending.current;
    try {
      created = new Worker(new URL("./vtk.worker.ts", import.meta.url), { type: "module", name: "vay-thanh-ky" });
      created.onmessage = (event: MessageEvent<EngineResponse>) => {
        const entry = waiting.get(event.data.id);
        if (!entry) return;
        waiting.delete(event.data.id);
        entry.resolve(event.data);
      };
      created.onerror = (event) => {
        event.preventDefault();
        created?.terminate();
        worker.current = null;
        const left = [...waiting.values()];
        waiting.clear();
        for (const entry of left) void onMainThread(entry.request).then(entry.resolve);
      };
      worker.current = created;
    } catch {
      worker.current = null;
    }
    return () => {
      created?.terminate();
      worker.current = null;
      waiting.clear();
    };
  }, []);

  return useCallback((body: EngineRequestBody): Promise<EngineResponse> => {
    const request: EngineRequest = { ...body, id: nextId.current++ };
    const current = worker.current;
    if (!current) return onMainThread(request);
    return new Promise((resolve) => {
      pending.current.set(request.id, { request, resolve });
      current.postMessage(request);
    });
  }, []);
}

/** Lệnh gửi máy, chưa có id (giữ phân biệt "move" và "dead"). */
type WithoutId<R> = R extends unknown ? Omit<R, "id"> : never;
type EngineRequestBody = WithoutId<EngineRequest>;
