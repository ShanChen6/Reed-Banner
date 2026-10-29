/**
 * Hỏa công liên kế vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu của quân sư hệ Hỏa phất cờ lệnh cho mũi
 * tên lửa vọt lên theo đường cung, trúng đối thủ này thì lửa nảy tiếp sang người kế bên. Chỗ trúng nổ vòng lửa và hiện
 * hai dấu mũi tên chúc xuống (Công giảm).
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Mũi tên bay (giây), nổ và dấu Công giảm tới hết `LIFE`. */
const FLIGHT = 0.26;
const LIFE = 0.95;

interface Link {
  readonly from: Point;
  readonly to: Point;
  /** Cỡ người (chiều cao), để cung bay và vòng lửa theo khung. */
  readonly size: number;
  wait: number;
  t: number;
}

export function fireChain(parent: Container, color: number) {
  const g = new Graphics();
  g.blendMode = "add";
  parent.addChild(g);
  let links: Link[] = [];
  // Điểm trên đường cung: vồng lên theo khoảng cách, cao nhất ở giữa.
  const arc = (l: Link, k: number) => {
    const lift = Math.min(l.size * 0.35, Math.hypot(l.to.x - l.from.x, l.to.y - l.from.y) * 0.35);
    return {
      x: l.from.x + (l.to.x - l.from.x) * k,
      y: l.from.y + (l.to.y - l.from.y) * k - lift * 4 * k * (1 - k),
    };
  };
  return {
    /** Mũi tên lửa bay từ `from` tới `to` (giữa thân người trúng), chờ `wait` giây. */
    link(from: Point, to: Point, size: number, wait = 0) {
      links.push({ from, to, size, wait, t: 0 });
    },
    update(dt: number) {
      g.clear();
      for (const l of links) {
        if (l.wait > 0) {
          l.wait -= dt;
          continue;
        }
        l.t += dt;
        if (l.t >= LIFE) continue;
        const w = l.size * 0.012;
        const k = Math.min(1, l.t / FLIGHT);
        if (k < 1) {
          // Đuôi lửa: chuỗi đốm nhỏ dần dọc cung đã bay, đầu tên sáng trắng.
          for (let i = 0; i < 10; i++) {
            const kk = Math.max(0, k - i * 0.03);
            const p = arc(l, kk);
            g.circle(p.x, p.y, w * (2.6 - i * 0.22)).fill({ color, alpha: 0.6 * (1 - i / 10) });
          }
          const head = arc(l, k);
          const prev = arc(l, Math.max(0, k - 0.05));
          g.moveTo(prev.x, prev.y).lineTo(head.x, head.y).stroke({ color: 0xffe6b0, width: w * 1.1, alpha: 1, cap: "round" });
          g.circle(head.x, head.y, w * 1.3).fill({ color: 0xffffff, alpha: 0.9 });
          continue;
        }
        // Chỗ trúng: vòng lửa nở rồi tan, hai mũi tên chúc xuống trôi dần (Công giảm).
        const s = (l.t - FLIGHT) / (LIFE - FLIGHT);
        const { x, y } = l.to;
        g.circle(x, y, l.size * (0.05 + 0.16 * s)).stroke({ color, width: w * 2.2 * (1 - s), alpha: 0.9 * (1 - s) });
        g.circle(x, y, l.size * 0.06 * (1 - s)).fill({ color: 0xffd98a, alpha: 0.7 * (1 - s) });
        for (const side of [-1, 1]) {
          const ax = x + side * l.size * 0.12;
          const ay = y - l.size * 0.12 + l.size * 0.1 * s;
          const r = l.size * 0.035;
          g.moveTo(ax - r, ay - r).lineTo(ax, ay).lineTo(ax + r, ay - r).stroke({ color: 0xff7a3a, width: w * 1.2, alpha: 1 - s, cap: "round", join: "round" });
          g.moveTo(ax, ay - r * 2.2).lineTo(ax, ay).stroke({ color: 0xff7a3a, width: w * 1.2, alpha: 1 - s, cap: "round" });
        }
      }
      links = links.filter((l) => l.wait > 0 || l.t < LIFE);
    },
    clear() {
      links = [];
      g.clear();
    },
  };
}
