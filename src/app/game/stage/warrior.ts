/**
 * Bộ xương tướng sĩ: cả tay cầm kiếm và thanh kiếm xoay quanh vai. Đòn kiếm là một nhát chém vòng ra
 * phía trước, thi triển thì tụ sáng vào kiếm trước khi chém, kèm vệt kiếm và tia sáng ở mũi.
 */
import { Container, Graphics, Sprite, type Texture } from "pixi.js";
import type { CueKind } from "./director";
import { ease, glow, layers, particles, pulse, reaction, type Puppet } from "./kit";
import type { WarriorRig } from "./rigs";

/** Góc xoay (radian, dương là theo chiều kim đồng hồ) của tay kiếm ở từng pha. */
const SWING = {
  attack: { windup: 0.2, strike: -0.95, at: 0.2, hit: 0.32, back: [0.45, 0.9], end: 0.95 },
  cast: { windup: 0.4, strike: -1.15, at: 0.45, hit: 0.6, back: [0.75, 1.35], end: 1.4 },
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
  const cloth = (behind: boolean) => {
    for (const c of rig.cloth)
      if (!!c.behind === behind) L.mesh(img(c.name), c.box, body, c.wind);
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
  const head = L.joint(joints.neck.x, joints.neck.y, body);
  L.sprite(img("head"), parts.head, head);

  // Vệt kiếm và tia sáng vẽ trong hệ tọa độ của thân để lật và ngả theo người.
  const trail = new Graphics();
  trail.blendMode = "add";
  body.addChild(trail);
  const sparks = particles(body, rig.fxColor, 40, 220);

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
    let tint = 0xffffff;
    let aura = 0.18 + Math.sin(t * 3) * 0.08 * life;
    let gust = 1;

    if (action) {
      action.t += dt;
      const a = action.t;
      if (action.kind === "attack" || action.kind === "cast") {
        const S = SWING[action.kind];
        const wind = pulse(a, 0, S.at);
        const strike = pulse(a, S.at, S.hit);
        const back = pulse(a, S.back[0], S.back[1]);
        const swing = (S.windup * wind * (1 - strike) + S.strike * strike) * (1 - back);
        armRot += swing;
        armRRot += 0.12 * strike * (1 - back);
        headRot += -0.03 * strike * (1 - back);
        lean = (-0.015 * wind * (1 - strike) + 0.035 * strike) * (1 - back);
        shiftX = 28 * strike * (1 - back);
        gust = 1 + 1.4 * strike * (1 - back);
        if (action.kind === "cast") aura += 1.4 * wind * (1 - back);
        else aura += 0.5 * strike * (1 - back);
        // Vệt kiếm: cung từ góc kiếm hiện tại kéo ngược về chỗ bắt đầu chém.
        if (a >= S.at && a <= S.hit + 0.05) {
          trailA = action.kind === "cast" ? 1 : 0.75;
          trailFrom = baseAngle + armRot;
          trailTo = baseAngle + S.windup;
        }
        if (!action.fired && a >= S.hit) {
          action.fired = true;
          const big = action.kind === "cast";
          const ang = baseAngle + S.strike;
          const tx = sx + Math.cos(ang) * reach;
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
    body.x = shiftX;
    body.rotation = lean - 0.12 * ease(downT);
    body.tint = down ? 0x777777 : tint;
    body.alpha = 1 - 0.55 * ease(downT);
    shadow.alpha = 1 - 0.6 * ease(downT);
    arm.rotation = down ? 0.15 * ease(downT) : armRot;
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
