/**
 * Thiết trận vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu của quân sư hệ Kim làm khiên giáp đối thủ nứt
 * vỡ (Thủ giảm) và dấu mũi tên vàng dâng lên quanh đồng đội (Công tăng).
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Thời lượng (giây). */
const LIFE = 1.2;

interface Mark {
  readonly at: Point;
  readonly size: number;
  /** `break`: khiên nứt trên đối thủ; `rally`: mũi tên vàng dâng lên ở đồng đội. */
  readonly kind: "break" | "rally";
  wait: number;
  t: number;
}

export function ironFormation(parent: Container, color: number) {
  const g = new Graphics();
  parent.addChild(g);
  let marks: Mark[] = [];
  return {
    /** Khiên nứt trên đối thủ đứng ở `at` (giữa thân). */
    shatter(at: Point, size: number, wait = 0) {
      marks.push({ at, size, kind: "break", wait, t: 0 });
    },
    /** Mũi tên vàng dâng lên ở đồng đội đứng ở `at` (giữa hai bàn chân). */
    rally(at: Point, size: number, wait = 0) {
      marks.push({ at, size, kind: "rally", wait, t: 0 });
    },
    update(dt: number) {
      g.clear();
      for (const m of marks) {
        if (m.wait > 0) {
          m.wait -= dt;
          continue;
        }
        m.t += dt;
        if (m.t >= LIFE) continue;
        const fade = m.t < LIFE * 0.6 ? 1 : 1 - (m.t - LIFE * 0.6) / (LIFE * 0.4);
        const { x, y } = m.at;
        const s = m.size;
        if (m.kind === "break") {
          // Khiên lục giác hiện ra, nứt đôi rồi hai nửa rơi tách xuống.
          const r = s * 0.11;
          const split = Math.max(0, (m.t - 0.25) / 0.6);
          for (const side of [-1, 1]) {
            const ox = side * r * 0.5 * split;
            const oy = s * 0.35 * split * split;
            const pts: number[] = [];
            for (let i = 0; i <= 3; i++) {
              const a = -Math.PI / 2 + side * (i / 3) * Math.PI;
              pts.push(x + ox + Math.cos(a) * r, y + oy + Math.sin(a) * r);
            }
            g.poly(pts).fill({ color: 0x6d747c, alpha: 0.85 * fade }).stroke({ color, width: s * 0.008, alpha: fade });
          }
          if (m.t > 0.2) {
            g.moveTo(x, y - r).lineTo(x - r * 0.15, y - r * 0.3).lineTo(x + r * 0.12, y + r * 0.2).lineTo(x, y + r)
              .stroke({ color: 0xffffff, width: s * 0.008, alpha: fade * (1 - split) });
          }
          // Mũi tên đỏ chỉ xuống: Thủ giảm.
          const ay = y + r * 1.6 + s * 0.05 * Math.min(1, m.t * 3);
          g.poly([x - r * 0.4, ay - r * 0.3, x + r * 0.4, ay - r * 0.3, x, ay + r * 0.3]).fill({ color: 0xe0503a, alpha: fade });
        } else {
          // Ba mũi tên vàng dâng lên quanh người: Công tăng.
          for (let i = 0; i < 3; i++) {
            const k = Math.min(1, Math.max(0, (m.t - i * 0.1) / 0.8));
            const ax = x + (i - 1) * s * 0.12;
            const ay = y - s * (0.2 + 0.6 * k);
            const w = s * 0.04;
            g.poly([ax - w, ay + w * 0.8, ax, ay - w * 0.6, ax + w, ay + w * 0.8, ax, ay + w * 0.2]).fill({ color: 0xffcf4a, alpha: fade * (1 - k * 0.4) });
          }
          g.ellipse(x, y, s * 0.25, s * 0.05).stroke({ color: 0xffcf4a, width: s * 0.008, alpha: 0.7 * fade });
        }
      }
      marks = marks.filter((m) => m.wait > 0 || m.t < LIFE);
    },
    clear() {
      marks = [];
      g.clear();
    },
  };
}
