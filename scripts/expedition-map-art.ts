// Dựng tranh nền cho sáu sa bàn Viễn Chinh từ chính dữ liệu sa bàn (ô, đường, sông), nên thành, làng, bến nằm đúng
// chỗ các ô mà không phải dời tọa độ. Tranh kiểu bản đồ giấy cổ: núi, rừng, ruộng, sông, biển, đảo, công trình dưới
// từng ô. Đường đi và ô do giao diện vẽ đè lên. Là tranh tạm cho tới khi có tranh vẽ tay theo
// docs/06-art/prompts/vien-chinh-sa-ban.md.
//   pnpm exec tsx scripts/expedition-map-art.ts            dựng các sa bàn chưa có tranh vẽ tay (PAINTED), ghi
//                                                          public/art/expedition/<tên>.webp
//   pnpm exec tsx scripts/expedition-map-art.ts aiBac      chỉ một sa bàn (kể cả sa bàn đã có tranh vẽ tay: ghi đè!)
// Cần Chromium của Playwright (đã cài sẵn) để vẽ SVG ra WebP.

import { writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { createRng, type Rng } from "../src/core/rng";
import { EXPEDITION_MAPS, EXPEDITION_MAP_IDS, type ExpeditionMap, type ExpeditionMapId, type ExpeditionNode } from "../src/core/expedition/maps";

/** Tên file theo bảng trong docs/06-art/prompts/vien-chinh-sa-ban.md. */
export const MAP_FILE: Record<ExpeditionMapId, string> = {
  aiBac: "ai-bac",
  thuongDu: "thuong-du",
  cuaBien: "cua-bien",
  chauTho: "nga-ba-song",
  kinhThanh: "kinh-thanh",
  quanDao: "quan-dao",
};

/** Sa bàn đã có tranh vẽ tay (Shan gửi 18/11/2026); chạy không đối số thì bỏ qua để không ghi đè. */
const PAINTED: readonly ExpeditionMapId[] = ["aiBac", "thuongDu", "cuaBien", "chauTho", "kinhThanh"];

const W = 1600;
const H = 960;
const S = W / 100;

interface Theme {
  readonly paper: string;
  readonly land: string;
  /** Biển bao quanh, đất chỉ quanh các ô và đường bộ (sa bàn nhiều nước). */
  readonly islands: boolean;
  readonly mountains: number;
  readonly mountainTone: readonly [string, string];
  readonly snow: boolean;
  readonly trees: number;
  readonly treeTone: readonly [string, string];
  readonly fields: number;
  readonly fieldTone: readonly [string, string];
  readonly clouds: number;
  readonly sea: string;
  readonly river: string;
}

const THEME: Record<ExpeditionMapId, Theme> = {
  aiBac: { paper: "#dccaa0", land: "#cdb98a", islands: false, mountains: 95, mountainTone: ["#a39d8c", "#6d685c"], snow: true, trees: 45, treeTone: ["#6f8a5a", "#4d6640"], fields: 2, fieldTone: ["#c9b06a", "#9fae6a"], clouds: 7, sea: "#3f7f86", river: "#6aa6a6" },
  thuongDu: { paper: "#d7c99c", land: "#b9b47e", islands: false, mountains: 45, mountainTone: ["#8f9a80", "#5e6a52"], snow: false, trees: 260, treeTone: ["#4f7f45", "#2f5a2f"], fields: 3, fieldTone: ["#b8b062", "#8fae5e"], clouds: 10, sea: "#3f7f86", river: "#5fa3a0" },
  cuaBien: { paper: "#dfcfa4", land: "#d4c38f", islands: true, mountains: 10, mountainTone: ["#9aa08a", "#69705c"], snow: false, trees: 70, treeTone: ["#6a8f58", "#46683c"], fields: 4, fieldTone: ["#cbb46c", "#a3b26c"], clouds: 3, sea: "#3d8088", river: "#62a7a6" },
  chauTho: { paper: "#dccd9f", land: "#cbbd85", islands: false, mountains: 14, mountainTone: ["#a09a84", "#6d6a58"], snow: false, trees: 80, treeTone: ["#678c52", "#456a3a"], fields: 14, fieldTone: ["#cdb064", "#9db866"], clouds: 2, sea: "#3f7f86", river: "#5aa0a6" },
  kinhThanh: { paper: "#ddc79a", land: "#cfae7c", islands: false, mountains: 22, mountainTone: ["#a8907a", "#735e4c"], snow: false, trees: 60, treeTone: ["#6c8650", "#4a6238"], fields: 12, fieldTone: ["#d0a95e", "#a8b366"], clouds: 2, sea: "#3f7f86", river: "#5b9ea5" },
  quanDao: { paper: "#ddd0a6", land: "#d8c792", islands: true, mountains: 18, mountainTone: ["#9aa58e", "#66725c"], snow: false, trees: 90, treeTone: ["#5f8d55", "#3f6a3a"], fields: 2, fieldTone: ["#cbb46c", "#a3b26c"], clouds: 4, sea: "#2f7684", river: "#5aa3a8" },
};

type P = readonly [number, number];
const px = (v: number) => (v * S).toFixed(1);
const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1]);
function segDist(p: P, a: P, b: P): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return dist(p, [a[0] + t * dx, a[1] + t * dy]);
}
const rnd = (rng: Rng, a: number, b: number) => a + rng.next() * (b - a);

