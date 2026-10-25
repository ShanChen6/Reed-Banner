/**
 * Đoạt lương vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu của mưu sĩ hệ Thủy phủ sương băng lên từng
 * đối thủ, rồi hút các hạt sáng từ người họ bay vòng về phía người tung chiêu.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Sương băng hiện ngay; hạt bay trong `FLIGHT` giây, xong ở `LIFE`. */
const FLIGHT = 0.75;
const LIFE = 1.2;

interface Mote {
  /** Lệch xuất phát quanh người bị hút. */
  readonly dx: number;
  readonly dy: number;
  /** Chậm bao lâu mới bay, để hạt rời ra thành dòng. */
  readonly delay: number;
  /** Độ võng của đường bay (phần quãng đường). */
  readonly arc: number;
  readonly size: number;
}

interface Drain {
  readonly from: Point;
  readonly to: Point;
  /** Chiều cao người bị hút (px trên stage). */
  readonly size: number;
  wait: number;
  t: number;
  readonly motes: readonly Mote[];
}

export function supplyDrain(parent: Container, color: number) {
  const g = new Graphics();
  g.blendMode = "add";
  parent.addChild(g);
  let drains: Drain[] = [];
  return {
    /** Hút từ người đứng ở `from` (giữa thân) về `to`, chờ `wait` giây. */
    drain(from: Point, to: Point, size: number, wait = 0) {
      const motes = Array.from({ length: 10 }, () => ({
        dx: (Math.random() - 0.5) * size * 0.3,
        dy: (Math.random() - 0.5) * size * 0.5,
        delay: Math.random() * 0.3,
        arc: 0.15 + Math.random() * 0.2,
        size: size * (0.012 + Math.random() * 0.01),
      }));
      drains.push({ from, to, size, wait, t: 0, motes });
    },
    update(dt: number) {
      g.clear();
      for (const d of drains) {
        if (d.wait > 0) {
          d.wait -= dt;
          continue;
        }
        d.t += dt;
        const fade = d.t < LIFE - 0.25 ? 1 : Math.max(0, (LIFE - d.t) / 0.25);
        if (fade <= 0) continue;
        const { from, to, size } = d;
        // Sương băng: vầng sáng lạnh và vài tinh thể sáu cánh quanh người bị hút.
        const frost = Math.min(1, d.t / 0.15) * fade;
        g.ellipse(from.x, from.y, size * 0.2, size * 0.36).fill({ color, alpha: 0.18 * frost });
        for (let i = 0; i < 3; i++) {
          const cx = from.x + (i - 1) * size * 0.13;
          const cy = from.y - size * (0.1 + 0.12 * ((i * 7) % 3));
          const r = size * 0.04;
          for (let k = 0; k < 3; k++) {
            const a = (k / 3) * Math.PI;
            g.moveTo(cx - Math.cos(a) * r, cy - Math.sin(a) * r)
              .lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
              .stroke({ color: 0xe6f6ff, width: size * 0.006, alpha: 0.9 * frost });
          }
        }
        // Hạt sáng bay theo đường cong về người tung chiêu, có đuôi mờ.
        const dist = Math.hypot(to.x - from.x, to.y - from.y);
        for (const m of d.motes) {
          const k = Math.min(1, Math.max(0, (d.t - m.delay) / FLIGHT));
          if (k <= 0 || k >= 1) continue;
          const at = (q: number) => {
            const e = q * q * (3 - 2 * q);
            const x = from.x + m.dx * (1 - e) + (to.x - from.x) * e;
            const y = from.y + m.dy * (1 - e) + (to.y - from.y) * e - Math.sin(Math.PI * e) * dist * m.arc;
            return { x, y };
          };
          const p = at(k);
          const tail = at(Math.max(0, k - 0.08));
          g.moveTo(tail.x, tail.y).lineTo(p.x, p.y).stroke({ color, width: m.size * 1.4, alpha: 0.6 * fade, cap: "round" });
          g.circle(p.x, p.y, m.size * 1.6).fill({ color, alpha: 0.5 * fade });
          g.circle(p.x, p.y, m.size * 0.7).fill({ color: 0xffffff, alpha: 0.9 * fade });
        }
        // Người tung chiêu lóe sáng khi hạt về tới.
        const gain = Math.max(0, Math.min(1, (d.t - FLIGHT) / 0.2)) * fade;
        if (gain > 0) g.circle(to.x, to.y, size * 0.08 * (1 + gain)).fill({ color, alpha: 0.4 * gain });
      }
      drains = drains.filter((d) => d.wait > 0 || d.t < LIFE);
    },
    clear() {
      drains = [];
      g.clear();
    },
  };
}
