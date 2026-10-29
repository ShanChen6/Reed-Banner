/**
 * Phi luân lửa vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu của xạ thủ hệ Hỏa phóng vòng sắt bọc lửa xoay
 * tít, nảy lần lượt qua từng đối thủ theo đường cung thấp; vòng kéo vệt tàn lửa, mỗi lần trúng lóe một vòng sáng.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Thời gian bay mỗi chặng và thời gian vòng sáng chỗ trúng (giây). */
const LEG = 0.22;
const FLASH = 0.35;

interface Disc {
  /** Điểm xuất phát rồi lần lượt các điểm trúng. */
  readonly path: readonly Point[];
  readonly size: number;
  wait: number;
  t: number;
}

export function flameDisc(parent: Container, color: number) {
  const g = new Graphics();
  g.blendMode = "add";
  parent.addChild(g);
  let discs: Disc[] = [];
  /** Vị trí vòng trên đường bay ở thời điểm `t` (đường cung thấp giữa hai điểm). */
  const at = (d: Disc, t: number): Point => {
    const leg = Math.min(d.path.length - 2, Math.floor(t / LEG));
    const k = Math.min(1, (t - leg * LEG) / LEG);
    const a = d.path[leg]!;
    const b = d.path[leg + 1]!;
    const arc = Math.sin(Math.PI * k) * Math.hypot(b.x - a.x, b.y - a.y) * 0.12;
    return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k - arc };
  };
  return {
    /** Phóng vòng từ `path[0]` qua lần lượt các điểm còn lại, chờ `wait` giây. */
    fling(path: readonly Point[], size: number, wait = 0) {
      if (path.length >= 2) discs.push({ path, size, wait, t: 0 });
    },
    update(dt: number) {
      g.clear();
      for (const d of discs) {
        if (d.wait > 0) {
          d.wait -= dt;
          continue;
        }
        d.t += dt;
        const legs = d.path.length - 1;
        const flight = legs * LEG;
        const s = d.size;
        // Vòng sáng ở mỗi điểm trúng, lóe khi vòng bay tới rồi tắt.
        for (let n = 1; n <= legs; n++) {
          const k = (d.t - n * LEG) / FLASH;
          if (k < 0 || k > 1) continue;
          const p = d.path[n]!;
          g.circle(p.x, p.y, s * (0.06 + 0.18 * k)).stroke({ color, width: s * 0.02, alpha: 1 - k });
          g.circle(p.x, p.y, s * 0.08 * (1 - k)).fill({ color: 0xffe08a, alpha: 0.8 * (1 - k) });
        }
        if (d.t >= flight) continue;
        // Vệt tàn lửa phía sau, nhỏ và nhạt dần.
        for (let i = 6; i >= 1; i--) {
          const q = at(d, Math.max(0, d.t - i * 0.025));
          g.circle(q.x, q.y, s * 0.03 * (1 - i / 7)).fill({ color, alpha: 0.6 * (1 - i / 7) });
        }
        // Vòng xoay tít: elip đổi bề ngang theo góc xoay, viền lửa và lõi vàng.
        const p = at(d, d.t);
        const spin = d.t * 40;
        const rx = s * 0.11 * (0.35 + 0.65 * Math.abs(Math.cos(spin)));
        const ry = s * 0.11;
        g.ellipse(p.x, p.y, rx, ry).stroke({ color, width: s * 0.03, alpha: 0.9 });
        g.ellipse(p.x, p.y, rx, ry).stroke({ color: 0xffe08a, width: s * 0.008, alpha: 1 });
      }
      discs = discs.filter((d) => d.wait > 0 || d.t < (d.path.length - 1) * LEG + FLASH);
    },
    clear() {
      discs = [];
      g.clear();
    },
  };
}
