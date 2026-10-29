/**
 * Bát trận thạch lũy vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu của quân sư hệ Thổ phất cờ lệnh cho tám
 * cột đá mọc lên thành vòng bát quái quanh chân đồng đội, nét trận đồ sáng hổ phách nối các cột trên mặt đất, rồi đá
 * lún xuống và tan.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Đá mọc tới `RISE`, giữ tới `HOLD`, lún hết `LIFE` (giây). */
const RISE = 0.28;
const HOLD = 1.0;
const LIFE = 1.4;
/** Tám cột đá của trận đồ. */
const STONES = 8;

interface Ring {
  readonly at: Point;
  readonly size: number;
  /** Cột đá: cao, rộng (phần cỡ người), độ trễ mọc. */
  readonly stones: readonly { readonly h: number; readonly w: number; readonly lag: number }[];
  wait: number;
  t: number;
}

export function stoneBastion(parent: Container, color: number) {
  const g = new Graphics();
  const glow = new Graphics();
  glow.blendMode = "add";
  parent.addChild(g, glow);
  let rings: Ring[] = [];
  return {
    /** Vòng tám cột đá quanh người đứng ở `at` (giữa hai bàn chân), chờ `wait` giây. */
    ring(at: Point, size: number, wait = 0) {
      const stones = Array.from({ length: STONES }, (_, i) => ({
        h: 0.11 + Math.random() * 0.05,
        w: 0.026 + Math.random() * 0.01,
        lag: i * 0.025,
      }));
      rings.push({ at, size, stones, wait, t: 0 });
    },
    update(dt: number) {
      g.clear();
      glow.clear();
      for (const r of rings) {
        if (r.wait > 0) {
          r.wait -= dt;
          continue;
        }
        r.t += dt;
        if (r.t >= LIFE) continue;
        const fade = r.t < HOLD ? 1 : 1 - (r.t - HOLD) / (LIFE - HOLD);
        const w = r.size * 0.01;
        const rx = r.size * 0.3;
        const ry = r.size * 0.07;
        const { x, y } = r.at;
        // Nét trận đồ: bát giác sáng nối chân tám cột, vòng trong nhỏ hơn, lan ra theo lúc đá mọc.
        const draw = Math.min(1, r.t / RISE);
        const pts = (k: number) =>
          Array.from({ length: STONES }, (_, i) => {
            const a = (i / STONES) * Math.PI * 2 + Math.PI / STONES;
            return [x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k] as const;
          });
        const outer = pts(draw);
        const inner = pts(draw * 0.55);
        g.ellipse(x, y, rx * draw * 1.05, ry * draw * 1.05).fill({ color: 0x2a1d10, alpha: 0.35 * fade });
        glow.poly(outer.flat()).stroke({ color, width: w * 0.9, alpha: 0.85 * fade, join: "round" });
        glow.poly(inner.flat()).stroke({ color: 0xffe2a8, width: w * 0.5, alpha: 0.7 * fade, join: "round" });
        outer.forEach(([ox, oy], i) => {
          const [ix, iy] = inner[i]!;
          glow.moveTo(ox, oy).lineTo(ix, iy).stroke({ color, width: w * 0.4, alpha: 0.6 * fade });
        });
        // Cột đá: cột phía sau vẽ trước để cột phía trước che lên.
        const order = outer.map((p, i) => ({ p, s: r.stones[i]! })).sort((a, b) => a.p[1] - b.p[1]);
        for (const { p, s } of order) {
          const e = r.t - s.lag;
          if (e <= 0) continue;
          const rise = 1 - (1 - Math.min(1, e / RISE)) ** 3;
          const sink = r.t > HOLD ? Math.min(1, (r.t - HOLD) / (LIFE - HOLD)) : 0;
          const h = r.size * s.h * rise * (1 - sink * 0.7);
          if (h <= 0) continue;
          const [bx, by] = p;
          const hw = r.size * s.w;
          // Cột đá đẽo vát đầu: mặt trái hứng sáng, mặt phải khuất tối, vân địa mạch sáng dọc thân.
          const face = [bx - hw, by, bx - hw, by - h * 0.82, bx - hw * 0.2, by - h, bx + hw, by - h * 0.85, bx + hw, by];
          g.poly(face).fill({ color: 0x9c7a50, alpha: fade });
          g.poly([bx + hw * 0.15, by - h * 0.95, bx + hw, by - h * 0.85, bx + hw, by, bx + hw * 0.15, by]).fill({ color: 0x5a4028, alpha: fade });
          g.poly(face).stroke({ color: 0x2a1d10, width: w * 0.45, alpha: fade, join: "round" });
          glow.moveTo(bx - hw * 0.45, by - h * 0.15).lineTo(bx - hw * 0.55, by - h * 0.5).lineTo(bx - hw * 0.3, by - h * 0.78)
            .stroke({ color, width: w * 0.5, alpha: 0.9 * fade, cap: "round", join: "round" });
          glow.circle(bx - hw * 0.2, by - h, w * 1.6 * (1 - Math.min(1, e / 0.5))).fill({ color: 0xffe2a8, alpha: 0.8 * fade });
        }
      }
      rings = rings.filter((r) => r.wait > 0 || r.t < LIFE);
    },
    clear() {
      rings = [];
      g.clear();
      glow.clear();
    },
  };
}
