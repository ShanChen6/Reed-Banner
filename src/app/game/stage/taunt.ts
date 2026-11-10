/**
 * Trấn sơn khiêu chiến vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu của binh lính hệ Thổ dộng khiên xuống
 * đất, sóng đất tỏa vòng quanh chân, vòng gai đá trồi lên quanh người (phản đòn) rồi lún xuống; trên đầu từng đối thủ
 * nổi gân giận đỏ cạnh đầu, và luồng sáng đỏ chảy liên tục từ đối thủ về chính mình.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";
import { vein } from "./status";
import { softLayer } from "./soft";

/** Gai đá mọc tới `RISE`, giữ tới `HOLD`, lún và tan hết `LIFE` (giây). */
const RISE = 0.22;
const HOLD = 1.0;
const LIFE = 1.4;
/** Đỏ son của ấn khiêu khích. */
const TAUNT = 0xe0482c;

interface Roar {
  readonly at: Point;
  readonly size: number;
  /** Gai đá quanh chân: góc, cao, rộng (phần cỡ người). */
  readonly spikes: readonly { readonly a: number; readonly h: number; readonly w: number }[];
  /** Đối thủ bị khiêu khích: chỗ đứng (giữa hai bàn chân). */
  readonly foes: readonly Point[];
  wait: number;
  t: number;
}

const ease = (k: number) => 1 - (1 - Math.min(1, Math.max(0, k))) ** 3;

export function tauntRoar(parent: Container, color: number) {
  const back = new Graphics();
  const g = new Graphics();
  const glow = new Graphics();
  glow.blendMode = "add";
  parent.addChild(back, g, glow);
  const aura = softLayer(parent);
  let roars: Roar[] = [];

  return {
    /** Người đứng ở `at` dộng khiên, khiêu khích các đối thủ đứng ở `foes`, chờ `wait` giây. */
    roar(at: Point, foes: readonly Point[], size: number, wait = 0) {
      const spikes = Array.from({ length: 10 }, (_, i) => ({
        a: (i / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.25,
        h: 0.1 + Math.random() * 0.08,
        w: 0.03 + Math.random() * 0.015,
      }));
      roars.push({ at, size, spikes, foes, wait, t: 0 });
    },
    update(dt: number) {
      back.clear();
      g.clear();
      glow.clear();
      aura.begin();
      for (const r of roars) {
        if (r.wait > 0) {
          r.wait -= dt;
          continue;
        }
        r.t += dt;
        if (r.t >= LIFE) continue;
        const z = r.size;
        const { x, y } = r.at;
        const fade = r.t < HOLD ? 1 : 1 - (r.t - HOLD) / (LIFE - HOLD);
        const w = z * 0.01;

        // Ba vòng sóng đất tỏa ra từ chỗ dộng khiên, nối đuôi nhau.
        for (let n = 0; n < 3; n++) {
          const k = (r.t - n * 0.14) / 0.7;
          if (k <= 0 || k >= 1) continue;
          const rad = z * (0.12 + 0.55 * ease(k));
          glow.ellipse(x, y, rad, rad * 0.2).stroke({ color, width: w * (2.2 - k * 1.6), alpha: 0.8 * (1 - k) });
          back.ellipse(x, y, rad, rad * 0.2).stroke({ color: 0x2a1d10, width: w * 1.2, alpha: 0.35 * (1 - k) });
        }

        // Vòng gai đá quanh chân (phản đòn): nửa sau vẽ dưới người, nửa trước vẽ trên.
        const rise = ease(r.t / RISE) * (r.t < HOLD ? 1 : 1 - ((r.t - HOLD) / (LIFE - HOLD)) ** 2);
        for (const s of r.spikes) {
          const bx = x + Math.cos(s.a) * z * 0.36;
          const by = y + Math.sin(s.a) * z * 0.07;
          const h = z * s.h * rise;
          if (h < 1) continue;
          const hw = z * s.w;
          // Gai đá nghiêng ra ngoài, mặt hứng sáng và mặt khuất tối.
          const tip = bx + Math.cos(s.a) * hw * 0.8;
          const shard = [bx - hw, by, bx - hw * 0.5, by - h * 0.55, tip, by - h, bx + hw * 0.6, by - h * 0.5, bx + hw, by];
          const layer = Math.sin(s.a) < 0 ? back : g;
          layer.poly(shard).fill({ color: 0x9c7a50, alpha: fade });
          layer.poly([tip, by - h, bx + hw * 0.6, by - h * 0.5, bx + hw, by, bx, by]).fill({ color: 0x5a4028, alpha: fade });
          layer.poly(shard).stroke({ color: 0x2a1d10, width: w * 0.5, alpha: fade, join: "round" });
          glow.moveTo(bx - hw * 0.3, by).lineTo(tip, by - h).stroke({ color, width: w * 0.5, alpha: 0.7 * fade, cap: "round" });
        }

        // Đối thủ bị khiêu khích: dấu nổi gân giận đỏ cạnh đầu; luồng sáng đỏ chảy liên tục từ đối thủ về ngực người tung
        // chiêu (bị kéo sự chú ý về đó).
        const show = ease((r.t - 0.1) / 0.25);
        if (show <= 0) continue;
        const a = show * fade;
        for (const f of r.foes) {
          const dir = Math.sign(x - f.x) || 1;
          const beat = (1 + 0.15 * Math.max(0, Math.sin(r.t * 9))) * (1 + 0.6 * (1 - show) ** 2);
          const vx = f.x - dir * z * 0.13;
          const vy = f.y - z * 0.98;
          aura.glow({ x: vx, y: vy, w: z * 0.16 * beat, color: TAUNT, alpha: 0.6 * a });
          vein(g, vx, vy, z * 0.045 * beat, a);
          const sx = f.x;
          const sy = f.y - z * 0.6;
          const mx = x;
          const my = y - z * 0.6;
          const at = (q: number) => ({ x: sx + (mx - sx) * q, y: sy + (my - sy) * q - Math.sin(Math.PI * q) * z * 0.1 });
          for (let n = 0; n < 14; n++) {
            const q = (r.t * 1.4 + n / 14) % 1;
            const p = at(q);
            const edge = Math.sin(Math.PI * q);
            aura.glow({ x: p.x, y: p.y, w: z * 0.045 * (0.6 + edge * 0.6), color: n % 3 ? TAUNT : 0xffd9a8, alpha: 0.85 * a * edge });
          }
        }
      }
      aura.end();
      roars = roars.filter((r) => r.wait > 0 || r.t < LIFE);
    },
    clear() {
      roars = [];
      aura.clear();
      back.clear();
      g.clear();
      glow.clear();
    },
  };
}
