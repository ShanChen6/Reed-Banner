/**
 * Địa mạch bùng phát vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu của pháp sư hệ Thổ cắm trượng xuống đất
 * cho một đường địa mạch sáng hổ phách chạy ngầm dưới mặt đất tới chân đối thủ, tới nơi thì mảnh đá nhọn trồi lên, đá vụn
 * văng ra và vòng sóng đất lan rộng rồi tan.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Đường địa mạch chạy tới chân đối thủ (giây), đá nhọn trồi và tan tới hết `LIFE`. */
const RUN = 0.32;
const LIFE = 1.25;

interface Surge {
  readonly from: Point;
  readonly to: Point;
  /** Cỡ người (chiều cao), để đường nứt và đá nhọn theo khung. */
  readonly size: number;
  /** Độ lệch ngang của các khúc gấp dọc đường địa mạch (phần cỡ người). */
  readonly bends: readonly number[];
  /** Đá nhọn: lệch ngang, cao, rộng (phần cỡ người). */
  readonly spikes: readonly { readonly dx: number; readonly h: number; readonly w: number }[];
  readonly rocks: readonly { readonly vx: number; readonly vy: number; readonly s: number; readonly spin: number }[];
  wait: number;
  t: number;
}

export function earthSurge(parent: Container, color: number) {
  const g = new Graphics();
  const glow = new Graphics();
  glow.blendMode = "add";
  parent.addChild(g, glow);
  let surges: Surge[] = [];
  // Điểm trên đường địa mạch: đi thẳng theo mặt đất, gấp khúc như vết nứt.
  const along = (s: Surge, k: number) => {
    const i = Math.min(s.bends.length - 1, Math.floor(k * (s.bends.length - 1)));
    const f = k * (s.bends.length - 1) - i;
    const b = s.bends[i]! + (s.bends[Math.min(s.bends.length - 1, i + 1)]! - s.bends[i]!) * f;
    return { x: s.from.x + (s.to.x - s.from.x) * k, y: s.from.y + (s.to.y - s.from.y) * k + b * s.size * 0.02 };
  };
  return {
    /** Địa mạch chạy từ `from` (đầu trượng chạm đất) tới `to` (giữa hai bàn chân đối thủ), chờ `wait` giây. */
    surge(from: Point, to: Point, size: number, wait = 0) {
      const bends = Array.from({ length: 9 }, (_, i) => (i === 0 || i === 8 ? 0 : (Math.random() - 0.5) * 2));
      const spikes = Array.from({ length: 4 }, (_, i) => ({
        dx: (i - 1.5) * 0.1 + (Math.random() - 0.5) * 0.03,
        h: i === 1 || i === 2 ? 0.22 + Math.random() * 0.1 : 0.12 + Math.random() * 0.06,
        w: 0.05 + Math.random() * 0.025,
      }));
      const rocks = Array.from({ length: 10 }, () => ({
        vx: (Math.random() - 0.5) * size * 1.1,
        vy: -size * (0.5 + Math.random() * 0.7),
        s: size * (0.012 + Math.random() * 0.02),
        spin: (Math.random() - 0.5) * 12,
      }));
      surges.push({ from, to, size, bends, spikes, rocks, wait, t: 0 });
    },
    update(dt: number) {
      g.clear();
      glow.clear();
      for (const s of surges) {
        if (s.wait > 0) {
          s.wait -= dt;
          continue;
        }
        s.t += dt;
        if (s.t >= LIFE) continue;
        const fade = s.t < LIFE * 0.65 ? 1 : 1 - (s.t - LIFE * 0.65) / (LIFE * 0.35);
        const w = s.size * 0.01;
        // Đường địa mạch: vết nứt tối, lõi sáng hổ phách, đầu đường chạy là đốm sáng trắng.
        const k = Math.min(1, s.t / RUN);
        const steps = 24;
        const pts: number[] = [];
        for (let i = 0; i <= steps; i++) {
          const p = along(s, (i / steps) * k);
          pts.push(p.x, p.y);
        }
        g.poly(pts, false).stroke({ color: 0x2a1d10, width: w * 2.2, alpha: 0.7 * fade, join: "round", cap: "round" });
        glow.poly(pts, false).stroke({ color, width: w * 1.6, alpha: 0.85 * fade, join: "round", cap: "round" });
        glow.poly(pts, false).stroke({ color: 0xffe2a8, width: w * 0.6, alpha: fade, join: "round", cap: "round" });
        if (k < 1) {
          const head = along(s, k);
          glow.circle(head.x, head.y, w * 3).fill({ color, alpha: 0.6 });
          glow.circle(head.x, head.y, w * 1.4).fill({ color: 0xffffff, alpha: 0.9 });
          continue;
        }
        // Tới chân đối thủ: mảnh đá nhọn trồi lên, đá vụn văng, vòng sóng đất lan ra.
        const e = s.t - RUN;
        const rise = Math.min(1, e / 0.12);
        const sink = e > 0.6 ? Math.min(1, (e - 0.6) / 0.3) : 0;
        const { x, y } = s.to;
        const ring = Math.min(1, e / 0.45);
        g.ellipse(x, y, s.size * 0.3 * rise, s.size * 0.065 * rise).fill({ color: 0x2a1d10, alpha: 0.5 * fade });
        glow.ellipse(x, y, s.size * (0.16 + 0.42 * ring), s.size * (0.04 + 0.09 * ring)).stroke({ color, width: w * 2, alpha: 0.8 * (1 - ring) });
        for (const p of s.spikes) {
          const h = s.size * p.h * rise * (1 - sink);
          if (h <= 0) continue;
          const bx = x + s.size * p.dx;
          const hw = s.size * p.w;
          // Mảnh đá nhọn gồ ghề: mặt trái hứng sáng, mặt phải khuất tối.
          const shard = [bx - hw, y, bx - hw * 0.75, y - h * 0.55, bx - hw * 0.15, y - h, bx + hw * 0.55, y - h * 0.62, bx + hw, y];
          g.poly(shard).fill({ color: 0x9c7a50, alpha: fade });
          g.poly([bx - hw * 0.15, y - h, bx + hw * 0.55, y - h * 0.62, bx + hw, y, bx + hw * 0.05, y]).fill({ color: 0x5a4028, alpha: fade });
          g.poly(shard).stroke({ color: 0x2a1d10, width: w * 0.5, alpha: fade, join: "round" });
          // Vân sáng địa mạch dọc thân đá.
          glow.moveTo(bx - hw * 0.35, y).lineTo(bx - hw * 0.5, y - h * 0.45).lineTo(bx - hw * 0.2, y - h * 0.8)
            .stroke({ color, width: w * 0.6, alpha: 0.9 * fade, cap: "round", join: "round" });
        }
        for (const r of s.rocks) {
          const ry = y + r.vy * e + s.size * 2.4 * e * e;
          if (ry > y) continue;
          const rx = x + r.vx * e;
          const a = r.spin * e;
          const c = Math.cos(a) * r.s;
          const d = Math.sin(a) * r.s;
          g.poly([rx - c, ry - d, rx + d, ry - c, rx + c, ry + d, rx - d, ry + c]).fill({ color: 0x8a6a44, alpha: fade });
          g.poly([rx - c, ry - d, rx + d, ry - c, rx + c, ry + d, rx - d, ry + c]).stroke({ color: 0x2a1d10, width: r.s * 0.25, alpha: fade });
        }
      }
      surges = surges.filter((s) => s.wait > 0 || s.t < LIFE);
    },
    clear() {
      surges = [];
      g.clear();
      glow.clear();
    },
  };
}
