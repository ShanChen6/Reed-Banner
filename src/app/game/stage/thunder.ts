/**
 * Lôi đao liên trảm vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu một người của tướng sĩ hệ Lôi chém liền ba
 * nhát vào đối thủ đứng đầu. Mỗi nhát là một vệt sét thẳng gấp khúc quét chéo qua thân, lóe trắng ở giữa; sau nhát cuối
 * những đốm năng lượng tím bật khỏi người đối thủ, bay lên rồi tắt (mất năng lượng).
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Một nhát quét trong `SWEEP`, sáng thêm tới `FADE` (giây); các nhát cách nhau `GAP`. */
const SWEEP = 0.08;
const FADE = 0.42;
const GAP = 0.14;
/** Đốm năng lượng bay tới hết `MOTES` giây sau nhát cuối. */
const MOTES = 0.9;

/** Ba nhát chém: góc vệt (radian, 0 là ngang) và độ lệch tâm theo chiều cao thân. */
const CUTS = [
  { ang: 0.75, dy: 0.55 },
  { ang: -0.65, dy: 0.5 },
  { ang: 0.08, dy: 0.62 },
] as const;

interface Combo {
  /** Giữa hai bàn chân người bị chém. */
  readonly at: Point;
  readonly size: number;
  /** Phía nhát chém bổ tới: 1 từ trái sang, -1 từ phải sang. */
  readonly dir: number;
  wait: number;
  t: number;
  readonly motes: readonly { readonly x: number; readonly y: number; readonly vx: number; readonly vy: number; readonly r: number }[];
}

/** Đường gấp khúc từ `a` tới `b`, lệch ngẫu nhiên theo phương vuông góc. */
function jagged(a: Point, b: Point, jitter: number, steps: number): number[] {
  const nx = -(b.y - a.y);
  const ny = b.x - a.x;
  const len = Math.hypot(nx, ny) || 1;
  const pts = [a.x, a.y];
  for (let i = 1; i < steps; i++) {
    const k = i / steps;
    const off = (Math.random() - 0.5) * jitter;
    pts.push(a.x + (b.x - a.x) * k + (nx / len) * off, a.y + (b.y - a.y) * k + (ny / len) * off);
  }
  pts.push(b.x, b.y);
  return pts;
}

export function thunderCleave(parent: Container, color: number) {
  const g = new Graphics();
  g.blendMode = "add";
  parent.addChild(g);
  let combos: Combo[] = [];
  const line = (pts: readonly number[], width: number, c: number, alpha: number) => {
    g.moveTo(pts[0]!, pts[1]!);
    for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i]!, pts[i + 1]!);
    g.stroke({ color: c, width, alpha, join: "round", cap: "round" });
  };
  return {
    /** Chém liền ba nhát vào người đứng ở `at`, bổ tới từ phía `dir`, chờ `wait` giây. */
    slash(at: Point, size: number, dir: number, wait = 0) {
      const motes = Array.from({ length: 16 }, () => ({
        x: (Math.random() - 0.5) * size * 0.3,
        y: -size * (0.3 + Math.random() * 0.45),
        vx: (Math.random() - 0.5) * size * 0.5,
        vy: -size * (0.25 + Math.random() * 0.45),
        r: size * (0.006 + Math.random() * 0.008),
      }));
      combos.push({ at, size, dir, wait, t: 0, motes });
    },
    update(dt: number) {
      g.clear();
      for (const c of combos) {
        if (c.wait > 0) {
          c.wait -= dt;
          continue;
        }
        c.t += dt;
        const { at, size: s, dir } = c;
        const half = s * 0.42;
        CUTS.forEach((cut, n) => {
          const t = c.t - n * GAP;
          if (t < 0 || t >= FADE) return;
          const reach = Math.min(1, t / SWEEP);
          const fade = t < SWEEP ? 1 : 1 - (t - SWEEP) / (FADE - SWEEP);
          // Nhát xen kẽ hướng: lẻ bổ xuôi, chẵn hất ngược, nhát cuối chém ngang.
          const cx = at.x;
          const cy = at.y - s * cut.dy;
          const dx = Math.cos(cut.ang) * half * dir * (n === 1 ? -1 : 1);
          const dy = Math.sin(cut.ang) * half;
          const a = { x: cx - dx, y: cy - dy };
          const b = { x: cx - dx + 2 * dx * reach, y: cy - dy + 2 * dy * reach };
          const pts = jagged(a, b, s * 0.05 * reach, 9);
          line(pts, s * 0.07, color, 0.3 * fade);
          line(pts, s * 0.028, color, 0.85 * fade);
          line(pts, s * 0.01, 0xffffff, fade);
          // Tia sét nhỏ tóe ra hai bên vệt chém.
          for (let k = 0; k < 3; k++) {
            const i = 2 * (1 + Math.floor(Math.random() * 7));
            const from = { x: pts[i]!, y: pts[i + 1]! };
            const to = { x: from.x + (Math.random() - 0.5) * s * 0.22, y: from.y + (Math.random() - 0.5) * s * 0.22 };
            line(jagged(from, to, s * 0.04, 3), s * 0.006, 0xffffff, 0.8 * fade);
          }
          if (t > SWEEP * 0.5 && t < SWEEP * 3) {
            const flash = 1 - Math.abs(t - SWEEP * 1.5) / (SWEEP * 1.5);
            g.circle(cx, cy, s * (0.05 + 0.03 * n) * flash).fill({ color: 0xf4ecff, alpha: 0.6 * flash });
          }
        });
        // Mất năng lượng: đốm tím bật khỏi thân sau nhát cuối, bay lên chậm dần rồi tắt.
        const m = c.t - 2 * GAP - SWEEP;
        if (m > 0 && m < MOTES) {
          const k = m / MOTES;
          const ease = 1 - (1 - k) * (1 - k);
          for (const p of c.motes) {
            const x = at.x + p.x + p.vx * ease;
            const y = at.y + p.y + p.vy * ease;
            g.circle(x, y, p.r * 2.6).fill({ color, alpha: 0.35 * (1 - k) });
            g.circle(x, y, p.r).fill({ color: 0xffffff, alpha: 0.9 * (1 - k) });
          }
        }
      }
      combos = combos.filter((c) => c.wait > 0 || c.t < 2 * GAP + SWEEP + MOTES);
    },
    clear() {
      combos = [];
      g.clear();
    },
  };
}
