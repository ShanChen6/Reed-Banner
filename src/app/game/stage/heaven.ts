/**
 * Thiên lôi giáng thế vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu một người của pháp sư hệ Lôi. Mây giông tím
 * cuộn lại trên đầu đối thủ, rồi một cột sét lớn giáng thẳng xuống người họ: tia sét chính nhiều nhánh, cột sáng dọc (phá
 * một cột ô), vòng sóng điện lan trên mặt đất, sau đó đốm năng lượng tím bật khỏi thân bay lên rồi tắt (mất năng lượng).
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Mây tụ trong `GATHER` giây, sét giáng và sáng tới `BOLT`, cả hiệu ứng tắt hẳn ở `LIFE`. */
const GATHER = 0.22;
const BOLT = 0.45;
const LIFE = 1.4;

interface Smite {
  /** Giữa hai bàn chân người bị sét đánh. */
  readonly at: Point;
  readonly size: number;
  /** Cụm mây: lệch ngang, lệch dọc, bán kính (phần cỡ người). */
  readonly puffs: readonly { readonly dx: number; readonly dy: number; readonly r: number }[];
  readonly motes: readonly { readonly x: number; readonly y: number; readonly vx: number; readonly vy: number; readonly r: number }[];
  wait: number;
  t: number;
}

/** Đường gấp khúc từ `a` tới `b`, lệch ngẫu nhiên theo phương vuông góc, mạnh nhất ở giữa. */
function jagged(a: Point, b: Point, jitter: number, steps: number): number[] {
  const nx = -(b.y - a.y);
  const ny = b.x - a.x;
  const len = Math.hypot(nx, ny) || 1;
  const pts = [a.x, a.y];
  for (let i = 1; i < steps; i++) {
    const k = i / steps;
    const off = (Math.random() - 0.5) * jitter * Math.sin(Math.PI * k);
    pts.push(a.x + (b.x - a.x) * k + (nx / len) * off, a.y + (b.y - a.y) * k + (ny / len) * off);
  }
  pts.push(b.x, b.y);
  return pts;
}

