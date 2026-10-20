"use client";

import { useEffect, useMemo, useRef } from "react";
import { isAlive, type Fighter } from "@/core";
import { ELEMENT_COLOR } from "../art/icons";
import { Portrait } from "../art/portraits";
import type { Cue, CueBus, CueKind } from "./director";
import type { Puppet } from "./kit";
import { rigOf, type Rig } from "./rigs";

/**
 * Vị trí ngang (0..1) của nhân vật trên sân khấu. Người đầu đội (thủ lĩnh) đứng gần giữa sân nhất, hai
 * phe quay mặt vào nhau.
 */
export function slotX(side: 0 | 1, index: number): number {
  const x = Math.max(0.06, 0.37 - index * 0.135);
  return side === 0 ? x : 1 - x;
}

/** Chân nhân vật cách đáy sân bao nhiêu phần chiều cao. */
const GROUND = 0.94;
/** Nhân vật cao bao nhiêu phần chiều cao sân. */
const FIGURE = 0.9;

const keyOf = (side: number, index: number) => `${side}:${index}`;

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Động tác của chân dung (nhân vật chưa có hình động), hướng `dir` là phía đối thủ. */
function portraitMove(
  kind: CueKind,
  dir: number,
  color: string,
): [Keyframe[], number] {
  switch (kind) {
    case "attack":
      return [
        [
          { transform: "none" },
          { transform: `translateX(${dir * 18}px) rotate(${dir * 6}deg)`, offset: 0.35 },
          { transform: "none" },
        ],
        380,
      ];
    case "cast":
    case "ultimate":
      return [
        [
          { transform: "none", filter: "none" },
          { transform: "translateY(-6px) scale(1.12)", filter: `drop-shadow(0 0 10px ${color})`, offset: 0.4 },
          { transform: "none", filter: "none" },
        ],
        650,
      ];
    case "hit":
      return [
        [
          { transform: "none", filter: "none" },
          { transform: `translateX(${-dir * 6}px)`, filter: "drop-shadow(0 0 6px rgb(244 63 94)) brightness(1.3)" },
          { transform: `translateX(${dir * 4}px)` },
          { transform: `translateX(${-dir * 2}px)` },
          { transform: "none", filter: "none" },
        ],
        380,
      ];
    case "heal":
      return [
        [
          { filter: "none" },
          { filter: "drop-shadow(0 0 10px rgb(52 211 153))" },
          { filter: "none" },
        ],
        600,
      ];
  }
}

interface Slot {
  readonly key: string;
  readonly side: 0 | 1;
  readonly index: number;
  readonly fighter: Fighter;
  readonly rig: Rig | null;
}

/**
 * Sân khấu trận: dải phía trên bàn cờ, hai đội đứng đối mặt. Nhân vật có hình động được vẽ bằng PixiJS
 * (nạp động khi cần), nhân vật khác hiện chân dung. Động tác đến từ đạo diễn trận qua `bus`.
 */
