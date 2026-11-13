/**
 * Thiết trận vẽ trên cả sân (hệ tọa độ của stage PixiJS): tuyệt chiêu của quân sư hệ Kim làm khiên (hình khiên hiệp sĩ) nứt
 * vỡ (Thủ giảm) và dấu mũi tên vàng dâng lên quanh đồng đội (Công tăng).
 */
import { Container, Graphics } from "pixi.js";
import type { Point } from "./rigs";

/** Thời lượng (giây). */
const LIFE = 1.2;

/**
 * Nửa trái khiên (đơn vị = nửa bề ngang khiên, tâm khiên ở gốc), đi từ đỉnh giữa qua vai trái xuống mũi nhọn dưới đáy.
 * Nửa phải lấy đối xứng.
 */
const SHIELD: readonly (readonly [number, number])[] = [
  [0, -0.62], [-0.14, -0.53], [-0.32, -0.48], [-0.5, -0.46], [-0.52, -0.2], [-0.49, 0.08], [-0.42, 0.28],
  [-0.3, 0.45], [-0.15, 0.57], [0, 0.64],
];
/** Đường nứt dọc khiên: [độ lệch ngang, vị trí từ đỉnh (0) tới đáy (1)]. */
const CRACK: readonly (readonly [number, number])[] = [
  [0, 0], [-0.09, 0.2], [0.07, 0.38], [-0.06, 0.58], [0.05, 0.78], [0, 1],
];
/** Ba lớp khiên: [tỉ lệ, lệch dọc, màu, có viền màu hệ]: vành sắt sẫm, khe sáng, lòng khiên. */
const LAYERS: readonly (readonly [number, number, number, boolean])[] = [
  [2, 0, 0x2b2f35, true], [1.72, 0.03, 0xd9dde2, false], [1.5, 0.05, 0x3d434b, false],
];

interface Mark {
  readonly at: Point;
  readonly size: number;
  /** `break`: khiên nứt trên đối thủ; `rally`: mũi tên vàng dâng lên ở đồng đội. */
  readonly kind: "break" | "rally";
  wait: number;
  t: number;
}

export function ironFormation(parent: Container, color: number) {
  const g = new Graphics();
  parent.addChild(g);
  let marks: Mark[] = [];
  return {
    /** Khiên nứt trên đối thủ đứng ở `at` (giữa thân). */
    shatter(at: Point, size: number, wait = 0) {
      marks.push({ at, size, kind: "break", wait, t: 0 });
    },
    /** Mũi tên vàng dâng lên ở đồng đội đứng ở `at` (giữa hai bàn chân). */
    rally(at: Point, size: number, wait = 0) {
      marks.push({ at, size, kind: "rally", wait, t: 0 });
    },
    update(dt: number) {
      g.clear();
      for (const m of marks) {
        if (m.wait > 0) {
          m.wait -= dt;
          continue;
        }
        m.t += dt;
        if (m.t >= LIFE) continue;
        const fade = m.t < LIFE * 0.6 ? 1 : 1 - (m.t - LIFE * 0.6) / (LIFE * 0.4);
        const { x, y } = m.at;
        const s = m.size;
        if (m.kind === "break") {
          // Khiên hiệp sĩ (vai bằng, đỉnh giữa nhô, đáy nhọn; viền dày, khe sáng, lòng sẫm) bật hiện, rạn một đường gấp
          // khúc dọc giữa rồi tách đôi: hai nửa xoay ra hai bên và rơi xuống.
          const r = s * 0.12;
          const pop = Math.min(1, m.t / 0.15);
          const grow = 0.7 + 0.3 * pop + 0.08 * Math.sin(Math.min(1, m.t / 0.25) * Math.PI);
          const split = Math.max(0, (m.t - 0.32) / 0.6);
          const w = r * grow;
          const crack = (t: number) => CRACK.reduce((acc, c, i) => (i && t <= c[1] && t >= CRACK[i - 1]![1]
            ? CRACK[i - 1]![0] + (c[0] - CRACK[i - 1]![0]) * ((t - CRACK[i - 1]![1]) / (c[1] - CRACK[i - 1]![1])) : acc), 0);
          for (const side of [-1, 1] as const) {
            // Mỗi nửa tách ra một bên, nghiêng nhẹ quanh tâm của chính nó rồi rơi.
            const ang = side * 0.22 * split;
            const ox = side * w * 0.7 * split;
            const oy = s * 0.3 * split * split;
            const px = x + side * w * 0.5;
            const py = y;
            const tf = (u: number, v: number): [number, number] => {
              const dx = x + u * w - px;
              const dy = y + v * w - py;
              return [px + ox + dx * Math.cos(ang) - dy * Math.sin(ang), py + oy + dx * Math.sin(ang) + dy * Math.cos(ang)];
            };
            for (const [k, dy, fill, edge] of LAYERS) {
              const pts: number[] = [];
              const top = -0.62 * k + dy;
              const bottom = 0.64 * k + dy;
              for (const [u, v] of SHIELD) pts.push(...tf(-side * u * k, v * k + dy));
              for (let i = CRACK.length - 1; i >= 0; i--) {
                const t = CRACK[i]![1];
                pts.push(...tf(crack(t) * k, top + (bottom - top) * t));
              }
              const poly = g.poly(pts).fill({ color: fill, alpha: 0.92 * fade * pop });
              if (edge) poly.stroke({ color, width: s * 0.006, alpha: fade * pop });
            }
          }
          if (m.t > 0.18 && split < 0.3) {
            const pts: number[] = [];
            for (const [cx, t] of CRACK) pts.push(x + cx * 2 * w, y + (-1.24 + 2.52 * t) * w);
            const k = 1 - split / 0.3;
            g.poly(pts, false).stroke({ color: 0xffffff, width: s * 0.01, alpha: fade * k });
            g.circle(x, y, w * 1.4 * (2 - k)).fill({ color, alpha: 0.22 * fade * k });
          }
          // Mũi tên đỏ chỉ xuống: Thủ giảm.
          const ay = y + r * 1.6 + s * 0.05 * Math.min(1, m.t * 3);
          g.poly([x - r * 0.4, ay - r * 0.3, x + r * 0.4, ay - r * 0.3, x, ay + r * 0.3]).fill({ color: 0xe0503a, alpha: fade });
        } else {
          // Ba mũi tên vàng dâng lên quanh người: Công tăng.
          for (let i = 0; i < 3; i++) {
            const k = Math.min(1, Math.max(0, (m.t - i * 0.1) / 0.8));
            const ax = x + (i - 1) * s * 0.12;
            const ay = y - s * (0.2 + 0.6 * k);
            const w = s * 0.04;
            g.poly([ax - w, ay + w * 0.8, ax, ay - w * 0.6, ax + w, ay + w * 0.8, ax, ay + w * 0.2]).fill({ color: 0xffcf4a, alpha: fade * (1 - k * 0.4) });
          }
          g.ellipse(x, y, s * 0.25, s * 0.05).stroke({ color: 0xffcf4a, width: s * 0.008, alpha: 0.7 * fade });
        }
      }
      marks = marks.filter((m) => m.wait > 0 || m.t < LIFE);
    },
    clear() {
      marks = [];
      g.clear();
    },
  };
}
