/**
 * Kim ngân ly tán vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu của mưu sĩ hệ Kim làm đồng tiền vàng
 * bật tung khỏi đối thủ (rút năng lượng), rồi ấn câm lặng hiện trên đầu họ và tan dần.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Thời lượng (giây). */
const LIFE = 1.2;

interface Burst {
  /** Giữa thân đối thủ. */
  readonly at: Point;
  readonly size: number;
  t: number;
  readonly coins: readonly { readonly vx: number; readonly vy: number; readonly spin: number }[];
}

export function coinScatter(parent: Container, color: number) {
  const g = new Graphics();
  parent.addChild(g);
  let bursts: Burst[] = [];
  return {
    /** Tung tiền khỏi người đứng ở `at` (giữa thân). */
    scatter(at: Point, size: number) {
      const coins = Array.from({ length: 14 }, () => ({
        vx: (Math.random() - 0.5) * size * 1.4,
        vy: -size * (0.4 + Math.random() * 0.7),
        spin: 6 + Math.random() * 10,
      }));
      bursts.push({ at, size, t: 0, coins });
    },
    update(dt: number) {
      g.clear();
      for (const b of bursts) {
        b.t += dt;
        if (b.t >= LIFE) continue;
        const fade = b.t < LIFE * 0.6 ? 1 : 1 - (b.t - LIFE * 0.6) / (LIFE * 0.4);
        const { x, y } = b.at;
        const s = b.size;
        // Lóe vàng ở giữa thân.
        const flash = Math.max(0, 1 - b.t / 0.25);
        g.circle(x, y, s * 0.12 * (1 + b.t * 2)).fill({ color: 0xffd36b, alpha: 0.5 * flash });
        // Đồng tiền vàng lỗ vuông bay tung rồi rơi, lật mặt khi xoay.
        for (const c of b.coins) {
          const cx = x + c.vx * b.t;
          const cy = y + c.vy * b.t + s * 1.6 * b.t * b.t;
          const r = s * 0.022;
          const flip = Math.abs(Math.cos(c.spin * b.t));
          g.ellipse(cx, cy, r * Math.max(0.15, flip), r).fill({ color: 0xffcf4a, alpha: fade }).stroke({ color: 0x8a6a1e, width: r * 0.25, alpha: fade });
          if (flip > 0.4) g.rect(cx - r * 0.25 * flip, cy - r * 0.25, r * 0.5 * flip, r * 0.5).fill({ color: 0x8a6a1e, alpha: fade });
        }
        // Ấn câm lặng trên đầu: vòng tròn gạch chéo màu kim.
        if (b.t > 0.2) {
          const k = Math.min(1, (b.t - 0.2) / 0.15);
          const hy = y - s * 0.45;
          const rr = s * 0.07 * k;
          g.circle(x, hy, rr).stroke({ color, width: s * 0.012, alpha: fade });
          g.moveTo(x - rr * 0.7, hy - rr * 0.7).lineTo(x + rr * 0.7, hy + rr * 0.7).stroke({ color, width: s * 0.012, alpha: fade });
        }
      }
      bursts = bursts.filter((b) => b.t < LIFE);
    },
    clear() {
      bursts = [];
      g.clear();
    },
  };
}
