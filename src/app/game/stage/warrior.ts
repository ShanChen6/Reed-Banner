/**
 * Bộ xương tướng sĩ: cả tay cầm kiếm và thanh kiếm xoay quanh vai. Đòn kiếm là một nhát chém vòng ra
 * phía trước, thi triển thì tụ sáng vào kiếm trước khi chém, kèm vệt kiếm và tia sáng ở mũi. Nhân vật có
 * tranh tư thế thì lúc ra chiêu và tuyệt chiêu đổi sang tranh đó, kèm bóng sáng và tia lửa; có tranh bị hạ gục
 * thì hết máu mờ dần sang tranh đó.
 */
import { Container, Graphics, Sprite, type Texture } from "pixi.js";
import type { CueKind } from "./director";
import { ease, glow, layers, particles, pulse, reaction, type Puppet } from "./kit";
import type { PoseArt, PoseKind, WarriorRig } from "./rigs";

/** Góc xoay (radian, dương là theo chiều kim đồng hồ) của tay kiếm ở từng pha. */
const SWING = {
  attack: { windup: 0.2, strike: -0.95, at: 0.2, hit: 0.32, back: [0.45, 0.9], end: 0.95 },
  cast: { windup: 0.4, strike: -1.15, at: 0.45, hit: 0.6, back: [0.75, 1.35], end: 1.4 },
} as const;

/** Giáo dựng đứng đẩy tới nhẹ, tránh quay cả cán dài như kiếm. */
const SPEAR_SWING = {
  attack: { ...SWING.attack, windup: -0.06, strike: 0.22 },
  cast: { ...SWING.cast, windup: -0.08, strike: 0.28 },
} as const;

/**
 * Nhịp của tranh tư thế (giây): `swap` đổi từ hình động sang tranh, `hit` tóe tia sáng, `out` bắt đầu đổi
 * về, `end` xong. `dash` là quãng lướt tới, `lift` là độ nhảy lên (tuyệt chiêu bổ từ trên xuống).
 */
const POSE_BEAT = {
  cast: { swap: 0.12, hit: 0.32, out: 0.85, end: 1.05, dash: 60, lift: 0 },
  ultimate: { swap: 0.16, hit: 0.7, out: 1.25, end: 1.5, dash: 90, lift: 110 },
} as const;

