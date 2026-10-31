/**
 * Thập đạo lôi binh vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu cả đội của quân sư hệ Lôi. Từ trước mặt người
 * tung chiêu, mười đạo sét chạy sát mặt đất như mười cánh quân xung trận, so le nhau, đầu nhọn như mũi giáo; tới chân đối
 * thủ thì bốc thành cột sét ngắn lên ngực (sát thương), rồi trên đầu họ hiện ấn mũi tên tím chỉ xuống (giảm công). Đốm năng
 * lượng tím bay lên quanh từng đồng đội (cộng năng lượng).
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Số đạo quân, nhịp xuất phát so le giữa hai đạo, thời gian chạy tới đối thủ (giây). */
const COLUMNS = 10;
const STAGGER = 0.045;
const RUN = 0.42;
/** Ấn giảm công giữ tới `HOLD`, cả hiệu ứng tắt hẳn ở `LIFE`; đốm năng lượng bay trong `MOTES` giây từ `RISE`. */
const HOLD = 1.25;
const LIFE = 1.6;
const RISE = 0.3;
const MOTES = 0.9;

interface Column {
  readonly from: Point;
  readonly to: Point;
  readonly delay: number;
}

interface Mote {
  readonly x: number;
  readonly y: number;
  readonly vy: number;
  readonly sway: number;
  readonly r: number;
}

interface March {
  readonly size: number;
  readonly columns: readonly Column[];
  readonly foes: readonly Point[];
  readonly motes: readonly Mote[];
  wait: number;
  t: number;
}

const ease = (k: number) => 1 - (1 - Math.min(1, Math.max(0, k))) ** 3;

/** Đường gấp khúc từ `a` tới `b`, lệch ngẫu nhiên theo phương vuông góc. */
function jagged(a: Point, b: Point, jitter: number, steps: number): number[] {
  const nx = -(b.y - a.y);
  const ny = b.x - a.x;
  const len = Math.hypot(nx, ny) || 1;
  const pts = [a.x, a.y];
  for (let i = 1; i < steps; i++) {
    const k = i / steps;
    const off = (Math.random() - 0.5) * jitter;
    pts.push(a.x + (b.x - a.x) * k + (nx / len) * off, a.y + (b.y - a.y) * k + (ny / len) * off);
  }
  pts.push(b.x, b.y);
  return pts;
}

