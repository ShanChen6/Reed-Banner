/**
 * Phong đao vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu một người của tướng sĩ hệ Phong chém ba lưỡi gió
 * hình trăng khuyết liên tiếp qua đối thủ, rồi một cơn lốc cuốn quanh chân họ (xoáy bàn cờ), lá và bụi bay vòng lên.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Mỗi lưỡi gió quét trong `CUT`, cách nhau `GAP`; lốc nổi lên sau lưỡi cuối, tan hết `LIFE` (giây). */
const CUT = 0.14;
const GAP = 0.11;
const LIFE = 1.3;

interface Gale {
  /** Giữa hai bàn chân người bị chém. */
  readonly at: Point;
  readonly size: number;
  /** Phía lưỡi gió bổ tới: 1 từ trái sang, -1 từ phải sang. */
  readonly dir: number;
  wait: number;
  t: number;
  readonly specks: readonly { readonly phase: number; readonly rise: number; readonly r: number }[];
}

/** Ba nhát chém: góc nghiêng và độ cao giữa vệt (phần chiều cao người). */
const CUTS = [
  { tilt: -0.5, k: 0.62 },
  { tilt: 0.45, k: 0.45 },
  { tilt: -0.15, k: 0.3 },
] as const;

export function galeSlash(parent: Container, color: number) {
  const g = new Graphics();
  g.blendMode = "add";
  parent.addChild(g);
  let gales: Gale[] = [];
  return {
    /** Chém người đứng ở `at`, bổ tới từ phía `dir`, chờ `wait` giây. */
    slash(at: Point, size: number, dir: number, wait = 0) {
      const specks = Array.from({ length: 14 }, () => ({
        phase: Math.random() * Math.PI * 2,
        rise: 0.3 + Math.random() * 0.5,
        r: size * (0.006 + Math.random() * 0.008),
      }));
      gales.push({ at, size, dir, wait, t: 0, specks });
    },
    update(dt: number) {
      g.clear();
      for (const w of gales) {
        if (w.wait > 0) {
          w.wait -= dt;
          continue;
        }
        w.t += dt;
        if (w.t >= LIFE) continue;
        const { at, size: s, dir } = w;
        // Lưỡi gió: cung mảnh quét ngang qua thân, dày ở giữa, tắt nhanh sau khi quét xong.
        CUTS.forEach((c, n) => {
          const t = w.t - n * GAP;
          if (t <= 0) return;
          const reach = Math.min(1, t / CUT);
          const fade = t < CUT ? 1 : Math.max(0, 1 - (t - CUT) / 0.3);
          if (fade <= 0) return;
          const cx = at.x;
          const cy = at.y - s * c.k;
          const half = s * 0.32;
          const steps = 14;
          const outer: number[] = [];
          const inner: number[] = [];
          for (let i = 0; i <= steps; i++) {
            const u = (i / steps) * reach;
            const x = cx + dir * (u * 2 - 1) * half;
            const bow = Math.sin(u * Math.PI) * s * 0.06;
            const y = cy + (u * 2 - 1) * half * c.tilt - bow;
            const thick = Math.sin((i / steps) * Math.PI) * s * 0.022;
            outer.push(x, y - thick);
            inner.unshift(x, y + thick);
          }
          g.poly([...outer, ...inner]).fill({ color, alpha: 0.8 * fade });
          g.poly([...outer, ...inner]).stroke({ color: 0xe6fff9, width: s * 0.004, alpha: fade });
        });
        // Lốc cuốn quanh chân sau lưỡi cuối: các vòng elip xoay, hẹp dần lên trên, lá bụi bay vòng.
        const start = (CUTS.length - 1) * GAP + CUT * 0.6;
        const k = (w.t - start) / (LIFE - start);
        if (k <= 0) continue;
        const grow = Math.min(1, k * 4);
        const fade = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4;
        for (let i = 0; i < 5; i++) {
          const h = (i / 4) * s * 0.7 * grow;
          const rx = s * (0.24 - i * 0.03) * grow;
          const spin = w.t * 9 + i;
          const y = at.y - h;
          g.ellipse(at.x + Math.sin(spin) * s * 0.02, y, rx, rx * 0.22)
            .stroke({ color, width: s * 0.01, alpha: (0.75 - i * 0.1) * fade });
        }
        for (const p of w.specks) {
          const ang = p.phase + w.t * 8;
          const h = Math.min(0.8, p.rise * k * 2) * s;
          const rx = s * 0.22 * (1 - h / s * 0.5) * grow;
          const x = at.x + Math.cos(ang) * rx;
          const y = at.y - h + Math.sin(ang) * rx * 0.22;
          g.circle(x, y, p.r).fill({ color: 0xe6fff9, alpha: 0.9 * fade * (0.5 + 0.5 * Math.sin(ang)) });
        }
      }
      gales = gales.filter((w) => w.wait > 0 || w.t < LIFE);
    },
    clear() {
      gales = [];
      g.clear();
    },
  };
}