export default function BattleStage({
  sides,
  actor,
  bus,
}: {
  sides: readonly [readonly Fighter[], readonly Fighter[]];
  /** Người đang hành động, để đánh dấu dưới chân. */
  actor: { side: 0 | 1; fighter: number } | null;
  bus: CueBus;
}) {
  const host = useRef<HTMLDivElement>(null);
  const puppets = useRef(new Map<string, Puppet>());
  const portraits = useRef(new Map<string, HTMLDivElement>());

  const slots = useMemo<Slot[]>(
    () =>
      sides.flatMap((fs, s) =>
        fs.map((f, i) => ({
          key: keyOf(s, i),
          side: s as 0 | 1,
          index: i,
          fighter: f,
          rig: rigOf(f.id),
        })),
      ),
    [sides],
  );
  /** Danh sách nhân vật có hình động; đổi thì dựng lại sân PixiJS (ví dụ đợt mới ở Sinh tồn). */
  const rigged = slots
    .filter((s) => s.rig)
    .map((s) => `${s.key}=${s.fighter.id}`)
    .join(",");
  /** Bản mới nhất của `slots` cho các hàm chạy ngoài lần vẽ (nạp xong hình, nhận động tác). */
  const latest = useRef(slots);

  // Người gục: hình động ngả người và mờ đi.
  useEffect(() => {
    latest.current = slots;
    for (const s of slots)
      puppets.current.get(s.key)?.setDown(!isAlive(s.fighter));
  }, [slots]);

  // Dựng sân PixiJS khi trận có nhân vật có hình động.
  useEffect(() => {
    const el = host.current;
    if (!el || rigged === "") return;
    const still = reducedMotion();
    const map = puppets.current;
    let disposed = false;
    let destroy: (() => void) | null = null;

    void (async () => {
      const [{ Application }, { loadPuppet }] = await Promise.all([
        import("pixi.js"),
        import("./puppet"),
      ]);
      const app = new Application();
      await app.init({
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
        resizeTo: el,
        preference: "webgl",
      });
      if (disposed) return app.destroy(true, { children: true });
      app.canvas.style.position = "absolute";
      app.canvas.style.inset = "0";
      app.canvas.setAttribute("aria-hidden", "true");
      el.prepend(app.canvas);
      app.stage.sortableChildren = true;

      const entries = rigged.split(",").map((s) => {
        const [key, id] = s.split("=") as [string, string];
        const [side, index] = key.split(":").map(Number) as [0 | 1, number];
        return { key, side, index, rig: rigOf(id)! };
      });
      const loaded = await Promise.all(
        entries.map((e) => loadPuppet(e.rig, still)),
      );
      if (disposed) {
        loaded.forEach((p) => p.destroy());
        return app.destroy(true, { children: true });
      }

      const layout = () => {
        const { width, height } = app.screen;
        entries.forEach((e, i) => {
          const p = loaded[i]!;
          const s = (height * FIGURE) / p.height;
          // Phe đối thủ lật ngang để quay mặt sang trái.
          p.view.scale.set(e.side === 0 ? s : -s, s);
          p.view.position.set(slotX(e.side, e.index) * width, height * GROUND);
          p.view.zIndex = 10 - e.index;
        });
      };
      entries.forEach((e, i) => {
        app.stage.addChild(loaded[i]!.view);
        map.set(e.key, loaded[i]!);
      });
      layout();
      app.renderer.on("resize", layout);
      app.ticker.add((tk) => {
        const dt = Math.min(tk.deltaMS / 1000, 0.05);
        for (const p of map.values()) p.update(dt);
      });
      // Giảm chuyển động: hình đứng yên, chỉ vẽ lại thưa để cập nhật lúc gục.
      if (still) app.ticker.maxFPS = 4;
      // Tab ẩn thì dừng vẽ cho đỡ tốn pin.
      const onVisibility = () =>
        document.hidden ? app.ticker.stop() : app.ticker.start();
      document.addEventListener("visibilitychange", onVisibility);
      for (const s of latest.current)
        map.get(s.key)?.setDown(!isAlive(s.fighter));

      destroy = () => {
        document.removeEventListener("visibilitychange", onVisibility);
        map.clear();
        app.destroy(true, { children: true });
      };
    })();

    return () => {
      disposed = true;
      destroy?.();
    };
  }, [rigged]);

  // Nhận động tác từ đạo diễn trận.
  useEffect(() => {
    const timers = new Set<number>();
    const run = (c: Cue) => {
      const key = keyOf(c.side, c.fighter);
      const puppet = puppets.current.get(key);
      if (puppet) return puppet.play(c.kind);
      const node = portraits.current.get(key);
      if (!node || reducedMotion()) return;
      const f = latest.current.find((s) => s.key === key)?.fighter;
      const [frames, duration] = portraitMove(
        c.kind,
        c.side === 0 ? 1 : -1,
        f ? ELEMENT_COLOR[f.element] : "#fff",
      );
      node.animate(frames, { duration, easing: "ease-out" });
    };
    const off = bus.on((cues) => {
      for (const c of cues) {
        if (c.delay <= 0) {
          run(c);
          continue;
        }
        const t = window.setTimeout(() => {
          timers.delete(t);
          run(c);
        }, c.delay);
        timers.add(t);
      }
    });
    return () => {
      off();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [bus]);

  return (
    <div
      ref={host}
      aria-hidden
      className="relative h-32 w-full overflow-hidden rounded-xl border border-[var(--gold)]/40 bg-gradient-to-b from-transparent via-black/5 to-black/25 sm:h-40 md:h-44"
    >
      {/* Mặt đất: dải mờ dưới chân hai đội. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[14%] bg-black/15" />
      {slots.map((s) => {
        const left = `${slotX(s.side, s.index) * 100}%`;
        const alive = isAlive(s.fighter);
        const isActor =
          actor !== null && actor.side === s.side && actor.fighter === s.index;
        return (
          <div key={s.key}>
            {isActor && alive && (
              <span
                className="absolute h-2.5 w-14 -translate-x-1/2 rounded-[50%] border-2 border-amber-300/80 bg-amber-300/20 md:w-20"
                style={{ left, bottom: `${(1 - GROUND) * 100 - 2}%` }}
              />
            )}
            {!s.rig && (
              <div
                className="absolute z-10 -translate-x-1/2"
                style={{ left, bottom: `${(1 - GROUND) * 100 + 4}%`, zIndex: 20 - s.index }}
              >
                <div className={alive ? "stage-idle" : ""}>
                  <div
                    ref={(n) => {
                      if (n) portraits.current.set(s.key, n);
                      else portraits.current.delete(s.key);
                    }}
                    className={`transition-[opacity,filter,transform] duration-500 ${alive ? "" : "translate-y-2 rotate-12 opacity-35 grayscale"}`}
                  >
                    <Portrait
                      id={s.fighter.id}
                      element={s.fighter.element}
                      profession={s.fighter.profession}
                      className="size-12 drop-shadow-md sm:size-16 md:size-20"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
