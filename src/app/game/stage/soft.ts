/**
 * Nét vẽ mềm cho hiệu ứng sân khấu: kho Sprite dùng lại mỗi khung (vẽ kiểu "xóa rồi vẽ lại" như Graphics) với hai
 * texture mờ biên là quầng sáng tròn (`glow`) và lưỡi lửa hình giọt (`flameTex`). Dùng thay cho đa giác cạnh sắc
 * khi cần lửa, nước, ánh sáng trông mịn.
 */
import { Container, Sprite, Texture } from "pixi.js";
import { glow } from "./kit";

let flameTexture: Texture | null = null;

/** Lưỡi lửa hình giọt: đầu nhọn ở trên, đáy tròn, mép nhòe, sáng dần về đáy. Gốc đặt ở đáy (anchor 0.5, 0.86). */
export function flameTex(): Texture {
  if (flameTexture) return flameTexture;
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.filter = "blur(5px)";
  const grad = g.createLinearGradient(0, 8, 0, 120);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.55)");
  grad.addColorStop(1, "rgba(255,255,255,1)");
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(32, 10);
  g.bezierCurveTo(40, 40, 54, 62, 52, 88);
  g.bezierCurveTo(50, 108, 40, 116, 32, 116);
  g.bezierCurveTo(24, 116, 14, 108, 12, 88);
  g.bezierCurveTo(10, 62, 24, 40, 32, 10);
  g.fill();
  flameTexture = Texture.from(c);
  return flameTexture;
}

/** Điểm gốc của `flameTex` (đáy giọt lửa), theo tỉ lệ texture. */
export const FLAME_ROOT = { x: 0.5, y: 0.86 } as const;

export interface SoftDraw {
  /** Tâm (hoặc gốc với lưỡi lửa) ở (x, y); `w`, `h` là bề rộng, bề cao điểm ảnh; `rot` quay quanh gốc. */
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h?: number;
  readonly color: number;
  readonly alpha: number;
  readonly rot?: number;
}

/** Kho Sprite mờ biên: `begin()` đầu khung, gọi `glow`/`flame` để vẽ, `end()` giấu phần thừa. */
export function softLayer(parent: Container, blend: "add" | "normal" = "add") {
  const layer = new Container();
  parent.addChild(layer);
  const pools = { glow: [] as Sprite[], flame: [] as Sprite[] };
  const used = { glow: 0, flame: 0 };
  const take = (kind: "glow" | "flame") => {
    const pool = pools[kind];
    let s = pool[used[kind]];
    if (!s) {
      s = new Sprite(kind === "glow" ? glow() : flameTex());
      if (kind === "glow") s.anchor.set(0.5);
      else s.anchor.set(FLAME_ROOT.x, FLAME_ROOT.y);
      s.blendMode = blend;
      layer.addChild(s);
      pool.push(s);
    }
    used[kind]++;
    s.visible = true;
    return s;
  };
  const put = (s: Sprite, d: SoftDraw) => {
    if (d.alpha <= 0.003 || d.w <= 0) {
      s.visible = false;
      return;
    }
    s.position.set(d.x, d.y);
    s.width = d.w;
    s.height = d.h ?? d.w;
    s.rotation = d.rot ?? 0;
    s.tint = d.color;
    s.alpha = Math.min(1, d.alpha);
  };
  return {
    layer,
    begin() {
      used.glow = 0;
      used.flame = 0;
    },
    glow(d: SoftDraw) {
      put(take("glow"), d);
    },
    flame(d: SoftDraw) {
      put(take("flame"), d);
    },
    end() {
      for (const kind of ["glow", "flame"] as const) for (let i = used[kind]; i < pools[kind].length; i++) pools[kind][i]!.visible = false;
    },
    clear() {
      used.glow = 0;
      used.flame = 0;
      for (const kind of ["glow", "flame"] as const) for (const s of pools[kind]) s.visible = false;
    },
  };
}

/** Một ngọn lửa mềm ba lớp (viền màu hệ, giữa cam, lõi vàng trắng) đung đưa theo `t`. */
export function softTongue(
  soft: ReturnType<typeof softLayer>,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number,
  seed: number,
  a: number,
  color: number,
) {
  const flick = 0.85 + 0.15 * Math.sin(t * 19 + seed * 3.1) + 0.08 * Math.sin(t * 31 + seed);
  const lean = Math.sin(t * 9 + seed) * 0.16;
  soft.flame({ x, y, w: w * 2.6, h: h * 1.18 * flick, color, alpha: 0.7 * a, rot: lean * 0.8 });
  soft.flame({ x, y, w: w * 1.7, h: h * 0.88 * flick, color: 0xff8a2a, alpha: 0.75 * a, rot: lean });
  soft.flame({ x, y: y + h * 0.02, w: w * 0.95, h: h * 0.5 * flick, color: 0xffe7a3, alpha: 0.95 * a, rot: lean * 1.2 });
}
