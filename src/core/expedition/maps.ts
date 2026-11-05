// Viễn Chinh: sáu sa bàn. Mỗi sa bàn là một đồ thị nhỏ: hai trại xuất phát, các đồn/chòi/lũy/làng/kho lương và
// một thành đích. Tọa độ ô x 0–100, y 0–60 tính trên tranh nền 5:3 của sa bàn. Luật ở
// docs/02-game-modes/expedition/01-vien-chinh-gdd.md, câu lệnh vẽ tranh ở docs/06-art/prompts/vien-chinh-sa-ban.md.

import type { Element } from "../battle";

export const EXPEDITION_MAP_IDS = ["aiBac", "thuongDu", "cuaBien", "chauTho", "kinhThanh", "quanDao"] as const;
export type ExpeditionMapId = (typeof EXPEDITION_MAP_IDS)[number];

/**
 * - `camp`: trại xuất phát của một đạo quân, không có trận.
 * - `outpost`: đồn nhỏ, 2 địch.
 * - `watchtower`: chòi canh, 2 địch; chiếm được thì vén sương mù mọi ô trong 2 bước.
 * - `granary`: kho lương có lính giữ, 2 địch; chiếm được thì cả hai đạo thêm lương.
 * - `fort`: lũy, 3 địch.
 * - `village`: làng, không có trận; lần đầu ghé thì hồi máu, cứu một người gục và thêm lương.
 * - `citadel`: thành đích, 3 địch có tướng giữ thành máu ×1,5. Chiếm được là thắng viễn chinh.
 * - `bridge`: cầu (sa bàn có kịch bản), 3 địch; trận giữ cầu: cầm cự đủ lượt là thắng.
 * - `shoal`: bãi cạn (sa bàn có kịch bản), không trận, không thưởng; đứng chờ con nước được.
 */
export type ExpeditionNodeKind =
  | "camp"
  | "outpost"
  | "watchtower"
  | "granary"
  | "fort"
  | "village"
  | "citadel"
  | "bridge"
  | "shoal";

/**
 * - `water`: vượt sông hay biển, đi mất 2 ngày (đạo kia nghỉ cả 2 ngày, giặc tăng viện theo ngày).
 * - `marsh`: lội đầm, như vượt nước (2 ngày), chỉ khác nét vẽ.
 * - `tide`: cửa nước, 1 ngày nhưng chỉ qua được vào ngày nước rút của kịch bản.
 */
export type ExpeditionEdgeKind = "land" | "water" | "marsh" | "tide";

/**
 * Nền tạm khi sa bàn chưa có tranh riêng: một vùng của bản đồ tổng Bình Loạn (1536×1024), góc trên trái và bề ngang;
 * bề cao = bề ngang × 0,6. Có tranh riêng thì giao diện dùng tranh đó và vùng này bỏ đi.
 */
export interface ExpeditionMapArt {
  readonly x: number;
  readonly y: number;
  readonly w: number;
}

export interface ExpeditionNode {
  readonly id: string;
  readonly kind: ExpeditionNodeKind;
  readonly name: string;
  readonly x: number;
  readonly y: number;
  /** Độ sâu tính từ trại (0) tới thành đích; đối thủ ở sâu hơn cao cấp hơn. */
  readonly depth: number;
}

export interface ExpeditionMap {
  readonly id: ExpeditionMapId;
  readonly name: string;
  readonly blurb: string;
  /** Nguyên tố của chiến địa: bàn cờ nghiêng về ô hợp hệ này và nửa số địch thuộc hệ này. */
  readonly element: Element;
  /** Số ngày hành quân tối đa: hết ngày mà chưa chiếm thành đích thì viễn chinh thất bại. */
  readonly days: number;
  /** Ngày chuẩn cho sao thứ hai. */
  readonly parDays: number;
  readonly nodes: readonly ExpeditionNode[];
  /** Đường đi hai chiều; phần tử thứ ba là loại đường (bỏ trống là đường bộ). */
  readonly edges: readonly (readonly [string, string] | readonly [string, string, ExpeditionEdgeKind])[];
  readonly art: ExpeditionMapArt;
  /** Trại của đạo Chính (0) và Biệt đạo (1). */
  readonly camps: readonly [string, string];
  readonly citadel: string;
}

const node = (
  id: string,
  kind: ExpeditionNodeKind,
  name: string,
  x: number,
  y: number,
  depth: number,
): ExpeditionNode => ({ id, kind, name, x, y, depth });

