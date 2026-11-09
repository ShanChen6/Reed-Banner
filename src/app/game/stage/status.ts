/**
 * Trạng thái hiện liên tục trên người nhân vật (hệ tọa độ của stage PixiJS), đọc từ `fighter.effects` mỗi khung: còn
 * hiệu ứng thì còn hình, mỗi loại một hình dễ nhận ra không cần chữ.
 * - Thiêu đốt: lưỡi lửa liếm quanh người, tàn lửa bay lên, người hắt ánh cam.
 * - Trúng độc: làn khí xanh dưới chân, bọt độc sủi lên rồi vỡ, giọt độc nhỏ xuống.
 * - Đóng băng: tinh thể băng bọc chân, người phủ sương lam, lấp lánh tuyết.
 * - Câm lặng: lá bùa phong ấn dán trước ngực, tia năng lượng quanh vai lóe lên rồi tắt thành khói.
 * - Khiêu khích: người khiêu khích có vòng hồng tâm đỏ dưới chân; phe địch của họ nổi gân giận đỏ cạnh đầu, bốc hơi đỏ
 *   và có luồng chấm đỏ kéo về phía người khiêu khích.
 * - Phản đòn: gai bạc lấp lánh xoay quanh thân.
 * Được khiên, tăng/giảm chỉ số, hồi máu đã có hiệu ứng lúc nhận (kit.ts) nên không vẽ thêm ở đây.
 * Ánh sáng, khói là texture mờ biên (soft.ts).
 */
import { Container, Graphics } from "pixi.js";
import type { EffectKind } from "@/core/battle/effects";
import type { Point } from "./rigs";
import { softLayer, softTongue } from "./soft";

export interface StatusTarget {
  /** Khóa ổn định của ô đứng (để nhớ lúc hiện/tắt từng trạng thái). */
  readonly key: string;
  /** Giữa hai bàn chân. */
  readonly at: Point;
  /** Chiều cao hình người (điểm ảnh). */
  readonly size: number;
  readonly kinds: readonly EffectKind[];
  /** Có người phe kia đang khiêu khích: chỗ đứng của họ (ấn mũi tên chỉ về đó). */
  readonly taunter?: Point | null;
}

const BURN = 0xff6a1f;
const POISON = 0x7ed957;
const POISON_DARK = 0x2f6b1f;
const ICE = 0xbfe6ff;
const ICE_DARK = 0x6fb2e6;
const TAUNT = 0xe0482c;
const SILVER = 0xe4e9f0;

/** Lá bùa phong ấn: giấy vàng, viền đậm, nét chữ son dọc, ấn tròn son ở đáy; treo ở mép trên tâm (x, y), nghiêng `ang`. */
export function paper(g: Graphics, x: number, y: number, w: number, h: number, ang: number, a: number) {
  if (a <= 0.01) return;
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const P = (u: number, v: number) => [x + u * c - v * s, y + u * s + v * c] as const;
  const box = [...P(-w / 2, 0), ...P(w / 2, 0), ...P(w / 2, h), ...P(-w / 2, h)];
  g.poly([...P(-w / 2 + w * 0.08, h * 0.04), ...P(w / 2 + w * 0.08, h * 0.04), ...P(w / 2 + w * 0.08, h * 1.04), ...P(-w / 2 + w * 0.08, h * 1.04)]).fill({ color: 0x000000, alpha: 0.3 * a });
  g.poly(box).fill({ color: 0xf2d77a, alpha: a });
  g.poly(box).stroke({ color: 0xa8812c, width: w * 0.06, alpha: a, join: "round" });
  const ink = { color: 0xb3261e, width: w * 0.1, alpha: a, cap: "round" as const, join: "round" as const };
  g.moveTo(...P(0, h * 0.1)).lineTo(...P(0, h * 0.62)).stroke(ink);
  g.moveTo(...P(-w * 0.26, h * 0.2)).lineTo(...P(w * 0.26, h * 0.2)).stroke(ink);
  g.moveTo(...P(-w * 0.22, h * 0.34)).lineTo(...P(w * 0.2, h * 0.42)).stroke(ink);
  g.moveTo(...P(-w * 0.24, h * 0.52)).lineTo(...P(-w * 0.05, h * 0.46)).lineTo(...P(w * 0.24, h * 0.56)).stroke(ink);
  g.circle(...P(0, h * 0.8), w * 0.24).stroke({ color: 0xb3261e, width: w * 0.08, alpha: a });
  g.circle(...P(0, h * 0.8), w * 0.08).fill({ color: 0xb3261e, alpha: a });
}

