/**
 * Vòng lá hồi sinh vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu hồi máu của y sư hệ Mộc nở một vòng
 * sáng dưới chân từng đồng đội, những vệt sáng mảnh trôi lên từ vòng rồi tắt dần, lá xoay vòng quanh người rồi bay lên
 * cùng hạt sáng. Có lớp sau lưng thì quầng sáng, nửa sau vòng, vệt sáng và lá phía sau vẽ sau nhân vật, chỉ nửa trước
 * vẽ đè lên người. Màu viền và hạt sáng đổi được: y sư hệ Hỏa dùng than hồng thay lá non, y sư hệ Thổ dùng lá thuốc
 * màu đất, y sư hệ Lôi dùng ánh điện tím.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Thời lượng một vòng (giây). */
const LIFE = 1.3;
/** Số vệt sáng trôi lên từ vòng dưới chân, số đoạn mỗi vệt (hai đầu nhạt). */
const STRANDS = 12;
const STEPS = 10;
/** Số lớp chồng của quầng sáng sau lưng (càng nhiều càng mịn). */
const HALO = 10;

interface Leaf {
  /** Góc xuất phát quanh người. */
  readonly phase: number;
  /** Tốc độ bay lên (phần chiều cao mỗi giây). */
  readonly rise: number;
  readonly size: number;
}

interface Strand {
  /** Góc trên vòng dưới chân. */
  readonly phase: number;
  /** Trễ (phần `LIFE`) trước khi trôi lên, độ cao tối đa (phần chiều cao người). */
  readonly delay: number;
  readonly reach: number;
}

interface Bloom {
  readonly at: Point;
  readonly size: number;
  wait: number;
  t: number;
  readonly leaves: readonly Leaf[];
  readonly strands: readonly Strand[];
}

/** Màu viền vòng, gân lá và hạt sáng. */
export interface BloomGlow {
  readonly line: number;
  readonly spark: number;
}

/** Lá non của y sư hệ Mộc. */
export const SPRING: BloomGlow = { line: 0xc9f5b0, spark: 0xeaffd8 };

/** Than hồng của y sư hệ Hỏa. */
export const EMBER: BloomGlow = { line: 0xffd8a0, spark: 0xfff2c4 };

/** Lá thuốc màu đất của y sư hệ Thổ. */
export const LOAM: BloomGlow = { line: 0xf3dc9a, spark: 0xfff4d0 };

/** Ánh điện tím của y sư hệ Lôi. */
export const VOLT: BloomGlow = { line: 0xe2d4ff, spark: 0xf6f0ff };

/**
 * `back`: lớp vẽ sau nhân vật (quầng sáng, nửa sau vòng, vệt sáng và lá phía sau); bỏ trống thì vẽ chung vào `parent`.
 */
