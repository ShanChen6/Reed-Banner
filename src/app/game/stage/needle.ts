/**
 * Ngân châm vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu của pháp sư hệ Kim bắn tỏa chùm kim bạc từ
 * đầu trượng tới từng đối thủ, kim cắm tới thì lóe tia kim loại rồi tan.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Kim bay (giây), lóe ở chỗ trúng tới hết `LIFE`. */
const FLIGHT = 0.22;
const LIFE = 0.75;

interface Needle {
  readonly from: Point;
  readonly to: Point;
  /** Độ dày kim. */
  readonly width: number;
  wait: number;
  t: number;
}

export function needleVolley(parent: Container, color: number) {
  const g = new Graphics();
  g.blendMode = "add";
  parent.addChild(g);
  let needles: Needle[] = [];
  return {
    /** Bắn ba kim lệch nhau từ `from` tới quanh `to`, chờ `wait` giây. */
    volley(from: Point, to: Point, width: number, wait = 0) {
      for (let i = 0; i < 3; i++) {
        const spread = (i - 1) * width * 6;
        needles.push({ from, to: { x: to.x + spread * 0.4, y: to.y + spread }, width, wait: wait + i * 0.05, t: 0 });
      }
    },
    update(dt: number) {
      g.clear();
      for (const n of needles) {
        if (n.wait > 0) {
          n.wait -= dt;
          continue;
        }
        n.t += dt;
        if (n.t >= LIFE) continue;
        const dx = n.to.x - n.from.x;
        const dy = n.to.y - n.from.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const k = Math.min(1, n.t / FLIGHT);
        const hx = n.from.x + dx * k;
        const hy = n.from.y + dy * k;
        const w = n.width;
        if (k < 1) {
          // Kim bạc dài, vệt sáng mảnh phía sau.
          const tail = Math.min(len * k, w * 40);
          g.moveTo(hx - ux * tail, hy - uy * tail).lineTo(hx, hy).stroke({ color, width: w * 1.2, alpha: 0.45, cap: "round" });
          g.moveTo(hx - ux * w * 9, hy - uy * w * 9).lineTo(hx, hy).stroke({ color: 0xffffff, width: w * 0.7, alpha: 1, cap: "round" });
          continue;
        }
        // Chỗ trúng: chữ thập lóe và vài tia kim loại tỏa ra rồi tắt.
        const s = (n.t - FLIGHT) / (LIFE - FLIGHT);
        const r = w * (4 + 8 * s);
        g.moveTo(hx - r, hy).lineTo(hx + r, hy).stroke({ color: 0xffffff, width: w * 0.6, alpha: 1 - s });
        g.moveTo(hx, hy - r).lineTo(hx, hy + r).stroke({ color: 0xffffff, width: w * 0.6, alpha: 1 - s });
        g.circle(hx, hy, w * 2.2 * (1 - s)).fill({ color, alpha: 0.7 * (1 - s) });
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + 0.4;
          g.moveTo(hx + Math.cos(a) * r * 0.6, hy + Math.sin(a) * r * 0.6)
            .lineTo(hx + Math.cos(a) * r * 1.2, hy + Math.sin(a) * r * 1.2)
            .stroke({ color, width: w * 0.4, alpha: 0.8 * (1 - s) });
        }
      }
      needles = needles.filter((n) => n.wait > 0 || n.t < LIFE);
    },
    clear() {
      needles = [];
      g.clear();
    },
  };
}
