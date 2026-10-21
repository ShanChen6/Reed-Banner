/**
 * Hình động nhân vật dựng bằng PixiJS: lớp ảnh gắn vào khớp xoay, vạt áo và tóc là lưới uốn theo gió.
 * Module này chỉ được nạp động (import()) khi trận có nhân vật có hình động, để PixiJS không nằm trong
 * gói tải đầu của trang.
 */
import { Assets, Container, Graphics, Sprite, type Texture } from "pixi.js";
import type { CueKind } from "./director";
import {
  BREATH,
  cueFx,
  ease,
  glow,
  KO_SECONDS,
  layers,
  particles,
  pulse,
  reaction,
  victory,
  type Puppet,
} from "./kit";
import { MAGE_PARTS, partsOf, partUrl, type MageRig, type Rig } from "./rigs";
import { warrior } from "./warrior";

export type { Puppet } from "./kit";

export async function loadPuppet(rig: Rig, still: boolean): Promise<Puppet> {
  const names = partsOf(rig);
  const urls = names.map((p) => partUrl(rig, p));
  const loaded = await Assets.load<Texture>(urls);
  const tex = Object.fromEntries(names.map((p, i) => [p, loaded[urls[i]!]!]));
  return rig.skeleton === "mage"
    ? mage(rig, tex as Record<(typeof MAGE_PARTS)[number], Texture>, still)
    : warrior(rig, tex, still);
}

function mage(
  rig: MageRig,
  tex: Record<(typeof MAGE_PARTS)[number], Texture>,
  still: boolean,
): Puppet {
  const { parts, joints, foot } = rig;
  const view = new Container();
  const shadow = new Graphics()
    .ellipse(0, -2, 150, 18)
    .fill({ color: 0x000000, alpha: 0.3 });
  view.addChild(shadow);
  /** Thân người, tọa độ con theo hệ PSD gốc. */
  const body = new Container();
  body.pivot.set(foot.x, foot.y);
  view.addChild(body);

  const L = layers(rig.texScale);
  const sprite = (name: keyof typeof parts, parent: Container) =>
    L.sprite(tex[name], parts[name], parent);
  const mesh = (name: keyof typeof parts, parent: Container, wind: Parameters<typeof L.mesh>[3]) =>
    L.mesh(tex[name], parts[name], parent, wind);
  const joint = (name: keyof typeof joints, parent: Container) =>
    L.joint(joints[name].x, joints[name].y, parent);

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
  const gourdArm = L.joint(joints.armR.x, joints.armR.y, upper);
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
  const drops = particles(fx, rig.fxColor, 40);
  const ring = new Graphics();
  fx.addChild(ring);
  let ringA = 0;
  const cue = cueFx(view, rig.height, rig.fxColor);

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
    let squash = Math.sin(t * BREATH) * 0.006 * life;
    let upperRot = Math.sin(t * BREATH * 0.5) * 0.008 * life;
    let armLRot = Math.sin(t * BREATH + 0.5) * 0.025 * life;
    let armRRot = Math.sin(t * BREATH + 1.1) * 0.022 * life;
    let headRot = Math.sin(t * 0.9 + 1) * 0.02 * life;
    let waterLRot = Math.sin(t * 1.6) * 0.06 * life;
    let waterRRot = Math.sin(t * 1.5 + 2) * 0.07 * life;
    let waterRScale = 1 + Math.sin(t * 2) * 0.02 * life;
    let glowA = 0.25 + Math.sin(t * 3) * 0.1 * life;
    let palmA = 0.15 + Math.sin(t * 2.6) * 0.08 * life;
    let gust = 1;
    let shiftX = 0;
    let lift = 0;
    let tint = 0xffffff;

    if (action) {
      action.t += dt;
      const a = action.t;
      if (action.kind === "cast" || action.kind === "attack" || action.kind === "ultimate") {
        // Đòn kiếm là bản ngắn của thi triển: không nâng hồ lô, chỉ đẩy tay và bắn ít hạt. Tuyệt chiêu tụ
        // nước lâu hơn rồi bung mạnh. Mốc kết thúc: đánh 0,65 s, thi triển 0,85 s, tuyệt chiêu 1,4 s.
        const ult = action.kind === "ultimate";
        const big = action.kind !== "attack";
        const at = ult ? 0.6 : big ? 0.22 : 0;
        const raise = big ? pulse(a, 0, at) * (1 - pulse(a, at + 0.2, ult ? 1.3 : 0.8)) : 0;
        const push = pulse(a, at, at + 0.12) * (1 - pulse(a, at + 0.22, ult ? 1.35 : at + 0.6));
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
        if (ult) {
          glowA += 1.2 * raise;
          lift = 18 * push;
        }
        if (!action.fired && a >= at + 0.02) {
          action.fired = true;
          const n = ult ? 40 : big ? 26 : 12;
          for (let i = 0; i < n; i++) {
            const ang = (Math.random() - 0.5) * 0.9;
            const v = 380 + Math.random() * 420;
            drops.spawn(joints.waterR.x + 12, joints.waterR.y, Math.cos(ang) * v, Math.sin(ang) * v - 60, 0.12 + Math.random() * 0.22, 0.5 + Math.random() * 0.4);
          }
          ringA = big ? 1 : 0.6;
        }
        if (a > (ult ? 1.4 : big ? 0.85 : 0.65)) action = null;
      } else if (action.kind === "victory") {
        // Giơ hồ lô và tay trái lên cao, nước quanh người dâng lên.
        const v = victory(a);
        lift = v.lift;
        squash += v.squash;
        upperRot += 0.05 * v.tilt;
        armRRot += -0.2 * v.raise;
        armLRot += -0.25 * v.raise;
        waterLRot += 0.2 * v.raise;
        waterRScale += 0.15 * v.raise;
        glowA += v.glow;
        palmA += 0.6 * v.glow;
      } else {
        const r = reaction(action.kind, a);
        shiftX = r.shiftX;
        lift = r.lift;
        squash += r.squash;
        upperRot += 0.05 * r.tilt;
        headRot += 0.06 * r.tilt;
        armRRot += -0.12 * r.raise;
        tint = r.tint;
        glowA += 0.8 * r.glow;
        if (r.done) action = null;
      }
    }

    if (down) downT = Math.min(1, downT + dt / KO_SECONDS);
    const stagger = down ? pulse(downT, 0, 0.25) * (1 - pulse(downT, 0.25, 1)) : 0;
    body.scale.set(1, 1 + squash);
    body.x = shiftX - 16 * stagger;
    body.y = -lift;
    body.rotation = 0.05 * stagger - 0.12 * ease(downT);
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

    L.bend(t, life, gust);
    cue.update(dt);
    drops.update(dt);
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
    reset() {
      action = null;
      down = false;
      downT = 0;
      ringA = 0;
      drops.clear();
      cue.clear();
      update(0);
    },
    play(kind) {
      if (down || still) return;
      if (kind === "ready" && action && action.kind !== "victory" && action.kind !== "ready") return;
      action = { kind, t: 0, fired: false };
      cue.start(kind);
    },
    setDown(next) {
      if (next === down) return;
      down = next;
      downT = next ? (still ? 1 : 0) : 0;
      if (next) {
        action = null;
        cue.clear();
      }
      update(0);
    },
    destroy() {
      view.destroy({ children: true });
    },
  };
}