export function leafBloom(parent: Container, color: number, glow: BloomGlow = SPRING, back: Container = parent) {
  const rear = new Graphics();
  rear.blendMode = "add";
  back.addChild(rear);
  const g = new Graphics();
  parent.addChild(g);
  let blooms: Bloom[] = [];

  /** Nửa elip dưới chân: `front` là nửa gần người xem (phía dưới), còn lại là nửa sau. */
  const arc = (to: Graphics, x: number, y: number, rx: number, ry: number, front: boolean) => {
    const from = front ? 0 : Math.PI;
    for (let i = 0; i <= 24; i++) {
      const a = from + (i / 24) * Math.PI;
      if (i === 0) to.moveTo(x + Math.cos(a) * rx, y + Math.sin(a) * ry);
      else to.lineTo(x + Math.cos(a) * rx, y + Math.sin(a) * ry);
    }
  };

  return {
    /** Nở vòng lá quanh người đứng ở `at` (giữa hai bàn chân), chờ `wait` giây. */
    cover(at: Point, size: number, wait = 0) {
      const leaves = Array.from({ length: 12 }, (_, i) => ({
        phase: (i / 12) * Math.PI * 2 + Math.random() * 0.4,
        rise: 0.35 + Math.random() * 0.35,
        size: 0.6 + Math.random() * 0.6,
      }));
      const strands = Array.from({ length: STRANDS }, (_, i) => ({
        phase: (i / STRANDS) * Math.PI * 2 + Math.random() * 0.5,
        delay: Math.random() * 0.35,
        reach: 0.5 + Math.random() * 0.4,
      }));
      blooms.push({ at, size, wait, t: 0, leaves, strands });
    },
    update(dt: number) {
      g.clear();
      rear.clear();
      for (const b of blooms) {
        if (b.wait > 0) {
          b.wait -= dt;
          continue;
        }
        b.t += dt;
        const k = b.t / LIFE;
        if (k >= 1) continue;
        const fade = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
        const { x, y } = b.at;
        const rx = b.size * 0.3;
        // Vòng sáng dưới chân nở rộng rồi nhạt: mặt vòng và nửa sau ở sau chân, nửa trước đè lên chân.
        const ring = Math.min(1, k * 4);
        const ex = rx * (0.4 + 0.8 * ring);
        const ey = ex * 0.2;
        rear.ellipse(x, y, ex, ey).fill({ color, alpha: 0.25 * fade });
        arc(rear, x, y, ex, ey, false);
        rear.stroke({ color: glow.line, width: b.size * 0.012, alpha: 0.8 * fade });
        arc(g, x, y, ex, ey, true);
        g.stroke({ color: glow.line, width: b.size * 0.012, alpha: 0.8 * fade });
        // Quầng sáng sau lưng: nhiều lớp rất mờ chồng lên nhau, không có viền, sáng nhất ngang ngực.
        const halo = Math.sin(Math.PI * Math.min(1, k * 1.6)) * fade;
        for (let i = 0; i < HALO; i++) {
          const r = 1 - (i / HALO) * 0.8;
          rear.ellipse(x, y - b.size * 0.48, b.size * 0.26 * r, b.size * 0.4 * r).fill({ color, alpha: 0.035 * halo });
        }
        // Vệt sáng ngắn trôi từ vòng lên, lắc nhẹ, hai đầu nhạt; vệt phía sau vẽ sau người, phía trước mờ hơn.
        for (const s of b.strands) {
          const life = (k - s.delay) / 0.6;
          if (life <= 0 || life >= 1) continue;
          const sx = x + Math.cos(s.phase) * ex * 0.6;
          const base = y + Math.sin(s.phase) * ey * 0.6;
          const head = b.size * s.reach * life;
          const len = b.size * 0.16;
          const front = Math.sin(s.phase) > 0;
          const to = front ? g : rear;
          const shine = Math.sin(Math.PI * life) * fade * (front ? 0.45 : 0.85);
          for (let j = 0; j < STEPS; j++) {
            const u0 = j / STEPS;
            const u1 = (j + 1) / STEPS;
            const y0 = base - head + len * u0;
            const y1 = base - head + len * u1;
            const sway = (yy: number) => sx + Math.sin(yy * 0.03 + s.phase * 3) * b.size * 0.012;
            const alpha = Math.sin(Math.PI * (u0 + u1) * 0.5) * shine;
            to.moveTo(sway(y0), y0).lineTo(sway(y1), y1).stroke({ color: glow.line, width: b.size * 0.007, alpha, cap: "round" });
          }
        }
        // Lá xoay quanh người và bay lên; lá phía sau vẽ sau người.
        for (const l of b.leaves) {
          const ang = l.phase + b.t * 3.2;
          const lx = x + Math.cos(ang) * rx * 0.9;
          const ly = y - b.size * Math.min(0.95, l.rise * b.t) + Math.sin(ang) * rx * 0.12;
          const depth = 0.55 + 0.45 * Math.sin(ang);
          const s = b.size * 0.022 * l.size;
          const to = Math.sin(ang) > 0 ? g : rear;
          to.ellipse(lx, ly, s * 1.8, s * 0.8).fill({ color, alpha: 0.9 * fade * depth });
          to.moveTo(lx - s * 1.6, ly).lineTo(lx + s * 1.6, ly).stroke({ color: glow.line, width: s * 0.25, alpha: 0.7 * fade * depth });
          to.circle(lx, ly - s * 3, s * 0.45).fill({ color: glow.spark, alpha: 0.8 * fade * depth });
        }
      }
      blooms = blooms.filter((b) => b.wait > 0 || b.t < LIFE);
    },
    clear() {
      blooms = [];
      g.clear();
      rear.clear();
    },
  };
}
