/**
 * Vòm khiên đất vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu phòng thủ của binh lính hệ Thổ dựng
 * một vòm đá quanh từng đồng đội. Vòm mọc từ mặt đất, giữ một nhịp với các lớp đá xếp ngang, bụi tung ở chân,
 * rồi tan dần.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Mọc lên, giữ, tan (giây). */
const RISE = 0.25;
const HOLD = 0.9;
const LIFE = 1.25;

interface Ward {
  /** Điểm giữa hai bàn chân người được che. */
  readonly at: Point;
  /** Chiều cao người được che (px trên stage). */
  readonly size: number;
  wait: number;
  t: number;
  readonly dust: { x: number; vx: number; vy: number; r: number }[];
}

export function earthWard(parent: Container, color: number) {
  const g = new Graphics();
  parent.addChild(g);
  let wards: Ward[] = [];
  return {
    /** Dựng vòm quanh người đứng ở `at`, chờ `wait` giây. */
    cover(at: Point, size: number, wait = 0) {
      const dust = Array.from({ length: 10 }, () => ({
        x: (Math.random() - 0.5) * size * 0.6,
        vx: (Math.random() - 0.5) * size * 0.5,
        vy: -size * (0.25 + Math.random() * 0.35),
        r: size * (0.008 + Math.random() * 0.012),
      }));
      wards.push({ at, size, wait, t: 0, dust });
    },
    update(dt: number) {
      g.clear();
      for (const w of wards) {
        if (w.wait > 0) {
          w.wait -= dt;
          continue;
        }
        w.t += dt;
        const grow = Math.min(1, w.t / RISE);
        const fade = w.t < HOLD ? 1 : Math.max(0, 1 - (w.t - HOLD) / (LIFE - HOLD));
        if (fade <= 0) continue;
        const rx = w.size * 0.36;
        const ry = w.size * 0.74 * (1 - (1 - grow) ** 3);
        const { x, y } = w.at;
        // Vòm: nửa elip trên mặt đất, nền mờ và viền đậm.
        g.ellipse(x, y, rx, ry).fill({ color, alpha: 0.16 * fade });
        g.ellipse(x, y, rx, ry).stroke({ color, width: w.size * 0.025, alpha: 0.85 * fade });
        // Các lớp đá xếp ngang trong vòm.
        for (const k of [0.3, 0.55, 0.78]) {
          const yy = y - ry * k;
          const half = rx * Math.sqrt(1 - k * k);
          g.moveTo(x - half, yy).lineTo(x + half, yy).stroke({ color, width: w.size * 0.012, alpha: 0.5 * fade });
        }
        // Vành đất dưới chân.
        g.ellipse(x, y, rx * 1.15, rx * 0.22).stroke({ color, width: w.size * 0.02, alpha: 0.7 * fade });
        // Bụi đá tung lúc vòm mọc.
        for (const d of w.dust) {
          const s = Math.min(w.t, 0.6);
          const dx = x + d.x + d.vx * s;
          const dy = y + d.vy * s + w.size * 0.9 * s * s;
          g.circle(dx, Math.min(y, dy), d.r).fill({ color, alpha: 0.8 * fade * (1 - s / 0.6) });
        }
      }
      wards = wards.filter((w) => w.wait > 0 || w.t < LIFE);
    },
    clear() {
      wards = [];
      g.clear();
    },
  };
}
