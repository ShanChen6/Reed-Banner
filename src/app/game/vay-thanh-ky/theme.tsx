// Giao diện 7 nguyên tố của Vây Thành Kỳ: quân là quả cầu nguyên tố (biểu tượng hệ Shan vẽ ở public/art/elements/), đất quanh
// quân và khung hai bên đổi nền theo hệ. Nền vẽ bằng bộ lọc SVG tạo vân (feTurbulence), không cần ảnh: Hỏa đá đen nứt nham
// thạch, Mộc cỏ, Thủy băng rạn, Kim sắt mài, Thổ đất sỏi, Lôi đá tím sấm giật, Phong gió xoáy. Claude dựng 24/11/2026; Shan
// vẽ tranh nền riêng thì thay ở đây.

import type { Element } from "@/core";

type Rgb = readonly [number, number, number];

interface Layer {
  /** Màu lớp (0..255). */
  readonly color: string;
  /** Tần số vân (lần trên một ô bàn); hai số là vân có hướng (ngang, dọc). */
  readonly freq: number | readonly [number, number];
  readonly seed: number;
  readonly octaves?: number;
}

interface Recipe {
  /** Nền: hai màu, vân nhiễu trộn giữa hai màu. */
  readonly base: readonly [string, string];
  readonly freq: number;
  readonly octaves: number;
  readonly seed: number;
  /** Đường vân mảnh (nứt, sét, rạn băng): đường đồng mức của một lớp nhiễu. `core` là lõi sáng, `glow` độ nhòe quầng. */
  readonly veins?: Layer & { readonly core?: string; readonly glow: number; readonly width: number };
  /** Vệt hay đốm: chỗ nhiễu vượt ngưỡng `cut` thì phủ màu. */
  readonly streak?: Layer & { readonly cut: number; readonly opacity: number };
  readonly specks?: Layer & { readonly cut: number; readonly opacity: number };
}

export interface ElementTheme {
  /** Quả cầu: sáng (phản quang), chính, tối (mép). */
  readonly light: string;
  readonly base: string;
  readonly dark: string;
  /** Quầng sáng quanh quả cầu lớn ở khung người chơi. */
  readonly glow: string;
  /** Lưới sáng trên nền tối. */
  readonly lightGrid: boolean;
  readonly ground: Recipe;
}

