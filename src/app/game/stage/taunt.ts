/**
 * Trấn sơn khiêu chiến vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu của binh lính hệ Thổ dộng khiên xuống
 * đất, sóng đất tỏa vòng quanh chân, vòng gai đá trồi lên quanh người (phản đòn) rồi lún xuống; trên đầu từng đối thủ
 * hiện ấn khiêu khích đỏ có mũi chỉ về người tung chiêu, kèm vệt sáng nối từ đối thủ về chính mình.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

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

        // Ấn khiêu khích trên đầu từng đối thủ: vòng đỏ son, mũi chỉ về người tung chiêu, đập theo nhịp.
        const show = ease((r.t - 0.1) / 0.25);
        if (show <= 0) continue;
        for (const f of r.foes) {
          const hx = f.x;
          const hy = f.y - z * 1.04;
          const dir = Math.sign(x - f.x) || 1;
          const beat = 1 + 0.12 * Math.max(0, Math.sin(r.t * 14));
          const rad = z * 0.06 * show * beat;
          glow.circle(hx, hy, rad * 1.6).fill({ color: TAUNT, alpha: 0.18 * fade });
          g.circle(hx, hy, rad).fill({ color: 0x3a120a, alpha: 0.75 * fade }).stroke({ color: TAUNT, width: w * 0.9, alpha: fade });
          // Hai mũi nhọn lồng nhau chỉ về phía người tung chiêu.
          for (const k of [-0.35, 0.25]) {
            const cx = hx + dir * rad * k;
            g.poly([cx - dir * rad * 0.3, hy - rad * 0.55, cx + dir * rad * 0.45, hy, cx - dir * rad * 0.3, hy + rad * 0.55], false)
              .stroke({ color: 0xffd9a8, width: w * 0.8, alpha: fade, cap: "round", join: "round" });
          }
          // Vệt sáng chạy từ đối thủ về ngực người tung chiêu, chỉ lúc đầu.
          const run = (r.t - 0.1) / 0.35;
          if (run > 0 && run < 1) {
            const mx = x;
            const my = y - z * 0.55;
            const k0 = Math.max(0, run - 0.3);
            const ax = f.x + (mx - f.x) * k0;
            const ay = f.y - z * 0.55 + (my - f.y + z * 0.55) * k0;
            const bx = f.x + (mx - f.x) * run;
            const by = f.y - z * 0.55 + (my - f.y + z * 0.55) * run;
            glow.moveTo(ax, ay).lineTo(bx, by).stroke({ color: TAUNT, width: w * 1.4, alpha: 0.8 * (1 - run), cap: "round" });
            glow.circle(bx, by, w * 1.8).fill({ color: 0xffd9a8, alpha: 0.9 * (1 - run) });
          }
        }
      }
      roars = roars.filter((r) => r.wait > 0 || r.t < LIFE);
    },
    clear() {
      roars = [];
      back.clear();
      g.clear();
      glow.clear();
    },
  };
}
