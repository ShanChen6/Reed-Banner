/**
 * Cột nước đóng băng vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu trận nước của pháp sư hệ Thủy làm
 * nước phun lên từ dưới chân từng đối thủ, rồi cột nước đông lại thành băng nhọn và vỡ tan.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Phun lên tới `RISE`, đông băng tới `FREEZE`, vỡ tan hết `LIFE` (giây). */
const RISE = 0.3;
const FREEZE = 0.6;
const LIFE = 1.2;

interface Pillar {
  readonly at: Point;
  readonly size: number;
  wait: number;
  t: number;
  /** Giọt nước văng quanh chân. */
  readonly drops: readonly { readonly vx: number; readonly vy: number; readonly r: number }[];
}

export function waterPillar(parent: Container, color: number) {
  const g = new Graphics();
  parent.addChild(g);
  let pillars: Pillar[] = [];
  return {
    /** Dựng cột nước dưới chân người đứng ở `at`, chờ `wait` giây. */
    cover(at: Point, size: number, wait = 0) {
      const drops = Array.from({ length: 10 }, () => ({
        vx: (Math.random() - 0.5) * size * 0.9,
        vy: -size * (0.5 + Math.random() * 0.6),
        r: size * (0.008 + Math.random() * 0.01),
      }));
      pillars.push({ at, size, wait, t: 0, drops });
    },
    update(dt: number) {
      g.clear();
      for (const p of pillars) {
        if (p.wait > 0) {
          p.wait -= dt;
          continue;
        }
        p.t += dt;
        if (p.t >= LIFE) continue;
        const { x, y } = p.at;
        const w = p.size * 0.16;
        const rise = Math.min(1, p.t / RISE);
        const h = p.size * 0.85 * (1 - (1 - rise) ** 3);
        const ice = Math.max(0, Math.min(1, (p.t - RISE) / (FREEZE - RISE)));
        const fade = p.t < FREEZE ? 1 : 1 - (p.t - FREEZE) / (LIFE - FREEZE);
        // Vũng nước dưới chân.
        g.ellipse(x, y, w * 1.8, w * 0.35).fill({ color, alpha: 0.35 * fade });
        // Cột nước: thân lượn sóng, đỉnh bọt; đông dần sang băng xanh nhạt có cạnh thẳng.
        const sway = Math.sin(p.t * 22) * w * 0.15 * (1 - ice);
        const body = [x - w, y, x - w * 0.7 + sway, y - h * 0.5, x - w * 0.35, y - h, x + w * 0.35, y - h, x + w * 0.7 + sway, y - h * 0.5, x + w, y];
        g.poly(body).fill({ color: ice > 0 ? 0xbfe6ff : color, alpha: (0.55 + 0.25 * ice) * fade });
        g.poly(body).stroke({ color: 0xe8f7ff, width: p.size * 0.008, alpha: 0.8 * fade });
        if (ice <= 0) g.circle(x, y - h, w * 0.5).fill({ color: 0xe8f7ff, alpha: 0.7 });
        // Băng nhọn mọc quanh cột khi đông.
        if (ice > 0) {
          for (const [dx, k] of [[-1, 0.55], [1, 0.45], [-0.6, 0.35], [0.7, 0.6]] as const) {
            const bx = x + dx * w * 1.1;
            const tip = y - p.size * k * ice;
            g.poly([bx - w * 0.22, y, bx, tip, bx + w * 0.22, y]).fill({ color: 0xdff4ff, alpha: 0.85 * fade });
          }
        }
        // Giọt nước văng lúc phun.
        const s = Math.min(p.t, RISE * 1.5);
        for (const d of p.drops) {
          const dy = y + d.vy * s + p.size * 2.2 * s * s;
          if (dy > y) continue;
          g.circle(x + d.vx * s, dy, d.r).fill({ color: 0xe8f7ff, alpha: 0.85 * (1 - s / (RISE * 1.5)) });
        }
      }
      pillars = pillars.filter((p) => p.wait > 0 || p.t < LIFE);
    },
    clear() {
      pillars = [];
      g.clear();
    },
  };
}
