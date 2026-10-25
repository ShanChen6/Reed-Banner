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
/** Đến lượt: chờ chừng này (ms) sau khi đổi người hành động rồi mới vào thế. */
const READY_DELAY_MS = 450;
/** Cận cảnh tuyệt chiêu: độ phóng và thời lượng, khớp quãng 1,2–1,8 s của động tác. */
const CLOSE_UP = 1.3;
const CLOSE_UP_MS = 1500;

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
    case "ready":
      return [
        [
          { transform: "none" },
          { transform: "translateY(2px) scaleY(0.96)", offset: 0.3 },
          { transform: `translateX(${dir * 3}px) translateY(-3px)`, offset: 0.65 },
          { transform: "none" },
        ],
        300,
      ];
    case "attack":
      return [
        [
          { transform: "none" },
          { transform: `translateX(${dir * 18}px) rotate(${dir * 6}deg)`, offset: 0.35 },
          { transform: "none" },
        ],
        600,
      ];
    case "cast":
      return [
        [
          { transform: "none", filter: "none" },
          { transform: "translateY(-6px) scale(1.12)", filter: `drop-shadow(0 0 10px ${color})`, offset: 0.4 },
          { transform: "none", filter: "none" },
        ],
        800,
      ];
    case "ultimate":
      return [
        [
          { transform: "none", filter: "none" },
          { transform: "translateY(2px) scale(0.96)", filter: `drop-shadow(0 0 6px ${color})`, offset: 0.35 },
          { transform: `translateX(${dir * 10}px) translateY(-10px) scale(1.2)`, filter: `drop-shadow(0 0 16px ${color}) brightness(1.25)`, offset: 0.5 },
          { transform: `translateX(${dir * 6}px) scale(1.12)`, filter: `drop-shadow(0 0 10px ${color})`, offset: 0.8 },
          { transform: "none", filter: "none" },
        ],
        1500,
      ];
    case "guard":
      return [
        [
          { transform: "none", filter: "none" },
          { transform: `translateX(${-dir * 4}px)`, filter: "drop-shadow(0 0 8px rgb(147 197 253)) brightness(1.15)", offset: 0.25 },
          { transform: "none", filter: "none" },
        ],
        400,
      ];
    case "buff":
      return [
        [
          { transform: "none", filter: "none" },
          { transform: "translateY(-4px)", filter: "drop-shadow(0 0 10px rgb(252 211 77))", offset: 0.4 },
          { transform: "none", filter: "none" },
        ],
        400,
      ];
    case "debuff":
      return [
        [
          { transform: "none", filter: "none" },
          { transform: "translateY(3px) scaleY(0.95)", filter: "drop-shadow(0 0 8px rgb(167 139 250)) saturate(0.6)", offset: 0.4 },
          { transform: "none", filter: "none" },
        ],
        400,
      ];
    case "victory":
      return [
        [
          { transform: "none", filter: "none" },
          { transform: "translateY(2px) scaleY(0.95)", offset: 0.12 },
          { transform: "translateY(-14px)", filter: `drop-shadow(0 0 12px ${color})`, offset: 0.35 },
          { transform: "translateY(0)", offset: 0.55 },
          { transform: "translateY(-6px)", filter: `drop-shadow(0 0 10px ${color})`, offset: 0.75 },
          { transform: "none", filter: `drop-shadow(0 0 6px ${color})` },
        ],
        1200,
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
        300,
      ];
    case "heal":
      return [
        [
          { filter: "none" },
          { filter: "drop-shadow(0 0 10px rgb(52 211 153))" },
          { filter: "none" },
        ],
        400,
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
  /** Lớp chứa cả sân PixiJS lẫn chân dung, phóng to khi tuyệt chiêu để cận cảnh. */
  const camera = useRef<HTMLDivElement>(null);
  const vignette = useRef<HTMLDivElement>(null);
  const runCue = useRef<((c: Cue) => void) | null>(null);
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
      const [{ Application, Container }, { loadPuppet }, { lightning }, { earthWard }, { leafBloom }, { armorPierce }, { supplyDrain }, { waterPillar }, { flameWall }, { groundSlam }, { needleVolley }, { steelBulwark }, { silverGrace }, { coinScatter }, { ironFormation }, { bambooSap }, { thornBind }, { poisonMist }] = await Promise.all([
        import("pixi.js"),
        import("./puppet"),
        import("./lightning"),
        import("./ward"),
        import("./bloom"),
        import("./pierce"),
        import("./drain"),
        import("./pillar"),
        import("./flame"),
        import("./slam"),
        import("./needle"),
        import("./bulwark"),
        import("./silver"),
        import("./coins"),
        import("./banner"),
        import("./sap"),
        import("./thorn"),
        import("./miasma"),
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
      (camera.current ?? el).prepend(app.canvas);
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
      // Hiệu ứng vẽ trên cả sân, đè lên mọi nhân vật: sét hệ Lôi, vòm khiên đất hệ Thổ, vòng lá hồi sinh hệ Mộc,
      // mũi sáng phá giáp hệ Kim, đoạt lương và cột nước đóng băng hệ Thủy, tường lửa hệ Hỏa, đập đất hệ Thổ,
      // ngân châm, tường thép, mưa kim bạc, tiền vàng ly tán và
      // thiết trận hệ Kim, trúc lâm hút sinh khí và dây gai
      // quấn thân hệ Mộc.
      const sky = new Container();
      sky.zIndex = 100;
      app.stage.addChild(sky);
      const fieldFx = entries.flatMap((e, i): { update(dt: number): void }[] => {
        const rig = e.rig;
        if (rig.skeleton !== "warrior" || !rig.strikeFx) return [];
        const spot = (s: Slot, k: number) => {
          const { width, height } = app.screen;
          return { x: slotX(s.side, s.index) * width, y: height * (GROUND - FIGURE * k) };
        };
        const alive = (mine: boolean) => latest.current.filter((s) => (s.side === e.side) === mine && isAlive(s.fighter));
        if (rig.strikeFx === "earthWard" || rig.strikeFx === "leafBloom" || rig.strikeFx === "silverGrace") {
          const make = rig.strikeFx === "earthWard" ? earthWard : rig.strikeFx === "leafBloom" ? leafBloom : silverGrace;
          const fx = make(sky, rig.fxColor);
          // Tuyệt chiêu cho cả đội: hiệu ứng nở quanh từng đồng đội còn đứng.
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            alive(true).forEach((s, n) => fx.cover(spot(s, 0), app.screen.height * FIGURE, n * 0.08));
          });
          return [fx];
        }
        if (rig.strikeFx === "poisonMist") {
          const mist = poisonMist(sky, rig.fxColor);
          const bloom = leafBloom(sky, rig.fxColor);
          // Tuyệt chiêu trúc độc: sương độc quanh từng đối thủ (rút năng lượng, câm lặng), vòng lá hồi phục cho đội mình.
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            const size = app.screen.height * FIGURE;
            alive(false).forEach((s, n) => mist.cover(spot(s, 0), size, n * 0.08));
            alive(true).forEach((s, n) => bloom.cover(spot(s, 0), size, 0.3 + n * 0.08));
          });
          return [mist, bloom];
        }
        if (rig.strikeFx === "rootGuard") {
          const bloom = leafBloom(sky, rig.fxColor);
          const ward = earthWard(sky, rig.fxColor);
          // Tuyệt chiêu giữ thành: vòng lá hồi phục quanh cả đội, vòm khiên quanh chính mình (Khiên, Khiêu khích).
          loaded[i]!.onStrike?.((kind) => {
            const me = latest.current.find((s) => s.side === e.side && s.index === e.index);
            if (kind !== "ultimate" || !me) return;
            const size = app.screen.height * FIGURE;
            alive(true).forEach((s, n) => bloom.cover(spot(s, 0), size, n * 0.08));
            ward.cover(spot(me, 0), size, 0.25);
          });
          return [bloom, ward];
        }
        if (rig.strikeFx === "thornBind") {
          const fx = thornBind(sky, rig.fxColor);
          // Tuyệt chiêu cả đội đối thủ hút máu: dây gai quấn từng người, sinh khí bay về chính mình.
          loaded[i]!.onStrike?.((kind) => {
            const me = latest.current.find((s) => s.side === e.side && s.index === e.index);
            if (kind !== "ultimate" || !me) return;
            const size = app.screen.height * FIGURE;
            alive(false).forEach((s, n) => fx.bind(spot(s, 0), spot(me, 0.55), size, n * 0.08));
          });
          return [fx];
        }
        if (rig.strikeFx === "bambooSap") {
          const fx = bambooSap(sky, rig.fxColor);
          // Tuyệt chiêu một người hút máu: chém lá trúc lên đối thủ đứng đầu, sinh khí bay về chính mình.
          loaded[i]!.onStrike?.((kind) => {
            const foe = alive(false)[0];
            const me = latest.current.find((s) => s.side === e.side && s.index === e.index);
            if (kind === "ultimate" && foe && me) fx.drain(spot(foe, 0.5), spot(me, 0.55), app.screen.height * FIGURE);
          });
          return [fx];
        }
        if (rig.strikeFx === "ironFormation") {
          const fx = ironFormation(sky, rig.fxColor);
          // Tuyệt chiêu thiết trận: khiên nứt trên từng đối thủ (Thủ giảm), mũi tên vàng ở từng đồng đội (Công tăng).
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            const size = app.screen.height * FIGURE;
            alive(false).forEach((s, n) => fx.shatter(spot(s, 0.5), size, n * 0.08));
            alive(true).forEach((s, n) => fx.rally(spot(s, 0), size, 0.2 + n * 0.08));
          });
          return [fx];
        }
        if (rig.strikeFx === "coinScatter") {
          const fx = coinScatter(sky, rig.fxColor);
          // Tuyệt chiêu một người: tiền vàng bật khỏi đối thủ đứng đầu, ấn câm lặng trên đầu họ.
          loaded[i]!.onStrike?.((kind) => {
            const foe = alive(false)[0];
            if (kind === "ultimate" && foe) fx.scatter(spot(foe, 0.5), app.screen.height * FIGURE);
          });
          return [fx];
        }
        if (rig.strikeFx === "steelBulwark") {
          const fx = steelBulwark(sky, rig.fxColor);
          // Tuyệt chiêu tự thủ: tường thép dựng trước mặt chính mình, quay về phía đối thủ.
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            const me = latest.current.find((s) => s.side === e.side && s.index === e.index);
            if (me) fx.raise(spot(me, 0), app.screen.height * FIGURE, e.side === 0 ? 1 : -1);
          });
          return [fx];
        }
        if (rig.strikeFx === "needleVolley") {
          const fx = needleVolley(sky, rig.fxColor);
          // Tuyệt chiêu ngân châm: chùm kim bạc từ đầu trượng tới từng đối thủ còn đứng.
          loaded[i]!.onStrike?.((kind, at) => {
            if (kind !== "ultimate") return;
            const w = Math.max(2, app.screen.height * 0.012);
            alive(false).forEach((s, n) => fx.volley(at, spot(s, 0.5), w, n * 0.06));
          });
          return [fx];
        }
        if (rig.strikeFx === "groundSlam") {
          const slam = groundSlam(sky, rig.fxColor);
          const ward = earthWard(sky, rig.fxColor);
          // Tuyệt chiêu bổ chùy: nứt đất dưới chân đối thủ đứng đầu, vòm khiên đất quanh cả đội mình (Thủ +30%).
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            const size = app.screen.height * FIGURE;
            const foe = alive(false)[0];
            if (foe) slam.slam(spot(foe, 0), size);
            alive(true).forEach((s, n) => ward.cover(spot(s, 0), size, 0.2 + n * 0.08));
          });
          return [slam, ward];
        }
        if (rig.strikeFx === "flameWall") {
          const fx = flameWall(sky, rig.fxColor);
          // Tuyệt chiêu hỏa lũy: tường lửa quanh chính mình, lửa bén lên từng đối thủ còn đứng.
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            const me = latest.current.find((s) => s.side === e.side && s.index === e.index);
            const size = app.screen.height * FIGURE;
            if (me) fx.wall(spot(me, 0), size);
            alive(false).forEach((s, n) => fx.burn(spot(s, 0), size, 0.15 + n * 0.08));
          });
          return [fx];
        }
        if (rig.strikeFx === "waterPillar") {
          const fx = waterPillar(sky, rig.fxColor);
          // Tuyệt chiêu trận nước: cột nước phun lên rồi đóng băng dưới chân từng đối thủ còn đứng.
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            alive(false).forEach((s, n) => fx.cover(spot(s, 0), app.screen.height * FIGURE, n * 0.1));
          });
          return [fx];
        }
        if (rig.strikeFx === "armorPierce") {
          const fx = armorPierce(sky, rig.fxColor);
          // Tuyệt chiêu xuyên giáp một người: mũi sáng từ mũi kiếm tới đối thủ đứng đầu.
          loaded[i]!.onStrike?.((kind, at) => {
            const foe = alive(false)[0];
            if (kind === "ultimate" && foe) fx.pierce(at, spot(foe, 0.5), Math.max(3, app.screen.height * 0.022));
          });
          return [fx];
        }
        if (rig.strikeFx === "supplyDrain") {
          const fx = supplyDrain(sky, rig.fxColor);
          // Tuyệt chiêu đoạt lương cả đội đối thủ: hút hạt sáng từ từng người về người tung chiêu.
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            const me = latest.current.find((s) => s.side === e.side && s.index === e.index);
            if (!me) return;
            const size = app.screen.height * FIGURE;
            alive(false).forEach((s, n) => fx.drain(spot(s, 0.5), spot(me, 0.55), size, n * 0.1));
          });
          return [fx];
        }
        const fx = lightning(sky, rig.fxColor);
        loaded[i]!.onStrike?.((kind, at) => {
          const foes = alive(false);
          if (foes.length === 0) return;
          const w = Math.max(3, app.screen.height * 0.022);
          // Tuyệt chiêu giáng sét xuống cả đội đối thủ, còn lại phóng tới người đứng đầu.
          if (kind === "ultimate") foes.forEach((s, n) => fx.strike(spot(s, 0.55), w * 1.6, n * 0.08));
          else fx.bolt(at, spot(foes[0]!, 0.5), kind === "cast" ? w * 1.4 : w);
        });
        return [fx];
      });
      app.ticker.add((tk) => {
        const dt = Math.min(tk.deltaMS / 1000, 0.05);
        for (const p of map.values()) p.update(dt);
        for (const f of fieldFx) f.update(dt);
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

  // Đến lượt: người hành động vào thế, đợi các cú trúng của lô trước diễn xong.
  const actorKey = actor ? keyOf(actor.side, actor.fighter) : null;
  useEffect(() => {
    if (!actorKey) return;
    const t = window.setTimeout(() => {
      const [side, fighter] = actorKey.split(":").map(Number) as [0 | 1, number];
      if (!latest.current.some((s) => s.key === actorKey && isAlive(s.fighter))) return;
      runCue.current?.({ side, fighter, kind: "ready", delay: 0 });
    }, READY_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [actorKey]);

  // Nhận động tác từ đạo diễn trận.
  useEffect(() => {
    const timers = new Set<number>();
    /** Cận cảnh: phóng to quanh người tung tuyệt chiêu, viền tối dần, rồi trả về. */
    const closeUp = (c: Cue) => {
      const cam = camera.current;
      if (!cam || reducedMotion()) return;
      const x = slotX(c.side, c.fighter) * 100;
      const origin = `${x}% ${GROUND * 100 - 30}%`;
      // Kéo người tung chiêu về phía giữa sân một chút.
      const pan = (50 - x) * 0.25;
      cam.animate(
        [
          { transform: "none", transformOrigin: origin },
          { transform: `translateX(${pan}%) scale(${CLOSE_UP})`, transformOrigin: origin, offset: 0.18 },
          { transform: `translateX(${pan}%) scale(${CLOSE_UP})`, transformOrigin: origin, offset: 0.8 },
          { transform: "none", transformOrigin: origin },
        ],
        { duration: CLOSE_UP_MS, easing: "ease-in-out" },
      );
      const v = vignette.current;
      if (v) {
        v.style.setProperty("--x", `${x}%`);
        v.animate(
          [{ opacity: 0 }, { opacity: 1, offset: 0.18 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }],
          { duration: CLOSE_UP_MS, easing: "ease-in-out" },
        );
      }
    };
    const run = (c: Cue) => {
      const key = keyOf(c.side, c.fighter);
      if (c.kind === "ultimate") closeUp(c);
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
    runCue.current = run;
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
      runCue.current = null;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [bus]);

  return (
    <div
      ref={host}
      aria-hidden
      className="relative h-32 w-full overflow-hidden rounded-xl border border-[var(--gold)]/40 bg-gradient-to-b from-transparent via-black/5 to-black/25 sm:h-40 md:h-44"
    >
      <div ref={camera} className="absolute inset-0">
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
      {/* Viền tối khi cận cảnh tuyệt chiêu, sáng quanh người tung chiêu. */}
      <div
        ref={vignette}
        className="pointer-events-none absolute inset-0 z-30 opacity-0"
        style={{ background: "radial-gradient(ellipse 45% 90% at var(--x, 50%) 60%, transparent 40%, rgb(0 0 0 / 0.55))" }}
      />
    </div>
  );
}