export function thunderMarch(parent: Container, color: number) {
  const g = new Graphics();
  g.blendMode = "add";
  parent.addChild(g);
  let marches: March[] = [];
  const line = (pts: readonly number[], width: number, c: number, alpha: number) => {
    g.moveTo(pts[0]!, pts[1]!);
    for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i]!, pts[i + 1]!);
    g.stroke({ color: c, width, alpha, join: "round", cap: "round" });
  };

  return {
    /**
     * Mười đạo sét chạy từ `from` (mặt đất trước người tung chiêu) tới chân các đối thủ ở `foes`, đốm năng lượng bay lên
     * quanh các đồng đội ở `allies`; chờ `wait` giây.
     */
    march(from: Point, foes: readonly Point[], allies: readonly Point[], size: number, wait = 0) {
      if (foes.length === 0) return;
      const columns = Array.from({ length: COLUMNS }, (_, i) => {
        const foe = foes[i % foes.length]!;
        // Mỗi đạo một làn trên mặt đất, lệch trước sau để thành đội hình.
        const lane = ((i % 5) - 2) * size * 0.035;
        return {
          from: { x: from.x, y: from.y + lane },
          to: { x: foe.x + (Math.random() - 0.5) * size * 0.12, y: foe.y + lane * 0.5 },
          delay: i * STAGGER,
        };
      });
      const motes = allies.flatMap((a) =>
        Array.from({ length: 7 }, () => ({
          x: a.x + (Math.random() - 0.5) * size * 0.3,
          y: a.y - size * Math.random() * 0.2,
          vy: -size * (0.35 + Math.random() * 0.35),
          sway: (Math.random() - 0.5) * size * 0.08,
          r: size * (0.006 + Math.random() * 0.006),
        })),
      );
      marches.push({ size, columns, foes, motes, wait, t: 0 });
    },
    update(dt: number) {
      g.clear();
      for (const m of marches) {
        if (m.wait > 0) {
          m.wait -= dt;
          continue;
        }
        m.t += dt;
        if (m.t >= LIFE) continue;
        const z = m.size;
        const fade = m.t < HOLD ? 1 : Math.max(0, 1 - (m.t - HOLD) / (LIFE - HOLD));

        for (const c of m.columns) {
          const k = (m.t - c.delay) / RUN;
          if (k <= 0) continue;
          const dx = c.to.x - c.from.x;
          const dy = c.to.y - c.from.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          if (k < 1) {
            // Đạo quân đang chạy: vệt sét sát đất sau đầu mũi giáo.
            const p = ease(k);
            const head = { x: c.from.x + dx * p, y: c.from.y + dy * p };
            const tailLen = Math.min(len * p, z * 0.45);
            const tail = { x: head.x - ux * tailLen, y: head.y - uy * tailLen };
            const pts = jagged(tail, head, z * 0.035, 7);
            line(pts, z * 0.03, color, 0.35);
            line(pts, z * 0.009, 0xffffff, 0.9);
            // Mũi giáo sáng ở đầu đạo quân.
            const s = z * 0.035;
            g.poly([head.x + ux * s * 1.6, head.y + uy * s * 1.6, head.x - uy * s * 0.6, head.y + ux * s * 0.6, head.x + uy * s * 0.6, head.y - ux * s * 0.6])
              .fill({ color: 0xffffff, alpha: 0.9 });
            g.circle(head.x, head.y, s * 1.4).fill({ color, alpha: 0.35 });
            continue;
          }
          // Tới chân đối thủ: cột sét ngắn bốc lên ngực rồi tắt.
          const hit = (k - 1) * RUN / 0.3;
          if (hit < 1) {
            const a = 1 - hit;
            const top = { x: c.to.x + (Math.random() - 0.5) * z * 0.06, y: c.to.y - z * 0.6 };
            const pts = jagged(c.to, top, z * 0.06, 6);
            line(pts, z * 0.035, color, 0.4 * a);
            line(pts, z * 0.01, 0xffffff, 0.9 * a);
            g.ellipse(c.to.x, c.to.y, z * 0.1 * (1 + hit), z * 0.025 * (1 + hit)).fill({ color, alpha: 0.35 * a });
          }
        }

        // Ấn giảm công: vòng tím trên đầu đối thủ, hai mũi tên chỉ xuống trôi nhẹ theo nhịp.
        const last = (COLUMNS - 1) * STAGGER + RUN;
        const show = ease((m.t - last) / 0.2);
        if (show > 0 && fade > 0) {
          for (const f of m.foes) {
            const hx = f.x;
            const hy = f.y - z * 1.04;
            const rad = z * 0.06 * show;
            const w = z * 0.01;
            const drop = Math.sin(m.t * 9) * rad * 0.12;
            g.circle(hx, hy, rad * 1.7).fill({ color, alpha: 0.2 * fade });
            g.circle(hx, hy, rad).stroke({ color, width: w * 1.1, alpha: fade });
            for (const k of [-0.3, 0.3]) {
              const cy = hy + rad * k + drop;
              g.poly([hx - rad * 0.5, cy - rad * 0.25, hx, cy + rad * 0.25, hx + rad * 0.5, cy - rad * 0.25], false)
                .stroke({ color: 0xffffff, width: w * 0.8, alpha: fade, cap: "round", join: "round" });
            }
          }
        }

        // Cộng năng lượng: đốm tím bay lên quanh từng đồng đội, lắc nhẹ rồi tắt.
        const r = m.t - RISE;
        if (r > 0 && r < MOTES) {
          const k = r / MOTES;
          const e = 1 - (1 - k) * (1 - k);
          for (const p of m.motes) {
            const px = p.x + p.sway * Math.sin(k * Math.PI * 2);
            const py = p.y + p.vy * e;
            g.circle(px, py, p.r * 2.6).fill({ color, alpha: 0.35 * (1 - k) });
            g.circle(px, py, p.r).fill({ color: 0xffffff, alpha: 0.9 * (1 - k) });
          }
        }
      }
      marches = marches.filter((m) => m.wait > 0 || m.t < LIFE);
    },
    clear() {
      marches = [];
      g.clear();
    },
  };
}
