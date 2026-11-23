// Giao diện 7 nguyên tố của Vây Thành Kỳ: quân là quả cầu nguyên tố (biểu tượng hệ Shan vẽ ở public/art/elements/), đất quanh
// quân đổi nền theo hệ. Nền đất vẽ bằng mẫu SVG lặp (Claude dựng, chưa có tranh riêng): Hỏa nham thạch nứt, Mộc cỏ, Thủy băng,
// Kim sắt, Thổ đất sỏi, Lôi tím sấm, Phong gió xoáy. Ý tưởng tham khảo các bàn cờ vây theo hệ, hình và mã tự làm.

import type { ReactNode } from "react";
import type { Element } from "@/core";

export interface ElementTheme {
  /** Màu chính của quả cầu và viền. */
  readonly base: string;
  /** Màu sáng (đốm phản quang) và màu tối (mép quả cầu). */
  readonly light: string;
  readonly dark: string;
  /** Nền khung người chơi hai bên bàn. */
  readonly panel: string;
  /** Mẫu nền đất, vẽ trong ô 2×2 đơn vị (1 đơn vị = 1 khoảng giao điểm). */
  readonly ground: ReactNode;
  /** Kẻ lưới sáng trên nền tối. */
  readonly lightGrid: boolean;
}

const crack = (d: string, color: string, w: number) => <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;

