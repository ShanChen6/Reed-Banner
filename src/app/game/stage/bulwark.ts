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
        const h = w.size * 0.56 * grow * sink;
        const pw = w.size * 0.085;
        // Đứng hẳn phía trước người tung chiêu để không che nhân vật.
        const x0 = w.at.x + w.dir * w.size * 0.5;
        // Bóng đổ và vết nứt nền dưới chân tường.
        g.ellipse(x0, w.at.y, pw * 3.2, pw * 0.45).fill({ color: 0x000000, alpha: 0.35 * sink });
        // Năm khiên thép đứng chồng mép, khiên giữa cao nhất: nửa sáng nửa tối cho ra khối, viền đồng, gờ ngang và núm khiên.
        for (const i of [0, 4, 1, 3, 2]) {
          const k = i - 2;
          const px = x0 + k * pw * 0.82;
          const ph = h * (1 - Math.abs(k) * 0.1);
          const top = w.at.y - ph;
          const r = pw * 0.5;
          const outline = [px - r, w.at.y, px - r, top + r, px, top, px + r, top + r, px + r, w.at.y];
          g.poly(outline).fill({ color: 0x3e444c, alpha: 0.95 * sink });
          g.poly([px - r, w.at.y, px - r, top + r, px, top, px, w.at.y]).fill({ color: 0x7d858f, alpha: 0.9 * sink });
          g.poly([px - r * 0.78, w.at.y - pw * 0.15, px - r * 0.78, top + r * 1.05, px - r * 0.55, top + r * 0.8, px - r * 0.55, w.at.y - pw * 0.15])
            .fill({ color: 0xc9d0d8, alpha: 0.35 * sink });
          for (const band of [0.22, 0.78]) {
            const by = w.at.y - ph * band;
            g.rect(px - r, by - pw * 0.05, r * 2, pw * 0.1).fill({ color: 0xb08a4a, alpha: 0.9 * sink });
          }
          g.poly(outline).stroke({ color: 0xd4ae62, width: w.size * 0.007, alpha: sink });
          const bossY = w.at.y - ph * 0.5;
          g.circle(px, bossY, pw * 0.2).fill({ color: 0xb08a4a, alpha: sink }).stroke({ color: 0x5a4524, width: w.size * 0.003, alpha: sink });
          g.circle(px - pw * 0.06, bossY - pw * 0.06, pw * 0.07).fill({ color: 0xf3dfa8, alpha: 0.8 * sink });
        }
        // Vệt ánh kim chạy ngang mặt tường.
        if (w.t > RISE) {
          const s = ((w.t - RISE) / (HOLD - RISE)) % 1;
          const sx = x0 + (s - 0.5) * pw * 4;
          shine.poly([sx - pw * 0.4, w.at.y, sx + pw * 0.1, w.at.y - h, sx + pw * 0.5, w.at.y - h, sx, w.at.y])
            .fill({ color: 0xffffff, alpha: 0.35 * sink });
        }
        // Bụi kim loại tung lên lúc tường mọc.
        if (w.t < RISE * 2) g.ellipse(x0, w.at.y - pw * 0.2, pw * 3.4 * grow, pw * 0.7).fill({ color, alpha: 0.4 * (1 - w.t / (RISE * 2)) });
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
