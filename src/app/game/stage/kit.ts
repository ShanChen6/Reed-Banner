/** Đồ dùng chung cho các bộ xương hình động (puppet.ts, warrior.ts). */
import { Container, Graphics, MeshPlane, Sprite, Texture, type Buffer } from "pixi.js";
import type { CueKind } from "./director";
import type { PartBox, Wind } from "./rigs";

export type { Wind } from "./rigs";

export interface Puppet {
  /** Gốc tọa độ đặt ở điểm giữa hai bàn chân. */
  readonly view: Container;
  readonly height: number;
  update(dt: number): void;
  play(kind: CueKind): void;
  /** Về tư thế đứng ngay, dùng khi xem thử hoặc phát lại động tác. */
  reset(): void;
  /** Gục: mờ, xám, ngả người, ngừng thở. */
  setDown(down: boolean): void;
  destroy(): void;
}

export const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
export const pulse = (t: number, a: number, b: number) => ease((t - a) / (b - a));

let glowTexture: Texture | null = null;

/** Đốm sáng tròn mờ dùng cho hào quang và hạt. */
export function glow(): Texture {
  if (glowTexture) return glowTexture;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.4, "rgba(255,255,255,0.45)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  glowTexture = Texture.from(c);
  return glowTexture;
}

interface Bend {
  readonly buf: Buffer;
  readonly orig: Float32Array;
  readonly w: number;
  readonly h: number;
  readonly wind: Wind;
}

/** Dựng lớp ảnh trong hệ tọa độ gốc của rig: ảnh thu nhỏ theo texScale nên phóng lại cho khớp. */
export function layers(texScale: number) {
  const up = 1 / texScale;
  const bends: Bend[] = [];
  return {
    sprite(tex: Texture, box: PartBox, parent: Container) {
      const s = new Sprite(tex);
      s.position.set(box.x, box.y);
      s.scale.set(up);
      parent.addChild(s);
      return s;
    },
    mesh(tex: Texture, box: PartBox, parent: Container, wind: Wind) {
      const m = new MeshPlane({ texture: tex, verticesX: 10, verticesY: 12 });
      m.position.set(box.x, box.y);
      m.scale.set(up);
      parent.addChild(m);
      const buf = m.geometry.attributes.aPosition!.buffer;
      // Lưới tính theo điểm ảnh của texture, nên biên độ gió cũng chia theo tỉ lệ thu nhỏ.
      bends.push({
        buf,
        orig: Float32Array.from(buf.data as Float32Array),
        w: tex.width,
        h: tex.height,
        wind: { ...wind, amp: wind.amp * texScale },
      });
      return m;
    },
    joint(x: number, y: number, parent: Container) {
      const c = new Container();
      c.pivot.set(x, y);
      c.position.set(x, y);
      parent.addChild(c);
      return c;
    },
    /** Uốn mọi lưới theo gió; `life` 0 là đứng yên, `gust` > 1 là gió mạnh lúc ra đòn. */
    bend(t: number, life: number, gust: number) {
      for (const B of bends) {
        const d = B.buf.data as Float32Array;
        const o = B.orig;
        const w = B.wind;
        for (let i = 0; i < d.length; i += 2) {
          const ox = o[i]!;
          const oy = o[i + 1]!;
          const along = w.axis === "y" ? oy / B.h : ox / B.w;
          const n = w.reverse ? 1 - along : along;
          let wgt = (n - w.start) / (1 - w.start);
          wgt = wgt <= 0 ? 0 : wgt * wgt;
          const wave = Math.sin(t * w.freq * (gust > 1 ? 1.6 : 1) + n * w.k + w.phase) * w.amp * life * gust * wgt;
          if (w.vertical) {
            d[i] = ox;
            d[i + 1] = oy + wave;
          } else {
            d[i] = ox + wave;
            d[i + 1] = oy + Math.abs(wave) * 0.15;
          }
        }
        B.buf.update();
      }
    },
  };
}

/** Hạt sáng bắn ra rồi rơi theo trọng lực. */
export function particles(parent: Container, color: number, count: number, gravity = 160) {
  const drops = Array.from({ length: count }, () => {
    const s = new Sprite(glow());
    s.anchor.set(0.5);
    s.tint = color;
    s.blendMode = "add";
    s.visible = false;
    parent.addChild(s);
    return { s, life: 0, max: 1, vx: 0, vy: 0 };
  });
  return {
    /** Còn hạt nào đang bay. */
    active() {
      return drops.some((d) => d.life > 0);
    },
    clear() {
      for (const d of drops) {
        d.life = 0;
        d.s.visible = false;
      }
    },
    spawn(x: number, y: number, vx: number, vy: number, size: number, life: number) {
      const d = drops.find((d) => d.life <= 0);
      if (!d) return;
      Object.assign(d, { life, max: life, vx, vy });
      d.s.position.set(x, y);
      d.s.scale.set(size * 2);
      d.s.visible = true;
    },
    update(dt: number) {
      for (const D of drops) {
        if (D.life <= 0) continue;
        D.life -= dt;
        D.vy += gravity * dt;
        D.s.x += D.vx * dt;
        D.s.y += D.vy * dt;
        D.vx *= 0.985;
        D.s.alpha = Math.max(0, D.life / D.max);
        if (D.life <= 0) D.s.visible = false;
      }
    },
  };
}

