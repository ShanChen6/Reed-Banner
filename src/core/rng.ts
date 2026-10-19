// PRNG xác định theo seed (mulberry32). Logic trận đấu chỉ dùng nguồn ngẫu nhiên này.

export interface Rng {
  /** Số thực trong [0, 1). */
  next(): number;
  /** Số nguyên trong [min, max], gồm cả hai đầu. */
  int(min: number, max: number): number;
  /** Trạng thái hiện tại, dùng để lưu và khôi phục trận. */
  state(): number;
}

export function createRng(seed: number): Rng {
  let s = seed >>> 0;

  const next = (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    int(min, max) {
      if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
        throw new RangeError(`Khoảng không hợp lệ: [${min}, ${max}]`);
      }
      return min + Math.floor(next() * (max - min + 1));
    },
    state: () => s,
  };
}
