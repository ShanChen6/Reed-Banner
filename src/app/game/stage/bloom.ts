/**
 * Vòng lá hồi sinh vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu hồi máu của y sư hệ Mộc nở một vòng
 * sáng dưới chân từng đồng đội, lá xoay vòng quanh người rồi bay lên cùng hạt sáng, sau đó tan dần. Màu viền và hạt
 * sáng đổi được: y sư hệ Hỏa dùng than hồng thay lá non.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Thời lượng một vòng (giây). */
const LIFE = 1.3;

interface Leaf {
  /** Góc xuất phát quanh người. */
  readonly phase: number;
  /** Tốc độ bay lên (phần chiều cao mỗi giây). */
  readonly rise: number;
  readonly size: number;
}

interface Bloom {
  readonly at: Point;
  readonly size: number;
  wait: number;
  t: number;
  readonly leaves: readonly Leaf[];
}

/** Màu viền vòng, gân lá và hạt sáng. */
export interface BloomGlow {
  readonly line: number;
  readonly spark: number;
}

const SPRING: BloomGlow = { line: 0xc9f5b0, spark: 0xeaffd8 };

/** Than hồng của y sư hệ Hỏa. */
export const EMBER: BloomGlow = { line: 0xffd8a0, spark: 0xfff2c4 };

export function leafBloom(parent: Container, color: number, glow: BloomGlow = SPRING) {
  const g = new Graphics();
  parent.addChild(g);
  let blooms: Bloom[] = [];
  return {
    /** Nở vòng lá quanh người đứng ở `at` (giữa hai bàn chân), chờ `wait` giây. */
    cover(at: Point, size: number, wait = 0) {
      const leaves = Array.from({ length: 12 }, (_, i) => ({
        phase: (i / 12) * Math.PI * 2 + Math.random() * 0.4,
        rise: 0.35 + Math.random() * 0.35,
        size: 0.6 + Math.random() * 0.6,
      }));
      blooms.push({ at, size, wait, t: 0, leaves });
    },
    update(dt: number) {
      g.clear();
      for (const b of blooms) {
        if (b.wait > 0) {
          b.wait -= dt;
          continue;
        }
        b.t += dt;
        const k = b.t / LIFE;
        if (k >= 1) continue;
        const fade = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
        const { x, y } = b.at;
        const rx = b.size * 0.3;
        // Vòng sáng dưới chân nở rộng rồi nhạt.
        const ring = Math.min(1, k * 4);
        g.ellipse(x, y, rx * (0.4 + 0.8 * ring), rx * 0.2 * (0.4 + 0.8 * ring)).fill({ color, alpha: 0.25 * fade });
        g.ellipse(x, y, rx * (0.4 + 0.8 * ring), rx * 0.2 * (0.4 + 0.8 * ring)).stroke({ color: glow.line, width: b.size * 0.012, alpha: 0.8 * fade });
        // Cột sáng mờ dâng lên quanh người.
        g.ellipse(x, y - b.size * 0.45 * ring, rx * 0.8, b.size * 0.45 * ring).fill({ color, alpha: 0.1 * fade });
        // Lá xoay quanh người và bay lên; lá phía sau mờ hơn.
        for (const l of b.leaves) {
          const ang = l.phase + b.t * 3.2;
          const lx = x + Math.cos(ang) * rx * 0.9;
          const ly = y - b.size * Math.min(0.95, l.rise * b.t) + Math.sin(ang) * rx * 0.12;
          const depth = 0.55 + 0.45 * Math.sin(ang);
          const s = b.size * 0.022 * l.size;
          g.ellipse(lx, ly, s * 1.8, s * 0.8).fill({ color, alpha: 0.9 * fade * depth });
          g.moveTo(lx - s * 1.6, ly).lineTo(lx + s * 1.6, ly).stroke({ color: glow.line, width: s * 0.25, alpha: 0.7 * fade * depth });
          g.circle(lx, ly - s * 3, s * 0.45).fill({ color: glow.spark, alpha: 0.8 * fade * depth });
        }
      }
      blooms = blooms.filter((b) => b.wait > 0 || b.t < LIFE);
    },
    clear() {
      blooms = [];
      g.clear();
    },
  };
}
