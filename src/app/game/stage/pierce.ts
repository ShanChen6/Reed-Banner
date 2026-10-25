/**
 * Mũi sáng phá giáp vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu xuyên giáp của tướng sĩ hệ Kim phóng
 * một vệt sáng thẳng từ mũi kiếm tới đối thủ, rồi mảnh giáp vỡ tung ở chỗ trúng và tan dần.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Vệt sáng lao tới (giây), rồi mảnh giáp bay tới hết `LIFE`. */
const TRAVEL = 0.12;
const LIFE = 0.9;

interface Shard {
  readonly vx: number;
  readonly vy: number;
  readonly spin: number;
  readonly size: number;
}

interface Pierce {
  readonly from: Point;
  readonly to: Point;
  /** Độ dày lõi vệt sáng. */
  readonly width: number;
  t: number;
  readonly shards: readonly Shard[];
}

export function armorPierce(parent: Container, color: number) {
  const g = new Graphics();
  g.blendMode = "add";
  const chips = new Graphics();
  parent.addChild(g, chips);
  let hits: Pierce[] = [];
  return {
    /** Phóng mũi sáng từ `from` tới `to`. */
    pierce(from: Point, to: Point, width: number) {
      const dir = Math.sign(to.x - from.x) || 1;
      const shards = Array.from({ length: 14 }, () => ({
        vx: dir * width * (8 + Math.random() * 30),
        vy: -width * (10 + Math.random() * 28),
        spin: (Math.random() - 0.5) * 18,
        size: width * (0.8 + Math.random() * 1.4),
      }));
      hits.push({ from, to, width, t: 0, shards });
    },
    update(dt: number) {
      g.clear();
      chips.clear();
      for (const h of hits) {
        h.t += dt;
        const { from, to, width: w } = h;
        const reach = Math.min(1, h.t / TRAVEL);
        const head = { x: from.x + (to.x - from.x) * reach, y: from.y + (to.y - from.y) * reach };
        // Vệt sáng: sáng hẳn lúc lao tới, rồi mảnh dần.
        const beam = h.t < TRAVEL ? 1 : Math.max(0, 1 - (h.t - TRAVEL) / 0.25);
        if (beam > 0) {
          for (const [k, c, a] of [[3.4, color, 0.3], [1.5, color, 0.75], [0.5, 0xffffff, 1]] as const) {
            g.moveTo(from.x, from.y).lineTo(head.x, head.y).stroke({ color: c, width: w * k * beam, alpha: a * beam, cap: "round" });
          }
          g.circle(head.x, head.y, w * 2.4).fill({ color: 0xffffff, alpha: 0.9 * beam });
        }
        if (h.t < TRAVEL) continue;
        // Chỗ trúng: vòng nứt lóe ra rồi tắt; mảnh giáp bay văng, rơi theo trọng lực.
        const s = h.t - TRAVEL;
        const k = s / (LIFE - TRAVEL);
        if (k >= 1) continue;
        g.circle(to.x, to.y, w * (3 + 14 * k)).stroke({ color, width: w * 0.8, alpha: 0.9 * (1 - k) });
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2 + 0.3;
          const r0 = w * 2;
          const r1 = w * (5 + 6 * Math.min(1, k * 3));
          g.moveTo(to.x + Math.cos(ang) * r0, to.y + Math.sin(ang) * r0)
            .lineTo(to.x + Math.cos(ang) * r1, to.y + Math.sin(ang) * r1)
            .stroke({ color: 0xffffff, width: w * 0.35, alpha: 0.8 * (1 - k) });
        }
        for (const p of h.shards) {
          const x = to.x + p.vx * s;
          const y = to.y + p.vy * s + w * 60 * s * s;
          const a = p.spin * s;
          const c = Math.cos(a) * p.size;
          const d = Math.sin(a) * p.size;
          chips.poly([x - c, y - d, x + d * 0.5, y - c * 0.5, x + c, y + d]).fill({ color: 0xdfe4ea, alpha: 1 - k });
          chips.poly([x - c, y - d, x + d * 0.5, y - c * 0.5, x + c, y + d]).stroke({ color, width: w * 0.2, alpha: 1 - k });
        }
      }
      hits = hits.filter((h) => h.t < LIFE);
    },
    clear() {
      hits = [];
      g.clear();
      chips.clear();
    },
  };
}
