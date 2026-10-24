/**
 * Sét vẽ trên cả sân (hệ tọa độ của stage PixiJS): tia phóng từ quả cầu tới đối thủ khi đánh thường và ra chiêu,
 * sét giáng từ trời xuống từng đối thủ khi tuyệt chiêu. Đường sét gấp khúc ngẫu nhiên, vẽ lại mỗi khung để
 * chớp nháy rồi tắt dần.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Thời lượng một tia (giây). */
const LIFE = 0.4;

interface Bolt {
  readonly from: Point;
  readonly to: Point;
  /** Độ dày lõi tia. */
  readonly width: number;
  /** Chờ bao lâu (giây) rồi mới hiện, để sét giáng lần lượt. */
  wait: number;
  t: number;
}

/** Đường gấp khúc từ `a` tới `b`: lệch ngang theo phương vuông góc, mạnh nhất ở giữa. */
function jagged(a: Point, b: Point, jitter: number): Point[] {
  const steps = Math.max(4, Math.round(Math.hypot(b.x - a.x, b.y - a.y) / 40));
  const nx = -(b.y - a.y);
  const ny = b.x - a.x;
  const len = Math.hypot(nx, ny) || 1;
  const pts: Point[] = [a];
  for (let i = 1; i < steps; i++) {
    const k = i / steps;
    const off = (Math.random() - 0.5) * jitter * Math.sin(Math.PI * k);
    pts.push({ x: a.x + (b.x - a.x) * k + (nx / len) * off, y: a.y + (b.y - a.y) * k + (ny / len) * off });
  }
  pts.push(b);
  return pts;
}

export function lightning(parent: Container, color: number) {
  const g = new Graphics();
  g.blendMode = "add";
  parent.addChild(g);
  let bolts: Bolt[] = [];
  const draw = (pts: readonly Point[], width: number, c: number, alpha: number) => {
    g.moveTo(pts[0]!.x, pts[0]!.y);
    for (const p of pts.slice(1)) g.lineTo(p.x, p.y);
    g.stroke({ color: c, width, alpha, join: "round", cap: "round" });
  };
  return {
    /** Tia phóng ngang từ `from` tới `to`. */
    bolt(from: Point, to: Point, width: number) {
      bolts.push({ from, to, width, wait: 0, t: 0 });
    },
    /** Sét giáng từ mép trên sân xuống `to`, chờ `wait` giây. */
    strike(to: Point, width: number, wait = 0) {
      const from = { x: to.x + (Math.random() - 0.5) * width * 8, y: -width * 4 };
      bolts.push({ from, to, width, wait, t: 0 });
    },
    update(dt: number) {
      g.clear();
      for (const b of bolts) {
        if (b.wait > 0) {
          b.wait -= dt;
          continue;
        }
        b.t += dt;
        const fade = 1 - b.t / LIFE;
        if (fade <= 0) continue;
        // Chớp: vài khung đầu sáng hẳn, sau đó nháy tắt dần.
        const flicker = b.t < 0.08 ? 1 : 0.55 + 0.45 * Math.random();
        const pts = jagged(b.from, b.to, Math.hypot(b.to.x - b.from.x, b.to.y - b.from.y) * 0.12);
        draw(pts, b.width * 3.2, color, 0.25 * fade * flicker);
        draw(pts, b.width * 1.4, color, 0.7 * fade * flicker);
        draw(pts, b.width * 0.5, 0xffffff, fade * flicker);
        // Nhánh phụ tách ra từ giữa tia.
        const mid = pts[Math.floor(pts.length / 2)]!;
        const fork = { x: mid.x + (b.to.x - b.from.x) * 0.2 + (Math.random() - 0.5) * b.width * 6, y: mid.y + (b.to.y - b.from.y) * 0.2 + b.width * 3 };
        draw(jagged(mid, fork, b.width * 4), b.width * 0.6, color, 0.6 * fade * flicker);
        // Đốm lóe ở chỗ trúng.
        g.circle(b.to.x, b.to.y, b.width * (3 + 2 * (1 - fade))).fill({ color, alpha: 0.45 * fade });
        g.circle(b.to.x, b.to.y, b.width * 1.4).fill({ color: 0xffffff, alpha: 0.8 * fade });
      }
      bolts = bolts.filter((b) => b.wait > 0 || b.t < LIFE);
    },
    clear() {
      bolts = [];
      g.clear();
    },
    destroy() {
      g.destroy();
    },
  };
}

export type Lightning = ReturnType<typeof lightning>;
