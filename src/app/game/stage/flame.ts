/**
 * Lửa vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu hỏa lũy của binh lính hệ Hỏa dựng một vòng tường
 * lửa quanh chính người tung chiêu, đồng thời bén lửa lên từng đối thủ (Thiêu đốt). Lưỡi lửa là giọt mờ biên ba lớp
 * (soft.ts) chứ không phải đa giác, kèm tàn lửa bốc lên.
 */
import type { Container } from "pixi.js";
import type { Point } from "./rigs";
import { softLayer, softTongue } from "./soft";

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
  const soft = softLayer(parent);
  let fires: Fire[] = [];
  const tongue = (x: number, y: number, w: number, h: number, t: number, seed: number, a: number) =>
    softTongue(soft, x, y, w, h, t, seed, a, color);
  /** Tàn lửa bốc lên từ (x, y), lượn nhẹ rồi tắt; vị trí tính theo thời gian nên không cần lưu hạt. */
  const embers = (x: number, y: number, spread: number, rise: number, n: number, t: number, seed: number, a: number) => {
    for (let i = 0; i < n; i++) {
      const k = (t * 1.3 + i * 0.618 + seed * 0.1) % 1;
      const ex = x + Math.sin(i * 12.9 + seed) * spread + Math.sin(t * 6 + i) * spread * 0.25;
      const r = rise * (0.025 + 0.015 * ((i * 7) % 3));
      soft.glow({ x: ex, y: y - k * rise, w: r * (1 - k * 0.5), color: 0xffc35a, alpha: a * (1 - k) * 0.9 });
    }
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
      soft.begin();
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
          soft.glow({ x, y: y - rx * 0.05, w: rx * 3, h: rx * 0.9, color, alpha: 0.55 * fade * grow });
          soft.glow({ x, y: y - f.size * 0.2, w: rx * 2.6, h: f.size * 0.6, color, alpha: 0.18 * fade * grow });
          for (let i = 0; i < 14; i++) {
            const ang = (i / 14) * Math.PI * 2;
            const front = 0.6 + 0.4 * Math.sin(ang);
            const h = f.size * (0.34 + 0.14 * Math.sin(i * 2.3 + f.seed)) * grow * front;
            tongue(x + Math.cos(ang) * rx, y + Math.sin(ang) * rx * 0.22, f.size * 0.04, h, f.t, f.seed + i, fade * front);
          }
          embers(x, y - f.size * 0.1, rx, f.size * 0.55, 10, f.t, f.seed, fade * grow);
        } else {
          // Lửa bén: quầng sáng trên thân, vài lưỡi lửa và tàn lửa bốc lên.
          soft.glow({ x, y: y - f.size * 0.25, w: f.size * 0.42, h: f.size * 0.5, color, alpha: 0.35 * fade * grow });
          embers(x, y - f.size * 0.25, f.size * 0.09, f.size * 0.4, 6, f.t, f.seed, fade * grow);
          for (let i = 0; i < 4; i++) {
            const dx = (i - 1.5) * f.size * 0.06;
            const base = y - f.size * (0.15 + 0.12 * (i % 2));
            tongue(x + dx, base, f.size * 0.05, f.size * 0.3 * grow, f.t, f.seed + i, fade);
          }
        }
      }
      soft.end();
      fires = fires.filter((f) => f.wait > 0 || f.t < (f.wall ? WALL_LIFE : BURN_LIFE));
    },
    clear() {
      fires = [];
      soft.clear();
    },
  };
}
