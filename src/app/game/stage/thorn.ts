/**
 * Kinh cức triền thân vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu của pháp sư hệ Mộc làm dây gai mọc từ
 * đất quấn xoắn quanh từng đối thủ, rồi hạt sáng xanh bay về người tung chiêu (hút máu).
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Dây mọc tới `GROW`, hạt bay tới hết `LIFE` (giây). */
const GROW = 0.35;
const LIFE = 1.3;

interface Bind {
  /** Giữa hai bàn chân người bị quấn. */
  readonly at: Point;
  /** Chỗ hạt sáng bay về. */
  readonly to: Point;
  readonly size: number;
  wait: number;
  t: number;
}

export function thornBind(parent: Container, color: number) {
  const g = new Graphics();
  parent.addChild(g);
  const glow = new Graphics();
  glow.blendMode = "add";
  parent.addChild(glow);
  let binds: Bind[] = [];
  return {
    /** Quấn người đứng ở `at`, hút sinh khí về `to`, chờ `wait` giây. */
    bind(at: Point, to: Point, size: number, wait = 0) {
      binds.push({ at, to, size, wait, t: 0 });
    },
    update(dt: number) {
      g.clear();
      glow.clear();
      for (const b of binds) {
        if (b.wait > 0) {
          b.wait -= dt;
          continue;
        }
        b.t += dt;
        if (b.t >= LIFE) continue;
        const { at, to, size: s } = b;
        const grow = Math.min(1, b.t / GROW);
        const fade = b.t < LIFE * 0.65 ? 1 : 1 - (b.t - LIFE * 0.65) / (LIFE * 0.35);
        // Hai dây gai xoắn ốc quấn từ chân lên, gai nhọn chĩa ra ngoài.
        for (const phase of [0, Math.PI]) {
          const steps = 24;
          const pts: number[] = [];
          for (let i = 0; i <= steps * grow; i++) {
            const k = i / steps;
            const ang = phase + k * Math.PI * 5;
            pts.push(at.x + Math.cos(ang) * s * 0.14, at.y - k * s * 0.7 + Math.sin(ang) * s * 0.03);
          }
          if (pts.length < 4) continue;
          g.moveTo(pts[0]!, pts[1]!);
          for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i]!, pts[i + 1]!);
          g.stroke({ color: 0x5a3b1e, width: s * 0.014, alpha: fade, cap: "round", join: "round" });
          g.moveTo(pts[0]!, pts[1]!);
          for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i]!, pts[i + 1]!);
          g.stroke({ color, width: s * 0.006, alpha: fade, cap: "round", join: "round" });
          for (let i = 6; i < pts.length; i += 6) {
            const x = pts[i]!;
            const y = pts[i + 1]!;
            const out = x > at.x ? 1 : -1;
            g.poly([x, y - s * 0.008, x + out * s * 0.03, y, x, y + s * 0.008]).fill({ color: 0x3c2812, alpha: fade });
          }
        }
        // Hạt sáng xanh bay về người tung chiêu.
        const k = Math.min(1, Math.max(0, (b.t - GROW) / 0.6));
        if (k > 0 && k < 1) {
          const e = k * k * (3 - 2 * k);
          const from = { x: at.x, y: at.y - s * 0.4 };
          const dist = Math.hypot(to.x - from.x, to.y - from.y);
          for (let i = 0; i < 4; i++) {
            const lag = Math.max(0, e - i * 0.08);
            const x = from.x + (to.x - from.x) * lag;
            const y = from.y + (to.y - from.y) * lag - Math.sin(Math.PI * lag) * dist * 0.2;
            glow.circle(x, y, s * 0.012).fill({ color, alpha: 0.8 });
            glow.circle(x, y, s * 0.005).fill({ color: 0xffffff, alpha: 0.9 });
          }
        }
      }
      binds = binds.filter((b) => b.wait > 0 || b.t < LIFE);
    },
    clear() {
      binds = [];
      g.clear();
      glow.clear();
    },
  };
}
