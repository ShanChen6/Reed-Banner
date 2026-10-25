/**
 * Lửa vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu hỏa lũy của binh lính hệ Hỏa dựng một vòng tường
 * lửa quanh chính người tung chiêu, đồng thời bén lửa lên từng đối thủ (Thiêu đốt).
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Thời lượng tường lửa và ngọn lửa bén (giây). */
const WALL_LIFE = 1.3;
const BURN_LIFE = 1;

interface Fire {
  readonly at: Point;
  readonly size: number;
  /** Tường lửa quanh người (to, nhiều lưỡi) hay ngọn lửa bén trên người (nhỏ). */
  readonly wall: boolean;
  wait: number;
  t: number;
  readonly seed: number;
}

export function flameWall(parent: Container, color: number) {
  const g = new Graphics();
  g.blendMode = "add";
  parent.addChild(g);
  let fires: Fire[] = [];
  /** Một lưỡi lửa: giọt nhọn đầu, đung đưa theo thời gian. */
  const tongue = (x: number, y: number, w: number, h: number, t: number, seed: number, a: number) => {
    const sway = Math.sin(t * 14 + seed) * w * 0.35;
    const pts = [x - w, y, x - w * 0.5 + sway * 0.5, y - h * 0.55, x + sway, y - h, x + w * 0.5 + sway * 0.5, y - h * 0.55, x + w, y];
    g.poly(pts).fill({ color, alpha: 0.55 * a });
    const core = [x - w * 0.5, y, x - w * 0.2 + sway * 0.4, y - h * 0.4, x + sway * 0.7, y - h * 0.7, x + w * 0.2 + sway * 0.4, y - h * 0.4, x + w * 0.5, y];
    g.poly(core).fill({ color: 0xffd36b, alpha: 0.75 * a });
  };
  return {
    /** Tường lửa quanh người đứng ở `at` (giữa hai bàn chân). */
    wall(at: Point, size: number) {
      fires.push({ at, size, wall: true, wait: 0, t: 0, seed: Math.random() * 10 });
    },
    /** Lửa bén lên người đứng ở `at`, chờ `wait` giây. */
    burn(at: Point, size: number, wait = 0) {
      fires.push({ at, size, wall: false, wait, t: 0, seed: Math.random() * 10 });
    },
    update(dt: number) {
      g.clear();
      for (const f of fires) {
        if (f.wait > 0) {
          f.wait -= dt;
          continue;
        }
        f.t += dt;
        const life = f.wall ? WALL_LIFE : BURN_LIFE;
        if (f.t >= life) continue;
        const grow = Math.min(1, f.t / 0.2);
        const fade = f.t < life * 0.7 ? 1 : 1 - (f.t - life * 0.7) / (life * 0.3);
        const { x, y } = f.at;
        if (f.wall) {
          // Vòng lửa: các lưỡi xếp quanh elip dưới chân, lưỡi phía trước cao hơn; vầng sáng nền.
          const rx = f.size * 0.32;
          g.ellipse(x, y, rx * 1.1, rx * 0.25).fill({ color, alpha: 0.3 * fade });
          for (let i = 0; i < 14; i++) {
            const ang = (i / 14) * Math.PI * 2;
            const front = 0.6 + 0.4 * Math.sin(ang);
            const h = f.size * (0.34 + 0.14 * Math.sin(i * 2.3 + f.seed)) * grow * front;
            tongue(x + Math.cos(ang) * rx, y + Math.sin(ang) * rx * 0.22, f.size * 0.04, h, f.t, f.seed + i, fade * front);
          }
        } else {
          // Lửa bén: vài lưỡi trên thân người trúng.
          for (let i = 0; i < 4; i++) {
            const dx = (i - 1.5) * f.size * 0.06;
            const base = y - f.size * (0.15 + 0.12 * (i % 2));
            tongue(x + dx, base, f.size * 0.035, f.size * 0.2 * grow, f.t, f.seed + i, fade);
          }
        }
      }
      fires = fires.filter((f) => f.wait > 0 || f.t < (f.wall ? WALL_LIFE : BURN_LIFE));
    },
    clear() {
      fires = [];
      g.clear();
    },
  };
}
