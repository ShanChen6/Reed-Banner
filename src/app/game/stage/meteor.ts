/**
 * Mưa lửa vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu của pháp sư hệ Hỏa gọi cầu lửa từ trời rơi chéo
 * xuống từng đối thủ, kéo vệt đuôi, chạm đất nổ một vòng sáng và tung tàn lửa (thiêu rụi vật cản quanh đó).
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Rơi tới `FALL`, nổ và tàn lửa tới hết `LIFE` (giây). */
const FALL = 0.35;
const LIFE = 0.95;

interface Meteor {
  /** Điểm chạm: giữa hai bàn chân người bị trúng. */
  readonly at: Point;
  readonly size: number;
  /** Phía cầu lửa bay tới: 1 từ trái sang, -1 từ phải sang. */
  readonly dir: number;
  wait: number;
  t: number;
  readonly sparks: readonly { readonly vx: number; readonly vy: number; readonly r: number }[];
}

export function fireRain(parent: Container, color: number) {
  const g = new Graphics();
  g.blendMode = "add";
  parent.addChild(g);
  let meteors: Meteor[] = [];
  return {
    /** Cầu lửa rơi xuống người đứng ở `at`, bay tới từ phía `dir`, chờ `wait` giây. */
    fall(at: Point, size: number, dir: number, wait = 0) {
      const sparks = Array.from({ length: 12 }, () => ({
        vx: (Math.random() - 0.5) * size * 1.2,
        vy: -size * (0.4 + Math.random() * 0.6),
        r: size * (0.008 + Math.random() * 0.01),
      }));
      meteors.push({ at, size, dir, wait, t: 0, sparks });
    },
    update(dt: number) {
      g.clear();
      for (const m of meteors) {
        if (m.wait > 0) {
          m.wait -= dt;
          continue;
        }
        m.t += dt;
        if (m.t >= LIFE) continue;
        const { at, size: s, dir } = m;
        const hit = { x: at.x, y: at.y - s * 0.3 };
        const start = { x: hit.x - dir * s * 0.7, y: hit.y - s * 1.6 };
        if (m.t < FALL) {
          // Cầu lửa rơi nhanh dần, vệt đuôi là chuỗi chấm nhỏ dần về phía sau.
          const k = (m.t / FALL) ** 2;
          const x = start.x + (hit.x - start.x) * k;
          const y = start.y + (hit.y - start.y) * k;
          for (let i = 6; i >= 1; i--) {
            const back = i * 0.06;
            const tx = x - (hit.x - start.x) * back;
            const ty = y - (hit.y - start.y) * back;
            g.circle(tx, ty, s * 0.04 * (1 - i / 7)).fill({ color, alpha: 0.5 * (1 - i / 7) });
          }
          g.circle(x, y, s * 0.06).fill({ color, alpha: 0.7 });
          g.circle(x, y, s * 0.035).fill({ color: 0xffe08a, alpha: 0.95 });
          continue;
        }
        // Nổ: vòng sáng loang ra rồi tắt, tàn lửa văng lên rồi rơi.
        const e = (m.t - FALL) / (LIFE - FALL);
        const fade = 1 - e;
        g.circle(hit.x, hit.y, s * (0.08 + 0.25 * e)).fill({ color, alpha: 0.45 * fade });
        g.circle(hit.x, hit.y, s * (0.05 + 0.1 * e)).fill({ color: 0xffe08a, alpha: 0.7 * fade * fade });
        g.ellipse(at.x, at.y, s * (0.15 + 0.3 * e), s * (0.04 + 0.06 * e)).stroke({ color, width: s * 0.015, alpha: 0.8 * fade });
        const k = m.t - FALL;
        for (const p of m.sparks) {
          const y = hit.y + p.vy * k + s * 2 * k * k;
          if (y > at.y) continue;
          g.circle(hit.x + p.vx * k, y, p.r).fill({ color: 0xffd36b, alpha: fade });
        }
      }
      meteors = meteors.filter((m) => m.wait > 0 || m.t < LIFE);
    },
    clear() {
      meteors = [];
      g.clear();
    },
  };
}
