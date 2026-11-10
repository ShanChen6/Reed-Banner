/**
 * Thành đồng vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu tự thủ của binh lính hệ Kim dựng một bức thành
 * đồng có lỗ châu mai và mặt trời trống đồng trước mặt người tung chiêu, ánh kim lướt qua rồi thành chìm xuống.
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Mọc lên tới `RISE`, giữ tới `HOLD`, chìm hết `LIFE` (giây). */
const RISE = 0.2;
const HOLD = 1;
const LIFE = 1.3;

interface Wall {
  readonly at: Point;
  readonly size: number;
  /** Hướng mặt: 1 là sang phải, -1 là sang trái. */
  readonly dir: number;
  t: number;
}

export function steelBulwark(parent: Container, color: number) {
  const g = new Graphics();
  parent.addChild(g);
  const shine = new Graphics();
  shine.blendMode = "add";
  parent.addChild(shine);
  let walls: Wall[] = [];
  return {
    /** Dựng tường trước người đứng ở `at` (giữa hai bàn chân), quay về hướng `dir`. */
    raise(at: Point, size: number, dir: number) {
      walls.push({ at, size, dir, t: 0 });
    },
    update(dt: number) {
      g.clear();
      shine.clear();
      for (const w of walls) {
        w.t += dt;
        if (w.t >= LIFE) continue;
        const grow = 1 - (1 - Math.min(1, w.t / RISE)) ** 3;
        const sink = w.t < HOLD ? 1 : 1 - (w.t - HOLD) / (LIFE - HOLD);
        const h = w.size * 0.56 * grow * sink;
        const pw = w.size * 0.085;
        // pw: đơn vị bề ngang (một phần mười hai bề cao nhân vật).
        // Đứng hẳn phía trước người tung chiêu để không che nhân vật.
        const x0 = w.at.x + w.dir * w.size * 0.5;
        // Bóng đổ và vết nứt nền dưới chân tường.
        g.ellipse(x0, w.at.y, pw * 3.2, pw * 0.45).fill({ color: 0x000000, alpha: 0.35 * sink });
        // Thành đồng liền khối: thân hơi thu lên trên, mặt trái sáng mặt phải tối, răng cưa lỗ châu mai trên đỉnh, mạch ghép
        // các tấm đồng và mặt trời trống đồng chính giữa; viền vàng quanh cả bức thành.
        const half = pw * 2.3;
        const topHalf = half * 0.9;
        const merlon = pw * 0.42;
        const wallTop = w.at.y - h;
        const xL = x0 - half;
        const xR = x0 + half;
        const tL = x0 - topHalf;
        const tR = x0 + topHalf;
        const n = 5;
        const crest: number[] = [];
        for (let i = 0; i < n; i++) {
          const a0 = tL + ((tR - tL) * i) / n;
          const a1 = tL + ((tR - tL) * (i + 0.6)) / n;
          const a2 = tL + ((tR - tL) * (i + 1)) / n;
          crest.push(a0, wallTop - merlon * grow, a1, wallTop - merlon * grow, a1, wallTop, a2, wallTop);
        }
        const outline = [xL, w.at.y, tL, wallTop, ...crest, tR, wallTop - merlon * grow, tR, wallTop, xR, w.at.y];
        g.poly(outline).fill({ color: 0x6b4a22, alpha: 0.97 * sink });
        g.poly([xL, w.at.y, tL, wallTop, x0, wallTop, x0, w.at.y]).fill({ color: 0xa8793a, alpha: 0.85 * sink });
        g.poly([xL + pw * 0.15, w.at.y, tL + pw * 0.15, wallTop + pw * 0.1, tL + pw * 0.38, wallTop + pw * 0.1, xL + pw * 0.38, w.at.y])
          .fill({ color: 0xf0cf86, alpha: 0.35 * sink });
        // Mạch ghép tấm đồng: hàng ngang và mạch đứng so le.
        const rows = 5;
        for (let r = 1; r < rows; r++) {
          const ry = w.at.y - (h * r) / rows;
          const k = r / rows;
          const rl = xL + (tL - xL) * k;
          const rr = xR + (tR - xR) * k;
          g.moveTo(rl, ry).lineTo(rr, ry).stroke({ color: 0x3e2a12, width: w.size * 0.004, alpha: 0.8 * sink });
          for (let c = 0; c < 4; c++) {
            const cx = rl + ((rr - rl) * (c + (r % 2 ? 0.5 : 0.25) + 0.25)) / 4.5;
            g.moveTo(cx, ry).lineTo(cx, ry + h / rows).stroke({ color: 0x3e2a12, width: w.size * 0.003, alpha: 0.6 * sink });
          }
        }
        g.poly(outline).stroke({ color: 0xe2bd6c, width: w.size * 0.008, alpha: sink });
        // Mặt trời trống đồng: đĩa, vòng tia và các vòng đồng tâm.
        const cy = w.at.y - h * 0.55;
        const sr = pw * 1.05 * grow;
        g.circle(x0, cy, sr).fill({ color: 0x8a6230, alpha: sink }).stroke({ color: 0xf0cf86, width: w.size * 0.005, alpha: sink });
        g.circle(x0, cy, sr * 0.7).stroke({ color: 0xe2bd6c, width: w.size * 0.003, alpha: sink });
        const rays: number[] = [];
        for (let i = 0; i < 24; i++) {
          const ang = (i / 12) * Math.PI;
          const rr = i % 2 ? sr * 0.22 : sr * 0.55;
          rays.push(x0 + Math.cos(ang) * rr, cy + Math.sin(ang) * rr);
        }
        g.poly(rays).fill({ color: 0xf3dfa8, alpha: 0.9 * sink });
        g.circle(x0, cy, sr * 0.14).fill({ color: 0x6b4a22, alpha: sink });
        // Vệt ánh kim chạy ngang mặt tường.
        if (w.t > RISE) {
          const s = ((w.t - RISE) / (HOLD - RISE)) % 1;
          const sx = x0 + (s - 0.5) * pw * 4.2;
          shine.poly([sx - pw * 0.4, w.at.y, sx + pw * 0.1, w.at.y - h, sx + pw * 0.5, w.at.y - h, sx, w.at.y])
            .fill({ color: 0xffffff, alpha: 0.35 * sink });
        }
        // Bụi kim loại tung lên lúc tường mọc.
        if (w.t < RISE * 2) g.ellipse(x0, w.at.y - pw * 0.2, pw * 3.4 * grow, pw * 0.7).fill({ color, alpha: 0.4 * (1 - w.t / (RISE * 2)) });
      }
      walls = walls.filter((w) => w.t < LIFE);
    },
    clear() {
      walls = [];
      g.clear();
      shine.clear();
    },
  };
}
