// Viễn Chinh: ba sa bàn vẽ tay. Mỗi sa bàn là một đồ thị nhỏ: hai trại xuất phát, các đồn/lũy/làng/kho lương
// và một thành đích. Tọa độ x 0–100, y 0–60 chỉ để vẽ. Luật ở docs/02-game-modes/expedition/01-vien-chinh-gdd.md.

import type { Element } from "../battle";

export const EXPEDITION_MAP_IDS = ["aiBac", "thuongDu", "cuaBien"] as const;
export type ExpeditionMapId = (typeof EXPEDITION_MAP_IDS)[number];

/**
 * - `camp`: trại xuất phát của một đạo quân, không có trận.
 * - `outpost`: đồn nhỏ, 2 địch.
 * - `granary`: kho lương có lính giữ, 2 địch; chiếm được thì cả hai đạo thêm lương.
 * - `fort`: lũy, 3 địch.
 * - `village`: làng, không có trận; lần đầu ghé thì hồi máu, cứu một người gục và thêm lương.
 * - `citadel`: thành đích, 3 địch có tướng giữ thành máu ×1,5. Chiếm được là thắng viễn chinh.
 */
export type ExpeditionNodeKind = "camp" | "outpost" | "granary" | "fort" | "village" | "citadel";

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
  readonly edges: readonly (readonly [string, string])[];
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
    days: 12,
    parDays: 8,
    camps: ["trai-ta", "trai-huu"],
    citadel: "thanh-ai-bac",
    nodes: [
      node("trai-ta", "camp", "Trại Tả", 8, 15, 0),
      node("trai-huu", "camp", "Trại Hữu", 8, 45, 0),
      node("khe-da", "outpost", "Đồn Khe Đá", 26, 10, 1),
      node("ban-na", "village", "Bản Na", 26, 30, 1),
      node("suoi-lanh", "outpost", "Đồn Suối Lạnh", 26, 50, 1),
      node("deo-may", "fort", "Lũy Đèo Mây", 46, 12, 2),
      node("kho-ngua", "granary", "Kho Ngựa Thồ", 46, 30, 2),
      node("bai-lau", "fort", "Lũy Bãi Lau", 46, 48, 2),
      node("gac-bac", "fort", "Lũy Gác Bắc", 68, 16, 3),
      node("gac-nam", "fort", "Lũy Gác Nam", 68, 44, 3),
      node("thanh-ai-bac", "citadel", "Thành Ải Bắc", 90, 30, 4),
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
    days: 17,
    parDays: 12,
    camps: ["trai-nguon", "trai-suoi"],
    citadel: "thanh-thuong-du",
    nodes: [
      node("trai-nguon", "camp", "Trại Đầu Nguồn", 6, 12, 0),
      node("trai-suoi", "camp", "Trại Bến Suối", 6, 48, 0),
      node("rung-tre", "outpost", "Đồn Rừng Tre", 22, 8, 1),
      node("ban-moc", "village", "Bản Mộc", 36, 14, 1),
      node("luy-da", "fort", "Lũy Đá Chồng", 52, 8, 2),
      node("gac-may", "outpost", "Chòi Mây Phủ", 68, 14, 3),
      node("doc-lau", "outpost", "Đồn Dốc Lau", 22, 52, 1),
      node("luy-thac", "outpost", "Đồn Thác Bạc", 36, 46, 1),
      node("ruong-bac", "village", "Bản Ruộng Bậc", 52, 52, 2),
      node("gac-khe", "outpost", "Chòi Khe Hẹp", 68, 46, 3),
      node("deo-ngang", "fort", "Đèo Ngang Núi", 46, 30, 2),
      node("thanh-thuong-du", "citadel", "Thành Thượng Du", 90, 30, 4),
    ],
    edges: [
      ["trai-nguon", "rung-tre"], ["rung-tre", "ban-moc"], ["ban-moc", "luy-da"], ["luy-da", "gac-may"],
      ["gac-may", "thanh-thuong-du"],
      ["trai-suoi", "doc-lau"], ["doc-lau", "luy-thac"], ["luy-thac", "ruong-bac"], ["ruong-bac", "gac-khe"],
      ["gac-khe", "thanh-thuong-du"],
      ["ban-moc", "deo-ngang"], ["deo-ngang", "ruong-bac"],
    ],
  },
  cuaBien: {
    id: "cuaBien",
    name: "Cửa Biển",
    blurb: "Bãi bồi và thủy trại nơi cửa sông. Chợ giữa bãi là nút giao, thành đích có ba ngả vào.",
    element: "thuy",
    days: 12,
    parDays: 8,
    camps: ["trai-ben", "trai-bai"],
    citadel: "thanh-cua-bien",
    nodes: [
      node("trai-ben", "camp", "Trại Bến Thuyền", 8, 12, 0),
      node("trai-bai", "camp", "Trại Bãi Sậy", 8, 48, 0),
      node("ben-coi", "outpost", "Đồn Bến Cói", 24, 12, 1),
      node("bai-su", "outpost", "Đồn Bãi Sú", 24, 48, 1),
      node("lang-chai", "village", "Làng Chài", 40, 6, 2),
      node("cho-song", "granary", "Chợ Cửa Sông", 40, 30, 2),
      node("mui-cat", "fort", "Đồn Mũi Cát", 40, 54, 2),
      node("trai-dong", "fort", "Thủy Trại Đông", 62, 14, 3),
      node("doi-cat", "outpost", "Doi Cát", 62, 30, 3),
      node("trai-tay", "fort", "Thủy Trại Tây", 62, 46, 3),
      node("thanh-cua-bien", "citadel", "Thành Cửa Biển", 86, 30, 4),
    ],
    edges: [
      ["trai-ben", "ben-coi"], ["trai-bai", "bai-su"],
      ["ben-coi", "lang-chai"], ["ben-coi", "cho-song"], ["bai-su", "cho-song"], ["bai-su", "mui-cat"],
      ["lang-chai", "trai-dong"], ["cho-song", "trai-dong"], ["cho-song", "doi-cat"], ["cho-song", "trai-tay"],
      ["mui-cat", "trai-tay"],
      ["trai-dong", "doi-cat"], ["doi-cat", "trai-tay"],
      ["trai-dong", "thanh-cua-bien"], ["doi-cat", "thanh-cua-bien"], ["trai-tay", "thanh-cua-bien"],
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
  kind === "outpost" || kind === "granary" || kind === "fort" || kind === "citadel";

/** Số bước ít nhất từ `from` tới `to`; Infinity khi không tới được. */
export function expeditionDistance(map: ExpeditionMap, from: string, to: string): number {
  if (from === to) return 0;
  const seen = new Set([from]);
  let frontier = [from];
  for (let d = 1; frontier.length > 0; d++) {
    const next: string[] = [];
    for (const id of frontier)
      for (const n of expeditionNeighbors(map, id)) {
        if (n === to) return d;
        if (!seen.has(n)) {
          seen.add(n);
          next.push(n);
        }
      }
    frontier = next;
  }
  return Infinity;
}