export const THEME: Readonly<Record<Element, ElementTheme>> = {
  hoa: {
    base: "#e0541f",
    light: "#ffd27a",
    dark: "#6e1606",
    panel: "linear-gradient(160deg, #3b1d17 0%, #5a2414 55%, #2a1410 100%)",
    lightGrid: true,
    ground: (
      <>
        <rect width={2} height={2} fill="#2c1f1b" />
        <rect width={2} height={2} fill="#4a2a1d" opacity={0.35} />
        {crack("M0 0.35 L0.4 0.55 L0.55 1.05 L1.05 1.2 L1.4 1.75 L2 1.9", "#ff6a1a", 0.07)}
        {crack("M0.55 1.05 L0.2 1.5 L0 1.55", "#ff6a1a", 0.05)}
        {crack("M1.05 1.2 L1.5 0.8 L1.6 0.2 L2 0.1", "#ff6a1a", 0.05)}
        {crack("M0 0.35 L0.4 0.55 L0.55 1.05 L1.05 1.2 L1.4 1.75 L2 1.9", "#ffd166", 0.025)}
        {crack("M1.6 0.2 L1.2 0 M0.4 0.55 L0.8 0.2", "#c2410c", 0.03)}
      </>
    ),
  },
  moc: {
    base: "#3f9a3a",
    light: "#d9f99d",
    dark: "#14532d",
    panel: "linear-gradient(160deg, #1f3d1c 0%, #2f5d26 55%, #16301a 100%)",
    lightGrid: false,
    ground: (
      <>
        <rect width={2} height={2} fill="#6a9a43" />
        {[
          [0.2, 0.3], [0.7, 0.9], [1.3, 0.4], [1.7, 1.3], [0.4, 1.5], [1.1, 1.7], [1.5, 0.95], [0.1, 1.0],
        ].map(([x, y], i) => (
          <g key={i} stroke={i % 2 ? "#8fc25a" : "#4c7a31"} strokeWidth={0.04} strokeLinecap="round" fill="none">
            <path d={`M${x} ${y! + 0.14} q0.02 -0.1 -0.05 -0.18`} />
            <path d={`M${x! + 0.05} ${y! + 0.14} q0 -0.12 0.04 -0.2`} />
            <path d={`M${x! + 0.1} ${y! + 0.14} q0.03 -0.08 0.1 -0.13`} />
          </g>
        ))}
      </>
    ),
  },
  thuy: {
    base: "#2f86d0",
    light: "#e0f2fe",
    dark: "#0c3a66",
    panel: "linear-gradient(160deg, #1d4f78 0%, #2f78b0 55%, #163d5e 100%)",
    lightGrid: false,
    ground: (
      <>
        <rect width={2} height={2} fill="#c3e0f2" />
        <path d="M0 0.5 q0.5 -0.15 1 0 t1 0 M0 1.5 q0.5 -0.15 1 0 t1 0" fill="none" stroke="#eef8ff" strokeWidth={0.06} />
        <path d="M0.2 1 q0.3 -0.1 0.6 0 M1.2 0.05 q0.3 -0.1 0.6 0 M1.1 1.95 q0.3 -0.1 0.6 0" fill="none" stroke="#9ccbe8" strokeWidth={0.04} />
        <path d="M0.6 0.2 l0.12 0.12 m-0.12 0 l0.12 -0.12 M1.5 1.2 l0.1 0.1 m-0.1 0 l0.1 -0.1" stroke="#ffffff" strokeWidth={0.025} />
      </>
    ),
  },
  kim: {
    base: "#a3abb6",
    light: "#ffffff",
    dark: "#3f4650",
    panel: "linear-gradient(160deg, #3a3f46 0%, #6b737d 55%, #2c3036 100%)",
    lightGrid: false,
    ground: (
      <>
        <rect width={2} height={2} fill="#aeb5bd" />
        <path d="M-0.5 0.5 L0.5 -0.5 M0 2 L2 0 M1.5 2.5 L2.5 1.5" stroke="#d9dee3" strokeWidth={0.12} />
        <path d="M-0.5 0.65 L0.65 -0.5 M0 2.15 L2.15 0" stroke="#8b939c" strokeWidth={0.03} />
        <circle cx={0.25} cy={1.25} r={0.05} fill="#7c848d" />
        <circle cx={1.25} cy={0.25} r={0.05} fill="#7c848d" />
        <circle cx={1.75} cy={1.75} r={0.05} fill="#7c848d" />
      </>
    ),
  },
  tho: {
    base: "#b07a32",
    light: "#fde68a",
    dark: "#5a3510",
    panel: "linear-gradient(160deg, #4a3016 0%, #7a5226 55%, #3a2510 100%)",
    lightGrid: false,
    ground: (
      <>
        <rect width={2} height={2} fill="#a9773f" />
        <ellipse cx={0.35} cy={0.4} rx={0.14} ry={0.09} fill="#8a5d2c" />
        <ellipse cx={1.3} cy={0.7} rx={0.1} ry={0.07} fill="#c99a5c" />
        <ellipse cx={0.8} cy={1.4} rx={0.16} ry={0.1} fill="#8a5d2c" />
        <ellipse cx={1.7} cy={1.6} rx={0.08} ry={0.06} fill="#c99a5c" />
        <circle cx={1.0} cy={0.15} r={0.04} fill="#7a4f22" />
        <circle cx={0.15} cy={1.1} r={0.035} fill="#d6ab70" />
        <path d="M0 1.0 q0.5 0.08 1 -0.02 t1 0.02" fill="none" stroke="#946535" strokeWidth={0.03} />
      </>
    ),
  },
  loi: {
    base: "#8048d8",
    light: "#f3e8ff",
    dark: "#2e1065",
    panel: "linear-gradient(160deg, #1e1238 0%, #3b2370 55%, #150c2a 100%)",
    lightGrid: true,
    ground: (
      <>
        <rect width={2} height={2} fill="#33245a" />
        {crack("M0.2 0 L0.45 0.45 L0.3 0.55 L0.6 1.0", "#b68cff", 0.06)}
        {crack("M1.3 0.9 L1.55 1.35 L1.4 1.45 L1.7 2", "#b68cff", 0.06)}
        {crack("M0.2 0 L0.45 0.45 L0.3 0.55 L0.6 1.0 M1.3 0.9 L1.55 1.35 L1.4 1.45 L1.7 2", "#efe4ff", 0.02)}
        <circle cx={1.4} cy={0.3} r={0.03} fill="#d8c2ff" />
        <circle cx={0.5} cy={1.6} r={0.025} fill="#d8c2ff" />
      </>
    ),
  },
  phong: {
    base: "#26a596",
    light: "#ccfbf1",
    dark: "#0f4d46",
    panel: "linear-gradient(160deg, #11423d 0%, #1f7268 55%, #0d332f 100%)",
    lightGrid: false,
    ground: (
      <>
        <rect width={2} height={2} fill="#86cfc2" />
        <path d="M0.15 0.6 q0.35 -0.35 0.7 0 q0.1 0.15 -0.05 0.22 q-0.15 0.05 -0.18 -0.1" fill="none" stroke="#d6f5ef" strokeWidth={0.05} strokeLinecap="round" />
        <path d="M1.1 1.6 q0.35 -0.35 0.7 0 q0.1 0.15 -0.05 0.22 q-0.15 0.05 -0.18 -0.1" fill="none" stroke="#d6f5ef" strokeWidth={0.05} strokeLinecap="round" />
        <path d="M0 1.2 q0.4 -0.12 0.8 0 M1.1 0.3 q0.4 -0.12 0.8 0" fill="none" stroke="#5fb3a5" strokeWidth={0.035} strokeLinecap="round" />
      </>
    ),
  },
};
