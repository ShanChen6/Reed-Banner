/**
 * Đập đất vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu bổ chùy của tướng sĩ hệ Thổ làm mặt đất nứt toác
 * dưới chân đối thủ, đá văng lên và sóng bụi lan ra rồi tan.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Thời lượng một cú đập (giây). */
const LIFE = 1.1;

interface Rock {
  readonly vx: number;
  readonly vy: number;
  readonly size: number;
  readonly spin: number;
}

interface Slam {
  readonly at: Point;
  readonly size: number;
  t: number;
  /** Các vết nứt: góc và độ dài (phần kích thước). */
  readonly cracks: readonly { readonly angle: number; readonly length: number }[];
  readonly rocks: readonly Rock[];
}

export function groundSlam(parent: Container, color: number) {
  const g = new Graphics();
  parent.addChild(g);
  let slams: Slam[] = [];
  return {
    /** Đập đất dưới chân người đứng ở `at` (giữa hai bàn chân). */
    slam(at: Point, size: number) {
      const cracks = Array.from({ length: 7 }, (_, i) => ({
        angle: (i / 7) * Math.PI * 2 + Math.random() * 0.5,
        length: 0.25 + Math.random() * 0.2,
      }));
      const rocks = Array.from({ length: 12 }, () => ({
        vx: (Math.random() - 0.5) * size * 1.2,
        vy: -size * (0.6 + Math.random() * 0.8),
        size: size * (0.015 + Math.random() * 0.025),
        spin: (Math.random() - 0.5) * 12,
      }));
      slams.push({ at, size, t: 0, cracks, rocks });
    },
    update(dt: number) {
      g.clear();
      for (const s of slams) {
        s.t += dt;
        const k = s.t / LIFE;
        if (k >= 1) continue;
        const fade = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4;
        const { x, y } = s.at;
        const open = Math.min(1, s.t / 0.12);
        // Hố lõm và sóng bụi lan dưới chân.
        g.ellipse(x, y, s.size * 0.28 * open, s.size * 0.06 * open).fill({ color: 0x2a1d10, alpha: 0.55 * fade });
        const ring = Math.min(1, s.t / 0.5);
        g.ellipse(x, y, s.size * (0.2 + 0.4 * ring), s.size * (0.05 + 0.08 * ring)).stroke({ color, width: s.size * 0.02, alpha: 0.7 * (1 - ring) });
        // Vết nứt gấp khúc trên mặt đất (dẹt theo phối cảnh).
        for (const c of s.cracks) {
          const len = s.size * c.length * open;
          const mx = x + Math.cos(c.angle) * len * 0.5 + Math.sin(c.angle * 3) * s.size * 0.02;
          const my = y + Math.sin(c.angle) * len * 0.12;
          g.moveTo(x, y).lineTo(mx, my).lineTo(x + Math.cos(c.angle) * len, y + Math.sin(c.angle) * len * 0.22)
            .stroke({ color: 0xffd28a, width: s.size * 0.008, alpha: 0.9 * fade });
        }
        // Đá văng lên rồi rơi.
        for (const r of s.rocks) {
          const ry = y + r.vy * s.t + s.size * 2.4 * s.t * s.t;
          if (ry > y) continue;
          const rx = x + r.vx * s.t;
          const a = r.spin * s.t;
          const c = Math.cos(a) * r.size;
          const d = Math.sin(a) * r.size;
          g.poly([rx - c, ry - d, rx + d, ry - c, rx + c, ry + d, rx - d, ry + c]).fill({ color, alpha: fade });
          g.poly([rx - c, ry - d, rx + d, ry - c, rx + c, ry + d, rx - d, ry + c]).stroke({ color: 0x3a2814, width: r.size * 0.25, alpha: fade });
        }
      }
      slams = slams.filter((s) => s.t < LIFE);
    },
    clear() {
      slams = [];
      g.clear();
    },
  };
}
