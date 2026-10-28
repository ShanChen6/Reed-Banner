/**
 * Khiên mặt trống vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu tạo khiên dựng một mặt trống đồng đứng
 * nghiêng trước người được che, quay về phía đối thủ. Vòng hoa văn dưới chân sáng lên, mặt trống mọc
 * từ đất với ngôi sao giữa xoay chậm, đá vụn bay vòng quanh người, rồi mặt trống lóe sáng, đá rơi xuống và tan.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Mọc lên tới `RISE`, giữ tới `HOLD`, tan hết `LIFE` (giây). */
const RISE = 0.3;
const HOLD = 1.05;
const LIFE = 1.45;
/** Đồng sẫm, đồng sáng của mặt trống. */
const BRONZE = 0x6b4318;
const GILT = 0xf2cf86;

interface Shield {
  readonly at: Point;
  readonly size: number;
  readonly dir: number;
  wait: number;
  t: number;
  /** Đá vụn bay vòng: góc đầu, bán kính (phần kích thước), cỡ, độ cao. */
  readonly rocks: readonly { readonly a: number; readonly r: number; readonly s: number; readonly h: number; readonly edge: readonly number[] }[];
}

const ease = (k: number) => 1 - (1 - Math.min(1, Math.max(0, k))) ** 3;

/** Điểm trên mặt trống: mặt trống là elip dẹt ngang vì nhìn chếch. */
const on = (cx: number, cy: number, rx: number, ry: number, a: number, k: number) =>
  [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k] as const;

/**
 * Vẽ một mặt trống đồng đứng nghiêng tâm (cx, cy), bán trục rx (ngang) và ry (dọc): nền đồng, tang trống phía sau
 * (theo `dir`), các vành hoa văn đồng tâm xen vạch chéo và ngôi sao giữa mười hai cánh xoay theo `spin`. `z` là cỡ
 * người để tính nét; dùng chung cho khiên tuyệt chiêu và động tác đỡ đòn, được khiên.
 */
export function drumFace(g: Graphics, cx: number, cy: number, rx: number, ry: number, dir: number, z: number, alpha: number, spin: number) {
  g.ellipse(cx, cy, rx, ry).fill({ color: BRONZE, alpha: 0.4 * alpha });
  // Bề dày tang trống ở phía sau mặt.
  g.ellipse(cx - dir * rx * 0.18, cy, rx, ry).stroke({ color: 0x3d250c, width: z * 0.014, alpha: 0.7 * alpha });
  g.ellipse(cx, cy, rx, ry).stroke({ color: GILT, width: z * 0.01, alpha: 0.95 * alpha });
  // Các vành hoa văn đồng tâm, xen vạch chéo như mặt trống Đông Sơn.
  for (const k of [0.82, 0.62, 0.42]) g.ellipse(cx, cy, rx * k, ry * k).stroke({ color: GILT, width: z * 0.004, alpha: 0.8 * alpha });
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const [x0, y0] = on(cx, cy, rx, ry, a, 0.64);
    const [x1, y1] = on(cx, cy, rx, ry, a + 0.12, 0.8);
    g.moveTo(x0, y0).lineTo(x1, y1).stroke({ color: GILT, width: z * 0.003, alpha: 0.6 * alpha });
  }
  // Ngôi sao giữa mười hai cánh.
  const star: number[] = [];
  for (let i = 0; i < 24; i++) {
    const [px, py] = on(cx, cy, rx, ry, (i / 24) * Math.PI * 2 + spin, i % 2 ? 0.14 : 0.38);
    star.push(px, py);
  }
  g.poly(star).fill({ color: GILT, alpha: 0.85 * alpha });
  g.ellipse(cx, cy, rx * 0.1, ry * 0.1).fill({ color: 0xfff1c8, alpha });
}

/** Vòng hoa văn dưới chân tâm (x, y), bán kính `r`: nền đồng mờ vẽ vào `g`, hai vành và vạch sáng vẽ vào `glow`. */
export function drumRing(g: Graphics, glow: Graphics, x: number, y: number, r: number, z: number, color: number, alpha: number, spin: number) {
  g.ellipse(x, y, r, r * 0.2).fill({ color: BRONZE, alpha: 0.28 * alpha });
  glow.ellipse(x, y, r, r * 0.2).stroke({ color, width: z * 0.012, alpha: 0.75 * alpha });
  glow.ellipse(x, y, r * 0.78, r * 0.156).stroke({ color, width: z * 0.006, alpha: 0.6 * alpha });
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 + spin;
    const [x0, y0] = on(x, y, r, r * 0.2, a, 0.8);
    const [x1, y1] = on(x, y, r, r * 0.2, a, 0.97);
    glow.moveTo(x0, y0).lineTo(x1, y1).stroke({ color, width: z * 0.004, alpha: 0.55 * alpha });
  }
}