export const EXPEDITION_MAPS: Readonly<Record<ExpeditionMapId, ExpeditionMap>> = {
  aiBac: {
    id: "aiBac",
    name: "Ải Bắc",
    blurb: "Đèo đá và chòi gác trên biên ải phía bắc. Đường đi đan nhau, dễ dồn quân giáp công.",
    element: "kim",
    days: 13,
    parDays: 9,
    art: { x: 380, y: 0, w: 800 },
    camps: ["trai-ta", "trai-huu"],
    citadel: "thanh-ai-bac",
    nodes: [
      node("trai-ta", "camp", "Trại Tả", 6, 25, 0),
      node("trai-huu", "camp", "Trại Hữu", 6, 45, 0),
      node("khe-da", "outpost", "Đồn Khe Đá", 17, 13, 1),
      node("ban-na", "village", "Bản Na", 15, 36, 1),
      node("suoi-lanh", "outpost", "Đồn Suối Lạnh", 21, 53, 1),
      node("deo-may", "fort", "Lũy Đèo Mây", 27, 22, 2),
      node("kho-ngua", "granary", "Kho Ngựa Thồ", 42, 28, 2),
      node("bai-lau", "fort", "Lũy Bãi Lau", 37, 47, 2),
      node("gac-bac", "fort", "Lũy Gác Bắc", 57, 15, 3),
      node("gac-nam", "fort", "Lũy Gác Nam", 66, 43, 3),
      node("thanh-ai-bac", "citadel", "Thành Ải Bắc", 76, 29, 4),
    ],
    edges: [
      ["trai-ta", "khe-da"], ["trai-ta", "ban-na"], ["trai-huu", "ban-na"], ["trai-huu", "suoi-lanh"],
      ["khe-da", "ban-na"], ["ban-na", "suoi-lanh"],
      ["khe-da", "deo-may"], ["ban-na", "kho-ngua"], ["suoi-lanh", "bai-lau"],
      ["deo-may", "kho-ngua"], ["kho-ngua", "bai-lau"],
      ["deo-may", "gac-bac"], ["kho-ngua", "gac-bac"], ["kho-ngua", "gac-nam"], ["bai-lau", "gac-nam"],
      ["gac-bac", "thanh-ai-bac"], ["gac-nam", "thanh-ai-bac"],
    ],
  },
  thuongDu: {
    id: "thuongDu",
    name: "Thượng Du",
    blurb: "Hai thung lũng rừng sâu bị dãy núi chia đôi, chỉ nối nhau qua một đèo hiểm. Đường dài, khó hội quân.",
    element: "moc",
    days: 19,
    parDays: 14,
    art: { x: 0, y: 140, w: 700 },
    camps: ["trai-nguon", "trai-suoi"],
    citadel: "thanh-thuong-du",
    nodes: [
      node("trai-nguon", "camp", "Trại Đầu Nguồn", 9, 12, 0),
      node("trai-suoi", "camp", "Trại Bến Suối", 8, 46, 0),
      node("rung-tre", "outpost", "Đồn Rừng Tre", 21, 22, 1),
      node("ban-moc", "village", "Bản Mộc", 36, 17, 1),
      node("luy-da", "fort", "Lũy Đá Chồng", 55, 11, 2),
      node("gac-may", "outpost", "Chòi Mây Phủ", 72, 15, 3),
      node("doc-lau", "outpost", "Đồn Dốc Lau", 24, 52, 1),
      node("luy-thac", "outpost", "Đồn Thác Bạc", 38, 37, 1),
      node("ruong-bac", "village", "Bản Ruộng Bậc", 63, 41, 2),
      node("gac-khe", "outpost", "Chòi Khe Hẹp", 82, 30, 3),
      node("deo-ngang", "fort", "Đèo Ngang Núi", 58, 32, 2),
      node("thanh-thuong-du", "citadel", "Thành Thượng Du", 87, 5, 4),
    ],
    edges: [
      ["trai-nguon", "rung-tre"], ["rung-tre", "ban-moc"], ["ban-moc", "luy-da"], ["luy-da", "gac-may"],
      ["gac-may", "thanh-thuong-du"],
      ["trai-suoi", "doc-lau"], ["doc-lau", "luy-thac"], ["luy-thac", "ruong-bac"], ["ruong-bac", "gac-khe"],
      ["gac-khe", "thanh-thuong-du"],
      ["ban-moc", "deo-ngang"], ["deo-ngang", "ruong-bac"],
    ],
  },
  // Kịch bản cố định (docs/02-game-modes/expedition/03-cua-bien-thiet-ke.md): rút dân Làng Chài, giữ Cầu Phao cắt
  // thuyền viện, vào Thủy Trại Tây bằng cửa nước lúc nước rút hoặc phá cổng.
  cuaBien: {
    id: "cuaBien",
    name: "Cửa Biển",
    blurb: "Thủy trại giặc giữ cửa sông. Rút dân làng chài, giữ cầu phao chặn thuyền viện, canh con nước mà vào cửa sau.",
    element: "thuy",
    days: 17,
    parDays: 12,
    art: { x: 840, y: 270, w: 696 },
    camps: ["trai-ben", "trai-bai"],
    citadel: "trai-tay",
    nodes: [
      node("trai-ben", "camp", "Trại Bến Thuyền", 6, 30, 0),
      node("trai-bai", "camp", "Trại Bãi Sậy", 10, 52, 0),
      node("ben-coi", "outpost", "Đồn Bến Cói", 18, 18, 1),
      node("bai-su", "outpost", "Đồn Bãi Sú", 32, 47, 1),
      node("lang-chai", "village", "Làng Chài", 31, 7, 2),
      node("cho-song", "granary", "Chợ Cửa Sông", 36, 31, 2),
      node("dai-trieu", "watchtower", "Đài Quan Triều", 56, 8, 3),
      node("doi-cat", "bridge", "Cầu Phao Doi Cát", 60, 25, 3),
      node("mui-cat", "fort", "Đồn Mũi Cát", 59, 44, 3),
      node("bai-can", "shoal", "Bãi Cạn", 82, 54, 3),
      node("trai-tay", "citadel", "Thủy Trại Tây", 84, 30, 4),
    ],
    edges: [
      ["trai-ben", "ben-coi"], ["trai-ben", "cho-song", "water"], ["ben-coi", "lang-chai"], ["ben-coi", "cho-song"],
      ["lang-chai", "dai-trieu"], ["dai-trieu", "doi-cat"],
      ["trai-bai", "bai-su"], ["trai-bai", "bai-can", "marsh"],
      ["bai-su", "cho-song"], ["bai-su", "doi-cat"], ["bai-su", "mui-cat"],
      ["cho-song", "doi-cat"], ["cho-song", "mui-cat"],
      ["doi-cat", "trai-tay"], ["mui-cat", "trai-tay"], ["mui-cat", "bai-can"], ["bai-can", "trai-tay", "tide"],
    ],
  },
  chauTho: {
    id: "chauTho",
    name: "Ngã Ba Sông",
    blurb: "Thành đích nằm giữa ba nhánh sông. Hai đạo xuất phát từ hai phía; lội sông nhanh đường mà mất hai ngày, đi vòng qua cầu thì xa.",
    element: "tho",
    days: 10,
    parDays: 7,
    art: { x: 400, y: 250, w: 700 },
    camps: ["trai-tay", "trai-dong"],
    citadel: "thanh-nga-ba",
    nodes: [
      node("trai-tay", "camp", "Trại Bờ Tây", 5, 15, 0),
      node("trai-dong", "camp", "Trại Bờ Đông", 87, 33, 0),
      node("ben-lau", "outpost", "Đồn Bến Lau", 20, 26, 1),
      node("doi-tram", "watchtower", "Chòi Đồi Trám", 25, 8, 1),
      node("lang-ruong", "village", "Làng Ruộng Chiêm", 16, 52, 1),
      node("bai-dong", "outpost", "Đồn Bãi Đông", 78, 45, 1),
      node("lang-ben", "village", "Làng Bến Thượng", 76, 11, 1),
      node("cau-go", "outpost", "Đồn Cầu Gỗ", 37, 33, 2),
      node("bai-bac", "outpost", "Đồn Bãi Bắc", 60, 8, 2),
      node("kho-thoc", "granary", "Kho Thóc Bãi Giữa", 48, 53, 2),
      node("ben-do", "fort", "Lũy Bến Đò", 63, 33, 2),
      node("luy-son", "fort", "Lũy Núi Sơn", 54, 42, 3),
      node("thanh-nga-ba", "citadel", "Thành Ngã Ba", 51, 22, 4),
    ],
    edges: [
      ["trai-tay", "ben-lau"], ["trai-tay", "doi-tram"], ["ben-lau", "doi-tram"], ["ben-lau", "lang-ruong"],
      ["ben-lau", "cau-go", "water"], ["lang-ruong", "kho-thoc"], ["kho-thoc", "luy-son"], ["cau-go", "luy-son"],
      ["cau-go", "thanh-nga-ba", "water"], ["doi-tram", "bai-bac", "water"], ["bai-bac", "thanh-nga-ba", "water"],
      ["trai-dong", "lang-ben"], ["trai-dong", "bai-dong"], ["lang-ben", "bai-bac"], ["bai-dong", "ben-do"],
      ["bai-dong", "kho-thoc", "water"], ["ben-do", "luy-son"], ["ben-do", "thanh-nga-ba"], ["luy-son", "thanh-nga-ba"],
    ],
  },
  kinhThanh: {
    id: "kinhThanh",
    name: "Kinh Thành",
    blurb: "Kinh thành lớn phía nam có ba cổng lũy. Phải phá một cổng mới vào được thành; chòi canh hai bên giúp nhìn thấu đường vây.",
    element: "hoa",
    days: 11,
    parDays: 8,
    art: { x: 380, y: 520, w: 800 },
    camps: ["trai-bac", "trai-dong"],
    citadel: "kinh-thanh",
    nodes: [
      node("trai-bac", "camp", "Trại Bắc Thành", 18, 5, 0),
      node("trai-dong", "camp", "Trại Thủy Đông", 70, 10, 0),
      node("lang-dau", "village", "Làng Đầu Bãi", 14, 19, 1),
      node("don-ruong", "outpost", "Đồn Ruộng Mạ", 28, 30, 1),
      node("cho-phien", "granary", "Chợ Phiên", 52, 16, 1),
      node("ben-nuoc", "outpost", "Đồn Bến Nước", 74, 27, 1),
      node("choi-nui", "watchtower", "Chòi Núi Tây", 12, 36, 2),
      node("cau-tay", "fort", "Lũy Cầu Tây", 38, 22, 2),
      node("luy-bien", "watchtower", "Chòi Mép Nước", 84, 38, 2),
      node("cong-tay", "fort", "Cổng Tây", 38, 43, 4),
      node("cong-bac", "fort", "Cổng Bắc", 56, 26, 4),
      node("cong-dong", "fort", "Cổng Đông", 72, 44, 4),
      node("lang-nam", "village", "Làng Bến Nam", 69, 53, 3),
      node("kinh-thanh", "citadel", "Kinh Thành", 55, 38, 5),
    ],
    edges: [
      ["trai-bac", "lang-dau"], ["trai-bac", "don-ruong"], ["trai-bac", "cho-phien", "water"],
      ["lang-dau", "choi-nui"], ["lang-dau", "don-ruong"], ["choi-nui", "cong-tay"], ["don-ruong", "cau-tay"],
      ["don-ruong", "cong-tay"], ["cau-tay", "cho-phien", "water"], ["cau-tay", "cong-bac"],
      ["trai-dong", "cho-phien", "water"], ["trai-dong", "ben-nuoc"], ["cho-phien", "cong-bac"],
      ["ben-nuoc", "cong-bac"], ["ben-nuoc", "luy-bien"], ["luy-bien", "cong-dong"], ["cong-dong", "lang-nam"],
      ["lang-nam", "cong-tay", "water"],
      ["cong-tay", "kinh-thanh"], ["cong-bac", "kinh-thanh"], ["cong-dong", "kinh-thanh"],
    ],
  },
  quanDao: {
    id: "quanDao",
    name: "Quần Đảo",
    blurb: "Thành đảo giữa vịnh, chỉ một cây cầu dài nối vào bờ. Còn lại phải vượt biển từ đảo này sang đảo khác.",
    element: "phong",
    days: 9,
    parDays: 6,
    art: { x: 960, y: 500, w: 576 },
    camps: ["trai-bo", "trai-cat"],
    citadel: "thanh-dao",
    nodes: [
      node("trai-bo", "camp", "Trại Bờ Bắc", 6, 9, 0),
      node("trai-cat", "camp", "Trại Bãi Cát", 5, 47, 0),
      node("mui-da", "outpost", "Đồn Mũi Đá", 22, 15, 1),
      node("bai-nam", "outpost", "Đồn Bãi Nam", 17, 54, 1),
      node("cau-dai", "fort", "Lũy Cầu Dài", 23, 34, 3),
      node("dao-bac", "watchtower", "Chòi Đảo Bắc", 41, 8, 2),
      node("dao-rua", "village", "Làng Đảo Rùa", 48, 22, 2),
      node("dao-nam", "granary", "Kho Đảo Nam", 50, 56, 2),
      node("dao-dong", "fort", "Lũy Đảo Đông", 67, 18, 3),
      node("hon-nho", "outpost", "Đồn Hòn Nhỏ", 85, 26, 3),
      node("hon-dong", "fort", "Lũy Hòn Đông", 68, 43, 3),
      node("thanh-dao", "citadel", "Thành Đảo", 42, 38, 5),
    ],
    edges: [
      ["trai-bo", "mui-da"], ["mui-da", "cau-dai"], ["trai-cat", "cau-dai"], ["trai-cat", "bai-nam"],
      ["cau-dai", "thanh-dao"],
      ["mui-da", "dao-bac", "water"], ["dao-bac", "dao-rua", "water"], ["dao-rua", "thanh-dao", "water"],
      ["dao-rua", "dao-dong", "water"], ["dao-dong", "hon-nho", "water"], ["dao-dong", "hon-dong", "water"],
      ["hon-nho", "hon-dong", "water"], ["bai-nam", "dao-nam", "water"], ["dao-nam", "hon-dong", "water"],
      ["dao-nam", "thanh-dao", "water"], ["hon-dong", "thanh-dao", "water"],
    ],
  },
};