export const THEME: Readonly<Record<Element | "neutral", ElementTheme>> = {
  hoa: {
    light: "#ffe08a", base: "#f0621f", dark: "#6e1606", glow: "#ff7a2a", lightGrid: true,
    ground: {
      base: ["#140c0a", "#4a2e24"], freq: 0.9, octaves: 4, seed: 3,
      veins: { color: "#ff5a14", core: "#ffd36b", freq: 0.42, seed: 11, octaves: 4, glow: 0.05, width: 0.03 },
      specks: { color: "#ff8a3a", freq: 2.2, seed: 5, cut: 0.72, opacity: 0.5 },
    },
  },
  moc: {
    light: "#e4ffb0", base: "#4caf3f", dark: "#14532d", glow: "#8ee06a", lightGrid: false,
    ground: {
      base: ["#355f1f", "#7fb547"], freq: 0.7, octaves: 4, seed: 8,
      streak: { color: "#b6e57a", freq: [2.4, 1.5], seed: 4, cut: 0.62, opacity: 0.55 },
      specks: { color: "#2a4a17", freq: 1.6, seed: 9, cut: 0.68, opacity: 0.45 },
    },
  },
  thuy: {
    light: "#f0fbff", base: "#2f8fdc", dark: "#0b3766", glow: "#7cc8ff", lightGrid: false,
    ground: {
      base: ["#8ebfe0", "#e9f7ff"], freq: 0.45, octaves: 3, seed: 2,
      veins: { color: "#ffffff", freq: 0.55, seed: 21, octaves: 3, glow: 0.02, width: 0.025 },
      streak: { color: "#ffffff", freq: [0.4, 2.4], seed: 6, cut: 0.62, opacity: 0.35 },
    },
  },
  kim: {
    light: "#ffffff", base: "#aeb6c2", dark: "#3f4650", glow: "#e6ecf5", lightGrid: false,
    ground: {
      base: ["#6f7781", "#d6dce3"], freq: 0.35, octaves: 2, seed: 4,
      streak: { color: "#f4f7fa", freq: [0.2, 2.2], seed: 13, cut: 0.6, opacity: 0.28 },
      specks: { color: "#4b525b", freq: [0.3, 3], seed: 17, cut: 0.7, opacity: 0.25 },
    },
  },
  tho: {
    light: "#ffe9a8", base: "#c08637", dark: "#5a3510", glow: "#f0bf6a", lightGrid: false,
    ground: {
      base: ["#9a5a1e", "#e8b45e"], freq: 1.1, octaves: 5, seed: 6,
      specks: { color: "#5a3412", freq: 1.3, seed: 31, cut: 0.66, opacity: 0.7 },
      veins: { color: "#6b3a12", freq: 0.6, seed: 23, octaves: 3, glow: 0.01, width: 0.03 },
      streak: { color: "#e2b878", freq: 1.7, seed: 7, cut: 0.7, opacity: 0.55 },
    },
  },
  loi: {
    light: "#f6edff", base: "#8a4ee6", dark: "#2e1065", glow: "#c69bff", lightGrid: true,
    ground: {
      base: ["#140b26", "#3f2771"], freq: 0.6, octaves: 4, seed: 12,
      veins: { color: "#a974ff", core: "#f3e8ff", freq: 0.3, seed: 41, octaves: 5, glow: 0.06, width: 0.02 },
      specks: { color: "#d9c2ff", freq: 3, seed: 3, cut: 0.78, opacity: 0.6 },
    },
  },
  phong: {
    light: "#e6fffa", base: "#2cb3a2", dark: "#0f4d46", glow: "#8cf0e1", lightGrid: false,
    ground: {
      base: ["#3f9a8c", "#b9ebe2"], freq: 0.3, octaves: 3, seed: 14,
      streak: { color: "#f0fffb", freq: [0.25, 1.6], seed: 8, cut: 0.6, opacity: 0.55 },
      veins: { color: "#e9fffb", freq: 0.4, seed: 19, octaves: 2, glow: 0.02, width: 0.012 },
    },
  },
  neutral: {
    light: "#fff", base: "#a07d52", dark: "#3b2814", glow: "#fff", lightGrid: false,
    ground: {
      base: ["#4f463f", "#857868"], freq: 0.8, octaves: 4, seed: 1,
      specks: { color: "#3a322b", freq: 1.5, seed: 2, cut: 0.7, opacity: 0.4 },
    },
  },
};

