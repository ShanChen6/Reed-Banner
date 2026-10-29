/**
 * Chấn lôi thiết vệ vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu của binh lính hệ Lôi dộng khiên xuống đất,
 * hai vòng sấm gấp khúc tỏa quanh chân và những tia sét nhỏ bò quanh người (tăng thủ). Sét chạy từ ngực người tung chiêu
 * tới từng đối thủ, trên đầu họ hiện ấn khiêu khích tím có mũi chỉ về người tung chiêu, đốm năng lượng bật khỏi thân rồi
 * tắt (mất năng lượng).
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Vòng sấm tỏa trong `RING`, sét bò quanh người tới `HOLD`, tan hết `LIFE` (giây). */
const RING = 0.6;
const HOLD = 1.05;
const LIFE = 1.45;
/** Sét tới đối thủ chạy từ `BOLT` tới `BOLT + 0.3` giây; đốm năng lượng bay `MOTES` giây sau đó. */
const BOLT = 0.12;
const MOTES = 0.9;

interface Guard {
  readonly at: Point;
  readonly size: number;
  readonly foes: readonly Point[];
  wait: number;
  t: number;
  readonly motes: readonly { readonly x: number; readonly y: number; readonly vx: number; readonly vy: number; readonly r: number }[];
}

const ease = (k: number) => 1 - (1 - Math.min(1, Math.max(0, k))) ** 3;

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

export function thunderAegis(parent: Container, color: number) {
  const g = new Graphics();
  g.blendMode = "add";
  parent.addChild(g);
  let guards: Guard[] = [];
  const line = (pts: readonly number[], width: number, c: number, alpha: number) => {
    g.moveTo(pts[0]!, pts[1]!);
    for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i]!, pts[i + 1]!);
    g.stroke({ color: c, width, alpha, join: "round", cap: "round" });
  };

  return {
    /** Người đứng ở `at` dộng khiên, khiêu khích và rút năng lượng các đối thủ đứng ở `foes`, chờ `wait` giây. */
    guard(at: Point, foes: readonly Point[], size: number, wait = 0) {
      const motes = foes.flatMap((f) =>
        Array.from({ length: 8 }, () => ({
          x: f.x + (Math.random() - 0.5) * size * 0.3,
          y: f.y - size * (0.3 + Math.random() * 0.4),
          vx: (Math.random() - 0.5) * size * 0.45,
          vy: -size * (0.2 + Math.random() * 0.4),
          r: size * (0.006 + Math.random() * 0.007),
        })),
      );
      guards.push({ at, size, foes, wait, t: 0, motes });
    },
    update(dt: number) {
      g.clear();
      for (const c of guards) {
        if (c.wait > 0) {
          c.wait -= dt;
          continue;
        }
        c.t += dt;
        if (c.t >= LIFE + MOTES) continue;
        const z = c.size;
        const { x, y } = c.at;
        const fade = c.t < HOLD ? 1 : Math.max(0, 1 - (c.t - HOLD) / (LIFE - HOLD));

        // Hai vòng sấm gấp khúc tỏa ra từ chỗ dộng khiên, nối đuôi nhau.
        for (let n = 0; n < 2; n++) {
          const k = (c.t - n * 0.16) / RING;
          if (k <= 0 || k >= 1) continue;
          const rx = z * (0.15 + 0.5 * ease(k));
          const ring: number[] = [];
          for (let i = 0; i <= 28; i++) {
            const a = (i / 28) * Math.PI * 2;
            const j = 1 + (Math.random() - 0.5) * 0.12;
            ring.push(x + Math.cos(a) * rx * j, y + Math.sin(a) * rx * 0.2 * j);
          }
          line(ring, z * 0.03 * (1 - k), color, 0.35 * (1 - k));
          line(ring, z * 0.008, 0xffffff, 0.8 * (1 - k));
        }

        // Tia sét nhỏ bò quanh người suốt lúc giữ khiên: mỗi khung vài tia mới từ chân lên ngang vai.
        if (fade > 0) {
          for (let i = 0; i < 4; i++) {
            const side = Math.random() < 0.5 ? -1 : 1;
            const h = z * (0.15 + Math.random() * 0.6);
            const a = { x: x + side * z * (0.22 + Math.random() * 0.08), y: y - h };
            const b = { x: a.x + side * z * (Math.random() - 0.3) * 0.12, y: a.y - z * (0.1 + Math.random() * 0.15) };
            line(jagged(a, b, z * 0.04, 4), z * 0.007, 0xffffff, 0.75 * fade);
            line(jagged(a, b, z * 0.04, 4), z * 0.02, color, 0.3 * fade);
          }
          g.ellipse(x, y, z * 0.34, z * 0.07).fill({ color, alpha: 0.12 * fade });
        }

        const chest = { x, y: y - z * 0.6 };
        for (const f of c.foes) {
          // Sét chạy từ ngực người tung chiêu tới ngực đối thủ, lóe khi chạm.
          const run = (c.t - BOLT) / 0.3;
          if (run > 0 && run < 1.4) {
            const reach = Math.min(1, run / 0.4);
            const end = { x: chest.x + (f.x - chest.x) * reach, y: chest.y + (f.y - z * 0.6 - chest.y) * reach };
            const a = Math.max(0, 1 - Math.max(0, run - 0.4));
            const pts = jagged(chest, end, z * 0.12 * reach, 12);
            line(pts, z * 0.05, color, 0.3 * a);
            line(pts, z * 0.012, 0xffffff, 0.9 * a);
            if (reach >= 1) g.circle(end.x, end.y, z * 0.08 * a).fill({ color: 0xf4ecff, alpha: 0.5 * a });
          }

          // Ấn khiêu khích tím trên đầu đối thủ, mũi chỉ về người tung chiêu, đập theo nhịp.
          const show = ease((c.t - BOLT - 0.15) / 0.25);
          if (show <= 0 || fade <= 0) continue;
          const hx = f.x;
          const hy = f.y - z * 1.04;
          const dir = Math.sign(x - f.x) || 1;
          const rad = z * 0.06 * show * (1 + 0.12 * Math.max(0, Math.sin(c.t * 14)));
          const w = z * 0.01;
          g.circle(hx, hy, rad * 1.7).fill({ color, alpha: 0.2 * fade });
          g.circle(hx, hy, rad).stroke({ color, width: w * 1.1, alpha: fade });
          for (const k of [-0.35, 0.25]) {
            const cx = hx + dir * rad * k;
            g.poly([cx - dir * rad * 0.3, hy - rad * 0.55, cx + dir * rad * 0.45, hy, cx - dir * rad * 0.3, hy + rad * 0.55], false)
              .stroke({ color: 0xffffff, width: w * 0.8, alpha: fade, cap: "round", join: "round" });
          }
        }

        // Mất năng lượng: đốm tím bật khỏi thân đối thủ khi sét chạm, bay lên chậm dần rồi tắt.
        const m = c.t - BOLT - 0.12;
        if (m > 0 && m < MOTES) {
          const k = m / MOTES;
          const e = 1 - (1 - k) * (1 - k);
          for (const p of c.motes) {
            const px = p.x + p.vx * e;
            const py = p.y + p.vy * e;
            g.circle(px, py, p.r * 2.6).fill({ color, alpha: 0.35 * (1 - k) });
            g.circle(px, py, p.r).fill({ color: 0xffffff, alpha: 0.9 * (1 - k) });
          }
        }
      }
      guards = guards.filter((c) => c.wait > 0 || c.t < LIFE + MOTES);
    },
    clear() {
      guards = [];
      g.clear();
    },
  };
}
