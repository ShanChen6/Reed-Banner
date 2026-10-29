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
          { transform: `translateX(${-dir * 4}px)`, filter: "drop-shadow(0 0 8px rgb(242 207 134)) brightness(1.15)", offset: 0.25 },
          { transform: "none", filter: "none" },
        ],
        400,
      ];
    case "shield":
      return [
        [
          { transform: "none", filter: "none" },
          { transform: "translateY(-2px)", filter: "drop-shadow(0 0 10px rgb(242 207 134)) brightness(1.1)", offset: 0.35 },
          { transform: "none", filter: "none" },
        ],
        500,
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
      const [{ Application, Container }, { loadPuppet }, { lightning }, { leafBloom, SPRING, EMBER, LOAM, VOLT, BREEZE }, { armorPierce }, { supplyDrain }, { waterPillar }, { flameWall }, { groundSlam }, { needleVolley }, { steelBulwark }, { silverGrace }, { coinScatter }, { ironFormation }, { bambooSap }, { thornBind }, { poisonMist, TIDE, SMOKE, DUST, STORM }, { fireRain }, { flameCleave }, { fireChain }, { drumShield }, { earthSurge }, { tauntRoar }, { stoneBastion }, { thunderCleave }, { heavenStrike }, { thunderAegis }, { galeSlash }, { flameDisc }] = await Promise.all([
        import("pixi.js"),
        import("./puppet"),
        import("./lightning"),
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
        import("./meteor"),
        import("./cleave"),
        import("./chain"),
        import("./drum"),
        import("./surge"),
        import("./taunt"),
        import("./bastion"),
        import("./thunder"),
        import("./heaven"),
        import("./aegis"),
        import("./gale"),
        import("./disc"),
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
      // Hiệu ứng vẽ trên cả sân, đè lên mọi nhân vật: sét hệ Lôi, khiên mặt trống đồng, vòng lá hồi sinh hệ Mộc,
      // mũi sáng phá giáp hệ Kim, đoạt lương và cột nước đóng băng hệ Thủy, tường lửa hệ Hỏa, đập đất hệ Thổ,
      // ngân châm, tường thép, mưa kim bạc, tiền vàng ly tán và
      // thiết trận hệ Kim, trúc lâm hút sinh khí và dây gai
      // quấn thân hệ Mộc.
      const sky = new Container();
      sky.zIndex = 100;
      app.stage.addChild(sky);
      // Lớp sau lưng mọi nhân vật: quầng sáng và vệt sáng hồi phục của y sư.
      const halo = new Container();
      halo.zIndex = 0;
      app.stage.addChild(halo);
      const fieldFx = entries.flatMap((e, i): { update(dt: number): void }[] => {
        const rig = e.rig;
        if (rig.skeleton !== "warrior" || !rig.strikeFx) return [];
        const spot = (s: Slot, k: number) => {
          const { width, height } = app.screen;
          return { x: slotX(s.side, s.index) * width, y: height * (GROUND - FIGURE * k) };
        };
        const alive = (mine: boolean) => latest.current.filter((s) => (s.side === e.side) === mine && isAlive(s.fighter));
        const facing = e.side === 0 ? 1 : -1;
        if (rig.strikeFx === "earthWard" || rig.strikeFx === "leafBloom" || rig.strikeFx === "silverGrace") {
          const fx = rig.strikeFx === "earthWard" ? drumShield(sky, rig.fxColor, facing)
            : rig.strikeFx === "leafBloom" ? leafBloom(sky, rig.fxColor, SPRING, halo) : silverGrace(sky, rig.fxColor);
          // Tuyệt chiêu cho cả đội: hiệu ứng nở quanh từng đồng đội còn đứng.
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            alive(true).forEach((s, n) => fx.cover(spot(s, 0), app.screen.height * FIGURE, n * 0.08));
          });
          return [fx];
        }
        if (rig.strikeFx === "poisonMist") {
          const mist = poisonMist(sky, rig.fxColor);
          const bloom = leafBloom(sky, rig.fxColor, SPRING, halo);
          // Tuyệt chiêu trúc độc: sương độc quanh từng đối thủ (rút năng lượng, câm lặng), vòng lá hồi phục cho đội mình.
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            const size = app.screen.height * FIGURE;
            alive(false).forEach((s, n) => mist.cover(spot(s, 0), size, n * 0.08));
            alive(true).forEach((s, n) => bloom.cover(spot(s, 0), size, 0.3 + n * 0.08));
          });
          return [mist, bloom];
        }
        if (rig.strikeFx === "groveWard" || rig.strikeFx === "earthMend") {
          const bloom = leafBloom(sky, rig.fxColor, rig.strikeFx === "earthMend" ? LOAM : SPRING, halo);
          const ward = drumShield(sky, rig.fxColor, facing);
          // Tuyệt chiêu bày trận cả đội: vòng lá hồi phục rồi khiên mặt trống (Thủ tăng) quanh từng đồng đội. Hậu thổ dưỡng
          // nguyên hệ Thổ cũng vậy, lá thuốc màu đất (Hồi máu) rồi khiên mặt trống (Khiên 10% máu).
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            const size = app.screen.height * FIGURE;
            alive(true).forEach((s, n) => {
              bloom.cover(spot(s, 0), size, n * 0.08);
              ward.cover(spot(s, 0), size, 0.3 + n * 0.08);
            });
          });
          return [bloom, ward];
        }
        if (rig.strikeFx === "rootGuard") {
          const bloom = leafBloom(sky, rig.fxColor, SPRING, halo);
          const ward = drumShield(sky, rig.fxColor, facing);
          // Tuyệt chiêu giữ thành: vòng lá hồi phục quanh cả đội, khiên mặt trống trước chính mình (Khiên, Khiêu khích).
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
        if (rig.strikeFx === "tideSiege") {
          const tide = waterPillar(sky, rig.fxColor);
          const crack = ironFormation(sky, rig.fxColor);
          // Tuyệt chiêu triều dâng: cột nước dâng rồi đông băng dưới chân từng đối thủ (Đóng băng), vết nứt trên người họ (Công giảm).
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            const size = app.screen.height * FIGURE;
            alive(false).forEach((s, n) => {
              tide.cover(spot(s, 0), size, n * 0.08);
              crack.shatter(spot(s, 0.5), size, 0.3 + n * 0.08);
            });
          });
          return [tide, crack];
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
          const ward = drumShield(sky, rig.fxColor, facing);
          // Tuyệt chiêu bổ chùy: nứt đất dưới chân đối thủ đứng đầu, khiên mặt trống trước cả đội mình (Thủ +30%).
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            const size = app.screen.height * FIGURE;
            const foe = alive(false)[0];
            if (foe) slam.slam(spot(foe, 0), size);
            alive(true).forEach((s, n) => ward.cover(spot(s, 0), size, 0.2 + n * 0.08));
          });
          return [slam, ward];
        }
        if (rig.strikeFx === "mountainCrush") {
          const slam = groundSlam(sky, rig.fxColor);
          const drum = drumShield(sky, rig.fxColor);
          // Tuyệt chiêu sơn hà trấn kích: nứt đất dưới chân đối thủ đứng đầu (phá ô hình chữ thập), khiên mặt trống đồng trước chính mình.
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            const size = app.screen.height * FIGURE;
            const foe = alive(false)[0];
            const me = latest.current.find((s) => s.side === e.side && s.index === e.index);
            if (foe) slam.slam(spot(foe, 0), size);
            if (me) drum.raise(spot(me, 0), size, facing, 0.15);
          });
          return [slam, drum];
        }
        if (rig.strikeFx === "fireRain") {
          const rain = fireRain(sky, rig.fxColor);
          const fire = flameWall(sky, rig.fxColor);
          // Tuyệt chiêu mưa lửa: cầu lửa rơi chéo xuống từng đối thủ từ phía người tung chiêu, chạm đất thì lửa bén (Thiêu đốt).
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            const size = app.screen.height * FIGURE;
            const dir = e.side === 0 ? 1 : -1;
            alive(false).forEach((s, n) => {
              rain.fall(spot(s, 0), size, dir, n * 0.12);
              fire.burn(spot(s, 0), size, 0.35 + n * 0.12);
            });
          });
          return [rain, fire];
        }
        if (rig.strikeFx === "fireChain") {
          const chain = fireChain(sky, rig.fxColor);
          const fire = flameWall(sky, rig.fxColor);
          // Tuyệt chiêu hỏa công liên kế: tên lửa từ cờ lệnh trúng đối thủ đầu rồi nảy sang từng người kế (Công giảm), lửa bén lên họ (Thiêu đốt).
          loaded[i]!.onStrike?.((kind, at) => {
            if (kind !== "ultimate") return;
            const size = app.screen.height * FIGURE;
            let from = at;
            alive(false).forEach((s, n) => {
              const to = spot(s, 0.5);
              chain.link(from, to, size, n * 0.22);
              fire.burn(spot(s, 0), size, 0.25 + n * 0.22);
              from = to;
            });
          });
          return [chain, fire];
        }
        if (rig.strikeFx === "earthSurge") {
          const surge = earthSurge(sky, rig.fxColor);
          const ward = drumShield(sky, rig.fxColor, facing);
          // Tuyệt chiêu địa mạch bùng phát: trượng nện đất, địa mạch chạy tới chân từng đối thủ rồi trồi đá nhọn (phá ô 3×3),
          // khiên mặt trống trước từng đồng đội (Thủ tăng).
          loaded[i]!.onStrike?.((kind, at) => {
            const me = latest.current.find((s) => s.side === e.side && s.index === e.index);
            if (kind !== "ultimate" || !me) return;
            const size = app.screen.height * FIGURE;
            const from = { x: at.x, y: spot(me, 0).y };
            alive(false).forEach((s, n) => surge.surge(from, spot(s, 0), size, n * 0.08));
            alive(true).forEach((s, n) => ward.cover(spot(s, 0), size, 0.35 + n * 0.08));
          });
          return [surge, ward];
        }
        if (rig.strikeFx === "tauntRoar") {
          const roar = tauntRoar(sky, rig.fxColor);
          const ward = drumShield(sky, rig.fxColor, facing);
          // Tuyệt chiêu trấn sơn hộ quân: dộng khiên xuống đất, vòng gai đá quanh chính mình (phản đòn), ấn khiêu khích trên
          // đầu từng đối thủ, khiên mặt trống trước từng đồng đội (Khiên 25% máu).
          loaded[i]!.onStrike?.((kind) => {
            const me = latest.current.find((s) => s.side === e.side && s.index === e.index);
            if (kind !== "ultimate" || !me) return;
            const size = app.screen.height * FIGURE;
            roar.roar(spot(me, 0), alive(false).map((s) => spot(s, 0)), size);
            alive(true).forEach((s, n) => ward.cover(spot(s, 0), size, 0.3 + n * 0.08));
          });
          return [roar, ward];
        }
        if (rig.strikeFx === "flameCleave") {
          const cut = flameCleave(sky, rig.fxColor);
          const fire = flameWall(sky, rig.fxColor);
          // Tuyệt chiêu một người: nhát chém lửa trăng khuyết bổ qua đối thủ đứng đầu, rồi lửa bén lên họ (Thiêu đốt).
          loaded[i]!.onStrike?.((kind) => {
            const foe = alive(false)[0];
            if (kind !== "ultimate" || !foe) return;
            const size = app.screen.height * FIGURE;
            cut.slash(spot(foe, 0), size, e.side === 0 ? 1 : -1);
            fire.burn(spot(foe, 0), size, 0.2);
          });
          return [cut, fire];
        }
        if (rig.strikeFx === "heavenStrike") {
          const bolts = lightning(sky, rig.fxColor);
          const smite = heavenStrike(sky, rig.fxColor);
          // Đánh thường và ra chiêu phóng sét từ quả cầu tới đối thủ đứng đầu; tuyệt chiêu thiên lôi giáng thế: mây giông
          // tụ trên đầu họ, cột sét lớn giáng xuống (phá một cột ô), đốm năng lượng bật khỏi thân (mất năng lượng).
          loaded[i]!.onStrike?.((kind, at) => {
            const foe = alive(false)[0];
            if (!foe) return;
            const w = Math.max(3, app.screen.height * 0.022);
            if (kind === "ultimate") smite.smite(spot(foe, 0), app.screen.height * FIGURE);
            else bolts.bolt(at, spot(foe, 0.5), kind === "cast" ? w * 1.4 : w);
          });
          return [bolts, smite];
        }
        if (rig.strikeFx === "thunderAegis") {
          const shock = thunderAegis(sky, rig.fxColor);
          const ward = drumShield(sky, rig.fxColor, facing);
          // Tuyệt chiêu chấn lôi thiết vệ: dộng khiên, vòng sấm quanh chân và khiên mặt trống trước chính mình (tăng thủ),
          // sét chạy tới từng đối thủ kèm ấn khiêu khích trên đầu và đốm năng lượng bật khỏi thân (mất năng lượng).
          loaded[i]!.onStrike?.((kind) => {
            const me = latest.current.find((s) => s.side === e.side && s.index === e.index);
            if (kind !== "ultimate" || !me) return;
            const size = app.screen.height * FIGURE;
            shock.guard(spot(me, 0), alive(false).map((s) => spot(s, 0)), size);
            ward.cover(spot(me, 0), size, 0.25);
          });
          return [shock, ward];
        }
        if (rig.strikeFx === "thunderCleave") {
          const cut = thunderCleave(sky, rig.fxColor);
          const crack = ironFormation(sky, rig.fxColor);
          // Tuyệt chiêu lôi đao liên trảm: ba nhát chém sét liền vào đối thủ đứng đầu, khiên nứt (xuyên khiên), đốm năng
          // lượng bật khỏi người họ (mất năng lượng).
          loaded[i]!.onStrike?.((kind) => {
            const foe = alive(false)[0];
            if (kind !== "ultimate" || !foe) return;
            const size = app.screen.height * FIGURE;
            cut.slash(spot(foe, 0), size, e.side === 0 ? 1 : -1);
            crack.shatter(spot(foe, 0.5), size, 0.3);
          });
          return [cut, crack];
        }
        if (rig.strikeFx === "emberMend") {
          const bloom = leafBloom(sky, rig.fxColor, EMBER, halo);
          const rally = ironFormation(sky, rig.fxColor);
          // Tuyệt chiêu đan hỏa: vòng than hồng hồi phục quanh từng đồng đội (Hồi máu), mũi tên vàng dâng lên (Công tăng).
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            const size = app.screen.height * FIGURE;
            alive(true).forEach((s, n) => {
              bloom.cover(spot(s, 0), size, n * 0.08);
              rally.rally(spot(s, 0), size, 0.35 + n * 0.08);
            });
          });
          return [bloom, rally];
        }
        if (rig.strikeFx === "thunderMend") {
          const needles = needleVolley(sky, rig.fxColor);
          const bloom = leafBloom(sky, rig.fxColor, VOLT, halo);
          // Tuyệt chiêu lôi châm khởi tử: chùm kim tím từ tay tới ngực từng đồng đội, rồi vòng sáng tím hồi phục quanh họ
          // (Hồi máu, cộng năng lượng).
          loaded[i]!.onStrike?.((kind, at) => {
            if (kind !== "ultimate") return;
            const size = app.screen.height * FIGURE;
            const w = Math.max(2, app.screen.height * 0.012);
            alive(true).forEach((s, n) => {
              needles.volley(at, spot(s, 0.5), w, n * 0.06);
              bloom.cover(spot(s, 0), size, 0.25 + n * 0.08);
            });
          });
          return [needles, bloom];
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
        if (rig.strikeFx === "tideBulwark") {
          const ward = drumShield(sky, rig.fxColor, facing);
          const ice = waterPillar(sky, rig.fxColor);
          // Tuyệt chiêu thủy trại: khiên mặt trống trước từng đồng đội (Khiên), cột băng dưới chân từng đối thủ (Đóng băng).
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            const size = app.screen.height * FIGURE;
            alive(true).forEach((s, n) => ward.cover(spot(s, 0), size, n * 0.08));
            alive(false).forEach((s, n) => ice.cover(spot(s, 0), size, 0.25 + n * 0.08));
          });
          return [ward, ice];
        }
        if (rig.strikeFx === "galeRout") {
          const gale = galeSlash(sky, rig.fxColor);
          const crack = ironFormation(sky, rig.fxColor);
          const gust = supplyDrain(sky, rig.fxColor);
          // Tuyệt chiêu phong vân biến trận: lốc cuốn quanh từng đối thủ (xoáy bàn cờ, xóa hiệu ứng tốt), khiên giáp họ nứt vỡ
          // (Công giảm), luồng gió đưa năng lượng tới từng đồng đội.
          loaded[i]!.onStrike?.((kind) => {
            const me = latest.current.find((s) => s.side === e.side && s.index === e.index);
            if (kind !== "ultimate" || !me) return;
            const size = app.screen.height * FIGURE;
            alive(false).forEach((s, n) => {
              gale.whirl(spot(s, 0), size, n * 0.1);
              crack.shatter(spot(s, 0.5), size, 0.35 + n * 0.1);
            });
            alive(true).filter((s) => s !== me).forEach((s, n) => gust.drain(spot(me, 0.55), spot(s, 0.55), size, 0.5 + n * 0.1));
          });
          return [gale, crack, gust];
        }
        if (rig.strikeFx === "galeRift") {
          const gale = galeSlash(sky, rig.fxColor);
          const drain = supplyDrain(sky, rig.fxColor);
          // Tuyệt chiêu phiêu phong: lốc cuốn quanh từng đối thủ (xoáy bàn cờ, xóa hiệu ứng tốt), năng lượng bị gió cuốn
          // khỏi họ bay về chính mình.
          loaded[i]!.onStrike?.((kind) => {
            const me = latest.current.find((s) => s.side === e.side && s.index === e.index);
            if (kind !== "ultimate" || !me) return;
            const size = app.screen.height * FIGURE;
            alive(false).forEach((s, n) => {
              gale.whirl(spot(s, 0), size, n * 0.1);
              drain.drain(spot(s, 0.5), spot(me, 0.55), size, 0.45 + n * 0.1);
            });
          });
          return [gale, drain];
        }
        if (rig.strikeFx === "galeMend") {
          const bloom = leafBloom(sky, rig.fxColor, BREEZE, halo);
          const gust = supplyDrain(sky, rig.fxColor);
          // Tuyệt chiêu gió lành: vòng gió trắng xanh hồi phục quanh từng đồng đội (Hồi máu, giải trừ), luồng gió đưa năng
          // lượng tới từng đồng đội.
          loaded[i]!.onStrike?.((kind) => {
            const me = latest.current.find((s) => s.side === e.side && s.index === e.index);
            if (kind !== "ultimate" || !me) return;
            const size = app.screen.height * FIGURE;
            alive(true).forEach((s, n) => bloom.cover(spot(s, 0), size, n * 0.08));
            alive(true).filter((s) => s !== me).forEach((s, n) => gust.drain(spot(me, 0.55), spot(s, 0.55), size, 0.4 + n * 0.1));
          });
          return [bloom, gust];
        }
        if (rig.strikeFx === "springDew") {
          const bloom = leafBloom(sky, rig.fxColor, SPRING, halo);
          const ice = waterPillar(sky, rig.fxColor);
          // Tuyệt chiêu cam lộ: vòng cam lộ hồi phục quanh từng đồng đội (Hồi máu, giải trừ), cột băng dưới chân từng đối thủ (Đóng băng).
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            const size = app.screen.height * FIGURE;
            alive(true).forEach((s, n) => bloom.cover(spot(s, 0), size, n * 0.08));
            alive(false).forEach((s, n) => ice.cover(spot(s, 0), size, 0.3 + n * 0.08));
          });
          return [bloom, ice];
        }
        if (rig.strikeFx === "frostSpear") {
          const fx = waterPillar(sky, rig.fxColor);
          // Tuyệt chiêu một người: cột nước đóng băng dưới chân đối thủ đứng đầu (Đóng băng, rút năng lượng).
          loaded[i]!.onStrike?.((kind) => {
            const foe = alive(false)[0];
            if (kind === "ultimate" && foe) fx.cover(spot(foe, 0), app.screen.height * FIGURE);
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
        if (rig.strikeFx === "myriadEdge") {
          const fx = armorPierce(sky, rig.fxColor);
          const bolt = lightning(sky, rig.fxColor);
          const ward = drumShield(sky, rig.fxColor, facing);
          // Tuyệt chiêu vạn tượng quy nhất: mũi kiếm phóng luồng sáng tới đối thủ đứng đầu, sét giáng đúng chỗ trúng; khiên
          // mặt trống trước chính mình (giải trừ, Khiên).
          loaded[i]!.onStrike?.((kind, at) => {
            const me = latest.current.find((s) => s.side === e.side && s.index === e.index);
            const foe = alive(false)[0];
            if (kind !== "ultimate" || !me || !foe) return;
            const w = Math.max(3, app.screen.height * 0.022);
            fx.pierce(at, spot(foe, 0.5), w);
            bolt.strike(spot(foe, 0.55), w * 1.6, 0.12);
            ward.cover(spot(me, 0), app.screen.height * FIGURE, 0.3);
          });
          return [fx, bolt, ward];
        }
        if (rig.strikeFx === "silkGale") {
          const gale = galeSlash(sky, rig.fxColor);
          const crack = ironFormation(sky, rig.fxColor);
          // Tuyệt chiêu phong lăng nhiễu trận: lốc lụa cuốn quanh từng đối thủ (xoáy bàn cờ), khiên giáp họ nứt (Công giảm).
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            const size = app.screen.height * FIGURE;
            alive(false).forEach((s, n) => {
              gale.whirl(spot(s, 0), size, n * 0.1);
              crack.shatter(spot(s, 0.5), size, 0.35 + n * 0.1);
            });
          });
          return [gale, crack];
        }
        if (rig.strikeFx === "voltNeedle") {
          const fx = armorPierce(sky, rig.fxColor);
          const mist = poisonMist(sky, rig.fxColor, STORM);
          const drain = supplyDrain(sky, rig.fxColor);
          // Tuyệt chiêu một người: lôi châm lao thẳng tới đối thủ đứng đầu, mây giông câm lặng phủ quanh họ, năng lượng bị
          // tước bay về chính mình.
          loaded[i]!.onStrike?.((kind, at) => {
            const me = latest.current.find((s) => s.side === e.side && s.index === e.index);
            const foe = alive(false)[0];
            if (kind !== "ultimate" || !me || !foe) return;
            const size = app.screen.height * FIGURE;
            fx.pierce(at, spot(foe, 0.5), Math.max(3, app.screen.height * 0.022));
            mist.cover(spot(foe, 0), size, 0.15);
            drain.drain(spot(foe, 0.5), spot(me, 0.55), size, 0.35);
          });
          return [fx, mist, drain];
        }
        if (rig.strikeFx === "stoneGuard") {
          const fx = armorPierce(sky, rig.fxColor);
          const crack = ironFormation(sky, rig.fxColor);
          const ward = drumShield(sky, rig.fxColor, facing);
          // Tuyệt chiêu trấn sơn hộ trận: phi hoàng thạch lao tới đối thủ đứng đầu, khiên giáp họ nứt (Công giảm), khiên mặt trống
          // trước từng đồng đội (Khiên).
          loaded[i]!.onStrike?.((kind, at) => {
            const foe = alive(false)[0];
            if (kind !== "ultimate" || !foe) return;
            const size = app.screen.height * FIGURE;
            fx.pierce(at, spot(foe, 0.5), Math.max(3, app.screen.height * 0.022));
            crack.shatter(spot(foe, 0.5), size, 0.15);
            alive(true).forEach((s, n) => ward.cover(spot(s, 0), size, 0.3 + n * 0.08));
          });
          return [fx, crack, ward];
        }
        if (rig.strikeFx === "flameDisc") {
          const disc = flameDisc(sky, rig.fxColor);
          const fire = flameWall(sky, rig.fxColor);
          // Tuyệt chiêu cả đội đối thủ: phi luân lửa nảy lần lượt qua từng người, lửa bén lên chỗ trúng (Thiêu đốt).
          loaded[i]!.onStrike?.((kind, at) => {
            const foes = alive(false);
            if (kind !== "ultimate" || foes.length === 0) return;
            const size = app.screen.height * FIGURE;
            disc.fling([at, ...foes.map((s) => spot(s, 0.5))], size);
            foes.forEach((s, n) => fire.burn(spot(s, 0), size, 0.22 * (n + 1)));
          });
          return [disc, fire];
        }
        if (rig.strikeFx === "willowTide") {
          const fx = armorPierce(sky, rig.fxColor);
          const ice = waterPillar(sky, rig.fxColor);
          // Tuyệt chiêu một người: phi tiêu lá liễu lao thẳng tới đối thủ đứng đầu, cột nước đông băng dưới chân họ (Đóng băng).
          loaded[i]!.onStrike?.((kind, at) => {
            const foe = alive(false)[0];
            if (kind !== "ultimate" || !foe) return;
            fx.pierce(at, spot(foe, 0.5), Math.max(3, app.screen.height * 0.022));
            ice.cover(spot(foe, 0), app.screen.height * FIGURE, 0.15);
          });
          return [fx, ice];
        }
        if (rig.strikeFx === "thicketShot") {
          const fx = armorPierce(sky, rig.fxColor);
          const crack = ironFormation(sky, rig.fxColor);
          const bloom = leafBloom(sky, rig.fxColor, SPRING, halo);
          // Tuyệt chiêu một người: mũi tên tre xuyên tới đối thủ đứng đầu, khiên giáp họ nứt (Thủ giảm), vòng lá hồi phục
          // quanh từng đồng đội.
          loaded[i]!.onStrike?.((kind, at) => {
            const foe = alive(false)[0];
            if (kind !== "ultimate" || !foe) return;
            const size = app.screen.height * FIGURE;
            fx.pierce(at, spot(foe, 0.5), Math.max(3, app.screen.height * 0.022));
            crack.shatter(spot(foe, 0.5), size, 0.15);
            alive(true).forEach((s, n) => bloom.cover(spot(s, 0), size, 0.35 + n * 0.08));
          });
          return [fx, crack, bloom];
        }
        if (rig.strikeFx === "boltBreach") {
          const fx = armorPierce(sky, rig.fxColor);
          const crack = ironFormation(sky, rig.fxColor);
          // Tuyệt chiêu một người: tên nỏ nặng xuyên tới đối thủ đứng đầu, khiên giáp họ nứt vỡ (xuyên giáp, Thủ giảm).
          loaded[i]!.onStrike?.((kind, at) => {
            const foe = alive(false)[0];
            if (kind !== "ultimate" || !foe) return;
            fx.pierce(at, spot(foe, 0.5), Math.max(3, app.screen.height * 0.022));
            crack.shatter(spot(foe, 0.5), app.screen.height * FIGURE, 0.15);
          });
          return [fx, crack];
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
        if (rig.strikeFx === "stoneBastion") {
          const ring = stoneBastion(sky, rig.fxColor);
          const ward = drumShield(sky, rig.fxColor, facing);
          const rally = ironFormation(sky, rig.fxColor);
          // Tuyệt chiêu bát trận thạch lũy: tám cột đá mọc quanh chân từng đồng đội, khiên mặt trống đồng (Khiên 12% máu)
          // rồi mũi tên vàng dâng lên (Thủ tăng).
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            const size = app.screen.height * FIGURE;
            alive(true).forEach((s, n) => {
              ring.ring(spot(s, 0), size, n * 0.08);
              ward.cover(spot(s, 0), size, 0.25 + n * 0.08);
              rally.rally(spot(s, 0), size, 0.45 + n * 0.08);
            });
          });
          return [ring, ward, rally];
        }
        if (rig.strikeFx === "roadSever") {
          const surge = earthSurge(sky, rig.fxColor);
          const dust = poisonMist(sky, rig.fxColor, DUST);
          // Tuyệt chiêu đoạn đạo tuyệt lương: địa mạch cắt đường chạy tới chân từng đối thủ rồi trồi đá chắn (phá ô ngẫu
          // nhiên), bụi đất cuộn quanh họ (mất lương, mất năng lượng).
          loaded[i]!.onStrike?.((kind, at) => {
            const me = latest.current.find((s) => s.side === e.side && s.index === e.index);
            if (kind !== "ultimate" || !me) return;
            const size = app.screen.height * FIGURE;
            const from = { x: at.x, y: spot(me, 0).y };
            alive(false).forEach((s, n) => {
              surge.surge(from, spot(s, 0), size, n * 0.08);
              dust.cover(spot(s, 0), size, 0.3 + n * 0.08);
            });
          });
          return [surge, dust];
        }
        if (rig.strikeFx === "granaryBlaze") {
          const smoke = poisonMist(sky, rig.fxColor, SMOKE);
          const fire = flameWall(sky, rig.fxColor);
          // Tuyệt chiêu hỏa thiêu kho lương: khói kho lương cuộn quanh từng đối thủ (mất lương, mất năng lượng), lửa bén lên họ (Thiêu đốt).
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            const size = app.screen.height * FIGURE;
            alive(false).forEach((s, n) => {
              smoke.cover(spot(s, 0), size, n * 0.08);
              fire.burn(spot(s, 0), size, 0.3 + n * 0.1);
            });
          });
          return [smoke, fire];
        }
        if (rig.strikeFx === "tideMist") {
          const mist = poisonMist(sky, rig.fxColor, TIDE);
          const drain = supplyDrain(sky, rig.fxColor);
          // Tuyệt chiêu thủy độn: sương nước cuộn quanh từng đối thủ (câm lặng), hạt sáng năng lượng bay về người tung chiêu.
          loaded[i]!.onStrike?.((kind) => {
            const me = latest.current.find((s) => s.side === e.side && s.index === e.index);
            if (kind !== "ultimate" || !me) return;
            const size = app.screen.height * FIGURE;
            alive(false).forEach((s, n) => {
              mist.cover(spot(s, 0), size, n * 0.08);
              drain.drain(spot(s, 0.5), spot(me, 0.55), size, 0.35 + n * 0.1);
            });
          });
          return [mist, drain];
        }
        if (rig.strikeFx === "thunderRout") {
          const bolt = lightning(sky, rig.fxColor);
          const crack = ironFormation(sky, rig.fxColor);
          // Tuyệt chiêu lôi trận: sét giáng lần lượt xuống từng đối thủ, khiên giáp họ nứt vỡ (Công giảm, mất năng lượng).
          loaded[i]!.onStrike?.((kind) => {
            if (kind !== "ultimate") return;
            const size = app.screen.height * FIGURE;
            const w = Math.max(3, app.screen.height * 0.022) * 1.6;
            alive(false).forEach((s, n) => {
              bolt.strike(spot(s, 0.55), w, n * 0.1);
              crack.shatter(spot(s, 0.5), size, 0.2 + n * 0.1);
            });
          });
          return [bolt, crack];
        }
        if (rig.strikeFx === "galeBulwark") {
          const gale = galeSlash(sky, rig.fxColor);
          const ward = drumShield(sky, rig.fxColor, facing);
          const gust = supplyDrain(sky, rig.fxColor);
          // Tuyệt chiêu phong lũy: lốc gió dựng quanh chính mình (khiêu khích), khiên mặt trống trước từng đồng đội (Khiên),
          // luồng gió đưa năng lượng tới từng đồng đội.
          loaded[i]!.onStrike?.((kind) => {
            const me = latest.current.find((s) => s.side === e.side && s.index === e.index);
            if (kind !== "ultimate" || !me) return;
            const size = app.screen.height * FIGURE;
            gale.whirl(spot(me, 0), size);
            alive(true).forEach((s, n) => ward.cover(spot(s, 0), size, 0.3 + n * 0.08));
            alive(true).filter((s) => s !== me).forEach((s, n) => gust.drain(spot(me, 0.55), spot(s, 0.55), size, 0.5 + n * 0.1));
          });
          return [gale, ward, gust];
        }
        if (rig.strikeFx === "galeVortex") {
          const gale = galeSlash(sky, rig.fxColor);
          const bolts = lightning(sky, rig.fxColor);
          // Đánh thường và ra chiêu phóng tia gió từ quả cầu tới đối thủ đứng đầu; tuyệt chiêu gọi lốc cuốn quanh từng đối thủ
          // (xoáy bàn cờ, xóa hiệu ứng tốt).
          loaded[i]!.onStrike?.((kind, at) => {
            const foes = alive(false);
            if (foes.length === 0) return;
            const w = Math.max(3, app.screen.height * 0.022);
            if (kind === "ultimate") foes.forEach((s, n) => gale.whirl(spot(s, 0), app.screen.height * FIGURE, n * 0.1));
            else bolts.bolt(at, spot(foes[0]!, 0.5), kind === "cast" ? w * 1.4 : w);
          });
          return [gale, bolts];
        }
        if (rig.strikeFx === "galeSlash") {
          const gale = galeSlash(sky, rig.fxColor);
          const gust = supplyDrain(sky, rig.fxColor);
          // Tuyệt chiêu một người: ba lưỡi gió chém qua đối thủ đứng đầu, lốc cuốn quanh chân họ (xoáy bàn cờ), luồng gió đưa
          // năng lượng tới từng đồng đội.
          loaded[i]!.onStrike?.((kind) => {
            const me = latest.current.find((s) => s.side === e.side && s.index === e.index);
            const foe = alive(false)[0];
            if (kind !== "ultimate" || !me || !foe) return;
            const size = app.screen.height * FIGURE;
            gale.slash(spot(foe, 0), size, e.side === 0 ? 1 : -1);
            alive(true).filter((s) => s !== me).forEach((s, n) => gust.drain(spot(me, 0.55), spot(s, 0.55), size, 0.5 + n * 0.1));
          });
          return [gale, gust];
        }
        if (rig.strikeFx === "stormSeal") {
          const bolt = lightning(sky, rig.fxColor);
          const mist = poisonMist(sky, rig.fxColor, STORM);
          const drain = supplyDrain(sky, rig.fxColor);
          // Tuyệt chiêu một người: sét giáng xuống đối thủ đứng đầu, mây giông câm lặng phủ quanh họ, năng lượng bay về chính mình.
          loaded[i]!.onStrike?.((kind) => {
            const me = latest.current.find((s) => s.side === e.side && s.index === e.index);
            const foe = alive(false)[0];
            if (kind !== "ultimate" || !me || !foe) return;
            const size = app.screen.height * FIGURE;
            bolt.strike(spot(foe, 0.55), Math.max(3, app.screen.height * 0.022) * 1.6);
            mist.cover(spot(foe, 0), size, 0.15);
            drain.drain(spot(foe, 0.5), spot(me, 0.55), size, 0.35);
          });
          return [bolt, mist, drain];
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
                        level={s.fighter.level}
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
