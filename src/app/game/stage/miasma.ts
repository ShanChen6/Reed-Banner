/**
 * Trúc độc mê hồn vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu của mưu sĩ hệ Mộc thả làn sương độc xanh
 * cuộn quanh từng đối thủ, lá trúc xoáy và vòng mê man quay trên đầu họ (rút năng lượng, câm lặng). Bảng màu đổi được:
 * mưu sĩ hệ Thủy dùng sương nước xanh và giọt nước xoáy thay lá trúc, mưu sĩ hệ Hỏa dùng khói kho lương và tàn lửa.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Thời lượng (giây). */
const LIFE = 1.3;

interface Mist {
  /** Giữa hai bàn chân người bị phủ. */
  readonly at: Point;
  readonly size: number;
  wait: number;
  t: number;
  readonly puffs: readonly { readonly dx: number; readonly dy: number; readonly r: number; readonly phase: number }[];
}

/** Màu mây sương, lá (hoặc giọt) xoáy và vòng mê man. */
export interface MistPalette {
  readonly haze: number;
  readonly leaf: number;
  readonly halo: number;
}

const BAMBOO: MistPalette = { haze: 0x5c7a3a, leaf: 0x8fd46a, halo: 0xd9f2a0 };

/** Sương nước của mưu sĩ hệ Thủy. */
export const TIDE: MistPalette = { haze: 0x1f4f7a, leaf: 0xbfe6ff, halo: 0xe8f7ff };

/** Khói kho lương cháy của mưu sĩ hệ Hỏa: tàn lửa xoáy thay lá trúc. */
export const SMOKE: MistPalette = { haze: 0x3b2a24, leaf: 0xffa54a, halo: 0xffd98a };

/** Bụi đất đường lương bị cắt của mưu sĩ hệ Thổ: sỏi vàng đất xoáy thay lá trúc. */
export const DUST: MistPalette = { haze: 0x5a4126, leaf: 0xd9a650, halo: 0xf0d59a };

/** Mây giông câm lặng của mưu sĩ hệ Lôi: tia điện tím xoáy thay lá trúc. */
export const STORM: MistPalette = { haze: 0x2d2350, leaf: 0xd9c8ff, halo: 0xf1eaff };

export function poisonMist(parent: Container, color: number, palette: MistPalette = BAMBOO) {
  const g = new Graphics();
  parent.addChild(g);
  let mists: Mist[] = [];
  return {
    /** Phủ sương quanh người đứng ở `at`, chờ `wait` giây. */
    cover(at: Point, size: number, wait = 0) {
      const puffs = Array.from({ length: 9 }, () => ({
        dx: (Math.random() - 0.5) * size * 0.4,
        dy: -Math.random() * size * 0.6,
        r: size * (0.08 + Math.random() * 0.06),
        phase: Math.random() * Math.PI * 2,
      }));
      mists.push({ at, size, wait, t: 0, puffs });
    },
    update(dt: number) {
      g.clear();
      for (const m of mists) {
        if (m.wait > 0) {
          m.wait -= dt;
          continue;
        }
        m.t += dt;
        if (m.t >= LIFE) continue;
        const s = m.size;
        const grow = Math.min(1, m.t / 0.3);
        const fade = m.t < LIFE * 0.65 ? 1 : 1 - (m.t - LIFE * 0.65) / (LIFE * 0.35);
        const { x, y } = m.at;
        // Sương độc: các cụm mây xanh tím cuộn lên quanh người.
        for (const p of m.puffs) {
          const px = x + p.dx + Math.sin(m.t * 3 + p.phase) * s * 0.03;
          const py = y + p.dy * grow - m.t * s * 0.05;
          g.circle(px, py, p.r * grow).fill({ color: palette.haze, alpha: 0.28 * fade });
          g.circle(px, py, p.r * 0.6 * grow).fill({ color, alpha: 0.22 * fade });
        }
        // Lá trúc xoáy quanh thân.
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2 + m.t * 4;
          const lx = x + Math.cos(ang) * s * 0.2;
          const ly = y - s * (0.2 + 0.08 * i) + Math.sin(ang) * s * 0.04;
          const w = s * 0.035;
          g.poly([lx - w, ly, lx, ly - w * 0.3, lx + w, ly, lx, ly + w * 0.3]).fill({ color: palette.leaf, alpha: 0.85 * fade });
        }
        // Vòng mê man quay trên đầu (câm lặng).
        if (m.t > 0.25) {
          const hy = y - s * 0.92;
          for (let i = 0; i < 3; i++) {
            const a = m.t * 6 + (i / 3) * Math.PI * 2;
            g.circle(x + Math.cos(a) * s * 0.07, hy + Math.sin(a) * s * 0.02, s * 0.014).fill({ color: palette.halo, alpha: fade });
          }
          g.ellipse(x, hy, s * 0.07, s * 0.02).stroke({ color, width: s * 0.006, alpha: 0.8 * fade });
        }
      }
      mists = mists.filter((m) => m.wait > 0 || m.t < LIFE);
    },
    clear() {
      mists = [];
      g.clear();
    },
  };
}
