/**
 * Mưa lửa vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu của pháp sư hệ Hỏa gọi cầu lửa từ trời rơi chéo
 * xuống từng đối thủ, kéo đuôi lửa, chạm đất nổ một quầng sáng, sóng xung kích trên mặt đất, tàn lửa văng và khói bốc.
 * Mọi nét là texture mờ biên (soft.ts) để lửa trông mịn; chỉ sóng xung kích là nét Graphics mảnh.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";
import { softLayer } from "./soft";

/** Rơi tới `FALL`, nổ và tàn lửa tới hết `LIFE` (giây). */
const FALL = 0.35;
const LIFE = 1.05;
const CORE = 0xfff1c4;
const HOT = 0xffa43a;

interface Meteor {
  /** Điểm chạm: giữa hai bàn chân người bị trúng. */
  readonly at: Point;
  readonly size: number;
  /** Phía cầu lửa bay tới: 1 từ trái sang, -1 từ phải sang. */
  readonly dir: number;
  wait: number;
  t: number;
  readonly seed: number;
  readonly sparks: readonly { readonly vx: number; readonly vy: number; readonly r: number }[];
  readonly puffs: readonly { readonly dx: number; readonly r: number; readonly v: number }[];
}

export function fireRain(parent: Container, color: number) {
  // Khói vẽ thường (không cộng sáng) và nằm dưới lửa.
  const smoke = softLayer(parent, "normal");
  const soft = softLayer(parent);
  const ring = new Graphics();
  ring.blendMode = "add";
  parent.addChild(ring);
  let meteors: Meteor[] = [];
  return {
    /** Cầu lửa rơi xuống người đứng ở `at`, bay tới từ phía `dir`, chờ `wait` giây. */
    fall(at: Point, size: number, dir: number, wait = 0) {
      const sparks = Array.from({ length: 16 }, () => ({
        vx: (Math.random() - 0.5) * size * 1.4,
        vy: -size * (0.4 + Math.random() * 0.7),
        r: size * (0.012 + Math.random() * 0.014),
      }));
      const puffs = Array.from({ length: 5 }, () => ({
        dx: (Math.random() - 0.5) * size * 0.3,
        r: size * (0.1 + Math.random() * 0.08),
        v: size * (0.12 + Math.random() * 0.12),
      }));
      meteors.push({ at, size, dir, wait, t: 0, seed: Math.random() * 10, sparks, puffs });
    },
    update(dt: number) {
      soft.begin();
      smoke.begin();
      ring.clear();
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
        const vx = hit.x - start.x;
        const vy = hit.y - start.y;
        // Đuôi lửa hướng ngược chiều bay: đỉnh giọt (texture hướng lên) quay về phía sau.
        const tail = Math.atan2(-vx, vy);
        if (m.t < FALL) {
          const k = (m.t / FALL) ** 2;
          const x = start.x + vx * k;
          const y = start.y + vy * k;
          const grow = Math.min(1, m.t / 0.08);
          // Vệt sáng mờ dọc đường bay, chuỗi tàn lửa rơi lại phía sau.
          for (let i = 1; i <= 9; i++) {
            const back = i * 0.045 + 0.01 * Math.sin(i * 7 + m.seed);
            if (back > k + 0.05) break;
            const jx = Math.sin(i * 3.7 + m.seed + m.t * 20) * s * 0.025;
            soft.glow({ x: x - vx * back + jx, y: y - vy * back, w: s * 0.06 * (1 - i / 10), color: HOT, alpha: 0.75 * (1 - i / 10) });
          }
          // Đuôi lửa ba lớp, dài dần khi rơi nhanh.
          const tl = s * (0.35 + 0.25 * k);
          soft.flame({ x, y, w: s * 0.26, h: tl * 1.15, color, alpha: 0.65 * grow, rot: tail });
          soft.flame({ x, y, w: s * 0.17, h: tl * 0.85, color: HOT, alpha: 0.8 * grow, rot: tail });
          soft.flame({ x, y, w: s * 0.09, h: tl * 0.5, color: CORE, alpha: 0.9 * grow, rot: tail });
          // Đầu cầu lửa: quầng màu hệ, lõi vàng trắng chớp nhẹ.
          const pulse = 1 + 0.08 * Math.sin(m.t * 60);
          soft.glow({ x, y, w: s * 0.32 * pulse * grow, color, alpha: 0.55 });
          soft.glow({ x, y, w: s * 0.15 * pulse * grow, color: HOT, alpha: 0.95 });
          soft.glow({ x, y, w: s * 0.08 * grow, color: CORE, alpha: 1 });
          // Ánh lửa hắt xuống đất báo trước điểm rơi.
          soft.glow({ x: at.x, y: at.y, w: s * 0.5 * k, h: s * 0.1 * k, color, alpha: 0.5 * k });
          continue;
        }
        const k = m.t - FALL;
        const e = k / (LIFE - FALL);
        const fade = 1 - e;
        // Chớp nổ: quầng lớn tắt nhanh, lõi trắng tắt nhanh hơn nữa.
        const flash = Math.max(0, 1 - k / 0.22);
        soft.glow({ x: hit.x, y: hit.y, w: s * (0.45 + 0.5 * e), color, alpha: 0.7 * fade * fade });
        soft.glow({ x: hit.x, y: hit.y, w: s * (0.3 + 0.25 * (1 - flash)), color: HOT, alpha: 0.9 * flash });
        soft.glow({ x: hit.x, y: hit.y, w: s * 0.2, color: CORE, alpha: flash });
        // Vết cháy sáng trên mặt đất.
        soft.glow({ x: at.x, y: at.y, w: s * (0.55 + 0.3 * e), h: s * (0.12 + 0.05 * e), color, alpha: 0.6 * fade });
        // Sóng xung kích: hai vòng elip mảnh loang ra trên mặt đất.
        for (const [lag, wid] of [[0, 0.006], [0.08, 0.004]] as const) {
          const q = Math.max(0, k - lag) / (LIFE - FALL);
          if (q <= 0) continue;
          const ease = 1 - (1 - Math.min(1, q * 1.6)) ** 3;
          ring.ellipse(at.x, at.y, s * (0.1 + 0.5 * ease), s * (0.03 + 0.11 * ease))
            .stroke({ color: HOT, width: s * wid * (1 - q), alpha: 0.55 * (1 - q) * (1 - q) });
        }
        // Khói xám bốc lên, nở dần.
        for (const p of m.puffs) {
          const r = p.r * (0.6 + e * 1.2);
          smoke.glow({ x: hit.x + p.dx * (0.5 + e), y: hit.y - p.v * k * 2, w: r * 2, color: 0x2a211c, alpha: 0.45 * Math.sin(Math.PI * Math.min(1, e * 1.3)) });
        }
        // Tàn lửa văng lên rồi rơi, nhỏ dần.
        for (const p of m.sparks) {
          const y = hit.y + p.vy * k + s * 2 * k * k;
          if (y > at.y) continue;
          const x = hit.x + p.vx * k;
          soft.glow({ x, y, w: p.r * 2.4 * (1 - e * 0.6), color: HOT, alpha: fade });
          soft.glow({ x, y, w: p.r * 1.1, color: CORE, alpha: fade });
        }
      }
      soft.end();
      smoke.end();
      meteors = meteors.filter((m) => m.wait > 0 || m.t < LIFE);
    },
    clear() {
      meteors = [];
      soft.clear();
      smoke.clear();
      ring.clear();
    },
  };
}