/** Dấu nổi gân giận: bốn nét cong đỏ quay lưng vào nhau. */
export function vein(g: Graphics, x: number, y: number, r: number, a: number) {
  if (a <= 0.01) return;
  for (let i = 0; i < 4; i++) {
    const q = (i * Math.PI) / 2;
    const cx = x + Math.cos(q) * r * 0.95;
    const cy = y + Math.sin(q) * r * 0.95;
    const t = q + Math.PI / 2;
    const ax = cx + Math.cos(t) * r * 0.5;
    const ay = cy + Math.sin(t) * r * 0.5;
    const bx = cx - Math.cos(t) * r * 0.5;
    const by = cy - Math.sin(t) * r * 0.5;
    g.moveTo(ax, ay).quadraticCurveTo(x + Math.cos(q) * r * 0.25, y + Math.sin(q) * r * 0.25, bx, by)
      .stroke({ color: 0x5a0d06, width: r * 0.42, alpha: a, cap: "round" });
    g.moveTo(ax, ay).quadraticCurveTo(x + Math.cos(q) * r * 0.25, y + Math.sin(q) * r * 0.25, bx, by)
      .stroke({ color: 0xff4a2e, width: r * 0.26, alpha: a, cap: "round" });
  }
}

/** Hàm băm nhỏ cho số giả ngẫu nhiên ổn định theo chỉ số. */
const rnd = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** Mảnh tinh thể băng gốc ở (x, y) cao h, rộng 2w, nghiêng `ang`. */
function crystal(g: Graphics, x: number, y: number, w: number, h: number, ang: number, a: number) {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const P = (u: number, v: number) => [x + u * c + v * s, y + u * s - v * c] as const;
  g.poly([...P(-w, 0), ...P(-w * 0.9, h * 0.7), ...P(0, h), ...P(w * 0.1, 0)]).fill({ color: ICE, alpha: 0.8 * a });
  g.poly([...P(w * 0.1, 0), ...P(0, h), ...P(w * 0.9, h * 0.7), ...P(w, 0)]).fill({ color: ICE_DARK, alpha: 0.8 * a });
  g.moveTo(...P(w * 0.1, 0)).lineTo(...P(0, h)).stroke({ color: 0xffffff, width: Math.max(1, w * 0.14), alpha: 0.85 * a });
  g.poly([...P(-w, 0), ...P(-w * 0.9, h * 0.7), ...P(0, h), ...P(w * 0.9, h * 0.7), ...P(w, 0)]).stroke({ color: 0x3f86c0, width: Math.max(1, w * 0.07), alpha: 0.5 * a, join: "round" });
}