export const isExpeditionMapId = (x: unknown): x is ExpeditionMapId =>
  typeof x === "string" && (EXPEDITION_MAP_IDS as readonly string[]).includes(x);

export function expeditionNode(map: ExpeditionMap, id: string): ExpeditionNode | undefined {
  return map.nodes.find((n) => n.id === id);
}

/** Các ô kề một ô (đường đi hai chiều). */
export function expeditionNeighbors(map: ExpeditionMap, id: string): string[] {
  return map.edges.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []));
}

export const isExpeditionCombatNode = (kind: ExpeditionNodeKind) =>
  kind === "outpost" ||
  kind === "watchtower" ||
  kind === "granary" ||
  kind === "fort" ||
  kind === "citadel" ||
  kind === "bridge";

/** Khóa của đường `a`–`b`, không phụ thuộc chiều đi (lưu đường bị phá, đường đã lộ). */
export const expeditionEdgeKey = (a: string, b: string) => (a < b ? `${a}~${b}` : `${b}~${a}`);

/** Loại đường `a`–`b`; undefined khi hai ô không kề nhau. */
export function expeditionEdgeKind(map: ExpeditionMap, a: string, b: string): ExpeditionEdgeKind | undefined {
  const edge = map.edges.find(([x, y]) => (x === a && y === b) || (x === b && y === a));
  return edge ? (edge[2] ?? "land") : undefined;
}

