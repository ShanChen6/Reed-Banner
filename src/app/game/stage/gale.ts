/**
 * Phong đao vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu một người của tướng sĩ hệ Phong chém ba lưỡi gió
 * hình trăng khuyết liên tiếp qua đối thủ, rồi một cơn lốc cuốn quanh chân họ (xoáy bàn cờ), lá và bụi bay vòng lên.
 * Pháp sư hệ Phong chỉ gọi cơn lốc (`whirl`), không có lưỡi gió.
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
  /** Có ba lưỡi gió trước cơn lốc không. */
  readonly cuts: boolean;
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

/** Lá và bụi bay vòng trong cơn lốc. */
function specksOf(size: number) {
  return Array.from({ length: 14 }, () => ({
    phase: Math.random() * Math.PI * 2,
    rise: 0.3 + Math.random() * 0.5,
    r: size * (0.006 + Math.random() * 0.008),
  }));
}

export function galeSlash(parent: Container, color: number) {
  const g = new Graphics();
  g.blendMode = "add";
  parent.addChild(g);
  let gales: Gale[] = [];
  return {
    /** Chém người đứng ở `at`, bổ tới từ phía `dir`, chờ `wait` giây. */
    slash(at: Point, size: number, dir: number, wait = 0) {
      gales.push({ at, size, dir, cuts: true, wait, t: 0, specks: specksOf(size) });
    },
    /** Chỉ cơn lốc cuốn quanh người đứng ở `at`, chờ `wait` giây. */
    whirl(at: Point, size: number, wait = 0) {
      gales.push({ at, size, dir: 1, cuts: false, wait, t: 0, specks: specksOf(size) });
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
        if (w.cuts) CUTS.forEach((c, n) => {
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
        // Lốc cuốn quanh người sau lưỡi cuối: các vệt gió xoắn ốc chạy quanh phễu hẹp ở chân, loe dần lên trên
        // (vệt phía trước sáng, phía sau mờ), bụi tung dưới chân, lá bay xoáy theo phễu.
        const start = w.cuts ? (CUTS.length - 1) * GAP + CUT * 0.6 : 0;
        const k = (w.t - start) / (LIFE - start);
        if (k <= 0) continue;
        const grow = 1 - (1 - Math.min(1, k * 3)) ** 3;
        const fade = k < 0.65 ? 1 : 1 - (k - 0.65) / 0.35;
        const top = s * 0.9 * grow;
        const radius = (h: number) => s * (0.07 + 0.2 * (h / s / 0.9)) * (0.6 + 0.4 * grow);
        const spin = w.t * 11;
        // Vệt gió xoắn ốc: mỗi vệt chạy một đoạn theo chiều cao, xoắn hơn một vòng.
        for (let n = 0; n < 10; n++) {
          const h0 = ((n * 0.29 + w.t * 0.9) % 1) * top * 0.75;
          const len = top * 0.35;
          let px = 0;
          let py = 0;
          for (let i = 0; i <= 12; i++) {
            const h = Math.min(top, h0 + (i / 12) * len);
            const ang = spin + n * 0.63 + (h / s) * 9;
            const r = radius(h);
            const x = at.x + Math.cos(ang) * r;
            const y = at.y - h + Math.sin(ang) * r * 0.28;
            if (i > 0) {
              const front = 0.5 + 0.5 * Math.sin(ang);
              const taper = Math.sin((i / 12) * Math.PI);
              g.moveTo(px, py).lineTo(x, y).stroke({
                color: front > 0.5 ? 0xe6fff9 : color,
                width: s * (0.004 + 0.01 * taper),
                alpha: (0.25 + 0.65 * front) * taper * fade,
                cap: "round",
              });
            }
            px = x;
            py = y;
          }
        }
        // Bụi tung dưới chân.
        g.ellipse(at.x, at.y, radius(0) * 2.4 * grow, radius(0) * 0.5 * grow).fill({ color, alpha: 0.1 * fade });
        g.ellipse(at.x, at.y, radius(0) * 3 * grow, radius(0) * 0.6 * grow).stroke({ color: 0xe6fff9, width: s * 0.003, alpha: 0.35 * fade });
        // Lá bay xoáy lên theo phễu.
        for (const p of w.specks) {
          const h = ((p.rise * w.t * 1.4 + p.phase / 6) % 1) * top;
          const ang = p.phase + spin * 0.8 + (h / s) * 6;
          const r = radius(h) * 1.1;
          const x = at.x + Math.cos(ang) * r;
          const y = at.y - h + Math.sin(ang) * r * 0.28;
          const front = 0.5 + 0.5 * Math.sin(ang);
          const l = p.r * 2.2;
          g.poly([x - l, y, x, y - l * 0.4, x + l, y, x, y + l * 0.4]).fill({ color: front > 0.5 ? 0xe6fff9 : color, alpha: (0.35 + 0.6 * front) * fade });
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
