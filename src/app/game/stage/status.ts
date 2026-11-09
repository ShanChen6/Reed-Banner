/**
 * Trạng thái hiện liên tục trên người nhân vật (hệ tọa độ của stage PixiJS), đọc từ `fighter.effects` mỗi khung: còn
 * hiệu ứng thì còn hình, mỗi loại một hình dễ nhận ra không cần chữ.
 * - Thiêu đốt: lưỡi lửa liếm quanh người, tàn lửa bay lên, người hắt ánh cam.
 * - Trúng độc: làn khí xanh dưới chân, bọt độc sủi lên rồi vỡ, giọt độc nhỏ xuống.
 * - Đóng băng: tinh thể băng bọc chân, người phủ sương lam, lấp lánh tuyết.
 * - Câm lặng: vòng xích bạc quanh đầu, ấn ổ khóa trên đầu.
 * - Khiêu khích: người khiêu khích có vòng hồng tâm đỏ dưới chân; phe địch của họ có ấn mũi tên đỏ chỉ về phía người đó.
 * - Tăng/giảm Công, Thủ: ấn kiếm/khiên kèm mũi tên lên (sáng ấm) hoặc xuống (tím sẫm) trên đầu, hạt sáng bay lên khi
 *   tăng, rơi xuống khi giảm.
 * - Hồi máu: lá xanh và đốm sáng bay lên; Khiên: vòm sáng vàng bao quanh; Phản đòn: gai bạc lấp lánh xoay quanh.
 * Ánh sáng, khói là texture mờ biên (soft.ts); ấn trên đầu dùng badge.ts.
 */
import { Container, Graphics } from "pixi.js";
import type { EffectKind } from "@/core/battle/effects";
import type { Point } from "./rigs";
import { badgeLayer } from "./badge";
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
const UP = 0xffb347;
const DOWN = 0x9a6bd6;
const REGEN = 0x6fdc8c;
const SHIELD = 0xffd36b;
const SILVER = 0xe4e9f0;

/** Hàm băm nhỏ cho số giả ngẫu nhiên ổn định theo chỉ số. */
const rnd = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** Mũi tên lên (dir -1) hoặc xuống (dir 1) nét tròn đầu. */
function arrow(g: Graphics, x: number, y: number, r: number, dir: number, color: number, a: number) {
  g.moveTo(x, y - dir * r).lineTo(x, y + dir * r).stroke({ color, width: r * 0.42, alpha: a, cap: "round" });
  g.moveTo(x - r * 0.75, y - dir * r * 0.2).lineTo(x, y + dir * r * 0.75 + dir * r * 0.15).lineTo(x + r * 0.75, y - dir * r * 0.2)
    .stroke({ color, width: r * 0.42, alpha: a, cap: "round", join: "round" });
}

/** Kiếm đứng nhỏ. */
function sword(g: Graphics, x: number, y: number, r: number, a: number) {
  g.poly([x, y - r, x + r * 0.16, y - r * 0.75, x + r * 0.13, y + r * 0.35, x - r * 0.13, y + r * 0.35, x - r * 0.16, y - r * 0.75]).fill({ color: 0xf2f4f7, alpha: a });
  g.moveTo(x - r * 0.42, y + r * 0.4).lineTo(x + r * 0.42, y + r * 0.4).stroke({ color: 0xf2c44f, width: r * 0.16, alpha: a, cap: "round" });
  g.moveTo(x, y + r * 0.45).lineTo(x, y + r * 0.85).stroke({ color: 0xc9a25a, width: r * 0.17, alpha: a, cap: "round" });
}

/** Khiên nhỏ; `cracked` vẽ vết nứt. */
function shield(g: Graphics, x: number, y: number, r: number, a: number, cracked: boolean) {
  const pts = [x - r * 0.7, y - r * 0.75, x + r * 0.7, y - r * 0.75, x + r * 0.66, y + r * 0.05, x, y + r * 0.85, x - r * 0.66, y + r * 0.05];
  g.poly(pts).fill({ color: 0xf2f4f7, alpha: a });
  g.poly(pts).stroke({ color: 0x5b6b80, width: r * 0.1, alpha: a, join: "round" });
  if (cracked)
    g.moveTo(x - r * 0.1, y - r * 0.75).lineTo(x + r * 0.12, y - r * 0.3).lineTo(x - r * 0.12, y + r * 0.05).lineTo(x + r * 0.08, y + r * 0.5)
      .stroke({ color: 0x1a1210, width: r * 0.12, alpha: a, cap: "round", join: "round" });
}

