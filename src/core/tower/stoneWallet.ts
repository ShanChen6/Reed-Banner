// Ví Đá Cường Hóa: cộng đá vào tài khoản theo sự kiện có khóa duy nhất. Chỉ cộng, không có đường tiêu đá
// (tiêu đá là FUTURE TODO, xem docs/design/equipment-enhancement-todo.md).
import {
  isDualTowerV1,
  STONE_LEDGER_MAX,
  STONES_MAX,
  type DestinyProgress,
  type Profile,
  type TrialProgress,
} from "../progress";
import type { StoneRewardEvent } from "./floorContract";

export type StoneAwardError =
  | "unsupported_schema"
  | "invalid_event"
  | "duplicate_in_batch"
  | "overflow";

export interface StoneAwardPatch {
  readonly trial?: TrialProgress;
  readonly destiny?: DestinyProgress;
}

export type StoneAwardResult =
  | {
      readonly ok: true;
      readonly profile: Profile;
      /** Tổng đá thực cộng; 0 nghĩa là mọi sự kiện đã có trong sổ (idempotent). */
      readonly granted: number;
      readonly appliedKeys: readonly string[];
    }
  | { readonly ok: false; readonly error: StoneAwardError };

const validEvent = (e: StoneRewardEvent) =>
  !!e &&
  e.kind === "stone" &&
  Number.isSafeInteger(e.amount) &&
  e.amount > 0 &&
  typeof e.key === "string" &&
  e.key.length > 0 &&
  e.key.length <= 100;

/**
 * Áp kế hoạch thưởng lên hồ sơ trong một bước: cộng đá, ghi khóa vào sổ và cập nhật tiến trình mốc.
 * Tất cả hoặc không gì cả; lỗi thì hồ sơ gốc không đổi. Sự kiện có khóa đã trong sổ thì bỏ qua.
 * Hàm thuần: nơi gọi ghi kết quả bằng một lần `put` có version.
 */
export function applyStoneAward(
  profile: Profile,
  events: readonly StoneRewardEvent[],
  patch: StoneAwardPatch = {},
): StoneAwardResult {
  const tower = profile.dualTower;
  if (!isDualTowerV1(tower)) return { ok: false, error: "unsupported_schema" };
  const keys = new Set<string>();
  for (const e of events) {
    if (!validEvent(e)) return { ok: false, error: "invalid_event" };
    if (keys.has(e.key)) return { ok: false, error: "duplicate_in_batch" };
    keys.add(e.key);
  }
  const seen = new Set(tower.stoneLedger);
  const fresh = events.filter((e) => !seen.has(e.key));
  let balance = Number.isSafeInteger(profile.stones) && profile.stones > 0 ? profile.stones : 0;
  for (const e of fresh) {
    if (e.amount > STONES_MAX - balance) return { ok: false, error: "overflow" };
    balance += e.amount;
  }
  const next: Profile = {
    ...profile,
    stones: balance,
    dualTower: {
      ...tower,
      ...(patch.trial ? { trial: patch.trial } : {}),
      ...(patch.destiny ? { destiny: patch.destiny } : {}),
      stoneLedger: [...tower.stoneLedger, ...fresh.map((e) => e.key)].slice(-STONE_LEDGER_MAX),
    },
  };
  return {
    ok: true,
    profile: next,
    granted: balance - profile.stones,
    appliedKeys: fresh.map((e) => e.key),
  };
}