/** Đường cong kín lượn sóng quanh tâm (bờ đảo, đầm, bãi). */
function blob(rng: Rng, c: P, r: number, wobble = 0.22, n = 16): string {
  const pts: P[] = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = r * (1 + rnd(rng, -wobble, wobble));
    return [c[0] + Math.cos(a) * k, c[1] + Math.sin(a) * k * 0.85];
  });
  const mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = `M${px(mid(pts[n - 1]!, pts[0]!)[0])} ${px(mid(pts[n - 1]!, pts[0]!)[1])}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i]!;
    const m = mid(p, pts[(i + 1) % n]!);
    d += ` Q${px(p[0])} ${px(p[1])} ${px(m[0])} ${px(m[1])}`;
  }
  return `${d} Z`;
}

/** Đường uốn qua các điểm (sông, đường đất). */
function curve(points: readonly P[]): string {
  let d = `M${px(points[0]![0])} ${px(points[0]![1])}`;
  for (let i = 1; i < points.length - 1; i++) {
    const m: P = [(points[i]![0] + points[i + 1]![0]) / 2, (points[i]![1] + points[i + 1]![1]) / 2];
    d += ` Q${px(points[i]![0])} ${px(points[i]![1])} ${px(m[0])} ${px(m[1])}`;
  }
  const last = points[points.length - 1]!;
  return `${d} L${px(last[0])} ${px(last[1])}`;
}

/** Dòng sông chảy qua điểm giữa một đường vượt nước, vuông góc với đường đó, uốn khúc. */
function riverThrough(rng: Rng, a: P, b: P, reach: number): P[] {
  const m: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const len = dist(a, b) || 1;
  const n: P = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
  const t: P = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  const steps = 8;
  return Array.from({ length: steps * 2 + 1 }, (_, i) => {
    const s = ((i - steps) / steps) * reach;
    const w = Math.sin(s * 0.35 + rnd(rng, -0.3, 0.3)) * 2.2;
    return [m[0] + n[0] * s + t[0] * w, m[1] + n[1] * s + t[1] * w] as P;
  });
}

function mountain(rng: Rng, c: P, size: number, th: Theme): string {
  const [x, y] = c;
  const h = size * rnd(rng, 0.9, 1.3);
  const w = size * rnd(rng, 0.8, 1.1);
  const peak: P = [x + rnd(rng, -0.15, 0.15) * w, y - h];
  const left = `M${px(x - w)} ${px(y)} L${px(peak[0])} ${px(peak[1])} L${px(peak[0] + 0.05 * w)} ${px(y)} Z`;
  const right = `M${px(peak[0])} ${px(peak[1])} L${px(x + w)} ${px(y)} L${px(peak[0] + 0.05 * w)} ${px(y)} Z`;
  const outline = `M${px(x - w)} ${px(y)} L${px(peak[0])} ${px(peak[1])} L${px(x + w)} ${px(y)}`;
  const snow = th.snow && h > 3.2
    ? `<path d="M${px(peak[0] - w * 0.22)} ${px(peak[1] + h * 0.25)} L${px(peak[0])} ${px(peak[1])} L${px(peak[0] + w * 0.24)} ${px(peak[1] + h * 0.27)} L${px(peak[0] + w * 0.05)} ${px(peak[1] + h * 0.2)} Z" fill="#f4efe2" opacity="0.92"/>`
    : "";
  const ridge = `M${px(peak[0])} ${px(peak[1])} L${px(peak[0] + 0.1 * w)} ${px(y - h * 0.45)} L${px(peak[0] - 0.05 * w)} ${px(y)}`;
  return `<g><path d="${left}" fill="${th.mountainTone[0]}"/><path d="${right}" fill="${th.mountainTone[1]}"/>${snow}<path d="${ridge}" fill="none" stroke="#3b3326" stroke-width="1.2" opacity="0.45"/><path d="${outline}" fill="none" stroke="#3b3326" stroke-width="2" stroke-linejoin="round" opacity="0.8"/></g>`;
}

function tree(rng: Rng, c: P, th: Theme): string {
  const r = rnd(rng, 0.55, 0.85);
  const tone = rng.next() < 0.5 ? th.treeTone[0] : th.treeTone[1];
  const circles = [[-0.5, 0.1], [0.5, 0.1], [0, -0.45]].map(
    ([dx, dy]) => `<circle cx="${px(c[0] + dx! * r)}" cy="${px(c[1] + dy! * r)}" r="${px(r * 0.75)}" fill="${tone}" stroke="#2c3a22" stroke-width="1.1"/>`,
  );
  return `<g>${circles.join("")}</g>`;
}

function field(rng: Rng, c: P, th: Theme): string {
  const w = rnd(rng, 2.2, 3.6);
  const h = rnd(rng, 1.3, 2.2);
  const rot = rnd(rng, -25, 25);
  const cols = 3;
  const cells = Array.from({ length: cols * 2 }, (_, i) => {
    const cx = (i % cols) * (w / cols);
    const cy = Math.floor(i / cols) * (h / 2);
    const tone = (i + Math.floor(rng.next() * 2)) % 2 ? th.fieldTone[0] : th.fieldTone[1];
    return `<rect x="${px(cx)}" y="${px(cy)}" width="${px(w / cols)}" height="${px(h / 2)}" fill="${tone}" stroke="#7a6a3e" stroke-width="1" opacity="0.85"/>`;
  });
  return `<g transform="translate(${px(c[0] - w / 2)} ${px(c[1] - h / 2)}) rotate(${rot.toFixed(1)} ${px(w / 2)} ${px(h / 2)})">${cells.join("")}</g>`;
}

const WALL = "#8e8576";
const WALL_DARK = "#4a4237";
const ROOF = "#9d3a2a";

/** Công trình vẽ dưới mỗi ô, để thành, làng, đồn nằm đúng chỗ ô trên sa bàn. */
function building(rng: Rng, n: ExpeditionNode): string {
  const [x, y] = [n.x, n.y];
  const hut = (cx: number, cy: number, s = 0.9) =>
    `<path d="M${px(cx - s)} ${px(cy)} L${px(cx)} ${px(cy - s * 0.9)} L${px(cx + s)} ${px(cy)} Z" fill="#8a5a36" stroke="#3d2a1a" stroke-width="1.2"/><rect x="${px(cx - s * 0.7)}" y="${px(cy)}" width="${px(s * 1.4)}" height="${px(s * 0.7)}" fill="#c9a46e" stroke="#3d2a1a" stroke-width="1"/>`;
  const walls = (r: number, towers: boolean) =>
    `<rect x="${px(x - r)}" y="${px(y - r * 0.8)}" width="${px(2 * r)}" height="${px(1.6 * r)}" rx="${px(0.3)}" fill="#bfae8a" stroke="${WALL_DARK}" stroke-width="2.4"/>` +
    `<rect x="${px(x - r + 0.35)}" y="${px(y - r * 0.8 + 0.35)}" width="${px(2 * r - 0.7)}" height="${px(1.6 * r - 0.7)}" fill="none" stroke="${WALL}" stroke-width="1.6" stroke-dasharray="4 3"/>` +
    (towers
      ? [[-1, -0.8], [1, -0.8], [-1, 0.8], [1, 0.8]].map(([sx, sy]) => `<rect x="${px(x + sx! * r - 0.45)}" y="${px(y + sy! * r - 0.45)}" width="${px(0.9)}" height="${px(0.9)}" fill="${WALL}" stroke="${WALL_DARK}" stroke-width="1.4"/>`).join("")
      : "");
  const hall = (s: number) =>
    `<path d="M${px(x - s * 1.3)} ${px(y)} Q${px(x)} ${px(y - s * 1.3)} ${px(x + s * 1.3)} ${px(y)} Z" fill="${ROOF}" stroke="#4a1a12" stroke-width="1.4"/><rect x="${px(x - s)}" y="${px(y)}" width="${px(2 * s)}" height="${px(s * 0.6)}" fill="#d8c08c" stroke="#4a1a12" stroke-width="1.1"/>`;
  switch (n.kind) {
    case "camp":
      return [[-1.4, 0.4], [0, -0.6], [1.4, 0.5]].map(([dx, dy]) => `<path d="M${px(x + dx! - 0.9)} ${px(y + dy! + 0.7)} L${px(x + dx!)} ${px(y + dy! - 0.8)} L${px(x + dx! + 0.9)} ${px(y + dy! + 0.7)} Z" fill="#e8dcc0" stroke="#4a3b28" stroke-width="1.3"/>`).join("");
    case "village":
    case "granary": {
      const huts = [[-1.5, 0.2], [0.2, -0.9], [1.4, 0.6], [-0.2, 1.1]].map(([dx, dy]) => hut(x + dx! + rnd(rng, -0.2, 0.2), y + dy!));
      if (n.kind === "granary") huts.push(`<ellipse cx="${px(x + 2.4)}" cy="${px(y - 0.3)}" rx="${px(0.8)}" ry="${px(1)}" fill="#c99a52" stroke="#3d2a1a" stroke-width="1.2"/>`);
      return huts.join("");
    }
    case "outpost":
    case "watchtower":
      return walls(1.5, false) + (n.kind === "watchtower" ? `<rect x="${px(x - 0.45)}" y="${px(y - 2.6)}" width="${px(0.9)}" height="${px(2.4)}" fill="${WALL}" stroke="${WALL_DARK}" stroke-width="1.4"/>` : "") + hall(0.7);
    case "fort":
      return walls(2, true) + hall(0.9);
    case "citadel":
      return walls(3.6, true) + `<rect x="${px(x - 2.2)}" y="${px(y - 1.7)}" width="${px(4.4)}" height="${px(3.4)}" fill="none" stroke="${WALL}" stroke-width="2"/>` + hall(1.6);
    case "bridge":
      return "";
    case "shoal":
      return `<ellipse cx="${px(x)}" cy="${px(y)}" rx="${px(3.4)}" ry="${px(1.6)}" fill="#e3d29c" opacity="0.9" stroke="#b39d61" stroke-width="1.2"/>`;
  }
}

/** Cầu gỗ bắc qua chỗ sông cắt đường bộ (ô cầu, hoặc đường vượt nước đi qua ô cầu). */
function bridgeArt(n: ExpeditionNode): string {
  const [x, y] = [n.x, n.y];
  return `<rect x="${px(x - 2.4)}" y="${px(y - 0.55)}" width="${px(4.8)}" height="${px(1.1)}" fill="#a77a48" stroke="#4a3220" stroke-width="1.4"/>` +
    [-1.8, -0.6, 0.6, 1.8].map((dx) => `<line x1="${px(x + dx)}" y1="${px(y - 0.55)}" x2="${px(x + dx)}" y2="${px(y + 0.55)}" stroke="#4a3220" stroke-width="1"/>`).join("");
}

function compass(c: P): string {
  const r = 3.2;
  const [x, y] = c;
  const arm = (a: number, len: number, fill: string) => {
    const t: P = [x + Math.cos(a) * len, y + Math.sin(a) * len];
    const l: P = [x + Math.cos(a + Math.PI / 2) * 0.55, y + Math.sin(a + Math.PI / 2) * 0.55];
    const rr: P = [x + Math.cos(a - Math.PI / 2) * 0.55, y + Math.sin(a - Math.PI / 2) * 0.55];
    return `<path d="M${px(l[0])} ${px(l[1])} L${px(t[0])} ${px(t[1])} L${px(rr[0])} ${px(rr[1])} Z" fill="${fill}" stroke="#3b2f22" stroke-width="1"/>`;
  };
  return `<g opacity="0.75"><circle cx="${px(x)}" cy="${px(y)}" r="${px(r * 0.75)}" fill="none" stroke="#3b2f22" stroke-width="1.5"/>${[0, 1, 2, 3].map((i) => arm((i * Math.PI) / 2 - Math.PI / 2, r, i === 0 ? ROOF : "#e8dcc0")).join("")}${[0, 1, 2, 3].map((i) => arm((i * Math.PI) / 2 - Math.PI / 4, r * 0.55, "#c9b38a")).join("")}</g>`;
}

export function mapSvg(map: ExpeditionMap): string {
  const th = THEME[map.id];
  const rng = createRng([...map.id].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619), 2166136261) >>> 0);
  const at = (id: string) => map.nodes.find((n) => n.id === id)!;
  const pt = (n: ExpeditionNode): P => [n.x, n.y];
  const edges = map.edges.map(([a, b, kind]) => ({ a: pt(at(a)), b: pt(at(b)), kind: kind ?? "land", na: at(a), nb: at(b) }));
  const landEdges = edges.filter((e) => e.kind === "land");
  const nearNode = (p: P, r: number) => map.nodes.some((n) => dist(p, pt(n)) < r);
  const nearEdge = (p: P, r: number) => edges.some((e) => segDist(p, e.a, e.b) < r);
  const onLand = (p: P) => !th.islands || map.nodes.some((n) => dist(p, pt(n)) < 8) || landEdges.some((e) => segDist(p, e.a, e.b) < 4);
  const free = (p: P, node = 4.5, edge = 2.2) => !nearNode(p, node) && !nearEdge(p, edge);

  const layers: string[] = [];
  // Nền giấy và đất.
  layers.push(`<rect width="${W}" height="${H}" fill="${th.paper}"/>`);
  if (th.islands) {
    layers.push(`<rect width="${W}" height="${H}" fill="${th.sea}"/>`);
    // Sóng nhỏ trên biển.
    const waves: string[] = [];
    for (let i = 0; i < 160; i++) {
      const p: P = [rnd(rng, 1, 99), rnd(rng, 1, 59)];
      if (onLand(p)) continue;
      waves.push(`<path d="M${px(p[0] - 0.8)} ${px(p[1])} q${px(0.4)} ${px(-0.45)} ${px(0.8)} 0 t${px(0.8)} 0" fill="none" stroke="#bfe0dc" stroke-width="1.6" opacity="0.5"/>`);
    }
    layers.push(waves.join(""));
    // Ba lượt: nước nông, viền bờ, rồi mặt đất, để chỗ các dải đất chồng nhau không lộ viền.
    const shallow: string[] = [];
    const coast: string[] = [];
    const land: string[] = [];
    for (const n of map.nodes) {
      const r = n.kind === "citadel" ? 9 : n.kind === "shoal" ? 5 : 7.5;
      const d = blob(rng, pt(n), r);
      shallow.push(`<path d="${d}" fill="#7fc0bd" opacity="0.55" transform="translate(0 0) scale(1)" stroke="#7fc0bd" stroke-width="${px(2.4)}"/>`);
      coast.push(`<path d="${d}" fill="#8a7346" stroke="#8a7346" stroke-width="5"/>`);
      land.push(`<path d="${d}" fill="${n.kind === "shoal" ? "#e3d29c" : th.land}"/>`);
    }
    for (const e of landEdges) {
      const pts = [e.a, [(e.a[0] + e.b[0]) / 2 + rnd(rng, -1, 1), (e.a[1] + e.b[1]) / 2 + rnd(rng, -1, 1)] as P, e.b];
      shallow.push(`<path d="${curve(pts)}" fill="none" stroke="#7fc0bd" stroke-width="${px(9.5)}" stroke-linecap="round" opacity="0.55"/>`);
      coast.push(`<path d="${curve(pts)}" fill="none" stroke="#8a7346" stroke-width="${px(7.4)}" stroke-linecap="round"/>`);
      land.push(`<path d="${curve(pts)}" fill="none" stroke="${th.land}" stroke-width="${px(7)}" stroke-linecap="round"/>`);
    }
    layers.push(shallow.join(""), coast.join(""), land.join(""));
    // Phủ lại phần đất nối để mất viền ở chỗ chồng nhau.
    layers.push(map.nodes.filter((n) => n.kind !== "shoal").map((n) => `<circle cx="${px(n.x)}" cy="${px(n.y)}" r="${px(5.5)}" fill="${th.land}"/>`).join(""));
  } else {
    layers.push(`<rect width="${W}" height="${H}" fill="${th.land}" opacity="0.55"/>`);
    // Mảng màu đất loang để nền không phẳng.
    const patches: string[] = [];
    for (let i = 0; i < 26; i++) {
      const tone = rng.next() < 0.5 ? th.treeTone[0] : th.fieldTone[0];
      patches.push(`<path d="${blob(rng, [rnd(rng, 0, 100), rnd(rng, 0, 60)], rnd(rng, 5, 12), 0.35)}" fill="${tone}" opacity="0.12"/>`);
    }
    layers.push(patches.join(""));
  }

  // Sông qua các đường vượt nước; đầm và bãi cạn.
  const rivers: string[] = [];
  for (const e of edges) {
    if (e.kind === "water" && !th.islands) {
      const path = curve(riverThrough(rng, e.a, e.b, 22));
      rivers.push(`<path d="${path}" fill="none" stroke="#3f6d72" stroke-width="${px(2.6)}" stroke-linecap="round" opacity="0.55"/><path d="${path}" fill="none" stroke="${th.river}" stroke-width="${px(2.1)}" stroke-linecap="round"/><path d="${path}" fill="none" stroke="#cfe7e0" stroke-width="2" stroke-dasharray="10 18" opacity="0.7"/>`);
    }
    if (e.kind === "marsh") {
      const m: P = [(e.a[0] + e.b[0]) / 2, (e.a[1] + e.b[1]) / 2];
      rivers.push(`<path d="${blob(rng, m, 3.6, 0.3)}" fill="#7c9f84" opacity="0.7" stroke="#4f6d55" stroke-width="2"/>`);
      for (let i = 0; i < 14; i++) {
        const p: P = [m[0] + rnd(rng, -3, 3), m[1] + rnd(rng, -2, 2)];
        rivers.push(`<path d="M${px(p[0])} ${px(p[1])} l${px(-0.3)} ${px(-1)} M${px(p[0])} ${px(p[1])} l0 ${px(-1.2)} M${px(p[0])} ${px(p[1])} l${px(0.3)} ${px(-1)}" stroke="#3d5a3c" stroke-width="1.2"/>`);
      }
    }
    if (e.kind === "tide") {
      const m: P = [(e.a[0] + e.b[0]) / 2, (e.a[1] + e.b[1]) / 2];
      rivers.push(`<path d="${blob(rng, m, 4, 0.3)}" fill="#e6d6a2" opacity="0.8" stroke="#b39d61" stroke-width="1.6" stroke-dasharray="6 5"/>`);
    }
  }
  // Thượng Du: dòng suối chảy dọc thung lũng giữa hai đường hành quân.
  if (map.id === "thuongDu") {
    const ys = rnd(rng, 18, 42);
    const pts: P[] = Array.from({ length: 12 }, (_, i) => [-2 + i * 9.5, ys + Math.sin(i * 0.9) * 6 + rnd(rng, -2, 2)] as P);
    const path = curve(pts);
    rivers.push(`<path d="${path}" fill="none" stroke="#3f6d72" stroke-width="${px(1.6)}" opacity="0.5"/><path d="${path}" fill="none" stroke="${th.river}" stroke-width="${px(1.2)}"/>`);
  }
  layers.push(rivers.join(""));

  // Ruộng quanh làng, kho và thành.
  const fieldsSvg: string[] = [];
  const farms = map.nodes.filter((n) => n.kind === "village" || n.kind === "granary" || n.kind === "citadel" || n.kind === "camp");
  for (let i = 0, tries = 0; i < th.fields * farms.length && tries < 2000; tries++) {
    const n = farms[Math.floor(rng.next() * farms.length)]!;
    const p: P = [n.x + rnd(rng, -9, 9), n.y + rnd(rng, -7, 7)];
    if (p[0] < 2 || p[0] > 98 || p[1] < 2 || p[1] > 58 || !free(p, 4.2, 2.2) || !onLand(p)) continue;
    fieldsSvg.push(field(rng, p, th));
    i++;
  }
  layers.push(fieldsSvg.join(""));

  // Núi và rừng ở chỗ trống, vẽ từ trên xuống để núi sau che núi trước.
  const deco: { y: number; svg: string }[] = [];
  for (let i = 0, tries = 0; i < th.mountains && tries < 4000; tries++) {
    const p: P = [rnd(rng, 1, 99), rnd(rng, 3, 60)];
    const size = rnd(rng, 2.2, th.snow ? 4.6 : 3.6);
    if (!free(p, 4.5 + size * 0.6, 2.2 + size * 0.5) || !onLand(p) || nearNode([p[0], p[1] - size], 4.5)) continue;
    deco.push({ y: p[1], svg: mountain(rng, p, size, th) });
    i++;
  }
  for (let i = 0, tries = 0; i < th.trees && tries < 6000; tries++) {
    const c: P = [rnd(rng, 1, 99), rnd(rng, 1, 59)];
    if (!free(c, 4, 2) || !onLand(c)) continue;
    // Rừng mọc thành cụm.
    const k = 2 + Math.floor(rng.next() * 4);
    for (let j = 0; j < k; j++) {
      const p: P = [c[0] + rnd(rng, -1.6, 1.6), c[1] + rnd(rng, -1.1, 1.1)];
      if (free(p, 3.6, 1.6) && onLand(p)) deco.push({ y: p[1], svg: tree(rng, p, th) });
    }
    i++;
  }
  deco.sort((a, b) => a.y - b.y);
  layers.push(deco.map((d) => d.svg).join(""));

  // Đường đất mờ theo đường bộ (giao diện vẽ đường chính đè lên khi đã thấy).
  layers.push(landEdges.map((e) => {
    const mid: P = [(e.a[0] + e.b[0]) / 2 + rnd(rng, -0.8, 0.8), (e.a[1] + e.b[1]) / 2 + rnd(rng, -0.8, 0.8)];
    return `<path d="${curve([e.a, mid, e.b])}" fill="none" stroke="#efe2bc" stroke-width="${px(0.75)}" stroke-linecap="round" opacity="0.85"/><path d="${curve([e.a, mid, e.b])}" fill="none" stroke="#7b6640" stroke-width="2" stroke-dasharray="3 9" stroke-linecap="round" opacity="0.6"/>`;
  }).join(""));

  // Công trình dưới từng ô; cầu ở ô cầu.
  layers.push(map.nodes.map((n) => (n.kind === "bridge" ? bridgeArt(n) : building(rng, n))).join(""));

  // Mây trôi ở mép.
  const clouds: string[] = [];
  for (let i = 0; i < th.clouds; i++) {
    const edgeY = rng.next() < 0.5 ? rnd(rng, 0, 8) : rnd(rng, 52, 60);
    const p: P = [rnd(rng, 0, 100), edgeY];
    clouds.push(`<ellipse cx="${px(p[0])}" cy="${px(p[1])}" rx="${px(rnd(rng, 5, 10))}" ry="${px(rnd(rng, 1.6, 3))}" fill="#fbf6ea" opacity="0.55" filter="url(#soft)"/>`);
  }
  layers.push(clouds.join(""));

  // La bàn ở góc trống nhất.
  const corners: P[] = [[6, 6], [94, 6], [6, 54], [94, 54]];
  const corner = corners.reduce((best, c) => (Math.min(...map.nodes.map((n) => dist(c, pt(n)))) > Math.min(...map.nodes.map((n) => dist(best, pt(n)))) ? c : best));
  layers.push(compass(corner));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="3"/><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.16  0 0 0 0.22 0"/></filter>
  <filter id="stain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="2" seed="11"/><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.33  0 0 0 0 0.18  0 0 0 0.35 -0.05"/></filter>
  <filter id="soft"><feGaussianBlur stdDeviation="10"/></filter>
  <radialGradient id="vignette" cx="50%" cy="50%" r="72%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#3a2614" stop-opacity="0.55"/></radialGradient>
</defs>
${layers.join("\n")}
<rect width="${W}" height="${H}" filter="url(#stain)"/>
<rect width="${W}" height="${H}" filter="url(#paper)"/>
<rect width="${W}" height="${H}" fill="url(#vignette)"/>
<rect x="10" y="10" width="${W - 20}" height="${H - 20}" fill="none" stroke="#4a3520" stroke-width="3" opacity="0.6"/>
</svg>`;
}

async function main() {
  const wanted = process.argv.slice(2) as ExpeditionMapId[];
  const ids = wanted.length ? wanted : EXPEDITION_MAP_IDS.filter((id) => !PAINTED.includes(id));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  for (const id of ids) {
    const map = EXPEDITION_MAPS[id];
    if (!map) throw new Error(`Không có sa bàn ${id}`);
    const svg = mapSvg(map);
    const dataUrl: string = await page.evaluate(async (src) => {
      const img = new Image();
      img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(src)))}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      return canvas.toDataURL("image/webp", 0.86);
    }, svg);
    const out = `public/art/expedition/${MAP_FILE[id]}.webp`;
    writeFileSync(out, Buffer.from(dataUrl.split(",")[1]!, "base64"));
    console.log(`${map.name}: ${out}`);
  }
  await browser.close();
}

void main();