export function statusLayer(back: Container, front: Container) {
  const behind = softLayer(back);
  const haze = softLayer(front, "normal");
  const g = new Graphics();
  front.addChild(g);
  const glow = softLayer(front);
  /** Độ hiện (0..1) và tuổi (giây) của từng trạng thái trên từng người. */
  const seen = new Map<string, { a: number; age: number }>();
  let t = 0;

  return {
    update(dt: number, targets: readonly StatusTarget[]) {
      t += dt;
      behind.begin();
      haze.begin();
      glow.begin();
      g.clear();
      const live = new Set<string>();
      for (const tg of targets) {
        const want = new Set<string>(tg.kinds);
        if (tg.taunter) want.add("tauntMark");
        for (const k of want) live.add(`${tg.key}|${k}`);
      }
      // Hiện dần khi có, tắt dần khi hết.
      for (const [id, v] of seen) if (!live.has(id)) v.a -= dt * 3;
      for (const id of live) {
        const v = seen.get(id) ?? { a: 0, age: 0 };
        v.a = Math.min(1, v.a + dt * 3);
        v.age += dt;
        seen.set(id, v);
      }
      for (const [id, v] of seen) if (v.a <= 0) seen.delete(id);

      for (const tg of targets) {
        const { x, y } = tg.at;
        const z = tg.size;
        const seed = tg.key.length * 7 + tg.key.charCodeAt(tg.key.length - 1);
        const A = (k: string) => seen.get(`${tg.key}|${k}`)?.a ?? 0;
        const age = (k: string) => seen.get(`${tg.key}|${k}`)?.age ?? 0;

        // Khiêu khích (người khiêu khích): vòng hồng tâm đỏ dưới chân, đập theo nhịp, quầng đỏ sau lưng.
        const ta = A("taunt");
        if (ta > 0) {
          const beat = 1 + 0.06 * Math.sin(t * 6);
          behind.glow({ x, y: y - z * 0.45, w: z * 0.7, h: z * 1.1, color: TAUNT, alpha: 0.28 * ta });
          for (const k of [1, 0.66, 0.33]) g.ellipse(x, y, z * 0.3 * k * beat, z * 0.07 * k * beat).stroke({ color: TAUNT, width: z * 0.007, alpha: 0.85 * ta });
          g.ellipse(x, y, z * 0.04, z * 0.012).fill({ color: TAUNT, alpha: ta });
          glow.glow({ x, y, w: z * 0.7, h: z * 0.16, color: TAUNT, alpha: 0.45 * ta });
        }

        // Thiêu đốt: lưỡi lửa quanh chân và thân, tàn lửa bay lên, ánh cam hắt lên người.
        const bu = A("burn");
        if (bu > 0) {
          glow.glow({ x, y: y - z * 0.35, w: z * 0.6, h: z * 0.85, color: BURN, alpha: 0.35 * bu });
          for (let i = 0; i < 8; i++) {
            const dx = (i / 7 - 0.5) * z * 0.38;
            const yy = y - (i % 3) * z * 0.11 - z * 0.02;
            softTongue(glow, x + dx, yy, z * 0.05, z * (0.24 + 0.1 * rnd(seed + i)), t, seed + i, bu, BURN);
          }
          for (let i = 0; i < 8; i++) {
            const q = (t * 0.7 + rnd(seed + i * 3)) % 1;
            const ex = x + (rnd(seed + i) - 0.5) * z * 0.36 + Math.sin(t * 5 + i) * z * 0.02;
            glow.glow({ x: ex, y: y - z * (0.05 + 0.85 * q), w: z * 0.028, color: 0xffc070, alpha: bu * Math.sin(Math.PI * q) });
          }
        }

        // Trúng độc: làn khí xanh dưới chân, bọt độc sủi lên rồi vỡ, giọt độc nhỏ từ thân.
        const po = A("poison");
        if (po > 0) {
          for (let i = 0; i < 4; i++)
            haze.glow({ x: x + (i - 1.5) * z * 0.1 + Math.sin(t * 1.3 + i) * z * 0.02, y: y - z * 0.04, w: z * 0.3, h: z * 0.12, color: POISON_DARK, alpha: 0.6 * po });
          glow.glow({ x, y: y - z * 0.4, w: z * 0.55, h: z * 0.85, color: POISON, alpha: 0.28 * po });
          for (let i = 0; i < 9; i++) {
            const q = (t * 0.55 + rnd(seed + i * 5)) % 1;
            const bx = x + (rnd(seed + i * 2) - 0.5) * z * 0.34 + Math.sin(t * 3 + i) * z * 0.015;
            const by = y - z * (0.05 + 0.8 * q);
            const r = z * (0.02 + 0.016 * rnd(seed + i)) * (q > 0.9 ? 1 + (q - 0.9) * 8 : 1);
            const a = po * (q > 0.9 ? 1 - (q - 0.9) * 10 : Math.min(1, q * 6));
            g.circle(bx, by, r).fill({ color: POISON, alpha: 0.35 * a }).stroke({ color: 0xd8ffb8, width: Math.max(1, r * 0.25), alpha: 0.85 * a });
            g.circle(bx - r * 0.35, by - r * 0.35, r * 0.25).fill({ color: 0xffffff, alpha: 0.8 * a });
          }
          for (let i = 0; i < 3; i++) {
            const q = (t * 0.9 + i / 3) % 1;
            const dx = x + (i - 1) * z * 0.12;
            const dy = y - z * 0.5 + q * z * 0.45;
            g.ellipse(dx, dy, z * 0.012, z * 0.02).fill({ color: POISON, alpha: po * (1 - q) });
          }
        }

        // Đóng băng: sương lam phủ người, tinh thể băng bọc chân, lấp lánh.
        const fr = A("freeze");
        if (fr > 0) {
          glow.glow({ x, y: y - z * 0.45, w: z * 0.65, h: z * 1.1, color: ICE, alpha: 0.5 * fr });
          const grow = Math.min(1, age("freeze") / 0.35);
          for (const [dx, h, ang, w] of [[-0.16, 0.2, -0.35, 0.05], [0.17, 0.22, 0.32, 0.05], [-0.07, 0.3, -0.12, 0.06], [0.08, 0.27, 0.14, 0.055], [0, 0.34, 0, 0.065]] as const)
            crystal(g, x + dx * z, y + z * 0.01, z * w, z * h * grow, ang, fr);
          for (let i = 0; i < 5; i++) {
            const tw = Math.max(0, Math.sin(t * 3 + i * 1.9 + seed)) ** 4;
            const sx = x + (rnd(seed + i) - 0.5) * z * 0.4;
            const sy = y - z * (0.15 + 0.7 * rnd(seed + i * 7));
            const r = z * 0.03 * tw;
            if (r < 1) continue;
            g.moveTo(sx - r, sy).lineTo(sx + r, sy).moveTo(sx, sy - r).lineTo(sx, sy + r).stroke({ color: 0xffffff, width: Math.max(1, z * 0.003), alpha: fr * tw });
            glow.glow({ x: sx, y: sy, w: r * 1.6, color: 0xffffff, alpha: 0.8 * fr * tw });
          }
        }

        // Phản đòn: gai bạc lấp lánh xoay quanh thân.
        const rf = A("reflect");
        if (rf > 0) {
          for (let i = 0; i < 6; i++) {
            const ang = t * 1.8 + (i / 6) * Math.PI * 2;
            const px = x + Math.cos(ang) * z * 0.3;
            const py = y - z * 0.5 + Math.sin(ang) * z * 0.08;
            const front = Math.sin(ang) > 0;
            const r = z * 0.04;
            const a = rf * (front ? 1 : 0.4);
            g.poly([px, py - r * 1.4, px + r * 0.45, py, px, py + r * 1.4, px - r * 0.45, py]).fill({ color: SILVER, alpha: a }).stroke({ color: 0x5b6b80, width: Math.max(1, r * 0.12), alpha: a });
            glow.glow({ x: px, y: py, w: r * 3, color: 0xdfe8ff, alpha: 0.5 * a });
          }
        }

        // Câm lặng: lá bùa phong ấn vàng chữ son dán trước ngực, đung đưa nhẹ; quanh vai tia năng lượng lóe lên rồi tắt
        // thành khói xám (muốn ra chiêu mà không được).
        const si = A("silence");
        if (si > 0) {
          const k = Math.min(1, age("silence") / 0.3);
          const stick = 1 + 0.25 * (1 - k) ** 2;
          behind.glow({ x, y: y - z * 0.55, w: z * 0.6, h: z * 1.0, color: 0x6c7586, alpha: 0.35 * si });
          for (let i = 0; i < 6; i++) {
            const q = (t * 0.8 + rnd(seed + i * 13)) % 1;
            const sx = x + (rnd(seed + i * 3) - 0.5) * z * 0.44;
            const sy = y - z * (0.62 + 0.25 * q);
            if (q < 0.45) glow.glow({ x: sx, y: sy, w: z * 0.035 * (1 - q), color: 0x8fd8ff, alpha: si * (1 - q / 0.45) });
            else haze.glow({ x: sx, y: sy, w: z * 0.06 * q, color: 0x55595f, alpha: 0.5 * si * (1 - q) });
          }
          paper(g, x, y - z * 0.66, z * 0.085 * stick, z * 0.25 * stick, Math.sin(t * 2.2 + seed) * 0.08 + 0.12, si * k);
        }

        // Bị khiêu khích: dấu nổi gân giận đỏ cạnh đầu đập theo nhịp, hơi giận đỏ bốc lên, luồng chấm đỏ kéo về người
        // khiêu khích (buộc phải đánh người đó).
        const tm = A("tauntMark");
        if (tm > 0 && tg.taunter) {
          const dir = Math.sign(tg.taunter.x - x) || 1;
          const k = Math.min(1, age("tauntMark") / 0.25);
          const beat = (1 + 0.15 * Math.max(0, Math.sin(t * 9))) * (1 + 0.6 * (1 - k) ** 2);
          for (let i = 0; i < 5; i++) {
            const q = (t * 0.9 + i / 5) % 1;
            glow.glow({ x: x + (i - 2) * z * 0.07 + Math.sin(t * 4 + i) * z * 0.02, y: y - z * (0.6 + 0.45 * q), w: z * 0.08 * (0.6 + q), h: z * 0.12, color: TAUNT, alpha: 0.4 * tm * Math.sin(Math.PI * q) });
          }
          behind.glow({ x, y: y - z * 0.5, w: z * 0.55, h: z * 1.0, color: TAUNT, alpha: 0.25 * tm });
          const vx = x + dir * z * 0.13;
          const vy = y - z * 0.98;
          glow.glow({ x: vx, y: vy, w: z * 0.16 * beat, color: TAUNT, alpha: 0.6 * tm });
          vein(g, vx, vy, z * 0.045 * beat, tm * k);
          const sx = x;
          const sy = y - z * 0.55;
          const ex = tg.taunter.x;
          const ey = tg.taunter.y - z * 0.55;
          for (let n = 0; n < 10; n++) {
            const q = (t * 0.7 + n / 10) % 1;
            const px = sx + (ex - sx) * q;
            const py = sy + (ey - sy) * q - Math.sin(Math.PI * q) * z * 0.12;
            glow.glow({ x: px, y: py, w: z * 0.035, color: n % 2 ? TAUNT : 0xffb08a, alpha: 0.7 * tm * Math.sin(Math.PI * q) });
          }
        }
      }
      behind.end();
      haze.end();
      glow.end();
    },
    clear() {
      seen.clear();
      behind.clear();
      haze.clear();
      glow.clear();
      g.clear();
    },
  };
}