const rgb = (hex: string): Rgb => {
  const n = Number.parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const fmt = (v: number) => Number(v.toFixed(4));
const freqOf = (f: number | readonly [number, number], k: number) => (typeof f === "number" ? `${fmt(f * k)}` : `${fmt(f[0] * k)} ${fmt(f[1] * k)}`);

/** Ma trận đổi kênh R của nhiễu thành dải màu c0 → c1 (giãn tương phản quanh 0,5). */
function ramp(c0: string, c1: string): string {
  const a = rgb(c0);
  const b = rgb(c1);
  const row = (i: number) => `${fmt((b[i]! - a[i]!) * 2.2)} 0 0 0 ${fmt(a[i]! - (b[i]! - a[i]!) * 0.6)}`;
  return `${row(0)} ${row(1)} ${row(2)} 0 0 0 0 1`;
}

/** Màu cố định, độ đục lấy từ kênh R của nhiễu vượt ngưỡng `cut`. */
function cutoff(color: string, cut: number, opacity: number): string {
  const c = rgb(color);
  const gain = 9 * opacity;
  return `0 0 0 0 ${fmt(c[0])} 0 0 0 0 ${fmt(c[1])} 0 0 0 0 ${fmt(c[2])} ${fmt(gain)} 0 0 0 ${fmt(-cut * gain)}`;
}

/** Bảng chọn dải hẹp quanh 0,5 (đường đồng mức): `width` là bề rộng dải. */
function band(width: number): string {
  const n = Math.max(7, Math.round(1 / width));
  const mid = Math.floor(n / 2);
  return Array.from({ length: n }, (_, i) => (i === mid ? 1 : 0)).join(" ");
}

/**
 * Bộ lọc nền đất của một hệ, vẽ vào vùng (x, y, w, h). `k` nhân tần số vân: bàn nhiều ô thì vân thưa lại theo ô để
 * trông cùng cỡ trên màn hình.
 */
export function GroundFilter({ id, element, k, x, y, width, height }: { id: string; element: Element | "neutral"; k: number; x: number; y: number; width: number; height: number }) {
  const r = THEME[element].ground;
  const v = r.veins;
  const st = r.streak;
  const sp = r.specks;
  return (
    <filter id={id} x={x} y={y} width={width} height={height} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency={freqOf(r.freq, k)} numOctaves={r.octaves} seed={r.seed} result="n0" />
      <feColorMatrix in="n0" type="matrix" values={ramp(r.base[0], r.base[1])} result="base" />
      {sp && (
        <>
          <feTurbulence type="fractalNoise" baseFrequency={freqOf(sp.freq, k)} numOctaves={sp.octaves ?? 2} seed={sp.seed} result="ns" />
          <feColorMatrix in="ns" type="matrix" values={cutoff(sp.color, sp.cut, sp.opacity)} result="specks" />
        </>
      )}
      {st && (
        <>
          <feTurbulence type="fractalNoise" baseFrequency={freqOf(st.freq, k)} numOctaves={st.octaves ?? 2} seed={st.seed} result="nt" />
          <feColorMatrix in="nt" type="matrix" values={cutoff(st.color, st.cut, st.opacity)} result="streak" />
        </>
      )}
      {v && (
        <>
          <feTurbulence type="fractalNoise" baseFrequency={freqOf(v.freq, k)} numOctaves={v.octaves ?? 2} seed={v.seed} result="nv" />
          <feColorMatrix in="nv" type="matrix" values={`0 0 0 0 ${fmt(rgb(v.color)[0])} 0 0 0 0 ${fmt(rgb(v.color)[1])} 0 0 0 0 ${fmt(rgb(v.color)[2])} 1 0 0 0 0`} result="nvc" />
          <feComponentTransfer in="nvc" result="veins">
            <feFuncA type="table" tableValues={band(v.width)} />
          </feComponentTransfer>
          <feGaussianBlur in="veins" stdDeviation={fmt(v.glow * Math.max(1, 1 / k))} result="veinGlow" />
          {v.core && (
            <>
              <feColorMatrix in="nv" type="matrix" values={`0 0 0 0 ${fmt(rgb(v.core)[0])} 0 0 0 0 ${fmt(rgb(v.core)[1])} 0 0 0 0 ${fmt(rgb(v.core)[2])} 1 0 0 0 0`} result="ncc" />
              <feComponentTransfer in="ncc" result="core">
                <feFuncA type="table" tableValues={band(v.width / 2.5)} />
              </feComponentTransfer>
            </>
          )}
        </>
      )}
      <feMerge>
        <feMergeNode in="base" />
        {sp && <feMergeNode in="specks" />}
        {st && <feMergeNode in="streak" />}
        {v && <feMergeNode in="veinGlow" />}
        {v && <feMergeNode in="veinGlow" />}
        {v && <feMergeNode in="veins" />}
        {v?.core && <feMergeNode in="core" />}
      </feMerge>
    </filter>
  );
}

/** Dải màu quả cầu: lõi sáng lệch trên trái, mép tối, ánh hắt dưới đáy. */
export function OrbDefs({ id, element }: { id: string; element: Element }) {
  const t = THEME[element];
  return (
    <>
      <radialGradient id={`${id}-body`} cx="0.38" cy="0.32" r="0.75">
        <stop offset="0" stopColor={t.light} />
        <stop offset="0.35" stopColor={t.base} />
        <stop offset="0.85" stopColor={t.dark} />
        <stop offset="1" stopColor={t.dark} />
      </radialGradient>
      <radialGradient id={`${id}-rim`} cx="0.5" cy="0.95" r="0.55">
        <stop offset="0" stopColor={t.light} stopOpacity="0.7" />
        <stop offset="1" stopColor={t.light} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${id}-shine`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
    </>
  );
}
