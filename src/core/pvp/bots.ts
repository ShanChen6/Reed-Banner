// Bot nhân vật cho Thư Hùng khi chờ lâu (Shan chốt 27/11/2026): sứ quân, tướng lịch sử, nhân vật đặc biệt, mỗi người một
// tính cách (src/core/ai/personality.ts). Bot dựng ở cấp của người chơi, luôn ghi rõ là máy, trận không tính điểm hạng.

import { BOT_CHARACTERS, PERSONALITIES, botCharacter, type BotCharacter } from "../ai";
import type { FighterConfig } from "../battle";
import { leveledFoe } from "../progress/profile";
import { companionById } from "../roster";
import { createRng } from "../rng";

/** Chờ chừng này ở 1vs1 mà không có ai khác trong hàng đợi thì ghép với một nhân vật máy. */
export const PVP_BOT_AFTER_MS = 40_000;
/** Chờ chừng này ở 3vs3 mà chỉ có một mình thì đánh cùng năm nhân vật máy. */
export const PVP_TEAM_SOLO_MS = 45_000;

/** Rút `count` nhân vật máy khác nhau theo hạt giống, bỏ qua các id trong `exclude`. */
export function pickBots(seed: number, count: number, exclude: readonly string[] = []): BotCharacter[] {
  const rng = createRng((seed ^ 0x5bd1e995) >>> 0);
  const pool = BOT_CHARACTERS.filter((c) => !exclude.includes(c.id));
  const out: BotCharacter[] = [];
  while (out.length < count && pool.length > 0) out.push(pool.splice(rng.int(0, pool.length - 1), 1)[0]!);
  return out;
}

/** Tướng của một nhân vật máy ở cấp `level` (kỹ năng mở và điểm tiêu đều như đối thủ AI các chế độ khác). */
export function botFighter(id: string, level: number): FighterConfig {
  const base = companionById(id);
  if (!base || !botCharacter(id)) throw new RangeError(`Không có nhân vật máy ${id}`);
  return leveledFoe(base, Math.max(1, Math.min(30, Math.round(level))));
}

/** Thông tin hiện cho người chơi về nhân vật máy: tên, tính cách, nét riêng, thoại. */
export interface BotIntro {
  readonly id: string;
  readonly name: string;
  readonly personality: string;
  readonly summary: string;
  readonly quirk: string;
  readonly lines: BotCharacter["lines"];
}

export function botIntro(id: string): BotIntro | null {
  const c = botCharacter(id);
  const base = companionById(id);
  if (!c || !base) return null;
  const p = PERSONALITIES[c.personality];
  return { id, name: base.name, personality: p.name, summary: p.summary, quirk: c.quirk, lines: c.lines };
}
