/**
 * Cột nước đóng băng vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu trận nước của pháp sư hệ Thủy làm
 * nước phun lên từ dưới chân từng đối thủ, rồi cột nước đông lại thành cụm tinh thể băng và vỡ tan.
 * Cột nước có viền cong mượt, dòng sáng chảy ngược lên và vương miện bọt mờ biên (soft.ts); tinh thể băng có hai
 * mặt sáng tối, gờ sáng và lấp lánh; lúc vỡ, mảnh băng văng ra và rơi.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";
import { softLayer } from "./soft";

/** Phun lên tới `RISE`, đông băng tới `FREEZE`, vỡ tan hết `LIFE` (giây). */
const RISE = 0.3;
const FREEZE = 0.6;
const LIFE = 1.2;
const FOAM = 0xeef9ff;
const ICE_LIGHT = 0xe6f6ff;
const ICE_DARK = 0x8cc4ea;

interface Pillar {
  readonly at: Point;
  readonly size: number;
  wait: number;
  t: number;
  readonly seed: number;
  /** Giọt nước văng quanh chân. */
  readonly drops: readonly { readonly vx: number; readonly vy: number; readonly r: number }[];
  /** Mảnh băng văng khi vỡ. */
  readonly shards: readonly { readonly vx: number; readonly vy: number; readonly r: number; readonly spin: number; readonly h: number }[];
}

/** Tinh thể băng: lăng trụ nhọn hai mặt (trái sáng, phải tối), gờ sáng ở sống giữa, gốc ở (x, y), nghiêng `ang`. */
function crystal(g: Graphics, x: number, y: number, w: number, h: number, ang: number, a: number) {
  if (a <= 0.01 || h <= 1) return;
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  // Đổi tọa độ cục bộ (u ngang, v lên trên) sang sân.
  const P = (u: number, v: number) => [x + u * c + v * s, y + u * s - v * c] as const;
  const bl = P(-w, 0), ml = P(-w * 0.92, h * 0.72), tip = P(0, h), mr = P(w * 0.92, h * 0.72), br = P(w, 0), mid = P(w * 0.08, 0);
  g.poly([...bl, ...ml, ...tip, ...mid]).fill({ color: ICE_LIGHT, alpha: 0.85 * a });
  g.poly([...mid, ...tip, ...mr, ...br]).fill({ color: ICE_DARK, alpha: 0.85 * a });
  // Sống giữa và mép sáng, viền ngoài xanh đậm mảnh.
  g.moveTo(...mid).lineTo(...tip).stroke({ color: 0xffffff, width: Math.max(1, w * 0.12), alpha: 0.9 * a });
  g.moveTo(...ml).lineTo(...tip).stroke({ color: 0xffffff, width: Math.max(1, w * 0.07), alpha: 0.7 * a });
  g.poly([...bl, ...ml, ...tip, ...mr, ...br]).stroke({ color: 0x3f86c0, width: Math.max(1, w * 0.06), alpha: 0.55 * a });
}