/** Chu kỳ thở lúc đứng (giây), trong khoảng 1,6–2,4 s của bảng hoạt ảnh. */
export const IDLE_PERIOD = 2;
/** Tần số góc của nhịp thở, dùng cho sin(t * BREATH). */
export const BREATH = (2 * Math.PI) / IDLE_PERIOD;
/** Gục: ngả người trong 0,8 s rồi giữ khung cuối. */
export const KO_SECONDS = 0.8;
/** Ăn mừng: 1,2 s vào thế rồi lặp đoạn cuối. */
export const VICTORY_INTRO = 1.2;

/** Động tác phản ứng dùng chung, không theo vũ khí. */
export type ReactionKind = "ready" | "hit" | "guard" | "buff" | "debuff" | "heal";

export interface Reaction {
  /** Lùi (âm) hoặc tiến (dương) theo hướng mặt. */
  readonly shiftX: number;
  /** Nhấc người lên (đơn vị hệ tọa độ rig). */
  readonly lift: number;
  /** Ngả người ra sau (dương) hoặc chúi tới (âm), 0..1. */
  readonly tilt: number;
  /** Co (âm) hoặc vươn (dương) theo chiều dọc. */
  readonly squash: number;
  /** Nâng vũ khí / tay, 0..1. */
  readonly raise: number;
  readonly tint: number;
  readonly glow: number;
  readonly done: boolean;
}

const still = { shiftX: 0, lift: 0, tilt: 0, squash: 0, raise: 0, tint: 0xffffff, glow: 0 };

/**
 * Phản ứng chung của mọi bộ xương: vào thế khi đến lượt, trúng đòn (giật lùi, ửng đỏ), đỡ bằng khiên (ghì
 * người, ánh lam), được tăng (vươn lên, ánh vàng), bị giảm (chùng xuống, ánh tím), được hồi (ánh xanh lá).
 */
export function reaction(kind: ReactionKind, a: number): Reaction {
  switch (kind) {
    case "ready": {
      // Nhún xuống rồi bật lên, nâng vũ khí vào thế trong 0,3 s.
      const dip = pulse(a, 0, 0.08) * (1 - pulse(a, 0.08, 0.2));
      const up = pulse(a, 0.08, 0.18) * (1 - pulse(a, 0.18, 0.3));
      return { ...still, squash: -0.025 * dip + 0.015 * up, shiftX: 8 * up, tilt: -0.4 * up, raise: 0.5 * up, glow: 0.8 * up, done: a > 0.3 };
    }
    case "hit": {
      const k = pulse(a, 0, 0.05) * (1 - pulse(a, 0.1, 0.3));
      return {
        ...still,
        shiftX: -22 * k + Math.sin(a * 70) * 5 * (1 - pulse(a, 0, 0.25)),
        tilt: k,
        squash: -0.015 * k,
        tint: a < 0.1 ? 0xff9a9a : 0xffffff,
        done: a > 0.3,
      };
    }
    case "guard": {
      // Ghì người đỡ đòn, lùi nửa bước, giữ thế 0,4 s.
      const k = pulse(a, 0, 0.06) * (1 - pulse(a, 0.22, 0.4));
      return { ...still, shiftX: -9 * k, tilt: -0.5 * k, squash: -0.02 * k, raise: 0.5 * k, tint: k > 0.05 ? 0xcfe4ff : 0xffffff, glow: 0.6 * k, done: a > 0.4 };
    }
    case "buff": {
      const k = pulse(a, 0, 0.12) * (1 - pulse(a, 0.24, 0.4));
      return { ...still, lift: 10 * k, squash: 0.02 * k, raise: 0.35 * k, tint: k > 0.05 ? 0xfff0b8 : 0xffffff, glow: 1.2 * k, done: a > 0.4 };
    }
    case "debuff": {
      const k = pulse(a, 0, 0.1) * (1 - pulse(a, 0.24, 0.4));
      return { ...still, tilt: 0.6 * k, squash: -0.03 * k, shiftX: -4 * k, tint: k > 0.05 ? 0xc6a8ff : 0xffffff, done: a > 0.4 };
    }
    case "heal": {
      const k = pulse(a, 0, 0.1) * (1 - pulse(a, 0.22, 0.4));
      return { ...still, lift: 4 * k, tint: k > 0.05 ? 0xb8ffcf : 0xffffff, glow: k, done: a > 0.4 };
    }
  }
}

