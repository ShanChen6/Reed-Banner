/**
 * Kim ngân ly tán vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu của mưu sĩ hệ Kim làm đồng tiền vàng
 * bật tung khỏi đối thủ (rút năng lượng), vòng xích bạc siết quanh đầu họ và ấn ổ khóa hiện lên (câm lặng), rồi tan dần.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";
import { badgeLayer } from "./badge";
import { softLayer } from "./soft";

/** Thời lượng (giây). */
const LIFE = 1.5;

interface Burst {
  /** Giữa thân đối thủ. */
  readonly at: Point;
  readonly size: number;
  t: number;
  readonly coins: readonly { readonly vx: number; readonly vy: number; readonly spin: number }[];
}

export function coinScatter(parent: Container, color: number) {
  const g = new Graphics();
  parent.addChild(g);
  const ring = new Graphics();
  parent.addChild(ring);
  const chainGlow = softLayer(parent);
  const badges = badgeLayer(parent);
  let bursts: Burst[] = [];
  return {
    /** Tung tiền khỏi người đứng ở `at` (giữa thân). */
    scatter(at: Point, size: number) {
      const coins = Array.from({ length: 14 }, () => ({
        vx: (Math.random() - 0.5) * size * 1.4,
        vy: -size * (0.4 + Math.random() * 0.7),
        spin: 6 + Math.random() * 10,
      }));
      bursts.push({ at, size, t: 0, coins });
    },
    update(dt: number) {
      g.clear();
      badges.begin();
      ring.clear();
      chainGlow.begin();
      for (const b of bursts) {
        b.t += dt;
        if (b.t >= LIFE) continue;
        const fade = b.t < LIFE * 0.6 ? 1 : 1 - (b.t - LIFE * 0.6) / (LIFE * 0.4);
        const { x, y } = b.at;
        const s = b.size;
        // Lóe vàng ở giữa thân.
        const flash = Math.max(0, 1 - b.t / 0.25);
        g.circle(x, y, s * 0.12 * (1 + b.t * 2)).fill({ color: 0xffd36b, alpha: 0.5 * flash });
        // Đồng tiền vàng lỗ vuông bay tung rồi rơi, lật mặt khi xoay.
        for (const c of b.coins) {
          const cx = x + c.vx * b.t;
          const cy = y + c.vy * b.t + s * 1.6 * b.t * b.t;
          const r = s * 0.022;
          const flip = Math.abs(Math.cos(c.spin * b.t));
          g.ellipse(cx, cy, r * Math.max(0.15, flip), r).fill({ color: 0xffcf4a, alpha: fade }).stroke({ color: 0x8a6a1e, width: r * 0.25, alpha: fade });
          if (flip > 0.4) g.rect(cx - r * 0.25 * flip, cy - r * 0.25, r * 0.5 * flip, r * 0.5).fill({ color: 0x8a6a1e, alpha: fade });
        }
        // Câm lặng: vòng xích bạc siết dần quanh đầu đối thủ rồi xoay chậm, ấn ổ khóa trên đầu (khóa kỹ năng).
        if (b.t > 0.2) {
          const k = Math.min(1, (b.t - 0.2) / 0.3);
          const tight = 1 - (1 - k) ** 3;
          const hx = x;
          const hy = y - s * 0.36;
          const rx = s * (0.34 - 0.2 * tight);
          const ry = rx * 0.32;
          const links = 18;
          const spin = b.t * 1.2;
          // Nửa sau mờ hơn (sau đầu), nửa trước rõ.
          for (let n = 0; n < links; n++) {
            const ang = (n / links) * Math.PI * 2 + spin;
            const lx = hx + Math.cos(ang) * rx;
            const ly = hy + Math.sin(ang) * ry;
            const behind = Math.sin(ang) < 0;
            const al = fade * k * (behind ? 0.45 : 1);
            const lw = s * 0.022;
            const tilt = Math.atan2(Math.cos(ang) * ry, -Math.sin(ang) * rx);
            const c = Math.cos(tilt);
            const si = Math.sin(tilt);
            // Mắt xích: vòng dẹt theo chiều tiếp tuyến, mắt chẵn nhìn nghiêng.
            const len = n % 2 ? lw * 1.2 : lw * 0.6;
            ring.moveTo(lx - c * len, ly - si * len).lineTo(lx + c * len, ly + si * len)
              .stroke({ color: n % 2 ? 0xe9eef5 : 0x9aa6b4, width: n % 2 ? lw * 0.7 : lw * 0.9, alpha: al, cap: "round" });
            chainGlow.glow({ x: lx, y: ly, w: lw * 3, color: 0xcfe0ff, alpha: 0.35 * al });
          }
          // Chớp sáng lúc xích khóa lại.
          const snap = Math.max(0, 1 - Math.abs(b.t - 0.5) / 0.12);
          if (snap > 0) chainGlow.glow({ x: hx, y: hy, w: rx * 2.6, h: ry * 3, color: 0xe9f1ff, alpha: 0.6 * snap });
          badges.draw({
            x, y: y - s * 0.6, r: s * 0.065, t: b.t - 0.45, alpha: fade, color,
            icon: (m, cx, cy, rr, a) => {
              // Ổ khóa: quai cong phía trên, thân vuông bo góc, lỗ khóa.
              m.moveTo(cx - rr * 0.3, cy - rr * 0.05).lineTo(cx - rr * 0.3, cy - rr * 0.3)
                .arc(cx, cy - rr * 0.3, rr * 0.3, Math.PI, 0).lineTo(cx + rr * 0.3, cy - rr * 0.05)
                .stroke({ color: 0xf2f4f7, width: rr * 0.13, alpha: a, cap: "round" });
              m.roundRect(cx - rr * 0.45, cy - rr * 0.08, rr * 0.9, rr * 0.62, rr * 0.1).fill({ color: 0xf2f4f7, alpha: a });
              m.circle(cx, cy + rr * 0.15, rr * 0.09).fill({ color: 0x1a1210, alpha: a });
              m.rect(cx - rr * 0.035, cy + rr * 0.18, rr * 0.07, rr * 0.18).fill({ color: 0x1a1210, alpha: a });
            },
          });
        }
      }
      badges.end();
      chainGlow.end();
      bursts = bursts.filter((b) => b.t < LIFE);
    },
    clear() {
      bursts = [];
      badges.clear();
      ring.clear();
      chainGlow.clear();
      g.clear();
    },
  };
}
