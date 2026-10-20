/** Đồ dùng chung cho các bộ xương hình động (puppet.ts, warrior.ts). */
import { Container, MeshPlane, Sprite, Texture, type Buffer } from "pixi.js";
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

/** Phản ứng chung của mọi bộ xương: trúng đòn (giật lùi, ửng đỏ) và được hồi (sáng xanh lá). */
export function reaction(kind: CueKind, a: number): { shiftX: number; tilt: number; tint: number; glow: number; done: boolean } {
  if (kind === "hit") {
    const k = pulse(a, 0, 0.06) * (1 - pulse(a, 0.12, 0.5));
    return {
      shiftX: -22 * k + Math.sin(a * 70) * 5 * (1 - pulse(a, 0, 0.3)),
      tilt: k,
      tint: a < 0.14 ? 0xff9a9a : 0xffffff,
      glow: 0,
      done: a > 0.6,
    };
  }
  const k = pulse(a, 0, 0.15) * (1 - pulse(a, 0.3, 0.7));
  return { shiftX: 0, tilt: 0, tint: k > 0.05 ? 0xb8ffcf : 0xffffff, glow: k, done: a > 0.7 };
}
