/**
 * Hình động nhân vật dựng bằng PixiJS: lớp ảnh gắn vào khớp xoay, vạt áo và tóc là lưới uốn theo gió.
 * Module này chỉ được nạp động (import()) khi trận có nhân vật có hình động, để PixiJS không nằm trong
 * gói tải đầu của trang.
 */
import {
  Assets,
  Container,
  Graphics,
  MeshPlane,
  Sprite,
  Texture,
  type Buffer,
} from "pixi.js";
import type { CueKind } from "./director";
import { MAGE_PARTS, partUrl, type MageRig, type Rig } from "./rigs";

export interface Puppet {
  /** Gốc tọa độ đặt ở điểm giữa hai bàn chân. */
  readonly view: Container;
  readonly height: number;
  update(dt: number): void;
  play(kind: CueKind): void;
  /** Gục: mờ, xám, ngả người, ngừng thở. */
  setDown(down: boolean): void;
  destroy(): void;
}

interface Wind {
  readonly axis: "x" | "y";
  /** Vị trí (0..1) dọc theo trục bắt đầu chịu gió. */
  readonly start: number;
  readonly amp: number;
  readonly freq: number;
  readonly k: number;
  readonly phase: number;
  /** Lượn theo chiều dọc thay vì ngang (dải lụa bay ngang). */
  readonly vertical?: boolean;
}

interface Bend {
  readonly buf: Buffer;
  readonly orig: Float32Array;
  readonly w: number;
  readonly h: number;
  readonly wind: Wind;
}

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const pulse = (t: number, a: number, b: number) => ease((t - a) / (b - a));

let glowTexture: Texture | null = null;