export function waterPillar(parent: Container, color: number) {
  const back = softLayer(parent);
  const g = new Graphics();
  parent.addChild(g);
  const front = softLayer(parent);
  let pillars: Pillar[] = [];
  return {
    /** Dựng cột nước dưới chân người đứng ở `at`, chờ `wait` giây. */
    cover(at: Point, size: number, wait = 0) {
      const drops = Array.from({ length: 16 }, () => ({
        vx: (Math.random() - 0.5) * size * 0.9,
        vy: -size * (0.5 + Math.random() * 0.7),
        r: size * (0.007 + Math.random() * 0.009),
      }));
      const shards = Array.from({ length: 12 }, () => ({
        vx: (Math.random() - 0.5) * size * 1.1,
        vy: -size * (0.2 + Math.random() * 0.6),
        r: size * (0.012 + Math.random() * 0.016),
        spin: (Math.random() - 0.5) * 18,
        h: Math.random(),
      }));
      pillars.push({ at, size, wait, t: 0, seed: Math.random() * 10, drops, shards });
    },
    update(dt: number) {
      back.begin();
      front.begin();
      g.clear();
      for (const p of pillars) {
        if (p.wait > 0) {
          p.wait -= dt;
          continue;
        }
        p.t += dt;
        if (p.t >= LIFE) continue;
        const { x, y } = p.at;
        const S = p.size;
        const w = S * 0.15;
        const rise = Math.min(1, p.t / RISE);
        const h = S * 0.85 * (1 - (1 - rise) ** 3);
        const ice = Math.max(0, Math.min(1, (p.t - RISE) / (FREEZE - RISE)));
        const fade = p.t < FREEZE ? 1 : 1 - (p.t - FREEZE) / (LIFE - FREEZE);
        const water = (1 - ice) * fade;
        // Vũng nước và gợn sóng dưới chân, quầng lạnh sau cột.
        back.glow({ x, y, w: w * 4.4, h: w * 0.9, color, alpha: 0.6 * fade });
        back.glow({ x, y: y - h * 0.5, w: w * 4, h: h * 1.3, color, alpha: 0.28 * fade });
        for (let i = 0; i < 2; i++) {
          const q = (p.t * 1.4 + i * 0.5) % 1;
          g.ellipse(x, y, w * (1.2 + 1.6 * q), w * (0.25 + 0.3 * q)).stroke({ color: FOAM, width: S * 0.006, alpha: 0.6 * (1 - q) * fade });
        }
        if (water > 0.01) {
          // Thân cột: viền cong mượt lượn sóng, eo hẹp ở giữa, đầu tròn; lớp trong sáng hơn.
          const wob = (k: number) => Math.sin(p.t * 18 + k * 5 + p.seed) * w * 0.2;
          const body = (k: number) => {
            const ww = w * k;
            g.moveTo(x - ww, y)
              .bezierCurveTo(x - ww * 0.55 + wob(1), y - h * 0.3, x - ww * 0.75 + wob(2), y - h * 0.7, x - ww * 0.55, y - h * 0.95)
              .quadraticCurveTo(x, y - h * 1.08, x + ww * 0.55, y - h * 0.95)
              .bezierCurveTo(x + ww * 0.75 + wob(3), y - h * 0.7, x + ww * 0.55 + wob(4), y - h * 0.3, x + ww, y)
              .closePath();
          };
          body(1);
          g.fill({ color, alpha: 0.55 * water });
          body(0.62);
          g.fill({ color: 0x7cc8f2, alpha: 0.4 * water });
          body(1);
          g.stroke({ color: FOAM, width: S * 0.005, alpha: 0.45 * water });
          // Bọt trắng tung ở chân cột.
          for (let i = 0; i < 5; i++) {
            const q = (p.t * 3 + i * 0.2) % 1;
            front.glow({ x: x + (i - 2) * w * 0.55, y: y - q * w * 0.8, w: w * (0.7 - q * 0.3), color: FOAM, alpha: 0.6 * water * (1 - q) });
          }
          // Dòng sáng chảy ngược lên trong cột.
          for (let i = 0; i < 5; i++) {
            const q = (p.t * 2.2 + i * 0.21 + p.seed) % 1;
            const sx = x + (i - 2) * w * 0.28 + Math.sin(q * 6 + i) * w * 0.06;
            const y0 = y - q * h;
            const y1 = Math.max(y - h * 0.95, y0 - h * 0.16);
            g.moveTo(sx, y0).quadraticCurveTo(sx + w * 0.08, (y0 + y1) / 2, sx, y1)
              .stroke({ color: 0xffffff, width: S * 0.005, alpha: 0.55 * water * Math.sin(Math.PI * q) });
          }
          // Vương miện bọt ở đỉnh: các bọt mờ biên tròn xoay quanh đầu cột.
          for (let i = 0; i < 7; i++) {
            const ang = (i / 7) * Math.PI * 2 + p.t * 4;
            const r = w * (0.35 + 0.12 * Math.sin(i * 2.1 + p.t * 9));
            front.glow({ x: x + Math.cos(ang) * w * 0.55, y: y - h * 0.98 + Math.sin(ang) * w * 0.22, w: r * 2, color: FOAM, alpha: 0.75 * water });
          }
          front.glow({ x, y: y - h * 0.98, w: w * 1.6, h: w * 1.1, color: 0xffffff, alpha: 0.7 * water });
        }
        if (ice > 0) {
          // Cụm tinh thể băng mọc lên: thân chính cao, bốn tinh thể phụ nghiêng ra hai bên.
          const a = ice * fade;
          const grow = 1 - (1 - ice) ** 2;
          front.glow({ x, y: y - h * 0.45, w: w * 3.4, h: h * 1.1, color: 0xbfe6ff, alpha: 0.35 * a });
          for (const [dx, k, ang, ww] of [[-1.05, 0.42, -0.42, 0.48], [1.1, 0.5, 0.38, 0.5], [-0.55, 0.62, -0.18, 0.55], [0.6, 0.55, 0.22, 0.52]] as const)
            crystal(g, x + dx * w, y, w * ww, S * k * grow, ang, a);
          crystal(g, x, y, w * 0.8, h * 1.02 * grow, 0, a);
          // Lấp lánh: hai vạch chéo sáng chớp ở vài điểm trên băng.
          for (let i = 0; i < 4; i++) {
            const tw = Math.max(0, Math.sin(p.t * 14 + i * 1.9 + p.seed));
            const sx = x + (i - 1.5) * w * 0.5;
            const sy = y - h * (0.25 + 0.18 * i) * grow;
            const r = w * 0.35 * tw;
            if (r < 1) continue;
            g.moveTo(sx - r, sy).lineTo(sx + r, sy).moveTo(sx, sy - r).lineTo(sx, sy + r).stroke({ color: 0xffffff, width: Math.max(1, S * 0.004), alpha: a * tw });
            front.glow({ x: sx, y: sy, w: r * 1.4, color: 0xffffff, alpha: 0.8 * a * tw });
          }
        }
        // Giọt nước văng lúc phun.
        const s = Math.min(p.t, RISE * 1.6);
        for (const d of p.drops) {
          const dy = y + d.vy * s + S * 2.2 * s * s;
          if (dy > y) continue;
          const life = 1 - s / (RISE * 1.6);
          front.glow({ x: x + d.vx * s, y: dy, w: d.r * 3, color: FOAM, alpha: 0.85 * life });
        }
        // Băng vỡ: mảnh tam giác nhỏ xoay tròn văng ra rồi rơi.
        if (p.t > FREEZE) {
          const k = p.t - FREEZE;
          for (const d of p.shards) {
            const sx = x + d.vx * k;
            const sy = y - S * 0.15 - d.h * S * 0.5 + d.vy * k + S * 2.4 * k * k;
            if (sy > y) continue;
            const r = d.r;
            const rot = d.spin * k;
            const pt = (q: number) => [sx + Math.cos(rot + q) * r, sy + Math.sin(rot + q) * r];
            g.poly([...pt(0), ...pt(2.3), ...pt(4.1)]).fill({ color: d.h > 0.5 ? ICE_LIGHT : ICE_DARK, alpha: 0.9 * fade });
          }
        }
      }
      back.end();
      front.end();
      pillars = pillars.filter((p) => p.wait > 0 || p.t < LIFE);
    },
    clear() {
      pillars = [];
      back.clear();
      front.clear();
      g.clear();
    },
  };
}