/**
 * Ăn mừng: 1,2 s đầu nhảy lên, nâng vũ khí lên cao; sau đó lặp nhịp đung đưa, vũ khí vẫn giơ cao. Không bao
 * giờ xong, động tác khác (hoặc đợt mới) mới thay.
 */
export function victory(a: number): Omit<Reaction, "done" | "tint"> {
  const raise = pulse(a, 0.1, 0.5);
  const hop = pulse(a, 0.15, 0.35) * (1 - pulse(a, 0.35, 0.6));
  const crouch = pulse(a, 0, 0.15) * (1 - pulse(a, 0.15, 0.3)) + pulse(a, 0.55, 0.65) * (1 - pulse(a, 0.65, 0.8));
  const loop = pulse(a, 0.8, VICTORY_INTRO);
  const sway = Math.sin((a - VICTORY_INTRO) * BREATH) * loop;
  return {
    shiftX: 0,
    lift: 34 * hop + 4 * Math.max(0, sway) * loop,
    tilt: -0.25 * raise + 0.12 * sway,
    squash: -0.03 * crouch + 0.01 * sway,
    raise: raise * (0.92 + 0.08 * sway),
    glow: 0.4 + 0.9 * hop + 0.3 * loop * (0.5 + 0.5 * Math.sin(a * 5)),
  };
}

/**
 * Hiệu ứng phản ứng vẽ quanh người, gốc tọa độ ở chân, hướng mặt là +x: vòng sáng dưới chân khi vào thế, vòm
 * khiên phía trước khi đỡ, hạt vàng bay lên khi được tăng, hạt tím rơi khi bị giảm, hạt xanh khi được hồi, và
 * tia sáng lấp lánh lúc ăn mừng.
 */
export function cueFx(parent: Container, height: number, color: number) {
  const root = new Container();
  parent.addChild(root);
  const g = new Graphics();
  g.blendMode = "add";
  root.addChild(g);
  const up = particles(root, 0xffd76b, 30, -260);
  const down = particles(root, 0x9b6bff, 24, 220);
  const green = particles(root, 0x6bffa8, 24, -200);
  const sparkle = particles(root, color, 24, -120);
  let kind: CueKind | null = null;
  let t = 0;
  let nextSparkle = 0;
  const w = height * 0.22;
  const spray = (p: ReturnType<typeof particles>, n: number, vy: number) => {
    for (let i = 0; i < n; i++) {
      const x = (Math.random() - 0.5) * w * 1.6;
      const y = -height * (0.15 + Math.random() * 0.7);
      p.spawn(x, y, (Math.random() - 0.5) * 60, vy * (0.5 + Math.random()), 0.12 + Math.random() * 0.16, 0.35 + Math.random() * 0.3);
    }
  };
  return {
    start(next: CueKind) {
      kind = next;
      t = 0;
      nextSparkle = 0;
      if (next === "buff") spray(up, 14, -160);
      else if (next === "debuff") spray(down, 12, 40);
      else if (next === "heal") spray(green, 12, -120);
    },
    clear() {
      kind = null;
      for (const p of [up, down, green, sparkle]) p.clear();
      g.clear();
    },
    update(dt: number) {
      t += dt;
      g.clear();
      if (kind === "ready" && t < 0.35) {
        const k = t / 0.35;
        g.ellipse(0, -4, w * (0.6 + k), w * 0.18 * (0.6 + k)).stroke({ color, width: 10, alpha: 0.9 * (1 - k) });
      } else if (kind === "guard" && t < 0.45) {
        // Vòm khiên cong trước mặt, lóe rồi tan.
        const k = Math.min(1, t / 0.08) * (1 - pulse(t, 0.2, 0.45));
        const cy = -height * 0.5;
        g.ellipse(w * 0.6, cy, w * 0.9, height * 0.52).stroke({ color: 0xbfe1ff, width: 14, alpha: 0.75 * k });
        g.ellipse(w * 0.6, cy, w * 0.9, height * 0.52).fill({ color: 0x8fc8ff, alpha: 0.12 * k });
      } else if (kind === "victory" && t >= nextSparkle) {
        nextSparkle = t + 0.18;
        spray(sparkle, 2, -80);
      }
      for (const p of [up, down, green, sparkle]) p.update(dt);
    },
  };
}