/** Đốm sáng tròn mờ dùng cho hào quang và hạt nước. */
function glow(): Texture {
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

export async function loadPuppet(rig: Rig, still: boolean): Promise<Puppet> {
  const urls = MAGE_PARTS.map((p) => partUrl(rig, p));
  const loaded = await Assets.load<Texture>(urls);
  const tex = Object.fromEntries(
    MAGE_PARTS.map((p, i) => [p, loaded[urls[i]!]!]),
  ) as Record<(typeof MAGE_PARTS)[number], Texture>;
  return mage(rig, tex, still);
}

function mage(
  rig: MageRig,
  tex: Record<(typeof MAGE_PARTS)[number], Texture>,
  still: boolean,
): Puppet {
  const { parts, joints, foot } = rig;
  const up = 1 / rig.texScale;
  const view = new Container();
  const shadow = new Graphics()
    .ellipse(0, -2, 150, 18)
    .fill({ color: 0x000000, alpha: 0.3 });
  view.addChild(shadow);
  /** Thân người, tọa độ con theo hệ PSD gốc. */
  const body = new Container();
  body.pivot.set(foot.x, foot.y);
  view.addChild(body);

  const bends: Bend[] = [];
  const sprite = (name: keyof typeof parts, parent: Container) => {
    const p = parts[name];
    const s = new Sprite(tex[name]);
    s.position.set(p.x, p.y);
    s.scale.set(up);
    parent.addChild(s);
  };
  const mesh = (name: keyof typeof parts, parent: Container, wind: Wind) => {
    const p = parts[name];
    const m = new MeshPlane({ texture: tex[name], verticesX: 10, verticesY: 12 });
    m.position.set(p.x, p.y);
    m.scale.set(up);
    parent.addChild(m);
    const buf = m.geometry.attributes.aPosition!.buffer;
    // Lưới tính theo điểm ảnh của texture, nên biên độ gió cũng chia theo tỉ lệ thu nhỏ.
    bends.push({
      buf,
      orig: Float32Array.from(buf.data as Float32Array),
      w: tex[name].width,
      h: tex[name].height,
      wind: { ...wind, amp: wind.amp * rig.texScale },
    });
  };
  const joint = (name: keyof typeof joints, parent: Container) => {
    const j = joints[name];
    const c = new Container();
    c.pivot.set(j.x, j.y);
    c.position.set(j.x, j.y);
    parent.addChild(c);
    return c;
  };

  mesh("backhair", body, { axis: "y", start: 0.18, amp: 9, freq: 1.3, k: 3.2, phase: 0 });
  sprite("legs", body);
  mesh("bottom", body, { axis: "y", start: 0.25, amp: 7, freq: 1.1, k: 2.6, phase: 1.2 });
  sprite("boots", body);
  const upper = joint("upper", body);
  mesh("top", upper, { axis: "y", start: 0.42, amp: 11, freq: 1.2, k: 2.8, phase: 0.6 });
  sprite("neck", upper);
  const armL = joint("armL", upper);
  sprite("armL", armL);
  const armR = joint("armR", upper);
  sprite("armR", armR);
  mesh("ribbon", upper, { axis: "x", start: 0.28, amp: 10, freq: 1.7, k: 4, phase: 2, vertical: true });
  const waterL = joint("waterL", upper);
  sprite("waterL", waterL);
  const waterR = joint("waterR", upper);
  sprite("waterR", waterR);
  // Hồ lô theo tay phải (armR) rồi lắc nhẹ quanh điểm cầm.
  const gourdArm = new Container();
  gourdArm.pivot.set(joints.armR.x, joints.armR.y);
  gourdArm.position.set(joints.armR.x, joints.armR.y);
  upper.addChild(gourdArm);
  const gourd = joint("gourd", gourdArm);
  const gourdGlow = new Sprite(glow());
  gourdGlow.anchor.set(0.5);
  gourdGlow.position.set(joints.gourd.x, joints.gourd.y - 10);
  gourdGlow.tint = rig.fxColor;
  gourdGlow.blendMode = "add";
  gourdGlow.scale.set(3.2);
  gourd.addChild(gourdGlow);
  sprite("gourd", gourd);
  const head = joint("head", upper);
  sprite("head", head);
  const eyeL = joint("eyeL", head);
  sprite("eyeL", eyeL);
  const eyeR = joint("eyeR", head);
  sprite("eyeR", eyeR);
  const palmGlow = new Sprite(glow());
  palmGlow.anchor.set(0.5);
  palmGlow.position.set(joints.waterR.x, joints.waterR.y);
  palmGlow.tint = rig.fxColor;
  palmGlow.blendMode = "add";
  upper.addChild(palmGlow);

  // Hạt nước và vòng sóng khi thi triển, cùng hệ tọa độ với thân.
  const fx = new Container();
  fx.pivot.set(foot.x, foot.y);
  view.addChild(fx);
  const drops = Array.from({ length: 40 }, () => {
    const s = new Sprite(glow());
    s.anchor.set(0.5);
    s.tint = rig.fxColor;
    s.blendMode = "add";
    s.visible = false;
    fx.addChild(s);
    return { s, life: 0, max: 1, vx: 0, vy: 0 };
  });
  const spawn = (x: number, y: number, vx: number, vy: number, size: number, life: number) => {
    const d = drops.find((d) => d.life <= 0);
    if (!d) return;
    Object.assign(d, { life, max: life, vx, vy });
    d.s.position.set(x, y);
    d.s.scale.set(size * 2);
    d.s.visible = true;
  };
  const ring = new Graphics();
  fx.addChild(ring);
  let ringA = 0;

  let time = Math.random() * 10;
  let nextBlink = time + 1 + Math.random() * 3;
  let blinkT = -1;
  let action: { kind: CueKind; t: number; fired: boolean } | null = null;
  let down = false;
  let downT = 0;

  const AMP = still ? 0 : 1;

  const update = (dt: number) => {
    time += dt;
    const t = time;
    const life = down ? 0 : AMP;
    body.scale.set(1, 1 + Math.sin(t * 2.1) * 0.006 * life);
    let upperRot = Math.sin(t * 1.05) * 0.008 * life;
    let armLRot = Math.sin(t * 1.4 + 0.5) * 0.025 * life;
    let armRRot = Math.sin(t * 1.3) * 0.022 * life;
    let headRot = Math.sin(t * 0.9 + 1) * 0.02 * life;
    let waterLRot = Math.sin(t * 1.6) * 0.06 * life;
    let waterRRot = Math.sin(t * 1.5 + 2) * 0.07 * life;
    let waterRScale = 1 + Math.sin(t * 2) * 0.02 * life;
    let glowA = 0.25 + Math.sin(t * 3) * 0.1 * life;
    let palmA = 0.15 + Math.sin(t * 2.6) * 0.08 * life;
    let gust = 1;
    let shiftX = 0;
    let tint = 0xffffff;

    if (action) {
      action.t += dt;
      const a = action.t;
      if (action.kind === "cast" || action.kind === "attack") {
        // Đòn kiếm là bản ngắn của thi triển: không nâng hồ lô, chỉ đẩy tay và bắn ít hạt.
        const big = action.kind === "cast";
        const raise = big ? pulse(a, 0, 0.28) * (1 - pulse(a, 0.55, 1.2)) : 0;
        const at = big ? 0.28 : 0;
        const push = pulse(a, at, at + 0.14) * (1 - pulse(a, at + 0.27, at + 0.8));
        upperRot += -0.03 * raise + 0.05 * push;
        armRRot += -0.09 * raise;
        armLRot += -0.12 * push;
        headRot += -0.03 * raise + 0.02 * push;
        glowA += 1.4 * raise;
        palmA += 1.6 * push;
        waterLRot += 0.25 * raise;
        waterRRot += -0.35 * push;
        waterRScale += 0.28 * push;
        gust = 1 + 1.6 * push;
        shiftX = big ? 0 : 26 * push;
        if (!action.fired && a >= at + 0.02) {
          action.fired = true;
          const n = big ? 26 : 12;
          for (let i = 0; i < n; i++) {
            const ang = (Math.random() - 0.5) * 0.9;
            const v = 380 + Math.random() * 420;
            spawn(joints.waterR.x + 12, joints.waterR.y, Math.cos(ang) * v, Math.sin(ang) * v - 60, 0.12 + Math.random() * 0.22, 0.5 + Math.random() * 0.4);
          }
          ringA = big ? 1 : 0.6;
        }
        if (a > (big ? 1.25 : 0.85)) action = null;
      } else if (action.kind === "hit") {
        const k = pulse(a, 0, 0.06) * (1 - pulse(a, 0.12, 0.5));
        shiftX = -22 * k + Math.sin(a * 70) * 5 * (1 - pulse(a, 0, 0.3));
        upperRot += 0.05 * k;
        headRot += 0.06 * k;
        tint = a < 0.14 ? 0xff9a9a : 0xffffff;
        if (a > 0.6) action = null;
      } else {
        // Được hồi: sáng xanh lá rồi tắt dần.
        const k = pulse(a, 0, 0.15) * (1 - pulse(a, 0.3, 0.7));
        tint = k > 0.05 ? 0xb8ffcf : 0xffffff;
        glowA += 0.8 * k;
        if (a > 0.7) action = null;
      }
    }

    if (down) downT = Math.min(1, downT + dt * 2.5);
    body.x = shiftX;
    body.rotation = -0.12 * ease(downT);
    body.tint = down ? 0x777777 : tint;
    body.alpha = 1 - 0.55 * ease(downT);
    shadow.alpha = 1 - 0.6 * ease(downT);
    upper.rotation = upperRot;
    armL.rotation = armLRot;
    armR.rotation = armRRot;
    gourdArm.rotation = armRRot;
    gourd.rotation = Math.sin(t * 1.7) * 0.03 * life;
    head.rotation = headRot;
    waterL.rotation = waterLRot;
    waterR.rotation = waterRRot;
    waterR.scale.set(waterRScale);
    waterL.alpha = down ? 0 : 0.88 + Math.sin(t * 2.4) * 0.12 * life;
    waterR.alpha = down ? 0 : 0.88 + Math.sin(t * 2.2 + 1) * 0.12 * life;
    gourdGlow.alpha = down ? 0 : Math.max(0, glowA);
    palmGlow.alpha = down ? 0 : Math.max(0, palmA);
    palmGlow.scale.set(1.8 + palmA * 1.8);

    // Chớp mắt.
    let eye = 1;
    if (!still && !down) {
      if (t > nextBlink) {
        blinkT = 0;
        nextBlink = t + 2.4 + Math.random() * 2.6;
      }
      if (blinkT >= 0) {
        blinkT += dt;
        const b = blinkT / 0.16;
        eye = b < 0.5 ? 1 - b * 1.8 : 0.1 + (b - 0.5) * 1.8;
        if (b >= 1) {
          blinkT = -1;
          eye = 1;
        }
      }
    }
    eyeL.scale.y = eyeR.scale.y = Math.max(0.1, Math.min(1, eye));

    // Lưới uốn theo gió.
    for (const B of bends) {
      const d = B.buf.data as Float32Array;
      const o = B.orig;
      const w = B.wind;
      for (let i = 0; i < d.length; i += 2) {
        const ox = o[i]!;
        const oy = o[i + 1]!;
        const n = w.axis === "y" ? oy / B.h : ox / B.w;
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

    for (const D of drops) {
      if (D.life <= 0) continue;
      D.life -= dt;
      D.vy += 160 * dt;
      D.s.x += D.vx * dt;
      D.s.y += D.vy * dt;
      D.vx *= 0.985;
      D.s.alpha = Math.max(0, D.life / D.max);
      if (D.life <= 0) D.s.visible = false;
    }
    ring.clear();
    if (ringA > 0) {
      ringA = Math.max(0, ringA - dt * 2.2);
      const r = 30 + (1 - ringA) * 140;
      ring
        .ellipse(joints.waterR.x + 12, joints.waterR.y, r, r * 0.55)
        .stroke({ color: rig.fxColor, width: 6, alpha: ringA });
    }
  };

  update(0);

  return {
    view,
    height: rig.height,
    update,
    play(kind) {
      if (down || still) return;
      action = { kind, t: 0, fired: false };
    },
    setDown(next) {
      if (next === down) return;
      down = next;
      downT = next ? (still ? 1 : 0) : 0;
      if (next) action = null;
      update(0);
    },
    destroy() {
      view.destroy({ children: true });
    },
  };
}