export function heavenStrike(parent: Container, color: number) {
  const g = new Graphics();
  const glow = new Graphics();
  glow.blendMode = "add";
  parent.addChild(g, glow);
  let smites: Smite[] = [];
  const line = (pts: readonly number[], width: number, c: number, alpha: number) => {
    glow.moveTo(pts[0]!, pts[1]!);
    for (let i = 2; i < pts.length; i += 2) glow.lineTo(pts[i]!, pts[i + 1]!);
    glow.stroke({ color: c, width, alpha, join: "round", cap: "round" });
  };
  return {
    /** Gọi sét giáng xuống người đứng ở `at` (giữa hai bàn chân), chờ `wait` giây. */
    smite(at: Point, size: number, wait = 0) {
      const puffs = Array.from({ length: 9 }, (_, i) => ({
        dx: (i - 4) * 0.11 + (Math.random() - 0.5) * 0.05,
        dy: (Math.random() - 0.5) * 0.08,
        r: 0.1 + Math.random() * 0.07,
      }));
      const motes = Array.from({ length: 18 }, () => ({
        x: (Math.random() - 0.5) * size * 0.3,
        y: -size * (0.25 + Math.random() * 0.5),
        vx: (Math.random() - 0.5) * size * 0.6,
        vy: -size * (0.3 + Math.random() * 0.45),
        r: size * (0.006 + Math.random() * 0.008),
      }));
      smites.push({ at, size, puffs, motes, wait, t: 0 });
    },
    update(dt: number) {
      g.clear();
      glow.clear();
      for (const s of smites) {
        if (s.wait > 0) {
          s.wait -= dt;
          continue;
        }
        s.t += dt;
        const { at, size } = s;
        const top = at.y - size * 1.25;
        const fade = s.t < LIFE * 0.6 ? 1 : Math.max(0, 1 - (s.t - LIFE * 0.6) / (LIFE * 0.4));
        // Mây giông tụ lại trên đầu đối thủ, lóe tím bên trong.
        const gather = Math.min(1, s.t / GATHER);
        for (const p of s.puffs) {
          const x = at.x + p.dx * size * (1.6 - 0.6 * gather);
          const y = top + p.dy * size;
          g.circle(x, y, p.r * size * gather).fill({ color: 0x241a3a, alpha: 0.75 * fade });
          glow.circle(x, y + p.r * size * 0.3, p.r * size * 0.6 * gather).fill({ color, alpha: 0.18 * fade * (0.6 + 0.4 * Math.random()) });
        }
        const b = s.t - GATHER;
        if (b < 0) continue;
        // Cột sáng dọc từ mây xuống đất: phá một cột ô, sáng nhất lúc sét vừa giáng.
        const flash = b < BOLT - GATHER ? 1 : Math.max(0, 1 - (b - (BOLT - GATHER)) / 0.5);
        const half = size * 0.12;
        glow.rect(at.x - half, top, half * 2, at.y - top).fill({ color, alpha: 0.22 * flash });
        glow.rect(at.x - half * 0.45, top, half * 0.9, at.y - top).fill({ color: 0xe8dcff, alpha: 0.3 * flash });
        // Tia sét chính và ba nhánh, chớp nháy rồi tắt.
        if (b < BOLT) {
          const flicker = b < 0.06 ? 1 : 0.5 + 0.5 * Math.random();
          const hit = { x: at.x, y: at.y - size * 0.05 };
          const pts = jagged({ x: at.x + (Math.random() - 0.5) * size * 0.1, y: top }, hit, size * 0.22, 12);
          line(pts, size * 0.09, color, 0.3 * flicker);
          line(pts, size * 0.04, color, 0.85 * flicker);
          line(pts, size * 0.016, 0xffffff, flicker);
          for (let k = 0; k < 3; k++) {
            const i = 2 * (2 + Math.floor(Math.random() * 8));
            const from = { x: pts[i]!, y: pts[i + 1]! };
            const to = { x: from.x + (Math.random() - 0.5) * size * 0.5, y: from.y + size * (0.12 + Math.random() * 0.2) };
            line(jagged(from, to, size * 0.06, 5), size * 0.008, 0xffffff, 0.85 * flicker);
          }
          glow.circle(at.x, at.y - size * 0.5, size * 0.45).fill({ color, alpha: 0.1 * flicker * (1 - b / BOLT) });
        }
        // Vòng sóng điện lan trên mặt đất quanh chân.
        const ring = Math.min(1, b / 0.5);
        glow.ellipse(at.x, at.y, size * (0.15 + 0.5 * ring), size * (0.04 + 0.1 * ring))
          .stroke({ color, width: size * 0.018, alpha: 0.9 * (1 - ring) });
        glow.ellipse(at.x, at.y, size * 0.2, size * 0.05).fill({ color: 0xffffff, alpha: 0.5 * flash });
        // Mất năng lượng: đốm tím bật khỏi thân, bay lên chậm dần rồi tắt.
        const m = b - 0.15;
        if (m > 0) {
          const k = Math.min(1, m / (LIFE - GATHER - 0.15));
          const ease = 1 - (1 - k) * (1 - k);
          for (const p of s.motes) {
            const x = at.x + p.x + p.vx * ease;
            const y = at.y + p.y + p.vy * ease;
            glow.circle(x, y, p.r * 2.6).fill({ color, alpha: 0.35 * (1 - k) });
            glow.circle(x, y, p.r).fill({ color: 0xffffff, alpha: 0.9 * (1 - k) });
          }
        }
      }
      smites = smites.filter((s) => s.wait > 0 || s.t < LIFE);
    },
    clear() {
      smites = [];
      g.clear();
      glow.clear();
    },
  };
}
