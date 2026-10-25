/**
 * Trúc lâm hút sinh khí vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu của tướng sĩ hệ Mộc chém chéo hai
 * vệt lá trúc lên đối thủ, rồi hạt sáng xanh bay ngược về người tung chiêu (hút máu, hồi phục).
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Vệt chém tới `SLASH`, hạt bay tới hết `LIFE` (giây). */
const SLASH = 0.25;
const LIFE = 1.2;

interface Sap {
  readonly from: Point;
  readonly to: Point;
  readonly size: number;
  t: number;
  readonly motes: readonly { readonly delay: number; readonly arc: number; readonly dy: number }[];
}

export function bambooSap(parent: Container, color: number) {
  const g = new Graphics();
  g.blendMode = "add";
  parent.addChild(g);
  let saps: Sap[] = [];
  return {
    /** Chém đối thủ ở `from` (giữa thân), hút sinh khí về `to`. */
    drain(from: Point, to: Point, size: number) {
      const motes = Array.from({ length: 9 }, () => ({
        delay: SLASH + Math.random() * 0.3,
        arc: 0.1 + Math.random() * 0.2,
        dy: (Math.random() - 0.5) * size * 0.3,
      }));
      saps.push({ from, to, size, t: 0, motes });
    },
    update(dt: number) {
      g.clear();
      for (const p of saps) {
        p.t += dt;
        if (p.t >= LIFE) continue;
        const { from, to, size: s } = p;
        // Hai vệt chém chéo hình lá trúc, mọc dài rồi tắt.
        const cut = Math.min(1, p.t / SLASH);
        const fade = 1 - Math.max(0, (p.t - SLASH) / 0.35);
        if (fade > 0) {
          for (const dir of [1, -1]) {
            const r = s * 0.16 * cut;
            const x0 = from.x - r;
            const y0 = from.y - dir * r;
            const x1 = from.x + r;
            const y1 = from.y + dir * r;
            const mx = (x0 + x1) / 2 + dir * s * 0.02;
            const my = (y0 + y1) / 2 - s * 0.02;
            g.poly([x0, y0, mx, my - s * 0.015, x1, y1, mx, my + s * 0.015]).fill({ color, alpha: 0.8 * fade });
            g.moveTo(x0, y0).lineTo(x1, y1).stroke({ color: 0xeaffd8, width: s * 0.006, alpha: fade });
          }
        }
        // Hạt sáng xanh bay vòng về người tung chiêu.
        const dist = Math.hypot(to.x - from.x, to.y - from.y);
        for (const m of p.motes) {
          const k = Math.min(1, Math.max(0, (p.t - m.delay) / 0.55));
          if (k <= 0 || k >= 1) continue;
          const e = k * k * (3 - 2 * k);
          const x = from.x + (to.x - from.x) * e;
          const y = from.y + m.dy * (1 - e) + (to.y - from.y) * e - Math.sin(Math.PI * e) * dist * m.arc;
          g.circle(x, y, s * 0.014).fill({ color, alpha: 0.7 });
          g.circle(x, y, s * 0.006).fill({ color: 0xffffff, alpha: 0.9 });
        }
        // Người tung chiêu lóe xanh khi hạt về tới.
        const gain = Math.max(0, Math.min(1, (p.t - 0.7) / 0.2)) * (1 - Math.max(0, (p.t - 1) / 0.2));
        if (gain > 0) g.circle(to.x, to.y, s * 0.1 * (1 + gain)).fill({ color, alpha: 0.35 * gain });
      }
      saps = saps.filter((p) => p.t < LIFE);
    },
    clear() {
      saps = [];
      g.clear();
    },
  };
}
