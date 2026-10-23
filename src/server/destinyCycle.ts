import { createHmac } from "node:crypto";
import { DESTINY_RULE_DATA_VERSION } from "@/core";

export const DESTINY_CYCLE_DAYS = 7;
export const DESTINY_TIME_ZONE = "Asia/Ho_Chi_Minh";
const VN_OFFSET_MS = 7 * 60 * 60 * 1_000;
const DAY_MS = 24 * 60 * 60 * 1_000;
const SECRET_MIN = 16;

export interface DestinyCycle {
  readonly cycleId: string;
  readonly startAt: number;
  readonly endAt: number;
  readonly rulesVersion: number;
}

export type DestinyCycleResult =
  | { readonly ok: true; readonly cycle: DestinyCycle }
  | { readonly ok: false; readonly error: "invalid_time" };

export function destinyCycleById(cycleId: string): DestinyCycle | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cycleId)) return null;
  const localMondayUtc = Date.parse(`${cycleId}T00:00:00.000Z`);
  if (!Number.isFinite(localMondayUtc) || new Date(localMondayUtc).toISOString().slice(0, 10) !== cycleId ||
      new Date(localMondayUtc).getUTCDay() !== 1) return null;
  const startAt = localMondayUtc - VN_OFFSET_MS;
  return {
    cycleId,
    startAt,
    endAt: startAt + DESTINY_CYCLE_DAYS * DAY_MS,
    rulesVersion: DESTINY_RULE_DATA_VERSION,
  };
}

/** Chu kỳ hiện hành được tính trực tiếp từ giờ server; không phụ thuộc cron hay locale máy chủ. */
export function activeDestinyCycle(now: number): DestinyCycleResult {
  if (!Number.isSafeInteger(now) || now < 0 || !Number.isFinite(now))
    return { ok: false, error: "invalid_time" };
  const local = new Date(now + VN_OFFSET_MS);
  if (Number.isNaN(local.valueOf())) return { ok: false, error: "invalid_time" };
  const daysSinceMonday = (local.getUTCDay() + 6) % 7;
  const localMondayUtc = Date.UTC(
    local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - daysSinceMonday,
  );
  const cycleId = new Date(localMondayUtc).toISOString().slice(0, 10);
  const cycle = destinyCycleById(cycleId);
  if (!cycle) return { ok: false, error: "invalid_time" };
  return {
    ok: true,
    cycle,
  };
}

/** Seed nội bộ theo purpose; HMAC không để lộ secret qua cycleId hoặc output public. */
export function destinyCycleSeed(
  cycle: DestinyCycle,
  secret: string,
  purpose: "rules" | "battle",
): string | null {
  if (typeof secret !== "string" || secret.length < SECRET_MIN) return null;
  return createHmac("sha256", secret)
    .update(`destiny|${cycle.rulesVersion}|${cycle.cycleId}|${purpose}`)
    .digest("hex");
}

export const publicDestinyCycle = (cycle: DestinyCycle): DestinyCycle => ({ ...cycle });