/** Số ngày đi qua đường `a`–`b` (vượt nước và lội đầm 2, còn lại 1); không có đường thì Infinity. */
export function expeditionEdgeDays(map: ExpeditionMap, a: string, b: string): number {
  const kind = expeditionEdgeKind(map, a, b);
  if (!kind) return Infinity;
  return kind === "water" || kind === "marsh" ? 2 : 1;
}

/** Số ngày đi ít nhất từ `from` tới `to` (tính cả vượt nước); Infinity khi không tới được. */
export function expeditionDistance(map: ExpeditionMap, from: string, to: string): number {
  const dist = new Map<string, number>([[from, 0]]);
  const open = new Set([from]);
  while (open.size > 0) {
    let id = "";
    let best = Infinity;
    for (const x of open) if (dist.get(x)! < best) { best = dist.get(x)!; id = x; }
    open.delete(id);
    if (id === to) return best;
    for (const n of expeditionNeighbors(map, id)) {
      const d = best + expeditionEdgeDays(map, id, n);
      if (d < (dist.get(n) ?? Infinity)) { dist.set(n, d); open.add(n); }
    }
  }
  return Infinity;
}

/** Số bước (không tính ngày) giữa hai ô; dùng cho tầm nhìn của chòi canh. */
export function expeditionHops(map: ExpeditionMap, from: string, to: string): number {
  if (from === to) return 0;
  const seen = new Set([from]);
  let frontier = [from];
  for (let d = 1; frontier.length > 0; d++) {
    const next: string[] = [];
    for (const id of frontier)
      for (const n of expeditionNeighbors(map, id)) {
        if (n === to) return d;
        if (!seen.has(n)) { seen.add(n); next.push(n); }
      }
    frontier = next;
  }
  return Infinity;
}

/** Tầm nhìn của chòi canh đã chiếm (số bước). */
export const EXPEDITION_WATCHTOWER_SIGHT = 2;
