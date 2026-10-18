// Loại ô và bảng tỉ lệ sinh ô, xem docs/design/01-ban-co.md.

export const TILE_KINDS = ["kiem", "amDuong", "banhChung", "tim", "vang", "sach", "trong"] as const;
export type TileKind = (typeof TILE_KINDS)[number];

/** Ô đặc biệt: bản yếu từ chữ L/T, bản mạnh từ thẳng 5. */
export type SpecialGrade = "weak" | "strong";

export interface Tile {
  readonly kind: TileKind;
  readonly special?: SpecialGrade;
}

/** Trọng số sinh ô theo phần trăm, tổng phải bằng 100. */
export type SpawnWeights = Readonly<Record<TileKind, number>>;

export const STANDARD_WEIGHTS: SpawnWeights = {
  kiem: 18,
  amDuong: 16,
  banhChung: 15,
  tim: 15,
  vang: 11,
  sach: 11,
  trong: 14,
};

export const MIN_WEIGHT = 8;
export const MAX_WEIGHT = 35;

export function validateWeights(weights: SpawnWeights): void {
  let total = 0;
  for (const kind of TILE_KINDS) {
    const w = weights[kind];
    if (!Number.isFinite(w) || w < MIN_WEIGHT || w > MAX_WEIGHT) {
      throw new RangeError(`Tỉ lệ ô ${kind} phải trong [${MIN_WEIGHT}, ${MAX_WEIGHT}], nhận ${w}`);
    }
    total += w;
  }
  if (Math.abs(total - 100) > 1e-9) throw new RangeError(`Tổng tỉ lệ ô phải bằng 100, nhận ${total}`);
}

export function sameKind(a: Tile | null | undefined, b: Tile | null | undefined): boolean {
  return a != null && b != null && a.kind === b.kind;
}