/** `facing`: hướng mặt trống khi gọi `cover` (1 sang phải, -1 sang trái), theo phe người tung chiêu. */
export function drumShield(parent: Container, color: number, facing = 1) {
  const back = new Graphics();
  const g = new Graphics();
  const glow = new Graphics();
  glow.blendMode = "add";
  parent.addChild(back, g, glow);
  let shields: Shield[] = [];

  return {
    /** Dựng mặt trống trước người đứng ở `at` (giữa hai bàn chân), quay về hướng `dir`, chờ `wait` giây. */
    raise(at: Point, size: number, dir: number, wait = 0) {
      const rocks = Array.from({ length: 9 }, (_, i) => ({
        a: (i / 9) * Math.PI * 2 + Math.random() * 0.4,
        r: 0.3 + Math.random() * 0.08,
        s: 0.012 + Math.random() * 0.014,
        h: 0.12 + Math.random() * 0.3,
        edge: Array.from({ length: 6 }, () => 0.65 + Math.random() * 0.45),
      }));
      shields.push({ at, size, dir, wait, t: 0, rocks });
    },
    /** Dựng mặt trống trước người đứng ở `at`, quay theo `facing`. */
    cover(at: Point, size: number, wait = 0) {
      this.raise(at, size, facing, wait);
    },
    update(dt: number) {
      back.clear();
      g.clear();
      glow.clear();
      for (const s of shields) {
        if (s.wait > 0) {
          s.wait -= dt;
          continue;
        }
        s.t += dt;
        if (s.t >= LIFE) continue;
        const grow = ease(s.t / RISE);
        const fade = s.t < HOLD ? 1 : 1 - (s.t - HOLD) / (LIFE - HOLD);
        const { x, y } = s.at;
        const z = s.size;

        // Vòng hoa văn dưới chân như vành trống, sáng dần rồi tắt.
        drumRing(back, glow, x, y, z * 0.36 * grow, z, color, fade, s.t * 0.4);

        // Đá vụn bay vòng quanh người: nửa sau vẽ dưới, nửa trước vẽ trên mặt trống.
        for (const r of s.rocks) {
          const a = r.a + s.t * 2.2;
          const lift = s.t < HOLD ? ease(s.t / 0.4) : 1;
          const fall = s.t < HOLD ? 0 : ((s.t - HOLD) / (LIFE - HOLD)) ** 2;
          const rx = x + Math.cos(a) * z * r.r;
          const ry = y - z * r.h * lift + Math.sin(a) * z * r.r * 0.18 + z * r.h * fall;
          const k = z * r.s;
          const spin = a * 2;
          // Hòn đá sáu cạnh méo, xoay theo đường bay.
          const pts = r.edge.flatMap((e, i) => {
            const b = spin + (i / r.edge.length) * Math.PI * 2;
            return [rx + Math.cos(b) * k * e, ry + Math.sin(b) * k * e];
          });
          const layer = Math.sin(a) < 0 ? back : g;
          layer.poly(pts)
            .fill({ color: 0x8a6a3e, alpha: fade })
            .stroke({ color: 0x2e1f0e, width: k * 0.3, alpha: fade });
        }

        // Mặt trống: elip đứng nghiêng trước người, mọc từ đất.
        const rx = z * 0.12;
        const ry = z * 0.4 * grow;
        const cx = x + s.dir * z * 0.42;
        const cy = y - ry - z * 0.04;
        if (ry < 1) continue;
        drumFace(g, cx, cy, rx, ry, s.dir, z, fade, s.t * 0.8);

        // Ánh sáng: quầng quanh mặt trống, lóe mạnh lúc vừa mọc xong và lúc vỡ.
        const flash = Math.max(1 - Math.abs(s.t - RISE) / 0.2, s.t > HOLD ? 1 - fade : 0, 0);
        glow.ellipse(cx, cy, rx * 1.25, ry * 1.08).stroke({ color, width: z * 0.03, alpha: (0.22 + 0.4 * flash) * fade });
        glow.ellipse(cx, cy, rx * 0.5, ry * 0.5).fill({ color, alpha: 0.18 * flash });
        // Vệt sáng lướt dọc mặt trống.
        if (s.t > RISE && s.t < HOLD) {
          const k = (s.t - RISE) / (HOLD - RISE);
          const sy = cy + ry * (1.6 * k - 0.8);
          const half = rx * Math.sqrt(Math.max(0, 1 - ((sy - cy) / ry) ** 2));
          glow.moveTo(cx - half, sy).lineTo(cx + half, sy - ry * 0.08).stroke({ color: 0xffffff, width: z * 0.012, alpha: 0.35 * fade });
        }
      }
      shields = shields.filter((s) => s.wait > 0 || s.t < LIFE);
    },
    clear() {
      shields = [];
      back.clear();
      g.clear();
      glow.clear();
    },
  };
}
