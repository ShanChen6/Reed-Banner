/**
 * Ấn trạng thái trên đầu nhân vật trong hiệu ứng tuyệt chiêu (Khiêu khích, Câm lặng...): quầng sáng mờ biên, đĩa sẫm viền
 * màu, biểu tượng vẽ bằng nét tròn đầu, bật nảy khi hiện, lơ lửng nhẹ.
 */
import { Container, Graphics } from "pixi.js";
import { softLayer } from "./soft";

const clamp01 = (k: number) => Math.min(1, Math.max(0, k));
/** Bật nảy quá đà một chút rồi về 1. */
export const pop = (k: number) => {
  const q = clamp01(k);
  return 1 + 2.2 * (q - 1) ** 3 + 1.2 * (q - 1) ** 2;
};

export interface BadgeDraw {
  readonly x: number;
  readonly y: number;
  /** Bán kính đĩa (điểm ảnh) trước khi nảy. */
  readonly r: number;
  /** Thời gian từ lúc ấn hiện (giây). */
  readonly t: number;
  readonly alpha: number;
  readonly color: number;
  /** Vẽ biểu tượng trong đĩa tâm (x, y) bán kính r. */
  readonly icon: (g: Graphics, x: number, y: number, r: number, a: number) => void;
}

export function badgeLayer(parent: Container) {
  const glow = softLayer(parent);
  const g = new Graphics();
  parent.addChild(g);
  return {
    begin() {
      glow.begin();
      g.clear();
    },
    draw(d: BadgeDraw) {
      if (d.t <= 0 || d.alpha <= 0.01) return;
      const k = pop(d.t / 0.25);
      const y = d.y - Math.sin(d.t * 5) * d.r * 0.12;
      const r = d.r * k;
      glow.glow({ x: d.x, y, w: r * 4.6, color: d.color, alpha: 0.6 * d.alpha });
      g.circle(d.x, y, r * 1.08).fill({ color: 0x1a1210, alpha: 0.82 * d.alpha });
      g.circle(d.x, y, r).stroke({ color: d.color, width: r * 0.14, alpha: d.alpha });
      g.circle(d.x, y, r * 0.8).stroke({ color: 0xffffff, width: r * 0.035, alpha: 0.35 * d.alpha });
      d.icon(g, d.x, y, r, d.alpha);
    },
    end() {
      glow.end();
    },
    clear() {
      glow.clear();
      g.clear();
    },
  };
}