export function warrior(
  rig: WarriorRig,
  tex: Readonly<Record<string, Texture>>,
  still: boolean,
): Puppet {
  const { parts, joints, foot, blade } = rig;
  const img = (name: string) => tex[name]!;
  const view = new Container();
  const shadow = new Graphics()
    .ellipse(0, -2, 190, 20)
    .fill({ color: 0x000000, alpha: 0.3 });
  view.addChild(shadow);
  const body = new Container();
  body.pivot.set(foot.x, foot.y);
  view.addChild(body);

  const L = layers(rig.texScale);
  const cloth = (behind: boolean, overArms = false) => {
    for (const c of rig.cloth)
      if (!!c.behind === behind && !!c.overArms === overArms) L.mesh(img(c.name), c.box, body, c.wind);
  };
  cloth(true);
  L.sprite(img("body"), parts.body, body);
  cloth(false);
  const armR = L.joint(joints.elbowR.x, joints.elbowR.y, body);
  L.sprite(img("armR"), parts.armR, armR);
  const arm = L.joint(joints.shoulder.x, joints.shoulder.y, body);
  L.sprite(img("sword"), parts.sword, arm);
  // Hào quang dọc lưỡi kiếm, theo tay khi chém.
  const auras = Array.from({ length: 6 }, (_, i) => {
    const at = (i + 0.5) / 6;
    const s = new Sprite(glow());
    s.anchor.set(0.5);
    s.tint = rig.fxColor;
    s.blendMode = "add";
    s.position.set(blade[0].x + (blade[1].x - blade[0].x) * at, blade[0].y + (blade[1].y - blade[0].y) * at);
    s.scale.set(2.2);
    arm.addChild(s);
    return s;
  });
  L.sprite(img("arm"), parts.arm, arm);
  for (const c of rig.covers) L.sprite(img(c.name), c.box, body);
  cloth(false, true);
  const head = L.joint(joints.neck.x, joints.neck.y, body);
  L.sprite(img("head"), parts.head, head);

  // Vệt kiếm và tia sáng vẽ trong hệ tọa độ của thân để lật và ngả theo người.
  const trail = new Graphics();
  trail.blendMode = "add";
  body.addChild(trail);
  const sparks = particles(body, rig.fxColor, 40, 220);

  // Tranh tư thế: gốc tọa độ ở chân như hình động; bóng sáng sau lưng, ảnh sáng phóng ra lúc đổi tranh.
  const poses = (Object.entries(rig.poses ?? {}) as [PoseKind, PoseArt][]).map(([kind, p]) => {
    const texScale = p.texScale ?? rig.texScale;
    const root = new Container();
    root.scale.set(p.scale);
    root.visible = false;
    view.addChild(root);
    const bloom = new Sprite(glow());
    bloom.anchor.set(0.5);
    bloom.tint = rig.fxColor;
    bloom.blendMode = "add";
    bloom.position.set(0, -500);
    bloom.scale.set(kind === "ultimate" ? 26 : 20);
    root.addChild(bloom);
    const art = (blend: boolean) => {
      const s = new Sprite(img(p.name));
      s.position.set(p.origin.x - p.anchor.x, p.origin.y - p.anchor.y);
      s.scale.set(1 / texScale);
      if (blend) {
        s.tint = rig.fxColor;
        s.blendMode = "add";
      }
      root.addChild(s);
      return s;
    };
    const ghost = art(true);
    const main = art(false);
    const burst = { x: p.burst.x - p.anchor.x, y: p.burst.y - p.anchor.y };
    const offset = { x: p.origin.x - p.anchor.x, y: p.origin.y - p.anchor.y };
    return { kind, root, bloom, ghost, main, burst, offset, texScale, sparks: particles(root, rig.fxColor, 50, 260) };
  });
  const poseOf = (kind: CueKind) => poses.find((p) => p.kind === kind);
  // Tranh bị hạ gục, hiện dần khi hết máu thay cho kiểu ngả người mờ đi.
  const fallen = rig.down
    ? (() => {
        const d = rig.down;
        const root = new Container();
        root.scale.set(d.scale);
        root.visible = false;
        root.tint = 0xbbbbbb;
        const s = new Sprite(img(d.name));
        s.position.set(d.origin.x - d.anchor.x, d.origin.y - d.anchor.y);
        s.scale.set(1 / (d.texScale ?? rig.texScale));
        root.addChild(s);
        view.addChild(root);
        return root;
      })()
    : null;

  const sx = joints.shoulder.x;
  const sy = joints.shoulder.y;
  const tipDX = blade[1].x - sx;
  const tipDY = blade[1].y - sy;
  const reach = Math.hypot(tipDX, tipDY);
  const baseAngle = Math.atan2(tipDY, tipDX);

  let time = Math.random() * 10;
  let action: { kind: CueKind; t: number; fired: boolean } | null = null;
  let down = false;
  let downT = 0;
  let trailA = 0;
  let trailFrom = 0;
  let trailTo = 0;

  const AMP = still ? 0 : 1;

  const update = (dt: number) => {
    time += dt;
    const t = time;
    const life = down ? 0 : AMP;
    body.scale.set(1, 1 + Math.sin(t * 2) * 0.005 * life);
    let armRot = Math.sin(t * 1.2) * 0.02 * life;
    let armRRot = Math.sin(t * 1.4 + 1) * 0.03 * life;
    let headRot = Math.sin(t * 0.8 + 0.4) * 0.012 * life;
    let lean = 0;
    let shiftX = 0;
    let thrust = 0;
    let tint = 0xffffff;
    let aura = 0.18 + Math.sin(t * 3) * 0.08 * life;
    let gust = 1;

    let rigVis = 1;
    for (const p of poses) p.root.visible = false;
    const pose = action ? poseOf(action.kind) : undefined;

    if (action && pose) {
      action.t += dt;
      const a = action.t;
      const B = POSE_BEAT[pose.kind];
      // Nhún lấy đà bằng hình động rồi đổi sang tranh.
      const pre = pulse(a, 0, B.swap);
      lean = -0.03 * pre;
      aura += 1.5 * pre;
      const show = pulse(a, B.swap - 0.04, B.swap + 0.04) * (1 - pulse(a, B.out, B.end));
      rigVis = 1 - show;
      pose.root.visible = show > 0 || pose.sparks.active();
      pose.main.alpha = show;
      const dash = pulse(a, B.swap, B.hit) * (1 - pulse(a, B.out, B.end));
      const rise = pulse(a, B.swap, (B.swap + B.hit) / 2) * (1 - pulse(a, (B.swap + B.hit) / 2, B.hit));
      pose.root.position.set(B.dash * dash - 20 * (1 - dash) * show, -B.lift * rise);
      // Ảnh sáng phóng to rồi tan lúc đổi tranh, và lóe lại lúc trúng.
      const flash = Math.max(1 - pulse(a, B.swap, B.swap + 0.3), 1 - pulse(a, B.hit, B.hit + 0.25)) * show;
      pose.ghost.alpha = 0.55 * flash;
      // Phóng quanh chân nhân vật để ảnh sáng tỏa đều ra mọi phía.
      const grow = 1 + 0.12 * (1 - flash);
      pose.ghost.scale.set(grow / pose.texScale);
      pose.ghost.position.set(pose.offset.x * grow, pose.offset.y * grow);
      pose.bloom.alpha = (0.35 + 0.5 * flash) * show;
      if (!action.fired && a >= B.hit) {
        action.fired = true;
        const big = pose.kind === "ultimate";
        for (let i = 0; i < (big ? 44 : 26); i++) {
          const d = (Math.random() - 0.5) * (big ? 2.6 : 1.4) - (big ? Math.PI / 2 : 0);
          const v = 350 + Math.random() * (big ? 900 : 600);
          pose.sparks.spawn(pose.burst.x, pose.burst.y, Math.cos(d) * v, Math.sin(d) * v - 150, 0.15 + Math.random() * (big ? 0.45 : 0.3), 0.4 + Math.random() * 0.5);
        }
      }
      if (a > B.end) action = null;
    } else if (action) {
      action.t += dt;
      const a = action.t;
      if (action.kind === "attack" || action.kind === "cast" || action.kind === "ultimate") {
        const swingKind = action.kind === "attack" ? "attack" : "cast";
        const spear = rig.weapon === "spear";
        const S = (spear ? SPEAR_SWING : SWING)[swingKind];
        const wind = pulse(a, 0, S.at);
        const strike = pulse(a, S.at, S.hit);
        const back = pulse(a, S.back[0], S.back[1]);
        const swing = (S.windup * wind * (1 - strike) + S.strike * strike) * (1 - back);
        armRot += swing;
        armRRot += 0.12 * strike * (1 - back);
        headRot += -0.03 * strike * (1 - back);
        lean = (-0.015 * wind * (1 - strike) + 0.035 * strike) * (1 - back);
        shiftX = 28 * strike * (1 - back);
        thrust = spear ? 12 * strike * (1 - back) : 0;
        gust = 1 + 1.4 * strike * (1 - back);
        if (swingKind === "cast") aura += 1.4 * wind * (1 - back);
        else aura += 0.5 * strike * (1 - back);
        // Vệt kiếm: cung từ góc kiếm hiện tại kéo ngược về chỗ bắt đầu chém.
        if (!spear && a >= S.at && a <= S.hit + 0.05) {
          trailA = swingKind === "cast" ? 1 : 0.75;
          trailFrom = baseAngle + armRot;
          trailTo = baseAngle + S.windup;
        }
        if (!action.fired && a >= S.hit) {
          action.fired = true;
          const big = swingKind === "cast";
          const ang = baseAngle + S.strike;
          const tx = sx + thrust + Math.cos(ang) * reach;
          const ty = sy + Math.sin(ang) * reach;
          for (let i = 0; i < (big ? 30 : 12); i++) {
            const d = (Math.random() - 0.5) * 1.4;
            const v = 250 + Math.random() * (big ? 600 : 300);
            sparks.spawn(tx, ty, Math.cos(d) * v, Math.sin(d) * v - 120, 0.1 + Math.random() * (big ? 0.3 : 0.18), 0.4 + Math.random() * 0.4);
          }
        }
        if (a > S.end) action = null;
      } else {
        const r = reaction(action.kind, a);
        shiftX = r.shiftX;
        lean = -0.03 * r.tilt;
        headRot += 0.06 * r.tilt;
        tint = r.tint;
        aura += 0.6 * r.glow;
        if (r.done) action = null;
      }
    }

    if (down) downT = Math.min(1, downT + dt * 2.5);
    const fall = ease(downT);
    body.x = shiftX;
    body.rotation = lean - (fallen ? 0 : 0.12 * fall);
    body.tint = down ? 0x777777 : tint;
    body.alpha = (fallen ? 1 - fall : 1 - 0.55 * fall) * rigVis;
    shadow.alpha = fallen ? 1 : 1 - 0.6 * fall;
    if (fallen) {
      fallen.visible = down;
      fallen.alpha = fall;
      fallen.y = -30 * (1 - fall);
    }
    arm.rotation = down ? 0.15 * ease(downT) : armRot;
    arm.x = joints.shoulder.x + thrust;
    armR.rotation = armRRot;
    head.rotation = headRot;
    auras.forEach((s, i) => {
      s.alpha = down ? 0 : Math.max(0, aura * (0.7 + 0.3 * Math.sin(t * 5 + i)));
    });

    trail.clear();
    if (trailA > 0) {
      const lo = Math.min(trailFrom, trailTo);
      const hi = Math.max(trailFrom, trailTo);
      for (const [k, w] of [[0.9, 22], [0.76, 14], [0.6, 8]] as const) {
        trail.arc(sx, sy, reach * k, lo, hi).stroke({ color: rig.fxColor, width: w, alpha: trailA * (w / 22) });
      }
      trailA = Math.max(0, trailA - dt * 2.6);
    }

    L.bend(t, life, gust);
    sparks.update(dt);
    for (const p of poses) p.sparks.update(dt);
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
      trailA = 0;
      sparks.clear();
      for (const p of poses) p.sparks.clear();
      update(0);
    },
    play(kind) {
      if (down || still) return;
      action = { kind, t: 0, fired: false };
    },
    setDown(next) {
      if (next === down) return;
      if (next) for (const p of poses) p.root.visible = false;
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
