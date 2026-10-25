/**
 * Mưa kim bạc vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu hồi máu của y sư hệ Kim rải kim châm sáng
 * rơi xuống quanh từng đồng đội, vòng sáng bạc nở dưới chân và hạt sáng bốc lên (hồi máu, thanh tẩy).
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Thời lượng một lần (giây). */
const LIFE = 1.2;

interface Grace {
  readonly at: Point;
  readonly size: number;
  wait: number;
  t: number;
  /** Kim rơi: lệch ngang và độ trễ. */
  readonly needles: readonly { readonly dx: number; readonly delay: number }[];
  /** Hạt sáng bốc lên: lệch ngang và tốc độ. */
  readonly motes: readonly { readonly dx: number; readonly speed: number }[];
}

export function silverGrace(parent: Container, color: number) {
  const g = new Graphics();
  g.blendMode = "add";
  parent.addChild(g);
  let graces: Grace[] = [];
  return {
    /** Rải kim quanh người đứng ở `at` (giữa hai bàn chân), chờ `wait` giây. */
    cover(at: Point, size: number, wait = 0) {
      const needles = Array.from({ length: 6 }, (_, i) => ({ dx: (i / 5 - 0.5) * size * 0.4, delay: Math.random() * 0.25 }));
      const motes = Array.from({ length: 10 }, () => ({ dx: (Math.random() - 0.5) * size * 0.35, speed: 0.4 + Math.random() * 0.5 }));
      graces.push({ at, size, wait, t: 0, needles, motes });
    },
    update(dt: number) {
      g.clear();
      for (const c of graces) {
        if (c.wait > 0) {
          c.wait -= dt;
          continue;
        }
        c.t += dt;
        if (c.t >= LIFE) continue;
        const fade = c.t < LIFE * 0.65 ? 1 : 1 - (c.t - LIFE * 0.65) / (LIFE * 0.35);
        const { x, y } = c.at;
        const s = c.size;
        // Vòng sáng bạc dưới chân nở ra.
        const ring = Math.min(1, c.t / 0.3);
        g.ellipse(x, y, s * 0.3 * ring, s * 0.06 * ring).stroke({ color: 0xffffff, width: s * 0.008, alpha: 0.9 * fade });
        g.ellipse(x, y, s * 0.3 * ring, s * 0.06 * ring).fill({ color, alpha: 0.25 * fade });
        // Kim bạc rơi thẳng xuống, cắm thì lóe.
        for (const n of c.needles) {
          const k = Math.min(1, Math.max(0, (c.t - n.delay) / 0.3));
          if (k <= 0) continue;
          const ny = y - s * 0.9 * (1 - k);
          const len = s * 0.08;
          g.moveTo(x + n.dx, ny - len).lineTo(x + n.dx, ny).stroke({ color: 0xffffff, width: s * 0.006, alpha: fade });
          if (k >= 1) g.circle(x + n.dx, y, s * 0.015).fill({ color: 0xffffff, alpha: 0.7 * fade });
        }
        // Hạt sáng bốc lên quanh người.
        for (const m of c.motes) {
          const my = y - s * Math.min(0.9, m.speed * c.t);
          g.circle(x + m.dx, my, s * 0.01).fill({ color, alpha: 0.9 * fade });
          g.circle(x + m.dx, my, s * 0.005).fill({ color: 0xffffff, alpha: fade });
        }
      }
      graces = graces.filter((c) => c.wait > 0 || c.t < LIFE);
    },
    clear() {
      graces = [];
      g.clear();
    },
  };
}
