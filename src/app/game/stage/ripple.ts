/**
 * Sóng âm vô thanh vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu của sát thủ hệ Phong thổi sáo cho từng đợt
 * sóng âm hình vòng cung bay từ ống sáo tới đối thủ, cung nở rộng dần trên đường bay; tới nơi thì các vòng sóng loang
 * quanh đầu họ rồi tắt (đoạt phách: mất năng lượng, có thể câm lặng).
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Mỗi cung bay `FLIGHT`, cung sau cách cung trước `GAP`; vòng loang quanh đầu tắt sau `RING` (giây). */
const FLIGHT = 0.3;
const GAP = 0.08;
const ARCS = 4;
const RING = 0.55;

interface Pulse {
  readonly from: Point;
  readonly to: Point;
  readonly size: number;
  wait: number;
  t: number;
}

export function flutePulse(parent: Container, color: number) {
  const g = new Graphics();
  g.blendMode = "add";
  parent.addChild(g);
  let pulses: Pulse[] = [];
  const life = (ARCS - 1) * GAP + FLIGHT + RING;
  return {
    /** Sóng âm từ `from` (ống sáo) tới `to` (đầu đối thủ), chờ `wait` giây. */
    pulse(from: Point, to: Point, size: number, wait = 0) {
      pulses.push({ from, to, size, wait, t: 0 });
    },
    update(dt: number) {
      g.clear();
      for (const p of pulses) {
        if (p.wait > 0) {
          p.wait -= dt;
          continue;
        }
        p.t += dt;
        const s = p.size;
        const ang = Math.atan2(p.to.y - p.from.y, p.to.x - p.from.x);
        // Cung sóng: nửa vòng tròn hướng về đối thủ, nở rộng và nhạt dần khi bay.
        for (let n = 0; n < ARCS; n++) {
          const k = (p.t - n * GAP) / FLIGHT;
          if (k <= 0 || k >= 1) continue;
          const x = p.from.x + (p.to.x - p.from.x) * k;
          const y = p.from.y + (p.to.y - p.from.y) * k;
          const r = s * (0.05 + 0.12 * k);
          const fade = k < 0.8 ? 1 : (1 - k) / 0.2;
          g.arc(x, y, r, ang - 1.1, ang + 1.1).stroke({ color, width: s * 0.022, alpha: 0.9 * fade, cap: "round" });
          g.arc(x, y, r, ang - 0.9, ang + 0.9).stroke({ color: 0xe6fff9, width: s * 0.007, alpha: fade, cap: "round" });
        }
        // Vòng sóng loang quanh đầu đối thủ sau khi cung đầu tới nơi.
        const k = (p.t - FLIGHT) / RING;
        if (k > 0 && k < 1) {
          for (let n = 0; n < 3; n++) {
            const q = k - n * 0.18;
            if (q <= 0 || q >= 1) continue;
            const fade = 1 - q;
            g.ellipse(p.to.x, p.to.y, s * (0.05 + 0.16 * q), s * (0.03 + 0.09 * q)).stroke({ color, width: s * 0.01, alpha: 0.8 * fade });
          }
          g.circle(p.to.x, p.to.y, s * 0.05 * (1 - k)).fill({ color: 0xe6fff9, alpha: 0.6 * (1 - k) });
        }
      }
      pulses = pulses.filter((p) => p.wait > 0 || p.t < life);
    },
    clear() {
      pulses = [];
      g.clear();
    },
  };
}