/** Ổ khóa. */
function lock(g: Graphics, x: number, y: number, r: number, a: number) {
  g.moveTo(x - r * 0.3, y - r * 0.05).lineTo(x - r * 0.3, y - r * 0.3).arc(x, y - r * 0.3, r * 0.3, Math.PI, 0).lineTo(x + r * 0.3, y - r * 0.05)
    .stroke({ color: SILVER, width: r * 0.13, alpha: a, cap: "round" });
  g.roundRect(x - r * 0.45, y - r * 0.08, r * 0.9, r * 0.62, r * 0.1).fill({ color: SILVER, alpha: a });
  g.circle(x, y + r * 0.15, r * 0.09).fill({ color: 0x1a1210, alpha: a });
  g.rect(x - r * 0.035, y + r * 0.18, r * 0.07, r * 0.18).fill({ color: 0x1a1210, alpha: a });
}

/** Hai mũi nhọn lồng nhau chỉ theo `dir` (1 sang phải, -1 sang trái). */
function chevrons(g: Graphics, x: number, y: number, r: number, dir: number, a: number) {
  for (const k of [-0.32, 0.22]) {
    const cx = x + dir * r * k;
    g.poly([cx - dir * r * 0.28, y - r * 0.5, cx + dir * r * 0.4, y, cx - dir * r * 0.28, y + r * 0.5], false)
      .stroke({ color: 0xffe2bd, width: r * 0.17, alpha: a, cap: "round", join: "round" });
  }
}

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
  const badges = badgeLayer(front);
  /** Độ hiện (0..1) và tuổi (giây) của từng trạng thái trên từng người. */
  const seen = new Map<string, { a: number; age: number }>();
  let t = 0;

  return {
    update(dt: number, targets: readonly StatusTarget[]) {
      t += dt;
      behind.begin();
      haze.begin();
      glow.begin();
      badges.begin();
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
        const icons: { k: string; icon: (m: Graphics, cx: number, cy: number, r: number, a: number) => void; color: number }[] = [];

        // Khiên: vòm sáng vàng mờ bao quanh người, viền lấp lánh chạy vòng.
        const sh = A("shield");
        if (sh > 0) {
          behind.glow({ x, y: y - z * 0.5, w: z * 0.75, h: z * 1.15, color: SHIELD, alpha: 0.3 * sh });
          g.ellipse(x, y - z * 0.5, z * 0.33, z * 0.56).stroke({ color: SHIELD, width: z * 0.006, alpha: 0.55 * sh });
          for (let i = 0; i < 3; i++) {
            const ang = t * 1.6 + (i / 3) * Math.PI * 2;
            glow.glow({ x: x + Math.cos(ang) * z * 0.33, y: y - z * 0.5 + Math.sin(ang) * z * 0.56, w: z * 0.06, color: 0xfff1c4, alpha: 0.8 * sh });
          }
        }

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

        // Hồi máu: lá xanh và đốm sáng bay lên quanh người.
        const re = A("regen");
        if (re > 0) {
          for (let i = 0; i < 8; i++) {
            const q = (t * 0.45 + rnd(seed + i * 11)) % 1;
            const lx = x + (rnd(seed + i * 4) - 0.5) * z * 0.42 + Math.sin(t * 2 + i) * z * 0.03;
            const ly = y - z * (0.1 + 0.8 * q);
            const a = re * Math.sin(Math.PI * q);
            const rot = t * 2 + i;
            const L = z * 0.042;
            const c = Math.cos(rot);
            const s = Math.sin(rot);
            g.moveTo(lx - c * L, ly - s * L).quadraticCurveTo(lx - s * L * 0.6, ly + c * L * 0.6, lx + c * L, ly + s * L)
              .quadraticCurveTo(lx + s * L * 0.6, ly - c * L * 0.6, lx - c * L, ly - s * L).fill({ color: REGEN, alpha: 0.9 * a });
            glow.glow({ x: lx, y: ly, w: z * 0.1, color: REGEN, alpha: 0.6 * a });
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

        // Câm lặng: vòng xích bạc xoay quanh đầu, nửa sau mờ.
        const si = A("silence");
        if (si > 0) {
          const hy = y - z * 0.86;
          const rx = z * 0.18;
          const ry = rx * 0.3;
          const lw = z * 0.022;
          for (let n = 0; n < 16; n++) {
            const ang = (n / 16) * Math.PI * 2 + t * 1.1;
            const lx = x + Math.cos(ang) * rx;
            const ly = hy + Math.sin(ang) * ry;
            const al = si * (Math.sin(ang) < 0 ? 0.4 : 1);
            const tilt = Math.atan2(Math.cos(ang) * ry, -Math.sin(ang) * rx);
            const len = n % 2 ? lw * 1.2 : lw * 0.6;
            g.moveTo(lx - Math.cos(tilt) * len, ly - Math.sin(tilt) * len).lineTo(lx + Math.cos(tilt) * len, ly + Math.sin(tilt) * len)
              .stroke({ color: n % 2 ? 0xe9eef5 : 0x9aa6b4, width: n % 2 ? lw * 0.7 : lw * 0.9, alpha: al, cap: "round" });
          }
          glow.glow({ x, y: hy, w: rx * 2.8, h: ry * 4, color: 0xcfe0ff, alpha: 0.3 * si });
          icons.push({ k: "silence", color: 0xb8c4d4, icon: lock });
        }

        // Ấn chỉ số và khiêu khích trên đầu; hạt sáng bay lên khi tăng, rơi khi giảm.
        const stat = (k: EffectKind, up: boolean, draw: (m: Graphics, cx: number, cy: number, r: number, a: number) => void) => {
          const a = A(k);
          if (a <= 0) return;
          icons.push({
            k,
            color: up ? UP : DOWN,
            icon: (m, cx, cy, r, al) => {
              draw(m, cx - r * 0.2, cy, r * 0.62, al);
              arrow(m, cx + r * 0.45, cy, r * 0.32, up ? -1 : 1, up ? 0xffe0a0 : 0xd8c2ff, al);
            },
          });
          for (let i = 0; i < 3; i++) {
            const q = (t * 0.6 + i / 3 + rnd(seed + k.length)) % 1;
            const px = x + (rnd(seed + i * 9 + k.length) - 0.5) * z * 0.4;
            const py = up ? y - z * (0.1 + 0.8 * q) : y - z * (0.9 - 0.8 * q);
            glow.glow({ x: px, y: py, w: z * 0.035, h: z * 0.075, color: up ? UP : DOWN, alpha: 0.8 * a * Math.sin(Math.PI * q) });
          }
        };
        stat("atkUp", true, sword);
        stat("atkDown", false, sword);
        stat("defUp", true, (m, cx, cy, r, a) => shield(m, cx, cy, r, a, false));
        stat("defDown", false, (m, cx, cy, r, a) => shield(m, cx, cy, r, a, true));
        if (tg.taunter) {
          const dir = Math.sign(tg.taunter.x - x) || 1;
          icons.unshift({ k: "tauntMark", color: TAUNT, icon: (m, cx, cy, r, a) => chevrons(m, cx, cy, r, dir, a) });
        }

        const r = z * 0.065;
        icons.forEach((ic, n) => {
          const cx = x + (n - (icons.length - 1) / 2) * r * 2.7;
          badges.draw({ x: cx, y: y - z * 1.06, r, t: age(ic.k), alpha: A(ic.k), color: ic.color, icon: ic.icon });
        });
      }
      behind.end();
      haze.end();
      glow.end();
      badges.end();
    },
    clear() {
      seen.clear();
      behind.clear();
      haze.clear();
      glow.clear();
      badges.clear();
      g.clear();
    },
  };
}
