/**
 * Nhát chém lửa vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu một người của tướng sĩ hệ Hỏa bổ đại đao
 * thành một vệt lửa hình trăng khuyết quét chéo qua đối thủ, lóe sáng ở điểm chém rồi tan thành tàn lửa.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Vệt quét tới `SWEEP`, tan hết `LIFE` (giây). */
const SWEEP = 0.22;
const LIFE = 1;

interface Cleave {
  /** Giữa hai bàn chân người bị chém. */
  readonly at: Point;
  readonly size: number;
  /** Phía nhát chém bổ tới: 1 từ trái sang, -1 từ phải sang. */
  readonly dir: number;
  wait: number;
  t: number;
  readonly embers: readonly { readonly k: number; readonly vx: number; readonly vy: number }[];
}

export function flameCleave(parent: Container, color: number) {
  const g = new Graphics();
  g.blendMode = "add";
  parent.addChild(g);
  let cleaves: Cleave[] = [];
  return {
    /** Chém người đứng ở `at`, bổ tới từ phía `dir`, chờ `wait` giây. */
    slash(at: Point, size: number, dir: number, wait = 0) {
      const embers = Array.from({ length: 14 }, () => ({
        k: Math.random(),
        vx: (Math.random() - 0.5) * size * 0.5,
        vy: -size * (0.1 + Math.random() * 0.4),
      }));
      cleaves.push({ at, size, dir, wait, t: 0, embers });
    },
    update(dt: number) {
      g.clear();
      for (const c of cleaves) {
        if (c.wait > 0) {
          c.wait -= dt;
          continue;
        }
        c.t += dt;
        if (c.t >= LIFE) continue;
        const { at, size: s, dir } = c;
        const cx = at.x - dir * s * 0.12;
        const cy = at.y - s * 0.55;
        const r = s * 0.5;
        // Cung quét từ trên đầu xuống dưới chân phía đối diện; điểm trên cung theo tham số k (0..1).
        const point = (k: number, rr: number) => {
          const ang = -Math.PI * 0.45 + k * Math.PI * 0.85;
          return { x: cx + dir * Math.cos(ang) * rr, y: cy + Math.sin(ang) * rr };
        };
        const reach = Math.min(1, c.t / SWEEP);
        const fade = c.t < SWEEP ? 1 : 1 - (c.t - SWEEP) / (LIFE - SWEEP);
        // Trăng khuyết: mép ngoài và mép trong lệch nhau, dày nhất ở giữa vệt.
        const steps = 18;
        const outer: number[] = [];
        const inner: number[] = [];
        for (let i = 0; i <= steps; i++) {
          const k = (i / steps) * reach;
          const w = Math.sin((i / steps) * Math.PI) * s * 0.09;
          const o = point(k, r + w);
          const n = point(k, r - w);
          outer.push(o.x, o.y);
          inner.unshift(n.x, n.y);
        }
        g.poly([...outer, ...inner]).fill({ color, alpha: 0.75 * fade });
        const core: number[] = [];
        for (let i = 0; i <= steps; i++) {
          const p = point((i / steps) * reach, r);
          core.push(p.x, p.y);
        }
        g.moveTo(core[0]!, core[1]!);
        for (let i = 2; i < core.length; i += 2) g.lineTo(core[i]!, core[i + 1]!);
        g.stroke({ color: 0xffe08a, width: s * 0.02, alpha: fade, cap: "round" });
        // Lóe sáng ở giữa thân khi lưỡi đao đi qua.
        if (c.t > SWEEP * 0.5 && c.t < SWEEP * 2.5) {
          const flash = 1 - Math.abs(c.t - SWEEP * 1.5) / SWEEP;
          g.circle(at.x, cy, s * 0.18 * flash).fill({ color: 0xfff2c4, alpha: 0.6 * flash });
        }
        // Tàn lửa bong khỏi vệt chém rồi rơi.
        if (c.t > SWEEP) {
          const k = c.t - SWEEP;
          for (const e of c.embers) {
            const p = point(e.k, r);
            g.circle(p.x + e.vx * k, p.y + e.vy * k + s * 1.2 * k * k, s * 0.009).fill({ color: 0xffd36b, alpha: fade });
          }
        }
      }
      cleaves = cleaves.filter((c) => c.wait > 0 || c.t < LIFE);
    },
    clear() {
      cleaves = [];
      g.clear();
    },
  };
}
