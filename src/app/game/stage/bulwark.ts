/**
 * Tường thép vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu tự thủ của binh lính hệ Kim dựng một dãy tấm
 * thép trước mặt người tung chiêu, ánh kim lướt qua mặt tường rồi tường chìm xuống.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Mọc lên tới `RISE`, giữ tới `HOLD`, chìm hết `LIFE` (giây). */
const RISE = 0.2;
const HOLD = 1;
const LIFE = 1.3;

interface Wall {
  readonly at: Point;
  readonly size: number;
  /** Hướng mặt: 1 là sang phải, -1 là sang trái. */
  readonly dir: number;
  t: number;
}

export function steelBulwark(parent: Container, color: number) {
  const g = new Graphics();
  parent.addChild(g);
  const shine = new Graphics();
  shine.blendMode = "add";
  parent.addChild(shine);
  let walls: Wall[] = [];
  return {
    /** Dựng tường trước người đứng ở `at` (giữa hai bàn chân), quay về hướng `dir`. */
    raise(at: Point, size: number, dir: number) {
      walls.push({ at, size, dir, t: 0 });
    },
    update(dt: number) {
      g.clear();
      shine.clear();
      for (const w of walls) {
        w.t += dt;
        if (w.t >= LIFE) continue;
        const grow = 1 - (1 - Math.min(1, w.t / RISE)) ** 3;
        const sink = w.t < HOLD ? 1 : 1 - (w.t - HOLD) / (LIFE - HOLD);
        const h = w.size * 0.62 * grow * sink;
        const pw = w.size * 0.07;
        const x0 = w.at.x + w.dir * w.size * 0.24;
        // Năm tấm thép xếp chéo nhẹ, tấm giữa cao nhất; viền và đinh tán.
        for (let i = 0; i < 5; i++) {
          const k = i - 2;
          const px = x0 + w.dir * Math.abs(k) * pw * 0.25 + k * pw * 0.95;
          const ph = h * (1 - Math.abs(k) * 0.12);
          const top = w.at.y - ph;
          g.poly([px - pw / 2, w.at.y, px - pw / 2, top + pw * 0.3, px, top, px + pw / 2, top + pw * 0.3, px + pw / 2, w.at.y])
            .fill({ color: 0x6d747c, alpha: 0.9 * sink })
            .stroke({ color, width: w.size * 0.006, alpha: sink });
          for (const r of [0.25, 0.6]) g.circle(px, w.at.y - ph * r, pw * 0.08).fill({ color: 0xdfe4ea, alpha: sink });
        }
        // Vệt ánh kim chạy ngang mặt tường.
        if (w.t > RISE) {
          const s = ((w.t - RISE) / (HOLD - RISE)) % 1;
          const sx = x0 + (s - 0.5) * pw * 5;
          shine.poly([sx - pw * 0.4, w.at.y, sx + pw * 0.1, w.at.y - h, sx + pw * 0.5, w.at.y - h, sx, w.at.y])
            .fill({ color: 0xffffff, alpha: 0.35 * sink });
        }
        // Bụi kim loại dưới chân tường.
        g.ellipse(x0, w.at.y, pw * 3, pw * 0.4).fill({ color, alpha: 0.35 * sink });
      }
      walls = walls.filter((w) => w.t < LIFE);
    },
    clear() {
      walls = [];
      g.clear();
      shine.clear();
    },
  };
}
